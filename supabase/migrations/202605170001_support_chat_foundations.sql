-- Northline support chat foundations.
-- Safe for existing projects: adds sender display/read columns and updates the
-- sender_type constraint without deleting messages.

alter table public.support_messages add column if not exists sender_name text;
alter table public.support_messages add column if not exists read_at timestamp with time zone;

alter table public.support_messages
  drop constraint if exists support_messages_sender_type_check;

alter table public.support_messages
  add constraint support_messages_sender_type_check
  check (sender_type in ('client', 'team', 'system'));

create index if not exists support_messages_thread_created_idx
  on public.support_messages (thread_id, created_at);

create index if not exists support_messages_unread_client_idx
  on public.support_messages (thread_id, read_at)
  where sender_type = 'client' and read_at is null;
