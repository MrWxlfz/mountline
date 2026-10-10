/**
 * Lets the rebrand notice wait for the homepage intro (docs/design/choreography.md §2). The intro is
 * an inline script (components/site/home/intro-script.ts) that sets `window.__mlIntroDone` and fires
 * "ml:intro-done" when it finishes. If no intro is running, `fn` runs right away.
 */

declare global {
  interface Window {
    __mlIntroDone?: boolean
    __mlIntroSkip?: () => void
  }
}

export function waitForIntro(fn: () => void) {
  if (window.__mlIntroDone || !document.documentElement.hasAttribute("data-intro")) {
    fn()
    return () => {}
  }
  const onDone = () => fn()
  window.addEventListener("ml:intro-done", onDone, { once: true })
  return () => window.removeEventListener("ml:intro-done", onDone)
}
