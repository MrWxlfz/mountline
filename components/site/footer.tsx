import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { mailtoHref, site } from "@/content/site"

export function Footer() {
  return (
    <footer className="mk-footer">
      <div className="mk-container mk-footer__grid">
        <div className="mk-footer__brand">
          <Wordmark size={20} />
          <p>{site.footer.description}</p>
        </div>
        <dl className="mk-footer__facts">
          <div>
            <dt>Email</dt>
            <dd><a href={mailtoHref} className="mk-link">{site.contact.email}</a></dd>
          </div>
          <div>
            <dt>Service area</dt>
            <dd>{site.footer.area.join(" · ")}</dd>
          </div>
        </dl>
      </div>
      <div className="mk-container mk-footer__bottom">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <Link href={site.footer.loginHref} className="mk-footer__login">{site.footer.login}</Link>
      </div>
    </footer>
  )
}
