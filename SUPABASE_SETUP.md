# Mountline Supabase Setup

Use this guide to set up a Supabase project for testing the Mountline dashboard and client portal flow.

## 1. Run Schema SQL

In the Supabase SQL editor, run:

```sql
supabase/northline_schema.sql
```

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

- active `team_members.email` matching the Clerk email
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

Optional: set `clerk_user_id` once the client has a Clerk account.

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

## Lead Submission and RLS

The current public lead form inserts into `leads` through a server action using the Supabase anon client. For production, choose one of these safe options before enabling strict RLS:

**Option A: anon insert policy for leads only**

Keep the current anon-client insert path and add a restrictive `insert` policy for `leads` only. Do not grant anon read, update, or delete access to lead data.

**Option B: server-only lead submission**

Move public lead submission behind a server route/action that uses the Supabase service-role key on the server only, then add spam/rate limiting before writing. This is the recommended production path once Mountline adds abuse protection.
