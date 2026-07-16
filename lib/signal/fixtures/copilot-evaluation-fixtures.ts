import type { SignalAssistanceMode, SignalCopilotInput, SignalRecommendationDecision } from "../copilot.ts"

export type SignalCopilotEvaluationFixture = {
  id: string
  description: string
  input: SignalCopilotInput
  expected: {
    mode: SignalAssistanceMode
    recommendation: SignalRecommendationDecision
    conceptReady: boolean
    salesReady: boolean
  }
}

const confirmed = {
  identityState: "exact_match",
  artifactSafetyPassed: true,
} as const

export const customCleanersCopilotFixture: SignalCopilotEvaluationFixture = {
  id: "custom-cleaners-regression",
  description: "Custom Cleaners after correcting the Magicpin identity failure",
  input: {
    ...confirmed,
    businessName: "Custom Cleaners",
    address: "1540 Keller Pkwy #150, Keller, TX 76248",
    phone: "(817) 337-4480",
    city: "Keller",
    state: "TX",
    category: "Dry cleaner / laundry service",
    locationType: "storefront",
    websiteStatus: "no_official_website_verified",
    providerPlaceId: "custom-cleaners-keller-place",
    chainStatus: "likely_independent",
    verifiedFacts: [
      "Custom Cleaners",
      "1540 Keller Pkwy #150, Keller, TX 76248",
      "(817) 337-4480",
      "BirdEye is a third-party profile with a substantial public review history.",
    ],
    rejectedSources: ["Magicpin"],
    sourceClassifications: ["places_map_listing", "review_platform", "aggregator"],
    opportunityScore: 62,
    opportunityEvidenceCount: 1,
    pipelineStage: "analyzed",
  },
  expected: { mode: "verification_outreach", recommendation: "Verify one detail, then pursue", conceptReady: true, salesReady: true },
}

