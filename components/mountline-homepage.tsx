"use client"

import Image from "next/image"
import Link from "next/link"
<<<<<<< Updated upstream
import { motion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Circle,
  CreditCard,
  ExternalLink,
  FileText,
  Mail,
  Menu,
  MessageSquare,
  MoveRight,
  ShieldCheck,
  Sparkle,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { DemoGallery } from "./demo-gallery"
import { NorthlineLogo } from "./northline-logo"
import { AppearanceSelector } from "./dashboard/appearance-selector"

const navItems = [
  { label: "Work", href: "#work" },
  { label: "Portal", href: "#portal" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
]

const proofPoints = [
  {
    label: "First impression",
    title: "A site that looks credible in the first few seconds.",
    copy: "Clean structure, sharp visuals, and clear language help visitors understand the business before they compare alternatives.",
  },
  {
    label: "Customer path",
    title: "Services, proof, and contact routes in the right order.",
    copy: "The page guides people from what the business does to what they should do next: call, request a quote, book, or send details.",
  },
  {
    label: "After the yes",
    title: "A private project space instead of scattered updates.",
    copy: "Client portals keep previews, next steps, support messages, useful links, and payment status organized in one place.",
  },
]

const services = [
  "Business Websites",
  "Landing Pages",
  "Quote & Contact Flows",
  "Client Portals",
  "AI-Assisted Systems",
  "Monthly Website Care",
]

const processSteps = ["Review", "Plan", "Build", "Launch", "Support"]

const pricing = [
  {
    name: "Starter Site",
    price: "$350",
    copy: "A focused one-page website for a business that needs a sharper public presence.",
    disclaimer: "Actual finished site pricing may vary slightly based on final scope.",
    includes: ["Responsive design", "Contact or quote path", "Basic launch setup"],
  },
  {
    name: "Business Website",
    price: "$1,250",
    copy: "A stronger multi-section or multi-page site for services, proof, and conversion.",
    includes: ["Service structure", "Concept direction", "Client portal included"],
    featured: true,
  },
  {
    name: "Care & Systems",
    price: "$35-$50/mo",
    copy: "Ongoing website care, edits, practical workflows, and small systems after launch.",
    disclaimer: "Actual monthly price varies significantly based on the systems you already have.",
    includes: ["Monthly updates", "Support requests", "Useful system add-ons"],
  },
]

const faqs = [
  {
    question: "What does Mountline build first?",
    answer:
      "Most projects start with the public website because that is usually where trust is won or lost. Portals and systems are added when they make the customer experience cleaner.",
  },
  {
    question: "Do projects include a client portal?",
    answer:
      "Business website projects include a private portal for project status, preview links, next steps, support messages, and payment/status details.",
  },
  {
    question: "Can Mountline work with an existing website?",
    answer:
      "Yes. Mountline can review the current site, keep what works, and rebuild the parts that weaken trust, clarity, or the quote path.",
  },
  {
    question: "Are AI systems the main offer?",
    answer:
      "No. Websites are the primary public offer. AI-assisted systems are practical add-ons for simple internal workflows, summaries, intake, or organization when they are useful.",
  },
]

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function SectionIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string
  title: string
  copy?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
      className="mx-auto max-w-3xl text-center"
    >
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-blue-200/70">
        {eyebrow}
      </p>
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      {copy ? (
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-8 text-zinc-300 sm:text-lg">
          {copy}
        </p>
      ) : null}
    </motion.div>
  )
}

function HomeNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const closeAndScroll = (href: string) => {
    setOpen(false)
    if (href.startsWith("#")) scrollToId(href.slice(1))
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`mx-auto flex max-w-7xl items-center justify-between border px-4 py-3 transition-all duration-300 sm:px-5 ${
          scrolled
            ? "border-white/10 bg-black/82 shadow-[0_18px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl"
            : "border-white/8 bg-black/40 backdrop-blur-md"
        }`}
      >
        <Link href="/" aria-label="Mountline home">
          <NorthlineLogo size="md" animated={false} />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => closeAndScroll(item.href)}
              className="px-3 py-2 text-sm text-zinc-300 transition-colors hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <AppearanceSelector compact syncServer={false} />
          <Link
            href="/id"
            className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
          >
            Mountline ID
          </Link>
          <button
            onClick={() => scrollToId("contact")}
            className="group inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50"
          >
            Book a Review
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex size-10 items-center justify-center border border-white/10 text-white md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </motion.nav>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-auto mt-2 max-w-7xl border border-white/10 bg-black/95 p-4 backdrop-blur-xl md:hidden"
        >
          <div className="grid gap-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => closeAndScroll(item.href)}
                className="px-2 py-3 text-left text-base text-zinc-200"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 border-t border-white/10 pt-4">
            <AppearanceSelector syncServer={false} className="w-full" />
            <Link
              href="/id"
              className="px-2 py-3 text-base font-medium text-zinc-200"
              onClick={() => setOpen(false)}
            >
              Mountline ID
            </Link>
            <button
              onClick={() => closeAndScroll("#contact")}
              className="inline-flex items-center justify-center gap-2 bg-white px-4 py-3 text-sm font-semibold text-black"
            >
              Book a Review
              <ArrowRight className="size-4" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </header>
=======
import {
  ArrowRight,
  Check,
  CircleDot,
  CreditCard,
  FileText,
  LifeBuoy,
  MapPin,
  MessageSquareText,
} from "lucide-react"
import { BusinessReviewForm } from "@/components/homepage/business-review-form"
import { CapabilityGallery } from "@/components/homepage/capability-gallery"
import { HeroWorkShowcase } from "@/components/homepage/hero-work-showcase"
import { HomepageThemeToggle } from "@/components/homepage/homepage-theme-toggle"
import { LeadRecoveryScene } from "@/components/homepage/lead-recovery-scene"
import { MobileNavigation } from "@/components/homepage/mobile-navigation"
import { ScrollHeader } from "@/components/homepage/scroll-header"
import { StartingPathWorkbench } from "@/components/homepage/starting-path-workbench"
import { WorkSelector } from "@/components/homepage/work-selector"
import { MountlineLogo } from "@/components/mountline-logo"
import { homepageNav } from "@/lib/homepage-content"

const processSteps = [
  {
    number: "01",
    title: "Understand",
    copy: "Learn how the business works, what customers need, and what currently gets in the way.",
  },
  {
    number: "02",
    title: "Plan",
    copy: "Choose the smallest useful scope and define exactly what will be built.",
  },
  {
    number: "03",
    title: "Build",
    copy: "Design, develop, test, and refine on real screens.",
  },
  {
    number: "04",
    title: "Launch and improve",
    copy: "Put it live, keep the next steps organized, and support what comes afterward.",
  },
] as const

