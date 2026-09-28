# Mountline

Mountline's public site (websites, Mountline Capture, and the AI receptionist), project inquiry pipeline, team dashboard, client project portal, and support workflow. Next.js / React / TypeScript, Clerk identity, and server-side Supabase data access.

## Local development

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
# Populate the Clerk and Supabase settings for the intended environment.
pnpm dev
```

Open http://localhost:3000. Clerk's local keyless mode can render the public site without project credentials; it does not establish access to Mountline's team or customer data. Database writes need a reachable, configured Supabase project and must fail visibly when unavailable.

```sh
pnpm typecheck
pnpm test:stabilization
pnpm test:signal
pnpm test:receptionist
pnpm test:inquiries
pnpm build
pnpm lint
```

The full lint command includes legacy dashboard/Signal errors; do not suppress them to make a new feature appear clean. Tests use Node's TypeScript stripping support.

## Product paths

- `/`: Mountline's websites, the optional Capture photo/video add-on, a short receptionist section with the scripted demo and the fictional North Texas Air & Heat demo line, and the project inquiry form.
- `/receptionist`: the full receptionist explanation, demo line, testing, pilot, and questions. Old homepage anchors (`/#pilot`, `/#trades`, …) forward here.
- `/dashboard/leads`: Mountline buying inquiries, full messages, contact links, explicit review states, and each inquiry's email history and follow-up controls. These are separate from customers calling a client business.
- `/dashboard/receptionist`: team-only business-profile and prompt editor. Exports local drafts; it does not configure Retell or save profiles to the database.
- `/dashboard/projects`: client project, commercial evidence, manual inquiry ledger, and portal access.
- `/id`: unified Mountline ID login. No public signup; the dashboard is team-only and portals require an active assignment.
- `/portal/[portalId]`: assigned client's project and support view.

The phone demo runs outside this repository. No live Retell, calendar, SMS, transfer, or call-ingestion integration is present. Follow [the receptionist setup guide](docs/receptionist-pilot.md) for reusable profiles and acceptance calls.

## Inquiry email

The form saves to `leads` through `submit_mountline_inquiry`, which also queues the owner notification and the customer confirmation in `inquiry_email_jobs`. Resend sends them; a daily Vercel Cron job (`/api/cron/inquiry-email`, `CRON_SECRET`) retries failures and handles follow-ups; `/api/webhooks/resend` records delivery, bounces, complaints, and (when configured) replies. Customer check-ins need approval unless reply detection is set up. Setup, DNS, and the end-to-end test are in [SETUP_FOR_LUKE.md](SETUP_FOR_LUKE.md).

## Deployment gates

Apply outstanding migrations in order before deploying the application (including `20260928120000_project_inquiry_email.sql`, which the inquiry form requires); do not re-run applied migrations or reset a database. The existing stabilization migration adds required project/inquiry/receipt operations and closes direct public table access. The follow-up client-assignment repair fixes project creation for an assigned client. See [Supabase setup](SUPABASE_SETUP.md).

Verify the target database is active, core environment settings are populated, team identities and client assignments exist, and a controlled pilot request reaches the lead inbox. A successful local build does not verify hosted database access or the external phone agent. No secret values belong in source control.
