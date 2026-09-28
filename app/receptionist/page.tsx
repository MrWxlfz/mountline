import type { Metadata } from "next"
import { ReceptionistPage } from "@/components/receptionist/receptionist-page"

const description =
  "Mountline’s AI receptionist answers missed and after-hours calls for service businesses, asks the questions you choose, and leaves your team a clear request. Call the fictional HVAC demo to hear it."

export const metadata: Metadata = {
  title: { absolute: "AI Receptionist for Service Businesses | Mountline" },
  description,
  alternates: { canonical: "/receptionist" },
  openGraph: {
    title: "AI Receptionist for Service Businesses | Mountline",
    description,
    url: "https://mountline.dev/receptionist",
    siteName: "Mountline",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Receptionist | Mountline",
    description: "An AI receptionist for the calls your team can’t take. Call the fictional HVAC demo line to hear it.",
  },
}

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "AI receptionist",
  serviceType: "AI receptionist for inbound business calls",
  url: "https://mountline.dev/receptionist",
  provider: { "@type": "ProfessionalService", name: "Mountline", url: "https://mountline.dev" },
  areaServed: { "@type": "AdministrativeArea", name: "Dallas–Fort Worth" },
  description:
    "Answers missed and after-hours calls with approved business information, collects the caller’s request, and hands it to the business’s own team for pricing, scheduling, and follow-up.",
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <ReceptionistPage />
    </>
  )
}
