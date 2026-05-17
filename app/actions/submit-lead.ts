"use server"

import { createClient } from "@/lib/supabase/server"

export type LeadFormData = {
  name: string
  business_name?: string
  email: string
  phone?: string
  current_website?: string
  service_needed?: string
  budget_range?: string
  message?: string
}

export type SubmitLeadResult = {
  success: boolean
  error?: string
}

export async function submitLead(data: LeadFormData): Promise<SubmitLeadResult> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.from("leads").insert({
      name: data.name,
      business_name: data.business_name || null,
      email: data.email,
      phone: data.phone || null,
      current_website: data.current_website || null,
      service_needed: data.service_needed || null,
      budget_range: data.budget_range || null,
      message: data.message || null,
      source: "website",
      status: "new",
    })

    if (error) {
      console.error("[mountline] Supabase error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[mountline] Submit lead error:", err)
    return { success: false, error: "Failed to submit. Please try again." }
  }
}
