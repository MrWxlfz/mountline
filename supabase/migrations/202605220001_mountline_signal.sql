-- Mountline Signal V1.
-- Internal, team-only sales intelligence and opportunity research.
-- Additive migration: creates new Signal tables without changing existing
-- dashboard, client portal, support, payment, or Scout tables.

create extension if not exists "pgcrypto";

create table if not exists public.signal_prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  business_name text not null,
  contact_name text,
  industry text not null,
  industry_playbook text,
  compliance_tier text not null default 'standard',
  city text,
  state text,
  locality_relationship text,
  website_url text,
  public_email text,
  public_phone text,
  public_contact_form_url text,
  instagram_url text,
  source text not null default 'manual',
  existing_website_platform text,
  existing_booking_platform text,
  human_notes text,
  what_looks_good text,
  visible_problem text,
  relevant_demo text,
  outreach_mode text not null default 'professional_studio',
  outreach_status text not null default 'researched',
  contacted_at timestamp with time zone,
  follow_up_date date,
  assigned_to text
);

alter table public.signal_prospects
  drop constraint if exists signal_prospects_compliance_tier_check;
alter table public.signal_prospects
  add constraint signal_prospects_compliance_tier_check
  check (compliance_tier in ('standard', 'sensitive', 'compliance_gated'));

alter table public.signal_prospects
  drop constraint if exists signal_prospects_source_check;
alter table public.signal_prospects
  add constraint signal_prospects_source_check
  check (source in ('manual', 'csv_import', 'referral', 'public_web_research'));

alter table public.signal_prospects
  drop constraint if exists signal_prospects_relevant_demo_check;
alter table public.signal_prospects
  add constraint signal_prospects_relevant_demo_check
  check (relevant_demo is null or relevant_demo in ('auto-detailing', 'barber-shop', 'none'));

alter table public.signal_prospects
  drop constraint if exists signal_prospects_outreach_mode_check;
alter table public.signal_prospects
  add constraint signal_prospects_outreach_mode_check
  check (outreach_mode in ('local_student', 'professional_studio', 'warm_connection'));

alter table public.signal_prospects
  drop constraint if exists signal_prospects_outreach_status_check;
alter table public.signal_prospects
  add constraint signal_prospects_outreach_status_check
  check (
    outreach_status in (
      'researched',
      'needs_review',
      'ready_to_contact',
      'contacted',
      'awaiting_reply',
      'permission_to_send_demo',
      'demo_sent',
      'interested',
      'discovery_call',
      'proposal_sent',
      'won',
      'lost',
      'no_response',
      'do_not_contact'
    )
  );

create index if not exists signal_prospects_created_at_idx
  on public.signal_prospects (created_at desc);
create index if not exists signal_prospects_business_name_idx
  on public.signal_prospects (lower(business_name));
create index if not exists signal_prospects_industry_playbook_idx
  on public.signal_prospects (industry_playbook);
create index if not exists signal_prospects_compliance_tier_idx
  on public.signal_prospects (compliance_tier);
create index if not exists signal_prospects_outreach_status_idx
  on public.signal_prospects (outreach_status);
create index if not exists signal_prospects_outreach_mode_idx
  on public.signal_prospects (outreach_mode);
create index if not exists signal_prospects_follow_up_date_idx
  on public.signal_prospects (follow_up_date);

create table if not exists public.signal_analyses (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  analysis_type text not null default 'initial',
  model_provider text,
  model_name text,
  scanned_urls jsonb,
  website_signals jsonb,
  evidence jsonb,
  confidence text,
  website_quality_score integer,
  business_viability_score integer,
  operational_opportunity_score integer,
  website_service_fit_score integer,
  ai_workflow_fit_score integer,
  reachability_score integer,
  compliance_risk_score integer,
  overall_opportunity_score integer,
  priority text,
  commercial_fit text,
  potential_project_value_band text,
  potential_project_value_reason text,
  recommended_primary_offer text,
  recommended_secondary_offer text,
  recommended_demo text,
  suggested_channel text,
  suggested_outreach_mode text,
  reasons_to_contact jsonb,
  red_flags jsonb,
  compliance_warning text,
  executive_summary text
);

alter table public.signal_analyses
  drop constraint if exists signal_analyses_analysis_type_check;
alter table public.signal_analyses
  add constraint signal_analyses_analysis_type_check
  check (analysis_type in ('initial', 'deep_dive', 'regenerated'));

alter table public.signal_analyses
  drop constraint if exists signal_analyses_confidence_check;
alter table public.signal_analyses
  add constraint signal_analyses_confidence_check
  check (confidence is null or confidence in ('low', 'medium', 'high'));

alter table public.signal_analyses
  drop constraint if exists signal_analyses_priority_check;
alter table public.signal_analyses
  add constraint signal_analyses_priority_check
  check (priority is null or priority in ('A', 'B', 'C', 'skip'));

