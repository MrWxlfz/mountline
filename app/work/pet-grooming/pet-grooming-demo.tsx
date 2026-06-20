"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView, type Variants } from "framer-motion"
import {
  ArrowRight,
  Bath,
  Camera,
  Check,
  Clock3,
  Heart,
  MapPin,
  Menu,
  PawPrint,
  Phone,
  Scissors,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react"

// ============================================
// TOKENS — scoped to the pet grooming demo only
// ============================================
// bg-[#F8F1E5]  warm cream background
// bg-[#3A2A22]  deep warm brown
// text-[#3A2A22] primary text
// text-[#A66F45] warm tan accent
// bg-[#DDBB91]  soft tan highlight
// border-[#DFCDB7] warm light border

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Photos", href: "#photos" },
  { label: "Location", href: "#location" },
  { label: "FAQ", href: "#faq" },
]

const services: Array<{
  name: string
  description: string
  icon: LucideIcon
}> = [
  {
    name: "Bath & Brush",
    description:
      "A refreshing bath, careful dry, brush-out, and finishing touches for a clean, comfortable coat.",
    icon: Bath,
  },
  {
    name: "Full Groom",
    description:
      "A complete grooming appointment with coat care and a style selected for the dog’s needs.",
    icon: Scissors,
  },
  {
    name: "De-shedding Care",
    description:
      "Extra brushing and coat work designed to lift loose undercoat and reduce shedding at home.",
    icon: Sparkles,
  },
  {
    name: "Nail Care",
    description:
      "Simple nail maintenance that can be offered on its own or added to a grooming visit.",
    icon: PawPrint,
  },
  {
    name: "Puppy Introduction",
    description:
      "A shorter first visit focused on helping younger dogs get comfortable with the grooming routine.",
    icon: Heart,
  },
  {
    name: "Tidy-Up",
    description:
      "A light refresh between full grooms for faces, feet, sanitary areas, and coat touch-ups.",
    icon: Check,
  },
]

const faqs = [
  {
    question: "How do appointments work?",
    answer:
      "This concept leaves room for the business’s preferred booking process, whether that is a phone call, text message, request form, or scheduling link.",
  },
  {
    question: "How long does a grooming visit take?",
    answer:
      "Timing depends on the dog, coat condition, requested service, and daily schedule. The official business can add its normal timing guidance here.",
  },
  {
    question: "What should customers bring?",
    answer:
      "Vaccination, leash, arrival, and special-care requirements should be confirmed directly with Diamonds 'n the Ruff before this section is published.",
  },
  {
    question: "Can pricing be shown online?",
    answer:
      "Yes. The finished site could show starting prices, size ranges, or a request-an-estimate flow once the business confirms its current pricing.",
  },
]

function scrollTo(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
}

function ConceptNotice() {
  return (
    <div className="relative z-[100] border-b border-white/10 bg-[#3A2A22] px-4 py-2 text-center">
      <p className="text-xs text-[#F8F1E5]/65">
        Concept preview made by{" "}
        <Link
          href="/"
          className="font-medium text-[#DDBB91] underline underline-offset-2 transition-colors hover:text-[#F8F1E5]"
        >
          Mountline Studio
        </Link>
        . This is not Diamonds &apos;n the Ruff&apos;s current official website.{" "}
        <Link
          href="/"
          className="ml-2 text-[#F8F1E5]/40 underline underline-offset-2 transition-colors hover:text-[#F8F1E5]/70"
        >
          Back to Mountline
        </Link>
      </p>
    </div>
  )
}

