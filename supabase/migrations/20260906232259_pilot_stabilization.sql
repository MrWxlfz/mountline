-- Mountline paid-pilot stabilization.
-- Clerk remains the identity provider. All application data access is mediated
-- by server routes using the Supabase service role.

alter table public.projects add column if not exists creation_idempotency_key text;
alter table public.projects add column if not exists sale_confirmed_at timestamp with time zone;
alter table public.projects add column if not exists sale_confirmed_by text;
alter table public.projects add column if not exists sale_evidence_reference text;
alter table public.support_messages add column if not exists sender_clerk_user_id text;

create index if not exists support_messages_sender_clerk_user_id_idx
  on public.support_messages (sender_clerk_user_id);

create unique index if not exists projects_creation_idempotency_key_idx
  on public.projects (creation_idempotency_key)
  where creation_idempotency_key is not null;

alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check
  check (status in ('discovery', 'design', 'build', 'review', 'launch', 'support', 'completed'));

alter table public.projects drop constraint if exists projects_sale_confirmation_complete_check;
alter table public.projects add constraint projects_sale_confirmation_complete_check
  check (
    (sale_confirmed_at is null and sale_confirmed_by is null and sale_evidence_reference is null)
    or
    (sale_confirmed_at is not null and sale_confirmed_by is not null and nullif(trim(sale_evidence_reference), '') is not null)
  );

create table if not exists public.project_receipts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null check (currency = upper(currency) and currency ~ '^[A-Z]{3}$'),
  received_at timestamp with time zone not null,
  payment_method text not null check (payment_method in ('stripe_card', 'crypto', 'cash', 'check', 'bank_transfer', 'other')),
  reference text not null check (nullif(trim(reference), '') is not null),
  recorded_by text not null
);

create unique index if not exists project_receipts_project_reference_idx
  on public.project_receipts (project_id, currency, lower(reference));
create index if not exists project_receipts_received_at_idx
  on public.project_receipts (received_at desc);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  creation_idempotency_key text not null,
  source text not null check (source in ('manual', 'phone', 'website', 'email', 'referral', 'provider')),
  external_reference text,
  received_at timestamp with time zone not null,
  contact_name text,
  contact_phone text,
  contact_email text,
  service_requested text,
  intake_details text,
  is_test boolean not null default false,
  recorded_by text not null
);

create unique index if not exists inquiries_project_idempotency_idx
  on public.inquiries (project_id, creation_idempotency_key);

create unique index if not exists inquiries_project_source_reference_idx
  on public.inquiries (project_id, source, external_reference)
  where external_reference is not null;
create index if not exists inquiries_project_received_idx
  on public.inquiries (project_id, received_at desc);

create table if not exists public.inquiry_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  event_type text not null check (event_type in (
    'inquiry_received',
    'handoff_pending',
    'handoff_attempted',
    'handoff_accepted_by_provider',
    'handoff_successful',
    'handoff_failed',
    'customer_contacted',
    'quote_produced',
    'job_won',
    'payment_received'
  )),
  occurred_at timestamp with time zone not null,
  actor_source text not null check (actor_source in ('manual_team', 'provider', 'customer', 'business_owner', 'system')),
  recorded_by text not null,
  source_event_key text,
  attempt_id text,
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence) = 'object'),
  supersedes_event_id uuid references public.inquiry_events(id) on delete restrict,
  check (
    event_type not in ('handoff_pending', 'handoff_attempted', 'handoff_accepted_by_provider', 'handoff_successful', 'handoff_failed')
    or nullif(trim(attempt_id), '') is not null
  ),
  check (event_type <> 'inquiry_received' or nullif(evidence->>'source_reference', '') is not null),
  check (event_type <> 'handoff_attempted' or nullif(evidence->>'destination', '') is not null),
  check (event_type <> 'handoff_accepted_by_provider' or nullif(evidence->>'provider_reference', '') is not null),
  check (
    event_type <> 'handoff_successful'
    or nullif(evidence->>'delivery_reference', '') is not null
    or nullif(evidence->>'owner_acknowledged_at', '') is not null
  ),
  check (event_type <> 'handoff_failed' or nullif(evidence->>'failure_reason', '') is not null),
  check (event_type <> 'customer_contacted' or nullif(evidence->>'contact_method', '') is not null),
  check (event_type <> 'quote_produced' or nullif(evidence->>'quote_reference', '') is not null),
  check (event_type <> 'job_won' or nullif(evidence->>'job_reference', '') is not null),
  check (
    event_type <> 'payment_received'
    or (
      nullif(evidence->>'receipt_reference', '') is not null
      and evidence->>'payment_context' = 'client_job'
      and nullif(evidence->>'currency', '') is not null
      and nullif(evidence->>'amount_minor', '') is not null
      and nullif(evidence->>'received_at', '') is not null
    )
  )
);

create unique index if not exists inquiry_events_source_event_key_idx
  on public.inquiry_events (inquiry_id, source_event_key)
  where source_event_key is not null;
create index if not exists inquiry_events_inquiry_occurred_idx
  on public.inquiry_events (inquiry_id, occurred_at asc, created_at asc);

create or replace function public.ensure_inquiry_event_scope()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.supersedes_event_id is not null and not exists (
    select 1
    from public.inquiry_events prior
    where prior.id = new.supersedes_event_id
      and prior.inquiry_id = new.inquiry_id
  ) then
    raise exception 'Superseded event must belong to the same inquiry.';
  end if;
  return new;
end;
$$;

drop trigger if exists inquiry_events_scope_guard on public.inquiry_events;
create trigger inquiry_events_scope_guard
before insert or update on public.inquiry_events
for each row execute function public.ensure_inquiry_event_scope();

