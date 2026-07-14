import assert from "node:assert/strict"
import test from "node:test"
import {
  formatSignalPhone,
  parseSignalBusinessInput,
} from "../input-parser.ts"

test("Custom Cleaners parses a clean submitted name and suite-preserving address", () => {
  const parsed = parseSignalBusinessInput("Custom Cleaners - 1540 Keller Pkwy #150, Keller, TX 76248")
  assert.equal(parsed.submittedName, "Custom Cleaners")
  assert.equal(parsed.submittedAddress, "1540 Keller Pkwy #150, Keller, TX 76248")
  assert.equal(parsed.submittedCity, "Keller")
  assert.equal(parsed.submittedState, "TX")
  assert.equal(parsed.submittedZip, "76248")
  assert.equal(parsed.identityAnchorType, "name_address")
  assert.equal(parsed.identityAnchorStrength, "strong")
})

test("mixed input parser handles name and city", () => {
  const parsed = parseSignalBusinessInput("Custom Cleaners, Keller TX")
  assert.equal(parsed.submittedName, "Custom Cleaners")
  assert.equal(parsed.submittedCity, "Keller")
  assert.equal(parsed.submittedState, "TX")
  assert.equal(parsed.identityAnchorType, "name_city")
})

test("mixed input parser handles name and phone", () => {
  const parsed = parseSignalBusinessInput("Custom Cleaners — (817) 555-0123")
  assert.equal(parsed.submittedName, "Custom Cleaners")
  assert.equal(parsed.phone, "(817) 555-0123")
  assert.equal(parsed.phoneE164, "+18175550123")
  assert.equal(parsed.identityAnchorType, "name_phone")
})

test("phone display is professional", () => {
  assert.equal(formatSignalPhone("18173374480"), "(817) 337-4480")
})

test("Maps URL is the strongest anchor", () => {
  const parsed = parseSignalBusinessInput("https://www.google.com/maps/search/?api=1&query=Custom+Cleaners&query_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4")
  assert.equal(parsed.googlePlaceId, "ChIJN1t_tDeuEmsRUsoyG83frY4")
  assert.equal(parsed.identityAnchorType, "places_url")
  assert.equal(parsed.identityAnchorStrength, "strong")
})

test("official website and social profile URLs remain separate", () => {
  const parsed = parseSignalBusinessInput("Custom Cleaners https://customcleaners.example https://facebook.com/customcleanerskeller")
  assert.equal(parsed.submittedName, "Custom Cleaners")
  assert.equal(parsed.officialWebsiteUrl, "https://customcleaners.example/")
  assert.deepEqual(parsed.socialUrls, ["https://facebook.com/customcleanerskeller"])
  assert.equal(parsed.identityAnchorType, "official_website")
})

test("parse corrections override inferred values without changing original input", () => {
  const parsed = parseSignalBusinessInput("Custm Cleaners, Keller TX", {
    businessName: "Custom Cleaners",
    address: "1540 Keller Pkwy #150, Keller, TX 76248",
  })
  assert.equal(parsed.raw, "Custm Cleaners, Keller TX")
  assert.equal(parsed.submittedName, "Custom Cleaners")
  assert.equal(parsed.submittedAddress, "1540 Keller Pkwy #150, Keller, TX 76248")
  assert.equal(parsed.identityAnchorType, "name_address")
})
