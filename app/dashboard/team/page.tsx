"use client"

import { useState } from "react"
import { 
  Plus, 
  Users,
  Mail,
  MoreHorizontal,
  Shield,
  User,
  Eye
} from "lucide-react"

const roleIcons: Record<string, any> = {
  admin: Shield,
  member: User,
  viewer: Eye
}

const roleColors: Record<string, string> = {
  admin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  member: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  viewer: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

// Sample team data for demo
const sampleTeam = [
  {
    id: "1",
    name: "You",
    email: "you@example.com",
    role: "admin",
    avatar_url: null
  },
]

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const team = sampleTeam

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and their access levels.
          </p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Team grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => {
          const RoleIcon = roleIcons[member.role] || User
          return (
            <div
              key={member.id}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {member.avatar_url ? (
                    <img 
                      src={member.avatar_url} 
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold mb-1">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {member.email}
              </p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[member.role]}`}>
                <RoleIcon className="w-3 h-3" />
                {member.role}
              </span>
            </div>
          )
        })}

        {/* Invite card */}
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-card rounded-xl border border-dashed border-border p-6 hover:border-primary/50 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="font-medium">Invite Team Member</span>
          <span className="text-sm text-muted-foreground">Add someone to your team</span>
        </button>
      </div>

      {/* Roles explanation */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold mb-4">Role Permissions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="font-medium">Admin</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Full access to all features, settings, and team management.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Member</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Can create and manage projects, view leads, and add content.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Viewer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Read-only access to projects and analytics. Cannot make changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