create or replace function public.create_project_for_pilot(
  p_idempotency_key text,
  p_project_name text,
  p_client_id uuid,
  p_package_type text,
  p_status text,
  p_portal_id text,
  p_start_date date,
  p_target_launch_date date,
  p_live_url text,
  p_preview_url text,
  p_payment_link text,
  p_next_step text,
  p_notes text,
  p_signal_id uuid,
  p_created_by text
)
returns setof public.projects
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created_project public.projects%rowtype;
  client_email text;
  signal_rows_updated integer;
begin
  if nullif(trim(p_idempotency_key), '') is null then
    raise exception 'An idempotency key is required.';
  end if;

  select * into created_project
  from public.projects
  where creation_idempotency_key = p_idempotency_key;

  if found then
    return next created_project;
    return;
  end if;

  if p_client_id is not null then
    select lower(trim(email)) into client_email
    from public.clients
    where id = p_client_id;
    if client_email is null then
      raise exception 'Assigned client was not found or has no email.';
    end if;
  end if;

  if p_signal_id is not null and to_regclass('public.signal_prospects') is null then
    raise exception 'Signal linkage is unavailable.';
  end if;

  insert into public.projects (
    creation_idempotency_key, project_name, client_id, package_type, status,
    portal_id, start_date, target_launch_date, live_url, preview_url,
    payment_link, next_step, notes
  ) values (
    p_idempotency_key, p_project_name, p_client_id, p_package_type, p_status,
    p_portal_id, p_start_date, p_target_launch_date, p_live_url, p_preview_url,
    p_payment_link, p_next_step, p_notes
  )
  on conflict (creation_idempotency_key) where creation_idempotency_key is not null
  do nothing
  returning * into created_project;

  if created_project.id is null then
    select * into created_project
    from public.projects
    where creation_idempotency_key = p_idempotency_key;
    return next created_project;
    return;
  end if;

  if p_client_id is not null then
    insert into public.client_portal_access (project_id, client_email, access_status)
    values (created_project.id, client_email, 'active')
    on conflict (project_id, client_email) do update
    set access_status = 'active';
  end if;

  if p_signal_id is not null then
    execute 'update public.signal_prospects set converted_project_id = $1, converted_client_id = $2 where id = $3'
      using created_project.id, p_client_id, p_signal_id;
    get diagnostics signal_rows_updated = row_count;
    if signal_rows_updated = 0 then
      raise exception 'Signal prospect was not found.';
    end if;
  end if;

  return next created_project;
end;
$$;

create or replace function public.record_project_inquiry(
  p_project_id uuid,
  p_idempotency_key text,
  p_source text,
  p_external_reference text,
  p_received_at timestamp with time zone,
  p_contact_name text,
  p_contact_phone text,
  p_contact_email text,
  p_service_requested text,
  p_intake_details text,
  p_is_test boolean,
  p_recorded_by text
)
returns setof public.inquiries
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  recorded_inquiry public.inquiries%rowtype;
begin
  if nullif(trim(p_idempotency_key), '') is null then
    raise exception 'An idempotency key is required.';
  end if;

  select * into recorded_inquiry
  from public.inquiries
  where project_id = p_project_id
    and creation_idempotency_key = p_idempotency_key;
  if found then
    return next recorded_inquiry;
    return;
  end if;

  insert into public.inquiries (
    project_id, creation_idempotency_key, source, external_reference, received_at,
    contact_name, contact_phone, contact_email, service_requested, intake_details,
    is_test, recorded_by
  ) values (
    p_project_id, p_idempotency_key, p_source, p_external_reference, p_received_at,
    p_contact_name, p_contact_phone, p_contact_email, p_service_requested, p_intake_details,
    p_is_test, p_recorded_by
  )
  on conflict (project_id, creation_idempotency_key) do nothing
  returning * into recorded_inquiry;

  if recorded_inquiry.id is null then
    select * into recorded_inquiry
    from public.inquiries
    where project_id = p_project_id
      and creation_idempotency_key = p_idempotency_key;
    return next recorded_inquiry;
    return;
  end if;

  insert into public.inquiry_events (
    inquiry_id, event_type, occurred_at, actor_source, recorded_by,
    source_event_key, evidence
  ) values (
    recorded_inquiry.id, 'inquiry_received', p_received_at, 'manual_team', p_recorded_by,
    'capture:' || p_idempotency_key,
    jsonb_build_object('source_reference', coalesce(nullif(trim(p_external_reference), ''), p_idempotency_key))
  );

  return next recorded_inquiry;
end;
$$;

-- Direct Data API access is intentionally denied. Clerk identities are not
-- Supabase Auth users; all authorized reads and writes run through server code.
do $$
declare
  target record;
begin
  for target in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', target.policyname, target.schemaname, target.tablename);
  end loop;
end;
$$;

do $$
declare
  target record;
begin
  for target in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
  loop
    execute format('alter table public.%I enable row level security', target.relname);
  end loop;
end;
$$;

revoke all privileges on all tables in schema public from public, anon, authenticated;
revoke all privileges on all sequences in schema public from public, anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on function public.create_project_for_pilot(
  text, text, uuid, text, text, text, date, date, text, text, text, text, text, uuid, text
) to service_role;
grant execute on function public.record_project_inquiry(
  uuid, text, text, text, timestamp with time zone, text, text, text, text, text, boolean, text
) to service_role;

alter default privileges for role postgres in schema public revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public grant all on tables to service_role;
alter default privileges for role postgres in schema public grant all on sequences to service_role;
alter default privileges for role postgres in schema public grant execute on functions to service_role;
