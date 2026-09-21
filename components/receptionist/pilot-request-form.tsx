"use client"

import { useRef, useState, type FormEvent, type ReactNode } from "react"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { requestReceptionistPilot } from "@/app/actions/request-receptionist-pilot"
import { pilotIndustries, pilotRequestSchema, type PilotFieldErrors, type PilotRequestInput } from "@/lib/leads/validation"

const control = "mt-2 w-full min-w-0 border border-[var(--ops-line-strong,#45423b)] bg-[var(--ops-bg,#0a0a09)] px-3 py-3 text-base text-[var(--ops-paper-bright,#f6efe3)] outline-none placeholder:text-[var(--ops-muted,#99948b)] focus:border-[var(--ops-brass-bright,#efb85b)] disabled:opacity-60"

export function PilotRequestForm() {
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<PilotFieldErrors>({})
  const [emailFallback, setEmailFallback] = useState("mailto:hello@mountline.dev?subject=Receptionist%20pilot%20request")
  const submitting = useRef(false)
  const successRef = useRef<HTMLDivElement>(null)

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
      <div ref={successRef} tabIndex={-1} role="status" className="border border-[var(--ops-line-strong,#45423b)] bg-[var(--ops-surface,#10100e)] p-6 text-[var(--ops-paper,#e9e1d3)] outline-none sm:p-8">
        <Check className="mb-5 size-6 text-[var(--ops-brass-bright,#efb85b)]" aria-hidden="true" />
        <h3 className="text-2xl font-medium">Your request is saved.</h3>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ops-muted,#99948b)]">Mountline will review how your calls work today and contact you about a focused pilot. No appointment or phone service has been booked.</p>
        <a className="mt-5 inline-block text-sm underline underline-offset-4" href="mailto:hello@mountline.dev?subject=Receptionist%20pilot%20request">Add something by email</a>
      </div>
    )
  }

  return (
    <form onSubmit={submit} onChange={(event) => {
      const data = new FormData(event.currentTarget)
      const body = ["Receptionist pilot request", `Name: ${data.get("name") || ""}`, `Business: ${data.get("business_name") || ""}`, `Email: ${data.get("email") || ""}`, `Phone: ${data.get("phone") || ""}`, `Business type: ${data.get("industry") || ""}`, "", `Current call handling / what needs to improve:\n${data.get("call_handling") || ""}`].join("\n")
      setEmailFallback(`mailto:hello@mountline.dev?subject=Receptionist%20pilot%20request&body=${encodeURIComponent(body)}`)
    }} noValidate aria-label="Request a receptionist pilot" aria-busy={state === "saving"} className="border border-[var(--ops-line-strong,#45423b)] bg-[var(--ops-surface,#10100e)] p-6 text-[var(--ops-paper,#e9e1d3)] sm:p-8">
      <div className="mb-7">
        <h3 className="text-2xl font-medium tracking-tight">Tell us about your calls.</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--ops-muted,#99948b)]">We’ll review the fit, agree on a small pilot, and confirm what it should handle before anything goes live.</p>
      </div>
      <fieldset disabled={state === "saving"} className="grid min-w-0 gap-5 sm:grid-cols-2">
        <Field name="name" label="Your name" error={fieldErrors.name}><input id="pilot-name" name="name" autoComplete="name" required maxLength={100} className={control} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "pilot-name-error" : undefined} /></Field>
        <Field name="business_name" label="Business name" error={fieldErrors.business_name}><input id="pilot-business_name" name="business_name" autoComplete="organization" required maxLength={140} className={control} aria-invalid={Boolean(fieldErrors.business_name)} aria-describedby={fieldErrors.business_name ? "pilot-business_name-error" : undefined} /></Field>
        <Field name="email" label="Email" error={fieldErrors.email}><input id="pilot-email" name="email" type="email" autoComplete="email" required maxLength={254} className={control} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "pilot-email-error" : undefined} /></Field>
        <Field name="phone" label="Phone (optional)" error={fieldErrors.phone}><input id="pilot-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} className={control} aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "pilot-phone-error" : undefined} /></Field>
        <Field name="industry" label="Type of business" error={fieldErrors.industry}><select id="pilot-industry" name="industry" defaultValue="" required className={control} aria-invalid={Boolean(fieldErrors.industry)} aria-describedby={fieldErrors.industry ? "pilot-industry-error" : undefined}><option value="" disabled>Choose your business type</option>{pilotIndustries.map((industry) => <option key={industry} value={industry}>{industry}</option>)}</select></Field>
        <div className="sm:col-span-2"><Field name="call_handling" label="What happens when you miss a call?" error={fieldErrors.call_handling}><textarea id="pilot-call_handling" name="call_handling" required maxLength={2000} rows={4} placeholder="Who answers now, when calls get missed, and what you would like help with." className={control} aria-invalid={Boolean(fieldErrors.call_handling)} aria-describedby={fieldErrors.call_handling ? "pilot-call_handling-error" : undefined} /></Field></div>
        <div className="sr-only" aria-hidden="true"><label htmlFor="pilot-website-confirmation">Leave this field empty</label><input id="pilot-website-confirmation" name="website_confirmation" tabIndex={-1} autoComplete="off" /></div>
        <div className="sm:col-span-2">
          {error ? <p role="alert" className="mb-4 border-l-2 border-[#efb85b] pl-3 text-sm leading-6 text-[var(--ops-paper,#e9e1d3)]">{error}</p> : null}
          <button type="submit" disabled={state === "saving"} className="ops-button ops-button--primary w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto">{state === "saving" ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Saving request</> : <>Discuss a pilot <ArrowRight className="size-4" aria-hidden="true" /></>}</button>
          <p className="mt-4 text-xs leading-5 text-[var(--ops-muted,#99948b)]">These details go to Mountline so we can respond to your request. Prefer email? <a href={emailFallback} className="underline underline-offset-4">Email these details to hello@mountline.dev</a></p>
        </div>
      </fieldset>
    </form>
  )
}

function Field({ name, label, error, children }: { name: keyof PilotRequestInput; label: string; error?: string; children: ReactNode }) {
  return <div className="min-w-0"><label htmlFor={`pilot-${name}`} className="text-sm font-medium">{label}</label>{children}{error ? <p id={`pilot-${name}-error`} className="mt-2 text-xs text-[#efb85b]">{error}</p> : null}</div>
}
