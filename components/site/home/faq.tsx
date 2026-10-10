import { PlusIcon } from "@/components/site/icons"
import { site } from "@/content/site"

export function Faq() {
  const { faq } = site
  return (
    <section className="faq" id="faq">
      <div className="rv">
        <span className="eyebrow">{faq.eyebrow}</span>
        <h2 style={{ marginTop: 14 }}>{faq.title}</h2>
      </div>
      <div className="qs rv">
        {faq.items.map((item, index) => (
          <details key={item.q} open={index === 0}>
            <summary>{item.q}<PlusIcon /></summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
