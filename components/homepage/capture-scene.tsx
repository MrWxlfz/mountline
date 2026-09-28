"use client"

import { useState } from "react"
import { BrambleSite } from "@/components/homepage/bramble/bramble-site"
import { Storefront, StorefrontCamera, type Framing } from "@/components/homepage/bramble/storefront"
import { PhoneFrame } from "@/components/homepage/device-frames"

type Shot = { id: string; frame: Framing; page: Framing; title: string; plan: string }

// A storyboard for the fictional Bramble example: how a shoot would be planned, not footage.
const shots: Shot[] = [
  { id: "front", frame: "front", page: "entrance", title: "The front door", plan: "7:40 am, before opening, while the light is low and warm." },
  { id: "welcome", frame: "welcome", page: "welcomeTall", title: "Someone at the door", plan: "8:05 am, as the first dog of the day arrives." },
  { id: "work", frame: "window", page: "windowTall", title: "The work itself", plan: "Mid-morning, a groom in progress, with the owner’s okay." },
  { id: "detail", frame: "sign", page: "signTall", title: "A detail regulars know", plan: "Any time: the hand-painted sign over the door." },
]

/**
 * Mountline Capture, shown as a storyboard. Choose a frame and the camera moves to it; the same
 * frame then appears as the photo on the Bramble site.
 */
export function CaptureScene() {
  const [index, setIndex] = useState(0)
  const shot = shots[index]

  return (
    <div className="hp-capture__scene">
      <figure className="hp-viewfinder" aria-labelledby="capture-storyboard-note">
        <div className="hp-viewfinder__stack">
          <div className="hp-viewfinder__frame">
            <StorefrontCamera framing={shot.frame} width={1600} height={1000} className="hp-viewfinder__art" />
            <span className="hp-viewfinder__guides" aria-hidden="true"><i /><i /><i /><i /></span>
            <span className="hp-viewfinder__corners" aria-hidden="true"><i /><i /><i /><i /></span>
            <span className="hp-viewfinder__top">
              <span className="hp-tag">Storyboard · illustration</span>
              <span className="hp-viewfinder__count" aria-hidden="true">{String(index + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}</span>
            </span>
          </div>
          <p className="hp-viewfinder__plan" aria-live="polite">
            <strong>{shot.title}</strong>
            <span>{shot.plan}</span>
          </p>
        </div>
        <figcaption id="capture-storyboard-note" className="hp-viewfinder__note">
          An illustrated storyboard for Bramble, the made-up groomer from the design example. It shows how a shoot is
          planned. It’s not footage we’ve shot, and Bramble isn’t a client.
        </figcaption>
      </figure>

      <div className="hp-shots" role="group" aria-label="Storyboard frames">
        {shots.map((item, i) => (
          <button key={item.id} type="button" className="hp-shot" aria-pressed={i === index} onClick={() => setIndex(i)}>
            <span className="hp-shot__thumb" aria-hidden="true"><Storefront framing={item.frame} /></span>
            <span className="hp-shot__label">
              <span className="hp-shot__index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {item.title}
            </span>
          </button>
        ))}
      </div>

      <div className="hp-capture__page" aria-hidden="true">
        <PhoneFrame className="hp-capture__phone">
          <BrambleSite view="mobile" shot={shot.page} />
        </PhoneFrame>
        <p className="hp-capture__arrow"><span>On the page</span></p>
      </div>
    </div>
  )
}
