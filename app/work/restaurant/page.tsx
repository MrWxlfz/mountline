import type { Metadata } from "next"
import { DemoConceptPage, type DemoConceptConfig } from "../demo-concept-page"

export const metadata: Metadata = {
  title: "Ember & Oak Concept | Mountline Studio",
  description: "A polished sample website direction for a fictional restaurant or local dining business.",
}

const restaurantConfig: DemoConceptConfig = {
  brand: "Ember & Oak",
  eyebrow: "Restaurant concept",
  notice: "Concept build by Mountline Studio. This is a sample website direction, not a real client.",
  hero: {
    headline: "Wood-fired flavor, served without the wait.",
    subheadline:
      "A warm, menu-forward dining concept with hours, location, catering, and ordering paths visible before guests have to hunt.",
    primaryCta: "Start an order",
    secondaryCta: "View menu",
  },
  theme: {
    page: "bg-[#0b0806] text-white",
    accentText: "text-amber-300",
    accentBg: "bg-amber-300",
    accentBorder: "border-amber-300/30",
    button: "bg-amber-300 text-black hover:bg-amber-200",
    softPanel: "bg-[#1a120c]",
    highlight: "border-amber-300/25 bg-amber-300/[0.08]",
    inputFocus: "focus:border-amber-300",
  },
  servicesTitle: "Menu, hours, and ordering paths that guests can scan fast.",
  services: [
    { title: "Wood-fired mains", description: "Signature dishes with clear pricing, ingredients, and order prompts." },
    { title: "Lunch rush", description: "Fast ordering cues for office workers, locals, and regular weekday guests." },
    { title: "Dinner service", description: "Warm evening positioning with reservation and special-event calls to action." },
    { title: "Catering", description: "Private event menus, party trays, and inquiry forms presented without clutter." },
    { title: "Food truck stops", description: "Location and schedule cards for pop-ups, markets, and rotating service." },
  ],
  showcase: {
    eyebrow: "Featured menu",
    title: "A menu section that sells the food before the guest clicks away.",
    description:
      "Local dining sites need appetizing structure, not a PDF maze. This concept highlights items, hours, and action buttons in one flow.",
    items: [
      { label: "Ember brisket bowl", detail: "Smoked brisket, charred corn, pickled onion, herbs, and oak-fired sauce." },
      { label: "Hot honey flatbread", detail: "Crisp crust, mozzarella, chili honey, basil, and roasted garlic." },
      { label: "Market salad", detail: "Seasonal greens, toasted seeds, citrus vinaigrette, and grilled protein option." },
      { label: "Catering trays", detail: "Family-style trays with clear serving sizes and private-event inquiry prompts." },
    ],
  },
  proof: {
    eyebrow: "Guest clarity",
    title: "The basics are visible before appetite turns into frustration.",
    points: ["Hours up front", "Location clarity", "Menu highlights", "Order CTA", "Catering path", "Mobile-first menu"],
  },
  offer: {
    eyebrow: "Hours and options",
    title: "A local dining page that makes action obvious.",
    cards: [
      { title: "Lunch", meta: "11-2", description: "Fast weekday service for bowls, sandwiches, and rotating specials." },
      { title: "Dinner", meta: "5-9", description: "Wood-fired mains, flatbreads, and shareable plates for evening service." },
      { title: "Events", meta: "Catering", description: "Simple private-event inquiries for offices, parties, and pop-ups." },
    ],
  },
  form: {
    eyebrow: "Contact",
    title: "A cleaner way to ask about catering or reservations.",
    description: "This demo form is frontend-only and would connect to the restaurant in a production build.",
    button: "Send demo request",
    successTitle: "Demo dining request received",
    fields: [
      { label: "Name", placeholder: "Your name" },
      { label: "Email", placeholder: "you@example.com", type: "email" },
      { label: "Request type", kind: "select", options: ["Online order", "Reservation", "Catering", "Private event"] },
      { label: "Preferred date", placeholder: "", type: "date" },
      { label: "Message", kind: "textarea", placeholder: "Tell us about timing, party size, or catering needs." },
    ],
  },
  finalCta: {
    headline: "Hungry guests should know exactly what to do.",
    button: "Start an order",
  },
}

export default function RestaurantConceptPage() {
  return <DemoConceptPage config={restaurantConfig} />
}
