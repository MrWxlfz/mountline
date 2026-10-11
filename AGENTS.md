# Mountline Project Instructions

Mountline Studio is a real small-team website, client portal, and digital systems business.

## Brand and copy
- Use "Mountline" in normal site copy. The logo is lowercase "mountline": the ridge mark plus Figtree 600 (`components/brand/wordmark.tsx`). The old triangle mark is retired except inside the rebrand notice.
- Public marketing pages (`/`, `/luke`, `/receptionist`) speak as Luke, in first person ("I", "me", "my"). Mentioning that he's 15 and lives in Keller is intentional (Luke's call); don't mention school, summer, friends, or side hustle.
- Portal and dashboard copy keeps "we", "our", and "Mountline". Mountline ID follows docs/design/id-reference.html.
- Public copy lives in `content/site.ts` (and the server-only `content/receptionist.ts`); Luke edits it directly.
- Avoid corporate filler and AI-agency cringe.

## Architecture
- Public website: `/`
- Employee/admin dashboard: `/admin` or `/dashboard`
- Mountline ID login: `/id`
- Legacy client login redirect: `/client-login`
- Client project portal: `/portal/[portalId]`
- Clerk is the auth provider.
- Supabase stores data.
- Do not use Supabase Auth.
- Do not expose service role keys.

## Auth rules
- Public website is public.
- Employee dashboard is for Mountline team members only.
- Client portal is for assigned clients only.
- Mountline ID is the unified account login.
- Do not show public signup.
- Do not call the employee dashboard "client login".
- Do not show employee dashboard to clients.

## Current priorities
- Do not redesign the whole site.
- Make targeted production fixes.
- Add metadata/favicon/Open Graph.
- Remove unclear stats like `0` and `100%`.
- Make homepage text say "Mountline" with proper capitalization.
- Simplify the employee dashboard/admin.
- Build/improve the client portal.
- Add manual payment link support.
- Add simple Supabase support messages.
- Public pages follow `docs/design/` (light only, black ink, the reference HTML files are the spec). The dashboard keeps its own theme.

## Review guidelines
- Verify auth route protection.
- Verify no secret keys are exposed client-side.
- Verify public signup is not promoted.
- Verify Supabase writes have loading/success/error states.
- Verify dashboard navigation does not feel frozen.
- Verify no fake client claims, fake testimonials, or fake metrics are added.
