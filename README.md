# mountline

Mountline Studio is a Next.js app for the public website, team dashboard, client project portal, and support workflow.

## Getting Started

Run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Core Routes

- `/`: public website
- `/dashboard`: Mountline team dashboard
- `/client-login`: client portal login backup
- `/portal/[portalId]`: invite/link-based client project portal
- `/work/auto-detailing`: public demo concept page

## Architecture Notes

- Clerk handles auth.
- Supabase stores app data.
- The dashboard remains team-only.
- Client portals remain invite/link-based.
- Public signup is not promoted.

## Contact Emails

- Public: `hello@mountline.dev`
- Support: `support@mountline.dev`
- Projects: `projects@mountline.dev`
- Team: `team@mountline.dev`
