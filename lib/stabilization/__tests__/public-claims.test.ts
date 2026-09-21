import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import test from "node:test"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../../../", import.meta.url))
const read = (path: string) => readFile(new URL(path, `file://${root}/`), "utf8")

test("homepage and metadata state the bounded cleaning-inquiry promise", async () => {
  const [homepage, page, layout, openGraph] = await Promise.all([
    read("components/mountline-homepage.tsx"),
    read("app/page.tsx"),
    read("app/layout.tsx"),
    read("app/opengraph-image.tsx"),
  ])
  assert.match(homepage, /Mountline collects cleaning inquiries when your team cannot answer and prepares the details for follow-up/)
  assert.match(homepage, /Your team confirms pricing and scheduling/)
  assert.match(homepage, /external owner handoff and delivery are not yet verified/i)
  assert.match(page, /Cleaning Inquiry Capture Pilot/)
  assert.match(layout, /cleaning inquiries/i)
  assert.match(openGraph, /Cleaning inquiries/)
})

test("simulations are labeled and unsupported completion claims are absent", async () => {
  const homepage = await read("components/mountline-homepage.tsx")
  assert.ok(homepage.split("Not live customer data").length >= 4)
  for (const unsupported of [
    /answers every call/i,
    /books real appointments/i,
    /system state · online/i,
    /transcript live/i,
    /the demo is live/i,
    /sends follow-up automatically/i,
  ]) assert.doesNotMatch(homepage, unsupported)
})

test("public Sentry demos are gone while monitoring remains configured", async () => {
  await assert.rejects(access(`${root}/app/sentry-example-page/page.tsx`))
  await assert.rejects(access(`${root}/app/api/sentry-example-api/route.ts`))
  assert.match(await read("instrumentation.ts"), /captureRequestError/)
})
