/**
 * Every word on the public site lives here, so copy can change without touching components.
 * Update docs/design/site-reference.html separately if it is still used as a design reference.
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
    // "Text me" appears when this number is not a placeholder.
    textNumber: "8178801028",
    // A Google Calendar appointment schedule or a Cal.com link. Set in .env.local and on Vercel.
    bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
    // The number printed on the business card and used by /luke (Text me, Call, and the vCard file
    // public/luke-nordin.vcf, which has its own copy). TODO(luke): swap for the Google Voice number.
    cardPhone: "+18178801028",
  },

  // The example business in every mockup. Labeled in the footer; never presented as a client.
  example: {
    business: "Oak & Ember",
    disclaimer: "Oak & Ember is an example business.",
  },

  announce: {
    text: "I'm building an AI receptionist for the calls you miss. Early access is open.",
    link: "Learn more",
    href: "#early",
    dismiss: "Dismiss announcement",
  },

  rebrand: {
    lead: "Notice something new?",
    text: "I updated the logo from",
    logosLabel: "the old triangle logo to the new mountain-line logo",
    dismiss: "Dismiss",
  },

  nav: [
    { href: "#what", label: "Services" },
    { href: "#how", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#about", label: "Meet Luke" },
  ],

  cta: {
    book: "Book a call",
  },

  hero: {
    title: "Your business is great in person. Let's make it look that way online.",
    lead: "I'm Luke. I build websites, set up Google listings, and run local ads for businesses around Keller. You'll work with me directly, from our first conversation to launch day and after.",
    book: "Book a free 30-minute call",
    secondary: { label: "See what I do", href: "#what" },
    trust: ["Free 30-minute call", "Clear pricing up front", "You work with me, start to finish"],
    stageLabel: "Example: a Keller bakery's website, Google listing, and a new order coming in",
    site: {
      url: "oakandember.com",
      logo: "Oak & Ember",
      links: ["Menu", "Hours", "Visit"],
      order: "Order ahead",
      eyebrow: "Main St, Keller",
      headlineStart: "Fresh bread, ",
      headlineEm: "every",
      headlineEnd: " morning.",
      body: "Sourdough, pastries, and all your usual favorites, baked before sunrise and ready for pickup.",
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
    title: "I'm based in Keller, so I'm never far away.",
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
    title: "Everything that helps people find you, and choose you",
    lead: "Your website, your Google listing, and your ads all have the same job: helping the right people find you and decide to come in. I take care of all three so they work together, and I keep the process simple.",
    secondary: { label: "See pricing", href: "#pricing" },
    feats: [
      { icon: "phone", label: "Built for phones first" },
      { icon: "chat", label: "Written in your voice" },
      { icon: "pin", label: "Google Business Profile setup" },
      { icon: "ads", label: "Local Facebook & Instagram ads" },
      { icon: "camera", label: "Photos of your actual place" },
      { icon: "call", label: "AI call answering", soon: "Early access" },
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
        sub: "A great first impression, and an easy next step.",
        chips: [{ label: "Demo", live: true }, { label: "oakandember.com" }, { label: "Example business" }],
        ask: "Our bakery is great in person. Can our website feel that way too?",
        steps: [
          "Put the menu, hours, and story where people look first",
          "Wrote the copy with Dana so it sounds like the bakery",
          "Made \"Order for pickup\" one tap away on every page",
          "Built the whole thing for phones first",
        ],
        result: "Now people can check the hours, see what's baking, and order ahead in a few taps.",
        footNote: "This is an example project, not a real client.",
      },
      {
        key: "map",
        tab: "Google",
        title: "Google listing",
        sub: "The right details, right when someone's deciding where to go.",
        chips: [{ label: "Demo", live: true }, { label: "Google Business Profile" }, { label: "Example business" }],
        ask: "People keep finding the wrong hours online. Can we clean that up?",
        steps: [
          "Confirmed the business details and who owns the listing",
          "Fixed the regular and holiday hours",
          "Added photos of the shop and the bread",
          "Set up the right categories, services, and regular posts",
        ],
        result: "Everything on the listing is accurate now, so customers can trust what they see.",
        footNote: "I won't promise you a ranking. I'll make sure everything is right.",
      },
      {
        key: "ads",
        tab: "Ads",
        title: "Facebook & Instagram ads",
        sub: "A good reason for your neighbors to stop scrolling.",
        chips: [{ label: "Demo", live: true }, { label: "Thu–Sat" }, { label: "Example business" }],
        ask: "How do we get the word out about our Saturday specials?",
        steps: [
          "Made a few ads around the Saturday bake",
          "Showed them to people who live nearby",
          "Stayed within the budget Dana set",
          "Made it easy to order or ask a question",
        ],
        result: "A simple local campaign with a clear offer, the right audience, and a budget Dana controls.",
        footNote: "Nothing gets spent without your OK.",
      },
      {
        key: "call",
        tab: "Calls",
        title: "AI receptionist",
        sub: "Someone to pick up when your hands are full.",
        chips: [{ label: "Coming soon" }, { label: "Early access" }],
        ask: "What happens when the phone rings during the morning rush?",
        steps: [
          "Answers in the bakery's name",
          "Takes down the question or order",
          "Writes up the request for Dana",
        ],
        result: "This one is still in early access. Ask me what's working today and what I'm still testing.",
      },
    ] satisfies ServicePane[],
  },

  how: {
    eyebrow: "How it works",
    title: "Simple, and you'll always know where things stand",
    steps: [
      {
        n: "01",
        title: "We talk first",
        body: "Tell me about your business and what you'd like to improve. We can meet around Keller or hop on a quick call.",
      },
      {
        n: "02",
        title: "I build it",
        body: "I'll keep you updated as I go and send you a private preview as soon as there's something to see.",
      },
      {
        n: "03",
        title: "You sign off",
        body: "We go through it together and fix anything that isn't right. Nothing goes live until you're happy with it.",
      },
      {
        n: "04",
        title: "I stick around",
        body: "Launch day isn't the end. When your hours, menu, or plans change, I'm just a text away!",
      },
    ],
    invite: { app: "Google Calendar", title: "Call with Luke", when: "Tue · 4:30–5:00 PM · Google Meet", join: "Join" },
    preview: {
      logo: "Oak & Ember",
      headline: "Fresh bread, every morning.",
      button: "Order for pickup",
      toastName: "Luke",
      toastText: " sent a preview",
    },
    thread: { ask: "Could we mention we're family-owned?", reply: "Of course! It's in the preview now.", done: "Approved ✓" },
    log: [
      { what: "Added pumpkin loaf to menu", when: "Oct 3" },
      { what: "Updated holiday hours", when: "Sep 28" },
      { what: "New photos on Google", when: "Sep 20" },
      { what: "Site launched", when: "Sep 12" },
    ],
  },

  pricing: {
    eyebrow: "Pricing",
    title: "Clear pricing, before any work starts",
    plans: [
      {
        key: "web",
        name: "Website",
        before: "from",
        price: "$230",
        includes: ["Designed and written with you", "Fast and easy to use on a phone", "Hosting and small edits: $25/month"],
      },
      {
        key: "map",
        name: "Google listing",
        price: "$100",
        after: "one time",
        includes: ["Setup and verification help", "Accurate hours, photos, and services", "Linked to your website"],
      },
      {
        key: "ads",
        name: "Facebook & Instagram ads",
        price: "$150",
        after: "/ month + ad spend",
        includes: ["Ads made from your real work", "Aimed at people nearby", "Cancel anytime"],
      },
    ] as readonly { key: "web" | "map" | "ads"; name: string; before?: string; price: string; after?: string; includes: readonly string[] }[],
    note: "Every project gets a flat price in writing before I start, so there are no surprises on the invoice. Ad spend goes straight to Meta, never through me.",
  },

  about: {
    eyebrow: "Meet Luke",
    title: "Hey, I'm Luke!",
    body: [
      "I'm 15, I live in Keller, and I've been building things for as long as I can remember: websites, apps, whatever I can get my hands on. I care a lot about good design, and I love it when something I make actually helps someone.",
      "I started Mountline because I kept noticing the same thing. Some of the best businesses around here have websites that don't do them justice. Wrong hours, confusing pages, buttons that don't go anywhere. Those businesses deserve better, and so do the people trying to find them.",
      "So that's what I work on. I build websites, get Google listings right, and run local ads, and I handle every project myself, from the first conversation to the final details. I take the work seriously, and I do my best to make the process easy, and even a little fun.",
    ],
  },

  receptionist: {
    pill: "Coming soon",
    title: "For the calls you can't get to",
    lead: "I'm building an AI receptionist that picks up when you can't and finds out what the caller needs. It's in early access right now, and I'd love to show you how it works!",
    cta: "See the early-access demo",
    call: {
      label: "Example call",
      title: "Call · 6:42 PM",
      when: "After hours",
      lines: [
        { who: "ai", text: "Thanks for calling Oak & Ember. How can I help?" },
        { who: "caller", text: "Do you have sourdough left for tomorrow morning?" },
        { who: "ai", text: "We do. Can I get a name for the pickup?" },
      ],
      smsTitle: "Request for Dana",
      sms: "Maya R. wants 2 sourdough for 9 AM tomorrow. Number: (817) 555-0142",
    },
  },

  faq: {
    eyebrow: "Questions",
    title: "Questions people ask me",
    items: [
      {
        q: "How much does it cost?",
        a: "Starting prices are listed above. After we talk, I'll send you the exact scope and price to approve before anything starts.",
      },
      {
        q: "How long does it take?",
        a: "It depends on the project. I'll give you a realistic timeline before we start, and I'll let you know right away if anything changes.",
      },
      {
        q: "Do I need to write the website myself?",
        a: "Nope! I'll ask you a few questions, write a first draft in your voice, and we'll adjust it until it feels right.",
      },
      {
        q: "Can you fix my current website?",
        a: "Yes. Some sites need a rebuild, and some just need a few things fixed. Send me the link and I'll give you my honest take.",
      },
      {
        q: "Do you work with established businesses?",
        a: "Definitely! Plenty of great businesses have been around for years and just haven't had time to update things online. That's exactly where I can help.",
      },
      {
        q: "Do I own my website?",
        a: "Yes! Your domain, your website, and your Google listing are all in your name. If you ever want to move on, you take everything with you.",
      },
      {
        q: "You're 15. What about school?",
        a: "Fair question! School comes first during the day, so I reply after school and on weekends. I'll always give you an honest timeline, and I'll stick to it.",
      },
      {
        q: "Who would I actually be working with?",
        a: "Me. The person you talk to is the person doing the work, so you'll never get passed around.",
      },
      {
        q: "Do you meet in person?",
        a: "Yes, when it works for both of us. I'm in Keller and happy to meet nearby. A quick Google Meet or Zoom call works too.",
      },
    ],
  },

  final: {
    title: "Have something in mind? Let's talk!",
    lead: "Tell me what's working, what's frustrating, or what you wish your website could do. It's 30 minutes, it's free, and there's no sales pitch.",
    book: "Book a free call",
  },

  footer: {
    description: "Websites, Google listings, and local ads for businesses around Keller. Built by Luke Nordin.",
    siteTitle: "Site",
    contactTitle: "Contact",
    area: "Keller · Southlake · DFW",
    login: "Client login",
    loginHref: "/id",
  },

  // /luke, the page people reach by scanning the printed card (docs/design/card-reference.html).
  card: {
    homeLink: "mountline.dev",
    photoTag: "Keller, Texas",
    eyebrow: "Founder of Mountline · Keller, Texas",
    introStart: "Hey, I'm Luke. I build websites, set up Google listings, and run Facebook ads for businesses around Keller. ",
    introBold: "I'm 15, and I do all of it myself.",
    scanTitle: "Scanned my card? Nice to meet you.",
    scanBody: "Text me your business name, website, or Instagram and I'll take a look. If I showed you a demo, I'll send you the link.",
    actions: { text: "Text me", call: "Call", email: "Email", save: "Save my contact", book: "Book a call" },
    // Prefilled email, unchanged from the original card page.
    emailSubject: "Mountline Studio",
    emailBody: "Hey Luke, it was great meeting you. My business is [business name].",
    demos: {
      eyebrow: "See what I've built",
      title: "Concept sites for local businesses",
      kind: "Concept site",
      open: "Open",
      unpublished: "Not published yet",
      note: "These are concept previews I made, not official websites, unless the business approves them.",
      // Same seven demo sites and addresses as before. The HVAC build isn't published yet, so its row
      // still links to the address (to check on it) but shows the "Not published yet" pill.
      items: [
        { title: "Barber shop", initials: "Ba", tint: "#E8EFFD", href: "https://barber.mountline.dev" },
        { title: "Dog grooming", initials: "Dg", tint: "#E6F3EC", href: "https://ruffscrubdemo.mountline.dev" },
        { title: "Restaurant", initials: "Re", tint: "#FCEBDF", href: "https://slidersdemo.mountline.dev" },
        { title: "Auto detailing", initials: "Ad", tint: "#F3E8FB", href: "https://autodemo.mountline.dev" },
        { title: "Church", initials: "Ch", tint: "#FBEAF1", href: "https://churchdemo.mountline.dev" },
        { title: "Commercial cleaning", initials: "Cc", tint: "#E5F4F6", href: "https://cleaningdemo.mountline.dev" },
        { title: "HVAC", initials: "Hv", href: "https://hvacdemo.mountline.dev", unpublished: true },
      ] as readonly { title: string; initials: string; tint?: string; href: string; unpublished?: boolean }[],
    },
    why: {
      eyebrow: "Why I gave you this card",
      title: "I think I can help",
      body: "Something about your business stood out to me. Maybe the work is great but the website doesn't show it, or people can't find you on Google, or calls are slipping through. That's what I fix.",
    },
    services: {
      eyebrow: "What I do",
      title: "Everything that gets you found",
      items: [
        { key: "web", title: "Websites", body: "Fast on a phone, written with you, and easy to book from." },
        { key: "map", title: "Google listing", body: "Hours, photos, and services set up right so people nearby find you." },
        { key: "ads", title: "Facebook & Instagram ads", body: "Local ads that bring in calls and orders, on a budget you set." },
        { key: "call", title: "AI receptionist", soon: "SOON", body: "Answers the calls you miss and writes up what each caller needs." },
      ] as readonly { key: "web" | "map" | "ads" | "call"; title: string; soon?: string; body: string }[],
    },
    fit: {
      eyebrow: "Best fit for",
      title: "Local businesses that want to be easy to find",
      chips: [
        "Keller & nearby towns",
        "Trades",
        "Personal services",
        "Restaurants",
        "Churches",
        "Independent shops",
        "Owners who like straight answers",
      ],
    },
    close: {
      title: "Let's make your business easy to find",
      body: "Text me, or book a free 30-minute call.",
    },
    footer: { place: "Mountline · Keller, Texas", home: "Home", email: "Email" },
  },

  metadata: {
    title: "Mountline | Websites for Businesses Around Keller, TX",
    description:
      "Websites, Google Business Profiles, and local Facebook and Instagram ads for businesses in Keller, Southlake, Roanoke, and nearby. Work directly with Luke Nordin.",
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
