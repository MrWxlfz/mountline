"use server"

import { savePilotRequest } from "@/lib/leads/pilot-request"
import type { PilotRequestInput } from "@/lib/leads/validation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function requestReceptionistPilot(input: PilotRequestInput) {
  return savePilotRequest(input, async (lead) => {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from("leads").insert(lead).select("id").single()
    if (error || !data?.id) {
      console.error("[mountline] Receptionist request persistence failed", { code: error?.code || "missing_record" })
      throw new Error("Receptionist request was not confirmed saved.")
    }
  })
}
