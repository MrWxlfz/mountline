import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export const appearancePreferences = ["system", "light", "dark"] as const
export type AppearancePreference = (typeof appearancePreferences)[number]

export function isAppearancePreference(value: unknown): value is AppearancePreference {
  return typeof value === "string" && appearancePreferences.includes(value as AppearancePreference)
}

export async function getAppearancePreference(clerkUserId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("mountline_user_preferences")
    .select("appearance")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle()

  if (error) {
    // The local-storage fallback remains available before the additive migration is deployed.
    if (!/mountline_user_preferences|schema cache|does not exist/i.test(error.message)) {
      console.error("[appearance] Preference lookup failed:", error.message)
    }
    return null
  }

  return isAppearancePreference(data?.appearance) ? data.appearance : null
}

export async function saveAppearancePreference(
  clerkUserId: string,
  appearance: AppearancePreference,
) {
  const supabase = createAdminClient()
  return supabase
    .from("mountline_user_preferences")
    .upsert(
      {
        clerk_user_id: clerkUserId,
        appearance,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id" },
    )
    .select("appearance")
    .single()
}
