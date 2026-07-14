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
      ? "border-error-border text-error-foreground hover:bg-error-soft"
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
    <div className={cn(
      "grid gap-2 sm:grid-cols-2",
      items.length >= 5 ? "lg:grid-cols-5" : items.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
    )}>
      {items.map((item) => {
        const content = (
          <>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p
              className={cn(
                "mt-1 font-mono text-2xl font-semibold",
                item.tone === "blue" && "text-information-foreground",
                item.tone === "green" && "text-success-foreground",
                item.tone === "amber" && "text-warning-foreground",
                item.tone === "red" && "text-error-foreground",
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

export function StateNotice({
  children,
  title,
  tone = "default",
}: {
  children?: React.ReactNode
  title: string
  tone?: "default" | "info" | "success" | "warning" | "error"
}) {
  return (
    <div className={cn(
      "rounded-lg border px-4 py-3 text-sm",
      tone === "default" && "border-border bg-muted/20",
      tone === "info" && "border-information-border bg-information-soft text-information-foreground",
      tone === "success" && "border-success-border bg-success-soft text-success-foreground",
      tone === "warning" && "border-warning-border bg-warning-soft text-warning-foreground",
      tone === "error" && "border-error-border bg-error-soft text-error-foreground",
    )}>
      <p className="font-medium text-current">{title}</p>
      {children && <div className="mt-1 leading-5 opacity-75">{children}</div>}
    </div>
  )
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
      {children}
    </div>
  )
}

export function Timeline({
  items,
}: {
  items: Array<{ id: string; title: React.ReactNode; meta?: React.ReactNode; body?: React.ReactNode }>
}) {
  return (
    <div className="space-y-4 border-l border-border pl-5">
      {items.map((item) => (
        <div key={item.id} className="relative">
          <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-foreground" />
          <div className="text-sm font-medium text-foreground">{item.title}</div>
          {item.meta && <div className="mt-1 text-xs text-muted-foreground">{item.meta}</div>}
          {item.body && <div className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</div>}
        </div>
      ))}
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
        tone === "blue" && "border-information-border bg-information-soft text-information-foreground",
        tone === "green" && "border-success-border bg-success-soft text-success-foreground",
        tone === "amber" && "border-warning-border bg-warning-soft text-warning-foreground",
        tone === "red" && "border-error-border bg-error-soft text-error-foreground",
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
