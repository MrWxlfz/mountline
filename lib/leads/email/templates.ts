import { describeInterests } from "../inquiry-schema.ts"
import { addressOf, type InquiryEmailSettings } from "./config.ts"
import type { EmailKind } from "./kinds.ts"
import { formatLocal } from "./schedule.ts"

/**
 * Every inquiry email, as fixed templates. Customer-facing messages never repeat what the visitor
 * typed beyond a cleaned first name, so the form cannot be used to send someone arbitrary text or
 * links. Owner-facing messages include the full submission, escaped.
 *
 * Output depends only on the saved inquiry and settings, never on the clock, so a retry sends the
 * same payload under the same idempotency key.
 */

export { customerFacingKinds, emailKindLabels, emailKinds, type EmailKind } from "./kinds.ts"

export type LeadForEmail = {
  id: string
  created_at: string
  name: string | null
  business_name: string | null
  email: string | null
  phone: string | null
  current_website: string | null
  interests: string[] | null
  message: string | null
  optout_token: string | null
}

export type OutgoingEmail = {
  to: string
  replyTo: string
  subject: string
  html: string
  text: string
  headers?: Record<string, string>
  tags: Array<{ name: string; value: string }>
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Single-line, bounded text for subjects and table cells. */
export function oneLine(value: string | null | undefined, max = 120) {
  const cleaned = (value || "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim()
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned
}

/** "Hi Dana," when the name is plainly a name; "Hi there," otherwise. */
export function greetingName(name: string | null | undefined) {
  const full = oneLine(name, 200)
  // A name field holding a link, an address, digits, or a sentence is not a name to greet.
  if (!full || full.length > 60 || /[\d@/:<>]|www\.|\.[a-z]{2,}\b/i.test(full) || full.split(" ").length > 4) return null
  const first = full.split(" ")[0]
  return /^[\p{L}][\p{L}'’-]{0,29}$/u.test(first) ? first : null
}

const muted = "#6a665e"
const ink = "#171613"

function layout(body: string, footer = "") {
  return [
    "<!doctype html>",
    '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"></head>',
    '<body style="margin:0;padding:0;background:#ffffff;">',
    `<div style="max-width:560px;margin:0 auto;padding:32px 24px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${ink};">`,
    `<p style="margin:0 0 28px;font-size:13px;font-weight:600;letter-spacing:-0.01em;color:${ink};">mountline</p>`,
    body,
    `<p style="margin:36px 0 0;padding-top:16px;border-top:1px solid #e6e2da;font-size:13px;color:${muted};">Mountline · Keller, Texas · <a href="https://mountline.dev" style="color:${muted};">mountline.dev</a></p>`,
    footer,
    "</div></body></html>",
  ].join("")
}

const p = (html: string) => `<p style="margin:0 0 16px;">${html}</p>`
const link = (href: string, label: string) => `<a href="${escapeHtml(href)}" style="color:${ink};">${escapeHtml(label)}</a>`

function field(label: string, value: string) {
  return `<tr><td style="padding:8px 16px 8px 0;vertical-align:top;white-space:nowrap;font-size:13px;color:${muted};">${escapeHtml(label)}</td><td style="padding:8px 0;vertical-align:top;">${value}</td></tr>`
}

function adminUrl(settings: InquiryEmailSettings, lead: LeadForEmail) {
  return `${settings.siteUrl}/dashboard/leads?inquiry=${encodeURIComponent(lead.id)}`
}

export function optOutPageUrl(settings: InquiryEmailSettings, token: string) {
  return `${settings.siteUrl}/inquiry/stop/${encodeURIComponent(token)}`
}

export function oneClickOptOutUrl(settings: InquiryEmailSettings, token: string) {
  return `${settings.siteUrl}/api/inquiries/opt-out?token=${encodeURIComponent(token)}`
}

function signoff() {
  return { html: p("Mountline"), text: "Mountline\nKeller, Texas · mountline.dev" }
}

export class EmailTemplateError extends Error {}

export function buildEmail(kind: EmailKind, lead: LeadForEmail, jobId: string, settings: InquiryEmailSettings): OutgoingEmail {
  const replyTo = addressOf(settings.replyTo)
  const owner = addressOf(settings.ownerTo)
  const customer = addressOf(lead.email)
  if (!replyTo || !owner) throw new EmailTemplateError("Sender settings are incomplete.")
  const tags = [
    { name: "category", value: kind },
    { name: "inquiry_job", value: jobId },
  ]

  const business = oneLine(lead.business_name, 80) || "Unnamed business"
  const person = oneLine(lead.name, 80) || "Someone"
  const interests = describeInterests(lead.interests || [])
  const received = formatLocal(lead.created_at, settings.timeZone)
  const dashboard = adminUrl(settings, lead)

  if (kind === "owner_notification") {
    if (!customer) throw new EmailTemplateError("The inquiry has no valid email address.")
    const message = (lead.message || "").slice(0, 4000)
    const rows = [
      field("Name", escapeHtml(person)),
      field("Business", escapeHtml(business)),
      field("Email", escapeHtml(customer)),
      field("Phone", escapeHtml(oneLine(lead.phone, 40) || "Not given")),
      field("Website", escapeHtml(oneLine(lead.current_website, 200) || "Not given")),
      field("Interested in", escapeHtml(interests)),
      field("Received", escapeHtml(received)),
    ].join("")
    return {
      to: owner,
      // Reply straight to the person who asked. The From address stays Mountline's own.
      replyTo: customer,
      subject: oneLine(`New inquiry: ${business} (${interests})`, 140),
      tags,
      html: layout(
        [
          p(`${escapeHtml(person)} at ${escapeHtml(business)} sent an inquiry from mountline.dev.`),
          `<table role="presentation" style="border-collapse:collapse;margin:0 0 20px;font-size:15px;">${rows}</table>`,
          `<p style="margin:0 0 6px;font-size:13px;color:${muted};">Message</p>`,
          `<div style="margin:0 0 24px;padding:14px 16px;border:1px solid #e6e2da;border-radius:6px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(message)}</div>`,
          p(`Reply to this email to answer ${escapeHtml(greetingName(lead.name) || "them")} directly, or ${link(dashboard, "open the inquiry in the dashboard")}.`),
          p(`<span style="font-size:13px;color:${muted};">They were sent a short confirmation from ${escapeHtml(replyTo)}. It doesn’t repeat their message.</span>`),
        ].join(""),
      ),
      text: [
        `${person} at ${business} sent an inquiry from mountline.dev.`,
        "",
        `Name: ${person}`,
        `Business: ${business}`,
        `Email: ${customer}`,
        `Phone: ${oneLine(lead.phone, 40) || "Not given"}`,
        `Website: ${oneLine(lead.current_website, 200) || "Not given"}`,
        `Interested in: ${interests}`,
        `Received: ${received}`,
        "",
        "Message:",
        message,
        "",
        `Reply to this email to answer them directly, or open the inquiry: ${dashboard}`,
      ].join("\n"),
    }
  }

  if (kind === "customer_acknowledgment") {
    if (!customer) throw new EmailTemplateError("The inquiry has no valid email address.")
    const name = greetingName(lead.name)
    const hello = name ? `Hi ${name},` : "Hi there,"
    const close = signoff()
    return {
      to: customer,
      replyTo,
      subject: "Your message reached Mountline",
      tags,
      html: layout(
        [
          p(escapeHtml(hello)),
          p("Thanks for getting in touch. Your message has reached Mountline. Luke will take a look and reply to you here."),
          p("If there’s anything you’d like to add, just reply to this email."),
          close.html,
        ].join(""),
      ),
      text: [
        hello,
        "",
        "Thanks for getting in touch. Your message has reached Mountline. Luke will take a look and reply to you here.",
        "",
        "If there’s anything you’d like to add, just reply to this email.",
        "",
        close.text,
      ].join("\n"),
    }
  }

  if (kind === "owner_reminder") {
    return {
      to: owner,
      replyTo,
      subject: oneLine(`Waiting for a reply: ${business}`, 140),
      tags,
      html: layout(
        [
          p(`${escapeHtml(person)} at ${escapeHtml(business)} asked about ${escapeHtml(interests.toLowerCase())} on ${escapeHtml(received)}. The inquiry hasn’t been marked Contacted yet.`),
          p(link(dashboard, "Open the inquiry")),
          p(`<span style="font-size:13px;color:${muted};">If you’ve already replied from your inbox, set it to Contacted. This is the only reminder for this inquiry.</span>`),
        ].join(""),
      ),
      text: [
        `${person} at ${business} asked about ${interests.toLowerCase()} on ${received}. The inquiry hasn’t been marked Contacted yet.`,
        "",
        `Open the inquiry: ${dashboard}`,
        "",
        "If you’ve already replied from your inbox, set it to Contacted. This is the only reminder for this inquiry.",
      ].join("\n"),
    }
  }

  if (kind === "owner_checkin_prompt") {
    const days = settings.checkinBusinessDays
    const visibility = settings.replyDetection
      ? "Replies forwarded to Mountline are checked before anything is sent."
      : `Replies to ${replyTo} aren’t visible to the dashboard yet. If they already answered you, mark the inquiry “Customer replied” or close it.`
    return {
      to: owner,
      replyTo,
      subject: oneLine(`Check in with ${business}?`, 140),
      tags,
      html: layout(
        [
          p(`It’s been ${days} business day${days === 1 ? "" : "s"} since ${escapeHtml(business)} was marked Contacted, and no reply has been recorded.`),
          p(`A short check-in is ready to send to ${escapeHtml(greetingName(lead.name) || "them")} from ${escapeHtml(replyTo)}. It won’t go out unless you approve it.`),
          p(link(dashboard, "Review the check-in")),
          p(`<span style="font-size:13px;color:${muted};">${escapeHtml(visibility)}</span>`),
        ].join(""),
      ),
      text: [
        `It’s been ${days} business day${days === 1 ? "" : "s"} since ${business} was marked Contacted, and no reply has been recorded.`,
        "",
        `A short check-in is ready to send from ${replyTo}. It won’t go out unless you approve it.`,
        "",
        `Review the check-in: ${dashboard}`,
        "",
        visibility,
      ].join("\n"),
    }
  }

  // customer_checkin
  if (!customer) throw new EmailTemplateError("The inquiry has no valid email address.")
  if (!lead.optout_token) throw new EmailTemplateError("The inquiry has no opt-out token.")
  const name = greetingName(lead.name)
  const hello = name ? `Hi ${name},` : "Hi there,"
  const stopPage = optOutPageUrl(settings, lead.optout_token)
  const close = signoff()
  return {
    to: customer,
    replyTo,
    subject: "Checking in from Mountline",
    tags,
    headers: {
      "List-Unsubscribe": `<${oneClickOptOutUrl(settings, lead.optout_token)}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: layout(
      [
        p(escapeHtml(hello)),
        p("Luke wanted to check in on his last note. If you have questions, or you’d like to keep talking about the project, just reply to this email."),
        p("If now isn’t the right time, there’s no need to reply. This is the only follow-up we’ll send."),
        close.html,
      ].join(""),
      `<p style="margin:12px 0 0;font-size:12px;color:${muted};">${link(stopPage, "Don’t send me follow-ups")}</p>`,
    ),
    text: [
      hello,
      "",
      "Luke wanted to check in on his last note. If you have questions, or you’d like to keep talking about the project, just reply to this email.",
      "",
      "If now isn’t the right time, there’s no need to reply. This is the only follow-up we’ll send.",
      "",
      close.text,
      "",
      `Don’t send me follow-ups: ${stopPage}`,
    ].join("\n"),
  }
}
