export type SignalIdentityAnchorType =
  | "places_url"
  | "official_website"
  | "name_address"
  | "name_phone"
  | "name_city"
  | "social_profile"
  | "business_name"
  | "unknown"

export type SignalIdentityAnchorStrength = "strong" | "moderate" | "weak"

export type SignalInputOverrides = {
  businessName?: string | null
  address?: string | null
  phone?: string | null
  websiteUrl?: string | null
}

export type ParsedSignalBusinessInput = {
  raw: string
  urls: string[]
  officialWebsiteUrl: string | null
  socialUrls: string[]
  mapsUrl: string | null
  googlePlaceId: string | null
  phone: string | null
  phoneE164: string | null
  businessNameHint: string | null
  submittedName: string | null
  submittedAddress: string | null
  submittedCity: string | null
  submittedState: string | null
  submittedZip: string | null
  submittedLocation: string | null
  locationHint: string | null
  noteFragments: string[]
  query: string
  identityAnchorType: SignalIdentityAnchorType
  identityAnchorStrength: SignalIdentityAnchorStrength
  identityFingerprint: string
}

const SOCIAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "linkedin.com",
  "x.com",
  "twitter.com",
]

const MAP_HOSTS = ["google.com", "maps.google.com", "goo.gl", "maps.app.goo.gl"]

const STREET_SUFFIX = [
  "aly", "alley", "ave", "avenue", "blvd", "boulevard", "cir", "circle", "ct", "court",
  "dr", "drive", "hwy", "highway", "ln", "lane", "loop", "parkway", "pkwy", "pl", "place",
  "plz", "plaza", "rd", "road", "sq", "square", "st", "street", "ter", "terrace", "trl", "trail",
  "way",
].join("|")

const FULL_ADDRESS_RE = new RegExp(
  `\\b\\d{1,7}\\s+[A-Za-z0-9.'’& -]+?\\s+(?:${STREET_SUFFIX})\\b(?:\\s*(?:#|suite|ste\\.?|unit)\\s*[A-Za-z0-9-]+)?\\s*,\\s*[A-Za-z][A-Za-z .'-]+\\s*,\\s*[A-Z]{2}\\s+\\d{5}(?:-\\d{4})?`,
  "i",
)

const STREET_ADDRESS_RE = new RegExp(
  `\\b\\d{1,7}\\s+[A-Za-z0-9.'’& -]+?\\s+(?:${STREET_SUFFIX})\\b(?:\\s*(?:#|suite|ste\\.?|unit)\\s*[A-Za-z0-9-]+)?`,
  "i",
)

