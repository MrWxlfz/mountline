# Mountline Signal

Mountline Signal is an internal sales intelligence and opportunity-research system for the Mountline team. It helps manually research businesses, review public website evidence, score opportunities, prepare draft-only outreach, and track next steps inside Mountline OS.

**Mountline Signal prepares research and outreach drafts for human review. It must not be used for automated unsolicited bulk outreach, sensitive personal profiling, or any workflow that processes patient information.**

Signal does not send emails, make calls, send DMs, send texts, submit forms, scrape Google Maps, scrape Google reviews, scrape social platforms, estimate owner personal income, infer sensitive demographics, or process PHI.

## Safe Scope

- Team-only dashboard routes under `/dashboard/signal`.
- Manual prospect entry.
- CSV/XLSX import from research already collected by the team.
- Quick Research from an exact business name plus location through a permitted public web research provider.
- City Campaigns from team-entered geography and playbook filters through a permitted public web research provider.
- User confirmation before a public research result becomes the official source.
- Candidate review before any discovered business becomes a prospect.
- Public scan of the confirmed official website only, with a small page limit.
- Optional screenshot capture of the confirmed official homepage after the same SSRF-safe website validation.
- Initial screening and manually triggered deep-dive analysis.
- Script Studio for draft-only email, call, voicemail, objection, and follow-up scripts.
- Manual call-session and Focus Mode prep queues with outcome tracking.
- Internal high-fit alerts only.
- Do-not-contact handling through `signal_suppression_list`.

## Routes

- `/dashboard/signal`
- `/dashboard/signal/new`
- `/dashboard/signal/research`
- `/dashboard/signal/import`
- `/dashboard/signal/campaigns`
- `/dashboard/signal/campaigns/new`
- `/dashboard/signal/campaigns/[campaignId]`
- `/dashboard/signal/markets`
- `/dashboard/signal/markets/new`
- `/dashboard/signal/markets/[marketId]`
- `/dashboard/signal/focus`
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

## City Campaigns

City Campaigns are team-controlled discovery batches for a target city, optional state, optional radius, and selected playbooks. They are designed to build a review queue, not to contact prospects automatically.

Flow:

- Create a campaign from `/dashboard/signal/campaigns/new` with geography, playbooks, optional notes, and optional session limits.
- Run discovery through Tavily only when `SIGNAL_RESEARCH_PROVIDER=tavily`.
- Store search queries, source URLs, source titles, snippets, provider labels, confidence, and candidate status.
- Mark likely official public websites as `pending_review`.
- Mark directory, social, search, or unclear sources as `needs_confirmation`.
- Require the team to approve, reject, or manually replace the official URL before import.
- Run duplicate checks before import using normalized business name, website host, email, and phone.
- Allow merge into an existing Signal prospect when the candidate is a duplicate.
- Scan only the approved official public website before creating or merging a prospect.
- Run initial analysis after import and add A/B imported prospects to Focus Mode.

Campaign discovery does not scrape Google Maps, Google reviews, Yelp, social platforms, or directory pages. Directory and social results may be retained as source context, but they cannot be treated as the confirmed official website without team review and replacement.

Candidate statuses:

- `pending_review`: discovery found a likely official public site, but the team has not approved it.
- `approved`: the team approved an official public URL for import.
- `rejected`: the team rejected the candidate.
- `imported_to_signal`: the candidate was created or merged into a Signal prospect.
- `duplicate`: the candidate matched an existing prospect.
- `needs_confirmation`: discovery found context but not a safe official source.
- `research_failed`: import or scan failed and needs manual review.

