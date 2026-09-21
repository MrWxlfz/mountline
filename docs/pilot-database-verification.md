# Pilot database verification

Run the repository SQL and paid-pilot invariants against an isolated, in-memory PostgreSQL instance. This does not connect to Supabase, read environment credentials, or change production data. Dependencies are installed in a temporary directory, not in this repository.

```sh
MOUNTLINE_SQL_RUNTIME="$(mktemp -d /tmp/mountline-sql-runtime.XXXXXX)"
npm install --prefix "$MOUNTLINE_SQL_RUNTIME" --ignore-scripts --no-audit --no-fund @electric-sql/pglite@0.5.8
node scripts/verify-pilot-database.mjs "$MOUNTLINE_SQL_RUNTIME"
```

The script applies the base schema and every migration in timestamp order, each migration in a transaction. It runs the actual SQL without patching source strings, then checks:

- Project creation with an assigned client, portal access, and Signal linkage.
- Idempotent project retries and full rollback when a late Signal lookup fails.
- Scope-confirmation completeness and separation from operational project creation.
- Inquiry retries, their single capture event, and preservation of the test flag.
- Handoff evidence requirements and cross-inquiry supersession rejection.
- Receipt reference uniqueness and rejection of zero-value payment evidence.
- One open support thread per project.
- RLS on every public table, and actual denial of public table/RPC access for `anon` and `authenticated`.

The assigned-client creation check catches the PL/pgSQL `client_email` variable collision in the original stabilization function. `fix_pilot_client_assignment` replaces that function additively; historical migration files remain unchanged.

## Limits

PGlite 0.5.8 runs PostgreSQL 18.3 locally with a single connection. The harness creates minimal Supabase roles and a `storage.buckets` fixture solely to run the repository's storage declaration. It does not emulate hosted Supabase, PostgREST, Clerk, Storage delivery, existing production records, provider integrations, or simultaneous transactions. A passing run verifies SQL behavior, not deployment readiness or production migration state. Validate the migrations against a separate Supabase staging database before production rollout.
