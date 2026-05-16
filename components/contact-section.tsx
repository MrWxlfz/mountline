"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

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
      <section id="contact" className="relative py-40 px-6" style={{ backgroundColor: "#09090B" }}>
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-2xl text-white font-medium mb-4">Request received</h3>
            <p className="text-zinc-400">
              The Northline team will review it and get back to you soon.
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="relative py-40 px-6" style={{ backgroundColor: "#09090B" }}>
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
        }}
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
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
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm text-zinc-300 mb-2">
                Name <span className="text-zinc-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="Your name"
              />
            </div>

            {/* Business name */}
            <div>
              <label htmlFor="businessName" className="block text-sm text-zinc-300 mb-2">
                Business name <span className="text-zinc-500">*</span>
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                required
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="Your business"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm text-zinc-300 mb-2">
                Email <span className="text-zinc-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm text-zinc-300 mb-2">
                Phone <span className="text-zinc-600">(optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Current website */}
          <div className="mb-6">
            <label htmlFor="currentWebsite" className="block text-sm text-zinc-300 mb-2">
              Current website <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              type="url"
              id="currentWebsite"
              name="currentWebsite"
              value={formData.currentWebsite}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="https://yourbusiness.com"
            />
          </div>

          {/* Help needed */}
          <div className="mb-6">
            <label htmlFor="helpNeeded" className="block text-sm text-zinc-300 mb-2">
              What do you need help with? <span className="text-zinc-500">*</span>
            </label>
            <textarea
              id="helpNeeded"
              name="helpNeeded"
              required
              rows={4}
              value={formData.helpNeeded}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
              placeholder="Describe what you are looking for..."
            />
          </div>

          {/* Budget range */}
          <div className="mb-8">
            <label htmlFor="budget" className="block text-sm text-zinc-300 mb-2">
              Budget range <span className="text-zinc-500">*</span>
            </label>
            <select
              id="budget"
              name="budget"
              required
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="" disabled className="text-zinc-600">Select a range</option>
              {budgetOptions.map((option) => (
                <option key={option} value={option} className="bg-zinc-900">
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={formState === "submitting"}
            className="w-full py-4 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formState === "submitting" ? "Sending..." : "Request free audit"}
          </button>
        </motion.form>
      </div>
    </section>
  )
}
