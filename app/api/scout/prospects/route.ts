import { NextResponse } from "next/server"
import { z } from "zod"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

const prospectSchema = z.object({
  business_name: z.string().trim().min(1, "Business name is required").max(160),
  industry: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().max(40).optional().nullable(),
  website: z.string().trim().max(300).optional().nullable(),
  phone: z.string().trim().max(80).optional().nullable(),
  email: z.string().trim().email().max(180).optional().or(z.literal("")).nullable(),
  google_rating: z.coerce.number().min(0).max(5).optional().nullable(),
  google_review_count: z.coerce.number().int().min(0).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
})

function blankToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value
}

export async function GET() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("scout_prospects")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prospects: data || [] })
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json()
  const parsed = prospectSchema.safeParse({
    ...body,
    industry: blankToNull(body.industry),
    city: blankToNull(body.city),
    state: blankToNull(body.state),
    website: blankToNull(body.website),
    phone: blankToNull(body.phone),
    email: blankToNull(body.email),
    google_rating: blankToNull(body.google_rating),
    google_review_count: blankToNull(body.google_review_count),
    notes: blankToNull(body.notes),
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid prospect" },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("scout_prospects")
    .insert({
      ...parsed.data,
      email: parsed.data.email ? parsed.data.email.toLowerCase() : null,
      source: "manual",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prospect: data })
}
