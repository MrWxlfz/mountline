import { site } from "@/content/site"

export function Towns() {
  return (
    <section className="rv" aria-labelledby="towns-h">
      <div className="towns">
        <h2 id="towns-h">{site.towns.title}</h2>
      </div>
      <div className="towns-grid">
        {site.towns.items.map((town) => (
          <div className="town" key={town.name}>{town.name}<small>{town.zip}</small></div>
        ))}
      </div>
    </section>
  )
}
