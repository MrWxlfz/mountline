-- Mountline Signal lead runs.
-- Additive tables for the focused lead-finding workflow. Existing Signal
-- prospects, markets, campaigns, and outreach records remain untouched.

create table if not exists public.signal_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  market_type text not null default 'city'
    check (market_type in ('city', 'metro')),
  location text not null,
  radius_miles integer not null default 10 check (radius_miles between 1 and 100),
  lead_limit integer not null default 5 check (lead_limit in (5, 10, 15, 25)),
  industry_focus text not null default 'best_opportunities',
  custom_industry text,
  notes text,
  status text not null default 'queued'
    check (status in ('queued', 'discovering', 'checking', 'scoring', 'writing_packs', 'ranking', 'completed', 'partial', 'failed')),
  current_stage text not null default 'setting_up',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  provider_status jsonb not null default '{}'::jsonb,
  provider_errors jsonb not null default '[]'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  error_message text,
  completed_at timestamptz
);

create index if not exists signal_runs_created_at_idx
  on public.signal_runs (created_at desc);
create index if not exists signal_runs_status_idx
  on public.signal_runs (status, updated_at desc);

create table if not exists public.signal_run_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.signal_runs(id) on delete cascade,
  created_at timestamptz not null default now(),
  stage text not null,
  message text not null,
  progress_percent integer check (progress_percent between 0 and 100),
  metadata jsonb
);

create index if not exists signal_run_events_run_created_idx
  on public.signal_run_events (run_id, created_at desc);

create table if not exists public.signal_run_leads (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.signal_runs(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  rank integer,
  status text not null default 'candidate'
    check (status in ('candidate', 'researching', 'ready', 'saved', 'ignored', 'excluded', 'failed')),
  business_name text not null,
  industry text,
  city text,
  state text,
  address text,
  website_url text,
  phone text,
  public_email text,
  social_links jsonb not null default '[]'::jsonb,
  source_urls jsonb not null default '[]'::jsonb,
  website_status text not null default 'unknown'
    check (website_status in ('no_site', 'weak_site', 'decent_site', 'strong_site', 'social_only', 'unknown')),
  chain_likelihood integer not null default 0 check (chain_likelihood between 0 and 100),
  chain_reason text,
  is_independent_likely boolean not null default false,
  independent_confidence integer not null default 0 check (independent_confidence between 0 and 100),
  final_score integer,
  confidence_score integer,
  score_breakdown jsonb not null default '{}'::jsonb,
  key_reasons jsonb not null default '[]'::jsonb,
  website_analysis jsonb not null default '{}'::jsonb,
  communication_profile jsonb not null default '{}'::jsonb,
  sales_pack jsonb,
  lovable_prompt text,
  risks jsonb not null default '[]'::jsonb,
  next_steps jsonb not null default '[]'::jsonb,
  raw_research jsonb not null default '{}'::jsonb,
  research_error text
);

create index if not exists signal_run_leads_run_rank_idx
  on public.signal_run_leads (run_id, rank asc nulls last, final_score desc nulls last);
create index if not exists signal_run_leads_saved_idx
  on public.signal_run_leads (status, updated_at desc)
  where status = 'saved';
create index if not exists signal_run_leads_active_idx
  on public.signal_run_leads (run_id, status);

create table if not exists public.signal_run_lead_evidence (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.signal_runs(id) on delete cascade,
  lead_id uuid not null references public.signal_run_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  evidence_type text not null,
  source_url text,
  source_title text,
  excerpt text,
  confidence text check (confidence in ('low', 'medium', 'high')),
  metadata jsonb
);

create index if not exists signal_run_lead_evidence_lead_created_idx
  on public.signal_run_lead_evidence (lead_id, created_at asc);

drop trigger if exists signal_runs_updated_at on public.signal_runs;
create trigger signal_runs_updated_at
  before update on public.signal_runs
  for each row
  execute function public.set_signal_updated_at();

drop trigger if exists signal_run_leads_updated_at on public.signal_run_leads;
create trigger signal_run_leads_updated_at
  before update on public.signal_run_leads
  for each row
  execute function public.set_signal_updated_at();

alter table public.signal_runs enable row level security;
alter table public.signal_run_events enable row level security;
alter table public.signal_run_leads enable row level security;
alter table public.signal_run_lead_evidence enable row level security;