Campaign records are stored in `signal_campaigns`; candidates are stored in `signal_campaign_candidates`. Migration `202606050002_mountline_signal_v3_campaigns.sql` adds both tables and the Focus Mode queue table.

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
SIGNAL_VISUAL_MODEL=
GEMINI_API_KEY=
OPENAI_API_KEY=
```

Public research environment variables:

```text
SIGNAL_RESEARCH_PROVIDER=tavily|firecrawl|hybrid|disabled
TAVILY_API_KEY=
FIRECRAWL_API_KEY=
```

Optional screenshot capture environment variables:

```text
SIGNAL_SCREENSHOT_PROVIDER=browserless|firecrawl|manual|disabled
BROWSERLESS_API_KEY=
BROWSERLESS_BASE_URL=
```

Market cost-control environment variables:

```text
SIGNAL_MARKET_MAX_CANDIDATES=25
SIGNAL_FIRECRAWL_MAX_PAGES_PER_CANDIDATE=3
SIGNAL_FIRECRAWL_MAX_CREDITS_PER_MARKET=150
SIGNAL_VISUAL_SHORTLIST_THRESHOLD=70
SIGNAL_VISUAL_MAX_SCREENSHOTS_PER_MARKET=8
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
SIGNAL_VISUAL_MODEL=gemini-3.5-flash
SIGNAL_RESEARCH_PROVIDER=tavily
TAVILY_API_KEY=<Tavily API key>
SIGNAL_SCREENSHOT_PROVIDER=manual
SIGNAL_ALERT_EMAIL=<Mountline team alert email, optional>
```

API keys authenticate provider access. Model values are exact model IDs, not API keys. All provider variables must be configured server-side only. Never place keys in `NEXT_PUBLIC_` variables and never commit `.env` files.

`SIGNAL_AI_PROVIDER=disabled` is supported. If no key exists or the provider fails, Signal stores the website scan and uses deterministic scoring with the UI note: `AI analysis unavailable; rule-based score shown.`

`SIGNAL_RESEARCH_PROVIDER=disabled` is supported. Manual entry and import continue to work without Tavily.

`SIGNAL_SCREENSHOT_PROVIDER=manual` is the default and keeps screenshot collection as upload-only. `browserless` enables server-side homepage capture after the official URL passes the same website scanner safety checks. `disabled` hides automated capture guidance while manual upload can remain available.

`SIGNAL_RESEARCH_PROVIDER=hybrid` uses Tavily for lightweight public discovery and Firecrawl for complementary discovery plus official-site extraction where configured. Firecrawl is never used to crawl whole sites by default; market depth limits control how many official-site pages are read per candidate.

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

- `local_student`: warm, local, permission-based outreach for truly local or personal-fit businesses. This is a legacy enum name; outward copy should say Mountline locally and avoid personal-background framing.
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
- `friendly_local`: warm local tone; Mountline may mention being local to the Keller area when appropriate, but should not add personal-background framing.
- `modern_casual_brand`: upbeat, concise, polished; no forced slang.
- `busy_operations_manager`: brief, practical, operational.
- `formal_business`: polished, brief, professional.
- `clinical_professional`: administrative, compliance-aware, public-site-only.
- `warm_existing_connection`: only with explicit relationship context.

Private guidance may be entered in Script Studio, such as `They already use Square; pitch keeping Square, not replacing it.` Guidance is private and should shape drafts without being copied word-for-word into external scripts unless the team explicitly writes text meant to be quoted.

## Script Studio

Script Studio prepares manual scripts using official-source evidence, visual screenshot evidence when present, verified observations, playbook, relationship context, detected business needs, relevant demo, outreach mode, selected conversation style, prior status, private guidance, and compliance warnings.

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

External drafts are checked before copy actions are enabled. Drafts must not contain internal phrases such as `score`, `priority`, `lane`, `playbook`, `Signal detected`, `user-entered note`, `internal connection`, `public contact availability`, `value band`, `workflow improvement`, `source evidence`, `entered business context`, or `system-derived classification`. They must not imply unsupported claims, insult the current website, mention assumed age or demographics, hard-sell, or recommend first contact after prior outreach exists. If a draft fails this check, Signal shows `Needs Manual Review`, disables Copy buttons, and keeps regenerate/guidance controls available.

Status-aware script behavior:

- `researched` / `ready_to_contact`: prepare first contact
- `researched` with contact route missing: research contact route before outreach
- `contacted` / `awaiting_reply` before follow-up date: wait
- `contacted` / `awaiting_reply` when follow-up is due: prepare one respectful follow-up
- `permission_to_send_demo`: send the relevant demo or concept
- `demo_sent`: ask if they want a few specific recommendations
- `interested`: prepare discovery conversation
- `do_not_contact`: disable drafting/actions except history review

After prior outreach is recorded, Script Studio prioritizes a follow-up draft and hides first-contact scripts behind `View archived / alternate scripts`. Awaiting-reply records show the warning: `Do not contact through a second channel unless manually chosen.` Demo-send scripts use full public demo URLs such as `https://mountline.dev/work/barber-shop` and `https://mountline.dev/work/auto-detailing`.

