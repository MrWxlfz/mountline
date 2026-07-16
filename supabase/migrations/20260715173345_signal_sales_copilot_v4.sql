-- Mountline Signal sales-copilot v4.
-- Additive and history-preserving: existing prospects, activity, concepts, analyses,
-- and drafts remain in place. New version columns make stale artifacts non-current.

alter table public.signal_prospects
  add column if not exists identity_version integer not null default 1,
  add column if not exists evidence_version integer not null default 1,
  add column if not exists website_version integer not null default 1,
  add column if not exists category_version integer not null default 1,
  add column if not exists business_profile jsonb not null default '{}'::jsonb,
  add column if not exists uncertainty_budget jsonb not null default '[]'::jsonb,
  add column if not exists research_missions jsonb not null default '[]'::jsonb,
  add column if not exists assistance_mode text not null default 'identity_resolution',
  add column if not exists executive_recommendation jsonb not null default '{}'::jsonb,
  add column if not exists opportunity_brief jsonb not null default '{}'::jsonb,
  add column if not exists next_action_plan jsonb not null default '{}'::jsonb,
  add column if not exists action_availability jsonb not null default '{}'::jsonb,
  add column if not exists analysis_quality jsonb not null default '{}'::jsonb,
  add column if not exists provider_limitations jsonb not null default '[]'::jsonb,
  add column if not exists artifacts_regenerating boolean not null default false,
  add column if not exists artifacts_stale_reason text;

alter table public.signal_prospects
  drop constraint if exists signal_prospects_identity_version_check,
  add constraint signal_prospects_identity_version_check check (identity_version >= 1),
  drop constraint if exists signal_prospects_evidence_version_check,
  add constraint signal_prospects_evidence_version_check check (evidence_version >= 1),
  drop constraint if exists signal_prospects_website_version_check,
  add constraint signal_prospects_website_version_check check (website_version >= 1),
  drop constraint if exists signal_prospects_category_version_check,
  add constraint signal_prospects_category_version_check check (category_version >= 1),
  drop constraint if exists signal_prospects_assistance_mode_check,
  add constraint signal_prospects_assistance_mode_check check (
    assistance_mode in ('identity_resolution', 'verification_outreach', 'opportunity_outreach', 'active_deal_support')
  );

alter table public.signal_analyses
  add column if not exists identity_version integer not null default 1,
  add column if not exists evidence_version integer not null default 1,
  add column if not exists website_version integer not null default 1,
  add column if not exists category_version integer not null default 1,
  add column if not exists prompt_version text,
  add column if not exists input_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists is_current boolean not null default true,
  add column if not exists stale_at timestamptz,
  add column if not exists stale_reason text;

alter table public.signal_outreach_drafts
  add column if not exists identity_version integer not null default 1,
  add column if not exists evidence_version integer not null default 1,
  add column if not exists website_version integer not null default 1,
  add column if not exists category_version integer not null default 1,
  add column if not exists input_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists assistance_mode text,
  add column if not exists is_current boolean not null default true,
  add column if not exists stale_at timestamptz,
  add column if not exists stale_reason text;

alter table public.signal_concepts
  add column if not exists identity_version integer not null default 1,
  add column if not exists evidence_version integer not null default 1,
  add column if not exists website_version integer not null default 1,
  add column if not exists category_version integer not null default 1,
  add column if not exists prompt_version text,
  add column if not exists input_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists is_current boolean not null default true,
  add column if not exists stale_at timestamptz,
  add column if not exists stale_reason text;

create index if not exists signal_analyses_current_idx
  on public.signal_analyses (prospect_id, created_at desc)
  where is_current = true and stale_at is null;
create index if not exists signal_outreach_drafts_current_idx
  on public.signal_outreach_drafts (prospect_id, created_at desc)
  where is_current = true and stale_at is null;
create index if not exists signal_concepts_current_idx
  on public.signal_concepts (prospect_id, created_at desc)
  where is_current = true and stale_at is null;

create table if not exists public.signal_artifact_versions (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamptz not null default now(),
  artifact_type text not null,
  identity_version integer not null,
  evidence_version integer not null,
  website_version integer not null,
  category_version integer not null,
  prompt_version text,
  input_snapshot jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'current',
  stale_at timestamptz,
  stale_reason text,
  generated_by text
);

alter table public.signal_artifact_versions
  add constraint signal_artifact_versions_type_check check (
    artifact_type in (
      'verdict', 'confidence_dimensions', 'business_profile', 'opportunity',
      'approachability', 'offer', 'concept', 'sales_strategy', 'scripts',
      'next_action', 'preferred_channel', 'supporting_claims', 'evidence_summary'
    )
  ),
  add constraint signal_artifact_versions_status_check check (status in ('current', 'stale', 'generating', 'failed')),
  add constraint signal_artifact_versions_versions_check check (
    identity_version >= 1 and evidence_version >= 1 and website_version >= 1 and category_version >= 1
  );

create index if not exists signal_artifact_versions_current_idx
  on public.signal_artifact_versions (prospect_id, artifact_type, created_at desc)
  where status = 'current' and stale_at is null;

create table if not exists public.signal_provider_health (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.signal_prospects(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  provider text not null,
  operation text not null,
  status text not null,
  error_category text not null,
  user_explanation text not null,
  retryable boolean not null default true,
  effect_on_analysis text not null,
  last_successful_use timestamptz,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.signal_provider_health
  add constraint signal_provider_health_status_check check (status in ('degraded', 'unavailable', 'recovered')),
  add constraint signal_provider_health_error_category_check check (
    error_category in ('authentication', 'configuration', 'timeout', 'rate_limit', 'network', 'provider', 'database', 'unknown')
  );

create index if not exists signal_provider_health_open_idx
  on public.signal_provider_health (prospect_id, updated_at desc)
  where status in ('degraded', 'unavailable');

create table if not exists public.signal_research_missions (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  mission_key text not null,
  title text not null,
  status text not null,
  sources_checked jsonb not null default '[]'::jsonb,
  conclusion text,
  confidence text not null default 'low',
  failure_reason text,
  luke_intervention_required boolean not null default false,
  next_automatic_step text,
  identity_version integer not null,
  evidence_version integer not null,
  unique (prospect_id, mission_key, identity_version, evidence_version)
);

alter table public.signal_research_missions
  add constraint signal_research_missions_key_check check (mission_key in ('official_website', 'social_presence', 'category_services', 'contact_path')),
  add constraint signal_research_missions_status_check check (status in ('complete', 'in_progress', 'limited', 'needs_luke')),
  add constraint signal_research_missions_confidence_check check (confidence in ('high', 'medium', 'low'));

create index if not exists signal_research_missions_current_idx
  on public.signal_research_missions (prospect_id, updated_at desc);

alter table public.signal_artifact_versions enable row level security;
alter table public.signal_provider_health enable row level security;
alter table public.signal_research_missions enable row level security;

revoke all on table public.signal_artifact_versions from anon, authenticated;
revoke all on table public.signal_provider_health from anon, authenticated;
revoke all on table public.signal_research_missions from anon, authenticated;

grant select, insert, update, delete on table public.signal_artifact_versions to service_role;
grant select, insert, update, delete on table public.signal_provider_health to service_role;
grant select, insert, update, delete on table public.signal_research_missions to service_role;

comment on table public.signal_artifact_versions is
  'Immutable Signal artifact history. Only rows matching the active prospect versions may render as current.';
comment on table public.signal_provider_health is
  'System/provider failures kept separate from business uncertainty and verification work.';
comment on table public.signal_research_missions is
  'Targeted website, social, category/service, and contact-path research performed before requesting Mountline intervention.';
