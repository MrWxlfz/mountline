"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { 
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Save,
  Loader2
} from "lucide-react"

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "billing", label: "Billing", icon: CreditCard },
  ]

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-card rounded-xl border border-border">
        {activeTab === "profile" && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="font-semibold mb-4">Profile Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    type="text"
                    defaultValue={user?.firstName || ""}
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    defaultValue={user?.lastName || ""}
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.emailAddresses[0]?.emailAddress || ""}
                    disabled
                    className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email is managed through Clerk. Click your profile picture to change it.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="font-semibold mb-4">Business Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <input
                    type="text"
                    placeholder="Your company"
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <input
                    type="url"
                    placeholder="https://yoursite.com"
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="p-6 space-y-6">
            <h2 className="font-semibold mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: "New lead notifications", desc: "Get notified when someone submits the contact form" },
                { label: "Project updates", desc: "Receive updates about project status changes" },
                { label: "Weekly summary", desc: "Get a weekly summary of your dashboard activity" },
                { label: "Marketing emails", desc: "Receive tipsastro tricks for growing your business" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="p-6 space-y-6">
            <h2 className="font-semibold mb-4">Security Settings</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Security settings are managed through Clerk. Click the button below to manage your security preferences.
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
              <Shield className="w-4 h-4" />
              Manage Security in Clerk
            </button>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="p-6 space-y-6">
            <h2 className="font-semibold mb-4">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose your preferred color scheme
                </p>
                <div className="flex gap-3">
                  {["light", "dark", "system"].map((theme) => (
                    <button
                      key={theme}
                      className="px-4 py-2 bg-muted border border-border rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors capitalize"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="p-6 space-y-6">
            <h2 className="font-semibold mb-4">Billing & Subscription</h2>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Free Plan</p>
                  <p className="text-sm text-muted-foreground">You&apos;re currently on the free plan</p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
