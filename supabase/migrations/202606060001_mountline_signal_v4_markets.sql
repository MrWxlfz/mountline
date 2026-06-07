-- Mountline Signal V4 autonomous market builder.
-- Additive only. Keeps market discovery team-only, human-reviewed, and
-- scoped to public official business websites before outreach prep.

create table if not exists public.signal_markets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  city text not null,
  state text,
  radius_miles integer,
  industries jsonb not null default '[]'::jsonb,
  max_candidates integer not null default 20,
  research_depth text not null default 'balanced',
  status text not null default 'draft',
  provider_mode text,
  progress jsonb,
  estimated_credit_budget integer,
  actual_credit_usage jsonb,
  notes text,
  created_by text,
  last_run_at timestamptz,
  next_action text
);

alter table public.signal_markets
  drop constraint if exists signal_markets_research_depth_check;
alter table public.signal_markets
  add constraint signal_markets_research_depth_check
  check (research_depth in ('quick', 'balanced', 'deep'));

alter table public.signal_markets
  drop constraint if exists signal_markets_status_check;
alter table public.signal_markets
  add constraint signal_markets_status_check
  check (
    status in (
      'draft',
      'discovering',
      'deduplicating',
      'researching',
      'scoring',
      'ready_for_review',
      'paused',
      'completed',
      'failed'
    )
  );

alter table public.signal_markets
  drop constraint if exists signal_markets_provider_mode_check;
alter table public.signal_markets
  add constraint signal_markets_provider_mode_check
  check (provider_mode is null or provider_mode in ('tavily', 'firecrawl', 'hybrid', 'disabled'));

alter table public.signal_markets
  drop constraint if exists signal_markets_max_candidates_check;
alter table public.signal_markets
  add constraint signal_markets_max_candidates_check
  check (max_candidates between 1 and 50);

alter table public.signal_markets
  drop constraint if exists signal_markets_radius_check;
alter table public.signal_markets
  add constraint signal_markets_radius_check
  check (radius_miles is null or radius_miles between 1 and 100);

create index if not exists signal_markets_created_at_idx
  on public.signal_markets (created_at desc);
create index if not exists signal_markets_status_idx
  on public.signal_markets (status);
create index if not exists signal_markets_city_idx
  on public.signal_markets (lower(city), lower(state));

drop trigger if exists signal_markets_updated_at on public.signal_markets;
create trigger signal_markets_updated_at
  before update on public.signal_markets
  for each row
  execute function public.set_signal_updated_at();

