-- Mountline Signal V2.2 calibration.
-- Adds authoritative outreach events, correction feedback, contact readiness,
-- and communication profile guidance without changing existing non-Signal tables.

alter table public.signal_prospects
  add column if not exists known_communication_context text,
  add column if not exists public_brand_tone text,
  add column if not exists suggested_communication_profile text,
  add column if not exists communication_profile_reason text,
  add column if not exists communication_profile_confirmed boolean not null default false,
  add column if not exists script_guidance text,
  add column if not exists contact_readiness text not null default 'contact_missing',
  add column if not exists contact_readiness_reason text;

alter table public.signal_prospects
  drop constraint if exists signal_prospects_suggested_communication_profile_check;
alter table public.signal_prospects
  add constraint signal_prospects_suggested_communication_profile_check
  check (
    suggested_communication_profile is null
    or suggested_communication_profile in (
      'plainspoken_owner_operator',
      'friendly_local',
      'modern_casual_brand',
      'busy_operations_manager',
      'formal_business',
      'clinical_professional',
      'warm_existing_connection'
    )
  );

alter table public.signal_prospects
  drop constraint if exists signal_prospects_contact_readiness_check;
alter table public.signal_prospects
  add constraint signal_prospects_contact_readiness_check
  check (
    contact_readiness in (
      'verified_email_available',
      'verified_phone_available',
      'verified_contact_form_available',
      'verified_social_contact_available',
      'contact_missing',
      'contact_history_only',
      'suppressed'
    )
  );

create index if not exists signal_prospects_contact_readiness_idx
  on public.signal_prospects (contact_readiness);
create index if not exists signal_prospects_communication_profile_idx
  on public.signal_prospects (suggested_communication_profile);

alter table public.signal_analyses
  add column if not exists contact_readiness text,
  add column if not exists communication_profile text,
  add column if not exists communication_profile_reason text,
  add column if not exists evidence_supporting_value_band jsonb,
  add column if not exists discovery_confirmation_needed jsonb;

alter table public.signal_outreach_drafts
  add column if not exists communication_profile text,
  add column if not exists communication_profile_reason text;

alter table public.signal_analyses
  drop constraint if exists signal_analyses_contact_readiness_check;
alter table public.signal_analyses
  add constraint signal_analyses_contact_readiness_check
  check (
    contact_readiness is null
    or contact_readiness in (
      'verified_email_available',
      'verified_phone_available',
      'verified_contact_form_available',
      'verified_social_contact_available',
      'contact_missing',
      'contact_history_only',
      'suppressed'
    )
  );

alter table public.signal_outreach_drafts
  drop constraint if exists signal_outreach_drafts_communication_profile_check;
alter table public.signal_outreach_drafts
  add constraint signal_outreach_drafts_communication_profile_check
  check (
    communication_profile is null
    or communication_profile in (
      'plainspoken_owner_operator',
      'friendly_local',
      'modern_casual_brand',
      'busy_operations_manager',
      'formal_business',
      'clinical_professional',
      'warm_existing_connection'
    )
  );

alter table public.signal_analyses
  drop constraint if exists signal_analyses_communication_profile_check;
alter table public.signal_analyses
  add constraint signal_analyses_communication_profile_check
  check (
    communication_profile is null
    or communication_profile in (
      'plainspoken_owner_operator',
      'friendly_local',
      'modern_casual_brand',
      'busy_operations_manager',
      'formal_business',
      'clinical_professional',
      'warm_existing_connection'
    )
  );

create table if not exists public.signal_outreach_events (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamptz not null default now(),
  event_date date,
  channel text not null,
  direction text not null default 'outbound',
  event_type text not null,
  summary text,
  follow_up_date date,
  created_by text,
  constraint signal_outreach_events_channel_check
    check (channel in ('email', 'call', 'voicemail', 'instagram', 'contact_form', 'text', 'in_person', 'other')),
  constraint signal_outreach_events_direction_check
    check (direction in ('outbound', 'inbound')),
  constraint signal_outreach_events_event_type_check
    check (event_type in (
      'attempted',
      'delivered',
      'blocked',
      'replied',
      'voicemail_left',
      'permission_to_send_demo',
      'demo_sent',
      'follow_up_sent',
      'discovery_call_booked',
      'interested',
      'declined',
      'do_not_contact'
    ))
);

alter table public.signal_outreach_events enable row level security;

create index if not exists signal_outreach_events_prospect_created_idx
  on public.signal_outreach_events (prospect_id, created_at desc);
create index if not exists signal_outreach_events_type_idx
  on public.signal_outreach_events (event_type);

create table if not exists public.signal_feedback (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  analysis_id uuid references public.signal_analyses(id) on delete set null,
  created_at timestamptz not null default now(),
  feedback_type text not null,
  original_value text,
  corrected_value text,
  note text
);

alter table public.signal_feedback enable row level security;

create index if not exists signal_feedback_prospect_created_idx
  on public.signal_feedback (prospect_id, created_at desc);
create index if not exists signal_feedback_type_idx
  on public.signal_feedback (feedback_type);
