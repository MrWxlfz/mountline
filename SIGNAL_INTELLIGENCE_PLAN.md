# Signal intelligence overhaul plan

## Audit findings

- The active rebuilt experience submits to `/api/signal/runs`; the run engine in `lib/signal/lead-runs.ts` persists checkpoints in `signal_runs`, materializes `signal_run_leads`, scans one candidate per advance request, ranks ready rows, and generates packs only for ranked finalists.
- Discovery uses only one query shape per industry term, caps raw results at four times the requested count, and caps candidates at roughly two times the requested count. A five-lead run therefore cannot behave like a 30–75 candidate funnel.
- Candidate identity begins with the first segment of a search title. The directory/listicle test catches only a narrow set of phrases, so category-plus-city titles can become business names. Official-site matching verifies the supplied name but does not resolve a stronger canonical name or require multiple identity signals.
- PetSmart passed because the inline known-chain list omits PetSmart and Petco. Chain handling is a small term list plus page-language regexes; it has no normalized domain registry, explicit classification, location estimate, or targeted ambiguity check.
- Geography is considered verified when the requested city appears anywhere in combined text that includes a search snippet. Search-title/snippet evidence can therefore masquerade as first-party location proof.
- Confidence is mostly a count of facts plus fixed bonuses. Evidence has no source tier or contradiction model, and confidence can reach 100 without independent corroboration. Opportunity and confidence are partly separated internally, but only the confidence-adjusted final score is persisted as the visible score.
- Ready status has no hard minimum opportunity, confidence, entity, independence, or geography gates. This admits mediocre candidates and causes the score distribution to cluster because all surviving dimensions use similar heuristics and missing dimensions are reweighted away.
- AI receives a thin fact list and is allowed to replace only the walk-in script, call script, follow-up, and objections. The deterministic base is generic, underpriced, and does not contain the full requested briefing, opener, discovery questions, tailored offer, do-not-say list, or evidence-aware design direction.
- AI calls use JSON mode and Zod validation, but malformed sales-pack output is not retried. Provider failure silently falls back to a shallow pack. Firecrawl is attempted during each candidate check rather than after the cheapest identity/chain/geography gates.
- All inspected Signal API routes call the Clerk team-member API guard. Dashboard pages also require team membership. Supabase service-role usage is confined to server modules; no service-role key is referenced through a `NEXT_PUBLIC_` variable.

## Implementation plan

1. Add a pure, testable quality layer with a maintainable chain registry, generic-entity rejection, normalized domain/name/phone deduplication, evidence tiers, geography classification, calibrated confidence, weighted opportunity scoring, confidence-adjusted ranking, and hard qualification gates.
2. Expand discovery to diverse local/independent/owner-operated/social/contact query patterns and a 30–75 raw-candidate target. Treat results as discovery evidence only and defer Firecrawl until deterministic checks pass.
3. Persist canonical identity, chain classification, geographic verification, confidence components, opportunity/ranking scores, qualification/rejection state, generation type, prompt version, and structured evidence metadata through an additive migration.
4. Rebuild finalist packs from stored verified facts. Use a strict schema and retry malformed AI output; otherwise return a clearly labeled, genuinely useful deterministic fallback. Generate category-specific, evidence-bounded Lovable concept prompts.
5. Preserve the current UI and add only compact quality counts, source/generation labels, and the explicit fewer-than-requested message.
6. Add offline fixtures and regression tests for known chains, generic titles, independent entities, duplicate resolution, geography, confidence, score spread, qualification gates, script grounding, fallback behavior, and the Southlake failure case.
