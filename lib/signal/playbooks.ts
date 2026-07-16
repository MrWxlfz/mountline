import type {
  SignalComplianceTier,
  SignalOutreachMode,
  SignalRelevantDemo,
} from "@/lib/supabase/types"

export type SignalPlaybookKey =
  | "auto_detailing"
  | "barber_salon"
  | "dry_cleaner_laundry"
  | "pet_grooming"
  | "bakery_donut"
  | "spa_wellness"
  | "hvac"
  | "roofing_contractors_home_services"
  | "medical_dental"
  | "restaurant_food"
  | "beauty_wellness"
  | "general_local_business"
  | "unknown_needs_review"

export type SignalPlaybook = {
  key: SignalPlaybookKey
  name: string
  complianceTier: SignalComplianceTier
  relevantDemo: SignalRelevantDemo
  recommendedOutreachMode: SignalOutreachMode
  idealSignals: string[]
  visibleWeaknesses: string[]
  workflowOpportunities: string[]
  discoveryQuestions: string[]
  redFlags: string[]
  complianceNotes: string[]
  customerJourney?: {
    model: string
    primaryIntent: string
    dominantContactRoute: string
    likelyConversionAction: string
  }
  offerModules?: Array<{
    key: string
    label: string
    verificationQuestion: string
  }>
}

export const MEDICAL_COMPLIANCE_WARNING =
  "Compliance-gated sector. Do not propose or build workflows involving patient information, clinical decisions, call transcription, intake data, or EHR systems without formal legal/compliance review, appropriate contracts, and approved infrastructure."

