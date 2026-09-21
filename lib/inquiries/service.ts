import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { Inquiry, InquiryEvent } from "@/lib/supabase/types"
import type { z } from "zod"
import type { createInquirySchema, inquiryEventSchema } from "./validation"

type CreateInquiryInput = z.infer<typeof createInquirySchema>
type CreateEventInput = z.infer<typeof inquiryEventSchema>

export async function listProjectInquiries(projectId: string) {
  const supabase = createAdminClient()
  const { data: inquiries, error } = await supabase.from("inquiries").select("*").eq("project_id", projectId).order("received_at", { ascending: false })
  if (error) throw error
  const rows = (inquiries || []) as Inquiry[]
  if (rows.length === 0) return []

  const { data: events, error: eventsError } = await supabase.from("inquiry_events").select("*").in("inquiry_id", rows.map((row) => row.id)).order("occurred_at", { ascending: true })
  if (eventsError) throw eventsError
  const eventsByInquiry = new Map<string, InquiryEvent[]>()
  for (const event of (events || []) as InquiryEvent[]) {
    const current = eventsByInquiry.get(event.inquiry_id) || []
    current.push(event)
    eventsByInquiry.set(event.inquiry_id, current)
  }
  return rows.map((inquiry) => ({ ...inquiry, events: eventsByInquiry.get(inquiry.id) || [] }))
}

export async function createProjectInquiry(projectId: string, input: CreateInquiryInput, recordedBy: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("record_project_inquiry", {
    p_project_id: projectId,
    p_idempotency_key: input.idempotency_key,
    p_source: input.source,
    p_external_reference: input.external_reference,
    p_received_at: input.received_at,
    p_contact_name: input.contact_name,
    p_contact_phone: input.contact_phone,
    p_contact_email: input.contact_email,
    p_service_requested: input.service_requested,
    p_intake_details: input.intake_details,
    p_is_test: input.is_test,
    p_recorded_by: recordedBy,
  })
  if (error) throw error
  return (Array.isArray(data) ? data[0] : data) as Inquiry | null
}

export async function recordInquiryEvent(projectId: string, inquiryId: string, input: CreateEventInput, recordedBy: string) {
  const supabase = createAdminClient()
  const { data: inquiry, error: scopeError } = await supabase.from("inquiries").select("id").eq("id", inquiryId).eq("project_id", projectId).maybeSingle()
  if (scopeError) throw scopeError
  if (!inquiry) return { status: "not_found" as const, event: null }

  const { data, error } = await supabase.from("inquiry_events").insert({
    inquiry_id: inquiryId,
    event_type: input.event_type,
    occurred_at: input.occurred_at,
    actor_source: input.actor_source,
    recorded_by: recordedBy,
    source_event_key: input.source_event_key,
    attempt_id: input.attempt_id,
    evidence: input.evidence,
    supersedes_event_id: input.supersedes_event_id,
  }).select("*").single()

  if (error?.code === "23505") {
    const { data: existing, error: existingError } = await supabase.from("inquiry_events").select("*").eq("inquiry_id", inquiryId).eq("source_event_key", input.source_event_key).maybeSingle()
    if (existingError) throw existingError
    return { status: "duplicate" as const, event: existing as InquiryEvent | null }
  }
  if (error) throw error
  return { status: "created" as const, event: data as InquiryEvent }
}
