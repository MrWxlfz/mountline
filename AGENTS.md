# Mountline Project Instructions

Mountline Studio is a real small-team website, client portal, and digital systems business.

## Brand and copy
- Use "Mountline" in normal site copy.
- The logo may remain lowercase "mountline".
- Do not use "I", "me", or "my".
- Use "we", "our", and "Mountline".
- Do not mention age, school, summer, friends, or side hustle.
- Avoid corporate filler and AI-agency cringe.

## Architecture
- Public website: `/`
- Employee/admin dashboard: `/admin` or `/dashboard`
- Client login backup: `/client-login`
- Client project portal: `/portal/[portalId]`
- Clerk is the auth provider.
- Supabase stores data.
- Do not use Supabase Auth.
- Do not expose service role keys.

## Auth rules
- Public website is public.
- Employee dashboard is for Mountline team members only.
- Client portal is for assigned clients only.
- Client login is footer-only backup.
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
- Keep the design black/Vercel-like and readable.

## Review guidelines
- Verify auth route protection.
- Verify no secret keys are exposed client-side.
- Verify public signup is not promoted.
- Verify Supabase writes have loading/success/error states.
- Verify dashboard navigation does not feel frozen.
- Verify no fake client claims, fake testimonials, or fake metrics are added.
