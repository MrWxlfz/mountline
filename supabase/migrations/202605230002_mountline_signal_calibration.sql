-- Mountline Signal calibration pass.
-- Additive fields for deterministic fit, opportunity lanes, scan coverage,
-- status-aware next actions, and external-readiness checks.

alter table public.signal_prospects
  add column if not exists locality_scope text,
  add column if not exists relationship_type text not null default 'none',
  add column if not exists outreach_history text not null default 'never_contacted';

alter table public.signal_prospects
  drop constraint if exists signal_prospects_locality_scope_check;
alter table public.signal_prospects
  add constraint signal_prospects_locality_scope_check
  check (locality_scope is null or locality_scope in ('keller_local', 'dfw_nearby', 'remote', 'unknown'));

alter table public.signal_prospects
  drop constraint if exists signal_prospects_relationship_type_check;
alter table public.signal_prospects
  add constraint signal_prospects_relationship_type_check
  check (relationship_type in ('none', 'personally_visited', 'knows_owner', 'family_referral', 'customer', 'referred'));

alter table public.signal_prospects
  drop constraint if exists signal_prospects_outreach_history_check;
alter table public.signal_prospects
  add constraint signal_prospects_outreach_history_check
  check (outreach_history in ('never_contacted', 'emailed', 'called', 'dm_attempted', 'awaiting_reply', 'follow_up_due'));

create index if not exists signal_prospects_locality_scope_idx
  on public.signal_prospects (locality_scope);
create index if not exists signal_prospects_relationship_type_idx
  on public.signal_prospects (relationship_type);
create index if not exists signal_prospects_outreach_history_idx
  on public.signal_prospects (outreach_history);

alter table public.signal_analyses
  add column if not exists website_opportunity_score integer,
  add column if not exists systems_opportunity_score integer,
  add column if not exists recommended_lane text,
  add column if not exists scan_coverage_confidence text,
  add column if not exists scan_coverage_note text,
  add column if not exists evidence_weighting jsonb,
  add column if not exists recommended_next_action text,
  add column if not exists external_readiness jsonb;

alter table public.signal_analyses
  drop constraint if exists signal_analyses_lane_scores_check;
alter table public.signal_analyses
  add constraint signal_analyses_lane_scores_check
  check (
    (website_opportunity_score is null or website_opportunity_score between 0 and 100)
    and (systems_opportunity_score is null or systems_opportunity_score between 0 and 100)
  );

alter table public.signal_analyses
  drop constraint if exists signal_analyses_recommended_lane_check;
alter table public.signal_analyses
  add constraint signal_analyses_recommended_lane_check
  check (recommended_lane is null or recommended_lane in ('website_first', 'systems_discovery', 'do_not_pursue', 'compliance_gated'));

alter table public.signal_analyses
  drop constraint if exists signal_analyses_scan_coverage_confidence_check;
alter table public.signal_analyses
  add constraint signal_analyses_scan_coverage_confidence_check
  check (scan_coverage_confidence is null or scan_coverage_confidence in ('low', 'medium', 'high'));
