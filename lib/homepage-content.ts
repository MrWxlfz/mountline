export const homepageNav = [
  { label: "Work", href: "#work" },
  { label: "What we build", href: "#what-we-build" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About", href: "#about" },
] as const

export const trustPoints = [
  "Founder-led in Keller, Texas",
  "Direct communication",
  "Clear scope and next steps",
  "Designed for real local businesses",
] as const

export const serviceLanes = [
  {
    id: "website-launch",
    index: "01",
    name: "Website Launch",
    headline: "A clear, high-trust home for your business.",
    audience:
      "For local businesses that need customers to quickly understand what they offer, where they are, and what to do next.",
    problem:
      "The business may be excellent in person, but its website is missing, outdated, confusing, or difficult to use on a phone.",
    outcome:
      "A focused online presence built around useful information, credible proof, and one clear customer action.",
    cta: "Explore websites",
    href: "#website-launch",
  },
  {
    id: "lead-recovery",
    index: "02",
    name: "Mountline Lead Recovery",
    headline: "Stop good inquiries from quietly going cold.",
    audience:
      "For roofers, HVAC companies, remodelers, pool companies, landscapers, contractors, and other lead-heavy local services.",
    problem:
      "Missed calls, slow replies, scattered tracking, and inconsistent follow-up make valuable opportunities easy to forget.",
    outcome:
      "A managed response and follow-up path with clearer ownership, steadier communication, and visible outcomes.",
    cta: "Explore Lead Recovery",
    href: "/lead-recovery",
  },
  {
    id: "custom-systems",
    index: "03",
    name: "Custom Systems",
    headline: "Focused tools for workflows that should be easier.",
    audience:
      "For a business or select team with one specific customer or operational workflow creating avoidable friction.",
    problem:
      "Requests, status updates, customer information, or internal handoffs are being managed through a fragile mix of messages and spreadsheets.",
    outcome:
      "The smallest useful portal, request flow, dashboard, internal tool, or integration that solves the actual problem.",
    cta: "Discuss a system",
    href: "#review",
    interest: "custom-systems",
  },
] as const

export const workShowcase = [
  {
    id: "served-sliders",
    title: "Served Sliders",
    category: "Restaurant · Keller concept",
    challenge:
      "A neighborhood food business needs the menu, personality, location, and call-ahead path to land immediately.",
    direction:
      "A high-energy, food-first experience that makes the product the proof and keeps the next action close.",
    action: "Menu and call-ahead",
    href: "https://slidersdemo.mountline.dev",
    image: "/demo-previews/restaurant.jpg",
    imageAlt:
      "Served Sliders restaurant concept with bold menu-first typography and food photography",
    accent: "#c86b3f",
    accentSoft: "rgba(200, 107, 63, 0.24)",
    focalPoint: "50% 0%",
    mobileFocalPoint: "34% 0%",
  },
  {
    id: "ruff-scrub",
    title: "Ruff Scrub",
    category: "Dog grooming · Southlake concept",
    challenge:
      "Pet owners need warmth, useful service guidance, and confidence before asking about an appointment.",
    direction:
      "A friendly phone-first experience built around personality, care, services, and a reassuring call path.",
    action: "Services and phone",
    href: "https://ruffscrubdemo.mountline.dev",
    image: "/demo-previews/dog-groomer.jpg",
    imageAlt:
      "Ruff Scrub dog-grooming concept with warm typography, service actions, and a grooming photograph",
    accent: "#d66a4a",
    accentSoft: "rgba(214, 106, 74, 0.22)",
    focalPoint: "50% 0%",
    mobileFocalPoint: "30% 0%",
  },
  {
    id: "ricks-barbering",
    title: "Rick’s Barbering",
    category: "Barber shop · Dallas concept",
    challenge:
      "A bold local brand still needs its services, character, and call path to feel immediate.",
    direction:
      "A stripped-back black-and-white direction that lets attitude lead while the customer action stays unmistakable.",
    action: "Services and call",
    href: "https://barber.mountline.dev",
    image: "/demo-previews/barber-shop.jpg",
    imageAlt:
      "Rick's Barbering concept with bold black-and-white typography and direct service actions",
    accent: "#d7d2ca",
    accentSoft: "rgba(215, 210, 202, 0.18)",
    focalPoint: "50% 0%",
    mobileFocalPoint: "24% 0%",
  },
  {
    id: "nomad-auto-spa",
    title: "Nomad Auto Spa",
    category: "Mobile detailing · DFW concept",
    challenge:
      "A mobile detailer needs service clarity and a direct request path without looking like every other detail shop.",
    direction:
      "A precise dark experience that makes the service area, offer, and phone action feel direct and premium.",
    action: "Services and phone",
    href: "https://autodemo.mountline.dev",
    image: "/demo-previews/auto-detailing.jpg",
    imageAlt:
      "Nomad Auto Spa concept with a minimal black layout and red service accents",
    accent: "#ef4242",
    accentSoft: "rgba(239, 66, 66, 0.2)",
    focalPoint: "50% 0%",
    mobileFocalPoint: "23% 0%",
  },
  {
    id: "elevation",
    title: "Elevation",
    category: "Church and community · Southlake concept",
    challenge:
      "A first-time visitor needs to understand the community, the experience, and the next step before arriving.",
    direction:
      "A warm, image-led direction with clear visit, watch, ministry, and next-step paths.",
    action: "Plan a visit",
    href: "https://churchdemo.mountline.dev",
    image: "/demo-previews/church.jpg",
    imageAlt:
      "Elevation church concept with a warm full-bleed worship image and clear visit actions",
    accent: "#f17a3d",
    accentSoft: "rgba(241, 122, 61, 0.22)",
    focalPoint: "50% 0%",
    mobileFocalPoint: "38% 0%",
  },
  {
    id: "squeaky-cleaning",
    title: "Squeaky Cleaning",
    category: "Commercial cleaning · DFW concept",
    challenge:
      "A service company needs to feel dependable, local, and easy to contact without leaning on generic contractor language.",
    direction:
      "A bright editorial system that pairs service clarity with an obvious walkthrough request.",
    action: "Request a walkthrough",
    href: "https://cleaningdemo.mountline.dev",
    image: "/demo-previews/commercial-cleaning.jpg",
    imageAlt:
      "Squeaky Cleaning commercial-cleaning concept with an editorial service layout and walkthrough action",
    accent: "#4a82b7",
    accentSoft: "rgba(74, 130, 183, 0.22)",
    focalPoint: "50% 0%",
    mobileFocalPoint: "28% 0%",
  },
] as const

export const heroWork = workShowcase.slice(0, 4)

export const publicConceptRoutes = [
  { title: "Barber shop concept", href: "/work/barber-shop" },
  { title: "Pet grooming concept", href: "/work/pet-grooming" },
  { title: "Restaurant concept", href: "/work/restaurant" },
  { title: "Auto detailing concept", href: "/work/auto-detailing" },
  { title: "Beauty studio concept", href: "/work/beauty-studio" },
  { title: "Contractor concept", href: "/work/contractor" },
  { title: "Local gym concept", href: "/work/local-gym" },
  { title: "Product website concept", href: "/work/startup" },
] as const

export const decisionStages = [
  {
    id: "understand",
    number: "01",
    title: "Understand",
    label: "Offer, location, and useful context",
    copy:
      "Customers should know what the business offers, where it works, and what matters before they spend time searching.",
  },
  {
    id: "trust",
    number: "02",
    title: "Trust",
    label: "Quality, personality, and proof",
    copy:
      "The online experience should feel like the real business—specific, credible, and worthy of the next conversation.",
  },
  {
    id: "act",
    number: "03",
    title: "Act",
    label: "One obvious next move",
    copy:
      "Calling, visiting, booking, ordering, or requesting an estimate should never require interpretation.",
  },
] as const

export const leadRecoverySteps = [
  {
    number: "01",
    title: "New inquiry or missed call",
    copy: "A prospect reaches out through a connected form, phone path, or agreed source.",
  },
  {
    number: "02",
    title: "Professional response",
    copy: "An owner-approved acknowledgement goes out through the configured channel.",
  },
  {
    number: "03",
    title: "Owner or team notified",
    copy: "The right person receives the inquiry, context, and next action.",
  },
  {
    number: "04",
    title: "Follow-up continues",
    copy: "Configured follow-up continues until a reply, handoff, stop rule, or clear outcome.",
  },
  {
    number: "05",
    title: "Estimate or appointment",
    copy: "The prospect gets a clear path to schedule, request an estimate, or continue with the team.",
  },
  {
    number: "06",
    title: "Outcome tracked",
    copy: "The opportunity is marked booked, active, closed, not a fit, or still in follow-up.",
  },
] as const

export const leadRecoveryMetrics = [
  "Response time",
  "Contact rate",
  "Appointments booked",
  "Leads recovered",
  "Estimated revenue influenced",
] as const

export const portalCapabilities = [
  "Project status",
  "Next action",
  "Preview and live-site links",
  "Approvals and feedback",
  "Support messages",
  "Payment and launch information",
] as const

export const customSystemExamples = [
  {
    title: "Client portals",
    copy: "One place for status, useful links, payments, and support.",
  },
  {
    title: "Quote or request flows",
    copy: "Collect the right details before the next conversation begins.",
  },
  {
    title: "Customer dashboards",
    copy: "Surface the information a customer actually needs to see.",
  },
  {
    title: "Operational tools",
    copy: "Replace a fragile handoff or spreadsheet-heavy process.",
  },
  {
    title: "Integrations",
    copy: "Move useful information between systems that should remain in place.",
  },
] as const

export const processLanes = [
  {
    name: "Website Launch",
    steps: [
      ["Review", "Current site, audience, offer, and customer questions."],
      ["Plan", "Pages, content priorities, proof, and primary actions."],
      ["Build", "Design, mobile behavior, content structure, and integrations."],
      ["Launch", "Final checks, domain, analytics, and handoff."],
      ["Support", "Updates and ongoing care when they are useful."],
    ],
  },
  {
    name: "Lead Recovery",
    steps: [
      ["Map sources", "Forms, calls, ads, CRM, and ownership."],
      ["Connect responses", "Where inquiries go and who is notified."],
      ["Configure follow-up", "Approved language, timing, stop rules, and handoff."],
      ["Test and launch", "Verify normal paths and edge cases before live leads enter."],
      ["Review outcomes", "Response, contact, booking, and lead outcomes."],
    ],
  },
  {
    name: "Custom Systems",
    steps: [
      ["Define the problem", "What breaks, for whom, and how often."],
      ["Scope the smallest useful system", "Define the useful first version and its boundaries."],
      ["Build and validate", "Test with the people who will use it."],
      ["Deploy", "Connect the live workflow and document it."],
      ["Improve", "Make changes from real use, not imagined features."],
    ],
  },
] as const

export const startingOffers = {
  website: {
    label: "Website Launch",
    eyebrow: "Right-sized local websites",
    options: [
      {
        name: "Focused one-page launch",
        price: "From $750",
        copy:
          "A clear, professional site with core business information and one primary customer action.",
      },
      {
        name: "Business website",
        price: "From $1,500",
        copy:
          "Deeper service structure, proof, content, and more than one useful customer path.",
      },
    ],
  },
  leadRecovery: {
    label: "Mountline Lead Recovery",
    eyebrow: "Founding-client pilot",
    setupPrice: "About $500 setup",
    recurringPrice: "About $250 per month",
    copy:
      "Lead-source mapping, response-path setup, configured follow-up, testing, and outcome review. Exact channels and integrations are confirmed before setup.",
  },
  customSystems: {
    label: "Custom Systems",
    eyebrow: "Scoped after a fit conversation",
    price: "Defined before the build",
    copy:
      "Mountline scopes the smallest useful version and quotes it clearly. If discovery is needed, it is separated from implementation.",
  },
} as const

export const reviewOptions = [
  { value: "website-launch", label: "Website" },
  { value: "lead-recovery", label: "Calls, leads, or follow-up" },
  { value: "booking-support", label: "Booking or customer support" },
  { value: "custom-systems", label: "Portal or custom system" },
  { value: "not-sure", label: "Not sure yet" },
] as const

export const faqs = [
  {
    question: "Does the business need more than a simple website?",
    answer:
      "No. If customers mainly need to see what the business offers, when it is open, where to go, and how to make contact, a focused site may be the right answer. Mountline recommends the smallest scope that makes the business clearer and easier to choose.",
  },
  {
    question: "Can Mountline work with an existing website?",
    answer:
      "Yes. Mountline can preserve what is working, improve specific weak points, or rebuild only when that is the clearer path.",
  },
  {
    question: "Will Lead Recovery replace the existing CRM?",
    answer:
      "Usually not. Mountline Lead Recovery can work around an existing CRM and improve response and follow-up where a reliable connection is available. A replacement would only be discussed if the current tool is clearly the problem.",
  },
  {
    question: "What happens after a missed call or form submission?",
    answer:
      "The exact behavior depends on the configured setup. It can send an approved initial response, notify the right person, organize the opportunity, and begin the agreed follow-up path. Everything is documented and tested before launch.",
  },
  {
    question: "Can the team take over the conversation?",
    answer:
      "Yes. The goal is to help the team respond reliably, not keep people out of the conversation. Handoff and stop rules are configured so a person can take over at any time.",
  },
  {
    question: "What can a small local business start with?",
    answer:
      "A focused one-page Website Launch can cover services or a menu, hours, directions, proof, phone and social links, and one clear next step. A custom system is not required.",
  },
  {
    question: "How quickly can a project launch?",
    answer:
      "Timing depends on scope and content readiness. A focused website usually moves faster than a multi-page build, Lead Recovery setup, or Custom System. The timeline is confirmed before work begins.",
  },
  {
    question: "How is Lead Recovery measured?",
    answer:
      "Mountline can review response time, contact rate, appointments booked, leads recovered, and lead outcomes. Estimated revenue influenced is shown only as a directional estimate with its assumptions.",
  },
  {
    question: "Does Mountline build custom software?",
    answer:
      "Yes, when a specific workflow justifies it. That can include portals, request flows, project-status tools, dashboards, internal tools, and integrations. Mountline does not recommend custom software when an existing tool or simpler website solves the problem.",
  },
  {
    question: "What happens after launch?",
    answer:
      "Website support and updates follow the agreed scope. Lead Recovery outcomes can be reviewed and its configuration adjusted. Custom Systems can receive monitoring, fixes, or a clearly defined improvement phase. Ongoing work is added only where useful.",
  },
] as const
