"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Droplets,
  Gem,
  ShieldCheck,
  Sparkles,
  SprayCan,
} from "lucide-react"

const services = [
  {
    title: "Exterior Detail",
    description: "Foam wash, wheel faces, bug removal, glass, tires, and a crisp hand finish.",
    icon: Droplets,
  },
  {
    title: "Interior Detail",
    description: "Vacuum, steam touchpoints, panels, mats, glass, and odor-conscious cleanup.",
    icon: SprayCan,
  },
  {
    title: "Ceramic Coating",
    description: "Durable protection for gloss, easier washing, and stronger weather resistance.",
    icon: ShieldCheck,
  },
  {
    title: "Paint Correction",
    description: "Machine polishing to reduce haze, light swirls, and tired clear coat.",
    icon: Sparkles,
  },
  {
    title: "Maintenance Washes",
    description: "Scheduled care that keeps a detailed vehicle looking sharp month after month.",
    icon: CalendarDays,
  },
]

const packages = [
  {
    name: "Essential Wash",
    price: "$95",
    description: "A polished maintenance wash for vehicles that need a careful reset.",
    features: ["Foam pre-rinse", "Hand wash", "Wheel faces", "Exterior glass"],
  },
  {
    name: "Full Detail",
    price: "$275",
    description: "Interior and exterior care for a vehicle that needs the full treatment.",
    features: ["Exterior detail", "Interior reset", "Mats and panels", "Final inspection"],
    featured: true,
  },
  {
    name: "Ceramic Protection",
    price: "$850",
    description: "Paint preparation and protection for drivers who want lasting gloss.",
    features: ["Decon wash", "Paint prep", "Ceramic coating", "Care guidance"],
  },
]

const trustPoints = [
  "Paint-safe process",
  "Interior deep cleaning",
  "Clear appointment windows",
  "Quality products",
  "Local service",
]

export function AutoDetailingDemo() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <DemoNotice />
      <Hero />
      <Services />
      <Packages />
      <Trust />
      <BeforeAfter />
      <QuoteSection submitted={submitted} onSubmit={handleSubmit} />
      <FinalCta />
      <AttributionFooter />
    </main>
  )
}

function DemoNotice() {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm text-zinc-300 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Concept build by Mountline Studio. This is a sample website direction, not a real client.</p>
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white hover:text-black"
        >
          Back to Mountline
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_26%),linear-gradient(180deg,#050608_0%,#090b10_55%,#050608_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-300/30 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-28">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-sky-100">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
            Apex Auto Detail
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Premium detailing that makes every drive feel new again.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Paint-safe washes, interior resets, ceramic protection, and maintenance plans for drivers who care about the details.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#quote"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
            >
              Request a quote
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#packages"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              View packages
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  )
}

