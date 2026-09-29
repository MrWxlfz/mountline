import type { CSSProperties } from "react"
import { Check, Minus, X } from "lucide-react"
import { formatDate, formatSeconds, type SiteEvidence } from "@/lib/case-study/evidence"
import "./evidence-panel.css"

/**
 * "And yes, we tested it." Three recorded results from rebuilding this site, and the details behind
 * them. Everything comes from lib/case-study/evidence.json; a value that wasn't measured is shown as
 * not measured. The motion only reveals numbers that are already on the page.
 */

const viewportLabel = { desktop: "Desktop", phone: "Phone" } as const

function Mark({ value }: { value: "pass" | "fail" | null }) {
  if (value === "pass") return <span className="ev-mark" data-value="pass"><Check aria-hidden="true" /><span className="sr-only">passed</span></span>
  if (value === "fail") return <span className="ev-mark" data-value="fail"><X aria-hidden="true" /><span className="sr-only">failed</span></span>
  return <span className="ev-mark" data-value="none"><Minus aria-hidden="true" /><span className="sr-only">not checked</span></span>
}

export function EvidencePanel({ evidence }: { evidence: SiteEvidence }) {
  const { tasks, accessibility, performance } = evidence
  const recorded = formatDate(evidence.recordedOn)
  const finished = Boolean(evidence.builds.after)

  // One mark per recorded result: per screen, or once for a check that covered every width.
  const taskMarks = evidence.checks.filter((c) => c.id !== "automated-accessibility-scan" && c.after).flatMap((c) =>
    c.shared
      ? [{ key: c.id, label: `${c.label} (every width)`, value: c.after!.desktop }]
      : (["desktop", "phone"] as const).filter((v) => c.after![v] !== null).map((v) => ({ key: `${c.id}-${v}`, label: `${c.label} (${viewportLabel[v]})`, value: c.after![v] })),
  )
  const old = evidence.tasksBefore

  const lcp = performance.lcpMs
  const lcpMax = Math.max(lcp.before.max, lcp.after?.max ?? 0)
  const a11yMax = Math.max(accessibility.before.elements, accessibility.after?.elements ?? 0, 1)

  return (
    <section className="ev" aria-labelledby="ev-title" data-mtl-reveal>
      <header className="ev__head">
        <h3 id="ev-title" className="ev__title">And yes, we tested it.</h3>
        <div className="ev__intro">
          <p>
            Before changing anything, we ran a set of checks on the old homepage and saved the results. Then we rebuilt
            it and ran the same checks again.
          </p>
          <p className="ev__stamp">
            {finished ? `Recorded ${recorded}.` : "The finished build hasn’t been measured yet."} These are saved results, not a test running in your browser.
          </p>
        </div>
      </header>

      <div className="ev__grid">
        <article className="ev__tile">
          <p className="ml-label">Customer tasks</p>
          {tasks ? (
            <p className="ev__big">
              <strong>{tasks.passed}</strong> <span>of {tasks.total} checks passed</span>
            </p>
          ) : (
            <p className="ev__big ev__big--none">Not measured yet</p>
          )}
          {taskMarks.length ? (
            <ol className="ev__ticks" aria-label="Every check on the finished build">
              {taskMarks.map((mark, index) => (
                <li key={mark.key} data-value={mark.value} title={mark.label} style={{ "--i": index } as CSSProperties}>
                  <span className="sr-only">{mark.label}: {mark.value === "pass" ? "passed" : "failed"}</span>
                </li>
              ))}
            </ol>
          ) : null}
          <p className="ev__foot">
            Finding the offer, reaching the form, the keyboard path, the receptionist demo, and more, on a desktop screen
            and an emulated phone.{old ? ` The old homepage passed ${old.passed} of the ${old.total} that applied to it.` : ""}
          </p>
        </article>

        <article className="ev__tile">
          <p className="ml-label">Accessibility scan</p>
          {accessibility.after ? (
            <p className="ev__big">
              <strong>{accessibility.after.elements}</strong> <span>{accessibility.after.elements === 1 ? "problem found" : "problems found"}</span>
            </p>
          ) : (
            <p className="ev__big ev__big--none">Not measured yet</p>
          )}
          <div className="ev__bars">
            <span className="ev__bar" data-when="before" style={{ "--w": accessibility.before.elements / a11yMax } as CSSProperties}>
              <b>Before</b>{accessibility.before.elements}
            </span>
            <span className="ev__bar" data-when="after" style={{ "--w": (accessibility.after?.elements ?? 0) / a11yMax } as CSSProperties}>
              <b>After</b>{accessibility.after ? accessibility.after.elements : "—"}
            </span>
          </div>
          <p className="ev__foot">
            Elements failing a WCAG 2.2 A or AA rule in {accessibility.tool.split(",")[0]}, desktop and phone combined.
            An automated scan catches some problems, not all.
          </p>
        </article>

        <article className="ev__tile">
          <p className="ml-label">Phone load, in a lab</p>
          {lcp.after ? (
            <p className="ev__big">
              <strong>{formatSeconds(lcp.after.median)}</strong> <span>until the headline shows</span>
            </p>
          ) : (
            <p className="ev__big ev__big--none">Not measured yet</p>
          )}
          <div className="ev__range" role="img" aria-label={`Before: median ${formatSeconds(lcp.before.median)}. After: ${lcp.after ? `median ${formatSeconds(lcp.after.median)}` : "not measured yet"}.`}>
            {[{ when: "before", value: lcp.before }, { when: "after", value: lcp.after }].map(({ when, value }) => (
              <span key={when} className="ev__run" data-when={when}>
                <b>{when === "before" ? "Before" : "After"}</b>
                <span className="ev__track">
                  {value ? (
                    <>
                      <i className="ev__spread" style={{ "--a": value.min / lcpMax, "--b": value.max / lcpMax } as CSSProperties} />
                      <i className="ev__median" style={{ "--m": value.median / lcpMax } as CSSProperties} />
                    </>
                  ) : null}
                </span>
                <em>{value ? formatSeconds(value.median) : "—"}</em>
              </span>
            ))}
          </div>
          <p className="ev__foot">
            Largest contentful paint: the median of {lcp.before.runs} Lighthouse runs each, on a simulated slow 4G phone.
            The faint band is the fastest to slowest run.
            {performance.tbtMs.after
              ? ` Time the page was busy and couldn’t respond went ${performance.tbtMs.after.median > performance.tbtMs.before.median ? "up" : "down"}, from ${performance.tbtMs.before.median} to ${performance.tbtMs.after.median} ms.`
              : ""}{" "}
            Real phones and connections will differ.
          </p>
        </article>
      </div>

      <details className="ev__more">
        <summary>
          What we tested
          <i aria-hidden="true" />
        </summary>
        <div className="ev__more-body">
          <dl className="ev__facts">
            <div><dt>What</dt><dd>{evidence.subject}.</dd></div>
            <div><dt>When</dt><dd>{recorded}</dd></div>
            <div>
              <dt>Builds</dt>
              <dd>
                Before: commit <code>{evidence.builds.before.commit}</code>, {evidence.builds.before.description}.{" "}
                {evidence.builds.after ? <>After: commit <code>{evidence.builds.after.commit}</code>, {evidence.builds.after.description}.</> : "After: not measured yet."}
              </dd>
            </div>
            <div><dt>Where</dt><dd>{evidence.environment.machine}; {evidence.environment.browser}. {evidence.environment.network}</dd></div>
            <div><dt>Screens</dt><dd>{evidence.environment.viewports.join("; ")}.</dd></div>
            <div><dt>Tools</dt><dd>{evidence.environment.tools.join(", ")}.</dd></div>
            <div>
              <dt>Code tests</dt>
              <dd>
                {evidence.unitTests.after ? `${evidence.unitTests.after.passed} of ${evidence.unitTests.after.total} passed after the rebuild` : "Not recorded after the rebuild yet"}
                {evidence.unitTests.before ? ` (${evidence.unitTests.before.passed} of ${evidence.unitTests.before.total} before)` : ""}. {evidence.unitTests.covers}
              </dd>
            </div>
          </dl>

          <table className="ev__table">
            <caption className="sr-only">Every check, before and after the rebuild</caption>
            <thead>
              <tr>
                <th scope="col">Check</th>
                <th scope="col">Before · desktop</th>
                <th scope="col">Before · phone</th>
                <th scope="col">After · desktop</th>
                <th scope="col">After · phone</th>
              </tr>
            </thead>
            <tbody>
              {evidence.checks.map((check) => (
                <tr key={check.id}>
                  <th scope="row">
                    <span>{check.label}</span>
                    <small>{check.means}</small>
                    {check.detail && check.after && [check.after.desktop, check.after.phone].includes("fail") ? <small className="ev__fail">{check.detail}</small> : null}
                  </th>
                  <td><Mark value={check.before.desktop} /></td>
                  <td><Mark value={check.before.phone} /></td>
                  <td><Mark value={check.after?.desktop ?? null} /></td>
                  <td><Mark value={check.after?.phone ?? null} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ev__notes">
            <div>
              <p className="ml-label">Not tested here</p>
              <ul>{evidence.notTested.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <p className="ml-label">Limits</p>
              <ul>{evidence.limits.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </div>
      </details>
    </section>
  )
}
