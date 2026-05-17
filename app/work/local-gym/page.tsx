import type { Metadata } from "next"
import { DemoConceptPage, type DemoConceptConfig } from "../demo-concept-page"

export const metadata: Metadata = {
  title: "Corehouse Fitness Concept | Mountline Studio",
  description: "A polished sample website direction for a fictional local gym and training studio.",
}

const gymConfig: DemoConceptConfig = {
  brand: "Corehouse Fitness",
  eyebrow: "Fitness concept",
  notice: "Concept build by Mountline Studio. This is a sample website direction, not a real client.",
  hero: {
    headline: "Train harder. Move better. Stay consistent.",
    subheadline:
      "A sharp local gym concept for personal training, strength classes, conditioning blocks, and member conversion without the usual fitness-site clutter.",
    primaryCta: "Book a trial",
    secondaryCta: "View programs",
  },
  theme: {
    page: "bg-[#040607] text-white",
    accentText: "text-lime-300",
    accentBg: "bg-lime-300",
    accentBorder: "border-lime-300/30",
    button: "bg-lime-300 text-black hover:bg-lime-200",
    softPanel: "bg-zinc-950",
    highlight: "border-lime-300/30 bg-lime-300/[0.08]",
    inputFocus: "focus:border-lime-300",
  },
  servicesTitle: "Programs built for strength, energy, and retention.",
  services: [
    { title: "Personal Training", description: "Goal-based coaching pages that make the first session feel approachable." },
    { title: "Strength Classes", description: "Small-group training blocks with clear outcomes, intensity, and schedule previews." },
    { title: "Conditioning", description: "High-energy sessions framed around athletic output without gimmicks." },
    { title: "Nutrition Support", description: "Simple coaching add-ons explained as consistency support, not magic." },
    { title: "Member Check-ins", description: "Retention-focused touchpoints for progress, accountability, and next goals." },
  ],
  showcase: {
    eyebrow: "Class preview",
    title: "A schedule that helps prospects picture the routine.",
    description:
      "This concept combines a clean class preview, trainer-led program cards, and direct trial booking so visitors know exactly how to start.",
    items: [
      { label: "Monday Strength", detail: "Lower-body strength block with coach notes, capacity, and timing." },
      { label: "Tuesday Engine", detail: "Conditioning class preview with intensity level and recovery guidance." },
      { label: "Thursday Build", detail: "Upper-body strength and accessory work for steady progression." },
      { label: "Saturday Team", detail: "Community session positioning without cheesy hype or fake testimonials." },
    ],
  },
  proof: {
    eyebrow: "Why it works",
    title: "Premium energy without looking like a franchise template.",
    points: ["Clear class schedule", "Trial-first conversion", "Trainer credibility", "Membership clarity", "Mobile booking", "Local studio feel"],
  },
  offer: {
    eyebrow: "Demo memberships",
    title: "Simple membership cards for a real buying decision.",
    cards: [
      { title: "Starter", meta: "$99/mo", description: "Two classes weekly, movement screen, and habit-building support." },
      { title: "Unlimited", meta: "$169/mo", description: "Full class access, monthly check-in, and conditioning programming." },
      { title: "Coaching", meta: "$320/mo", description: "Hybrid personal training and classes for higher-accountability members." },
    ],
  },
  form: {
    eyebrow: "Trial booking",
    title: "Make the first visit easy to book.",
    description: "This demo form is frontend-only and shows how a gym can capture trial interest cleanly.",
    button: "Book demo trial",
    successTitle: "Demo trial request received",
    fields: [
      { label: "Name", placeholder: "Your name" },
      { label: "Email", placeholder: "you@example.com", type: "email" },
      { label: "Program interest", kind: "select", options: ["Personal training", "Strength classes", "Conditioning", "Nutrition support"] },
      { label: "Preferred time", kind: "select", options: ["Morning", "Midday", "Evening", "Weekend"] },
      { label: "Training goal", kind: "textarea", placeholder: "Strength, consistency, fat loss, sport performance, or general fitness." },
    ],
  },
  finalCta: {
    headline: "Start with one strong session.",
    button: "Book a trial",
  },
}

export default function LocalGymConceptPage() {
  return <DemoConceptPage config={gymConfig} />
}
