import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Wordmark } from "@/components/brand/wordmark"
import { optOutByToken } from "@/lib/leads/email/server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Stop follow-up emails",
  robots: { index: false, follow: false },
}

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ done?: string }> }

export default async function StopFollowupsPage({ params, searchParams }: Props) {
  const { token } = await params
  const { done } = await searchParams

  async function stop() {
    "use server"
    let outcome = "missing"
    try {
      outcome = (await optOutByToken(token)) ? "yes" : "missing"
    } catch {
      outcome = "error"
    }
    redirect(`/inquiry/stop/${encodeURIComponent(token)}?done=${outcome}`)
  }

  return (
    <div className={`ml-site ml-card-page`}>
      <header className="ml-card-page__bar">
        <div className="ml-card-page__inner">
          <Link href="/" className="ml-header__brand" aria-label="Mountline home">
            <Wordmark size={18} />
          </Link>
        </div>
      </header>
      <main className="ml-card-page__inner ml-notice">
        {done === "yes" ? (
          <>
            <h1>Follow-ups are off.</h1>
            <p>Mountline won’t send you any more follow-up emails about this inquiry. If you reply to an earlier email, it will still reach us.</p>
          </>
        ) : done === "missing" ? (
          <>
            <h1>That link isn’t valid anymore.</h1>
            <p>If you’d still like follow-ups to stop, email <a className="ml-link" href="mailto:hello@mountline.dev">hello@mountline.dev</a> and we’ll take care of it.</p>
          </>
        ) : done === "error" ? (
          <>
            <h1>That didn’t save.</h1>
            <p>Please try again in a moment, or email <a className="ml-link" href="mailto:hello@mountline.dev">hello@mountline.dev</a>.</p>
            <form action={stop}><button type="submit" className="ml-btn ml-btn--solid">Try again</button></form>
          </>
        ) : (
          <>
            <h1>Stop follow-up emails?</h1>
            <p>Mountline sends at most one check-in after a conversation starts. This turns it off for your inquiry. You can still reply to any email to reach us.</p>
            <form action={stop}><button type="submit" className="ml-btn ml-btn--solid">Stop follow-ups</button></form>
          </>
        )}
      </main>
    </div>
  )
}
