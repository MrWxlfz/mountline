import type { Metadata } from "next"
import { cookies } from "next/headers"
import { ReceptionistGate } from "@/components/receptionist-gate/gate"
import { ReceptionistContent } from "@/components/receptionist-gated/content"
import { BookingProvider } from "@/components/site/booking"
import { bookingEmbedUrl } from "@/lib/booking-embed"
import { GATE_COOKIE, tokenIsValid } from "@/lib/receptionist-gate"

// Nothing here describes the page: the gate is all a visitor without the password gets.
export const metadata: Metadata = {
  title: { absolute: "Mountline" },
  description: "Websites, Google listings, and ads for businesses around Keller.",
  robots: { index: false, follow: false },
}

/** Early-access page behind a password (lib/receptionist-gate.ts). Reads a cookie, so it's always dynamic. */
export default async function ReceptionistRoute() {
  const unlocked = tokenIsValid((await cookies()).get(GATE_COOKIE)?.value)
  if (!unlocked) {
    return (
      <BookingProvider embedUrl={await bookingEmbedUrl()}>
        <ReceptionistGate />
      </BookingProvider>
    )
  }
  return (
    <BookingProvider embedUrl={await bookingEmbedUrl()}>
      <div className="rx-unlocked">
        <ReceptionistContent />
      </div>
    </BookingProvider>
  )
}
