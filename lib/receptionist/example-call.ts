/**
 * The short animated example on the call console: a shortened, scripted call to the fictional
 * North Texas Air & Heat, with a made-up caller and a 555-01xx number. It is text only. There is no
 * recording, so the console never plays sound or draws a waveform for it.
 *
 * `at` is when each turn appears, in milliseconds. Square brackets mark the words the request is
 * built from. The whole call, including the question skipped here, is demoCall in lib/homepage/content.ts.
 */

export type ExampleField = "who" | "need" | "where" | "when"

export type ExampleTurn = { at: number; who: "agent" | "caller"; text: string; fills?: ExampleField[] }

export const exampleCall = {
  business: "North Texas Air & Heat",
  situation: "6:48 PM, office closed. A homeowner calls a made-up HVAC company.",
  receivedAt: "Today, 6:49 PM",
  lengthMs: 15800,
  turns: [
    { at: 0, who: "agent", text: "Thanks for calling North Texas Air & Heat. This is the AI receptionist. How can we help?" },
    { at: 2300, who: "caller", text: "Hi, my [AC is running but it stopped cooling] this afternoon.", fills: ["need"] },
    { at: 4500, who: "agent", text: "Sorry about that. What ZIP code is the property in?" },
    { at: 6100, who: "caller", text: "[76244].", fills: ["where"] },
    { at: 7300, who: "agent", text: "When would be a good time for someone to come out?" },
    { at: 8900, who: "caller", text: "[Tomorrow afternoon], if that works.", fills: ["when"] },
    { at: 10500, who: "agent", text: "What’s the best name and number for a callback?" },
    { at: 12000, who: "caller", text: "It’s [Dana], [817-555-0142].", fills: ["who"] },
    { at: 13600, who: "agent", text: "Thanks, Dana. I’ll pass this to the team so they can confirm a time." },
  ] satisfies ExampleTurn[],
  request: [
    { key: "who", label: "Who called", value: "Dana · 817-555-0142" },
    { key: "need", label: "What they need", value: "AC is running but not cooling" },
    { key: "where", label: "Where", value: "Keller, TX 76244" },
    { key: "when", label: "When", value: "Tomorrow afternoon, if possible" },
  ] satisfies Array<{ key: ExampleField; label: string; value: string }>,
  next: "Call Dana back to confirm a time.",
  tries: ["“My AC is running but not cooling.”", "“Can someone come tomorrow afternoon?”", "“How much is a service call?”", "“Can I talk to a person?”"],
} as const
