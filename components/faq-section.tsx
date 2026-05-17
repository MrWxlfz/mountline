"use client"

import { motion } from "framer-motion"
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
    answer: "Most starter sites launch in 7-14 days once content is ready. More complex business sites may take 2-3 weeks depending on pages and features."
  },
  {
    question: "Do we need a domain already?",
    answer: "No. Mountline can help point an existing domain or guide the setup for a new one. We work with common registrars like GoDaddy, Namecheap, and Google Domains."
  },
  {
    question: "Can Mountline redesign our current site?",
    answer: "Yes. We can clean up outdated, confusing, or slow websites and rebuild them into something more useful. We audit your current site first to understand what works and what needs to change."
  },
  {
    question: "Can you add booking, payments, or quote forms?",
    answer: "Yes, depending on scope. We can prepare or connect tools like Calendly, Stripe, Square, and form systems. The level of integration depends on the package and your specific needs."
  },
  {
    question: "What are AI systems?",
    answer: "Practical automations that help with repetitive tasks - like organizing quote requests, drafting follow-up emails, routing appointments, or connecting forms to spreadsheets. No hype, just useful tools."
  },
  {
    question: "Do you offer monthly support?",
    answer: "Yes. Monthly care plans are available for updates, small changes, new photos, basic checks, and priority fixes. This is ideal for businesses that want their site maintained without having to think about it."
  },
]

export function FAQSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section id="faq" className="py-24 lg:py-32 bg-[#fafafa]">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-black/30 tracking-wide uppercase mb-4"
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight leading-[1.1]"
          >
            Common questions
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-black/[0.08]"
              >
                <AccordionTrigger className="text-left text-black hover:text-black/70 py-5 text-base font-medium transition-colors [&[data-state=open]]:text-black">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-black/55 pb-5 leading-relaxed text-[15px]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <p className="text-black/40 text-sm mb-4">Still have questions?</p>
          <button
            onClick={() => scrollToSection('contact')}
            className="group inline-flex items-center gap-2 text-black hover:text-black/70 transition-colors font-medium"
          >
            Get in touch
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
