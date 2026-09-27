"use client"

import { useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from "react"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { requestReceptionistPilot } from "@/app/actions/request-receptionist-pilot"
import { pilotIndustries, pilotRequestSchema, type PilotFieldErrors, type PilotRequestInput } from "@/lib/leads/validation"

export function PilotRequestForm() {
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<PilotFieldErrors>({})
  const [emailFallback, setEmailFallback] = useState("mailto:hello@mountline.dev?subject=Receptionist%20pilot%20request")
  const submitting = useRef(false)
  const successRef = useRef<HTMLDivElement>(null)

  // Check one field against the same schema the server uses.
  function fieldError(name: keyof PilotRequestInput, value: FormDataEntryValue | null) {
    const shape = pilotRequestSchema.shape[name]
    const result = shape.safeParse(typeof value === "string" ? value : "")
    return result.success ? undefined : result.error.issues[0]?.message
  }

  function validateOnBlur(event: FocusEvent<HTMLFormElement>) {
    const target: EventTarget = event.target
    if (!isField(target)) return
    const name = target.name as keyof PilotRequestInput
    if (!name || name === "website_confirmation" || !(name in pilotRequestSchema.shape)) return
    // Leave untouched empty fields alone until the visitor tries to send.
    if (!target.value.trim() && !fieldErrors[name]) return
    const message = fieldError(name, target.value)
    setFieldErrors((current) => (current[name] === message ? current : { ...current, [name]: message }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const parsed = pilotRequestSchema.safeParse(values)
    if (!parsed.success) {
      const errors: PilotFieldErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof PilotRequestInput
        if (field && !errors[field]) errors[field] = issue.message
      }
      setFieldErrors(errors)
      setError("Please check the highlighted details.")
      setState("error")
      form.querySelector<HTMLElement>(`[name="${Object.keys(errors)[0]}"]`)?.focus()
      return
    }

    submitting.current = true
    setState("saving")
    setFieldErrors({})
    setError(null)
    try {
      const result = await requestReceptionistPilot(parsed.data)
      if (!result.success) {
        setError(result.error)
        setFieldErrors(result.fieldErrors || {})
        setState("error")
        return
      }
      setState("success")
      window.requestAnimationFrame(() => successRef.current?.focus())
    } catch {
      setError("The connection was interrupted. Your details are still here; try again or email hello@mountline.dev.")
      setState("error")
    } finally {
      submitting.current = false
    }
  }

  if (state === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="ml-form__success">
        <Check aria-hidden="true" />
        <h3>Thanks. Your request is in.</h3>
        <p>We’ll read how your calls work today and email you about where a pilot could start. Nothing has been booked, and your phone service hasn’t changed.</p>
        <a className="ml-link" href="mailto:hello@mountline.dev?subject=Receptionist%20pilot%20request">Add something by email</a>
      </div>
    )
  }

  return (
    <form onSubmit={submit} onBlur={validateOnBlur} onChange={(event) => {
      const data = new FormData(event.currentTarget)
      // Clear a field's error as soon as it becomes valid.
      const target: EventTarget = event.target
      const name = isField(target) ? (target.name as keyof PilotRequestInput) : undefined
      if (name && isField(target) && fieldErrors[name] && !fieldError(name, target.value)) {
        const remaining = { ...fieldErrors, [name]: undefined }
        setFieldErrors(remaining)
        if (!Object.values(remaining).some(Boolean) && error === "Please check the highlighted details.") setError(null)
      }
      const body = ["Receptionist pilot request", `Name: ${data.get("name") || ""}`, `Business: ${data.get("business_name") || ""}`, `Email: ${data.get("email") || ""}`, `Phone: ${data.get("phone") || ""}`, `Business type: ${data.get("industry") || ""}`, "", `Current call handling / what needs to improve:\n${data.get("call_handling") || ""}`].join("\n")
      setEmailFallback(`mailto:hello@mountline.dev?subject=Receptionist%20pilot%20request&body=${encodeURIComponent(body)}`)
    }} noValidate aria-label="Request a receptionist pilot" aria-busy={state === "saving"}>
      <fieldset disabled={state === "saving"} className="ml-form">
        <Field name="name" label="Your name" error={fieldErrors.name}><input id="pilot-name" name="name" autoComplete="name" required maxLength={100} className="ml-input" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "pilot-name-error" : undefined} /></Field>
        <Field name="business_name" label="Business name" error={fieldErrors.business_name}><input id="pilot-business_name" name="business_name" autoComplete="organization" required maxLength={140} className="ml-input" aria-invalid={Boolean(fieldErrors.business_name)} aria-describedby={fieldErrors.business_name ? "pilot-business_name-error" : undefined} /></Field>
        <Field name="email" label="Email" error={fieldErrors.email}><input id="pilot-email" name="email" type="email" autoComplete="email" required maxLength={254} className="ml-input" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "pilot-email-error" : undefined} /></Field>
        <Field name="phone" label="Phone" hint="Optional" error={fieldErrors.phone}><input id="pilot-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} className="ml-input" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "pilot-phone-error" : undefined} /></Field>
        <Field name="industry" label="Type of business" error={fieldErrors.industry} wide><select id="pilot-industry" name="industry" defaultValue="" required className="ml-input" aria-invalid={Boolean(fieldErrors.industry)} aria-describedby={fieldErrors.industry ? "pilot-industry-error" : undefined}><option value="" disabled>Choose one</option>{pilotIndustries.map((industry) => <option key={industry} value={industry}>{industry}</option>)}</select></Field>
        <Field name="call_handling" label="What happens when you miss a call?" error={fieldErrors.call_handling} wide><textarea id="pilot-call_handling" name="call_handling" required maxLength={2000} rows={4} placeholder="Who answers now, when calls get missed, and what you’d like help with." className="ml-input" aria-invalid={Boolean(fieldErrors.call_handling)} aria-describedby={fieldErrors.call_handling ? "pilot-call_handling-error" : undefined} /></Field>
        <div className="sr-only" aria-hidden="true"><label htmlFor="pilot-website-confirmation">Leave this field empty</label><input id="pilot-website-confirmation" name="website_confirmation" tabIndex={-1} autoComplete="off" /></div>
        {error ? (
          <p role="alert" className="ml-form__alert">
            {error}
            {/* When saving fails, offer the typed details as a ready-to-send email. */}
            {Object.values(fieldErrors).some(Boolean) ? null : <> <a href={emailFallback} className="ml-link">Email these details</a></>}
          </p>
        ) : null}
        <div className="ml-form__footer">
          <button type="submit" disabled={state === "saving"} className="ml-btn ml-btn--solid">{state === "saving" ? <><Loader2 className="ml-spin" aria-hidden="true" /> Sending…</> : <>Send request <ArrowRight aria-hidden="true" /></>}</button>
          <p className="ml-form__note">These details go to Mountline so we can reply. You can also <a href={emailFallback} className="ml-link">send them by email</a>.</p>
        </div>
      </fieldset>
    </form>
  )
}

function isField(target: EventTarget): target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
}

function Field({ name, label, hint, error, wide = false, children }: { name: keyof PilotRequestInput; label: string; hint?: string; error?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? "ml-field ml-field--wide" : "ml-field"} data-invalid={Boolean(error) || undefined}>
      <label htmlFor={`pilot-${name}`}>
        {label}
        {hint ? <span className="ml-field__hint">{hint}</span> : null}
      </label>
      {children}
      {error ? <p id={`pilot-${name}-error`} className="ml-field__error">{error}</p> : null}
    </div>
  )
}
