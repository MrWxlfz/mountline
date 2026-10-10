/**
 * Every word on the public site lives here, so copy can change without touching components.
 * The homepage copy is taken word for word from docs/design/site-reference.html.
 *
 * Placeholders are written in square brackets in capitals, like the pricing below. While any remain,
 * previews and local dev show a banner listing them, and a production build on Vercel fails
 * (scripts/check-placeholders.mjs). The text number is the one exception: "Text me" links just stay
 * hidden until it's filled in.
 */

import { isPlaceholder } from "@/lib/placeholders"

/** The rebrand notice ("Notice something new?") stops showing for everyone after this date. */
export const REBRAND_NOTICE_UNTIL = "2027-01-31"

export type ServiceKey = "web" | "map" | "ads" | "call"

export type ServicePane = {
  key: ServiceKey
  tab: string
  title: string
  sub: string
  chips: readonly { label: string; live?: boolean }[]
  ask: string
  steps: readonly string[]
  result: string
  footNote?: string
}

export const site = {
  name: "Mountline",
  url: "https://mountline.dev",

  person: {
    name: "Luke Nordin",
    firstName: "Luke",
    initial: "L",
    photo: "/luke-nordin.jpg",
    photoAlt: "Luke Nordin, outdoors in a blue checked jacket",
    town: "Keller, Texas",
  },

  contact: {
    email: "hello@mountline.dev",
    // TODO(luke): your Google Voice number, written like +18175550100. "Text me" stays hidden until then.
    textNumber: "[TEXT NUMBER]",
    // A Google Calendar appointment schedule or a Cal.com link. Set in .env.local and on Vercel.
    bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
  },

  // The example business in every mockup. Labeled in the footer; never presented as a client.
  example: {
    business: "Oak & Ember",
    disclaimer: "Oak & Ember is an example business.",
  },

  announce: {
    text: "Early access is open for the AI receptionist.",
    link: "Learn more",
    href: "#early",
    dismiss: "Dismiss announcement",
  },

  rebrand: {
    lead: "Notice something new?",
    text: "We changed our branding from",
    logosLabel: "the old triangle logo to the new mountain-line logo",
    dismiss: "Dismiss",
  },

  nav: [
    { href: "#what", label: "What I do" },
    { href: "#how", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#about", label: "About" },
  ],

  cta: {
    book: "Book a call",
  },

  hero: {
    title: "Websites, Google listings & ads for businesses around Keller",
    lead: "Hi, I'm Luke. I'm 15, I live in Keller, and I do all of it myself, from the first call to the day it goes live.",
    book: "Book a free 15-min call",
    secondary: { label: "See what I do", href: "#what" },
    trust: ["Free 15-minute call", "Flat price, in writing", "You work with me directly"],
    stageLabel: "Example: a bakery's website and Google listing made by Luke, and a new order coming in",
    site: {
      url: "oakandember.com",
      logo: "Oak & Ember",
      links: ["Menu", "Hours", "Visit"],
      order: "Order ahead",
      eyebrow: "Main St, Keller",
      headlineStart: "Fresh bread, ",
      headlineEm: "every",
      headlineEnd: " morning.",
      body: "Sourdough, rolls, and pastries, baked before sunrise. Order by 8 PM for pickup tomorrow.",
      pickup: "Order for pickup",
      open: "Open today · 7 AM–3 PM",
      menuTitle: "Today's bake",
      menu: [
        { item: "Country sourdough", price: "$9.00" },
        { item: "Cinnamon roll", price: "$4.50" },
        { item: "Kouign-amann", price: "$5.25", soldOut: true },
        { item: "Olive fougasse", price: "$7.00" },
      ],
      soldOut: "Sold out",
    },
    google: {
      bar: "Google Business Profile",
      name: "Oak & Ember Bakery",
      meta: "Bakery · 214 Main St, Keller, TX",
      open: "Open",
      closes: " · Closes 3 PM",
      actions: ["Call", "Directions", "Website", "Order"],
      popular: "Popular times",
      day: "Saturdays",
      bars: [
        { h: 30 },
        { h: 62 },
        { h: 90, now: true },
        { h: 76 },
        { h: 56 },
        { h: 46 },
        { h: 34 },
        { h: 18 },
      ],
      hours: ["7a", "9a", "11a", "1p", "3p"],
    },
    toast: { title: "New order", detail: "Maya R. · Sat 9 AM pickup" },
  },

  towns: {
    title: "Local work for local businesses, close enough to meet in person.",
    items: [
      { name: "Keller", zip: "76248" },
      { name: "Southlake", zip: "76092" },
      { name: "Roanoke", zip: "76262" },
      { name: "Trophy Club", zip: "76262" },
      { name: "Colleyville", zip: "76034" },
      { name: "Grapevine", zip: "76051" },
    ],
  },

  what: {
    eyebrow: "What I do",
    title: "Everything that gets you found, from one person",
    lead: "You tell me what's not working. I fix it across your website, your Google listing, and your ads, and you only ever talk to me.",
    secondary: { label: "See pricing", href: "#pricing" },
    feats: [
      { icon: "phone", label: "Built for phones first" },
      { icon: "chat", label: "I write the words with you" },
      { icon: "pin", label: "Google Business Profile" },
      { icon: "ads", label: "Facebook & Instagram ads" },
      { icon: "camera", label: "Photos of your place" },
      { icon: "call", label: "AI receptionist", soon: "Soon" },
    ],
    app: {
      title: "Oak & Ember",
      subtitle: " · Project with Luke",
      sync: "Up to date",
      railLabel: "Services",
      client: "Dana · Oak & Ember",
      clientInitial: "D",
    },
    panes: [
      {
        key: "web",
        tab: "Website",
        title: "Website",
        sub: "A site that answers the questions people call to ask.",
        chips: [{ label: "Live", live: true }, { label: "oakandember.com" }, { label: "Example client" }],
        ask: "People keep calling to ask if we're open. Can the website fix that?",
        steps: [
          "Wrote the homepage with Dana: menu, hours, and the story",
          "Put today's hours at the top of every page",
          "Made \"Order for pickup\" one tap from anywhere",
          "Tested it on every phone in the shop",
        ],
        result: "It's live. Hours are the first thing people see now, and pickup orders go straight to Dana's phone.",
        footNote: "Dana approved every line before launch.",
      },
      {
        key: "map",
        tab: "Google",
        title: "Google listing",
        sub: "What people see when they search for you on Google and Maps.",
        chips: [{ label: "Verified", live: true }, { label: "Google Business Profile" }, { label: "Example client" }],
        ask: "We don't come up when people search \"bakery near me.\"",
        steps: [
          "Claimed and verified the listing",
          "Fixed the hours, holiday hours, and map pin",
          "Added photos of the shop and the bread",
          "Set the right categories and a weekly post",
        ],
        result: "The listing is complete and accurate, so Google has everything it needs to show it to people nearby.",
        footNote: "I keep it updated, including holiday hours.",
      },
      {
        key: "ads",
        tab: "Ads",
        title: "Facebook & Instagram ads",
        sub: "Ads that bring in orders and calls from people nearby.",
        chips: [{ label: "Running", live: true }, { label: "Thu–Sat" }, { label: "Example client" }],
        ask: "Can we get more people in on Saturdays?",
        steps: [
          "Made three ads from photos of the Saturday bake",
          "Showed them only to people within a few miles",
          "Kept to the weekly budget Dana picked",
          "Sent every order request to her phone",
        ],
        result: "The ads run Thursday through Saturday, and Dana gets each order request as a text.",
        footNote: "You set the budget. I never spend more without asking.",
      },
      {
        key: "call",
        tab: "Calls",
        title: "AI receptionist",
        sub: "Answers the calls you can't get to.",
        chips: [{ label: "Coming soon" }, { label: "Early access" }],
        ask: "I can't answer the phone with flour on my hands.",
        steps: [
          "Answers in the bakery's name when nobody picks up",
          "Takes the order or the question",
          "Texts Dana a short summary",
        ],
        result: "This one's in early access. Ask me about it on a call.",
      },
    ] satisfies ServicePane[],
  },

  how: {
    eyebrow: "How it works",
    title: "Four steps, and you talk to me the whole way",
    steps: [
      {
        n: "01",
        title: "We talk for 15 minutes",
        body: "On Google Meet, or I come by. You tell me what's working and what isn't.",
      },
      {
        n: "02",
        title: "I build it, you watch on your phone",
        body: "You get a private link and see it come together as I go.",
      },
      {
        n: "03",
        title: "You check every line",
        body: "Nothing goes live until you say it's right. Changes take minutes.",
      },
      {
        n: "04",
        title: "It goes live, and I stick around",
        body: "New hours, a new menu item, a holiday sale. Text me and it's done.",
      },
    ],
    invite: { app: "Google Calendar", title: "Call with Luke", when: "Tue · 4:30–4:45 PM · Google Meet", join: "Join" },
    preview: {
      logo: "Oak & Ember",
      headline: "Fresh bread, every morning.",
      button: "Order for pickup",
      toastName: "Luke",
      toastText: " sent a preview",
    },
    thread: { ask: "Can we say we're family-owned?", reply: "Added it to the top.", done: "Live ✓" },
    log: [
      { what: "Added pumpkin loaf to menu", when: "Oct 3" },
      { what: "Updated holiday hours", when: "Sep 28" },
      { what: "New photos on Google", when: "Sep 20" },
      { what: "Site launched", when: "Sep 12" },
    ],
  },

  pricing: {
    eyebrow: "Pricing",
    title: "Simple prices, agreed before I start",
    plans: [
      {
        key: "web",
        name: "Website",
        before: "from",
        price: "[WEBSITE $___]",
        includes: ["Designed and written with you", "Fast on every phone", "Changes after launch"],
      },
      {
        key: "map",
        name: "Google listing",
        price: "[GOOGLE $___]",
        after: "one time",
        includes: ["Claimed and verified", "Hours, photos, and services", "Linked to your website"],
      },
      {
        key: "ads",
        name: "Facebook & Instagram ads",
        price: "[ADS $___]",
        after: "/ month + ad spend",
        includes: ["Ads made from your real work", "Shown to people nearby", "You set the budget"],
      },
    ] as readonly { key: "web" | "map" | "ads"; name: string; before?: string; price: string; after?: string; includes: readonly string[] }[],
    note: "Every project gets a flat price in writing before anything starts.",
  },

  about: {
    eyebrow: "About",
    title: "You'll work with me, not a company",
    body: [
      "I'm 15 and I live in Keller. I started building websites because most of the local places I love have sites that don't tell you if they're open.",
      "Mountline is the studio behind the work. When you text, I'm the one who answers, and I'm the one doing the work.",
    ],
  },

  receptionist: {
    pill: "Coming soon",
    title: "An AI receptionist for the calls you miss",
    lead: "It answers in your business's name, takes the details, and texts you a summary. It's in early access now.",
    cta: "Ask about early access",
    call: {
      label: "Example call",
      title: "Call · 6:42 PM",
      when: "After hours",
      lines: [
        { who: "ai", text: "Thanks for calling Oak & Ember. How can I help?" },
        { who: "caller", text: "Do you have sourdough left for tomorrow morning?" },
        { who: "ai", text: "We do. Can I get a name for the pickup?" },
      ],
      smsTitle: "Text to Dana",
      sms: "Maya R. wants 2 sourdough for 9 AM tomorrow. Number: (817) 555-0142",
    },
  },

  faq: {
    eyebrow: "Questions",
    title: "Things people ask me",
    items: [
      {
        q: "How much does it cost?",
        a: "Starting prices are above. After a quick call, you get one flat price in writing before I start anything.",
      },
      { q: "How long does it take?", a: "It depends on the project. You'll get a plan with dates on our first call." },
      { q: "Do I have to write anything?", a: "No. I ask you questions, write a draft, and you check every line." },
      {
        q: "Can you fix my current website?",
        a: "Yes. I can rebuild it or keep what's working. Send me the link and I'll take a look.",
      },
      {
        q: "Do you meet in person?",
        a: "Around Keller, Southlake, and nearby towns, yes. Otherwise Google Meet works great.",
      },
    ],
  },

  final: {
    title: "Let's talk about your business",
    lead: "Fifteen minutes, free, on Google Meet or in person. No pressure either way.",
    book: "Book a free call",
  },

  footer: {
    description: "Websites, Google listings, and ads for businesses around Keller. Built by Luke Nordin.",
    siteTitle: "Site",
    contactTitle: "Contact",
    area: "Keller · Southlake · DFW",
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

/** True until REBRAND_NOTICE_UNTIL has passed (the notice shows through the end of that day). */
export function rebrandNoticeActive(now = new Date()) {
  return now.getTime() < new Date(`${REBRAND_NOTICE_UNTIL}T23:59:59`).getTime()
}
