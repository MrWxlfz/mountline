import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { SignalCampaignNewForm } from "./signal-campaign-new-form"

export default async function NewSignalCampaignPage() {
  await requireNorthlineTeamMember()
  return <SignalCampaignNewForm />
}
