# Browser voice demo setup

The homepage can let a visitor talk to the fictional **North Texas Air & Heat** receptionist right in the browser, using their microphone, instead of calling the demo phone line. This guide switches that on, checks it works, and switches it off again.

Work through the steps in order. Each one says what success looks like.

---

## Where things stand

| Piece | Status |
| --- | --- |
| Server endpoints, limits, signed call links, error messages | Implemented and tested locally with a fake Retell and fake storage |
| Database change (`20260929120000_receptionist_web_demo.sql`) | Implemented and tested locally against Postgres (PGlite). **Needs to be applied to Supabase** (step 2) |
| Retell agent settings | **Needs you** in the Retell dashboard (step 1) |
| A real browser call through Retell | **Not verified.** No Retell credentials were available while building this. Step 4 is the first real test |

---

## How it works, in one minute

1. The visitor presses **Talk to the demo** and allows the microphone.
2. Their browser asks our server to start a call. The server checks the limits below, then asks Retell to create a web call with the demo agent, using the secret Retell key. The key never reaches the browser, and the browser cannot choose the agent, the call length, or anything else about the call.
3. The browser connects to Retell with a short-lived access token and the conversation happens directly between the browser and Retell.
4. When the call ends, the page shows the transcript and Retell's summary. It reads them live from Retell through our server, using a signed link that only works for that one call. **We don't copy transcripts into our database.** Retell keeps them according to the agent's data storage setting.

Limits, all enforced on the server:

- **3 calls per visitor** (by network address) per 60 minutes.
- **40 calls in any 24 hours**, across everyone.
- **2 calls at the same time.**
- **3 minutes per call**, and the call ends after **20 seconds of silence**.

At the default settings that's at most about 120 Retell minutes a day (40 calls × 3 minutes).

**Kept apart from real sales inquiries.** A demo call never creates a lead, never appears in the inquiry dashboard, and never sends an email. The only thing saved in Supabase is one row per call attempt in `receptionist_demo_calls`: a hashed visitor key (cleared after two days), the Retell call ID, start and end times, duration, and how it ended. No names, phone numbers, IP addresses, recordings, or transcripts.

---

## What you need

All of these are **server only**. Never add a `NEXT_PUBLIC_` prefix to any of them.

| Variable | Required | What it is |
| --- | --- | --- |
| `RETELL_API_KEY` | Yes | Your Retell secret API key |
| `RETELL_DEMO_AGENT_ID` | Yes | The ID of the fictional demo agent (starts with `agent_`). Never a real customer's agent |
| `RETELL_DEMO_AGENT_VERSION` | No | A published version number or tag. Leave empty to use Retell's default |
| `RECEPTIONIST_DEMO_TOKEN_SECRET` | Yes, unless `INQUIRY_HASH_SECRET` or `CRON_SECRET` is already set | 16+ random characters. Signs the per-call link and salts the visitor hash |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Yes | Already set for the rest of the site |
| `RECEPTIONIST_DEMO_MAX_SECONDS` | No | Call length in seconds. Default 180, allowed 60–300 |
| `RECEPTIONIST_DEMO_PER_VISITOR` | No | Calls per visitor per window. Default 3 |
| `RECEPTIONIST_DEMO_VISITOR_WINDOW_MINUTES` | No | Length of that window. Default 60 |
| `RECEPTIONIST_DEMO_DAILY_CAP` | No | Calls in any 24 hours. Default 40 |
| `RECEPTIONIST_DEMO_MAX_CONCURRENT` | No | Calls at the same time. Default 2 |

The browser demo stays off until every required variable is set. When it's off, the site keeps offering the demo phone line.

---

## Step 1: Prepare the agent in Retell

1. Open the Retell dashboard and find the fictional **North Texas Air & Heat** demo agent.
2. Decide whether to use it directly or make a copy. A copy (for example "North Texas Air & Heat (web demo)") is safer: changes for the browser demo can't affect the phone demo line, and the other way round. Either way, it must be the fictional demo agent that says it's an AI receptionist for a made-up business.
3. In the agent's settings:
   - Set **max call duration** to **3 minutes**.
   - Set **end call after silence** to about **20 seconds**.

   Our server already sends both limits with every call. The dashboard settings are a second guard in case a call is ever started some other way.
4. Choose a **data storage setting**. This controls what Retell keeps after each call. The after-call view on our page reads the transcript and summary from Retell, so a setting that keeps less may mean less shows up there. Confirm what appears during step 4 before relying on it.
5. Optional: under **post-call analysis**, add a few custom fields (for example `issue`, `callback_requested`, `urgent`). The page shows up to 10 of them under the summary, with labels like "Callback requested". Text, numbers, and yes/no values are shown; anything else is skipped.
6. Publish the agent and copy its **agent ID**. If you want to pin a specific published version, note its version number too.
7. Under **API keys**, copy your secret API key. Treat it like a password.

Things to know about Retell:

- **Web calls share your account's concurrency limit with phone calls.** Two browser demo calls in progress use two of the same slots the demo phone line uses. Keep `RECEPTIONIST_DEMO_MAX_CONCURRENT` below your plan's limit so the phone line always has room.
- **Web calls are billed per minute**, like phone calls. The limits above cap the worst case.

