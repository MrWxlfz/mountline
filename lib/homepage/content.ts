/**
 * Copy and example data for the public homepage.
 *
 * Every call, caller, and request below is an illustration built around the fictional
 * North Texas Air & Heat demo. Names use made-up details and 555-01xx numbers.
 * Nothing here is a customer record, a measured result, or a testimonial.
 */

export const flow = [
  { title: "A call comes in", body: "After hours, on a busy line, or when nobody can get to the phone." },
  { title: "Mountline answers", body: "As your business, with the questions you’d ask." },
  { title: "Your team gets the request", body: "Who called, what they need, where, and when." },
] as const

/* The call demo --------------------------------------------------------------- */

export type RequestFieldKey = "issue" | "location" | "urgency" | "time" | "callback" | "status"

export type DemoLine = {
  who: "caller" | "mountline"
  /** Square brackets mark the words the request is built from. */
  text: string
  fills?: Array<{ field: RequestFieldKey; value: string }>
}

export const demoCall = {
  business: "North Texas Air & Heat",
  callerId: "817-555-0142",
  receivedAt: "6:48 PM",
  lines: [
    { who: "mountline", text: "Thanks for calling North Texas Air & Heat. This is the AI receptionist. How can we help?" },
    {
      who: "caller",
      text: "Hi, my [AC is running but it stopped cooling] this afternoon.",
      fills: [{ field: "issue", value: "AC running, not cooling" }],
    },
    { who: "mountline", text: "Sorry about that. What ZIP code is the property in?" },
    { who: "caller", text: "[76244].", fills: [{ field: "location", value: "Keller, TX 76244" }] },
    { who: "mountline", text: "Thanks. Is the system completely off, or is it still blowing air?" },
    {
      who: "caller",
      text: "It’s [blowing air]. It just [isn’t cold].",
      fills: [
        { field: "issue", value: "AC running, not cooling. Still blowing air." },
        { field: "urgency", value: "Same week" },
      ],
    },
    { who: "mountline", text: "Got it. When would be a good time for someone to come out?" },
    { who: "caller", text: "[Tomorrow afternoon], if that works.", fills: [{ field: "time", value: "Tomorrow afternoon" }] },
    { who: "mountline", text: "I’ll note that. What’s the best name and number for a callback?" },
    { who: "caller", text: "It’s [Dana], [817-555-0142].", fills: [{ field: "callback", value: "Dana · 817-555-0142" }] },
    {
      who: "mountline",
      text: "Thanks, Dana. I’ll pass this to the team so they can confirm a time with you.",
      fills: [{ field: "status", value: "Needs follow-up" }],
    },
  ] satisfies DemoLine[],
}

export const requestFields: Array<{ key: RequestFieldKey; label: string }> = [
  { key: "issue", label: "Issue" },
  { key: "location", label: "Service location" },
  { key: "urgency", label: "Urgency" },
  { key: "time", label: "Preferred time" },
  { key: "callback", label: "Callback" },
  { key: "status", label: "Status" },
]

/* Control ---------------------------------------------------------------------- */

export type ControlExample =
  | { kind: "facts"; items: Array<[string, string]> }
  | { kind: "exchange"; caller: string; reply: string }
  | { kind: "checks"; items: string[] }

export const controls: Array<{ label: string; statement: string; example: ControlExample }> = [
  {
    label: "Your information",
    statement: "Your hours, services, service area, and answers to the usual questions. It all comes from you.",
    example: {
      kind: "facts",
      items: [
        ["Hours", "Mon–Fri, 8 to 5"],
        ["Service area", "Keller, Southlake, North Fort Worth"],
        ["Pricing", "Quoted by the office"],
      ],
    },
  },
  {
    label: "Your boundaries",
    statement: "If it doesn’t have the answer, it says so and takes a note. It doesn’t guess.",
    example: {
      kind: "exchange",
      caller: "How much for a new unit?",
      reply: "I don’t have pricing for that. I’ll note it so the team can call you with a quote.",
    },
  },
  {
    label: "Your people",
    statement: "Callers can ask for a person anytime. It won’t argue, and it won’t pretend to be one.",
    example: {
      kind: "exchange",
      caller: "Can I just talk to someone?",
      reply: "Of course. I’ll get your name and number to the team so a person can call you back.",
    },
  },
  {
    label: "Your approval",
    statement: "You hear it and test it before it handles a single real customer.",
    example: { kind: "checks", items: ["Call it yourself", "Try to trip it up", "Say yes, or ask for changes"] },
  },
]

