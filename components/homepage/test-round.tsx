import { testScenarios } from "@/lib/homepage/content"

/**
 * The scenarios a receptionist is called with before it goes live, and what it should do in each.
 * There are no results here: a round for a real business is gone through with the owner, and no
 * scored round for the public demo line has been recorded yet.
 */
export function TestRound() {
  return (
    <figure className="ml-tests" data-mtl-reveal aria-labelledby="tests-caption">
      <figcaption id="tests-caption" className="ml-tests__caption">
        What every setup gets called with before launch. For your business, we go through the results with you.
      </figcaption>
      <div className="ml-tests__table" role="table" aria-label="Test scenarios">
        <div className="ml-tests__row ml-tests__row--head" role="row">
          <span role="columnheader">Scenario</span>
          <span role="columnheader">Test call</span>
          <span role="columnheader">What it should do</span>
        </div>
        {testScenarios.map((scenario) => (
          <div key={scenario.name} className="ml-tests__row" role="row">
            <span className="ml-tests__name" role="rowheader">{scenario.name}</span>
            <span className="ml-tests__says" role="cell">“{scenario.says}”</span>
            <span className="ml-tests__expect" role="cell">{scenario.expect}</span>
          </div>
        ))}
      </div>
    </figure>
  )
}
