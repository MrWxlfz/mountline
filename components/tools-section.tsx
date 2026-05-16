"use client"

import { motion } from "framer-motion"

const tools = [
  "Google Business Profile",
  "Google Analytics",
  "Calendly",
  "Stripe",
  "Square",
  "Shopify",
  "Gmail",
  "Google Sheets",
  "Mailchimp",
  "GoDaddy",
  "Namecheap",
  "Vercel",
  "Zapier",
  "Notion",
]

export function ToolsSection() {
  return (
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-muted-foreground tracking-wide uppercase mb-4"
          >
            Integrations
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-6"
          >
            Works with tools businesses already use.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Depending on scope, Northline can prepare or connect your site with the tools already used to run the business.
          </motion.p>
        </div>
        
        {/* Tools grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {tools.map((tool, index) => (
            <motion.span
              key={tool}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.03 }}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:border-foreground/20 transition-colors"
            >
              {tool}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
