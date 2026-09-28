import { Instrument_Sans, Instrument_Serif } from "next/font/google"

/**
 * Public-site type. Instrument Sans carries everything Mountline says; its width axis lets large
 * headlines tighten without switching families. Instrument Serif belongs to the Bramble design
 * example only, as that fictional business's own brand, so it is loaded on the homepage alone.
 */
export const siteSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-site-sans",
  axes: ["wdth"],
  display: "swap",
})

export const exampleSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-example-serif",
  display: "swap",
})
