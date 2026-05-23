import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { SignalImportFlow } from "./signal-import-flow"

export default async function SignalImportPage() {
  await requireNorthlineTeamMember()
  return <SignalImportFlow />
}
