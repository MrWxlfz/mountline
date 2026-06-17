import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ContactRound,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  UserRound,
  type LucideIcon,
} from "lucide-react"

const contact = {
  // Public contact values only. Add Luke's public NFC/text number here when ready.
  phoneNumber: "",
  phoneLabel: "Text Luke",
  email: "hello@mountline.dev",
  homepageUrl: "https://mountline.dev",
  homepageLabel: "mountline.dev",
}

const pageUrl = `${contact.homepageUrl}/luke`

export const metadata: Metadata = {
  title: "Luke Nordin — Mountline Studio",
  description:
    "Luke Nordin, founder of Mountline Studio in Keller, Texas. Clean websites and practical online systems for local businesses.",
  alternates: {
    canonical: "/luke",
  },
  openGraph: {
    title: "Luke Nordin — Mountline Studio",
    description:
      "Clean websites, concept previews, client portals, and simple lead systems for local businesses.",
    url: pageUrl,
    siteName: "Mountline Studio",
    images: [
      {
        url: "/luke-profile.jpg",
        width: 1200,
        height: 799,
        alt: "Luke Nordin, founder of Mountline Studio.",
      },
    ],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luke Nordin — Mountline Studio",
    description:
      "Local websites and simple online systems from Mountline Studio.",
    images: ["/luke-profile.jpg"],
  },
}

const capabilities: Array<{
  title: string
  copy: string
  icon: LucideIcon
}> = [
  {
    title: "Simple business websites",
    copy: "Clear pages that explain the business, services, proof, and next step.",
    icon: Globe2,
  },
  {
    title: "Website concept previews",
    copy: "A focused preview can show what a sharper online presence could look like.",
    icon: FileText,
  },
  {
    title: "Contact forms & call buttons",
    copy: "Make it easier for customers to call, request a quote, or send details.",
    icon: Phone,
  },
  {
    title: "Client portals / appointment flows",
    copy: "Small systems can keep project links, updates, forms, and next steps organized.",
    icon: BriefcaseBusiness,
  },
]

const previews: Array<{
  title: string
  copy: string
  href?: string
}> = [
  {
    title: "Auto detailing website concept",
    copy: "Packages, proof, and a cleaner path for customers to request detailing work.",
    href: "/work/auto-detailing",
  },
  {
    title: "Barber shop website concept",
    copy: "Services, location details, and appointment-focused calls to action.",
    href: "/work/barber-shop",
  },
  {
    title: "Pet grooming website concept",
    copy: "A practical preview category for service businesses with bookings and clear pricing.",
  },
]

