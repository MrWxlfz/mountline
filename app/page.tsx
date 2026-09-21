import type { Metadata } from "next"
import { MountlineHomepage } from "@/components/mountline-homepage"

export const metadata: Metadata = {
  title: {
    absolute: "Mountline | Cleaning Inquiry Capture Pilot",
  },
  description:
    "Mountline collects cleaning inquiries when your team cannot answer and prepares the details for team follow-up.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "AI receptionist",
    "business call handling",
    "missed call recovery",
    "cleaning inquiry capture",
    "cleaning business call intake",
    "owner handoff",
  ],
  openGraph: {
    title: "Mountline | Cleaning Inquiry Capture Pilot",
    description:
      "A configured cleaning-inquiry pilot that records caller details for team-owned pricing, scheduling, and follow-up.",
    url: "https://mountline.dev",
    siteName: "Mountline",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mountline | Cleaning Inquiry Capture Pilot",
    description:
      "Collect cleaning inquiries and prepare the details for team follow-up.",
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Mountline",
  url: "https://mountline.dev",
  email: "hello@mountline.dev",
  description:
    "Mountline provides configured cleaning-inquiry capture pilots with team-owned pricing, scheduling, and follow-up.",
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
    "AI receptionist systems",
    "Inbound call handling",
    "Cleaning inquiry capture",
    "Structured call intake",
    "Owner handoff records",
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
