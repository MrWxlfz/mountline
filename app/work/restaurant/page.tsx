import type { Metadata } from "next"
import { RestaurantDemo } from "./restaurant-demo"

export const metadata: Metadata = {
  title: "Ember & Oak Concept | Mountline Studio",
  description:
    "A warm, inviting restaurant concept with menu highlights, hours and location, and reservation functionality.",
}

export default function RestaurantConceptPage() {
  return <RestaurantDemo />
}
