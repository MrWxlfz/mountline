"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Timer,
  Users,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react"

const programs = [
  {
    title: "Strength Training",
    description: "Build muscle, increase power, and develop functional strength with expert coaching.",
    icon: Dumbbell,
    color: "from-[#84CC16] to-[#65A30D]",
  },
  {
    title: "HIIT Conditioning",
    description: "High-intensity intervals that torch calories and boost athletic performance.",
    icon: Flame,
    color: "from-[#EF4444] to-[#DC2626]",
  },
  {
    title: "Personal Training",
    description: "One-on-one coaching tailored to your goals, schedule, and fitness level.",
    icon: Target,
    color: "from-[#84CC16] to-[#65A30D]",
  },
  {
    title: "Recovery & Mobility",
    description: "Flexibility work, foam rolling, and recovery sessions for longevity.",
    icon: Heart,
    color: "from-[#06B6D4] to-[#0891B2]",
  },
]

const schedule = [
  { day: "Monday", time: "6:00 AM", class: "Strength Foundations", intensity: "Medium" },
  { day: "Monday", time: "5:30 PM", class: "HIIT Circuit", intensity: "High" },
  { day: "Tuesday", time: "6:00 AM", class: "Conditioning", intensity: "High" },
  { day: "Tuesday", time: "6:00 PM", class: "Upper Body Strength", intensity: "Medium" },
  { day: "Wednesday", time: "6:00 AM", class: "Mobility Flow", intensity: "Low" },
  { day: "Thursday", time: "6:00 AM", class: "Lower Body Power", intensity: "High" },
]

const memberships = [
  {
    name: "Starter",
    price: "$99",
    period: "per month",
    description: "Perfect for those starting their fitness journey.",
    features: ["2 classes per week", "Fitness assessment", "Nutrition guide", "App access"],
  },
  {
    name: "Unlimited",
    price: "$169",
    period: "per month",
    description: "Full access for committed athletes.",
    features: ["Unlimited classes", "Monthly check-in", "Program design", "Priority booking", "Recovery sessions"],
    featured: true,
  },
  {
    name: "Elite",
    price: "$299",
    period: "per month",
    description: "Personal training and premium perks.",
    features: ["Everything in Unlimited", "4 PT sessions/month", "Nutrition coaching", "InBody scans"],
  },
]

export function LocalGymDemo() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <DemoNotice />
      <Hero />
      <ProgramsSection />
      <ScheduleSection />
      <StatsSection />
      <MembershipSection />
      <TrialSection submitted={submitted} onSubmit={handleSubmit} />
      <FinalCta />
      <AttributionFooter />
    </main>
  )
}

