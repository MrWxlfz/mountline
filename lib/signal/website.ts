import "server-only"

import { lookup } from "node:dns/promises"
import net from "node:net"
import type { SignalConfidence } from "@/lib/supabase/types"

const MAX_HTML_BYTES = 300_000
const MAX_TEXT_CHARS = 18_000
const REQUEST_TIMEOUT_MS = 8_000
const USER_AGENT = "MountlineSignal/1.0 (+https://mountline.dev)"

export type SignalEvidence = {
  url: string
  signal: string
  snippet: string
  confidence: SignalConfidence
}

export type SignalPageScan = {
  url: string
  status: number
  title: string | null
  metaDescription: string | null
  openGraphSiteName: string | null
  jsonLdNames: string[]
  logoAltText: string[]
  headings: string[]
  textExcerpt: string
  ctaWords: string[]
  serviceLanguage: string[]
  pricingLanguage: string[]
  hoursLocationLanguage: string[]
  emails: string[]
  phones: string[]
  links: string[]
  bookingLinks: string[]
  socialLinks: string[]
  hasContactForm: boolean
  detectedWebsitePlatform: string | null
  detectedBookingPlatform: string | null
  imageCount: number
  evidence: SignalEvidence[]
}

export type SignalWebsiteScan = {
  scanned_at: string
  requested_url: string | null
  scanned_urls: string[]
  pages: SignalPageScan[]
  page_title: string | null
  meta_description: string | null
  open_graph_site_name: string | null
  json_ld_names: string[]
  logo_alt_text: string[]
  headings: string[]
  cta_words: string[]
  service_language: string[]
  pricing_language: string[]
  hours_location_language: string[]
  visible_emails: string[]
  visible_phones: string[]
  booking_links: string[]
  social_links: string[]
  detected_website_platform: string | null
  detected_booking_platform: string | null
  image_count: number
  broken_response: boolean
  error: string | null
  evidence: SignalEvidence[]
}

function unique(values: string[], limit = 20) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).slice(0, limit)
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
}

