import type { Metadata } from "next"
import { StartupDemo } from "./startup-demo"

export const metadata: Metadata = {
  title: "Launchgrid Concept | Mountline Studio",
  description:
    "A modern SaaS/startup landing page concept with product positioning, waitlist capture, and pricing preview.",
}

export default function StartupConceptPage() {
  return <StartupDemo />
}