Private guidance affects tone and strategy only. It is never copied verbatim into outward drafts and must not turn age, gender, income, race, health, or personality guesses into facts. If guidance says prior outreach already happened but no outreach event exists, Signal asks the team to record that prior outreach instead of silently changing history.

## Visual Website Audit

Signal V2.3 adds team-only visual evidence on `/dashboard/signal/[prospectId]`.

Allowed actions:

- Upload Desktop Screenshot
- Upload Mobile Screenshot
- Capture Homepage Screenshot
- Analyze Visual Design
- Remove Screenshot

Allowed files:

- PNG
- JPEG / JPG
- WEBP
- maximum 5 MB each
- one desktop and one mobile screenshot per prospect

Screenshots must be public business website screenshots only. Do not upload customer portals, private dashboards, credentials, PHI, patient content, internal documents, or sensitive information.

Automated capture, when configured, is limited to the confirmed official homepage. It validates the URL with the existing scanner first, uses Browserless only from the server, stores the resulting image as private visual evidence, and never captures third-party directories, social pages, authenticated pages, forms, or customer portals. If Browserless is not configured, Signal shows setup guidance and keeps manual upload available.

Storage:

- private Supabase Storage bucket: `signal-evidence`
- migration `202606050001_mountline_signal_v23_visual_evidence.sql` creates/updates the bucket metadata where Supabase permits SQL bucket setup
- screenshots are stored by private storage path and displayed only through team-only API routes that create short-lived signed URLs
- service role keys remain server-side only

Visual analysis uses Gemini when configured with:

```text
SIGNAL_AI_PROVIDER=gemini
GEMINI_API_KEY=
SIGNAL_VISUAL_MODEL=
```

If Gemini is not configured, screenshot upload still works but `Analyze Visual Design` returns setup guidance. HTML scan alone should not mark visual design as excellent with high confidence, especially for visual industries.

The visual model evaluates only visible website presentation:

- first impression
- hero clarity
- CTA visibility
- typography/readability
- navigation clarity
- services/package presentation
- photo/gallery/proof presentation
- booking/contact prominence
- trust presentation
- visual consistency
- mobile readability only when a mobile screenshot exists

It must not claim revenue loss, business performance issues, customer dissatisfaction, guaranteed improvement, or poor mobile usability without a mobile screenshot.

## Opportunity Lanes

Signal separates:

- Website Opportunity: visual evidence, official website scan, service/package clarity, gallery/work presentation, CTA/contact prominence, booking clarity, demo relevance, human observations, and confidence.
- Systems / AI Opportunity: visible operational complexity, user-entered observations, confirmed workflow pain, discovery-worthy questions, and compliance constraints.
- Outreach Readiness: verified public email, phone, contact form, relationship context, suppression status, outreach history, and follow-up timing.
- Pursuit Priority: based primarily on the strongest grounded lane, not a flat average of unrelated scores.

A strong website lead can remain A/B even when systems/AI opportunity is low. Missing contact information reduces outreach readiness, not website opportunity. Unconfirmed systems opportunities should be phrased as worth asking about during discovery.

Visual evidence materially affects website scoring for auto detailing, barber/salon, beauty, restaurants, and roofing/contractor/home services style prospects. For these records, Signal recommends screenshot upload for stronger scoring.

## Evidence Categories

Prospect detail separates evidence into:

1. Official Website Evidence: URLs, headings, CTAs, booking/contact links, services, platform evidence, and scan coverage.
2. Visual Screenshot Evidence: screenshot type, upload date, visual analysis, and confidence.
3. Human-Entered Observations: free-text notes plus structured verified observations.
4. System-Derived Classification: playbook, demo, platform guess, locality, outreach history, and classification logic.
5. AI Interpretation: summary, opportunities, confidence, and assumptions.

The `Add Verified Observation` action stores structured manual evidence with category, source, note, and optional URL. Sources are `manual_public_site_review`, `official_public_site`, `existing_conversation`, and `personal_relationship`.

## Commercial Fit

Commercial fit and value band must show:

- Commercial Fit
- Value Band
- Confidence
- Evidence Supporting Value Band
- What Requires Discovery Confirmation

