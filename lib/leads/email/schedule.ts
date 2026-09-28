/**
 * Business-day timing for follow-ups, in the business's own time zone.
 *
 * A business day is Monday through Friday. Public holidays are not skipped. A follow-up that is
 * "N business days" after an event is due at SEND_HOUR local time on the Nth weekday after the
 * day the event happened, so nothing goes out overnight or on a weekend.
 */

export const SEND_HOUR = 9

type LocalParts = { year: number; month: number; day: number; hour: number; minute: number; second: number; weekday: number }

const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone })
    return true
  } catch {
    return false
  }
}

export function localParts(instant: Date, timeZone: string): LocalParts {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      weekday: "short",
    })
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  )
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: weekdays[parts.weekday],
  }
}

/** The instant at which the wall clock in `timeZone` reads the given local date and time. */
export function zonedTime(year: number, month: number, day: number, hour: number, timeZone: string) {
  const guess = Date.UTC(year, month - 1, day, hour)
  // Two passes settle the offset, including on daylight-saving change days.
  let instant = guess
  for (let pass = 0; pass < 2; pass++) {
    const seen = localParts(new Date(instant), timeZone)
    const seenAsUtc = Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, seen.minute, seen.second)
    instant += guess - seenAsUtc
  }
  return new Date(instant)
}

export function addBusinessDays(from: Date, businessDays: number, timeZone: string) {
  const start = localParts(from, timeZone)
  // Walk calendar days at local noon, which never falls in a daylight-saving gap.
  let cursor = new Date(Date.UTC(start.year, start.month - 1, start.day, 12))
  let remaining = Math.max(1, Math.floor(businessDays))
  while (remaining > 0) {
    cursor = new Date(cursor.getTime() + 86_400_000)
    const weekday = cursor.getUTCDay()
    if (weekday !== 0 && weekday !== 6) remaining--
  }
  return zonedTime(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, cursor.getUTCDate(), SEND_HOUR, timeZone)
}

export function formatLocal(instant: Date | string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(typeof instant === "string" ? new Date(instant) : instant)
}
