import type { ReceptionistProfile } from "./config.ts"

// This profile describes a fictional demonstration, not a customer or a live provider agent.
export const northTexasDemoProfile: ReceptionistProfile = {
  version: 1,
  id: "north-texas-air-heat-demo",
  mode: "demo",
  business: {
    name: "North Texas Air & Heat",
    timezone: "America/Chicago",
    serviceArea: ["Fort Worth", "Keller", "Southlake", "North Richland Hills"],
    services: ["AC not cooling", "Heating issues", "Unusual HVAC noises", "Routine maintenance"],
    hours: {
      monday: { opens: "08:00", closes: "17:00" },
      tuesday: { opens: "08:00", closes: "17:00" },
      wednesday: { opens: "08:00", closes: "17:00" },
      thursday: { opens: "08:00", closes: "17:00" },
      friday: { opens: "08:00", closes: "17:00" },
      saturday: null,
      sunday: null,
    },
  },
  faqs: [
    { question: "Can a technician come today?", answer: "A preferred time can be discussed, but availability is not connected and no visit can be booked in this demo." },
    { question: "Can an existing appointment be changed?", answer: "There is no appointment lookup in this demo. Practice taking a change request without saying an appointment was found, changed, or cancelled." },
    { question: "What if the address is outside the service area?", answer: "Explain that the listed towns are the example service area. Do not promise coverage elsewhere; offer to roleplay a coverage-check request." },
  ],
  pricing: { policy: "No prices are supplied for this fictional business. Do not invent service fees, repair estimates, discounts, financing, or free visits." },
  intake: { fields: ["issue", "service_location", "caller_name", "callback_number", "preferred_time"] },
  appointments: {
    mode: "request_only",
    instructions: "Collect a preferred day or time window as a request. Do not offer supposedly available slots or confirm a technician, visit, booking, reschedule, or cancellation.",
  },
  escalation: {
    urgentIssues: ["No cooling during extreme heat", "No heat during very cold weather", "A vulnerable person affected by the loss of heating or cooling", "Repeat equipment failures"],
    instructions: "Acknowledge urgency and ask one question about the caller's immediate need. Do not promise emergency service, a response time, same-day availability, a live transfer, or dispatch.",
  },
  capabilities: { booking: false, sms: false, liveTransfer: false },
}

// Deliberately incomplete. Validation prevents exporting a prompt until the required facts are supplied.
export const customerProfileTemplate = {
  version: 1,
  id: "customer-name",
  mode: "customer",
  business: { name: "", timezone: "America/Chicago", serviceArea: [], services: [], hours: null },
  faqs: [],
  pricing: { policy: "Prices have not been verified. Do not quote prices, discounts, financing, or free visits." },
  intake: { fields: ["issue", "service_location", "caller_name", "callback_number", "preferred_time"] },
  appointments: { mode: "request_only", instructions: "Collect a preferred day or time window. Availability and bookings are not connected; do not confirm a booking or a change to an existing appointment." },
  escalation: {
    urgentIssues: ["Caller asks for urgent help", "Caller asks to speak with a person"],
    instructions: "Offer to collect a callback request. Do not promise a response time, dispatch, or a live transfer.",
  },
  capabilities: { booking: false, sms: false, liveTransfer: false },
}
