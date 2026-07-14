import assert from "node:assert/strict"
import test from "node:test"
import { classifySourceDomain } from "../source-classification.ts"

test("Magicpin is an aggregator with no canonical or official-site authority", () => {
  const source = classifySourceDomain("https://magicpin.com/Custom-Cleaners-Keller/store/123")
  assert.equal(source.classification, "aggregator")
  assert.equal(source.publisherName, "Magicpin")
  assert.equal(source.canSupplyCanonicalName, false)
  assert.equal(source.canBeOfficialWebsite, false)
  assert.equal(source.canonicalIdentityAuthority, "none")
})

test("known directories, review sites, booking tools, and marketplaces are firewalled", () => {
  for (const [url, classification] of [
    ["https://www.yellowpages.com/keller-tx/mip/custom-cleaners-1", "directory"],
    ["https://www.yelp.com/biz/custom-cleaners-keller", "review_platform"],
    ["https://www.vagaro.com/customcleaners", "booking_platform"],
    ["https://www.thumbtack.com/tx/keller/cleaners/custom-cleaners", "marketplace"],
  ] as const) {
    const source = classifySourceDomain(url)
    assert.equal(source.classification, classification)
    assert.equal(source.canBeOfficialWebsite, false)
  }
})

test("unrecognized directory page heuristics prevent automatic official status", () => {
  const source = classifySourceDomain("https://local-example.test/business/custom-cleaners", {
    snippet: "Claim this business and browse businesses near you",
  })
  assert.equal(source.classification, "directory")
  assert.equal(source.canBeOfficialWebsite, false)
})

test("an unknown independent domain remains a candidate, not automatically official", () => {
  const source = classifySourceDomain("https://customcleanerskeller.com")
  assert.equal(source.classification, "unknown")
  assert.equal(source.canBeOfficialWebsite, true)
  assert.equal(source.canSupplyCanonicalName, false)
})
