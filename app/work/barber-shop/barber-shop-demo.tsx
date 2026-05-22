"use client"

import { useState, useRef } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import {
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  Menu,
  X,
  Instagram,
  ArrowRight,
  Check,
  Star,
} from "lucide-react"

// ============================================
// TOKENS — scoped to the barber demo only
// ============================================
// bg-[#F5F0E8]  bone/off-white background
// bg-[#1C1915]  deep espresso dark (hero, footer)
// text-[#1C1915] primary text
// text-[#8B7355] brass/warm muted
// bg-[#8B7355]  brass accent
// border-[#D9D0C0] warm light border

// ============================================
// ANIMATION VARIANTS
// ============================================
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

// ============================================
// DATA
// ============================================

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Barbers", href: "#barbers" },
  { label: "Locations", href: "#locations" },
  { label: "Products", href: "#products" },
  { label: "Contact", href: "#contact" },
]

const services = [
  {
    name: "Classic Haircut",
    price: "Starting at $34",
    description: "A clean, precise cut tailored to your shape and style preferences.",
  },
  {
    name: "Skin Fade",
    price: "Starting at $42",
    description: "A seamless taper from skin to length — the shop's most requested service.",
  },
  {
    name: "Beard Trim & Lineup",
    price: "Starting at $22",
    description: "Shape, line, and detail your beard with care and a straight edge finish.",
  },
  {
    name: "Haircut + Beard",
    price: "Starting at $54",
    description: "The full treatment — cut and beard work together in one appointment.",
  },
  {
    name: "Kids Cut",
    price: "Starting at $28",
    description: "A comfortable, patient experience for younger clients.",
  },
  {
    name: "Hot Towel Shave",
    price: "Starting at $38",
    description: "Classic straight-razor shave with hot towel prep and a post-shave finish.",
  },
]

const barbers = [
  {
    name: "Jordan Hale",
    specialty: "Fades & modern cuts",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=85",
    instagram: "#",
  },
  {
    name: "Marcus Reed",
    specialty: "Classic cuts & beard work",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=85",
    instagram: "#",
  },
  {
    name: "Devon Brooks",
    specialty: "Textured styles & kids cuts",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=85",
    instagram: "#",
  },
]

const locations = [
  {
    name: "Ironwood Keller",
    address: "123 Main Street",
    city: "Keller, TX 76244",
    hours: [
      { days: "Mon – Fri", time: "9 AM – 7 PM" },
      { days: "Saturday", time: "9 AM – 5 PM" },
      { days: "Sunday", time: "Closed" },
    ],
    phone: "(817) 555-0164",
    img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900&q=85",
  },
  {
    name: "Ironwood Southlake",
    address: "456 Market Avenue",
    city: "Southlake, TX 76092",
    hours: [
      { days: "Mon – Fri", time: "9 AM – 7 PM" },
      { days: "Saturday", time: "9 AM – 5 PM" },
      { days: "Sunday", time: "Closed" },
    ],
    phone: "(817) 555-0182",
    img: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&q=85",
  },
]

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=85",
    alt: "Barber giving a precise fade",
    label: "The Cut",
    span: "col-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=700&q=85",
    alt: "Modern barbershop interior",
    label: "The Shop",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=700&q=85",
    alt: "Beard lineup close-up",
    label: "Beard Detail",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1635273051151-c5cb29916e10?w=700&q=85",
    alt: "Clean fade finish",
    label: "Fade Finish",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=85",
    alt: "Styling tools and station",
    label: "The Station",
    span: "col-span-2",
  },
]

const products = [
  {
    name: "Matte Pomade",
    description: "Medium hold. Natural finish. All-day control.",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=85",
  },
  {
    name: "Beard Oil",
    description: "Conditions and softens beard hair. Cedar & tobacco scent.",
    img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=85",
  },
  {
    name: "Styling Cream",
    description: "Flexible hold with a low-shine finish for everyday use.",
    img: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&q=85",
  },
  {
    name: "Scalp Shampoo",
    description: "Strengthening cleanse formulated for short cuts and fades.",
    img: "https://images.unsplash.com/photo-1585232351009-aa87e72f57a3?w=600&q=85",
  },
]

// ============================================
// HEADER
// ============================================

