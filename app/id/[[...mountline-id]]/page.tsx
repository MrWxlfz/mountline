import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getSafePortalRedirect } from "@/lib/auth/mountline-id"
import { MountlineIdForm } from "../mountline-id-form"

type MountlineIdPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function MountlineIdPage({ searchParams }: MountlineIdPageProps) {
  const params = searchParams ? await searchParams : {}
  const portalRedirect = getSafePortalRedirect(params.redirect_url)
  const redirectUrl = portalRedirect
    ? `/auth/redirect?redirect_url=${encodeURIComponent(portalRedirect)}`
    : "/auth/redirect"
  const useCustomFlow =
    process.env.NEXT_PUBLIC_MOUNTLINE_ID_CUSTOM_FLOW !== "false" &&
    params.mountline_id_fallback !== "clerk"

  const { userId } = await auth()
  if (userId) {
    redirect(redirectUrl)
  }

  return <MountlineIdForm redirectUrl={redirectUrl} useCustomFlow={useCustomFlow} />
}
