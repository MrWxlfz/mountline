import { pilotRequestSchema, type PilotFieldErrors } from "./validation.ts"

export type PilotLeadRecord = {
  name: string
  business_name: string
  email: string
  phone: string | null
  service_needed: "lead-recovery"
  source: "website"
  status: "new"
  message: string
}

export type PilotRequestResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: PilotFieldErrors }

// The supplied writer must confirm persistence; production supplies it from a server action.
export async function savePilotRequest(
  input: unknown,
  persist: (lead: PilotLeadRecord) => Promise<void>,
): Promise<PilotRequestResult> {
  const parsed = pilotRequestSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: PilotFieldErrors = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof PilotFieldErrors
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return { success: false, error: "Please check the highlighted details.", fieldErrors }
  }

  // A filled honeypot is rejected without creating a record or claiming capture.
  if (parsed.data.website_confirmation) {
    return { success: false, error: "The request could not be saved. Please email hello@mountline.dev." }
  }

  const { name, business_name, email, phone, industry, call_handling } = parsed.data
  try {
    await persist({
      name,
      business_name,
      email,
      phone: phone || null,
      service_needed: "lead-recovery",
      source: "website",
      status: "new",
      message: `Receptionist pilot request\nBusiness type: ${industry}\n\nCurrent call handling / what needs to improve:\n${call_handling}`,
    })
    return { success: true }
  } catch {
    return { success: false, error: "Your request could not be saved. Your details are still here; try again or email hello@mountline.dev." }
  }
}
