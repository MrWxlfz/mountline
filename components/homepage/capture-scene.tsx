"use client"

import { useState, type CSSProperties } from "react"
import { BrambleSite } from "@/components/homepage/bramble/bramble-site"
import { SCENE, Storefront, StorefrontCamera, framings, type Framing } from "@/components/homepage/bramble/storefront"
import { PhoneFrame } from "@/components/homepage/device-frames"

type Shot = { id: string; thumb: Framing; page: Framing; title: string; plan: string }

// A storyboard for the fictional Bramble example: how a shoot would be planned, not footage.
const shots: Shot[] = [
  { id: "front", thumb: "front", page: "entrance", title: "The front door", plan: "7:40 am, before opening, while the light is low and warm." },
  { id: "welcome", thumb: "welcome", page: "welcomeTall", title: "Someone at the door", plan: "8:05 am, as the first dog of the day arrives." },
  { id: "work", thumb: "window", page: "windowTall", title: "The work itself", plan: "Mid-morning, a groom in progress, with the owner’s okay." },
  { id: "detail", thumb: "sign", page: "signTall", title: "A detail regulars know", plan: "Any time: the hand-painted sign over the door." },
]

// The viewfinder is 16:10. It frames each photo with room around it, so the crop reads as part of a scene.
const VIEW = { w: 1600, h: 1000 }

function viewFor(page: Framing) {
  const [x, y, w, h] = framings[page]
  const height = Math.min(SCENE.height, Math.max(h * 1.3, (w * 1.3 * VIEW.h) / VIEW.w))
  const width = (height * VIEW.w) / VIEW.h
  const left = Math.min(SCENE.width - width, Math.max(0, x + w / 2 - width / 2))
  const top = Math.min(SCENE.height - height, Math.max(0, y + h / 2 - height / 2))
  const view = [left, top, width, height] as const
  const crop = { left: (x - left) / width, top: (y - top) / height, width: w / width, height: h / height }
  return { view, crop }
}

/**
 * Mountline Capture, shown as a storyboard. Choose a frame: the camera moves to it, the marked crop
 * is the part that becomes the photo, and the same crop appears on the Bramble page beside it.
 */
export function CaptureScene() {
  const [index, setIndex] = useState(0)
  const shot = shots[index]
  const { view, crop } = viewFor(shot.page)

  return (
    <div className="hp-capture__scene">
      <figure className="hp-viewfinder" aria-labelledby="capture-storyboard-note">
        <div className="hp-viewfinder__stack">
          <div className="hp-viewfinder__frame">
            <StorefrontCamera framing={shot.thumb} rect={view} width={VIEW.w} height={VIEW.h} className="hp-viewfinder__art" />
            <span className="hp-viewfinder__guides" aria-hidden="true"><i /><i /><i /><i /></span>
            <span
              className="hp-viewfinder__crop"
              aria-hidden="true"
              style={{ left: `${crop.left * 100}%`, top: `${crop.top * 100}%`, width: `${crop.width * 100}%`, height: `${crop.height * 100}%` } as CSSProperties}
            >
              <span>On the page</span>
            </span>
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
            <span className="hp-shot__thumb" aria-hidden="true"><Storefront framing={item.thumb} /></span>
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
