"use client"

import { motion } from "framer-motion"
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
    <section id="faq" className="relative py-40 px-6" style={{ backgroundColor: "#09090B" }}>
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
        }}
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
            transition={{ duration: 0.6, delay: 0.1 }}
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
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-zinc-800"
              >
                <AccordionTrigger className="text-left text-white hover:text-zinc-300 py-6 text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Additional CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-zinc-400 mb-4">Still have questions?</p>
          <a
            href="#contact"
            className="inline-flex px-5 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors text-sm"
          >
            Get in touch
          </a>
        </motion.div>
      </div>
    </section>
  )
}
