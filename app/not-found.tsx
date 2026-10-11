import Link from "next/link"
import { figtree } from "@/app/fonts/fonts"
import { MountlineMark, Wordmark } from "@/components/brand/wordmark"
import "@/app/(marketing)/marketing.css"

/** Site-wide 404, in the public site's look (same header, tile, and button as /id). Light only. */
export default function NotFound() {
  return (
    <div className={figtree.variable}>
      <div className="mk-id">
        <div className="page">
          <header className="top">
            <Link href="/" aria-label="Mountline home" className="logo hit">
              <Wordmark />
            </Link>
          </header>
          <main>
            <div className="col">
              <div className="head">
                <span className="tile" aria-hidden="true"><MountlineMark /></span>
                <h1>This page doesn&apos;t exist</h1>
                <p className="sub">The link may be old or mistyped. Everything else is where you left it.</p>
              </div>
              <Link href="/" className="btn notfound-btn">Back to Mountline</Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
