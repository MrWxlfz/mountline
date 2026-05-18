-- Mountline Scout V1.
-- Internal lead scoring from public business information only.

create table if not exists public.scout_prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  business_name text not null,
  industry text,
  city text,
  state text,
  website text,
  phone text,
  email text,
  google_rating numeric,
  google_review_count integer,
  source text not null default 'manual',
  website_score integer,
  opportunity_score integer,
  estimated_project_fit text,
  reasons jsonb not null default '[]'::jsonb,
  website_notes text,
  ai_summary text,
  outreach_angle text,
  red_flags jsonb not null default '[]'::jsonb,
  outreach_status text not null default 'not_contacted',
  last_checked_at timestamp with time zone,
  notes text
);

alter table public.scout_prospects
  drop constraint if exists scout_prospects_website_score_check;

alter table public.scout_prospects
  add constraint scout_prospects_website_score_check
  check (website_score is null or (website_score >= 0 and website_score <= 100));

alter table public.scout_prospects
  drop constraint if exists scout_prospects_opportunity_score_check;

alter table public.scout_prospects
  add constraint scout_prospects_opportunity_score_check
  check (opportunity_score is null or (opportunity_score >= 0 and opportunity_score <= 100));

alter table public.scout_prospects
  drop constraint if exists scout_prospects_outreach_status_check;

alter table public.scout_prospects
  add constraint scout_prospects_outreach_status_check
  check (outreach_status in ('not_contacted', 'reviewed', 'contacted', 'not_fit', 'lead_created'));

create index if not exists scout_prospects_created_at_idx
  on public.scout_prospects (created_at desc);

create index if not exists scout_prospects_opportunity_score_idx
  on public.scout_prospects (opportunity_score desc nulls last);

create index if not exists scout_prospects_outreach_status_idx
  on public.scout_prospects (outreach_status);

create table if not exists public.scout_alerts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  prospect_id uuid not null references public.scout_prospects(id) on delete cascade,
  alert_type text not null default 'high_opportunity',
  score integer not null,
  payload jsonb not null default '{}'::jsonb,
  delivery_channel text not null default 'internal',
  status text not null default 'created',
  delivered_at timestamp with time zone,
  delivery_error text
);

create index if not exists scout_alerts_created_at_idx
  on public.scout_alerts (created_at desc);

create index if not exists scout_alerts_prospect_id_idx
  on public.scout_alerts (prospect_id);

alter table public.scout_prospects enable row level security;
alter table public.scout_alerts enable row level security;