create table if not exists public.signal_market_candidates (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.signal_markets(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_name text not null,
  city text,
  state text,
  industry_hint text,
  category text,
  category_confidence text,
  candidate_url text,
  likely_official_url text,
  confirmed_official_url text,
  official_source_confidence text,
  source_urls jsonb,
  provider_sources jsonb,
  duplicate_state text,
  duplicate_prospect_id uuid references public.signal_prospects(id) on delete set null,
  suppression_state text,
  suppression_id uuid references public.signal_candidate_suppressions(id) on delete set null,
  research_state text not null default 'discovered',
  quick_score_state text,
  preliminary_priority text,
  confidence text,
  imported_prospect_id uuid references public.signal_prospects(id) on delete set null,
  website_opportunity_score integer,
  systems_opportunity_score integer,
  outreach_readiness_score integer,
  pursuit_priority text,
  recommended_lane text,
  relevant_demo text,
  visual_state text,
  quick_score_summary jsonb,
  evidence_graph jsonb,
  website_scan jsonb,
  firecrawl_evidence jsonb,
  normalized_business_name text,
  normalized_hostname text,
  classified_at timestamptz,
  error_message text,
  rejected_at timestamptz,
  restored_at timestamptz,
  approved_at timestamptz
);

alter table public.signal_market_candidates
  drop constraint if exists signal_market_candidates_category_confidence_check;
alter table public.signal_market_candidates
  add constraint signal_market_candidates_category_confidence_check
  check (category_confidence is null or category_confidence in ('low', 'medium', 'high'));

alter table public.signal_market_candidates
  drop constraint if exists signal_market_candidates_official_confidence_check;
alter table public.signal_market_candidates
  add constraint signal_market_candidates_official_confidence_check
  check (official_source_confidence is null or official_source_confidence in ('low', 'medium', 'high'));

alter table public.signal_market_candidates
  drop constraint if exists signal_market_candidates_duplicate_state_check;
alter table public.signal_market_candidates
  add constraint signal_market_candidates_duplicate_state_check
  check (duplicate_state is null or duplicate_state in ('none', 'exact', 'likely', 'possible'));

alter table public.signal_market_candidates
  drop constraint if exists signal_market_candidates_suppression_state_check;
alter table public.signal_market_candidates
  add constraint signal_market_candidates_suppression_state_check
  check (suppression_state is null or suppression_state in ('clear', 'suppressed', 'market_rejected', 'restored'));

alter table public.signal_market_candidates
  drop constraint if exists signal_market_candidates_research_state_check;
alter table public.signal_market_candidates
  add constraint signal_market_candidates_research_state_check
  check (
    research_state in (
      'discovered',
      'suppressed',
      'duplicate',
      'needs_confirmation',
      'official_site_resolved',
      'researching',
      'quick_scored',
      'visual_shortlisted',
      'approved',
      'imported_to_signal',
      'rejected',
      'failed'
    )
  );

alter table public.signal_market_candidates
  drop constraint if exists signal_market_candidates_quick_score_state_check;
alter table public.signal_market_candidates
  add constraint signal_market_candidates_quick_score_state_check
  check (quick_score_state is null or quick_score_state in ('not_started', 'scored', 'ai_unavailable', 'failed'));

alter table public.signal_market_candidates
  drop constraint if exists signal_market_candidates_priority_check;
alter table public.signal_market_candidates
  add constraint signal_market_candidates_priority_check
  check (preliminary_priority is null or preliminary_priority in ('A', 'B', 'C', 'skip'));

alter table public.signal_market_candidates
  drop constraint if exists signal_market_candidates_confidence_check;
alter table public.signal_market_candidates
  add constraint signal_market_candidates_confidence_check
  check (confidence is null or confidence in ('low', 'medium', 'high'));

alter table public.signal_market_candidates
  drop constraint if exists signal_market_candidates_score_ranges_check;
alter table public.signal_market_candidates
  add constraint signal_market_candidates_score_ranges_check
  check (
    (website_opportunity_score is null or website_opportunity_score between 0 and 100)
    and (systems_opportunity_score is null or systems_opportunity_score between 0 and 100)
    and (outreach_readiness_score is null or outreach_readiness_score between 0 and 100)
  );

create index if not exists signal_market_candidates_market_idx
  on public.signal_market_candidates (market_id, created_at desc);
create index if not exists signal_market_candidates_state_idx
  on public.signal_market_candidates (market_id, research_state);
create index if not exists signal_market_candidates_priority_idx
  on public.signal_market_candidates (market_id, preliminary_priority, website_opportunity_score desc nulls last);
create index if not exists signal_market_candidates_duplicate_idx
  on public.signal_market_candidates (duplicate_prospect_id)
  where duplicate_prospect_id is not null;
create index if not exists signal_market_candidates_imported_idx
  on public.signal_market_candidates (imported_prospect_id)
  where imported_prospect_id is not null;
create index if not exists signal_market_candidates_normalized_name_idx
  on public.signal_market_candidates (normalized_business_name);
create index if not exists signal_market_candidates_normalized_hostname_idx
  on public.signal_market_candidates (normalized_hostname)
  where normalized_hostname is not null;

drop trigger if exists signal_market_candidates_updated_at on public.signal_market_candidates;
create trigger signal_market_candidates_updated_at
  before update on public.signal_market_candidates
  for each row
  execute function public.set_signal_updated_at();

alter table public.signal_focus_items
  add column if not exists market_id uuid references public.signal_markets(id) on delete set null;

create index if not exists signal_focus_items_market_idx
  on public.signal_focus_items (market_id)
  where market_id is not null;

alter table public.signal_candidate_suppressions
  add column if not exists source_market_id uuid references public.signal_markets(id) on delete set null;

create index if not exists signal_candidate_suppressions_market_idx
  on public.signal_candidate_suppressions (source_market_id)
  where source_market_id is not null;

create table if not exists public.signal_script_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  prospect_id uuid references public.signal_prospects(id) on delete cascade,
  draft_id uuid references public.signal_outreach_drafts(id) on delete set null,
  script_type text,
  feedback_type text not null,
  rating integer,
  original_text text,
  edited_text text,
  note text,
  reusable_lesson text,
  active boolean not null default true,
  created_by text
);