function BrandMark() {
  return (
    <div className="flex items-center gap-2 text-white" aria-label="Mountline">
      <span className="grid size-8 place-items-center border border-white/10 bg-white/[0.03]">
        <span className="h-4 w-px bg-white" />
      </span>
      <span className="text-base font-semibold tracking-tight lowercase">mountline</span>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow?: string
  title: string
  copy?: string
}) {
  return (
    <div>
      {eyebrow ? (
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
      {copy ? <p className="mt-3 text-sm leading-6 text-zinc-400">{copy}</p> : null}
    </div>
  )
}

function ContactButton({
  href,
  icon: Icon,
  label,
  variant = "secondary",
}: {
  href?: string
  icon: LucideIcon
  label: string
  variant?: "primary" | "secondary" | "quiet"
}) {
  const base =
    "inline-flex min-h-12 w-full items-center justify-center gap-2 border px-4 py-3 text-sm font-semibold transition-colors"
  const variants = {
    primary: "border-white bg-white text-black hover:bg-zinc-200",
    secondary:
      "border-white/12 bg-white/[0.03] text-white hover:border-white/25 hover:bg-white/[0.06]",
    quiet: "border-white/10 bg-transparent text-zinc-200 hover:border-white/20 hover:bg-white/[0.04]",
  }

  if (!href) {
    return (
      <span
        aria-disabled="true"
        className={`${base} ${variants.secondary} cursor-not-allowed opacity-45`}
      >
        <Icon className="size-4" />
        {label}
      </span>
    )
  }

  return (
    <a className={`${base} ${variants[variant]}`} href={href}>
      <Icon className="size-4" />
      {label}
    </a>
  )
}

export default function LukePage() {
  const phoneHref = contact.phoneNumber ? `tel:${contact.phoneNumber}` : undefined
  const emailHref = `mailto:${contact.email}?subject=Mountline%20website%20conversation`

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "linear-gradient(to bottom, black, black 48%, transparent 88%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <header className="flex items-center justify-between gap-3 border border-white/10 bg-black/70 px-3 py-3 backdrop-blur">
          <Link href="/" aria-label="Mountline home">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 min-[390px]:inline-flex">
              Local websites & business systems
            </span>
            <Link
              href="/"
              className="inline-flex size-9 items-center justify-center border border-white/10 text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
              aria-label="Back to Mountline home"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </header>

        <section className="pt-5">
          <div className="border border-white/10 bg-zinc-950/88 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.5)] backdrop-blur sm:p-5">
            <div className="grid gap-5 sm:grid-cols-[172px_1fr] sm:items-center">
              <div className="mx-auto w-full max-w-[188px] sm:mx-0">
                <div className="relative aspect-square overflow-hidden rounded-[8px] border border-white/10 bg-zinc-900">
                  <Image
                    src="/luke-profile.jpg"
                    alt="Luke Nordin, founder of Mountline Studio."
                    fill
                    priority
                    sizes="(max-width: 640px) 188px, 172px"
                    className="object-cover [object-position:45%_44%]"
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
                    <MapPin className="size-3.5" />
                    Keller, Texas
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
                    <UserRound className="size-3.5" />
                    Founder
                  </span>
                </div>

                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
                  Luke Nordin
                </h1>
                <p className="mt-2 text-sm font-medium text-zinc-300">
                  Founder, Mountline Studio
                </p>
                <p className="mt-4 text-base leading-7 text-zinc-200">
                  Mountline builds clean websites and simple online systems for local
                  businesses.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
                  {["Local founder", "Website concepts", "Client portals", "Lead systems"].map(
                    (item) => (
                      <span key={item} className="border border-white/10 px-2.5 py-1.5">
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ContactButton
                href={phoneHref}
                icon={MessageSquareText}
                label={contact.phoneLabel}
                variant="primary"
              />
              <ContactButton href={emailHref} icon={Mail} label="Email Luke" />
              <Link
                href="/"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
              >
                <ExternalLink className="size-4" />
                View Mountline
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-9">
          <SectionHeading title="Why you're seeing this" />
          <p className="mt-4 text-base leading-7 text-zinc-300">
            If Mountline stopped by your business, it is because something specific
            stood out: strong local reputation, unclear online presence, or a simple
            opportunity to make it easier for customers to contact you.
          </p>
          <p className="mt-4 text-sm leading-6 text-zinc-500">
            This is a local, practical conversation about the parts of a website or
            customer flow that can make the business easier to trust and contact.
          </p>
        </section>

        <section className="border-b border-white/10 py-9">
          <SectionHeading
            eyebrow="Practical help"
            title="What Mountline helps with"
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {capabilities.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title} className="border border-white/10 bg-white/[0.025] p-4">
                  <div className="mb-4 inline-flex size-9 items-center justify-center border border-white/10 bg-black">
                    <Icon className="size-4 text-zinc-300" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.copy}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="border-b border-white/10 py-9">
          <SectionHeading
            eyebrow="Concept previews"
            title="Recent work / concept previews"
            copy="These previews show how Mountline structures practical websites for local service businesses."
          />
          <div className="mt-5 grid gap-3">
            {previews.map((preview) => (
              <article
                key={preview.title}
                className="flex flex-col gap-4 border border-white/10 bg-zinc-950/70 p-4 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between"
              >
                <div>
                  <h3 className="text-base font-semibold text-white">{preview.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{preview.copy}</p>
                </div>
                {preview.href ? (
                  <Link
                    href={preview.href}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/[0.06]"
                  >
                    View preview
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 shrink-0 items-center justify-center border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-500">
                    Preview not available
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="border-b border-white/10 py-9">
          <div className="border border-white/10 bg-white/[0.025] p-4 sm:p-5">
            <SectionHeading title="Contact Luke" />
            <div className="mt-5 grid gap-3">
              <ContactButton
                href={phoneHref}
                icon={Send}
                label={contact.phoneLabel}
                variant="primary"
              />
              <ContactButton href={emailHref} icon={Mail} label={contact.email} />
              <a
                href={contact.homepageUrl}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
              >
                <Globe2 className="size-4" />
                Visit {contact.homepageLabel}
              </a>
              <a
                href="/luke-nordin.vcf"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
              >
                <ContactRound className="size-4" />
                Save contact
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-8">
          <div className="flex gap-3 text-sm leading-6 text-zinc-400">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-zinc-300" />
            <div>
              <p className="font-medium text-zinc-200">Built by Mountline Studio</p>
              <p className="mt-1">
                Small, practical websites and systems for local businesses.
              </p>
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Concept previews are examples and are not official websites unless
                approved by the business.
              </p>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 py-7 text-sm text-zinc-500 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <div>
            <p className="font-medium text-zinc-300">Mountline Studio</p>
            <p>Keller, Texas</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <a href={emailHref} className="transition-colors hover:text-white">
              Email
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
