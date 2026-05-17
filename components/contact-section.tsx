"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Loader2, Check } from "lucide-react"
import { submitLead, type LeadFormData } from "@/app/actions/submit-lead"

const budgetOptions = [
  { value: "under-2k", label: "Under $2,000" },
  { value: "2k-5k", label: "$2,000 – $5,000" },
  { value: "5k-10k", label: "$5,000 – $10,000" },
  { value: "10k-plus", label: "$10,000+" },
  { value: "not-sure", label: "Not sure yet" },
]

const serviceOptions = [
  { value: "new-website", label: "New Website" },
  { value: "redesign", label: "Website Redesign" },
  { value: "landing-page", label: "Landing Page" },
  { value: "ai-systems", label: "AI Systems" },
  { value: "ongoing-care", label: "Ongoing Care" },
  { value: "other", label: "Something Else" },
]

export function ContactSection() {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    business_name: "",
    email: "",
    phone: "",
    current_website: "",
    service_needed: "",
    budget_range: "",
    message: "",
  })
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formState === "error") {
      setFormState("idle")
      setErrorMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState("submitting")
    setErrorMessage(null)

    const result = await submitLead(formData)

    if (result.success) {
      setFormState("success")
      setFormData({
        name: "",
        business_name: "",
        email: "",
        phone: "",
        current_website: "",
        service_needed: "",
        budget_range: "",
        message: "",
      })
    } else {
      setFormState("error")
      setErrorMessage(result.error || "Something went wrong. Please try again.")
    }
  }

  return (
    <section id="contact" className="py-28 lg:py-36 bg-foreground/[0.02]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-4 text-sm font-medium text-foreground/50 tracking-wide uppercase mb-6"
          >
            <span className="w-10 h-px bg-foreground/15" />
            Start a project
            <span className="w-10 h-px bg-foreground/15" />
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-[1.05] mb-6"
          >
            Ready for a site
            <span className="text-foreground/35 block">people actually trust?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-foreground/50 max-w-lg mx-auto"
          >
            Tell us about your project and we&apos;ll get back to you within 24 hours 
            with a clear plan and honest quote.
          </motion.p>
        </div>
        
        <AnimatePresence mode="wait">
          {formState === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-full min-h-[480px] p-10 rounded-2xl border border-foreground/[0.06] bg-card text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
                className="w-20 h-20 rounded-full bg-foreground/[0.03] flex items-center justify-center mb-8"
              >
                <Check className="w-10 h-10 text-foreground" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Message sent!
              </h3>
              <p className="text-foreground/50 max-w-sm mb-8 text-base leading-relaxed">
                Thanks for reaching out. We&apos;ll review your project details and 
                get back to you within 24 hours.
              </p>
              <button
                onClick={() => setFormState("idle")}
                className="text-sm text-foreground/50 hover:text-foreground underline underline-offset-4 transition-colors"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="p-8 sm:p-10 rounded-2xl border border-foreground/[0.06] bg-card"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* Name */}
                <div className="space-y-2.5">
                  <label htmlFor="name" className="block text-sm text-foreground font-medium">
                    Name <span className="text-foreground/40">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-background border border-foreground/[0.08] rounded-xl text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground/20 transition-colors"
                    placeholder="Your name"
                  />
                </div>

                {/* Business Name */}
                <div className="space-y-2.5">
                  <label htmlFor="business_name" className="block text-sm text-foreground font-medium">
                    Business Name
                  </label>
                  <input
                    type="text"
                    id="business_name"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-background border border-foreground/[0.08] rounded-xl text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground/20 transition-colors"
                    placeholder="Your business name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* Email */}
                <div className="space-y-2.5">
                  <label htmlFor="email" className="block text-sm text-foreground font-medium">
                    Email <span className="text-foreground/40">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-background border border-foreground/[0.08] rounded-xl text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground/20 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2.5">
                  <label htmlFor="phone" className="block text-sm text-foreground font-medium">
                    Phone <span className="text-foreground/30">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-background border border-foreground/[0.08] rounded-xl text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground/20 transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Current Website */}
              <div className="mb-6 space-y-2.5">
                <label htmlFor="current_website" className="block text-sm text-foreground font-medium">
                  Current Website <span className="text-foreground/30">(optional)</span>
                </label>
                <input
                  type="url"
                  id="current_website"
                  name="current_website"
                  value={formData.current_website}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-background border border-foreground/[0.08] rounded-xl text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground/20 transition-colors"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* Service Needed */}
                <div className="space-y-2.5">
                  <label htmlFor="service_needed" className="block text-sm text-foreground font-medium">
                    What do you need?
                  </label>
                  <select
                    id="service_needed"
                    name="service_needed"
                    value={formData.service_needed}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-background border border-foreground/[0.08] rounded-xl text-foreground focus:outline-none focus:border-foreground/20 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select a service</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div className="space-y-2.5">
                  <label htmlFor="budget_range" className="block text-sm text-foreground font-medium">
                    Budget Range
                  </label>
                  <select
                    id="budget_range"
                    name="budget_range"
                    value={formData.budget_range}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-background border border-foreground/[0.08] rounded-xl text-foreground focus:outline-none focus:border-foreground/20 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select a range</option>
                    {budgetOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="mb-8 space-y-2.5">
                <label htmlFor="message" className="block text-sm text-foreground font-medium">
                  Tell us about your project
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-background border border-foreground/[0.08] rounded-xl text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground/20 transition-colors resize-none"
                  placeholder="What are your goals? Any specific features or timeline?"
                />
              </div>

              {/* Error message */}
              {formState === "error" && errorMessage && (
                <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={formState === "submitting"}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-foreground text-background py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {formState === "submitting" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send message
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
