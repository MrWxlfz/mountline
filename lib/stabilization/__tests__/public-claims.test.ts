import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import test from "node:test"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../../../", import.meta.url))
const read = (path: string) => readFile(new URL(path, `file://${root}/`), "utf8")

test("the homepage, metadata, and footer describe the whole business, not only the receptionist", async () => {
  const [homepage, page, layout, openGraph, footer] = await Promise.all([
    read("components/mountline-homepage.tsx"),
    read("app/page.tsx"),
    read("app/layout.tsx"),
    read("app/opengraph-image.tsx"),
    read("components/homepage/site-footer.tsx"),
  ])
  assert.match(homepage, /A better website for the business you’ve built/)
  assert.match(homepage, /id="websites"/)
  assert.match(homepage, /id="capture"/)
  assert.match(homepage, /id="receptionist"/)
  assert.match(homepage, /Talk about your project/)
  // Service links open the form with the right interest already chosen.
  for (const interest of ["website", "capture", "receptionist"]) assert.match(homepage, new RegExp(`data-interest="${interest}"`))
  assert.match(page, /Websites for Local Businesses/)
  assert.match(layout, /Websites for local businesses/)
  assert.match(openGraph, /A better website for the/)
  assert.match(footer, /Websites for local businesses/)
  assert.doesNotMatch(footer, /^\s*<p>AI receptionists for the calls/m)
})

test("the design example is labeled, made up, and makes no claims", async () => {
  const [homepage, site, capture, content] = await Promise.all([
    read("components/mountline-homepage.tsx"),
    read("components/homepage/bramble/bramble-site.tsx"),
    read("components/homepage/capture-scene.tsx"),
    read("lib/homepage/content.ts"),
  ])
  assert.ok(homepage.split("Design example — not a client project").length - 1 >= 2, "labeled on the image and in the caption")
  assert.match(homepage, /Bramble is a made-up dog groomer/)
  assert.match(capture, /Bramble isn’t a client/)
  assert.match(content, /Is Bramble a real business\?/)
  // Only reserved fictional numbers, and nothing a real review or badge would say.
  for (const phone of site.match(/\(\d{3}\) \d{3}-\d{4}/g) ?? []) assert.match(phone, /555-01\d\d/)
  assert.doesNotMatch(site, /review|testimonial|award|rated|★|\d+\+? (?:happy )?(?:clients|customers|dogs)/i)
  // It is a picture of a website: hidden from assistive tech and impossible to focus or submit.
  assert.match(site, /aria-hidden="true" inert/)
  assert.doesNotMatch(site, /<form|<input|<button|href=/)
  // The /work concept sites aren't presented as Mountline's work.
  assert.doesNotMatch(homepage, /\/work\//)
})

test("the private notification address stays out of public site components", async () => {
  for (const file of [
    "components/mountline-homepage.tsx",
    "components/project-inquiry-form.tsx",
    "components/homepage/site-footer.tsx",
    "components/homepage/site-header.tsx",
    "components/receptionist/receptionist-page.tsx",
    "lib/homepage/content.ts",
  ]) assert.doesNotMatch(await read(file), /icloud/i, file)
})

test("the word-built mark is decorative and complete without motion", async () => {
  const [mark, css] = await Promise.all([read("components/brand/signature-mark.tsx"), read("components/brand/signature-mark.css")])
  assert.match(mark, /aria-hidden="true"/)
  assert.match(mark, /prefers-reduced-motion: reduce/)
  // Without scripts, or with reduced motion, the finished mark is what shows.
  assert.match(css, /\.ml-signature \{ --p: 1;/)
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*--p: 1 !important/)
})

test("the receptionist page keeps the service detail, the demo line, and its limits", async () => {
  const [page, sections, metadata, openGraph] = await Promise.all([
    read("components/receptionist/receptionist-page.tsx"),
    read("components/receptionist/receptionist-sections.tsx"),
    read("app/receptionist/page.tsx"),
    read("app/receptionist/opengraph-image.tsx"),
  ])
  for (const section of ["CallItSection", "TestingSection", "ContextNote", "PilotSection", "ControlSection", "TradeExplorer", "CallStack"]) {
    assert.match(page, new RegExp(section))
  }
  assert.match(sections, /North Texas Air &amp; Heat is a fictional HVAC business/)
  assert.match(sections, /Demo calls do not book real visits or dispatch a technician/)
  assert.match(sections, /Calendar booking, text messages, and live transfers are not verified here/)
  assert.match(await read("lib/homepage/content.ts"), /Your team confirms pricing and scheduling/)
  assert.match(metadata, /AI Receptionist for Service Businesses/)
  assert.match(openGraph, /AI receptionists/)
})

test("simulations are labeled and unsupported completion claims are absent", async () => {
  for (const file of ["components/mountline-homepage.tsx", "components/receptionist/receptionist-page.tsx"]) {
    const source = await read(file)
    const illustrations = source.split("data-illustrative").length - 1
    assert.ok(illustrations >= 1, file)
    assert.ok(source.split("Not live customer data").length - 1 >= illustrations, file)
  }
  const scene = await read("components/homepage/call-scene.tsx")
  assert.match(scene, /Scripted example · text only, no audio/)
  // No invented audio: the example has none, so there's no player, voice bars, or waveform.
  assert.doesNotMatch(scene, /<audio|className="[^"]*(wave|voice)/i)
  // Nothing plays until someone asks, and scrolling away pauses it.
  assert.match(scene, /useState<Mode>\("still"\)/)
  assert.match(scene, /setMode\("paused"\)/)
  // The scripted example and the real demo line are told apart where both appear.
  assert.match(await read("components/mountline-homepage.tsx"), /The real demo line · a live AI receptionist/)
  for (const file of [
    "components/mountline-homepage.tsx",
    "components/homepage/call-scene.tsx",
    "components/homepage/bramble/bramble-site.tsx",
    "components/receptionist/receptionist-page.tsx",
    "components/receptionist/receptionist-sections.tsx",
  ]) {
    const source = await read(file)
    for (const unsupported of [
      /answers every call/i,
      /books real appointments/i,
      /system state · online/i,
      /transcript live/i,
      /the demo is live/i,
      /sends follow-up automatically/i,
      /guaranteed?/i,
      /testimonial/i,
    ]) assert.doesNotMatch(source, unsupported, file)
  }
})

