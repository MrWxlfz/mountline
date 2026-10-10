import { BookButton } from "@/components/site/booking"
import { CheckIcon, ServiceIcon } from "@/components/site/icons"
import { site } from "@/content/site"
import { isPlaceholder } from "@/lib/placeholders"

export function Pricing() {
  const { pricing } = site
  return (
    <section className="pricing" id="pricing">
      <div className="rv">
        <span className="eyebrow">{pricing.eyebrow}</span>
        <h2 style={{ marginTop: 14 }}>{pricing.title}</h2>
      </div>
      <div className="price-grid rv">
        {pricing.plans.map((plan) => (
          <div className="plan" key={plan.key}>
            <span className={`dt ${plan.key}`}><ServiceIcon k={plan.key} /></span>
            <h3>{plan.name}</h3>
            <div className="amt">
              {plan.before ? <small>{plan.before}</small> : null}
              {/* Unfilled prices get the dashed placeholder style; real ones render as plain figures. */}
              <span className={isPlaceholder(plan.price) ? "ph-fill" : undefined}>{plan.price}</span>
              {plan.after ? <small>{plan.after}</small> : null}
            </div>
            <ul>
              {plan.includes.map((item) => (
                <li key={item}><CheckIcon width={1.6} />{item}</li>
              ))}
            </ul>
            <BookButton className="btn btn-light plan-cta hit">{site.cta.book}</BookButton>
          </div>
        ))}
      </div>
      <p className="price-note rv">{pricing.note}</p>
    </section>
  )
}
