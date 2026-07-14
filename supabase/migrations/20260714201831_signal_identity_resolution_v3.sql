-- Mountline Signal identity-resolution v3.
-- Additive, server-only persistence for submitted identity anchors, explainable
-- candidate matching, verification work, readiness gates, and safe repair logs.

alter table public.signal_prospects
  add column if not exists submitted_input text,
  add column if not exists submitted_name text,
  add column if not exists submitted_address text,
  add column if not exists submitted_phone text,
  add column if not exists submitted_url text,
  add column if not exists submitted_location text,
  add column if not exists submitted_note text,
  add column if not exists identity_anchor_type text,
  add column if not exists identity_anchor_strength text,
  add column if not exists identity_fingerprint text,
  add column if not exists identity_resolution_state text not null default 'input_received',
  add column if not exists identity_resolution jsonb not null default '{}'::jsonb,
  add column if not exists canonical_name text,
  add column if not exists canonical_name_status text not null default 'submitted',
  add column if not exists canonical_name_source text not null default 'submitted_input',
  add column if not exists display_name text,
  add column if not exists previous_names jsonb not null default '[]'::jsonb,
  add column if not exists manual_identity_override jsonb not null default '{}'::jsonb,
  add column if not exists lead_lifecycle text not null default 'draft_input',
  add column if not exists research_sufficiency jsonb not null default '{}'::jsonb,
  add column if not exists confidence_dimensions jsonb not null default '{}'::jsonb,
  add column if not exists sales_pack_state text not null default 'not_ready',
  add column if not exists business_location_type text not null default 'unknown',
  add column if not exists approachability_plan jsonb not null default '{}'::jsonb,
  add column if not exists last_reanalysis_scope text not null default 'full';

alter table public.signal_prospects
  drop constraint if exists signal_prospects_identity_anchor_type_check,
  add constraint signal_prospects_identity_anchor_type_check check (
    identity_anchor_type is null or identity_anchor_type in (
      'places_url', 'official_website', 'name_address', 'name_phone',
      'name_city', 'social_profile', 'business_name', 'unknown'
    )
  ),
  drop constraint if exists signal_prospects_identity_anchor_strength_check,
  add constraint signal_prospects_identity_anchor_strength_check check (
    identity_anchor_strength is null or identity_anchor_strength in ('strong', 'moderate', 'weak')
  ),
  drop constraint if exists signal_prospects_identity_resolution_state_check,
  add constraint signal_prospects_identity_resolution_state_check check (
    identity_resolution_state in (
      'input_received', 'parsed', 'candidates_found', 'exact_match', 'likely_match',
      'ambiguous', 'contradictory', 'unresolved', 'user_confirmed', 'verified', 'rejected'
    )
  ),
  drop constraint if exists signal_prospects_canonical_name_status_check,
  add constraint signal_prospects_canonical_name_status_check check (
    canonical_name_status in ('submitted', 'user_confirmed', 'verified', 'likely')
  ),
  drop constraint if exists signal_prospects_lead_lifecycle_check,
  add constraint signal_prospects_lead_lifecycle_check check (
    lead_lifecycle in ('draft_input', 'resolving', 'needs_confirmation', 'analyzed', 'operational', 'archived', 'rejected')
  ),
  drop constraint if exists signal_prospects_sales_pack_state_check,
  add constraint signal_prospects_sales_pack_state_check check (
    sales_pack_state in ('not_ready', 'research_briefing', 'draft_outreach', 'fully_personalized')
  ),
  drop constraint if exists signal_prospects_business_location_type_check,
  add constraint signal_prospects_business_location_type_check check (
    business_location_type in ('storefront', 'service_area', 'hybrid', 'unknown')
  ),
  drop constraint if exists signal_prospects_last_reanalysis_scope_check,
  add constraint signal_prospects_last_reanalysis_scope_check check (
    last_reanalysis_scope in ('full', 'identity', 'website', 'social', 'opportunity', 'sales')
  );

alter table public.signal_prospects
  drop constraint if exists signal_prospects_verdict_check;