alter table public.signal_script_feedback
  drop constraint if exists signal_script_feedback_rating_check;
alter table public.signal_script_feedback
  add constraint signal_script_feedback_rating_check
  check (rating is null or rating between 1 and 5);

create index if not exists signal_script_feedback_prospect_idx
  on public.signal_script_feedback (prospect_id, created_at desc)
  where active = true;
create index if not exists signal_script_feedback_type_idx
  on public.signal_script_feedback (feedback_type, created_at desc)
  where active = true;

create table if not exists public.signal_prompt_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  prompt_type text not null,
  version integer not null default 1,
  active boolean not null default true,
  content text not null,
  notes text,
  created_by text
);

alter table public.signal_prompt_templates
  drop constraint if exists signal_prompt_templates_type_check;
alter table public.signal_prompt_templates
  add constraint signal_prompt_templates_type_check
  check (
    prompt_type in (
      'quick_score',
      'deep_analysis',
      'category_classification',
      'visual_analysis',
      'first_call',
      'gatekeeper',
      'voicemail',
      'follow_up',
      'demo_send',
      'objection_response',
      'discovery_questions'
    )
  );

create index if not exists signal_prompt_templates_active_type_idx
  on public.signal_prompt_templates (prompt_type, version desc)
  where active = true;

drop trigger if exists signal_prompt_templates_updated_at on public.signal_prompt_templates;
create trigger signal_prompt_templates_updated_at
  before update on public.signal_prompt_templates
  for each row
  execute function public.set_signal_updated_at();

insert into public.signal_prompt_templates (name, prompt_type, version, content, notes, created_by)
select * from (
  values
    ('Signal quick score default', 'quick_score', 1, 'Score only evidence-backed public business context. Separate verified facts, reasonable inferences, and discovery questions.', 'Code-seeded V4 default.', 'system'),
    ('Signal category classification default', 'category_classification', 1, 'Classify using manual overrides, aliases, deterministic official-site evidence, then fast model only when needed.', 'Code-seeded V4 default.', 'system'),
    ('Signal visual analysis default', 'visual_analysis', 1, 'Analyze only visible public website presentation. Do not infer business performance, demographics, or unsupported claims.', 'Code-seeded V4 default.', 'system'),
    ('Signal first call default', 'first_call', 1, 'Write warm, concise, permission-based call openers using public evidence and no fake urgency.', 'Code-seeded V4 default.', 'system'),
    ('Signal gatekeeper default', 'gatekeeper', 1, 'Ask for the right contact plainly and respectfully without pressure.', 'Code-seeded V4 default.', 'system'),
    ('Signal voicemail default', 'voicemail', 1, 'Keep voicemail short, specific, and low-pressure. Never imply prior familiarity unless explicitly recorded.', 'Code-seeded V4 default.', 'system'),
    ('Signal follow-up default', 'follow_up', 1, 'Write one respectful follow-up only when outreach history supports it.', 'Code-seeded V4 default.', 'system'),
    ('Signal demo send default', 'demo_send', 1, 'Send the relevant demo only after permission or a manual decision. Use the full Mountline demo URL.', 'Code-seeded V4 default.', 'system'),
    ('Signal objection response default', 'objection_response', 1, 'Answer plainly, avoid jargon, preserve tools that already work, and do not overpromise AI.', 'Code-seeded V4 default.', 'system'),
    ('Signal discovery questions default', 'discovery_questions', 1, 'Create practical discovery questions that test assumptions instead of presenting them as facts.', 'Code-seeded V4 default.', 'system')
) as seed(name, prompt_type, version, content, notes, created_by)
where not exists (
  select 1
  from public.signal_prompt_templates existing
  where existing.name = seed.name
    and existing.prompt_type = seed.prompt_type
    and existing.version = seed.version
);

alter table public.signal_markets enable row level security;
alter table public.signal_market_candidates enable row level security;
alter table public.signal_script_feedback enable row level security;
alter table public.signal_prompt_templates enable row level security;
