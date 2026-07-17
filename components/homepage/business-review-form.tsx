"use client"

import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent, ReactNode } from "react"
import { ArrowRight, Check, ChevronDown, Loader2 } from "lucide-react"
import { submitLead, type LeadFormData } from "@/app/actions/submit-lead"
import { reviewOptions } from "@/lib/homepage-content"
import { reviewEventName } from "@/lib/review-interest"

type FormState = "idle" | "submitting" | "success" | "error"

function isReviewOption(value: string) {
  return reviewOptions.some((option) => option.value === value)
}

function createEmptyForm(defaultInterest = ""): LeadFormData {
  return {
    name: "",
    business_name: "",
    email: "",
    phone: "",
    current_website: "",
    service_needed: isReviewOption(defaultInterest) ? defaultInterest : "",
    message: "",
    source: "website",
  }
}

export function BusinessReviewForm({ defaultInterest = "" }: { defaultInterest?: string }) {
  const [formData, setFormData] = useState<LeadFormData>(() => createEmptyForm(defaultInterest))
  const [formState, setFormState] = useState<FormState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    function applyInterest(value: string | null | undefined) {
      if (!value || !isReviewOption(value)) return
      setFormData((current) => ({ ...current, service_needed: value }))
    }

    function captureHashInterest() {
      applyInterest(window.location.hash.replace("#review-", ""))
    }

    function captureReviewEvent(event: Event) {
      applyInterest((event as CustomEvent<string>).detail)
      try {
        window.sessionStorage.removeItem("mountline-review-interest")
      } catch {
        // Storage is only a navigation fallback.
      }
    }

    const hashInterest = window.location.hash.replace("#review-", "")

    try {
      const storedInterest = window.sessionStorage.getItem("mountline-review-interest")
      if (isReviewOption(hashInterest)) {
        applyInterest(hashInterest)
      } else if (!isReviewOption(defaultInterest)) {
        applyInterest(storedInterest)
      }
      window.sessionStorage.removeItem("mountline-review-interest")
    } catch {
      applyInterest(hashInterest)
    }

    window.addEventListener("hashchange", captureHashInterest)
    window.addEventListener(reviewEventName, captureReviewEvent)

    return () => {
      window.removeEventListener("hashchange", captureHashInterest)
      window.removeEventListener(reviewEventName, captureReviewEvent)
    }
  }, [defaultInterest])

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))

    if (formState === "error") {
      setFormState("idle")
      setErrorMessage(null)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormState("submitting")
    setErrorMessage(null)

    try {
      const result = await submitLead(formData)

      if (result.success) {
        setFormData(createEmptyForm(defaultInterest))
        setFormState("success")
        return
      }

      setFormState("error")
      setErrorMessage(result.error || "The review request could not be sent. Please try again.")
    } catch {
      setFormState("error")
      setErrorMessage("The review request could not be sent. Please check the connection and try again.")
    }
  }

  function resetForm() {
    const hashInterest = typeof window === "undefined" ? "" : window.location.hash.replace("#review-", "")
    setFormData(createEmptyForm(isReviewOption(hashInterest) ? hashInterest : defaultInterest))
    setFormState("idle")
    setErrorMessage(null)
  }

  if (formState === "success") {
    return (
      <div className="mtl-review-form mtl-review-success" role="status" aria-live="polite">
        <span className="mtl-success-icon"><Check className="size-5" aria-hidden="true" /></span>
        <p>Business review received</p>
        <h3>Mountline has what it needs to begin.</h3>
        <span>The details are saved. We’ll review what customers see and reply with the clearest useful next step.</span>
        <button type="button" onClick={resetForm}>Send another request</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mtl-review-form" aria-busy={formState === "submitting"}>
      <div className="mtl-form-heading">
        <p>A few details are enough</p>
        <h3>Tell us where to look.</h3>
      </div>

      <div className="mtl-form-grid">
        <FormField label="Your name" htmlFor="review-name" required>
          <input
            id="review-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mtl-form-control"
            placeholder="Your name"
          />
        </FormField>

        <FormField label="Business name" htmlFor="review-business" required>
          <input
            id="review-business"
            name="business_name"
            type="text"
            autoComplete="organization"
            required
            value={formData.business_name}
            onChange={handleChange}
            className="mtl-form-control"
            placeholder="Business name"
          />
        </FormField>

        <FormField label="Website, Google listing, or social page" htmlFor="review-website" optional>
          <input
            id="review-website"
            name="current_website"
            type="text"
            inputMode="url"
            value={formData.current_website}
            onChange={handleChange}
            className="mtl-form-control"
            placeholder="Paste a link if you have one"
          />
        </FormField>

        <FormField label="Best way to reach you" htmlFor="review-email" hint="Email" required>
          <input
            id="review-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mtl-form-control"
            placeholder="you@business.com"
          />
        </FormField>
      </div>

      <fieldset className="mtl-interest-fieldset">
        <legend>What should we look at?</legend>
        <div>
          {reviewOptions.map((option, index) => (
            <label key={option.value}>
              <input
                type="radio"
                name="service_needed"
                value={option.value}
                required={index === 0}
                checked={formData.service_needed === option.value}
                onChange={handleChange}
              />
              <span><i />{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <details className="mtl-form-more">
        <summary>
          Anything specific bothering you?
          <ChevronDown className="size-4" aria-hidden="true" />
        </summary>
        <div>
          <FormField label="Phone" htmlFor="review-phone" optional>
            <input
              id="review-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              className="mtl-form-control"
              placeholder="(817) 555-0123"
            />
          </FormField>
          <FormField label="Short note" htmlFor="review-message" optional>
            <textarea
              id="review-message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="mtl-form-control mtl-form-textarea"
              placeholder="A sentence or two is plenty."
            />
          </FormField>
        </div>
      </details>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="review-website-confirmation">Leave this field empty</label>
        <input
          id="review-website-confirmation"
          name="website_confirmation"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website_confirmation || ""}
          onChange={handleChange}
        />
      </div>

      <div className="mtl-form-submit">
        <div>
          <p>No giant commitment. We’ll recommend the smallest useful starting point.</p>
          <div aria-live="polite" className="mtl-form-status">
            {formState === "error" && errorMessage ? <p>{errorMessage}</p> : null}
          </div>
        </div>
        <button type="submit" disabled={formState === "submitting"}>
          {formState === "submitting" ? (
            <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending details</>
          ) : (
            <>Show us your business <ArrowRight className="size-4" aria-hidden="true" /></>
          )}
        </button>
      </div>
    </form>
  )
}

function FormField({
  label,
  htmlFor,
  required = false,
  optional = false,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  optional?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="mtl-form-field">
      <label htmlFor={htmlFor}>
        <span>{label}{required ? <i aria-hidden="true">*</i> : null}</span>
        {hint || optional ? <small>{hint || "Optional"}</small> : null}
      </label>
      {children}
    </div>
  )
}
