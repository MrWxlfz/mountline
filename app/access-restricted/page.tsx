import Link from "next/link"
import { AccountMessage, AccountShell } from "@/components/brand/account-shell"

export default function AccessRestrictedPage() {
  return (
    <AccountShell>
      <AccountMessage
        eyebrow="Access restricted"
        title="This area is for the Mountline team"
        actions={
          <>
            <Link href="/id" className="ml-pill ml-pill-solid">Sign in with Mountline ID</Link>
            <Link href="/" className="ml-pill ml-pill-line">Back to Mountline</Link>
          </>
        }
      >
        If you’re a client, sign in with Mountline ID to see the projects assigned to you.
      </AccountMessage>
    </AccountShell>
  )
}
