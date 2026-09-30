import type { CSSProperties } from "react"
import { publishable, type ClientResult, type MeasuredPeriod } from "@/lib/case-study/client-results"

const formatDate = (value: string) => new Date(`${value}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
const period = (p: MeasuredPeriod) => `${formatDate(p.from)} – ${formatDate(p.to)}`
const value = (result: ClientResult, p: MeasuredPeriod) =>
  result.measure === "inquiry_conversion_rate" && p.outOf ? `${((p.count / p.outOf) * 100).toFixed(1)}%` : String(p.count)
const detail = (result: ClientResult, p: MeasuredPeriod) =>
  result.measure === "inquiry_conversion_rate" && p.outOf ? `${p.count} of ${p.outOf}` : null

/**
 * Approved, measured results from real client projects. Renders nothing until one exists
 * (lib/case-study/client-results.ts). Each bar is drawn to scale against the larger of the two
 * values; the periods and the source stay visible next to the numbers.
 */
export function ClientResults() {
  const results = publishable()
  if (!results.length) return null

  return (
    <section className="cr" aria-labelledby="cr-title">
      <h3 id="cr-title" className="cr__title">Results from client projects</h3>
      <ul className="cr__list">
        {results.map((result) => {
          const max = Math.max(result.before.count / (result.before.outOf ?? 1), result.after.count / (result.after.outOf ?? 1)) || 1
          return (
            <li key={`${result.client}-${result.measure}`} className="cr__item">
              <p className="cr__client">{result.client}</p>
              <p className="cr__label">{result.label}</p>
              <dl className="cr__bars">
                {(["before", "after"] as const).map((when) => {
                  const p = result[when]
                  const share = p.count / (p.outOf ?? 1) / max
                  return (
                    <div key={when} className="cr__bar" data-when={when} style={{ "--w": share } as CSSProperties}>
                      <dt>{when === "before" ? "Before" : "After"} <span>{period(p)}</span></dt>
                      <dd>{value(result, p)}{detail(result, p) ? <span> ({detail(result, p)})</span> : null}</dd>
                    </div>
                  )
                })}
              </dl>
              <p className="cr__changed">{result.whatChanged}</p>
              <details className="cr__method">
                <summary>How this was measured</summary>
                <p>Source: {result.source}. Published with permission from {result.permission.approvedBy} ({formatDate(result.permission.approvedOn)}).</p>
              </details>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
