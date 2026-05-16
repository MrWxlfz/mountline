import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { NorthlineLogo } from "@/components/northline-logo"
import { FolderKanban } from "lucide-react"

export default async function PortalIndexPage() {
  const { userId } = await auth()
  if (!userId) redirect("/client-login")

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress

  if (!email) {
    return (
      <PortalShell>
        <p className="text-sm text-muted-foreground">Unable to determine your email. Please contact support.</p>
      </PortalShell>
    )
  }

  const supabase = createAdminClient()

  // Find portal access for this user
  const { data: access } = await supabase
    .from("client_portal_access")
    .select("*, projects(portal_id, project_name, status)")
    .eq("client_email", email)
    .eq("access_status", "active")
    .order("created_at", { ascending: false })

  // If only one project, redirect directly
  if (access && access.length === 1 && access[0].projects?.portal_id) {
    redirect(`/portal/${access[0].projects.portal_id}`)
  }

  return (
    <PortalShell>
      {access && access.length > 1 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">You have access to multiple projects. Select one:</p>
          <div className="grid gap-3">
            {access.map((item: any) => (
              <Link
                key={item.id}
                href={`/portal/${item.projects?.portal_id}`}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-foreground/20 transition-colors"
              >
                <FolderKanban className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{item.projects?.project_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.projects?.status}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <FolderKanban className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No active projects found for <span className="font-medium text-foreground">{email}</span>.
          </p>
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact your project manager.
          </p>
          <Link href="/" className="inline-block text-sm text-muted-foreground hover:text-foreground underline mt-4">
            Back to northline.dev
          </Link>
        </div>
      )}
    </PortalShell>
  )
}

function PortalShell({ children }: { children: React.ReactNode }) {
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
