import assert from "node:assert/strict"
import test from "node:test"
import { parseReceptionistProfile, validateReceptionistProfile } from "../config.ts"
import { customerProfileTemplate, northTexasDemoProfile } from "../profiles.ts"
import { buildReceptionistPrompt } from "../prompt.ts"

test("the fictional HVAC instance is valid and cannot enable unsupported integrations", () => {
  assert.equal(validateReceptionistProfile(northTexasDemoProfile).success, true)
  for (const capability of ["booking", "sms", "liveTransfer"]) {
    const result = validateReceptionistProfile({
      ...northTexasDemoProfile,
      capabilities: { ...northTexasDemoProfile.capabilities, [capability]: true },
    })
    assert.equal(result.success, false, `${capability} must stay disabled`)
  }
  assert.equal(validateReceptionistProfile({ ...northTexasDemoProfile, apiKey: "unexpected-field" }).success, false)
})

test("incomplete customer drafts cannot produce a prompt", () => {
  const result = validateReceptionistProfile(customerProfileTemplate)
  assert.equal(result.success, false)
  if (!result.success) {
    assert.ok(result.errors.some((error) => error.startsWith("business.name:")))
    assert.ok(result.errors.some((error) => error.startsWith("business.serviceArea:")))
    assert.ok(result.errors.some((error) => error.startsWith("business.services:")))
  }
  assert.throws(() => buildReceptionistPrompt(customerProfileTemplate as unknown as typeof northTexasDemoProfile))
})

test("hours and timezone validation prevent impossible operating instructions", () => {
  for (const monday of [{ opens: "25:00", closes: "17:00" }, { opens: "17:00", closes: "08:00" }, { opens: "08:00", closes: "08:00" }]) {
    assert.equal(validateReceptionistProfile({
      ...northTexasDemoProfile,
      business: { ...northTexasDemoProfile.business, hours: { ...northTexasDemoProfile.business.hours, monday } },
    }).success, false)
  }
  assert.equal(validateReceptionistProfile({
    ...northTexasDemoProfile,
    business: { ...northTexasDemoProfile.business, timezone: "Somewhere/Invalid" },
  }).success, false)
})

test("intake needs a usable callback request and does not accept duplicates", () => {
  for (const fields of [
    ["caller_name", "service_location", "issue", "preferred_time"],
    ["caller_name", "callback_number", "issue", "issue", "service_location"],
  ]) {
    assert.equal(validateReceptionistProfile({ ...northTexasDemoProfile, intake: { fields } }).success, false)
  }
})

test("a second business uses shared behavior without carrying over fictional HVAC facts", () => {
  const result = validateReceptionistProfile({
    ...customerProfileTemplate,
    id: "example-cleaning-draft",
    business: { name: "Example Cleaning", timezone: "America/New_York", serviceArea: ["Example City"], services: ["Home cleaning"], hours: null },
  })
  assert.equal(result.success, true)
  if (!result.success) return
  const prompt = buildReceptionistPrompt(result.profile)
  assert.match(prompt, /Example Cleaning/)
  assert.match(prompt, /America\/New_York/)
  assert.match(prompt, /Hours have not been verified/)
  assert.doesNotMatch(prompt, /North Texas Air & Heat|Fort Worth|Keller|08:00–17:00/)
  assert.match(prompt, /Do not route real customer calls/)
  assert.match(prompt, /no connected delivery, calendar, SMS, or transfer tools/)
})

test("the demo clearly separates roleplay, preferences, urgency, and confirmed actions", () => {
  const prompt = buildReceptionistPrompt(northTexasDemoProfile)
  assert.match(prompt, /fictional business/)
  assert.match(prompt, /made-up details and a made-up callback number/)
  assert.match(prompt, /no real callback, booking, technician visit, or follow-up will happen/)
  assert.match(prompt, /Booking: OFF\. SMS: OFF\. Live transfer: OFF/)
  assert.match(prompt, /Never claim a request was saved, submitted, sent, delivered, booked/)
  assert.match(prompt, /suspected gas leak, smoke or fire, a carbon monoxide alarm/)
  assert.match(prompt, /stop intake/)
  assert.match(prompt, /Never troubleshoot, diagnose/)
  assert.match(prompt, /reliable current local date and time/)
  assert.match(prompt, /Do not promise emergency service/)
  assert.match(prompt, /Ask one useful question at a time/)
  assert.match(prompt, /Booking: OFF/)
})

test("JSON errors are actionable and valid profiles round-trip without losing facts", () => {
  const malformed = parseReceptionistProfile('{"version":')
  assert.equal(malformed.success, false)
  if (!malformed.success) assert.match(malformed.errors[0], /valid JSON/)
  const roundTrip = parseReceptionistProfile(JSON.stringify(northTexasDemoProfile))
  assert.equal(roundTrip.success, true)
  if (roundTrip.success) assert.deepEqual(roundTrip.profile, northTexasDemoProfile)
})
