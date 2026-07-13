import { cleanSignalBusinessName } from "./business-name.ts"

export type SignalOfficialWebsiteStatus =
  | "verified_official_website"
  | "likely_official_website"
  | "no_official_website_found"
  | "website_unreachable"
  | "website_parked"
  | "website_broken"
  | "website_unknown"

export type SignalSocialProfileAssessment = {
  platform: "facebook" | "instagram" | "other"
  profileUrl: string
  displayName: string | null
  matchingPhone: boolean
  matchingCity: boolean
  matchingAddress: boolean
  matchingWebsite: boolean
  confidence: number
  official: boolean
  verificationExplanation: string
}

function normalizedName(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/\b(?:llc|inc|company|co|ltd)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizedPhone(value: string | null | undefined) {
  const digits = (value || "").replace(/\D/g, "")
  return digits.length >= 10 ? digits.slice(-10) : ""
}

function normalizedHost(value: string | null | undefined) {
  try {
    return new URL(/^https?:\/\//i.test(value || "") ? value! : `https://${value}`).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return ""
  }
}

function nameMatches(left: string | null | undefined, right: string | null | undefined) {
  const a = normalizedName(left)
  const b = normalizedName(right)
  if (!a || !b) return false
  if (a === b || a.includes(b) || b.includes(a)) return true
  const leftTokens = a.split(" ").filter((token) => token.length >= 3)
  const rightTokens = b.split(" ").filter((token) => token.length >= 3)
  const shared = leftTokens.filter((token) => rightTokens.includes(token)).length
  return shared >= Math.min(2, leftTokens.length, rightTokens.length)
}

export function detectSignalParkedWebsite(input: {
  url?: string | null
  pageTitle?: string | null
  description?: string | null
  headings?: string[]
  text?: string | null
}) {
  const combined = [input.url, input.pageTitle, input.description, ...(input.headings || []), input.text]
    .filter(Boolean)
    .join(" ")
  return /\b(?:domain (?:is )?for sale|buy this domain|parked (?:free|domain)|sedo domain parking|afternic|hugedomains|coming soon page|website coming soon|future home of|default web site page)\b/i.test(combined)
}

export function assessSignalOfficialWebsite(input: {
  businessName: string
  websiteUrl: string | null
  listingWebsite?: boolean
  reachable: boolean
  broken?: boolean
  pageTitle?: string | null
  openGraphSiteName?: string | null
  structuredNames?: string[]
  visiblePhones?: string[]
  expectedPhone?: string | null
  addressText?: string | null
  expectedAddress?: string | null
  city?: string | null
  linkedSocialUrls?: string[]
  expectedSocialUrls?: string[]
  pageText?: string | null
}) {
  if (!input.websiteUrl) {
    return { status: "no_official_website_found" as const, confidence: 0, accepted: false, evidence: ["No website candidate was supplied."] }
  }
  if (!input.reachable) {
    return {
      status: input.broken ? "website_broken" as const : "website_unreachable" as const,
      confidence: input.listingWebsite ? 58 : 35,
      accepted: Boolean(input.listingWebsite),
      evidence: [input.listingWebsite ? "The structured listing supplied this website, but its public page could not be read." : "The website candidate could not be read."],
    }
  }
  if (detectSignalParkedWebsite({
    url: input.websiteUrl,
    pageTitle: input.pageTitle,
    description: input.pageText,
  })) {
    return { status: "website_parked" as const, confidence: 92, accepted: true, evidence: ["The public page contains parked-domain or domain-for-sale language."] }
  }

  const evidence: string[] = []
  let score = input.listingWebsite ? 26 : 0
  const identityNames = [input.openGraphSiteName, ...(input.structuredNames || []), input.pageTitle].filter(Boolean) as string[]
  if (identityNames.some((name) => nameMatches(input.businessName, name))) {
    score += 38
    evidence.push("The public website identity matches the business name.")
  }
  const expectedPhone = normalizedPhone(input.expectedPhone)
  if (expectedPhone && (input.visiblePhones || []).some((phone) => normalizedPhone(phone) === expectedPhone)) {
    score += 28
    evidence.push("The website phone matches the structured listing.")
  }
  const city = normalizedName(input.city)
  const addressText = normalizedName(`${input.addressText || ""} ${input.pageText || ""}`)
  if (city && addressText.includes(city)) {
    score += 15
    evidence.push("The website references the expected city.")
  }
  const expectedAddress = normalizedName(input.expectedAddress)
  const streetNumber = expectedAddress.match(/^\d+/)?.[0]
  if (streetNumber && addressText.includes(streetNumber)) {
    score += 12
    evidence.push("The website address agrees with the structured listing.")
  }
  const expectedSocialHosts = new Set((input.expectedSocialUrls || []).map(normalizedHost).filter(Boolean))
  if ((input.linkedSocialUrls || []).some((url) => expectedSocialHosts.has(normalizedHost(url)))) {
    score += 10
    evidence.push("The website links to a matching public social profile.")
  }
  score = Math.min(96, score)
  const accepted = score >= 58 && evidence.length >= 1
  return {
    status: score >= 78 && evidence.length >= 2
      ? "verified_official_website" as const
      : accepted
        ? "likely_official_website" as const
        : "website_unknown" as const,
    confidence: score,
    accepted,
    evidence: evidence.length ? evidence : ["The candidate domain did not match enough business identity signals."],
  }
}

export function assessSignalSocialProfile(input: {
  businessName: string
  profileUrl: string
  title?: string | null
  snippet?: string | null
  expectedPhone?: string | null
  expectedCity?: string | null
  expectedAddress?: string | null
  expectedWebsite?: string | null
}) : SignalSocialProfileAssessment {
  const text = `${input.title || ""} ${input.snippet || ""}`
  const host = normalizedHost(input.profileUrl)
  const platform = host.includes("instagram.com") ? "instagram" : host.includes("facebook.com") ? "facebook" : "other"
  const displayName = cleanSignalBusinessName(input.title?.split(/\s[-–—|:]\s/)[0], { city: input.expectedCity }).name
  const businessMatch = nameMatches(input.businessName, displayName || input.title)
  const phone = normalizedPhone(input.expectedPhone)
  const matchingPhone = Boolean(phone && normalizedPhone(text).includes(phone))
  const city = normalizedName(input.expectedCity)
  const matchingCity = Boolean(city && normalizedName(text).includes(city))
  const expectedAddressNumber = normalizedName(input.expectedAddress).match(/^\d+/)?.[0]
  const matchingAddress = Boolean(expectedAddressNumber && normalizedName(text).includes(expectedAddressNumber))
  const websiteHost = normalizedHost(input.expectedWebsite)
  const matchingWebsite = Boolean(websiteHost && normalizedName(text).includes(normalizedName(websiteHost.split(".")[0])))
  const corroborationCount = [matchingPhone, matchingCity, matchingAddress, matchingWebsite].filter(Boolean).length
  const confidence = Math.min(96, (businessMatch ? 44 : 0) + (matchingPhone ? 28 : 0) + (matchingAddress ? 18 : 0) + (matchingWebsite ? 18 : 0) + (matchingCity ? 14 : 0))
  const official = businessMatch && corroborationCount >= 1 && confidence >= 58
  const reasons = [
    businessMatch ? "display name" : null,
    matchingPhone ? "phone" : null,
    matchingCity ? "city" : null,
    matchingAddress ? "address" : null,
    matchingWebsite ? "website" : null,
  ].filter(Boolean)
  return {
    platform,
    profileUrl: input.profileUrl,
    displayName,
    matchingPhone,
    matchingCity,
    matchingAddress,
    matchingWebsite,
    confidence,
    official,
    verificationExplanation: official
      ? `The profile appears official because its ${reasons.join(" and ")} agree with the business identity.`
      : "The profile did not match enough independent identity signals to mark it official.",
  }
}