Single local shops should usually stay starter/business unless multiple locations or confirmed systems needs exist. HVAC, contractor, medical, and dental opportunities require discovery confirmation before systems/high-value positioning. Signal must not estimate personal income, owner wealth, or sensitive customer demographics.

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

## Market Builder V4

Signal V4 adds `/dashboard/signal/markets` as the autonomous market builder. A Mountline team member enters a city/service area, one or more industries, a candidate limit, and a research depth, then reviews an estimated usage budget before running the market.

Market stages:

1. Discovery: Tavily, Firecrawl, or hybrid public web search finds plausible local businesses and likely official websites.
2. Suppression: existing rejected, duplicate, and do-not-contact records are hidden by default and counted in market progress.
3. Duplicate detection: candidates are compared by hostname, public email, phone, normalized name plus city, aliases, and prior corrections.
4. Official-site resolution: directories, social pages, and search result pages are not treated as official sites without human confirmation.
5. Lightweight evidence extraction: the existing SSRF-safe scanner reads the confirmed official site, and Firecrawl can scrape/map only a limited number of relevant official-site pages.
6. Preliminary scoring: deterministic scoring plus the fast AI provider, when configured, calculates website opportunity, systems opportunity, outreach readiness, pursuit priority, lane, demo, and confidence.
7. Visual shortlist: candidates above `SIGNAL_VISUAL_SHORTLIST_THRESHOLD` are flagged for desktop screenshot review up to `SIGNAL_VISUAL_MAX_SCREENSHOTS_PER_MARKET`.
8. Review queue: ranked candidates can be approved into Signal and optionally added to Focus Mode. Signal still never sends outreach automatically.

Research depth:

- `quick`: homepage only
- `balanced`: homepage plus up to two relevant official-site pages, capped by `SIGNAL_FIRECRAWL_MAX_PAGES_PER_CANDIDATE`
- `deep`: homepage plus deeper relevant official-site pages, still capped by the market page/credit settings

Cost controls:

- markets store `estimated_credit_budget` before the run and `actual_credit_usage` as the run progresses
- the run stops Firecrawl extraction before `SIGNAL_FIRECRAWL_MAX_CREDITS_PER_MARKET`
- per-candidate Firecrawl pages are capped
- screenshot shortlists are capped
- provider setup failures are stored as market messages and partial candidates remain reviewable

Market evidence graph:

- `Verified Facts`: official URLs, scanned headings, public contact routes, booking links, service/pricing/location language, platform signals, and Firecrawl official-site excerpts
- `Reasonable Inferences`: category classification, lane, priority, and scoring interpretation
- `Discovery Questions`: playbook questions that should be asked manually before pitching systems work

AI interpretations must not be stored as verified facts. Systems opportunities, especially HVAC, contractor, medical, or dental workflows, should be phrased as discovery questions unless the public site or human-entered context supports them directly.

## Market Progress V5

Market runs persist a snapshot on `signal_markets.progress` and append durable activity rows to `signal_market_events`. The browser reads the same persisted state through the team-only market API and polls every 1-2 seconds while a market is discovering, deduplicating, researching, or scoring. Polling stops when the market is ready, failed, or paused. This keeps progress visible after navigation without fake timers or client-only progress.

The current staged route handler is sufficient for small controlled markets because it persists after each stage and candidate checkpoint. A durable workflow system becomes appropriate if markets need long background execution after request timeouts, concurrent worker retries, scheduled resumptions, or provider calls that should continue when no browser tab is open.

## Communication Engine V4

Signal uses a principles-based communication system: warm, clear, concise, plainspoken, confident, permission-based, specific, respectful, low-pressure, not robotic, not corporate, not fake-casual, no forced slang, no unsupported claims, and no fake urgency.

The `signal_script_feedback` table stores draft feedback such as `Too corporate`, `Too long`, `Wrong assumption`, `Good opener`, and `Use edited version as guidance`. Feedback is retrieval context for future draft generation and review; it is not model training or fine-tuning. Private guidance should shape strategy without leaking verbatim into outward scripts.

The `signal_prompt_templates` table stores internal prompt registry defaults for quick score, deep analysis, category classification, visual analysis, first call, gatekeeper, voicemail, follow-up, demo send, objection response, and discovery questions. The registry is internal only and not exposed publicly.

Every outward-facing draft still needs validation for unsupported claims, internal terminology, AI leakage, private guidance leakage, demographic assumptions, fake familiarity, duplicate first-contact after prior outreach, jargon mismatch, aggressive tone, and unnecessary hype. Failed drafts should stay in manual review until regenerated or edited.

