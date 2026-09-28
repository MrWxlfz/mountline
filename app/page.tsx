import type { Metadata } from "next"
import { MountlineHomepage } from "@/components/mountline-homepage"

const title = "Mountline | Websites for Local Businesses"
const description =
  "Mountline designs and builds websites for local businesses in Keller and across Dallas–Fort Worth, with original photo and video by arrangement and an AI receptionist for the calls your team can’t take."

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "https://mountline.dev",
    siteName: "Mountline",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: "Websites for local businesses, with original photo and video and an AI receptionist when you need them.",
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Mountline",
  url: "https://mountline.dev",
  email: "hello@mountline.dev",
  description:
    "Mountline designs and builds websites for local businesses, offers original photo and video for those websites by arrangement, and sets up AI receptionists for calls a business’s team can’t take.",
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
  knowsAbout: ["Website design", "Website development", "Website copywriting", "Photography and video for websites", "AI receptionist systems"],
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
