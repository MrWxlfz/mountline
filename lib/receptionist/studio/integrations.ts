/*
 * Apps the staff app can link to. Nothing here is connected: the staff app's Connected apps screen
 * walks through linking each one as a labeled demo, so an owner can see what it would do. Real
 * integrations get their own server-side OAuth and storage when they're built; the voice prompt
 * generator never reads this file.
 *
 * No provider logos or sign-in screens are reproduced; each app is a plain colored tile with its name.
 */

export type IntegrationId = "google_calendar" | "outlook_calendar" | "square"

export type Integration = {
  id: IntegrationId
  name: string
  /** Who runs the sign-in, in "Waiting for …". */
  provider: string
  category: "Calendar" | "Payments & bookings"
  /** Tile color and the letter on it. */
  tile: { background: string; glyph: string }
  /** One line for the list. */
  summary: string
  /** What the receptionist could do once linked, shown before connecting. */
  permissions: string[]
  /** Options shown after linking (all simulated). */
  options: Array<{ id: string; label: string; detail: string; on: boolean }>
  /** What the staff app shows on a booked call once it's linked. */
  effect: string
}

export const integrations: Integration[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    provider: "Google",
    category: "Calendar",
    tile: { background: "#1A73E8", glyph: "31" },
    summary: "Put bookings on the calendar and offer real open times",
    permissions: ["See when you're busy, so it only offers open times", "Add appointments it books to one calendar you pick", "Move or cancel appointments it made when a caller asks"],
    options: [
      { id: "add", label: "Add new bookings", detail: "Booked calls go on the Front desk calendar", on: true },
      { id: "availability", label: "Check availability first", detail: "Only offer times that are open", on: true },
    ],
    effect: "Would be added to Google Calendar",
  },
  {
    id: "outlook_calendar",
    name: "Outlook Calendar",
    provider: "Microsoft",
    category: "Calendar",
    tile: { background: "#0F6CBD", glyph: "O" },
    summary: "Same calendar sync for Microsoft 365",
    permissions: ["See when you're busy, so it only offers open times", "Add appointments it books to one calendar you pick"],
    options: [
      { id: "add", label: "Add new bookings", detail: "Booked calls go on your shared calendar", on: true },
      { id: "availability", label: "Check availability first", detail: "Only offer times that are open", on: true },
    ],
    effect: "Would be added to Outlook",
  },
  {
    id: "square",
    name: "Square",
    provider: "Square",
    category: "Payments & bookings",
    tile: { background: "#141518", glyph: "■" },
    summary: "Look up customers and send booking or deposit links",
    permissions: ["Look up a caller in your Square customers by phone number", "Create bookings in Square Appointments", "Send a deposit or payment link (you approve the amount)"],
    options: [
      { id: "bookings", label: "Book into Square Appointments", detail: "Instead of a separate calendar", on: true },
      { id: "customers", label: "Match callers to customers", detail: "Shows visit history on the call", on: true },
      { id: "deposits", label: "Offer deposit links", detail: "For no-show-prone services", on: false },
    ],
    effect: "Would be booked in Square Appointments",
  },
]

export function getIntegration(id: IntegrationId) {
  const found = integrations.find((integration) => integration.id === id)
  if (!found) throw new Error(`Unknown integration: ${id}`)
  return found
}