/* Trades ------------------------------------------------------------------------ */

export type Trade = {
  name: string
  moment: string
  caller: string
  asks: string[]
  request: Array<[string, string]>
  status: string
}

export const trades: Trade[] = [
  {
    name: "HVAC",
    moment: "No-cooling calls in July. No-heat calls in January.",
    caller: "My AC is running, but the house isn’t cooling down.",
    asks: ["Is it completely off, or still blowing air?", "What ZIP code is the property in?", "Is anyone at home who’s at risk in the heat?"],
    request: [
      ["Issue", "AC running, not cooling"],
      ["System", "Central air, still blowing"],
      ["Location", "Keller, TX 76244"],
      ["Urgency", "Same week"],
      ["Preferred time", "Tomorrow afternoon"],
    ],
    status: "Needs follow-up",
  },
  {
    name: "Plumbing",
    moment: "Leaks, clogs, and water heaters. Some can wait. Some can’t.",
    caller: "There’s water all over the garage floor from the water heater.",
    asks: ["Is the water still running right now?", "Is it a tank or a tankless heater?", "What’s the address or ZIP code?"],
    request: [
      ["Issue", "Water heater leaking"],
      ["Details", "Garage, water still running"],
      ["Heater", "Tank"],
      ["Location", "Keller, TX 76248"],
      ["Urgency", "Urgent, per your rules"],
    ],
    status: "Flagged urgent",
  },
  {
    name: "Electrical",
    moment: "Breakers, outages, and new circuits, without advice that should come from an electrician.",
    caller: "The kitchen breaker trips every time we run the microwave.",
    asks: ["How long has this been happening?", "Is anything else in the house affected?", "Is this a repair, or an estimate for new work?"],
    request: [
      ["Issue", "Kitchen breaker keeps tripping"],
      ["Since", "About a week"],
      ["Affected", "Kitchen circuit only"],
      ["Job type", "Repair"],
      ["Location", "Southlake, TX 76092"],
    ],
    status: "Needs follow-up",
  },
  {
    name: "Roofing",
    moment: "After a storm, the calls all come at once. Each one gets the damage and the insurance question.",
    caller: "We lost a bunch of shingles in last night’s storm.",
    asks: ["Is any water coming inside?", "Have you started an insurance claim?", "What’s the property address?"],
    request: [
      ["Issue", "Missing shingles after storm"],
      ["Leaking inside", "No"],
      ["Insurance", "Claim not started"],
      ["Request", "Inspection"],
      ["Preferred time", "Before the weekend"],
    ],
    status: "Inspection requested",
  },
  {
    name: "Cleaning",
    moment: "Quotes depend on size and scope. Get both before the quote call.",
    caller: "I need a move-out clean before Friday. Three bed, two bath.",
    asks: ["Will the home be empty by then?", "Roughly how many square feet?", "One time, or recurring?"],
    request: [
      ["Service", "Move-out clean"],
      ["Size", "3 bed, 2 bath, about 1,800 sq ft"],
      ["Home", "Empty by Thursday"],
      ["Frequency", "One time"],
      ["Preferred date", "Before Friday"],
    ],
    status: "Quote requested",
  },
]

/* Demo line --------------------------------------------------------------------- */

export const tryPrompts = [
  { say: "My AC is running but not cooling.", note: "Describe a problem the way a customer would." },
  { say: "Do you service homes in Keller?", note: "Ask about the service area." },
  { say: "Could somebody come tomorrow afternoon?", note: "It notes the time. It doesn’t book it." },
  { say: "Can I speak to a person?", note: "Ask for a human whenever you like." },
] as const

