-- Mountline Signal V2.3 visual evidence and verified observations.
-- Additive only. Screenshots are stored in a private Supabase Storage bucket
-- and accessed through team-only server routes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'signal-evidence',
  'signal-evidence',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

create table if not exists public.signal_visual_evidence (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamptz not null default now(),
  screenshot_type text not null,
  storage_path text,
  mime_type text,
  file_size_bytes integer,
  model_provider text,
  model_name text,
  analysis jsonb,
  confidence text,
  analyzed_at timestamptz,
  constraint signal_visual_evidence_type_check
    check (screenshot_type in ('desktop', 'mobile')),
  constraint signal_visual_evidence_confidence_check
    check (confidence is null or confidence in ('low', 'medium', 'high')),
  constraint signal_visual_evidence_file_size_check
    check (file_size_bytes is null or file_size_bytes <= 5242880)
);

alter table public.signal_visual_evidence enable row level security;

create unique index if not exists signal_visual_evidence_one_type_idx
  on public.signal_visual_evidence (prospect_id, screenshot_type);
create index if not exists signal_visual_evidence_prospect_created_idx
  on public.signal_visual_evidence (prospect_id, created_at desc);

create table if not exists public.signal_verified_observations (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.signal_prospects(id) on delete cascade,
  created_at timestamptz not null default now(),
  category text not null,
  source text not null,
  note text not null,
  url text,
  created_by text,
  constraint signal_verified_observations_category_check
    check (category in (
      'site_design',
      'services',
      'booking',
      'gallery',
      'public_contact',
      'reputation',
      'platform',
      'business_context'
    )),
  constraint signal_verified_observations_source_check
    check (source in (
      'manual_public_site_review',
      'official_public_site',
      'existing_conversation',
      'personal_relationship'
    ))
);

alter table public.signal_verified_observations enable row level security;

create index if not exists signal_verified_observations_prospect_created_idx
  on public.signal_verified_observations (prospect_id, created_at desc);
create index if not exists signal_verified_observations_category_idx
  on public.signal_verified_observations (category);
