"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Hammer,
  MapPin,
  Menu,
  Sparkles,
} from "lucide-react"

type DemoFormField =
  | { label: string; placeholder: string; type?: string; kind?: "input" }
  | { label: string; placeholder: string; kind: "textarea" }
  | { label: string; options: string[]; kind: "select" }

export type DemoConceptConfig = {
  brand: string
  eyebrow: string
  notice: string
  hero: {
    headline: string
    subheadline: string
    primaryCta: string
    secondaryCta: string
  }
  theme: {
    page: string
    accentText: string
    accentBg: string
    accentBorder: string
    button: string
    softPanel: string
    highlight: string
    inputFocus: string
  }
  servicesTitle: string
  services: { title: string; description: string }[]
  showcase: {
    eyebrow: string
    title: string
    description: string
    items: { label: string; detail: string }[]
  }
  proof: {
    eyebrow: string
    title: string
    points: string[]
  }
  offer: {
    eyebrow: string
    title: string
    cards: { title: string; meta: string; description: string }[]
  }
  form: {
    eyebrow: string
    title: string
    description: string
    button: string
    successTitle: string
    fields: DemoFormField[]
  }
  finalCta: {
    headline: string
    button: string
  }
}

export function DemoConceptPage({ config }: { config: DemoConceptConfig }) {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className={`min-h-screen ${config.theme.page}`}>
      <DemoNotice config={config} />
      <Hero config={config} />
      <Services config={config} />
      <Showcase config={config} />
      <Proof config={config} />
      <Offer config={config} />
      <DemoForm config={config} submitted={submitted} onSubmit={handleSubmit} />
      <FinalCta config={config} />
      <AttributionFooter config={config} />
    </main>
  )
}

