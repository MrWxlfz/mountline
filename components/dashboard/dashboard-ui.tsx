import Link from "next/link"
import type React from "react"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

export function PageHeader({
  actions,
  eyebrow,
  meta,
  subtitle,
  title,
}: {
  actions?: React.ReactNode
  eyebrow: string
  meta?: React.ReactNode
  subtitle?: string
  title: string
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
          {meta}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function SectionPanel({
  action,
  children,
  className,
  description,
  title,
}: {
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  description?: string
  title?: string
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      {(title || description || action) && (
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="font-semibold tracking-tight text-foreground">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={title || description || action ? "p-5" : ""}>{children}</div>
    </section>
  )
}

export function PrimaryAction({
  children,
  href,
  icon: Icon,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode
  href?: string
  icon?: LucideIcon
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
}) {
  const className =
    "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-50"

  if (href) {
    return (
      <Link href={href} className={className}>
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={className}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  )
}

export function SecondaryAction({
  children,
  href,
  icon: Icon,
  onClick,
  type = "button",
  disabled,
  tone = "default",
}: {
  children: React.ReactNode
  href?: string
  icon?: LucideIcon
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  tone?: "default" | "danger"
}) {
  const className = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
    tone === "danger"
      ? "border-red-500/30 text-red-300 hover:bg-red-500/10"
      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={className}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  )
}

export function MetricStrip({
  items,
}: {
  items: Array<{
    href?: string
    label: string
    value: number | string
    tone?: "default" | "blue" | "green" | "amber" | "red"
  }>
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => {
        const content = (
          <>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p
              className={cn(
                "mt-1 font-mono text-2xl font-semibold",
                item.tone === "blue" && "text-blue-300",
                item.tone === "green" && "text-green-300",
                item.tone === "amber" && "text-yellow-200",
                item.tone === "red" && "text-red-300",
              )}
            >
              {item.value}
            </p>
          </>
        )
        const className =
          "rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-foreground/20"

        return item.href ? (
          <Link key={item.label} href={item.href} className={className}>
            {content}
          </Link>
        ) : (
          <div key={item.label} className={className}>
            {content}
          </div>
        )
      })}
    </div>
  )
}

export function StatusBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode
  tone?: "default" | "blue" | "green" | "amber" | "red"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone === "default" && "border-border bg-muted text-muted-foreground",
        tone === "blue" && "border-blue-500/30 bg-blue-500/10 text-blue-300",
        tone === "green" && "border-green-500/30 bg-green-500/10 text-green-300",
        tone === "amber" && "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
        tone === "red" && "border-red-500/30 bg-red-500/10 text-red-300",
      )}
    >
      {children}
    </span>
  )
}

export function priorityTone(priority: string | null | undefined) {
  if (priority === "A") return "green" as const
  if (priority === "B") return "blue" as const
  if (priority === "C") return "amber" as const
  if (priority === "skip") return "red" as const
  return "default" as const
}

export function EmptyState({
  action,
  children,
  icon: Icon = MoreHorizontal,
  title,
}: {
  action?: React.ReactNode
  children?: React.ReactNode
  icon?: LucideIcon
  title: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
      <Icon className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
      <p className="font-medium text-foreground">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{children}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}

export function ActionRow({
  children,
  href,
  meta,
  title,
}: {
  children?: React.ReactNode
  href?: string
  meta?: React.ReactNode
  title: string
}) {
  const content = (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/35 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        {meta && <div className="mt-1 text-sm text-muted-foreground">{meta}</div>}
      </div>
      {children}
    </div>
  )

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  )
}

export function CompactTable({
  children,
  minWidth = "900px",
}: {
  children: React.ReactNode
  minWidth?: string
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  )
}

export function ExternalSmallLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  )
}
