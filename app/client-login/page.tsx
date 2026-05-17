import { redirect } from "next/navigation"
import { getSafePortalRedirect } from "@/lib/auth/mountline-id"

type ClientLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function ClientLoginPage({ searchParams }: ClientLoginPageProps) {
  const params = searchParams ? await searchParams : {}
  const portalRedirect = getSafePortalRedirect(params.redirect_url)

  if (portalRedirect) {
    redirect(`/id?redirect_url=${encodeURIComponent(portalRedirect)}`)
  }

  redirect("/id")
}
