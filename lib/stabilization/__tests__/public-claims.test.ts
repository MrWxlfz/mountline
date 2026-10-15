import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import test from "node:test"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../../../", import.meta.url))
const read = (path: string) => readFile(new URL(path, `file://${root}/`), "utf8")

test("the homepage describes the whole offer, labels its example, and claims nothing it can't back up", async () => {
  const [content, page, hero, footer, css] = await Promise.all([
    read("content/site.ts"),
    read("app/(marketing)/page.tsx"),
    read("components/site/home/hero.tsx"),
    read("components/site/footer.tsx"),
    read("app/(marketing)/marketing.css"),
  ])
  // Copy is Luke's to change (content/site.ts); this checks structure and claims, not wording.
  assert.match(content, /hero: \{\n    title: "[^"]+",/)
  for (const section of ["Hero", "Towns", "WhatIDo", "HowItWorks", "Pricing", "About", "ReceptionistSoon", "Faq", "FinalCta"]) {
    assert.match(page, new RegExp(`<${section} />`), section)
  }
  // The example business is labeled in the footer, and each service mockup carries an "Example …" chip.
  assert.match(content, /disclaimer: "Oak & Ember is an example business\."/)
  assert.match(footer, /site\.example\.disclaimer/)
  assert.ok((content.match(/\{ label: "Example (?:client|business)" \}/g) ?? []).length >= 3)
  // No stats, ratings, reviews, or client logos; the only numbers are prices still to be filled in.
  assert.doesNotMatch(content, /\d\s?%|★|\brated\b|\breviews?\b|testimonial|trusted by|clients served/i)
  // Prices are plain dollar figures or placeholders (the production build refuses to ship placeholders).
  for (const [, price] of content.matchAll(/^        price: "([^"]+)",$/gm)) assert.match(price, /^(\$[\d,]+|\[[A-Z]+ \$___\])$/)
  // Hero text is never hidden by the intro (it's painted under the overlay and only rises), so the
  // largest paint can't wait for it, whichever element that is after a copy change.
  assert.match(hero, /<h1 className="ia"/)
  assert.match(css, /html\[data-intro~=run\] \.mk-home \.hero \.ia\{transform:translateY\(10px\)\}/)
  assert.doesNotMatch(css, /data-intro~=run\][^{]*\.ia[^{]*\{[^}]*opacity:0/)
})

test("the example business is labeled, made up, and makes no claims", async () => {
  const [content, hero, howItWorks, footer] = await Promise.all([
    read("content/site.ts"),
    read("components/site/home/hero.tsx"),
    read("components/site/home/how-it-works.tsx"),
    read("components/site/footer.tsx"),
  ])
  assert.match(footer, /site\.example\.disclaimer/)
  // Pictures of the example's website and listing are hidden from assistive tech and can't be clicked.
  assert.match(hero, /className="win w-site" aria-hidden="true"/)
  assert.match(hero, /className="win w-gbp" aria-hidden="true"/)
  for (const source of [hero, howItWorks]) assert.doesNotMatch(source, /<form|<input|href=\{bakery/)
  // Only reserved fictional numbers, and nothing a real review, badge, or history would say.
  for (const phone of content.match(/\(\d{3}\) \d{3}-\d{4}/g) ?? []) assert.match(phone, /555-01\d\d/)
  assert.doesNotMatch(content, /award|since \d{4}|\d+\+? (?:happy )?(?:clients|customers)|years of/i)
})

test("the private notification address stays out of shared content and public components", async () => {
  const files = [
    "content/site.ts",
    "app/(marketing)/page.tsx",
    "components/site/booking.tsx",
    "components/site/nav.tsx",
    "components/site/footer.tsx",
    "components/site/rebrand-notice.tsx",
    "components/site/home/service-tabs.tsx",
    "components/receptionist-portal/portal.tsx",
    "components/receptionist-portal/tune.tsx",
    "lib/case-study/evidence.json",
    "lib/case-study/client-results.ts",
  ]
  for (const file of files) assert.doesNotMatch(await read(file), /icloud/i, file)
})

test("the old triangle logo lives only in the rebrand notice", async () => {
  const [oldMark, notice, wordmark] = await Promise.all([
    read("components/brand/old-mark.tsx"),
    read("components/brand/../site/rebrand-notice.tsx"),
    read("components/brand/wordmark.tsx"),
  ])
  // The triangle is drawn on a 180×180 grid; the ridge mark on 22×18. Only old-mark.tsx may hold the former.
  assert.match(oldMark, /viewBox="0 0 180 180"/)
  assert.match(notice, /<OldMark \/>/)
  assert.doesNotMatch(wordmark, /0 0 180 180/)
  assert.match(wordmark, /M1\.5 16 6\.8 7\.6 9\.6 11\.2 14 2\.6 20\.5 16/)
})

test("the receptionist demo portal is team-only, keeps Retell on the server, and limits outbound calls", async () => {
  const [page, ownerPage, actions, studioActions, retell, portal] = await Promise.all([
    read("app/(marketing)/receptionist/page.tsx"),
    read("app/(marketing)/receptionist/staff/page.tsx"),
    read("app/(marketing)/receptionist/actions.ts"),
    read("app/(marketing)/receptionist/studio-actions.ts"),
    read("lib/receptionist/retell.ts"),
    read("components/receptionist-portal/portal.tsx"),
  ])
  // The pages require a Mountline team sign-in and aren't indexed.
  for (const source of [page, ownerPage]) {
    assert.match(source, /await requireNorthlineTeamMember\(/)
    assert.match(source, /robots: \{ index: false, follow: false \}/)
  }
  // Every Studio action goes through the team check too.
  const studioExported = studioActions.match(/export async function \w+/g) ?? []
  assert.ok(studioExported.length >= 8)
  assert.equal((studioActions.match(/return team\(/g) ?? []).length, studioExported.length, "each Studio action goes through team()")
  // Every action re-checks team membership; none trusts the page that rendered it.
  const exported = actions.match(/export async function \w+/g) ?? []
  assert.ok(exported.length >= 5)
  assert.equal((actions.match(/return asTeam\(/g) ?? []).length, exported.length, "each action goes through asTeam")
  assert.match(actions, /if \(!access\.isTeamMember \|\| !access\.userId\) return \{ ok: false/)
  // The Retell key is server-only and never public.
  assert.match(retell, /^import "server-only"/)
  assert.match(retell, /process\.env\.RETELL_API_KEY/)
  assert.doesNotMatch(retell + portal, /NEXT_PUBLIC_RETELL/)
  assert.doesNotMatch(portal, /^import (?!type)[^\n]*@\/lib\/receptionist\/retell/m)
  // Outbound demo calls: US numbers only, with a daily cap.
  assert.match(actions, /normalizeUsNumber\(/)
  assert.match(actions, /OUTBOUND_DAILY_LIMIT/)
  // Features still being built are shown as in the works, never as working.
  assert.match(portal, /In the works/)
  assert.match(portal, /Text confirmations/)
})

test("public copy doesn't promise texts, transfers, or booking from the receptionist", async () => {
  const content = await read("content/site.ts")
  for (const unsupported of [/texts? you (?:a summary|the details)/i, /transfers? (?:urgent )?calls/i, /books? (?:appointments|it) on your calendar/i]) {
    assert.doesNotMatch(content, unsupported)
  }
})

test("public pages show no statistics of their own", async () => {
  for (const file of ["content/site.ts"]) {
    assert.doesNotMatch(await read(file), /\d\s?%|percent/i, file)
  }
  await assert.rejects(access(`${root}/lib/homepage/benchmarks.ts`))
})

test("public Sentry demos are gone while monitoring remains configured", async () => {
  await assert.rejects(access(`${root}/app/sentry-example-page/page.tsx`))
  await assert.rejects(access(`${root}/app/api/sentry-example-api/route.ts`))
  assert.match(await read("instrumentation.ts"), /captureRequestError/)
})

test("internal test reports stay off the public site, and client results need approval to appear", async () => {
  const [homepage, content, results, generator, evidenceSource] = await Promise.all([
    read("app/(marketing)/page.tsx"),
    read("content/site.ts"),
    read("lib/case-study/client-results.ts"),
    read("scripts/evidence/build-evidence.mjs"),
    read("lib/case-study/evidence.json"),
  ])
  // The engineering record is kept internally, not presented as marketing.
  for (const source of [homepage, content]) {
    assert.doesNotMatch(source, /EvidencePanel|case-study\/evidence|we tested it|Lighthouse|axe-core|tests? passed|Checked by the server/i)
  }
  // No numbers until a real, approved client result exists.
  assert.match(results, /export const clientResults: ClientResult\[\] = \[\]/)
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
