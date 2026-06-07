import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { SignalMarketNewForm } from "./signal-market-new-form"

export default async function NewSignalMarketPage() {
  await requireNorthlineTeamMember()
  return <SignalMarketNewForm />
}
