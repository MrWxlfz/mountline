"use client"

import { useState, useRef, useEffect } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import {
  ArrowRight,
  Check,
  Phone,
  MapPin,
  Car,
  Droplets,
  Shield,
  Sparkles,
  Clock,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"

// ============================================
// DATA
// ============================================

const packages = [
  {
    name: "Essential Wash",
    price: "$95",
    description: "A careful maintenance wash for vehicles that need a thoughtful reset.",
    features: [
      "Hand wash and dry",
      "Wheels and tire finish",
      "Exterior glass",
      "Quick interior vacuum",
    ],
    featured: false,
  },
  {
    name: "Full Detail",
    price: "$225",
    description: "Complete interior and exterior care for vehicles that deserve the full treatment.",
    features: [
      "Exterior hand wash",
      "Deep interior vacuum",
      "Wipe-down and trim care",
      "Glass cleaning",
      "Tire finish",
      "Final inspection",
    ],
    featured: true,
  },
  {
    name: "Ceramic Protection",
    price: "$495",
    description: "Paint preparation and lasting protection for drivers who want enduring gloss.",
    features: [
      "Prep wash",
      "Surface decontamination",
      "Paint inspection",
      "Ceramic protection application",
      "Care guidance",
    ],
    featured: false,
  },
]

const processSteps = [
  {
    step: "01",
    title: "Choose your service",
    description: "Select a wash, full detail, interior reset, or protection package.",
  },
  {
    step: "02",
    title: "Tell us about your vehicle",
    description: "Share the vehicle type, condition, location, and preferred time.",
  },
  {
    step: "03",
    title: "We confirm the appointment",
    description: "Receive clear timing and service details before arrival.",
  },
  {
    step: "04",
    title: "Enjoy the result",
    description: "Walk out to a vehicle that looks refreshed and protected.",
  },
]

const galleryImages = [
  { id: 1, alt: "Black truck exterior detail", aspect: "tall" },
  { id: 2, alt: "Detailed wheel and brake caliper", aspect: "square" },
  { id: 3, alt: "Premium leather interior", aspect: "wide" },
  { id: 4, alt: "Glossy hood reflection", aspect: "square" },
  { id: 5, alt: "SUV after full detail", aspect: "tall" },
  { id: 6, alt: "Foam wash in progress", aspect: "wide" },
  { id: 7, alt: "Sports car ceramic finish", aspect: "square" },
  { id: 8, alt: "Mobile detailing van setup", aspect: "square" },
]

const trustValues = [
  { icon: Car, label: "Mobile service" },
  { icon: Sparkles, label: "Clear packages" },
  { icon: Shield, label: "Paint-safe care" },
  { icon: Clock, label: "Easy booking" },
]

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AutoDetailingDemo() {
  const [submitted, setSubmitted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"exterior" | "interior" | "protection">("exterior")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <DemoNotice />
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Hero />
      <IntroSection />
      <ProcessSection />
      <PackagesSection activeTab={activeTab} setActiveTab={setActiveTab} />
      <CeramicSection />
      <GallerySection />
      <ReviewsSection />
      <ContactSection submitted={submitted} onSubmit={handleSubmit} />
      <FinalCTA />
      <Footer />
    </main>
  )
}

// ============================================
// DEMO NOTICE
// ============================================

function DemoNotice() {
  return (
    <div className="bg-[#111] border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs sm:text-sm text-zinc-400">
            Concept website by Mountline Studio — created as a sample direction for detailing businesses.
          </p>
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
          >
            Back to Mountline
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ============================================
// HEADER
// ============================================

function Header({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/work/auto-detailing" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black font-bold text-sm">
              SA
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold text-white tracking-tight">Summit Auto Detail</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Mobile Detailing</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {["Services", "Packages", "Gallery", "Reviews", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="tel:8175550142"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden md:inline">Call or Text</span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#c41e3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a01830] transition-colors"
            >
              Book a Detail
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 py-4"
          >
            <nav className="flex flex-col gap-3">
              {["Services", "Packages", "Gallery", "Reviews", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-zinc-300 hover:text-white py-2"
                >
                  {item}
                </a>
              ))}
              <a
                href="#contact"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#c41e3a] px-5 py-3 text-sm font-semibold text-white"
              >
                Book a Detail
              </a>
            </nav>
          </motion.div>
        )}
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 sm:hidden">
        <a
          href="#contact"
          className="flex items-center justify-center gap-2 w-full rounded-full bg-[#c41e3a] px-5 py-3.5 text-sm font-semibold text-white"
        >
          Book a Detail
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </header>
  )
}

