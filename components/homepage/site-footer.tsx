import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { receptionistDemo } from "@/lib/receptionist/demo"

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#product" },
      { label: "Service businesses", href: "/#trades" },
      { label: "Demo line", href: "/#demo" },
      { label: "Testing", href: "/#testing" },
      { label: "Pilot", href: "/#pilot" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#company" },
      { label: "Questions", href: "/#faq" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Mountline ID", href: "/id" },
      { label: "Client portal", href: "/portal" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="ml-footer">
      <div className="ml-container ml-footer__grid">
        <div className="ml-footer__brand">
          <Wordmark size={22} />
          <p>AI receptionists for the calls service businesses can’t take. A small company in Keller, Texas.</p>
          <dl className="ml-footer__contact">
            <div>
              <dt>Email</dt>
              <dd><a href="mailto:hello@mountline.dev" className="ml-link">hello@mountline.dev</a></dd>
            </div>
            <div>
              <dt>Demo line</dt>
              <dd><a href={receptionistDemo.phoneHref} className="ml-link">{receptionistDemo.displayPhone}</a></dd>
            </div>
          </dl>
        </div>
        {columns.map((column) => (
          <nav key={column.title} className="ml-footer__col" aria-label={column.title}>
            <p className="ml-footer__title">{column.title}</p>
            {column.links.map((link) =>
              link.href.startsWith("/#") ? (
                <a key={link.href} href={link.href}>{link.label}</a>
              ) : (
                <Link key={link.href} href={link.href}>{link.label}</Link>
              ),
            )}
          </nav>
        ))}
      </div>
      <div className="ml-container ml-footer__bottom">
        <span>© {new Date().getFullYear()} Mountline</span>
        <span>Keller, Texas · Dallas–Fort Worth</span>
      </div>
    </footer>
  )
}
