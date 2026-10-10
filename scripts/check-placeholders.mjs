// Stops a production deploy that still has unfilled copy. Runs before `next build`.
//
// Reads the content files as text, so nothing in them is executed (content/receptionist.ts is
// server-only). Placeholders are square-bracketed capitals, like the pricing in content/site.ts.
// Only Vercel production builds fail; previews and local builds just print what's left.

import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = join(import.meta.dirname, "..")
const files = ["content/site.ts", "content/receptionist.ts"]
const optional = new Set(["[TEXT NUMBER]"])
const placeholder = /\[[A-Z]{2,}[^\]\n]*\]/g // Same pattern as lib/placeholders.ts

const problems = []
for (const file of files) {
  let text
  try {
    text = readFileSync(join(root, file), "utf8")
  } catch {
    continue
  }
  for (const match of new Set(text.match(placeholder) ?? [])) {
    if (!optional.has(match)) problems.push(`${file}: ${match}`)
  }
}
if (!process.env.NEXT_PUBLIC_BOOKING_URL) problems.push("NEXT_PUBLIC_BOOKING_URL is not set")

const production = process.env.VERCEL_ENV === "production"
if (problems.length) {
  const list = problems.map((line) => `  - ${line}`).join("\n")
  if (production) {
    console.error(`\nUnfilled site copy. Fill these in before deploying to production:\n${list}\n`)
    process.exit(1)
  }
  console.warn(`\nUnfilled site copy (allowed outside Vercel production):\n${list}\n`)
}
