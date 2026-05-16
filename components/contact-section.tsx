"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Send, Loader2 } from "lucide-react"

const budgetOptions = [
  "Under $300",
  "$300-$750",
  "$750-$1,500",
  "$1,500+",
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
    // For now, simulate a successful submission
    setTimeout(() => {
      setFormState("success")
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (formState === "success") {
    return (
      <section id="contact" className="relative py-32 md:py-40 px-6" style={{ backgroundColor: "#09090B" }}>
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-3xl p-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
              className="w-20 h-20 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-8"
            >
              <Check className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <h3 className="text-2xl text-white font-medium mb-4">Request received</h3>
            <p className="text-zinc-400 mb-8">
              The Northline team will review it and get back to you within 24-48 hours.
            </p>
            <button
              onClick={() => setFormState("idle")}
              className="text-sm text-northline-accent hover:text-northline-accent-light transition-colors"
            >
              Submit another request
            </button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="relative py-32 md:py-40 px-6 overflow-hidden" style={{ backgroundColor: "#09090B" }}>
      {/* Subtle gradient overlay */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "25%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, transparent 100%)",
        }}
      />
      
      {/* Decorative glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-northline-accent/5 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-sm font-medium tracking-widest text-northline-accent uppercase mb-4"
          >
            Get Started
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl text-white mb-6"
            style={{
              letterSpacing: "-0.0325em",
              fontVariationSettings: '"opsz" 28',
              fontWeight: 538,
              lineHeight: 1.1,
            }}
          >
            Request a free audit
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-zinc-400 text-lg"
          >
            Send a few details and the Northline team will review what can be improved.
          </motion.p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-3xl p-8 md:p-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm text-zinc-300 mb-2 font-medium">
                Name <span className="text-zinc-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-northline-accent/50 focus:ring-1 focus:ring-northline-accent/20 transition-all"
                placeholder="Your name"
              />
            </div>

            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm text-zinc-300 mb-2 font-medium">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-northline-accent/50 focus:ring-1 focus:ring-northline-accent/20 transition-all"
                placeholder="Your business"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm text-zinc-300 mb-2 font-medium">
                Email <span className="text-zinc-600">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-northline-accent/50 focus:ring-1 focus:ring-northline-accent/20 transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm text-zinc-300 mb-2 font-medium">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-northline-accent/50 focus:ring-1 focus:ring-northline-accent/20 transition-all"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Current Website */}
          <div className="mb-5">
            <label htmlFor="currentWebsite" className="block text-sm text-zinc-300 mb-2 font-medium">
              Current Website <span className="text-zinc-600">(if any)</span>
            </label>
            <input
              type="url"
              id="currentWebsite"
              name="currentWebsite"
              value={formData.currentWebsite}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-northline-accent/50 focus:ring-1 focus:ring-northline-accent/20 transition-all"
              placeholder="https://..."
            />
          </div>

          {/* Budget */}
          <div className="mb-5">
            <label htmlFor="budget" className="block text-sm text-zinc-300 mb-2 font-medium">
              Budget Range
            </label>
            <select
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:border-northline-accent/50 focus:ring-1 focus:ring-northline-accent/20 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900">Select a range...</option>
              {budgetOptions.map((option) => (
                <option key={option} value={option} className="bg-zinc-900">
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Help Needed */}
          <div className="mb-8">
            <label htmlFor="helpNeeded" className="block text-sm text-zinc-300 mb-2 font-medium">
              What can Northline help with?
            </label>
            <textarea
              id="helpNeeded"
              name="helpNeeded"
              rows={4}
              value={formData.helpNeeded}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-northline-accent/50 focus:ring-1 focus:ring-northline-accent/20 transition-all resize-none"
              placeholder="Tell us about your project, goals, or any questions..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={formState === "submitting"}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white text-zinc-900 rounded-xl font-medium hover:bg-zinc-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {formState === "submitting" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Request
              </>
            )}
          </button>
        </motion.form>
      </div>
    </section>
  )
}
