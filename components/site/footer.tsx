import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { mailtoHref, site } from "@/content/site"

/** `base` prefixes the section links on pages other than the homepage ("/" → "/#what"). */
export function Footer({ base = "", note = site.example.disclaimer }: { base?: string; note?: string }) {
  const { footer } = site
  return (
    <footer>
      <div>
        <a className="logo hit" href={base ? "/" : "#top"} aria-label="Mountline home"><Wordmark /></a>
        <p>{footer.description}</p>
      </div>
      <div>
        <h3>{footer.siteTitle}</h3>
        <ul>
          {site.nav.map((item) => (
            <li key={item.href}><a href={`${base}${item.href}`}>{item.label}</a></li>
          ))}
        </ul>
      </div>
      <div>
        <h3>{footer.contactTitle}</h3>
        <ul>
          <li><a href={mailtoHref}>{site.contact.email}</a></li>
          <li>{footer.area}</li>
          <li><Link href={footer.loginHref}>{footer.login}</Link></li>
        </ul>
      </div>
      <div className="legal">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>{note}</span>
      </div>
    </footer>
  )
}
