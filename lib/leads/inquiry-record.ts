import { createHash } from "node:crypto"
import { safeBusinessWebsite } from "./validation.ts"
import type { InquiryInterest, InquiryValues } from "./inquiry-schema.ts"

// Stored in the legacy service_needed column so older dashboard views still read sensibly.
const serviceNeeded: Record<InquiryInterest, string> = {
  website: "website",
  receptionist: "lead-recovery",
  capture: "capture",
  not_sure: "not-sure",
}

export type InquiryRecord = {
  submission_key: string
  content_fingerprint: string
  submitter_hash: string | null
  name: string
  business_name: string
  email: string
  phone: string | null
  current_website: string | null
  interests: InquiryInterest[]
  service_needed: string
  message: string
}

/** Same person, same words, same day: treated as one inquiry even across separate form loads. */
export function contentFingerprint(values: Pick<InquiryValues, "email" | "message">, now: Date) {
  const normalizedMessage = values.message.toLowerCase().replace(/\s+/g, " ").trim()
  return createHash("sha256")
    .update(`${values.email.toLowerCase()}\n${normalizedMessage}\n${now.toISOString().slice(0, 10)}`)
    .digest("hex")
}

export function hashSubmitter(ip: string | null, secret: string | null) {
  if (!ip || !secret) return null
  return createHash("sha256").update(`${secret}:${ip}`).digest("hex")
}

export function toInquiryRecord(values: InquiryValues, context: { now: Date; submitterHash: string | null }): InquiryRecord {
  return {
    submission_key: values.submission_key,
    content_fingerprint: contentFingerprint(values, context.now),
    submitter_hash: context.submitterHash,
    name: values.name,
    business_name: values.business_name,
    email: values.email.toLowerCase(),
    phone: values.phone || null,
    current_website: values.current_website ? safeBusinessWebsite(values.current_website) : null,
    interests: values.interests,
    service_needed: values.interests.length === 1 ? serviceNeeded[values.interests[0]] : "multiple",
    message: values.message,
  }
}
