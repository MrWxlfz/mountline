import { fieldErrorsFrom, inquirySchema, looksAutomated, type InquiryFieldErrors } from "./inquiry-schema.ts"
import { hashSubmitter, toInquiryRecord, type InquiryRecord } from "./inquiry-record.ts"

export type SaveOutcome = { inquiryId: string | null; outcome: "created" | "duplicate" | "rate_limited" }

export type SubmitInquiryResult =
  | { success: true; duplicate: boolean }
  | { success: false; error: string; fieldErrors?: InquiryFieldErrors }

export type SubmitInquiryDeps = {
  now: () => Date
  submitterIp: string | null
  hashSecret: string | null
  ownerReminderAt: (createdAt: Date) => Date | null
  /** Must resolve only after the database has committed the inquiry and its queued emails. */
  save: (record: InquiryRecord, ownerReminderAt: Date | null) => Promise<SaveOutcome>
  /** Starts sending the queued emails. Never awaited for the visitor's answer. */
  dispatch?: (inquiryId: string) => void
}

export const SAVE_FAILED =
  "Your message couldn’t be saved just now. Everything you typed is still here, so you can try again, or email hello@mountline.dev."

export async function submitProjectInquiry(input: unknown, deps: SubmitInquiryDeps): Promise<SubmitInquiryResult> {
  const parsed = inquirySchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Please check the highlighted details.", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  const now = deps.now()
  // Automated submissions are refused without creating a record or claiming it was received.
  if (looksAutomated(parsed.data, now.getTime())) {
    return { success: false, error: "That didn’t go through. Please try again, or email hello@mountline.dev." }
  }

  const record = toInquiryRecord(parsed.data, { now, submitterHash: hashSubmitter(deps.submitterIp, deps.hashSecret) })

  let saved: SaveOutcome
  try {
    saved = await deps.save(record, deps.ownerReminderAt(now))
  } catch {
    return { success: false, error: SAVE_FAILED }
  }

  if (saved.outcome === "rate_limited") {
    return { success: false, error: "A few messages have already come from here recently. Please wait a little while, or email hello@mountline.dev." }
  }
  if (!saved.inquiryId) return { success: false, error: SAVE_FAILED }

  // A repeat of an inquiry that is already saved: its emails were queued the first time.
  if (saved.outcome === "duplicate") return { success: true, duplicate: true }

  try {
    deps.dispatch?.(saved.inquiryId)
  } catch {
    // The inquiry and its emails are saved; the scheduled worker will send them.
  }
  return { success: true, duplicate: false }
}
