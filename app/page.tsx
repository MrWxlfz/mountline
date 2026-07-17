import type { Metadata } from "next"
import { MountlineHomepage } from "@/components/mountline-homepage"

export const metadata: Metadata = {
  title: {
    absolute: "Mountline | Make Your Business Easier to Choose",
  },
  description:
    "Mountline builds exceptional websites and practical systems that help customers call, book, buy, and get answers.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "business website design",
    "web design Keller Texas",
    "customer experience design",
    "local business websites",
    "DFW local businesses",
  ],
  openGraph: {
    title: "Mountline | Make Your Business Easier to Choose",
    description:
      "Exceptional websites and practical systems from a founder-led studio in Keller, Texas.",
    url: "https://mountline.dev",
    siteName: "Mountline",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mountline | Make Your Business Easier to Choose",
    description:
      "Exceptional websites and practical systems from Mountline.",
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Mountline",
  url: "https://mountline.dev",
  email: "hello@mountline.dev",
  description:
    "Mountline builds exceptional websites and practical systems that make businesses easier to choose and easier to run.",
  founder: {
    "@type": "Person",
    name: "Luke Nordin",
  },
  areaServed: [
    {
      "@type": "City",
      name: "Keller",
      containedInPlace: {
        "@type": "State",
        name: "Texas",
      },
    },
    {
      "@type": "AdministrativeArea",
      name: "Dallas–Fort Worth",
    },
  ],
  knowsAbout: [
    "Local business websites",
    "Lead response and follow-up",
    "Client portals",
    "Customer systems",
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <MountlineHomepage />
    </>
  )
}
