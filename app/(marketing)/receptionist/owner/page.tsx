import { redirect } from "next/navigation"

/** The owner view became the Staff app tab. Old links keep working. */
export default async function OwnerPage({ searchParams }: { searchParams: Promise<{ agent?: string; call?: string }> }) {
  const { agent, call } = await searchParams
  const query = new URLSearchParams()
  if (typeof agent === "string" && agent) query.set("agent", agent)
  if (typeof call === "string" && call) query.set("call", call)
  redirect(`/receptionist/staff${query.size ? `?${query}` : ""}`)
}