function Header() {
  const [open, setOpen] = useState(false)

  function handleNav(href: string) {
    setOpen(false)
    scrollTo(href)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#DFCDB7] bg-[#F8F1E5]/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between sm:h-18">
            <button
              type="button"
              onClick={() => scrollTo("#top")}
              className="flex items-center gap-3 text-left"
              aria-label="Diamonds 'n the Ruff home"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#3A2A22] text-[#F8F1E5]">
                <PawPrint className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold tracking-tight text-[#3A2A22]">
                  Diamonds &apos;n the Ruff
                </span>
                <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-[#A66F45] sm:block">
                  Dog Grooming
                </span>
              </span>
            </button>

            <nav className="hidden items-center gap-6 lg:flex">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleNav(link.href)}
                  className="text-sm font-medium text-[#3A2A22]/65 transition-colors hover:text-[#3A2A22]"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollTo("#contact")}
                className="rounded-full bg-[#3A2A22] px-4 py-2 text-sm font-medium text-[#F8F1E5] transition-colors hover:bg-[#543D31]"
              >
                Request an Appointment
              </button>
              <button
                type="button"
                className="p-2 text-[#3A2A22] lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <div className="relative ml-auto flex h-full w-72 flex-col bg-[#F8F1E5] p-8">
            <button
              type="button"
              className="absolute right-5 top-5 p-2 text-[#3A2A22]"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            <div className="mb-10 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#3A2A22] text-[#F8F1E5]">
                <PawPrint className="size-4" />
              </span>
              <span className="text-sm font-semibold text-[#3A2A22]">
                Diamonds &apos;n the Ruff
              </span>
            </div>
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleNav(link.href)}
                  className="border-b border-[#DFCDB7] py-3 text-left text-lg font-medium text-[#3A2A22] transition-colors hover:text-[#A66F45]"
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => handleNav("#contact")}
              className="mt-auto rounded-full bg-[#3A2A22] px-5 py-3 text-sm font-medium text-[#F8F1E5]"
            >
              Request an Appointment
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

function HeroSection() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-[#DFCDB7] bg-[#F8F1E5]"
    >
      <div className="absolute -right-36 top-16 size-[430px] rounded-full bg-[#DDBB91]/35 blur-3xl" />
      <div className="absolute -left-24 bottom-0 size-72 rounded-full bg-[#EAD8C1]/70 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-[#A66F45]"
          >
            Local dog grooming · Gentle care · Fresh finishes
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight text-[#3A2A22] sm:text-6xl lg:text-7xl"
          >
            Tagline placeholder for happy dogs and easier grooming days.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-6 max-w-xl text-base leading-7 text-[#3A2A22]/65 sm:text-lg"
          >
            A warm, practical website direction for Diamonds &apos;n the Ruff,
            designed to make services, location details, and appointment requests
            easy to find.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <button
              type="button"
              onClick={() => scrollTo("#contact")}
              className="group flex items-center gap-2 rounded-full bg-[#3A2A22] px-6 py-3 text-sm font-medium text-[#F8F1E5] transition-colors hover:bg-[#543D31]"
            >
              Request an Appointment
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo("#services")}
              className="rounded-full border border-[#B9936E] px-6 py-3 text-sm font-medium text-[#3A2A22] transition-colors hover:bg-[#EAD8C1]"
            >
              View Services
            </button>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-5 text-xs text-[#A66F45]"
          >
            Service details and booking links shown as concept placeholders.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.75 }}
          className="relative"
        >
          <PhotoPlaceholder
            label="Hero photo placeholder"
            detail="Replace with a warm, high-quality photo of a freshly groomed dog."
            className="aspect-[4/5] min-h-[460px]"
          />
          <div className="absolute -bottom-5 -left-3 rounded-2xl border border-[#DFCDB7] bg-[#FFF9F0] p-4 shadow-xl sm:-left-7">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-[#DDBB91] text-[#3A2A22]">
                <Heart className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#3A2A22]">Comfort-first care</p>
                <p className="text-xs text-[#3A2A22]/55">Business message placeholder</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="about" ref={ref} className="bg-[#FFF9F0] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
          className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
        >
          <div>
            <motion.p
              variants={fadeUp}
              className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-[#A66F45]"
            >
              Local care
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-semibold leading-[1.1] tracking-tight text-[#3A2A22] sm:text-4xl lg:text-5xl"
            >
              A local grooming experience presented with warmth and clarity.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-base leading-7 text-[#3A2A22]/65"
            >
              Diamonds &apos;n the Ruff is a real local dog groomer. This concept
              shows how the business could introduce its approach, explain common
              services, share real work, and guide customers toward the right next
              step.
            </motion.p>
            <motion.ul variants={stagger} className="mt-8 space-y-3">
              {[
                "Clear grooming service descriptions",
                "Room for real before-and-after photos",
                "Easy-to-find location and contact details",
                "Simple appointment request path",
              ].map((item) => (
                <motion.li key={item} variants={fadeUp} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#3A2A22]">
                    <Check className="size-2.5 text-[#F8F1E5]" />
                  </span>
                  <span className="text-sm leading-6 text-[#3A2A22]/80">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <motion.div variants={fadeUp}>
            <PhotoPlaceholder
              label="About photo placeholder"
              detail="A real grooming-table, shop, or owner photo can make this section personal."
              className="aspect-[4/5]"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      id="services"
      ref={ref}
      className="border-y border-[#DFCDB7] bg-[#F2E4D1] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            className="mb-12 flex flex-col gap-5 sm:mb-16 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-[#A66F45]">
                Services
              </p>
              <h2 className="max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight text-[#3A2A22] sm:text-4xl lg:text-5xl">
                Grooming options that are easy to understand.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#3A2A22]/55 sm:text-right">
              Final service names, inclusions, and pricing should be confirmed by
              the business before launch.
            </p>
          </motion.div>

          <div className="grid gap-px overflow-hidden rounded-3xl border border-[#DFCDB7] bg-[#DFCDB7] sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <motion.article
                  key={service.name}
                  variants={fadeUp}
                  className="bg-[#FFF9F0] p-7 transition-colors hover:bg-[#F8F1E5]"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-[#DDBB91]/65 text-[#3A2A22]">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-[#3A2A22]">
                    {service.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#3A2A22]/60">
                    {service.description}
                  </p>
                </motion.article>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function PhotosSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="photos" ref={ref} className="bg-[#3A2A22] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10 sm:mb-12">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-[#DDBB91]">
              Recent grooms
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight text-[#F8F1E5] sm:text-4xl lg:text-5xl">
              Real photos can do the trust-building.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#F8F1E5]/55">
              This gallery is intentionally left as placeholders for approved
              before-and-after work, happy clients, and shop details.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              ["Before & after placeholder", "A transformation pair"],
              ["Fresh groom placeholder", "A finished client portrait"],
              ["Shop detail placeholder", "A clean workspace or product shot"],
              ["Happy dog placeholder", "A warm pickup-day photo"],
            ].map(([label, detail], index) => (
              <PhotoPlaceholder
                key={label}
                label={label}
                detail={detail}
                dark
                className={index === 0 ? "aspect-[4/5] sm:col-span-2 lg:col-span-1" : "aspect-[4/5]"}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function LocationSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="location" ref={ref} className="bg-[#FFF9F0] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
          className="grid overflow-hidden rounded-3xl border border-[#DFCDB7] bg-[#F8F1E5] lg:grid-cols-[1.1fr_0.9fr]"
        >
          <motion.div variants={fadeUp} className="p-7 sm:p-10 lg:p-14">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-[#A66F45]">
              Location
            </p>
            <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight text-[#3A2A22] sm:text-4xl">
              Make the next visit easy to plan.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#3A2A22]/60">
              The live site can place the confirmed address, phone number, service
              area, directions link, and current hours here.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoCard
                icon={MapPin}
                label="Address"
                value="Business address placeholder"
              />
              <InfoCard
                icon={Clock3}
                label="Hours"
                value="Current hours placeholder"
              />
              <InfoCard
                icon={Phone}
                label="Contact"
                value="Phone or text placeholder"
              />
              <InfoCard
                icon={PawPrint}
                label="Service area"
                value="Local area placeholder"
              />
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex min-h-80 items-center justify-center border-t border-[#DFCDB7] bg-[#DDBB91]/45 p-8 lg:border-l lg:border-t-0"
          >
            <div className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-[#A66F45]/30 bg-[#FFF9F0]/70 text-[#3A2A22]">
                <MapPin className="size-6" />
              </span>
              <p className="mt-5 text-sm font-semibold text-[#3A2A22]">
                Map placeholder
              </p>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[#3A2A22]/55">
                Replace with an embedded map or a branded directions panel after
                the location is confirmed.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[#DFCDB7] bg-[#FFF9F0] p-4">
      <div className="flex items-center gap-2 text-[#A66F45]">
        <Icon className="size-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-[#3A2A22]">{value}</p>
    </div>
  )
}

function FAQSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      id="faq"
      ref={ref}
      className="border-t border-[#DFCDB7] bg-[#F2E4D1] py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8 lg:gap-20">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-[#A66F45]"
          >
            FAQ
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-semibold leading-[1.1] tracking-tight text-[#3A2A22] sm:text-4xl lg:text-5xl"
          >
            Answer common questions before customers need to ask.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 text-sm leading-6 text-[#3A2A22]/60">
            These answers are concept copy and should be replaced with the
            business&apos;s confirmed policies.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
          className="divide-y divide-[#DFCDB7] border-y border-[#DFCDB7]"
        >
          {faqs.map((faq) => (
            <motion.details key={faq.question} variants={fadeUp} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[#3A2A22]">
                {faq.question}
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#B9936E] text-lg font-normal transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-2xl pt-4 text-sm leading-6 text-[#3A2A22]/60">
                {faq.answer}
              </p>
            </motion.details>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FinalCTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section id="contact" ref={ref} className="relative overflow-hidden bg-[#3A2A22] py-24 sm:py-32">
      <div className="absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A66F45]/20 blur-3xl" />
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={stagger}
        className="relative mx-auto max-w-3xl px-4 text-center sm:px-6"
      >
        <motion.p
          variants={fadeUp}
          className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-[#DDBB91]"
        >
          Appointment call to action
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="text-4xl font-semibold leading-[1.05] tracking-tight text-[#F8F1E5] sm:text-5xl lg:text-6xl"
        >
          Ready for a fresh groom?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#F8F1E5]/55"
        >
          The final site can connect this button to the business&apos;s preferred
          phone number, request form, or appointment platform.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="group flex items-center gap-2 rounded-full bg-[#F8F1E5] px-7 py-3.5 text-sm font-medium text-[#3A2A22] transition-colors hover:bg-white"
          >
            Booking link placeholder
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo("#services")}
            className="rounded-full border border-[#F8F1E5]/25 px-7 py-3.5 text-sm font-medium text-[#F8F1E5]/85 transition-colors hover:border-[#F8F1E5]/50 hover:text-[#F8F1E5]"
          >
            Review Services
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}

function PhotoPlaceholder({
  label,
  detail,
  className = "",
  dark = false,
}: {
  label: string
  detail: string
  className?: string
  dark?: boolean
}) {
  return (
    <div
      className={`relative flex min-h-64 items-center justify-center overflow-hidden rounded-3xl border ${
        dark
          ? "border-[#F8F1E5]/15 bg-[#F8F1E5]/5"
          : "border-[#DFCDB7] bg-[#EAD8C1]"
      } ${className}`}
    >
      <div
        aria-hidden
        className={`absolute inset-0 opacity-35 ${
          dark
            ? "bg-[radial-gradient(circle_at_top_left,#DDBB91_0,transparent_42%)]"
            : "bg-[radial-gradient(circle_at_top_left,#FFF9F0_0,transparent_48%)]"
        }`}
      />
      <div className="relative max-w-xs px-6 text-center">
        <span
          className={`mx-auto flex size-12 items-center justify-center rounded-full border ${
            dark
              ? "border-[#F8F1E5]/20 bg-[#F8F1E5]/10 text-[#DDBB91]"
              : "border-[#A66F45]/25 bg-[#FFF9F0]/60 text-[#3A2A22]"
          }`}
        >
          <Camera className="size-5" />
        </span>
        <p
          className={`mt-5 text-sm font-semibold ${
            dark ? "text-[#F8F1E5]" : "text-[#3A2A22]"
          }`}
        >
          {label}
        </p>
        <p
          className={`mt-2 text-xs leading-5 ${
            dark ? "text-[#F8F1E5]/45" : "text-[#3A2A22]/55"
          }`}
        >
          {detail}
        </p>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#3A2A22] pb-24 pt-14 lg:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#F8F1E5] text-[#3A2A22]">
                <PawPrint className="size-4" />
              </span>
              <span className="text-sm font-semibold text-[#F8F1E5]">
                Diamonds &apos;n the Ruff
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#F8F1E5]/45">
              Local dog grooming concept with service, photo, location, FAQ, and
              appointment sections.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[#F8F1E5]/45">
              Navigate
            </p>
            <nav className="space-y-2.5">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => scrollTo(link.href)}
                  className="block text-sm text-[#F8F1E5]/55 transition-colors hover:text-[#F8F1E5]"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[#F8F1E5]/45">
              Created by
            </p>
            <p className="mb-4 text-sm leading-6 text-[#F8F1E5]/55">
              Concept preview created by Mountline Studio.
            </p>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full bg-[#DDBB91] px-4 py-2.5 text-xs font-medium text-[#3A2A22] transition-colors hover:bg-[#E8CAA6]"
            >
              Visit Mountline
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-[#F8F1E5]/30 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Concept only. This is not Diamonds &apos;n the Ruff&apos;s current
            official website.
          </p>
          <p>© {new Date().getFullYear()} Mountline Studio</p>
        </div>
      </div>
    </footer>
  )
}

function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-white/10 bg-[#3A2A22]/95 px-4 py-3 backdrop-blur-sm lg:hidden">
      <button
        type="button"
        onClick={() => scrollTo("#location")}
        className="flex-1 rounded-full border border-white/20 py-3 text-center text-sm font-medium text-[#F8F1E5]/80"
      >
        Location
      </button>
      <button
        type="button"
        onClick={() => scrollTo("#contact")}
        className="flex-[2] rounded-full bg-[#F8F1E5] py-3 text-sm font-medium text-[#3A2A22]"
      >
        Request Appointment
      </button>
    </div>
  )
}

export function PetGroomingDemo() {
  return (
    <div className="bg-[#F8F1E5] font-sans">
      <ConceptNotice />
      <Header />

      <main className="pt-16 sm:pt-18">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <PhotosSection />
        <LocationSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      <Footer />
      <MobileStickyCTA />
    </div>
  )
}
