import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  buildSignalPlaceSearchPlan,
  buildSignalPlaceTiles,
  filterSignalPlacesWithinRadius,
  mergeSignalPlaces,
  signalPlaceQueries,
  type SignalMarketBoundary,
  type SignalPlace,
  type SignalPlaceProviderName,
  type SignalPlaceSearchPlanItem,
  type SignalResolvedMarket,
} from "./places-core"

type ProviderSearchResponse = {
  places: SignalPlace[]
  next_page_token: string | null
  usage: SignalPlacesUsage
}

export type SignalPlacesUsage = {
  market_resolution_calls: number
  search_calls: number
  detail_calls: number
  cache_hits: number
  returned_places: number
}

export type SignalPlacesConfig = {
  provider: SignalPlaceProviderName | "disabled"
  maxDiscoveryResults: number
  maxDetailCalls: number
  maxTiles: number
  maxCategoryQueries: number
  maxSearchCalls: number
  maxPagesPerQuery: number
  cacheTtlHours: number
}

export type SignalPlacesSetup = {
  provider: SignalPlaceProviderName | "disabled"
  enabled: boolean
  missing_env: string[]
  warning: string | null
}

export interface SignalPlacesProvider {
  readonly name: SignalPlaceProviderName
  resolveMarket(location: string, radiusMiles: number): Promise<SignalResolvedMarket>
  textSearch(input: { query: string; boundary: SignalMarketBoundary; pageToken?: string | null }): Promise<ProviderSearchResponse>
  nearbySearch(input: { includedTypes: string[]; latitude: number; longitude: number; radiusMeters: number }): Promise<ProviderSearchResponse>
  placeDetails(placeId: string): Promise<{ place: SignalPlace | null; usage: SignalPlacesUsage }>
}

const GOOGLE_PLACES_BASE_URL = "https://places.googleapis.com/v1"

function boundedEnv(name: string, fallback: number, minimum: number, maximum: number) {
  const parsed = Number.parseInt(process.env[name] || "", 10)
  return Math.max(minimum, Math.min(maximum, Number.isFinite(parsed) ? parsed : fallback))
}

function emptyUsage(): SignalPlacesUsage {
  return { market_resolution_calls: 0, search_calls: 0, detail_calls: 0, cache_hits: 0, returned_places: 0 }
}

