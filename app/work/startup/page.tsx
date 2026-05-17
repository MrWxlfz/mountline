import type { Metadata } from "next"
import { DemoConceptPage, type DemoConceptConfig } from "../demo-concept-page"

export const metadata: Metadata = {
  title: "Launchgrid Concept | Mountline Studio",
  description: "A polished sample website direction for a fictional startup or SaaS launch page.",
}

const startupConfig: DemoConceptConfig = {
  brand: "Launchgrid",
  eyebrow: "Startup concept",
  notice: "Concept build by Mountline Studio. This is a sample website direction, not a real client.",
  hero: {
    headline: "Launch pages for products that need traction before they need polish theater.",
    subheadline:
      "A founder-focused SaaS concept for explaining the product, collecting qualified interest, and giving early users a reason to request access.",
    primaryCta: "Join the waitlist",
    secondaryCta: "View benefits",
  },
  theme: {
    page: "bg-[#040507] text-white",
    accentText: "text-sky-300",
    accentBg: "bg-sky-300",
    accentBorder: "border-sky-300/30",
    button: "bg-sky-300 text-black hover:bg-sky-200",
    softPanel: "bg-[#07111c]",
    highlight: "border-sky-300/25 bg-sky-300/[0.08]",
    inputFocus: "focus:border-sky-300",
  },
  servicesTitle: "A product story with the right amount of technical detail.",
  services: [
    { title: "Positioning", description: "A clear above-the-fold story for the user, problem, and outcome." },
    { title: "Feature blocks", description: "Concise product benefits that do not collapse into vague startup language." },
    { title: "Waitlist capture", description: "Early-access forms with role, company, and use-case qualification." },
    { title: "Pricing preview", description: "Simple packaging or waitlist tiers for buyers who need a buying signal." },
    { title: "Demo CTA", description: "Founder-friendly request flows for sales calls, pilots, and onboarding." },
  ],
  showcase: {
    eyebrow: "Product benefits",
    title: "A Vercel-like structure for a founder-led product launch.",
    description:
      "This concept keeps the page sharp, technical, and outcome-driven without pretending the product is bigger than it is.",
    items: [
      { label: "Pipeline clarity", detail: "Explain what the product organizes, automates, or improves in one short flow." },
      { label: "Role-based value", detail: "Give founders, operators, and teams different reasons to request access." },
      { label: "Launch proof", detail: "Use product screenshots, workflow cards, or honest demo labels instead of fake logos." },
      { label: "Qualified waitlist", detail: "Collect company, role, and use case so early interest is useful." },
    ],
  },
  proof: {
    eyebrow: "Launch readiness",
    title: "Built for early traction without fake enterprise theater.",
    points: ["Clear product story", "Waitlist capture", "Demo request path", "Pricing preview", "Founder-focused copy", "Fast mobile page"],
  },
  offer: {
    eyebrow: "Waitlist tiers",
    title: "Enough structure to help buyers self-select.",
    cards: [
      { title: "Explorer", meta: "Free", description: "Join the waitlist and receive launch notes when access opens." },
      { title: "Pilot", meta: "$99/mo", description: "Early team workspace, onboarding call, and product feedback loop." },
      { title: "Team", meta: "Custom", description: "Priority onboarding, migration support, and workflow configuration." },
    ],
  },
  form: {
    eyebrow: "Waitlist",
    title: "Capture useful interest, not just email addresses.",
    description: "This demo form is frontend-only and shows how a launch page can qualify early demand.",
    button: "Join demo waitlist",
    successTitle: "Demo waitlist request received",
    fields: [
      { label: "Name", placeholder: "Your name" },
      { label: "Work email", placeholder: "you@company.com", type: "email" },
      { label: "Role", kind: "select", options: ["Founder", "Operator", "Product", "Sales", "Other"] },
      { label: "Company stage", kind: "select", options: ["Idea", "Pre-launch", "Launched", "Scaling"] },
      { label: "Use case", kind: "textarea", placeholder: "What workflow or product launch problem should this solve?" },
    ],
  },
  finalCta: {
    headline: "Ship the page that makes the product easier to understand.",
    button: "Join the waitlist",
  },
}

export default function StartupConceptPage() {
  return <DemoConceptPage config={startupConfig} />
}
