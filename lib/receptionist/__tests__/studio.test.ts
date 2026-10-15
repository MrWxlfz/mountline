/* eslint-disable @typescript-eslint/no-explicit-any -- tests read Retell request bodies loosely */
import assert from "node:assert/strict"
import test from "node:test"
import { normalizeCapabilities, plannedSmsCapabilities, voiceCapabilityIds } from "../studio/capabilities.ts"
import { asTeamMember, createRateLimit, NOT_TEAM } from "../studio/guard.ts"
import { getIndustry, industries, searchIndustries } from "../studio/industries.ts"
import { buildStudioReceptionist, firstMessageFor } from "../studio/prompt.ts"
import { validateStudioConfig, type StudioConfig } from "../studio/schema.ts"
import {
  MAX_STUDIO_AGENTS,
  StudioError,
  assignNumber,
  createStudioAgent,
  deleteStudioAgent,
  startStudioWebCall,
  stopStudioWebCall,
  updateStudioAgent,
  type RetellApi,
} from "../studio/service.ts"

const barber: StudioConfig = {
  version: 1,
  businessName: "Southlake Barber Co.",
  industry: "barbershop",
  location: "Southlake, TX",
  description: "",
  hours: "",
  context: "",
  instructions: "",
  capabilities: ["scheduling", "faq", "intake"],
  personality: "casual",
  receptionistName: "",
  voiceId: "retell-Cimo",
  mode: "demo",
  firstMessage: "",
}

const config = (changes: Partial<StudioConfig>): StudioConfig => ({ ...barber, ...changes })
const promptFor = (changes: Partial<StudioConfig>) => buildStudioReceptionist(config(changes)).prompt

/* Industries --------------------------------------------------------------------------- */

test("every requested industry exists with its own knowledge, intake, and valid defaults", () => {
  const required = [
    "Barbershop", "Hair salon", "Nail salon", "Dental office", "Orthodontist", "Family medicine", "Urgent care",
    "Chiropractic / physical therapy", "Medical spa", "Hotel", "Restaurant", "Catering", "Plumbing", "HVAC", "Electrical",
    "Roofing", "Landscaping", "Pool maintenance", "Pest control", "Cleaning service", "Garage door repair", "Auto repair",
    "Auto detailing", "Tire shop", "Veterinary clinic", "Pet grooming", "Pet boarding", "Real estate", "Property management",
    "Law firm", "Fitness studio", "Tutoring center", "Daycare",
  ]
  const labels: string[] = industries.map((industry) => industry.label)
  for (const label of required) assert.ok(labels.includes(label), `${label} is missing`)
  assert.equal(new Set(industries.map((industry) => industry.id)).size, industries.length)
  for (const industry of industries) {
    assert.ok(industry.intake.length >= 4, `${industry.id} needs real intake questions`)
    assert.ok(industry.knowledge.length >= 2, `${industry.id} needs real knowledge`)
    assert.ok(industry.defaults.length >= 3)
    for (const id of industry.defaults) assert.ok((voiceCapabilityIds as readonly string[]).includes(id))
  }
  // No two industries share their knowledge or intake: this is not one template with a name swapped in.
  assert.equal(new Set(industries.map((industry) => industry.knowledge.join("|"))).size, industries.length)
  assert.equal(new Set(industries.map((industry) => industry.intake.join("|"))).size, industries.length)
})

test("the industry search matches labels, categories, and everyday words", () => {
  assert.ok(searchIndustries("fade").some((industry) => industry.id === "barbershop"))
  assert.ok(searchIndustries("braces").some((industry) => industry.id === "orthodontist"))
  assert.ok(searchIndustries("home services").some((industry) => industry.id === "hvac"))
  assert.equal(searchIndustries("").length, industries.length)
  assert.equal(searchIndustries("zzzz").length, 0)
})

/* Prompt generation ----------------------------------------------------------------------- */

test("the barbershop example matches the spec: casual greeting, haircut follow-up, barber preference", () => {
  const generated = buildStudioReceptionist(barber)
  assert.equal(generated.firstMessage, "Hey, thanks for calling Southlake Barber Co.! What can I help you with?")
  assert.match(generated.prompt, /Are you looking for a regular haircut, a fade, or something else\?/)
  assert.match(generated.prompt, /barber preference/)
  assert.doesNotMatch(generated.prompt, /Barber Co\.\./)
})

