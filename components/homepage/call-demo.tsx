"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { CornerDownRight, Pause, Play, RotateCcw } from "lucide-react"
import { demoCall, requestFields, type RequestFieldKey } from "@/lib/homepage/content"

type Mode = "static" | "armed" | "playing" | "paused" | "done"
type Beat = { at: number; shown: number; speaking: number | null; ringing: boolean }

const RING_MS = 1500
const lines = demoCall.lines
const fieldLabel = Object.fromEntries(requestFields.map((field) => [field.key, field.label])) as Record<RequestFieldKey, string>

// One beat per change on screen: the ring, then each line's voice followed by its words.
function buildTimeline(): Beat[] {
  const beats: Beat[] = [{ at: 0, shown: 0, speaking: null, ringing: true }]
  let at = RING_MS
  lines.forEach((line, index) => {
    beats.push({ at, shown: index, speaking: index, ringing: false })
    at += line.who === "mountline" ? 720 : 560
    beats.push({ at, shown: index + 1, speaking: null, ringing: false })
    at += 520 + line.text.length * 24 + (line.fills ? 360 : 0)
  })
  return beats
}

const timeline = buildTimeline()
const lastBeat = timeline.length - 1
const callSeconds = Math.round((timeline[lastBeat].at - RING_MS) / 1000) + 3

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

