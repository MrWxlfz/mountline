import type { Metadata } from "next"
import { AutoDetailingDemo } from "./auto-detailing-demo"

export const metadata: Metadata = {
  title: "Apex Auto Detail Concept | Mountline Studio",
  description:
    "A polished sample website direction for a fictional premium auto detailing business.",
}

export default function AutoDetailingDemoPage() {
  return <AutoDetailingDemo />
}
