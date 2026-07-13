-- Mountline OS / Signal focused-analysis pivot.
-- Additive only: the existing Signal, Scout, portal, project, and support data
-- remains intact while Signal prospects become the operational lead record.

alter table public.signal_prospects
  add column if not exists analysis_input text,
  add column if not exists analysis_status text not null default 'ready',
  add column if not exists analysis_error text,
  add column if not exists analysis_started_at timestamp with time zone,
  add column if not exists analysis_completed_at timestamp with time zone,
  add column if not exists identity_status text not null default 'needs_review',
  add column if not exists provider_place_id text,
  add column if not exists public_address text,
  add column if not exists business_status text,
  add column if not exists opening_hours jsonb not null default '[]'::jsonb,
  add column if not exists facebook_url text,
  add column if not exists chain_status text not null default 'uncertain',
  add column if not exists verdict text not null default 'pending',
  add column if not exists opportunity_label text not null default 'unknown',
  add column if not exists confidence_label text not null default 'unknown',
  add column if not exists approachability_label text not null default 'unknown',
  add column if not exists pipeline_stage text not null default 'found',
  add column if not exists primary_opportunity text,
  add column if not exists why_it_matters text,
  add column if not exists smallest_offer text,
  add column if not exists must_verify jsonb not null default '[]'::jsonb,
  add column if not exists do_not_pitch jsonb not null default '[]'::jsonb,
  add column if not exists next_action text,
  add column if not exists next_action_due_at timestamp with time zone,
  add column if not exists concept_status text not null default 'not_started',
  add column if not exists converted_client_id uuid references public.clients(id) on delete set null,
  add column if not exists converted_project_id uuid references public.projects(id) on delete set null;

alter table public.signal_prospects
  drop constraint if exists signal_prospects_source_check;
alter table public.signal_prospects
  add constraint signal_prospects_source_check
  check (source in ('manual', 'csv_import', 'referral', 'public_web_research', 'scout_suggestion'));

alter table public.signal_prospects
  drop constraint if exists signal_prospects_analysis_status_check,
  add constraint signal_prospects_analysis_status_check
    check (analysis_status in ('queued', 'resolving', 'researching', 'analyzing', 'ready', 'needs_review', 'failed')),
  drop constraint if exists signal_prospects_identity_status_check,
  add constraint signal_prospects_identity_status_check
    check (identity_status in ('verified', 'likely', 'needs_review', 'ambiguous', 'rejected')),
  drop constraint if exists signal_prospects_chain_status_check,
  add constraint signal_prospects_chain_status_check
    check (chain_status in ('independent', 'likely_independent', 'local_multi_location', 'likely_franchise', 'chain', 'uncertain')),
  drop constraint if exists signal_prospects_verdict_check,
  add constraint signal_prospects_verdict_check
    check (verdict in ('pending', 'pursue', 'investigate', 'skip')),
  drop constraint if exists signal_prospects_opportunity_label_check,
  add constraint signal_prospects_opportunity_label_check
    check (opportunity_label in ('unknown', 'low', 'medium', 'high')),
  drop constraint if exists signal_prospects_confidence_label_check,
  add constraint signal_prospects_confidence_label_check
    check (confidence_label in ('unknown', 'low', 'medium', 'high')),
  drop constraint if exists signal_prospects_approachability_label_check,
  add constraint signal_prospects_approachability_label_check
    check (approachability_label in ('unknown', 'low', 'medium', 'high')),
  drop constraint if exists signal_prospects_pipeline_stage_check,
  add constraint signal_prospects_pipeline_stage_check
    check (pipeline_stage in ('found', 'analyzed', 'concept_ready', 'contacted', 'interested', 'proposal', 'won', 'lost')),
  drop constraint if exists signal_prospects_concept_status_check,
  add constraint signal_prospects_concept_status_check
    check (concept_status in ('not_started', 'prompt_ready', 'in_progress', 'ready', 'archived'));

update public.signal_prospects
set pipeline_stage = case
  when outreach_status = 'won' then 'won'
  when outreach_status in ('lost', 'no_response', 'do_not_contact') then 'lost'
  when outreach_status = 'proposal_sent' then 'proposal'
  when outreach_status in ('interested', 'discovery_call') then 'interested'
  when outreach_status in ('contacted', 'awaiting_reply', 'permission_to_send_demo', 'demo_sent') then 'contacted'
  when outreach_status in ('ready_to_contact', 'needs_review') then 'analyzed'
  else 'found'
