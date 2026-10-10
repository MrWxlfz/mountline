"use client"

import { useEffect } from "react"

/** If someone leaves the homepage mid-intro (client-side navigation), finish it so nothing lingers. */
export function IntroCleanup() {
  useEffect(() => () => window.__mlIntroSkip?.(), [])
  return null
}
