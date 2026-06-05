-- Mountline Signal V3.1 reliability and usability pass.
-- Additive only. Extends classification, duplicate handling, suppression,
-- and candidate quick-score storage without touching unrelated product areas.

create table if not exists public.signal_classification_aliases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  normalized_business_name text,
  normalized_hostname text,
  city_normalized text,
  matched_term text,
  corrected_category text not null,
  corrected_playbook text,
  source text not null default 'manual_correction',
  note text,
  active boolean not null default true
);

create index if not exists signal_classification_aliases_hostname_idx
  on public.signal_classification_aliases (normalized_hostname)
  where normalized_hostname is not null and active = true;
create index if not exists signal_classification_aliases_name_city_idx
  on public.signal_classification_aliases (normalized_business_name, city_normalized)
  where normalized_business_name is not null and active = true;

create table if not exists public.signal_candidate_suppressions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  normalized_business_name text,
  normalized_hostname text,
  phone_normalized text,
  public_email_normalized text,
  city_normalized text,
  suppression_type text not null default 'rejected',
  reason text,
  source_campaign_id uuid references public.signal_campaigns(id) on delete set null,
  restored_at timestamptz,
  restored_by text
);

alter table public.signal_candidate_suppressions
  drop constraint if exists signal_candidate_suppressions_type_check;
alter table public.signal_candidate_suppressions
  add constraint signal_candidate_suppressions_type_check
  check (suppression_type in ('rejected', 'do_not_contact', 'duplicate', 'irrelevant', 'bad_source'));

create index if not exists signal_candidate_suppressions_hostname_idx
  on public.signal_candidate_suppressions (normalized_hostname)
  where normalized_hostname is not null and restored_at is null;
create index if not exists signal_candidate_suppressions_name_city_idx
  on public.signal_candidate_suppressions (normalized_business_name, city_normalized)
  where normalized_business_name is not null and restored_at is null;
create index if not exists signal_candidate_suppressions_phone_idx
  on public.signal_candidate_suppressions (phone_normalized)
  where phone_normalized is not null and restored_at is null;
create index if not exists signal_candidate_suppressions_email_idx
  on public.signal_candidate_suppressions (public_email_normalized)
  where public_email_normalized is not null and restored_at is null;

create table if not exists public.signal_prospect_aliases (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamptz not null default now(),
  alias_type text not null,
  alias_value text not null,
  normalized_value text not null,
  source text,
  active boolean not null default true
);

alter table public.signal_prospect_aliases
  drop constraint if exists signal_prospect_aliases_type_check;
alter table public.signal_prospect_aliases
  add constraint signal_prospect_aliases_type_check
  check (alias_type in ('business_name', 'hostname', 'phone', 'email'));

create index if not exists signal_prospect_aliases_prospect_idx
  on public.signal_prospect_aliases (prospect_id, created_at desc);
create index if not exists signal_prospect_aliases_lookup_idx
  on public.signal_prospect_aliases (alias_type, normalized_value)
  where active = true;

alter table public.signal_prospects
  add column if not exists normalized_business_name text,
  add column if not exists normalized_hostname text,
  add column if not exists public_email_normalized text,
  add column if not exists public_phone_normalized text,
  add column if not exists classification_source text,
  add column if not exists classification_confidence text,
  add column if not exists classification_evidence jsonb not null default '[]'::jsonb,
  add column if not exists classification_manual_override boolean not null default false,
  add column if not exists classified_at timestamptz,
  add column if not exists quick_score_updated_at timestamptz;

alter table public.signal_prospects
  drop constraint if exists signal_prospects_classification_source_check;
alter table public.signal_prospects
  add constraint signal_prospects_classification_source_check
  check (
    classification_source is null or classification_source in (
      'manual_override',
      'stored_alias',
      'deterministic',
      'ai',
      'human_review'
    )
  );

alter table public.signal_prospects
  drop constraint if exists signal_prospects_classification_confidence_check;
alter table public.signal_prospects
  add constraint signal_prospects_classification_confidence_check
  check (
    classification_confidence is null or classification_confidence in ('low', 'medium', 'high')
  );

create index if not exists signal_prospects_normalized_name_idx
  on public.signal_prospects (normalized_business_name);
create index if not exists signal_prospects_normalized_hostname_idx
  on public.signal_prospects (normalized_hostname)
  where normalized_hostname is not null;
create index if not exists signal_prospects_normalized_email_idx
  on public.signal_prospects (public_email_normalized)
  where public_email_normalized is not null;
create index if not exists signal_prospects_normalized_phone_idx
  on public.signal_prospects (public_phone_normalized)
  where public_phone_normalized is not null;

alter table public.signal_campaign_candidates
  add column if not exists normalized_business_name text,
  add column if not exists normalized_hostname text,
  add column if not exists classified_category text,
  add column if not exists classified_playbook text,
  add column if not exists classification_source text,
  add column if not exists classification_confidence text,
  add column if not exists classification_evidence jsonb not null default '[]'::jsonb,
  add column if not exists classified_at timestamptz,
  add column if not exists quick_score_summary jsonb,
  add column if not exists quick_score_updated_at timestamptz;

alter table public.signal_campaign_candidates
  drop constraint if exists signal_campaign_candidates_classification_source_check;
alter table public.signal_campaign_candidates
  add constraint signal_campaign_candidates_classification_source_check
  check (
    classification_source is null or classification_source in (
      'manual_override',
      'stored_alias',
      'deterministic',
      'ai',
      'human_review'
    )
  );

alter table public.signal_campaign_candidates
  drop constraint if exists signal_campaign_candidates_classification_confidence_check;
alter table public.signal_campaign_candidates
  add constraint signal_campaign_candidates_classification_confidence_check
  check (
    classification_confidence is null or classification_confidence in ('low', 'medium', 'high')
  );

create index if not exists signal_campaign_candidates_normalized_name_idx
  on public.signal_campaign_candidates (normalized_business_name);
create index if not exists signal_campaign_candidates_normalized_hostname_idx
  on public.signal_campaign_candidates (normalized_hostname)
  where normalized_hostname is not null;

alter table public.signal_classification_aliases enable row level security;
alter table public.signal_candidate_suppressions enable row level security;
alter table public.signal_prospect_aliases enable row level security;