export const SIGNAL_PLAYBOOKS: Record<SignalPlaybookKey, SignalPlaybook> = {
  auto_detailing: {
    key: "auto_detailing",
    name: "Auto Detailing",
    complianceTier: "standard",
    relevantDemo: "auto-detailing",
    recommendedOutreachMode: "local_student",
    idealSignals: [
      "Local owner-operated shop or mobile detailer",
      "Ceramic coating, paint correction, or recurring maintenance packages",
      "Public photos, packages, or quote requests already matter",
      "Customers ask repeated questions before booking",
    ],
    visibleWeaknesses: [
      "Service packages are hard to compare",
      "Gallery or before-and-after proof is thin",
      "Quote request flow is unclear",
      "Ceramic protection upsells are buried or missing",
    ],
    workflowOpportunities: [
      "Package clarity and stronger presentation",
      "Quote/request-detail flow",
      "Photo gallery organization",
      "Follow-up and rebooking workflow discovery",
      "Review presentation",
    ],
    discoveryQuestions: [
      "How do customers usually book today?",
      "Do most leads come from social, calls, or the website?",
      "Are ceramic coating or recurring maintenance packages important?",
      "Do customers often ask the same questions before booking?",
      "Would clearer packages/photos make booking easier?",
    ],
    redFlags: [
      "No public contact route",
      "Business appears inactive",
      "Only asks for automated outreach",
    ],
    complianceNotes: ["Standard public business research only."],
    customerJourney: { model: "Appointment or quote driven", primaryIntent: "Compare services, proof, and availability", dominantContactRoute: "Quote request, phone, or booking link", likelyConversionAction: "Request a quote or book service" },
    offerModules: [
      { key: "packages", label: "Verified service packages", verificationQuestion: "Which packages and add-ons should customers see?" },
      { key: "service_area", label: "Service area or shop location", verificationQuestion: "Is service mobile, shop-based, or both?" },
      { key: "quote", label: "Quote request", verificationQuestion: "What information is needed before giving a quote?" },
      { key: "gallery", label: "Before-and-after proof", verificationQuestion: "Which photos may Mountline use?" },
    ],
  },
  barber_salon: {
    key: "barber_salon",
    name: "Barber / Salon",
    complianceTier: "standard",
    relevantDemo: "barber-shop",
    recommendedOutreachMode: "local_student",
    idealSignals: [
      "Active local shop with visible booking needs",
      "Uses Square or another booking platform worth preserving",
      "Multiple barbers, service menus, products, or locations",
      "Location/hours and barber availability matter to customers",
    ],
    visibleWeaknesses: [
      "Booking tool exists but is not presented clearly",
      "Services or pricing are hard to scan",
      "Team/barber pages are missing",
      "Location, hours, or reviews are hard to find",
    ],
    workflowOpportunities: [
      "Modern website while preserving existing booking",
      "Service menu clarity",
      "Barber/team pages",
      "Retail product presentation",
      "Reminder or follow-up workflow discovery",
    ],
    discoveryQuestions: [
      "What booking tool do you already use and want to keep?",
      "Do customers find individual barbers or book first available?",
      "Do services/pricing change often?",
      "Do products or multiple locations matter?",
      "Where do new customers usually find the shop?",
    ],
    redFlags: [
      "No clear public business presence",
      "No permission to use team photos or service details",
    ],
    complianceNotes: ["Standard public business research only."],
    customerJourney: { model: "Appointment or walk-in driven", primaryIntent: "Review services, provider availability, and pricing", dominantContactRoute: "Booking link or phone", likelyConversionAction: "Book an appointment or confirm walk-in availability" },
    offerModules: [
      { key: "services", label: "Verified services", verificationQuestion: "Which services and prices should be shown?" },
      { key: "booking", label: "Existing booking route", verificationQuestion: "Which booking tool should the site preserve?" },
      { key: "team", label: "Team or provider details", verificationQuestion: "Do clients select a provider or first available?" },
    ],
  },
  dry_cleaner_laundry: {
    key: "dry_cleaner_laundry",
    name: "Dry Cleaner / Laundry",
    complianceTier: "standard",
    relevantDemo: "none",
    recommendedOutreachMode: "professional_studio",
    idealSignals: ["Confirmed local storefront", "Customers need services, hours, directions, and phone information", "Public reviews or listing activity show an operating business"],
    visibleWeaknesses: ["No official website is confirmed", "Services and turnaround information are unclear", "Customers may rely on directory listings or phone calls for basic information"],
    workflowOpportunities: ["Mobile location-and-services website", "Hours, directions, and call button", "Verified alterations information", "Verified pickup or delivery information", "Commercial account inquiry"],
    discoveryQuestions: ["Which services do customers call about most often?", "Do customers currently use an official website or another page for hours and services?", "Are alterations, wash-and-fold, pickup, or delivery offered?"],
    redFlags: ["Do not assume alterations, wash-and-fold, pickup, or delivery", "Do not claim the business has no website until the owner or strong public evidence confirms it"],
    complianceNotes: ["Use only verified service and turnaround details."],
    customerJourney: { model: "Storefront and repeat-service driven", primaryIntent: "Confirm services, hours, location, and turnaround expectations", dominantContactRoute: "Walk-in, directions, or phone", likelyConversionAction: "Visit the storefront or call with a service question" },
    offerModules: [
      { key: "services", label: "Verified cleaning services", verificationQuestion: "Is the business dry cleaning, general laundry, or both?" },
      { key: "alterations", label: "Alterations information", verificationQuestion: "Are alterations offered?" },
      { key: "wash_fold", label: "Wash-and-fold information", verificationQuestion: "Is wash-and-fold offered?" },
      { key: "pickup_delivery", label: "Pickup or delivery information", verificationQuestion: "Is pickup or delivery offered?" },
      { key: "hours_directions", label: "Hours, directions, and call button", verificationQuestion: "Which hours and phone number should customers use?" },
    ],
  },
  pet_grooming: {
    key: "pet_grooming",
    name: "Dog Groomer / Pet Services",
    complianceTier: "standard",
    relevantDemo: "none",
    recommendedOutreachMode: "professional_studio",
    idealSignals: ["Appointment-driven local service", "Service and policy questions recur before booking", "Before-and-after proof matters"],
    visibleWeaknesses: ["Booking or contact route is unclear", "Breed, size, vaccination, or new-client policies are hard to find", "Gallery is outdated or thin"],
    workflowOpportunities: ["Service and booking clarity", "New-client and vaccination policies", "Before-and-after gallery", "Availability and contact route"],
    discoveryQuestions: ["Are you accepting new clients?", "What should a new client know before requesting an appointment?", "Do clients book online, call, or message?"],
    redFlags: ["Do not invent breed, size, vaccination, or new-client policies"],
    complianceNotes: ["Use verified public policy and service information only."],
    customerJourney: { model: "Appointment driven", primaryIntent: "Check services, policies, proof, and availability", dominantContactRoute: "Booking request, phone, or message", likelyConversionAction: "Request or book a grooming appointment" },
    offerModules: [
      { key: "services", label: "Verified grooming services", verificationQuestion: "Which grooming services are currently offered?" },
      { key: "policies", label: "New-client and pet policies", verificationQuestion: "What should new clients know before booking?" },
      { key: "gallery", label: "Before-and-after gallery", verificationQuestion: "Which photos may Mountline use?" },
      { key: "booking", label: "Booking or contact route", verificationQuestion: "How should new clients request an appointment?" },
    ],
  },
  bakery_donut: {
    key: "bakery_donut",
    name: "Donut Shop / Bakery",
    complianceTier: "standard",
    relevantDemo: "none",
    recommendedOutreachMode: "professional_studio",
    idealSignals: ["Walk-in local business", "Hours, location, menu highlights, and photos drive visits", "Custom orders or catering may matter when verified"],
    visibleWeaknesses: ["Hours or directions are difficult to confirm", "Menu highlights and photos are scattered", "Custom-order contact route is unclear"],
    workflowOpportunities: ["Mobile hours-and-location site", "Menu highlights and photos", "Directions", "Verified custom-order or catering inquiry"],
    discoveryQuestions: ["What do first-time customers most often ask?", "Do you take custom or catering orders?", "Where should customers check current hours and holiday updates?"],
    redFlags: ["Do not invent menu items, prices, ordering, catering, or holiday hours"],
    complianceNotes: ["Keep menu, price, and ordering claims explicitly verified."],
    customerJourney: { model: "Walk-in and order driven", primaryIntent: "Check hours, location, menu highlights, and ordering options", dominantContactRoute: "Directions, walk-in, or phone", likelyConversionAction: "Visit, call, or place an order" },
    offerModules: [
      { key: "hours_location", label: "Hours, location, and directions", verificationQuestion: "Which hours should customers rely on?" },
      { key: "menu", label: "Verified menu highlights", verificationQuestion: "Which items should be highlighted?" },
      { key: "custom_orders", label: "Custom-order contact", verificationQuestion: "Are custom or catering orders offered?" },
      { key: "photos", label: "Current product photos", verificationQuestion: "Which current photos may Mountline use?" },
    ],
  },
  spa_wellness: {
    key: "spa_wellness",
    name: "Spa / Wellness",
    complianceTier: "standard",
    relevantDemo: "barber-shop",
    recommendedOutreachMode: "professional_studio",
    idealSignals: ["Appointment-driven services", "Trust, credentials, policies, and booking influence decisions", "A calm visual presentation matters"],
    visibleWeaknesses: ["Services or practitioner information are unclear", "Booking and policy information are scattered", "Trust signals are difficult to evaluate"],
    workflowOpportunities: ["Verified service pages", "Practitioner and credential presentation", "Booking route", "Policies and treatment guidance"],
    discoveryQuestions: ["Do clients choose by treatment, practitioner, or availability?", "Which booking tool should remain in place?", "Which policies or preparation questions come up most often?"],
    redFlags: ["Do not make medical, credential, or treatment-result claims without verification"],
    complianceNotes: ["Treat medical services as compliance-gated when official evidence supports that classification."],
    customerJourney: { model: "Appointment driven", primaryIntent: "Compare services, trust, practitioner fit, and availability", dominantContactRoute: "Booking link or phone", likelyConversionAction: "Book or request an appointment" },
    offerModules: [
      { key: "services", label: "Verified services", verificationQuestion: "Which services and descriptions are current?" },
      { key: "practitioners", label: "Practitioner information", verificationQuestion: "Which practitioners and credentials may be shown?" },
      { key: "booking", label: "Existing booking route", verificationQuestion: "Which booking system should the site use?" },
      { key: "policies", label: "Verified client policies", verificationQuestion: "Which booking and preparation policies should be shown?" },
    ],
  },
  hvac: {
    key: "hvac",
    name: "HVAC",
    complianceTier: "standard",
    relevantDemo: "none",
    recommendedOutreachMode: "professional_studio",
    idealSignals: [
      "Emergency or high-value service requests",
      "Service areas, estimates, or maintenance plans matter",
      "Missed calls or busy-season follow-up could matter",
      "Website trust and routing affect customer confidence",
    ],
    visibleWeaknesses: [
      "Emergency/service request route is unclear",
      "Service-area pages are missing or thin",
      "Estimate intake is not structured",
      "FAQ answers are scattered",
    ],
    workflowOpportunities: [
      "Trust-first website redesign",
      "Emergency/service request routing",
      "Estimate request intake",
      "Missed-call follow-up workflow discovery",
      "Public FAQ/knowledge assistant for general questions only",
    ],
    discoveryQuestions: [
      "How do new service calls usually come in?",
      "What happens when a call is missed during busy hours?",
      "Are estimate requests tracked in one place?",
      "Is seasonal maintenance follow-up handled manually?",
      "Which requests take the most receptionist/admin time?",
    ],
    redFlags: [
      "No public contact route",
      "Claims require licensing or technical validation",
      "Requests for automated spam or review manipulation",
    ],
    complianceNotes: ["Keep AI suggestions practical and office-work focused."],
  },
  roofing_contractors_home_services: {
    key: "roofing_contractors_home_services",
    name: "Roofing / Contractors / Home Services",
    complianceTier: "standard",
    relevantDemo: "none",
    recommendedOutreachMode: "professional_studio",
    idealSignals: [
      "High-ticket estimates or project-based work",
      "Project galleries and trust proof matter",
      "Storm seasons or busy periods can create lead chaos",
      "Homeowners need clear status updates",
    ],
    visibleWeaknesses: [
      "Project gallery is limited or hard to scan",
      "Estimate request form is missing or too vague",
      "Public education pages are thin",
      "Client/project status updates are manual and scattered",
    ],
    workflowOpportunities: [
      "Trust-first site",
      "Project gallery",
      "Estimate request form",
      "Storm/insurance public education pages",
      "Lead organization and project/client portal discovery",
    ],
    discoveryQuestions: [
      "How are estimate requests submitted today?",
      "What information do you need before sending someone out?",
      "Do leads get lost during storm seasons or busy periods?",
      "How do homeowners receive progress updates?",
      "Is there a common repeated question the office handles?",
    ],
    redFlags: [
      "No public proof of active services",
      "Insurance/legal claims would need careful review",
      "Requests for fake urgency or fabricated results",
    ],
    complianceNotes: ["Keep storm/insurance content general and factual."],
  },
  medical_dental: {
    key: "medical_dental",
    name: "Medical / Dental",
    complianceTier: "compliance_gated",
    relevantDemo: "none",
    recommendedOutreachMode: "professional_studio",
    idealSignals: [
      "Public service pages, providers, hours, and locations matter",
      "Public marketing website could be clearer",
      "Front desk handles general non-patient-specific questions",
      "Practice wants marketing/public-site review first",
    ],
    visibleWeaknesses: [
      "Services, providers, locations, or hours are hard to find",
      "Public FAQ organization is weak",
      "Contact routes are unclear",
      "Public marketing site feels dated",
    ],
    workflowOpportunities: [
      "Public marketing website redesign",
      "Clearer public service pages",
      "Locations/hours/contact clarity",
      "Public FAQ organization",
      "General administrative discovery conversation",
    ],
    discoveryQuestions: [
      "Does your public website make services, providers, hours, and contact routes clear?",
      "Are there general non-patient-specific questions the front desk answers repeatedly?",
      "Is the practice looking for marketing/public-site improvements, or internal operational review?",
      "Do not ask for patient records or real patient examples.",
    ],
    redFlags: [
      "Requests involving patient information",
      "Clinical triage, diagnosis, intake AI, EHR integrations, or call transcription",
      "Any expectation that Mountline provides HIPAA-compliant AI services",
    ],
    complianceNotes: [MEDICAL_COMPLIANCE_WARNING],
  },
  restaurant_food: {
    key: "restaurant_food",
    name: "Restaurant / Food",
    complianceTier: "standard",
    relevantDemo: "none",
    recommendedOutreachMode: "professional_studio",
    idealSignals: [
      "Menus, hours, ordering, and location clarity matter",
      "Reservations, pickup, or catering paths affect conversion",
      "Visual trust and food presentation are public-facing",
      "Operational questions often repeat before ordering or booking",
    ],
    visibleWeaknesses: [
      "Menu or ordering path is hard to find",
      "Hours, locations, or contact details are unclear",
      "Catering or event inquiries are buried",
      "Photos and trust cues are thin",
    ],
    workflowOpportunities: [
      "Menu and ordering clarity",
      "Reservations or catering request routing",
      "Photo and proof presentation",
      "FAQ and event inquiry organization",
      "Public contact flow cleanup",
    ],
    discoveryQuestions: [
      "Do most customers call, walk in, reserve, or order online?",
      "Are catering or event requests handled cleanly today?",
      "Do customers regularly ask about hours, menu items, or locations?",
      "Is the current ordering or reservation path helping or getting in the way?",
    ],
    redFlags: [
      "No clear public menu, hours, or contact path",
      "Requests for fake reviews or misleading urgency",
    ],
    complianceNotes: ["Use public business facts and visible website evidence only."],
  },
  beauty_wellness: {
    key: "beauty_wellness",
    name: "Beauty / Wellness",
    complianceTier: "standard",
    relevantDemo: "barber-shop",
    recommendedOutreachMode: "local_student",
    idealSignals: [
      "Services, packages, and booking flow drive conversions",
      "Photos, proof, and trust matter heavily",
      "Recurring appointments and upsells are public-facing",
      "A polished brand presentation influences selection",
    ],
    visibleWeaknesses: [
      "Booking path exists but is hard to trust or find",
      "Services or pricing are hard to scan",
      "Visual presentation feels dated or inconsistent",
      "Proof, gallery, or staff details are limited",
    ],
    workflowOpportunities: [
      "Service and package clarity",
      "Booking presentation while keeping current booking tools",
      "Gallery and proof organization",
      "Retail/add-on presentation",
      "Reminder and rebooking workflow discovery",
    ],
    discoveryQuestions: [
      "What booking tool do you already use and want to keep?",
      "Do clients choose by provider, by service, or by first available?",
      "Are packages, memberships, or add-ons important to the business?",
      "Would clearer photos or service pages help more visitors book?",
    ],
    redFlags: [
      "No public service clarity or booking route",
      "Requests for unsupported medical claims",
    ],
    complianceNotes: ["Treat med spa as medical only when official content clearly indicates medical care."],
  },
  general_local_business: {
    key: "general_local_business",
    name: "General Local Business",
    complianceTier: "standard",
    relevantDemo: "none",
    recommendedOutreachMode: "professional_studio",
    idealSignals: [
      "Local business with public contact routes",
      "Clear service/product offer",
      "Website, booking, payment, or FAQ clarity could help",
      "Human-entered observations support a specific outreach reason",
    ],
    visibleWeaknesses: [
      "Website presentation is unclear",
      "Contact or booking path is buried",
      "FAQ or service details are thin",
      "Payment or client-portal workflow could be useful",
    ],
    workflowOpportunities: [
      "Website redesign",
      "Clearer contact flow",
      "Public booking/payment integration",
      "FAQ organization",
      "Client portal where relevant",
    ],
    discoveryQuestions: [
      "Where do most new customers find the business today?",
      "What do customers ask before they feel ready to book or buy?",
      "Is the current website helping, or mostly just existing?",
      "Are payments, forms, or customer updates handled manually?",
    ],
    redFlags: [
      "No credible business signal",
      "No public contact route",
      "Outreach would require unsupported claims",
    ],
    complianceNotes: ["Use only public business facts and human-entered notes."],
  },
  unknown_needs_review: {
    key: "unknown_needs_review",
    name: "Unknown / Needs Review",
    complianceTier: "standard",
    relevantDemo: "none",
    recommendedOutreachMode: "professional_studio",
    idealSignals: [
      "Official website is confirmed but category fit is still unclear",
      "Human review is needed before choosing a playbook",
    ],
    visibleWeaknesses: [
      "Category is ambiguous or unsupported",
      "Public service language is too limited to classify confidently",
    ],
    workflowOpportunities: [
      "Confirm the real category before deeper review",
      "Capture verified observations to support a correction",
    ],
    discoveryQuestions: [
      "What does the business clearly sell or provide?",
      "Is the official website confirmed?",
      "What public evidence best supports the right playbook?",
    ],
    redFlags: [
      "Discovery depends on unsupported assumptions",
    ],
    complianceNotes: ["Hold for manual review when confidence is low."],
  },
}

