import type { Metadata } from "next"
import { LocalGymDemo } from "./local-gym-demo"

export const metadata: Metadata = {
  title: "Corehouse Fitness Concept | Mountline Studio",
  description:
    "A high-energy fitness studio concept with class schedules, membership tiers, and trial booking functionality.",
}

export default function LocalGymConceptPage() {
  return <LocalGymDemo />
}
