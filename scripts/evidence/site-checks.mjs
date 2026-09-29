/**
 * Mountline site checks: the evidence behind the "we tested it" case study.
 *
 * Runs the same customer tasks, accessibility scan, scroll measurements, and (optionally) Lighthouse
 * lab runs against any running production build, and writes one JSON file of raw results. Nothing
 * here writes to a database or sends email: the form check uses the hidden bot-check field, so the
 * server validates the submission and then refuses it before anything is saved.
 *
 *   node scripts/evidence/site-checks.mjs --base http://localhost:3100 --label baseline --commit 52092aa
 *   node scripts/evidence/site-checks.mjs --base http://localhost:3200 --label final --commit <sha> --lighthouse 5
 *
 * Options
 *   --base         URL of a running `next start` build (required)
 *   --label        name for this run, used in the output file name (required)
 *   --commit       git commit the build was made from (recorded, not verified)
 *   --out          output directory (default docs/case-study/runs)
 *   --lighthouse   Lighthouse runs per preset, 0 to skip (default 0). Uses LIGHTHOUSE_BIN or npx lighthouse@13.5.0.
 *   --chrome       Chrome executable (default: CHROME_PATH or the macOS Google Chrome path)
 *
 * The selectors are written against what a visitor sees (roles, labels, visible text), so the same
 * script can check the site before and after a redesign.
 */

import { execFile } from "node:child_process"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { cpus, platform, release, tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { promisify } from "node:util"
import { createRequire } from "node:module"
import { chromium } from "playwright-core"

const run = promisify(execFile)
const require = createRequire(import.meta.url)

function args() {
  const out = {}
  const list = process.argv.slice(2)
  for (let i = 0; i < list.length; i += 2) out[list[i].replace(/^--/, "")] = list[i + 1]
  return out
}

const opts = args()
if (!opts.base || !opts.label) {
  console.error("Usage: node scripts/evidence/site-checks.mjs --base <url> --label <name> [--commit <sha>] [--lighthouse 5]")
  process.exit(1)
}
const BASE = opts.base.replace(/\/$/, "")
const CHROME = opts.chrome || process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const OUT = resolve(opts.out || "docs/case-study/runs")
const LH_RUNS = Number(opts.lighthouse || 0)

const DESKTOP = { name: "desktop", width: 1440, height: 900, mobile: false }
const PHONE = { name: "phone", width: 390, height: 844, mobile: true }
const PROMISE = /A better website for the business you.ve built/i
const DEMO_TEL = "tel:+18176326909"

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const checks = []
const measurements = {}

async function open(size, extra = {}) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: size.mobile ? 2 : 1,
    isMobile: size.mobile,
    hasTouch: size.mobile,
    ...extra,
  })
  const page = await context.newPage()
  await page.goto(BASE + "/", { waitUntil: "load" })
  await page.waitForTimeout(1200)
  return { context, page }
}

function record(id, viewport, pass, detail) {
  checks.push({ id, viewport, pass: Boolean(pass), detail })
  console.log(`${pass ? "PASS" : "FAIL"} ${id} [${viewport}] ${detail}`)
}

async function attempt(id, viewport, fn) {
  try {
    await fn()
  } catch (error) {
    record(id, viewport, false, `error: ${String(error?.message || error).split("\n")[0]}`)
  }
}

async function inView(page, locator) {
  const box = await locator.boundingBox()
  const vh = page.viewportSize().height
  return Boolean(box && box.height > 0 && box.y >= -1 && box.y + Math.min(box.height, 48) <= vh + 1)
}

async function firstVisible(locator) {
  const count = await locator.count()
  for (let i = 0; i < count; i++) {
    const item = locator.nth(i)
    if (await item.isVisible()) return item
  }
  return null
}

/* Customer tasks ---------------------------------------------------------------- */

async function offerFirstScreen(size) {
  const { context, page } = await open(size)
  const h1 = page.locator("h1").first()
  const text = (await h1.innerText()).replace(/\s+/g, " ").trim()
  const h1Visible = await inView(page, h1)
  const ctas = page.getByRole("link", { name: /talk about your project/i })
  let ctaInView = false
  for (let i = 0; i < (await ctas.count()); i++) {
    if ((await ctas.nth(i).isVisible()) && (await inView(page, ctas.nth(i)))) ctaInView = true
  }
  record("offer-on-first-screen", size.name, PROMISE.test(text) && h1Visible && ctaInView, `h1="${text}", headline in view=${h1Visible}, project link in view=${ctaInView}`)
  await context.close()
}

