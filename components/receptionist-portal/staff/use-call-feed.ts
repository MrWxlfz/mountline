"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ownerRecentCalls, readStudioCall, stopStudioTestCall } from "@/app/(marketing)/receptionist/studio-actions"
import type { CallDetail, CallSummary } from "@/lib/receptionist/retell"
import type { Industry } from "@/lib/receptionist/studio/industries"
import { ownerEvent, readField, type OwnerEvent } from "@/lib/receptionist/studio/owner"

/*
 * The staff app's data: a receptionist's calls, each call's analysis once Retell has it, and a
 * notification for every priority event that happens while the app is open. Polls through team-only
 * server actions; nothing here touches Retell directly.
 */

export type Notice = { id: string; callId: string; event: OwnerEvent; caller: string | null; at: number }

export const OPEN = new Set(["registered", "ongoing"])
export const FAILED = new Set(["error", "not_connected"])
const TICK_MS = 3000
const LIST_EVERY = 2 // refresh the list every other tick
const WATCH_FOR_MS = 6 * 60_000
const BANNER_MS = 8000

/** Analysis values as a plain record (booleans arrive as "true"/"false"). */
export const dataOf = (call: CallDetail | undefined): Record<string, string> =>
  Object.fromEntries((call?.collected ?? []).map((field) => [field.key, field.value]))

export function useCallFeed(input: { agentId: string; industry: Industry; calls: CallSummary[]; focusCallId: string | null; loadedAt: number }) {
  const { agentId, industry, focusCallId, loadedAt } = input
  const [calls, setCalls] = useState<CallSummary[]>(() => withFocus(input.calls, focusCallId))
  const [details, setDetails] = useState<Record<string, CallDetail>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [banners, setBanners] = useState<Notice[]>([])
  const [inbox, setInbox] = useState<Notice[]>([])
  // Calls watched until Retell finishes analyzing them, and when each started being watched.
  const watching = useRef(new Map<string, number>(focusCallId ? [[focusCallId, loadedAt]] : []))
  const [watched, setWatched] = useState<string[]>(focusCallId ? [focusCallId] : [])
  const known = useRef(new Set(input.calls.map((call) => call.id)))
  const notified = useRef(new Set<string>())
  const nudged = useRef(new Set<string>())
  const fetched = useRef(new Set<string>())

  const notify = useCallback((callId: string, detail: CallDetail) => {
    if (notified.current.has(callId)) return
    notified.current.add(callId)
    const data = dataOf(detail)
    const event = ownerEvent(industry, data)
    if (!event.priority) return
    const notice: Notice = { id: `${callId}-${Date.now()}`, callId, event, caller: readField(data, "caller_name"), at: Date.now() }
    setBanners((current) => [notice, ...current].slice(0, 2))
    setInbox((current) => [notice, ...current].slice(0, 20))
    window.setTimeout(() => setBanners((current) => current.filter((entry) => entry.id !== notice.id)), BANNER_MS)
  }, [industry])

  const load = useCallback(async (callId: string) => {
    const read = await readStudioCall(callId)
    if (!read.ok) {
      setErrors((current) => ({ ...current, [callId]: read.error }))
      return null
    }
    setErrors((current) => {
      if (!(callId in current)) return current
      const next = { ...current }
      delete next[callId]
      return next
    })
    setDetails((current) => ({ ...current, [callId]: read.data }))
    return read.data
  }, [])

  // One loop: refresh the list now and then, and re-read every watched call until it's analyzed.
  useEffect(() => {
    let stopped = false
    let timer = 0
    let tick = 0
    const run = async () => {
      tick++
      if (tick % LIST_EVERY === 1) {
        const list = await ownerRecentCalls(agentId)
        if (stopped) return
        if (list.ok) {
          for (const call of list.data) {
            if (!known.current.has(call.id)) {
              known.current.add(call.id)
              // A call that started after the app opened: watch it and notify when it's analyzed.
              if ((call.startedAt ?? Date.now()) >= loadedAt - 60_000) watching.current.set(call.id, Date.now())
            }
          }
          setCalls((current) => withFocus(list.data, focusCallId, current))
        }
      }
      for (const [callId, since] of [...watching.current].slice(0, 4)) {
        const detail = await load(callId)
        if (stopped) return
        if (!detail) continue
        if (detail.analyzed) {
          watching.current.delete(callId)
          notify(callId, detail)
        } else if (FAILED.has(detail.status) || Date.now() - since > WATCH_FOR_MS) {
          watching.current.delete(callId)
        } else if (callId === focusCallId && OPEN.has(detail.status) && detail.direction === "web" && !nudged.current.has(callId) && Date.now() - since > 4000) {
          // The browser hung up but Retell still has the test call open: end it so analysis can start.
          nudged.current.add(callId)
          void stopStudioTestCall(callId)
        }
      }
      if (stopped) return
      setWatched([...watching.current.keys()])
      timer = window.setTimeout(run, TICK_MS)
    }
    timer = window.setTimeout(run, 800)
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [agentId, focusCallId, loadedAt, load, notify])

  /** Older calls load their details when opened. */
  const ensure = useCallback((callId: string) => {
    if (fetched.current.has(callId) || watching.current.has(callId)) return
    fetched.current.add(callId)
    void load(callId)
  }, [load])

  return {
    calls,
    details,
    errors,
    watched,
    banners,
    inbox,
    ensure,
    dismissBanner: (id: string) => setBanners((current) => current.filter((entry) => entry.id !== id)),
  }
}

/** Keeps the just-ended test call in the list even before Retell's list includes it. */
function withFocus(list: CallSummary[], focus: string | null, previous: CallSummary[] = []) {
  if (!focus || list.some((call) => call.id === focus)) return list
  const kept = previous.find((call) => call.id === focus) ?? { id: focus, status: "ended", direction: "web", number: "", startedAt: Date.now(), durationMs: null }
  return [kept, ...list]
}
