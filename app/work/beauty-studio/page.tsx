import type { Metadata } from "next"
import { DemoConceptPage, type DemoConceptConfig } from "../demo-concept-page"

export const metadata: Metadata = {
  title: "Vale Studio Concept | Mountline Studio",
  description: "A polished sample website direction for a fictional barber, beauty, or appointment-based studio.",
}

const beautyConfig: DemoConceptConfig = {
  brand: "Vale Studio",
  eyebrow: "Beauty studio concept",
  notice: "Concept build by Mountline Studio. This is a sample website direction, not a real client.",
  hero: {
    headline: "A cleaner booking experience for a sharper look.",
    subheadline:
      "An appointment-focused concept for cuts, color, styling, treatments, and consultations with a polished service menu and clear booking path.",
    primaryCta: "Book an appointment",
    secondaryCta: "View services",
  },
  theme: {
    page: "bg-[#080707] text-white",
    accentText: "text-rose-200",
    accentBg: "bg-rose-200",
    accentBorder: "border-rose-200/30",
    button: "bg-rose-100 text-black hover:bg-white",
    softPanel: "bg-[#141010]",
    highlight: "border-rose-200/25 bg-rose-200/[0.08]",
    inputFocus: "focus:border-rose-200",
  },
  servicesTitle: "A service menu that feels premium before the appointment.",
  services: [
    { title: "Cuts", description: "Clean service cards for trims, restyles, beard work, and maintenance appointments." },
    { title: "Color", description: "Consultation-first color positioning with expectations and care notes." },
    { title: "Styling", description: "Event, photo, and finishing services presented with simple booking prompts." },
    { title: "Treatments", description: "Add-on treatments, repair services, and recurring care recommendations." },
    { title: "Consultations", description: "A lower-friction path for new clients who need guidance before booking." },
  ],
  showcase: {
    eyebrow: "Gallery preview",
    title: "A visual layout for style, care, and appointment confidence.",
    description:
      "Beauty and barber sites need a strong first impression, but the booking flow matters just as much. This concept balances both.",
    items: [
      { label: "Signature cut", detail: "A clean gallery card for precision cuts, shape, and finish." },
      { label: "Color refresh", detail: "A consultation-friendly feature for color updates and tone maintenance." },
      { label: "Treatment plan", detail: "Care-forward positioning for repair, hydration, and scalp or hair health." },
      { label: "Event styling", detail: "Appointment prompts for weddings, shoots, and special occasions." },
    ],
  },
  proof: {
    eyebrow: "Client care",
    title: "Elegant, practical, and built around the appointment.",
    points: ["Booking-first flow", "Service menu clarity", "Consultation path", "Aftercare notes", "Gallery preview", "Mobile booking"],
  },
  offer: {
    eyebrow: "Service menu",
    title: "Clear service tiers without making the page feel transactional.",
    cards: [
      { title: "Essential", meta: "$55+", description: "Cuts, trims, and maintenance appointments with a clear booking path." },
      { title: "Signature", meta: "$125+", description: "Color, styling, and treatment combinations for higher-value services." },
      { title: "Consult", meta: "15 min", description: "A quick intro session for new clients before booking a full service." },
    ],
  },
  form: {
    eyebrow: "Booking request",
    title: "Make appointment requests feel calm and complete.",
    description: "This demo form is frontend-only and shows the shape of a polished booking request.",
    button: "Send demo booking request",
    successTitle: "Demo booking request received",
    fields: [
      { label: "Name", placeholder: "Your name" },
      { label: "Phone", placeholder: "(555) 123-4567", type: "tel" },
      { label: "Service", kind: "select", options: ["Cut", "Color", "Styling", "Treatment", "Consultation"] },
      { label: "Preferred date", placeholder: "", type: "date" },
      { label: "Appointment notes", kind: "textarea", placeholder: "Share goals, current hair/service history, or timing needs." },
    ],
  },
  finalCta: {
    headline: "A sharper client experience starts before the visit.",
    button: "Book an appointment",
  },
}

export default function BeautyStudioConceptPage() {
  return <DemoConceptPage config={beautyConfig} />
}
