"use client"

import { useState } from "react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check, Send, Loader2, Mail, Sparkles } from "lucide-react"

const budgetOptions = [
  "Under $500",
  "$500-$1,000",
  "$1,000-$2,000",
  "$2,000+",
  "Not sure yet",
]

export function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
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
      <section id="contact" ref={ref} className="py-24 sm:py-32 section-default">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="card-premium p-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-8 h-8 text-emerald-500" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Request received</h3>
            <p className="text-muted-foreground mb-6">
              The northline team will review it and get back to you within 24-48 hours.
            </p>
            <button
              onClick={() => setFormState("idle")}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Submit another request
            </button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" ref={ref} className="py-24 sm:py-32 section-default">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <Mail className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Contact</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Request a free website review
          </h2>
          <p className="text-lg text-muted-foreground">
            Share a few details and the northline team will review what can be improved.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="card-premium p-6 sm:p-8"
        >
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
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
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
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                placeholder="Your business"
              />
            </div>

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
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm text-foreground font-medium">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Current Website */}
          <div className="mb-5 space-y-2">
            <label htmlFor="currentWebsite" className="block text-sm text-foreground font-medium">
              Current Website <span className="text-muted-foreground">(if any)</span>
            </label>
            <input
              type="url"
              id="currentWebsite"
              name="currentWebsite"
              value={formData.currentWebsite}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
              placeholder="https://..."
            />
          </div>

          {/* Budget */}
          <div className="mb-5 space-y-2">
            <label htmlFor="budget" className="block text-sm text-foreground font-medium">
              Budget Range
            </label>
            <select
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all appearance-none cursor-pointer"
            >
              <option value="">Select a range...</option>
              {budgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Help Needed */}
          <div className="mb-6 space-y-2">
            <label htmlFor="helpNeeded" className="block text-sm text-foreground font-medium">
              What can northline help with?
            </label>
            <textarea
              id="helpNeeded"
              name="helpNeeded"
              rows={4}
              value={formData.helpNeeded}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all resize-none"
              placeholder="Tell us about your project, goals, or any questions..."
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={formState === "submitting"}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {formState === "submitting" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Send Request
              </>
            )}
          </motion.button>
        </motion.form>
      </div>
    </section>
  )
}
