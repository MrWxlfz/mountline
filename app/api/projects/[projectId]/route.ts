import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

const allowedStatuses = new Set([
  "discovery",
  "design",
  "build",
  "review",
  "launch",
  "support",
  "completed",
])
const allowedPaymentStatuses = new Set([
  "not_sent",
  "pending",
  "paid",
  "waived",
  "manual_received",
])
const allowedPaymentMethods = new Set([
  "stripe_card",
  "crypto",
  "cash",
  "check",
  "bank_transfer",
  "other",
])

function nullableText(value: unknown) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed || null
}

function nullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function paymentMethods(value: unknown) {
  if (!Array.isArray(value)) return null

  const methods = Array.from(
    new Set(
      value.filter(
        (method): method is string =>
          typeof method === "string" && allowedPaymentMethods.has(method),
      ),
    ),
  )

  return methods.length > 0 ? methods : null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const { projectId } = await params
  const body = await request.json()
  const status = typeof body.status === "string" ? body.status : "discovery"
  const paymentStatus =
    typeof body.payment_status === "string" ? body.payment_status : "not_sent"

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid project status" }, { status: 400 })
  }

  if (!allowedPaymentStatuses.has(paymentStatus)) {
    return NextResponse.json({ error: "Invalid payment status" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("projects")
    .update({
      status,
      preview_url: nullableText(body.preview_url),
      live_url: nullableText(body.live_url),
      payment_link: nullableText(body.payment_link),
      payment_status: paymentStatus,
      accepted_payment_methods: paymentMethods(body.accepted_payment_methods),
      manual_payment_instructions: nullableText(body.manual_payment_instructions),
      invoice_amount: nullableNumber(body.invoice_amount),
      invoice_label: nullableText(body.invoice_label),
      next_step: nullableText(body.next_step),
      target_launch_date: nullableText(body.target_launch_date),
      notes: nullableText(body.notes),
    })
    .eq("id", projectId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ project: data })
}
