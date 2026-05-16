"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How long does a website take?",
    answer: "Most starter sites launch in about 1-2 weeks once content is ready. More complex business sites may take 2-3 weeks depending on pages and features."
  },
  {
    question: "Do I need a domain already?",
    answer: "No. Northline can help point an existing domain or guide the setup for a new one. We work with common registrars like GoDaddy, Namecheap, and Google Domains."
  },
  {
    question: "Can Northline redesign an existing site?",
    answer: "Yes. We can clean up outdated, confusing, or slow websites and rebuild them into something more useful. We audit your current site first to understand what works and what needs to change."
  },
  {
    question: "Can you add booking, payments, or forms?",
    answer: "Yes, depending on scope. We can prepare or connect tools like Calendly, Stripe, Square, and form systems. The level of integration depends on the package and your specific needs."
  },
  {
    question: "Do you offer monthly support?",
    answer: "Yes. Monthly care plans are available for updates, small changes, new photos, basic checks, and priority fixes. This is ideal for businesses that want their site maintained without having to think about it."
  },
  {
    question: "What does the client need to provide?",
    answer: "Usually business details, services, logo if available, photos, contact info, and any examples of sites you like. We guide you through what is needed during the onboarding call."
  },
  {
    question: "What if I need something custom?",
    answer: "If your project needs something outside the standard packages, we can discuss a custom scope. Just reach out and we will figure out the right approach together."
  }
]

export function FAQSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="faq" ref={ref} className="py-20 sm:py-24 bg-stone-50">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-slate-600">
            Common questions about working with Northline Services.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-slate-100 last:border-0"
              >
                <AccordionTrigger className="text-left text-slate-900 hover:text-slate-700 px-6 py-5 text-base font-medium transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 px-6 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-10"
        >
          <p className="text-slate-500 text-sm mb-3">
            Still have questions?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            Get in touch
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
