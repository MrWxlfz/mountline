/**
 * Exercises the browser voice demo's client states without a real call. Run it against a build made
 * with placeholder Retell settings and an unreachable Supabase URL, so nothing can be created,
 * billed, or saved:
 *
 *   RETELL_API_KEY=placeholder RETELL_DEMO_AGENT_ID=agent_placeholder \
 *   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:9 SUPABASE_SERVICE_ROLE_KEY=placeholder \
 *   CRON_SECRET=placeholder-secret-for-qa next build && next start -p 3300
 *   node scripts/evidence/live-demo-qa.mjs --base http://localhost:3300
 *
 * Provider and server answers are simulated with request interception where noted.
 * Writes docs/case-study/runs/live-demo-qa.json.
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { chromium } from "playwright-core"

const list = process.argv.slice(2)
const opts = {}
for (let i = 0; i < list.length; i += 2) opts[list[i].replace(/^--/, "")] = list[i + 1]
const BASE = (opts.base || "http://localhost:3300").replace(/\/$/, "")
const CHROME = opts.chrome || process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const results = []
const record = (id, pass, detail) => {
  results.push({ id, pass, detail })
  console.log(`${pass ? "PASS" : "FAIL"} ${id}: ${detail}`)
}

async function session({ fakeMic }) {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: fakeMic ? ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] : [],
  })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: fakeMic ? ["microphone"] : [] })
  const page = await context.newPage()
  const calls = { start: 0, end: 0, gateway: 0 }
  page.on("request", (request) => {
    const url = request.url()
    if (url.endsWith("/api/receptionist/demo-call") && request.method() === "POST") calls.start++
    if (/\/api\/receptionist\/demo-call\/[^/]+\/end$/.test(url)) calls.end++
    if (url.includes("retellai.com/webrtc-proxy")) calls.gateway++
  })
  await page.goto(`${BASE}/#demo`, { waitUntil: "load" })
  await page.waitForTimeout(1200)
  const console_ = page.locator(".cc").first()
  const talk = console_.getByRole("button", { name: /talk to the demo/i })
  return { browser, page, calls, console_, talk }
}

const text = (locator) => locator.innerText().then((value) => value.replace(/\s+/g, " ").trim())

/* 1. Microphone refused: a clear message, no call requested. */
{
  const s = await session({ fakeMic: false })
  const visible = await s.talk.isVisible()
  await s.talk.click()
  await s.page.getByText(/blocked the microphone|couldn.t find a microphone|microphone didn.t start/i).first().waitFor({ timeout: 8000 })
  const phase = await s.console_.getAttribute("data-phase")
  record("mic-refused", visible && s.calls.start === 0 && phase === "error", `Talk shown=${visible}; after refusal phase=${phase}; call requests=${s.calls.start}`)
  await s.browser.close()
}

/* 2. Server can't reach its database: the real endpoint answers storage_error; the page says so and offers the phone line. */
{
  const s = await session({ fakeMic: true })
  await s.talk.click()
  const message = s.page.getByText(/went wrong on our side|couldn.t connect the demo|isn.t switched on/i).first()
  await message.waitFor({ timeout: 20000 })
  const tel = await s.console_.locator('a[href="tel:+18176326909"]').count()
  const retry = await s.console_.getByRole("button", { name: /try again/i }).count()
  record("server-error-shown", s.calls.start === 1 && tel > 0, `"${await text(message)}"; requests=${s.calls.start}; phone offered=${tel > 0}; try again offered=${retry > 0}`)
  await s.browser.close()
}

/* 3. Rate limited (simulated server answer): the limit message, and no retry button. */
{
  const s = await session({ fakeMic: true })
  await s.page.route("**/api/receptionist/demo-call", (route) =>
    route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ ok: false, code: "visitor_limit", message: "You’ve tried the browser demo a few times already. Please call the demo line instead, or try again later.", retryAfterSeconds: 1800 }) }),
  )
  await s.talk.click()
  await s.page.getByText(/tried the browser demo a few times/i).first().waitFor({ timeout: 10000 })
  const retry = await s.console_.getByRole("button", { name: /try again/i }).count()
  record("rate-limit-shown", retry === 0, `limit message shown; try again offered=${retry > 0}`)
  await s.browser.close()
}

