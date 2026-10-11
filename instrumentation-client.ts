// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
//
// Sentry is loaded once the page is idle, so its script never competes with the first paint.
// Errors thrown before then are held and reported as soon as it starts.

type SentryModule = typeof import("@sentry/nextjs")

let sentry: SentryModule | null = null
const early: unknown[] = []

function holdEarlyError(event: ErrorEvent | PromiseRejectionEvent) {
  early.push("reason" in event ? event.reason : (event.error ?? event.message))
}

function start() {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: "https://f2eaec8dbbe3163aed34e47e82375073@o4511435126865920.ingest.us.sentry.io/4511435136172032",

      // Session Replay is off: its recorder was the largest script on the public site (about 380 KB)
      // and cost the homepage its mobile performance budget. Errors and traces are still reported.

      // One page load in ten is traced; every error is still reported.
      tracesSampleRate: 0.1,
      // Enable logs to be sent to Sentry
      enableLogs: true,

      // Enable sending user PII (Personally Identifiable Information)
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
      sendDefaultPii: true,
    })
    sentry = Sentry
    window.removeEventListener("error", holdEarlyError)
    window.removeEventListener("unhandledrejection", holdEarlyError)
    for (const error of early.splice(0)) Sentry.captureException(error)
  })
}

if (typeof window !== "undefined") {
  window.addEventListener("error", holdEarlyError)
  window.addEventListener("unhandledrejection", holdEarlyError)
  // Safari has no requestIdleCallback; a timeout after load is close enough there.
  const whenIdle = () =>
    typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(start, { timeout: 4000 }) : setTimeout(start, 1)
  if (document.readyState === "complete") whenIdle()
  else window.addEventListener("load", whenIdle, { once: true })
}

export function onRouterTransitionStart(...args: Parameters<SentryModule["captureRouterTransitionStart"]>) {
  sentry?.captureRouterTransitionStart(...args)
}
