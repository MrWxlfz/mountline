/**
 * Runs the test suites that cover the public inquiry path and the receptionist, and records the counts.
 *
 *   node scripts/evidence/unit-tests.mjs --label final [--cwd path/to/checkout]
 *
 * Writes docs/case-study/runs/unit-<label>.json in the current checkout.
 */
import { execFile } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { promisify } from "node:util"

const run = promisify(execFile)
const list = process.argv.slice(2)
const opts = {}
for (let i = 0; i < list.length; i += 2) opts[list[i].replace(/^--/, "")] = list[i + 1]
if (!opts.label) {
  console.error("Usage: node scripts/evidence/unit-tests.mjs --label <name> [--cwd <checkout>]")
  process.exit(1)
}
const cwd = resolve(opts.cwd || ".")
// test:receptionist also runs the inquiry tests, so the two are recorded separately and not added up.
const suites = [
  { script: "test:inquiries", covers: "Inquiry validation, saving through the database function (in-process Postgres), duplicates, rate limits, and email jobs" },
  { script: "test:stabilization", covers: "Public claims, security boundaries, and commercial state" },
  { script: "test:receptionist", covers: "Receptionist profiles and prompts (plus the inquiry tests again)" },
]

const results = []
for (const suite of suites) {
  let output = ""
  try {
    const { stdout, stderr } = await run("npm", ["run", suite.script], { cwd, maxBuffer: 1 << 26 })
    output = stdout + stderr
  } catch (error) {
    output = `${error.stdout || ""}${error.stderr || ""}`
  }
  const count = (name) => Number(output.match(new RegExp(`^ℹ ${name} (\\d+)`, "m"))?.[1] ?? NaN)
  const failed = [...output.matchAll(/^✖ (.+?) \(\d/gm)].map((match) => match[1]).filter((name, i, all) => all.indexOf(name) === i)
  results.push({ script: suite.script, covers: suite.covers, tests: count("tests"), pass: count("pass"), fail: count("fail"), failed })
  console.log(`${suite.script}: ${count("pass")}/${count("tests")} passed`)
}

const out = resolve("docs/case-study/runs")
await mkdir(out, { recursive: true })
await writeFile(join(out, `unit-${opts.label}.json`), JSON.stringify({ label: opts.label, recordedAt: new Date().toISOString(), cwd: opts.cwd ? "separate checkout" : "this checkout", suites: results }, null, 2) + "\n")