function stripHtml(value: string) {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function extractFirst(html: string, pattern: RegExp) {
  return decodeHtml(html.match(pattern)?.[1]?.replace(/\s+/g, " ").trim() || "")
    || null
}

function extractMetaDescription(html: string) {
  return (
    extractFirst(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ) ||
    extractFirst(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i,
    )
  )
}

function extractOpenGraphSiteName(html: string) {
  return (
    extractFirst(
      html,
      /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ) ||
    extractFirst(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["'][^>]*>/i,
    ) ||
    extractFirst(
      html,
      /<meta[^>]+name=["']application-name["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    )
  )
}

function walkJsonForNames(value: unknown, names: string[]) {
  if (!value || names.length >= 8) return
  if (Array.isArray(value)) {
    value.forEach((item) => walkJsonForNames(item, names))
    return
  }
  if (typeof value !== "object") return

  const object = value as Record<string, unknown>
  const type = object["@type"]
  const types = Array.isArray(type) ? type : [type]
  const isBusinessLike = types.some(
    (item) =>
      typeof item === "string" &&
      /LocalBusiness|Organization|Corporation|Store|AutomotiveBusiness|HealthAndBeautyBusiness|Dentist|Restaurant|HomeAndConstructionBusiness/i.test(item),
  )

  if (isBusinessLike && typeof object.name === "string") {
    names.push(object.name)
  }

  Object.values(object).forEach((item) => walkJsonForNames(item, names))
}

function extractJsonLdNames(html: string) {
  const names: string[] = []
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null

  while ((match = pattern.exec(html)) && names.length < 8) {
    const text = decodeHtml(match[1]).trim()
    if (!text) continue
    try {
      walkJsonForNames(JSON.parse(text), names)
    } catch {
      continue
    }
  }

  return unique(names, 8)
}

function extractLogoAltText(html: string) {
  const values: string[] = []
  const pattern = /<img\b[^>]*>/gi
  let match: RegExpExecArray | null

  while ((match = pattern.exec(html)) && values.length < 8) {
    const tag = match[0]
    const lower = tag.toLowerCase()
    if (!lower.includes("logo") && !lower.includes("brand")) continue
    const alt = extractFirst(tag, /\salt=["']([^"']+)["']/i)
    if (alt) values.push(alt)
  }

  return unique(values, 8)
}

function extractHeadings(html: string) {
  const headings: string[] = []
  const pattern = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi
  let match: RegExpExecArray | null

  while ((match = pattern.exec(html)) && headings.length < 14) {
    const text = stripHtml(match[1])
    if (text) headings.push(text)
  }

  return unique(headings, 14)
}

function extractLinks(html: string, baseUrl: string) {
  const links: string[] = []
  const pattern = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi
  let match: RegExpExecArray | null

  while ((match = pattern.exec(html)) && links.length < 80) {
    const href = decodeHtml(match[1]).trim()
    if (!href || href.startsWith("#") || href.toLowerCase().startsWith("javascript:")) {
      continue
    }

    try {
      links.push(new URL(href, baseUrl).toString())
    } catch {
      continue
    }
  }

  return unique(links, 80)
}

function extractEmails(html: string, text: string) {
  const fromMailto = Array.from(html.matchAll(/mailto:([^"'>?\s]+)/gi)).map(
    (match) => decodeURIComponent(match[1]),
  )
  const fromText = Array.from(
    text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi),
  ).map((match) => match[0])

  return unique([...fromMailto, ...fromText].map((email) => email.toLowerCase()), 8)
}

function extractPhones(html: string, text: string) {
  const fromTel = Array.from(html.matchAll(/tel:([^"'>?\s]+)/gi)).map((match) =>
    decodeURIComponent(match[1]).replace(/[^\d+()-.\s]/g, ""),
  )
  const fromText = Array.from(
    text.matchAll(/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g),
  ).map((match) => match[0])

  return unique([...fromTel, ...fromText], 8)
}

function findTextSignals(text: string, words: string[], limit = 10) {
  const lower = text.toLowerCase()
  return words.filter((word) => lower.includes(word)).slice(0, limit)
}

function detectWebsitePlatform(html: string) {
  const lower = html.toLowerCase()
  if (lower.includes("static.parastorage.com") || lower.includes("wix.com")) return "wix"
  if (lower.includes("cdn.shopify.com") || lower.includes("shopify")) return "shopify"
  if (lower.includes("wp-content") || lower.includes("wordpress")) return "wordpress"
  if (lower.includes("squarespace.com") || lower.includes("static1.squarespace.com")) return "squarespace"
  if (lower.includes("webflow") || lower.includes("assets.website-files.com")) return "webflow"
  if (lower.includes("square.site") || lower.includes("squareup.com")) return "square"
  return null
}

function detectBookingPlatform(links: string[], html: string) {
  const haystack = `${links.join(" ")} ${html}`.toLowerCase()
  if (haystack.includes("squareup.com") || haystack.includes("square.site")) return "square"
  if (haystack.includes("calendly.com")) return "calendly"
  if (haystack.includes("acuityscheduling.com") || haystack.includes("as.me")) return "acuity"
  if (haystack.includes("toasttab.com") || haystack.includes("toasttab")) return "toast"
  if (haystack.includes("resy.com")) return "resy"
  if (haystack.includes("opentable.com")) return "opentable"
  return null
}

function getBookingLinks(links: string[]) {
  return links.filter((link) => {
    const lower = link.toLowerCase()
    return [
      "squareup.com",
      "square.site",
      "calendly.com",
      "acuityscheduling.com",
      "toasttab.com",
      "resy.com",
      "opentable.com",
      "book",
      "appointment",
      "schedule",
    ].some((word) => lower.includes(word))
  }).slice(0, 12)
}

function getSocialLinks(links: string[]) {
  return links.filter((link) => {
    const lower = link.toLowerCase()
    return [
      "instagram.com",
      "facebook.com",
      "linkedin.com",
      "youtube.com",
      "tiktok.com",
      "x.com",
      "twitter.com",
    ].some((word) => lower.includes(word))
  }).slice(0, 10)
}

function snippetAround(text: string, phrase: string) {
  const lower = text.toLowerCase()
  const index = lower.indexOf(phrase.toLowerCase())
  if (index === -1) return text.slice(0, 180)
  const start = Math.max(0, index - 80)
  return text.slice(start, start + 220).trim()
}

function addEvidence(
  evidence: SignalEvidence[],
  url: string,
  signal: string,
  snippet: string,
  confidence: SignalConfidence = "medium",
) {
  if (!snippet.trim()) return
  evidence.push({
    url,
    signal,
    snippet: snippet.replace(/\s+/g, " ").trim().slice(0, 260),
    confidence,
  })
}

function isBlockedHostname(hostname: string) {
  const lower = hostname.toLowerCase()
  return (
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower === "local" ||
    lower.endsWith(".local") ||
    lower === "internal" ||
    lower.endsWith(".internal")
  )
}

function isPrivateIPv4(address: string) {
  const parts = address.split(".").map((part) => Number(part))
  const [a, b] = parts

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  )
}

function isPrivateIPv6(address: string) {
  const normalized = address.toLowerCase()
  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.")
  )
}

function isPrivateAddress(address: string) {
  const ipVersion = net.isIP(address)
  if (ipVersion === 4) return isPrivateIPv4(address)
  if (ipVersion === 6) return isPrivateIPv6(address)
  return true
}

export function normalizeSignalUrl(rawUrl: string | null | undefined) {
  const raw = rawUrl?.trim()
  if (!raw) return null

  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    url.hash = ""
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    if (url.username || url.password) return null
    return url
  } catch {
    return null
  }
}

async function assertPublicHttpUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only public http/https URLs can be scanned")
  }

  if (isBlockedHostname(url.hostname)) {
    throw new Error("Internal hostnames cannot be scanned")
  }

  const directIpVersion = net.isIP(url.hostname)
  if (directIpVersion && isPrivateAddress(url.hostname)) {
    throw new Error("Private or loopback IP addresses cannot be scanned")
  }

  if (!directIpVersion) {
    const addresses = await lookup(url.hostname, { all: true, verbatim: false })
    if (addresses.length === 0 || addresses.some((item) => isPrivateAddress(item.address))) {
      throw new Error("URL resolves to a private or internal network address")
    }
  }
}

async function readLimitedText(response: Response) {
  const contentLength = response.headers.get("content-length")
  if (contentLength && Number(contentLength) > MAX_HTML_BYTES) {
    throw new Error("Response is too large to scan safely")
  }

  if (!response.body) {
    return (await response.text()).slice(0, MAX_HTML_BYTES)
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    if (!value) continue
    total += value.byteLength
    if (total > MAX_HTML_BYTES) {
      throw new Error("Response is too large to scan safely")
    }
    chunks.push(value)
  }

  return new TextDecoder().decode(Buffer.concat(chunks))
}

function safeSecondaryLinks(homeUrl: string, links: string[], limit = 2) {
  const home = new URL(homeUrl)
  const blocked = [
    "login",
    "account",
    "cart",
    "checkout",
    "wp-admin",
    "admin",
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "yelp.com",
    "google.com",
  ]
  const servicePreferred = ["service", "services", "menu", "pricing", "gallery", "portfolio"]
  const contactPreferred = ["contact", "about", "booking", "book", "appointment", "schedule"]

  const candidates = links.filter((link) => {
    try {
      const url = new URL(link)
      const lower = url.toString().toLowerCase()
      return (
        url.origin === home.origin &&
        url.toString() !== home.toString() &&
        [...servicePreferred, ...contactPreferred].some((word) => lower.includes(word)) &&
        !blocked.some((word) => lower.includes(word))
      )
    } catch {
      return false
    }
  })

  const serviceLink = candidates.find((link) =>
    servicePreferred.some((word) => link.toLowerCase().includes(word)),
  )
  const contactLink = candidates.find((link) =>
    contactPreferred.some((word) => link.toLowerCase().includes(word)),
  )

  return unique([serviceLink, contactLink].filter(Boolean) as string[], limit)
}

async function fetchHtml(startUrl: URL) {
  let currentUrl = startUrl

  for (let redirects = 0; redirects < 3; redirects += 1) {
    await assertPublicHttpUrl(currentUrl)

    const response = await fetch(currentUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location")
      if (!location) throw new Error(`Website redirected without a location`)
      currentUrl = new URL(location, currentUrl)
      continue
    }

    if (!response.ok) {
      throw new Error(`Public page returned HTTP ${response.status}`)
    }

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.toLowerCase().includes("text/html")) {
      throw new Error("Public page did not return HTML")
    }

    return {
      finalUrl: response.url || currentUrl.toString(),
      status: response.status,
      html: await readLimitedText(response),
    }
  }

  throw new Error("Too many redirects while scanning public website")
}

function scanHtmlPage(url: string, status: number, html: string): SignalPageScan {
  const text = stripHtml(html).slice(0, MAX_TEXT_CHARS)
  const links = extractLinks(html, url)
  const ctaWords = findTextSignals(text, [
    "call",
    "book",
    "schedule",
    "request",
    "quote",
    "estimate",
    "appointment",
    "contact",
  ])
  const serviceLanguage = findTextSignals(text, [
    "service",
    "services",
    "package",
    "packages",
    "maintenance",
    "repair",
    "installation",
    "gallery",
    "portfolio",
  ])
  const pricingLanguage = findTextSignals(text, [
    "price",
    "pricing",
    "starting at",
    "packages",
    "estimate",
    "quote",
    "financing",
  ])
  const hoursLocationLanguage = findTextSignals(text, [
    "hours",
    "location",
    "directions",
    "service area",
    "serving",
    "address",
    "open",
  ])
  const emails = extractEmails(html, text)
  const phones = extractPhones(html, text)
  const bookingLinks = getBookingLinks(links)
  const socialLinks = getSocialLinks(links)
  const hasContactForm = /<form\b[\s\S]{0,12000}?(?:type=["'](?:email|tel)["']|name=["'][^"']*(?:contact|message|quote|estimate|appointment|phone|email)[^"']*["'])/i.test(html)
  const imageCount = (html.match(/<img\b/gi) || []).length
  const title = extractFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
  const metaDescription = extractMetaDescription(html)
  const openGraphSiteName = extractOpenGraphSiteName(html)
  const jsonLdNames = extractJsonLdNames(html)
  const logoAltText = extractLogoAltText(html)
  const headings = extractHeadings(html)
  const detectedWebsitePlatform = detectWebsitePlatform(html)
  const detectedBookingPlatform = detectBookingPlatform(links, html)
  const evidence: SignalEvidence[] = []

  if (title) addEvidence(evidence, url, "Page title", title, "high")
  if (metaDescription) {
    addEvidence(evidence, url, "Meta description", metaDescription, "high")
  }
  jsonLdNames.slice(0, 4).forEach((name) =>
    addEvidence(evidence, url, "Structured business identity", name, "high"),
  )
  if (openGraphSiteName) {
    addEvidence(evidence, url, "Open Graph site name", openGraphSiteName, "high")
  }
  logoAltText.slice(0, 3).forEach((alt) =>
    addEvidence(evidence, url, "Logo alt identity", alt, "medium"),
  )
  headings.slice(0, 4).forEach((heading) =>
    addEvidence(evidence, url, "Heading", heading, "high"),
  )
  ctaWords.slice(0, 5).forEach((word) =>
    addEvidence(evidence, url, "Visible CTA language", snippetAround(text, word), "medium"),
  )
  serviceLanguage.slice(0, 5).forEach((word) =>
    addEvidence(evidence, url, "Visible service language", snippetAround(text, word), "medium"),
  )
  pricingLanguage.slice(0, 4).forEach((word) =>
    addEvidence(evidence, url, "Pricing or quote language", snippetAround(text, word), "medium"),
  )
  hoursLocationLanguage.slice(0, 4).forEach((word) =>
    addEvidence(evidence, url, "Hours or location language", snippetAround(text, word), "medium"),
  )
  bookingLinks.slice(0, 4).forEach((link) =>
    addEvidence(evidence, url, "Public booking/contact link", link, "medium"),
  )

  if (emails.length > 0) {
    addEvidence(evidence, url, "Visible public email", emails.join(", "), "medium")
  }
  if (phones.length > 0) {
    addEvidence(evidence, url, "Visible public phone", phones.join(", "), "medium")
  }

  return {
    url,
    status,
    title,
    metaDescription,
    openGraphSiteName,
    jsonLdNames,
    logoAltText,
    headings,
    textExcerpt: text.slice(0, 1600),
    ctaWords,
    serviceLanguage,
    pricingLanguage,
    hoursLocationLanguage,
    emails,
    phones,
    links,
    bookingLinks,
    socialLinks,
    hasContactForm,
    detectedWebsitePlatform,
    detectedBookingPlatform,
    imageCount,
    evidence: evidence.slice(0, 20),
  }
}

export async function scanSignalWebsite(
  websiteUrl: string | null | undefined,
  options: { maxSecondaryPages?: number } = {},
): Promise<SignalWebsiteScan> {
  const startedAt = new Date().toISOString()
  const normalized = normalizeSignalUrl(websiteUrl)

  if (!normalized) {
    return {
      scanned_at: startedAt,
      requested_url: websiteUrl || null,
      scanned_urls: [],
      pages: [],
      page_title: null,
      meta_description: null,
      open_graph_site_name: null,
      json_ld_names: [],
      logo_alt_text: [],
      headings: [],
      cta_words: [],
      service_language: [],
      pricing_language: [],
      hours_location_language: [],
      visible_emails: [],
      visible_phones: [],
      booking_links: [],
      social_links: [],
      detected_website_platform: null,
      detected_booking_platform: null,
      image_count: 0,
      broken_response: true,
      error: websiteUrl ? "Website URL could not be parsed" : "No website URL provided",
      evidence: [],
    }
  }

  try {
    const homepage = await fetchHtml(normalized)
    const pages = [
      scanHtmlPage(homepage.finalUrl, homepage.status, homepage.html),
    ]

    const secondaryUrls = safeSecondaryLinks(
      homepage.finalUrl,
      pages[0]?.links || [],
      options.maxSecondaryPages ?? 2,
    )

    for (const secondaryUrl of secondaryUrls) {
      try {
        const secondary = await fetchHtml(new URL(secondaryUrl))
        pages.push(scanHtmlPage(secondary.finalUrl, secondary.status, secondary.html))
      } catch {
        // Secondary pages are optional; the homepage scan remains valid.
      }
    }

    const evidence = pages.flatMap((page) => page.evidence).slice(0, 40)
    const scannedUrls = pages.map((page) => page.url)

    return {
      scanned_at: startedAt,
      requested_url: websiteUrl || normalized.toString(),
      scanned_urls: scannedUrls,
      pages,
      page_title: pages[0]?.title || null,
      meta_description: pages[0]?.metaDescription || null,
      open_graph_site_name: pages.find((page) => page.openGraphSiteName)?.openGraphSiteName || null,
      json_ld_names: unique(pages.flatMap((page) => page.jsonLdNames), 8),
      logo_alt_text: unique(pages.flatMap((page) => page.logoAltText), 8),
      headings: unique(pages.flatMap((page) => page.headings), 18),
      cta_words: unique(pages.flatMap((page) => page.ctaWords), 12),
      service_language: unique(pages.flatMap((page) => page.serviceLanguage), 12),
      pricing_language: unique(pages.flatMap((page) => page.pricingLanguage), 10),
      hours_location_language: unique(
        pages.flatMap((page) => page.hoursLocationLanguage),
        10,
      ),
      visible_emails: unique(pages.flatMap((page) => page.emails), 8),
      visible_phones: unique(pages.flatMap((page) => page.phones), 8),
      booking_links: unique(pages.flatMap((page) => page.bookingLinks), 12),
      social_links: unique(pages.flatMap((page) => page.socialLinks), 10),
      detected_website_platform:
        pages.find((page) => page.detectedWebsitePlatform)?.detectedWebsitePlatform || null,
      detected_booking_platform:
        pages.find((page) => page.detectedBookingPlatform)?.detectedBookingPlatform || null,
      image_count: pages.reduce((sum, page) => sum + page.imageCount, 0),
      broken_response: false,
      error: null,
      evidence,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Website scan failed"
    return {
      scanned_at: startedAt,
      requested_url: websiteUrl || normalized.toString(),
      scanned_urls: [],
      pages: [],
      page_title: null,
      meta_description: null,
      open_graph_site_name: null,
      json_ld_names: [],
      logo_alt_text: [],
      headings: [],
      cta_words: [],
      service_language: [],
      pricing_language: [],
      hours_location_language: [],
      visible_emails: [],
      visible_phones: [],
      booking_links: [],
      social_links: [],
      detected_website_platform: null,
      detected_booking_platform: null,
      image_count: 0,
      broken_response: true,
      error: errorMessage,
      evidence: [
        {
          url: normalized.toString(),
          signal: "Website scan issue",
          snippet: errorMessage,
          confidence: "high",
        },
      ],
    }
  }
}