alter table public.signal_prospects
  add constraint signal_prospects_verdict_check
  check (verdict in ('pending', 'pursue', 'investigate', 'skip', 'wrong_match', 'could_not_resolve'));

update public.signal_prospects
set submitted_input = coalesce(submitted_input, analysis_input, business_name),
    submitted_name = coalesce(submitted_name, business_name),
    submitted_address = coalesce(submitted_address, public_address),
    submitted_phone = coalesce(submitted_phone, public_phone),
    submitted_url = coalesce(submitted_url, website_url),
    submitted_location = coalesce(submitted_location, public_address, concat_ws(', ', city, state)),
    canonical_name = coalesce(canonical_name, business_name),
    display_name = coalesce(display_name, business_name),
    canonical_name_status = case when identity_status = 'verified' then 'verified' else 'submitted' end,
    canonical_name_source = case when identity_status = 'verified' then 'legacy_verified_record' else 'submitted_input' end,
    lead_lifecycle = case
      when analysis_status in ('queued', 'resolving', 'researching', 'analyzing') then 'resolving'
      when identity_status in ('needs_review', 'ambiguous') then 'needs_confirmation'
      when identity_status in ('verified', 'likely') and verdict in ('pursue', 'investigate', 'skip') then 'operational'
      else 'analyzed'
    end
where submitted_input is null
   or submitted_name is null
   or canonical_name is null
   or display_name is null;

create unique index if not exists signal_prospects_identity_fingerprint_idx
  on public.signal_prospects (identity_fingerprint)
  where identity_fingerprint is not null and identity_fingerprint <> '';
create index if not exists signal_prospects_lifecycle_updated_idx
  on public.signal_prospects (lead_lifecycle, updated_at desc);
create index if not exists signal_prospects_resolution_state_idx
  on public.signal_prospects (identity_resolution_state, updated_at desc);

alter table public.signal_evidence_ledger
  add column if not exists subject_name text,
  add column if not exists subject_identity_key text,
  add column if not exists publisher_name text,
  add column if not exists publisher_domain text,
  add column if not exists source_classification text,
  add column if not exists decision_status text not null default 'needs_confirmation',
  add column if not exists decision_reason text,
  add column if not exists affected_analysis_areas jsonb not null default '[]'::jsonb;

alter table public.signal_evidence_ledger
  drop constraint if exists signal_evidence_ledger_category_check,
  add constraint signal_evidence_ledger_category_check check (
    evidence_category in (
      'verified_public_fact', 'likely_inference', 'mountline_observation',
      'unverified_claim', 'rejected_source', 'unknown'
    )
  ),
  drop constraint if exists signal_evidence_ledger_verification_check,
  add constraint signal_evidence_ledger_verification_check check (
    verification_status in ('verified', 'corroborated', 'unverified', 'contradicted', 'rejected', 'unknown')
  ),
  drop constraint if exists signal_evidence_ledger_source_classification_check,
  add constraint signal_evidence_ledger_source_classification_check check (
    source_classification is null or source_classification in (
      'official_business_site', 'likely_official', 'booking_platform',
      'official_social_network', 'places_map_listing', 'reputable_local_organization',
      'directory', 'aggregator', 'marketplace', 'review_platform', 'search_engine', 'unknown'
    )
  ),
  drop constraint if exists signal_evidence_ledger_decision_status_check,
  add constraint signal_evidence_ledger_decision_status_check check (
    decision_status in ('accepted', 'needs_confirmation', 'rejected')
  );

create table if not exists public.signal_identity_candidates (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  candidate_key text not null,
  candidate_name text,
  address text,
  city text,
  state text,
  zip text,
  latitude numeric,
  longitude numeric,
  phone text,
  domain text,
  website_url text,
  social_urls jsonb not null default '[]'::jsonb,
  provider_place_id text,
  category text,
  source_url text,
  source_title text,
  source_provider text not null,
  source_tier text not null,
  source_classification text not null,
  source_reliability integer not null default 0,
  match_score integer not null default 0,
  match_components jsonb not null default '{}'::jsonb,
  conflicts jsonb not null default '[]'::jsonb,
  match_reasons jsonb not null default '[]'::jsonb,
  supporting_links jsonb not null default '[]'::jsonb,
  canonical_eligible boolean not null default false,
  official_website_eligible boolean not null default false,
  resolution_status text not null default 'possible',
  rejection_reason text,
  user_confirmed_at timestamptz,
  user_confirmed_by text,
  unique (prospect_id, candidate_key)
);

