import type { Metadata } from "next"
import { BeautyStudioDemo } from "./beauty-studio-demo"

export const metadata: Metadata = {
  title: "Vale Studio Concept | Mountline Studio",
  description:
    "A serene, editorial beauty salon concept with elegant booking experience and premium service presentation.",
}

export default function BeautyStudioConceptPage() {
  return <BeautyStudioDemo />
}
