import { isKnownSignalDirectoryPublisherName } from "./source-classification.ts"

export type SignalLegacyIdentityRecord = {
  id: string
  business_name: string
  display_name: string | null
  canonical_name: string | null
  canonical_name_status: string | null
  canonical_name_source: string | null
  submitted_name: string | null
  identity_resolution_state: string | null
  identity_status: string | null
  lead_lifecycle: string | null
  verdict: string | null
  sales_pack_state: string | null
  manual_identity_override?: unknown
}

export type SignalLegacyIdentityRepair = {
  prospectId: string
  directoryPublisher: string
  restoredName: string
  reason: string
  previousRecord: Record<string, unknown>
  restoredRecord: Record<string, unknown>
}

const repairFields = [
  "business_name",
  "display_name",
  "canonical_name",
  "canonical_name_status",
  "canonical_name_source",
  "identity_resolution_state",
  "identity_status",
  "lead_lifecycle",
  "verdict",
  "sales_pack_state",
] as const

function snapshot(record: SignalLegacyIdentityRecord) {
  return Object.fromEntries(repairFields.map((field) => [field, record[field]]))
}

function hasManualIdentity(record: SignalLegacyIdentityRecord) {
  return Boolean(record.manual_identity_override
    && typeof record.manual_identity_override === "object"
    && Object.keys(record.manual_identity_override as Record<string, unknown>).length)
}

export function planSignalLegacyIdentityRepair(
  record: SignalLegacyIdentityRecord,
): SignalLegacyIdentityRepair | null {
  const publisher = isKnownSignalDirectoryPublisherName(record.canonical_name)
    ? record.canonical_name
    : null
  const submittedName = record.submitted_name?.trim()
  if (!publisher || !submittedName || publisher.trim().toLowerCase() === submittedName.toLowerCase()) return null

  const verified = record.identity_status === "verified"
    || record.identity_resolution_state === "verified"
    || record.identity_resolution_state === "user_confirmed"
    || record.canonical_name_status === "verified"
    || record.canonical_name_status === "user_confirmed"
    || hasManualIdentity(record)
  if (verified) return null

  const restoredRecord = {
    business_name: submittedName,
    display_name: submittedName,
    canonical_name: submittedName,
    canonical_name_status: "submitted",
    canonical_name_source: "submitted_input",
    identity_resolution_state: "unresolved",
    identity_status: "needs_review",
    lead_lifecycle: "needs_confirmation",
    verdict: "could_not_resolve",
    sales_pack_state: "not_ready",
  }
  return {
    prospectId: record.id,
    directoryPublisher: publisher,
    restoredName: submittedName,
    reason: "The unverified canonical identity matched a known directory publisher, so the submitted business name was restored for confirmation.",
    previousRecord: snapshot(record),
    restoredRecord,
  }
}

export function planSignalLegacyIdentityRepairs(records: SignalLegacyIdentityRecord[]) {
  return records.map(planSignalLegacyIdentityRepair).filter((repair): repair is SignalLegacyIdentityRepair => Boolean(repair))
}