alter table public.signal_analyses
  drop constraint if exists signal_analyses_commercial_fit_check;
alter table public.signal_analyses
  add constraint signal_analyses_commercial_fit_check
  check (commercial_fit is null or commercial_fit in ('unknown', 'starter', 'business', 'systems', 'high_value'));

alter table public.signal_analyses
  drop constraint if exists signal_analyses_recommended_demo_check;
alter table public.signal_analyses
  add constraint signal_analyses_recommended_demo_check
  check (recommended_demo is null or recommended_demo in ('auto-detailing', 'barber-shop', 'none'));

alter table public.signal_analyses
  drop constraint if exists signal_analyses_suggested_channel_check;
alter table public.signal_analyses
  add constraint signal_analyses_suggested_channel_check
  check (suggested_channel is null or suggested_channel in ('call', 'email', 'instagram', 'contact_form', 'warm_intro', 'research_more'));

alter table public.signal_analyses
  drop constraint if exists signal_analyses_suggested_outreach_mode_check;
alter table public.signal_analyses
  add constraint signal_analyses_suggested_outreach_mode_check
  check (suggested_outreach_mode is null or suggested_outreach_mode in ('local_student', 'professional_studio', 'warm_connection'));

alter table public.signal_analyses
  drop constraint if exists signal_analyses_score_ranges_check;
alter table public.signal_analyses
  add constraint signal_analyses_score_ranges_check
  check (
    (website_quality_score is null or website_quality_score between 0 and 100)
    and (business_viability_score is null or business_viability_score between 0 and 100)
    and (operational_opportunity_score is null or operational_opportunity_score between 0 and 100)
    and (website_service_fit_score is null or website_service_fit_score between 0 and 100)
    and (ai_workflow_fit_score is null or ai_workflow_fit_score between 0 and 100)
    and (reachability_score is null or reachability_score between 0 and 100)
    and (compliance_risk_score is null or compliance_risk_score between 0 and 100)
    and (overall_opportunity_score is null or overall_opportunity_score between 0 and 100)
  );

create index if not exists signal_analyses_prospect_created_idx
  on public.signal_analyses (prospect_id, created_at desc);
create index if not exists signal_analyses_priority_idx
  on public.signal_analyses (priority);
create index if not exists signal_analyses_overall_score_idx
  on public.signal_analyses (overall_opportunity_score desc nulls last);

create table if not exists public.signal_outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  analysis_id uuid references public.signal_analyses(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  outreach_mode text not null,
  first_contact_subject text,
  first_contact_email text,
  permission_based_dm text,
  owner_call_opener text,
  gatekeeper_script text,
  voicemail_script text,
  demo_send_followup text,
  discovery_call_questions jsonb,
  proposal_angle text,
  user_approved boolean not null default false,
  approved_at timestamp with time zone
);

alter table public.signal_outreach_drafts
  drop constraint if exists signal_outreach_drafts_outreach_mode_check;
alter table public.signal_outreach_drafts
  add constraint signal_outreach_drafts_outreach_mode_check
  check (outreach_mode in ('local_student', 'professional_studio', 'warm_connection'));

create index if not exists signal_outreach_drafts_prospect_created_idx
  on public.signal_outreach_drafts (prospect_id, created_at desc);
create index if not exists signal_outreach_drafts_analysis_id_idx
  on public.signal_outreach_drafts (analysis_id);

create table if not exists public.signal_alerts (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  analysis_id uuid references public.signal_analyses(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  alert_type text not null default 'high_fit',
  title text not null,
  message text not null,
  read_at timestamp with time zone,
  email_alert_sent_at timestamp with time zone
);

create index if not exists signal_alerts_created_at_idx
  on public.signal_alerts (created_at desc);
create index if not exists signal_alerts_unread_idx
  on public.signal_alerts (read_at)
  where read_at is null;
create index if not exists signal_alerts_prospect_id_idx
  on public.signal_alerts (prospect_id);

create table if not exists public.signal_suppression_list (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  email text,
  phone text,
  business_name text,
  reason text,
  source text not null default 'manual'
);

create index if not exists signal_suppression_email_idx
  on public.signal_suppression_list (lower(email))
  where email is not null;
create index if not exists signal_suppression_phone_idx
  on public.signal_suppression_list (phone)
  where phone is not null;
create index if not exists signal_suppression_business_name_idx
  on public.signal_suppression_list (lower(business_name))
  where business_name is not null;

create or replace function public.set_signal_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists signal_prospects_updated_at on public.signal_prospects;
create trigger signal_prospects_updated_at
  before update on public.signal_prospects
  for each row
  execute function public.set_signal_updated_at();

alter table public.signal_prospects enable row level security;
alter table public.signal_analyses enable row level security;
alter table public.signal_outreach_drafts enable row level security;
alter table public.signal_alerts enable row level security;
alter table public.signal_suppression_list enable row level security;
