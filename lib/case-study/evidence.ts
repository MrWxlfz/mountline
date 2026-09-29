import { z } from "zod"
import raw from "./evidence.json"

/**
 * The recorded results behind "And yes, we tested it." on the homepage.
 *
 * evidence.json is written by scripts/evidence/build-evidence.mjs from the raw runs in
 * docs/case-study/runs. Nothing here is measured in the visitor's browser, and nothing is filled in by
 * hand. A measurement that wasn't taken is null, and the page says so instead of showing a number.
 */

const status = z.enum(["pass", "fail"]).nullable()
const spread = z.object({ median: z.number(), min: z.number(), max: z.number(), runs: z.number().int().positive() })

const check = z.object({
  id: z.string(),
  label: z.string(),
  // What the check shows, in a sentence a business owner would follow.
  means: z.string(),
  // Ran once across every screen width, rather than once per viewport.
  shared: z.boolean(),
  before: z.object({ desktop: status, phone: status }),
  after: z.object({ desktop: status, phone: status }).nullable(),
  detail: z.string().nullable(),
})

// A finding is either a measured amount that went down ("count") or a check that failed and was retested ("check").
const finding = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("count"),
    id: z.string(),
    // Shown in the Refine chapter; the rest are in the written report.
    featured: z.boolean(),
    title: z.string(),
    found: z.string(),
    fix: z.string(),
    unit: z.string(),
    // "Before" for the old homepage, "Mid-build" for a problem this rebuild introduced and then fixed.
    beforeLabel: z.string(),
    before: z.number().nullable(),
    after: z.number().nullable(),
    source: z.string(),
  }),
  z.object({
    kind: z.literal("check"),
    id: z.string(),
    featured: z.boolean(),
    title: z.string(),
    found: z.string(),
    fix: z.string(),
    before: status,
    after: status,
    source: z.string(),
  }),
])

export const evidenceSchema = z.object({
  version: z.literal(1),
  recordedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  subject: z.string(),
  builds: z.object({
    before: z.object({ commit: z.string(), description: z.string() }),
    after: z.object({ commit: z.string(), description: z.string() }).nullable(),
  }),
  environment: z.object({
    machine: z.string(),
    browser: z.string(),
    tools: z.array(z.string()),
    viewports: z.array(z.string()),
    network: z.string(),
  }),
  checks: z.array(check),
  tasks: z.object({ total: z.number().int(), passed: z.number().int() }).nullable(),
  tasksBefore: z.object({ total: z.number().int(), passed: z.number().int() }).nullable(),
  accessibility: z.object({
    tool: z.string(),
    before: z.object({ rules: z.number().int(), elements: z.number().int() }),
    after: z.object({ rules: z.number().int(), elements: z.number().int() }).nullable(),
  }),
  performance: z.object({
    tool: z.string(),
    profile: z.string(),
    lcpMs: z.object({ before: spread, after: spread.nullable() }),
    tbtMs: z.object({ before: spread, after: spread.nullable() }),
    fontKb: z.object({ before: z.number(), after: z.number().nullable() }),
    totalKb: z.object({ before: z.number(), after: z.number().nullable() }),
  }),
  unitTests: z.object({
    before: z.object({ passed: z.number().int(), total: z.number().int() }).nullable(),
    after: z.object({ passed: z.number().int(), total: z.number().int() }).nullable(),
    covers: z.string(),
  }),
  findings: z.array(finding),
  notTested: z.array(z.string()),
  limits: z.array(z.string()),
})

export type SiteEvidence = z.infer<typeof evidenceSchema>
export type EvidenceCheck = z.infer<typeof check>
export type EvidenceFinding = z.infer<typeof finding>

// Parsed at build time: a malformed evidence file fails the build instead of reaching the page.
export const siteEvidence: SiteEvidence = evidenceSchema.parse(raw)

/** "pass" only when every viewport that was checked passed. */
export function combined(result: EvidenceCheck["after"]) {
  if (!result) return null
  const values = [result.desktop, result.phone].filter((value) => value !== null)
  if (!values.length) return null
  return values.every((value) => value === "pass") ? "pass" : "fail"
}

export function formatSeconds(ms: number) {
  return `${(ms / 1000).toFixed(1)} s`
}

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
}
