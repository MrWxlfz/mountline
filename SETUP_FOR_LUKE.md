# Setting up inquiry email

This is the one setup for the project inquiry form: **Resend** sends the email, your existing **Zoho** mailbox keeps receiving `hello@mountline.dev`, **Supabase** stores everything, and **Vercel** runs the site and a daily worker. Resend was already used by the Scout and Signal alerts in this codebase, so nothing new is being bolted on.

Work through the steps in order. Each one says what success looks like. Nothing here needs a purchase: Resend's free plan covers this volume, and the daily worker runs on any Vercel plan.

---

## Where things stand

| Piece | Status |
| --- | --- |
| Form, validation, saving, duplicate protection, rate limits | Implemented and tested locally |
| Database changes (`20260928120000_project_inquiry_email.sql`) | Implemented and tested locally against Postgres. **Needs to be applied to Supabase** (step 1) |
| Owner notification and customer confirmation | Implemented and tested locally with a fake sender. **Needs your API key** and **needs DNS verification** |
| Retries, daily worker, reminders, check-in approvals | Implemented and tested locally. **Needs deployment** |
| Delivery, bounce, and complaint tracking | Implemented and tested locally with signed test events. **Needs the webhook** (step 7) |
| Seeing customer replies automatically | Code implemented and tested with sample events. **Not set up.** Optional, see "Later" at the end |
| Anything actually delivered to a real inbox | **Live delivery not yet verified** until you finish step 10 |

---

## How it works, in one minute

1. Someone sends the form. The site checks it on the server and saves it in Supabase along with two queued emails: one to you, one to them. If the save fails, they're told it didn't go through, and their typing stays in the form.
2. Right after saving, the site sends those two emails through Resend. If Resend is down or not set up yet, the emails stay queued. Nothing is lost, and the inquiry is already in your dashboard.
3. Once a day, a worker retries anything that failed and handles follow-ups. You can also press **Send due emails now** in the dashboard at any time.
4. Follow-ups:
   - **Reminder to you.** If an inquiry is still New or Reviewed one business day later, you get one reminder.
   - **Check-in to the customer.** Three business days after you mark an inquiry **Contacted**, a short check-in is ready. By default it **waits for your approval**: you get an email saying it's ready, and you press **Send check-in** or **Don’t send** in the dashboard. It never goes out on its own until reply detection is set up and tested (see "Later").
   - At most one of each, ever. Nothing is sent if the inquiry is Closed or Qualified, follow-ups are paused, the customer opted out, their address bounced or marked you as spam, or you pressed **Customer replied**.

Times are business days (Monday to Friday) in `America/Chicago`, sent from 9 AM. Public holidays are not skipped.

---

## Before you start: two different things

- **Sending as hello@mountline.dev** means Resend has permission to send mail that says it's from `hello@mountline.dev`. You prove that with DNS records in Cloudflare (steps 3 and 4). It does not create a mailbox.
- **Receiving at hello@mountline.dev** means mail sent to that address lands somewhere you read. Right now that's **Zoho**: the domain's MX records point to Zoho. This setup doesn't change that. Step 5 checks that it works.

Customers reply to `hello@mountline.dev`, so those replies arrive in Zoho. The new-inquiry email to you goes to `luke.nordin@icloud.com`, and its Reply-To is the customer. If you reply to it from iCloud, the customer sees your iCloud address. To keep conversations on the business address, reply from the Zoho `hello@` mailbox instead.

---

## Step 1: Apply the database change (Supabase)

This must happen **before** the new code is deployed. The new form saves through a database function that this adds.

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) and pick the Mountline project.
2. In the left sidebar, open **SQL Editor**, then **New query**.
3. Open `supabase/migrations/20260928120000_project_inquiry_email.sql` in this repository, copy all of it, and paste it into the editor.
4. Click **Run**.

**Success looks like:** "Success. No rows returned." In **Table Editor** you can now see `inquiry_email_jobs` and `inquiry_email_events`, and the `leads` table has new columns such as `interests` and `contacted_at`. Your existing inquiries are untouched.