alter table public.signal_identity_candidates
  add constraint signal_identity_candidates_score_check check (match_score between 0 and 100),
  add constraint signal_identity_candidates_reliability_check check (source_reliability between 0 and 100),
  add constraint signal_identity_candidates_status_check check (
    resolution_status in ('selected', 'possible', 'rejected', 'user_confirmed', 'unrelated')
  );

create index if not exists signal_identity_candidates_prospect_score_idx
  on public.signal_identity_candidates (prospect_id, match_score desc, created_at desc);

create table if not exists public.signal_verification_items (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  requirement_key text not null,
  title text not null,
  why_it_matters text not null,
  current_evidence text not null,
  fastest_method text not null,
  action_type text not null,
  action_url text,
  required boolean not null default true,
  status text not null default 'unresolved',
  resolution_note text,
  resolved_at timestamptz,
  resolved_by text,
  unique (prospect_id, requirement_key)
);

alter table public.signal_verification_items
  add constraint signal_verification_items_status_check check (
    status in ('unresolved', 'resolved', 'unrelated', 'dismissed')
  );

create index if not exists signal_verification_items_open_idx
  on public.signal_verification_items (prospect_id, required desc, created_at)
  where status = 'unresolved';

create table if not exists public.signal_identity_correction_history (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamptz not null default now(),
  corrected_by text,
  field_name text not null,
  previous_value jsonb,
  corrected_value jsonb,
  verification_source text not null,
  note text,
  active boolean not null default true
);

alter table public.signal_identity_correction_history
  add constraint signal_identity_correction_history_source_check check (
    verification_source in (
      'personally_verified', 'provided_by_business', 'official_website',
      'official_social', 'places_listing', 'other'
    )
  );

create index if not exists signal_identity_correction_history_prospect_idx
  on public.signal_identity_correction_history (prospect_id, created_at desc);

create table if not exists public.signal_identity_repair_audit (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamptz not null default now(),
  run_id text not null,
  mode text not null,
  previous_name text not null,
  restored_name text not null,
  directory_publisher text not null,
  previous_resolution_state text,
  repair_reason text not null,
  previous_record jsonb not null default '{}'::jsonb,
  restored_record jsonb not null default '{}'::jsonb,
  rolled_back_at timestamptz,
  rolled_back_by text
);

alter table public.signal_identity_repair_audit
  add constraint signal_identity_repair_audit_mode_check check (mode in ('dry_run', 'applied', 'rollback'));

alter table public.signal_identity_candidates enable row level security;
alter table public.signal_verification_items enable row level security;
alter table public.signal_identity_correction_history enable row level security;
alter table public.signal_identity_repair_audit enable row level security;

revoke all on table public.signal_identity_candidates from anon, authenticated;
revoke all on table public.signal_verification_items from anon, authenticated;
revoke all on table public.signal_identity_correction_history from anon, authenticated;
revoke all on table public.signal_identity_repair_audit from anon, authenticated;

grant select, insert, update, delete on table public.signal_identity_candidates to service_role;
grant select, insert, update, delete on table public.signal_verification_items to service_role;
grant select, insert, update, delete on table public.signal_identity_correction_history to service_role;
grant select, insert, update, delete on table public.signal_identity_repair_audit to service_role;

comment on table public.signal_identity_candidates is
  'Team-only explainable candidate graph for the exact business submitted to Signal.';
comment on table public.signal_verification_items is
  'Specific identity and research checks that must be resolved before gated Signal actions unlock.';
comment on table public.signal_identity_correction_history is
  'Persistent Mountline identity corrections that outrank weaker public evidence on re-analysis.';
comment on table public.signal_identity_repair_audit is
  'Dry-run, apply, and rollback audit records for safe legacy directory-publisher name repair.';