async function ctaReachesForm(size) {
  const { context, page } = await open(size)
  const link = await firstVisible(page.locator("main").getByRole("link", { name: /talk about your project/i }))
  if (!link) throw new Error("no visible project link in main")
  await link.click()
  await page.waitForTimeout(1600)
  const field = page.getByLabel("Your name", { exact: true }).first()
  record("project-link-reaches-form", size.name, await inView(page, field), `"Your name" field in view after one click`)
  await context.close()
}

async function preselect(size, id, name, checkbox) {
  const { context, page } = await open(size)
  const link = await firstVisible(page.getByRole("link", { name }))
  if (!link) throw new Error(`no visible link ${name}`)
  await link.scrollIntoViewIfNeeded()
  await link.click()
  await page.waitForTimeout(1600)
  const box = page.getByRole("checkbox", { name: checkbox }).first()
  const checked = await box.isChecked()
  record(id, size.name, checked, `${name} → ${checkbox} checked=${checked}`)
  await context.close()
}

async function formValidation(size) {
  const { context, page } = await open(size)
  const send = page.getByRole("button", { name: /send message/i }).first()
  await send.scrollIntoViewIfNeeded()
  await send.click()
  await page.waitForTimeout(400)
  const invalid = await page.locator('form [aria-invalid="true"]').count()
  const focusedName = await page.evaluate(() => document.activeElement?.getAttribute("name"))
  const alert = await page.getByRole("alert").filter({ hasText: /check the highlighted/i }).count()
  record("form-shows-errors-and-focuses-first", size.name, invalid >= 4 && focusedName === "name" && alert > 0, `${invalid} invalid fields, focus on "${focusedName}", summary alert=${alert > 0}`)

  await page.getByLabel("Your name", { exact: true }).fill("Test Visitor")
  await page.getByLabel("Email", { exact: true }).fill("not-an-email")
  await send.click()
  await page.waitForTimeout(400)
  const kept = await page.getByLabel("Your name", { exact: true }).inputValue()
  const emailInvalid = await page.getByLabel("Email", { exact: true }).getAttribute("aria-invalid")
  record("form-keeps-input-after-error", size.name, kept === "Test Visitor" && emailInvalid === "true", `name kept="${kept}", email invalid=${emailInvalid}`)
  await context.close()
}

async function formServerRoundTrip(size) {
  const { context, page } = await open(size)
  const form = page.locator("form").filter({ has: page.getByRole("button", { name: /send message/i }) }).first()
  await form.scrollIntoViewIfNeeded()
  await page.getByLabel("Your name", { exact: true }).fill("Evidence Check")
  await page.getByLabel("Business name", { exact: true }).fill("Controlled test, not a lead")
  await page.getByLabel("Email", { exact: true }).fill("evidence-check@example.invalid")
  await page.getByRole("checkbox", { name: /^website$/i }).check()
  await form.locator("textarea").fill("Controlled test submission from the Mountline site checks. The bot-check field is filled, so the server refuses it.")
  // The hidden bot-check field. The server validates everything, then refuses before saving.
  await form.locator('input[name="website_confirmation"]').evaluate((input) => { input.value = "controlled-check" })
  await page.waitForTimeout(1700)
  const started = Date.now()
  await page.getByRole("button", { name: /send message/i }).click()
  const refused = page.getByRole("alert").filter({ hasText: /didn.t go through/i })
  await refused.waitFor({ timeout: 15000 })
  const ms = Date.now() - started
  const falseSuccess = await page.getByText(/reached Mountline|already have this one/i).count()
  record("form-round-trip-without-saving", size.name, falseSuccess === 0, `server answered in ${ms} ms with the refusal message; success shown=${falseSuccess > 0}`)
  await context.close()
}

