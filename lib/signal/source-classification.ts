import { signalHostname } from "./input-parser.ts"

export type SignalSourceClassification =
  | "official_business_site"
  | "likely_official"
  | "booking_platform"
  | "official_social_network"
  | "places_map_listing"
  | "reputable_local_organization"
  | "directory"
  | "aggregator"
  | "marketplace"
  | "review_platform"
  | "search_engine"
  | "unknown"

export type SignalSourceClassificationResult = {
  hostname: string
  classification: SignalSourceClassification
  publisherName: string | null
  canonicalIdentityAuthority: "strong" | "supporting" | "none"
  canSupplyCanonicalName: boolean
  canBeOfficialWebsite: boolean
  reason: string
}

const DOMAIN_REGISTRY: Array<{
  domains: string[]
  classification: SignalSourceClassification
  publisher: string
  reason: string
}> = [
  { domains: ["magicpin.com"], classification: "aggregator", publisher: "Magicpin", reason: "Magicpin publishes listings and offers for many unrelated businesses." },
  { domains: ["yelp.com", "trustpilot.com", "tripadvisor.com"], classification: "review_platform", publisher: "Review platform", reason: "This domain publishes reviews for many businesses." },
  { domains: ["yellowpages.com", "manta.com", "foursquare.com", "mapquest.com", "hotfrog.com", "merchantcircle.com", "local.com", "cylex.us.com", "bizapedia.com", "dandb.com", "bbb.org", "chamberofcommerce.com"], classification: "directory", publisher: "Business directory", reason: "This domain is a multi-business directory, not the listed business's official site." },
  { domains: ["facebook.com", "instagram.com", "linkedin.com", "tiktok.com", "x.com", "twitter.com", "youtube.com"], classification: "official_social_network", publisher: "Social network", reason: "A social profile is an identity candidate until independent details corroborate it." },
  { domains: ["google.com", "maps.google.com", "maps.app.goo.gl", "goo.gl", "apple.com", "maps.apple.com", "bing.com"], classification: "places_map_listing", publisher: "Map provider", reason: "A structured map listing can support identity but is not the business's website." },
  { domains: ["duckduckgo.com", "search.yahoo.com", "googleusercontent.com"], classification: "search_engine", publisher: "Search provider", reason: "Search result pages and cached search content have no canonical identity authority." },
  { domains: ["opentable.com", "resy.com", "vagaro.com", "mindbodyonline.com", "styleseat.com", "schedulicity.com", "fresha.com", "calendly.com"], classification: "booking_platform", publisher: "Booking platform", reason: "This domain provides booking infrastructure for many businesses." },
  { domains: ["doordash.com", "ubereats.com", "grubhub.com", "thumbtack.com", "angi.com", "homeadvisor.com", "etsy.com", "amazon.com"], classification: "marketplace", publisher: "Marketplace", reason: "This domain is a marketplace or lead platform, not the business's official site." },
]

const DIRECTORY_PATH = /\/(?:business|biz|listing|listings|store|stores|place|places|directory|companies|company|merchant|profile)\//i
const DIRECTORY_LANGUAGE = /\b(?:claim this business|businesses near you|find local businesses|write a review|ratings and reviews|coupons? near you|browse businesses)\b/i
const MARKETPLACE_LANGUAGE = /\b(?:available providers|request a quote from pros|compare providers|delivery fee|order delivery)\b/i

const DIRECTORY_PUBLISHER_NAMES = new Set([
  "magicpin",
  "yelp",
  "yellow pages",
  "yellowpages",
  "mapquest",
  "manta",
  "foursquare",
  "hotfrog",
  "merchantcircle",
  "cylex",
  "bizapedia",
  "dun and bradstreet",
  "d and b",
  "better business bureau",
  "bbb",
  "chamber of commerce",
  "chamberofcommerce",
])

export function isKnownSignalDirectoryPublisherName(value: string | null | undefined) {
  const normalized = (value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return DIRECTORY_PUBLISHER_NAMES.has(normalized)
}

function registeredDomain(hostname: string) {
  return DOMAIN_REGISTRY.find((entry) => entry.domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)))
}

export function classifySourceDomain(
  value: string | null | undefined,
  context: { title?: string | null; snippet?: string | null; confirmedOfficial?: boolean } = {},
): SignalSourceClassificationResult {
  const hostname = signalHostname(value)
  if (!hostname) {
    return {
      hostname: "",
      classification: "unknown",
      publisherName: null,
      canonicalIdentityAuthority: "none",
      canSupplyCanonicalName: false,
      canBeOfficialWebsite: false,
      reason: "The source URL is missing or invalid.",
    }
  }

  if (context.confirmedOfficial) {
    return {
      hostname,
      classification: "official_business_site",
      publisherName: null,
      canonicalIdentityAuthority: "strong",
      canSupplyCanonicalName: true,
      canBeOfficialWebsite: true,
      reason: "Mountline or a strongly matched structured listing confirmed this business domain.",
    }
  }

  const registered = registeredDomain(hostname)
  if (registered) {
    const supporting = registered.classification === "places_map_listing" || registered.classification === "reputable_local_organization"
    return {
      hostname,
      classification: registered.classification,
      publisherName: registered.publisher,
      canonicalIdentityAuthority: supporting ? "supporting" : "none",
      canSupplyCanonicalName: false,
      canBeOfficialWebsite: false,
      reason: registered.reason,
    }
  }

  const combined = `${value || ""} ${context.title || ""} ${context.snippet || ""}`
  if (DIRECTORY_PATH.test(value || "") || DIRECTORY_LANGUAGE.test(combined)) {
    return {
      hostname,
      classification: "directory",
      publisherName: null,
      canonicalIdentityAuthority: "none",
      canSupplyCanonicalName: false,
      canBeOfficialWebsite: false,
      reason: "The page structure or language matches a multi-business directory.",
    }
  }
  if (MARKETPLACE_LANGUAGE.test(combined)) {
    return {
      hostname,
      classification: "marketplace",
      publisherName: null,
      canonicalIdentityAuthority: "none",
      canSupplyCanonicalName: false,
      canBeOfficialWebsite: false,
      reason: "The page language indicates a marketplace or provider aggregator.",
    }
  }

  return {
    hostname,
    classification: "unknown",
    publisherName: null,
    canonicalIdentityAuthority: "supporting",
    canSupplyCanonicalName: false,
    canBeOfficialWebsite: true,
    reason: "The domain is not a known intermediary, but identity agreement is still required before it is official.",
  }
}

export function isBlockedIdentityPublisher(classification: SignalSourceClassification) {
  return [
    "booking_platform", "official_social_network", "places_map_listing", "directory", "aggregator",
    "marketplace", "review_platform", "search_engine",
  ].includes(classification)
}

export function sourceClassificationToLegacyType(classification: SignalSourceClassification) {
  if (classification === "official_social_network") return "social" as const
  if (["directory", "aggregator", "marketplace", "review_platform", "booking_platform"].includes(classification)) return "directory" as const
  if (["search_engine", "places_map_listing"].includes(classification)) return "search_result" as const
  if (["official_business_site", "likely_official", "unknown"].includes(classification)) return "likely_official_site" as const
  return "unknown" as const
}
