"use client"

import { motion } from "framer-motion"
import { HelpCircle } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How long does a website take?",
    answer: "Most starter sites can be launched in about 7-14 days once content is ready. More complex business sites may take 2-3 weeks depending on the number of pages and features.",
  },
  {
    question: "Do we need a domain already?",
    answer: "No. Northline can help point an existing domain or guide the setup for a new one. We work with common registrars like GoDaddy, Namecheap, and Google Domains.",
  },
  {
    question: "Can Northline redesign an existing site?",
    answer: "Yes. We can clean up outdated, confusing, or slow websites and rebuild them into something more useful. We will audit your current site first to understand what is working and what needs to change.",
  },
  {
    question: "Can you add booking, payments, or forms?",
    answer: "Yes, depending on scope. We can prepare or connect tools like Calendly, Stripe, Square, and form systems. The level of integration depends on the package and your specific needs.",
  },
  {
    question: "Do you offer monthly support?",
    answer: "Yes. Monthly care plans are available for updates, small changes, new photos, basic checks, and priority fixes. This is ideal for businesses that want their site maintained without having to think about it.",
  },
  {
    question: "What does the client need to provide?",
    answer: "Usually business details, services, logo if available, photos, contact info, and any examples of sites you like. We will guide you through what is needed during the onboarding call.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="relative py-32 md:py-40 px-6 overflow-hidden" style={{ backgroundColor: "#09090B" }}>
      {/* Subtle gradient overlay */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "25%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, transparent 100%)",
        }}
      />

      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 mb-6"
          >
            <HelpCircle className="w-4 h-4 text-northline-accent" />
            <span className="text-sm text-zinc-400">Common questions</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl text-white mb-6"
            style={{
              letterSpacing: "-0.0325em",
              fontVariationSettings: '"opsz" 28',
              fontWeight: 538,
              lineHeight: 1.1,
            }}
          >
            Frequently asked questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-zinc-400 text-lg"
          >
            Common questions about working with Northline Services.
          </motion.p>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-2"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-zinc-800/50 last:border-0 px-4"
              >
                <AccordionTrigger className="text-left text-white hover:text-northline-accent-light py-5 text-base font-medium transition-colors [&[data-state=open]]:text-northline-accent-light">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-zinc-500 text-sm mb-4">
            Still have questions?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-white hover:text-northline-accent-light transition-colors text-sm font-medium"
          >
            Get in touch
            <span className="text-northline-accent">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
