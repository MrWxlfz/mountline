"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useSyncExternalStore } from "react"
import { staffHref } from "@/components/receptionist-portal/studio/test-call"
import type { CallSummary } from "@/lib/receptionist/retell"

/*
 * A web simulation of the staff app, for demos. The real app will be native SwiftUI on iPad and
 * iPhone; this one copies its shape (a three-column split view on iPad, a tab bar on iPhone, inset
 * grouped lists, system banners and sheets) so an owner can see what their front desk would use.
 * The calls are real Retell data; the device, Settings, and Connected apps are a preview.
 */

export type StaffInitial =
  | { ok: false; error: string }
  | {
      ok: true
      agentId: string
      receptionists: Array<{ id: string; name: string }>
      business: string
      industry: string
      demo: boolean
      calls: CallSummary[]
      /** The test call that just ended; it's watched until analyzed and gets a notification. */
      focusCallId: string | null
      loadedAt: number
    }

export type StaffReady = Extract<StaffInitial, { ok: true }>
type Device = "ipad" | "iphone"

// Client-only: the app reads its preview settings from this browser's storage on first render.
const StaffScreen = dynamic(() => import("./staff-screen").then((mod) => mod.StaffScreen), {
  ssr: false,
  loading: () => <div className="ip-booting"><span className="ip-spinner" aria-hidden="true" /></div>,
})

export function StaffApp({ initial }: { initial: StaffInitial }) {
  if (!initial.ok) {
    return (
      <main className="pt-main pt-narrow">
        <section className="pt-card">
          <h1>The staff app has nothing to show yet</h1>
          <p className="pt-error">{initial.error}</p>
          <p className="pt-muted"><Link href="/receptionist?view=studio" className="pt-linkbtn">Go to Studio</Link></p>
        </section>
      </main>
    )
  }
  return <Stage key={initial.agentId} initial={initial} />
}

const narrowQuery = "(max-width: 900px)"
const subscribeNarrow = (onChange: () => void) => {
  const media = window.matchMedia(narrowQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function Stage({ initial }: { initial: StaffReady }) {
  const router = useRouter()
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrowQuery).matches, () => false)
  const [picked, setPicked] = useState<Device | null>(null)
  // On a small screen there's only room for the phone.
  const device: Device = narrow ? "iphone" : picked ?? "ipad"

  return (
    <main className="ip-stage">
      <div className="ip-controls">
        <label className="ip-pick">
          <span className="pt-muted small">Receptionist</span>
          <select className="pt-input st-small-input" value={initial.agentId} onChange={(event) => router.push(staffHref(event.target.value))}>
            {initial.receptionists.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
          </select>
        </label>
        {narrow ? null : (
          <div className="pt-views ip-device-pick" role="radiogroup" aria-label="Device">
            {(["ipad", "iphone"] as const).map((kind) => (
              <button key={kind} type="button" role="radio" aria-checked={device === kind} className="pt-view" aria-current={device === kind ? "page" : undefined} onClick={() => setPicked(kind)}>
                {kind === "ipad" ? "iPad" : "iPhone"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`ip-device ${device}`}>
        <span className="ip-button power" aria-hidden="true" />
        <span className="ip-button volume" aria-hidden="true" />
        <div className="ip-screen">
          <StaffScreen key={device} initial={initial} device={device} />
        </div>
      </div>

      <p className="ip-caption">
        A web preview of the {initial.business} staff app. The real one is a native iPad and iPhone app. Calls are real; Connected apps is a demo.
        {initial.demo ? " Bookings on this receptionist are simulated, so nothing is on a real calendar." : ""}
      </p>
    </main>
  )
}
