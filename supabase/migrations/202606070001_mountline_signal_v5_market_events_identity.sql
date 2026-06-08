-- Mountline Signal V5 market progress and candidate identity.
-- Additive only. Keeps existing market and candidate data intact while adding
-- persisted event history and canonical identity resolution fields.

create table if not exists public.signal_market_events (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.signal_markets(id) on delete cascade,
  created_at timestamptz not null default now(),
  event_type text not null,
  stage text not null,
  message text not null,
  candidate_id uuid references public.signal_market_candidates(id) on delete set null,
  progress_current integer,
  progress_total integer,
  metadata jsonb
);

alter table public.signal_market_events
  drop constraint if exists signal_market_events_stage_check;
alter table public.signal_market_events
  add constraint signal_market_events_stage_check
  check (
    stage in (
      'initializing',
      'discovering',
      'normalizing',
      'suppressing',
      'deduplicating',
      'resolving_sites',
      'scraping_sites',
      'classifying',
      'quick_scoring',
      'screenshot_shortlist',
      'visual_analysis',
      'ranking',
      'ready',
      'failed',
      'paused'
    )
  );

create index if not exists signal_market_events_market_created_idx
  on public.signal_market_events (market_id, created_at desc);
create index if not exists signal_market_events_candidate_idx
  on public.signal_market_events (candidate_id, created_at desc)
  where candidate_id is not null;

alter table public.signal_market_events enable row level security;

alter table public.signal_market_candidates
  add column if not exists search_result_title text,
  add column if not exists search_result_url text,
  add column if not exists likely_official_site boolean,
  add column if not exists extracted_business_name text,
  add column if not exists canonical_business_name text,
  add column if not exists resolution_confidence text,
  add column if not exists resolution_evidence jsonb,
  add column if not exists requires_confirmation boolean not null default false,
  add column if not exists identity_updated_at timestamptz;

alter table public.signal_market_candidates
  drop constraint if exists signal_market_candidates_resolution_confidence_check;
alter table public.signal_market_candidates
  add constraint signal_market_candidates_resolution_confidence_check
  check (resolution_confidence is null or resolution_confidence in ('low', 'medium', 'high'));

create index if not exists signal_market_candidates_canonical_name_idx
  on public.signal_market_candidates (lower(canonical_business_name))
  where canonical_business_name is not null;
create index if not exists signal_market_candidates_requires_confirmation_idx
  on public.signal_market_candidates (market_id, requires_confirmation)
  where requires_confirmation = true;

create table if not exists public.signal_identity_corrections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  market_id uuid references public.signal_markets(id) on delete set null,
  candidate_id uuid references public.signal_market_candidates(id) on delete set null,
  normalized_hostname text,
  previous_business_name text,
  corrected_business_name text not null,
  reason text,
  created_by text,
  active boolean not null default true
);

create index if not exists signal_identity_corrections_hostname_idx
  on public.signal_identity_corrections (normalized_hostname, created_at desc)
  where active = true and normalized_hostname is not null;
create index if not exists signal_identity_corrections_candidate_idx
  on public.signal_identity_corrections (candidate_id, created_at desc)
  where candidate_id is not null;

alter table public.signal_identity_corrections enable row level security;
