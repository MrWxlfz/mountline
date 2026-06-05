import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { isNorthlineTeamMember } from "@/lib/auth/team"
import { getAccessiblePortalDestinations } from "@/lib/auth/mountline-id"
import Link from "next/link"
import { NorthlineLogo } from "@/components/northline-logo"
import { FolderKanban } from "lucide-react"

export default async function PortalIndexPage() {
  const { userId } = await auth()
  if (!userId) redirect("/id")

  if (await isNorthlineTeamMember()) {
    redirect("/dashboard")
  }

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase()

  const access = await getAccessiblePortalDestinations({
    userId,
    emails: user?.emailAddresses?.map((item) => item.emailAddress) || [],
  })

  // If only one project, redirect directly
  if (access && access.length === 1) {
    redirect(`/portal/${access[0].portalId}`)
  }

  return (
    <PortalShell>
      {access && access.length > 1 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">You have access to multiple projects. Select one:</p>
          <div className="grid gap-3">
            {access.map((item) => (
              <Link
                key={item.accessId}
                href={`/portal/${item.portalId}`}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-foreground/20 transition-colors"
              >
                <FolderKanban className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{item.projectName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.status}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <FolderKanban className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No active projects found for <span className="font-medium text-foreground">{email || "this account"}</span>.
          </p>
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact your project manager.
          </p>
          <Link href="/" className="inline-block text-sm text-muted-foreground hover:text-foreground underline mt-4">
            Back to mountline.dev
          </Link>
        </div>
      )}
    </PortalShell>
  )
}

function PortalShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <NorthlineLogo size="md" showWordmark className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold tracking-tight">Your Projects</h1>
        </div>
        {children}
      </div>
    </div>
  )
}

// for demo purposes- this is a comment! this will show in github changes
