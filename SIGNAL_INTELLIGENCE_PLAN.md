# Signal intelligence overhaul plan

## Sales copilot architecture v4 — implemented

- The legacy prospect workspace and newer run engine remain intact, but every prospect now resolves into one of four explicit operating modes: identity resolution, verification outreach, opportunity outreach, or active-deal support.
- Identity and evidence versions are the source of truth for derived artifacts. Canonical name, address, phone, category, website, social profile, provider-place ID, and chain-status corrections invalidate only their declared dependents; old analyses, concepts, and scripts remain in history with an explicit stale reason.
- Provider health is stored separately from lead uncertainty. An integration failure can limit research coverage, but it cannot become a claim about a business or appear as a question for the owner.
- Business understanding, research missions, uncertainty budgets, executive recommendations, opportunity briefs, action availability, next actions, and the 10-dimension quality score are persisted as structured artifacts.
- Sales preparation uses four passes: deal diagnosis, strategy, script/asset generation, and red-team review. One repair is attempted; a safe deterministic verification script is used if the reviewed result still fails.
- Concepts are allowed during verification only as clearly labeled hypotheses. Strong-site holds, ambiguous identity, stale identity snapshots, explicit declines, and do-not-contact state disable the relevant actions with a visible reason.
- The prospect workspace starts with the recommendation and next move, exposes prepared tools and contextual actions, and moves research details below the operating decision.
- The additive migration `20260715173345_signal_sales_copilot_v4.sql` creates version history, provider-health, and research-mission persistence with RLS and server-only grants.
- Twenty deterministic fixtures cover identity failures, weak/strong/no-site businesses, category variation, provider outage, stale artifacts, active conversations, declines, and conversion. Custom Cleaners is the named regression fixture.

### Dependency and invalidation flow

1. Confirmed identity and accepted evidence create the active input snapshot and version numbers.
2. The dependency graph generates the business profile, uncertainty budget, recommendation, opportunity, concept, sales pack, and next action.
3. A correction increments the relevant input version, records which fields changed, and marks dependent current artifacts stale while preserving their history.
4. Server routes and workspace render guards reject artifacts whose version or identity snapshot no longer matches the active prospect.
5. Regeneration creates a new current artifact version; unrelated artifacts remain usable.

## Focused identity workflow v3 — implemented

- Root cause of the `magicpin` failure: the focused parser split the submitted name/address too loosely, unknown public domains defaulted to a likely-official source, the first weak website candidate was scanned, and structured publisher metadata then outranked the submitted name in canonical-name scoring. The prospect row was also created before resolution and appeared like a normal lead.
- The replacement parser preserves the exact submitted input and extracts a stable identity anchor, suite-aware address, E.164 phone, professional phone display, URL roles, location, notes, and duplicate fingerprint.
- The candidate graph scores name, address, phone, coordinates, domain, social, category, locality, source reliability, and contradiction penalties separately. Only stable identifiers connect clusters.
- A centralized source firewall prevents directories, aggregators, marketplaces, booking providers, review platforms, and search publishers from supplying canonical identity or an official site.
- Identity, contact, online-presence, opportunity, and sales sufficiency now gate verdict generation, concepts, scripts, outreach, Focus mode, and client/project conversion.
- Ambiguous and unresolved drafts preserve the submitted name, expose candidate selection and a concrete verification checklist, and remain separate from operational inbox leads.
- The migration `20260714201831_signal_identity_resolution_v3.sql` adds candidate, checklist, correction-history, evidence publisher/subject, lifecycle, confidence, readiness, and repair-audit persistence with server-only grants.
- `scripts/repair-signal-identities.ts` provides a dry run, audited apply, and per-run rollback for unverified directory-publisher canonical names.

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
