"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { UserButton } from "@clerk/nextjs"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Inbox,
  Settings,
  Menu,
  X,
  ChevronRight,
  Globe,
  ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NorthlineLogo } from "@/components/northline-logo"

const navGroups = [
  {
    label: "Command",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/leads", label: "Leads", icon: Inbox },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/clients", label: "Clients", icon: Users },
      { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
      { href: "/dashboard/portals", label: "Portals", icon: Globe },
    ],
  },
]

const bottomNav = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href))

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-60 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-14 px-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <NorthlineLogo size="sm" showWordmark />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                OS
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-muted rounded-md text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1.5">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all",
                        isActive(item.href)
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                      {isActive(item.href) && (
                        <ChevronRight className="w-3 h-3 ml-auto" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-border p-3 space-y-1">
            {bottomNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all",
                  isActive(item.href)
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 px-3 py-2 mt-2">
              <UserButton
                afterSignOutUrl="/"
                appearance={{ elements: { avatarBox: "w-7 h-7" } }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate text-foreground">Admin</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  northline.dev
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center h-12 px-4 bg-background/80 backdrop-blur-sm border-b border-border lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 -ml-2 hover:bg-muted rounded-md text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View Site
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
