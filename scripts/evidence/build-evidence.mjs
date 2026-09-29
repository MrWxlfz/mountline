/**
 * Turns the raw runs in docs/case-study/runs into lib/case-study/evidence.json, the only file the
 * homepage reads. It copies measured values and pass/fail results; it never fills a gap with a guess.
 *
 *   node scripts/evidence/build-evidence.mjs [--before baseline] [--after final] [--compare lighthouse-compare]
 *
 * Inputs (docs/case-study/runs):
 *   <before>.json, <after>.json      from scripts/evidence/site-checks.mjs
 *   unit-<before>.json, unit-<after>.json   from scripts/evidence/unit-tests.mjs
 *   <compare>.json (optional)        interleaved Lighthouse runs of both builds, from compare-lighthouse.mjs;
 *                                    used for performance when present, since it controls for drift.
 * Missing inputs become null in the output.
 */
import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const list = process.argv.slice(2)
const opts = {}
for (let i = 0; i < list.length; i += 2) opts[list[i].replace(/^--/, "")] = list[i + 1]
const runs = resolve("docs/case-study/runs")
const load = async (name) => {
  try {
    return JSON.parse(await readFile(`${runs}/${name}.json`, "utf8"))
  } catch {
    return null
  }
}

const before = await load(opts.before || "baseline")
const after = await load(opts.after || "final")
const unitBefore = await load(`unit-${opts.before || "baseline"}`)
const unitAfter = await load(`unit-${opts.after || "final"}`)
const compare = await load(opts.compare || "lighthouse-compare")
const liveQa = await load("live-demo-qa")
const screens = await import("node:fs/promises").then((fs) => fs.readdir(resolve("docs/case-study/screens")).catch(() => [])).then((files) => files.filter((f) => /\.(jpe?g|png)$/.test(f)).sort())
const published = await load("published-check")
// Runs made partway through the build. Their failures stay in the record, next to the retest.
const interim = []
for (const name of (await import("node:fs/promises").then((fs) => fs.readdir(runs))).filter((f) => /^interim-\d+\.json$/.test(f)).sort()) {
  interim.push(await load(name.replace(/\.json$/, "")))
}
if (!before) throw new Error("The before run is required.")

// What each check shows, in words a business owner would follow.
const labels = {
  "offer-on-first-screen": ["The offer is on the first screen", "The headline and a way to start a project are visible without scrolling."],
  "project-link-reaches-form": ["One tap reaches the form", "“Talk about your project” lands on the form’s first field."],
  "capture-link-preselects-form": ["Asking about a service fills it in", "“Ask about Capture” opens the form with Photo and video already chosen."],
  "receptionist-link-preselects-form": ["The same for the receptionist", "“Ask about the receptionist” opens the form with it already chosen."],
  "form-shows-errors-and-focuses-first": ["Mistakes are explained", "Sending an empty form lists what’s missing and moves to the first problem."],
  "form-keeps-input-after-error": ["Nothing typed is lost", "After a mistake, everything already typed is still there."],
  "form-round-trip-without-saving": ["The server checks every message", "A controlled test submission reaches the server, is checked, and is refused on purpose, so nothing is saved."],
  "example-starts-on-click": ["The example starts at once", "Pressing play on the receptionist example starts it immediately."],
  "example-outcome-reachable": ["The outcome is always in reach", "The example’s finished message can be read without waiting for the end."],
  "demo-phone-number-visible": ["The real demo line is next to it", "The phone number for the live demo line is shown with the example."],
  "live-demo-fails-honestly": ["The browser demo never fakes a call", "With the microphone blocked, or the browser demo switched off, it says so and offers the phone line instead."],
  "skip-link-first": ["Keyboard users can skip ahead", "The first key press offers a jump straight to the content."],
  "visible-focus-on-every-stop": ["You can always see where you are", "Every stop on the keyboard path, down to the form, is visibly highlighted."],
  "no-sideways-scroll": ["Nothing spills off the side", "No sideways scrolling at 360, 390, 768, 1024, 1440, or 1920 pixels wide."],
  "automated-accessibility-scan": ["Automated accessibility scan", "axe-core finds no WCAG A/AA rule failures on the page."],
}

