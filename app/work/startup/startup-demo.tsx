"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Zap,
  Layers,
  BarChart3,
  Users,
  Code,
  Rocket,
  Shield,
  Globe,
} from "lucide-react"

const features = [
  {
    title: "Pipeline Clarity",
    description: "See your entire launch workflow in one place. Track progress, identify blockers, and ship faster.",
    icon: Layers,
  },
  {
    title: "Team Alignment",
    description: "Keep founders, operators, and engineers on the same page with shared context and clear ownership.",
    icon: Users,
  },
  {
    title: "Launch Metrics",
    description: "Built-in analytics for signups, conversions, and engagement. Know what is working from day one.",
    icon: BarChart3,
  },
  {
    title: "Developer Ready",
    description: "Clean APIs, webhooks, and integrations. Built by engineers for engineering teams.",
    icon: Code,
  },
]

const tiers = [
  {
    name: "Explorer",
    price: "Free",
    description: "Join the waitlist and get notified when we launch.",
    features: ["Early access notification", "Product updates", "Launch resources"],
  },
  {
    name: "Pilot",
    price: "$99/mo",
    description: "Early adopter pricing for teams ready to ship.",
    features: ["Full workspace access", "Onboarding call", "Priority support", "API access", "Analytics dashboard"],
    featured: true,
  },
  {
    name: "Team",
    price: "Custom",
    description: "For teams with complex launch requirements.",
    features: ["Everything in Pilot", "Custom integrations", "Dedicated support", "Migration help"],
  },
]

const testimonials = [
  {
    quote: "Finally, a tool that gets how early-stage teams actually work.",
    author: "Alex Chen",
    role: "Founder, Stealth Startup",
  },
  {
    quote: "Launchgrid cut our time-to-launch by weeks. No fluff, just clarity.",
    author: "Sarah Kim",
    role: "Head of Product, Series A",
  },
]

export function StartupDemo() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#09090B] text-white">
      <DemoNotice />
      <Hero />
      <FeaturesSection />
      <ProductPreview />
      <PricingSection />
      <TestimonialsSection />
      <WaitlistSection submitted={submitted} onSubmit={handleSubmit} />
      <FinalCta />
      <AttributionFooter />
    </main>
  )
}

