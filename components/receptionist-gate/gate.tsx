"use client"

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MountlineMark, Wordmark } from "@/components/brand/wordmark"
import { BookButton } from "@/components/site/booking"
import { site } from "@/content/site"
import { unlockReceptionist } from "@/app/(marketing)/receptionist/actions"

type Phase = "idle" | "checking" | "wrong" | "right" | "leaving"

/**
 * The /receptionist password screen, in /id's visual language. The check happens on the server
 * (actions.ts); on success the page refreshes in place and the server renders the real content.
 */
export function ReceptionistGate() {
  const copy = site.receptionistGate
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [shake, setShake] = useState(0)
  const [, startTransition] = useTransition()

  useEffect(() => {
    // Desktop only, so a phone keyboard doesn't jump up uninvited.
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (phase === "checking" || phase === "right" || phase === "leaving" || !password) return
    setPhase("checking")
    const { ok } = await unlockReceptionist(password)
    if (!ok) {
      setPhase("wrong")
      setShake((count) => count + 1)
      input.current?.focus()
      input.current?.select()
      return
    }
    setPhase("right")
    await new Promise((resolve) => setTimeout(resolve, 300))
    setPhase("leaving")
    await new Promise((resolve) => setTimeout(resolve, 250))
    startTransition(() => router.refresh())
  }

  const wrong = phase === "wrong"

  return (
    <div className={phase === "leaving" ? "mk-id gate leaving" : "mk-id gate"}>
      <div className="page">
        <header className="top">
          <Link href="/" aria-label="Mountline home" className="logo hit">
            <Wordmark />
          </Link>
          <Link href="/" className="top-link hit">
            mountline.dev
            <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M4.5 9.5l5-5M5.5 4.5h4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </header>
        <main>
          <div className="col">
            <div className="head">
              <span className="tile" aria-hidden="true"><MountlineMark /></span>
              <h1>{copy.title}</h1>
              <p className="sub">{copy.sub}</p>
            </div>
            <form className="card" onSubmit={submit} noValidate>
              <label htmlFor="rx-password">{copy.label}</label>
              <div key={shake} className={`field${wrong ? " bad" : ""}${shake ? " shake" : ""}`}>
                <input
                  ref={input}
                  id="rx-password"
                  className="plain with-toggle"
                  type={visible ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (wrong) setPhase("idle")
                  }}
                  aria-invalid={wrong || undefined}
                  aria-describedby={wrong ? "rx-error" : undefined}
                />
                <button
                  type="button"
                  className="toggle hit"
                  aria-label={visible ? copy.hide : copy.show}
                  aria-pressed={visible}
                  onClick={() => setVisible((value) => !value)}
                >
                  <EyeIcon open={!visible} />
                </button>
              </div>
              {wrong ? <p className="err" id="rx-error" role="alert">{copy.wrong}</p> : null}
              <button type="submit" className="btn" disabled={phase === "checking" || phase === "right" || phase === "leaving"}>
                {phase === "checking" ? (
                  <><span className="spin" aria-hidden="true" />{copy.checking}</>
                ) : phase === "right" || phase === "leaving" ? (
                  <svg className="tick" viewBox="0 0 18 18" fill="none" aria-label="Unlocked">
                    <path d="M4 9.4 7.4 12.6 14 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  copy.submit
                )}
              </button>
            </form>
            <p className="below">
              {copy.noPassword} <BookButton>{site.cta.book}</BookButton>
            </p>
          </div>
        </main>
        <footer>
          <Link href="/" className="hit">{copy.back}</Link>
        </footer>
      </div>
    </div>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1.8 8s2.3-4.2 6.2-4.2S14.2 8 14.2 8s-2.3 4.2-6.2 4.2S1.8 8 1.8 8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.9" stroke="currentColor" strokeWidth="1.3" />
      {open ? null : <path d="M2.5 13.5 13.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />}
    </svg>
  )
}
