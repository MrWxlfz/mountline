"use client"

import { CloseIcon } from "@/components/site/icons"
import { site } from "@/content/site"

/** The full-bleed bar above the nav. Dismissed for the rest of the session. */
export function Announce() {
  const dismiss = () => {
    document.documentElement.setAttribute("data-ann", "off")
    try {
      window.sessionStorage.setItem("ml-ann", "0")
    } catch {}
  }
  return (
    <div className="announce" id="announce">
      <span className="pdot" aria-hidden="true" />
      <span>{site.announce.text}</span>
      <a className="hit" href={site.announce.href}>{site.announce.link}</a>
      <button className="announce-x hit" type="button" aria-label={site.announce.dismiss} onClick={dismiss}>
        <CloseIcon />
      </button>
    </div>
  )
}
