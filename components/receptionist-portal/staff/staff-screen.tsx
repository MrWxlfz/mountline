"use client"

import { useEffect, useMemo, useState } from "react"
import { formatPhone } from "@/components/receptionist-portal/studio/numbers"
import { getIndustry } from "@/lib/receptionist/studio/industries"
import { integrations } from "@/lib/receptionist/studio/integrations"
import { ownerEvent, readField } from "@/lib/receptionist/studio/owner"
import { CallCell, CallScreen, EventDot, formatShort, formatTime, initials } from "./call-screen"
import { BellIcon, CalendarIcon, ChevronLeft, GearIcon, PhoneIcon, SearchIcon, SidebarIcon } from "./icons"
import { Group, Sheet, Tile } from "./ios"
import { SettingsDetail, SettingsList, groupOf, readPrefs, writePrefs, type Prefs, type SettingsPage } from "./settings"
import type { StaffReady } from "./staff-app"
import { dataOf, useCallFeed, type Notice } from "./use-call-feed"

/*
 * The staff app itself, as it would look on iPadOS (a three-column split view with a sidebar) or iOS
 * (a tab bar with pushed screens). Client-only: it reads preview settings from this browser.
 */

type Section = "calls" | "appointments" | "settings"

const SECTIONS: Array<{ id: Section; label: string; icon: React.ReactNode }> = [
  { id: "calls", label: "Calls", icon: <PhoneIcon size={19} /> },
  { id: "appointments", label: "Appointments", icon: <CalendarIcon size={19} /> },
  { id: "settings", label: "Settings", icon: <GearIcon size={19} /> },
]

