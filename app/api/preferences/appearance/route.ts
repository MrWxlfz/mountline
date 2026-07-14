import { NextResponse } from "next/server"
import {
  getAppearancePreference,
  isAppearancePreference,
  saveAppearancePreference,
} from "@/lib/appearance"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"

export async function GET() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const appearance = await getAppearancePreference(authCheck.access.userId)
  return NextResponse.json({ appearance })
}

export async function PUT(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  if (!body || !isAppearancePreference(body.appearance)) {
    return NextResponse.json({ error: "Choose System, Light, or Dark." }, { status: 400 })
  }

  const { data, error } = await saveAppearancePreference(
    authCheck.access.userId,
    body.appearance,
  )
  if (error) {
    return NextResponse.json(
      { error: "The appearance preference is saved on this device, but server sync is not available yet." },
      { status: 503 },
    )
  }

  return NextResponse.json({ appearance: data.appearance })
}
