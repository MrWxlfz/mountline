-- Mountline client portal core schema.
-- Run this in Supabase SQL editor or through your migration workflow.
-- It is written to be safe for an existing project: tables are created if
-- missing, and newer portal columns are added if the base tables already exist.

create extension if not exists "pgcrypto";

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

alter table public.clients add column if not exists business_name text;
alter table public.clients add column if not exists contact_name text;
alter table public.clients add column if not exists email text;
alter table public.clients add column if not exists phone text;
alter table public.clients add column if not exists website text;
alter table public.clients add column if not exists status text not null default 'active';
alter table public.clients add column if not exists notes text;

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

alter table public.projects add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.projects add column if not exists project_name text;
alter table public.projects add column if not exists package_type text;
alter table public.projects add column if not exists status text not null default 'discovery';
alter table public.projects add column if not exists portal_id text;
alter table public.projects add column if not exists start_date date;
alter table public.projects add column if not exists target_launch_date date;
alter table public.projects add column if not exists live_url text;
alter table public.projects add column if not exists preview_url text;
alter table public.projects add column if not exists payment_link text;
alter table public.projects add column if not exists next_step text;
alter table public.projects add column if not exists notes text;

create unique index if not exists projects_portal_id_unique_idx
  on public.projects (portal_id)
  where portal_id is not null;

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
  sender_type text not null,
  sender_email text not null,
  sender_name text,
  read_at timestamp with time zone,
  message text not null
);

alter table public.support_messages add column if not exists sender_name text;
alter table public.support_messages add column if not exists read_at timestamp with time zone;

alter table public.support_messages
  drop constraint if exists support_messages_sender_type_check;

alter table public.support_messages
  add constraint support_messages_sender_type_check
  check (sender_type in ('client', 'team', 'system'));

create index if not exists support_messages_project_created_idx
  on public.support_messages (project_id, created_at);

create index if not exists support_messages_thread_created_idx
  on public.support_messages (thread_id, created_at);

create index if not exists support_messages_unread_client_idx
  on public.support_messages (thread_id, read_at)
  where sender_type = 'client' and read_at is null;

-- TODO: If you later expose any direct Supabase client writes, enable and tune
-- RLS policies for these tables. The app currently writes through server-only
-- API routes using the service-role client.