test("industries get genuinely different conversations", () => {
  const dental = promptFor({ industry: "dental", businessName: "Keller Family Dental", personality: "polished", capabilities: ["scheduling", "intake", "urgent"] })
  const hotel = promptFor({ industry: "hotel", businessName: "The Keller Inn", personality: "polished" })
  const hvac = promptFor({ industry: "hvac", businessName: "North Texas Air", capabilities: ["scheduling", "intake", "urgent"] })
  assert.match(dental, /new or existing patient/)
  assert.match(dental, /Never ask for date of birth/)
  assert.match(dental, /healthcare demo/)
  assert.doesNotMatch(dental, /fade/)
  assert.match(hotel, /check-in date/)
  assert.match(hotel, /Never take a credit card number/)
  assert.match(hvac, /carbon monoxide/)
  assert.doesNotMatch(hvac, /patient/)
  assert.equal(firstMessageFor(config({ industry: "hotel", businessName: "The Keller Inn", personality: "polished" })), "Thank you for calling The Keller Inn, front desk. How can I help you?")
})

test("only switched-on capabilities become workflows; switched-off ones become limits", () => {
  const withBooking = promptFor({ capabilities: ["scheduling", "intake"] })
  const withoutBooking = promptFor({ capabilities: ["faq", "intake"] })
  assert.match(withBooking, /# Booking/)
  assert.doesNotMatch(withoutBooking, /# Booking/)
  assert.match(withoutBooking, /Booking appointments isn't handled on this line/)

  assert.match(promptFor({ capabilities: ["pricing", "intake"] }), /# Prices and services/)
  assert.match(promptFor({ capabilities: ["faq", "intake"] }), /Don't discuss prices/)
  assert.doesNotMatch(promptFor({ capabilities: ["faq"] }), /# Wanting a person/)
  assert.match(promptFor({ capabilities: ["faq", "callback"] }), /You can't transfer calls on this line/)
  assert.deepEqual(normalizeCapabilities(["faq", "scheduling", "faq", "bogus"]), ["scheduling", "faq"])
})

test("demo mode simulates and discloses bookings; live mode never claims one", () => {
  const demo = promptFor({ mode: "demo" })
  const live = promptFor({ mode: "live" })
  assert.match(demo, /Bookings are simulated/)
  assert.match(demo, /make clear it's a demo booking/)
  assert.match(demo, /Never say a confirmation text or email is on its way/)
  assert.doesNotMatch(live, /simulated/i)
  assert.match(live, /can't book, hold, or confirm a time/)
  assert.match(live, /Never say something is booked, confirmed, or scheduled/)
})

test("every prompt keeps the honesty rules and the live date", () => {
  for (const industry of industries) {
    const prompt = promptFor({ industry: industry.id, capabilities: [...industry.defaults], personality: industry.personality })
    assert.match(prompt, /Never claim to be human/)
    assert.match(prompt, /\{\{current_time\}\}/)
    assert.match(prompt, /end_call/)
    assert.doesNotMatch(prompt, /How may I assist you today\?"? Don't/) // only ever mentioned as a line to avoid
    for (const sms of plannedSmsCapabilities) assert.ok(!prompt.includes(sms.label), `${sms.label} leaked into ${industry.id}`)
  }
})

test("post-call fields follow capabilities and industry", () => {
  const booking = buildStudioReceptionist(barber).postCallFields.map((field) => field.name)
  assert.ok(booking.includes("outcome") && booking.includes("booked_for") && booking.includes("staff_preference"))
  const faqOnly = buildStudioReceptionist(config({ industry: "hotel", capabilities: ["faq"] })).postCallFields.map((field) => field.name)
  assert.ok(!faqOnly.includes("booked_for"))
  assert.ok(!faqOnly.includes("staff_preference"))
})

/* Validation ---------------------------------------------------------------------------- */

test("the schema rejects incomplete or unexpected settings and cleans text", () => {
  assert.equal(validateStudioConfig(barber).success, true)
  assert.equal(validateStudioConfig({ ...barber, businessName: " " }).success, false)
  assert.equal(validateStudioConfig({ ...barber, industry: "spaceport" }).success, false)
  assert.equal(validateStudioConfig({ ...barber, capabilities: [] }).success, false)
  assert.equal(validateStudioConfig({ ...barber, capabilities: ["sms_confirmation"] }).success, false)
  assert.equal(validateStudioConfig({ ...barber, voiceId: "../../etc" }).success, false)
  assert.equal(validateStudioConfig({ ...barber, apiKey: "nope" }).success, false)
  const cleaned = validateStudioConfig({ ...barber, businessName: "  Fade\u0007 Factory  ", context: "a".repeat(5001) })
  assert.equal(cleaned.success, false)
  const ok = validateStudioConfig({ ...barber, businessName: "  Fade\u0007 Factory  " })
  assert.ok(ok.success && ok.config.businessName === "Fade Factory")
})

/* Retell request handling ------------------------------------------------------------------ */

type Call = { path: string; method: string; body: unknown }

function fakeRetell(handlers: Record<string, (call: Call) => unknown>) {
  const calls: Call[] = []
  const api: RetellApi = async <T,>(path: string, init: { method?: string; body?: unknown } = {}) => {
    const call = { path, method: init.method ?? "GET", body: init.body }
    calls.push(call)
    const key = Object.keys(handlers).find((prefix) => path.startsWith(prefix))
    if (!key) throw new Error(`Unexpected Retell call: ${call.method} ${path}`)
    return handlers[key](call) as T
  }
  return { api, calls }
}

class FakeHttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

test("creating a receptionist makes one LLM and one agent with the generated settings", async () => {
  const { api, calls } = fakeRetell({
    "/get-voice/": () => ({ voice_id: "retell-Cimo", provider: "platform", gender: "female", voice_name: "Cimo" }),
    "/create-retell-llm": () => ({ llm_id: "llm_1" }),
    "/create-agent": () => ({ agent_id: "agent_1" }),
  })
  const result = await createStudioAgent(api, barber, 0)
  assert.deepEqual(result, { agentId: "agent_1", llmId: "llm_1", created: true, warning: null })
  const llm = calls.find((call) => call.path === "/create-retell-llm")!.body as Record<string, any>
  assert.equal(llm.begin_message, "Hey, thanks for calling Southlake Barber Co.! What can I help you with?")
  assert.equal(llm.start_speaker, "agent")
  assert.equal(llm.general_tools[0].type, "end_call")
  assert.deepEqual(JSON.parse(llm.default_dynamic_variables.studio_config), barber)
  const agent = calls.find((call) => call.path === "/create-agent")!.body as Record<string, any>
  assert.equal(agent.agent_name, "Studio · Southlake Barber Co.")
  assert.deepEqual(agent.response_engine, { type: "retell-llm", llm_id: "llm_1" })
  assert.equal(agent.voice_id, "retell-Cimo")
  assert.equal(agent.enable_expressive_mode, true)
  assert.equal(agent.handbook_config.ai_disclosure, true)
  assert.equal(agent.handbook_config.natural_filler_words, false)
  assert.ok(agent.max_call_duration_ms <= 15 * 60_000)
})

test("non-platform voices don't get expressive mode, and rejected extras fall back to standard settings", async () => {
  let attempts = 0
  const { api, calls } = fakeRetell({
    "/get-voice/": () => ({ voice_id: "11labs-Adrian", provider: "elevenlabs", gender: "male", voice_name: "Adrian" }),
    "/create-retell-llm": () => ({ llm_id: "llm_2" }),
    "/create-agent": () => {
      attempts++
      if (attempts === 1) throw new FakeHttpError(400, "unknown field handbook_config")
      return { agent_id: "agent_2" }
    },
  })
  const result = await createStudioAgent(api, { ...barber, voiceId: "11labs-Adrian" }, 0)
  assert.equal(result.agentId, "agent_2")
  assert.match(result.warning ?? "", /standard voice settings/)
  const [first, second] = calls.filter((call) => call.path === "/create-agent").map((call) => call.body as Record<string, unknown>)
  assert.equal(first.enable_expressive_mode, false)
  assert.ok("handbook_config" in first)
  assert.ok(!("handbook_config" in second))
})

test("a failed agent creation cleans up its LLM, and the cap stops runaway creation", async () => {
  const { api, calls } = fakeRetell({
    "/get-voice/": () => ({ voice_id: "retell-Cimo", provider: "platform" }),
    "/create-retell-llm": () => ({ llm_id: "llm_3" }),
    "/create-agent": () => {
      throw new FakeHttpError(500, "boom")
    },
    "/delete-retell-llm/": () => undefined,
  })
  await assert.rejects(createStudioAgent(api, barber, 0))
  assert.ok(calls.some((call) => call.path === "/delete-retell-llm/llm_3" && call.method === "DELETE"))

  const empty = fakeRetell({})
  await assert.rejects(createStudioAgent(empty.api, barber, MAX_STUDIO_AGENTS), StudioError)
  assert.equal(empty.calls.length, 0)
  await assert.rejects(createStudioAgent(empty.api, { ...barber, businessName: "" }, 0), StudioError)
  assert.equal(empty.calls.length, 0)
})

test("an unknown voice is a clear error, not a broken agent", async () => {
  const { api, calls } = fakeRetell({
    "/get-voice/": () => {
      throw new FakeHttpError(404, "not found")
    },
  })
  await assert.rejects(createStudioAgent(api, barber, 0), /doesn't have that voice/)
  assert.ok(!calls.some((call) => call.path === "/create-retell-llm"))
})

test("Studio only ever edits, deletes, or calls agents it made", async () => {
  const { api, calls } = fakeRetell({
    "/get-agent/agent_main": () => ({ agent_id: "agent_main", agent_name: "North Texas Air & Heat", response_engine: { type: "retell-llm", llm_id: "llm_main" } }),
  })
  await assert.rejects(updateStudioAgent(api, "agent_main", barber), /wasn't made in Studio/)
  await assert.rejects(deleteStudioAgent(api, "agent_main"), /wasn't made in Studio/)
  await assert.rejects(startStudioWebCall(api, "agent_main", "user_1"), /wasn't made in Studio/)
  assert.ok(calls.every((call) => call.method === "GET"))
})

test("updating edits the same agent in place; deleting refuses while a number still uses it", async () => {
  const studioAgent = { agent_id: "agent_s", agent_name: "Studio · Southlake Barber Co.", response_engine: { type: "retell-llm", llm_id: "llm_s" } }
  const { api, calls } = fakeRetell({
    "/get-agent/agent_s": () => studioAgent,
    "/get-voice/": () => ({ voice_id: "retell-Cimo", provider: "platform" }),
    "/update-retell-llm/llm_s": () => ({}),
    "/update-agent/agent_s": () => ({ agent_id: "agent_s" }),
    "/v2/list-phone-numbers": () => ({ items: [{ phone_number: "+18175550100", phone_number_pretty: "+1 (817) 555-0100", inbound_agents: [{ agent_id: "agent_s", weight: 1 }] }] }),
  })
  const result = await updateStudioAgent(api, "agent_s", { ...barber, personality: "warm" })
  assert.equal(result.created, false)
  assert.ok(!calls.some((call) => call.path.startsWith("/create-")))
  assert.ok(calls.some((call) => call.path === "/update-agent/agent_s" && call.method === "PATCH"))
  await assert.rejects(deleteStudioAgent(api, "agent_s"), /still uses this receptionist/)
  assert.ok(!calls.some((call) => call.method === "DELETE"))
})

test("browser test calls ask Retell for a web call and return only the call's token", async () => {
  const { api, calls } = fakeRetell({
    "/get-agent/agent_s": () => ({ agent_id: "agent_s", agent_name: "Studio · Test", response_engine: { type: "retell-llm", llm_id: "llm_s" } }),
    "/v3/create-web-call": () => ({ call_id: "call_1", access_token: "token_1", transport: "gateway", ice_servers: [], expires_at: 123 }),
  })
  const ticket = await startStudioWebCall(api, "agent_s", "user_1")
  assert.deepEqual(ticket, { callId: "call_1", accessToken: "token_1", transport: "gateway", iceServers: [], expiresAt: 123 })
  const body = calls.find((call) => call.path === "/v3/create-web-call")!.body as Record<string, any>
  assert.equal(body.agent_id, "agent_s")
  assert.equal(body.agent_version, "latest")
  assert.equal(body.metadata.source, "mountline-studio")
})

test("ending a test call also stops it at Retell, and an already-ended call is fine", async () => {
  const ended = fakeRetell({ "/v2/stop-call/": () => { throw new FakeHttpError(404, "call not found") } })
  await stopStudioWebCall(ended.api, "call_abc123")
  assert.deepEqual(ended.calls.map((call) => `${call.method} ${call.path}`), ["POST /v2/stop-call/call_abc123"])

  const down = fakeRetell({ "/v2/stop-call/": () => { throw new FakeHttpError(500, "boom") } })
  await assert.rejects(stopStudioWebCall(down.api, "call_abc123"), /boom/)

  const none = fakeRetell({})
  await assert.rejects(stopStudioWebCall(none.api, "call/../x"), StudioError)
  assert.equal(none.calls.length, 0)
})

test("phone numbers point at Studio drafts or at another agent's published version", async () => {
  const numbers = { items: [{ phone_number: "+18176326909", inbound_agents: [{ agent_id: "agent_main", weight: 1 }] }] }
  const { api, calls } = fakeRetell({
    "/v2/list-phone-numbers": () => numbers,
    "/get-agent/agent_s": () => ({ agent_id: "agent_s", agent_name: "Studio · Test" }),
    "/get-agent/agent_main?version=latest_published": () => ({ agent_id: "agent_main", version: 4 }),
    "/get-agent/agent_main": () => ({ agent_id: "agent_main", agent_name: "North Texas Air & Heat" }),
    "/update-phone-number/": () => ({}),
  })
  await assignNumber(api, "+18176326909", "agent_s")
  await assignNumber(api, "+18176326909", "agent_main")
  const updates = calls.filter((call) => call.path.startsWith("/update-phone-number/")).map((call) => call.body as Record<string, any>)
  assert.equal(updates[0].inbound_agents[0].agent_version, "latest")
  assert.equal(updates[1].inbound_agents[0].agent_version, "latest_published")
  assert.deepEqual(updates[1].inbound_agents, updates[1].outbound_agents)
  await assert.rejects(assignNumber(api, "+18175550199", "agent_s"), /isn't on the Retell account/)
  await assert.rejects(assignNumber(api, "8176326909", "agent_s"), /doesn't look right/)
})

/* Authorization ------------------------------------------------------------------------- */

test("Studio work never runs for signed-out or non-team accounts", async () => {
  let ran = 0
  const work = async () => {
    ran++
    return "done"
  }
  const explain = () => "failed"
  assert.deepEqual(await asTeamMember(async () => ({ isTeamMember: false, userId: null }), work, explain), { ok: false, error: NOT_TEAM })
  assert.deepEqual(await asTeamMember(async () => ({ isTeamMember: false, userId: "user_client" }), work, explain), { ok: false, error: NOT_TEAM })
  assert.deepEqual(await asTeamMember(async () => { throw new Error("auth down") }, work, explain), { ok: false, error: NOT_TEAM })
  assert.equal(ran, 0)
  assert.deepEqual(await asTeamMember(async () => ({ isTeamMember: true, userId: "user_team" }), work, explain), { ok: true, data: "done" })
  assert.deepEqual(await asTeamMember(async () => ({ isTeamMember: true, userId: "user_team" }), async () => { throw new Error("x") }, explain), { ok: false, error: "failed" })
})

test("the per-person rate limit blocks bursts and recovers after the window", () => {
  let now = 0
  const take = createRateLimit(2, 60_000, () => now)
  assert.equal(take("a").allowed, true)
  assert.equal(take("a").allowed, true)
  const blocked = take("a")
  assert.equal(blocked.allowed, false)
  assert.ok(!blocked.allowed && blocked.retryInSeconds === 60)
  assert.equal(take("b").allowed, true)
  now = 60_001
  assert.equal(take("a").allowed, true)
})

test("industry lookups fail loudly for unknown ids", () => {
  assert.throws(() => getIndustry("nope"))
})
