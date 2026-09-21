import { NextResponse } from "next/server"
import { getPortalAccess } from "@/lib/portal/access"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ portalId: string }> },
) {
  const { portalId } = await params
  const access = await getPortalAccess(portalId)

  if (access.status === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (access.status === "not_found" || access.status === "forbidden") {
    return NextResponse.json({ error: "Portal unavailable" }, { status: 404 })
  }

  if (access.status === "error") {
    return NextResponse.json({ error: "Portal access could not be verified" }, { status: 503 })
  }

  if (access.status !== "authorized") {
    return NextResponse.json({ error: "Portal unavailable" }, { status: 404 })
  }

  const supabase = createAdminClient()
  const [threadResult, messagesResult, receiptsResult] = await Promise.all([
    supabase.from("support_threads").select("id, status").eq("project_id", access.project.id).eq("status", "open").maybeSingle(),
    supabase.from("support_messages").select("id, created_at, sender_type, sender_email, sender_clerk_user_id, sender_name, message").eq("project_id", access.project.id).order("created_at", { ascending: true }),
    supabase.from("project_receipts").select("amount_minor, currency").eq("project_id", access.project.id),
  ])

  if (threadResult.error || messagesResult.error || receiptsResult.error) {
    console.error("[portal] Portal detail lookup failed", {
      thread: threadResult.error?.message,
      messages: messagesResult.error?.message,
      receipts: receiptsResult.error?.message,
    })
    return NextResponse.json({ error: "Portal support could not be loaded" }, { status: 500 })
  }

  const totals = new Map<string, number>()
  for (const receipt of receiptsResult.data || []) totals.set(receipt.currency, (totals.get(receipt.currency) || 0) + Number(receipt.amount_minor))
  const receiptTotals = Array.from(totals, ([currency, amount_minor]) => ({ currency, amount_minor }))
  const invoiceMinor = access.project.invoice_amount === null ? null : Math.round(access.project.invoice_amount * 100)
  const usdReceived = totals.get("USD") || 0
  const legacyUnverified = ["paid", "manual_received"].includes(access.project.payment_status) && receiptTotals.length === 0
  const billingState = access.project.payment_status === "waived"
    ? "waived"
    : legacyUnverified
      ? "legacy_unverified"
      : access.project.payment_status === "pending"
        ? "pending"
        : "not_sent"

  return NextResponse.json({
    project: {
      project_name: access.project.project_name,
      package_type: access.project.package_type,
      status: access.project.status,
      start_date: access.project.start_date,
      target_launch_date: access.project.target_launch_date,
      live_url: access.project.live_url,
      preview_url: access.project.preview_url,
      payment_link: access.project.payment_link,
      billing_state: billingState,
      receipt_summary: {
        totals: receiptTotals,
        fully_paid: invoiceMinor !== null && invoiceMinor > 0 && usdReceived >= invoiceMinor,
        partially_paid: usdReceived > 0 && (invoiceMinor === null || usdReceived < invoiceMinor),
      },
      accepted_payment_methods: access.project.accepted_payment_methods,
      manual_payment_instructions: access.project.manual_payment_instructions,
      invoice_amount: access.project.invoice_amount,
      invoice_label: access.project.invoice_label,
      next_step: access.project.next_step,
      client: access.project.clients
        ? {
            business_name: access.project.clients.business_name,
            contact_name: access.project.clients.contact_name,
          }
        : null,
    },
    supportThread: threadResult.data ? { status: threadResult.data.status } : null,
    supportMessages: (messagesResult.data || []).map((message) => ({
      id: message.id,
      created_at: message.created_at,
      sender_type: message.sender_type,
      sender_name: message.sender_type === "team" ? "Mountline" : message.sender_name,
      is_own:
        message.sender_type === "client" &&
        (message.sender_clerk_user_id === access.userId ||
          Boolean(message.sender_email && access.verifiedEmails.includes(message.sender_email.toLowerCase()))),
      message: message.message,
    })),
    viewer: {
      email: access.email,
      isTeamMember: access.isTeamMember,
    },
  })
}
