"use client"

import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import { loadStudio, openStudioAgent, removeStudioAgent, saveStudioAgent } from "@/app/(marketing)/receptionist/studio-actions"
import { IndustryPicker } from "@/components/receptionist-portal/studio/industry-picker"
import { NumbersPanel } from "@/components/receptionist-portal/studio/numbers"
import { TestCall, ownerHref } from "@/components/receptionist-portal/studio/test-call"
import { plannedSmsCapabilities, voiceCapabilities, voiceCapabilityIds, type VoiceCapabilityId } from "@/lib/receptionist/studio/capabilities"
import { getIndustry } from "@/lib/receptionist/studio/industries"
import { personalities, personalityIds, type PersonalityId } from "@/lib/receptionist/studio/personalities"
import { buildStudioReceptionist } from "@/lib/receptionist/studio/prompt"
import { validateStudioConfig, type StudioConfig } from "@/lib/receptionist/studio/schema"
import type { StudioOverview, StudioVoice } from "@/lib/receptionist/studio/service"

type Initial = { ok: true; data: StudioOverview } | { ok: false; error: string }

type Form = Omit<StudioConfig, "industry"> & { industry: StudioConfig["industry"] | "" }

type Saved = { id: string; name: string; config: StudioConfig | null }

type Status = { tone: "ok" | "error" | "warn"; text: string } | null

function blankForm(voiceId: string): Form {
  return {
    version: 1,
    businessName: "",
    industry: "",
    location: "",
    description: "",
    hours: "",
    context: "",
    instructions: "",
    capabilities: [],
    personality: "warm",
    receptionistName: "",
    voiceId,
    mode: "demo",
    firstMessage: "",
  }
}

/** A sensible starting voice: a platform voice (expressive mode) if there is one. */
function defaultVoice(voices: StudioVoice[]) {
  return (voices.find((voice) => voice.provider === "platform" && voice.gender === "female") ?? voices.find((voice) => voice.provider === "platform") ?? voices[0])?.id ?? ""
}

/**
 * Receptionist Studio: pick an industry, name the business, tick what it handles, choose a voice,
 * and create a real Retell receptionist to test in the browser or put on a phone number. Nothing is
 * created until "Create receptionist" is clicked; saving an existing one updates it in place.
 */
export function Studio({ initial }: { initial: Initial }) {
  if (!initial.ok) {
    return (
      <main className="pt-main pt-narrow">
        <section className="pt-card">
          <h1>Studio can&apos;t reach Retell</h1>
          <p className="pt-error">{initial.error}</p>
          <p className="pt-muted">Studio uses <code>RETELL_API_KEY</code> on the server. Nothing else needs configuring.</p>
        </section>
      </main>
    )
  }
  return <StudioReady initial={initial.data} />
}

