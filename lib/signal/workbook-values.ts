const XML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"',
}

export function normalizeSignalWorkbookCell(value: unknown, max = 1200) {
  const cleaned = String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)

  return cleaned.replace(
    /&(amp|apos|gt|lt|quot|#\d+|#x[\da-f]+);/gi,
    (entity, token: string) => {
      const normalized = token.toLowerCase()
      if (XML_ENTITIES[normalized]) return XML_ENTITIES[normalized]

      const codePoint = normalized.startsWith("#x")
        ? Number.parseInt(normalized.slice(2), 16)
        : Number.parseInt(normalized.slice(1), 10)
      if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
        return entity
      }
      return String.fromCodePoint(codePoint)
    },
  )
}
