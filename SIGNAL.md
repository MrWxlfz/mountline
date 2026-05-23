# Mountline Signal

Mountline Signal is an internal sales intelligence and opportunity-research system for the Mountline team. It helps manually research businesses, review public website evidence, score opportunities, prepare draft-only outreach, and track next steps inside Mountline OS.

**Mountline Signal prepares research and outreach drafts for human review. It must not be used for automated unsolicited bulk outreach, sensitive personal profiling, or any workflow that processes patient information.**

Signal does not send emails, make calls, send DMs, send texts, submit forms, scrape Google Maps, scrape Google reviews, scrape social platforms, estimate owner personal income, infer sensitive demographics, or process PHI.

## Safe Scope

- Team-only dashboard routes under `/dashboard/signal`.
- Manual prospect entry.
- CSV/XLSX import from research already collected by the team.
- Quick Research from an exact business name plus location through a permitted public web research provider.
- User confirmation before a public research result becomes the official source.
- Public scan of the confirmed official website only, with a small page limit.
- Initial screening and manually triggered deep-dive analysis.
- Script Studio for draft-only email, call, voicemail, objection, and follow-up scripts.
- Manual call-session prep queues with outcome tracking.
- Internal high-fit alerts only.
- Do-not-contact handling through `signal_suppression_list`.

## Routes

- `/dashboard/signal`
- `/dashboard/signal/new`
- `/dashboard/signal/research`
- `/dashboard/signal/import`
- `/dashboard/signal/[prospectId]`
- `/dashboard/signal/playbooks`
- `/dashboard/signal/alerts`
- `/dashboard/signal/call-session/[sessionId]`

All pages and APIs use the existing Mountline team-member guard. Signal is not public-facing and is not exposed to clients.

## Quick Research

Quick Research starts from a business name plus location, such as `Grumpy's Auto Detailing, Keller TX`.

Flow:

- Search permitted public web results through Tavily when `SIGNAL_RESEARCH_PROVIDER=tavily`.
- Show candidate sources with title, URL, source type, evidence, and confidence.
- Require the team to confirm the official business website before creating or merging a prospect.
- Reject social, search, and directory URLs as confirmed official websites.
- Scan only the confirmed official public website with existing SSRF protections.
- Create or merge the prospect after duplicate checks on normalized business name, website host, email, and phone.
- Run initial analysis and show score, offer, value band, outreach mode, and conversation style.

Quick Research does not scrape Google Maps, Google reviews, Yelp, social platforms, or directory pages.

## Manual Entry And Workbook Import

Prospects can be created from `/dashboard/signal/new` with public business details, human notes, visible website observations, contact routes, playbook, relevant demo, outreach mode, and conversation style.

Workbook import on `/dashboard/signal/import` accepts `.csv`, `.xlsx`, and `.xls` files up to 5 MB. Files are parsed server-side. Raw workbook files are not sent to AI. Signal converts rows and headers into sanitized structured data, maps obvious columns deterministically, can ask the fast AI model to map ambiguous headers only, shows duplicates, and imports only after team confirmation.

Supported headers include:

- business name / company
- contact name
- niche / industry
- city / area
- state
- website
- email
- phone
- instagram
- notes
- what looks good
- problem / issue
- demo
- status
- follow-up
- platform
- booking platform

Workbook import is for manually collected research only. It is not automated discovery. Imported rows do not deep-analyze automatically; the team chooses which prospects to research or analyze.

## Website Scanning

The scanner:

- accepts only public `http` and `https` URLs
- blocks localhost, loopback, private IPs, internal hostnames, `file://`, `ftp://`, and non-web protocols
- validates DNS resolution before fetching
- validates redirects before following them
- uses request timeout and response-size limits
- does not submit forms
- does not access authentication walls
- does not crawl entire websites
- avoids third-party platform scraping

The scanner always starts with the confirmed official homepage. It may add one clearly linked services/packages/gallery page and one clearly linked contact/about/booking page. Contact pages are useful for reachability, but contact information alone must not be treated as proof of strong website quality. If only contact or booking pages are available, Signal shows low scan-coverage confidence and the note: `Insufficient scan coverage for visual/site-quality judgment`.

The scan extracts objective signals such as titles, meta descriptions, headings, CTA words, service/pricing/location language, visible email/phone links, booking links, detected platform hints, social URLs found on the official site, image count, scanned URLs, timestamp, and supporting evidence snippets. Social URLs may be stored when found on the official website, but Signal does not fetch or scrape social pages.

