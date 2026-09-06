import type { Metadata } from "next"
import { MountlineHomepage } from "@/components/mountline-homepage"

export const metadata: Metadata = {
  title: {
    absolute: "Mountline | Customer Systems for Service Businesses",
  },
  description:
    "Mountline builds AI reception, scheduling, follow-up, customer communication, websites, and practical operations systems for service businesses.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "AI receptionist",
    "business call handling",
    "missed call recovery",
    "service business scheduling",
    "customer communication systems",
    "service business websites",
  ],
  openGraph: {
    title: "Mountline | Every call should go somewhere.",
    description:
      "The customer operating layer for service businesses: answer, qualify, schedule, follow up, and keep the work visible.",
    url: "https://mountline.dev",
    siteName: "Mountline",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mountline | Every call should go somewhere.",
    description:
      "AI reception and customer operations systems for service businesses.",
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Mountline",
  url: "https://mountline.dev",
  email: "hello@mountline.dev",
  description:
    "Mountline builds AI reception, customer communication, scheduling, websites, and practical operations systems for service businesses.",
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
    "Appointment scheduling",
    "Missed-call recovery",
    "Customer communication systems",
    "Service business websites",
    "Internal workflow systems",
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
