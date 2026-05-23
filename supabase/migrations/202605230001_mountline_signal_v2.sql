-- Mountline Signal V2.
-- Additive upgrade for public business research, workbook imports,
-- conversation styles, script studio, and manual call-session prep.

alter table public.signal_prospects
  add column if not exists conversation_style text not null default 'friendly_local',
  add column if not exists conversation_style_reason text,
  add column if not exists last_researched_at timestamp with time zone;

alter table public.signal_prospects
  drop constraint if exists signal_prospects_conversation_style_check;
alter table public.signal_prospects
  add constraint signal_prospects_conversation_style_check
  check (
    conversation_style in (
      'friendly_local',
      'traditional_owner_operator',
      'modern_casual_brand',
      'formal_business',
      'clinical_professional',
      'concise_busy_owner'
    )
  );

create index if not exists signal_prospects_conversation_style_idx
  on public.signal_prospects (conversation_style);
create index if not exists signal_prospects_last_researched_at_idx
  on public.signal_prospects (last_researched_at desc nulls last);

alter table public.signal_analyses
  add column if not exists research_provider text,
  add column if not exists research_query text,
  add column if not exists confirmed_official_url text,
  add column if not exists official_source_confidence text,
  add column if not exists public_customer_positioning text,
  add column if not exists brand_voice_summary text,
  add column if not exists suggested_conversation_style text,
  add column if not exists conversation_style_reason text;

alter table public.signal_analyses
  drop constraint if exists signal_analyses_official_source_confidence_check;
alter table public.signal_analyses
  add constraint signal_analyses_official_source_confidence_check
  check (official_source_confidence is null or official_source_confidence in ('low', 'medium', 'high'));

alter table public.signal_analyses
  drop constraint if exists signal_analyses_suggested_conversation_style_check;
alter table public.signal_analyses
  add constraint signal_analyses_suggested_conversation_style_check
  check (
    suggested_conversation_style is null
    or suggested_conversation_style in (
      'friendly_local',
      'traditional_owner_operator',
      'modern_casual_brand',
      'formal_business',
      'clinical_professional',
      'concise_busy_owner'
    )
  );

alter table public.signal_outreach_drafts
  add column if not exists conversation_style text,
  add column if not exists conversation_style_reason text,
  add column if not exists script_studio jsonb,
  add column if not exists follow_up_email text,
  add column if not exists objection_responses jsonb;

alter table public.signal_outreach_drafts
  drop constraint if exists signal_outreach_drafts_conversation_style_check;
alter table public.signal_outreach_drafts
  add constraint signal_outreach_drafts_conversation_style_check
  check (
    conversation_style is null
    or conversation_style in (
      'friendly_local',
      'traditional_owner_operator',
      'modern_casual_brand',
      'formal_business',
      'clinical_professional',
      'concise_busy_owner'
    )
  );

create table if not exists public.signal_research_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  prospect_id uuid references public.signal_prospects(id) on delete set null,
  created_prospect_id uuid references public.signal_prospects(id) on delete set null,
  business_name text not null,
  location text not null,
  industry_hint text,
  known_context text,
  initial_note text,
  provider text not null default 'disabled',
  query text not null,
  status text not null default 'needs_confirmation',
  candidates jsonb not null default '[]'::jsonb,
  selected_candidate jsonb,
  confirmed_official_url text,
  official_source_confidence text,
  evidence jsonb not null default '[]'::jsonb,
  error text
);

alter table public.signal_research_runs
  drop constraint if exists signal_research_runs_status_check;
alter table public.signal_research_runs
  add constraint signal_research_runs_status_check
  check (status in ('needs_confirmation', 'confirmed', 'merged', 'created', 'failed'));

alter table public.signal_research_runs
  drop constraint if exists signal_research_runs_confidence_check;
alter table public.signal_research_runs
  add constraint signal_research_runs_confidence_check
  check (official_source_confidence is null or official_source_confidence in ('low', 'medium', 'high'));

create index if not exists signal_research_runs_created_at_idx
  on public.signal_research_runs (created_at desc);
create index if not exists signal_research_runs_prospect_id_idx
  on public.signal_research_runs (prospect_id);

create table if not exists public.signal_import_batches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  source_filename text not null,
  file_type text not null,
  sheet_name text,
  row_count integer not null default 0,
  headers jsonb not null default '[]'::jsonb,
  mapping jsonb not null default '{}'::jsonb,
  preview_rows jsonb not null default '[]'::jsonb,
  duplicate_summary jsonb not null default '[]'::jsonb,
  status text not null default 'previewed',
  imported_count integer not null default 0,
  error text
);

alter table public.signal_import_batches
  drop constraint if exists signal_import_batches_file_type_check;
alter table public.signal_import_batches
  add constraint signal_import_batches_file_type_check
  check (file_type in ('csv', 'xlsx', 'xls'));

alter table public.signal_import_batches
  drop constraint if exists signal_import_batches_status_check;
alter table public.signal_import_batches
  add constraint signal_import_batches_status_check
  check (status in ('previewed', 'imported', 'failed'));

create index if not exists signal_import_batches_created_at_idx
  on public.signal_import_batches (created_at desc);

create table if not exists public.signal_call_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  title text not null default 'Signal call session',
  status text not null default 'open',
  notes text
);

alter table public.signal_call_sessions
  drop constraint if exists signal_call_sessions_status_check;
alter table public.signal_call_sessions
  add constraint signal_call_sessions_status_check
  check (status in ('open', 'completed', 'archived'));

create table if not exists public.signal_call_session_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.signal_call_sessions(id) on delete cascade,
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  position integer not null default 0,
  outcome text,
  outcome_notes text,
  follow_up_date date,
  completed_at timestamp with time zone
);

alter table public.signal_call_session_items
  drop constraint if exists signal_call_session_items_outcome_check;
alter table public.signal_call_session_items
  add constraint signal_call_session_items_outcome_check
  check (
    outcome is null
    or outcome in (
      'no_answer',
      'voicemail_left',
      'permission_to_send_demo',
      'interested',
      'follow_up_later',
      'not_interested',
      'do_not_contact'
    )
  );

create index if not exists signal_call_sessions_created_at_idx
  on public.signal_call_sessions (created_at desc);
create index if not exists signal_call_session_items_session_idx
  on public.signal_call_session_items (session_id, position);
create index if not exists signal_call_session_items_prospect_idx
  on public.signal_call_session_items (prospect_id);

alter table public.signal_research_runs enable row level security;
alter table public.signal_import_batches enable row level security;
alter table public.signal_call_sessions enable row level security;
alter table public.signal_call_session_items enable row level security;
