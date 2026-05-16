"use client"

import { useState } from "react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check, Loader2, ArrowRight, Send } from "lucide-react"

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
      <section id="contact" ref={ref} className="py-24 sm:py-32 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="p-10 rounded-2xl border border-border bg-card"
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
    <section id="contact" ref={ref} className="py-24 sm:py-32 bg-background relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-accent" />
              <span className="text-sm font-medium text-accent tracking-wide uppercase">
                Get Started
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6">
              Request a free website review.
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Share a few details about your business and current site. The northline team will review what can be improved and get back to you within 24-48 hours.
            </p>
            
            {/* What to expect */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Share your details</p>
                  <p className="text-sm text-muted-foreground">Tell us about your business and current website.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Get a review</p>
                  <p className="text-sm text-muted-foreground">We will look at your site and identify what can improve.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Discuss next steps</p>
                  <p className="text-sm text-muted-foreground">We will share recommendations and quote if needed.</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right - Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-2xl border border-border bg-card"
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
            </div>

            {/* Business Name */}
            <div className="mb-5 space-y-2">
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
                placeholder="Your business name"
              />
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
                placeholder="Tell us about your project or questions..."
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={formState === "submitting"}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-foreground text-background py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {formState === "submitting" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Request
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
