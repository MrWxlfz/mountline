# Mountline Handoff

## Current Project Goal
Build Mountline into a production-ready small-team website, employee dashboard, and private client project portal. The immediate product goal is to support the core workflow: public lead capture, team-only client/project management, portal link generation, private client project views, manual payment links, and simple Supabase-backed support messages.

## Current Architecture
- Framework: Next.js App Router.
- Auth: Clerk mounted globally in `app/layout.tsx`.
- Data: Supabase via server-only service-role helpers for admin/server routes.
- Public site: `/`.
- Employee dashboard: `/dashboard`, protected by Clerk plus active Mountline team membership.
- Client portal: `/portal` chooser and `/portal/[portalId]` project portal.
- Client login backup: `/client-login`.
- Styling: dark, black/Vercel-like Mountline visual system with Tailwind.

## Routes
- `/`: public homepage.
- `/client-login`: backup Clerk sign-in for clients; public signup should not be promoted.
- `/dashboard`: team-only command center.
- `/dashboard/leads`: team-only lead list.
- `/dashboard/clients`: team-only client list.
- `/dashboard/clients/new`: team-only client creation.
- `/dashboard/projects`: team-only project list and portal/payment/link overview.
- `/dashboard/projects/new`: team-only project creation.
- `/dashboard/portals`: team-only portal manager.
- `/dashboard/settings`: team-only settings placeholder.
- `/portal`: authenticated portal chooser; redirects team members to `/dashboard`; redirects clients with one project to the project portal.
- `/portal/[portalId]`: authenticated private project portal.
- `/api/clients`, `/api/projects`, `/api/outreach`: admin APIs requiring active Mountline team membership.
- `/api/portal/[portalId]`: project portal data API requiring Clerk plus team or client access.
- `/api/portal/[portalId]/support`: support message write API requiring the same portal access.

## Clerk Auth Rules
- Public homepage remains public.
- Dashboard and admin APIs must be available only to active Mountline team members.
- Active team membership is checked in `lib/auth/team.ts` against Supabase `team_members` by `status = active` and either `email` or `clerk_user_id`.
- Clients should only access assigned portals through `client_portal_access`.
- Portal authorization must never trust `portalId` alone.
- Service-role Supabase usage should stay server-only.

## Supabase Tables
Expected core tables:
- `leads`
- `team_members`
- `clients`
- `projects`
- `client_portal_access`
- `support_threads`
- `support_messages`
- Existing/future internal tables may include `potential_clients` and `lead_insights`, but dashboard nav is being simplified away from outreach/AI.

Schema draft/migration currently added:
- `supabase/migrations/202605160001_client_portal_core.sql`

Type draft currently added:
- `lib/supabase/types.ts`

## Recent Changes Made
- Added server-only team guard in `lib/auth/team.ts` in a previous pass.
- Added `server-only` protection to `lib/supabase/admin.ts`.
- Split dashboard layout into server guard plus client shell in `app/dashboard/layout.tsx` and `app/dashboard/dashboard-shell.tsx`.
- Protected admin APIs with the shared team guard helper.
- Added `/access-restricted`.
- Updated public metadata, favicon SVG, metrics strip, and public copy polish.
- Started first real client portal implementation:
  - Added schema migration and Supabase TypeScript types.
  - Added `lib/portal/access.ts` for shared portal authorization and support thread creation.
  - Expanded `/api/portal/[portalId]` to return project, viewer, support thread, and messages.
  - Added `/api/portal/[portalId]/support` for simple support message writes.
  - Rebuilt `/portal/[portalId]` UI with overview, timeline, next step, preview/live links, payment link, and support messages.
  - Updated `/portal` chooser to redirect team members to `/dashboard` and clients with one project to the matching portal.
  - Updated project creation to generate `portal_id`, accept `live_url`, `payment_link`, and `next_step`, and create portal access for the selected client.
  - Simplified dashboard nav toward Leads, Clients, Projects, Portals, Settings.
  - Started improving `/dashboard/projects` with portal/payment/preview/live visibility and copy support.

## Current Known Issues
- The previous portal/dashboard implementation turn was interrupted. Review all changed files before continuing.
- `npm.cmd run build` ran but failed because `next/font` could not fetch Google Fonts in the restricted network environment.
- `git diff --check` passed after fixing a trailing whitespace issue in `app/api/projects/route.ts`.
- The new portal/project changes have not had a successful typecheck/build yet.
- Supabase migration should be reviewed before running in production, especially existing-table compatibility and indexes.
- Project edit is intentionally not built yet. A TODO exists in `/dashboard/projects` for editing status, payment link, next step, and portal access.
- No realtime chat, Stripe checkout, or AI outreach has been added.

## Next Recommended Task
Finish and verify the client portal/dashboard operations pass:
1. Review changed files for TypeScript and runtime issues.
2. Run `git diff --check`.
3. Run build in an environment that can fetch or locally provide the Geist fonts.
4. Verify project creation creates a `portal_id` and `client_portal_access` row.
5. Verify a client can sign in, reach the assigned portal, see payment/links/status, and submit a support message.
6. Verify a non-assigned client receives denied access.

## Commands That Should Pass
Run from repo root:

```bash
git diff --check
npm.cmd run build
```

Notes:
- `npm.cmd run build` currently needs dependency availability and network/font access, or the project should switch from remote `next/font/google` to local/system fonts for offline builds.
- `pnpm` was not available in the shell earlier; use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`.

## Files Most Likely Involved Next
- `app/portal/[portalId]/page.tsx`
- `app/portal/page.tsx`
- `app/api/portal/[portalId]/route.ts`
- `app/api/portal/[portalId]/support/route.ts`
- `lib/portal/access.ts`
- `lib/supabase/types.ts`
- `supabase/migrations/202605160001_client_portal_core.sql`
- `app/api/projects/route.ts`
- `app/dashboard/projects/page.tsx`
- `app/dashboard/projects/new/page.tsx`
- `app/dashboard/projects/project-link-actions.tsx`
- `app/dashboard/dashboard-shell.tsx`
- `lib/auth/team.ts`
- `lib/supabase/admin.ts`
