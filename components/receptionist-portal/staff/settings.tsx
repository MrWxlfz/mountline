"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { Industry } from "@/lib/receptionist/studio/industries"
import { getIntegration, integrations, type Integration, type IntegrationId } from "@/lib/receptionist/studio/integrations"
import type { OwnerEvent } from "@/lib/receptionist/studio/owner"
import { BellIcon, CheckCircle, LinkIcon, WaveformIcon } from "./icons"
import { Group, NavRow, Row, Tile, ToggleRow } from "./ios"

/*
 * Settings in the staff app preview. Notification switches really filter the preview's banners.
 * Connected apps is a demo of linking Google Calendar, Outlook, or Square: nothing connects, no
 * third-party sign-in page is imitated, and every screen says so. Preferences stay in this browser.
 */

export type NotifyGroup = "appointments" | "urgent" | "leads"
export type Linked = { at: number; options: Record<string, boolean> }
export type Prefs = { notify: Record<NotifyGroup, boolean>; linked: Partial<Record<IntegrationId, Linked>> }
export type SettingsPage = "receptionist" | "notifications" | IntegrationId

export const defaultPrefs: Prefs = { notify: { appointments: true, urgent: true, leads: true }, linked: {} }

export function groupOf(kind: OwnerEvent["kind"]): NotifyGroup | null {
  if (kind === "appointment" || kind === "change") return "appointments"
  if (kind === "urgent") return "urgent"
  if (kind === "lead") return "leads"
  return null
}

const storageKey = (agentId: string) => `ml-staff-prefs-${agentId}`

export function readPrefs(agentId: string): Prefs {
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey(agentId)) ?? "null") as Partial<Prefs> | null
    if (!stored) return defaultPrefs
    return { notify: { ...defaultPrefs.notify, ...stored.notify }, linked: stored.linked ?? {} }
  } catch {
    return defaultPrefs
  }
}

export function writePrefs(agentId: string, prefs: Prefs) {
  try {
    window.localStorage.setItem(storageKey(agentId), JSON.stringify(prefs))
  } catch {}
}

/* The Settings list ----------------------------------------------------------------------- */

export function SettingsList({ prefs, page, onOpen }: { prefs: Prefs; page: SettingsPage | null; onOpen: (page: SettingsPage) => void }) {
  const notifyCount = Object.values(prefs.notify).filter(Boolean).length
  return (
    <>
      <Group>
        <NavRow icon={<span className="ip-icon-tile gray"><WaveformIcon size={17} /></span>} title="Receptionist" selected={page === "receptionist"} onClick={() => onOpen("receptionist")} />
        <NavRow icon={<span className="ip-icon-tile red"><BellIcon size={17} /></span>} title="Notifications" value={notifyCount === 3 ? "All" : `${notifyCount} of 3`} selected={page === "notifications"} onClick={() => onOpen("notifications")} />
      </Group>
      <Group title="Connected apps" footer="Demo: linking shows how it would work. Nothing actually connects yet.">
        {integrations.map((integration) => (
          <NavRow
            key={integration.id}
            icon={<Tile background={integration.tile.background} glyph={integration.tile.glyph} />}
            title={integration.name}
            subtitle={integration.category}
            value={prefs.linked[integration.id] ? "Linked" : "Off"}
            selected={page === integration.id}
            onClick={() => onOpen(integration.id)}
          />
        ))}
      </Group>
    </>
  )
}

/* Pages --------------------------------------------------------------------------------- */