function DemoNotice({ config }: { config: DemoConceptConfig }) {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm text-zinc-300 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>{config.notice}</p>
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

function Hero({ config }: { config: DemoConceptConfig }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1fr_0.92fr] lg:px-8 lg:py-28">
        <div className="flex flex-col justify-center">
          <div className={`mb-6 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] ${config.theme.accentBorder} ${config.theme.accentText}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.theme.accentBg}`} />
            {config.brand}
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            {config.hero.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            {config.hero.subheadline}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#demo-form"
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${config.theme.button}`}
            >
              {config.hero.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {config.hero.secondaryCta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <HeroVisual config={config} />
      </div>
    </section>
  )
}

function HeroVisual({ config }: { config: DemoConceptConfig }) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 p-4 shadow-2xl ${config.theme.softPanel}`}>
      <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Concept preview</p>
            <p className="mt-1 font-semibold text-white">{config.brand}</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-semibold text-black ${config.theme.accentBg}`}>
            Live ready
          </div>
        </div>

        <div className="grid gap-4 py-5 sm:grid-cols-2">
          <div className={`min-h-48 rounded-3xl border p-5 ${config.theme.highlight}`}>
            <Sparkles className={`h-6 w-6 ${config.theme.accentText}`} />
            <p className="mt-14 text-3xl font-semibold leading-tight text-white">
              {config.showcase.items[0]?.label}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {config.showcase.items[0]?.detail}
            </p>
          </div>
          <div className="space-y-4">
            {config.showcase.items.slice(1, 4).map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
          {config.proof.points.slice(0, 3).map((point) => (
            <div key={point} className="rounded-2xl bg-white/[0.04] p-3">
              <Check className={`mb-2 h-4 w-4 ${config.theme.accentText}`} />
              <p className="text-xs font-medium leading-5 text-zinc-200">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Services({ config }: { config: DemoConceptConfig }) {
  return (
    <section id="services" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Services" title={config.servicesTitle} config={config} />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {config.services.map((service) => (
            <div key={service.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition-colors hover:border-white/25">
              <Hammer className={`h-6 w-6 ${config.theme.accentText}`} />
              <h3 className="mt-5 text-lg font-semibold text-white">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Showcase({ config }: { config: DemoConceptConfig }) {
  return (
    <section className="border-y border-white/10 bg-black/35 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <SectionHeader eyebrow={config.showcase.eyebrow} title={config.showcase.title} config={config} />
          <p className="mt-5 text-zinc-400">{config.showcase.description}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {config.showcase.items.map((item, index) => (
            <div
              key={item.label}
              className={`rounded-3xl border p-5 ${index === 0 ? config.theme.highlight : "border-white/10 bg-white/[0.045]"}`}
            >
              <p className="text-xl font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Proof({ config }: { config: DemoConceptConfig }) {
  return (
    <section className="bg-white py-16 text-black sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">{config.proof.eyebrow}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{config.proof.title}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {config.proof.points.map((point) => (
            <div key={point} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <Check className="h-5 w-5 text-zinc-900" />
              <span className="font-medium">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Offer({ config }: { config: DemoConceptConfig }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={config.offer.eyebrow} title={config.offer.title} config={config} />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {config.offer.cards.map((card, index) => (
            <div
              key={card.title}
              className={`rounded-3xl border p-6 ${index === 1 ? config.theme.highlight : "border-white/10 bg-white/[0.045]"}`}
            >
              <p className="text-sm font-medium text-zinc-300">{card.title}</p>
              <p className="mt-5 text-4xl font-semibold tracking-tight text-white">{card.meta}</p>
              <p className="mt-5 text-sm leading-6 text-zinc-400">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DemoForm({
  config,
  submitted,
  onSubmit,
}: {
  config: DemoConceptConfig
  submitted: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section id="demo-form" className="border-t border-white/10 bg-black/35 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <SectionHeader eyebrow={config.form.eyebrow} title={config.form.title} config={config} />
          <p className="mt-5 text-zinc-400">{config.form.description}</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 sm:p-7">
          {submitted ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full text-black ${config.theme.accentBg}`}>
                <Check className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-white">{config.form.successTitle}</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
                This is a frontend-only demo state. A production site would route the request to the business.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {config.form.fields.map((field) => (
                <FormField key={field.label} field={field} config={config} />
              ))}
              <button className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 sm:col-span-2 ${config.theme.button}`}>
                {config.form.button}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

function FormField({ field, config }: { field: DemoFormField; config: DemoConceptConfig }) {
  if (field.kind === "textarea") {
    return (
      <label className="space-y-2 sm:col-span-2">
        <span className="text-sm font-medium text-zinc-200">{field.label}</span>
        <textarea className={`min-h-32 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 ${config.theme.inputFocus}`} placeholder={field.placeholder} />
      </label>
    )
  }

  if (field.kind === "select") {
    return (
      <label className="space-y-2">
        <span className="text-sm font-medium text-zinc-200">{field.label}</span>
        <select className={`h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition-colors ${config.theme.inputFocus}`}>
          {field.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-200">{field.label}</span>
      <input
        type={field.type || "text"}
        placeholder={field.placeholder}
        className={`h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 ${config.theme.inputFocus}`}
      />
    </label>
  )
}

function FinalCta({ config }: { config: DemoConceptConfig }) {
  return (
    <section className="border-y border-white/10 px-4 py-20 text-center">
      <div className="mx-auto max-w-3xl">
        <p className={`mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] ${config.theme.accentText}`}>
          <Clock className="h-3.5 w-3.5" />
          {config.eyebrow}
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">{config.finalCta.headline}</h2>
        <a href="#demo-form" className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${config.theme.button}`}>
          {config.finalCta.button}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}

function AttributionFooter({ config }: { config: DemoConceptConfig }) {
  return (
    <footer className="bg-black px-4 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>Demo website concept by Mountline Studio.</p>
          <p className="flex items-center gap-2 text-xs text-zinc-600">
            <MapPin className="h-3.5 w-3.5" />
            Sample concept for outreach, not a real client.
          </p>
        </div>
        <Link href="/#contact" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-medium text-white transition-colors hover:bg-white hover:text-black">
          Get a site like this
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </footer>
  )
}

function SectionHeader({
  eyebrow,
  title,
  config,
}: {
  eyebrow: string
  title: string
  config: DemoConceptConfig
}) {
  return (
    <div className="max-w-3xl">
      <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${config.theme.accentText}`}>{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h2>
    </div>
  )
}

export const demoIcons = {
  CalendarDays,
  Menu,
}
