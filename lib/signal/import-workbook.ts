import "server-only"

import type { SignalProspect } from "@/lib/supabase/types"
import { inferSignalPlaybook } from "./playbooks"
import { findLikelySignalDuplicates } from "./research"
import { signalOutreachStatusSchema } from "./validation"

export type SignalImportField =
  | "business_name"
  | "contact_name"
  | "industry"
  | "city"
  | "state"
  | "website_url"
  | "public_email"
  | "public_phone"
  | "instagram_url"
  | "human_notes"
  | "what_looks_good"
  | "visible_problem"
  | "relevant_demo"
  | "outreach_status"
  | "follow_up_date"
  | "existing_website_platform"
  | "existing_booking_platform"
  | "locality_relationship"

export type SignalImportMapping = Partial<Record<SignalImportField, number>>

export type SignalImportPreviewRow = {
  row_number: number
  raw: Record<string, string>
  mapped: Record<string, string | null>
  issues: string[]
  duplicate_matches: Array<{
    prospect_id: string
    business_name: string
    reasons: string[]
  }>
}

type WorkbookRows = {
  file_type: "csv" | "xlsx" | "xls"
  sheet_names: string[]
  selected_sheet_name: string | null
  rows: string[][]
}

const FIELD_SYNONYMS: Record<SignalImportField, string[]> = {
  business_name: ["business name", "business", "company", "company name", "name"],
  contact_name: ["contact", "contact name", "owner", "decision maker", "person"],
  industry: ["industry", "niche", "category", "vertical", "playbook"],
  city: ["city", "area", "town", "market", "location"],
  state: ["state", "st"],
  website_url: ["website", "site", "url", "website url", "current website"],
  public_email: ["email", "public email", "business email"],
  public_phone: ["phone", "public phone", "business phone", "number"],
  instagram_url: ["instagram", "ig", "instagram url"],
  human_notes: ["notes", "note", "research notes", "comments"],
  what_looks_good: ["what looks good", "good", "compliment", "positive"],
  visible_problem: ["problem", "issue", "visible problem", "opportunity", "pain"],
  relevant_demo: ["demo", "relevant demo"],
  outreach_status: ["status", "outreach status", "stage"],
  follow_up_date: ["follow up", "follow-up", "follow up date", "next follow up"],
  existing_website_platform: ["platform", "website platform", "site platform"],
  existing_booking_platform: ["booking", "booking platform", "scheduler"],
  locality_relationship: ["relationship", "connection", "context", "locality"],
}

function clean(value: unknown, max = 3000) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
}

function normalizeHeader(value: string) {
  return clean(value)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function cell(rows: string[][], rowIndex: number, columnIndex: number | undefined) {
  if (typeof columnIndex !== "number") return null
  return clean(rows[rowIndex]?.[columnIndex] || "") || null
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let current = ""
  let row: string[] = []
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"' && quoted && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === "," && !quoted) {
      row.push(clean(current, 1200))
      current = ""
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1
      row.push(clean(current, 1200))
      if (row.some(Boolean)) rows.push(row)
      row = []
      current = ""
    } else {
      current += char
    }
  }

  row.push(clean(current, 1200))
  if (row.some(Boolean)) rows.push(row)
  return rows
}

async function loadXlsx() {
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (
      specifier: string,
    ) => Promise<{
      read: (buffer: Buffer, options: Record<string, unknown>) => {
        SheetNames: string[]
        Sheets: Record<string, unknown>
      }
      utils: {
        sheet_to_json: (
          sheet: unknown,
          options: Record<string, unknown>,
        ) => unknown[][]
      }
    }>
    return await dynamicImport("xlsx")
  } catch {
    return null
  }
}

export async function readSignalWorkbookRows({
  buffer,
  filename,
  sheetName,
}: {
  buffer: Buffer
  filename: string
  sheetName?: string | null
}): Promise<WorkbookRows> {
  const lower = filename.toLowerCase()

  if (lower.endsWith(".csv")) {
    return {
      file_type: "csv",
      sheet_names: ["CSV"],
      selected_sheet_name: "CSV",
      rows: parseCsv(buffer.toString("utf8")),
    }
  }

  const fileType = lower.endsWith(".xls") ? "xls" : "xlsx"
  const xlsx = await loadXlsx()
  if (!xlsx) {
    throw new Error(
      "Workbook parsing dependency is not installed. Install the xlsx package before importing Excel files.",
    )
  }

  const workbook = xlsx.read(buffer, {
    type: "buffer",
    cellDates: true,
    cellNF: false,
    cellHTML: false,
  })
  const selected = sheetName && workbook.SheetNames.includes(sheetName)
    ? sheetName
    : workbook.SheetNames[0]

  if (!selected) throw new Error("Workbook did not contain any worksheets.")

  const sheet = workbook.Sheets[selected]
  const rows = xlsx.utils
    .sheet_to_json(sheet, { header: 1, defval: "", raw: false })
    .map((row) => row.map((value) => clean(value, 1200)))
    .filter((row) => row.some(Boolean))

  return {
    file_type: fileType,
    sheet_names: workbook.SheetNames,
    selected_sheet_name: selected,
    rows,
  }
}

