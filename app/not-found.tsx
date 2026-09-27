import Link from "next/link"
import { AccountMessage, AccountShell } from "@/components/brand/account-shell"
import { receptionistDemo } from "@/lib/receptionist/demo"

export default function NotFound() {
  return (
    <AccountShell>
      <AccountMessage
        eyebrow="404"
        title="This page doesn’t exist"
        actions={
          <>
            <Link href="/" className="ml-pill ml-pill-solid">Back to Mountline</Link>
            <a href={receptionistDemo.phoneHref} className="ml-pill ml-pill-line">Call the demo</a>
          </>
        }
      >
        The link may be old or mistyped. Everything else is where you left it.
      </AccountMessage>
    </AccountShell>
  )
}
