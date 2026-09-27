import Link from "next/link"
import type { ReactNode } from "react"
import { Wordmark } from "@/components/brand/wordmark"

/** Frame for account and access pages: a quiet header, one centred message, a plain footer. */
export function AccountShell({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" aria-label="Mountline home" className="text-foreground transition-opacity hover:opacity-75">
            <Wordmark size={18} />
          </Link>
          {aside}
        </div>
      </header>
      <main className="flex flex-1 items-center px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto w-full max-w-[440px] motion-safe:animate-[fade-up_700ms_cubic-bezier(0.16,1,0.3,1)_both]">
          {children}
        </div>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 text-[13px] text-muted-foreground sm:px-8">
          <span>© {new Date().getFullYear()} Mountline</span>
          <a href="mailto:hello@mountline.dev" className="transition-colors hover:text-foreground">
            hello@mountline.dev
          </a>
        </div>
      </footer>
    </div>
  )
}

export function AccountMessage({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="text-center">
      <p className="ml-eyebrow">{eyebrow}</p>
      <h1 className="font-display mt-4 text-balance text-[2.35rem] leading-[1.08] sm:text-[2.75rem]">{title}</h1>
      {children ? <div className="mx-auto mt-4 max-w-sm text-pretty text-[15px] leading-6 text-muted-foreground">{children}</div> : null}
      {actions ? <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">{actions}</div> : null}
    </div>
  )
}