function Words({ text, marked }: { text: string; marked: boolean }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((part, index) =>
        part.startsWith("[") ? (
          <mark key={index} data-on={marked}>{part.slice(1, -1)}</mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  )
}

export function CallDemo({ note }: { note: string }) {
  const [mode, setMode] = useState<Mode>("static")
  const [cursor, setCursor] = useState(lastBeat)
  const [seconds, setSeconds] = useState(callSeconds)
  const stageRef = useRef<HTMLDivElement>(null)
  const pausedByUser = useRef(false)

  const beat = mode === "static" ? timeline[lastBeat] : timeline[cursor]
  const shown = beat.shown

  // Arm the sequence once we know motion is welcome; the server render stays complete.
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const node = stageRef.current
    if (motion.matches || !node || !("IntersectionObserver" in window)) return
    let armed = false
    // The first callback arrives as soon as observing starts: arm there, then play on sight.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!armed) {
          armed = true
          setCursor(0)
          setSeconds(0)
          setMode(entry.isIntersecting ? "playing" : "armed")
          return
        }
        setMode((current) => {
          if (entry.isIntersecting) {
            if (current === "armed") return "playing"
            if (current === "paused" && !pausedByUser.current) return "playing"
            return current
          }
          return current === "playing" ? "paused" : current
        })
      },
      { threshold: 0.35 },
    )
    observer.observe(node)

    const onPreference = () => {
      if (!motion.matches) return
      observer.disconnect()
      setMode("static")
    }
    motion.addEventListener("change", onPreference)
    return () => {
      observer.disconnect()
      motion.removeEventListener("change", onPreference)
    }
  }, [])

  // Advance one beat at a time while playing.
  useEffect(() => {
    if (mode !== "playing" || cursor >= lastBeat) return
    const next = cursor + 1
    const timer = window.setTimeout(() => {
      setCursor(next)
      if (next === lastBeat) setMode("done")
    }, timeline[next].at - timeline[cursor].at)
    return () => window.clearTimeout(timer)
  }, [mode, cursor])

  // The call clock only runs once the call is connected.
  useEffect(() => {
    if (mode !== "playing" || beat.ringing) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [mode, beat.ringing])

  const values = useMemo(() => {
    const result = {} as Partial<Record<RequestFieldKey, { value: string; line: number }>>
    lines.forEach((line, index) => {
      if (index >= shown) return
      line.fills?.forEach((fill) => {
        result[fill.field] = { value: fill.value, line: index }
      })
    })
    return result
  }, [shown])

  const finalValues = useMemo(() => {
    const result = {} as Record<RequestFieldKey, string>
    lines.forEach((line) => line.fills?.forEach((fill) => (result[fill.field] = fill.value)))
    return result
  }, [])

  const togglePlayback = () => {
    if (mode === "playing") {
      pausedByUser.current = true
      setMode("paused")
    } else if (mode === "done") {
      pausedByUser.current = false
      setCursor(0)
      setSeconds(0)
      setMode("playing")
    } else {
      pausedByUser.current = false
      setMode("playing")
    }
  }

  const callState = beat.ringing ? "Incoming call" : mode === "done" || mode === "static" ? "Call ended" : "On the call"
  const filledCount = requestFields.filter((field) => values[field.key]).length

  return (
    <figure className="ml-call" data-mode={mode} aria-labelledby="call-caption">
      <div className="ml-call__stage" ref={stageRef}>
        <section className="ml-call__line" aria-label="The call">
          <header className="ml-call__head">
            <span className="ml-call__state" data-ringing={beat.ringing}>
              <i aria-hidden="true" />
              {callState}
            </span>
            <span className="ml-call__meta">
              <span>{demoCall.callerId}</span>
              <span aria-hidden="true">·</span>
              <time className="ml-call__clock">{beat.ringing ? "0:00" : formatTime(seconds)}</time>
            </span>
          </header>

          <ol className="ml-call__transcript">
            {lines.map((line, index) => {
              const state = index < shown ? "shown" : beat.speaking === index ? "speaking" : "waiting"
              return (
                <li key={index} data-who={line.who} data-state={state}>
                  <span className="ml-call__who">{line.who === "caller" ? "Caller" : "Mountline"}</span>
                  <div className="ml-call__words">
                    <p>
                      <Words text={line.text} marked={state === "shown"} />
                    </p>
                    {line.fills ? (
                      <p className="ml-call__added">
                        <CornerDownRight aria-hidden="true" />
                        Added to request: {Array.from(new Set(line.fills.map((fill) => fieldLabel[fill.field]))).join(", ")}
                      </p>
                    ) : null}
                    <span className="ml-call__voice" aria-hidden="true"><i /><i /><i /><i /><i /></span>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="ml-ticket" aria-label="The service request your team receives">
          <header className="ml-ticket__head">
            <div>
              <h3>Service request</h3>
              <p>{demoCall.business} · fictional demo</p>
            </div>
            <p className="ml-ticket__time">Today, {demoCall.receivedAt}</p>
          </header>
          <dl className="ml-ticket__fields">
            {requestFields.map((field) => {
              const current = mode === "static" ? { value: finalValues[field.key], line: -1 } : values[field.key]
              const fresh = Boolean(current && current.line === shown - 1 && mode !== "static")
              return (
                <div key={field.key} data-field={field.key} data-filled={Boolean(current)} data-fresh={fresh}>
                  <dt>{field.label}</dt>
                  <dd>
                    {current ? (
                      <span className="ml-ticket__value" key={current.value}>
                        {field.key === "status" ? <i aria-hidden="true" /> : null}
                        {current.value}
                      </span>
                    ) : (
                      <span className="ml-ticket__empty" aria-hidden="true" />
                    )}
                  </dd>
                </div>
              )
            })}
          </dl>
          <footer className="ml-ticket__foot">
            <span>For: Office team</span>
            <span aria-live="off">{mode === "static" || mode === "done" ? "Ready for a callback" : `${filledCount} of ${requestFields.length} filled`}</span>
          </footer>
        </section>
      </div>

      <figcaption className="ml-call__caption">
        <p id="call-caption">{note}</p>
        {mode !== "static" ? (
          <button type="button" className="ml-call__control" onClick={togglePlayback}>
            {mode === "playing" ? (
              <><Pause aria-hidden="true" /> Pause</>
            ) : mode === "done" ? (
              <><RotateCcw aria-hidden="true" /> Replay the call</>
            ) : (
              <><Play aria-hidden="true" /> Play</>
            )}
          </button>
        ) : null}
      </figcaption>
    </figure>
  )
}
