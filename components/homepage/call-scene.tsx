"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import { Pause, Play, RotateCcw } from "lucide-react"
import { callScene, demoCall } from "@/lib/homepage/content"
import "./call-scene.css"

/**
 * The receptionist, told as one scene: someone calls, it asks a few questions, and the business
 * gets a clear message. It's a scripted text example. There is no audio, so nothing here pretends
 * to be sound: no player, no waveform. Nothing moves until someone presses Play, and the still
 * view before that already shows the whole story.
 */

type Mode = "still" | "playing" | "paused" | "done"

const lines = callScene.excerpt.map((index) => ({ index, ...demoCall.lines[index] }))
const plain = (text: string) => text.replace(/[[\]]/g, "")
// Reading pace: a beat before each line, then time to read it.
const lineMs = lines.map((line) => 900 + plain(line.text).length * 40)
const starts = lineMs.reduce<number[]>((acc, ms, i) => [...acc, i ? acc[i - 1] + lineMs[i - 1] : 0], [])
const TALK_MS = starts[starts.length - 1] + lineMs[lineMs.length - 1]
// A last beat for the message to come forward.
const TOTAL_MS = TALK_MS + 1200

const beats = ["Someone calls", "It asks a few questions", "Your team gets a clear message"] as const

function clock(ms: number) {
  const seconds = Math.round(ms / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((part, i) =>
        part.startsWith("[") ? <mark key={i}>{part.slice(1, -1)}</mark> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  )
}

export function CallScene({ note }: { note: string }) {
  const [mode, setMode] = useState<Mode>("still")
  const [elapsed, setElapsed] = useState(0)
  const elapsedRef = useRef(0)
  const figureRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (mode !== "playing") return
    let frame = 0
    const startedAt = performance.now() - elapsedRef.current
    const tick = (now: number) => {
      const ms = Math.min(TOTAL_MS, now - startedAt)
      elapsedRef.current = ms
      // Re-render only when something visible changes: roughly ten times a second.
      setElapsed((value) => (Math.floor(value / 100) === Math.floor(ms / 100) ? value : ms))
      if (ms >= TOTAL_MS) {
        setMode("done")
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    // Scrolling away or switching tabs pauses. It never resumes by itself.
    const node = figureRef.current
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setMode("paused")
    })
    if (node) observer.observe(node)
    const onHidden = () => {
      if (document.hidden) setMode("paused")
    }
    document.addEventListener("visibilitychange", onHidden)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener("visibilitychange", onHidden)
    }
  }, [mode])

  function toggle() {
    if (mode === "playing") {
      setMode("paused")
      return
    }
    if (mode === "still" || mode === "done") {
      elapsedRef.current = 0
      setElapsed(0)
    }
    setMode("playing")
  }

  const running = mode === "playing" || mode === "paused"
  // How many excerpt lines have started, and whether the message has come forward.
  const shown = running ? starts.filter((start) => elapsed >= start).length : lines.length
  const heardUpTo = running ? (shown ? lines[shown - 1].index : -1) : Infinity
  const delivered = !running || elapsed >= TALK_MS
  const beat = !running ? -1 : delivered ? 2 : shown <= 1 ? 0 : 1
  const latest = running && shown ? lines[shown - 1].index : -1

  const label = mode === "playing" ? "Pause" : mode === "paused" ? "Resume" : mode === "done" ? "Play again" : "Play the example"
  const Icon = mode === "playing" ? Pause : mode === "done" ? RotateCcw : Play

  return (
    <figure ref={figureRef} className="hp-call" data-mode={mode} data-delivered={delivered || undefined} aria-labelledby="call-scene-note">
      <div className="hp-call__bar">
        <div>
          <p className="hp-call__kind">Scripted example · text only, no audio</p>
          <p className="hp-call__situation">
            {demoCall.receivedAt}, office closed. A homeowner calls {demoCall.business}, a made-up HVAC company.
          </p>
        </div>
        <div className="hp-call__controls">
          <button type="button" className="hp-call__play" onClick={toggle} aria-describedby="call-scene-length">
            <Icon aria-hidden="true" />
            {label}
          </button>
          <span className="hp-call__time" id="call-scene-length">
            {running ? `${clock(elapsed)} / ${clock(TOTAL_MS)}` : `About ${Math.round(TOTAL_MS / 1000)} seconds`}
          </span>
        </div>
      </div>

      <div className="hp-call__body">
        <ol className="hp-call__lines" aria-label="Part of the call">
          {lines.map((line, i) => {
            const state = i < shown - 1 || !running ? "heard" : i === shown - 1 ? "current" : "upcoming"
            return (
              <Fragment key={line.index}>
                {line.index === 6 ? (
                  <li className="hp-call__skip" data-state={state === "upcoming" ? "upcoming" : "heard"}>
                    <span>One more question about the system</span>
                  </li>
                ) : null}
                <li data-who={line.who} data-state={state}>
                  <span className="hp-call__who">{line.who === "caller" ? "Caller" : "AI receptionist"}</span>
                  <p><Words text={line.text} /></p>
                </li>
              </Fragment>
            )
          })}
        </ol>

        <section className="hp-message" aria-label="The message the business gets">
          <header className="hp-message__head">
            <span className="hp-message__dot" aria-hidden="true" />
            <div>
              <h3>New call request</h3>
              <p>{demoCall.business} · fictional</p>
            </div>
            <span className="hp-message__time">Today, 6:49 PM</span>
          </header>
          <dl className="hp-message__fields">
            {callScene.message.map((field) => {
              const filled = heardUpTo >= field.line
              return (
                <div key={field.key} data-filled={filled || undefined} data-fresh={(running && latest === field.line) || undefined}>
                  <dt>{field.label}</dt>
                  <dd>{filled ? field.value : <span className="hp-message__empty"><span className="sr-only">Not heard yet</span></span>}</dd>
                </div>
              )
            })}
          </dl>
          <p className="hp-message__next">
            <span>Next step</span>
            {delivered ? callScene.next : "…"}
          </p>
        </section>
      </div>

      <ol className="hp-call__beats" aria-label="What happens">
        {beats.map((item, i) => (
          <li key={item} data-state={beat === -1 ? "lit" : i < beat ? "lit" : i === beat ? "current" : "dim"}>
            <span aria-hidden="true">{i + 1}</span>
            {item}
          </li>
        ))}
      </ol>

      <figcaption id="call-scene-note" className="hp-call__note">{note}</figcaption>
      <p className="sr-only" role="status">
        {mode === "playing" ? "Playing the example call." : mode === "paused" ? "Paused." : mode === "done" ? "Finished. The message is ready for the team." : ""}
      </p>
    </figure>
  )
}

/** The whole example call, for anyone who wants every line. */
export function FullTranscript() {
  return (
    <details className="hp-transcript">
      <summary>
        Read the whole example call
        <i aria-hidden="true" />
      </summary>
      <ol>
        {demoCall.lines.map((line, i) => (
          <li key={i} data-who={line.who}>
            <span>{line.who === "caller" ? "Caller" : "AI receptionist"}</span>
            <p>{plain(line.text)}</p>
          </li>
        ))}
      </ol>
    </details>
  )
}
