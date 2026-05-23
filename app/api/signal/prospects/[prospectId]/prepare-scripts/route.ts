import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import { buildSignalScriptStudio } from "@/lib/signal/scripts"
import { signalScriptStudioSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalAnalysis, SignalProspect } from "@/lib/supabase/types"
import type { SignalWebsiteScan } from "@/lib/signal/website"

function getScan(analysis: SignalAnalysis | null) {
  const signals = analysis?.website_signals
  if (!signals || typeof signals !== "object") return null
  if ("scan" in signals && signals.scan && typeof signals.scan === "object") {
    return signals.scan as SignalWebsiteScan
  }
  return signals as SignalWebsiteScan
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => ({}))
  const parsed = signalScriptStudioSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid script settings." }, { status: 400 })
  }

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospectData, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (prospectError) return NextResponse.json({ error: prospectError.message }, { status: 500 })
  if (!prospectData) return NextResponse.json({ error: "Prospect not found" }, { status: 404 })

  const prospect = prospectData as SignalProspect
  if (prospect.outreach_status === "do_not_contact" || (await isSignalProspectSuppressed(prospect))) {
    return NextResponse.json(
      { error: "Scripts are disabled while this prospect is marked do-not-contact." },
      { status: 409 },
    )
  }

  const { data: latestAnalysis } = await supabase
    .from("signal_analyses")
    .select("*")
    .eq("prospect_id", prospect.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const analysis = (latestAnalysis as SignalAnalysis | null) || null
  const scriptStudio = buildSignalScriptStudio({
    analysis,
    communicationProfile: parsed.data.communication_profile || null,
    conversationStyle: parsed.data.conversation_style || analysis?.suggested_conversation_style,
    guidance: parsed.data.guidance || null,
    prospect,
    scan: getScan(analysis),
  })

  const { data: draft, error: draftError } = await supabase
    .from("signal_outreach_drafts")
    .insert({
      prospect_id: prospect.id,
      analysis_id: analysis?.id || null,
      outreach_mode: analysis?.suggested_outreach_mode || prospect.outreach_mode,
      conversation_style: scriptStudio.conversation_style,
      conversation_style_reason: scriptStudio.conversation_style_reason,
      communication_profile: scriptStudio.communication_profile,
      communication_profile_reason: scriptStudio.communication_profile_reason,
      first_contact_subject: `${prospect.business_name} website idea`,
      first_contact_email: scriptStudio.first_email_draft,
      permission_based_dm: scriptStudio.permission_based_dm,
      owner_call_opener: scriptStudio.first_call_opener,
      gatekeeper_script: scriptStudio.receptionist_script,
      voicemail_script: scriptStudio.voicemail_script,
      demo_send_followup: scriptStudio.sure_send_it_response,
      discovery_call_questions: scriptStudio.discovery_call_questions,
      proposal_angle: scriptStudio.proposal_angle,
      script_studio: scriptStudio,
      follow_up_email: scriptStudio.follow_up_draft,
      objection_responses: scriptStudio.objection_responses,
    })
    .select()
    .single()

  if (draftError) return NextResponse.json({ error: draftError.message }, { status: 500 })

  if (analysis?.id) {
    await supabase
      .from("signal_analyses")
      .update({
      external_readiness: scriptStudio.external_readiness,
      recommended_next_action: scriptStudio.recommended_next_action,
      communication_profile: scriptStudio.communication_profile,
      communication_profile_reason: scriptStudio.communication_profile_reason,
    })
      .eq("id", analysis.id)
  }

  await supabase
    .from("signal_prospects")
    .update({
      conversation_style: scriptStudio.conversation_style,
      conversation_style_reason: scriptStudio.conversation_style_reason,
      suggested_communication_profile: scriptStudio.communication_profile,
      communication_profile_reason: scriptStudio.communication_profile_reason,
      script_guidance: parsed.data.guidance || prospect.script_guidance,
    })
    .eq("id", prospect.id)

  return NextResponse.json({
    draft,
    script_studio: scriptStudio,
    needs_manual_review: !scriptStudio.external_readiness.passed,
  })
}
