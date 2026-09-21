import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { firstValidationError, saleConfirmationSchema, uuidSchema } from "@/lib/projects/validation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const { projectId } = await params
  if (!uuidSchema.safeParse(projectId).success) return NextResponse.json({ error: "Invalid project identifier." }, { status: 400 })

  const parsed = saleConfirmationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: firstValidationError(parsed.error) }, { status: 400 })

  const supabase = createAdminClient()
  const { data: existing, error: lookupError } = await supabase.from("projects").select("id, sale_confirmed_at").eq("id", projectId).maybeSingle()
  if (lookupError) {
    console.error("[mountline] Sale confirmation lookup failed", { code: lookupError.code, message: lookupError.message })
    return NextResponse.json({ error: "Sale confirmation could not be recorded." }, { status: 500 })
  }
  if (!existing) return NextResponse.json({ error: "Project not found." }, { status: 404 })
  if (existing.sale_confirmed_at) return NextResponse.json({ error: "Accepted scope is already recorded. Reconcile corrections manually rather than overwriting evidence." }, { status: 409 })

  const confirmedAt = new Date().toISOString()
  const { data: project, error } = await supabase.from("projects").update({
    sale_confirmed_at: confirmedAt,
    sale_confirmed_by: authCheck.access.userId,
    sale_evidence_reference: parsed.data.evidence_reference,
  }).eq("id", projectId).is("sale_confirmed_at", null).select("id, sale_confirmed_at, sale_confirmed_by, sale_evidence_reference").maybeSingle()
  if (error) {
    console.error("[mountline] Sale confirmation failed", { code: error.code, message: error.message })
    return NextResponse.json({ error: "Sale confirmation could not be recorded." }, { status: 500 })
  }
  if (!project) return NextResponse.json({ error: "Accepted scope was recorded by another request. Refresh before continuing." }, { status: 409 })
  return NextResponse.json({ project }, { status: 201 })
}