export const signalCopilotEvaluationFixtures: SignalCopilotEvaluationFixture[] = [
  customCleanersCopilotFixture,
  {
    id: "exact-poor-site",
    description: "Exact identity with a weak official website",
    input: { ...confirmed, businessName: "Oak & Ember Grooming", phone: "(817) 555-0101", category: "Dog groomer", websiteStatus: "website_weak", websiteUrl: "https://oakember.example", verifiedFacts: ["Booking link is difficult to find", "Dog grooming services are listed"], verifiedServices: ["Dog grooming"], opportunityScore: 78, opportunityEvidenceCount: 3, pipelineStage: "analyzed" },
    expected: { mode: "opportunity_outreach", recommendation: "Pursue now", conceptReady: true, salesReady: true },
  },
  {
    id: "exact-strong-site",
    description: "Exact identity with a strong site and no honest replacement angle",
    input: { ...confirmed, businessName: "Polished Local Studio", phone: "(817) 555-0102", category: "Beauty salon", websiteStatus: "website_strong", websiteUrl: "https://polished.example", strongExistingSite: true, verifiedFacts: ["Clear services", "Working booking route"], opportunityScore: 34, opportunityEvidenceCount: 3, pipelineStage: "analyzed" },
    expected: { mode: "opportunity_outreach", recommendation: "Hold", conceptReady: false, salesReady: false },
  },
  {
    id: "facebook-primary",
    description: "Confirmed Facebook-primary local business",
    input: { ...confirmed, businessName: "Pine & Paws Grooming", phone: "(817) 555-0103", category: "Dog groomer", websiteStatus: "social_only", socialUrls: ["https://facebook.com/pineandpaws"], verifiedFacts: ["Facebook profile matches the public phone and location"], opportunityScore: 60, opportunityEvidenceCount: 2, pipelineStage: "analyzed" },
    expected: { mode: "verification_outreach", recommendation: "Verify one detail, then pursue", conceptReady: true, salesReady: true },
  },
  {
    id: "appointment-spa",
    description: "Appointment-driven spa with no official site",
    input: { ...confirmed, businessName: "Juniper Day Spa", phone: "(817) 555-0104", category: "Day spa", websiteStatus: "no_official_website_verified", verifiedFacts: ["Appointment phone is public"], opportunityScore: 64, opportunityEvidenceCount: 1, pipelineStage: "analyzed" },
    expected: { mode: "verification_outreach", recommendation: "Verify one detail, then pursue", conceptReady: true, salesReady: true },
  },
  {
    id: "walk-in-donut",
    description: "Walk-in donut shop with no verified website",
    input: { ...confirmed, businessName: "Sunrise Donuts", address: "100 Main St, Keller, TX", phone: "(817) 555-0105", category: "Donut shop", locationType: "storefront", websiteStatus: "no_official_website_verified", verifiedFacts: ["Public storefront and phone agree"], opportunityScore: 63, opportunityEvidenceCount: 1, pipelineStage: "analyzed" },
    expected: { mode: "verification_outreach", recommendation: "Verify one detail, then pursue", conceptReady: true, salesReady: true },
  },
  {
    id: "groomer-outdated-site",
    description: "Dog groomer with an outdated site",
    input: { ...confirmed, businessName: "New Leaf Grooming", phone: "(817) 555-0106", category: "Pet grooming", websiteStatus: "website_weak", websiteUrl: "https://newleaf.example", verifiedFacts: ["The public site lists grooming", "The contact page is outdated"], verifiedServices: ["Grooming"], opportunityScore: 76, opportunityEvidenceCount: 3, pipelineStage: "analyzed" },
    expected: { mode: "opportunity_outreach", recommendation: "Pursue now", conceptReady: true, salesReady: true },
  },
  {
    id: "contractor-no-quote",
    description: "Contractor with no clear quote request",
    input: { ...confirmed, businessName: "North Gate Home Services", phone: "(817) 555-0107", category: "Residential contractor", websiteStatus: "website_weak", websiteUrl: "https://northgate.example", verifiedFacts: ["Residential repair services are listed", "No quote form was found"], verifiedServices: ["Residential repair"], opportunityScore: 80, opportunityEvidenceCount: 3, pipelineStage: "analyzed" },
    expected: { mode: "opportunity_outreach", recommendation: "Pursue now", conceptReady: true, salesReady: true },
  },
  {
    id: "directory-outranks-official",
    description: "Directory result ranks above an accepted official site",
    input: { ...confirmed, businessName: "Cedar Chair Barber Co.", phone: "(817) 555-0108", category: "Barber shop", websiteStatus: "verified_official_website", websiteUrl: "https://cedarchair.example", verifiedFacts: ["Official site and phone agree", "Booking path is unclear"], rejectedSources: ["Directory publisher"], sourceClassifications: ["directory", "official_business_site"], opportunityScore: 74, opportunityEvidenceCount: 3, pipelineStage: "analyzed" },
    expected: { mode: "opportunity_outreach", recommendation: "Pursue now", conceptReady: true, salesReady: true },
  },
  {
    id: "provider-failure",
    description: "Places provider failure with enough fallback evidence",
    input: { ...confirmed, businessName: "Fallback Bakery", address: "10 Oak St, Keller, TX", phone: "(817) 555-0109", category: "Bakery", websiteStatus: "no_official_website_verified", verifiedFacts: ["Name, address, and phone agree across public listings"], opportunityScore: 61, opportunityEvidenceCount: 1, pipelineStage: "analyzed", providerIssues: [{ provider: "Google Places", operation: "Website discovery", status: "degraded", error_category: "authentication", user_explanation: "Google Places was unavailable. Signal used matching listing evidence.", retryable: false, effect_on_analysis: "Website discovery is less complete.", last_successful_use: null }] },
    expected: { mode: "verification_outreach", recommendation: "Verify one detail, then pursue", conceptReady: true, salesReady: true },
  },
  {
    id: "ambiguous-common-name",
    description: "Ambiguous common-name business",
    input: { businessName: "Main Street Cafe", identityState: "ambiguous", category: "Cafe", pipelineStage: "found", artifactSafetyPassed: true },
    expected: { mode: "identity_resolution", recommendation: "Research further", conceptReady: false, salesReady: false },
  },
  {
    id: "identity-correction",
    description: "Identity correction after a bad directory resolution",
    input: { ...confirmed, businessName: "Custom Cleaners", address: "1540 Keller Pkwy #150, Keller, TX", phone: "(817) 337-4480", category: "Dry cleaner", websiteStatus: "no_official_website_verified", rejectedSources: ["Magicpin"], opportunityScore: 60, opportunityEvidenceCount: 1, pipelineStage: "analyzed" },
    expected: { mode: "verification_outreach", recommendation: "Verify one detail, then pursue", conceptReady: true, salesReady: true },
  },
  {
    id: "stale-concept",
    description: "Stale concept after identity correction",
    input: { ...confirmed, businessName: "Corrected Business", phone: "(817) 555-0112", category: "Local business", artifactSafetyPassed: false, websiteStatus: "no_official_website_verified", opportunityScore: 60, opportunityEvidenceCount: 1, pipelineStage: "analyzed" },
    expected: { mode: "verification_outreach", recommendation: "Verify one detail, then pursue", conceptReady: true, salesReady: true },
  },
  {
    id: "wrong-social",
    description: "Social profile belongs to another entity",
    input: { ...confirmed, businessName: "Custom Cleaners", phone: "(817) 337-4480", category: "Dry cleaner", websiteStatus: "no_official_website_verified", rejectedSources: ["Magicpin Instagram", "Magicpin Facebook"], sourceClassifications: ["aggregator", "official_social_network"], opportunityScore: 60, opportunityEvidenceCount: 1, pipelineStage: "analyzed" },
    expected: { mode: "verification_outreach", recommendation: "Verify one detail, then pursue", conceptReady: true, salesReady: true },
  },
  {
    id: "contacted-follow-up",
    description: "Contacted lead requiring follow-up",
    input: { ...confirmed, businessName: "Follow-up Grooming", phone: "(817) 555-0114", category: "Dog groomer", websiteStatus: "website_weak", websiteUrl: "https://followup.example", verifiedFacts: ["Grooming and phone are verified"], opportunityScore: 72, opportunityEvidenceCount: 3, pipelineStage: "contacted", outreachStatus: "awaiting_reply", lastOutreachSummary: "Owner asked to see the concept Friday." },
    expected: { mode: "active_deal_support", recommendation: "Pursue now", conceptReady: true, salesReady: true },
  },
  {
    id: "owner-send-it",
    description: "Owner says send it",
    input: { ...confirmed, businessName: "Send It Bakery", phone: "(817) 555-0115", email: "owner@example.com", category: "Bakery", websiteStatus: "no_official_website_verified", opportunityScore: 66, opportunityEvidenceCount: 2, pipelineStage: "contacted", outreachStatus: "permission_to_send_demo", lastOutreachSummary: "Owner said to send the concept by email." },
    expected: { mode: "active_deal_support", recommendation: "Pursue now", conceptReady: true, salesReady: true },
  },
  {
    id: "owner-already-busy",
    description: "Owner says already busy",
    input: { ...confirmed, businessName: "Busy Detailer", phone: "(817) 555-0116", category: "Auto detailer", websiteStatus: "website_weak", websiteUrl: "https://busy.example", opportunityScore: 70, opportunityEvidenceCount: 3, pipelineStage: "contacted", outreachStatus: "contacted", lastOutreachSummary: "Owner said the shop is already busy." },
    expected: { mode: "active_deal_support", recommendation: "Pursue now", conceptReady: true, salesReady: true },
  },
  {
    id: "existing-developer",
    description: "Owner has an existing developer",
    input: { ...confirmed, businessName: "Developer Supported Spa", phone: "(817) 555-0117", category: "Day spa", websiteStatus: "website_weak", websiteUrl: "https://supported.example", opportunityScore: 68, opportunityEvidenceCount: 3, pipelineStage: "contacted", outreachStatus: "contacted", lastOutreachSummary: "Owner has a developer and may forward a focused audit." },
    expected: { mode: "active_deal_support", recommendation: "Pursue now", conceptReady: true, salesReady: true },
  },
  {
    id: "explicit-decline",
    description: "Explicit decline",
    input: { ...confirmed, businessName: "Closed Loop Shop", phone: "(817) 555-0118", category: "Local business", pipelineStage: "lost", outreachStatus: "do_not_contact", explicitDecline: true, doNotContact: true },
    expected: { mode: "active_deal_support", recommendation: "Skip", conceptReady: false, salesReady: false },
  },
  {
    id: "won-conversion",
    description: "Won lead ready for client and project conversion",
    input: { ...confirmed, businessName: "Won Home Services", phone: "(817) 555-0119", email: "owner@won.example", category: "Contractor", websiteStatus: "website_weak", websiteUrl: "https://won.example", opportunityScore: 82, opportunityEvidenceCount: 4, pipelineStage: "won", outreachStatus: "won", lastOutreachSummary: "Scope approved and deposit link requested." },
    expected: { mode: "active_deal_support", recommendation: "Pursue now", conceptReady: true, salesReady: true },
  },
]
