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
  // The headline may be split across elements for layout; the words must stay the same.
  assert.match(homepage.replace(/<[^>]+>/g, ""), /A better website for the business you’ve built/)
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
  const [homepage, site, before, capture, btr, content, photos] = await Promise.all([
    read("components/mountline-homepage.tsx"),
    read("components/homepage/bramble/bramble-site.tsx"),
    read("components/homepage/bramble/bramble-before.tsx"),
    read("components/homepage/capture-scene.tsx"),
    read("components/homepage/build-test-refine.tsx"),
    read("lib/homepage/content.ts"),
    read("lib/homepage/sample-photos.ts"),
  ])
  // One label, used wherever the example appears on the homepage, and in the process scene.
  assert.match(homepage, /const EXAMPLE_LABEL = "Example business · Design demonstration"/)
  assert.ok(homepage.split("EXAMPLE_LABEL}").length - 1 >= 3, "the hero frame, its caption, and the before/after")
  assert.match(btr, /Example business · Design demonstration/)
  assert.match(homepage, /Bramble is a made-up dog groomer/)
  assert.match(capture, /Bramble isn’t a client/)
  assert.match(content, /Is Bramble a real business\?/)
  // Only reserved fictional numbers, and nothing a real review, badge, or history would say.
  for (const source of [site, before, btr]) {
    for (const phone of source.match(/\(\d{3}\) \d{3}-\d{4}/g) ?? []) assert.match(phone, /555-01\d\d/)
    assert.doesNotMatch(source, /review|testimonial|award|rated|★|since \d{4}|\d+\+? (?:happy )?(?:clients|customers|dogs)|years of/i)
  }
  // Pictures of websites: hidden from assistive tech and impossible to focus or submit.
  for (const source of [site, before]) {
    assert.match(source, /aria-hidden="true" inert/)
    assert.doesNotMatch(source, /<form|<input|<button|href=/)
  }
  // The /work concept sites aren't presented as Mountline's work.
  assert.doesNotMatch(homepage, /\/work\//)
  // Sample photos are free Unsplash images with credits, never Unsplash+ or a Mountline shoot.
  assert.match(photos, /Unsplash License/)
  assert.doesNotMatch(photos, /plus\.unsplash/)
  const sources = photos.match(/src: "[^"]+"/g) ?? []
  assert.ok(sources.length >= 5)
  for (const src of sources) assert.match(src, /^src: "https:\/\/images\.unsplash\.com\/photo-/)
  assert.equal((photos.match(/page: "https:\/\/unsplash\.com\/photos\//g) ?? []).length, sources.length, "every photo credited")
})

test("the private notification address stays out of public site components", async () => {
  for (const file of [
    "components/mountline-homepage.tsx",
    "components/project-inquiry-form.tsx",
    "components/homepage/site-footer.tsx",
    "components/homepage/site-header.tsx",
    "components/homepage/build-test-refine.tsx",
    "components/homepage/the-difference.tsx",
    "components/homepage/capture-scene.tsx",
    "components/homepage/client-results.tsx",
    "components/receptionist/receptionist-page.tsx",
    "components/receptionist/call-console.tsx",
    "components/receptionist/use-live-demo.ts",
    "lib/receptionist/web-demo/contract.ts",
    "lib/case-study/evidence.json",
    "lib/case-study/client-results.ts",
    "lib/homepage/content.ts",
    "lib/homepage/sample-photos.ts",
  ]) assert.doesNotMatch(await read(file), /icloud/i, file)
})

test("the word-built mark is decorative and complete without motion", async () => {
  const [mark, player, css] = await Promise.all([
    read("components/brand/signature-mark.tsx"),
    read("components/brand/signature-player.tsx"),
    read("components/brand/signature-mark.css"),
  ])
  assert.match(player, /aria-hidden="true"/)
  assert.match(mark, /SignaturePlayer/)
  // Reduced motion never hides it, and it plays once rather than re-forming on scroll.
  assert.match(player, /prefers-reduced-motion: reduce/)
  assert.match(player, /observer\.disconnect\(\)/)
  assert.doesNotMatch(player, /addEventListener\("scroll"/)
  // Without scripts, or with reduced motion, the finished mark is what shows: rows are only hidden
  // or moved inside the no-preference block, while waiting to play.
  const outside = css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}/, "")
  assert.doesNotMatch(outside.replace(/@keyframes[\s\S]*$/, ""), /opacity: 0|transform: translate/)
  assert.match(css, /\[data-state="waiting"\] \.ml-signature__row \{ opacity: 0; \}/)
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
  const receptionist = await read("components/receptionist/receptionist-page.tsx")
  const illustrations = receptionist.split("data-illustrative").length - 1
  assert.ok(illustrations >= 1)
  assert.ok(receptionist.split("Not live customer data").length - 1 >= illustrations)

  const console = await read("components/receptionist/call-console.tsx")
  // The example is labeled as text only with a made-up caller, wherever it plays.
  assert.match(console, /Example · text only, no audio/)
  assert.match(console, /Example request · made-up caller/)
  // No invented audio: the example has none, so there's no player, voice bars, or waveform.
  assert.doesNotMatch(console, /<audio|className="[^"]*(wave|voice|bars)/i)
  // Nothing plays until someone asks, and scrolling away pauses it.
  assert.match(console, /useState<Mode>\("rest"\)/)
  assert.match(console, /setPlay\("paused"\)/)
  // The example and a real browser call are separate paths, and a live call's sheet never shows example data.
  assert.match(console, /Talk in your browser/)
  assert.match(console, /Play a short example/)
  // The accent light belongs to a real call; the scripted example never borrows it.
  assert.match(await read("components/receptionist/call-console.css"), /\.cc\[data-mode="example"\] \.cc__light \{ background: var\(--fg-2\); \}/)
  assert.match(console, /Your demo call · not sent to any business/)
  // With the browser demo switched off, the main action is the real phone line, never a dead button.
  assert.match(console, /liveAvailable \? \(/)
  assert.match(console, /Talking in the browser isn’t switched on yet/)
  assert.match(await read("components/mountline-homepage.tsx"), /receptionistDemo\.phoneHref/)

  for (const file of [
    "components/mountline-homepage.tsx",
    "components/receptionist/call-console.tsx",
    "components/homepage/bramble/bramble-site.tsx",
    "components/homepage/build-test-refine.tsx",
    "components/homepage/the-difference.tsx",
    "components/homepage/capture-scene.tsx",
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
      /delivered to your team/i,
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
  // No third-party percentages anywhere the homepage draws from (the call clock's `% 60` is arithmetic, not a figure).
  // The homepage shows no figures of its own; measured client results render only once approved (see below).
  for (const file of ["components/homepage/bramble/bramble-site.tsx", "components/homepage/bramble/bramble-before.tsx", "components/homepage/build-test-refine.tsx", "components/homepage/capture-scene.tsx", "components/receptionist/call-console.tsx", "lib/receptionist/example-call.ts", "lib/homepage/content.ts"]) {
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
  assert.match(homepage, /optional add-on, discussed and priced with the project/)
  assert.match(homepage, /Capture is new/)
  assert.match(content, /Scoped and priced separately/)
  assert.match(content, /Aerial shots only where the location suits it, permissions allow it, and a licensed drone pilot is available/)
  // Photographs, labeled as sample imagery; not a shoot we did, and no fake camera furniture.
  assert.match(capture, /Sample imagery · Website concept/)
  assert.match(capture, /Not a\s+Mountline shoot/)
  assert.match(capture, /SamplePhoto/)
  assert.doesNotMatch(capture, /Storefront|viewfinder|REC\b|timecode|timeline/i)
  for (const source of [homepage, capture]) assert.doesNotMatch(source, /<video|\.mp4|portfolio|<Play\b/i)
})

test("public Sentry demos are gone while monitoring remains configured", async () => {
  await assert.rejects(access(`${root}/app/sentry-example-page/page.tsx`))
  await assert.rejects(access(`${root}/app/api/sentry-example-api/route.ts`))
  assert.match(await read("instrumentation.ts"), /captureRequestError/)
})

test("internal test reports stay off the homepage, and client results need approval to appear", async () => {
  const [homepage, scene, difference, results, component, generator, evidenceSource] = await Promise.all([
    read("components/mountline-homepage.tsx"),
    read("components/homepage/build-test-refine.tsx"),
    read("components/homepage/the-difference.tsx"),
    read("lib/case-study/client-results.ts"),
    read("components/homepage/client-results.tsx"),
    read("scripts/evidence/build-evidence.mjs"),
    read("lib/case-study/evidence.json"),
  ])
  // The engineering record is kept internally, not presented as marketing.
  await assert.rejects(access(`${root}/components/homepage/evidence-panel.tsx`))
  assert.doesNotMatch(homepage, /EvidencePanel|case-study\/evidence|we tested it/i)
  // The process demo is a demonstration of the customer experience: no pass marks, no server claims.
  for (const source of [scene, difference]) {
    assert.doesNotMatch(source, /Passed|Failed|Checked by the server|verified|evidence\.json|Lighthouse|axe/i)
  }
  // No numbers until a real, approved client result exists.
  assert.match(results, /export const clientResults: ClientResult\[\] = \[\]/)
  assert.match(component, /if \(!results\.length\) return null/)
  const { publishable } = await import(new URL("../../case-study/client-results.ts", import.meta.url).href)
  const approved = {
    client: "Example Co.",
    service: "website",
    measure: "appointment_requests",
    label: "Appointment requests from the website",
    before: { from: "2026-01-01", to: "2026-03-31", count: 20 },
    after: { from: "2026-04-01", to: "2026-06-29", count: 31 },
    whatChanged: "New website launched in April.",
    source: "The owner’s booking inbox",
    permission: { approvedBy: "The owner", approvedOn: "2026-07-01", record: "Signed email" },
  }
  assert.equal(publishable([approved]).length, 1)
  assert.equal(publishable([{ ...approved, permission: { approvedBy: "", approvedOn: "", record: "" } }]).length, 0, "no permission, no result")
  assert.equal(publishable([{ ...approved, after: { from: "2026-04-01", to: "2026-04-10", count: 31 } }]).length, 0, "periods must be comparable")
  assert.equal(publishable([{ ...approved, measure: "inquiry_conversion_rate" }]).length, 0, "a rate needs its denominator")
  // The internal record still refuses to guess.
  assert.match(generator, /never fills a gap with a guess/)
  assert.ok(JSON.parse(evidenceSource).notTested.some((item: string) => /live AI receptionist/i.test(item)))
})
