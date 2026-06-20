import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ContactRound,
  FileText,
  Globe2,
  Mail,
  MapPin,
  MessageSquareText,
  Send,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { MountlineLogo } from "@/components/mountline-logo"
import { QuickAuditForm } from "./quick-audit-form"

const contact = {
  // Public contact values only. Add Luke's public text number here when ready.
  phoneNumber: "",
  email: "hello@mountline.dev",
  homepageUrl: "https://mountline.dev",
  homepageLabel: "mountline.dev",
}

const pageUrl = `${contact.homepageUrl}/luke`

export const metadata: Metadata = {
  title: "Luke Nordin — Mountline Studio",
  description:
    "Clean websites and practical online systems for local businesses from Luke Nordin and Mountline Studio in Keller, Texas.",
  alternates: {
    canonical: "/luke",
  },
  openGraph: {
    title: "Luke Nordin — Mountline Studio",
    description:
      "Send a business name, website, or Instagram for a free quick audit from Mountline Studio.",
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
      "Clean websites and practical online systems for local businesses.",
    images: ["/luke-profile.jpg"],
  },
}

const capabilities: Array<{
  title: string
  copy: string
  icon: LucideIcon
}> = [
  {
    title: "Business websites",
    copy: "Clear pages that explain services, proof, pricing cues, and the next step.",
    icon: Globe2,
  },
  {
    title: "Quote & contact flows",
    copy: "Make it easier for customers to ask for a quote, book, or send details.",
    icon: FileText,
  },
  {
    title: "Client portals",
    copy: "Project links, updates, forms, payment links, and next steps in one place.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Lead systems",
    copy: "Simple internal tools to track prospects, follow-ups, and customer requests.",
    icon: UsersRound,
  },
]

const previews = [
  {
    title: "Auto detailing website concept",
    copy: "Packages, service proof, and a clearer path to request detailing work.",
    href: "/work/auto-detailing",
  },
  {
    title: "Barber shop website concept",
    copy: "Services, location details, and an appointment-focused customer path.",
    href: "/work/barber-shop",
  },
  {
    title: "Pet grooming website concept",
    copy: "Services, local information, FAQs, and a practical grooming request flow.",
    href: "/work/pet-grooming",
  },
]

const bestFit = [
  "Local service businesses",
  "Barbers, detailers, groomers, contractors, med spas, and small shops",
  "Businesses that need a cleaner website, quote flow, booking path, or client portal",
  "Owners who want something simple, fast, and easy to understand",
]

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

