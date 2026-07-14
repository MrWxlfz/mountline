import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const ai = readFileSync(join(root, "lib/signal/ai.ts"), "utf8")
const leadRuns = readFileSync(join(root, "lib/signal/lead-runs.ts"), "utf8")
const deepDive = readFileSync(join(root, "app/api/signal/prospects/[prospectId]/deep-dive/route.ts"), "utf8")

function assertThreePassOrder(source: string, label: string) {
  const diagnosis = source.indexOf("runSignalLeadDealDiagnosisAi(salesContext)")
  const strategy = source.indexOf("runSignalLeadSalesStrategyAi({ ...salesContext")
  const scripts = source.indexOf("runSignalLeadScriptsAi({ ...salesContext")
  assert.ok(diagnosis >= 0, `${label}: diagnosis pass is missing`)
  assert.ok(strategy > diagnosis, `${label}: strategy must follow diagnosis`)
  assert.ok(scripts > strategy, `${label}: scripts must follow strategy`)
}

test("both Signal generation paths enforce diagnosis then strategy then scripts", () => {
  assertThreePassOrder(leadRuns, "lead run")
  assertThreePassOrder(deepDive, "prospect deep dive")
})

test("script generation receives approved layers and a bounded quality retry", () => {
  assert.match(ai, /diagnosis:\s*SignalLeadDealDiagnosisOutput/)
  assert.match(ai, /strategy:\s*SignalLeadSalesStrategyOutput/)
  assert.match(ai, /qualityCritique\?:\s*string/)
  assert.match(leadRuns, /qualityCritique:\s*selectedPack\.issues\.slice\(0, 8\)/)
  assert.match(deepDive, /qualityCritique:\s*grounding\.issues\.slice\(0, 8\)/)
  assert.match(leadRuns, /qualityRetryCount\s*=\s*1/)
  assert.match(deepDive, /retryCount\s*=\s*1/)
})

test("sales persistence records version, score, retry, and fallback metadata", () => {
  for (const field of [
    "prompt_version",
    "strategy_version",
    "quality_score",
    "retry_count",
    "fallback_status",
    "generation_metadata",
  ]) {
    assert.match(deepDive, new RegExp(`${field}:`), field)
  }
  assert.match(leadRuns, /SIGNAL_SALES_PROMPT_VERSION/)
  assert.match(leadRuns, /SIGNAL_SALES_STRATEGY_VERSION/)
})

test("private observations stay outside the verified public fact ledger", () => {
  const publicFactsStart = deepDive.indexOf("const publicFacts =")
  const salesContextStart = deepDive.indexOf("const salesContext =", publicFactsStart)
  const publicFactsBlock = deepDive.slice(publicFactsStart, salesContextStart)
  assert.doesNotMatch(publicFactsBlock, /verifiedObservations/)
  assert.match(deepDive.slice(salesContextStart), /observations:\s*verifiedObservations\.map/)

  assert.match(leadRuns, /Private observations inform diagnosis and discovery, but never enter the/)
  assert.match(leadRuns, /observations:\s*\(storedObservations \|\| \[\]\)\.map/)
})

test("the sales prompt requires ethical objection loops and all practical variants", () => {
  for (const token of [
    "acknowledge",
    "clarify",
    "reframe",
    "next_step",
    "loop_limit",
    "more_specific",
    "remove_jargon",
    "higher_confidence",
    "low_pressure",
    "phone",
    "walk_in",
    "text",
    "email",
  ]) {
    assert.match(ai, new RegExp(token), token)
  }
})
