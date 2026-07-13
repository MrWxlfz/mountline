export function formatMountlineLabel(value: string | null | undefined, fallback = "Not set") {
  if (!value) return fallback
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatMountlineDate(
  value: string | null | undefined,
  fallback = "Not set",
) {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function formatMountlineDateTime(
  value: string | null | undefined,
  fallback = "Not recorded",
) {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatMountlineCurrency(
  value: number | null | undefined,
  currency = "USD",
) {
  if (value == null || !Number.isFinite(value)) return "Not set"
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

