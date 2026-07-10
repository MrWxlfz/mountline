-- Mountline Signal lead-run hardening.
-- Additive checkpoint, identity, and data-integrity fields for resumable runs.

alter table public.signal_runs
  add column if not exists execution_cursor jsonb not null default '{}'::jsonb,
  add column if not exists lease_token text,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists started_at timestamptz,
  add column if not exists heartbeat_at timestamptz,
  add column if not exists attempt_count integer not null default 0;

alter table public.signal_runs
  drop constraint if exists signal_runs_attempt_count_check;
alter table public.signal_runs
  add constraint signal_runs_attempt_count_check
  check (attempt_count >= 0);

create index if not exists signal_runs_lease_idx
  on public.signal_runs (lease_expires_at)
  where lease_token is not null;

alter table public.signal_run_leads
  add column if not exists identity_key text,
  add column if not exists normalized_business_name text,
  add column if not exists normalized_hostname text,
  add column if not exists normalized_phone text,
  add column if not exists chain_evidence jsonb not null default '[]'::jsonb;

alter table public.signal_run_leads
  drop constraint if exists signal_run_leads_final_score_check;
alter table public.signal_run_leads
  add constraint signal_run_leads_final_score_check
  check (final_score is null or final_score between 0 and 100);

alter table public.signal_run_leads
  drop constraint if exists signal_run_leads_confidence_score_check;
alter table public.signal_run_leads
  add constraint signal_run_leads_confidence_score_check
  check (confidence_score is null or confidence_score between 0 and 100);

alter table public.signal_run_leads
  drop constraint if exists signal_run_leads_rank_check;
alter table public.signal_run_leads
  add constraint signal_run_leads_rank_check
  check (rank is null or rank > 0);

create unique index if not exists signal_run_leads_identity_key_idx
  on public.signal_run_leads (run_id, identity_key)
  where identity_key is not null;

create index if not exists signal_run_leads_normalized_hostname_idx
  on public.signal_run_leads (normalized_hostname)
  where normalized_hostname is not null;

create unique index if not exists signal_run_leads_rank_unique_idx
  on public.signal_run_leads (run_id, rank)
  where rank is not null;
