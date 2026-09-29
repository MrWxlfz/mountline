-- Browser voice demo: one row per attempt to start a call with the fictional North Texas Air & Heat
-- demo agent from the public site. Used only to enforce per-visitor, daily, and concurrency limits.
--
-- Deliberately separate from leads and inquiries: nothing here creates a lead, queues an email, or
-- stores a transcript, recording, name, phone number, or IP address. Additive only. Apply after
-- 20260928120000_project_inquiry_email.sql. Safe to re-run.

create table if not exists public.receptionist_demo_calls (
  id uuid primary key default gen_random_uuid(),
  -- HMAC of the visitor's IP address with a server secret; cleared after two days.
  visitor_hash text check (visitor_hash is null or char_length(visitor_hash) <= 128),
  retell_call_id text unique check (retell_call_id is null or char_length(retell_call_id) <= 128),
  created_at timestamp with time zone not null default now(),
  ended_at timestamp with time zone,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  outcome text not null default 'started' check (outcome in ('started', 'provider_error', 'ended')),
  disconnection_reason text check (disconnection_reason is null or char_length(disconnection_reason) <= 100)
);

comment on table public.receptionist_demo_calls is
  'Browser voice demo sessions (fictional HVAC demo agent). Holds no transcripts or personal details: only a hashed visitor key and provider call IDs, for rate limiting. Separate from leads and inquiries.';

create index if not exists receptionist_demo_calls_visitor_recent_idx
  on public.receptionist_demo_calls (visitor_hash, created_at desc) where visitor_hash is not null;
create index if not exists receptionist_demo_calls_recent_idx
  on public.receptionist_demo_calls (created_at desc);
create index if not exists receptionist_demo_calls_open_idx
  on public.receptionist_demo_calls (created_at) where ended_at is null;

-- Start -------------------------------------------------------------------------------
-- Checks every limit and records the session in one locked step, so two visitors can never both
-- take the last free slot. Returns 'allowed' with a session ID, or 'visitor_limit', 'daily_limit',
-- or 'busy' with the seconds until a slot should open.
--
-- A session counts as in progress until it is finished, or until the longest possible call
-- (p_max_seconds) plus 90 seconds has passed, in case the finish was never recorded.