function addUsage(left: SignalPlacesUsage, right: SignalPlacesUsage): SignalPlacesUsage {
  return {
    market_resolution_calls: left.market_resolution_calls + right.market_resolution_calls,
    search_calls: left.search_calls + right.search_calls,
    detail_calls: left.detail_calls + right.detail_calls,
    cache_hits: left.cache_hits + right.cache_hits,
    returned_places: left.returned_places + right.returned_places,
  }
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function addressPart(addressComponents: unknown, type: string, short = false) {
  if (!Array.isArray(addressComponents)) return null
  for (const item of addressComponents) {
    const component = asObject(item)
    if (!stringArray(component.types).includes(type)) continue
    return asString(short ? component.shortText : component.longText) || null
  }
  return null
}

function normalizeGooglePlace(value: unknown): SignalPlace | null {
  const place = asObject(value)
  const location = asObject(place.location)
  const displayName = asObject(place.displayName)
  const id = asString(place.id) || asString(place.name).replace(/^places\//, "")
  const canonicalName = asString(displayName.text)
  const latitude = asNumber(location.latitude)
  const longitude = asNumber(location.longitude)
  if (!id || !canonicalName || latitude == null || longitude == null) return null
  const hours = asObject(place.regularOpeningHours)
  return {
    provider: "google",
    provider_place_id: id,
    canonical_name: canonicalName,
    formatted_address: asString(place.formattedAddress) || null,
    city: addressPart(place.addressComponents, "locality")
      || addressPart(place.addressComponents, "postal_town")
      || addressPart(place.addressComponents, "sublocality"),
    state: addressPart(place.addressComponents, "administrative_area_level_1", true),
    coordinates: { latitude, longitude },
    phone: asString(place.nationalPhoneNumber) || asString(place.internationalPhoneNumber) || null,
    website_url: asString(place.websiteUri) || null,
    listing_url: asString(place.googleMapsUri) || null,
    business_status: asString(place.businessStatus) || null,
    categories: stringArray(place.types),
    rating: asNumber(place.rating),
    review_count: asNumber(place.userRatingCount),
    opening_hours: stringArray(hours.weekdayDescriptions),
    price_level: asString(place.priceLevel) || null,
    primary_category: asString(place.primaryType) || null,
    service_area_business: place.pureServiceAreaBusiness === true,
    retrieved_at: asString(place.retrievedAt) || new Date().toISOString(),
  }
}

function normalizedGoogleError(status: number, payload: unknown) {
  const error = asObject(asObject(payload).error)
  const statusLabel = asString(error.status)
  if (status === 429 || statusLabel === "RESOURCE_EXHAUSTED") return "Google Places quota or rate limit was reached."
  if (status === 401 || status === 403) return "Google Places rejected the server-side API key or API restriction."
  if (status === 400) return "Google Places rejected the market or search parameters."
  return `Google Places request failed with status ${status}.`
}

async function googleFetch(url: string, init: RequestInit, timeoutMs = 18_000) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(normalizedGoogleError(response.status, payload))
  return payload
}

async function readCachedPlace(provider: SignalPlaceProviderName, placeId: string) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("signal_place_cache")
      .select("normalized_data, expires_at")
      .eq("provider", provider)
      .eq("provider_place_id", placeId)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle()
    if (error || !data) return null
    return normalizeGooglePlace(data.normalized_data)
  } catch {
    // The integration is deployable before the additive cache migration. A
    // missing cache table must never disable map-first discovery.
    return null
  }
}

