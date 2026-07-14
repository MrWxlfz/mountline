"use client"

import {
  CalendarClock,
  Globe,
  Inbox,
  Laptop,
  LayoutDashboard,
  Moon,
  Plus,
  Radar,
  RadioTower,
  Search,
  Settings,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export type CommandLead = {
  id: string
  business_name: string
  city: string | null
  state: string | null
  public_phone: string | null
  public_email: string | null
}

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze a business", href: "/dashboard/signal/new", icon: RadioTower },
  { label: "Add lead manually", href: "/dashboard/signal/new", icon: Plus },
  { label: "Open Signal inbox", href: "/dashboard/signal", icon: Inbox },
  { label: "Open Scout", href: "/dashboard/scout", icon: Radar },
  { label: "Open pipeline", href: "/dashboard/pipeline", icon: LayoutDashboard },
  { label: "View follow-ups due", href: "/dashboard/signal/focus", icon: CalendarClock },
  { label: "Open settings", href: "/dashboard/settings", icon: Settings },
] as const

export function DashboardCommandPalette({ leads }: { leads: CommandLead[] }) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  function navigate(href: string) {
    setOpen(false)
    router.push(href)
  }

  function changeAppearance(appearance: "system" | "light" | "dark") {
    setTheme(appearance)
    setOpen(false)
    void fetch("/api/preferences/appearance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appearance }),
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-xs text-foreground-subtle transition-colors hover:bg-hover hover:text-foreground"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Search or jump</span>
        <kbd className="hidden rounded border border-border-strong bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] lg:inline">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Mountline OS command palette"
        description="Open tools, find leads, or change appearance."
        className="border-border bg-surface-elevated shadow-2xl"
      >
        <CommandInput placeholder="Search commands and leads…" />
        <CommandList>
          <CommandEmpty>No matching command or lead.</CommandEmpty>
          <CommandGroup heading="Actions">
            {navigation.map((item) => (
              <CommandItem key={item.label} value={`${item.label} ${item.href}`} onSelect={() => navigate(item.href)}>
                <item.icon />
                {item.label}
              </CommandItem>
            ))}
            <CommandItem
              value="View public site mountline.dev"
              onSelect={() => {
                setOpen(false)
                window.open("/", "_blank", "noopener,noreferrer")
              }}
            >
              <Globe />
              View public site
              <CommandShortcut>↗</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {leads.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Leads">
                {leads.map((lead) => (
                  <CommandItem
                    key={lead.id}
                    value={`${lead.business_name} ${lead.city || ""} ${lead.state || ""} ${lead.public_phone || ""} ${lead.public_email || ""}`}
                    onSelect={() => navigate(`/dashboard/signal/${lead.id}`)}
                  >
                    <RadioTower />
                    <span className="min-w-0 flex-1 truncate">{lead.business_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[lead.city, lead.state].filter(Boolean).join(", ") || "Lead workspace"}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="Appearance">
            <CommandItem value="System appearance" onSelect={() => changeAppearance("system")}>
              <Laptop /> System
            </CommandItem>
            <CommandItem value="Light appearance" onSelect={() => changeAppearance("light")}>
              <Sun /> Light
            </CommandItem>
            <CommandItem value="Dark appearance" onSelect={() => changeAppearance("dark")}>
              <Moon /> Dark
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
