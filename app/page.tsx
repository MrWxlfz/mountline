import type { Metadata } from "next"
import { MountlineHomepage } from "@/components/mountline-homepage"

export const metadata: Metadata = {
  title: {
    absolute: "Mountline | AI Receptionists for Service Businesses",
  },
  description:
    "AI receptionist pilots for service businesses. Try the fictional HVAC demo, then discuss a setup for missed calls, service requests, and human follow-up.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "AI receptionist",
    "business call handling",
    "missed call recovery",
    "service request capture",
    "HVAC receptionist demo",
    "owner handoff",
  ],
  openGraph: {
    title: "Mountline | AI Receptionists for Service Businesses",
    description:
      "Try the North Texas Air & Heat demo and explore a focused receptionist pilot for your business. Your team confirms pricing and scheduling.",
    url: "https://mountline.dev",
    siteName: "Mountline",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mountline | AI Receptionists for Service Businesses",
    description:
      "AI receptionists for the calls your team cannot take.",
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Mountline",
  url: "https://mountline.dev",
  email: "hello@mountline.dev",
  description:
    "Mountline builds focused AI receptionist pilots for service businesses, with approved business information and team-owned pricing, scheduling, and follow-up.",
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
    "Service request intake",
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