## Dashboard, Timeline, And Focus Mode

The main Signal dashboard is organized as a high-signal operating screen:

- Header: `Find Prospects` is the primary action, `Start Focus Mode` is secondary, and lower-frequency actions are grouped in the overflow menu.
- Today panel: calls ready, follow-ups due, demos waiting, research needing review, and high-fit alerts.
- Best Prospects: maximum five A/B prospects with city, category, pursuit priority, lane, next action, and confidence.
- Markets: maximum three recent market scans with discovered, scored, A/B, usage, progress, and a clear next action.
- All Prospects: behind `View All Prospects`, with simplified columns for business, category, city, pursuit priority, lane, contact readiness, status, follow-up, and open action.
- Filters: advanced filters are collapsed by default and active filters appear as removable pills.
- Weekly Scoreboard: compact bottom section based on recorded Signal data and outreach events.

Prospect detail separates grounded information into:

- Overview: concise summary, lane, next action, contact readiness, selected demo, score cards, and advanced actions.
- Evidence: official website evidence, scan coverage, human observations, system classification, AI interpretation, and score breakdown.
- Strategy: facts, reasonable inferences, discovery questions, offers, commercial fit, value band, and what not to pitch.
- Scripts: current status-aware scripts, private guidance, external readiness, corrections, and archived/alternate scripts.
- Timeline: research, scans, quick scores, corrections, outreach, replies, follow-ups, demo sends, calls, proposals, and alerts.
- Visual Audit: screenshot preview, manual upload, auto capture when configured, visual scoring, and recapture/remove controls.

Prospect detail also shows an outreach timeline built from `signal_outreach_events`, focus outcomes, follow-up dates, analysis timestamps, and visual evidence timestamps. Notes remain context; recorded events remain the source of truth for contact history.

Focus Mode at `/dashboard/signal/focus` is a manual work queue for approved prospects. It supports call, follow-up, vertical, campaign, and session-size filters in a compact setup drawer. After setup, the page emphasizes one current action item, shows progress such as `1 of 4`, and keeps the upcoming queue secondary. The main item shows why it deserves attention, a short script, verified contact route, relevant demo, and outcome actions. Objections, discovery questions, evidence, alternate scripts, and timeline detail stay behind secondary/collapsible sections.

Awaiting-reply prospects must not appear as new call targets before their follow-up date. They should appear in the follow-up queue only when due and should clearly say: `Wait until the scheduled follow-up date.`

Outcome buttons record events and update `signal_focus_items`; they do not call, email, text, DM, or submit forms.

## Campaign UX

Campaign detail uses a staged research funnel:

1. Discover
2. Review Candidates
3. Confirm Official Sites
4. Quick Score
5. Prioritize
6. Add to Focus Mode

Candidate rows prioritize business name, city, category confidence, likely official site, source, duplicate/suppression state, quick-score state, and evidence. Row actions are grouped in an overflow menu so the row does not become a wall of buttons. Preserved actions include approve, reject from campaign, reject permanently, mark duplicate, merge/select an existing prospect, not a duplicate, confirm official site, quick score, and add to Focus Mode after import.

## Dashboard UI Components

Mountline OS dashboard screens should prefer the shared primitives in `components/dashboard/dashboard-ui.tsx` before adding page-specific styling:

- `PageHeader`
- `PrimaryAction`
- `SecondaryAction`
- `MetricStrip`
- `StatusBadge`
- `EmptyState`
- `ActionRow`
- `CompactTable`
- `SectionPanel`

These components keep the internal dashboard black, graphite, readable, and restrained. Use blue for active intelligence states, muted green for ready/success, amber for waiting/review, and red only for suppression, blocking errors, or risk.

## Clerk Sidebar Profile

The dashboard shell uses Clerk as the source of truth for the active team member display. The sidebar profile should use Clerk profile data only:

- avatar from `user.imageUrl` through Clerk's `UserButton`
- `user.fullName` when available
- fallback to `user.firstName`
- fallback to the primary email username
- fallback to `Team Member`
- primary email address shown below the display name

