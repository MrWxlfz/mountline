"use server"

import { z } from "zod"
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
  source?: "website" | "luke_qr_page"
  website_confirmation?: string
}

export type SubmitLeadResult = {
  success: boolean
  error?: string
}

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  business_name: z.string().trim().max(140).optional().default(""),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  current_website: z.string().trim().max(500).optional().default(""),
  service_needed: z
    .enum([
      "website-launch",
      "lead-recovery",
      "booking-support",
      "custom-systems",
      "not-sure",
      "new-website",
      "redesign",
      "landing-page",
      "ai-systems",
      "ongoing-care",
      "other",
      "",
    ])
    .optional()
    .default(""),
  budget_range: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().max(3000).optional().default(""),
  source: z.enum(["website", "luke_qr_page"]).optional().default("website"),
  website_confirmation: z.string().max(200).optional().default(""),
})

export async function submitLead(data: LeadFormData): Promise<SubmitLeadResult> {
  try {
    const parsed = leadSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        error: "Please check the required details and try again.",
      }
    }

    if (parsed.data.website_confirmation) {
      return { success: true }
    }

    const supabase = await createClient()
    const source = parsed.data.source === "luke_qr_page" ? "luke_qr_page" : "website"

    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      business_name: parsed.data.business_name || null,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      current_website: parsed.data.current_website || null,
      service_needed: parsed.data.service_needed || null,
      budget_range: parsed.data.budget_range || null,
      message: parsed.data.message || null,
      source,
      status: "new",
    })

    if (error) {
      console.error("[mountline] Supabase error:", error)
      return {
        success: false,
        error: "The request could not be saved right now. Please try again.",
      }
    }

    return { success: true }
  } catch (err) {
    console.error("[mountline] Submit lead error:", err)
    return {
      success: false,
      error: "The request could not be sent right now. Please try again.",
    }
  }
}
