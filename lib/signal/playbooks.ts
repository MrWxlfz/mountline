import type {
  SignalComplianceTier,
  SignalOutreachMode,
  SignalRelevantDemo,
} from "@/lib/supabase/types"

export type SignalPlaybookKey =
  | "auto_detailing"
  | "barber_salon"
  | "hvac"
  | "roofing_contractors_home_services"
  | "medical_dental"
  | "general_local_business"

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
}

const PLAYBOOK_KEYWORDS: Array<[SignalPlaybookKey, string[]]> = [
  ["medical_dental", ["medical", "clinic", "doctor", "dentist", "dental", "orthodont", "healthcare", "practice"]],
  ["auto_detailing", ["auto detail", "detailing", "car wash", "ceramic", "paint correction"]],
  ["barber_salon", ["barber", "salon", "hair", "spa", "beauty"]],
  ["hvac", ["hvac", "air conditioning", "heating", "cooling", "ac repair"]],
  [
    "roofing_contractors_home_services",
    ["roof", "contractor", "home service", "plumbing", "electric", "landscap", "construction", "remodel"],
  ],
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
