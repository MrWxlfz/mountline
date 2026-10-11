import "server-only"

import { receptionistDemo } from "@/lib/receptionist/demo"
import { exampleCall } from "@/lib/receptionist/example-call"

/**
 * Every word on the gated /receptionist page. Server-only, so none of it ships in the JavaScript a
 * locked visitor downloads; it reaches the browser only in the HTML for an unlocked visit.
 *
 * Truthfulness: docs/receptionist-pilot.md says there's no SMS delivery, live transfer, calendar
 * booking, or verified callback delivery yet. Capabilities carry `live`; anything not live is never
 * rendered. Flip one only after it works end to end.
 */

export const receptionist = {
  demo: receptionistDemo,

  hero: {
    pill: "Early access",
    title: "Your phone, answered. Even when you can't.",
    lead: "An AI receptionist that picks up after hours and when you're busy, asks your questions, and writes up what the caller needs.",
    call: "Call the demo line",
    book: "Get early access",
    numberLabel: "Demo line",
    numberNote: "It's a demo for a made-up HVAC company, so use fake details.",
    qrNote: "Scan to call from your phone",
  },

  hear: {
    eyebrow: "Hear it",
    title: "A real call, start to finish",
    lead: "This is how it handles an after-hours call. Every line is on the demo line too.",
    label: "Example call · text only · made-up caller",
    business: exampleCall.business,
    situation: exampleCall.situation,
    turns: exampleCall.turns,
    request: exampleCall.request,
    requestTitle: "New call request",
    requestTime: exampleCall.receivedAt,
    next: exampleCall.next,
    nextLabel: "Next step",
    replay: "Play it again",
    agent: "Receptionist",
    caller: "Caller",
  },

  steps: {
    eyebrow: "What happens on a call",
    title: "Four things, every time",
    items: [
      {
        n: "01",
        title: "It answers in your business's name",
        body: "Callers hear your business name, and it tells them it's an AI receptionist.",
        greeting: "Thanks for calling North Texas Air & Heat. This is the AI receptionist.",
      },
      {
        n: "02",
        title: "It asks the questions you choose",
        body: "One at a time, in plain words. You decide what it needs to know.",
        questions: ["What's going on?", "What ZIP code?", "When works for you?", "Best number?"],
      },
      {
        n: "03",
        title: "It writes up the request",
        body: "Who called, what they need, where, and when. No voicemail to decode.",
      },
      {
        n: "04",
        title: "You decide where requests go",
        body: "In early access, I set up the delivery with you and test it before it answers a real call.",
        routes: ["Your phone", "Your inbox"],
      },
    ],
  },

  capabilities: {
    eyebrow: "What you get",
    title: "What it does today",
    items: [
      // TODO(luke): confirm live
      { label: "Answers after hours and when nobody picks up", live: true },
      // TODO(luke): confirm live
      { label: "Says it's an AI receptionist, in your business's name", live: true },
      // TODO(luke): confirm live
      { label: "Asks the questions you choose, one at a time", live: true },
      // TODO(luke): confirm live
      { label: "Collects name, number, what they need, where, and when", live: true },
      // TODO(luke): confirm live
      { label: "Keeps answers to the business info you approve", live: true },
      // Not built yet (docs/receptionist-pilot.md). Never rendered while false.
      { label: "Texts you a summary of every call", live: false },
      { label: "Transfers urgent calls to you", live: false },
      { label: "Books appointments on your calendar", live: false },
    ] as readonly { label: string; live: boolean }[],
  },

  setup: {
    eyebrow: "Setup",
    title: "You forward your calls. I set up the rest.",
    items: [
      { n: "01", title: "We set it up on a call", body: "Your hours, your services, and the questions it should ask." },
      { n: "02", title: "I test it with you", body: "We call it together until it sounds right and gets every detail." },
      { n: "03", title: "You forward your calls", body: "Keep your number. Send it the calls after hours, the ones nobody picks up, or both." },
    ],
  },

  pricing: {
    pill: "Early access",
    title: "Early access pricing for the first few businesses",
    // TODO(luke): add the monthly price here once it's set.
    body: "One flat monthly price, agreed on a call before anything starts. Setup and testing are included.",
    cta: "Ask about early access",
  },

  footerNote: "North Texas Air & Heat is a made-up business.",

  final: {
    title: "Want it answering your calls?",
    lead: "Book a free 30-minute call and I'll show you how it would work for your business.",
    book: "Book a call",
    call: "Call the demo",
  },
} as const
