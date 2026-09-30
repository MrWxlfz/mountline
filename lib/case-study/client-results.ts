/**
 * Measured outcomes from real Mountline client projects, for the homepage's "The difference" section.
 *
 * Empty on purpose. As of 2026-09-29 there are no client results that are both measured and approved
 * for publishing, so the homepage shows a labeled design demonstration and no figures.
 *
 * Before adding an entry:
 * - It must be a real client, with written permission to publish these numbers (who approved it, when,
 *   and where that approval is kept).
 * - Use a measure that fits the service provided: a website change is measured by website inquiries
 *   or appointment requests, a receptionist by calls answered or requests captured. Don't credit the
 *   receptionist with website traffic, or a redesign with every change in bookings.
 * - Compare periods of the same length and season where possible, and give the actual counts. A rate
 *   needs its denominator.
 * - No averages across clients unless every record is comparable, and the sample size and period are
 *   stated. Never an industry statistic presented as a Mountline result.
 *
 * publishable() drops anything that doesn't meet the structural rules; people check the rest.
 */

export type ClientMeasure = "qualified_inquiries" | "appointment_requests" | "calls_answered" | "requests_captured" | "inquiry_conversion_rate"

export type MeasuredPeriod = {
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
  count: number
  /** Required for a rate: what the count is out of (for example, website visits). */
  outOf?: number
}

export type ClientResult = {
  client: string
  service: "website" | "receptionist" | "capture"
  measure: ClientMeasure
  /** How the measure reads on the page, e.g. "Appointment requests from the website". */
  label: string
  before: MeasuredPeriod
  after: MeasuredPeriod
  /** One or two plain sentences: what we changed, and anything else that changed in the same period. */
  whatChanged: string
  /** Where the numbers come from, e.g. "Bramble's booking inbox, exported by the owner". */
  source: string
  permission: { approvedBy: string; approvedOn: string; record: string }
}

export const clientResults: ClientResult[] = []

const days = (period: MeasuredPeriod) => (Date.parse(period.to) - Date.parse(period.from)) / 86_400_000 + 1

export function publishable(results: readonly ClientResult[] = clientResults) {
  return results.filter((result) => {
    const { before, after, permission, measure } = result
    if (!permission.approvedBy.trim() || !permission.approvedOn.trim() || !permission.record.trim()) return false
    if (!result.source.trim() || !result.whatChanged.trim()) return false
    for (const period of [before, after]) {
      if (!Number.isFinite(period.count) || period.count < 0 || !(days(period) > 0)) return false
      if (measure === "inquiry_conversion_rate" && !(period.outOf && period.outOf > 0)) return false
    }
    // Comparable periods: within a tenth of each other's length.
    return Math.abs(days(before) - days(after)) <= Math.max(days(before), days(after)) * 0.1
  })
}
