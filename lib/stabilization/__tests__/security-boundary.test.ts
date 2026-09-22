import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import {
  getVerifiedEmails,
  identityMatchesAssignment,
  isValidPortalId,
  type AuthenticatedIdentity,
} from "../../auth/identity-rules.ts"

const root = process.cwd()

test("only verified Clerk emails enter the authorization identity", () => {
  assert.deepEqual(
    getVerifiedEmails([
      { emailAddress: " Assigned@Example.com ", verification: { status: "verified" } },
      { emailAddress: "assigned@example.com", verification: { status: "verified" } },
      { emailAddress: "unverified@example.com", verification: { status: "unverified" } },
      { emailAddress: "failed@example.com", verification: { status: "failed" } },
    ]),
    ["assigned@example.com"],
  )
})

test("portal identifiers reject malformed input before lookup", () => {
  assert.equal(isValidPortalId("client-project-a1b2c3"), true)
  assert.equal(isValidPortalId("../other-project"), false)
  assert.equal(isValidPortalId(""), false)
  assert.equal(isValidPortalId("x".repeat(121)), false)
})

test("Clerk ID binding takes precedence and email fallback is unbound-only", () => {
  const identity: AuthenticatedIdentity = {
    userId: "user_assigned",
    verifiedEmails: ["assigned@example.com"],
    primaryEmail: "assigned@example.com",
  }

  assert.equal(
    identityMatchesAssignment(
      { clerk_user_id: "user_assigned", client_email: "other@example.com" },
      identity,
    ),
    true,
  )
  assert.equal(
    identityMatchesAssignment(
      { clerk_user_id: "user_other", client_email: "assigned@example.com" },
      identity,
    ),
    false,
  )
  assert.equal(
    identityMatchesAssignment(
      { clerk_user_id: null, client_email: "ASSIGNED@example.com" },
      identity,
    ),
    true,
  )
  assert.equal(
    identityMatchesAssignment(
      { clerk_user_id: null, client_email: "unrelated@example.com" },
      identity,
    ),
    false,
  )
})

test("portal client sources never expose internal project notes", () => {
  const files = [
    "lib/portal/access.ts",
    "app/api/portal/[portalId]/route.ts",
    "app/portal/[portalId]/page.tsx",
  ]
  for (const file of files) {
    const source = readFileSync(join(root, file), "utf8")
    assert.doesNotMatch(source, /project\.notes|\bnotes,/, file)
  }

  const route = readFileSync(join(root, "app/api/portal/[portalId]/route.ts"), "utf8")
  assert.doesNotMatch(route, /\.\.\.access\.project/)
  assert.doesNotMatch(route, /\b(thread_id|project_id|read_at|sender_email):/)

  const access = readFileSync(join(root, "lib/portal/access.ts"), "utf8")
  assert.match(access, /status: "unauthenticated"/)
  assert.match(access, /\.in\("access_status", \["active", "invited"\]\)/)
  assert.match(access, /\.is\("clerk_user_id", null\)/)
  assert.match(access, /status: "not_found"/)
  assert.match(access, /status: "error"/)
  assert.match(access, /project: null/)

  const team = readFileSync(join(root, "lib/auth/team.ts"), "utf8")
  assert.match(team, /\.eq\("status", "active"\)/)
})
