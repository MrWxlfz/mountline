import type { Metadata } from "next"
import { PetGroomingDemo } from "./pet-grooming-demo"

export const metadata: Metadata = {
  title: "Diamonds 'n the Ruff Concept | Mountline Studio",
  description:
    "A warm, appointment-focused pet grooming website concept for Diamonds 'n the Ruff. Created by Mountline Studio.",
}

export default function PetGroomingDemoPage() {
  return <PetGroomingDemo />
}
