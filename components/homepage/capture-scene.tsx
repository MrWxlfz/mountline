"use client"

import { useEffect, useRef, useState } from "react"
import { SamplePhoto } from "@/components/homepage/sample-photo"
import { samplePhotos, type SamplePhotoId } from "@/lib/homepage/sample-photos"
import "./capture-scene.css"

/**
 * Mountline Capture, told with photographs: a short sequence from a grooming room, then the same
 * pictures in their places on Bramble's website. The photos are licensed sample images, labeled as
 * such; they aren't a shoot Mountline did, and Bramble isn't a client.
 *
 * Each photo is one element that moves and re-crops between the two arrangements, so the relationship
 * is visible rather than explained. It plays once when it comes into view; the two buttons choose
 * either state at any time, and with reduced motion they switch instantly.
 */

type State = "shoot" | "site"

const frames: Array<{ id: SamplePhotoId; caption: string }> = [
  { id: "work", caption: "The work" },
  { id: "room", caption: "The room" },
  { id: "door", caption: "The way in" },
  { id: "dryer", caption: "The care" },
  { id: "result", caption: "The result" },
]

export function CaptureScene() {
  const [state, setState] = useState<State>("shoot")
  const touched = useRef(false)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = stageRef.current
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let timer = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        timer = window.setTimeout(() => {
          if (!touched.current) setState("site")
        }, 1600)
      },
      { threshold: 0.6 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [])

  function choose(next: State) {
    touched.current = true
    setState(next)
  }

  return (
    <figure className="cs" data-state={state} aria-labelledby="cs-caption">
      <div className="cs__bar">
        <div className="cs__switch" role="group" aria-label="Show the photos">
          <button type="button" aria-pressed={state === "shoot"} onClick={() => choose("shoot")}>The shoot</button>
          <button type="button" aria-pressed={state === "site"} onClick={() => choose("site")}>On the website</button>
        </div>
        <span className="hp-tag">Sample imagery · Website concept</span>
      </div>

      <div ref={stageRef} className="cs__stage">
        {/* The page around the photos. It's a picture of Bramble's site, so it's hidden from assistive tech. */}
        <div className="cs__page" aria-hidden="true">
          <span className="cs__chrome"><i /><i /><i /></span>
          <span className="cs__nav"><b>Bramble</b><span>Services</span><span>Hours</span><span>Visit</span><em>Request a visit</em></span>
          <span className="cs__copy">
            <small>Keller, Texas · By appointment</small>
            <strong>Calm, careful dog grooming in Keller.</strong>
            <span>One dog at a time, in a quiet room. We’ll text you when yours is ready.</span>
            <em>Request an appointment</em>
          </span>
          <span className="cs__inside">Inside Bramble</span>
        </div>

        {frames.map((frame, index) => (
          <div key={frame.id} className="cs__photo" data-photo={frame.id} style={{ "--i": index } as React.CSSProperties}>
            <SamplePhoto id={frame.id} describe sizes={frame.id === "work" ? "(max-width: 760px) 100vw, 60vw" : "(max-width: 760px) 50vw, 25vw"} />
            <span className="cs__caption" aria-hidden="true">{frame.caption}</span>
          </div>
        ))}
      </div>

      <figcaption id="cs-caption" className="cs__note">
        <span>
          Sample photos for Bramble, the made-up groomer in our examples, and where they’d sit on its website. Not a
          Mountline shoot, and Bramble isn’t a client.
        </span>
        <details className="cs__credits">
          <summary>Photo credits</summary>
          <p>
            Free photos from Unsplash by{" "}
            {frames.map((frame, index) => {
              const credit = samplePhotos[frame.id].credit
              return (
                <span key={frame.id}>
                  <a href={credit.page} className="ml-link" target="_blank" rel="noopener noreferrer">{credit.name}</a>
                  {index < frames.length - 2 ? ", " : index === frames.length - 2 ? ", and " : "."}
                </span>
              )
            })}
          </p>
        </details>
      </figcaption>
    </figure>
  )
}