async function writeCachedPlace(place: SignalPlace) {
  try {
    const config = getSignalPlacesConfig()
    const supabase = createAdminClient()
    await supabase.from("signal_place_cache").delete().lt("expires_at", new Date().toISOString())
    await supabase.from("signal_place_cache").upsert({
      provider: place.provider,
      provider_place_id: place.provider_place_id,
      normalized_data: {
        id: place.provider_place_id,
        displayName: { text: place.canonical_name },
        formattedAddress: place.formatted_address,
        addressComponents: [
          place.city ? { longText: place.city, shortText: place.city, types: ["locality"] } : null,
          place.state ? { longText: place.state, shortText: place.state, types: ["administrative_area_level_1"] } : null,
        ].filter(Boolean),
        location: place.coordinates,
        nationalPhoneNumber: place.phone,
        websiteUri: place.website_url,
        googleMapsUri: place.listing_url,
        businessStatus: place.business_status,
        types: place.categories,
        rating: place.rating,
        userRatingCount: place.review_count,
        regularOpeningHours: { weekdayDescriptions: place.opening_hours },
        priceLevel: place.price_level,
        primaryType: place.primary_category,
        pureServiceAreaBusiness: place.service_area_business,
        retrievedAt: place.retrieved_at,
      },
      retrieved_at: place.retrieved_at,
      expires_at: new Date(Date.now() + config.cacheTtlHours * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "provider,provider_place_id" })
  } catch {
    // Cache writes are an optimization and are intentionally non-fatal.
  }
}

class GoogleSignalPlacesProvider implements SignalPlacesProvider {
  readonly name = "google" as const

  private apiKey() {
    const key = process.env.GOOGLE_PLACES_API_KEY
    if (!key) throw new Error("GOOGLE_PLACES_API_KEY is missing.")
    return key
  }

  async resolveMarket(location: string, radiusMiles: number): Promise<SignalResolvedMarket> {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json")
    url.searchParams.set("address", location)
    url.searchParams.set("region", "us")
    url.searchParams.set("key", this.apiKey())
    const payload = asObject(await googleFetch(url.toString(), { method: "GET" }))
    const result = Array.isArray(payload.results) ? asObject(payload.results[0]) : {}
    const geometry = asObject(result.geometry)
    const center = asObject(geometry.location)
    const latitude = asNumber(center.lat)
    const longitude = asNumber(center.lng)
    const status = asString(payload.status)
    if (status === "OVER_QUERY_LIMIT") throw new Error("Google market resolution quota or rate limit was reached.")
    if (status === "REQUEST_DENIED") throw new Error("Google rejected the server-side key for Geocoding API market resolution.")
    if (status !== "OK" || latitude == null || longitude == null) {
      throw new Error(`Google could not resolve the requested market: ${location}.`)
    }
    const longitudeScale = Math.max(0.2, Math.cos(latitude * Math.PI / 180))
    const latitudeDelta = radiusMiles / 69
    const longitudeDelta = radiusMiles / (69.172 * longitudeScale)
    return {
      provider: "google",
      provider_place_id: asString(result.place_id) || null,
      label: asString(result.formatted_address) || location,
      center: { latitude, longitude },
      boundary: {
        low: { latitude: latitude - latitudeDelta, longitude: longitude - longitudeDelta },
        high: { latitude: latitude + latitudeDelta, longitude: longitude + longitudeDelta },
      },
      radius_miles: radiusMiles,
      resolved_at: new Date().toISOString(),
    }
  }

  async textSearch(input: { query: string; boundary: SignalMarketBoundary; pageToken?: string | null }) {
    const payload = asObject(await googleFetch(`${GOOGLE_PLACES_BASE_URL}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey(),
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus,places.primaryType,places.types,places.googleMapsUri,places.pureServiceAreaBusiness,nextPageToken",
      },
      body: JSON.stringify({
        textQuery: input.query,
        pageSize: 20,
        pageToken: input.pageToken || undefined,
        locationRestriction: { rectangle: input.boundary },
        languageCode: "en",
        regionCode: "US",
      }),
    }))
    const places = (Array.isArray(payload.places) ? payload.places : [])
      .map(normalizeGooglePlace)
      .filter((place): place is SignalPlace => Boolean(place))
    return {
      places,
      next_page_token: asString(payload.nextPageToken) || null,
      usage: { ...emptyUsage(), search_calls: 1, returned_places: places.length },
    }
  }

  async nearbySearch(input: { includedTypes: string[]; latitude: number; longitude: number; radiusMeters: number }) {
    const payload = asObject(await googleFetch(`${GOOGLE_PLACES_BASE_URL}/places:searchNearby`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey(),
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus,places.primaryType,places.types,places.googleMapsUri,places.pureServiceAreaBusiness",
      },
      body: JSON.stringify({
        includedTypes: input.includedTypes.slice(0, 50),
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: input.latitude, longitude: input.longitude },
            radius: Math.max(1, Math.min(50_000, input.radiusMeters)),
          },
        },
        rankPreference: "POPULARITY",
        languageCode: "en",
        regionCode: "US",
      }),
    }))
    const places = (Array.isArray(payload.places) ? payload.places : [])
      .map(normalizeGooglePlace)
      .filter((place): place is SignalPlace => Boolean(place))
    return {
      places,
      next_page_token: null,
      usage: { ...emptyUsage(), search_calls: 1, returned_places: places.length },
    }
  }

  async placeDetails(placeId: string) {
    const cached = await readCachedPlace("google", placeId)
    if (cached) return { place: cached, usage: { ...emptyUsage(), cache_hits: 1, returned_places: 1 } }
    const payload = await googleFetch(`${GOOGLE_PLACES_BASE_URL}/places/${encodeURIComponent(placeId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey(),
        "X-Goog-FieldMask": "id,displayName,formattedAddress,addressComponents,location,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri,businessStatus,types,primaryType,rating,userRatingCount,regularOpeningHours,priceLevel,pureServiceAreaBusiness",
      },
    })
    const place = normalizeGooglePlace(payload)
    if (place) await writeCachedPlace(place)
    return { place, usage: { ...emptyUsage(), detail_calls: 1, returned_places: place ? 1 : 0 } }
  }
}

export function getSignalPlacesConfig(): SignalPlacesConfig {
  const requested = process.env.SIGNAL_PLACES_PROVIDER?.trim().toLowerCase()
  const provider = requested === "disabled"
    ? "disabled"
    : requested === "google" || (!requested && process.env.GOOGLE_PLACES_API_KEY)
      ? "google"
      : "disabled"
  return {
    provider,
    maxDiscoveryResults: boundedEnv("SIGNAL_PLACES_MAX_DISCOVERY_RESULTS", 120, 20, 300),
    maxDetailCalls: boundedEnv("SIGNAL_PLACES_MAX_DETAIL_CALLS", 36, 5, 100),
    maxTiles: boundedEnv("SIGNAL_PLACES_MAX_TILES", 5, 1, 9),
    maxCategoryQueries: boundedEnv("SIGNAL_PLACES_MAX_CATEGORY_QUERIES", 12, 1, 24),
    maxSearchCalls: boundedEnv("SIGNAL_PLACES_MAX_SEARCH_CALLS", 24, 1, 60),
    maxPagesPerQuery: boundedEnv("SIGNAL_PLACES_MAX_PAGES_PER_QUERY", 1, 1, 3),
    cacheTtlHours: boundedEnv("SIGNAL_PLACES_CACHE_TTL_HOURS", 24, 1, 168),
  }
}

export function getSignalPlacesSetup(): SignalPlacesSetup {
  const config = getSignalPlacesConfig()
  if (config.provider === "disabled") {
    return {
      provider: "disabled",
      enabled: false,
      missing_env: process.env.SIGNAL_PLACES_PROVIDER === "disabled" ? [] : ["GOOGLE_PLACES_API_KEY"],
      warning: "Map-first discovery is unavailable. Signal will use Tavily fallback discovery with reduced local coverage.",
    }
  }
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return { provider: "google", enabled: false, missing_env: ["GOOGLE_PLACES_API_KEY"], warning: "Google Places is selected, but GOOGLE_PLACES_API_KEY is missing." }
  }
  return { provider: "google", enabled: true, missing_env: [], warning: null }
}

export function getSignalPlacesProvider(): SignalPlacesProvider | null {
  const setup = getSignalPlacesSetup()
  return setup.enabled && setup.provider === "google" ? new GoogleSignalPlacesProvider() : null
}

export function buildSignalPlacesPlan(input: {
  market: SignalResolvedMarket
  industryFocus: string
  customIndustry?: string | null
}) {
  const config = getSignalPlacesConfig()
  const tiles = buildSignalPlaceTiles({
    center: input.market.center,
    radiusMiles: input.market.radius_miles,
    maxTiles: config.maxTiles,
  })
  const queries = signalPlaceQueries({
    industryFocus: input.industryFocus,
    customIndustry: input.customIndustry,
    maxQueries: config.maxCategoryQueries,
  })
  return buildSignalPlaceSearchPlan({ queries, tiles, maxSearchCalls: config.maxSearchCalls })
}

export async function runSignalPlacesPlanItem(input: {
  provider: SignalPlacesProvider
  item: SignalPlaceSearchPlanItem
  market: SignalResolvedMarket
  pageToken?: string | null
}) {
  const response = await input.provider.textSearch({
    query: input.item.query,
    boundary: input.item.tile.boundary,
    pageToken: input.pageToken,
  })
  const places = filterSignalPlacesWithinRadius({
    center: input.market.center,
    radiusMiles: input.market.radius_miles,
    places: response.places,
  })
  return {
    ...response,
    places: mergeSignalPlaces(places),
    usage: { ...response.usage, returned_places: places.length },
  }
}

export { addUsage as addSignalPlacesUsage, emptyUsage as emptySignalPlacesUsage }