**Success looks like:** you have the agent ID, the API key, and the agent is published with the 3-minute and silence limits set.

---

## Step 2: Apply the database change (Supabase)

Do this **before** switching the demo on. Without it, starting a call fails safely with a "something went wrong on our side" message.

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) and pick the Mountline project.
2. In the left sidebar, open **SQL Editor**, then **New query**.
3. Open `supabase/migrations/20260929120000_receptionist_web_demo.sql` in this repository, copy all of it, and paste it into the editor.
4. Click **Run**.

**Success looks like:** "Success. No rows returned." In **Table Editor** there's a new `receptionist_demo_calls` table with RLS enabled and no rows. Nothing else changes.

The file is safe to run twice. It only adds things.

---

## Step 3: Add the settings in Vercel

1. Open the Mountline project in Vercel, then **Settings → Environment Variables**.
2. Add `RETELL_API_KEY` and `RETELL_DEMO_AGENT_ID` for **Production**. Add them to **Preview** too only if you want the browser demo on preview deployments; those calls count against the same Retell account.
3. If neither `INQUIRY_HASH_SECRET` nor `CRON_SECRET` is set, add `RECEPTIONIST_DEMO_TOKEN_SECRET`. To make one, run `openssl rand -base64 32` in a terminal and paste the result.
4. Leave the optional limits empty unless you want different numbers.
5. **Redeploy.** Vercel only picks up changed variables on a new deployment.

For local testing, put the same variables in `.env.local` and restart the dev server.

---

## Step 4: Check it works

Use a desktop browser (Chrome is easiest) with a microphone.

1. Open the homepage and press **Talk to the demo**.
2. Allow the microphone when the browser asks.
3. The status should change to live and you should hear the receptionist greet you as North Texas Air & Heat.
4. Say something like "My AC stopped cooling," answer a question or two, then end the call.
5. The transcript should appear, and within a minute or so the summary. If the summary hasn't arrived after about 4 minutes, the page stops waiting and says so.
6. In Supabase **Table Editor → `receptionist_demo_calls`**, the newest row should have a `retell_call_id`, an `ended_at` time, `outcome` = `ended`, and a `duration_ms`. There are no transcript columns.
7. In the Retell dashboard's call history, the call should be listed as a web call with metadata `source: mountline-site-demo` and `synthetic: true`.
8. In the Mountline dashboard, confirm **no new inquiry** appeared.
9. Optional: start another call and close the tab mid-call. The call should end in Retell's call history within a few seconds.
10. Optional, uses up your own quota for the hour: start four calls from the same network. The fourth should say you've tried the demo a few times already.

**Success looks like:** a real conversation, a transcript and summary afterwards, one `ended` row in Supabase, and no inquiry or email.

---

## What isn't verified until you do step 4

- **No real Retell call has been made with this code.** It was built against Retell's documented API (`create-web-call`, `get-call`, `stop-call`) and tested with a fake Retell. Field names, how Retell answers when asked to stop a call that already ended, and how soon the summary arrives are confirmed only by a real call.
- The database change has been tested in a local Postgres, not in the Mountline Supabase project.
- Voice quality, delay, and microphone behaviour on phones (especially iPhone Safari) and with Bluetooth headsets.
- How the chosen data storage setting affects what the after-call view can show.
- Whether the default limits suit real traffic.

---

## Switching it off

- **Normal:** remove `RETELL_DEMO_AGENT_ID` in Vercel and redeploy. The site stops offering the browser demo and the endpoint answers "not switched on yet". The demo phone line is unaffected.
- **Right now, without a deploy:** rotate or delete the Retell API key in the Retell dashboard. New browser calls fail immediately with a friendly error. Remember that this key may be used elsewhere.
- Calls already in progress end on their own within 3 minutes.

---

## For maintainers

| File | Purpose |
| --- | --- |
| `lib/receptionist/web-demo/contract.ts` | Response types and visitor-facing messages shared with the browser |
| `lib/receptionist/web-demo/config.ts` | Reads the variables above; `isWebDemoAvailable()` for server components |
| `lib/receptionist/web-demo/server.ts` | Request handling, Retell calls, and record mapping, with injected dependencies |
| `lib/receptionist/web-demo/token.ts` | Signed per-call links and the visitor hash |
| `lib/receptionist/web-demo/store.ts` | Supabase RPC calls (service role) |
| `app/api/receptionist/demo-call/…` | Thin route handlers |
| `lib/receptionist/__tests__/web-demo.test.ts` | Tests, including the migration in PGlite |

Endpoints:

- `POST /api/receptionist/demo-call` — same-origin JSON only. Returns Retell's web call unchanged, a view token, and the call length.
- `GET /api/receptionist/demo-call/[callId]?token=…` — status, transcript (up to 60 turns), and summary. Only for calls made with the configured demo agent from this site.
- `POST /api/receptionist/demo-call/[callId]/end` — body `{ "token": "…" }`, also accepted as `text/plain` so `navigator.sendBeacon` can end a call when the tab closes.

Run the tests with `npm run test:receptionist`.