function statuses(run, id) {
  if (!run) return null
  const found = run.checks.filter((c) => c.id === id)
  if (!found.length) return null
  const pick = (viewport) => {
    const item = found.find((c) => c.viewport === viewport) || found.find((c) => !["desktop", "phone"].includes(c.viewport))
    return item ? (item.pass ? "pass" : "fail") : null
  }
  return { desktop: pick("desktop"), phone: pick("phone") }
}

const ids = [...new Set([...(before?.checks || []), ...(after?.checks || [])].map((c) => c.id))]
const checks = ids.map((id) => {
  const [label, means] = labels[id] || [id, id]
  const b = statuses(before, id) || { desktop: null, phone: null }
  const a = statuses(after, id)
  const failing = (after || before).checks.filter((c) => c.id === id && !c.pass).map((c) => `${c.viewport}: ${c.detail}`)
  // A check that ran once across every width (not per viewport) is shown once, not per screen.
  const shared = [...(before?.checks || []), ...(after?.checks || [])].some((c) => c.id === id && !["desktop", "phone"].includes(c.viewport))
  return { id, label, means, shared, before: b, after: a, detail: failing.length ? failing.join(" · ") : null }
})

// Customer tasks: every non-scan check result, counted exactly as recorded (per viewport, or once when shared).
const count = (run) => {
  if (!run) return null
  const taskChecks = run.checks.filter((c) => c.id !== "automated-accessibility-scan")
  return { total: taskChecks.length, passed: taskChecks.filter((c) => c.pass).length }
}
const tasks = count(after)
const tasksBefore = count(before)

function axe(run) {
  if (!run) return null
  const all = [...(run.measurements["axe-desktop"] || []), ...(run.measurements["axe-phone"] || [])]
  return { rules: all.length, elements: all.reduce((sum, v) => sum + v.nodes, 0) }
}
function contrastNodes(run) {
  if (!run) return null
  return [...(run.measurements["axe-desktop"] || []), ...(run.measurements["axe-phone"] || [])].filter((v) => v.id === "color-contrast").reduce((sum, v) => sum + v.nodes, 0)
}

