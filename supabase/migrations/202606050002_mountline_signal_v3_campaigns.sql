-- Mountline Signal V3 city campaigns and focus queue.
-- Additive only. Keeps discovery, candidate review, and daily focus records
-- inside the existing team-only Signal surface.

create table if not exists public.signal_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  target_city text not null,
  target_state text,
  target_radius_miles integer,
  selected_playbooks jsonb not null default '[]'::jsonb,
  max_candidates integer not null default 25,
  status text not null default 'draft',
  discovery_provider text,
  notes text,
  created_by text,
  last_run_at timestamptz,
  next_action text
);

alter table public.signal_campaigns
  drop constraint if exists signal_campaigns_status_check;
alter table public.signal_campaigns
  add constraint signal_campaigns_status_check
  check (
    status in (
      'draft',
      'discovering',
      'review_candidates',
      'researching',
      'ready',
      'paused',
      'complete',
      'failed'
    )
  );

alter table public.signal_campaigns
  drop constraint if exists signal_campaigns_max_candidates_check;
alter table public.signal_campaigns
  add constraint signal_campaigns_max_candidates_check
  check (max_candidates between 1 and 50);

alter table public.signal_campaigns
  drop constraint if exists signal_campaigns_radius_check;
alter table public.signal_campaigns
  add constraint signal_campaigns_radius_check
  check (target_radius_miles is null or target_radius_miles between 1 and 100);

create index if not exists signal_campaigns_created_at_idx
  on public.signal_campaigns (created_at desc);
create index if not exists signal_campaigns_status_idx
  on public.signal_campaigns (status);
create index if not exists signal_campaigns_market_idx
  on public.signal_campaigns (lower(target_city), lower(target_state));

drop trigger if exists signal_campaigns_updated_at on public.signal_campaigns;
create trigger signal_campaigns_updated_at
  before update on public.signal_campaigns
  for each row
  execute function public.set_signal_updated_at();

create table if not exists public.signal_campaign_candidates (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.signal_campaigns(id) on delete cascade,
  created_at timestamptz not null default now(),
  business_name text not null,
  city text,
  state text,
  industry_hint text,
  candidate_url text,
  likely_official_url text,
  source_url text,
  source_title text,
  source_snippet text,
  source_provider text,
  official_source_confidence text,
  candidate_status text not null default 'pending_review',
  duplicate_prospect_id uuid references public.signal_prospects(id) on delete set null,
  reason text
);

alter table public.signal_campaign_candidates
  drop constraint if exists signal_campaign_candidates_confidence_check;
alter table public.signal_campaign_candidates
  add constraint signal_campaign_candidates_confidence_check
  check (official_source_confidence is null or official_source_confidence in ('low', 'medium', 'high'));

alter table public.signal_campaign_candidates
  drop constraint if exists signal_campaign_candidates_status_check;
alter table public.signal_campaign_candidates
  add constraint signal_campaign_candidates_status_check
  check (
    candidate_status in (
      'pending_review',
      'approved',
      'rejected',
      'duplicate',
      'needs_confirmation',
      'imported_to_signal',
      'research_failed'
    )
  );

create index if not exists signal_campaign_candidates_campaign_idx
  on public.signal_campaign_candidates (campaign_id, created_at desc);
create index if not exists signal_campaign_candidates_status_idx
  on public.signal_campaign_candidates (candidate_status);
create index if not exists signal_campaign_candidates_business_idx
  on public.signal_campaign_candidates (lower(business_name));
create index if not exists signal_campaign_candidates_duplicate_idx
  on public.signal_campaign_candidates (duplicate_prospect_id)
  where duplicate_prospect_id is not null;

create table if not exists public.signal_focus_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  campaign_id uuid references public.signal_campaigns(id) on delete set null,
  status text not null default 'pending',
  focus_reason text,
  recommended_action text,
  due_date date,
  completed_at timestamptz,
  created_by text
);

alter table public.signal_focus_items
  drop constraint if exists signal_focus_items_status_check;
alter table public.signal_focus_items
  add constraint signal_focus_items_status_check
  check (status in ('pending', 'active', 'completed', 'archived'));

create index if not exists signal_focus_items_status_idx
  on public.signal_focus_items (status, due_date nulls first, created_at desc);
create index if not exists signal_focus_items_prospect_idx
  on public.signal_focus_items (prospect_id, created_at desc);
create index if not exists signal_focus_items_campaign_idx
  on public.signal_focus_items (campaign_id)
  where campaign_id is not null;

alter table public.signal_campaigns enable row level security;
alter table public.signal_campaign_candidates enable row level security;
alter table public.signal_focus_items enable row level security;