/* Testing ----------------------------------------------------------------------- */

export const testScenarios = [
  { name: "Normal request", says: "My AC stopped cooling.", expect: "Collects the issue, location, timing, and a callback number." },
  { name: "Vague question", says: "Do you guys do the whole thing?", expect: "Asks what they mean instead of guessing.", review: true },
  { name: "Unknown answer", says: "Do you charge extra on Sundays?", expect: "Says it doesn’t have an approved answer and notes the question." },
  { name: "Human request", says: "Can I just talk to a real person?", expect: "Keeps it short and gets the request to your team." },
  { name: "Out of area", says: "I’m down in Waco. Can you come out?", expect: "Follows your service-area rules. No promises it can’t keep." },
  { name: "After hours", says: "Is anybody there right now?", expect: "Follows your after-hours plan. Never claims someone is on call." },
  { name: "Urgent language", says: "There’s a burning smell from the vents.", expect: "Stops the questions and points the caller to emergency help first." },
] as const

/* Pilot ------------------------------------------------------------------------- */

export const pilotSteps = [
  { title: "We set it up with you", body: "Your hours, services, service area, and the questions customers ask. You approve what it can say." },
  { title: "Call it until you trust it", body: "Interrupt it. Ask odd questions. Try to break it. Anything it gets wrong gets fixed and called again." },
  { title: "You say when it goes live", body: "No real customer reaches it until you approve. Then forwarding goes on for the calls you picked." },
  { title: "We review real calls", body: "Start narrow, look at real requests together, and expand only if it’s earning its place." },
] as const

/* Company ----------------------------------------------------------------------- */

export const principles = [
  { title: "Direct support", body: "Email us and you reach someone who knows your setup, not a ticket queue." },
  { title: "Careful setup", body: "Every receptionist is configured and tested by the people who built it." },
  { title: "Accountability", body: "If it gets something wrong, we go through the call with you and fix it." },
  { title: "No pretending", body: "We’re a small team, and we’d rather say so up front." },
] as const

/* Questions --------------------------------------------------------------------- */

export const questions = [
  {
    q: "Can I keep my current number?",
    a: "Yes. Nothing about your number changes. Calls forward to Mountline only when you want them to, like after hours or when nobody picks up.",
  },
  {
    q: "When does it answer?",
    a: "When you tell it to: after hours, when nobody picks up, or both. It follows your call forwarding, so you can change it whenever you like.",
  },
  {
    q: "Does it replace my receptionist?",
    a: "No. It takes the calls your team can’t get to: after hours, busy lines, and the ones that would go to voicemail. Anything unusual still goes to a person.",
  },
  {
    q: "What if it doesn’t know the answer?",
    a: "It says so. It won’t guess about prices, availability, or policies. It notes the question so your team can answer it.",
  },
  {
    q: "Can it give prices?",
    a: "Only the ones you approve, like a standard service-call fee. Anything that needs a quote goes to your team.",
  },
  {
    q: "Can it book appointments?",
    a: "Not by default. It notes when the caller would like someone to come out, and your team confirms. Calendar booking is only added once it’s connected and tested for your business.",
  },
  {
    q: "Can a caller talk to a real person?",
    a: "Yes. It takes their name and number so someone on your team can call back. Live transfers are only turned on once they’re set up and tested for your line.",
  },
  {
    q: "How much work is setup?",
    a: "Mostly a conversation. We ask about your hours, services, service area, and the calls you get, then write it up for you to check. When you’re ready, we walk you through turning on call forwarding.",
  },
  {
    q: "What if it isn’t working for us?",
    a: "Turn call forwarding off and your phone works exactly the way it does today. Your number never changed, so there’s nothing to undo.",
  },
  {
    q: "What does it cost?",
    a: "It depends on your call volume and setup. Once we’ve seen how your calls work today, you get the scope and price in writing before you decide anything.",
  },
] as const