/* 4. Call created, but the provider refuses the connection (simulated): "didn't connect", never "live". */
{
  const s = await session({ fakeMic: true })
  await s.page.route("**/api/receptionist/demo-call", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, call: { call_id: "call_qa_placeholder", access_token: "placeholder", transport: "gateway" }, viewToken: "placeholder", maxSeconds: 180 }) }),
  )
  await s.page.route("**/webrtc-proxy/**", (route) => route.fulfill({ status: 401, body: "unauthorized" }))
  const seen = new Set()
  const watch = setInterval(async () => {
    try { seen.add(await s.console_.getAttribute("data-phase")) } catch {}
  }, 50)
  await s.talk.click()
  await s.page.getByText(/didn.t connect/i).first().waitFor({ timeout: 15000 })
  clearInterval(watch)
  record("connect-failure-shown", !seen.has("active") && s.calls.gateway > 0, `phases seen: ${[...seen].filter(Boolean).join(" → ")}; gateway attempts=${s.calls.gateway}`)
  await s.browser.close()
}

/* 5. Double click: one request. */
{
  const s = await session({ fakeMic: true })
  await s.page.route("**/api/receptionist/demo-call", async (route) => {
    await new Promise((r) => setTimeout(r, 1500))
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false, code: "storage_error", message: "Something went wrong on our side. Please try again in a moment, or call the demo line." }) })
  })
  await s.talk.dblclick()
  await s.page.waitForTimeout(400)
  await s.console_.getByRole("button", { name: /cancel|waiting/i }).first().click({ trial: true }).catch(() => {})
  await s.page.getByText(/went wrong on our side/i).first().waitFor({ timeout: 10000 })
  record("double-click-one-request", s.calls.start === 1, `requests after a double click=${s.calls.start}`)
  await s.browser.close()
}

/* 6. Cancel while connecting: back to the start; when the server's answer arrives, the call is ended on the server. */
{
  const s = await session({ fakeMic: true })
  await s.page.route("**/api/receptionist/demo-call", async (route) => {
    await new Promise((r) => setTimeout(r, 2500))
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, call: { call_id: "call_qa_cancel", access_token: "placeholder", transport: "gateway" }, viewToken: "placeholder", maxSeconds: 180 }) })
  })
  await s.page.route("**/api/receptionist/demo-call/*/end", (route) => route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }))
  await s.page.route("**/webrtc-proxy/**", (route) => route.fulfill({ status: 401, body: "unauthorized" }))
  await s.talk.click()
  const cancel = s.console_.getByRole("button", { name: /^cancel$/i })
  await cancel.waitFor({ timeout: 8000 })
  await cancel.click()
  await s.page.waitForTimeout(3500)
  const phase = await s.console_.getAttribute("data-phase")
  const talkBack = await s.talk.isVisible()
  record("cancel-while-connecting", phase === "rest" && talkBack && s.calls.end >= 1 && s.calls.gateway === 0, `phase=${phase}; Talk back=${talkBack}; end requests=${s.calls.end}; gateway attempts=${s.calls.gateway}`)
  await s.browser.close()
}

const out = resolve("docs/case-study/runs")
await mkdir(out, { recursive: true })
await writeFile(join(out, "live-demo-qa.json"), JSON.stringify({ recordedAt: new Date().toISOString(), base: BASE, note: "Placeholder Retell settings and an unreachable Supabase URL; no real call was possible. Tests 3–6 simulate server or provider answers.", results }, null, 2) + "\n")
console.log(`${results.filter((r) => r.pass).length}/${results.length} passed`)
