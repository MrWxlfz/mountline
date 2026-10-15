import type { Industry } from "./industries.ts"

/*
 * What the business owner sees after a call. Each industry picks the details it actually needs from
 * this library (a dentist needs the appointment; an HVAC company needs the issue, the address, and how
 * urgent it is). The same list becomes Retell's post-call analysis fields, so what the receptionist
 * extracts is exactly what the owner dashboard shows.
 *
 * Notifications are only for priority events: appointments, urgent calls, and leads. A caller who
 * just asked a question shows up in the call list without a notification.
 */

export type OwnerFieldKind = "text" | "address" | "email" | "flag"

export type OwnerField = {
  label: string
  type: "string" | "boolean" | "enum"
  /** Instruction for Retell's post-call analysis. */
  description: string
  choices?: string[]
  kind?: OwnerFieldKind
}

export const ownerFieldLibrary = {
  patient_status: { label: "Patient", type: "enum", choices: ["new", "existing", "unknown"], description: "Whether the caller (or the patient) is new or existing." },
  client_status: { label: "Client", type: "enum", choices: ["new", "returning", "unknown"], description: "Whether the caller is a new or returning client." },
  visit_reason: { label: "Reason", type: "string", description: "The reason for the visit in a few words (for example \"cleaning\" or \"tooth pain\"). No medical detail." },
  insurance_carrier: { label: "Insurance", type: "string", description: "The insurance carrier name if the caller mentioned one. Never an ID number." },
  issue: { label: "Issue", type: "string", description: "The problem in the caller's own words, one or two sentences." },
  urgency: { label: "Urgency", type: "enum", choices: ["emergency", "urgent", "routine"], description: "How urgent the problem is: emergency (danger or damage happening now), urgent (needs same-day or next-day help), or routine." },
  service_address: { label: "Address", type: "string", kind: "address", description: "The service address, or at least the city and ZIP code, exactly as given." },
  own_or_rent: { label: "Own or rent", type: "enum", choices: ["own", "rent", "unknown"], description: "Whether the caller owns or rents the property." },
  equipment: { label: "Equipment", type: "string", description: "Equipment details mentioned: type, which unit, brand, or rough age." },
  preferred_window: { label: "Preferred time", type: "string", description: "When the caller wants someone to come or call, as a day and time window." },
  vehicle: { label: "Vehicle", type: "string", description: "Year, make, and model, or the vehicle type." },
  drivable: { label: "Drivable", type: "enum", choices: ["yes", "no", "unknown"], description: "Whether the vehicle can be driven." },
  tire_size: { label: "Tire size", type: "string", description: "The tire size if given (for example 225/65R17), and how many tires." },
  pet: { label: "Pet", type: "string", description: "Pet name, species or breed, and age or size." },
  vaccines_current: { label: "Vaccines current", type: "enum", choices: ["yes", "no", "unknown"], description: "Whether the pet's vaccines are current, if discussed." },
  party_size: { label: "Party size", type: "string", description: "How many people." },
  occasion: { label: "Notes", type: "string", description: "Occasion, allergies, or seating requests, if mentioned." },
  check_in: { label: "Check-in", type: "string", description: "The check-in or drop-off date." },
  check_out: { label: "Check-out", type: "string", description: "The check-out or pick-up date, or number of nights." },
  guests: { label: "Guests", type: "string", description: "Number of adults and children." },
  room_type: { label: "Room", type: "string", description: "Room type and any special requests." },
  event_date: { label: "Event date", type: "string", description: "The event date." },
  headcount: { label: "Headcount", type: "string", description: "The approximate number of guests." },
  event_location: { label: "Event location", type: "string", kind: "address", description: "The venue or city of the event." },
  service_style: { label: "Service style", type: "string", description: "Drop-off, buffet, or full service." },
  dietary_needs: { label: "Dietary needs", type: "string", description: "Dietary needs or allergies mentioned." },
  budget: { label: "Budget", type: "string", description: "The budget the caller mentioned, if any." },
  group_size: { label: "Group size", type: "string", description: "How many people are coming, if it's a group." },
  pest_type: { label: "Pest", type: "string", description: "What pest and where it was seen." },
  kids_pets: { label: "Kids or pets", type: "string", description: "Kids or pets in the home, if mentioned." },
  home_size: { label: "Home size", type: "string", description: "Bedrooms and bathrooms, or square footage." },
  frequency: { label: "Frequency", type: "string", description: "How often they want service (one-time, weekly, every two weeks, monthly)." },
  insurance_claim: { label: "Insurance claim", type: "enum", choices: ["filed", "not_filed", "unknown"], description: "Whether an insurance claim has been filed." },
  deadline: { label: "Deadline", type: "string", description: "Any deadline: a court date, home closing, test date, or move-in date." },
  buy_or_sell: { label: "Looking to", type: "enum", choices: ["buy", "sell", "both", "rent", "specific_listing", "unknown"], description: "Whether the caller wants to buy, sell, or asked about a specific listing." },
  property: { label: "Property", type: "string", kind: "address", description: "The property address, unit, or area they're interested in." },
  timeline: { label: "Timeline", type: "string", description: "When they want to buy, sell, move, or start." },
  financing: { label: "Financing", type: "string", description: "Pre-approved, cash, or not yet, if mentioned." },
  caller_type: { label: "Caller", type: "enum", choices: ["resident", "prospect", "owner", "other"], description: "Who is calling: a current resident, a prospective renter, a property owner, or someone else." },
  matter_type: { label: "Matter", type: "string", description: "The type of legal matter in a few words. No confidential detail." },
  other_parties: { label: "Other parties", type: "string", description: "Full names of the other people or companies involved, for a conflict check." },
  student: { label: "Student", type: "string", description: "The student's grade and the subject or test." },
  child_age: { label: "Child's age", type: "string", description: "The child's age." },
  schedule_needed: { label: "Schedule", type: "string", description: "Full-time or part-time, and which days." },
  experience: { label: "Experience", type: "string", description: "The caller's experience level or goal." },
  email: { label: "Email", type: "string", kind: "email", description: "The caller's email address if they gave one." },
} as const satisfies Record<string, OwnerField>

