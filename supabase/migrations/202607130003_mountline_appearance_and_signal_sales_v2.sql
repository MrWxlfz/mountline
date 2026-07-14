-- Additive Mountline OS appearance and Signal sales-generation metadata.
-- All access remains behind Clerk-guarded server routes using the server-only
-- Supabase admin client. Supabase Auth is intentionally not used.

create table if not exists public.mountline_user_preferences (
  clerk_user_id text primary key,
  appearance text not null default 'system',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint mountline_user_preferences_appearance_check
    check (appearance in ('system', 'light', 'dark'))
);

alter table public.mountline_user_preferences enable row level security;
revoke all on table public.mountline_user_preferences from anon, authenticated;
grant select, insert, update, delete on table public.mountline_user_preferences to service_role;

comment on table public.mountline_user_preferences is
  'Clerk-keyed Mountline team preferences. Read and written only through Clerk-guarded server routes.';

alter table public.signal_outreach_drafts
  add column if not exists deal_diagnosis jsonb,
  add column if not exists conversation_strategy jsonb,
  add column if not exists prompt_version text,
  add column if not exists strategy_version text,
  add column if not exists quality_score integer,
  add column if not exists retry_count integer not null default 0,
  add column if not exists fallback_status text not null default 'not_used',
  add column if not exists generation_metadata jsonb not null default '{}'::jsonb;

alter table public.signal_outreach_drafts
  drop constraint if exists signal_outreach_drafts_quality_score_check,
  add constraint signal_outreach_drafts_quality_score_check
    check (quality_score is null or quality_score between 0 and 100),
  drop constraint if exists signal_outreach_drafts_retry_count_check,
  add constraint signal_outreach_drafts_retry_count_check
    check (retry_count between 0 and 3),
  drop constraint if exists signal_outreach_drafts_fallback_status_check,
  add constraint signal_outreach_drafts_fallback_status_check
    check (fallback_status in ('not_used', 'used', 'insufficient_evidence', 'provider_unavailable', 'quality_rejected'));

create index if not exists signal_outreach_drafts_quality_idx
  on public.signal_outreach_drafts (prospect_id, quality_score desc nulls last, created_at desc);
