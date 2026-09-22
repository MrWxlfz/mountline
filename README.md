# Mountline

Mountline's public receptionist offer, team dashboard, client project portal, and support workflow. Next.js / React / TypeScript, Clerk identity, and server-side Supabase data access.

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
pnpm build
pnpm lint
```

The full lint command includes legacy dashboard/Signal errors; do not suppress them to make a new feature appear clean. Tests use Node's TypeScript stripping support.

## Product paths

- `/`: fictional North Texas Air & Heat phone demo, bounded receptionist offer, and pilot request form.
- `/dashboard/leads`: Mountline buying inquiries, full messages, contact links, and explicit review states. These are separate from customers calling a client business.
- `/dashboard/receptionist`: team-only business-profile and prompt editor. Exports local drafts; it does not configure Retell or save profiles to the database.
- `/dashboard/projects`: client project, commercial evidence, manual inquiry ledger, and portal access.
- `/id`: unified Mountline ID login. No public signup; the dashboard is team-only and portals require an active assignment.
- `/portal/[portalId]`: assigned client's project and support view.

The phone demo runs outside this repository. No live Retell, calendar, SMS, transfer, or call-ingestion integration is present. Follow [the receptionist setup guide](docs/receptionist-pilot.md) for reusable profiles and acceptance calls.

## Deployment gates

Apply outstanding migrations in order before deploying the application; do not re-run applied migrations or reset a database. The existing stabilization migration adds required project/inquiry/receipt operations and closes direct public table access. The follow-up client-assignment repair fixes project creation for an assigned client. See [Supabase setup](SUPABASE_SETUP.md).

Verify the target database is active, core environment settings are populated, team identities and client assignments exist, and a controlled pilot request reaches the lead inbox. A successful local build does not verify hosted database access or the external phone agent. No secret values belong in source control.
