-- Mountline Signal map-first discovery.
-- Additive only: existing Signal runs and leads remain readable.

alter table public.signal_runs
  add column if not exists discovery_provider text,
  add column if not exists market_center jsonb,
  add column if not exists market_boundary jsonb,
  add column if not exists provider_usage jsonb not null default '{}'::jsonb;

alter table public.signal_runs
  drop constraint if exists signal_runs_discovery_provider_check,
  add constraint signal_runs_discovery_provider_check
    check (discovery_provider is null or discovery_provider in ('google', 'tavily'));

alter table public.signal_run_leads
  add column if not exists discovery_provider text,
  add column if not exists provider_place_id text,
  add column if not exists provider_listing_url text,
  add column if not exists listing_latitude numeric,
  add column if not exists listing_longitude numeric,
  add column if not exists listing_retrieved_at timestamptz,
  add column if not exists listing_attribution text,
  add column if not exists business_status text,
  add column if not exists primary_category text,
  add column if not exists place_categories jsonb not null default '[]'::jsonb,
  add column if not exists rating numeric,
  add column if not exists review_count integer,
  add column if not exists opening_hours jsonb not null default '[]'::jsonb,
  add column if not exists price_level text,
  add column if not exists online_presence_classification text,
  add column if not exists primary_online_channel text,
  add column if not exists social_profiles jsonb not null default '[]'::jsonb,
  add column if not exists social_verification_confidence integer,
  add column if not exists contact_confidence integer,
  add column if not exists online_presence_confidence integer,
  add column if not exists opportunity_analysis_confidence integer,
  add column if not exists opportunity_signals jsonb not null default '[]'::jsonb,
  add column if not exists research_needed_reasons jsonb not null default '[]'::jsonb,
  add column if not exists provider_usage_metadata jsonb not null default '{}'::jsonb;

alter table public.signal_run_leads
  drop constraint if exists signal_run_leads_discovery_provider_check,
  add constraint signal_run_leads_discovery_provider_check
    check (discovery_provider is null or discovery_provider in ('google', 'tavily')),
  drop constraint if exists signal_run_leads_listing_latitude_check,
  add constraint signal_run_leads_listing_latitude_check
    check (listing_latitude is null or listing_latitude between -90 and 90),
  drop constraint if exists signal_run_leads_listing_longitude_check,
  add constraint signal_run_leads_listing_longitude_check
    check (listing_longitude is null or listing_longitude between -180 and 180),
  drop constraint if exists signal_run_leads_rating_check,
  add constraint signal_run_leads_rating_check
    check (rating is null or rating between 0 and 5),
  drop constraint if exists signal_run_leads_review_count_check,
  add constraint signal_run_leads_review_count_check
    check (review_count is null or review_count >= 0),
  drop constraint if exists signal_run_leads_online_presence_check,
  add constraint signal_run_leads_online_presence_check
    check (online_presence_classification is null or online_presence_classification in (
      'no_website_found', 'social_only', 'directory_only', 'website_unreachable',
      'website_broken', 'website_weak', 'website_adequate', 'website_strong',
      'website_unknown'
    )),
  drop constraint if exists signal_run_leads_primary_online_channel_check,
  add constraint signal_run_leads_primary_online_channel_check
    check (primary_online_channel is null or primary_online_channel in ('website', 'facebook', 'instagram', 'booking_marketplace', 'directory', 'phone', 'unknown')),
  drop constraint if exists signal_run_leads_social_verification_confidence_check,
  add constraint signal_run_leads_social_verification_confidence_check
    check (social_verification_confidence is null or social_verification_confidence between 0 and 100),
  drop constraint if exists signal_run_leads_contact_confidence_check,
  add constraint signal_run_leads_contact_confidence_check
    check (contact_confidence is null or contact_confidence between 0 and 100),
  drop constraint if exists signal_run_leads_online_presence_confidence_check,
  add constraint signal_run_leads_online_presence_confidence_check
    check (online_presence_confidence is null or online_presence_confidence between 0 and 100),
  drop constraint if exists signal_run_leads_opportunity_analysis_confidence_check,
  add constraint signal_run_leads_opportunity_analysis_confidence_check
    check (opportunity_analysis_confidence is null or opportunity_analysis_confidence between 0 and 100),
  drop constraint if exists signal_run_leads_qualification_status_check,
  add constraint signal_run_leads_qualification_status_check
    check (qualification_status is null or qualification_status in ('qualified', 'watchlist', 'research_needed', 'rejected', 'incomplete'));

create unique index if not exists signal_run_leads_provider_place_idx
  on public.signal_run_leads (run_id, discovery_provider, provider_place_id)
  where provider_place_id is not null;

create index if not exists signal_run_leads_map_first_rank_idx
  on public.signal_run_leads (run_id, qualification_status, ranking_score desc nulls last, confidence_score desc nulls last);

create table if not exists public.signal_place_cache (
  provider text not null,
  provider_place_id text not null,
  normalized_data jsonb not null,
  retrieved_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (provider, provider_place_id),
  constraint signal_place_cache_provider_check check (provider in ('google'))
);

create index if not exists signal_place_cache_expiry_idx
  on public.signal_place_cache (expires_at);

alter table public.signal_place_cache enable row level security;

comment on table public.signal_place_cache is
  'Short-TTL server-only cache for normalized Places details. No photos or review text.';