function HeroVisual() {
  return (
    <div className="relative min-h-[520px]">
      <div className="absolute inset-x-6 top-10 h-64 rounded-[2rem] bg-gradient-to-br from-sky-300/20 via-white/10 to-transparent blur-3xl" />
      <div className="relative mx-auto max-w-xl rounded-[2rem] border border-white/12 bg-white/[0.06] p-4 shadow-2xl shadow-sky-950/50 backdrop-blur">
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#090b10]">
          <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.20),transparent_22%),linear-gradient(145deg,#0b0d12,#151922_48%,#030405)]">
            <div className="absolute left-1/2 top-16 h-28 w-72 -translate-x-1/2 rounded-t-[7rem] border border-white/20 bg-gradient-to-b from-white/14 to-white/[0.03]" />
            <div className="absolute left-1/2 top-32 h-32 w-[22rem] -translate-x-1/2 rounded-[4rem] border border-white/15 bg-gradient-to-b from-zinc-700 via-zinc-950 to-black shadow-2xl" />
            <div className="absolute left-1/2 top-44 h-7 w-72 -translate-x-1/2 rounded-full bg-sky-200/20 blur-xl" />
            <div className="absolute left-[18%] top-[58%] h-16 w-16 rounded-full border-[10px] border-zinc-950 bg-zinc-700 shadow-inner" />
            <div className="absolute right-[18%] top-[58%] h-16 w-16 rounded-full border-[10px] border-zinc-950 bg-zinc-700 shadow-inner" />
            <div className="absolute left-1/2 top-[54%] h-2 w-40 -translate-x-1/2 rounded-full bg-sky-300/70" />
            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Paint gloss</p>
              <div className="mt-2 flex items-end gap-1">
                {[42, 58, 74, 88].map((height) => (
                  <span
                    key={height}
                    className="w-5 rounded-t bg-sky-300"
                    style={{ height }}
                  />
                ))}
              </div>
            </div>
            <div className="absolute right-6 top-6 rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Gem className="h-4 w-4 text-sky-300" />
                Ceramic ready
              </div>
              <p className="mt-1 max-w-[12rem] text-xs leading-5 text-zinc-400">Decon wash, polish prep, and gloss protection.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-white/10">
            {["Mirror finish", "Steam interior", "Protected paint"].map((item) => (
              <div key={item} className="border-r border-white/10 p-4 last:border-r-0">
                <Check className="mb-2 h-4 w-4 text-sky-300" />
                <p className="text-xs font-medium text-zinc-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Services() {
  return (
    <section className="border-t border-white/10 bg-[#07080b] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Services" title="Detailing services built around care, clarity, and finish." />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {services.map((service) => (
            <div key={service.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-sky-300/35">
              <service.icon className="h-6 w-6 text-sky-300" />
              <h3 className="mt-5 text-lg font-semibold">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Packages() {
  return (
    <section id="packages" className="bg-[#050608] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Demo pricing" title="Simple packages with clear expectations." />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {packages.map((item) => (
            <div
              key={item.name}
              className={`rounded-3xl border p-6 ${
                item.featured
                  ? "border-sky-300/45 bg-sky-300/[0.08] shadow-2xl shadow-sky-950/40"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <p className="text-sm font-medium text-zinc-300">{item.name}</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight">{item.price}</span>
                <span className="pb-2 text-sm text-zinc-400">starting at - demo</span>
              </div>
              <p className="mt-5 text-sm leading-6 text-zinc-400">{item.description}</p>
              <ul className="mt-7 space-y-3">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="h-4 w-4 text-sky-300" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Trust() {
  return (
    <section className="border-y border-white/10 bg-white text-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Why choose us</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">A cleaner process for a cleaner car.</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {trustPoints.map((point) => (
            <div key={point} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <ShieldCheck className="h-5 w-5 text-sky-700" />
              <span className="font-medium">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BeforeAfter() {
  return (
    <section className="bg-[#07080b] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Before / after concept" title="A visual proof section without needing heavy media." />
        <div className="mt-12 grid overflow-hidden rounded-3xl border border-white/10 lg:grid-cols-2">
          <Panel label="Before" tone="before" />
          <Panel label="After" tone="after" />
        </div>
      </div>
    </section>
  )
}

function Panel({ label, tone }: { label: string; tone: "before" | "after" }) {
  const after = tone === "after"

  return (
    <div className={`relative min-h-[320px] overflow-hidden p-6 ${after ? "bg-[#0b1118]" : "bg-[#111111]"}`}>
      <div className="absolute inset-0 opacity-80">
        <div className={`absolute left-1/2 top-24 h-40 w-80 -translate-x-1/2 rounded-[4rem] border ${after ? "border-sky-200/30 bg-gradient-to-b from-zinc-500 to-black" : "border-zinc-700 bg-gradient-to-b from-zinc-700/40 to-black"}`} />
        <div className={`absolute left-[20%] top-[58%] h-16 w-16 rounded-full border-[10px] ${after ? "border-black bg-zinc-300" : "border-black bg-zinc-800"}`} />
        <div className={`absolute right-[20%] top-[58%] h-16 w-16 rounded-full border-[10px] ${after ? "border-black bg-zinc-300" : "border-black bg-zinc-800"}`} />
        <div className={`absolute left-1/2 top-[54%] h-2 w-44 -translate-x-1/2 rounded-full ${after ? "bg-sky-300" : "bg-zinc-700"}`} />
      </div>
      <div className="relative z-10">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${after ? "bg-sky-300 text-black" : "bg-white/10 text-zinc-300"}`}>
          {label}
        </span>
        <p className="mt-48 max-w-sm text-sm leading-6 text-zinc-300">
          {after
            ? "Gloss restored, wheels finished, glass clear, and protection ready for the next drive."
            : "Road film, dull reflection, tired wheels, and interior touchpoints ready for attention."}
        </p>
      </div>
    </div>
  )
}

function QuoteSection({
  submitted,
  onSubmit,
}: {
  submitted: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section id="quote" className="bg-[#050608] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Request a quote</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Tell us what you drive and what it needs.</h2>
          <p className="mt-5 text-zinc-400">This form is frontend-only demo content for the Apex Auto Detail concept.</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 sm:p-7">
          {submitted ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-300 text-black">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold">Demo request received</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">In a real build, this would send the quote request to the business.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" placeholder="Your name" />
              <Field label="Vehicle" placeholder="2022 BMW X5" />
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-200">Service interested in</span>
                <select className="h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition-colors focus:border-sky-300">
                  <option>Full Detail</option>
                  <option>Essential Wash</option>
                  <option>Ceramic Protection</option>
                  <option>Paint Correction</option>
                </select>
              </label>
              <Field label="Preferred date" type="date" placeholder="" />
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-zinc-200">Message</span>
                <textarea className="min-h-32 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-sky-300" placeholder="Tell us about the vehicle condition, goals, or timing." />
              </label>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 sm:col-span-2">
                Send demo request
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-sky-300"
      />
    </label>
  )
}

function FinalCta() {
  return (
    <section className="border-y border-white/10 bg-[linear-gradient(135deg,#0a0d12,#050608)] px-4 py-20 text-center">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
          <Clock className="h-3.5 w-3.5" />
          Appointments by request
        </p>
        <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">Ready for a cleaner car?</h2>
        <a href="#quote" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5">
          Request a quote
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}

function AttributionFooter() {
  return (
    <footer className="bg-black px-4 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <p>Demo website concept by Mountline Studio.</p>
        <Link href="/#contact" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-medium text-white transition-colors hover:bg-white hover:text-black">
          Get a site like this
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </footer>
  )
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h2>
    </div>
  )
}