function DemoNotice() {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-[#09090B]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Concept build by Mountline Studio. This is a sample website direction, not a real client.</p>
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white hover:text-black"
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
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%)]" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="text-center">
          {/* Announcement badge */}
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-2 ring-1 ring-[#6366F1]/20">
            <span className="h-2 w-2 rounded-full bg-[#6366F1] animate-pulse" />
            <span className="text-sm font-medium text-[#6366F1]">Now accepting early access requests</span>
          </div>
          
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Ship your product
            <br />
            <span className="bg-gradient-to-r from-[#6366F1] to-[#A855F7] bg-clip-text text-transparent">
              faster than ever.
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Launchgrid is the command center for early-stage teams. Organize your launch, align your team, and track what matters without the enterprise overhead.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-zinc-200"
            >
              Join the waitlist
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              See how it works
            </a>
          </div>
          
          {/* Code snippet teaser */}
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/50" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                  <div className="h-3 w-3 rounded-full bg-green-500/50" />
                </div>
                <span className="text-xs text-zinc-500">launchgrid.config.ts</span>
              </div>
              <pre className="overflow-x-auto p-4 text-left text-sm">
                <code className="text-zinc-300">
                  <span className="text-[#6366F1]">export</span>{" "}
                  <span className="text-[#A855F7]">const</span> launch = {`{`}
                  {"\n"}  name: <span className="text-green-400">{`"Product Launch v2"`}</span>,
                  {"\n"}  team: [<span className="text-green-400">{`"founders"`}</span>, <span className="text-green-400">{`"engineering"`}</span>],
                  {"\n"}  milestones: <span className="text-cyan-400">12</span>,
                  {"\n"}  status: <span className="text-green-400">{`"on_track"`}</span>
                  {"\n"}{`}`};
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="border-t border-white/10 bg-zinc-900/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#6366F1]">Features</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Built for how you actually work
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            No bloated features. No enterprise lock-in. Just the tools you need to ship.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/10 bg-[#09090B] p-6 transition-all hover:border-[#6366F1]/50"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366F1]/10 ring-1 ring-[#6366F1]/20">
                <feature.icon className="h-6 w-6 text-[#6366F1]" />
              </div>
              <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductPreview() {
  return (
    <section className="border-t border-white/10 bg-[#09090B] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#6366F1]">The Product</p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Your launch, organized
            </h2>
            <p className="mt-6 text-zinc-400">
              See everything in one dashboard. Track milestones, assign owners, and keep your team aligned without spreadsheet chaos.
            </p>
            
            <ul className="mt-8 space-y-4">
              {["Real-time progress tracking", "Team collaboration built-in", "Integrates with your tools", "No learning curve"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#6366F1]" />
                  <span className="text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Product mockup */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 shadow-2xl">
              {/* App header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#6366F1]" />
                  <span className="font-semibold">Launchgrid</span>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded bg-white/10" />
                  <div className="h-6 w-6 rounded-full bg-[#6366F1]" />
                </div>
              </div>
              
              {/* App content */}
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-xs text-zinc-500">CURRENT LAUNCH</p>
                  <p className="mt-1 text-lg font-semibold">Product Launch v2.0</p>
                </div>
                
                {/* Progress bars */}
                <div className="space-y-4">
                  {[
                    { name: "Engineering", progress: 85 },
                    { name: "Marketing", progress: 60 },
                    { name: "Content", progress: 45 },
                  ].map((track) => (
                    <div key={track.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-zinc-400">{track.name}</span>
                        <span className="text-[#6366F1]">{track.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#A855F7]"
                          style={{ width: `${track.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Milestone cards */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-2xl font-bold text-[#6366F1]">12</p>
                    <p className="text-xs text-zinc-500">Milestones</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-2xl font-bold text-green-400">8</p>
                    <p className="text-xs text-zinc-500">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" className="border-t border-white/10 bg-zinc-900/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#6366F1]">Pricing</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, founder-friendly pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Start free. Upgrade when you are ready. No surprises.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative overflow-hidden rounded-2xl p-8 ${
                tier.featured
                  ? "border-2 border-[#6366F1] bg-[#6366F1]/5"
                  : "border border-white/10 bg-[#09090B]"
              }`}
            >
              {tier.featured && (
                <div className="absolute -right-8 top-6 rotate-45 bg-[#6366F1] px-10 py-1 text-xs font-bold text-white">
                  Popular
                </div>
              )}
              
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{tier.name}</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{tier.price}</span>
              </div>
              <p className="mt-4 text-sm text-zinc-400">{tier.description}</p>
              
              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-[#6366F1]" />
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <a
                href="#waitlist"
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition-all ${
                  tier.featured
                    ? "bg-[#6366F1] text-white hover:bg-[#5558E3]"
                    : "border border-white/20 text-white hover:bg-white/10"
                }`}
              >
                {tier.name === "Explorer" ? "Join waitlist" : "Get started"}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="border-t border-white/10 bg-[#09090B] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#6366F1]">Early Access</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            What founders are saying
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8"
            >
              <p className="text-xl leading-relaxed text-zinc-200">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7]" />
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-zinc-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WaitlistSection({
  submitted,
  onSubmit,
}: {
  submitted: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section id="waitlist" className="border-t border-white/10 bg-zinc-900/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#6366F1]">Join the Waitlist</p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Be first in line
            </h2>
            <p className="mt-6 text-zinc-400">
              We are rolling out access to early adopters. Join the waitlist to get priority access and founder-friendly pricing.
            </p>
            
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366F1]/10">
                  <Rocket className="h-6 w-6 text-[#6366F1]" />
                </div>
                <div>
                  <p className="font-semibold">Priority Access</p>
                  <p className="text-sm text-zinc-500">Get in before public launch</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366F1]/10">
                  <Shield className="h-6 w-6 text-[#6366F1]" />
                </div>
                <div>
                  <p className="font-semibold">Locked Pricing</p>
                  <p className="text-sm text-zinc-500">Early adopter rates, forever</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-[#09090B] p-8">
            {submitted ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#6366F1]">
                  <Check className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-6 text-2xl font-bold">You&apos;re on the list</h3>
                <p className="mt-3 max-w-sm text-sm text-zinc-400">
                  This is a demo. In production, we would send you updates as we roll out access.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Name</span>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#6366F1]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Work email</span>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#6366F1]"
                    />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Role</span>
                    <select className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-white outline-none transition-colors focus:border-[#6366F1]">
                      <option>Founder / CEO</option>
                      <option>Product</option>
                      <option>Engineering</option>
                      <option>Marketing</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Company stage</span>
                    <select className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-white outline-none transition-colors focus:border-[#6366F1]">
                      <option>Idea stage</option>
                      <option>Building</option>
                      <option>Launched</option>
                      <option>Scaling</option>
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">What problem are you solving?</span>
                  <textarea
                    placeholder="Tell us about your launch challenges..."
                    className="min-h-32 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#6366F1]"
                  />
                </label>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-black transition-all hover:bg-zinc-200">
                  Join the waitlist
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="border-t border-white/10 bg-[#09090B] px-4 py-24 text-center sm:py-32">
      <div className="mx-auto max-w-3xl">
        <Zap className="mx-auto mb-6 h-12 w-12 text-[#6366F1]" />
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Ready to ship faster?
        </h2>
        <p className="mt-6 text-lg text-zinc-400">
          Join the founders who are building and launching with Launchgrid.
        </p>
        <a
          href="#waitlist"
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-zinc-200"
        >
          Join the waitlist
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}

function AttributionFooter() {
  return (
    <footer className="border-t border-white/10 bg-zinc-900/50 px-4 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">Launchgrid</p>
            <p className="text-xs">Demo concept by Mountline Studio</p>
          </div>
        </div>
        <Link
          href="/#contact"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-5 py-3 font-medium text-white transition-colors hover:bg-white hover:text-black"
        >
          Get a site like this
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </footer>
  )
}
