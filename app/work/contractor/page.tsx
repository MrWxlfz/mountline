import type { Metadata } from "next"
import { ContractorDemo } from "./contractor-demo"

export const metadata: Metadata = {
  title: "Ridgeway Contracting Concept | Mountline Studio",
  description:
    "A rugged, professional contractor website concept with project gallery, clear process, and estimate request functionality.",
}

export default function ContractorConceptPage() {
  return <ContractorDemo />
}
