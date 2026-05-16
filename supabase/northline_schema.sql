-- Northline full Supabase setup.
-- Run this first in the Supabase SQL editor for a fresh test project.
-- The app uses Clerk for auth. Do not use Supabase Auth for Northline users.

create extension if not exists "pgcrypto";

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  email text not null unique,
  clerk_user_id text unique,
  status text not null default 'active',
  role text not null default 'team',
  notes text
);

create index if not exists team_members_email_status_idx
  on public.team_members (lower(email), status);

create index if not exists team_members_clerk_user_id_status_idx
  on public.team_members (clerk_user_id, status);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name text not null,
  business_name text,
  email text not null,
  phone text,
  current_website text,
  service_needed text,
  budget_range text,
  message text,
  source text not null default 'website',
  status text not null default 'new'
);

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

create index if not exists leads_status_idx
  on public.leads (status);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  website text,
  status text not null default 'active',
  notes text
);

create index if not exists clients_email_idx
  on public.clients (lower(email));

create index if not exists clients_created_at_idx
  on public.clients (created_at desc);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  client_id uuid references public.clients(id) on delete set null,
  project_name text not null,
  package_type text,
  status text not null default 'discovery',
  portal_id text unique,
  start_date date,
  target_launch_date date,
  live_url text,
  preview_url text,
  payment_link text,
  next_step text,
  notes text
);

create unique index if not exists projects_portal_id_unique_idx
  on public.projects (portal_id)
  where portal_id is not null;

create index if not exists projects_client_id_idx
  on public.projects (client_id);

create index if not exists projects_created_at_idx
  on public.projects (created_at desc);

create index if not exists projects_status_idx
  on public.projects (status);

create table if not exists public.client_portal_access (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  client_email text not null,
  clerk_user_id text,
  access_status text not null default 'invited'
);

create unique index if not exists client_portal_access_project_email_idx
  on public.client_portal_access (project_id, client_email);

create index if not exists client_portal_access_email_idx
  on public.client_portal_access (lower(client_email));

create index if not exists client_portal_access_clerk_user_id_idx
  on public.client_portal_access (clerk_user_id);

create table if not exists public.support_threads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  status text not null default 'open'
);

create unique index if not exists support_threads_project_open_idx
  on public.support_threads (project_id)
  where status = 'open';

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  thread_id uuid not null references public.support_threads(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_type text not null check (sender_type in ('client', 'team')),
  sender_email text not null,
  message text not null
);

create index if not exists support_messages_project_created_idx
  on public.support_messages (project_id, created_at);

create table if not exists public.potential_clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  business_name text not null,
  website text,
  industry text,
  city text,
  state text,
  source text,
  website_quality_notes text,
  estimated_needs text,
  notes text,
  outreach_status text not null default 'not_contacted'
);

create index if not exists potential_clients_created_at_idx
  on public.potential_clients (created_at desc);

create index if not exists potential_clients_outreach_status_idx
  on public.potential_clients (outreach_status);

create table if not exists public.lead_insights (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  lead_id uuid references public.leads(id) on delete cascade,
  summary text,
  suggested_offer text,
  urgency_score integer
);

create index if not exists lead_insights_created_at_idx
  on public.lead_insights (created_at desc);

create index if not exists lead_insights_lead_id_idx
  on public.lead_insights (lead_id);

-- RLS note:
-- The current app reads and writes these tables through server routes using
-- the Supabase service-role key. If direct browser Supabase access is added
-- later, enable RLS and write table-specific policies before shipping.