Do not create a duplicate Supabase user-profile system solely for this display. The existing server-side Mountline team-member authorization remains the access control source for dashboard routes.

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
node_modules/.bin/tsc --noEmit
```

Manual checklist:

- Confirm the dashboard sidebar shows the active Clerk user's avatar, name, and primary email, with loading and fallback states.
- Confirm `/dashboard` starts with actionable Needs Attention rows, not non-actionable metric cards.
- Confirm `/dashboard/signal` has one primary action, one secondary action, overflow actions, readable best-prospect queue, readable recent markets, and the full prospect table behind `View All Prospects`.
- Confirm `/dashboard/signal` uses `Find Prospects` as the primary action, `Start Focus Mode` as secondary, shows Today, Recent Markets, Best Prospects, Activity/scoreboard context, and keeps the complete prospect table behind `View All Prospects`.
- Create `/dashboard/signal/markets/new` with city `Keller`, state `TX`, industry `auto_detailing`, 10 candidates, and balanced depth. Confirm the estimate shows Tavily operations, Firecrawl pages, screenshot count, fast-analysis count, and estimated budget before running.
- Run the Keller Auto Detailing market in hybrid mode. Confirm suppressed businesses are counted/hidden by default, likely duplicates are marked, official sites are resolved or sent to Needs Confirmation, Firecrawl evidence is stored when configured, top prospects are ranked, screenshot shortlist flags are generated, and one approved prospect can be added to Focus Mode.
- Run a Keller HVAC market and confirm HVAC classification, no unsupported missed-call claim, and systems opportunities stay as discovery questions unless supported by evidence.
- Run a barber/salon market and confirm `18|8` is never classified as HVAC, Square is preserved when visible, and the barber demo appears only for relevant barber/salon or beauty/wellness records.
- Mark a market candidate rejected permanently, rerun the market, confirm it remains hidden by default, then restore it from the suppressed tab.
- Test missing Firecrawl with Tavily enabled. Confirm Tavily-only discovery works and the UI explains reduced evidence mode through setup messages.
- Test missing Tavily with Firecrawl enabled. Confirm Firecrawl-only discovery works when supported and provider mode/usage are visible.
- Submit script feedback through the feedback API or UI path when present: edit a draft, mark `Too corporate`, save a better version, and confirm the feedback row is available as retrieval context without copying private guidance verbatim.
- Confirm `/dashboard/signal/focus` shows compact setup, one emphasized current item, upcoming queue, outcome save/advance behavior, and no premature awaiting-reply call targets before due dates.
- Confirm `/dashboard/signal/campaigns/[campaignId]` shows the staged funnel and grouped candidate actions while preserving approve/reject/duplicate/merge/quick-score/import/focus behavior.
- Confirm `/dashboard/signal/[prospectId]` uses Overview, Evidence, Strategy, Scripts, Timeline, and Visual Audit tabs with Quick Score and Add to Focus visible in the header.
- Sign in as a Mountline team member and confirm `/dashboard/signal` loads.
- Sign in as a non-team user and confirm dashboard access is denied.
- Create a manual prospect and confirm redirect to detail page.
- Create a medical/dental prospect and confirm compliance warning appears.
- Use Quick Research with a named business and location. Confirm candidate choices appear and only an official public site can be confirmed.
- Test Quick Research with `SIGNAL_RESEARCH_PROVIDER=disabled` or missing `TAVILY_API_KEY` and confirm setup guidance appears without breaking manual workflows.
- Create a city campaign for a small city/playbook set, run discovery, and confirm candidates show source URL, source type, confidence, and review status.
- Confirm directory/social/search results require confirmation and cannot be imported as official websites without replacement.
- Approve one likely official campaign candidate, reject one weak candidate, and confirm both statuses persist.
- Import approved campaign candidates and confirm duplicate detection, merge option, website scan, initial analysis, and imported status.
- Confirm imported A/B prospects appear in Focus Mode.
- Run Focus Mode with a short session limit, save outcomes, and confirm outreach events plus follow-up dates update the prospect timeline.
- Run Scan Website on a public website and confirm scanned URLs/evidence are stored.
- Test Capture Homepage Screenshot with `SIGNAL_SCREENSHOT_PROVIDER=manual` and confirm setup guidance appears.
- If Browserless is configured, capture a confirmed official homepage and confirm the private screenshot appears as visual evidence.
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
- New independent barber not contacted: warm local mode may be appropriate, with friendly local or modern casual communication profile and permission-based first contact.
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