function ActionLink({
  href,
  icon: Icon,
  label,
  variant = "secondary",
}: {
  href: string
  icon: LucideIcon
  label: string
  variant?: "primary" | "secondary" | "quiet"
}) {
  const styles = {
    primary: "border-white bg-white text-black hover:bg-zinc-200",
    secondary:
      "border-white/12 bg-white/[0.03] text-white hover:border-white/25 hover:bg-white/[0.06]",
    quiet: "border-white/10 bg-transparent text-zinc-300 hover:border-white/20 hover:text-white",
  }

  return (
    <a
      href={href}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 border px-4 py-3 text-sm font-semibold transition-colors ${styles[variant]}`}
    >
      <Icon className="size-4" />
      {label}
    </a>
  )
}

export default function LukePage() {
  const emailHref =
    `mailto:${contact.email}?subject=Free%20quick%20audit&body=` +
    encodeURIComponent(
      "Hey Luke, I scanned your card. My business is [business name]. Can you take a quick look at my website or Instagram?",
    )
  const smsHref = contact.phoneNumber
    ? `sms:${contact.phoneNumber}?&body=${encodeURIComponent(
        "Hey Luke, I scanned your card. My business is [business name]. Can you take a quick look at my website?",
      )}`
    : undefined
  const primaryAuditHref = smsHref || "#quick-audit"

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "linear-gradient(to bottom, black, black 40%, transparent 82%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <header className="flex items-center justify-between gap-3 border border-white/10 bg-black/75 px-3 py-3 backdrop-blur">
          <Link href="/" aria-label="Mountline home">
            <MountlineLogo size="sm" inverted />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 min-[410px]:inline-flex">
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
          <div className="border border-white/10 bg-zinc-950/90 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.5)] backdrop-blur sm:p-5">
            <div className="grid grid-cols-[104px_1fr] items-start gap-4 sm:grid-cols-[150px_1fr] sm:gap-5">
              <div className="w-full max-w-[104px] sm:max-w-[150px]">
                <div className="relative aspect-square overflow-hidden rounded-[8px] border border-white/10 bg-zinc-900">
                  <Image
                    src="/luke-profile.jpg"
                    alt="Luke Nordin, founder of Mountline Studio."
                    fill
                    priority
                    sizes="(max-width: 639px) 104px, 150px"
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
                  <span className="hidden items-center border border-white/10 bg-white/[0.03] px-2.5 py-1.5 min-[480px]:inline-flex">
                    Mountline Studio
                  </span>
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-4xl">
                  Luke Nordin
                </h1>
                <p className="mt-2 text-sm font-medium text-zinc-400">
                  Founder, Mountline Studio
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-balance text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                Mountline builds clean websites and simple online systems for local
                businesses.
              </p>
              <p className="mt-4 text-base leading-7 text-zinc-300">
                If a website, quote form, booking flow, or customer follow-up feels
                messy, Mountline can make it clearer and easier to use.
              </p>
              <div className="mt-5 border-l-2 border-white bg-white/[0.035] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
                  Scanned Luke&apos;s card?
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Send a business name, website, or Instagram. Luke will reply with
                  2–3 specific things worth improving.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1.35fr_1fr_1fr]">
              <ActionLink
                href={primaryAuditHref}
                icon={MessageSquareText}
                label="Get a free quick audit"
                variant="primary"
              />
              <ActionLink href="#examples" icon={ArrowRight} label="View examples" />
              <ActionLink href={emailHref} icon={Mail} label="Email Luke" />
            </div>
          </div>
        </section>

        <section id="quick-audit" className="scroll-mt-4 border-b border-white/10 py-8">
          <div className="grid gap-5 sm:grid-cols-[0.82fr_1.18fr] sm:items-start">
            <SectionHeading
              eyebrow="No-cost first step"
              title="Free quick audit"
              copy="Send a business name, website, or Instagram. Luke will reply with 2–3 specific ideas to make the online presence clearer, easier to trust, and easier to contact."
            />
            <QuickAuditForm />
          </div>
        </section>

        <section id="examples" className="scroll-mt-4 border-b border-white/10 py-8">
          <SectionHeading
            eyebrow="Concept previews"
            title="See how Mountline thinks"
            copy="Practical examples for local service businesses. These are concept previews, not claimed client projects."
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
                <Link
                  href={preview.href}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/[0.06]"
                >
                  View preview
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-zinc-500">
            Concept previews are examples and are not official websites unless
            approved by the business.
          </p>
        </section>

        <section className="border-b border-white/10 py-8">
          <SectionHeading title="Why Luke gave you this card" />
          <p className="mt-4 text-base leading-7 text-zinc-300">
            Mountline builds practical websites, forms, portals, and customer flows
            for local businesses. If the current online setup makes it harder for
            customers to trust, contact, or book the business, Mountline can
            probably help.
          </p>
        </section>

        <section className="border-b border-white/10 py-8">
          <SectionHeading eyebrow="Good fit" title="Best fit for" />
          <div className="mt-5 grid gap-2">
            {bestFit.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 border border-white/10 bg-white/[0.025] px-4 py-3"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-zinc-300" />
                <p className="text-sm leading-6 text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/10 py-8">
          <SectionHeading eyebrow="Practical help" title="What Mountline helps with" />
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

        <section className="border-b border-white/10 py-8">
          <div className="border border-white/10 bg-white/[0.025] p-4 sm:p-5">
            <SectionHeading
              title="Ready for a quick look?"
              copy="Send Luke the business name, website, or Instagram. Mountline will point out what should be improved first."
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ActionLink
                href={primaryAuditHref}
                icon={Send}
                label="Get free quick audit"
                variant="primary"
              />
              <ActionLink href={emailHref} icon={Mail} label={contact.email} />
              <ActionLink
                href={contact.homepageUrl}
                icon={Globe2}
                label={`Visit ${contact.homepageLabel}`}
                variant="quiet"
              />
              <ActionLink
                href="/luke-nordin.vcf"
                icon={ContactRound}
                label="Save contact"
                variant="quiet"
              />
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-7">
          <div className="flex gap-3 text-sm leading-6 text-zinc-400">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-zinc-300" />
            <div>
              <p className="font-medium text-zinc-200">Built by Mountline Studio</p>
              <p className="mt-1">
                Small, practical websites and systems for local businesses.
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
