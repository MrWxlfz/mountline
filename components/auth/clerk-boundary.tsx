import { ClerkProvider } from "@clerk/nextjs"

/**
 * Clerk's client provider, only around the routes that use Clerk in the browser: /id, /dashboard,
 * /portal, /no-account, and the team-only /receptionist. The public pages (/, /luke) don't load
 * Clerk's scripts.
 * Server-side auth (proxy.ts, auth(), currentUser()) doesn't depend on this provider.
 */
export function ClerkBoundary({ children }: { children: React.ReactNode }) {
  return <ClerkProvider afterSignOutUrl="/">{children}</ClerkProvider>
}
