-- Project inquiries from the public site: interests, duplicate protection, follow-up controls,
-- and a durable email outbox with provider delivery events.
--
-- Additive only. Existing lead rows stay readable and keep their content. Apply after
-- 20260921230404_fix_pilot_client_assignment.sql. Safe to re-run.

-- Leads -------------------------------------------------------------------------------

alter table public.leads
  add column if not exists interests text[] not null default '{}'::text[],
  add column if not exists submission_key uuid,
  add column if not exists content_fingerprint text,
  add column if not exists submitter_hash text,
  add column if not exists status_changed_at timestamp with time zone,
  add column if not exists contacted_at timestamp with time zone,
  add column if not exists customer_replied_at timestamp with time zone,
  add column if not exists followup_paused_at timestamp with time zone,
  add column if not exists followup_opted_out_at timestamp with time zone,
  add column if not exists email_suppressed_at timestamp with time zone,
  add column if not exists email_suppressed_reason text,
  add column if not exists optout_token uuid default gen_random_uuid();

update public.leads set optout_token = gen_random_uuid() where optout_token is null;
alter table public.leads alter column optout_token set not null;

alter table public.leads drop constraint if exists leads_interests_check;
alter table public.leads add constraint leads_interests_check
  check (interests <@ array['website', 'receptionist', 'capture', 'not_sure']::text[]);

alter table public.leads drop constraint if exists leads_email_suppressed_reason_check;
alter table public.leads add constraint leads_email_suppressed_reason_check
  check (email_suppressed_reason is null or email_suppressed_reason in ('bounced', 'complained', 'provider_suppressed'));

-- A retried submission (same form attempt) and an identical message sent twice in one day
-- both resolve to the first saved inquiry.
create unique index if not exists leads_submission_key_idx
  on public.leads (submission_key) where submission_key is not null;
create unique index if not exists leads_content_fingerprint_idx
  on public.leads (content_fingerprint) where content_fingerprint is not null;
create unique index if not exists leads_optout_token_idx on public.leads (optout_token);
create index if not exists leads_submitter_recent_idx
  on public.leads (submitter_hash, created_at desc) where submitter_hash is not null;
create index if not exists leads_email_recent_idx on public.leads (lower(email), created_at desc);

-- Record when a person changes the review state. "Contacted" starts the wait for the customer.
create or replace function public.track_lead_status_change()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := now();
    if new.status = 'contacted' then
      new.contacted_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists leads_status_change on public.leads;
create trigger leads_status_change
  before update of status on public.leads
  for each row execute function public.track_lead_status_change();

-- Email outbox -------------------------------------------------------------------------
-- One row per message Mountline intends to send about an inquiry. Each kind is sent at most
-- once per inquiry. "accepted" means Resend took the message; only a delivery event moves it
-- to "delivered", and even that is the recipient's mail server, not their inbox.

create table if not exists public.inquiry_email_jobs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  kind text not null check (kind in (
    'owner_notification', 'customer_acknowledgment', 'owner_reminder', 'owner_checkin_prompt', 'customer_checkin'
  )),
  status text not null default 'queued' check (status in (
    'queued', 'sending', 'retry', 'awaiting_approval', 'accepted', 'delayed', 'delivered',
    'bounced', 'complained', 'failed', 'skipped', 'cancelled'
  )),
  send_after timestamp with time zone not null default now(),
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 6 check (max_attempts between 1 and 20),
  lease_token uuid,
  locked_until timestamp with time zone,
  first_attempt_at timestamp with time zone,
  last_attempt_at timestamp with time zone,
  provider_message_id text,
  provider_accepted_at timestamp with time zone,
  delivered_at timestamp with time zone,
  last_error text check (last_error is null or char_length(last_error) <= 500),
  skip_reason text,
  approved_at timestamp with time zone,
  approved_by text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint inquiry_email_jobs_once_per_kind unique (lead_id, kind)
);

create unique index if not exists inquiry_email_jobs_provider_message_idx
  on public.inquiry_email_jobs (provider_message_id) where provider_message_id is not null;
create index if not exists inquiry_email_jobs_due_idx
  on public.inquiry_email_jobs (send_after) where status in ('queued', 'retry', 'sending');
