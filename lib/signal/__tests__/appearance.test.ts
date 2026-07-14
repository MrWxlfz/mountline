import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const globals = readFileSync(join(root, "app/globals.css"), "utf8")
const rootLayout = readFileSync(join(root, "app/layout.tsx"), "utf8")
const dashboardLayout = readFileSync(join(root, "app/dashboard/layout.tsx"), "utf8")
const appearanceSelector = readFileSync(join(root, "components/dashboard/appearance-selector.tsx"), "utf8")
const homepage = readFileSync(join(root, "components/mountline-homepage.tsx"), "utf8")
const mountlineId = readFileSync(join(root, "app/id/mountline-id-form.tsx"), "utf8")

test("appearance defaults to system and uses a stable persistence key", () => {
  assert.match(rootLayout, /defaultTheme="system"/)
  assert.match(rootLayout, /enableSystem/)
  assert.match(rootLayout, /storageKey="mountline-appearance"/)
  assert.match(rootLayout, /disableTransitionOnChange/)
})

test("light and dark themes define the semantic surface and feedback tokens", () => {
  for (const token of [
    "--background",
    "--foreground",
    "--surface",
    "--surface-elevated",
    "--input-background",
    "--hover",
    "--focus-ring",
    "--success",
    "--warning",
    "--error",
    "--information",
    "--overlay",
  ]) {
    assert.ok(globals.split(token).length >= 3, `${token} must exist in light and dark scopes`)
  }
  assert.match(globals, /\.dark\s*\{/)
  assert.match(globals, /prefers-reduced-motion:\s*reduce/)
})

test("the selector exposes three labeled, keyboard-native choices", () => {
  assert.match(appearanceSelector, /label: "System"/)
  assert.match(appearanceSelector, /label: "Light"/)
  assert.match(appearanceSelector, /label: "Dark"/)
  assert.match(appearanceSelector, /role="radiogroup"/)
  assert.match(appearanceSelector, /role="radio"/)
})

test("authenticated preference boot runs before the dashboard shell", () => {
  const boot = dashboardLayout.indexOf("<AppearancePreferenceBoot")
  const shell = dashboardLayout.indexOf("<DashboardShell")
  assert.ok(boot >= 0 && shell > boot)
  assert.match(dashboardLayout, /localStorage\.setItem\('mountline-appearance'/)
  assert.match(dashboardLayout, /prefers-color-scheme: dark/)
})

test("public marketing and Mountline ID expose local-only appearance controls", () => {
  assert.match(homepage, /mountline-marketing/)
  assert.match(homepage, /<AppearanceSelector compact syncServer=\{false\}/)
  assert.match(mountlineId, /mountline-id relative/)
  assert.match(mountlineId, /<AppearanceSelector compact syncServer=\{false\}/)
  assert.match(mountlineId, /withSignUp=\{false\}/)
})
