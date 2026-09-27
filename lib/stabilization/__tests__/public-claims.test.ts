import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import test from "node:test"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../../../", import.meta.url))
const read = (path: string) => readFile(new URL(path, `file://${root}/`), "utf8")

test("homepage and metadata describe a bounded receptionist pilot", async () => {
  const [homepage, page, layout, openGraph] = await Promise.all([
    read("components/mountline-homepage.tsx"),
    read("app/page.tsx"),
    read("app/layout.tsx"),
    read("app/opengraph-image.tsx"),
  ])
  assert.match(homepage, /North Texas Air &amp; Heat/)
  assert.match(homepage, /fictional HVAC business/i)
  assert.match(homepage, /Demo calls do not book real visits or dispatch a technician/)
  assert.match(homepage, /Your team confirms pricing and scheduling/)
  assert.match(homepage, /Calendar booking, text messages, and live transfers are not verified here/)
  assert.match(page, /AI Receptionists for Service Businesses/)
  assert.match(layout, /AI receptionist pilots/i)
  assert.match(openGraph, /AI receptionists/)
})

test("simulations are labeled and unsupported completion claims are absent", async () => {
  const homepage = await read("components/mountline-homepage.tsx")
  const illustrations = homepage.split("data-illustrative").length - 1
  assert.ok(illustrations >= 1)
  assert.ok(homepage.split("Not live customer data").length - 1 >= illustrations)
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
