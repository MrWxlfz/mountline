/**
 * Every word on the homepage lives here, so copy can change without touching components.
 *
 * Placeholders are written in square brackets in capitals, like the pricing below. While any remain,
 * previews and local dev show a banner listing them, and a production build on Vercel fails
 * (scripts/check-placeholders.mjs). The text number is the one exception: "Text me" links just stay
 * hidden until it's filled in.
 */

import { isPlaceholder } from "@/lib/placeholders"

export type ServiceKey = "websites" | "google" | "ads" | "receptionist"

export type Service = {
  key: ServiceKey
  label: string
  title: string
  body: string
  includes: readonly string[]
  extra?: string
}

export type WorkEntry = {
  /** A real client, published with their permission. Never a made-up business. */
  client: string
  url?: string
  summary: string
}

export const site = {
  name: "Mountline",
  url: "https://mountline.dev",

  person: {
    name: "Luke Nordin",
    firstName: "Luke",
    // Resized from /luke-nordin.jpg (images aren't optimized at request time on this site).
    avatar: "/images/luke/luke-192.webp",
    photo: "/images/luke/luke-960.webp",
    photoAlt: "Luke Nordin, outdoors in a blue checked jacket",
  },

  contact: {
    email: "hello@mountline.dev",
    // TODO(luke): your Google Voice number, written like +18175550100. "Text me" stays hidden until then.
    textNumber: "[TEXT NUMBER]",
    // A Google Calendar appointment schedule or a Cal.com link. Set in .env.local and on Vercel.
    bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
  },

  nav: [
    { href: "#what-i-do", label: "What I do" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#about", label: "About" },
  ],

  cta: {
    book: "Book a call",
    bookLong: "Book a free 15-min call",
    text: "Text me",
    email: "Email me",
  },

  hero: {
    greeting: "Hey, I’m Luke. I’m 15 and I live in Keller.",
    titleStart: "I build websites for businesses around",
    titleAccent: "Keller.",
    titleSecond: "And I make sure people nearby can actually find you.",
    sub: "Websites, Google Business Profiles, and Facebook and Instagram ads for local businesses. Based in Keller, working across DFW.",
    // The fictional business that builds itself in the hero phone. Each vignette on the page uses its own.
    demo: {
      business: "Oak & Ember Bakery",
      tagline: "Fresh bread every morning",
      hours: "Open today · 7 AM–3 PM",
      call: "Call now",
      directions: "Directions",
      menu: ["Sourdough", "Cinnamon rolls"],
    },
  },

  services: {
    title: "What I do",
    intro: "Three things that help local businesses get found and get calls. You can pick one or all three.",
    items: [
      {
        key: "websites",
        label: "Websites",
        title: "A website that works on a phone.",
        body: "I design, write, and build your site from scratch. It loads fast, looks right on a phone, and makes it easy to call or book. We write the words together, so it sounds like you.",
        includes: ["Designed and built for your business", "Written with you, in plain words", "A clear Call or Book button on every page"],
        // TODO(luke): confirm still offered
        extra: "I can shoot photos of your place too.",
      },
      {
        key: "google",
        label: "Google Business Profile",
        title: "Show up when people nearby search.",
        body: "When someone searches “dog groomer near me,” Google shows a map and a short list of businesses. I set up or clean up your profile so the right hours, photos, and services are there when they find you.",
        includes: ["Hours, services, and categories set right", "Photos and regular posts", "A direct link for customers to leave a review"],
      },
      {
        key: "ads",
        label: "Facebook & Instagram ads",
        title: "Ads that bring in calls, not just likes.",
        body: "Simple local campaigns shown to people in your area. I write and design the ads, keep an eye on them, and tell you plainly what’s working.",
        includes: ["Shown only to people near you", "Ads I write and design for you", "A short plain-English update every month"],
      },
    ] satisfies Service[],
    receptionist: {
      label: "Coming soon",
      title: "An AI receptionist for after hours.",
      body: "It answers when you can’t, takes down what the caller needs, and texts you the details. You never miss a call again.",
      earlyAccess: "Ask me about early access",
      peek: "Have the password? Take a look",
      href: "/receptionist",
    },
  },

  steps: {
    title: "How it works",
    items: [
      { title: "We talk for 15 minutes.", body: "On Google Meet, or I come by. You tell me about your business and what isn’t working." },
      { title: "I build it. You watch it come together.", body: "You get a link to check it on your phone while I work, and you read every line before anything goes live." },
      { title: "It goes live, and I stick around.", body: "Need a change after launch, or help with something? You reach me directly." },
    ],
  },

  pricing: {
    title: "Pricing",
    intro: "Starting prices, so you know roughly where you’ll land before we talk.",
    items: [
      { name: "Website", price: "[WEBSITE FROM $___]", note: "Design, writing, and build, with changes and help after launch." },
      { name: "Google Business Profile", price: "[GOOGLE PROFILE SETUP $___]", note: "Setup or cleanup: hours, services, categories, photos, and a review link." },
      { name: "Facebook & Instagram ads", price: "[ADS MGMT $___/mo + ad spend]", note: "I run the campaigns. Ad spend is paid straight to Meta, and you set the budget." },
      { name: "AI receptionist", price: "[RECEPTIONIST $___/mo]", note: "Coming soon. Early access pricing for the first few businesses.", soon: true },
    ],
    promise: "Every project gets a flat price in writing before anything starts.",
  },

  work: {
    title: "Recent work",
    // Only real clients who said yes to being shown here. While this is empty, the section doesn't render.
    items: [] as WorkEntry[],
  },

  about: {
    title: "The person you text is the person doing the work.",
    // TODO(luke): read this through and make it sound like you.
    body: [
      "I’m Luke Nordin. I’m 15, I live in Keller, and I build websites for local businesses. A lot of good businesses around here are hard to find online, and fixing that is something I’m good at.",
      "When you work with me, you talk to me directly. I design your site, write it with you, set up your Google profile, and run your ads. No hand-offs.",
    ],
    studio: "Mountline is the studio behind the work: the systems, the invoices, and a flat price in writing, like you’d get from any business.",
  },

  faq: {
    title: "Questions",
    items: [
      { q: "How much does it cost?", a: "Starting prices are above. After we talk, you get one flat price in writing before I start anything." },
      { q: "How long does it take?", a: "Most websites take [SITE TIMELINE]. A Google profile is quicker. I’ll give you a date when we agree on the price." },
      { q: "Do I have to write the words?", a: "No. I ask you questions, write a draft, and you fix anything that doesn’t sound right. You know your business, and I know how to put it on a page." },
      { q: "Can you redo my current site?", a: "Yes. I’ll look at what you have, keep what works, and rebuild the rest. Your domain stays yours." },
      { q: "Do you meet in person?", a: "Yes, around Keller, Southlake, Roanoke, Trophy Club, Colleyville, and Grapevine. Otherwise we use Google Meet." },
      { q: "What happens after I book?", a: "You get a Google Meet link by email. We talk for 15 minutes. If it’s a fit, I send a flat price in writing. If not, no hard feelings." },
    ],
  },

  final: {
    title: "Want to talk about your business?",
    body: "Book a free 15-minute call. Google Meet, or I can come by.",
    fallback: "Not a call person?",
    formToggle: "Rather write it out?",
    formIntro: "Tell me a little about your business. I’ll reply by email.",
  },

  footer: {
    description: "Websites, Google Business Profiles, and local ads for businesses around Keller, Texas. Built by Luke Nordin.",
    area: ["Keller", "Southlake", "Roanoke", "Trophy Club", "Colleyville", "DFW"],
    login: "Client login",
    loginHref: "/id",
  },

  metadata: {
    title: "Luke Nordin · Websites for businesses around Keller | Mountline",
    description:
      "I build websites, set up Google Business Profiles, and run Facebook and Instagram ads for local businesses in Keller, Southlake, Roanoke, and across DFW.",
  },
} as const

/* Helpers ------------------------------------------------------------------ */

/** The sms: link, or null while the number is still a placeholder. */
export function smsHref() {
  const number = site.contact.textNumber as string
  return isPlaceholder(number) ? null : `sms:${number.replace(/[^\d+]/g, "")}`
}

export const mailtoHref = `mailto:${site.contact.email}`
