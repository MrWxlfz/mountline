-- Mountline Signal production-readiness fields.
-- Additive where possible so historical runs remain readable while the new
-- pipeline stores canonical identity, calibrated quality, draft evaluation,
-- scoped corrections, and private team observations.

alter table public.signal_runs
  drop constraint if exists signal_runs_status_check;
alter table public.signal_runs
  add constraint signal_runs_status_check
  check (status in (
    'queued', 'discovering', 'enriching', 'analyzing', 'selecting', 'generating',
    'completed', 'completed_with_limits', 'failed', 'cancelled',
    'checking', 'scoring', 'writing_packs', 'ranking', 'partial'
  ));

alter table public.signal_run_leads
  add column if not exists raw_names jsonb not null default '[]'::jsonb,
  add column if not exists canonical_name_source text,
  add column if not exists canonical_name_warnings jsonb not null default '[]'::jsonb,
  add column if not exists display_name text,
  add column if not exists official_website_status text,
  add column if not exists lead_quality_status text,
  add column if not exists sales_strategy jsonb,
  add column if not exists script_quality_score integer,
  add column if not exists generation_attempt integer not null default 0,
  add column if not exists generation_failure_reason text,
  add column if not exists fallback_usage boolean not null default false;

alter table public.signal_run_leads
  drop constraint if exists signal_run_leads_canonical_name_source_check,
  add constraint signal_run_leads_canonical_name_source_check
  check (canonical_name_source is null or canonical_name_source in (
    'manual_correction', 'official_website_structured_data', 'places_listing',
    'official_website_site_name', 'verified_official_social',
    'reputable_business_listing', 'official_website_title',
    'search_result_title', 'social_handle'
  )),
  drop constraint if exists signal_run_leads_official_website_status_check,
  add constraint signal_run_leads_official_website_status_check
  check (official_website_status is null or official_website_status in (
    'verified_official_website', 'likely_official_website',
    'no_official_website_found', 'website_unreachable', 'website_parked',
    'website_broken', 'website_unknown'
  )),
  drop constraint if exists signal_run_leads_lead_quality_status_check,
  add constraint signal_run_leads_lead_quality_status_check
  check (lead_quality_status is null or lead_quality_status in (
    'exceptional', 'strong', 'promising', 'watchlist', 'weak', 'reject'
  )),
  drop constraint if exists signal_run_leads_script_quality_score_check,
  add constraint signal_run_leads_script_quality_score_check
  check (script_quality_score is null or script_quality_score between 0 and 100),
  drop constraint if exists signal_run_leads_generation_attempt_check,
  add constraint signal_run_leads_generation_attempt_check
  check (generation_attempt >= 0);

alter table public.signal_run_leads
  drop constraint if exists signal_run_leads_online_presence_check,
  add constraint signal_run_leads_online_presence_check
  check (online_presence_classification is null or online_presence_classification in (
    'no_website_found', 'social_only', 'directory_only', 'website_unreachable',
    'website_parked', 'website_broken', 'website_weak', 'website_adequate',
    'website_strong', 'website_unknown'
  ));

create index if not exists signal_run_leads_quality_status_idx
  on public.signal_run_leads (run_id, lead_quality_status, ranking_score desc nulls last);

create table if not exists public.signal_run_lead_corrections (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.signal_runs(id) on delete cascade,
  lead_id uuid not null references public.signal_run_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by text,
  stable_identity_key text,
  provider_place_id text,
  normalized_hostname text,
  normalized_phone text,
  correction_type text not null,
  previous_value jsonb,
  corrected_value jsonb,
  note text,
  active boolean not null default true,
  constraint signal_run_lead_corrections_type_check check (correction_type in (
    'canonical_name', 'official_website', 'official_facebook', 'official_instagram',
    'chain', 'duplicate', 'not_a_business', 'category', 'city',
    'no_website_verified', 'reject'
  ))
);

create index if not exists signal_run_lead_corrections_stable_idx
  on public.signal_run_lead_corrections (stable_identity_key, created_at desc)
  where active = true and stable_identity_key is not null;
create index if not exists signal_run_lead_corrections_place_idx
  on public.signal_run_lead_corrections (provider_place_id, created_at desc)
  where active = true and provider_place_id is not null;
create index if not exists signal_run_lead_corrections_domain_idx
  on public.signal_run_lead_corrections (normalized_hostname, created_at desc)
  where active = true and normalized_hostname is not null;
create index if not exists signal_run_lead_corrections_phone_idx
  on public.signal_run_lead_corrections (normalized_phone, created_at desc)
  where active = true and normalized_phone is not null;

create table if not exists public.signal_run_lead_observations (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.signal_runs(id) on delete cascade,
  lead_id uuid not null references public.signal_run_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by text,
  stable_identity_key text,
  category text not null,
  note text not null,
  source text not null default 'user_observation',
  constraint signal_run_lead_observations_category_check check (category in (
    'payment', 'owner_availability', 'storefront', 'interest', 'follow_up',
    'availability', 'contact_preference', 'existing_provider', 'operations', 'other'
  )),
  constraint signal_run_lead_observations_source_check check (source = 'user_observation')
);

create table if not exists public.signal_identity_resolution_cache (
  cache_key text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists signal_identity_resolution_cache_expiry_idx
  on public.signal_identity_resolution_cache (expires_at);

alter table public.signal_identity_resolution_cache enable row level security;

comment on table public.signal_identity_resolution_cache is
  'Short-lived server-only cache for public domain and social identity resolution. No private content.';

create index if not exists signal_run_lead_observations_lead_idx
  on public.signal_run_lead_observations (lead_id, created_at desc);
create index if not exists signal_run_lead_observations_stable_idx
  on public.signal_run_lead_observations (stable_identity_key, created_at desc)
  where stable_identity_key is not null;

alter table public.signal_run_lead_corrections enable row level security;
alter table public.signal_run_lead_observations enable row level security;

comment on table public.signal_run_lead_corrections is
  'Team-only corrections scoped by stable Signal business identity. Accessed through Clerk-guarded server routes.';
comment on table public.signal_run_lead_observations is
  'Private Mountline observations, kept separate from public evidence and Signal inference.';
