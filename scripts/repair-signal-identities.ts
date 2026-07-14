import { createClient } from "@supabase/supabase-js"
import {
  planSignalLegacyIdentityRepairs,
  type SignalLegacyIdentityRecord,
  type SignalLegacyIdentityRepair,
} from "../lib/signal/legacy-repair.ts"

const args = process.argv.slice(2)
const apply = args.includes("--apply")
const rollbackArg = args.find((arg) => arg.startsWith("--rollback="))
const rollbackRunId = rollbackArg?.slice("--rollback=".length).trim() || null

if (apply && rollbackRunId) throw new Error("Use either --apply or --rollback=<run-id>, not both.")

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. No credentials are printed by this script.")
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const runId = `signal-identity-repair-${new Date().toISOString().replace(/[:.]/g, "-")}`

async function restoreAfterAuditFailure(repair: SignalLegacyIdentityRepair) {
  await supabase.from("signal_prospects").update(repair.previousRecord).eq("id", repair.prospectId)
}

async function applyRepairs(repairs: SignalLegacyIdentityRepair[]) {
  let appliedCount = 0
  for (const repair of repairs) {
    const { data, error } = await supabase
      .from("signal_prospects")
      .update(repair.restoredRecord)
      .eq("id", repair.prospectId)
      .eq("canonical_name", repair.directoryPublisher)
      .select("id")
      .maybeSingle()
    if (error) throw new Error(`Could not repair ${repair.prospectId}: ${error.message}`)
    if (!data) continue

    const { error: auditError } = await supabase.from("signal_identity_repair_audit").insert({
      prospect_id: repair.prospectId,
      run_id: runId,
      mode: "applied",
      previous_name: String(repair.previousRecord.canonical_name || repair.previousRecord.business_name || repair.directoryPublisher),
      restored_name: repair.restoredName,
      directory_publisher: repair.directoryPublisher,
      previous_resolution_state: repair.previousRecord.identity_resolution_state || null,
      repair_reason: repair.reason,
      previous_record: repair.previousRecord,
      restored_record: repair.restoredRecord,
    })
    if (auditError) {
      await restoreAfterAuditFailure(repair)
      throw new Error(`Audit logging failed for ${repair.prospectId}; the record was restored. ${auditError.message}`)
    }
    appliedCount += 1
  }
  return appliedCount
}

async function rollbackRepairRun(targetRunId: string) {
  const { data, error } = await supabase
    .from("signal_identity_repair_audit")
    .select("id,prospect_id,previous_record,restored_record")
    .eq("run_id", targetRunId)
    .eq("mode", "applied")
    .is("rolled_back_at", null)
  if (error) throw new Error(error.message)

  let rolledBackCount = 0
  for (const row of data || []) {
    const restored = row.restored_record as Record<string, unknown>
    const previous = row.previous_record as Record<string, unknown>
    const currentCanonical = typeof restored.canonical_name === "string" ? restored.canonical_name : null
    let query = supabase.from("signal_prospects").update(previous).eq("id", row.prospect_id)
    if (currentCanonical) query = query.eq("canonical_name", currentCanonical)
    const { data: restoredRow, error: restoreError } = await query.select("id").maybeSingle()
    if (restoreError) throw new Error(`Could not roll back ${row.prospect_id}: ${restoreError.message}`)
    if (!restoredRow) continue
    const { error: auditError } = await supabase
      .from("signal_identity_repair_audit")
      .update({ rolled_back_at: new Date().toISOString(), rolled_back_by: "repair-script" })
      .eq("id", row.id)
    if (auditError) throw new Error(`Rolled back ${row.prospect_id}, but could not mark its audit row: ${auditError.message}`)
    rolledBackCount += 1
  }
  return { targetRunId, found: (data || []).length, rolledBackCount }
}

async function main() {
  if (rollbackRunId) {
    const result = await rollbackRepairRun(rollbackRunId)
    console.log(JSON.stringify({ mode: "rollback", ...result }, null, 2))
    return
  }

  const { data, error } = await supabase
    .from("signal_prospects")
    .select("id,business_name,display_name,canonical_name,canonical_name_status,canonical_name_source,submitted_name,identity_resolution_state,identity_status,lead_lifecycle,verdict,sales_pack_state,manual_identity_override")
  if (error) throw new Error(error.message)
  const records = (data || []) as SignalLegacyIdentityRecord[]
  const repairs = planSignalLegacyIdentityRepairs(records)
  const report = {
    mode: apply ? "apply" : "dry_run",
    runId,
    scannedCount: records.length,
    affectedCount: repairs.length,
    records: repairs.map((repair) => ({
      prospectId: repair.prospectId,
      directoryPublisher: repair.directoryPublisher,
      restoredName: repair.restoredName,
      reason: repair.reason,
    })),
  }

  if (!apply) {
    console.log(JSON.stringify(report, null, 2))
    return
  }
  const appliedCount = await applyRepairs(repairs)
  console.log(JSON.stringify({ ...report, appliedCount }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Signal identity repair failed.")
  process.exitCode = 1
})
