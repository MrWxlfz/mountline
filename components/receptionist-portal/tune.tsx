"use client"

import { useState } from "react"
import { validateReceptionistProfile, type ReceptionistProfile } from "@/lib/receptionist/config"
import { northTexasDemoProfile } from "@/lib/receptionist/profiles"
import { buildReceptionistPrompt, receptionistGreeting } from "@/lib/receptionist/prompt"
import type { Agent, Llm } from "@/lib/receptionist/retell"

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

type Business = {
  name: string
  mode: "customer" | "demo"
  services: string
  area: string
  hoursKnown: boolean
  weekdayOpen: string
  weekdayClose: string
  saturday: boolean
  saturdayOpen: string
  saturdayClose: string
  faqs: string
  pricing: string
  urgent: string
}

const STORAGE_KEY = "ml-rx-business"

const base = northTexasDemoProfile
const defaults: Business = {
  name: base.business.name,
  mode: "demo",
  services: base.business.services.join("\n"),
  area: base.business.serviceArea.join("\n"),
  hoursKnown: true,
  weekdayOpen: "08:00",
  weekdayClose: "17:00",
  saturday: false,
  saturdayOpen: "09:00",
  saturdayClose: "13:00",
  faqs: base.faqs.map((faq) => `${faq.question} :: ${faq.answer}`).join("\n"),
  pricing: base.pricing.policy,
  urgent: base.escalation.urgentIssues.join("\n"),
}

const lines = (text: string) => text.split("\n").map((line) => line.trim()).filter(Boolean)

function toProfile(form: Business): ReceptionistProfile {
  const weekday = { opens: form.weekdayOpen, closes: form.weekdayClose }
  const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "demo"
  return {
    ...base,
    id: slug,
    mode: form.mode,
    business: {
      ...base.business,
      name: form.name.trim(),
      services: lines(form.services),
      serviceArea: lines(form.area),
      hours: form.hoursKnown
        ? {
            monday: weekday,
            tuesday: weekday,
            wednesday: weekday,
            thursday: weekday,
            friday: weekday,
            saturday: form.saturday ? { opens: form.saturdayOpen, closes: form.saturdayClose } : null,
            sunday: null,
          }
        : null,
    },
    faqs: lines(form.faqs).map((line) => {
      const [question, ...answer] = line.split("::")
      return { question: question.trim(), answer: answer.join("::").trim() }
    }),
    pricing: { policy: form.pricing.trim() },
    escalation: { ...base.escalation, urgentIssues: lines(form.urgent) },
  }
}

/**
 * Tuning the demo agent itself (it keeps changes until they're changed again). "Business" writes the
 * prompt from facts with the same builder and guardrails as the dashboard; "Prompt" edits what the
 * agent actually uses. Publishing saves both the instructions and the first line to Retell.
 */
