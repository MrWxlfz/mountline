"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Clock,
  Hammer,
  Home,
  Shield,
  Wrench,
  HardHat,
  Ruler,
  Phone,
} from "lucide-react"

const services = [
  {
    title: "Kitchen & Bath Remodels",
    description: "Complete renovations with quality materials and expert craftsmanship.",
    icon: Home,
  },
  {
    title: "Roofing & Siding",
    description: "Durable installations and repairs that protect your investment.",
    icon: Shield,
  },
  {
    title: "Outdoor Living",
    description: "Decks, patios, pergolas, and custom outdoor structures.",
    icon: Hammer,
  },
  {
    title: "General Repairs",
    description: "Reliable service for maintenance and repair needs.",
    icon: Wrench,
  },
]

const projects = [
  { title: "Kitchen Renovation", type: "Remodel", year: "2024" },
  { title: "Cedar Deck Build", type: "Outdoor", year: "2024" },
  { title: "Roof Replacement", type: "Roofing", year: "2023" },
  { title: "Bathroom Overhaul", type: "Remodel", year: "2023" },
]

const processSteps = [
  {
    number: "01",
    title: "Consultation",
    description: "We visit your property, understand your vision, and assess the scope of work.",
  },
  {
    number: "02",
    title: "Detailed Quote",
    description: "Clear pricing with materials, timeline, and project milestones outlined.",
  },
  {
    number: "03",
    title: "Build & Update",
    description: "Professional execution with regular progress updates and clean jobsites.",
  },
]

const trustPoints = [
  "Licensed & Insured",
  "20+ Years Experience",
  "Written Warranties",
  "Local References",
  "Clear Timelines",
  "Quality Materials",
]

export function ContractorDemo() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <DemoNotice />
      <Hero />
      <ServicesSection />
      <ProjectsSection />
      <ProcessSection />
      <TrustSection />
      <EstimateSection submitted={submitted} onSubmit={handleSubmit} />
      <FinalCta />
      <AttributionFooter />
    </main>
  )
}

