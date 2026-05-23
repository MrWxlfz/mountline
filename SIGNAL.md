# Mountline Signal

Mountline Signal is an internal sales intelligence and opportunity-research system for the Mountline team. It helps manually research businesses, review public website evidence, score opportunities, prepare draft-only outreach, and track next steps inside Mountline OS.

**Mountline Signal prepares research and outreach drafts for human review. It must not be used for automated unsolicited bulk outreach, sensitive personal profiling, or any workflow that processes patient information.**

## Safe Scope In V1

- Team-only dashboard routes under `/dashboard/signal`.
- Manual prospect entry and CSV import from research already collected by the team.
- Public website scan of the prospect homepage plus one clearly linked same-origin services/about/contact page when safe.
- Initial screening and manually triggered deep-dive analysis.
- Draft-only email, DM, call opener, gatekeeper, voicemail, and demo follow-up scripts.
- Internal high-fit alerts only.
- Do-not-contact handling through `signal_suppression_list`.

Signal does not send emails, calls, DMs, texts, or forms to prospects. It does not scrape Google Maps, Google reviews, Instagram, Facebook, LinkedIn, Yelp, or protected services.

## Routes

- `/dashboard/signal`
- `/dashboard/signal/new`
- `/dashboard/signal/[prospectId]`
- `/dashboard/signal/playbooks`
- `/dashboard/signal/alerts`

All pages and APIs use the existing Mountline team-member guard. Signal is not public-facing and is not exposed to clients.

## Manual Entry And CSV Import

Prospects can be created from `/dashboard/signal/new` with public business details, human notes, visible website observations, contact routes, playbook, relevant demo, and outreach mode.

CSV import on `/dashboard/signal` previews rows before saving. Supported headers include:

- business name
- industry
- city
- website
- email
- phone
- notes
- relevant demo
- platform
- status

CSV import is for manually collected research only. It is not automated discovery.

## Website Scanning

The scanner:

- accepts only public `http` and `https` URLs
- blocks localhost, loopback, private IPs, internal hostnames, `file://`, `ftp://`, and non-web protocols
- validates DNS resolution before fetching
- uses request timeout and response-size limits
- does not submit forms
- does not access authentication walls
- does not crawl entire websites
- avoids third-party platform scraping

The scan extracts objective signals such as titles, meta descriptions, headings, CTA words, service/pricing/location language, visible email/phone links, booking links, detected platform hints, image count, scanned URLs, timestamp, and supporting evidence snippets.

## AI Provider Configuration

Environment variables:

```text
SIGNAL_AI_PROVIDER=gemini|openai|disabled
SIGNAL_FAST_MODEL=
SIGNAL_DEEP_MODEL=
GEMINI_API_KEY=
OPENAI_API_KEY=
SIGNAL_ALERT_EMAIL=
```

`SIGNAL_AI_PROVIDER=disabled` is supported. If no key exists or the provider fails, Signal stores the website scan and uses deterministic scoring with the UI note: `AI analysis unavailable; rule-based score shown.`

The provider adapter is server-only. AI keys must not be exposed client-side.

## Initial Analysis Vs Deep Dive

Initial analysis is a fast screening pass. It produces score categories, priority, value band, recommended offer, suggested channel, suggested outreach mode, demo recommendation, summary, reasons to contact, red flags, and confidence.

Deep dive is manual-only and intended for stronger leads. It generates evidence-based opportunities, pitch strategy, call scripts, email/DM drafts, discovery questions, warnings, and recommended next action.

## Scores And Value Bands

Signal scores:

- website quality
- business viability
- operational opportunity
- website service fit
- AI workflow fit
- reachability
- compliance risk
- total opportunity

Priority bands:

- A: 85-100
- B: 70-84
- C: 50-69
- skip: below 50 or blocked by red flags

Project value bands:

- `$500-$1,250`
- `$1,250-$3,500`
- `$3,500-$10,000+`
- `unknown`

Value bands are opportunity bands, not personal income or owner wealth estimates.

## Outreach Modes

- `local_student`: warm, local, permission-based outreach for truly local or personal-fit businesses.
- `professional_studio`: concise Mountline Studio outreach for more formal or higher-value businesses.
- `warm_connection`: uses only manually entered relationship context and never invents familiarity.

All outreach is draft-only. The app has no prospect send endpoint and no bulk-send button.

## Playbooks

V1 includes:

- Auto Detailing
- Barber / Salon
- HVAC
- Roofing / Contractors / Home Services
- Medical / Dental
- General Local Business

Playbooks define ideal signals, visible weaknesses, workflow opportunities, discovery questions, red flags, compliance notes, demo fit, and recommended outreach mode.

## Alerts

Signal creates an internal high-fit alert when:

- `overall_opportunity_score >= 88`
- priority is `A`
- confidence is `medium` or `high`
- the prospect is not suppressed

Optional internal email can be sent only to `SIGNAL_ALERT_EMAIL` when the existing server-side Resend variables are available. Signal never emails prospects.

## Do-Not-Contact Handling

The `signal_suppression_list` table records businesses that should not receive further outreach. Adding a prospect to do-not-contact updates its status to `do_not_contact`.

Signal blocks contact-ready status for suppressed prospects and disables repeated draft-generation actions while a prospect is marked do-not-contact.

## Medical Compliance Gating

Medical and dental prospects are automatically set to `compliance_gated`.

Allowed early opportunities:

- public marketing website redesign
- public service-page clarity
- locations, hours, and contact clarity
- public FAQ organization
- general non-patient-specific administrative discovery

Do not recommend patient intake AI, clinical triage, diagnosis/support tools, patient call recording/transcription, EHR integrations, symptom-collecting appointment systems, PHI workflows, or any claim that Mountline provides HIPAA-compliant AI services.

## Data Restrictions

Signal may store public business/site information and human-entered observations. Signal must not infer sensitive personal traits, estimate owner income or wealth, target sensitive demographics, fabricate facts, or process patient information.

Future aggregate Census ACS service-area context may be considered only as area-level context after review. It must not become personal demographic profiling.

## Testing

Recommended verification:

```bash
pnpm build
pnpm lint
```

Manual checklist:

- Sign in as a Mountline team member and confirm `/dashboard/signal` loads.
- Sign in as a non-team user and confirm dashboard access is denied.
- Create a manual prospect and confirm redirect to detail page.
- Create a medical/dental prospect and confirm compliance warning appears.
- Run Scan Website on a public website and confirm scanned URLs/evidence are stored.
- Run Initial Analysis with `SIGNAL_AI_PROVIDER=disabled` and confirm rule-based scoring.
- Run Deep Dive and confirm outreach drafts are created but not sent.
- Mark statuses, set follow-up date, and add to do-not-contact.
- Confirm do-not-contact disables draft/contact actions.
- Import CSV and confirm preview appears before saving.
- Confirm high-fit alerts appear internally only.

## Future Roadmap

Document-only possibilities:

- permitted business discovery source integration after terms review
- aggregate Census ACS service-area context
- optional performance/Lighthouse audit
- customer-approved proposal generation
- dashboard workflow metrics
- safe internal alert email
- contractor/HVAC demo pages
- CRM conversion workflow improvements

Do not implement automated scraping, demographic targeting, mass email, medical patient workflows, or PHI processing.