export function TunePanel({
  agent,
  llm,
  lineVersion,
  publish,
  onUseLatest,
}: {
  agent: Agent
  llm: Llm | null
  lineVersion: number | string | null
  publish: (changes: { prompt: string; greeting: string }) => Promise<Result<{ version: number | null }>>
  onUseLatest: () => Promise<Result<null>>
}) {
  const [tab, setTab] = useState<"business" | "prompt">("business")
  const [form, setForm] = useState<Business>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults
    } catch {
      return defaults
    }
  })
  const [issues, setIssues] = useState<string[]>([])
  const [prompt, setPrompt] = useState(llm?.prompt ?? "")
  const [greeting, setGreeting] = useState(llm?.greeting ?? "")
  const [saved, setSaved] = useState({ prompt: llm?.prompt ?? "", greeting: llm?.greeting ?? "", version: llm?.version ?? null })
  const [status, setStatus] = useState<{ tone: "ok" | "error" | "busy"; text: string } | null>(null)
  const [onLatest, setOnLatest] = useState(lineVersion === "latest")

  function update<K extends keyof Business>(key: K, value: Business[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  function writePrompt() {
    const validation = validateReceptionistProfile(toProfile(form))
    if (!validation.success) {
      setIssues(validation.errors)
      return
    }
    setIssues([])
    setPrompt(buildReceptionistPrompt(validation.profile))
    setGreeting(receptionistGreeting(validation.profile))
    setTab("prompt")
    setStatus({ tone: "ok", text: "Prompt written from the business facts. Review it, then publish." })
  }

  async function save() {
    setStatus({ tone: "busy", text: "Publishing to the demo agent…" })
    const result = await publish({ prompt, greeting })
    if (!result.ok) return setStatus({ tone: "error", text: result.error })
    setSaved({ prompt, greeting, version: result.data.version })
    setStatus({
      tone: "ok",
      text: onLatest ? "Published. The next call to the demo line uses it." : "Published to the agent. Point the demo line at the latest version for calls to use it.",
    })
  }

  async function useLatest() {
    setStatus({ tone: "busy", text: "Pointing the demo line at the latest version…" })
    const result = await onUseLatest()
    if (!result.ok) return setStatus({ tone: "error", text: result.error })
    setOnLatest(true)
    setStatus({ tone: "ok", text: "The demo line now answers with the latest version." })
  }

  const dirty = prompt !== saved.prompt || greeting !== saved.greeting

  if (!llm) {
    return (
      <section className="pt-card">
        <div className="pt-card-h"><h2>Tune it</h2></div>
        <p className="pt-muted">{agent.name} uses a {agent.engine} response engine, which this portal can&apos;t edit. Tune it in Retell.</p>
      </section>
    )
  }

  return (
    <section className="pt-card">
      <div className="pt-card-h">
        <h2>Tune it</h2>
        <span className="pt-muted small">{agent.name}{saved.version !== null ? ` · v${saved.version}` : ""}</span>
      </div>
      <p className={onLatest ? "pt-note" : "pt-note warn"}>
        {onLatest
          ? "The demo line answers with the agent's latest version, so a publish reaches the next call."
          : `The demo line is set to version ${lineVersion ?? "unknown"}, so new publishes won't reach calls until it uses the latest version.`}
        {onLatest ? null : (
          <button type="button" className="pt-linkbtn" onClick={useLatest} disabled={status?.tone === "busy"}>Use the latest version</button>
        )}
      </p>

      <div className="pt-tabs" role="tablist" aria-label="Tuning">
        <button type="button" role="tab" aria-selected={tab === "business"} className="pt-tab" onClick={() => setTab("business")}>Business</button>
        <button type="button" role="tab" aria-selected={tab === "prompt"} className="pt-tab" onClick={() => setTab("prompt")}>Prompt{dirty ? " ·" : ""}</button>
      </div>

      {tab === "business" ? (
        <div className="pt-form" role="tabpanel">
          <div className="pt-two">
            <Field label="Business name">
              <input className="pt-input" value={form.name} onChange={(event) => update("name", event.target.value)} />
            </Field>
            <Field label="Answer as">
              <select className="pt-input" value={form.mode} onChange={(event) => update("mode", event.target.value as Business["mode"])}>
                <option value="customer">Their real business</option>
                <option value="demo">A fictional demo business</option>
              </select>
            </Field>
          </div>
          <div className="pt-two">
            <Field label="Services (one per line)">
              <textarea className="pt-input" rows={4} value={form.services} onChange={(event) => update("services", event.target.value)} />
            </Field>
            <Field label="Service area (one per line)">
              <textarea className="pt-input" rows={4} value={form.area} onChange={(event) => update("area", event.target.value)} />
            </Field>
          </div>
          <fieldset className="pt-hours">
            <legend>Hours</legend>
            <label className="pt-check">
              <input type="checkbox" checked={form.hoursKnown} onChange={(event) => update("hoursKnown", event.target.checked)} /> Tell callers the hours
            </label>
            {form.hoursKnown ? (
              <div className="pt-hours-row">
                <span>Mon–Fri</span>
                <input className="pt-input" type="time" value={form.weekdayOpen} onChange={(event) => update("weekdayOpen", event.target.value)} aria-label="Weekdays open" />
                <input className="pt-input" type="time" value={form.weekdayClose} onChange={(event) => update("weekdayClose", event.target.value)} aria-label="Weekdays close" />
                <label className="pt-check"><input type="checkbox" checked={form.saturday} onChange={(event) => update("saturday", event.target.checked)} /> Sat</label>
                {form.saturday ? (
                  <>
                    <input className="pt-input" type="time" value={form.saturdayOpen} onChange={(event) => update("saturdayOpen", event.target.value)} aria-label="Saturday open" />
                    <input className="pt-input" type="time" value={form.saturdayClose} onChange={(event) => update("saturdayClose", event.target.value)} aria-label="Saturday close" />
                  </>
                ) : null}
              </div>
            ) : null}
          </fieldset>
          <Field label="Common questions (Question :: Answer, one per line)">
            <textarea className="pt-input" rows={4} value={form.faqs} onChange={(event) => update("faqs", event.target.value)} />
          </Field>
          <div className="pt-two">
            <Field label="Pricing rule">
              <textarea className="pt-input" rows={3} value={form.pricing} onChange={(event) => update("pricing", event.target.value)} />
            </Field>
            <Field label="Treat as urgent (one per line)">
              <textarea className="pt-input" rows={3} value={form.urgent} onChange={(event) => update("urgent", event.target.value)} />
            </Field>
          </div>
          {issues.length ? (
            <ul className="pt-issues" role="alert">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
          ) : null}
          <div className="pt-actions">
            <button type="button" className="pt-btn" onClick={writePrompt}>Write the prompt</button>
            <button type="button" className="pt-btn light" onClick={() => { setForm(defaults); setIssues([]); try { window.localStorage.removeItem(STORAGE_KEY) } catch {} }}>Reset</button>
          </div>
        </div>
      ) : (
        <div className="pt-form" role="tabpanel">
          <Field label="First thing it says">
            <input className="pt-input" value={greeting} onChange={(event) => setGreeting(event.target.value)} />
          </Field>
          <Field label="Instructions">
            <textarea className="pt-input pt-prompt" rows={14} value={prompt} onChange={(event) => setPrompt(event.target.value)} spellCheck={false} />
          </Field>
          <div className="pt-actions">
            <button type="button" className="pt-btn" onClick={save} disabled={!dirty || status?.tone === "busy"}>
              {status?.tone === "busy" ? <><span className="pt-spin" aria-hidden="true" />Publishing</> : "Publish to the demo agent"}
            </button>
            <button type="button" className="pt-btn light" onClick={() => { setPrompt(saved.prompt); setGreeting(saved.greeting) }} disabled={!dirty}>Undo changes</button>
          </div>
        </div>
      )}
      {status && status.tone !== "busy" ? <p className={status.tone === "error" ? "pt-error" : "pt-ok"} role="status">{status.text}</p> : null}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="pt-field">
      <span>{label}</span>
      {children}
    </label>
  )
}
