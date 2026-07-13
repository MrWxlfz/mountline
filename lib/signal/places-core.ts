export type SignalPlaceProviderName = "google"

export type SignalCoordinates = {
  latitude: number
  longitude: number
}

export type SignalMarketBoundary = {
  low: SignalCoordinates
  high: SignalCoordinates
}

export type SignalResolvedMarket = {
  provider: SignalPlaceProviderName
  provider_place_id: string | null
  label: string
  center: SignalCoordinates
  boundary: SignalMarketBoundary
  radius_miles: number
  resolved_at: string
}

export type SignalPlace = {
  provider: SignalPlaceProviderName
  provider_place_id: string
  canonical_name: string
  formatted_address: string | null
  city: string | null
  state: string | null
  coordinates: SignalCoordinates
  phone: string | null
  website_url: string | null
  listing_url: string | null
  business_status: string | null
  categories: string[]
  rating: number | null
  review_count: number | null
  opening_hours: string[]
  price_level: string | null
  primary_category: string | null
  service_area_business: boolean
  retrieved_at: string
}

export type SignalPlaceSearchTile = {
  id: string
  center: SignalCoordinates
  boundary: SignalMarketBoundary
}

export type SignalPlaceSearchPlanItem = {
  query: string
  tile: SignalPlaceSearchTile
}

const EARTH_RADIUS_MILES = 3958.7613

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

function unique(values: Array<string | null | undefined>, limit = 30) {
  return Array.from(new Set(values.map((value) => value?.trim() || "").filter(Boolean))).slice(0, limit)
}

function offsetCoordinates(center: SignalCoordinates, northMiles: number, eastMiles: number) {
  const latitude = center.latitude + northMiles / 69
  const longitudeScale = Math.max(0.2, Math.cos(center.latitude * Math.PI / 180))
  const longitude = center.longitude + eastMiles / (69.172 * longitudeScale)
  return { latitude, longitude }
}

function boundaryAround(center: SignalCoordinates, radiusMiles: number): SignalMarketBoundary {
  const low = offsetCoordinates(center, -radiusMiles, -radiusMiles)
  const high = offsetCoordinates(center, radiusMiles, radiusMiles)
  return {
    low: {
      latitude: clamp(low.latitude, -90, 90),
      longitude: clamp(low.longitude, -180, 180),
    },
    high: {
      latitude: clamp(high.latitude, -90, 90),
      longitude: clamp(high.longitude, -180, 180),
    },
  }
}

export function signalDistanceMiles(left: SignalCoordinates, right: SignalCoordinates) {
  const toRadians = (value: number) => value * Math.PI / 180
  const latitudeDelta = toRadians(right.latitude - left.latitude)
  const longitudeDelta = toRadians(right.longitude - left.longitude)
  const leftLatitude = toRadians(left.latitude)
  const rightLatitude = toRadians(right.latitude)
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(leftLatitude) * Math.cos(rightLatitude) * Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(haversine))
}

export function buildSignalPlaceTiles(input: {
  center: SignalCoordinates
  radiusMiles: number
  maxTiles: number
}) {
  const radius = clamp(input.radiusMiles, 1, 100)
  const desired = radius <= 8 ? 1 : radius <= 22 ? 5 : 9
  const limit = Math.max(1, Math.min(input.maxTiles, desired))
  const offset = radius <= 8 ? 0 : radius * (desired === 5 ? 0.48 : 0.55)
  const definitions: Array<[string, number, number]> = [
    ["center", 0, 0],
    ["north", offset, 0],
    ["east", 0, offset],
    ["south", -offset, 0],
    ["west", 0, -offset],
    ["north-east", offset, offset],
    ["south-east", -offset, offset],
    ["south-west", -offset, -offset],
    ["north-west", offset, -offset],
  ]
  const tileRadius = desired === 1 ? radius : desired === 5 ? radius * 0.52 : radius * 0.38
  return definitions.slice(0, limit).map(([id, north, east]) => {
    const center = offsetCoordinates(input.center, north, east)
    return { id, center, boundary: boundaryAround(center, tileRadius) }
  })
}

