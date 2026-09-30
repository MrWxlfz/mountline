"use client"

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Check, Mic, MicOff, Pause, Phone, PhoneOff, Play, RotateCcw, SkipForward, X } from "lucide-react"
import { demoCall } from "@/lib/homepage/content"
import { exampleCall, type ExampleField, type ExampleTurn } from "@/lib/receptionist/example-call"
import { receptionistDemo } from "@/lib/receptionist/demo"
import { useLiveDemo, type LiveState } from "./use-live-demo"
import "./call-console.css"

/**
 * The receptionist call console. Two separate paths share one surface:
 *
 * - Talk in your browser: a real browser call to the demo agent (see use-live-demo.ts). Status, audio
 *   level, and the post-call transcript and summary all come from the call itself.
 * - Play a short example: a scripted text example, with no audio and a made-up caller. It never
 *   looks like a live call, and its finished message is readable at any point.
 *
 * The console keeps its size in every state, and the controls stay in the same place.
 */

type Mode = "rest" | "example" | "live"
type Play = "playing" | "paused" | "done"

const turns: readonly ExampleTurn[] = exampleCall.turns
const LENGTH = exampleCall.lengthMs
const plain = (text: string) => text.replace(/[[\]]/g, "")

function clock(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
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

/** Slides items to their new places when a turn is added, instead of letting them jump. */
function useFlip(list: React.RefObject<HTMLOListElement | null>, key: number) {
  const last = useRef(new Map<string, number>())
  useLayoutEffect(() => {
    const node = list.current
    if (!node) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const next = new Map<string, number>()
    node.querySelectorAll<HTMLElement>("[data-key]").forEach((item) => {
      const id = item.dataset.key!
      const top = item.offsetTop
      next.set(id, top)
      const before = last.current.get(id)
      if (reduce || before === undefined || before === top) return
      item.animate([{ transform: `translateY(${before - top}px)` }, { transform: "translateY(0)" }], { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)" })
    })
    last.current = next
  }, [list, key])
}

function statusLabel(mode: Mode, play: Play, live: LiveState) {
  if (mode === "rest") return "Ready"
  if (mode === "example") return play === "done" ? "Example finished" : play === "paused" ? "Example paused" : "Example · text only, no audio"
  switch (live.phase) {
    case "permission": return "Waiting for your microphone"
    case "connecting": return "Connecting"
    case "active": return live.muted ? "Live · you’re muted" : live.agentTalking === null ? "Live" : live.agentTalking ? "Live · receptionist talking" : "Live · your turn"
    case "ending": return "Ending the call"
    case "ended": return "Call ended"
    case "error": return "Call not started"
    default: return "Ready"
  }
}

export function CallConsole({ liveAvailable }: { liveAvailable: boolean }) {
  const [chosen, setMode] = useState<Mode>("rest")
  const [play, setPlay] = useState<Play>("playing")
  const [elapsed, setElapsed] = useState(0)
  const [now, setNow] = useState(0)
  const elapsedRef = useRef(0)
  const rootRef = useRef<HTMLElement>(null)
  const lightRef = useRef<HTMLSpanElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const smooth = useRef(0)

  const onLevel = useCallback((level: number) => {
    // Real receptionist audio, eased so the light breathes instead of flickering.
    smooth.current = smooth.current * 0.7 + Math.min(1, level * 5) * 0.3
    lightRef.current?.style.setProperty("--level", smooth.current.toFixed(3))
  }, [])
  const live = useLiveDemo({ onLevel })
  const ls = live.state
  // A cancelled connection returns the hook to idle, and the console follows it back to the start.
  const mode: Mode = chosen === "live" && ls.phase === "idle" ? "rest" : chosen

  /* The example's clock. Runs only while playing; scrolling away or hiding the tab pauses it. */
  useEffect(() => {
    if (mode !== "example" || play !== "playing") return
    let frame = 0
    const startedAt = performance.now() - elapsedRef.current
    const tick = (time: number) => {
      const ms = Math.min(LENGTH, time - startedAt)
      elapsedRef.current = ms
      setElapsed((value) => (Math.floor(value / 100) === Math.floor(ms / 100) ? value : ms))
      if (ms >= LENGTH) {
        setPlay("done")
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const node = rootRef.current
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlay("paused")
    })
    if (node) observer.observe(node)
    const onHidden = () => document.hidden && setPlay("paused")
    document.addEventListener("visibilitychange", onHidden)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener("visibilitychange", onHidden)
    }
  }, [mode, play])

  /* The live call's clock. */
  useEffect(() => {
    if (mode !== "live" || ls.phase !== "active") return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [mode, ls.phase])

  const shown = mode === "example" ? turns.filter((turn) => elapsed >= turn.at).length : 0
  useFlip(listRef, shown)

  function startExample() {
    elapsedRef.current = 0
    setElapsed(0)
    setPlay("playing")
    setMode("example")
  }
  function seeMessage() {
    elapsedRef.current = LENGTH
    setElapsed(LENGTH)
    setPlay("done")
  }
  function close() {
    if (mode === "live") live.reset()
    setMode("rest")
    requestAnimationFrame(() => primaryRef.current?.focus())
  }
  function talk() {
    if (!liveAvailable) return
    setMode("live")
    void live.start()
  }

  /* What the request sheet shows. */
  const filled = new Set<ExampleField>()
  if (mode === "example") turns.slice(0, shown).forEach((turn) => turn.fills?.forEach((field) => filled.add(field)))
  const latest = mode === "example" && shown ? turns[shown - 1] : null
  const exampleDone = mode === "example" && play === "done"
  const settled = mode === "rest" || exampleDone

  const liveClock =
    ls.phase === "active" && ls.liveAt ? `${clock(Math.max(0, now - ls.liveAt))} / ${clock(ls.maxSeconds * 1000)}` : ls.phase === "ended" && ls.liveAt && ls.endedAt ? clock(ls.endedAt - ls.liveAt) : ""
  const timeText = mode === "example" ? `${clock(elapsed)} / ${clock(LENGTH)}` : mode === "live" ? liveClock : ""

  const callButton = (
    <a href={receptionistDemo.phoneHref} className="ml-btn ml-btn--solid cc__btn" aria-label={`Call the demo line at ${receptionistDemo.displayPhone}`}>
      <Phone aria-hidden="true" /> Call the demo line
    </a>
  )
  const talkButton = liveAvailable ? (
    <button ref={primaryRef} type="button" className="ml-btn ml-btn--solid cc__btn" onClick={talk}>
      <Mic aria-hidden="true" /> Talk in your browser
    </button>
  ) : callButton

  return (
    <section
      ref={rootRef}
      className="cc"
      data-mode={mode}
      data-phase={mode === "live" ? ls.phase : mode === "example" ? play : "rest"}
      aria-labelledby="cc-title"
    >
      <h3 id="cc-title" className="sr-only">Receptionist demo</h3>
      <div className="cc__main">
        <header className="cc__status">
          <span ref={lightRef} className="cc__light" aria-hidden="true" />
          <span className="cc__who">
            North Texas Air &amp; Heat <span>· fictional</span>
          </span>
          <span className="cc__state" aria-hidden="true">{statusLabel(mode, play, ls)}</span>
          <span className="cc__time">{timeText}</span>
        </header>

        <div className="cc__stage">
          {mode === "rest" ? (
            <div className="cc__rest">
              <p className="cc__intro">
                Ask it what a customer would. It answers as <strong>North Texas Air &amp; Heat</strong>, a made-up HVAC
                company, then writes up the request for the team.
              </p>
              <ul className="cc__tries" aria-label="Things to try saying">
                {exampleCall.tries.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="cc__note">
                {liveAvailable
                  ? "Talking uses your microphone and lasts up to three minutes. It’s an AI demo, so please use made-up details."
                  : "Talking in the browser isn’t switched on yet. Call the demo line from any phone, or play the short example."}
              </p>
            </div>
          ) : null}

          {mode === "example" ? (
            <ol ref={listRef} className="cc__turns" aria-label="The example call so far">
              {turns.slice(0, shown).map((turn, index) => (
                <li
                  key={turn.at}
                  data-key={turn.at}
                  data-who={turn.who}
                  data-age={Math.min(3, shown - 1 - index)}
                >
                  <span className="cc__speaker">{turn.who === "caller" ? "Caller" : "AI receptionist"}</span>
                  <p><Words text={turn.text} /></p>
                </li>
              ))}
            </ol>
          ) : null}

          {mode === "live" ? <LiveStage state={ls} /> : null}
        </div>

        <div className="cc__controls">
          {mode === "rest" ? (
            <>
              {talkButton}
              <button type="button" className="ml-btn ml-btn--line cc__btn" onClick={startExample}>
                <Play aria-hidden="true" /> Play a short example <span className="cc__hint">{Math.floor(LENGTH / 1000)} s</span>
              </button>
            </>
          ) : null}

          {mode === "example" ? (
            <>
              {play === "done" ? (
                <>
                  <button type="button" className="ml-btn ml-btn--line cc__btn" onClick={startExample}>
                    <RotateCcw aria-hidden="true" /> Replay
                  </button>
                  {talkButton}
                </>
              ) : (
                <>
                  <button type="button" className="ml-btn ml-btn--line cc__btn" onClick={() => setPlay(play === "playing" ? "paused" : "playing")}>
                    {play === "playing" ? <><Pause aria-hidden="true" /> Pause</> : <><Play aria-hidden="true" /> Resume</>}
                  </button>
                  <button type="button" className="ml-btn ml-btn--line cc__btn" onClick={seeMessage}>
                    <SkipForward aria-hidden="true" /> See the message
                  </button>
                </>
              )}
              <button type="button" className="cc__close" onClick={close} aria-label="Close the example">
                <X aria-hidden="true" />
              </button>
            </>
          ) : null}

          {mode === "live" ? <LiveControls state={ls} onEnd={() => void live.end()} onMute={live.toggleMute} onRetry={() => void live.start()} onClose={close} callButton={callButton} /> : null}
        </div>
      </div>

      <aside className="cc__sheet" data-settled={settled || undefined} aria-label="The message the business gets">
        {mode === "live" ? (
          <LiveSheet state={ls} />
        ) : (
          <>
            <header className="cc__sheet-head">
              <span className="cc__chip">{mode === "rest" ? "From the example call" : "Example request · made-up caller"}</span>
              <h4>New call request</h4>
              <p>{exampleCall.business} · {exampleCall.receivedAt}</p>
            </header>
            <dl className="cc__fields">
              {exampleCall.request.map((field) => {
                const on = mode === "rest" || filled.has(field.key)
                const fresh = Boolean(latest?.fills?.includes(field.key) && play !== "done")
                return (
                  <div key={field.key} data-on={on || undefined} data-fresh={fresh || undefined}>
                    <dt>{field.label}</dt>
                    <dd>{on ? field.value : <span className="cc__empty"><span className="sr-only">Not heard yet</span></span>}</dd>
                  </div>
                )
              })}
            </dl>
            <p className="cc__next" data-on={settled || undefined}>
              <span>Next step</span>
              {settled ? exampleCall.next : "Waiting for the end of the call"}
            </p>
            <p className="cc__ready" aria-hidden={!settled}>
              <Check aria-hidden="true" /> Ready for the team
            </p>
          </>
        )}
      </aside>

      <p className="sr-only" role="status" aria-live="polite">
        {mode === "example"
          ? play === "done" ? `Example finished. ${exampleCall.next}` : latest ? `${latest.who === "caller" ? "Caller" : "AI receptionist"}: ${plain(latest.text)}` : ""
          : mode === "live" ? statusLabel(mode, play, ls) : ""}
      </p>
    </section>
  )
}

function LiveStage({ state }: { state: LiveState }) {
  if (state.phase === "permission") {
    return (
      <div className="cc__live">
        <p className="cc__intro">Allow the microphone when your browser asks. Nothing starts until you do.</p>
      </div>
    )
  }
  if (state.phase === "connecting") {
    return (
      <div className="cc__live">
        <p className="cc__intro">Connecting you to the demo receptionist…</p>
        {state.slow ? <p className="cc__note">Still connecting. This can take a little longer on a slow connection.</p> : null}
      </div>
    )
  }
  if (state.phase === "error") {
    return (
      <div className="cc__live" data-tone="error">
        <p className="cc__intro">{state.error?.message}</p>
      </div>
    )
  }
  if (state.phase === "ended") {
    const record = state.record.data
    const reason = record?.disconnectionReason
    const why = reason === "agent_hangup" ? "The receptionist ended the call." : reason === "max_duration_reached" ? "It reached the three-minute limit for demo calls." : reason === "inactivity" ? "It ended after a stretch of silence." : null
    return (
      <div className="cc__live">
        <p className="cc__intro">
          Call ended{state.liveAt && state.endedAt ? ` after ${clock(state.endedAt - state.liveAt)}` : ""}. {why}
        </p>
        <p className="cc__note">The transcript and summary are with the request. It was a demo, so nothing was sent to a business.</p>
      </div>
    )
  }
  return (
    <div className="cc__live">
      <p className="cc__intro">
        You’re talking to the AI receptionist for <strong>North Texas Air &amp; Heat</strong>, a made-up HVAC company.
        Speak normally, and use made-up details.
      </p>
      <ul className="cc__tries" aria-label="Things to try saying">
        {exampleCall.tries.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <p className="cc__note">Captions aren’t shown during the call. The transcript appears here when you hang up.</p>
    </div>
  )
}

function LiveControls({ state, onEnd, onMute, onRetry, onClose, callButton }: { state: LiveState; onEnd: () => void; onMute: () => void; onRetry: () => void; onClose: () => void; callButton: React.ReactNode }) {
  switch (state.phase) {
    case "permission":
      return <button type="button" className="ml-btn ml-btn--line cc__btn" disabled>Waiting for permission…</button>
    case "connecting":
      return (
        <button type="button" className="ml-btn ml-btn--line cc__btn" onClick={onEnd}>
          <X aria-hidden="true" /> Cancel
        </button>
      )
    case "active":
    case "ending":
      return (
        <>
          <button type="button" className="ml-btn ml-btn--line cc__btn" onClick={onMute} aria-pressed={state.muted} disabled={state.phase === "ending"}>
            {state.muted ? <><MicOff aria-hidden="true" /> Unmute</> : <><Mic aria-hidden="true" /> Mute</>}
          </button>
          <button type="button" className="ml-btn ml-btn--solid cc__btn cc__btn--end" onClick={onEnd} disabled={state.phase === "ending"}>
            <PhoneOff aria-hidden="true" /> {state.phase === "ending" ? "Ending…" : "End call"}
          </button>
        </>
      )
    case "ended":
      return (
        <>
          <button type="button" className="ml-btn ml-btn--solid cc__btn" onClick={onRetry}>
            <Mic aria-hidden="true" /> Talk again
          </button>
          <button type="button" className="ml-btn ml-btn--line cc__btn" onClick={onClose}>Done</button>
        </>
      )
    case "error":
      return (
        <>
          {state.error?.retry ? (
            <button type="button" className="ml-btn ml-btn--line cc__btn" onClick={onRetry}>
              <RotateCcw aria-hidden="true" /> Try again
            </button>
          ) : null}
          {callButton}
          <button type="button" className="cc__close" onClick={onClose} aria-label="Back to the start">
            <X aria-hidden="true" />
          </button>
        </>
      )
    default:
      return null
  }
}

function LiveSheet({ state }: { state: LiveState }) {
  const record = state.record.data
  const ended = state.phase === "ended"
  return (
    <>
      <header className="cc__sheet-head">
        <span className="cc__chip">Your demo call · not sent to any business</span>
        <h4>{ended ? "What the call left behind" : "New call request"}</h4>
        <p>North Texas Air &amp; Heat · fictional</p>
      </header>
      {!ended ? (
        <p className="cc__sheet-wait">
          {state.phase === "error"
            ? "No call was made, so there’s nothing to show."
            : "When you hang up, the transcript and the summary from our voice provider appear here."}
        </p>
      ) : state.record.state === "failed" ? (
        <p className="cc__sheet-wait">The call record didn’t come through. It was a demo, so nothing was lost or sent anywhere.</p>
      ) : !record ? (
        <p className="cc__sheet-wait">Loading the call record…</p>
      ) : (
        <div className="cc__record">
          <div className="cc__summary">
            <span>Summary</span>
            {record.analysis.state === "ready" && record.analysis.summary ? (
              <p>{record.analysis.summary}</p>
            ) : record.analysis.state === "pending" && state.record.state === "stale" ? (
              <p className="cc__pending">The summary didn’t arrive, so we stopped waiting for it. It was a demo, so nothing was sent anywhere.</p>
            ) : record.analysis.state === "pending" ? (
              <p className="cc__pending">Our voice provider is still writing the summary…</p>
            ) : (
              <p className="cc__pending">No summary came back for this call.</p>
            )}
          </div>
          {record.analysis.details.length ? (
            <dl className="cc__fields" data-live>
              {record.analysis.details.map((item) => (
                <div key={item.label} data-on>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {record.transcript.length ? (
            <details className="cc__live-transcript">
              <summary>Transcript ({record.transcript.length} turns)</summary>
              <ol>
                {record.transcript.map((turn, i) => (
                  <li key={i} data-who={turn.role}>
                    <span>{turn.role === "caller" ? "You" : "AI receptionist"}</span>
                    <p>{turn.text}</p>
                  </li>
                ))}
              </ol>
            </details>
          ) : (
            <p className="cc__pending">{record.analysis.state === "pending" ? "The transcript is on its way…" : "No transcript came back for this call."}</p>
          )}
          <p className="cc__source">From our voice provider’s record of this call. Summaries are written by AI and can be wrong.</p>
        </div>
      )}
    </>
  )
}

/** The whole example call, for anyone who wants every line. */
export function FullTranscript() {
  return (
    <details className="cc-transcript">
      <summary>
        Read the whole example call
        <i aria-hidden="true" />
      </summary>
      <p className="cc-transcript__note">The animated example above is shortened. This is the full scripted call, with a made-up caller.</p>
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
