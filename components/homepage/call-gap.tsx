import { callModel, consumerFindings, benchmarkSources } from "@/lib/homepage/benchmarks"

// Spread the unanswered calls through the day the way they actually happen: unevenly.
function missedPositions(total: number, missed: number, seed = 7) {
  let state = seed
  const random = () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const order = Array.from({ length: total }, (_, index) => index)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return new Set(order.slice(0, missed))
}

const missed = missedPositions(callModel.total, callModel.unanswered)
const answered = callModel.total - callModel.unanswered
const sources = Object.values(benchmarkSources)
const sourceNumber = (id: string) => sources.findIndex((source) => source.id === id) + 1

function CallGrid({ covered, label }: { covered: boolean; label: string }) {
  return (
    <div className="ml-gap__grid" data-covered={covered} role="img" aria-label={label}>
      {Array.from({ length: callModel.total }, (_, index) => (
        <i key={index} data-missed={missed.has(index) || undefined} style={{ "--i": index } as React.CSSProperties} />
      ))}
    </div>
  )
}

export function CallGap() {
  return (
    <div className="ml-gap">
      <div className="ml-gap__model" data-mtl-reveal>
        <div className="ml-gap__panel">
          <p className="ml-gap__kicker">Out of 100 calls, on average</p>
          <CallGrid covered={false} label={`${answered} of ${callModel.total} calls answered, ${callModel.unanswered} unanswered`} />
          <dl className="ml-gap__legend">
            <div>
              <dt><span data-swatch="answered" aria-hidden="true" />Answered</dt>
              <dd>{answered}</dd>
            </div>
            <div>
              <dt><span data-swatch="missed" aria-hidden="true" />Unanswered</dt>
              <dd data-accent>{callModel.unanswered}</dd>
            </div>
          </dl>
        </div>

        <div className="ml-gap__arrow" aria-hidden="true">
          <span>Missed calls go to Mountline</span>
        </div>

        <div className="ml-gap__panel">
          <p className="ml-gap__kicker">With Mountline on missed calls</p>
          <CallGrid covered label={`${answered} calls handled by your team as usual; up to ${callModel.unanswered} missed calls forwarded to Mountline`} />
          <dl className="ml-gap__legend">
            <div>
              <dt><span data-swatch="answered" aria-hidden="true" />Handled by your team, as usual</dt>
              <dd>{answered}</dd>
            </div>
            <div>
              <dt><span data-swatch="covered" aria-hidden="true" />Missed calls that can forward to Mountline</dt>
              <dd data-accent>
                <small>up to</small> {callModel.unanswered}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="ml-gap__findings" data-mtl-reveal>
        <p className="ml-gap__findings-intro">When a call goes unanswered, people don’t always wait. In a CallRail survey of 1,000 U.S. consumers:</p>
        {consumerFindings.map((finding) => (
          <p key={finding.label} className="ml-gap__finding">
            <strong>{finding.value}%</strong>
            <span>
              {finding.label}
              <sup><a href={`#source-${sourceNumber(finding.source.id)}`} aria-label={`Source ${sourceNumber(finding.source.id)}`}>{sourceNumber(finding.source.id)}</a></sup>
            </span>
          </p>
        ))}
      </div>

      <footer className="ml-gap__sources">
        <p>
          Figures from CallRail. Illustrative model, not a measured Mountline customer result.
        </p>
        <ol>
          {sources.map((source, index) => (
            <li key={source.id} id={`source-${index + 1}`}>
              <span aria-hidden="true">{index + 1}</span>
              <a href={source.url} target="_blank" rel="noreferrer" className="ml-link">
                {source.publisher}, “{source.title},” {new Date(`${source.published}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}
              </a>
              <span className="ml-gap__source-note">{source.note}</span>
            </li>
          ))}
        </ol>
      </footer>
    </div>
  )
}
