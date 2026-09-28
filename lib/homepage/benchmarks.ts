/**
 * Third-party figures shown on the receptionist page.
 *
 * These are industry numbers, not Mountline results. Keep each figure tied to the page that
 * published it, quote the claim as published, and re-check it whenever the wording changes.
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
  consumerSurvey: {
    id: "callrail-consumer-survey",
    publisher: "CallRail",
    title: "Why businesses can’t afford to miss calls",
    url: "https://www.callrail.com/blog/missed-calls-cost-businesses-more-than-ever",
    published: "2025-09-25",
    // Checked 2026-09-28: "based on a survey of 1,000 U.S. consumers"; "21% immediately call another business."
    // CallRail sells call-tracking software. The article gives the sample, not the year the survey ran.
    note: "Survey of 1,000 U.S. consumers, published by a call-tracking company.",
  },
} as const satisfies Record<string, BenchmarkSource>

export const callContext = {
  value: 21,
  claim: "said they immediately call another business when a call goes unanswered",
  source: benchmarkSources.consumerSurvey,
} as const
