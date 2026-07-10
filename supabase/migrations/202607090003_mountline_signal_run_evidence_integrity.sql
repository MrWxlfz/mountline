-- Keep evidence scoped to the same lead run as its parent lead.
-- This is additive and intentionally uses a normal invoker trigger function;
-- all Signal writes remain behind the Clerk-guarded server routes.

create or replace function public.ensure_signal_run_lead_evidence_scope()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.signal_run_leads as lead
    where lead.id = new.lead_id
      and lead.run_id = new.run_id
  ) then
    raise exception 'signal_run_lead_evidence run_id must match the parent lead run_id';
  end if;
  return new;
end;
$$;

drop trigger if exists signal_run_lead_evidence_scope on public.signal_run_lead_evidence;
create trigger signal_run_lead_evidence_scope
  before insert or update of run_id, lead_id
  on public.signal_run_lead_evidence
  for each row
  execute function public.ensure_signal_run_lead_evidence_scope();