const PLAYBOOK_KEYWORDS: Array<[SignalPlaybookKey, string[]]> = [
  ["medical_dental", ["medical", "clinic", "doctor", "dentist", "dental", "orthodont", "healthcare", "practice", "dermatology", "physician"]],
  ["dry_cleaner_laundry", ["dry cleaner", "dry cleaning", "laundry", "laundromat", "wash and fold", "garment care"]],
  ["pet_grooming", ["dog groom", "pet groom", "groomer", "grooming salon", "pet spa"]],
  ["bakery_donut", ["donut", "doughnut", "bakery", "bakeshop", "pastry"]],
  ["spa_wellness", ["day spa", "massage spa", "facial spa", "skin spa"]],
  ["auto_detailing", ["auto detail", "mobile detail", "car detail", "detailing", "car wash", "ceramic coating", "ceramic", "paint correction"]],
  ["barber_salon", ["barber", "barbershop", "salon", "haircut", "hair cut", "fade", "beard trim", "stylist", "blowout"]],
  ["beauty_wellness", ["beauty", "spa", "lashes", "nails", "esthetician", "facial", "wellness", "massage", "skincare", "med spa"]],
  ["hvac", ["hvac", "air conditioning", "heating", "cooling", "ac repair"]],
  [
    "roofing_contractors_home_services",
    ["roof", "contractor", "home service", "plumbing", "electric", "landscap", "construction", "remodel"],
  ],
  ["restaurant_food", ["restaurant", "food truck", "catering", "cafe", "grill", "kitchen", "pizza", "coffee"]],
]

export function getSignalPlaybook(key: string | null | undefined) {
  if (key && key in SIGNAL_PLAYBOOKS) {
    return SIGNAL_PLAYBOOKS[key as SignalPlaybookKey]
  }

  return SIGNAL_PLAYBOOKS.general_local_business
}

export function inferSignalPlaybook(industry: string | null | undefined) {
  const normalized = industry?.trim().toLowerCase() || ""
  if (!normalized) return "general_local_business" as SignalPlaybookKey

  return (
    PLAYBOOK_KEYWORDS.find(([, keywords]) =>
      keywords.some((keyword) => normalized.includes(keyword)),
    )?.[0] || "general_local_business"
  )
}

export function getComplianceTierForPlaybook(
  playbookKey: string | null | undefined,
): SignalComplianceTier {
  return getSignalPlaybook(playbookKey).complianceTier
}
