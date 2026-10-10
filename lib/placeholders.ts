/**
 * Placeholders in content/*.ts are square-bracketed and start with capitals, like a price that
 * hasn't been decided yet. scripts/check-placeholders.mjs uses the same pattern to stop a
 * production build that still has any.
 */
const PLACEHOLDER = /\[[A-Z]{2,}[^\]\n]*\]/g

/** Placeholders the build lets through, because the page hides what they belong to until filled. */
export const OPTIONAL_PLACEHOLDERS: readonly string[] = ["[TEXT NUMBER]"]

export function isPlaceholder(value: string) {
  return new RegExp(PLACEHOLDER.source).test(value)
}

/** Every placeholder still in a content object. */
export function findPlaceholders(value: unknown, found = new Set<string>()): string[] {
  if (typeof value === "string") {
    for (const match of value.match(PLACEHOLDER) ?? []) found.add(match)
  } else if (Array.isArray(value)) {
    for (const item of value) findPlaceholders(item, found)
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) findPlaceholders(item, found)
  }
  return [...found]
}
