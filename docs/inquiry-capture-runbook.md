# Inquiry capture pilot runbook

## Current verification state

The repository supports manual, project-scoped inquiry and event recording. No external phone or notification provider is connected or verified. The provider interface is a contract placeholder, not evidence of delivery.

## Pilot operating boundary

- Mountline records the inquiry before any handoff outcome is claimed.
- The business owner remains responsible for pricing, scheduling, customer contact, and accepting work.
- `handoff_attempted` means an outbound attempt was made. It does not mean the provider accepted it or the owner received it.
- `handoff_accepted_by_provider` means only that the external provider accepted the request.
- `handoff_successful` requires verified delivery evidence or explicit owner acknowledgement.
- Failed and pending attempts remain visible. A retry gets a new attempt ID and event; it does not overwrite history.
- Client-job payment events are separate from Mountline project receipts.

## Manual pilot procedure

1. Open the assigned project in the employee dashboard.
2. Record the inquiry with its source, timestamp, contact details, and external reference. Mark controlled calls as test records.
3. Record each handoff attempt with a unique attempt ID and destination.
4. Record provider acceptance only from an actual provider reference.
5. Record successful delivery only from a delivery receipt or explicit owner acknowledgement; otherwise leave the handoff pending or record failure.
6. Record customer contact, quote, accepted job, and client-job payment as separate events only when their required evidence exists.

## Provider integration gate

Before adding `/api/inquiries/provider`, inspect and document the real provider's callback URL, signature/authentication method, retry behavior, stable event ID, project-owned mapping key, and definitions of accepted versus delivered. Store project mapping server-side. Never accept a project ID supplied by an unauthenticated payload.

Then run 20 controlled calls covering ordinary intake, interruptions, missing details, unsupported requests, unavailable owner, duplicate/delayed callbacks, and delivery failure. Every call must be traceable to its persisted inquiry and handoff events with zero false completion claims. Until this succeeds, the external integration remains **not verified**.

## Failure and rollback

- If inquiry persistence fails, report capture failure and retain the source record for manual retry; do not acknowledge successful capture.
- If notification fails or is ambiguous, record `handoff_failed` or `handoff_pending`. Do not record successful delivery.
- Disable the provider callback route and return to manual recording if authentication, mapping, deduplication, or delivery evidence becomes unreliable.
- Rolling back the UI must not delete inquiry or event records. Preserve the additive ledger for reconciliation.
