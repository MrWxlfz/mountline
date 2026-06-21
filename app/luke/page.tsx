import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ContactRound,
  Globe2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { DemoGallery } from "@/components/demo-gallery"
import { MountlineLogo } from "@/components/mountline-logo"

const contact = {
  phoneNumber: "+18178801028",
  phoneLabel: "(817) 880-1028",
  email: "luke.nordin@icloud.com",
  homepageUrl: "https://mountline.dev",
  homepageLabel: "mountline.dev",
}

const pageUrl = `${contact.homepageUrl}/luke`

export const metadata: Metadata = {
  title: "Luke Nordin | Mountline Studio",
  description:
    "Meet Luke Nordin, founder of Mountline Studio in Keller, Texas. Websites, AI-powered systems, and practical tools for local businesses.",
  alternates: {
    canonical: "/luke",
  },
  openGraph: {
    title: "Luke Nordin | Mountline Studio",
    description:
      "Websites, AI-powered systems, and practical tools for local businesses.",
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
    title: "Luke Nordin | Mountline Studio",
    description:
      "Websites, AI-powered systems, and practical tools for local businesses.",
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
    copy: "I build super clear, mobile-friendly websites that feel true and matched to your business, helping customers know what to do next and trust you from the first impression.",
    icon: Globe2,
  },
  {
    title: "Your Mountline client portal",
    copy: "Every project includes a private portal inside Mountline's CRM. We can live chat, share inspiration, track status, handle support, and keep working together from kickoff through launch and beyond.",
    icon: BriefcaseBusiness,
  },
  {
    title: "AI-powered systems",
    copy: "I build practical tools that help organize leads, follow-ups, customer requests, and repetitive work without making the business harder to run.",
    icon: Bot,
  },
]

const bestFit = [
  "Local businesses in Keller and the surrounding area",
  "Barbers, detailers, groomers, contractors, med spas, restaurants, churches, and independent shops",
  "Businesses that need a stronger website or a smarter way to handle leads and customer requests",
  "Owners who value clear communication, practical ideas, and straightforward work",
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
    `mailto:${contact.email}?subject=Mountline%20Studio&body=` +
    encodeURIComponent(
      "Hey Luke, it was great meeting you. My business is [business name].",
    )
  const smsHref = `sms:${contact.phoneNumber}`
  const phoneHref = `tel:${contact.phoneNumber}`

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
                Hey, I&apos;m Luke! I&apos;m the founder of Mountline Studio here in
                Keller. I build websites, AI-powered systems, and simple tools that
                make running a business a little easier.
              </p>
              <div className="mt-5 border-l-2 border-white bg-white/[0.035] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
                  Scanned my card?
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  It was a pleasure to meet you. Send me your business name, website,
                  or social media so I can get a better, more personal look at what
                  you do. If I showed you a personalized demo, remind me and I&apos;ll
                  send your link over too.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ActionLink
                href={smsHref}
                icon={MessageSquareText}
                label="Text me"
                variant="primary"
              />
              <ActionLink
                href="/luke-nordin.vcf"
                icon={ContactRound}
                label="Save my contact"
              />
              <ActionLink href="#examples" icon={ArrowUpRight} label="See my work" />
              <ActionLink href={emailHref} icon={Mail} label="Email me" />
            </div>
          </div>
        </section>

        <section id="examples" className="scroll-mt-4 border-b border-white/10 py-8">
          <SectionHeading
            eyebrow="Live demos"
            title="See what I've built"
            copy="Open any card to see the current demo."
          />
          <div className="mt-5">
            <DemoGallery layout="compact" />
          </div>
          <p className="mt-4 text-xs leading-5 text-zinc-500">
            Concept previews are examples and are not official websites unless
            approved by the business.
          </p>
        </section>

        <section className="border-b border-white/10 py-8">
          <SectionHeading title="Why I gave you this card" />
          <p className="mt-4 text-base leading-7 text-zinc-300">
            I gave you this card because I saw something I liked about your business
            and thought I might be able to help! Maybe your work is great, but your
            site is lacking modern-day design or features that drive customers.
            Either way, I wanted to introduce myself and give you an easy way to see
            my work.
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
          <SectionHeading eyebrow="Practical help" title="What I can build" />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
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
          <div className="luke-cta-grid relative overflow-hidden border border-white/15 bg-zinc-950 p-5 sm:p-7">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-white/60 shadow-[0_0_24px_rgba(255,255,255,0.55)]"
            />
            <div className="relative">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
                Let&apos;s build something useful
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Let me help customers trust your business before they even call.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-zinc-300">
                A strong website should feel clear, trustworthy, and easy to use. I
                can help you get there without making the process complicated.
              </p>
            </div>
            <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
              <ActionLink
                href={smsHref}
                icon={MessageSquareText}
                label="Text me"
                variant="primary"
              />
              <ActionLink href={emailHref} icon={Mail} label="Email me" />
              <ActionLink
                href={phoneHref}
                icon={Phone}
                label={`Call ${contact.phoneLabel}`}
              />
              <ActionLink
                href="/luke-nordin.vcf"
                icon={ContactRound}
                label="Save my contact"
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
                Thoughtful websites and useful tools for local businesses around
                Keller.
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