function DemoNotice() {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-[#111111]/90 backdrop-blur-xl">
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
      {/* Dynamic background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(132,204,22,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(132,204,22,0.1),transparent_40%)]" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left content */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#84CC16]/10 px-4 py-2 ring-1 ring-[#84CC16]/20">
              <Zap className="h-4 w-4 text-[#84CC16]" />
              <span className="text-sm font-semibold text-[#84CC16]">Corehouse Fitness</span>
            </div>
            
            <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-8xl">
              Train
              <br />
              <span className="text-[#84CC16]">harder.</span>
              <br />
              Move
              <br />
              <span className="text-[#84CC16]">better.</span>
            </h1>
            
            <p className="mt-8 max-w-md text-lg leading-relaxed text-zinc-400">
              Strength classes, conditioning, and personal training for athletes who want real results without the gimmicks.
            </p>
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#trial"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#84CC16] px-7 py-4 text-sm font-bold uppercase tracking-wide text-black transition-all hover:bg-[#65A30D]"
              >
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#schedule"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 px-7 py-4 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
              >
                View schedule
              </a>
            </div>
          </div>

          {/* Right visual */}
          <HeroVisual />
        </div>
      </div>
    </section>
  )
}

function HeroVisual() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-full max-w-md">
        {/* Abstract athletic figure */}
        <div className="relative aspect-square">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#84CC16]/20 animate-[spin_20s_linear_infinite]" />
          
          {/* Main circle */}
          <div className="absolute inset-8 overflow-hidden rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 ring-4 ring-[#84CC16]/30">
            {/* Abstract figure */}
            <svg className="absolute inset-0 h-full w-full p-12" viewBox="0 0 200 200">
              {/* Head */}
              <circle cx="100" cy="50" r="25" fill="#84CC16" opacity="0.8" />
              
              {/* Body */}
              <rect x="85" y="75" width="30" height="50" rx="8" fill="#1F2937" stroke="#84CC16" strokeWidth="2" />
              
              {/* Arms - extended pose */}
              <rect x="45" y="80" width="40" height="12" rx="6" fill="#1F2937" stroke="#84CC16" strokeWidth="2" />
              <rect x="115" y="80" width="40" height="12" rx="6" fill="#1F2937" stroke="#84CC16" strokeWidth="2" />
              
              {/* Weights */}
              <circle cx="35" cy="86" r="12" fill="#84CC16" />
              <circle cx="165" cy="86" r="12" fill="#84CC16" />
              
              {/* Legs */}
              <rect x="80" y="125" width="15" height="45" rx="6" fill="#1F2937" stroke="#84CC16" strokeWidth="2" />
              <rect x="105" y="125" width="15" height="45" rx="6" fill="#1F2937" stroke="#84CC16" strokeWidth="2" />
            </svg>
          </div>
          
          {/* Floating stats */}
          <div className="absolute -right-4 top-1/4 rounded-xl bg-zinc-900 p-4 ring-1 ring-white/10">
            <TrendingUp className="mb-2 h-5 w-5 text-[#84CC16]" />
            <p className="text-2xl font-bold">+47%</p>
            <p className="text-xs text-zinc-500">Avg. strength gain</p>
          </div>
          
          <div className="absolute -left-4 bottom-1/4 rounded-xl bg-zinc-900 p-4 ring-1 ring-white/10">
            <Users className="mb-2 h-5 w-5 text-[#84CC16]" />
            <p className="text-2xl font-bold">250+</p>
            <p className="text-xs text-zinc-500">Active members</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgramsSection() {
  return (
    <section id="programs" className="border-t border-white/10 bg-zinc-900/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#84CC16]">Programs</p>
          <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Built for real results
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((program) => (
            <div
              key={program.title}
              className="group relative overflow-hidden rounded-2xl bg-zinc-900 p-6 ring-1 ring-white/10 transition-all hover:ring-[#84CC16]/50"
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${program.color}`}>
                <program.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold">{program.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{program.description}</p>
              
              {/* Hover effect */}
              <div className="absolute -bottom-1 -right-1 h-20 w-20 rounded-full bg-[#84CC16]/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ScheduleSection() {
  return (
    <section id="schedule" className="border-t border-white/10 bg-[#111111] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid gap-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#84CC16]">Weekly Schedule</p>
            <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Find your session
            </h2>
          </div>
          <div className="flex items-end">
            <p className="max-w-md text-zinc-400">
              Classes run throughout the day to fit your schedule. Book ahead to secure your spot.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-4 gap-px bg-white/10 text-sm font-bold uppercase tracking-wide">
            <div className="bg-zinc-900 p-4">Day</div>
            <div className="bg-zinc-900 p-4">Time</div>
            <div className="bg-zinc-900 p-4">Class</div>
            <div className="bg-zinc-900 p-4">Intensity</div>
          </div>
          {schedule.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-px bg-white/5 text-sm">
              <div className="bg-[#111111] p-4 font-medium">{item.day}</div>
              <div className="bg-[#111111] p-4 text-zinc-400">{item.time}</div>
              <div className="bg-[#111111] p-4">{item.class}</div>
              <div className="bg-[#111111] p-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    item.intensity === "High"
                      ? "bg-red-500/10 text-red-400"
                      : item.intensity === "Medium"
                        ? "bg-[#84CC16]/10 text-[#84CC16]"
                        : "bg-cyan-500/10 text-cyan-400"
                  }`}
                >
                  {item.intensity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  return (
    <section className="border-t border-white/10 bg-[#84CC16] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          <div>
            <p className="text-5xl font-black text-black">6</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-black/70">Years Open</p>
          </div>
          <div>
            <p className="text-5xl font-black text-black">250+</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-black/70">Members</p>
          </div>
          <div>
            <p className="text-5xl font-black text-black">8</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-black/70">Coaches</p>
          </div>
          <div>
            <p className="text-5xl font-black text-black">5k+</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-black/70">Classes Taught</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function MembershipSection() {
  return (
    <section id="membership" className="border-t border-white/10 bg-[#111111] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#84CC16]">Membership</p>
          <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Choose your level
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {memberships.map((tier) => (
            <div
              key={tier.name}
              className={`relative overflow-hidden rounded-2xl p-8 ${
                tier.featured
                  ? "bg-[#84CC16] text-black ring-4 ring-[#84CC16]"
                  : "bg-zinc-900 ring-1 ring-white/10"
              }`}
            >
              {tier.featured && (
                <div className="absolute -right-8 top-6 rotate-45 bg-black px-10 py-1 text-xs font-bold uppercase text-white">
                  Popular
                </div>
              )}
              
              <p className={`text-sm font-bold uppercase tracking-wide ${tier.featured ? "text-black/70" : "text-zinc-500"}`}>
                {tier.name}
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-black">{tier.price}</span>
                <span className={tier.featured ? "text-black/70" : "text-zinc-500"}>{tier.period}</span>
              </div>
              <p className={`mt-4 text-sm ${tier.featured ? "text-black/80" : "text-zinc-400"}`}>
                {tier.description}
              </p>
              
              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className={`h-5 w-5 ${tier.featured ? "text-black" : "text-[#84CC16]"}`} />
                    <span className={tier.featured ? "text-black" : "text-white"}>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <a
                href="#trial"
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold uppercase tracking-wide transition-all ${
                  tier.featured
                    ? "bg-black text-white hover:bg-zinc-900"
                    : "bg-[#84CC16] text-black hover:bg-[#65A30D]"
                }`}
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrialSection({
  submitted,
  onSubmit,
}: {
  submitted: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section id="trial" className="border-t border-white/10 bg-zinc-900/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#84CC16]">Free Trial</p>
            <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Try before you commit
            </h2>
            <p className="mt-6 text-zinc-400">
              Experience a class, meet our coaches, and see if Corehouse is right for you. No pressure, no commitment required.
            </p>
            
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#84CC16]/10">
                  <Timer className="h-6 w-6 text-[#84CC16]" />
                </div>
                <div>
                  <p className="font-bold">1 Free Class</p>
                  <p className="text-sm text-zinc-500">Try any session on the schedule</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#84CC16]/10">
                  <Clock className="h-6 w-6 text-[#84CC16]" />
                </div>
                <div>
                  <p className="font-bold">Flexible Timing</p>
                  <p className="text-sm text-zinc-500">Morning, afternoon, or evening options</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl bg-[#111111] p-8 ring-1 ring-white/10">
            {submitted ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#84CC16]">
                  <Check className="h-7 w-7 text-black" />
                </div>
                <h3 className="mt-6 text-2xl font-black uppercase">You&apos;re in!</h3>
                <p className="mt-3 max-w-sm text-sm text-zinc-400">
                  This is a demo. In production, we would reach out to schedule your first session.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold uppercase">Name</span>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#84CC16]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold uppercase">Email</span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#84CC16]"
                    />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold uppercase">Program Interest</span>
                    <select className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-white outline-none transition-colors focus:border-[#84CC16]">
                      <option>Strength Training</option>
                      <option>HIIT Conditioning</option>
                      <option>Personal Training</option>
                      <option>General Fitness</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold uppercase">Preferred Time</span>
                    <select className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-white outline-none transition-colors focus:border-[#84CC16]">
                      <option>Morning (6-9am)</option>
                      <option>Midday (11am-2pm)</option>
                      <option>Evening (5-8pm)</option>
                      <option>Weekend</option>
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold uppercase">Goals</span>
                  <textarea
                    placeholder="What are you looking to achieve? Strength, fat loss, performance, general fitness..."
                    className="min-h-32 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#84CC16]"
                  />
                </label>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#84CC16] px-6 py-4 text-sm font-bold uppercase tracking-wide text-black transition-all hover:bg-[#65A30D]">
                  Claim free trial
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
    <section className="border-t border-white/10 bg-[#111111] px-4 py-24 text-center sm:py-32">
      <div className="mx-auto max-w-3xl">
        <Dumbbell className="mx-auto mb-6 h-12 w-12 text-[#84CC16]" />
        <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">
          Ready to level up?
        </h2>
        <p className="mt-6 text-lg text-zinc-400">
          Start your free trial and experience the difference.
        </p>
        <a
          href="#trial"
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-[#84CC16] px-8 py-4 text-sm font-bold uppercase tracking-wide text-black transition-all hover:bg-[#65A30D]"
        >
          Start free trial
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}

function AttributionFooter() {
  return (
    <footer className="border-t border-white/10 bg-zinc-900 px-4 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#84CC16]">
            <Dumbbell className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="font-bold text-white">Corehouse Fitness</p>
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
