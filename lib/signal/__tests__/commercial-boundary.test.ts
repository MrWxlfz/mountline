import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import test from "node:test"
import ts from "typescript"

const root = process.cwd()
const require = createRequire(import.meta.url)
const prospectId = "11111111-1111-4111-8111-111111111111"
const projectId = "22222222-2222-4222-8222-222222222222"

type Operation = {
  table: string
  method: "select" | "insert" | "update"
  values?: unknown
}
type DatabaseResult = { data: unknown; error: null }
type RouteHandler = (request: Request, context: { params: Promise<{ prospectId: string }> }) => Promise<Response>

// Execute the real route and validation code, substituting only external
// services. No Clerk session, database credentials, or production writes occur.
function routeHarness(path: string, respond: (operation: Operation) => unknown) {
  const mutations: Operation[] = []
  const supabase = {
    from(table: string) {
      const operation: Operation = { table, method: "select" }
      const result = async (): Promise<DatabaseResult> => {
        if (operation.method !== "select") mutations.push({ ...operation })
        return { data: respond(operation), error: null }
      }
      const query = {
        select() { return query },
        eq() { return query },
        in() { return query },
        order() { return query },
        insert(values: unknown) { operation.method = "insert"; operation.values = values; return query },
        update(values: unknown) { operation.method = "update"; operation.values = values; return query },
        single: result,
        maybeSingle: result,
        then(onfulfilled: (value: DatabaseResult) => unknown) { return result().then(onfulfilled) },
      }
      return query
    },
  }
  const mocks: Record<string, unknown> = {
    "next/server": { NextResponse: { json: Response.json } },
    "@/lib/auth/team": { requireNorthlineTeamMemberApi: async () => ({ response: null, access: { userId: "user_team" } }) },
    "@/lib/supabase/admin": { createAdminClient: () => supabase },
    "@/lib/signal/alerts": { isSignalProspectSuppressed: async () => false },
    "@/lib/signal/classification": { syncSignalProspectAliases: async () => {}, storeManualClassificationAlias: async () => {} },
    "@/lib/signal/research": {
      normalizeSignalBusinessName: (value: string) => value.toLowerCase(),
      normalizeSignalHostname: (value: string) => value,
      normalizeSignalPhone: (value: string) => value,
    },
    "@/lib/signal/artifacts": { buildSignalCopilotInputFromProspect: () => ({}) },
    "@/lib/signal/copilot": { buildSignalCopilotState: () => ({ next_action: { exact_instruction: "Review scope" } }) },
  }
  const cache = new Map<string, Record<string, unknown>>()
  function load(file: string): Record<string, unknown> {
    const cached = cache.get(file)
    if (cached) return cached
    const loaded = { exports: {} as Record<string, unknown> }
    cache.set(file, loaded.exports)
    const compiled = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
      fileName: file,
    })
    const localRequire = (specifier: string): unknown => {
      if (specifier in mocks) return mocks[specifier]
      if (specifier.startsWith("@/") || specifier.startsWith(".")) {
        const target = specifier.startsWith("@/") ? join(root, specifier.slice(2)) : resolve(dirname(file), specifier)
        return load(target.endsWith(".ts") ? target : `${target}.ts`)
      }
      return require(specifier)
    }
    new Function("require", "module", "exports", compiled.outputText)(localRequire, loaded, loaded.exports)
    return loaded.exports
  }
  return { route: load(join(root, path)) as Record<string, RouteHandler>, mutations }
}

const context = { params: Promise.resolve({ prospectId }) }
const request = (body: unknown, method = "POST") => new Request("http://localhost/api/signal", {
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
})
const newProspect = { business_name: "Example HVAC", industry: "hvac", outreach_status: "won" }

test("new prospects cannot claim Won through generic creation or JSON import", async () => {
  for (const [path, body] of [
    ["app/api/signal/prospects/route.ts", newProspect],
    ["app/api/signal/import/route.ts", { prospects: [newProspect] }],
  ] as const) {
    const harness = routeHarness(path, () => ({ id: prospectId }))
    const response = await harness.route.POST(request(body), context)
    assert.equal(response.status, 400, path)
    assert.match((await response.json()).error, /scope|evidence|Won/i)
    assert.equal(harness.mutations.length, 0, path)
  }
})