const PHONE_RE = /(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/

function clean(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || ""
}

function normalizeUrl(value: string) {
  const trimmed = value.trim().replace(/[),.;]+$/, "")
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
    if (!["http:", "https:"].includes(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

export function signalHostname(value: string | null | undefined) {
  if (!value) return ""
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
      .hostname.toLowerCase().replace(/^www\./, "")
  } catch {
    return ""
  }
}

function hasHost(value: string, hosts: string[]) {
  const host = signalHostname(value)
  return hosts.some((item) => host === item || host.endsWith(`.${item}`))
}

function titleFromHostname(value: string) {
  const host = signalHostname(value).split(".")[0] || ""
  return host
    ? host.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()).trim()
    : null
}

function titleFromProfileOrMap(value: string) {
  try {
    const url = new URL(value)
    const segments = decodeURIComponent(url.pathname).split("/").filter(Boolean)
    const placeIndex = segments.findIndex((segment) => segment.toLowerCase() === "place")
    const raw = placeIndex >= 0 ? segments[placeIndex + 1] : segments.at(-1)
    if (!raw || /^(maps|posts|photos|reels?|profile\.php)$/i.test(raw)) return null
    return raw.replace(/^@/, "").replace(/[+._-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()).trim() || null
  } catch {
    return null
  }
}

function extractPlaceId(value: string) {
  try {
    const url = new URL(value)
    const queryId = url.searchParams.get("place_id")
      || url.searchParams.get("query_place_id")
      || url.searchParams.get("destination_place_id")
    return queryId || decodeURIComponent(url.pathname).match(/\b(ChI[A-Za-z0-9_-]{12,})\b/)?.[1] || null
  } catch {
    return null
  }
}

export function normalizeSignalPhoneE164(value: string | null | undefined) {
  const digits = (value || "").replace(/\D/g, "")
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits
  return national.length === 10 ? `+1${national}` : null
}

export function formatSignalPhone(value: string | null | undefined) {
  const e164 = normalizeSignalPhoneE164(value)
  if (!e164) return clean(value) || null
  const digits = e164.slice(2)
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function normalizeSignalAddress(value: string | null | undefined) {
  return clean(value)
    .toLowerCase()
    .replace(/\b(?:suite|ste\.?|unit)\s*/g, "#")
    .replace(/\s*#\s*/g, " #")
    .replace(/\bparkway\b/g, "pkwy")
    .replace(/\bstreet\b/g, "st")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bboulevard\b/g, "blvd")
    .replace(/\broad\b/g, "rd")
    .replace(/\bdrive\b/g, "dr")
    .replace(/[^a-z0-9#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeName(value: string | null | undefined) {
  return clean(value).toLowerCase().replace(/&/g, " and ")
    .replace(/\b(?:llc|inc|incorporated|corp|corporation|company|co|ltd)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()
}

function cleanBusinessName(value: string | null | undefined) {
  const name = clean(value)
    .replace(/^[\s,;:|\-–—]+|[\s,;:|\-–—]+$/g, "")
    .replace(/\s+(?:at|located at)$/i, "")
    .trim()
  return name && !/^\d/.test(name) ? name.slice(0, 180) : null
}

function parseAddress(value: string | null) {
  if (!value) return { city: null, state: null, zip: null }
  const parts = value.match(/,\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\s*$/i)
  return {
    city: clean(parts?.[1]) || null,
    state: parts?.[2]?.toUpperCase() || null,
    zip: parts?.[3] || null,
  }
}

function trailingLocation(value: string) {
  const match = value.match(/(?:^|,|\s[-–—]\s)\s*([A-Za-z][A-Za-z .'-]+?)(?:,\s*|\s+)([A-Z]{2})(?:\s+(\d{5}(?:-\d{4})?))?\s*$/)
  if (!match || !match.index) return null
  return {
    full: match[0].replace(/^[,\s–—-]+/, "").trim(),
    index: match.index,
    city: clean(match[1]),
    state: match[2].toUpperCase(),
    zip: match[3] || null,
  }
}

function anchorFor(input: {
  mapsUrl: string | null
  websiteUrl: string | null
  socialUrls: string[]
  name: string | null
  address: string | null
  phone: string | null
  city: string | null
}) {
  if (input.mapsUrl) return { type: "places_url" as const, strength: "strong" as const }
  if (input.websiteUrl) return { type: "official_website" as const, strength: "strong" as const }
  if (input.name && input.address) return { type: "name_address" as const, strength: "strong" as const }
  if (input.name && input.phone) return { type: "name_phone" as const, strength: "strong" as const }
  if (input.name && input.city) return { type: "name_city" as const, strength: "moderate" as const }
  if (input.socialUrls.length) return { type: "social_profile" as const, strength: "weak" as const }
  if (input.name) return { type: "business_name" as const, strength: "weak" as const }
  return { type: "unknown" as const, strength: "weak" as const }
}

function fingerprint(input: {
  placeId: string | null
  name: string | null
  address: string | null
  phone: string | null
  websiteUrl: string | null
}) {
  return [
    input.placeId ? `place:${input.placeId}` : null,
    normalizeName(input.name) ? `name:${normalizeName(input.name)}` : null,
    normalizeSignalAddress(input.address) ? `address:${normalizeSignalAddress(input.address)}` : null,
    normalizeSignalPhoneE164(input.phone) ? `phone:${normalizeSignalPhoneE164(input.phone)}` : null,
    signalHostname(input.websiteUrl) ? `domain:${signalHostname(input.websiteUrl)}` : null,
  ].filter(Boolean).join("|")
}

export function parseSignalBusinessInput(
  rawInput: string,
  overrides: SignalInputOverrides = {},
): ParsedSignalBusinessInput {
  const raw = rawInput.trim()
  const urlMatches = raw.match(/(?:https?:\/\/|www\.)[^\s]+/gi) || []
  const urls = Array.from(new Set(urlMatches.map(normalizeUrl).filter(Boolean) as string[]))
  const mapsUrl = urls.find((url) => hasHost(url, MAP_HOSTS) && /maps|place|goo\.gl/i.test(url)) || null
  const socialUrls = urls.filter((url) => hasHost(url, SOCIAL_HOSTS))
  const detectedWebsite = urls.find((url) => !hasHost(url, [...SOCIAL_HOSTS, ...MAP_HOSTS])) || null
  const officialWebsiteUrl = normalizeUrl(clean(overrides.websiteUrl)) || detectedWebsite
  const phoneMatch = raw.match(PHONE_RE)
  const phone = formatSignalPhone(clean(overrides.phone) || phoneMatch?.[0] || null)

  const addressMatch = raw.match(FULL_ADDRESS_RE) || raw.match(STREET_ADDRESS_RE)
  const detectedAddress = clean(addressMatch?.[0]) || null
  const submittedAddress = clean(overrides.address) || detectedAddress
  const addressParts = parseAddress(submittedAddress)

  let textOnly = raw
  for (const url of urlMatches) textOnly = textOnly.replace(url, " ")
  if (phoneMatch?.[0]) textOnly = textOnly.replace(phoneMatch[0], " ")
  textOnly = textOnly.replace(/\s+/g, " ").trim()

  let nameText = textOnly
  let trailingNotes = ""
  if (detectedAddress) {
    const index = nameText.toLowerCase().indexOf(detectedAddress.toLowerCase())
    if (index >= 0) {
      trailingNotes = nameText.slice(index + detectedAddress.length)
      nameText = nameText.slice(0, index)
    }
  }

  let city = addressParts.city
  let state = addressParts.state
  let zip = addressParts.zip
  let locationHint = submittedAddress
  if (!submittedAddress) {
    const location = trailingLocation(nameText)
    if (location) {
      nameText = nameText.slice(0, location.index)
      city = location.city || null
      state = location.state
      zip = location.zip
      locationHint = [city, state, zip].filter(Boolean).join(", ")
    }
  }

  const explicitName = cleanBusinessName(overrides.businessName)
  const inferredName = cleanBusinessName(nameText)
    || (officialWebsiteUrl ? titleFromHostname(officialWebsiteUrl) : null)
    || (socialUrls[0] ? titleFromProfileOrMap(socialUrls[0]) : null)
    || (mapsUrl ? titleFromProfileOrMap(mapsUrl) : null)
  const submittedName = explicitName || inferredName

  const noteFragments = [trailingNotes]
    .map((value) => clean(value).replace(/^[\s,;:|\-–—]+/, "").trim())
    .filter((value) => value.length > 2)
  const submittedLocation = submittedAddress || [city, state, zip].filter(Boolean).join(", ") || null
  const anchor = anchorFor({
    mapsUrl,
    websiteUrl: officialWebsiteUrl,
    socialUrls,
    name: submittedName,
    address: submittedAddress,
    phone,
    city,
  })
  const googlePlaceId = mapsUrl ? extractPlaceId(mapsUrl) : null

  return {
    raw,
    urls,
    officialWebsiteUrl,
    socialUrls,
    mapsUrl,
    googlePlaceId,
    phone,
    phoneE164: normalizeSignalPhoneE164(phone),
    businessNameHint: submittedName,
    submittedName,
    submittedAddress,
    submittedCity: city,
    submittedState: state,
    submittedZip: zip,
    submittedLocation,
    locationHint: locationHint || submittedLocation,
    noteFragments,
    query: [submittedName, submittedAddress || submittedLocation, phone].filter(Boolean).join(" ") || raw,
    identityAnchorType: anchor.type,
    identityAnchorStrength: anchor.strength,
    identityFingerprint: fingerprint({
      placeId: googlePlaceId,
      name: submittedName,
      address: submittedAddress,
      phone,
      websiteUrl: officialWebsiteUrl,
    }),
  }
}