export function signalPlaceQueries(input: {
  industryFocus: string
  customIndustry?: string | null
  maxQueries: number
}) {
  const map: Record<string, string[]> = {
    best_opportunities: [
      "dog groomer", "barber shop", "car detailing", "house cleaning service",
      "HVAC contractor", "plumber", "hair salon", "massage therapist",
      "local bakery", "photographer", "landscaper", "repair shop",
      "martial arts school", "boutique", "tutoring service", "local restaurant",
    ],
    groomers_pet_services: ["pet groomer", "dog groomer", "mobile dog groomer", "pet salon", "pet care"],
    barbers_salons: ["barber shop", "hair salon", "independent barber", "beauty salon"],
    auto_detailing: ["car detailing", "mobile detailing", "auto detailing", "auto spa"],
    contractors_home_services: ["HVAC contractor", "plumber", "electrician", "roofing contractor", "landscaper", "pressure washing", "handyman", "general contractor"],
    med_spas_wellness: ["med spa", "massage therapist", "skin care clinic", "wellness center"],
    commercial_cleaning: ["commercial cleaning", "house cleaning", "office cleaning", "janitorial service"],
    restaurants_local_food: ["local restaurant", "cafe", "bakery", "burger restaurant", "food truck"],
    churches_nonprofits: ["local church", "community nonprofit", "local ministry"],
    custom: [input.customIndustry || "local service business"],
  }
  return unique(map[input.industryFocus] || map.best_opportunities, Math.max(1, input.maxQueries))
}

export function buildSignalPlaceSearchPlan(input: {
  queries: string[]
  tiles: SignalPlaceSearchTile[]
  maxSearchCalls: number
}) {
  const plan: SignalPlaceSearchPlanItem[] = []
  const seen = new Set<string>()
  const push = (query: string | undefined, tile: SignalPlaceSearchTile | undefined) => {
    if (!query || !tile) return false
    const key = `${query}:${tile.id}`
    if (seen.has(key)) return false
    seen.add(key)
    plan.push({ query, tile })
    return plan.length >= input.maxSearchCalls
  }
  // The first pass touches every selected tile with a rotating category so a
  // large market cannot hit its candidate target using only center-biased
  // results. Later passes expand category depth across every tile.
  for (let index = 0; index < input.tiles.length; index += 1) {
    if (push(input.queries[index % input.queries.length], input.tiles[index])) return plan
  }
  for (let queryIndex = 0; queryIndex < input.queries.length; queryIndex += 1) {
    for (let tileIndex = 0; tileIndex < input.tiles.length; tileIndex += 1) {
      if (push(input.queries[queryIndex], input.tiles[tileIndex])) return plan
    }
  }
  return plan
}

function normalizePhone(value: string | null | undefined) {
  const digits = (value || "").replace(/\D/g, "")
  return digits.length >= 10 ? digits.slice(-10) : ""
}

function normalizeName(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(?:llc|inc|company|co|ltd)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizedDomain(value: string | null | undefined) {
  if (!value) return ""
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname.toLowerCase().replace(/^www\./, "")
  } catch {
    return ""
  }
}

export function mergeSignalPlaces(places: SignalPlace[]) {
  const merged: SignalPlace[] = []
  const aliases = new Map<string, number>()
  for (const place of places) {
    const keys = unique([
      `place:${place.provider}:${place.provider_place_id}`,
      normalizePhone(place.phone) ? `phone:${normalizePhone(place.phone)}` : null,
      normalizedDomain(place.website_url) ? `domain:${normalizedDomain(place.website_url)}` : null,
      place.formatted_address ? `name-address:${normalizeName(place.canonical_name)}:${normalizeName(place.formatted_address)}` : null,
      `name-location:${normalizeName(place.canonical_name)}:${place.coordinates.latitude.toFixed(3)}:${place.coordinates.longitude.toFixed(3)}`,
    ], 8)
    const existingIndex = keys.map((key) => aliases.get(key)).find((value) => value != null)
    if (existingIndex == null) {
      const nextIndex = merged.length
      merged.push(place)
      keys.forEach((key) => aliases.set(key, nextIndex))
      continue
    }
    const existing = merged[existingIndex]
    merged[existingIndex] = {
      ...existing,
      formatted_address: existing.formatted_address || place.formatted_address,
      city: existing.city || place.city,
      state: existing.state || place.state,
      phone: existing.phone || place.phone,
      website_url: existing.website_url || place.website_url,
      listing_url: existing.listing_url || place.listing_url,
      business_status: existing.business_status || place.business_status,
      categories: unique([...existing.categories, ...place.categories], 30),
      rating: existing.rating ?? place.rating,
      review_count: Math.max(existing.review_count || 0, place.review_count || 0) || null,
      opening_hours: unique([...existing.opening_hours, ...place.opening_hours], 14),
      price_level: existing.price_level || place.price_level,
      primary_category: existing.primary_category || place.primary_category,
      service_area_business: existing.service_area_business || place.service_area_business,
    }
    keys.forEach((key) => aliases.set(key, existingIndex))
  }
  return merged
}

export function filterSignalPlacesWithinRadius(input: {
  center: SignalCoordinates
  radiusMiles: number
  places: SignalPlace[]
}) {
  return input.places.filter((place) => (
    place.service_area_business
    || signalDistanceMiles(input.center, place.coordinates) <= input.radiusMiles * 1.08
  ))
}
