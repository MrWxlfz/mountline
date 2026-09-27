import Link from "next/link"
import { AccountMessage, AccountShell } from "@/components/brand/account-shell"
import { TryAnotherAccountButton } from "./try-another-account-button"

export default function NoAccountPage() {
  return (
    <AccountShell>
      <AccountMessage
        eyebrow="Mountline ID"
        title="No Mountline access yet"
        actions={
          <>
            <TryAnotherAccountButton />
            <Link href="/" className="ml-pill ml-pill-line">Back to Mountline</Link>
          </>
        }
      >
        This account isn’t linked to a Mountline workspace or client portal. If you expected access, reply to your
        project email or write to hello@mountline.dev.
      </AccountMessage>
    </AccountShell>
  )
}
