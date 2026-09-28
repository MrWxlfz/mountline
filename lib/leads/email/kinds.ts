/** Names shared by the worker, templates, and dashboard. Safe to import from client components. */

export const emailKinds = ["owner_notification", "customer_acknowledgment", "owner_reminder", "owner_checkin_prompt", "customer_checkin"] as const
export type EmailKind = typeof emailKinds[number]

export const emailKindLabels: Record<EmailKind, string> = {
  owner_notification: "New-inquiry email to you",
  customer_acknowledgment: "Confirmation to the customer",
  owner_reminder: "Reminder to you",
  owner_checkin_prompt: "Check-in prompt to you",
  customer_checkin: "Check-in to the customer",
}

export const customerFacingKinds: readonly EmailKind[] = ["customer_acknowledgment", "customer_checkin"]

export const skipReasonLabels: Record<string, string> = {
  suppressed: "Address bounced or complained",
  opted_out: "Customer opted out",
  customer_replied: "Customer replied",
  inquiry_handled: "Inquiry already handled",
  not_awaiting_customer: "Not waiting on the customer",
  followups_off: "Customer follow-ups are off",
  checkin_not_pending: "No check-in waiting",
  recent_acknowledgment: "Confirmation already sent to this address today",
  skipped_by_team: "Skipped by the team",
  inquiry_deleted: "Inquiry was deleted",
}
