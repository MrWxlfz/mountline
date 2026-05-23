import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { SignalResearchFlow } from "./signal-research-flow"

export default async function SignalResearchPage() {
  await requireNorthlineTeamMember()
  return <SignalResearchFlow />
}