// ============================================
// HERO
// ============================================

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])

  return (
    <section ref={ref} className="relative min-h-[90vh] sm:min-h-screen overflow-hidden">
      {/* Background Image Placeholder */}
      <motion.div style={{ scale }} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0a_70%)]" />
        {/* Placeholder for hero image - glossy black vehicle */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[40%] rounded-[100px] bg-gradient-to-b from-zinc-600/50 to-transparent blur-sm" />
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[70%] h-[2px] bg-gradient-to-r from-transparent via-[#c41e3a]/60 to-transparent" />
          </div>
        </div>
        <p className="absolute bottom-4 right-4 text-[10px] text-white/30 uppercase tracking-wider">
          Replace with hero vehicle image
        </p>
      </motion.div>

      {/* Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c41e3a] to-transparent opacity-60" />

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[90vh] sm:min-h-screen flex-col justify-center py-20 sm:py-32">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm uppercase tracking-[0.25em] text-zinc-400 mb-6"
          >
            Mobile Detailing • Ceramic Protection • DFW
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.1]"
          >
            Detailing that makes your vehicle feel new again.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 max-w-2xl text-base sm:text-lg text-zinc-300 leading-relaxed"
          >
            Mobile washes, interior resets, ceramic protection, and paint-focused care for drivers who want the details done right.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c41e3a] px-7 py-4 text-sm font-semibold text-white hover:bg-[#a01830] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#c41e3a]/20"
            >
              Book a Detail
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#packages"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              View Packages
              <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center gap-2 text-sm text-zinc-400"
          >
            <Phone className="h-4 w-4" />
            <span>Call or Text: (817) 555-0142</span>
          </motion.div>

          {/* Trust Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <div className="flex flex-wrap gap-6 sm:gap-10">
              {trustValues.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-[#c41e3a]" />
                  <span className="text-sm text-zinc-300">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

// ============================================
// INTRO SECTION
// ============================================

function IntroSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="services" ref={ref} className="py-20 sm:py-28 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Text Content */}
          <div>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight"
            >
              Clean work. Clear service. A finish you can see.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 text-zinc-400 leading-relaxed">
              Summit Auto Detail is a fictional concept created to show how a detailing business can present services, packages, work, and booking in a clearer, more premium way.
            </motion.p>

            {/* Value Points */}
            <motion.div variants={fadeUp} className="mt-10 space-y-4">
              {[
                { icon: Car, text: "We come to you" },
                { icon: Sparkles, text: "Packages built around your vehicle" },
                { icon: Shield, text: "Protection options for long-term shine" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                    <item.icon className="h-5 w-5 text-[#c41e3a]" />
                  </div>
                  <span className="text-white font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Image Placeholder */}
          <motion.div
            variants={fadeUp}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Droplets className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Service image placeholder</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// PROCESS SECTION
// ============================================

function ProcessSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-[#111] border-y border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-[#c41e3a] mb-4">How it works</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
              Booking made simple.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                className="relative"
              >
                {/* Connector Line (desktop) */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-[1px] bg-gradient-to-r from-white/20 to-transparent" />
                )}

                <div className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors group">
                  <span className="text-4xl font-bold text-white/10 group-hover:text-[#c41e3a]/30 transition-colors">
                    {step.step}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// PACKAGES SECTION
// ============================================

function PackagesSection({
  activeTab,
  setActiveTab,
}: {
  activeTab: "exterior" | "interior" | "protection"
  setActiveTab: (tab: "exterior" | "interior" | "protection") => void
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="packages" ref={ref} className="py-20 sm:py-28 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-[#c41e3a] mb-4">Demo pricing</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
              Detailing packages for every need.
            </h2>
            <p className="mt-4 text-zinc-400">
              Straightforward starting prices. Final pricing may vary by vehicle size and condition.
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeUp} className="mt-10 flex gap-2">
            {(["exterior", "interior", "protection"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-white text-black"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </motion.div>

          {/* Package Cards */}
          <motion.div variants={fadeUp} className="mt-10 grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-2xl p-6 sm:p-8 transition-all ${
                  pkg.featured
                    ? "bg-gradient-to-b from-[#c41e3a]/20 to-transparent border-2 border-[#c41e3a]/40"
                    : "bg-white/[0.03] border border-white/10 hover:border-white/20"
                }`}
              >
                {pkg.featured && (
                  <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-[#c41e3a] text-xs font-semibold text-white">
                    Most Requested
                  </span>
                )}

                <p className="text-sm font-medium text-zinc-400">{pkg.name}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-semibold text-white">{pkg.price}</span>
                  <span className="text-sm text-zinc-500">starting at</span>
                </div>
                <p className="mt-4 text-sm text-zinc-400 leading-relaxed">{pkg.description}</p>

                <ul className="mt-6 space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                      <Check className="h-4 w-4 text-[#c41e3a] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={`mt-8 flex items-center justify-center gap-2 w-full rounded-full py-3.5 text-sm font-semibold transition-all ${
                    pkg.featured
                      ? "bg-[#c41e3a] text-white hover:bg-[#a01830]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Book this package
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </motion.div>

          <motion.p variants={fadeUp} className="mt-8 text-center text-xs text-zinc-500">
            Demo pricing shown for concept purposes.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// CERAMIC SECTION
// ============================================

function CeramicSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-[#0a0a0a] to-[#111]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#c41e3a10,transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Image */}
          <motion.div
            variants={fadeUp}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 order-2 lg:order-1"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Shield className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Ceramic coating image</p>
              </div>
            </div>
            {/* Glossy reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
          </motion.div>

          {/* Content */}
          <motion.div variants={fadeUp} className="order-1 lg:order-2">
            <p className="text-sm uppercase tracking-[0.2em] text-[#c41e3a] mb-4">Featured service</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              Protection that keeps the finish easier to love.
            </h2>
            <p className="mt-6 text-zinc-400 leading-relaxed">
              Ceramic protection helps maintain gloss, makes routine cleaning easier, and gives premium vehicles the presentation they deserve.
            </p>
            <a
              href="#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Ask about ceramic protection
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// GALLERY SECTION
// ============================================

function GallerySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="gallery" ref={ref} className="py-20 sm:py-28 bg-[#0a0a0a] border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-[#c41e3a] mb-4">Our work</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
              Results worth showing off.
            </h2>
            <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
              A clean gallery helps customers trust the work before they book.
            </p>
          </motion.div>

          {/* Masonry Grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 hover:border-white/20 transition-all cursor-pointer ${
                  image.aspect === "tall"
                    ? "row-span-2"
                    : image.aspect === "wide"
                    ? "col-span-2"
                    : ""
                }`}
              >
                <div
                  className={`relative w-full ${
                    image.aspect === "tall"
                      ? "aspect-[3/4]"
                      : image.aspect === "wide"
                      ? "aspect-[2/1]"
                      : "aspect-square"
                  }`}
                >
                  {/* Placeholder content */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                    <Sparkles className="h-8 w-8 text-zinc-500" />
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-sm text-white">{image.alt}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.p variants={fadeUp} className="mt-8 text-center text-xs text-zinc-500">
            Sample gallery imagery — replace with client work.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// REVIEWS SECTION
// ============================================

function ReviewsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const sampleReviews = [
    {
      name: "Customer Name",
      text: "Your real customer review would appear here, paired with a finished-detail photo or service booked.",
    },
    {
      name: "Customer Name",
      text: "Another genuine testimonial showcasing the quality of work and customer experience.",
    },
    {
      name: "Customer Name",
      text: "A third review highlighting specific services, professionalism, and results delivered.",
    },
  ]

  return (
    <section id="reviews" ref={ref} className="py-20 sm:py-28 bg-[#111] border-y border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 mb-4">Social proof</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
              Social proof, presented clearly.
            </h2>
            <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
              A review section like this helps strong customer feedback work harder on the site.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-6">
            {sampleReviews.map((review, index) => (
              <div
                key={index}
                className="relative rounded-2xl bg-white/[0.03] border border-white/10 border-dashed p-6 sm:p-8"
              >
                <span className="absolute -top-2.5 left-6 px-2 py-0.5 bg-[#111] text-[10px] uppercase tracking-wider text-zinc-500">
                  Sample review layout
                </span>

                {/* Stars placeholder */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-4 rounded bg-white/10" />
                  ))}
                </div>

                <p className="text-zinc-300 leading-relaxed italic">&ldquo;{review.text}&rdquo;</p>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-sm font-medium text-white">{review.name}</p>
                  <p className="text-xs text-zinc-500">Verified Customer</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 p-6 rounded-xl bg-white/[0.02] border border-white/10 border-dashed text-center"
          >
            <p className="text-sm text-zinc-500">
              Google reviews can be linked or embedded here.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// CONTACT SECTION
// ============================================

function ContactSection({
  submitted,
  onSubmit,
}: {
  submitted: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="contact" ref={ref} className="py-20 sm:py-28 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
          className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16"
        >
          {/* Left Column */}
          <motion.div variants={fadeUp}>
            <p className="text-sm uppercase tracking-[0.2em] text-[#c41e3a] mb-4">Get started</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              Ready for a cleaner vehicle?
            </h2>
            <p className="mt-6 text-zinc-400 leading-relaxed">
              Tell us about your vehicle and preferred service. This demo form shows how booking requests could be collected clearly and professionally.
            </p>

            {/* Contact Info */}
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                  <Phone className="h-5 w-5 text-[#c41e3a]" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Call or Text</p>
                  <p className="text-white font-medium">(817) 555-0142</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                  <MapPin className="h-5 w-5 text-[#c41e3a]" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Service Area</p>
                  <p className="text-white font-medium">Keller, Southlake, Roanoke & DFW</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div variants={fadeUp}>
            <form
              onSubmit={onSubmit}
              className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-8"
            >
              {submitted ? (
                <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#c41e3a] text-white">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">Demo request received</h3>
                  <p className="mt-4 max-w-md text-sm text-zinc-400 leading-relaxed">
                    Demo request received — a real site would send this directly to the business.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <InputField label="Name" placeholder="Your name" />
                  <InputField label="Phone" type="tel" placeholder="(817) 555-0000" />
                  <InputField label="Email" type="email" placeholder="you@email.com" />
                  <InputField label="Vehicle" placeholder="2024 Toyota 4Runner" />

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-zinc-300">Service interested in</span>
                    <select className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors focus:border-[#c41e3a]">
                      <option value="">Select a service</option>
                      <option>Essential Wash</option>
                      <option>Full Detail</option>
                      <option>Ceramic Protection</option>
                      <option>Interior Only</option>
                    </select>
                  </label>

                  <InputField label="Preferred date" type="date" placeholder="" />
                  <InputField label="Address / Service Area" placeholder="Keller, TX" className="sm:col-span-2" />

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-zinc-300">Notes about the vehicle</span>
                    <textarea
                      className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#c41e3a]"
                      placeholder="Any details about condition, requests, or questions..."
                    />
                  </label>

                  {/* Checkboxes */}
                  <div className="sm:col-span-2 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#c41e3a] focus:ring-[#c41e3a]"
                      />
                      <span className="text-sm text-zinc-400">I would like maintenance wash information</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#c41e3a] focus:ring-[#c41e3a]"
                      />
                      <span className="text-sm text-zinc-400">I would like ceramic protection pricing</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#c41e3a] px-6 py-4 text-sm font-semibold text-white hover:bg-[#a01830] transition-all hover:-translate-y-0.5"
                  >
                    Request Appointment
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function InputField({
  label,
  placeholder,
  type = "text",
  className = "",
}: {
  label: string
  placeholder: string
  type?: string
  className?: string
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#c41e3a]"
      />
    </label>
  )
}

// ============================================
// FINAL CTA
// ============================================

function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background with vehicle silhouette placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#c41e3a08,transparent_60%)]" />

      {/* Placeholder for background vehicle image */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[30%] rounded-[80px] bg-gradient-to-b from-zinc-500 to-transparent" />
      </div>

      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={stagger}
        className="relative z-10 mx-auto max-w-4xl px-4 text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white"
        >
          Give your vehicle the finish it deserves.
        </motion.h2>

        <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-[#c41e3a] px-8 py-4 text-sm font-semibold text-white hover:bg-[#a01830] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#c41e3a]/20"
          >
            Book a Detail
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="tel:8175550142"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <Phone className="h-4 w-4" />
            Call or Text
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ============================================
// FOOTER
// ============================================

function Footer() {
  const links = [
    { label: "Services", href: "#services" },
    { label: "Packages", href: "#packages" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ]

  return (
    <footer className="bg-black border-t border-white/10 pb-24 sm:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/work/auto-detailing" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black font-bold text-sm">
                SA
              </div>
              <div>
                <p className="font-semibold text-white tracking-tight">Summit Auto Detail</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Mobile Detailing & Ceramic Protection</p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-zinc-500 max-w-sm">
              Serving Keller, Southlake, Roanoke, and nearby DFW communities.
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              This is a fictional concept website created by Mountline Studio.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Quick Links</p>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Contact</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>(817) 555-0142</li>
              <li>demo@summitautodetail.com</li>
              <li>Keller, TX 76248</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            Concept website created by Mountline Studio.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white hover:bg-white hover:text-black transition-colors"
          >
            Get a site like this
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
