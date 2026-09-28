"use client"

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { submitInquiry } from "@/app/actions/submit-inquiry"
import {
  inquiryInterestLabels,
  inquiryInterests,
  inquirySchema,
  type InquiryField,
  type InquiryFieldErrors,
  type InquiryInterest,
} from "@/lib/leads/inquiry-schema"

type State = "idle" | "saving" | "saved" | "error"

const CHECK_FIELDS = "Please check the highlighted details."
const textFields = ["name", "business_name", "email", "phone", "message", "current_website"] as const

function newKey() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function isInterest(value: string | null | undefined): value is InquiryInterest {
  return Boolean(value && (inquiryInterests as readonly string[]).includes(value))
}

/**
 * The project inquiry. Service links elsewhere on the page can preselect an interest with
 * data-interest="capture", and other pages can link to /?interest=receptionist#contact.
 */
export function ProjectInquiryForm({ id = "inquiry", defaultInterests = [] }: { id?: string; defaultInterests?: InquiryInterest[] }) {
  const [state, setState] = useState<State>("idle")
  const [duplicate, setDuplicate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<InquiryFieldErrors>({})
  const [interests, setInterests] = useState<InquiryInterest[]>(defaultInterests)
  const [mailto, setMailto] = useState("mailto:hello@mountline.dev?subject=Project%20inquiry")
  const [sentTo, setSentTo] = useState("")
  const touchedInterests = useRef(false)
  const submitting = useRef(false)
  const key = useRef<string | null>(null)
  const startedAt = useRef<number | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const doneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    key.current = newKey()
    startedAt.current = Date.now()
    // Links from other pages (/?interest=receptionist#contact) arrive with the interest in the URL.
    const fromUrl = new URLSearchParams(window.location.search).get("interest")
    const frame = isInterest(fromUrl) ? window.requestAnimationFrame(() => setInterests([fromUrl])) : 0

    // "Ask about Capture" and similar links preselect what they're about.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.<HTMLElement>("[data-interest]")
      const interest = link?.dataset.interest
      if (!isInterest(interest)) return
      setInterests((current) => (touchedInterests.current ? Array.from(new Set([...current, interest])) : [interest]))
      setFieldErrors((current) => ({ ...current, interests: undefined }))
    }
    document.addEventListener("click", onClick)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener("click", onClick)
    }
  }, [])

  function checkField(name: InquiryField, value: unknown) {
    const result = inquirySchema.shape[name].safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  function valuesFrom(form: HTMLFormElement) {
    const data = new FormData(form)
    const text = (name: (typeof textFields)[number]) => String(data.get(name) || "")
    return {
      name: text("name"),
      business_name: text("business_name"),
      email: text("email"),
      phone: text("phone"),
      message: text("message"),
      current_website: text("current_website"),
      interests,
      website_confirmation: String(data.get("website_confirmation") || ""),
      started_at: startedAt.current ?? undefined,
      submission_key: key.current || newKey(),
    }
  }

  function rememberForEmail(form: HTMLFormElement) {
    const values = valuesFrom(form)
    const body = [
      `Name: ${values.name}`,
      `Business: ${values.business_name}`,
      `Phone: ${values.phone}`,
      `Interested in: ${interests.map((interest) => inquiryInterestLabels[interest]).join(", ")}`,
      `Website: ${values.current_website}`,
      "",
      values.message,
    ].join("\n")
    setMailto(`mailto:hello@mountline.dev?subject=${encodeURIComponent(`Project inquiry: ${values.business_name || "Mountline"}`)}&body=${encodeURIComponent(body)}`)
  }

  function toggle(interest: InquiryInterest) {
    touchedInterests.current = true
    setInterests((current) => {
      const next = current.includes(interest) ? current.filter((value) => value !== interest) : [...current, interest]
      if (fieldErrors.interests && next.length) setFieldErrors((errors) => ({ ...errors, interests: undefined }))
      return next
    })
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    const values = valuesFrom(form)
    const parsed = inquirySchema.safeParse(values)
    if (!parsed.success) {
      const errors: InquiryFieldErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as InquiryField
        if (field && !errors[field]) errors[field] = issue.message
      }
      setFieldErrors(errors)
      setError(CHECK_FIELDS)
      setState("error")
      const first = Object.keys(errors)[0]
      form.querySelector<HTMLElement>(first === "interests" ? `#${id}-interest-${interests[0] || "website"}` : `[name="${first}"]`)?.focus()
      return
    }

    submitting.current = true
    setState("saving")
    setError(null)
    setFieldErrors({})
    rememberForEmail(form)
    try {
      const result = await submitInquiry(values)
      if (!result.success) {
        setError(result.error)
        setFieldErrors(result.fieldErrors || {})
        setState("error")
        return
      }
      setDuplicate(result.duplicate)
      setSentTo(parsed.data.email)
      setState("saved")
      window.requestAnimationFrame(() => doneRef.current?.focus())
    } catch {
      setError("The connection dropped before we could confirm your message was saved. Everything you typed is still here, so you can try again.")
      setState("error")
    } finally {
      submitting.current = false
    }
  }

  function startOver() {
    key.current = newKey()
    startedAt.current = Date.now()
    touchedInterests.current = false
    setInterests(defaultInterests)
    setDuplicate(false)
    setState("idle")
  }

  if (state === "saved") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="ml-form__success">
        <Check aria-hidden="true" />
        <h3>{duplicate ? "We already have this one." : "Thanks. Your message reached Mountline."}</h3>
        <p>
          {duplicate
            ? "This message was saved the first time you sent it, so there’s no need to send it again. Luke will reply by email."
            : <>It’s saved, and Luke will reply by email. A short confirmation is on its way to <strong>{sentTo}</strong>.</>}
        </p>
        <button type="button" className="ml-link ml-form__again" onClick={startOver}>Send another message</button>
      </div>
    )
  }

  const describedBy = (name: InquiryField) => (fieldErrors[name] ? `${id}-${name}-error` : undefined)
  const saveFailed = state === "error" && error && error !== CHECK_FIELDS && !Object.values(fieldErrors).some(Boolean)

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onBlur={(event) => {
        const target = event.target as unknown as HTMLInputElement
        const name = target.name as InquiryField
        if (!(textFields as readonly string[]).includes(name)) return
        // Leave empty fields alone until the visitor tries to send.
        if (!target.value.trim() && !fieldErrors[name]) return
        const message = checkField(name, target.value)
        setFieldErrors((current) => (current[name] === message ? current : { ...current, [name]: message }))
      }}
      onChange={(event) => {
        const target = event.target as unknown as HTMLInputElement
        const name = target.name as InquiryField
        if (fieldErrors[name] && !checkField(name, target.value)) {
          const remaining = { ...fieldErrors, [name]: undefined }
          setFieldErrors(remaining)
          if (!Object.values(remaining).some(Boolean) && error === CHECK_FIELDS) setError(null)
        }
      }}
      noValidate
      aria-label="Project inquiry"
      aria-busy={state === "saving"}
    >
      <fieldset disabled={state === "saving"} className="ml-form">
        <Field id={id} name="name" label="Your name" error={fieldErrors.name}>
          <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={100} className="ml-input" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={describedBy("name")} />
        </Field>
        <Field id={id} name="business_name" label="Business name" error={fieldErrors.business_name}>
          <input id={`${id}-business_name`} name="business_name" autoComplete="organization" required maxLength={140} className="ml-input" aria-invalid={Boolean(fieldErrors.business_name)} aria-describedby={describedBy("business_name")} />
        </Field>
        <Field id={id} name="email" label="Email" error={fieldErrors.email}>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} className="ml-input" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={describedBy("email")} />
        </Field>
        <Field id={id} name="phone" label="Phone" hint="Optional" error={fieldErrors.phone}>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={40} className="ml-input" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={describedBy("phone")} />
        </Field>

        <fieldset className="ml-field ml-field--wide ml-choices" aria-describedby={fieldErrors.interests ? `${id}-interests-error` : `${id}-interests-hint`}>
          <legend>
            What would you like help with?
            <span className="ml-field__hint" id={`${id}-interests-hint`}>Choose any that apply</span>
          </legend>
          <div className="ml-choices__list">
            {inquiryInterests.map((interest) => (
              <label key={interest} className="ml-choice">
                <input
                  type="checkbox"
                  id={`${id}-interest-${interest}`}
                  name="interests"
                  value={interest}
                  checked={interests.includes(interest)}
                  onChange={() => toggle(interest)}
                  aria-invalid={Boolean(fieldErrors.interests)}
                />
                <span><i aria-hidden="true" />{inquiryInterestLabels[interest]}</span>
              </label>
            ))}
          </div>
          {fieldErrors.interests ? <p id={`${id}-interests-error`} className="ml-field__error">{fieldErrors.interests}</p> : null}
        </fieldset>

        <Field id={id} name="message" label="Tell us a little about your business and what you’d like help with." error={fieldErrors.message} wide>
          <textarea id={`${id}-message`} name="message" required maxLength={3000} rows={5} className="ml-input" aria-invalid={Boolean(fieldErrors.message)} aria-describedby={describedBy("message")} />
        </Field>
        <Field id={id} name="current_website" label="Current website" hint="Optional" error={fieldErrors.current_website} wide>
          <input id={`${id}-current_website`} name="current_website" inputMode="url" autoComplete="url" maxLength={300} placeholder="example.com" className="ml-input" aria-invalid={Boolean(fieldErrors.current_website)} aria-describedby={describedBy("current_website")} />
        </Field>

        <div className="sr-only" aria-hidden="true">
          <label htmlFor={`${id}-website-confirmation`}>Leave this field empty</label>
          <input id={`${id}-website-confirmation`} name="website_confirmation" tabIndex={-1} autoComplete="off" />
        </div>

        {error ? (
          <p role="alert" className="ml-form__alert">
            {error}
            {saveFailed ? <> <a href={mailto} className="ml-link">Email these details instead</a></> : null}
          </p>
        ) : null}
        <div className="ml-form__footer">
          <button type="submit" disabled={state === "saving"} className="ml-btn ml-btn--solid">
            {state === "saving" ? <><Loader2 className="ml-spin" aria-hidden="true" /> Sending…</> : <>Send message <ArrowRight aria-hidden="true" /></>}
          </button>
          <p className="ml-form__note">Your message is saved and sent to Mountline, and you’ll get a short confirmation by email. No newsletter.</p>
        </div>
      </fieldset>
    </form>
  )
}

function Field({ id, name, label, hint, error, wide = false, children }: { id: string; name: InquiryField; label: string; hint?: string; error?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? "ml-field ml-field--wide" : "ml-field"} data-invalid={Boolean(error) || undefined}>
      <label htmlFor={`${id}-${name}`}>
        {label}
        {hint ? <span className="ml-field__hint">{hint}</span> : null}
      </label>
      {children}
      {error ? <p id={`${id}-${name}-error`} className="ml-field__error">{error}</p> : null}
    </div>
  )
}
