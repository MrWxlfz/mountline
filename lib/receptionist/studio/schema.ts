import { z } from "zod"
import { voiceCapabilityIds } from "./capabilities.ts"
import { industryIds } from "./industries.ts"
import { personalityIds } from "./personalities.ts"

/*
 * A Studio receptionist's settings: everything the prompt and the Retell agent are built from. The
 * same schema checks the builder form in the browser and again on the server before anything reaches
 * Retell. It's stored with the agent in Retell (see service.ts), so `version` lets it change later.
 */

// Strips control characters (keeps newlines and tabs) so pasted website text can't smuggle odd bytes.
const clean = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()

const optionalText = (max: number, label: string) =>
  z.string().max(max * 2).transform(clean).pipe(z.string().max(max, `${label} is too long (${max} characters max)`)).default("")

export const studioModes = ["demo", "live"] as const
export type StudioMode = (typeof studioModes)[number]

export const studioConfigSchema = z
  .object({
    version: z.literal(1),
    businessName: z
      .string()
      .max(200)
      .transform(clean)
      .pipe(z.string().min(2, "Add the business name").max(80, "Keep the business name under 80 characters")),
    industry: z.enum(industryIds, { errorMap: () => ({ message: "Pick a business type" }) }),
    location: optionalText(80, "Location"),
    description: optionalText(600, "Description"),
    hours: optionalText(300, "Hours"),
    context: optionalText(5000, "Business context"),
    instructions: optionalText(2000, "Custom instructions"),
    capabilities: z
      .array(z.enum(voiceCapabilityIds))
      .min(1, "Pick at least one thing it should handle")
      .refine((list) => new Set(list).size === list.length, "Capabilities repeat"),
    personality: z.enum(personalityIds),
    receptionistName: z
      .string()
      .max(60)
      .transform(clean)
      .pipe(z.string().regex(/^[\p{L}][\p{L}' .-]{0,23}$/u, "Use a first name only (letters)").or(z.literal("")))
      .default(""),
    voiceId: z.string().regex(/^[A-Za-z0-9_.:-]{1,120}$/, "Pick a voice"),
    mode: z.enum(studioModes),
    firstMessage: optionalText(300, "First line"),
  })
  .strict()

export type StudioConfig = z.infer<typeof studioConfigSchema>
export type StudioConfigInput = z.input<typeof studioConfigSchema>

export type StudioValidation = { success: true; config: StudioConfig } | { success: false; errors: string[] }

export function validateStudioConfig(value: unknown): StudioValidation {
  const result = studioConfigSchema.safeParse(value)
  if (result.success) return { success: true, config: result.data }
  return { success: false, errors: [...new Set(result.error.issues.map((issue) => issue.message))] }
}
