import { createAdminClient } from "@/lib/supabase/admin"
import { auth } from "@clerk/nextjs/server"
import { Users, Plus, Mail, Globe, Phone } from "lucide-react"
import Link from "next/link"

export default async function ClientsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  const { data: clients } = await supabase
    .from("clients")
    .select("*, projects(id, project_name, status)")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships.</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Link>
      </div>

      {clients && clients.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: any) => (
            <div key={client.id} className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {client.business_name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  client.status === "active" ? "bg-green-500/10 text-green-500" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {client.status}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{client.business_name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{client.contact_name}</p>
              <div className="space-y-1.5">
                {client.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.website && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    <span className="truncate">{client.website}</span>
                  </div>
                )}
              </div>
              {client.projects && client.projects.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1.5">{client.projects.length} project(s)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.projects.map((p: any) => (
                      <span key={p.id} className="text-xs px-2 py-0.5 rounded bg-foreground/5 text-foreground">
                        {p.project_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <h3 className="font-semibold mb-1">No clients yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first client to start tracking projects and portals.
          </p>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
        </div>
      )}
    </div>
  )
}