export type OwnerFieldId = keyof typeof ownerFieldLibrary

/** Fields every call extracts, whatever the industry. */
export const commonOwnerFields = {
  caller_name: { label: "Name", type: "string", description: "The caller's full name as they gave it." },
  callback_number: { label: "Phone", type: "string", description: "The callback number the caller gave or confirmed, digits only with area code." },
  reason: { label: "Reason for calling", type: "string", description: "Why they called, in one short sentence." },
  outcome: {
    label: "Outcome",
    type: "enum",
    choices: ["booked", "rescheduled", "cancelled", "request_taken", "quote_requested", "callback_requested", "message_taken", "question_answered", "urgent_referred", "no_outcome"],
    description: "What the call ended with.",
  },
  booked_for: { label: "When", type: "string", description: "The day and time of the booking that was made, moved, or requested, if any, with the date (for example \"Thursday, Oct 16 at 2:30 PM\")." },
  service: { label: "Service", type: "string", description: "The service agreed on, if any." },
  staff_preference: { label: "With", type: "string", description: "The staff member the caller asked for, if any." },
  urgent: { label: "Urgent", type: "boolean", description: "True if the caller described an urgent or emergency situation." },
} as const satisfies Record<string, OwnerField>

export type CommonFieldId = keyof typeof commonOwnerFields

/* Reading analysis values -------------------------------------------------------------- */

const EMPTY = new Set(["", "null", "none", "n/a", "na", "unknown", "not provided", "not mentioned", "undefined", "false"])

/** A cleaned value, or null when the analysis left it empty. Booleans come back as "true"/"false". */
export function readField(data: Record<string, string>, key: string): string | null {
  const raw = data[key]
  if (typeof raw !== "string") return null
  const value = raw.trim().replace(/^"|"$/g, "")
  if (EMPTY.has(value.toLowerCase())) return null
  return value
}

/* Owner events and notifications ---------------------------------------------------------- */

export type OwnerEvent = {
  kind: "appointment" | "change" | "urgent" | "lead" | "info"
  /** Priority events get a notification; the rest only show in the call list. */
  priority: boolean
  title: string
  /** One line of the most important specifics, for the notification and the call list. */
  line: string
}

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export function ownerEvent(industry: Pick<Industry, "visit">, data: Record<string, string>): OwnerEvent {
  const get = (key: string) => readField(data, key)
  const visit = industry.visit.split(" or ")[0]
  const outcome = get("outcome")
  const name = get("caller_name")
  const when = get("booked_for")
  const what = [get("service"), get("staff_preference") ? `with ${get("staff_preference")}` : null].filter(Boolean).join(" ")
  const join = (...parts: Array<string | null | undefined>) => parts.filter(Boolean).join(" · ")

  if (get("urgent") === "true" || outcome === "urgent_referred" || get("urgency") === "emergency") {
    return { kind: "urgent", priority: true, title: "Urgent call", line: join(get("issue") ?? get("reason"), get("service_address"), name) }
  }
  if (outcome === "booked") {
    return { kind: "appointment", priority: true, title: `New ${visit}`, line: join(when, what, name) }
  }
  if (outcome === "rescheduled") return { kind: "change", priority: true, title: `${capital(visit)} rescheduled`, line: join(when, what, name) }
  if (outcome === "cancelled") return { kind: "change", priority: true, title: `${capital(visit)} cancelled`, line: join(when, name) }
  if (outcome === "request_taken") return { kind: "lead", priority: true, title: `New ${visit} request`, line: join(when, what || get("reason"), name) }
  if (outcome === "quote_requested") return { kind: "lead", priority: true, title: "New quote request", line: join(get("issue") ?? get("reason"), get("service_address"), name) }
  if (outcome === "callback_requested") return { kind: "lead", priority: true, title: "Callback requested", line: join(name, get("reason")) }
  if (get("urgency") === "urgent") return { kind: "lead", priority: true, title: "Needs a call back soon", line: join(get("issue") ?? get("reason"), name) }
  if (outcome === "message_taken") return { kind: "lead", priority: true, title: "New message", line: join(name, get("reason")) }
  return { kind: "info", priority: false, title: "Caller", line: join(get("reason"), name) }
}
