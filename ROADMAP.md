# Northline Portal and Admin Roadmap

This roadmap captures future work for the Northline client portal and employee admin system. It is planning only; these features are not implemented yet.

## Architecture Rules

- Clerk remains the auth provider.
- Supabase remains the database and storage layer.
- Stripe is only for card payments.
- Manual payment methods are marked manually by the Northline team.
- No public signup.
- Employee dashboard remains team-only.
- Client portal remains invite/link-based.

## 1. Real Support Chat

The current portal has simple support messages. A future version should turn this into a real support workflow.

- Client messages should be labeled as client messages, not Northline messages.
- Team replies should appear in the client portal.
- Admin dashboard should include a support inbox.
- New client messages should trigger a visible dashboard notification.
- Future notification options should start with email first.
- SMS notifications can be added later through Twilio or a background worker.
- Support messages should track `sender_type`, `sender_email`, read status, and timestamps.

Likely data additions:

- `support_messages.read_at`
- `support_messages.read_by`
- `support_messages.sender_name`
- optional `support_threads.last_message_at`
- optional `support_threads.unread_count`

## 2. Payment System

Payments should support both Stripe/card payments and manual/offline methods.

Payment method options per project:

- Stripe/card
- crypto
- cash
- check
- bank transfer
- other

Initial Stripe/card support should use Stripe Payment Links or Stripe invoices, not a custom checkout flow. Manual methods should be handled outside Stripe.

Admin should be able to:

- set available payment methods per project
- add or update a payment link
- add manual payment instructions
- mark payment status manually

Portal should show:

- payment status
- available payment methods
- payment link when available
- manual payment instructions when relevant

Likely data additions:

- `projects.payment_status`
- `projects.payment_methods`
- `projects.payment_instructions`
- `projects.amount_due`
- `projects.amount_paid`
- optional `project_payments` table for payment history

## 3. Project Operations

The portal should become a clearer project operations hub without turning into a bloated project management app.

Project checklist items:

- logo received
- photos received
- services confirmed
- copy/content approved
- domain access ready
- homepage draft ready
- final review
- launch approved

Future project tools:

- client asset uploads using Supabase Storage
- approval and change request flow
- project activity log
- email notifications for important project events

Likely data additions:

- `project_checklist_items`
- `project_assets`
- `project_approvals`
- `project_change_requests`
- `project_activity_events`

## Recommended Implementation Order

1. Phase 1: support inbox + correct sender labels
2. Phase 2: email notifications
3. Phase 3: payment status/method fields
4. Phase 4: Stripe Payment Links/invoices
5. Phase 5: project checklist
6. Phase 6: asset uploads
7. Phase 7: SMS notifications
