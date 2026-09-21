-- Repair assigned-client project creation without changing historical migrations.
-- The original local variable client_email was ambiguous with the ON CONFLICT
-- column of the same name, causing SQLSTATE 42702 when a client was assigned.
-- Preserve the transaction, idempotency behavior, and service-role-only access.

create or replace function public.create_project_for_pilot(
  p_idempotency_key text,
  p_project_name text,
  p_client_id uuid,
  p_package_type text,
  p_status text,
  p_portal_id text,
  p_start_date date,
  p_target_launch_date date,
  p_live_url text,
  p_preview_url text,
  p_payment_link text,
  p_next_step text,
  p_notes text,
  p_signal_id uuid,
  p_created_by text
)
returns setof public.projects
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created_project public.projects%rowtype;
  assigned_client_email text;
  signal_rows_updated integer;
begin
  if nullif(trim(p_idempotency_key), '') is null then
    raise exception 'An idempotency key is required.';
  end if;

  select * into created_project
  from public.projects
  where creation_idempotency_key = p_idempotency_key;

  if found then
    return next created_project;
    return;
  end if;

  if p_client_id is not null then
    select lower(trim(email)) into assigned_client_email
    from public.clients
    where id = p_client_id;
    if assigned_client_email is null then
      raise exception 'Assigned client was not found or has no email.';
    end if;
  end if;

  if p_signal_id is not null and to_regclass('public.signal_prospects') is null then
    raise exception 'Signal linkage is unavailable.';
  end if;

  insert into public.projects (
    creation_idempotency_key, project_name, client_id, package_type, status,
    portal_id, start_date, target_launch_date, live_url, preview_url,
    payment_link, next_step, notes
  ) values (
    p_idempotency_key, p_project_name, p_client_id, p_package_type, p_status,
    p_portal_id, p_start_date, p_target_launch_date, p_live_url, p_preview_url,
    p_payment_link, p_next_step, p_notes
  )
  on conflict (creation_idempotency_key) where creation_idempotency_key is not null
  do nothing
  returning * into created_project;

  if created_project.id is null then
    select * into created_project
    from public.projects
    where creation_idempotency_key = p_idempotency_key;
    return next created_project;
    return;
  end if;

  if p_client_id is not null then
    insert into public.client_portal_access (project_id, client_email, access_status)
    values (created_project.id, assigned_client_email, 'active')
    on conflict (project_id, client_email) do update
    set access_status = 'active';
  end if;

  if p_signal_id is not null then
    execute 'update public.signal_prospects set converted_project_id = $1, converted_client_id = $2 where id = $3'
      using created_project.id, p_client_id, p_signal_id;
    get diagnostics signal_rows_updated = row_count;
    if signal_rows_updated = 0 then
      raise exception 'Signal prospect was not found.';
    end if;
  end if;

  return next created_project;
end;
$$;

revoke execute on function public.create_project_for_pilot(
  text, text, uuid, text, text, text, date, date, text, text, text, text, text, uuid, text
) from public, anon, authenticated;
grant execute on function public.create_project_for_pilot(
  text, text, uuid, text, text, text, date, date, text, text, text, text, text, uuid, text
) to service_role;