create or replace function public.start_receptionist_demo_call(
  p_visitor_hash text,
  p_max_per_visitor integer,
  p_visitor_window_minutes integer,
  p_daily_cap integer,
  p_max_concurrent integer,
  p_max_seconds integer
)
returns table (session_id uuid, outcome text, retry_after_seconds integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  counted integer;
  oldest timestamp with time zone;
  saved_id uuid;
begin
  if nullif(trim(p_visitor_hash), '') is null then
    raise exception 'A visitor hash is required.';
  end if;
  if coalesce(p_max_per_visitor, 0) < 1 or coalesce(p_visitor_window_minutes, 0) < 1 or coalesce(p_daily_cap, 0) < 1
    or coalesce(p_max_concurrent, 0) < 1 or coalesce(p_max_seconds, 0) < 1 then
    raise exception 'Demo call limits must be positive whole numbers.';
  end if;

  perform pg_advisory_xact_lock(hashtext('public.receptionist_demo_calls'));

  -- Hashed addresses are only needed for the visitor window (at most a day).
  update public.receptionist_demo_calls c
  set visitor_hash = null
  where c.visitor_hash is not null and c.created_at < now() - interval '2 days';

  -- Per visitor, counting every attempt.
  select count(*) into counted
  from public.receptionist_demo_calls c
  where c.visitor_hash = p_visitor_hash
    and c.created_at > now() - make_interval(mins => p_visitor_window_minutes);
  if counted >= p_max_per_visitor then
    select c.created_at into oldest
    from public.receptionist_demo_calls c
    where c.visitor_hash = p_visitor_hash
      and c.created_at > now() - make_interval(mins => p_visitor_window_minutes)
    order by c.created_at
    offset counted - p_max_per_visitor
    limit 1;
    return query select null::uuid, 'visitor_limit'::text,
      greatest(1, ceil(extract(epoch from (oldest + make_interval(mins => p_visitor_window_minutes) - now())))::integer);
    return;
  end if;

  -- Across all visitors in any 24 hours. Attempts the provider refused cost nothing and do not count.
  select count(*) into counted
  from public.receptionist_demo_calls c
  where c.created_at > now() - interval '24 hours'
    and c.outcome <> 'provider_error';
  if counted >= p_daily_cap then
    select c.created_at into oldest
    from public.receptionist_demo_calls c
    where c.created_at > now() - interval '24 hours'
      and c.outcome <> 'provider_error'
    order by c.created_at
    offset counted - p_daily_cap
    limit 1;
    return query select null::uuid, 'daily_limit'::text,
      greatest(60, ceil(extract(epoch from (oldest + interval '24 hours' - now())))::integer);
    return;
  end if;

  -- Calls in progress right now.
  select count(*) into counted
  from public.receptionist_demo_calls c
  where c.ended_at is null
    and c.created_at > now() - make_interval(secs => p_max_seconds + 90);
  if counted >= p_max_concurrent then
    select c.created_at into oldest
    from public.receptionist_demo_calls c
    where c.ended_at is null
      and c.created_at > now() - make_interval(secs => p_max_seconds + 90)
    order by c.created_at
    offset counted - p_max_concurrent
    limit 1;
    -- Most calls end well before the backstop, so suggest a short wait.
    return query select null::uuid, 'busy'::text,
      least(60, greatest(5, ceil(extract(epoch from (oldest + make_interval(secs => p_max_seconds + 90) - now())))::integer));
    return;
  end if;

  insert into public.receptionist_demo_calls (visitor_hash) values (p_visitor_hash)
  returning id into saved_id;

  return query select saved_id, 'allowed'::text, null::integer;
end;
$$;

-- Attach the provider call ID once the provider has created the call.
create or replace function public.attach_receptionist_demo_call(p_session_id uuid, p_call_id text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_session_id is null or nullif(trim(p_call_id), '') is null then
    raise exception 'A session ID and call ID are required.';
  end if;
  update public.receptionist_demo_calls c
  set retell_call_id = p_call_id
  where c.id = p_session_id
    and (c.retell_call_id is null or c.retell_call_id = p_call_id);
  return found;
end;
$$;

-- The provider refused to create the call: the session stops counting as in progress.
create or replace function public.fail_receptionist_demo_call(p_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  update public.receptionist_demo_calls c
  set outcome = 'provider_error',
      ended_at = coalesce(c.ended_at, now())
  where c.id = p_session_id
    and c.outcome = 'started';
  return found;
end;
$$;

-- The call is over. Idempotent: the first end time is kept, and duration or reason are only
-- filled in when still missing. Returns whether the call ID belongs to a demo session.
create or replace function public.finish_receptionist_demo_call(
  p_call_id text,
  p_duration_ms integer,
  p_disconnection_reason text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  duration integer := case when p_duration_ms >= 0 then p_duration_ms end;
  reason text := left(nullif(trim(p_disconnection_reason), ''), 100);
begin
  if nullif(trim(p_call_id), '') is null then
    return false;
  end if;
  update public.receptionist_demo_calls c
  set ended_at = coalesce(c.ended_at, now()),
      outcome = case when c.outcome = 'started' then 'ended' else c.outcome end,
      duration_ms = coalesce(c.duration_ms, duration),
      disconnection_reason = coalesce(c.disconnection_reason, reason)
  where c.retell_call_id = p_call_id
    and (
      c.ended_at is null
      or (c.duration_ms is null and duration is not null)
      or (c.disconnection_reason is null and reason is not null)
    );
  return exists (select 1 from public.receptionist_demo_calls c where c.retell_call_id = p_call_id);
end;
$$;

-- Access -------------------------------------------------------------------------------
-- No Data API access for anon/authenticated; the site's server code uses the service role.

alter table public.receptionist_demo_calls enable row level security;

revoke all privileges on public.receptionist_demo_calls from public, anon, authenticated;
grant all privileges on public.receptionist_demo_calls to service_role;

revoke execute on function public.start_receptionist_demo_call(text, integer, integer, integer, integer, integer) from public, anon, authenticated;
revoke execute on function public.attach_receptionist_demo_call(uuid, text) from public, anon, authenticated;
revoke execute on function public.fail_receptionist_demo_call(uuid) from public, anon, authenticated;
revoke execute on function public.finish_receptionist_demo_call(text, integer, text) from public, anon, authenticated;

grant execute on function public.start_receptionist_demo_call(text, integer, integer, integer, integer, integer) to service_role;
grant execute on function public.attach_receptionist_demo_call(uuid, text) to service_role;
grant execute on function public.fail_receptionist_demo_call(uuid) to service_role;
grant execute on function public.finish_receptionist_demo_call(text, integer, text) to service_role;