async function demoControls(size) {
  const { context, page } = await open(size)
  const section = page.locator("#receptionist")
  const button = await firstVisible(section.getByRole("button", { name: /play the example|play example/i }))
  if (!button) throw new Error("no example play button in #receptionist")
  await button.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const before = await button.innerText()
  const t0 = Date.now()
  await button.click()
  // The same control changes to a pause/stop control.
  const control = section.getByRole("button", { name: /pause|stop|skip/i }).first()
  await control.waitFor({ timeout: 1000 })
  const respondMs = Date.now() - t0
  const summary = await firstVisible(section.getByText(/call back|call dana|next step/i))
  const summaryVisible = Boolean(summary)
  record("example-starts-on-click", size.name, respondMs <= 1000, `"${before.trim()}" → pause control in ${respondMs} ms`)
  // How long the example runs until it reports that it has finished.
  const done = section.locator('[role="status"]').filter({ hasText: /finished|message is ready|request is ready/i })
  await done.waitFor({ timeout: 45000, state: "attached" })
  measurements[`example-length-ms-${size.name}`] = Date.now() - t0
  record("example-outcome-reachable", size.name, summaryVisible, `request summary text present while playing=${summaryVisible}`)
  const tel = await firstVisible(section.locator(`a[href="${DEMO_TEL}"]`))
  record("demo-phone-number-visible", size.name, Boolean(tel), `tel link to the demo line visible=${Boolean(tel)}`)
  await context.close()
}

/** The browser voice demo never pretends: refused microphone → a clear message and no call; switched off → says so. */
async function liveDemoHonesty(size) {
  const { context, page } = await open(size)
  let requests = 0
  page.on("request", (request) => {
    if (request.url().includes("/api/receptionist/demo-call")) requests++
  })
  const section = page.locator("#receptionist")
  const talk = await firstVisible(section.getByRole("button", { name: /talk to the demo/i }))
  if (!talk) {
    const off = await section.getByText(/isn.t switched on yet/i).count()
    const tel = await firstVisible(section.locator(`.cc a[href="${DEMO_TEL}"]`))
    // A page without the console at all (the old homepage) has nothing to check here.
    if (!(await section.locator(".cc").count())) return context.close()
    record("live-demo-fails-honestly", size.name, off > 0 && Boolean(tel), `browser demo switched off: says so=${off > 0}, phone line is the main action=${Boolean(tel)}, call requests=${requests}`)
    return context.close()
  }
  // No microphone permission is granted in this browser, so the request is refused.
  await talk.scrollIntoViewIfNeeded()
  await talk.click()
  const message = section.getByText(/blocked the microphone|couldn.t find a microphone|can.t make calls|microphone didn.t start/i).first()
  await message.waitFor({ timeout: 8000 })
  const tel = await firstVisible(section.locator(`.cc a[href="${DEMO_TEL}"]`))
  record("live-demo-fails-honestly", size.name, requests === 0 && Boolean(tel), `microphone refused: message shown, phone line offered=${Boolean(tel)}, call requests sent=${requests}`)
  await context.close()
}

/* Keyboard ------------------------------------------------------------------------ */

async function keyboard(size) {
  const { context, page } = await open(size)
  const stops = []
  for (let i = 0; i < 90; i++) {
    await page.keyboard.press("Tab")
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const path = []
      let node = el
      while (node && node.nodeType === 1 && node !== document.documentElement) {
        const parent = node.parentElement
        const index = parent ? Array.from(parent.children).filter((c) => c.tagName === node.tagName).indexOf(node) + 1 : 1
        path.unshift(`${node.tagName.toLowerCase()}:nth-of-type(${index})`)
        node = parent
      }
      const s = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return {
        path: path.join(" > "),
        name: (el.getAttribute("aria-label") || el.labels?.[0]?.innerText || el.innerText || el.getAttribute("name") || el.tagName).replace(/\s+/g, " ").trim().slice(0, 48),
        style: { outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, shadow: s.boxShadow, border: s.borderColor, bg: s.backgroundColor },
        outlined: s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0,
        visible: r.width > 0 && r.height > 0,
      }
    })
    if (!info) continue
    stops.push(info)
    if (/^your name/i.test(info.name)) break
  }
  // Compare each stop's focused look with its resting look.
  await page.reload({ waitUntil: "load" })
  await page.waitForTimeout(800)
  const missing = []
  for (const stop of stops) {
    if (stop.outlined) continue
    const rest = await page.evaluate((path) => {
      const el = document.querySelector(`html > ${path}`)
      if (!el) return null
      const s = getComputedStyle(el)
      return { shadow: s.boxShadow, border: s.borderColor, bg: s.backgroundColor }
    }, stop.path)
    if (!rest || (rest.shadow === stop.style.shadow && rest.border === stop.style.border && rest.bg === stop.style.bg)) missing.push(stop.name)
  }
  const first = stops[0]?.name || ""
  const toProject = stops.findIndex((s) => /talk about your project/i.test(s.name)) + 1
  const toDemo = stops.findIndex((s) => /play the example|talk to the demo|call the demo|817-632-6909/i.test(s.name)) + 1
  const toForm = stops.findIndex((s) => /^your name/i.test(s.name)) + 1
  measurements[`tab-stops-to-project-link-${size.name}`] = toProject || null
  measurements[`tab-stops-to-demo-${size.name}`] = toDemo || null
  measurements[`tab-stops-to-form-${size.name}`] = toForm || null
  record("skip-link-first", size.name, /skip to/i.test(first), `first tab stop="${first}"`)
  record("visible-focus-on-every-stop", size.name, missing.length === 0, `${stops.length} stops checked, ${missing.length} without a visible change${missing.length ? `: ${missing.slice(0, 6).join(" | ")}` : ""}`)
  await context.close()
}

