"use client"

import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ConceptBuild {
  title: string
  category: string
  description: string
  tags: string[]
  href: string
  previewSrc: string
  previewAlt: string
}

const conceptBuilds: ConceptBuild[] = [
  {
    title: "Summit Auto Detail",
    category: "Auto Detailing — Full Website",
    description:
      "Service packages, ceramic protection, gallery with category filters, online booking form, and customer reviews — built for a mobile detailing business in DFW.",
    tags: ["Booking", "Gallery", "Packages", "Contact form"],
    href: "/work/auto-detailing",
    previewSrc: "/work-previews/auto-detailing.jpg",
    previewAlt: "Summit Auto Detail website preview",
  },
  {
    title: "Ironwood Barber Co.",
    category: "Barbershop — Full Website",
    description:
      "Service menu, team profiles, two-location layout, retail products, and an appointment booking flow — built as a concept for a premium local barbershop.",
    tags: ["Appointments", "Team", "Locations", "Retail"],
    href: "/work/barber-shop",
    previewSrc: "/work-previews/barber-shop.jpg",
    previewAlt: "Ironwood Barber Co. website preview",
  },
]

export function WorkSection() {
  return (
    <section id="work" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-muted-foreground tracking-wide uppercase mb-4"
          >
            <span className="w-8 h-px bg-border" />
            Work
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] max-w-3xl mb-6"
          >
            Concept builds for
            <br />
            <span className="text-muted-foreground/60">real businesses.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl"
          >
            Sample directions that show the kind of online presence Mountline can create for your business.
          </motion.p>
        </div>

        {/* Work grid — two prominent cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {conceptBuilds.map((build, index) => (
            <motion.div
              key={build.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="group"
            >
              <Link href={build.href} className="block h-full">
                <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1 h-full flex flex-col">

                  {/* Screenshot preview */}
                  <div className="relative overflow-hidden aspect-[16/10] bg-muted shrink-0">
                    <Image
                      src={build.previewSrc}
                      alt={build.previewAlt}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority={index === 0}
                    />
                    {/* Subtle bottom fade so it bleeds into the card */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
                    {/* Concept badge */}
                    <span className="absolute top-3 left-3 text-[10px] font-medium text-muted-foreground bg-background/90 backdrop-blur-sm border border-border px-2 py-1 rounded-full">
                      Concept
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">
                          {build.category}
                        </p>
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-foreground/90 leading-tight">
                          {build.title}
                        </h3>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                      {build.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {build.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Have a similar business? Let&apos;s build something like this for you.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-foreground font-medium hover:text-accent transition-colors group"
          >
            Start a project
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </motion.div>

      </div>
    </section>
  )
}