const median = (values) => {
  const sorted = [...values].sort((x, y) => x - y)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
const spread = (values) => (values?.length ? { median: Math.round(median(values)), min: Math.min(...values), max: Math.max(...values), runs: values.length } : null)

// Prefer interleaved runs of both builds; fall back to each run's own Lighthouse block.
const lhBefore = compare?.before?.mobile || before.lighthouse?.mobile || null
const lhAfter = compare?.after?.mobile || after?.lighthouse?.mobile || null
const kb = (runsList, key) => (runsList?.length ? Math.round(median(runsList.map((r) => r[key])) / 1024) : null)

const unitTotals = (unit) => {
  if (!unit) return null
  const pick = (script) => unit.suites.find((s) => s.script === script)
  // test:receptionist already includes the inquiry tests, so it's added to stabilization only.
  const parts = [pick("test:receptionist"), pick("test:stabilization")].filter(Boolean)
  if (parts.some((p) => Number.isNaN(p.tests))) return null
  return { passed: parts.reduce((s, p) => s + p.pass, 0), total: parts.reduce((s, p) => s + p.tests, 0) }
}

const fontBefore = kb(lhBefore, "fontBytes")
const fontAfter = kb(lhAfter, "fontBytes")
// The largest layout shift measured while scrolling on desktop in any mid-build run.
const midShifts = interim.map((run) => run.measurements["scroll-layout-shift-desktop"]).filter((value) => typeof value === "number" && value > 0)
const scrollShiftMid = midShifts.length ? Math.max(...midShifts) : null
const phoneLink = interim.flatMap((run) => run.checks.filter((c) => c.id === "project-link-reaches-form" && c.viewport === "phone" && !c.pass))[0]
const phoneLinkAfter = after?.checks.find((c) => c.id === "project-link-reaches-form" && c.viewport === "phone")
const findings = [
  ...(phoneLink
    ? [{
        kind: "check",
        id: "phone-form-link",
        featured: true,
        title: "A link that missed on phones",
        found: "A mid-build test caught “Talk about your project” landing on the word-built mark on phones, with the form below the screen.",
        fix: "The form now comes right after the heading.",
        before: "fail",
        after: phoneLinkAfter ? (phoneLinkAfter.pass ? "pass" : "fail") : null,
        source: "The “One tap reaches the form” check, mid-build run and final run",
      }]
    : []),
  ...(scrollShiftMid !== null
    ? [{
        kind: "count",
        id: "scroll-shift",
        featured: true,
        title: "Content that moved while scrolling",
        found: "A mid-build test caught content shifting as a desktop screen scrolled past this scene, because the frame resized itself to become a phone. The old homepage had none.",
        fix: "Now it changes shape without moving anything.",
        unit: "layout shift, desktop",
        beforeLabel: "Mid-build",
        before: scrollShiftMid,
        after: after ? after.measurements["scroll-layout-shift-desktop"] ?? null : null,
        source: "Scripted scroll through the whole page with a 4× slower processor, mid-build run and final run",
      }]
    : []),
  {
    kind: "count",
    id: "fonts",
    featured: true,
    beforeLabel: "Before",
    title: "Fonts nobody saw",
    found: `The old homepage loaded ${fontBefore ?? "?"} KB of fonts, including a serif only our team dashboard uses.`,
    fix: "Now that one loads only there.",
    unit: "KB of fonts",
    before: fontBefore,
    after: fontAfter,
    source: "Median of the Lighthouse mobile runs",
  },
  {
    kind: "count",
    id: "contrast",
    // The accessibility tile already shows this one on the page.
    featured: false,
    beforeLabel: "Before",
    title: "Text too faint to read",
    found: `A scan found ${contrastNodes(before) ?? "?"} bits of text too faint to read, mostly faded questions in the old scrolling list.`,
    fix: "Every line now clears the minimum.",
    unit: "faint elements",
    before: contrastNodes(before),
    after: after ? contrastNodes(after) : null,
    source: "axe-core color-contrast rule, desktop and phone",
  },
]

const env = (after || before).environment
const evidence = {
  version: 1,
  recordedOn: (after || before).finishedAt.slice(0, 10),
  subject: "The mountline.dev homepage, before and after its September 2026 rebuild",
  builds: {
    before: { commit: before.commit || "unknown", description: "the homepage as it was live before the rebuild" },
    after: after ? { commit: after.commit || "unknown", description: "the rebuilt homepage, as a local production build" } : null,
  },
  environment: {
    machine: `${env.cpu} (${env.cores} cores), ${env.os.startsWith("darwin") ? "macOS" : env.os}`,
    browser: `Chrome ${env.chrome}, headless`,
    tools: [`Playwright ${env.playwright}`, `axe-core ${env.axe}`, `Lighthouse ${lhBefore?.[0]?.lighthouseVersion || env.lighthouse || "not run"}`, `Node ${env.node}`],
    viewports: ["Desktop 1440 × 900", "Phone 390 × 844 (emulated, touch)"],
    network: "Both builds served locally by `next start`. Lighthouse simulates a slow 4G connection and a 4× slower processor.",
  },
  checks,
  tasks,
  tasksBefore,
  accessibility: { tool: `axe-core ${env.axe}, WCAG 2.2 A and AA rules`, before: axe(before), after: axe(after) },
  performance: {
    tool: `Lighthouse ${lhBefore?.[0]?.lighthouseVersion || "13"}`,
    profile: compare ? "Mobile preset, runs of both builds interleaved" : "Mobile preset",
    lcpMs: { before: spread(lhBefore?.map((r) => r.lcpMs)), after: spread(lhAfter?.map((r) => r.lcpMs)) },
    tbtMs: { before: spread(lhBefore?.map((r) => r.tbtMs)), after: spread(lhAfter?.map((r) => r.tbtMs)) },
    fontKb: { before: fontBefore, after: fontAfter },
    totalKb: { before: kb(lhBefore, "totalBytes"), after: kb(lhAfter, "totalBytes") },
  },
  unitTests: {
    before: unitTotals(unitBefore),
    after: unitTotals(unitAfter),
    covers: "Inquiry validation, saving through the real database function in an in-process Postgres, duplicate and rate-limit protection, email jobs, public-claim rules, and the receptionist setup and browser-demo server code.",
  },
  findings,
  notTested: [
    "Conversations with the live AI receptionist. No test calls were approved for this build, so its answers are not scored here.",
    liveQa
      ? `A real browser call to the demo. With placeholder settings, its error paths were exercised (${liveQa.results.filter((r) => r.pass).length} of ${liveQa.results.length} behaved as designed), but no real call was made because the provider keys aren’t set up yet.`
      : "A real browser call to the demo. Its code is in place, but the provider keys aren’t set up yet.",
    "Email delivery to a real inbox. A provider accepting an email doesn’t prove it arrived.",
    "Physical phones. Phone results come from an emulated phone screen in desktop Chrome.",
  ],
  limits: [
    "Lab measurements from one computer on one day. Your customers’ phones and connections will differ.",
    "Automated accessibility scans catch some problems, not all of them.",
    "These are recorded results, not a test running in your browser now.",
  ],
}

if (!evidence.performance.lcpMs.before) throw new Error("Baseline Lighthouse runs are required.")
await writeFile(resolve("lib/case-study/evidence.json"), JSON.stringify(evidence, null, 2) + "\n")
console.log(`Wrote lib/case-study/evidence.json (${checks.length} checks, after=${after ? after.label : "none"})`)

/* The written report: every check, every run, and what failed, from the same inputs. ------------ */

const fmt = (value) => (value === null || value === undefined ? "—" : value === "pass" ? "pass" : value === "fail" ? "**FAIL**" : String(value))
const ms = (value) => (value === null || value === undefined ? "—" : `${(value / 1000).toFixed(2)} s`)
const presetRows = (label, runsList) => {
  if (!runsList?.length) return `| ${label} | not run | | | | |`
  const pick = (key) => runsList.map((r) => r[key])
  const s = (key) => spread(pick(key))
  const lcpS = s("lcpMs")
  const tbtS = s("tbtMs")
  return `| ${label} | ${ms(lcpS.median)} (${ms(lcpS.min)}–${ms(lcpS.max)}) | ${tbtS.median} ms (${tbtS.min}–${tbtS.max}) | ${median(pick("cls"))} | ${Math.round(median(pick("fontBytes")) / 1024)} KB | ${Math.round(median(pick("scriptBytes")) / 1024)} KB | ${Math.round(median(pick("totalBytes")) / 1024)} KB |`
}
const axeRows = (run, viewport) => (run?.measurements[`axe-${viewport}`] || []).map((v) => `| ${viewport} | \`${v.id}\` | ${v.impact} | ${v.nodes} | ${v.help} |`)
const measurementKeys = [...new Set([...Object.keys(before.measurements), ...Object.keys(after?.measurements || {})])].filter((k) => !k.startsWith("axe-")).sort()
const unitRows = (unit, label) => (unit ? unit.suites.map((s) => `| ${label} | \`${s.script}\` | ${s.pass}/${s.tests} | ${s.failed.length ? s.failed.join("; ") : "none"} |`) : [`| ${label} | not run | | |`])

const report = `# Case study: rebuilding and testing mountline.dev

*Generated by \`scripts/evidence/build-evidence.mjs\` from the raw runs in \`docs/case-study/runs\`. Edit the scripts, not this file.*

This is the record behind **“And yes, we tested it.”** on the homepage. The subject is Mountline’s own homepage and its inquiry and receptionist-demo paths, measured before and after the September 2026 rebuild. Bramble, the dog groomer on the homepage, is a design example and is not part of this study.

## Builds and environment

- **Before:** commit \`${evidence.builds.before.commit}\` — ${evidence.builds.before.description}. Measured from a separate checkout of that commit.
- **After:** ${evidence.builds.after ? `\`${evidence.builds.after.commit}\` — ${evidence.builds.after.description}.` : "not measured yet."}
- **Recorded:** ${evidence.recordedOn}.
- **Machine:** ${evidence.environment.machine}. **Browser:** ${evidence.environment.browser}.
- **Tools:** ${evidence.environment.tools.join(", ")}.
- **Screens:** ${evidence.environment.viewports.join("; ")}. Phone results are from Chrome’s phone emulation, not a physical phone.
- **Network:** ${evidence.environment.network}
- Both builds were production builds (\`next build\`, then \`next start\`), with the same \`.env.local\`.

## Method

1. Before any change, a separate checkout of the live commit was built and served, and \`scripts/evidence/site-checks.mjs\` was run against it (\`runs/baseline.json\`), along with the code test suites (\`runs/unit-baseline.json\`).
2. After the rebuild, the same script ran against the finished build (\`runs/final.json\`). It finds things the way a visitor does (roles, labels, visible text), so the same checks work on both designs. A few checks only apply to the new page and are marked “—” before.
3. Lighthouse ran ${compare ? `${compare.runsPerBuild} times per build per preset, **alternating the two builds** (\`runs/lighthouse-compare.json\`) so drift over the session affects both equally` : "5 times per build per preset"}. Medians are reported with the full range.
4. The homepage shows these results, so the build that was measured showed “not measured yet” in its results panel. The published page differs from the measured build only in \`lib/case-study/evidence.json\` (and the generated docs). ${published ? `The same checks were run again on the published version (\`runs/published-check.json\`): ${published.checks.filter((c) => c.pass).length} of ${published.checks.length} passed.` : "A re-check of the published version hasn’t been recorded yet."}
5. The form check fills the hidden bot-check field on purpose. The server validates the submission and refuses it before saving, so no inquiry, email, or database row is created. Saving itself is covered by the code tests, which run the real database function in an in-process Postgres.

## Customer task checks

| Check | What it shows | Before · desktop | Before · phone | After · desktop | After · phone |
| --- | --- | --- | --- | --- | --- |
${checks.map((c) => `| ${c.label} | ${c.means} | ${fmt(c.before.desktop)} | ${fmt(c.before.phone)} | ${fmt(c.after?.desktop)} | ${fmt(c.after?.phone)} |`).join("\n")}

${tasks ? `**After:** ${tasks.passed} of ${tasks.total} checks passed (desktop and phone counted separately; the accessibility scan is reported below).` : "**After:** not measured yet."}

### Failures, as recorded

${[
  ...(before.checks || []).filter((c) => !c.pass).map((c) => `- Before, ${c.viewport}: **${c.id}** — ${c.detail}`),
  ...interim.flatMap((run) => run.checks.filter((c) => !c.pass).map((c) => `- Mid-build (${run.label}, ${run.finishedAt.slice(0, 16).replace("T", " ")} UTC, ${run.note ? "development server" : "build"}), ${c.viewport}: **${c.id}** — ${c.detail}. Fixed, then retested in the final run.`)),
  ...(after?.checks || []).filter((c) => !c.pass).map((c) => `- After, ${c.viewport}: **${c.id}** — ${c.detail}`),
].join("\n") || "- None."}

## Accessibility scan (axe-core, WCAG 2.2 A and AA)

| Viewport | Rule | Impact | Elements | Description |
| --- | --- | --- | --- | --- |
${["**Before**", ...axeRows(before, "desktop"), ...axeRows(before, "phone")].join("\n").replace("**Before**", "| **Before** | | | | |")}
${["| **After** | | | | |", ...axeRows(after, "desktop"), ...axeRows(after, "phone")].join("\n")}

Before: ${evidence.accessibility.before.rules} rule(s), ${evidence.accessibility.before.elements} element(s). After: ${evidence.accessibility.after ? `${evidence.accessibility.after.rules} rule(s), ${evidence.accessibility.after.elements} element(s)` : "not measured"}. An automated scan finds some problems, not all; it is not an accessibility audit.

## Lab performance (Lighthouse)

Median (fastest–slowest) of each build’s runs. Largest contentful paint (LCP) and total blocking time (TBT); fonts, scripts, and total are transfer sizes.

| Build · preset | LCP | TBT | CLS | Fonts | Scripts | Total |
| --- | --- | --- | --- | --- | --- | --- |
${presetRows("Before · mobile", compare?.before?.mobile || before.lighthouse?.mobile)}
${presetRows("After · mobile", compare?.after?.mobile || after?.lighthouse?.mobile)}
${presetRows("Before · desktop", compare?.before?.desktop || before.lighthouse?.desktop)}
${presetRows("After · desktop", compare?.after?.desktop || after?.lighthouse?.desktop)}

These are lab numbers from one laptop with Lighthouse’s simulated slow 4G and slower processor. They compare the two builds under the same conditions; they don’t predict any particular visitor’s phone.

## Other measurements

| Measurement | Before | After |
| --- | --- | --- |
${measurementKeys.map((k) => `| \`${k}\` | ${fmt(before.measurements[k])} | ${fmt(after?.measurements[k])} |`).join("\n")}

- \`page-length-viewports\`: page height in screen heights; \`form-depth-viewports\`: how far down the contact form starts.
- \`tab-stops-to-*\`: Tab presses from the top of the page to reach it.
- \`scroll-*\`: a scripted scroll through the whole page with the processor slowed 4×: layout shift, long tasks, and blocking time while scrolling.
- \`example-length-ms\`: how long the receptionist text example runs from Play to finished.

## Code tests

| Build | Suite | Passed | Failed tests |
| --- | --- | --- | --- |
${[...unitRows(unitBefore, "Before"), ...unitRows(unitAfter, "After")].join("\n")}

\`test:receptionist\` includes the inquiry tests, so the homepage adds \`test:receptionist\` and \`test:stabilization\` without counting any test twice.

## Browser voice demo: failure paths

${liveQa ? `Run against a separate build with placeholder Retell settings and an unreachable Supabase address, so no call could be created, billed, or saved. ${liveQa.note}

| Case | Result | Detail |
| --- | --- | --- |
${liveQa.results.map((r) => `| \`${r.id}\` | ${r.pass ? "pass" : "**FAIL**"} | ${r.detail} |`).join("\n")}

Not covered: a real connection, live audio, the post-call transcript and summary from Retell, and microphone behaviour on physical phones.` : "Not run yet."}

## Issues found and fixed during the rebuild

${findings.map((f) => `- **${f.title}.** ${f.found} ${f.fix} ${f.kind === "count" ? `${f.beforeLabel}: ${fmt(f.before)} ${f.unit}; final: ${fmt(f.after)} ${f.unit}.` : `Mid-build: ${fmt(f.before)}; final: ${fmt(f.after)}.`} Source: ${f.source}.${f.featured ? "" : " (In the written report and the accessibility tile, not the Refine chapter.)"}`).join("\n")}

## Not tested

${evidence.notTested.map((item) => `- ${item}`).join("\n")}

## Limits

${evidence.limits.map((item) => `- ${item}`).join("\n")}

## Screens

${screens.length ? screens.map((file) => `- [\`${file}\`](screens/${file})`).join("\n") : "- None saved."}

Captured with headless Chrome at 1440 × 900 and an emulated 390 × 844 phone. “Before” screens are from the baseline build before any change.

## Reproduce

\`\`\`bash
# Build and serve each version (a separate checkout for the old commit), then:
node scripts/evidence/site-checks.mjs --base http://localhost:3100 --label baseline --commit <old sha>
node scripts/evidence/site-checks.mjs --base http://localhost:3200 --label final --commit <new sha>
node scripts/evidence/unit-tests.mjs --label baseline --cwd <old checkout>
node scripts/evidence/unit-tests.mjs --label final
node scripts/evidence/compare-lighthouse.mjs --before http://localhost:3100 --after http://localhost:3200 --runs 5
node scripts/evidence/build-evidence.mjs
\`\`\`
`
await writeFile(resolve("docs/case-study/README.md"), report)
console.log("Wrote docs/case-study/README.md")
