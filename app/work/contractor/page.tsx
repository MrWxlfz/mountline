import type { Metadata } from "next"
import { DemoConceptPage, type DemoConceptConfig } from "../demo-concept-page"

export const metadata: Metadata = {
  title: "Ridgeway Contracting Concept | Mountline Studio",
  description: "A polished sample website direction for a fictional contractor and home services business.",
}

const contractorConfig: DemoConceptConfig = {
  brand: "Ridgeway Contracting",
  eyebrow: "Contractor concept",
  notice: "Concept build by Mountline Studio. This is a sample website direction, not a real client.",
  hero: {
    headline: "Reliable home projects, handled with precision.",
    subheadline:
      "Remodels, roofing, outdoor structures, repairs, and custom builds presented with the clarity homeowners need before requesting an estimate.",
    primaryCta: "Request an estimate",
    secondaryCta: "View services",
  },
  theme: {
    page: "bg-[#080706] text-white",
    accentText: "text-stone-300",
    accentBg: "bg-stone-300",
    accentBorder: "border-stone-300/30",
    button: "bg-stone-200 text-black hover:bg-white",
    softPanel: "bg-stone-900/70",
    highlight: "border-stone-300/25 bg-stone-300/[0.09]",
    inputFocus: "focus:border-stone-300",
  },
  servicesTitle: "High-trust home services, organized for fast decisions.",
  services: [
    { title: "Remodels", description: "Kitchen, bath, basement, and interior updates with clear scope and sequencing." },
    { title: "Roofing", description: "Repair and replacement pages that explain materials, timing, and warranty basics." },
    { title: "Outdoor Projects", description: "Decks, patios, pergolas, and exterior upgrades shown with project-style visuals." },
    { title: "Repairs", description: "Straightforward service calls for homeowners who need a reliable local crew." },
    { title: "Custom Builds", description: "Dedicated project inquiry paths for higher-ticket and specialty work." },
  ],
  showcase: {
    eyebrow: "Project gallery concept",
    title: "A portfolio-first layout that makes craftsmanship visible.",
    description:
      "Contractor sites need proof fast. This concept leads with strong project categories, simple filters, and estimate-oriented calls to action.",
    items: [
      { label: "Kitchen refresh", detail: "Before, during, and after framing for a high-impact remodel case study." },
      { label: "Roof replacement", detail: "Material notes, timeline, and inspection highlights presented in plain language." },
      { label: "Outdoor living", detail: "Warm project cards for decks, patios, fencing, and backyard upgrades." },
      { label: "Repair calls", detail: "Quick request paths for small jobs without making the site feel low-end." },
    ],
  },
  proof: {
    eyebrow: "Trust and process",
    title: "Built around confidence before the first call.",
    points: ["Licensed and insured area", "Clear estimate process", "Project photo proof", "Service area clarity", "Warranty notes", "Fast quote request"],
  },
  offer: {
    eyebrow: "Process",
    title: "A sturdy sales path for serious home projects.",
    cards: [
      { title: "1. Scope", meta: "Site visit", description: "Capture photos, goals, timeline, and budget signals before an estimate." },
      { title: "2. Plan", meta: "Clear quote", description: "Explain materials, phases, and decision points without burying the homeowner." },
      { title: "3. Build", meta: "Clean updates", description: "Show progress expectations, jobsite professionalism, and next steps." },
    ],
  },
  form: {
    eyebrow: "Estimate request",
    title: "Turn serious homeowners into organized inquiries.",
    description: "This frontend-only concept form shows the kind of qualifying flow a contractor site can use.",
    button: "Send demo estimate request",
    successTitle: "Demo estimate request received",
    fields: [
      { label: "Name", placeholder: "Your name" },
      { label: "Phone", placeholder: "(555) 123-4567", type: "tel" },
      { label: "Project type", kind: "select", options: ["Remodel", "Roofing", "Outdoor project", "Repair", "Custom build"] },
      { label: "Project timeline", kind: "select", options: ["ASAP", "This month", "1-3 months", "Planning ahead"] },
      { label: "Project details", kind: "textarea", placeholder: "Tell us about the property, goals, and any known timeline." },
    ],
  },
  finalCta: {
    headline: "Ready to plan the next project?",
    button: "Request an estimate",
  },
}

export default function ContractorConceptPage() {
  return <DemoConceptPage config={contractorConfig} />
}