test("the dot-grid statistic model is gone and the one remaining figure carries its source and caveat", async () => {
  await assert.rejects(access(`${root}/components/homepage/call-gap.tsx`))
  await assert.rejects(access(`${root}/components/homepage/glyph-field.tsx`))
  const benchmarks = await read("lib/homepage/benchmarks.ts")
  assert.doesNotMatch(benchmarks, /callModel|unanswered: 28/)
  assert.match(benchmarks, /callrail\.com\/blog\/missed-calls-cost-businesses-more-than-ever/)
  const sections = await read("components/receptionist/receptionist-sections.tsx")
  assert.match(sections, /not a Mountline result/)
  assert.match(sections, /doesn’t mean every missed call is a lost customer/)
  assert.doesNotMatch(await read("components/mountline-homepage.tsx"), /benchmarks|%/)
  // No percentages anywhere the homepage draws from (the call clock's `% 60` is arithmetic, not a figure).
  for (const file of ["components/homepage/bramble/bramble-site.tsx", "components/homepage/call-scene.tsx", "lib/homepage/content.ts"]) {
    assert.doesNotMatch(await read(file), /benchmarks|\d\s?%|percent/i, file)
  }
})

test("Capture is presented as an optional, inquiry-led add-on without invented work", async () => {
  const [homepage, capture, content] = await Promise.all([
    read("components/mountline-homepage.tsx"),
    read("components/homepage/capture-scene.tsx"),
    read("lib/homepage/content.ts"),
  ])
  assert.match(homepage, /Mountline Capture · optional/)
  assert.match(content, /Scoped and priced separately/)
  assert.match(capture, /not footage we’ve shot/)
  assert.match(capture, /Storyboard · illustration/)
  assert.match(homepage, /Capture is new/)
  assert.match(content, /Aerial shots only where the location suits it, permissions allow it, and a licensed drone pilot is available/)
  for (const source of [homepage, capture]) assert.doesNotMatch(source, /<video|\.mp4|portfolio/i)
})

test("public Sentry demos are gone while monitoring remains configured", async () => {
  await assert.rejects(access(`${root}/app/sentry-example-page/page.tsx`))
  await assert.rejects(access(`${root}/app/api/sentry-example-api/route.ts`))
  assert.match(await read("instrumentation.ts"), /captureRequestError/)
})
