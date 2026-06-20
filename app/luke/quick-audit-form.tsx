"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { submitLead } from "@/app/actions/submit-lead"

type FormState = "idle" | "submitting" | "success" | "error"

const initialForm = {
  name: "",
  businessName: "",
  website: "",
  improvement: "",
  email: "",
  phone: "",
}

export function QuickAuditForm() {
  const [form, setForm] = useState(initialForm)
  const [formState, setFormState] = useState<FormState>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))

    if (formState === "error") {
      setFormState("idle")
      setErrorMessage("")
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormState("submitting")
    setErrorMessage("")

    const result = await submitLead({
      name: form.name.trim(),
      business_name: form.businessName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      current_website: form.website.trim(),
      service_needed: "free-quick-audit",
      message: form.improvement.trim(),
      source: "luke_qr_page",
    })

    if (result.success) {
      setForm(initialForm)
      setFormState("success")
      return
    }

    setFormState("error")
    setErrorMessage(result.error || "The request could not be sent. Please email Mountline instead.")
  }

  if (formState === "success") {
    return (
      <div
        className="border border-white/12 bg-black/45 p-5 sm:p-6"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="size-6 text-white" />
        <h3 className="mt-4 text-lg font-semibold text-white">Quick audit requested.</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Luke will review the details and reply with a few practical improvements.
        </p>
        <button
          type="button"
          onClick={() => setFormState("idle")}
          className="mt-5 text-sm font-medium text-zinc-300 underline underline-offset-4 transition-colors hover:text-white"
        >
          Send another business
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-white/12 bg-black/45 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="audit-name"
          label="Your name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          autoComplete="name"
          required
        />
        <FormField
          id="audit-business"
          label="Business name"
          name="businessName"
          value={form.businessName}
          onChange={handleChange}
          placeholder="Business name"
          autoComplete="organization"
          required
        />
      </div>

      <div className="mt-4">
        <FormField
          id="audit-website"
          label="Website or Instagram"
          name="website"
          value={form.website}
          onChange={handleChange}
          placeholder="mountline.dev or @business"
          autoComplete="url"
          required
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="audit-improvement"
          className="mb-2 block text-xs font-medium text-zinc-300"
        >
          What should be improved? <span className="text-zinc-600">(optional)</span>
        </label>
        <textarea
          id="audit-improvement"
          name="improvement"
          rows={3}
          value={form.improvement}
          onChange={handleChange}
          placeholder="Website, quote flow, booking, follow-up..."
          className="w-full resize-none border border-white/10 bg-black px-3.5 py-3 text-base text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-white/30"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormField
          id="audit-email"
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@business.com"
          autoComplete="email"
          required
        />
        <FormField
          id="audit-phone"
          label="Phone (optional)"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone number"
          autoComplete="tel"
        />
      </div>

      {formState === "error" ? (
        <p className="mt-4 text-sm leading-6 text-red-300" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={formState === "submitting"}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {formState === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending request
          </>
        ) : (
          <>
            Request quick audit
            <ArrowRight className="size-4" />
          </>
        )}
      </button>

      <p className="mt-3 text-center text-[11px] leading-5 text-zinc-600">
        Email is required by Mountline&apos;s current lead system. No mailing list.
      </p>
    </form>
  )
}

function FormField({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  required = false,
}: {
  id: string
  label: string
  name: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  type?: "text" | "email" | "tel"
  autoComplete?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-medium text-zinc-300">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="min-h-12 w-full border border-white/10 bg-black px-3.5 py-3 text-base text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-white/30"
      />
    </div>
  )
}