## Provider Configuration

AI environment variables:

```text
SIGNAL_AI_PROVIDER=gemini|openai|disabled
SIGNAL_FAST_MODEL=
SIGNAL_DEEP_MODEL=
GEMINI_API_KEY=
OPENAI_API_KEY=
```

Public research environment variables:

```text
SIGNAL_RESEARCH_PROVIDER=tavily|disabled
TAVILY_API_KEY=
```

Optional internal alert email:

```text
SIGNAL_ALERT_EMAIL=
```

Recommended local test values:

```text
SIGNAL_AI_PROVIDER=gemini
GEMINI_API_KEY=<Google AI Studio API key>
SIGNAL_FAST_MODEL=gemini-3.1-flash-lite
SIGNAL_DEEP_MODEL=gemini-3.5-flash
SIGNAL_RESEARCH_PROVIDER=tavily
TAVILY_API_KEY=<Tavily API key>
SIGNAL_ALERT_EMAIL=<Mountline team alert email, optional>
```

API keys authenticate provider access. Model values are exact model IDs, not API keys. All provider variables must be configured server-side only. Never place keys in `NEXT_PUBLIC_` variables and never commit `.env` files.

`SIGNAL_AI_PROVIDER=disabled` is supported. If no key exists or the provider fails, Signal stores the website scan and uses deterministic scoring with the UI note: `AI analysis unavailable; rule-based score shown.`

`SIGNAL_RESEARCH_PROVIDER=disabled` is supported. Manual entry and import continue to work without Tavily.

## Initial Analysis Vs Deep Dive

Initial analysis is a fast screening pass. It produces score categories, priority, value band, recommended offer, suggested channel, suggested outreach mode, demo recommendation, summary, reasons to contact, red flags, confidence, conversation style, public customer positioning, and brand voice summary.

Deep dive is manual-only and intended for stronger leads. It generates evidence-based opportunities, pitch strategy, call scripts, email/DM drafts, discovery questions, warnings, and recommended next action.

Signal records the model/provider label, research provider, research query, confirmed official URL, official-source confidence, source evidence, and last researched/analyzed timestamp where available.

## Deterministic Classification

Known sectors are classified before AI interpretation:

- Auto detailing, mobile detailing, ceramic coating, car detailing -> `auto_detailing`
- Barber, barbershop, salon, haircut -> `barber_salon`
- HVAC, air conditioning, heating, cooling -> `hvac`
- Roofing, contractor, remodel, home services -> `roofing_contractors_home_services`
- Medical, dental, dentist, orthodontist, clinic, doctor -> `medical_dental` and `compliance_gated`
- Otherwise -> `general_local_business`

Known demo matches are also deterministic:

- `auto_detailing` -> `/work/auto-detailing`
- `barber_salon` -> `/work/barber-shop`

AI may interpret unknown or ambiguous cases, but it must not downgrade a deterministic known demo to `none` unless a Mountline team member manually overrides the record.

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

Signal also stores:

- website opportunity score
- systems/AI opportunity score
- recommended lane: `website_first`, `systems_discovery`, `do_not_pursue`, or `compliance_gated`
- scan coverage confidence and note
- evidence weighting by source type

The total opportunity is no longer a flat average of unrelated services. A visually oriented local business can be an A or B website lead even when systems/AI fit is modest. AI workflow fit should not drag down a clear website-design opportunity.

Website quality is separate from reachability. Visible phone, email, booking, or contact-form information improves reachability/contact-flow confidence, not visual/site-quality score.

Priority bands:

- A: 85-100
- B: 70-84
- C: 50-69
- skip: below 50 or blocked by red flags

Commercial fit:

- `starter`
- `business`
- `systems`
- `high_value`
- `unknown`

Project value bands:

- `$500-$1,250`
- `$1,250-$3,500`
- `$3,500-$10,000+`
- `unknown`

Value bands are opportunity bands, not personal income or owner wealth estimates. Public customer positioning must be evidence-grounded from official site copy or entered business context and must not infer sensitive personal traits.

## Outreach Modes

- `local_student`: warm, local, permission-based outreach for truly local or personal-fit businesses.
- `professional_studio`: concise Mountline Studio outreach for more formal or higher-value businesses.
- `warm_connection`: uses only manually entered relationship context and never invents familiarity.

All outreach is draft-only. The app has no prospect send endpoint and no bulk-send button.

Signal separates three concepts:

- Locality: `keller_local`, `dfw_nearby`, `remote`, `unknown`
- Relationship: `none`, `personally_visited`, `knows_owner`, `family_referral`, `customer`, `referred`
- Outreach history: `never_contacted`, `emailed`, `called`, `dm_attempted`, `awaiting_reply`, `follow_up_due`

Being local does not automatically mean `warm_connection`. Already emailing someone does not mean `warm_connection`. Warm connection is only allowed when explicit relationship evidence exists.

## Outreach History Truth Model

Signal V2.2 treats `signal_outreach_events` as the authoritative history for contact attempts. Free-text notes are useful context, but they do not silently change status or history.

If notes say something like `already emailed`, `emailed waiting for response`, `DM sent`, or `called already` and no outreach event exists, Signal shows an inconsistency warning and asks the team to either:

- record the prior outreach event, or
- ignore the note for history tracking.

Recording a prior outbound event updates the prospect status/history safely. For example, recording an outbound email with no reply sets the prospect to `awaiting_reply`, stores the follow-up date if provided, and prevents Signal from recommending a new first-contact pitch.

Outreach event channels:

- `email`
- `call`
- `voicemail`
- `instagram`
- `contact_form`
- `text`
- `in_person`
- `other`

Outreach remains manual. The event table records what happened; it does not send messages, make calls, submit forms, or automate follow-up.

## Contact Readiness

Signal stores a contact readiness state:

- `verified_email_available`
- `verified_phone_available`
- `verified_contact_form_available`
- `verified_social_contact_available`
- `contact_missing`
- `contact_history_only`
- `suppressed`

If no public contact route is saved, Signal should say: `Contact route not confirmed. Research or add contact information before outreach.`

If an outreach event exists but the email/phone/route used is missing, Signal should say: `Add the email address used for this outreach so Signal can track follow-ups accurately.`

The `Find Contact Route` action scans the confirmed official site with the existing SSRF-safe scanner and asks the team to confirm any email, phone, or contact/booking route before saving it.

## Conversation Styles

Conversation style is separate from outreach mode. It affects tone, not identity or demographic inference.

Allowed styles:

- `friendly_local`
- `traditional_owner_operator`
- `modern_casual_brand`
- `formal_business`
- `clinical_professional`
- `concise_busy_owner`

The AI or rule-based fallback may suggest a style based only on official public brand language, business type, relationship context, or user-entered notes. Signal must never guess owner age, gender, race, income, health, religion, politics, or other sensitive traits.

## Communication Profiles

V2.2 adds a communication profile system for Script Studio. Profiles are based on user-entered known context, confirmed public brand tone, business structure, industry/playbook, contact role if known, and manual override. They must not infer age, gender, race, income, or other sensitive personal traits from names, photos, social profiles, or website visuals.

Allowed profiles:

- `plainspoken_owner_operator`: warm, patient, direct; avoid tech jargon.
- `friendly_local`: warm local tone; Luke may mention being a Keller High student only when `local_student` mode is selected.
- `modern_casual_brand`: upbeat, concise, polished; no forced slang.
- `busy_operations_manager`: brief, practical, operational.
- `formal_business`: polished, brief, professional.
- `clinical_professional`: administrative, compliance-aware, public-site-only.
- `warm_existing_connection`: only with explicit relationship context.

Private guidance may be entered in Script Studio, such as `They already use Square; pitch keeping Square, not replacing it.` Guidance is private and should shape drafts without being copied word-for-word into external scripts unless the team explicitly writes text meant to be quoted.

## Script Studio

Script Studio prepares manual scripts using official-source evidence, playbook, relationship context, detected business needs, relevant demo, outreach mode, selected conversation style, prior status, and compliance warnings.

It generates:

- first call opener
- employee/receptionist line
- voicemail
- response when the prospect says to send it
- response when asked about price
- response when the business already uses Square or booking software
- response when the business already has a website
- discovery-call questions
- first email draft
- one respectful follow-up draft

Scripts are stored as drafts for human review. Signal does not send them.

External drafts are checked before display. Drafts must not contain internal phrases such as `connection noted internally`, `value band`, `score`, `user-entered note`, `system detected`, `playbook`, `priority`, or other internal planning language. If a draft fails this check, Signal shows a warning so the team can regenerate or edit before use.

Status-aware script behavior:

- `researched` / `ready_to_contact`: prepare first contact
- `researched` with contact route missing: research contact route before outreach
- `contacted` / `awaiting_reply` before follow-up date: wait
- `contacted` / `awaiting_reply` when follow-up is due: prepare one respectful follow-up
- `permission_to_send_demo`: send the relevant demo or concept
- `demo_sent`: ask if they want a few specific recommendations
- `interested`: prepare discovery conversation
- `do_not_contact`: disable drafting/actions except history review

