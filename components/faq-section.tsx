"use client"

import { motion, useInView } from "framer-motion"
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
    answer: "No. northline can help point an existing domain or guide the setup for a new one. We work with common registrars like GoDaddy, Namecheap, and Google Domains."
  },
  {
    question: "Can northline redesign an existing site?",
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="faq" ref={ref} className="py-24 sm:py-32 bg-muted/30 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-border-strong" />
            <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              FAQ
            </span>
            <span className="w-8 h-px bg-border-strong" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Common questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about working with northline.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-border last:border-0"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-accent px-6 py-5 text-base font-medium transition-colors [&[data-state=open]]:text-accent">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-6 pb-5 leading-relaxed">
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
          <p className="text-muted-foreground text-sm mb-4">
            Still have questions?
          </p>
          <motion.button
            onClick={() => scrollToSection('contact')}
            className="group inline-flex items-center gap-2 text-foreground hover:text-accent transition-colors font-medium"
            whileHover={{ x: 4 }}
          >
            Get in touch
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
