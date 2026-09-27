import { Check } from "lucide-react"
import { testScenarios } from "@/lib/homepage/content"

/**
 * An illustrated test round. It shows how a round works (each scenario is called,
 * checked, and anything that misses is adjusted and called again), not a result.
 * Motion is CSS-only and starts when the list is revealed; the resting state is final.
 */
export function TestRound() {
  return (
    <figure className="ml-tests" data-mtl-reveal aria-labelledby="tests-caption">
      {/* Labeled before the checkmarks, so nobody reads them as a customer's results. */}
      <figcaption id="tests-caption" className="ml-tests__caption">
        An example round. Real rounds use your business details, and you go through the results with us before launch.
      </figcaption>
      <div className="ml-tests__table" role="table" aria-label="Example test round">
        <div className="ml-tests__row ml-tests__row--head" role="row">
          <span role="columnheader">Scenario</span>
          <span role="columnheader">Test call</span>
          <span role="columnheader">What it should do</span>
          <span role="columnheader">Result</span>
        </div>
        {testScenarios.map((scenario, index) => {
          const review = "review" in scenario && scenario.review
          return (
            <div key={scenario.name} className="ml-tests__row" role="row" data-review={review || undefined} style={{ "--i": index } as React.CSSProperties}>
              <span className="ml-tests__name" role="rowheader">{scenario.name}</span>
              <span className="ml-tests__says" role="cell">“{scenario.says}”</span>
              <span className="ml-tests__expect" role="cell">{scenario.expect}</span>
              <span className="ml-tests__result" role="cell">
                <span className="ml-tests__track" aria-hidden="true"><i /><i /></span>
                {review ? (
                  <>
                    <span className="ml-tests__status" data-kind="review" aria-hidden="true">Needs review</span>
                    <span className="ml-tests__status" data-kind="pass"><Check aria-hidden="true" />Adjusted, retested</span>
                  </>
                ) : (
                  <span className="ml-tests__status" data-kind="pass"><Check aria-hidden="true" />As expected</span>
                )}
              </span>
            </div>
          )
        })}
      </div>
      <p className="ml-tests__done" aria-hidden="true"><i />Ready for your sign-off</p>
    </figure>
  )
}