export function StaffScreen({ initial, device }: { initial: StaffReady; device: "ipad" | "iphone" }) {
  const industry = getIndustry(initial.industry)
  const feed = useCallFeed({ agentId: initial.agentId, industry, calls: initial.calls, focusCallId: initial.focusCallId, loadedAt: initial.loadedAt })
  const [section, setSection] = useState<Section>("calls")
  const [selected, setSelected] = useState<string | null>(initial.focusCallId ?? initial.calls[0]?.id ?? null)
  const [settingsPage, setSettingsPage] = useState<SettingsPage>("notifications")
  // iPhone shows one screen at a time; a call or setting is pushed on top of its list.
  const [pushed, setPushed] = useState(Boolean(initial.focusCallId))
  const [sidebar, setSidebar] = useState(true)
  const [filter, setFilter] = useState<"all" | "priority">("all")
  const [query, setQuery] = useState("")
  const [inboxOpen, setInboxOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState(0)
  const [prefs, setPrefs] = useState<Prefs>(() => readPrefs(initial.agentId))
  const { ensure } = feed

  useEffect(() => writePrefs(initial.agentId, prefs), [initial.agentId, prefs])
  useEffect(() => {
    if (selected) ensure(selected)
  }, [selected, ensure])

  const linked = integrations.filter((integration) => prefs.linked[integration.id])
  const allowed = (notice: Notice) => {
    const group = groupOf(notice.event.kind)
    return group ? prefs.notify[group] : false
  }
  const banners = feed.banners.filter(allowed)
  const inbox = feed.inbox.filter(allowed)
  const unread = inbox.filter((notice) => notice.at > lastSeen).length

  const analyzed = useMemo(() => {
    const map = new Map<string, ReturnType<typeof ownerEvent>>()
    for (const call of feed.calls) {
      const detail = feed.details[call.id]
      if (detail?.analyzed) map.set(call.id, ownerEvent(industry, dataOf(detail)))
    }
    return map
  }, [feed.calls, feed.details, industry])

  const needle = query.trim().toLowerCase()
  const calls = feed.calls.filter((call) => {
    if (filter === "priority" && !analyzed.get(call.id)?.priority) return false
    if (!needle) return true
    const data = dataOf(feed.details[call.id])
    return [readField(data, "caller_name"), readField(data, "reason"), call.number, formatPhone(call.number)].some((text) => text?.toLowerCase().includes(needle))
  })
  const appointments = feed.calls.filter((call) => {
    const kind = analyzed.get(call.id)?.kind
    return kind === "appointment" || kind === "change"
  })
  const calendar = linked.find((integration) => integration.id === "square") ?? linked.find((integration) => integration.category === "Calendar")

  function openCall(callId: string) {
    setSelected(callId)
    setPushed(true)
    setInboxOpen(false)
    if (section === "settings") setSection("calls")
  }

  function go(next: Section) {
    setSection(next)
    setPushed(false)
  }

  /* Columns ------------------------------------------------------------------------- */

  const navbar = (
    <div className="ip-navbar">
      {device === "ipad" ? (
        <button type="button" className="ip-toolbar-btn" aria-label={sidebar ? "Hide sidebar" : "Show sidebar"} onClick={() => setSidebar(!sidebar)}><SidebarIcon /></button>
      ) : null}
      <span className="ip-nav-spacer" />
      <button type="button" className="ip-toolbar-btn" aria-label={unread ? `Notifications, ${unread} new` : "Notifications"} onClick={() => { setInboxOpen(true); setLastSeen(Date.now()) }}>
        <BellIcon size={21} />
        {unread ? <i className="ip-badge">{unread}</i> : null}
      </button>
    </div>
  )

  const content =
    section === "calls" ? (
      <>
        {navbar}
        <h1 className="ip-large-title">Calls</h1>
        <label className="ip-search">
          <SearchIcon />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search calls" />
        </label>
        <div className="ip-segmented" role="tablist" aria-label="Filter calls">
          <button type="button" role="tab" aria-selected={filter === "all"} onClick={() => setFilter("all")}>All</button>
          <button type="button" role="tab" aria-selected={filter === "priority"} onClick={() => setFilter("priority")}>Priority</button>
        </div>
        {calls.length ? (
          <ul className="ip-list">
            {calls.map((call) => (
              <li key={call.id}>
                <CallCell call={call} detail={feed.details[call.id]} industry={industry} on={device === "ipad" && call.id === selected} onOpen={() => openCall(call.id)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="ip-empty">{needle ? "No results" : filter === "priority" ? "No appointments, urgent calls, or leads yet." : "No calls yet. Call the receptionist and it shows up here."}</p>
        )}
      </>
    ) : section === "appointments" ? (
      <>
        {navbar}
        <h1 className="ip-large-title">Appointments</h1>
        {calendar ? (
          <p className="ip-sync"><Tile background={calendar.tile.background} glyph={calendar.tile.glyph} size={20} />{calendar.name} linked · demo</p>
        ) : (
          <button type="button" className="ip-sync ip-sync-btn" onClick={() => { setSection("settings"); setSettingsPage("google_calendar"); setPushed(true) }}>Link a calendar (demo)</button>
        )}
        {appointments.length ? (
          <ul className="ip-list">
            {appointments.map((call) => {
              const data = dataOf(feed.details[call.id])
              return (
                <li key={call.id}>
                  <button type="button" className={device === "ipad" && call.id === selected ? "ip-cell ip-appt on" : "ip-cell ip-appt"} onClick={() => openCall(call.id)}>
                    <span className="ip-appt-time">{readField(data, "booked_for") ?? "Time not set"}</span>
                    <span className="ip-cell-main">
                      <span className="ip-cell-top"><b>{readField(data, "caller_name") ?? formatPhone(call.number) ?? "Caller"}</b><time>{call.startedAt ? formatShort(call.startedAt) : ""}</time></span>
                      <span className="ip-cell-line">{[readField(data, "service"), readField(data, "staff_preference") ? `with ${readField(data, "staff_preference")}` : null].filter(Boolean).join(" ") || analyzed.get(call.id)?.title}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="ip-empty">Nothing booked yet. Appointments the receptionist books show up here.</p>
        )}
        {initial.demo && appointments.length ? <p className="ip-section-f">Demo bookings. None of these are on a real calendar.</p> : null}
      </>
    ) : (
      <>
        {navbar}
        <h1 className="ip-large-title">Settings</h1>
        <SettingsList prefs={prefs} page={device === "ipad" ? settingsPage : null} onOpen={(page) => { setSettingsPage(page); setPushed(true) }} />
      </>
    )

  const detail =
    section === "settings" ? (
      <SettingsDetail page={settingsPage} prefs={prefs} setPrefs={setPrefs} business={initial.business} industry={industry} demo={initial.demo} />
    ) : selected ? (
      <CallScreen key={selected} summary={feed.calls.find((call) => call.id === selected) ?? null} detail={feed.details[selected]} error={feed.errors[selected] ?? null} industry={industry} watching={feed.watched.includes(selected)} demo={initial.demo} linked={linked} />
    ) : (
      <div className="ip-placeholder"><PhoneIcon size={40} /><p>No call selected</p></div>
    )

  return (
    <div className={`ip-app ${device}`}>
      <StatusBar />

      {device === "ipad" ? (
        <div className={sidebar ? "ip-columns" : "ip-columns no-sidebar"}>
          {sidebar ? (
            <nav className="ip-sidebar" aria-label="Sections">
              <div className="ip-sidebar-head">
                <span className="ip-app-icon small" aria-hidden="true">{initials(initial.business)}</span>
                <b>{initial.business}</b>
              </div>
              <ul>
                {SECTIONS.map((entry) => (
                  <li key={entry.id}>
                    <button type="button" className={section === entry.id ? "ip-side-item on" : "ip-side-item"} onClick={() => go(entry.id)} aria-current={section === entry.id || undefined}>
                      <span className="ip-side-icon">{entry.icon}</span>
                      <span>{entry.label}</span>
                      <span className="ip-side-count">{entry.id === "calls" ? feed.calls.length || "" : entry.id === "appointments" ? appointments.length || "" : ""}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <section className="ip-content" aria-label={section}>{content}</section>
          <section className="ip-detail" aria-live="polite">{detail}</section>
        </div>
      ) : (
        <div className="ip-phone">
          {pushed && (section === "settings" || selected) ? (
            <section className="ip-detail" aria-live="polite">
              <div className="ip-navbar">
                <button type="button" className="ip-back" onClick={() => setPushed(false)}><ChevronLeft />{SECTIONS.find((entry) => entry.id === section)?.label}</button>
              </div>
              {detail}
            </section>
          ) : (
            <section className="ip-content" aria-label={section}>{content}</section>
          )}
          <nav className="ip-tabbar" aria-label="Sections">
            {SECTIONS.map((entry) => (
              <button key={entry.id} type="button" className={section === entry.id ? "on" : undefined} onClick={() => go(entry.id)} aria-current={section === entry.id || undefined}>
                {entry.icon}
                <span>{entry.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      <span className="ip-home" aria-hidden="true" />

      <div className="ip-banners" aria-live="assertive">
        {banners.map((notice) => (
          <button key={notice.id} type="button" className="ip-banner" onClick={() => { feed.dismissBanner(notice.id); openCall(notice.callId) }}>
            <span className="ip-app-icon" aria-hidden="true">{initials(initial.business)}</span>
            <span className="ip-banner-body">
              <span className="ip-banner-top"><b>{notice.event.title}</b><time>now</time></span>
              <span className="ip-banner-text">{noticeText(notice)}</span>
            </span>
          </button>
        ))}
      </div>

      {inboxOpen ? (
        <Sheet title="Notifications" onClose={() => setInboxOpen(false)}>
          {inbox.length ? (
            <Group footer="Change what notifies you in Settings.">
              {inbox.map((notice) => (
                <li key={notice.id}>
                  <button type="button" className="ip-row ip-nav-row" onClick={() => openCall(notice.callId)}>
                    <EventDot kind={notice.event.kind} />
                    <span className="ip-row-main"><b>{notice.event.title}</b><small>{noticeText(notice)}</small></span>
                    <time className="ip-row-meta">{formatTime(notice.at)}</time>
                  </button>
                </li>
              ))}
            </Group>
          ) : (
            <p className="ip-empty">No notifications yet. Appointments, urgent calls, and leads show up here.</p>
          )}
        </Sheet>
      ) : null}
    </div>
  )
}

function noticeText(notice: Notice) {
  return notice.event.line || (notice.caller ? `${notice.caller} called` : "Tap to see the call")
}

function StatusBar() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M$/, "")
  const date = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  return (
    <div className="ip-status" aria-hidden="true">
      <span><time>{time}</time><span className="ip-status-date">{date}</span></span>
      <span className="ip-status-icons">
        <svg viewBox="0 0 18 12" width="17" height="11"><path d="M1 9h2v2H1zM5 7h2v4H5zM9 4h2v7H9zM13 1h2v10h-2z" fill="currentColor" /></svg>
        <svg viewBox="0 0 16 12" width="15" height="11"><path d="M8 10.5a1.2 1.2 0 1 0 0-.01M4.6 7.6a4.8 4.8 0 0 1 6.8 0M2.4 5.4a7.9 7.9 0 0 1 11.2 0M.4 3.3a10.8 10.8 0 0 1 15.2 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        <span className="ip-battery-pct">100%</span>
        <span className="ip-battery"><i /></span>
      </span>
    </div>
  )
}