function StudioReady({ initial }: { initial: StudioOverview }) {
  const [overview, setOverview] = useState(initial)
  const [form, setForm] = useState<Form>(() => blankForm(defaultVoice(initial.voices)))
  const [saved, setSaved] = useState<Saved | null>(null)
  const [personalityTouched, setPersonalityTouched] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [status, setStatus] = useState<Status>(null)
  const [busy, setBusy] = useState<"save" | "open" | "delete" | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)

  const industry = form.industry ? getIndustry(form.industry) : null
  const validation = useMemo(() => validateStudioConfig(form), [form])
  const dirty = saved?.config ? JSON.stringify(normalize(form)) !== JSON.stringify(normalize(saved.config)) : true
  const preview = useMemo(() => (validation.success ? buildStudioReceptionist(validation.config) : null), [validation])
  const voice = overview.voices.find((entry) => entry.id === form.voiceId) ?? null

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors([])
  }

  function chooseIndustry(id: string) {
    const next = getIndustry(id)
    setForm((current) => ({
      ...current,
      industry: next.id as StudioConfig["industry"],
      capabilities: [...next.defaults],
      personality: personalityTouched ? current.personality : next.personality,
    }))
    setErrors([])
  }

  function toggle(id: VoiceCapabilityId) {
    setForm((current) => ({
      ...current,
      capabilities: current.capabilities.includes(id) ? current.capabilities.filter((entry) => entry !== id) : voiceCapabilityIds.filter((entry) => entry === id || current.capabilities.includes(entry)),
    }))
    setErrors([])
  }

  function startNew() {
    setSaved(null)
    setForm((current) => blankForm(current.voiceId || defaultVoice(overview.voices)))
    setPersonalityTouched(false)
    setStatus(null)
    setErrors([])
    setConfirmDelete(false)
  }

  async function open(id: string) {
    if (!id) return startNew()
    setBusy("open")
    setStatus(null)
    setConfirmDelete(false)
    const result = await openStudioAgent(id)
    setBusy(null)
    if (!result.ok) return setStatus({ tone: "error", text: result.error })
    const detail = result.data
    setSaved({ id: detail.id, name: detail.businessName, config: detail.config })
    if (detail.config) {
      setForm(detail.config)
      setPersonalityTouched(true)
    } else {
      setStatus({ tone: "warn", text: "This one's settings couldn't be read back, so the form wasn't changed. You can still test it, or save over it." })
    }
  }

  async function save() {
    const check = validateStudioConfig(form)
    if (!check.success) {
      setErrors(check.errors)
      return
    }
    setBusy("save")
    setStatus(null)
    const result = await saveStudioAgent(check.config, saved?.id ?? null)
    setBusy(null)
    if (!result.ok) return setStatus({ tone: "error", text: result.error })
    const { agentId, created, warning } = result.data
    setSaved({ id: agentId, name: check.config.businessName, config: check.config })
    setForm(check.config)
    setOverview((current) => {
      const summary = { id: agentId, businessName: check.config.businessName, updatedAt: Date.now() }
      const option = { id: agentId, name: `Studio · ${check.config.businessName}`, studio: true }
      return {
        ...current,
        agents: [summary, ...current.agents.filter((agent) => agent.id !== agentId)],
        agentOptions: [option, ...current.agentOptions.filter((agent) => agent.id !== agentId)],
      }
    })
    setStatus({
      tone: warning ? "warn" : "ok",
      text: `${created ? "Created" : "Saved"}. ${warning ?? "Hit Test call to talk to it."}`,
    })
  }

  async function remove() {
    if (!saved) return
    if (!confirmDelete) return setConfirmDelete(true)
    setBusy("delete")
    const result = await removeStudioAgent(saved.id)
    setBusy(null)
    setConfirmDelete(false)
    if (!result.ok) return setStatus({ tone: "error", text: result.error })
    const goneId = saved.id
    setOverview((current) => ({
      ...current,
      agents: current.agents.filter((agent) => agent.id !== goneId),
      agentOptions: current.agentOptions.filter((agent) => agent.id !== goneId),
    }))
    startNew()
    setStatus({ tone: "ok", text: "Deleted from Retell." })
  }

  async function refresh() {
    const result = await loadStudio()
    if (result.ok) setOverview(result.data)
    else setStatus({ tone: "error", text: result.error })
  }

  function previewVoice() {
    if (!voice?.previewUrl) return
    if (playing === voice.id) {
      audio.current?.pause()
      setPlaying(null)
      return
    }
    audio.current?.pause()
    const sample = new Audio(voice.previewUrl)
    audio.current = sample
    sample.onended = () => setPlaying(null)
    sample.play().then(() => setPlaying(voice.id)).catch(() => setPlaying(null))
  }

  const blocked = !saved
    ? "Create the receptionist first."
    : dirty
      ? "You have unsaved changes. The call uses the last saved version until you save."
      : null

  return (
    <main className="pt-main">
      <div className="pt-grid st-grid">
        {/* Builder ------------------------------------------------------------------- */}
        <section className="pt-card st-builder" aria-labelledby="st-title">
          <div className="pt-card-h">
            <h2 id="st-title">Receptionist Studio</h2>
            <div className="st-open">
              <label className="sr-only" htmlFor="st-saved">Open a saved receptionist</label>
              <select id="st-saved" className="pt-input st-small-input" value={saved?.id ?? ""} onChange={(event) => open(event.target.value)} disabled={busy !== null}>
                <option value="">New receptionist</option>
                {overview.agents.length ? (
                  <optgroup label="Recent demos">
                    {overview.agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.businessName}</option>)}
                  </optgroup>
                ) : null}
              </select>
            </div>
          </div>

          <div className="pt-form">
            <div className="st-step"><span>1</span>The business</div>
            <div className="pt-two">
              <div className="pt-field">
                <span>Business type</span>
                <IndustryPicker value={form.industry} onChange={chooseIndustry} invalid={errors.includes("Pick a business type")} />
              </div>
              <label className="pt-field">
                <span>Business name</span>
                <input
                  className={errors.includes("Add the business name") ? "pt-input bad" : "pt-input"}
                  value={form.businessName}
                  onChange={(event) => update("businessName", event.target.value)}
                  placeholder="Southlake Barber Co."
                  maxLength={80}
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="st-step"><span>2</span>What it handles {industry ? <button type="button" className="pt-linkbtn st-reset" onClick={() => update("capabilities", [...industry.defaults])}>Reset to {industry.label.toLowerCase()} defaults</button> : null}</div>
            {industry ? (
              <>
                <div className="st-caps">
                  {voiceCapabilityIds.map((id) => (
                    <label key={id} className={form.capabilities.includes(id) ? "st-cap on" : "st-cap"}>
                      <input type="checkbox" checked={form.capabilities.includes(id)} onChange={() => toggle(id)} />
                      <span>
                        <b>{voiceCapabilities[id].label}</b>
                        <small>{voiceCapabilities[id].hint}</small>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="pt-muted small st-later">Later: {plannedSmsCapabilities.map((cap) => cap.label.toLowerCase()).join(", ")}. Texting isn&apos;t connected yet.</p>
              </>
            ) : (
              <p className="pt-muted small">Pick a business type and the usual tasks are ticked for you.</p>
            )}

            <div className="st-step"><span>3</span>Voice &amp; personality</div>
            <div className="st-persona" role="radiogroup" aria-label="Personality">
              {personalityIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={form.personality === id}
                  className={form.personality === id ? "st-persona-opt on" : "st-persona-opt"}
                  onClick={() => {
                    update("personality", id as PersonalityId)
                    setPersonalityTouched(true)
                  }}
                >
                  <b>{personalities[id].label}</b>
                  <small>{personalities[id].blurb}</small>
                </button>
              ))}
            </div>
            <div className="pt-two">
              <div className="pt-field">
                <label htmlFor="st-voice">Voice</label>
                <div className="pt-row st-voice-row">
                  <select id="st-voice" className="pt-input" value={form.voiceId} onChange={(event) => update("voiceId", event.target.value)}>
                    {!voice && form.voiceId ? <option value={form.voiceId}>{form.voiceId}</option> : null}
                    {groupVoices(overview.voices).map(([provider, list]) => (
                      <optgroup key={provider} label={providerLabel(provider)}>
                        {list.map((entry) => (
                          <option key={entry.id} value={entry.id}>{[entry.name, entry.gender, entry.age, entry.accent].filter(Boolean).join(" · ")}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button type="button" className="pt-btn light st-play" onClick={previewVoice} disabled={!voice?.previewUrl} aria-label={playing === voice?.id ? "Stop the voice sample" : "Play a voice sample"}>
                    {playing === voice?.id ? "■" : "▶"}
                  </button>
                </div>
                <small className="pt-muted small">{voice?.provider === "platform" ? "Expressive mode on: it adds warmth and pauses where they fit." : "Tip: Retell platform voices support expressive mode."}</small>
              </div>
              <label className="pt-field">
                <span>Receptionist&apos;s name <i className="st-opt">optional</i></span>
                <input className="pt-input" value={form.receptionistName} onChange={(event) => update("receptionistName", event.target.value)} placeholder="Maya" maxLength={24} autoComplete="off" />
              </label>
            </div>

            <label className="st-switch">
              <input type="checkbox" checked={form.mode === "demo"} onChange={(event) => update("mode", event.target.checked ? "demo" : "live")} />
              <span className="st-switch-ui" aria-hidden="true" />
              <span>
                <b>Demo mode</b>
                <small>{form.mode === "demo" ? "Bookings are simulated (\"you're booked\"), then it says it's a demo and nothing hit a real calendar." : "Live mode: no simulated bookings. It takes requests for the team to confirm."}</small>
              </span>
            </label>

            <button type="button" className="st-more" aria-expanded={moreOpen} onClick={() => setMoreOpen(!moreOpen)}>
              {moreOpen ? "Fewer details" : "More details"} <span className="pt-muted small">location, hours, prices, policies, custom instructions</span>
            </button>
            {moreOpen ? (
              <div className="pt-form st-more-body">
                <div className="pt-two">
                  <label className="pt-field"><span>Location</span><input className="pt-input" value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="Southlake, TX" maxLength={80} /></label>
                  <label className="pt-field"><span>Hours</span><input className="pt-input" value={form.hours} onChange={(event) => update("hours", event.target.value)} placeholder="Tue–Fri 9–7, Sat 8–4, closed Sun–Mon" maxLength={300} /></label>
                </div>
                <label className="pt-field"><span>Short description</span><input className="pt-input" value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Classic and modern cuts, four barbers, family-owned since 2015" maxLength={600} /></label>
                <label className="pt-field">
                  <span>Business context <i className="st-opt">prices, services, staff, policies (paste from their website)</i></span>
                  <textarea className="pt-input" rows={5} value={form.context} onChange={(event) => update("context", event.target.value)} placeholder={"Haircut $35, fade $40, beard trim $20\nBarbers: Marcus, Diego, Jay\nWalk-ins welcome, appointments get priority"} maxLength={5000} />
                </label>
                <label className="pt-field">
                  <span>Custom instructions <i className="st-opt">for the receptionist</i></span>
                  <textarea className="pt-input" rows={3} value={form.instructions} onChange={(event) => update("instructions", event.target.value)} placeholder="Mention the new Saturday hours if anyone asks about weekends." maxLength={2000} />
                </label>
                <label className="pt-field">
                  <span>First line <i className="st-opt">leave empty to use the generated one</i></span>
                  <input className="pt-input" value={form.firstMessage} onChange={(event) => update("firstMessage", event.target.value)} placeholder={preview?.firstMessage ?? "Generated from the name and personality"} maxLength={300} />
                </label>
              </div>
            ) : null}

            {errors.length ? <ul className="pt-issues" role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}

            <div className="pt-actions st-actions">
              <button type="button" className="pt-btn" onClick={save} disabled={busy !== null || (Boolean(saved) && !dirty)}>
                {busy === "save" ? <><span className="pt-spin" aria-hidden="true" />{saved ? "Saving" : "Creating"}</> : saved ? (dirty ? "Save changes" : "Saved") : "Create receptionist"}
              </button>
              {saved ? (
                <>
                  <button type="button" className="pt-btn light" onClick={startNew} disabled={busy !== null}>New</button>
                  <button type="button" className={confirmDelete ? "pt-btn danger" : "pt-btn light"} onClick={remove} disabled={busy !== null} onBlur={() => setConfirmDelete(false)}>
                    {busy === "delete" ? "Deleting…" : confirmDelete ? "Delete from Retell?" : "Delete"}
                  </button>
                </>
              ) : null}
            </div>
            {status ? <p className={status.tone === "error" ? "pt-error" : status.tone === "warn" ? "st-warn" : "pt-ok"} role="status">{status.text}</p> : null}
            {busy === "open" ? <p className="pt-muted small"><span className="pt-spin dark" aria-hidden="true" />Opening…</p> : null}
          </div>
        </section>

        {/* Test + numbers ----------------------------------------------------------- */}
        <div className="pt-col">
          <section className="pt-card">
            <div className="pt-card-h">
              <h2>{saved ? saved.name : "Test it"}</h2>
              {saved ? <code className="st-id" title="Retell agent ID">{saved.id}</code> : null}
            </div>
            {saved ? (
              <>
                <TestCall key={saved.id} agentId={saved.id} blockedReason={blocked} />
                <Link href={ownerHref(saved.id)} className="pt-linkbtn st-owner-link">Open the owner&apos;s view</Link>
              </>
            ) : (
              <p className="pt-muted">Create a receptionist and you can call it right here from the browser, then put it on a number for the owner to call.</p>
            )}
            {preview ? (
              <div className="st-preview">
                <p className="st-first"><span className="pt-muted small">It answers</span>&ldquo;{preview.firstMessage}&rdquo;</p>
                <button type="button" className="pt-linkbtn st-prompt-toggle" aria-expanded={showPrompt} onClick={() => setShowPrompt(!showPrompt)}>
                  {showPrompt ? "Hide the instructions" : "See the full instructions"}
                </button>
                {showPrompt ? <pre className="st-prompt">{preview.prompt}</pre> : null}
              </div>
            ) : null}
          </section>

          <NumbersPanel
            numbers={overview.numbers}
            agents={overview.agentOptions}
            current={saved ? { id: saved.id, name: saved.name } : null}
            onNumbers={(numbers) => setOverview((current) => ({ ...current, numbers }))}
          />
          <button type="button" className="pt-linkbtn st-refresh" onClick={refresh}>Refresh from Retell</button>
        </div>
      </div>
    </main>
  )
}

/** Compares settings the way they're saved (trimmed), so typing a trailing space doesn't count as a change. */
function normalize(form: Form | StudioConfig) {
  const check = validateStudioConfig(form)
  return check.success ? check.config : form
}

function groupVoices(voices: StudioVoice[]) {
  const groups = new Map<string, StudioVoice[]>()
  for (const voice of voices) groups.set(voice.provider, [...(groups.get(voice.provider) ?? []), voice])
  return [...groups.entries()]
}

function providerLabel(provider: string) {
  const labels: Record<string, string> = { platform: "Retell (expressive)", elevenlabs: "ElevenLabs", cartesia: "Cartesia", openai: "OpenAI", minimax: "MiniMax", inworld: "Inworld", fish_audio: "Fish Audio" }
  return labels[provider] ?? provider
}
