import { Instrument_Serif } from "next/font/google"

/**
 * Mountline's own type is Geist, loaded once in app/layout.tsx. Instrument Serif belongs to Bramble,
 * the fictional business in the design demonstrations, as that business's own brand, so it is
 * loaded on the homepage alone.
 */

// Not preloaded: it only sets the example's own headings, so it shouldn't compete with Mountline's
// headline font for the first screen.
export const exampleSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-example-serif",
  display: "swap",
  preload: false,
})
