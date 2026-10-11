"use client"

import { Fragment, useCallback, useEffect, useRef, useState } from "react"

type Turn = { at: number; who: "agent" | "caller"; text: string; fills?: readonly string[] }
type Field = { key: string; label: string; value: string }

type Props = {
  label: string
  business: string
  situation: string
  turns: readonly Turn[]
  request: readonly Field[]
  requestTitle: string
  requestTime: string
  next: string
  nextLabel: string
  replay: string
  agent: string
  caller: string
}

/** Square brackets mark the words a request field comes from; they're shown highlighted. */
function Spoken({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((part, index) =>
        part.startsWith("[") ? <mark key={index}>{part.slice(1, -1)}</mark> : <Fragment key={index}>{part}</Fragment>,
      )}
    </>
  )
}

/**
 * The scripted example call, played like a live transcript once it's on screen: each line appears
 * after a short typing pause, and the request card fills in as each detail is heard. Text only; there
 * is no recording. Reduced motion (and no JavaScript) shows the finished call.
 */
export function CallDemo(props: Props) {
  const { turns, request } = props
  const [shown, setShown] = useState(turns.length)
  const [typing, setTyping] = useState<"agent" | "caller" | null>(null)
  const [played, setPlayed] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  const clear = () => {
    for (const timer of timers.current) window.clearTimeout(timer)
    timers.current = []
  }

  const play = useCallback(() => {
    clear()
    setShown(0)
    setTyping(null)
    setPlayed(true)
    turns.forEach((turn, index) => {
      timers.current.push(window.setTimeout(() => setTyping(turn.who), Math.max(0, turn.at - 700) + 400))
      timers.current.push(
        window.setTimeout(() => {
          setTyping(null)
          setShown(index + 1)
        }, turn.at + 400),
      )
    })
  }, [turns])

  useEffect(() => {
    const el = root.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        play()
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      clear()
    }
  }, [play])

  const heard = new Set(turns.slice(0, shown).flatMap((turn) => turn.fills ?? []))
  const done = shown === turns.length && !typing

  return (
    <div className="rx-call" ref={root}>
      <div className="rx-console" role="group" aria-label={props.label}>
        <div className="rx-console-h">
          <b><i aria-hidden="true" />{props.business}</b>
          <span>{props.label}</span>
        </div>
        <p className="rx-situation">{props.situation}</p>
        {/* Every line is laid out from the start (unplayed ones invisible), so the card never grows. */}
        <ol className="rx-lines" aria-live="polite">
          {turns.map((turn, index) => {
            const side = turn.who === "agent" ? "ln ai" : "ln cl"
            const state = index < shown ? "" : typing && index === shown ? " pending typing" : " pending"
            return (
              <li key={index} className={side + state} aria-hidden={index < shown ? undefined : true}>
                <span className="rx-text">
                  <span className="sr-only">{turn.who === "agent" ? props.agent : props.caller}: </span>
                  <Spoken text={turn.text} />
                </span>
                {typing && index === shown ? <span className="rx-dots"><i /><i /><i /></span> : null}
              </li>
            )
          })}
        </ol>
        {played && done ? (
          <button type="button" className="rx-replay hit" onClick={play}>{props.replay}</button>
        ) : null}
      </div>

      <div className="rx-request">
        <div className="rx-request-h">
          <b>{props.requestTitle}</b>
          <span>{props.requestTime}</span>
        </div>
        <dl>
          {request.map((field) => (
            <div key={field.key} className={heard.has(field.key) ? "filled" : undefined}>
              <dt>{field.label}</dt>
              <dd>{heard.has(field.key) ? field.value : "…"}</dd>
            </div>
          ))}
        </dl>
        <p className={done ? "rx-next" : "rx-next wait"}>
          <span>{props.nextLabel}</span>
          {props.next}
        </p>
      </div>
    </div>
  )
}