function HomepageHeader() {
  return (
    <ScrollHeader>
      <div className="mtl-shell mtl-header-inner">
        <Link href="/" aria-label="Mountline home" className="mtl-logo-link">
          <MountlineLogo size="md" className="mtl-header-logo" />
        </Link>

        <nav aria-label="Primary navigation" className="mtl-desktop-nav">
          {homepageNav.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="mtl-header-actions">
          <Link href="/id" className="mtl-id-link">Mountline ID</Link>
          <HomepageThemeToggle />
          <a href="#review" className="mtl-header-cta">
            Show us your business
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>

        <MobileNavigation />
      </div>
    </ScrollHeader>
>>>>>>> Stashed changes
  )
}

function HeroVisual() {
  return (
<<<<<<< Updated upstream
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.18 }}
      className="relative mx-auto mt-14 max-w-6xl"
    >
      <motion.div
        aria-hidden
        animate={{ backgroundPosition: ["0px 0px", "42px 42px"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-8 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
        }}
      />

      <div className="relative grid gap-4 border border-white/10 bg-zinc-950/80 p-3 shadow-[0_30px_120px_rgba(0,0,0,0.72)] backdrop-blur md:grid-cols-[1.55fr_.95fr] md:p-4">
        <div className="overflow-hidden border border-white/10 bg-black">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="size-2 rounded-full bg-zinc-600" />
              <span className="size-2 rounded-full bg-zinc-600" />
              <span className="size-2 rounded-full bg-blue-300/70" />
            </div>
            <span className="text-xs text-zinc-500">public website</span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
            <Image
              src="/work-previews/auto-detailing.jpg"
              alt="Premium website concept preview"
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
            <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/82 p-4 backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Strong first impression</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    Services, proof, and a clear path to request work.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-blue-100">
                  Lead captured <MoveRight className="size-3.5" /> Portal organized
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="border border-white/10 bg-black p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-blue-200/70">Client portal</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Project organized</h3>
              </div>
              <ShieldCheck className="size-5 text-blue-200" />
            </div>
            <div className="space-y-3">
              {[
                ["Progress", "Build in review"],
                ["Next step", "Approve homepage"],
                ["Payment", "Deposit received"],
                ["Support", "Message thread open"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-white/8 pb-3 text-sm last:border-b-0 last:pb-0"
                >
                  <span className="text-zinc-500">{label}</span>
                  <span className="font-medium text-zinc-100">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-zinc-950 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Launch path</p>
            <div className="mt-5 grid grid-cols-4 items-center gap-2 text-center text-[11px] text-zinc-400">
              {["Site", "Lead", "Portal", "Launch"].map((item, index) => (
                <div key={item} className="contents">
                  <div className="border border-white/10 bg-black px-2 py-3 text-zinc-200">{item}</div>
                  {index < 3 ? <div className="hidden h-px bg-blue-300/40 sm:block" /> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function PortalPreview() {
  const steps = [
    { label: "Project review", done: true },
    { label: "Homepage direction", done: true },
    { label: "Content and links", done: true },
    { label: "Client review", active: true },
    { label: "Launch prep" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.65 }}
      className="border border-white/10 bg-zinc-950/70 p-3 shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
    >
      <div className="border border-white/10 bg-black">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">Client Portal</p>
            <p className="text-xs text-zinc-500">Website project</p>
          </div>
          <span className="border border-blue-300/20 bg-blue-300/10 px-2.5 py-1 text-xs text-blue-100">
            In review
          </span>
        </div>

        <div className="grid gap-0 md:grid-cols-[.85fr_1.4fr]">
          <aside className="border-b border-white/10 p-4 md:border-b-0 md:border-r">
            <div className="space-y-2">
              {[
                [FileText, "Project"],
                [ExternalLink, "Preview links"],
                [MessageSquare, "Support"],
                [CreditCard, "Payment status"],
              ].map(([Icon, label]) => (
                <div key={label as string} className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300">
                  <Icon className="size-4 text-zinc-500" />
                  {label as string}
                </div>
              ))}
            </div>
          </aside>

          <div className="p-5 sm:p-6">
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Progress", "Review"],
                ["Next step", "Feedback"],
                ["Balance", "Visible"],
              ].map(([label, value]) => (
                <div key={label} className="border border-white/10 bg-zinc-950 p-3">
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className="mt-1 text-sm font-medium text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="border border-white/10 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-white">Next steps</p>
                <p className="text-xs text-zinc-500">3 complete</p>
              </div>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div key={step.label} className="flex items-center gap-3">
                    {step.done ? (
                      <CheckCircle2 className="size-4 text-blue-200" />
                    ) : step.active ? (
                      <Circle className="size-4 fill-blue-200/20 text-blue-200" />
                    ) : (
                      <Circle className="size-4 text-zinc-700" />
                    )}
                    <span className={step.active ? "text-sm text-white" : "text-sm text-zinc-400"}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="border border-white/10 p-4">
                <p className="text-xs text-zinc-500">Latest support note</p>
                <p className="mt-2 text-sm leading-6 text-zinc-200">
                  Homepage review link is ready. Notes can stay attached to the project.
                </p>
              </div>
              <div className="border border-white/10 p-4">
                <p className="text-xs text-zinc-500">Useful links</p>
                <p className="mt-2 text-sm leading-6 text-zinc-200">
                  Preview site, invoice, brand assets, launch checklist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
=======
    <figure className="mtl-portal-scene">
      <div className="mtl-portal-toolbar">
        <span><i /> Mountline project portal</span>
        <span>Seeded preview · No client data</span>
      </div>
      <div className="mtl-portal-canvas">
        <div className="mtl-portal-image-wrap">
          <Image
            src="/work-previews/client-portal.png"
            alt="Mountline project portal showing status, timeline, next step, payment, preview, and launch information"
            fill
            className="object-cover object-top"
            sizes="(max-width: 767px) 94vw, (max-width: 1100px) 88vw, 73vw"
          />
        </div>

        <div className="mtl-portal-summary" aria-label="Portal preview details">
          <div>
            <span><CircleDot className="size-3.5" /> Current phase</span>
            <strong>Design</strong>
          </div>
          <div>
            <span><FileText className="size-3.5" /> Next step</span>
            <strong>Review the homepage concept</strong>
          </div>
          <ul>
            <li><MessageSquareText className="size-3.5" /> Feedback</li>
            <li><CreditCard className="size-3.5" /> Payments</li>
            <li><LifeBuoy className="size-3.5" /> Support</li>
          </ul>
        </div>
      </div>
      <figcaption>
        <span><Check className="size-3.5" /> Project status</span>
        <span><Check className="size-3.5" /> Current next step</span>
        <span><Check className="size-3.5" /> Concepts and links</span>
        <span><Check className="size-3.5" /> Feedback and support</span>
        <span><Check className="size-3.5" /> Launch information</span>
      </figcaption>
    </figure>
>>>>>>> Stashed changes
  )
}

export function MountlineHomepage() {
  return (
<<<<<<< Updated upstream
    <main className="mountline-marketing min-h-screen overflow-hidden bg-black text-white">
      <HomeNavbar />

      <section className="relative px-4 pb-20 pt-36 sm:px-6 sm:pb-28 sm:pt-40 lg:pt-44">
        <motion.div
          aria-hidden
          animate={{ backgroundPosition: ["0px 0px", "36px 36px"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            maskImage: "linear-gradient(to bottom, black, black 58%, transparent 92%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62 }}
            className="mx-auto max-w-5xl text-center"
          >
            <p className="mb-6 inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium uppercase tracking-[0.28em] text-blue-100/80">
              <Sparkle className="size-3.5" />
              Mountline Studio
            </p>
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl lg:text-[5.8rem] lg:leading-[0.95]">
              Websites people trust before they ever call.
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-pretty text-lg leading-8 text-zinc-300 sm:text-xl">
              Mountline Studio builds sharp websites, private client portals, and practical
              systems for businesses that want a stronger first impression and a cleaner way to
              work.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => scrollToId("contact")}
                className="group inline-flex w-full items-center justify-center gap-2 bg-white px-6 py-4 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 sm:w-auto"
              >
                Book a website review
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => scrollToId("work")}
                className="group inline-flex w-full items-center justify-center gap-2 border border-white/12 bg-white/[0.02] px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 sm:w-auto"
              >
                See live demos
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
=======
    <div className="mountline-marketing mountline-homepage">
      <a href="#main-content" className="ml-skip-link">Skip to main content</a>
      <HomepageHeader />

      <main id="main-content" tabIndex={-1}>
        <section className="mtl-hero">
          <div className="mtl-shell mtl-hero-layout">
            <div className="mtl-hero-copy">
              <p className="mtl-hero-eyebrow">Websites + practical systems for real businesses</p>
              <h1>Make your business easier to choose—and easier to run.</h1>
              <p className="mtl-hero-lede">
                Mountline builds exceptional websites and practical systems that
                help customers call, book, buy, and get answers. Start with a
                focused site, or go further with lead follow-up, callback systems,
                support, portals, and custom tools.
              </p>

              <div className="mtl-hero-actions">
                <a href="#review" className="mtl-button mtl-button--primary">
                  Show us your business <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                <a href="#what-we-build" className="mtl-button mtl-button--secondary">
                  See what we build <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>

              <p className="mtl-trust-line">
                <MapPin className="size-4" aria-hidden="true" />
                Founder-led in Keller, Texas. Built around what you actually need.
              </p>
>>>>>>> Stashed changes
            </div>
          </motion.div>

          <HeroVisual />
        </div>
      </section>

<<<<<<< Updated upstream
      <section className="border-y border-white/10 px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.9fr_1.4fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-90px" }}
              transition={{ duration: 0.55 }}
            >
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-blue-200/70">
                Proof of capability
              </p>
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Not just a prettier site. A better customer experience.
              </h2>
            </motion.div>
            <div className="grid gap-0 border border-white/10">
              {proofPoints.map((point, index) => (
                <motion.div
                  key={point.label}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-90px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="grid gap-4 border-b border-white/10 p-6 last:border-b-0 md:grid-cols-[.38fr_1fr]"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                    {point.label}
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{point.title}</h3>
                    <p className="mt-3 text-base leading-7 text-zinc-300">{point.copy}</p>
                  </div>
                </motion.div>
              ))}
=======
        <section id="work" className="mtl-work-section">
          <div className="mtl-shell">
            <div className="mtl-section-heading mtl-section-heading--work">
              <p className="mtl-kicker">Real Mountline work</p>
              <h2>Different businesses need different websites.</h2>
              <p>
                A barber, restaurant, groomer, and service company should not be
                forced into the same template. Mountline starts with how the business
                earns trust and what customers need to do next.
              </p>
            </div>
            <WorkSelector />
          </div>
        </section>

        <section id="what-we-build" className="mtl-build-section">
          <div className="mtl-shell">
            <div className="mtl-section-heading mtl-section-heading--build">
              <p className="mtl-kicker">What Mountline builds</p>
              <h2>Start with the problem. Build the useful part.</h2>
              <p>
                Sometimes that is a better website. Sometimes it is faster follow-up,
                easier booking, or one place for customers and your team to stay organized.
              </p>
            </div>
            <StartingPathWorkbench />
          </div>
        </section>

        <section id="after-the-click" className="mtl-inquiry-section">
          <div className="mtl-shell">
            <div className="mtl-section-heading mtl-section-heading--inquiry">
              <p className="mtl-kicker">What happens after the click</p>
              <h2>The website gets their attention. What happens next matters too.</h2>
              <p>
                For businesses handling valuable inquiries, Mountline can help make
                sure somebody responds, the follow-up continues, and the next action
                does not disappear into an inbox.
              </p>
            </div>

            <LeadRecoveryScene />

            <div className="mtl-inquiry-footer">
              <Link href="/lead-recovery" className="mtl-inline-link">
                See Mountline Lead Recovery <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <p>Managed around the business and often able to work alongside tools already in place.</p>
            </div>
          </div>
        </section>

        <section id="capabilities" className="mtl-capability-section">
          <div className="mtl-shell">
            <div className="mtl-capability-heading">
              <p className="mtl-kicker">Useful systems, right-sized</p>
              <h2>And yeah—we do a lot more.</h2>
              <p>The best system is not always a giant app. Sometimes it is one frustrating part of the day finally working properly.</p>
            </div>

            <CapabilityGallery />

            <p className="mtl-capability-note">Capabilities are scoped around the business and existing tools.</p>
          </div>
        </section>

        <section id="how-it-works" className="mtl-experience-section">
          <div className="mtl-shell">
            <div className="mtl-process-heading">
              <p className="mtl-kicker">How working with Mountline feels</p>
              <h2>Clear from the first conversation.</h2>
            </div>

            <ol className="mtl-process-rail">
              {processSteps.map((step) => (
                <li key={step.number}>
                  <span>{step.number}</span>
                  <i aria-hidden="true" />
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </li>
              ))}
            </ol>

            <div className="mtl-delivery-chapter">
              <div>
                <p className="mtl-kicker">Organized delivery</p>
                <h2>You always know what happens next.</h2>
                <p>
                  Project status, the current next step, concepts, feedback,
                  support, payment, and launch information stay in one clear place.
                </p>
              </div>
              <PortalScene />
>>>>>>> Stashed changes
            </div>
          </div>
        </div>
      </section>

<<<<<<< Updated upstream
      <section id="work" className="px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Live demos"
            title="Open the work and explore it."
            copy="A growing set of concept sites across local business categories. Each card opens the current build."
          />

          <div className="mt-14">
            <DemoGallery />
=======
        <section id="about" className="mtl-founder-section">
          <div className="mtl-shell mtl-founder-layout">
            <figure>
              <Image
                src="/luke-profile.jpg"
                alt="Luke Nordin, founder of Mountline"
                fill
                className="object-cover object-[47%_42%]"
                sizes="(max-width: 767px) 94vw, 55vw"
              />
              <figcaption><span>Keller, Texas</span>Luke Nordin · Founder</figcaption>
            </figure>

            <div className="mtl-founder-copy">
              <p className="mtl-kicker">Founder-led</p>
              <h2>Direct communication. Clear responsibility.</h2>
              <p>
                You work directly with the person responsible for understanding,
                designing, and building the project. Mountline is founder-led in
                Keller, Texas, with a process designed to keep communication simple
                and the work accountable.
              </p>
            </div>
          </div>
        </section>

        <section id="review" className="mtl-final-section">
          <span id="review-website-launch" className="mtl-review-anchor" aria-hidden="true" />
          <span id="review-lead-recovery" className="mtl-review-anchor" aria-hidden="true" />
          <span id="review-custom-systems" className="mtl-review-anchor" aria-hidden="true" />
          <span id="review-not-sure" className="mtl-review-anchor" aria-hidden="true" />
          <div className="mtl-shell mtl-final-layout">
            <div className="mtl-final-copy">
              <p className="mtl-kicker">A useful first look</p>
              <h2>Show us what your customers see.</h2>
              <p>
                Send Mountline your business name, website, or social page. We’ll
                identify the clearest useful place to improve—whether that is the
                website, the response after an inquiry, or a workflow that should be easier.
              </p>
              <div>
                <span><Check className="size-3.5" /> No giant commitment</span>
                <span><Check className="size-3.5" /> Smallest useful starting point</span>
                <span><Check className="size-3.5" /> Direct reply from Mountline</span>
              </div>
            </div>

            <BusinessReviewForm />
>>>>>>> Stashed changes
          </div>
          <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-5 text-zinc-500">
            Concept previews are examples and are not official websites unless
            approved by the business.
          </p>
        </div>
      </section>

<<<<<<< Updated upstream
      <section id="portal" className="border-y border-white/10 px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{ duration: 0.55 }}
          >
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-blue-200/70">
              Private client portal
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              The project stays organized after the first call.
            </h2>
            <p className="mt-6 text-base leading-8 text-zinc-300 sm:text-lg">
              Mountline portals give clients one place for project progress, next steps, preview
              links, support messages, payment status, and launch details.
            </p>
          </motion.div>
          <PortalPreview />
        </div>
      </section>

      <section id="services" className="px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <SectionIntro
              eyebrow="Services"
              title="Websites first. Useful systems where they help."
              copy="Clear offers centered on the public website, with portals and practical workflows added where they improve the customer experience."
            />
            <div className="grid border border-white/10 sm:grid-cols-2">
              {services.map((service) => (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45 }}
                  className="flex min-h-28 items-center gap-3 border-b border-white/10 p-5 last:border-b-0 sm:border-r sm:even:border-r-0"
                >
                  <Check className="size-4 text-blue-200" />
                  <span className="text-lg font-medium text-white">{service}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="border-y border-white/10 px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Process"
            title="A clean path from review to launch."
            copy="The work stays practical: understand the business, plan the site, build the experience, launch it cleanly, then support what changes."
          />
          <div className="relative mt-16">
            <div className="absolute left-0 top-6 hidden h-px w-full bg-white/10 md:block" />
            <motion.div
              aria-hidden
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.9 }}
              className="absolute left-0 top-6 hidden h-px w-full origin-left bg-blue-200/55 md:block"
            />
            <div className="grid gap-4 md:grid-cols-5">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                  className="relative border border-white/10 bg-black p-5"
                >
                  <div className="mb-8 flex size-12 items-center justify-center border border-blue-200/35 bg-blue-200/10 text-sm font-semibold text-blue-100">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{step}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Pricing"
            title="Clear starting points. Scoped like a studio project."
            copy="Pricing depends on content, pages, integrations, timeline, and support needs. The review gives Mountline enough context to quote responsibly."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {pricing.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`border p-6 ${
                  plan.featured ? "border-blue-200/40 bg-blue-200/[0.06]" : "border-white/10 bg-zinc-950/55"
                }`}
              >
                <p className="text-sm font-medium text-zinc-400">{plan.name}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-blue-200/70">
                  Starting from:
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{plan.price}</p>
                <div className="mt-4 min-h-32">
                  <p className="text-sm leading-7 text-zinc-300">{plan.copy}</p>
                  {"disclaimer" in plan && plan.disclaimer ? (
                    <p className="mt-3 text-xs leading-5 text-zinc-500">{plan.disclaimer}</p>
                  ) : null}
                </div>
                <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
                  {plan.includes.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                      <Check className="size-4 text-blue-200" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-y border-white/10 px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <SectionIntro eyebrow="FAQ" title="A few practical answers." />
          <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {faqs.map((item) => (
              <div key={item.question} className="grid gap-4 py-7 md:grid-cols-[.65fr_1fr]">
                <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                <p className="text-base leading-8 text-zinc-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-4 py-20 sm:px-6 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl border border-white/10 bg-zinc-950/70 p-8 text-center sm:p-12 lg:p-16"
        >
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-blue-200/70">
            Start with a review
          </p>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Ready for a site people actually trust?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            Send the current website or project notes. Mountline will review what exists, identify
            the strongest next step, and outline a clean path forward.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:hello@mountline.dev?subject=Website%20review%20request"
              className="group inline-flex w-full items-center justify-center gap-2 bg-white px-6 py-4 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 sm:w-auto"
            >
              Book a website review
              <Mail className="size-4" />
            </a>
            <Link
              href="/work/auto-detailing"
              className="group inline-flex w-full items-center justify-center gap-2 border border-white/12 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 sm:w-auto"
            >
              See a concept build
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <NorthlineLogo size="md" />
            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Websites, private client portals, and practical systems for local businesses that
              need a stronger first impression.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-zinc-400">
            <Link href="/id" className="transition-colors hover:text-white">
              Mountline ID
            </Link>
            <button onClick={() => scrollToId("work")} className="transition-colors hover:text-white">
              Work
            </button>
            <button onClick={() => scrollToId("pricing")} className="transition-colors hover:text-white">
              Pricing
            </button>
            <a href="mailto:hello@mountline.dev" className="transition-colors hover:text-white">
              Contact
            </a>
=======
      <footer className="mtl-footer">
        <div className="mtl-shell mtl-footer-main">
          <div>
            <MountlineLogo size="md" inverted />
            <p>Exceptional websites and practical systems for businesses.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#work">Work</a>
            <a href="#what-we-build">What we build</a>
            <Link href="/lead-recovery">Lead Recovery</Link>
            <a href="#about">About</a>
            <a href="#review">Contact</a>
            <Link href="/id">Mountline ID</Link>
          </nav>
        </div>
        <div className="mtl-footer-bottom">
          <div className="mtl-shell">
            <p>Mountline · Keller, Texas</p>
            <a href="mailto:hello@mountline.dev">hello@mountline.dev</a>
>>>>>>> Stashed changes
          </div>
        </div>
      </footer>
    </main>
  )
}
