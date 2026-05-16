-- Northline demo seed data.
-- Run this after supabase/northline_schema.sql.
--
-- Change these before using real production data:
-- - team email: luke@mrwxlfz.xyz
-- - client email: demo.client@example.com
-- - portal_id: demo-portal
-- - payment/preview/live URLs

insert into public.team_members (email, status, role, notes)
values (
  'luke@mrwxlfz.xyz',
  'active',
  'owner',
  'Demo team member. Add clerk_user_id after signing into Clerk if desired.'
)
on conflict (email) do update
set status = excluded.status,
    role = excluded.role,
    notes = excluded.notes;

insert into public.clients (
  id,
  business_name,
  contact_name,
  email,
  phone,
  website,
  status,
  notes
)
values (
  '11111111-1111-4111-8111-111111111111',
  'Demo Roofing Co.',
  'Jordan Client',
  'demo.client@example.com',
  '(555) 123-4567',
  'https://example.com',
  'active',
  'Demo client for portal testing.'
)
on conflict (id) do update
set business_name = excluded.business_name,
    contact_name = excluded.contact_name,
    email = excluded.email,
    phone = excluded.phone,
    website = excluded.website,
    status = excluded.status,
    notes = excluded.notes;

insert into public.projects (
  id,
  client_id,
  project_name,
  package_type,
  status,
  portal_id,
  start_date,
  target_launch_date,
  live_url,
  preview_url,
  payment_link,
  next_step,
  notes
)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'Demo Roofing Website',
  'Business Website',
  'build',
  'demo-portal',
  current_date - interval '5 days',
  current_date + interval '14 days',
  'https://example.com',
  'https://preview.example.com',
  'https://pay.example.com/demo-invoice',
  'Northline is preparing the first review build. Please send final service area details and any preferred project photos.',
  'Demo project for client portal verification.'
)
on conflict (id) do update
set client_id = excluded.client_id,
    project_name = excluded.project_name,
    package_type = excluded.package_type,
    status = excluded.status,
    portal_id = excluded.portal_id,
    start_date = excluded.start_date,
    target_launch_date = excluded.target_launch_date,
    live_url = excluded.live_url,
    preview_url = excluded.preview_url,
    payment_link = excluded.payment_link,
    next_step = excluded.next_step,
    notes = excluded.notes;

insert into public.client_portal_access (
  project_id,
  client_email,
  access_status
)
values (
  '22222222-2222-4222-8222-222222222222',
  'demo.client@example.com',
  'active'
)
on conflict (project_id, client_email) do update
set access_status = excluded.access_status;

insert into public.support_threads (
  id,
  project_id,
  status
)
values (
  '33333333-3333-4333-8333-333333333333',
  '22222222-2222-4222-8222-222222222222',
  'open'
)
on conflict (id) do update
set project_id = excluded.project_id,
    status = excluded.status;

insert into public.support_messages (
  id,
  thread_id,
  project_id,
  sender_type,
  sender_email,
  message
)
values
  (
    '44444444-4444-4444-8444-444444444444',
    '33333333-3333-4333-8333-333333333333',
    '22222222-2222-4222-8222-222222222222',
    'team',
    'luke@mrwxlfz.xyz',
    'Welcome to your Northline portal. Project updates, payment links, and support notes will appear here.'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    '33333333-3333-4333-8333-333333333333',
    '22222222-2222-4222-8222-222222222222',
    'client',
    'demo.client@example.com',
    'Thanks. We will send over the remaining service area details today.'
  )
on conflict (id) do update
set thread_id = excluded.thread_id,
    project_id = excluded.project_id,
    sender_type = excluded.sender_type,
    sender_email = excluded.sender_email,
    message = excluded.message;

insert into public.leads (
  name,
  business_name,
  email,
  phone,
  service_needed,
  budget_range,
  message,
  source,
  status
)
values (
  'Demo Lead',
  'Demo Roofing Co.',
  'lead@example.com',
  '(555) 987-6543',
  'new-website',
  '2k-5k',
  'Demo lead generated for dashboard testing.',
  'seed_demo',
  'new'
);
