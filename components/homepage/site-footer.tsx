import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { receptionistDemo } from "@/lib/receptionist/demo"

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#product" },
      { label: "Trades", href: "/#trades" },
      { label: "Demo line", href: "/#demo" },
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
          <p>Mountline builds AI receptionists for service businesses. Based in Keller, Texas.</p>
          <p>
            <a href="mailto:hello@mountline.dev" className="ml-link">hello@mountline.dev</a>
            <br />
            Demo line <a href={receptionistDemo.phoneHref} className="ml-link">{receptionistDemo.displayPhone}</a>
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} className="ml-footer__col" aria-label={column.title}>
            <p className="ml-mono">{column.title}</p>
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
