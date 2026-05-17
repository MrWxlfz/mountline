-- Mountline payment foundations for project invoices and manual methods.
-- Additive migration for existing projects tables.

alter table public.projects add column if not exists payment_link text;
alter table public.projects add column if not exists payment_status text not null default 'not_sent';
alter table public.projects add column if not exists accepted_payment_methods jsonb;
alter table public.projects add column if not exists manual_payment_instructions text;
alter table public.projects add column if not exists invoice_amount numeric;
alter table public.projects add column if not exists invoice_label text;

alter table public.projects
  drop constraint if exists projects_payment_status_check;

alter table public.projects
  add constraint projects_payment_status_check
  check (payment_status in ('not_sent', 'pending', 'paid', 'waived', 'manual_received'));
