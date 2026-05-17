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

## Architecture Notes

- Clerk handles auth.
- Supabase stores app data.
- The dashboard remains team-only.
- Client portals remain invite/link-based.
- Public signup is not promoted.
- Recommended Clerk env:
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/id`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/auth/redirect`