The file is safe to run twice. It only adds things.

---

## Step 2: Create a Resend account

1. Go to [resend.com](https://resend.com) and sign up (or sign in if you made one for the alerts).
2. Use the free plan.

**Success looks like:** you're on the Resend dashboard.

---

## Step 3: Add mountline.dev to Resend

1. In Resend, open **Domains**, then **Add Domain**.
2. Enter `mountline.dev` and pick the region closest to you (US East is fine).
3. Resend shows a short list of DNS records. Usually these are:
   - an **MX** record and a **TXT** record with the name **`send`** (for bounces and SPF), and
   - a **TXT** record named **`resend._domainkey`** (the DKIM signing key).

   Keep this page open. **Copy the values from Resend exactly. Don't retype them from anywhere else, including this guide.**

These records live on `send.mountline.dev` and `resend._domainkey.mountline.dev`. They don't touch the Zoho records on `mountline.dev` itself, so your mailbox keeps working.

---

## Step 4: Add those records in Cloudflare

Your DNS is on Cloudflare.

1. Open [dash.cloudflare.com](https://dash.cloudflare.com), pick **mountline.dev**, then **DNS**, then **Records**.
2. For each record Resend showed you, click **Add record** and fill in:
   - **Type**: as shown (MX or TXT).
   - **Name**: only the first part. Type `send`, not `send.mountline.dev`. Type `resend._domainkey`, not the full name.
   - **Content / Value**: paste from Resend.
   - **Priority** (MX only): what Resend shows, usually `10`.
   - **Proxy status**: if Cloudflare shows an orange cloud, click it so it says **DNS only**.
3. Save each one.

**Leave these alone:**
- The three **MX** records on `mountline.dev` pointing to `mx.zoho.com`, `mx2.zoho.com`, and `mx3.zoho.com`. That's your mailbox.
- The **TXT** record on `mountline.dev` that starts `v=spf1 include:zohomail.com`. Don't add a second SPF record there and don't edit it. Resend's SPF goes on `send`, which is a different name.
- The `_dmarc` record. It's currently `p=none` with reports to `hello@mountline.dev`. That's fine for now.

4. Back in Resend, click **Verify DNS Records**.

**Success looks like:** the domain shows **Verified** in Resend. It can take a few minutes. If it still says pending after an hour, check the Name fields (the most common mistake is typing the full name) and that proxy is off.

---

## Step 5: Check that hello@mountline.dev can receive mail

1. From any other address (your iCloud is fine), send an email to `hello@mountline.dev` with the subject `TEST receive`.
2. Sign in to Zoho Mail for `hello@mountline.dev`.

**Success looks like:** the TEST message is in the Zoho inbox. If you don't check Zoho often, set up the Zoho Mail app on your phone, or add a forwarding rule in Zoho (**Settings**, then **Mail Forwarding**) to send copies to iCloud. Replies to the customer confirmation arrive here, so this mailbox has to be one you actually read.

---

## Step 6: Create the Resend API key

1. In Resend, open **API Keys**, then **Create API Key**.
2. Name it `mountline-site`. Permission: **Sending access**. Domain: **mountline.dev**.
3. Copy the key. It starts with `re_`, and Resend shows it only once.

**Success looks like:** the key is copied somewhere safe, like a password manager. Never paste it into code, a chat, or a commit.

---

## Step 7: Add the webhook (delivery, bounces, complaints)

1. In Resend, open **Webhooks**, then **Add Webhook**.
2. Endpoint URL: `https://mountline.dev/api/webhooks/resend`
3. Events: `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.failed`, `email.suppressed`, and `email.received`.
4. Save, then open the webhook and copy its **Signing Secret**. It starts with `whsec_`.

**Success looks like:** the webhook is listed as enabled. It will show failures until the site is deployed with the secret (step 9). That's expected.

---

## Step 8: Make a cron secret

This proves to the site that the daily worker is really Vercel. In Terminal, run:

```bash
openssl rand -hex 32
```

**Success looks like:** a 64-character string. Copy it.

---

## Step 9: Put the settings in Vercel, then redeploy

1. Open [vercel.com](https://vercel.com), then the **mountline** project, then **Settings**, then **Environment Variables**.
2. Add each of these for **Production**. Add them for **Preview** too if you test on preview links, but use a separate Resend key there if you can.

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | the `re_…` key from step 6 |
| `INQUIRY_FROM_EMAIL` | `Mountline <hello@mountline.dev>` |
| `INQUIRY_REPLY_TO_EMAIL` | `hello@mountline.dev` |
| `INQUIRY_OWNER_EMAIL` | `luke.nordin@icloud.com` |
| `MOUNTLINE_SITE_URL` | `https://mountline.dev` |
| `CRON_SECRET` | the string from step 8 |
| `RESEND_WEBHOOK_SECRET` | the `whsec_…` secret from step 7 |
| `INQUIRY_TIMEZONE` | `America/Chicago` |
| `INQUIRY_CUSTOMER_FOLLOWUP` | `approval` |
| `INQUIRY_REPLY_DETECTION` | `off` |

Optional: `INQUIRY_OWNER_REMINDER_BUSINESS_DAYS` (default `1`), `INQUIRY_CHECKIN_BUSINESS_DAYS` (default `3`), and `INQUIRY_HASH_SECRET` (another random string; if it's missing, the cron secret is used to hash visitor IPs for rate limiting).

None of these start with `NEXT_PUBLIC_`, so none of them reach the browser.

3. Deploy the new code. Either push/merge it to `main` (Vercel deploys automatically), or in Vercel open **Deployments**, then the latest one's **⋯** menu, then **Redeploy**. Environment variables only apply to deployments made after you add them.

**Success looks like:**
- The deployment is **Ready**.
- Opening `https://mountline.dev/api/cron/inquiry-email` in a browser shows `{"error":"Unauthorized"}`. That's correct: it only answers Vercel's worker.
- **Settings**, then **Cron Jobs**, lists `/api/cron/inquiry-email` on `0 15 * * *`. That's once a day at 15:00 UTC (10 AM Central in summer, 9 AM in winter). On the Hobby plan Vercel may run it any time in that hour.

**If you're on Vercel Pro** and want retries within minutes rather than the next day, change the schedule in `vercel.json` to `*/15 * * * *` and redeploy. Hobby only allows once a day. The first two emails don't depend on the worker either way; they're sent right after the form is saved.

---

## Step 10: Send one controlled TEST

Use an address you control for the "customer". Label everything TEST.

1. Open `https://mountline.dev/#contact` and fill in:
   - Name: `TEST Luke`
   - Business: `TEST setup check`
   - Email: an address you can read. It can't be `hello@mountline.dev`.
   - Interests: any
   - Message: `TEST: checking inquiry email setup.`
2. Send it.

**What success looks like, in order:**

1. The page says "Thanks. Your message reached Mountline."
2. **Dashboard:** at `https://mountline.dev/dashboard/leads`, the TEST inquiry is at the top. Open it. Under **Email**:
   - *New-inquiry email to you*: **Accepted by Resend**, then **Delivered** within a minute or two (refresh).
   - *Confirmation to the customer*: the same.
   - *Reminder to you*: **Scheduled** for the next business day at 9 AM.
3. **iCloud:** you receive "New inquiry: TEST setup check (…)". Press Reply: it should be addressed to your TEST address.
4. **The TEST address** receives "Your message reached Mountline", from **Mountline <hello@mountline.dev>**. In Gmail, open the ⋮ menu and choose **Show original**. SPF, DKIM, and DMARC should all say **PASS**.
5. **Reply to that confirmation** from the TEST address. The reply should land in the **Zoho** `hello@` inbox (this proves the receiving side).
6. **Resend**, then **Emails**, shows both messages as delivered.
7. **Follow-up controls:** in the dashboard, set the TEST inquiry to **Contacted** and save. Its Email section shows *Check-in to the customer: Scheduled* three business days out. Press **Customer replied**; the check-in changes to **Cancelled: Customer replied**. Then set the status to **Closed**. The reminder is skipped on its next run.
8. **Worker:** in Vercel, open **Settings**, then **Cron Jobs**, and run the job from there (or trigger it with `vercel crons` from the Vercel CLI). Its log (**View Logs**) shows a 200 response. The dashboard's **Send due emails now** button does the same run.

Once all eight check out, live delivery is verified. You can delete the TEST inquiry in Supabase's Table Editor if you like; deleting it also removes its email records.

---

## Pausing follow-ups and troubleshooting

**Pause one inquiry:** open it in the dashboard and press **Pause follow-ups**. Reminders and check-ins stay on hold until you press **Resume follow-ups**. Setting the status to **Closed** stops them for good.

**Turn off customer check-ins entirely:** set `INQUIRY_CUSTOMER_FOLLOWUP` to `off` in Vercel and redeploy. Reminders to you still run.

**Stop all sending immediately:** delete `RESEND_API_KEY` in Vercel and redeploy. Inquiries are still saved; their emails wait in the queue until the key is back.

| What you see | What it means | What to do |
| --- | --- | --- |
| Dashboard banner: "Inquiries are being saved, but emails are not being sent" | One or more settings are missing; the banner names them | Add them in Vercel (step 9) and redeploy |
| Dashboard banner: "Email history isn't available yet" | The migration isn't applied | Do step 1. Until then, the form can't save |
| Email says **Retrying** with "Resend 403 … domain" | Domain not verified yet, or the key is for another domain | Finish step 4; check the key's domain. Queued emails send once fixed (press **Retry now**) |
| **Retrying** with "Resend 429" or "503" | Resend is busy or down | Nothing to do. It retries on the next run, or press **Retry now** |
| **Failed**: "outcome is unknown" | A send was interrupted more than a day ago, so it isn't safe to resend blindly | Check Resend, then **Emails**, for that message. If it isn't there, press **Retry now** |
| **Bounced** or **Marked as spam** | The address is bad or the person complained | No more customer emails go to that address. Contact them another way if needed |
| Stays **Accepted by Resend**, never **Delivered** | The webhook isn't reaching the site | Check step 7's URL and events, and that `RESEND_WEBHOOK_SECRET` matches. Resend shows failed webhook attempts on the webhook's page |
| Emails land in spam | New sending domain | Make sure SPF, DKIM, and DMARC pass (step 10.4). It usually settles as the domain builds history |
| The form says "A few messages have already come from here recently" | Rate limit: 5 per connection or 3 per email address per hour | Wait an hour, or email hello@ |

---

## Later (optional): let the dashboard see customer replies

Right now the app **cannot see replies**: they go to Zoho. That's why check-ins wait for your approval, and why the **Customer replied** button exists. To let the app notice replies:

1. In Resend, enable **receiving** on a new subdomain such as `inbound.mountline.dev`. **Don't** enable it on `mountline.dev` itself: that would compete with Zoho's MX records for your mailbox. Resend shows an MX record for the subdomain; add it in Cloudflare the same way as step 4 (Name `inbound`, DNS only).
2. In Zoho, open **Settings**, then **Mail Forwarding**, and forward a copy of `hello@mountline.dev` mail to an address on that subdomain (for example `replies@inbound.mountline.dev`). Keep a copy in Zoho. Zoho will ask you to confirm the forwarding address. The confirmation arrives in Resend's received emails.
3. Make sure the step 7 webhook includes `email.received`.
4. **TEST it before trusting it:** send a TEST inquiry, mark it Contacted, then reply to its confirmation from the TEST address. Within a minute, the inquiry should show **Customer replied**. If it doesn't, the forwarded message probably doesn't keep the original sender, and reply detection won't work this way. Leave it off.
5. Only after that test passes, set `INQUIRY_REPLY_DETECTION` to `resend_inbound` and, if you want unattended check-ins, `INQUIRY_CUSTOMER_FOLLOWUP` to `automatic`. Redeploy.

Replies you send from iCloud (by answering the owner notification) won't pass through Zoho, so they aren't seen either way. Press **Customer replied** for those.

---

## For reference

- **Where inquiries live:** Supabase table `leads`. Their emails are in `inquiry_email_jobs`, and provider events in `inquiry_email_events`. Read them at `/dashboard/leads` (Mountline team only).
- **Code:** `app/actions/submit-inquiry.ts` (form), `lib/leads/` (validation and saving), `lib/leads/email/` (templates, worker, follow-up rules, webhook), `app/api/cron/inquiry-email`, `app/api/webhooks/resend`, `app/inquiry/stop/[token]` (opt-out page).
- **Tests:** `pnpm test:inquiries`. The database tests run the real migration in an in-memory Postgres; nothing touches Supabase or sends mail.

---

# Optional: the browser voice demo

The September 2026 homepage rebuild added a **Talk to the demo** button to the receptionist console. It lets a visitor talk to the fictional North Texas Air & Heat receptionist in the browser, using their microphone. It is **off** until you set it up. While it's off, the console's main button is **Call the demo line**, and the short text example still works. Nothing else in the rebuild needs new settings: the form, the emails, and the steps above are unchanged.

| Piece | Status |
| --- | --- |
| Browser button, call states, errors, microphone handling | Implemented. Tested locally for the "switched off" and "microphone refused" cases only |
| Server endpoints, limits (3 per visitor per hour, 40 a day, 2 at once, 3 minutes each) | Implemented and tested locally with a fake Retell and fake storage |
| Database change (`20260929120000_receptionist_web_demo.sql`) | Tested locally in Postgres. **Needs to be applied to Supabase** |
| Retell API key and demo agent ID | **Not set.** Needs you |
| A real browser call | **Not verified.** No Retell credentials were available while building it |

To switch it on, follow **docs/receptionist-web-demo.md**. In short:

1. In Retell, use the fictional demo agent (or a copy), set its max call duration to 3 minutes and end-after-silence to about 20 seconds, publish it, and copy its agent ID and your secret API key.
2. In Supabase's SQL editor, run `supabase/migrations/20260929120000_receptionist_web_demo.sql`. Success: "Success. No rows returned," and a new empty `receptionist_demo_calls` table.
3. In Vercel, add `RETELL_API_KEY` and `RETELL_DEMO_AGENT_ID` (Production). `CRON_SECRET` from step 8 above also signs the demo's call links, so no extra secret is needed if it's set. Redeploy.
4. Test it: on the homepage press **Talk in your browser**, allow the microphone, talk for a moment, end the call. Success: the status shows **Live**, you hear the receptionist, and after hanging up the transcript and summary appear; one `ended` row appears in `receptionist_demo_calls`; **no** inquiry shows up in the dashboard and no email is sent.

Demo calls never become inquiries, never send email, and their transcripts aren't copied into Supabase. To switch it off, remove `RETELL_DEMO_AGENT_ID` in Vercel and redeploy.

## Test results and client results

The homepage no longer shows the site's own test results; those stay internal in `docs/case-study` (re-run them after a change with the scripts described in `docs/case-study/README.md`).

"The difference" section on the homepage is a labeled design demonstration with no figures. When a real client agrees to publish measured results, add them to `lib/case-study/client-results.ts` (the rules are at the top of that file) and they appear under it. Nothing to set up until then.

## Sample photos

Bramble's photos are free Unsplash images, loaded from Unsplash's image service and credited under Capture on the homepage (list: `lib/homepage/sample-photos.ts`). Nothing to set up. When you have photos from a real Capture shoot and the client's permission, those should replace them.