end
where pipeline_stage = 'found';

create index if not exists signal_prospects_pipeline_stage_idx
  on public.signal_prospects (pipeline_stage, updated_at desc);
create index if not exists signal_prospects_verdict_idx
  on public.signal_prospects (verdict, updated_at desc);
create index if not exists signal_prospects_analysis_status_idx
  on public.signal_prospects (analysis_status, updated_at desc);
create index if not exists signal_prospects_provider_place_idx
  on public.signal_prospects (provider_place_id)
  where provider_place_id is not null;
create index if not exists signal_prospects_next_action_due_idx
  on public.signal_prospects (next_action_due_at)
  where next_action_due_at is not null;

create table if not exists public.signal_evidence_ledger (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  retrieved_at timestamp with time zone,
  evidence_category text not null,
  evidence_tier text not null,
  claim_type text not null,
  claim_text text not null,
  source_url text,
  source_title text,
  source_provider text,
  source_excerpt text,
  verification_status text not null default 'unverified',
  confidence integer,
  contradiction_group text,
  metadata jsonb not null default '{}'::jsonb,
  created_by text
);

alter table public.signal_evidence_ledger
  drop constraint if exists signal_evidence_ledger_category_check,
  add constraint signal_evidence_ledger_category_check
    check (evidence_category in ('verified_public_fact', 'likely_inference', 'mountline_observation', 'unverified_claim', 'unknown')),
  drop constraint if exists signal_evidence_ledger_tier_check,
  add constraint signal_evidence_ledger_tier_check
    check (evidence_tier in ('first_party', 'platform_listing', 'social_profile', 'directory', 'search_result', 'mountline_private', 'unknown')),
  drop constraint if exists signal_evidence_ledger_verification_check,
  add constraint signal_evidence_ledger_verification_check
    check (verification_status in ('verified', 'corroborated', 'unverified', 'contradicted', 'unknown')),
  drop constraint if exists signal_evidence_ledger_confidence_check,
  add constraint signal_evidence_ledger_confidence_check
    check (confidence is null or confidence between 0 and 99);

create index if not exists signal_evidence_ledger_prospect_created_idx
  on public.signal_evidence_ledger (prospect_id, created_at desc);
create index if not exists signal_evidence_ledger_category_idx
  on public.signal_evidence_ledger (evidence_category, verification_status);

create table if not exists public.signal_lead_activities (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  occurred_at timestamp with time zone not null default now(),
  activity_type text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by text
);

create index if not exists signal_lead_activities_prospect_occurred_idx
  on public.signal_lead_activities (prospect_id, occurred_at desc);

create table if not exists public.signal_lead_stage_history (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  from_stage text,
  to_stage text not null,
  reason text,
  created_by text
);

alter table public.signal_lead_stage_history
  drop constraint if exists signal_lead_stage_history_from_check,
  add constraint signal_lead_stage_history_from_check
    check (from_stage is null or from_stage in ('found', 'analyzed', 'concept_ready', 'contacted', 'interested', 'proposal', 'won', 'lost')),
  drop constraint if exists signal_lead_stage_history_to_check,
  add constraint signal_lead_stage_history_to_check
    check (to_stage in ('found', 'analyzed', 'concept_ready', 'contacted', 'interested', 'proposal', 'won', 'lost'));

create index if not exists signal_lead_stage_history_prospect_created_idx
  on public.signal_lead_stage_history (prospect_id, created_at desc);

create table if not exists public.signal_concepts (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  analysis_id uuid references public.signal_analyses(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  status text not null default 'prompt_ready',
  generation_prompt text not null,
  verified_facts jsonb not null default '[]'::jsonb,
  concept_url text,
  screenshot_url text,
  notes text,
  created_by text
);

alter table public.signal_concepts
  drop constraint if exists signal_concepts_status_check,
  add constraint signal_concepts_status_check
    check (status in ('prompt_ready', 'in_progress', 'ready', 'archived'));

create index if not exists signal_concepts_prospect_created_idx
  on public.signal_concepts (prospect_id, created_at desc);

drop trigger if exists signal_concepts_updated_at on public.signal_concepts;
create trigger signal_concepts_updated_at
  before update on public.signal_concepts
  for each row
  execute function public.set_signal_updated_at();

alter table public.signal_evidence_ledger enable row level security;
alter table public.signal_lead_activities enable row level security;
alter table public.signal_lead_stage_history enable row level security;
alter table public.signal_concepts enable row level security;