/* Layout ------------------------------------------------------------------------ */

async function scrollThrough(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const vh = page.viewportSize().height
  for (let y = 0; y < height; y += Math.round(vh * 0.6)) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(120)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
}

async function overflow() {
  const widths = [360, 390, 768, 1024, 1440, 1920]
  const offenders = []
  for (const width of widths) {
    const size = { name: `w${width}`, width, height: 800, mobile: width < 768 }
    const { context, page } = await open(size, { reducedMotion: "reduce" })
    await scrollThrough(page)
    const result = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    if (result.scroll > result.client) offenders.push(`${width}px (${result.scroll} > ${result.client})`)
    await context.close()
  }
  record("no-sideways-scroll", widths.join("/"), offenders.length === 0, offenders.length ? `overflow at ${offenders.join(", ")}` : "page width fits at every tested width")
}

async function pageLength(size) {
  const { context, page } = await open(size, { reducedMotion: "reduce" })
  const result = await page.evaluate(() => {
    const form = document.querySelector("#contact") || document.querySelector("form")
    const top = form ? form.getBoundingClientRect().top + window.scrollY : null
    return { height: document.documentElement.scrollHeight, formTop: top }
  })
  measurements[`page-length-viewports-${size.name}`] = round(result.height / size.height, 2)
  measurements[`form-depth-viewports-${size.name}`] = result.formTop === null ? null : round(result.formTop / size.height, 2)
  await context.close()
}

/* Scrolling cost ------------------------------------------------------------------ */

async function scrollCost(size) {
  const { context, page } = await open(size)
  const cdp = await context.newCDPSession(page)
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 })
  await page.evaluate(() => {
    window.__evidence = { shifts: 0, longtasks: [] }
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__evidence.shifts += entry.value
    }).observe({ type: "layout-shift", buffered: false })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__evidence.longtasks.push(entry.duration)
    }).observe({ type: "longtask", buffered: false })
  })
  await page.mouse.move(size.width / 2, size.height / 2)
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const steps = Math.ceil(height / 100)
  const t0 = Date.now()
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, 100)
    await page.waitForTimeout(16)
  }
  await page.waitForTimeout(1200)
  const seconds = (Date.now() - t0) / 1000
  const result = await page.evaluate(() => window.__evidence)
  const blocking = result.longtasks.reduce((sum, d) => sum + Math.max(0, d - 50), 0)
  measurements[`scroll-layout-shift-${size.name}`] = round(result.shifts, 4)
  measurements[`scroll-long-tasks-${size.name}`] = result.longtasks.length
  measurements[`scroll-blocking-ms-${size.name}`] = Math.round(blocking)
  measurements[`scroll-seconds-${size.name}`] = round(seconds, 1)
  await context.close()
}

/* Accessibility --------------------------------------------------------------------- */

async function axeScan(size) {
  const { context, page } = await open(size, { reducedMotion: "reduce" })
  await scrollThrough(page)
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") })
  const result = await page.evaluate(async () => {
    const r = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")) }))
  })
  const nodes = result.reduce((sum, v) => sum + v.nodes, 0)
  measurements[`axe-${size.name}`] = result
  record("automated-accessibility-scan", size.name, result.length === 0, `${result.length} rule(s) failed across ${nodes} element(s)${result.length ? `: ${result.map((v) => `${v.id}×${v.nodes}`).join(", ")}` : ""}`)
  await context.close()
}

/* Lighthouse ------------------------------------------------------------------------ */

