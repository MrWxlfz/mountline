import { isValidTimeZone } from "./schedule.ts"

/**
 * Server-side settings for inquiry email. Nothing here is exposed to the browser.
 * Missing settings never block saving an inquiry; they only hold its emails in the queue.
 */

export type FollowupMode = "off" | "approval" | "automatic"

export type InquiryEmailSettings = {
  apiKey: string | null
  from: string | null
  replyTo: string | null
  ownerTo: string | null
  siteUrl: string
  timeZone: string
  checkinBusinessDays: number
  ownerReminderBusinessDays: number
  /** What INQUIRY_CUSTOMER_FOLLOWUP asks for. */
  requestedCustomerFollowup: FollowupMode
  /** What actually happens: "automatic" needs working reply detection, otherwise a person approves. */
  customerFollowup: FollowupMode
  replyDetection: boolean
  webhookSecret: string | null
  hashSecret: string | null
  /** Variable names that must be set before any email can be sent. */
  missing: string[]
  /** Settings that are present but unusable, described without their values. */
  problems: string[]
}

type Env = Record<string, string | undefined>

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/
const NAMED_EMAIL = /^[^<>"\r\n]{1,64}<([^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)>$/

export function isPlainEmail(value: string) {
  return EMAIL.test(value)
}

function text(env: Env, name: string) {
  const value = env[name]?.trim()
  return value ? value : null
}

function wholeNumber(env: Env, name: string, fallback: number, problems: string[]) {
  const raw = text(env, name)
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 1 || value > 30) {
    problems.push(`${name} must be a whole number of business days from 1 to 30.`)
    return fallback
  }
  return value
}

export function readInquiryEmailSettings(env: Env = process.env): InquiryEmailSettings {
  const missing: string[] = []
  const problems: string[] = []

  const apiKey = text(env, "RESEND_API_KEY")
  const from = text(env, "INQUIRY_FROM_EMAIL")
  const replyTo = text(env, "INQUIRY_REPLY_TO_EMAIL")
  const ownerTo = text(env, "INQUIRY_OWNER_EMAIL")
  if (!apiKey) missing.push("RESEND_API_KEY")
  if (!from) missing.push("INQUIRY_FROM_EMAIL")
  if (!replyTo) missing.push("INQUIRY_REPLY_TO_EMAIL")
  if (!ownerTo) missing.push("INQUIRY_OWNER_EMAIL")

  if (from && !(NAMED_EMAIL.test(from) || EMAIL.test(from))) problems.push("INQUIRY_FROM_EMAIL must look like Mountline <hello@mountline.dev>.")
  if (replyTo && !EMAIL.test(replyTo)) problems.push("INQUIRY_REPLY_TO_EMAIL must be a single email address.")
  if (ownerTo && !EMAIL.test(ownerTo)) problems.push("INQUIRY_OWNER_EMAIL must be a single email address.")

  let siteUrl = text(env, "MOUNTLINE_SITE_URL") || "https://mountline.dev"
  try {
    const url = new URL(siteUrl)
    if (url.protocol !== "https:" && url.hostname !== "localhost") throw new Error("insecure")
    siteUrl = url.origin
  } catch {
    problems.push("MOUNTLINE_SITE_URL must be an https:// address.")
    siteUrl = "https://mountline.dev"
  }

  let timeZone = text(env, "INQUIRY_TIMEZONE") || "America/Chicago"
  if (!isValidTimeZone(timeZone)) {
    problems.push("INQUIRY_TIMEZONE must be an IANA time zone such as America/Chicago.")
    timeZone = "America/Chicago"
  }

  const requestedRaw = (text(env, "INQUIRY_CUSTOMER_FOLLOWUP") || "approval").toLowerCase()
  let requestedCustomerFollowup: FollowupMode = "approval"
  if (requestedRaw === "off" || requestedRaw === "approval" || requestedRaw === "automatic") requestedCustomerFollowup = requestedRaw
  else problems.push("INQUIRY_CUSTOMER_FOLLOWUP must be off, approval, or automatic.")

  const webhookSecret = text(env, "RESEND_WEBHOOK_SECRET")
  if (webhookSecret && !/^whsec_[A-Za-z0-9+/=]{16,}$/.test(webhookSecret)) problems.push("RESEND_WEBHOOK_SECRET must be the whsec_… signing secret from Resend.")

  const detectionRaw = (text(env, "INQUIRY_REPLY_DETECTION") || "off").toLowerCase()
  const replyDetection = detectionRaw === "resend_inbound" && Boolean(webhookSecret)
  if (detectionRaw === "resend_inbound" && !webhookSecret) problems.push("INQUIRY_REPLY_DETECTION=resend_inbound needs RESEND_WEBHOOK_SECRET.")
  else if (detectionRaw !== "off" && detectionRaw !== "resend_inbound") problems.push("INQUIRY_REPLY_DETECTION must be off or resend_inbound.")

  // Without a way to see replies, an unattended check-in could land after the customer already answered.
  const customerFollowup: FollowupMode = requestedCustomerFollowup === "automatic" && !replyDetection ? "approval" : requestedCustomerFollowup

  return {
    apiKey,
    from,
    replyTo,
    ownerTo,
    siteUrl,
    timeZone,
    checkinBusinessDays: wholeNumber(env, "INQUIRY_CHECKIN_BUSINESS_DAYS", 3, problems),
    ownerReminderBusinessDays: wholeNumber(env, "INQUIRY_OWNER_REMINDER_BUSINESS_DAYS", 1, problems),
    requestedCustomerFollowup,
    customerFollowup,
    replyDetection,
    webhookSecret,
    hashSecret: text(env, "INQUIRY_HASH_SECRET") || text(env, "CRON_SECRET"),
    missing,
    problems,
  }
}

export function canSendEmail(settings: InquiryEmailSettings) {
  return settings.missing.length === 0 && !settings.problems.some((problem) => /^(INQUIRY_FROM_EMAIL|INQUIRY_REPLY_TO_EMAIL|INQUIRY_OWNER_EMAIL)/.test(problem))
}

/** A plain address, for comparisons. Accepts "Name <a@b.c>" or "a@b.c". */
export function addressOf(value: string | null | undefined) {
  if (!value) return null
  const named = value.match(/<([^<>]+)>\s*$/)
  const address = (named ? named[1] : value).trim().toLowerCase()
  return EMAIL.test(address) ? address : null
}
