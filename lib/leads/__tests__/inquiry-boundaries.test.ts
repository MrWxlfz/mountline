import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../../", import.meta.url)
const read = (path: string) => readFile(new URL(path, root), "utf8")

function handler(source: string, method: string) {
  return source.split(`export async function ${method}`)[1].split("export async function")[0]
}

test("team email controls authorize before touching inquiry data", async () => {
  const routes = [
    ["app/api/leads/[leadId]/followup/route.ts", "PATCH", "updateFollowup("],
    ["app/api/leads/[leadId]/emails/[jobId]/route.ts", "POST", "actOnEmailJob("],
    ["app/api/leads/email-queue/route.ts", "POST", "runInquiryEmails("],
  ] as const
  for (const [file, method, access] of routes) {
    const body = handler(await read(file), method)
    const guard = body.indexOf("requireNorthlineTeamMemberApi()")
    const deny = body.indexOf("return authCheck.response")
    const use = body.indexOf(access)
    assert.ok(guard >= 0 && deny > guard && use > deny, `${file} must reject unauthorized requests first`)
  }
  const page = await read("app/dashboard/leads/page.tsx")
  assert.ok(page.indexOf("requireNorthlineTeamMember()") < page.indexOf("createAdminClient()"))
})

test("the scheduled worker requires CRON_SECRET, and the webhook requires a valid signature, before any work", async () => {
  const cron = handler(await read("app/api/cron/inquiry-email/route.ts"), "GET")
  assert.ok(cron.indexOf("authorized(request)") < cron.indexOf("runInquiryEmails("))
  assert.match(await read("app/api/cron/inquiry-email/route.ts"), /!secret \|\| secret\.length < 16/)
  const webhook = handler(await read("app/api/webhooks/resend/route.ts"), "POST")
  assert.ok(webhook.indexOf("verifyWebhookSignature(") < webhook.indexOf("JSON.parse("))
  assert.ok(webhook.indexOf("if (!valid") < webhook.indexOf("applyWebhook("))
})

test("the owner address and email secrets stay out of client code", async () => {
  const clientFiles: string[] = []
  async function walk(dir: string) {
    for (const entry of await readdir(new URL(dir, root), { withFileTypes: true })) {
      const path = `${dir}${entry.name}`
      if (entry.isDirectory()) await walk(`${path}/`)
      else if (/\.tsx?$/.test(entry.name)) clientFiles.push(path)
    }
  }
  await walk("components/")
  await walk("app/")
  for (const file of clientFiles) {
    const source = await read(file)
    // The founder's own contact card (/luke) already lists this address publicly; nothing else may.
    if (file !== "app/luke/page.tsx") assert.doesNotMatch(source, /luke\.nordin@icloud\.com/, file)
    if (/^["']use client["']/.test(source)) {
      assert.doesNotMatch(source, /RESEND_API_KEY|RESEND_WEBHOOK_SECRET|CRON_SECRET|INQUIRY_OWNER_EMAIL|SUPABASE_SERVICE_ROLE_KEY/, file)
      assert.doesNotMatch(source, /lib\/leads\/email\/(server|config|provider|worker|webhook)/, file)
    }
  }
  assert.doesNotMatch(await read(".env.example"), /re_[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9+/]{8,}/)
})

test("inquiry persistence stays in a server action and a transaction-backed function", async () => {
  const action = await read("app/actions/submit-inquiry.ts")
  assert.match(action, /^"use server"/)
  assert.match(action, /rpc\("submit_mountline_inquiry"/)
  assert.match(action, /error \|\| !row\?\.outcome/)
  assert.match(action, /after\(/)
})

test("delayed emails use the database queue, not in-memory timers", async () => {
  for (const file of ["lib/leads/email/worker.ts", "lib/leads/email/server.ts", "app/actions/submit-inquiry.ts", "components/project-inquiry-form.tsx"]) {
    assert.doesNotMatch(await read(file), /setTimeout\(|setInterval\(/, file)
  }
  const vercel = JSON.parse(await read("vercel.json"))
  assert.ok(vercel.crons?.some((cron: { path: string }) => cron.path === "/api/cron/inquiry-email"))
})