function DemoNotice() {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl">
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
      {/* Background texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A]" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left content */}
          <div className="flex flex-col justify-center">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#D97706]">
                <HardHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97706]">Ridgeway Contracting</p>
                <p className="text-sm text-zinc-500">Building Since 2004</p>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Built right.
              <br />
              <span className="text-[#D97706]">Built to last.</span>
            </h1>
            
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-zinc-400">
              Quality remodels, roofing, outdoor structures, and repairs for homeowners who expect craftsmanship and clear communication.
            </p>
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#estimate"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D97706] px-7 py-4 text-sm font-semibold text-white transition-all hover:bg-[#B45309]"
              >
                Request an estimate
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#projects"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                View our work
              </a>
            </div>
            
            {/* Quick stats */}
            <div className="mt-14 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-3xl font-bold text-white">20+</p>
                <p className="mt-1 text-sm text-zinc-500">Years Experience</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="mt-1 text-sm text-zinc-500">Projects Completed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="mt-1 text-sm text-zinc-500">Licensed & Insured</p>
              </div>
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
      {/* Blueprint-style grid background */}
      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50" />
        
        {/* Main card */}
        <div className="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur">
          {/* House illustration */}
          <div className="relative h-72 overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 p-6">
            {/* Stylized house */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 288">
              {/* Foundation */}
              <rect x="60" y="200" width="280" height="20" fill="#374151" />
              
              {/* House body */}
              <rect x="80" y="120" width="240" height="80" fill="#1F2937" stroke="#D97706" strokeWidth="2" />
              
              {/* Roof */}
              <polygon points="200,40 60,120 340,120" fill="#1F2937" stroke="#D97706" strokeWidth="2" />
              
              {/* Door */}
              <rect x="175" y="140" width="50" height="60" fill="#D97706" rx="4" />
              <circle cx="215" cy="170" r="4" fill="#0A0A0A" />
              
              {/* Windows */}
              <rect x="100" y="140" width="40" height="40" fill="#374151" stroke="#D97706" strokeWidth="1" />
              <rect x="260" y="140" width="40" height="40" fill="#374151" stroke="#D97706" strokeWidth="1" />
              <line x1="100" y1="160" x2="140" y2="160" stroke="#D97706" strokeWidth="1" />
              <line x1="120" y1="140" x2="120" y2="180" stroke="#D97706" strokeWidth="1" />
              <line x1="260" y1="160" x2="300" y2="160" stroke="#D97706" strokeWidth="1" />
              <line x1="280" y1="140" x2="280" y2="180" stroke="#D97706" strokeWidth="1" />
              
              {/* Chimney */}
              <rect x="280" y="60" width="30" height="50" fill="#1F2937" stroke="#D97706" strokeWidth="2" />
              
              {/* Measurement lines */}
              <line x1="50" y1="200" x2="50" y2="40" stroke="#D97706" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <line x1="350" y1="200" x2="350" y2="120" stroke="#D97706" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            </svg>
            
            {/* Badge */}
            <div className="absolute bottom-4 right-4 rounded-lg bg-[#D97706] px-3 py-2">
              <p className="text-xs font-semibold text-white">Quality Guaranteed</p>
            </div>
          </div>
          
          {/* Info strip */}
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
            <div className="p-4 text-center">
              <Ruler className="mx-auto h-5 w-5 text-[#D97706]" />
              <p className="mt-2 text-xs text-zinc-400">Precise Plans</p>
            </div>
            <div className="p-4 text-center">
              <Shield className="mx-auto h-5 w-5 text-[#D97706]" />
              <p className="mt-2 text-xs text-zinc-400">Fully Insured</p>
            </div>
            <div className="p-4 text-center">
              <Check className="mx-auto h-5 w-5 text-[#D97706]" />
              <p className="mt-2 text-xs text-zinc-400">Warranty Backed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServicesSection() {
  return (
    <section id="services" className="border-t border-white/10 bg-zinc-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid gap-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#D97706]">What We Do</p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Reliable work,<br />professional results
            </h2>
          </div>
          <div className="flex items-end">
            <p className="max-w-md text-zinc-400">
              From small repairs to complete renovations, we bring the same level of care and expertise to every project.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] p-6 transition-all hover:border-[#D97706]/50"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#D97706]/10 ring-1 ring-[#D97706]/20">
                <service.icon className="h-6 w-6 text-[#D97706]" />
              </div>
              <h3 className="mb-3 text-lg font-semibold">{service.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{service.description}</p>
              
              {/* Corner accent */}
              <div className="absolute -bottom-px -right-px h-16 w-16 bg-gradient-to-tl from-[#D97706]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectsSection() {
  return (
    <section id="projects" className="border-t border-white/10 bg-[#0A0A0A] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#D97706]">Recent Work</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Projects that speak for themselves
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className={`group relative overflow-hidden rounded-2xl bg-zinc-900 ${
                index === 0 ? "sm:col-span-2 sm:row-span-2" : ""
              }`}
            >
              <div className={`${index === 0 ? "h-[400px] sm:h-[500px]" : "h-[280px]"} relative`}>
                {/* Abstract project visual */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
                  
                  {/* Project type visual */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {index === 0 ? (
                      <div className="relative">
                        <div className="h-32 w-48 rounded-lg border-2 border-[#D97706] bg-zinc-800/50" />
                        <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-lg border-2 border-[#D97706]/50 bg-zinc-800/30" />
                      </div>
                    ) : (
                      <div className="h-20 w-32 rounded-lg border-2 border-[#D97706]/50 bg-zinc-800/50" />
                    )}
                  </div>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#D97706]/20 px-3 py-1 text-xs font-medium text-[#D97706]">
                      {project.type}
                    </span>
                    <span className="text-sm text-zinc-500">{project.year}</span>
                  </div>
                  <h3 className={`mt-3 font-semibold ${index === 0 ? "text-2xl" : "text-xl"}`}>
                    {project.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  return (
    <section className="border-t border-white/10 bg-zinc-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#D97706]">Our Process</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple. Clear. Professional.
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {processSteps.map((step) => (
            <div key={step.number} className="relative">
              <div className="mb-6 flex items-center gap-4">
                <span className="text-5xl font-bold text-[#D97706]/20">{step.number}</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
              <p className="text-zinc-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section className="border-t border-white/10 bg-[#D97706] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Built on trust, backed by experience.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
                <Check className="h-5 w-5 flex-shrink-0 text-white" />
                <span className="text-sm font-medium text-white">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function EstimateSection({
  submitted,
  onSubmit,
}: {
  submitted: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section id="estimate" className="border-t border-white/10 bg-[#0A0A0A] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#D97706]">Get Started</p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Request a free estimate
            </h2>
            <p className="mt-6 text-zinc-400">
              Tell us about your project and we will schedule a site visit to discuss your vision and provide a detailed quote.
            </p>
            
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#D97706]/10">
                  <Clock className="h-5 w-5 text-[#D97706]" />
                </div>
                <div>
                  <p className="font-semibold">Fast Response</p>
                  <p className="text-sm text-zinc-500">We respond within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#D97706]/10">
                  <Phone className="h-5 w-5 text-[#D97706]" />
                </div>
                <div>
                  <p className="font-semibold">Direct Contact</p>
                  <p className="text-sm text-zinc-500">(555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
            {submitted ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D97706]">
                  <Check className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold">Request received</h3>
                <p className="mt-3 max-w-sm text-sm text-zinc-400">
                  This is a demo. In production, we would contact you within 24 hours to schedule a site visit.
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
                      className="h-12 w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#D97706]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Phone</span>
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="h-12 w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#D97706]"
                    />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Project Type</span>
                    <select className="h-12 w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 text-sm text-white outline-none transition-colors focus:border-[#D97706]">
                      <option>Kitchen Remodel</option>
                      <option>Bathroom Remodel</option>
                      <option>Roofing</option>
                      <option>Deck/Outdoor</option>
                      <option>General Repair</option>
                      <option>Custom Project</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Timeline</span>
                    <select className="h-12 w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 text-sm text-white outline-none transition-colors focus:border-[#D97706]">
                      <option>As soon as possible</option>
                      <option>Within 1 month</option>
                      <option>1-3 months</option>
                      <option>Planning ahead</option>
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Project Details</span>
                  <textarea
                    placeholder="Describe your project, property details, and any specific requirements..."
                    className="min-h-32 w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#D97706]"
                  />
                </label>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#D97706] px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-[#B45309]">
                  Submit estimate request
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
    <section className="border-t border-white/10 bg-zinc-900 px-4 py-24 text-center sm:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-center">
          <HardHat className="h-12 w-12 text-[#D97706]" />
        </div>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Ready to start your project?
        </h2>
        <p className="mt-6 text-lg text-zinc-400">
          Get in touch for a free consultation and detailed estimate.
        </p>
        <a
          href="#estimate"
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-lg bg-[#D97706] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[#B45309]"
        >
          Request an estimate
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}

function AttributionFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0A0A] px-4 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D97706]">
            <HardHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">Ridgeway Contracting</p>
            <p className="text-xs">Demo concept by Mountline Studio</p>
          </div>
        </div>
        <Link
          href="/#contact"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/20 px-5 py-3 font-medium text-white transition-colors hover:bg-white hover:text-black"
        >
          Get a site like this
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </footer>
  )
}
