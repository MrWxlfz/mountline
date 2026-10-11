import "server-only"

/**
 * The address the booking modal can put in an iframe, or null if there isn't one (the buttons then
 * just link to the booking page).
 *
 * Google's short links (calendar.app.google/…) refuse to load in a frame, so they're followed to the
 * calendar.google.com appointment page they redirect to, which Google allows embedding with
 * ?gv=true. Runs on the server when the page is built and is cached for a day.
 */
export async function bookingEmbedUrl(raw = process.env.NEXT_PUBLIC_BOOKING_URL ?? ""): Promise<string | null> {
  if (!raw) return null
  try {
    let url = new URL(raw)
    for (let hop = 0; hop < 4 && url.hostname === "calendar.app.google"; hop++) {
      const response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 86400 },
      })
      const location = response.headers.get("location")
      if (response.status < 300 || response.status >= 400 || !location) return null
      url = new URL(location, url)
    }
    if (url.hostname === "calendar.google.com") {
      url.searchParams.set("gv", "true")
      return url.toString()
    }
    // Anything else (a Cal.com link, say) is embedded as is.
    return url.hostname.endsWith("google") ? null : url.toString()
  } catch {
    return null
  }
}
