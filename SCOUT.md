# Mountline Scout V1

Mountline Scout is a low-cost lead scoring system for finding business website and workflow opportunities from public business information.

## What Scout Does

- Stores manually added prospects in Supabase.
- Scores public business and website opportunity.
- Fetches only the prospect website homepage when a website is provided.
- Uses OpenRouter for structured AI scoring when `OPENROUTER_API_KEY` is configured.
- Falls back to rule-based scoring when AI is unavailable.
- Alerts the Mountline team when `opportunity_score >= 85`.
- Lets the team mark prospects as reviewed, contacted, not a fit, or converted into a lead.

## What Scout Does Not Do

- Scout does not email prospects automatically.
- Scout does not scrape aggressively or crawl whole websites.
- Scout does not collect private personal information.
- Scout does not estimate income, sensitive demographics, or personal traits.
- Scout does not use Supabase Auth. Mountline ID still uses Clerk.

## Adding Prospects

Open `/dashboard/scout` as a Mountline team member and add:

- Business name
- Industry
- City and state
- Website
- Public business phone or email
- Google rating and review count
- Team notes

The page and APIs are team-only. Client portal users cannot access Scout.

## Scoring

The scoring action:

1. Loads the prospect from Supabase on the server.
2. Fetches only the website homepage if a website exists.
3. Extracts basic public signals: title, meta description, headings, homepage text, and contact signals.
4. Calls OpenRouter if configured.
5. Validates the returned JSON before saving it.
6. Uses a rule-based fallback if OpenRouter is missing or fails.
7. Saves website score, opportunity score, fit, reasons, summary, outreach angle, red flags, website notes, and `last_checked_at`.

## Alerts

When `opportunity_score >= 85`, Scout creates one internal `scout_alerts` record per prospect.

If Resend email settings are configured, Scout also emails the Mountline team. The prospect is never emailed by Scout.

## Environment Variables

- `OPENROUTER_API_KEY`: Enables AI scoring.
- `OPENROUTER_MODEL`: Optional OpenRouter model override. Defaults to `mistralai/mistral-small-24b-instruct-2501`.
- `RESEND_API_KEY`: Optional team alert email provider.
- `SCOUT_ALERT_TO` or `MOUNTLINE_TEAM_ALERT_EMAIL`: Team email address for Scout alerts.
- `SCOUT_ALERT_FROM` or `RESEND_FROM_EMAIL`: Verified sender address for Scout alerts.
- `NEXT_PUBLIC_SITE_URL`: Optional site URL sent to OpenRouter as request metadata.

## Avoiding Spam

- Keep prospect outreach manual.
- Review the score, reasons, and red flags before contacting any business.
- Use only public business contact information.
- Do not run bulk scraping jobs without explicit rate limits and review.
- Keep outreach specific to visible website or workflow opportunities.