export function buildSignalImportMapping(headers: string[]): SignalImportMapping {
  const normalized = headers.map(normalizeHeader)
  const mapping: SignalImportMapping = {}

  for (const [field, synonyms] of Object.entries(FIELD_SYNONYMS) as Array<
    [SignalImportField, string[]]
  >) {
    const index = normalized.findIndex((header) =>
      synonyms.some(
        (synonym) =>
          header === normalizeHeader(synonym) ||
          header.includes(normalizeHeader(synonym)),
      ),
    )
    if (index >= 0) mapping[field] = index
  }

  return mapping
}

function normalizeStatus(value: string | null) {
  if (!value) return null
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
  const aliases: Record<string, string> = {
    ready: "ready_to_contact",
    ready_to_contact: "ready_to_contact",
    contacted: "contacted",
    awaiting: "awaiting_reply",
    awaiting_reply: "awaiting_reply",
    permission: "permission_to_send_demo",
    permission_to_send: "permission_to_send_demo",
    demo_sent: "demo_sent",
    interested: "interested",
    discovery: "discovery_call",
    discovery_call: "discovery_call",
    proposal: "proposal_sent",
    proposal_sent: "proposal_sent",
    won: "won",
    lost: "lost",
    no_response: "no_response",
    dnc: "do_not_contact",
    do_not_contact: "do_not_contact",
    researched: "researched",
    needs_review: "needs_review",
  }
  const parsed = signalOutreachStatusSchema.safeParse(aliases[normalized] || normalized)
  return parsed.success ? parsed.data : null
}

function normalizeDemo(value: string | null) {
  const lower = value?.toLowerCase() || ""
  if (lower.includes("auto")) return "auto-detailing"
  if (lower.includes("barber") || lower.includes("salon")) return "barber-shop"
  return "none"
}

export function buildSignalImportPreview({
  existingProspects,
  mappingOverride,
  rows,
}: {
  existingProspects: SignalProspect[]
  mappingOverride?: SignalImportMapping
  rows: string[][]
}) {
  const headers = rows[0] || []
  const mapping = {
    ...buildSignalImportMapping(headers),
    ...(mappingOverride || {}),
  }
  const dataRows = rows.slice(1, 501)

  const previewRows: SignalImportPreviewRow[] = dataRows
    .map((_, index) => {
      const rowIndex = index + 1
      const raw = Object.fromEntries(
        headers.map((header, columnIndex) => [
          header || `Column ${columnIndex + 1}`,
          clean(rows[rowIndex]?.[columnIndex] || "", 1200),
        ]),
      )

      const industry = cell(rows, rowIndex, mapping.industry) || "general local business"
      const mapped = {
        business_name: cell(rows, rowIndex, mapping.business_name),
        contact_name: cell(rows, rowIndex, mapping.contact_name),
        industry,
        industry_playbook: inferSignalPlaybook(industry),
        city: cell(rows, rowIndex, mapping.city),
        state: cell(rows, rowIndex, mapping.state),
        website_url: cell(rows, rowIndex, mapping.website_url),
        public_email: cell(rows, rowIndex, mapping.public_email),
        public_phone: cell(rows, rowIndex, mapping.public_phone),
        instagram_url: cell(rows, rowIndex, mapping.instagram_url),
        human_notes: cell(rows, rowIndex, mapping.human_notes),
        what_looks_good: cell(rows, rowIndex, mapping.what_looks_good),
        visible_problem: cell(rows, rowIndex, mapping.visible_problem),
        relevant_demo: normalizeDemo(cell(rows, rowIndex, mapping.relevant_demo)),
        outreach_status: normalizeStatus(cell(rows, rowIndex, mapping.outreach_status)) || "researched",
        follow_up_date: cell(rows, rowIndex, mapping.follow_up_date),
        existing_website_platform: cell(rows, rowIndex, mapping.existing_website_platform),
        existing_booking_platform: cell(rows, rowIndex, mapping.existing_booking_platform),
        locality_relationship: cell(rows, rowIndex, mapping.locality_relationship),
        source: "csv_import",
      }

      const issues: string[] = []
      if (!mapped.business_name) issues.push("Business name missing")
      if (!mapped.industry) issues.push("Industry missing")

      const duplicateMatches = mapped.business_name
        ? findLikelySignalDuplicates(existingProspects, {
            businessName: mapped.business_name,
            city: mapped.city,
            email: mapped.public_email,
            phone: mapped.public_phone,
            websiteUrl: mapped.website_url,
          }).map((match) => ({
            prospect_id: match.prospect.id,
            business_name: match.prospect.business_name,
            reasons: match.reasons,
          }))
        : []

      return {
        row_number: rowIndex + 1,
        raw,
        mapped,
        issues,
        duplicate_matches: duplicateMatches,
      }
    })
    .filter((row) => row.mapped.business_name || row.mapped.website_url || row.mapped.public_email)

  return {
    headers,
    mapping,
    previewRows,
    rowCount: dataRows.length,
    duplicateSummary: previewRows
      .filter((row) => row.duplicate_matches.length > 0)
      .map((row) => ({
        row_number: row.row_number,
        business_name: row.mapped.business_name,
        matches: row.duplicate_matches,
      })),
  }
}
