import assert from "node:assert/strict"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { spawnSync } from "node:child_process"
import test from "node:test"
import { northTexasDemoProfile } from "../profiles.ts"
import { buildReceptionistPrompt } from "../prompt.ts"

function run(...args: string[]) {
  return spawnSync(process.execPath, ["--experimental-strip-types", resolve("scripts/receptionist-config.ts"), ...args], { encoding: "utf8" })
}

test("CLI exports the same validated prompt and profile used in the operator UI", () => {
  const prompt = run("prompt")
  assert.equal(prompt.status, 0)
  assert.equal(prompt.stdout, buildReceptionistPrompt(northTexasDemoProfile))
  const profile = run("profile")
  assert.equal(profile.status, 0)
  assert.deepEqual(JSON.parse(profile.stdout), northTexasDemoProfile)
})

test("CLI accepts a second profile and rejects malformed or unsupported configuration without partial output", (context) => {
  const directory = mkdtempSync(join(tmpdir(), "mountline-receptionist-test-"))
  context.after(() => rmSync(directory, { recursive: true, force: true }))
  const file = join(directory, "profile.json")
  writeFileSync(file, JSON.stringify({ ...northTexasDemoProfile, id: "second-example", business: { ...northTexasDemoProfile.business, name: "Second Example" } }))
  const valid = run("validate", file)
  assert.equal(valid.status, 0)
  assert.match(valid.stdout, /Second Example/)
  assert.match(valid.stdout, /no deployment has occurred/)

  writeFileSync(file, "{")
  const malformed = run("prompt", file)
  assert.equal(malformed.status, 1)
  assert.equal(malformed.stdout, "")
  assert.match(malformed.stderr, /valid JSON/)

  writeFileSync(file, JSON.stringify({ ...northTexasDemoProfile, capabilities: { booking: true, sms: false, liveTransfer: false } }))
  const unsupported = run("prompt", file)
  assert.equal(unsupported.status, 1)
  assert.equal(unsupported.stdout, "")
  assert.match(unsupported.stderr, /capabilities.booking/)
})

test("CLI rejects missing files and ambiguous commands", () => {
  assert.equal(run("unknown").status, 1)
  assert.equal(run("template", "unexpected-argument").status, 1)
  const missing = run("prompt", "/nonexistent/mountline-receptionist-profile.json")
  assert.equal(missing.status, 1)
  assert.equal(missing.stdout, "")
  assert.match(missing.stderr, /Could not read the profile/)
})