create index if not exists inquiry_email_jobs_lead_idx on public.inquiry_email_jobs (lead_id);

create or replace function public.touch_inquiry_email_job()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists inquiry_email_jobs_updated_at on public.inquiry_email_jobs;
create trigger inquiry_email_jobs_updated_at
  before update on public.inquiry_email_jobs
  for each row execute function public.touch_inquiry_email_job();

-- Signed provider webhooks, recorded once by their delivery ID so a redelivery is a no-op.
-- Only metadata is kept; message bodies are never stored here.
create table if not exists public.inquiry_email_events (
  id text primary key,
  event_type text not null,
  provider_message_id text,
  job_id uuid references public.inquiry_email_jobs(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  occurred_at timestamp with time zone,
  received_at timestamp with time zone not null default now(),
  detail text check (detail is null or char_length(detail) <= 500)
);

create index if not exists inquiry_email_events_message_idx
  on public.inquiry_email_events (provider_message_id) where provider_message_id is not null;

-- Submission ---------------------------------------------------------------------------
-- Saves the inquiry and its first two emails in one transaction, so a saved inquiry always
-- has its owner notification queued. Returns 'created', 'duplicate', or 'rate_limited'.

create or replace function public.submit_mountline_inquiry(
  p_submission_key uuid,
  p_content_fingerprint text,
  p_submitter_hash text,
  p_name text,
  p_business_name text,
  p_email text,
  p_phone text,
  p_current_website text,
  p_interests text[],
  p_service_needed text,
  p_message text,
  p_owner_reminder_at timestamp with time zone,
  p_max_per_submitter integer,
  p_max_per_email integer,
  p_window_minutes integer
)
returns table (inquiry_id uuid, outcome text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  saved_id uuid;
  recent integer;
  ack_status text := 'queued';
  ack_reason text := null;
begin
  if p_submission_key is null or nullif(trim(p_content_fingerprint), '') is null then
    raise exception 'A submission key and content fingerprint are required.';
  end if;

  select l.id into saved_id
  from public.leads l
  where l.submission_key = p_submission_key or l.content_fingerprint = p_content_fingerprint
  order by l.created_at
  limit 1;
  if saved_id is not null then
    return query select saved_id, 'duplicate'::text;
    return;
  end if;

  if p_submitter_hash is not null then
    select count(*) into recent
    from public.leads l
    where l.submitter_hash = p_submitter_hash
      and l.created_at > now() - make_interval(mins => p_window_minutes);
    if recent >= p_max_per_submitter then
      return query select null::uuid, 'rate_limited'::text;
      return;
    end if;
  end if;

  select count(*) into recent
  from public.leads l
  where lower(l.email) = lower(p_email)
    and l.created_at > now() - make_interval(mins => p_window_minutes);
  if recent >= p_max_per_email then
    return query select null::uuid, 'rate_limited'::text;
    return;
  end if;

  insert into public.leads (
    name, business_name, email, phone, current_website, service_needed, message,
    source, status, interests, submission_key, content_fingerprint, submitter_hash
  ) values (
    p_name, p_business_name, p_email, p_phone, p_current_website, p_service_needed, p_message,
    'website', 'new', p_interests, p_submission_key, p_content_fingerprint, p_submitter_hash
  )
  on conflict do nothing
  returning id into saved_id;

  -- Lost a race with an identical submission: report the one that won.
  if saved_id is null then
    select l.id into saved_id
    from public.leads l
    where l.submission_key = p_submission_key or l.content_fingerprint = p_content_fingerprint
    order by l.created_at
    limit 1;
    return query select saved_id, 'duplicate'::text;
    return;
  end if;

  -- The acknowledgment goes to whatever address was typed, so it is limited to one per
  -- address per day and never sent to an address that has bounced or complained.
  if exists (
    select 1 from public.leads l
    where lower(l.email) = lower(p_email) and l.email_suppressed_at is not null
  ) then
    ack_status := 'skipped';
    ack_reason := 'suppressed';
  elsif exists (
    select 1
    from public.inquiry_email_jobs j
    join public.leads l on l.id = j.lead_id
    where j.kind = 'customer_acknowledgment'
      and l.id <> saved_id
      and lower(l.email) = lower(p_email)
      and j.created_at > now() - interval '24 hours'
      and j.status not in ('skipped', 'cancelled', 'failed')
  ) then
    ack_status := 'skipped';
    ack_reason := 'recent_acknowledgment';
  end if;

  insert into public.inquiry_email_jobs (lead_id, kind) values (saved_id, 'owner_notification');
  insert into public.inquiry_email_jobs (lead_id, kind, status, skip_reason)
    values (saved_id, 'customer_acknowledgment', ack_status, ack_reason);
  if p_owner_reminder_at is not null then
    insert into public.inquiry_email_jobs (lead_id, kind, send_after)
      values (saved_id, 'owner_reminder', p_owner_reminder_at);
  end if;

  return query select saved_id, 'created'::text;
end;
$$;

-- Worker claim -------------------------------------------------------------------------
-- Leases due jobs so two overlapping workers never send the same message. A lease that
-- expired is reclaimed and resent with the same provider idempotency key, which Resend
-- honours for 24 hours; past that window the outcome is unknown and a person decides.

create or replace function public.claim_inquiry_email_jobs(
  p_limit integer,
  p_lease_seconds integer,
  p_lead_id uuid default null
)
returns setof public.inquiry_email_jobs
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  update public.inquiry_email_jobs j
  set status = 'failed',
      lease_token = null,
      locked_until = null,
      last_error = 'The last send was interrupted and its outcome is unknown. Check Resend before retrying.'
  where j.status = 'sending'
    and j.locked_until < now()
    and (j.first_attempt_at < now() - interval '23 hours' or j.attempts >= j.max_attempts)
    and (p_lead_id is null or j.lead_id = p_lead_id);

  return query
  with due as (
    select j.id
    from public.inquiry_email_jobs j
    join public.leads l on l.id = j.lead_id
    where (p_lead_id is null or j.lead_id = p_lead_id)
      and j.attempts < j.max_attempts
      and (
        (j.status in ('queued', 'retry') and j.send_after <= now())
        or (j.status = 'sending' and j.locked_until < now())
      )
      -- Paused inquiries keep their follow-ups queued until someone resumes them.
      and not (
        j.kind in ('owner_reminder', 'owner_checkin_prompt', 'customer_checkin')
        and l.followup_paused_at is not null
      )
    order by j.send_after
    limit greatest(1, least(coalesce(p_limit, 10), 50))
    for update of j skip locked
  )
  update public.inquiry_email_jobs j
  set status = 'sending',
      lease_token = gen_random_uuid(),
      locked_until = now() + make_interval(secs => greatest(30, coalesce(p_lease_seconds, 120))),
      attempts = j.attempts + 1,
      first_attempt_at = coalesce(j.first_attempt_at, now()),
      last_attempt_at = now()
  from due
  where j.id = due.id
  returning j.*;
end;
$$;

-- Access -------------------------------------------------------------------------------
-- Same posture as the stabilization migration: no Data API access for anon/authenticated;
-- server code uses the service role.

alter table public.inquiry_email_jobs enable row level security;
alter table public.inquiry_email_events enable row level security;

revoke all privileges on public.inquiry_email_jobs from public, anon, authenticated;
revoke all privileges on public.inquiry_email_events from public, anon, authenticated;
grant all privileges on public.inquiry_email_jobs to service_role;
grant all privileges on public.inquiry_email_events to service_role;

revoke execute on function public.track_lead_status_change() from public, anon, authenticated;
revoke execute on function public.touch_inquiry_email_job() from public, anon, authenticated;
revoke execute on function public.submit_mountline_inquiry(
  uuid, text, text, text, text, text, text, text, text[], text, text, timestamp with time zone, integer, integer, integer
) from public, anon, authenticated;
revoke execute on function public.claim_inquiry_email_jobs(integer, integer, uuid) from public, anon, authenticated;

grant execute on function public.submit_mountline_inquiry(
  uuid, text, text, text, text, text, text, text, text[], text, text, timestamp with time zone, integer, integer, integer
) to service_role;
grant execute on function public.claim_inquiry_email_jobs(integer, integer, uuid) to service_role;
