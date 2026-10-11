import { ClerkBoundary } from "@/components/auth/clerk-boundary"

export default function NoAccountLayout({ children }: { children: React.ReactNode }) {
  return <ClerkBoundary>{children}</ClerkBoundary>
}
