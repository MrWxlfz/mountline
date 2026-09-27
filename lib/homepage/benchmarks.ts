/**
 * Third-party figures shown on the public homepage.
 *
 * These are industry numbers, not Mountline results. Keep each figure tied to the
 * page that published it, and re-check the wording whenever a figure changes.
 * Never add a Mountline customer outcome here without real, reviewable data behind it.
 */

export type BenchmarkSource = {
  id: string
  publisher: string
  title: string
  url: string
  published: string // ISO date of the cited page
  note: string
}

export const benchmarkSources = {
  unanswered: {
    id: "callrail-unanswered",
    publisher: "CallRail",
    title: "How missed calls are costing your business",
    url: "https://www.callrail.com/blog/missed-calls-costing-your-business",
    published: "2025-09-11",
    // CallRail's footnote: beta-program participant data, compared with the six months before.
    note: "The 28% average comes from CallRail customer data.",
  },
  consumerSurvey: {
    id: "callrail-consumer-survey",
    publisher: "CallRail",
    title: "Why businesses can’t afford to miss calls",
    url: "https://www.callrail.com/blog/missed-calls-cost-businesses-more-than-ever",
    published: "2025-09-25",
    // The article gives the sample, not the year the survey ran.
    note: "Survey of 1,000 U.S. consumers.",
  },
} as const satisfies Record<string, BenchmarkSource>

/** The model is illustrative: 100 calls split by the published unanswered share. */
export const callModel = {
  total: 100,
  unanswered: 28,
  source: benchmarkSources.unanswered,
} as const

export const consumerFindings = [
  { value: 78, label: "have abandoned a business after an unanswered call", source: benchmarkSources.consumerSurvey },
  { value: 21, label: "say they immediately call another business", source: benchmarkSources.consumerSurvey },
] as const
