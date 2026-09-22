import { readFileSync } from "node:fs"
import { parseReceptionistProfile } from "../lib/receptionist/config.ts"
import { customerProfileTemplate, northTexasDemoProfile } from "../lib/receptionist/profiles.ts"
import { buildReceptionistPrompt } from "../lib/receptionist/prompt.ts"

const usage = "Usage: node --experimental-strip-types scripts/receptionist-config.ts <validate|prompt|profile|template> [profile.json]"
const [command, file, ...extra] = process.argv.slice(2)

if (!command || !["validate", "prompt", "profile", "template"].includes(command) || extra.length || (command === "template" && file)) {
  console.error(usage)
  process.exitCode = 1
} else if (command === "template") {
  console.log(JSON.stringify(customerProfileTemplate, null, 2))
} else {
  let source: string | undefined
  try {
    source = file ? readFileSync(file, "utf8") : JSON.stringify(northTexasDemoProfile)
  } catch (error) {
    console.error(`Could not read the profile: ${error instanceof Error ? error.message : "Unknown file error"}`)
    process.exitCode = 1
  }

  if (source !== undefined) {
    const result = parseReceptionistProfile(source)
    if (!result.success) {
      console.error(result.errors.join("\n"))
      process.exitCode = 1
    } else if (command === "validate") {
      console.log(`Valid ${result.profile.mode} profile: ${result.profile.business.name}. This checks structure only; no provider is connected and no deployment has occurred.`)
    } else if (command === "profile") {
      console.log(JSON.stringify(result.profile, null, 2))
    } else {
      process.stdout.write(buildReceptionistPrompt(result.profile))
    }
  }
}
