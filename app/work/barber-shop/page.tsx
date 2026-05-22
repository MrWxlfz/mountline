import type { Metadata } from "next"
import { BarberShopDemo } from "./barber-shop-demo"

export const metadata: Metadata = {
  title: "Ironwood Barber Co. Concept | Mountline Studio",
  description:
    "A premium sample website direction for a fictional local barbershop serving Keller and DFW. Created by Mountline Studio.",
}

export default function BarberShopDemoPage() {
  return <BarberShopDemo />
}
