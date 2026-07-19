import type { Metadata } from "next"
import { EventExperience } from "@/components/event/event-experience"

export const metadata: Metadata = {
  title: "Mountline Event",
  description: "A live Mountline experience.",
  alternates: { canonical: "/event" },
  robots: { index: false, follow: false },
}

interface EventPageProps {
  searchParams: Promise<{ operator?: string | string[] }>
}

export default async function EventPage({ searchParams }: EventPageProps) {
  const params = await searchParams
  const operatorMode = params.operator === "1"

  return <EventExperience operatorMode={operatorMode} />
}
