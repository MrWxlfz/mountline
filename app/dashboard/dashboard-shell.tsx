"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { UserButton, useUser } from "@clerk/nextjs"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Inbox,
  Settings,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  Globe,
  ArrowUpRight,
  Radar,
  RadioTower,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart3,
  GitBranch,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NorthlineLogo } from "@/components/northline-logo"
import { Skeleton } from "@/components/ui/skeleton"

const navGroups = [
  {
    label: "Operate",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/leads", label: "Leads", icon: Inbox },
      { href: "/dashboard/pipeline", label: "Pipeline", icon: GitBranch },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/clients", label: "Clients", icon: Users },
      { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
      { href: "/dashboard/portals", label: "Portals", icon: Globe },
      { href: "/dashboard/support", label: "Support", icon: MessageSquare },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/dashboard/signal", label: "Signal", icon: RadioTower },
      { href: "/dashboard/scout", label: "Scout", icon: Radar },
      { href: "/dashboard/outreach", label: "Outreach", icon: Send },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
]

const bottomNav = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardShell({
  children,
  supportOpenCount = 0,
  signalUnreadCount = 0,
}: {
  children: React.ReactNode
  supportOpenCount?: number
  signalUnreadCount?: number
}) {
  const pathname = usePathname()
  const { isLoaded, user } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem("mountline-os-sidebar") === "collapsed"
  })

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href))

  const setSidebarCollapsed = () => {
    setCollapsed((value) => {
      const next = !value
      window.localStorage.setItem("mountline-os-sidebar", next ? "collapsed" : "expanded")
      return next
    })
  }

  const primaryEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || ""
  const emailName = primaryEmail ? primaryEmail.split("@")[0] : ""
  const displayName = user?.fullName || user?.firstName || emailName || "Team Member"
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

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
          "fixed top-0 left-0 z-50 h-full border-r border-border bg-card/95 backdrop-blur transform transition-all duration-200 ease-in-out lg:translate-x-0",
          collapsed ? "lg:w-[76px]" : "w-64 lg:w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn("flex h-16 items-center justify-between border-b border-border px-4", collapsed && "lg:px-3")}>
            <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
              <NorthlineLogo size="sm" showWordmark />
              <span className={cn("text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded", collapsed && "lg:hidden")}>
                OS
              </span>
            </Link>
            <button
              type="button"
              onClick={setSidebarCollapsed}
              className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-muted rounded-md text-muted-foreground"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className={cn("flex-1 overflow-y-auto px-3 py-5 space-y-7", collapsed && "lg:px-2")}>
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className={cn("px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70", collapsed && "lg:px-0 lg:text-center lg:text-[9px]")}>
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-all",
                        isActive(item.href)
                          ? "bg-muted text-foreground shadow-[inset_2px_0_0_var(--foreground)]"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        collapsed && "lg:justify-center lg:px-0",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
                      {item.href === "/dashboard/support" && supportOpenCount > 0 && (
                        <span
                          className={cn(
                            "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                            isActive(item.href)
                              ? "bg-blue-500/15 text-blue-300"
                              : "bg-blue-500/15 text-blue-400",
                            collapsed && "lg:absolute lg:right-1 lg:top-1 lg:ml-0 lg:px-1",
                          )}
                        >
                          {supportOpenCount}
                        </span>
                      )}
                      {item.href === "/dashboard/signal" && signalUnreadCount > 0 && (
                        <span
                          className={cn(
                            "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                            isActive(item.href)
                              ? "bg-blue-500/15 text-blue-300"
                              : "bg-blue-500/15 text-blue-400",
                            collapsed && "lg:absolute lg:right-1 lg:top-1 lg:ml-0 lg:px-1",
                          )}
                        >
                          {signalUnreadCount}
                        </span>
                      )}
                      {isActive(item.href) &&
                        !(item.href === "/dashboard/support" && supportOpenCount > 0) &&
                        !(item.href === "/dashboard/signal" && signalUnreadCount > 0) && (
                        <ChevronRight className={cn("w-3 h-3 ml-auto", collapsed && "lg:hidden")} />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className={cn("border-t border-border p-3 space-y-2", collapsed && "lg:px-2")}>
            {bottomNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-all",
                  isActive(item.href)
                    ? "bg-muted text-foreground shadow-[inset_2px_0_0_var(--foreground)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "lg:justify-center lg:px-0",
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
              </Link>
            ))}
            <div className={cn("mt-2 flex items-center gap-3 rounded-lg border border-border bg-background/60 px-3 py-2.5", collapsed && "lg:justify-center lg:px-2")}>
              <UserButton
                appearance={{ elements: { avatarBox: "w-8 h-8" } }}
              />
              <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
                {!isLoaded ? (
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ) : (
                  <>
                    <p className="truncate text-[13px] font-medium text-foreground">{displayName || initials || "Team Member"}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {primaryEmail || "Signed in"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        <header className="sticky top-0 z-30 flex items-center h-12 px-4 bg-background/80 backdrop-blur-sm border-b border-border lg:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 -ml-2 hover:bg-muted rounded-md text-muted-foreground"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1 px-3 lg:px-0">
            <p className="truncate text-xs text-muted-foreground">
              Mountline OS <span className="px-1 opacity-40">/</span> {pathname === "/dashboard" ? "Overview" : pathname.split("/").filter(Boolean).slice(1).map((part) => part.replace(/-/g, " ")).join(" / ")}
            </p>
          </div>
          <Link href="/dashboard/signal" className="mr-3 hidden h-8 items-center rounded-md bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/90 sm:inline-flex">
            Analyze business
          </Link>
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
