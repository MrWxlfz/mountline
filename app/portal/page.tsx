import { redirect } from "next/navigation"
import { getNorthlineTeamAccess } from "@/lib/auth/team"
import { getServerIdentity } from "@/lib/auth/identity"
import { getAccessiblePortalDestinations } from "@/lib/auth/mountline-id"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AccountMessage, AccountShell } from "@/components/brand/account-shell"

export default async function PortalIndexPage() {
  const identity = await getServerIdentity()
  if (!identity) redirect("/id")

  const teamAccess = await getNorthlineTeamAccess(identity)
  if (teamAccess.status === "error") {
    throw new Error("Portal authorization could not be verified.")
  }
  if (teamAccess.isTeamMember) {
    redirect("/dashboard")
  }

  const portalResult = await getAccessiblePortalDestinations({ identity })
  if (portalResult.status === "error") {
    throw new Error("Portal assignments could not be loaded.")
  }
  const access = portalResult.destinations

  // If only one project, redirect directly
  if (access && access.length === 1) {
    redirect(`/portal/${access[0].portalId}`)
  }

  if (access && access.length > 1) {
    return (
      <AccountShell>
        <div className="text-center">
          <p className="ml-eyebrow">Client portal</p>
          <h1 className="font-display mt-4 text-[2.35rem] leading-[1.08] sm:text-[2.75rem]">Your projects</h1>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-6 text-muted-foreground">Choose a project to open its portal.</p>
        </div>
        <ul className="mt-10 border-b border-border">
          {access.map((item) => (
            <li key={item.accessId} className="border-t border-border">
              <Link
                href={`/portal/${item.portalId}`}
                className="group flex items-center justify-between gap-4 py-4 transition-colors"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium">{item.projectName}</span>
                  <span className="ml-eyebrow mt-1 block">{item.status}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </AccountShell>
    )
  }

  return (
    <AccountShell>
      <AccountMessage
        eyebrow="Client portal"
        title="No active projects"
        actions={<Link href="/" className="ml-pill ml-pill-line">Back to Mountline</Link>}
      >
        We couldn’t find a project for <span className="text-foreground">{identity.primaryEmail || "this account"}</span>. If
        that seems wrong, reply to your project email or write to hello@mountline.dev.
      </AccountMessage>
    </AccountShell>
  )
}