function Header() {
  const [open, setOpen] = useState(false)

  function scrollTo(href: string) {
    setOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-[#F5F0E8]/95 backdrop-blur-md border-b border-[#D9D0C0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Wordmark */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1C1915] rounded-sm flex items-center justify-center shrink-0">
                <span className="text-[#F5F0E8] text-xs font-bold tracking-widest">IB</span>
              </div>
              <span className="text-[#1C1915] font-semibold text-sm tracking-wide hidden sm:block">
                Ironwood Barber Co.
              </span>
              <span className="text-[#1C1915] font-semibold text-sm tracking-wide sm:hidden">
                Ironwood
              </span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="text-sm text-[#1C1915]/70 hover:text-[#1C1915] transition-colors font-medium"
                >
                  {l.label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <a
                href="tel:+18175550164"
                className="hidden sm:flex items-center gap-1.5 text-sm text-[#8B7355] font-medium hover:text-[#1C1915] transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                (817) 555-0164
              </a>
              <button
                onClick={() => scrollTo("#contact")}
                className="bg-[#1C1915] text-[#F5F0E8] text-sm font-medium px-4 py-2 rounded-sm hover:bg-[#2e2a24] transition-colors"
              >
                Book Appointment
              </button>
              <button
                className="lg:hidden p-2 text-[#1C1915]"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative ml-auto w-72 h-full bg-[#F5F0E8] flex flex-col p-8">
            <button
              className="absolute top-5 right-5 p-2 text-[#1C1915]"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 bg-[#1C1915] rounded-sm flex items-center justify-center">
                <span className="text-[#F5F0E8] text-xs font-bold tracking-widest">IB</span>
              </div>
              <span className="text-[#1C1915] font-semibold text-sm tracking-wide">Ironwood Barber Co.</span>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="text-left text-lg font-medium text-[#1C1915] py-2.5 border-b border-[#D9D0C0] hover:text-[#8B7355] transition-colors"
                >
                  {l.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto pt-8">
              <button
                onClick={() => scrollTo("#contact")}
                className="w-full bg-[#1C1915] text-[#F5F0E8] py-3 rounded-sm font-medium text-sm"
              >
                Book Appointment
              </button>
              <a
                href="tel:+18175550164"
                className="flex items-center justify-center gap-2 mt-3 text-sm text-[#8B7355] font-medium"
              >
                <Phone className="w-3.5 h-3.5" />
                (817) 555-0164
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================
// HERO
// ============================================

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#1C1915]">
      {/* Parallax image */}
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <Image
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1800&q=90"
          alt="Barber giving a precise haircut"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#1C1915]/65" />
        {/* Warm bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#1C1915] to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex flex-col justify-end h-full pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-[#8B7355] text-xs font-medium tracking-[0.3em] uppercase mb-5"
          >
            Keller, Texas&nbsp;&nbsp;·&nbsp;&nbsp;Cuts&nbsp;&nbsp;·&nbsp;&nbsp;Shaves&nbsp;&nbsp;·&nbsp;&nbsp;Grooming
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-7xl font-semibold text-[#F5F0E8] leading-[1.05] tracking-tight max-w-3xl text-balance mb-6"
          >
            Sharp cuts. Easy booking. A shop worth coming back to.
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-[#F5F0E8]/65 text-base sm:text-lg max-w-xl leading-relaxed mb-8"
          >
            Haircuts, fades, beard work, and grooming essentials delivered with attention to detail and an easy appointment experience.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 0.6 }}
            className="flex flex-wrap items-center gap-3 mb-6"
          >
            <a
              href="#contact"
              className="bg-[#F5F0E8] text-[#1C1915] font-medium text-sm px-6 py-3 rounded-sm hover:bg-white transition-colors flex items-center gap-2 group"
            >
              Book an Appointment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#services"
              className="border border-[#F5F0E8]/30 text-[#F5F0E8]/85 font-medium text-sm px-6 py-3 rounded-sm hover:border-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors"
            >
              View Services
            </a>
          </motion.div>

          {/* Walk-in note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.88, duration: 0.5 }}
            className="text-[#F5F0E8]/40 text-xs"
          >
            Walk-ins welcome when available&nbsp;&nbsp;·&nbsp;&nbsp;(817) 555-0164
          </motion.p>
        </div>
      </motion.div>

      {/* Service strip */}
      <div className="absolute bottom-0 inset-x-0 z-20 bg-[#1C1915]/90 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {["Haircuts", "Fades", "Beard Trims", "Hot Towel Shaves", "Kids Cuts"].map((s, i) => (
              <div key={s} className="flex items-center shrink-0">
                {i > 0 && <span className="text-[#8B7355]/40 mx-3 sm:mx-5 text-sm">·</span>}
                <span className="text-[#F5F0E8]/70 text-xs sm:text-sm font-medium tracking-wide py-3 whitespace-nowrap">
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// ABOUT / TRUST
// ============================================

function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="about" ref={ref} className="py-20 sm:py-28 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Left */}
          <div>
            <motion.p variants={fadeUp} className="text-[#8B7355] text-xs font-medium tracking-[0.25em] uppercase mb-5">
              About
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1C1915] leading-[1.1] tracking-tight mb-6 text-balance">
              A neighborhood shop with a higher standard.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#1C1915]/65 text-base leading-relaxed mb-8">
              Ironwood Barber Co. is a fictional concept created to show how a modern barbershop can present its style, services, booking, locations, and retail products more clearly online.
            </motion.p>
            <motion.ul variants={stagger} className="space-y-3">
              {[
                "Appointment-friendly online booking",
                "Skilled cuts and detailed beard work",
                "Comfortable local shop atmosphere",
                "Grooming products available in store",
              ].map((item) => (
                <motion.li key={item} variants={fadeUp} className="flex items-start gap-3">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-[#1C1915] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#F5F0E8]" />
                  </span>
                  <span className="text-[#1C1915]/80 text-sm leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Right — image */}
          <motion.div variants={fadeUp} className="relative">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&q=85"
                alt="Modern barbershop interior"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Brass accent line */}
            <div className="absolute -left-4 top-8 bottom-8 w-0.5 bg-[#8B7355]/40 hidden lg:block" />
            <p className="mt-3 text-xs text-[#8B7355]/60 italic">Sample imagery — replace with real shop photos.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// SERVICES
// ============================================

function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="services" ref={ref} className="py-20 sm:py-28 bg-[#EFEAD8] border-t border-[#D9D0C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger}>
          <motion.div variants={fadeUp} className="mb-12 sm:mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[#8B7355] text-xs font-medium tracking-[0.25em] uppercase mb-4">Services</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1C1915] leading-[1.1] tracking-tight text-balance">
                Services built around your style.
              </h2>
            </div>
            <p className="text-xs text-[#8B7355]/70 italic sm:text-right shrink-0">
              Demo pricing shown for concept purposes.
            </p>
          </motion.div>

          {/* Service list */}
          <div className="divide-y divide-[#D9D0C0]">
            {services.map((s, i) => (
              <motion.div
                key={s.name}
                variants={fadeUp}
                transition={{ delay: i * 0.07 }}
                className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-6 hover:bg-[#1C1915]/3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-colors rounded-sm cursor-default"
              >
                <span className="text-[#8B7355]/50 text-xs font-mono w-6 shrink-0 hidden sm:block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#1C1915] mb-1">{s.name}</h3>
                  <p className="text-[#1C1915]/55 text-sm leading-relaxed">{s.description}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                  <span className="text-[#1C1915] font-semibold text-base">{s.price}</span>
                  <button
                    className="text-xs font-medium text-[#8B7355] border border-[#8B7355]/40 hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-[#F5F0E8] px-4 py-2 rounded-sm transition-all"
                    onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Book
                  </button>
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
// BOOKING PREVIEW
// ============================================

function BookingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [step, setStep] = useState<"idle" | "service" | "barber" | "datetime" | "success">("idle")

  function advance() {
    if (step === "idle") setStep("service")
    else if (step === "service") setStep("barber")
    else if (step === "barber") setStep("datetime")
    else if (step === "datetime") setStep("success")
  }

  const steps = ["Service", "Barber", "Date & Time", "Confirm"]
  const stepIndex = { idle: -1, service: 0, barber: 1, datetime: 2, success: 3 }[step]

  return (
    <section id="booking" ref={ref} className="py-20 sm:py-28 bg-[#1C1915]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Left */}
          <div>
            <motion.p variants={fadeUp} className="text-[#8B7355] text-xs font-medium tracking-[0.25em] uppercase mb-5">
              Online Booking
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5F0E8] leading-[1.1] tracking-tight mb-5 text-balance">
              Book in a few clicks.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#F5F0E8]/55 text-base leading-relaxed mb-8">
              Choose a service, select a barber or first available appointment, and get confirmation without calling around.
            </motion.p>
            <motion.p variants={fadeUp} className="text-[#8B7355] text-xs italic">
              This is a frontend-only concept preview. No real booking is processed.
            </motion.p>
          </div>

          {/* Right — booking UI preview */}
          <motion.div variants={fadeUp} className="bg-[#F5F0E8] rounded-sm overflow-hidden border border-[#D9D0C0]">
            {/* Step progress */}
            <div className="flex border-b border-[#D9D0C0]">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 py-3 text-center text-xs font-medium transition-colors ${
                    i <= stepIndex
                      ? "text-[#1C1915] border-b-2 border-[#1C1915]"
                      : "text-[#1C1915]/35"
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8">
              {step === "idle" && (
                <div className="text-center py-4">
                  <p className="text-[#1C1915]/60 text-sm mb-6 leading-relaxed">
                    A live booking integration would appear here — service selection, barber availability, and calendar scheduling.
                  </p>
                  <button
                    onClick={advance}
                    className="bg-[#1C1915] text-[#F5F0E8] font-medium text-sm px-6 py-3 rounded-sm hover:bg-[#2e2a24] transition-colors w-full"
                  >
                    Book a Demo Appointment
                  </button>
                </div>
              )}

              {step === "service" && (
                <div>
                  <p className="text-[#1C1915] font-semibold mb-4 text-sm">Choose a service</p>
                  <div className="space-y-2 mb-6">
                    {["Classic Haircut — $34", "Skin Fade — $42", "Beard Trim — $22", "Haircut + Beard — $54"].map((s) => (
                      <button
                        key={s}
                        className="w-full text-left text-sm text-[#1C1915] border border-[#D9D0C0] hover:border-[#8B7355] px-4 py-3 rounded-sm transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <button onClick={advance} className="bg-[#1C1915] text-[#F5F0E8] font-medium text-sm px-6 py-3 rounded-sm hover:bg-[#2e2a24] transition-colors w-full flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === "barber" && (
                <div>
                  <p className="text-[#1C1915] font-semibold mb-4 text-sm">Choose your barber</p>
                  <div className="space-y-2 mb-6">
                    {barbers.concat([{ name: "First Available", specialty: "Next open slot", img: "", instagram: "#" }]).map((b) => (
                      <button
                        key={b.name}
                        className="w-full text-left text-sm text-[#1C1915] border border-[#D9D0C0] hover:border-[#8B7355] px-4 py-3 rounded-sm transition-colors"
                      >
                        <span className="font-medium">{b.name}</span>
                        {b.specialty && <span className="text-[#1C1915]/50 ml-2">· {b.specialty}</span>}
                      </button>
                    ))}
                  </div>
                  <button onClick={advance} className="bg-[#1C1915] text-[#F5F0E8] font-medium text-sm px-6 py-3 rounded-sm hover:bg-[#2e2a24] transition-colors w-full flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === "datetime" && (
                <div>
                  <p className="text-[#1C1915] font-semibold mb-4 text-sm">Pick a date & time</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {["Mon 9", "Tue 10", "Wed 11", "Thu 12", "Fri 13", "Sat 14"].map((d) => (
                      <button key={d} className="border border-[#D9D0C0] hover:border-[#8B7355] text-xs text-[#1C1915] py-2.5 rounded-sm transition-colors font-medium">
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {["9:00", "10:00", "11:00", "1:00", "2:00", "3:00", "4:00", "5:00"].map((t) => (
                      <button key={t} className="border border-[#D9D0C0] hover:border-[#8B7355] text-xs text-[#1C1915] py-2 rounded-sm transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                  <button onClick={advance} className="bg-[#1C1915] text-[#F5F0E8] font-medium text-sm px-6 py-3 rounded-sm hover:bg-[#2e2a24] transition-colors w-full flex items-center justify-center gap-2">
                    Confirm Booking <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === "success" && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-[#1C1915] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-[#F5F0E8]" />
                  </div>
                  <p className="text-[#1C1915] font-semibold text-base mb-2">Demo booking request received.</p>
                  <p className="text-[#1C1915]/55 text-sm leading-relaxed">
                    A live client site would route this directly to the shop&apos;s scheduling system with confirmation by text or email.
                  </p>
                  <button onClick={() => setStep("idle")} className="mt-6 text-xs text-[#8B7355] underline underline-offset-2 hover:text-[#1C1915] transition-colors">
                    Reset demo
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// BARBERS / TEAM
// ============================================

function BarbersSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="barbers" ref={ref} className="py-20 sm:py-28 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger}>
          <motion.div variants={fadeUp} className="mb-12 sm:mb-16">
            <p className="text-[#8B7355] text-xs font-medium tracking-[0.25em] uppercase mb-4">The Team</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1C1915] leading-[1.1] tracking-tight text-balance">
              Meet the barbers.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            {barbers.map((b, i) => (
              <motion.div
                key={b.name}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-sm overflow-hidden mb-4">
                  <Image
                    src={b.img}
                    alt={`${b.name} — sample portrait`}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1915]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <a
                    href={b.instagram}
                    className="absolute bottom-4 right-4 w-8 h-8 bg-[#F5F0E8]/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                    aria-label={`${b.name} Instagram`}
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#1C1915]" />
                  </a>
                </div>
                <h3 className="text-[#1C1915] font-semibold text-base mb-0.5">{b.name}</h3>
                <p className="text-[#8B7355] text-sm mb-3">{b.specialty}</p>
                <button
                  onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-xs font-medium text-[#1C1915] border border-[#D9D0C0] hover:border-[#1C1915] px-4 py-2 rounded-sm transition-all"
                >
                  Book with {b.name.split(" ")[0]}
                </button>
              </motion.div>
            ))}
          </div>

          <motion.p variants={fadeUp} className="mt-10 text-xs text-[#8B7355]/60 italic">
            Sample team layout — replace with real barbers and booking links.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// LOCATIONS
// ============================================

function LocationsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="locations" ref={ref} className="py-20 sm:py-28 bg-[#EFEAD8] border-t border-[#D9D0C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger}>
          <motion.div variants={fadeUp} className="mb-12 sm:mb-16">
            <p className="text-[#8B7355] text-xs font-medium tracking-[0.25em] uppercase mb-4">Locations</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1C1915] leading-[1.1] tracking-tight text-balance">
              Find your chair.
            </h2>
            <p className="mt-4 text-[#1C1915]/55 text-base max-w-xl leading-relaxed">
              A multi-location layout built to make hours, directions, and booking easy to find.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {locations.map((loc, i) => (
              <motion.div
                key={loc.name}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="group bg-[#F5F0E8] border border-[#D9D0C0] rounded-sm overflow-hidden hover:border-[#8B7355]/50 hover:shadow-lg transition-all duration-300"
              >
                {/* Location image */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={loc.img}
                    alt={`${loc.name} — barbershop interior`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-[#1C1915]/30" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-[#F5F0E8] text-[#1C1915] text-xs font-semibold px-3 py-1.5 rounded-sm">
                      {loc.name}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Address */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[#8B7355] mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium uppercase tracking-wider">Address</span>
                      </div>
                      <p className="text-[#1C1915] text-sm font-medium">{loc.address}</p>
                      <p className="text-[#1C1915]/60 text-sm">{loc.city}</p>
                    </div>
                    {/* Phone */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[#8B7355] mb-2">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium uppercase tracking-wider">Phone</span>
                      </div>
                      <a href={`tel:${loc.phone}`} className="text-[#1C1915] text-sm font-medium hover:text-[#8B7355] transition-colors">
                        {loc.phone}
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="mb-6">
                    <div className="flex items-center gap-1.5 text-[#8B7355] mb-3">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wider">Hours</span>
                    </div>
                    <div className="space-y-1.5">
                      {loc.hours.map((h) => (
                        <div key={h.days} className="flex justify-between text-sm">
                          <span className="text-[#1C1915]/60">{h.days}</span>
                          <span className="text-[#1C1915] font-medium">{h.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <a
                      href="#"
                      className="flex-1 text-center text-xs font-medium text-[#1C1915] border border-[#D9D0C0] hover:border-[#1C1915] py-2.5 rounded-sm transition-all"
                    >
                      Get Directions
                    </a>
                    <button
                      onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
                      className="flex-1 text-center text-xs font-medium bg-[#1C1915] text-[#F5F0E8] hover:bg-[#2e2a24] py-2.5 rounded-sm transition-colors"
                    >
                      Book Here
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p variants={fadeUp} className="mt-8 text-xs text-[#8B7355]/60 italic">
            Fictional locations for concept display only.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// GALLERY
// ============================================

function GallerySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="gallery" ref={ref} className="py-20 sm:py-28 bg-[#1C1915]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger}>
          <motion.div variants={fadeUp} className="mb-10 sm:mb-12">
            <p className="text-[#8B7355] text-xs font-medium tracking-[0.25em] uppercase mb-4">The Shop</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5F0E8] leading-[1.1] tracking-tight text-balance">
              The shop. The cut. The finish.
            </h2>
          </motion.div>

          {/* Top row: wide + square */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <GalleryCard
              src={galleryImages[0].src}
              alt={galleryImages[0].alt}
              label={galleryImages[0].label}
              className="sm:col-span-2 aspect-[16/9]"
            />
            <GalleryCard
              src={galleryImages[1].src}
              alt={galleryImages[1].alt}
              label={galleryImages[1].label}
              className="aspect-[16/9] sm:aspect-auto"
            />
          </motion.div>

          {/* Bottom row: square + wide */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <GalleryCard
              src={galleryImages[2].src}
              alt={galleryImages[2].alt}
              label={galleryImages[2].label}
              className="aspect-square"
            />
            <GalleryCard
              src={galleryImages[3].src}
              alt={galleryImages[3].alt}
              label={galleryImages[3].label}
              className="aspect-square"
            />
            <GalleryCard
              src={galleryImages[4].src}
              alt={galleryImages[4].alt}
              label={galleryImages[4].label}
              className="col-span-2 sm:col-span-1 aspect-[2/1] sm:aspect-auto"
            />
          </motion.div>

          <motion.p variants={fadeUp} className="mt-8 text-xs text-[#8B7355]/50 italic">
            Sample imagery — replace with the shop&apos;s real work and space.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

function GalleryCard({
  src, alt, label, className = ""
}: {
  src: string; alt: string; label: string; className?: string
}) {
  return (
    <div className={`group relative overflow-hidden rounded-sm border border-white/10 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1C1915]/70 to-transparent pt-8 pb-3 px-4">
        <span className="text-xs font-medium text-[#F5F0E8]/80 uppercase tracking-widest">{label}</span>
      </div>
    </div>
  )
}

// ============================================
// REVIEWS / SOCIAL PROOF
// ============================================

function ReviewsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="reviews" ref={ref} className="py-20 sm:py-28 bg-[#F5F0E8] border-t border-[#D9D0C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-[#8B7355] text-xs font-medium tracking-[0.25em] uppercase mb-4">Reviews</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1C1915] leading-[1.1] tracking-tight text-balance">
              Make great feedback impossible to miss.
            </h2>
            <p className="mt-4 text-[#1C1915]/55 text-base max-w-xl mx-auto leading-relaxed">
              A strong review section gives future customers confidence before they book.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6 mb-8">
            {[1, 2, 3].map((n) => (
              <motion.div
                key={n}
                variants={fadeUp}
                transition={{ delay: n * 0.08 }}
                className="bg-[#EFEAD8] border border-[#D9D0C0] rounded-sm p-6 relative"
              >
                <span className="absolute top-3 right-3 text-[8px] font-semibold text-[#8B7355] bg-[#8B7355]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Sample layout
                </span>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#8B7355] text-[#8B7355]" />
                  ))}
                </div>
                <p className="text-[#1C1915]/70 text-sm leading-relaxed mb-5 italic">
                  &ldquo;Real customer feedback can appear here, paired with the service booked and a link to verified reviews.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D9D0C0]" />
                  <div>
                    <p className="text-[#1C1915]/40 text-xs font-medium">Customer Name</p>
                    <p className="text-[#8B7355]/60 text-xs">Service booked</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p variants={fadeUp} className="text-center text-xs text-[#8B7355]/60 italic">
            Google review links or embedded review widgets can be included on a live site.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// RETAIL PRODUCTS
// ============================================

function ProductsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="products" ref={ref} className="py-20 sm:py-28 bg-[#EFEAD8] border-t border-[#D9D0C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger}>
          <motion.div variants={fadeUp} className="mb-12 sm:mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[#8B7355] text-xs font-medium tracking-[0.25em] uppercase mb-4">Products</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1C1915] leading-[1.1] tracking-tight text-balance">
                Take the shop home.
              </h2>
              <p className="mt-4 text-[#1C1915]/55 text-base max-w-xl leading-relaxed">
                Pomades, beard oils, shampoos, and styling essentials available after your cut.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button className="text-sm font-medium text-[#1C1915] border border-[#D9D0C0] hover:border-[#1C1915] px-5 py-2.5 rounded-sm transition-all">
                Ask Your Barber
              </button>
              <button className="text-sm font-medium bg-[#1C1915] text-[#F5F0E8] hover:bg-[#2e2a24] px-5 py-2.5 rounded-sm transition-colors">
                Browse Products
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((p, i) => (
              <motion.div
                key={p.name}
                variants={fadeUp}
                transition={{ delay: i * 0.08 }}
                className="group bg-[#F5F0E8] border border-[#D9D0C0] rounded-sm overflow-hidden hover:border-[#8B7355]/50 hover:shadow-md transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-[#EFEAD8]">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-[#1C1915] font-semibold text-sm mb-1">{p.name}</h3>
                  <p className="text-[#1C1915]/55 text-xs leading-relaxed">{p.description}</p>
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
// CONTACT / BOOKING FORM
// ============================================

function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  const inputCls =
    "w-full bg-[#EFEAD8] border border-[#D9D0C0] text-[#1C1915] placeholder:text-[#1C1915]/35 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-[#8B7355] transition-colors"

  return (
    <section id="contact" ref={ref} className="py-20 sm:py-28 bg-[#F5F0E8] border-t border-[#D9D0C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start"
        >
          {/* Left */}
          <div className="lg:sticky lg:top-24">
            <motion.p variants={fadeUp} className="text-[#8B7355] text-xs font-medium tracking-[0.25em] uppercase mb-5">
              Book an Appointment
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1C1915] leading-[1.1] tracking-tight mb-5 text-balance">
              Ready for your next cut?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#1C1915]/60 text-base leading-relaxed mb-8">
              Choose your service, preferred location, and appointment time. This concept form shows how a shop can make booking easier online.
            </motion.p>
            <motion.div variants={fadeUp} className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#8B7355] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#8B7355] font-medium uppercase tracking-wider mb-0.5">Call or Text</p>
                  <a href="tel:+18175550164" className="text-[#1C1915] text-sm hover:text-[#8B7355] transition-colors">
                    (817) 555-0164
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#8B7355] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#8B7355] font-medium uppercase tracking-wider mb-0.5">Locations</p>
                  <p className="text-[#1C1915] text-sm">Keller & Southlake, TX</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#8B7355] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#8B7355] font-medium uppercase tracking-wider mb-0.5">Hours</p>
                  <p className="text-[#1C1915] text-sm">Mon–Fri 9 AM–7 PM · Sat 9 AM–5 PM</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — form */}
          <motion.div variants={fadeUp}>
            {submitted ? (
              <div className="bg-[#1C1915] rounded-sm p-10 text-center">
                <div className="w-12 h-12 bg-[#8B7355] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-[#F5F0E8]" />
                </div>
                <p className="text-[#F5F0E8] font-semibold text-lg mb-2">Demo request received.</p>
                <p className="text-[#F5F0E8]/55 text-sm leading-relaxed">
                  A live site would send this directly to the shop&apos;s booking system with confirmation by text or email.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-xs text-[#8B7355] underline underline-offset-2 hover:text-[#F5F0E8] transition-colors"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required type="text" placeholder="Your name" className={inputCls} />
                  <input type="tel" placeholder="Phone number" className={inputCls} />
                </div>
                <input type="email" placeholder="Email address" className={inputCls} />
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>Service</option>
                  {services.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select className={inputCls} defaultValue="">
                    <option value="" disabled>Preferred barber</option>
                    <option value="first">First available</option>
                    {barbers.map((b) => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                  <select className={inputCls} defaultValue="">
                    <option value="" disabled>Preferred location</option>
                    <option value="keller">Ironwood Keller</option>
                    <option value="southlake">Ironwood Southlake</option>
                  </select>
                </div>
                <input type="text" placeholder="Preferred date / time" className={inputCls} />
                <textarea
                  rows={3}
                  placeholder="Any notes (style notes, first visit, etc.)"
                  className={`${inputCls} resize-none`}
                />
                <button
                  type="submit"
                  className="w-full bg-[#1C1915] text-[#F5F0E8] font-medium text-sm py-4 rounded-sm hover:bg-[#2e2a24] transition-colors flex items-center justify-center gap-2 group"
                >
                  Request Appointment
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <p className="text-[#8B7355]/60 text-xs text-center">
                  Frontend-only demo — no data is submitted or stored.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// FINAL CTA
// ============================================

function FinalCTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"])

  return (
    <section ref={ref} className="relative overflow-hidden h-[500px] sm:h-[580px]">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <Image
          src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1800&q=85"
          alt="Barber beard trim close-up"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#1C1915]/72" />
      </motion.div>

      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
          className="text-center max-w-2xl"
        >
          <motion.p variants={fadeUp} className="text-[#8B7355] text-xs font-medium tracking-[0.25em] uppercase mb-5">
            Ready?
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F5F0E8] leading-[1.05] tracking-tight mb-8 text-balance">
            Your next cut starts here.
          </motion.h2>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#F5F0E8] text-[#1C1915] font-medium text-sm px-7 py-3.5 rounded-sm hover:bg-white transition-colors flex items-center gap-2 group"
            >
              Book Appointment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })}
              className="border border-[#F5F0E8]/30 text-[#F5F0E8]/85 font-medium text-sm px-7 py-3.5 rounded-sm hover:border-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors"
            >
              View Services
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// FOOTER
// ============================================

function Footer() {
  return (
    <footer className="bg-[#1C1915] border-t border-white/10 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#F5F0E8] rounded-sm flex items-center justify-center shrink-0">
                <span className="text-[#1C1915] text-xs font-bold tracking-widest">IB</span>
              </div>
              <span className="text-[#F5F0E8] font-semibold text-sm tracking-wide">Ironwood Barber Co.</span>
            </div>
            <p className="text-[#F5F0E8]/40 text-sm leading-relaxed mb-1">Classic cuts. Modern standard.</p>
            <p className="text-[#8B7355]/60 text-xs mb-6">Fictional concept business — Serving Keller and DFW.</p>
            <div className="flex items-center gap-2 text-xs text-[#F5F0E8]/30 mb-1">
              <span>hello@ironwoodbarber.example</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#F5F0E8]/30">
              <span>(817) 555-0164</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-[#F5F0E8]/50 text-xs font-medium uppercase tracking-wider mb-4">Navigate</p>
            <nav className="space-y-2.5">
              {["Services", "Barbers", "Locations", "Products", "Contact"].map((l) => (
                <button
                  key={l}
                  onClick={() => document.querySelector(`#${l.toLowerCase()}`)?.scrollIntoView({ behavior: "smooth" })}
                  className="block text-sm text-[#F5F0E8]/55 hover:text-[#F5F0E8] transition-colors"
                >
                  {l}
                </button>
              ))}
            </nav>
          </div>

          {/* Mountline */}
          <div>
            <p className="text-[#F5F0E8]/50 text-xs font-medium uppercase tracking-wider mb-4">Created by</p>
            <p className="text-[#F5F0E8]/55 text-sm leading-relaxed mb-4">
              Concept website created by Mountline Studio.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#8B7355] text-[#F5F0E8] text-xs font-medium px-4 py-2.5 rounded-sm hover:bg-[#9a8060] transition-colors group"
            >
              Get a site like this
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#F5F0E8]/25 text-xs">
            Ironwood Barber Co. is a fictional concept. Not a real business.
          </p>
          <p className="text-[#F5F0E8]/25 text-xs">
            © {new Date().getFullYear()} Mountline Studio
          </p>
        </div>
      </div>
    </footer>
  )
}

// ============================================
// MOBILE STICKY CTA
// ============================================

function MobileStickyBooking() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#1C1915]/95 backdrop-blur-sm border-t border-white/10 px-4 py-3 flex gap-3">
      <a
        href="tel:+18175550164"
        className="flex-1 border border-white/20 text-[#F5F0E8]/80 text-sm font-medium py-3 rounded-sm text-center hover:border-white/40 transition-colors flex items-center justify-center gap-1.5"
      >
        <Phone className="w-3.5 h-3.5" />
        Call
      </a>
      <button
        onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
        className="flex-[2] bg-[#F5F0E8] text-[#1C1915] text-sm font-medium py-3 rounded-sm hover:bg-white transition-colors"
      >
        Book Appointment
      </button>
    </div>
  )
}

// ============================================
// ROOT COMPONENT
// ============================================

export function BarberShopDemo() {
  return (
    <div className="bg-[#F5F0E8] font-sans">
      {/* Concept notice */}
      <div className="bg-[#1C1915] border-b border-white/10 text-center py-2 px-4 z-[100] relative">
        <p className="text-[#F5F0E8]/55 text-xs">
          Concept website by{" "}
          <Link href="/" className="text-[#8B7355] hover:text-[#9a8060] underline underline-offset-2 transition-colors font-medium">
            Mountline Studio
          </Link>
          {" "}— created as a sample direction for barbershops.{" "}
          <Link href="/" className="text-[#F5F0E8]/35 hover:text-[#F5F0E8]/60 underline underline-offset-2 transition-colors text-xs ml-2">
            Back to Mountline
          </Link>
        </p>
      </div>

      <Header />

      <main className="pt-16 sm:pt-18">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <BookingSection />
        <BarbersSection />
        <LocationsSection />
        <GallerySection />
        <ReviewsSection />
        <ProductsSection />
        <ContactSection />
        <FinalCTASection />
      </main>

      <Footer />
      <MobileStickyBooking />
    </div>
  )
}
