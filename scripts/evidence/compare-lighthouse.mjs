/**
 * Lighthouse runs of two builds, alternated (before, after, before, after…) so that anything that
 * drifts during the session, like machine load or temperature, affects both builds equally.
 *
 *   node scripts/evidence/compare-lighthouse.mjs --before http://localhost:3100 --after http://localhost:3200 --runs 5
 *
 * Writes docs/case-study/runs/lighthouse-compare.json. Uses LIGHTHOUSE_BIN, or npx lighthouse@13.5.0.
 */
import { execFile } from "node:child_process"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { cpus, platform, release, tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { promisify } from "node:util"

const run = promisify(execFile)
const list = process.argv.slice(2)
const opts = {}
for (let i = 0; i < list.length; i += 2) opts[list[i].replace(/^--/, "")] = list[i + 1]
if (!opts.before || !opts.after) {
  console.error("Usage: node scripts/evidence/compare-lighthouse.mjs --before <url> --after <url> [--runs 5]")
  process.exit(1)
}
const RUNS = Number(opts.runs || 5)
const CHROME = opts.chrome || process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const dir = join(tmpdir(), `mountline-lh-compare-${process.pid}`)
await mkdir(dir, { recursive: true })

async function once(base, preset, file) {
  const args = [
    `${base.replace(/\/$/, "")}/`,
    "--output=json",
    `--output-path=${file}`,
    "--only-categories=performance",
    `--chrome-path=${CHROME}`,
    "--chrome-flags=--headless=new --no-first-run",
    "--quiet",
    ...(preset === "desktop" ? ["--preset=desktop"] : []),
  ]
  if (process.env.LIGHTHOUSE_BIN) await run(process.env.LIGHTHOUSE_BIN, args, { maxBuffer: 1 << 26 })
  else await run("npx", ["--yes", "lighthouse@13.5.0", ...args], { maxBuffer: 1 << 26 })
  const report = JSON.parse(await readFile(file, "utf8"))
  const a = report.audits
  const items = a["resource-summary"]?.details?.items || []
  const bytes = (type) => items.find((item) => item.resourceType === type)?.transferSize ?? null
  return {
    score: report.categories.performance.score,
    fcpMs: Math.round(a["first-contentful-paint"].numericValue),
    lcpMs: Math.round(a["largest-contentful-paint"].numericValue),
    tbtMs: Math.round(a["total-blocking-time"].numericValue),
    cls: Math.round(a["cumulative-layout-shift"].numericValue * 10000) / 10000,
    speedIndexMs: Math.round(a["speed-index"].numericValue),
    totalBytes: bytes("total"),
    scriptBytes: bytes("script"),
    fontBytes: bytes("font"),
    requests: items.find((item) => item.resourceType === "total")?.requestCount ?? null,
    lighthouseVersion: report.lighthouseVersion,
  }
}

const result = { before: { base: opts.before, mobile: [], desktop: [] }, after: { base: opts.after, mobile: [], desktop: [] } }
for (const preset of ["mobile", "desktop"]) {
  for (let i = 0; i < RUNS; i++) {
    // Alternate which build goes first, too.
    const order = i % 2 ? ["after", "before"] : ["before", "after"]
    for (const which of order) {
      const measured = await once(result[which].base, preset, join(dir, `${which}-${preset}-${i}.json`))
      result[which][preset].push(measured)
      console.log(`${preset} ${i + 1}/${RUNS} ${which}: LCP ${measured.lcpMs} ms, TBT ${measured.tbtMs} ms, CLS ${measured.cls}, fonts ${measured.fontBytes} B`)
    }
  }
}
await rm(dir, { recursive: true, force: true })

const out = resolve("docs/case-study/runs")
await mkdir(out, { recursive: true })
await writeFile(
  join(out, "lighthouse-compare.json"),
  JSON.stringify({ recordedAt: new Date().toISOString(), runsPerBuild: RUNS, machine: `${cpus()[0]?.model} (${cpus().length} cores), ${platform()} ${release()}`, ...result }, null, 2) + "\n",
)
console.log("Wrote docs/case-study/runs/lighthouse-compare.json")