export function SettingsDetail({
  page,
  prefs,
  setPrefs,
  business,
  industry,
  demo,
}: {
  page: SettingsPage
  prefs: Prefs
  setPrefs: (update: (current: Prefs) => Prefs) => void
  business: string
  industry: Industry
  demo: boolean
}) {
  if (page === "receptionist") {
    return (
      <div className="ip-scroll">
        <h2 className="ip-page-title">Receptionist</h2>
        <Group footer="Change how it answers, what it handles, and its voice in Mountline Studio.">
          <Row label="Business" value={business} />
          <Row label="Type" value={industry.label} />
          <Row label="Mode" value={demo ? "Demo (simulated bookings)" : "Live (takes requests)"} />
          <li className="ip-row"><Link className="ip-link" href="/receptionist?view=studio">Open in Studio</Link></li>
        </Group>
      </div>
    )
  }

  if (page === "notifications") {
    const set = (group: NotifyGroup) => (on: boolean) => setPrefs((current) => ({ ...current, notify: { ...current.notify, [group]: on } }))
    return (
      <div className="ip-scroll">
        <h2 className="ip-page-title">Notifications</h2>
        <Group title="Notify me about" footer="Callers who only ask a question never send a notification. They're still in Calls.">
          <ToggleRow label="Appointments" detail={`New, moved, and cancelled ${industry.visit.split(" or ")[0]}s`} on={prefs.notify.appointments} onChange={set("appointments")} />
          <ToggleRow label="Urgent calls" detail="Emergencies and anything that can't wait" on={prefs.notify.urgent} onChange={set("urgent")} />
          <ToggleRow label="Leads" detail="Quote requests, callbacks, and messages" on={prefs.notify.leads} onChange={set("leads")} />
        </Group>
      </div>
    )
  }

  return <IntegrationPage key={page} integration={getIntegration(page)} prefs={prefs} setPrefs={setPrefs} business={business} />
}

function IntegrationPage({ integration, prefs, setPrefs, business }: { integration: Integration; prefs: Prefs; setPrefs: (update: (current: Prefs) => Prefs) => void; business: string }) {
  const linked = prefs.linked[integration.id]
  const [step, setStep] = useState<"idle" | "waiting">("idle")
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  function connect() {
    setStep("waiting")
    timer.current = window.setTimeout(() => {
      setPrefs((current) => ({
        ...current,
        linked: { ...current.linked, [integration.id]: { at: Date.now(), options: Object.fromEntries(integration.options.map((option) => [option.id, option.on])) } },
      }))
      setStep("idle")
    }, 1600)
  }

  function disconnect() {
    setPrefs((current) => {
      const next = { ...current.linked }
      delete next[integration.id]
      return { ...current, linked: next }
    })
  }

  return (
    <div className="ip-scroll">
      <header className="ip-app-head">
        <Tile background={integration.tile.background} glyph={integration.tile.glyph} size={64} />
        <h2>{integration.name}</h2>
        <p>{integration.summary}</p>
        {linked ? <span className="ip-pill ok"><CheckCircle size={14} />Linked · demo</span> : <span className="ip-pill">Demo</span>}
      </header>

      {linked ? (
        <>
          <Group title="Options" footer={`Linked for this preview on ${new Date(linked.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Booked calls now show what ${integration.name} would do.`}>
            {integration.options.map((option) => (
              <ToggleRow
                key={option.id}
                label={option.label}
                detail={option.detail}
                on={linked.options[option.id] ?? option.on}
                onChange={(on) => setPrefs((current) => {
                  const entry = current.linked[integration.id]
                  if (!entry) return current
                  return { ...current, linked: { ...current.linked, [integration.id]: { ...entry, options: { ...entry.options, [option.id]: on } } } }
                })}
              />
            ))}
          </Group>
          <Group>
            <li><button type="button" className="ip-row ip-destructive" onClick={disconnect}>Unlink {integration.name}</button></li>
          </Group>
        </>
      ) : (
        <>
          <Group title={`${business}'s receptionist could`} footer={`Demo: no ${integration.provider} account is connected and nothing leaves this page. A real link opens ${integration.provider}'s own sign-in.`}>
            {integration.permissions.map((permission) => (
              <li key={permission} className="ip-row ip-perm"><span className="ip-perm-check"><CheckCircle size={20} /></span><span>{permission}</span></li>
            ))}
          </Group>
          <button type="button" className="ip-filled" onClick={connect} disabled={step === "waiting"}>
            {step === "waiting" ? <><span className="ip-spinner light" aria-hidden="true" />Waiting for {integration.provider}…</> : <><LinkIcon size={18} />Link {integration.name}</>}
          </button>
        </>
      )}
    </div>
  )
}