After prior outreach is recorded, Script Studio should prioritize a follow-up draft and hide first-contact scripts as the primary action. Demo-send scripts use full public demo URLs such as `https://mountline.dev/work/barber-shop` and `https://mountline.dev/work/auto-detailing`.

## Feedback Controls

Signal detail pages include correction controls:

- Wrong playbook
- Wrong demo
- Wrong channel
- Wrong communication profile
- Wrong score/lane
- Draft sounds unnatural
- Contact/history incorrect

Corrections are stored in `signal_feedback` for that prospect and can guide regeneration. This is not global model training.

## Call Sessions

Call sessions are manual call-prep queues for one to five team-approved prospects. They show phone number, priority, score, reason worth calling, opening line, gatekeeper line, likely objection responses, demo link, discovery questions, and suppression/contact-history warnings.

Outcome buttons update Signal status safely:

- no answer
- voicemail left
- permission to send demo
- interested
- follow up later
- not interested
- do not contact

Call sessions are not auto-dialers and do not send texts, emails, DMs, or forms.

## Playbooks

Signal includes:

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

Signal blocks contact-ready status for suppressed prospects and disables repeated script-generation actions while a prospect is marked do-not-contact.

## Medical Compliance Gating

Medical and dental prospects are automatically set to `compliance_gated`.

Allowed early opportunities:

- public marketing website redesign
- public service-page clarity
- locations, hours, and contact clarity
- public FAQ organization
- general non-patient-specific administrative discovery

Do not recommend patient intake AI, clinical triage, diagnosis/support tools, patient call recording/transcription, EHR integrations, symptom-collecting appointment systems, PHI workflows, or any claim that Mountline provides HIPAA-compliant AI services.

Visible warning:

> Compliance-gated sector. Do not propose or build workflows involving patient information, clinical decisions, call transcription, intake data, or EHR systems without formal legal/compliance review, appropriate contracts, and approved infrastructure.

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
- Use Quick Research with a named business and location. Confirm candidate choices appear and only an official public site can be confirmed.
- Test Quick Research with `SIGNAL_RESEARCH_PROVIDER=disabled` or missing `TAVILY_API_KEY` and confirm setup guidance appears without breaking manual workflows.
- Run Scan Website on a public website and confirm scanned URLs/evidence are stored.
- Run Initial Analysis with `SIGNAL_AI_PROVIDER=disabled` and confirm rule-based scoring.
- Run Deep Dive and confirm outreach drafts are created but not sent.
- Prepare scripts from prospect detail, override conversation style, and confirm Script Studio drafts are stored.
- Create a call session from one to five selected prospects and save each outcome.
- Mark statuses, set follow-up date, and add to do-not-contact.
- Confirm do-not-contact disables draft/contact actions.
- Import `Mountline.xlsx` or CSV from `/dashboard/signal/import`, select a worksheet, confirm mappings/duplicates, and save.
- Confirm high-fit alerts appear internally only.

Calibration regression case:

- Prospect: `Grumpy's Auto Detailing`, Keller TX
- Expected playbook: `auto_detailing`
- Expected demo: `/work/auto-detailing`
- Expected outreach mode: `local_student` unless a real explicit relationship is entered
- If status is `awaiting_reply`, recommended next action should be: `Wait for reply. If no response by the follow-up date, send one short follow-up. Do not call or resend the first pitch today.`
- Website quality must not be `100` solely because a contact page has contact details.
- Primary offer should focus on website presentation, packages/gallery, and request-detail flow.
- Systems/AI should remain secondary or discovery-only unless supported by evidence.
- External scripts must not leak internal planning phrases.

V2.2 regression cases:

- `18|8 Salons`, Keller TX: barber/salon playbook, `/work/barber-shop`, notes that say already emailed should show an inconsistency warning until an outreach event is recorded. After recording email sent, status should be `awaiting_reply` and next action should wait/follow up, not first contact.
- Grumpy's Auto Detailing: auto-detailing playbook/demo, website-first lane, prior email/awaiting-reply status respected, no duplicate first-contact recommendation.
- New independent barber not contacted: local-student mode may be appropriate, with friendly local or modern casual communication profile and permission-based first contact.
- Medical/dental: professional studio mode, clinical professional profile, compliance warning, and no patient-data/PHI/EHR/intake AI recommendations.

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
