-- Mountline Signal intelligence quality fields.
-- Additive only: existing lead-run history remains readable.

alter table public.signal_run_leads
  add column if not exists canonical_name text,
  add column if not exists canonical_name_confidence integer,
  add column if not exists entity_status text,
  add column if not exists entity_rejection_reason text,
  add column if not exists identity_evidence_count integer not null default 0,
  add column if not exists identity_evidence_summary jsonb not null default '[]'::jsonb,
  add column if not exists chain_classification text,
  add column if not exists chain_probability integer,
  add column if not exists chain_reasons jsonb not null default '[]'::jsonb,
  add column if not exists location_count_estimate integer,
  add column if not exists geographic_status text,
  add column if not exists verified_city text,
  add column if not exists verified_address text,
  add column if not exists distance_estimate_miles numeric,
  add column if not exists geographic_confidence integer,
  add column if not exists geographic_evidence jsonb not null default '[]'::jsonb,
  add column if not exists opportunity_score integer,
  add column if not exists ranking_score integer,
  add column if not exists confidence_components jsonb not null default '{}'::jsonb,
  add column if not exists qualification_status text,
  add column if not exists rejection_reason text,
  add column if not exists script_generation_type text,
  add column if not exists prompt_version text,
  add column if not exists evaluation_metadata jsonb not null default '{}'::jsonb;

alter table public.signal_run_leads
  drop constraint if exists signal_run_leads_canonical_name_confidence_check,
  add constraint signal_run_leads_canonical_name_confidence_check
    check (canonical_name_confidence is null or canonical_name_confidence between 0 and 100),
  drop constraint if exists signal_run_leads_entity_status_check,
  add constraint signal_run_leads_entity_status_check
    check (entity_status is null or entity_status in ('verified', 'likely', 'ambiguous', 'generic_result', 'directory', 'rejected')),
  drop constraint if exists signal_run_leads_identity_evidence_count_check,
  add constraint signal_run_leads_identity_evidence_count_check
    check (identity_evidence_count >= 0),
  drop constraint if exists signal_run_leads_chain_classification_check,
  add constraint signal_run_leads_chain_classification_check
    check (chain_classification is null or chain_classification in ('independent', 'likely_independent', 'local_multi_location', 'likely_franchise', 'chain', 'uncertain')),
  drop constraint if exists signal_run_leads_chain_probability_check,
  add constraint signal_run_leads_chain_probability_check
    check (chain_probability is null or chain_probability between 0 and 100),
  drop constraint if exists signal_run_leads_location_count_estimate_check,
  add constraint signal_run_leads_location_count_estimate_check
    check (location_count_estimate is null or location_count_estimate >= 1),
  drop constraint if exists signal_run_leads_geographic_status_check,
  add constraint signal_run_leads_geographic_status_check
    check (geographic_status is null or geographic_status in ('confirmed_in_market', 'confirmed_within_radius', 'near_market', 'unclear', 'outside_market')),
  drop constraint if exists signal_run_leads_geographic_confidence_check,
  add constraint signal_run_leads_geographic_confidence_check
    check (geographic_confidence is null or geographic_confidence between 0 and 100),
  drop constraint if exists signal_run_leads_distance_estimate_check,
  add constraint signal_run_leads_distance_estimate_check
    check (distance_estimate_miles is null or distance_estimate_miles >= 0),
  drop constraint if exists signal_run_leads_opportunity_score_check,
  add constraint signal_run_leads_opportunity_score_check
    check (opportunity_score is null or opportunity_score between 0 and 100),
  drop constraint if exists signal_run_leads_ranking_score_check,
  add constraint signal_run_leads_ranking_score_check
    check (ranking_score is null or ranking_score between 0 and 100),
  drop constraint if exists signal_run_leads_qualification_status_check,
  add constraint signal_run_leads_qualification_status_check
    check (qualification_status is null or qualification_status in ('qualified', 'rejected', 'incomplete')),
  drop constraint if exists signal_run_leads_script_generation_type_check,
  add constraint signal_run_leads_script_generation_type_check
    check (script_generation_type is null or script_generation_type in ('ai', 'deterministic_fallback'));

alter table public.signal_run_lead_evidence
  add column if not exists source_tier integer,
  add column if not exists reliability_score integer,
  add column if not exists extracted_fact text,
  add column if not exists retrieved_at timestamptz not null default now();

alter table public.signal_run_lead_evidence
  drop constraint if exists signal_run_lead_evidence_source_tier_check,
  add constraint signal_run_lead_evidence_source_tier_check
    check (source_tier is null or source_tier between 1 and 3),
  drop constraint if exists signal_run_lead_evidence_reliability_check,
  add constraint signal_run_lead_evidence_reliability_check
    check (reliability_score is null or reliability_score between 0 and 100);

create index if not exists signal_run_leads_quality_rank_idx
  on public.signal_run_leads (run_id, qualification_status, ranking_score desc nulls last, confidence_score desc nulls last);

create index if not exists signal_run_leads_chain_classification_idx
  on public.signal_run_leads (chain_classification, chain_probability desc)
  where chain_classification in ('chain', 'likely_franchise');
