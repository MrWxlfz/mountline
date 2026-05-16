"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Loader2, ArrowRight } from "lucide-react"

const budgetOptions = [
  "Under $500",
  "$500-$1,250",
  "$1,250-$2,500",
  "$2,500+",
  "Not sure yet",
]

export function ContactSection() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle")
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    currentWebsite: "",
    helpNeeded: "",
    budget: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormState("submitting")
    
    // TODO: Connect to email service or form backend
    setTimeout(() => {
      setFormState("success")
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (formState === "success") {
    return (
      <section id="contact" className="py-24 lg:py-32 bg-muted/30">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="p-10 rounded-xl border border-border bg-card"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
              className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-8 h-8 text-foreground" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Request received</h3>
            <p className="text-muted-foreground mb-6">
              The northline team will review it and get back to you within 24-48 hours.
            </p>
            <button
              onClick={() => setFormState("idle")}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              Submit another request
            </button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-muted-foreground tracking-wide uppercase mb-4"
          >
            Contact
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] mb-6"
          >
            Ready for a site people actually trust?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Send a few details and the northline team will review your website, idea, or current online presence.
          </motion.p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto"
        >
          <div className="p-6 sm:p-8 rounded-xl border border-border bg-card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm text-foreground font-medium">
                  Name <span className="text-muted-foreground">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  placeholder="Your name"
                />
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <label htmlFor="businessName" className="block text-sm text-foreground font-medium">
                  Business Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  placeholder="Your business name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm text-foreground font-medium">
                  Email <span className="text-muted-foreground">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm text-foreground font-medium">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Current Website */}
            <div className="mb-5 space-y-2">
              <label htmlFor="currentWebsite" className="block text-sm text-foreground font-medium">
                Current Website <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="url"
                id="currentWebsite"
                name="currentWebsite"
                value={formData.currentWebsite}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                placeholder="https://..."
              />
            </div>

            {/* Help Needed */}
            <div className="mb-5 space-y-2">
              <label htmlFor="helpNeeded" className="block text-sm text-foreground font-medium">
                What do you need help with?
              </label>
              <textarea
                id="helpNeeded"
                name="helpNeeded"
                rows={4}
                value={formData.helpNeeded}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors resize-none"
                placeholder="Tell us about your project, goals, or questions..."
              />
            </div>

            {/* Budget */}
            <div className="mb-6 space-y-2">
              <label htmlFor="budget" className="block text-sm text-foreground font-medium">
                Budget Range
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-foreground/30 transition-colors appearance-none cursor-pointer"
              >
                <option value="">Select a range...</option>
                {budgetOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={formState === "submitting"}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-foreground text-background py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {formState === "submitting" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Request review
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </section>
  )
}