test("ordinary prospect creation and JSON import still save their recorded status", async () => {
  const input = { ...newProspect, outreach_status: "interested" }
  for (const imported of [false, true]) {
    const path = imported ? "app/api/signal/import/route.ts" : "app/api/signal/prospects/route.ts"
    const harness = routeHarness(path, ({ values }) => imported ? values : { id: prospectId, ...values as object })
    const response = await harness.route.POST(request(imported ? { prospects: [input] } : input), context)
    assert.equal(response.status, 200)
    assert.equal(harness.mutations.length, 1)
    const inserted = imported ? (harness.mutations[0].values as Array<Record<string, unknown>>)[0] : harness.mutations[0].values as Record<string, unknown>
    assert.equal(inserted.outreach_status, "interested")
  }
})

test("stored workbook imports reject Won rows before creating or merging prospects", async () => {
  for (const duplicate of [false, true]) {
    const harness = routeHarness("app/api/signal/import/commit/route.ts", ({ table }) => {
      if (table === "signal_import_batches") return {
        id: projectId,
        status: "previewed",
        preview_rows: [{ mapped: newProspect, duplicate_matches: duplicate ? [{ prospect_id: prospectId }] : [] }],
      }
      return { id: prospectId, outreach_status: "researched" }
    })
    const response = await harness.route.POST(request({ batch_id: projectId }), context)
    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.imported_count, 0)
    assert.equal(result.skipped.length, 1)
    assert.match(result.skipped[0].reason, /scope|evidence|Won/i)
    assert.equal(harness.mutations.filter((operation) => operation.table === "signal_prospects").length, 0)
  }
})

test("generic PATCH cannot mark a prospect Won or manufacture scope evidence", async () => {
  const harness = routeHarness("app/api/signal/prospects/[prospectId]/route.ts", () => ({ id: prospectId, outreach_status: "interested" }))
  const response = await harness.route.PATCH(request({
    outreach_status: "won",
    converted_project_id: projectId,
    sale_confirmed_at: new Date().toISOString(),
    sale_confirmed_by: "user_team",
    sale_evidence_reference: "untrusted payload",
  }, "PATCH"), context)
  assert.equal(response.status, 409)
  assert.match((await response.json()).error, /scope|evidence|Won/i)
  assert.equal(harness.mutations.length, 0)
})

test("normal edits preserve an already-Won prospect without resubmitting the sale", async () => {
  for (const echoedStatus of [false, true]) {
    const existing = { id: prospectId, business_name: "Example HVAC", industry: "hvac", outreach_status: "won", human_notes: "old notes" }
    const harness = routeHarness("app/api/signal/prospects/[prospectId]/route.ts", ({ table, values }) => {
      if (table === "signal_prospects") return { ...existing, ...(values as Record<string, unknown> || {}) }
      return null
    })
    const response = await harness.route.PATCH(request({
      human_notes: "New onboarding note",
      ...(echoedStatus ? { outreach_status: "won" } : {}),
      sale_evidence_reference: "must not be written",
      converted_project_id: "must not be written",
    }, "PATCH"), context)
    assert.equal(response.status, 200)
    const mutation = harness.mutations.find((operation) => operation.table === "signal_prospects")
    assert.ok(mutation)
    const values = mutation.values as Record<string, unknown>
    assert.equal(values.human_notes, "New onboarding note")
    assert.equal("sale_evidence_reference" in values, false)
    assert.equal("converted_project_id" in values, false)
    assert.equal((await response.json()).prospect.outreach_status, "won")
  }
})

test("the pipeline route still requires persisted scope acceptance and permits a confirmed sale", async () => {
  for (const confirmed of [false, true]) {
    const existing = { id: prospectId, pipeline_stage: "proposal", outreach_status: "proposal_sent", converted_project_id: projectId }
    const harness = routeHarness("app/api/signal/prospects/[prospectId]/pipeline/route.ts", ({ table, values }) => {
      if (table === "signal_prospects") return { ...existing, ...(values as Record<string, unknown> || {}) }
      if (table === "projects") return confirmed ? {
        id: projectId, sale_confirmed_at: "2026-09-20T12:00:00.000Z", sale_confirmed_by: "user_team", sale_evidence_reference: "Accepted proposal #123",
      } : { id: projectId }
      return []
    })
    const response = await harness.route.PATCH(request({ pipeline_stage: "won" }, "PATCH"), context)
    assert.equal(response.status, confirmed ? 200 : 409)
    const changes = harness.mutations.filter((operation) => operation.table === "signal_prospects")
    if (confirmed) assert.equal((changes[0].values as Record<string, unknown>).outreach_status, "won")
    else assert.equal(changes.length, 0)
  }
})
