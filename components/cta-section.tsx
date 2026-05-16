"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CtaSection() {
  return (
    <section className="relative py-32 bg-foreground overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-background mb-6">
            Ready to build something<br />extraordinary?
          </h2>
          <p className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto mb-10">
            Let&apos;s discuss your project and explore how we can help bring your vision to life with precision and craft.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 px-8 h-12 text-base font-medium"
            >
              <Link href="#contact">
                Start a Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-background/30 text-background hover:bg-background/10 px-8 h-12 text-base font-medium"
            >
              <Link href="#work">
                View Our Work
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