async function lighthouse(preset, runs) {
  const results = []
  const dir = join(tmpdir(), `mountline-lh-${process.pid}`)
  await mkdir(dir, { recursive: true })
  const bin = process.env.LIGHTHOUSE_BIN
  for (let i = 0; i < runs; i++) {
    const file = join(dir, `${preset}-${i}.json`)
    const lhArgs = [
      `${BASE}/`,
      "--output=json",
      `--output-path=${file}`,
      "--only-categories=performance",
      `--chrome-path=${CHROME}`,
      "--chrome-flags=--headless=new --no-first-run",
      "--quiet",
      ...(preset === "desktop" ? ["--preset=desktop"] : []),
    ]
    if (bin) await run(bin, lhArgs, { maxBuffer: 1 << 26 })
    else await run("npx", ["--yes", "lighthouse@13.5.0", ...lhArgs], { maxBuffer: 1 << 26 })
    const report = JSON.parse(await readFile(file, "utf8"))
    const a = report.audits
    const bytes = (type) => (a["resource-summary"]?.details?.items || []).find((item) => item.resourceType === type)?.transferSize ?? null
    results.push({
      score: report.categories.performance.score,
      fcpMs: Math.round(a["first-contentful-paint"].numericValue),
      lcpMs: Math.round(a["largest-contentful-paint"].numericValue),
      tbtMs: Math.round(a["total-blocking-time"].numericValue),
      cls: round(a["cumulative-layout-shift"].numericValue, 4),
      speedIndexMs: Math.round(a["speed-index"].numericValue),
      totalBytes: bytes("total"),
      scriptBytes: bytes("script"),
      fontBytes: bytes("font"),
      requests: (a["resource-summary"]?.details?.items || []).find((item) => item.resourceType === "total")?.requestCount ?? null,
      lighthouseVersion: report.lighthouseVersion,
      userAgent: report.environment?.hostUserAgent,
      throttling: report.configSettings.throttlingMethod,
    })
    console.log(`lighthouse ${preset} ${i + 1}/${runs}: LCP ${results.at(-1).lcpMs} ms, TBT ${results.at(-1).tbtMs} ms, CLS ${results.at(-1).cls}`)
  }
  await rm(dir, { recursive: true, force: true })
  return results
}

const round = (value, places) => Math.round(value * 10 ** places) / 10 ** places

/* Run ------------------------------------------------------------------------------- */

const startedAt = new Date().toISOString()
for (const size of [DESKTOP, PHONE]) {
  await attempt("offer-on-first-screen", size.name, () => offerFirstScreen(size))
  await attempt("project-link-reaches-form", size.name, () => ctaReachesForm(size))
  await attempt("capture-link-preselects-form", size.name, () => preselect(size, "capture-link-preselects-form", /ask about capture/i, /photo and video/i))
  await attempt("receptionist-link-preselects-form", size.name, () => preselect(size, "receptionist-link-preselects-form", /ask about the receptionist/i, /ai receptionist/i))
  await attempt("form-shows-errors-and-focuses-first", size.name, () => formValidation(size))
  await attempt("form-round-trip-without-saving", size.name, () => formServerRoundTrip(size))
  await attempt("example-starts-on-click", size.name, () => demoControls(size))
  await attempt("live-demo-fails-honestly", size.name, () => liveDemoHonesty(size))
  await attempt("skip-link-first", size.name, () => keyboard(size))
  await attempt("automated-accessibility-scan", size.name, () => axeScan(size))
  await pageLength(size).catch(() => {})
  await scrollCost(size).catch((error) => console.error("scroll cost failed", error.message))
}
await attempt("no-sideways-scroll", "all", overflow)

const chromeVersion = browser.version()
await browser.close()

const lh = LH_RUNS > 0 ? { mobile: await lighthouse("mobile", LH_RUNS), desktop: await lighthouse("desktop", LH_RUNS) } : null

const output = {
  label: opts.label,
  base: BASE,
  commit: opts.commit || null,
  startedAt,
  finishedAt: new Date().toISOString(),
  environment: {
    os: `${platform()} ${release()}`,
    cpu: cpus()[0]?.model,
    cores: cpus().length,
    node: process.version,
    chrome: chromeVersion,
    playwright: require("playwright-core/package.json").version,
    axe: require("axe-core/package.json").version,
    lighthouse: lh?.mobile?.[0]?.lighthouseVersion || null,
    network: "localhost (next start); Lighthouse applies its own simulated throttling",
  },
  checks,
  measurements,
  lighthouse: lh,
}
await mkdir(OUT, { recursive: true })
const file = join(OUT, `${opts.label}.json`)
await writeFile(file, JSON.stringify(output, null, 2) + "\n")
const passed = checks.filter((c) => c.pass).length
console.log(`\n${passed}/${checks.length} checks passed. Wrote ${file}`)
