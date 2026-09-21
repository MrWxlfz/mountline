# Mountline Supabase Setup

Use this guide to set up a Supabase project for testing the Mountline dashboard and client portal flow.

## 1. Run Schema SQL

For a fresh test project, run the base schema and then every migration in timestamp order (the Supabase CLI is preferred):

```sql
supabase/northline_schema.sql
```

Then apply the files under `supabase/migrations/` in timestamp order with the Supabase CLI or by running each file's contents in the SQL editor. A filename wildcard is not SQL.

This creates the tables the current app expects:

- `team_members`
- `leads`
- `clients`
- `projects`
- `client_portal_access`
- `support_threads`
- `support_messages`
- `potential_clients`
- `lead_insights`

The stabilization migration also creates:

- `payment_link`
- project sale-confirmation evidence
- append-only `project_receipts`
- project-scoped `inquiries` and `inquiry_events`
- atomic, idempotent project and inquiry creation functions
- `accepted_payment_methods`
- `manual_payment_instructions`
- `invoice_amount`
- `invoice_label`

The app uses Clerk for auth and Supabase for data. Do not use Supabase Auth for Mountline users.

## 2. Run Demo Seed SQL

For a realistic test flow, run:

```sql
supabase/seed_demo.sql
```

The seed creates:

- Team member: `luke@mrwxlfz.xyz`
- Demo client: `demo.client@example.com`
- Demo project: `Demo Roofing Website`
- Portal ID: `demo-portal`
- Demo payment status, card/check/bank-transfer methods, invoice amount, and manual instructions
- Portal access row for the demo client
- One open support thread
- Two support messages
- One demo lead

Change the emails and URLs before using real production data.

## 3. Add a Team Member

To make a Clerk user a Mountline team member, add their email to `team_members`:

```sql
insert into public.team_members (email, status, role)
values ('team@mountline.dev', 'active', 'team')
on conflict (email) do update
set status = 'active';
```

Optional but recommended after the user signs into Clerk: add their Clerk user ID.

```sql
update public.team_members
set clerk_user_id = 'user_xxxxxxxxx'
where email = 'team@mountline.dev';
```

The dashboard team guard accepts either:

- active `team_members.email` matching a verified Clerk email when the row is not bound to a different Clerk ID
- active `team_members.clerk_user_id` matching the Clerk user ID

## 4. Create Client Portal Access

Each project should have a unique `portal_id`.

```sql
update public.projects
set portal_id = 'customer-project-portal'
where id = 'PROJECT_UUID';
```

Grant a client access by email:

```sql
insert into public.client_portal_access (
  project_id,
  client_email,
  access_status
)
values (
  'PROJECT_UUID',
  'client@example.com',
  'active'
)
on conflict (project_id, client_email) do update
set access_status = 'active';
```

Optional: set `clerk_user_id` once the client has a Clerk account. Once bound, Clerk ID is authoritative and email fallback no longer applies to that row.

## 5. Test `/dashboard`

1. Sign into Clerk with an email in `team_members`.
2. Visit `/dashboard`.
3. Confirm the dashboard loads and shows leads, clients, projects, and portals.
4. Confirm `/dashboard/projects` shows portal link, preview/live links, payment link status, status, and next step when present.
5. Sign in with a non-team Clerk user and confirm `/dashboard` redirects to `/access-restricted`.

## 6. Test `/portal/[portalId]`

Using the seed data:

```text
/portal/demo-portal
```

Expected behavior:

- A team member can view the portal.
- `demo.client@example.com` can view the portal when signed into Clerk.
- Any other signed-in non-team user should see access denied.
- Signed-out users should be sent to `/id`.
- The portal should show project overview, status, timeline, next step, preview/live links, payment section, and support messages.
- The payment section should show card/manual payment options when configured. It shows paid coverage only from recorded receipts; legacy paid labels without receipts appear as unverified.
- Submitting a support message should insert a row into `support_messages`.

## 7. Test Mountline ID

1. Visit `/id`.
2. Sign in as a Mountline team member and confirm the app sends the user to `/dashboard`.
3. Sign in as a client with one assigned portal and confirm the app sends the user to `/portal/[portalId]`.
4. If the client has multiple assigned projects, the app should send the user to `/portal`.
5. If the account has no assigned access, the app should send the user to `/no-account`.
6. Visit `/client-login` and confirm it redirects to `/id`.

Recommended Clerk env:

```text
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/id
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/auth/redirect
```

## Notes

- Service-role Supabase usage is server-only. Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Public signup should not be promoted.
- Realtime support chat and Stripe checkout are intentionally not implemented yet.

## Data API boundary

All public-schema tables have RLS enabled and direct `anon`/`authenticated` grants revoked. Clerk identities are not Supabase Auth identities. Authorized reads and writes, including the validated public lead action, use the server-only service role after the application enforces the appropriate boundary. Never expose `SUPABASE_SERVICE_ROLE_KEY` in a browser bundle.

Apply `20260906232259_pilot_stabilization.sql` and `20260921230404_fix_pilot_client_assignment.sql` in order before deploying this application. The second migration repairs assigned-client project creation without rewriting the earlier migration. Verify the upgrade in a separate staging project before production. Do not edit old migrations to repair an existing project.

Run [the isolated SQL verification](docs/pilot-database-verification.md) before rollout. It checks repository SQL behavior without touching production, but does not replace testing against a separate hosted staging project.
