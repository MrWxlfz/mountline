import type { Metadata } from "next"
import { AutoDetailingDemo } from "./auto-detailing-demo"

export const metadata: Metadata = {
  title: "Summit Auto Detail Concept | Mountline Studio",
  description:
    "A premium sample website direction for a fictional mobile auto detailing business serving DFW. Created by Mountline Studio.",
}

export default function AutoDetailingDemoPage() {
  return <AutoDetailingDemo />
}
