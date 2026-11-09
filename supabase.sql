-- Run once in your own Supabase SQL Editor. Keys stay on the server.
create table if not exists public.riit_enquiries (
 id uuid primary key,
 created_at timestamptz not null default now(),
 payload jsonb not null,
 status text not null default 'New' check (status in ('New','Contacted','Demo scheduled','Enrolled','Closed')),
 notes text not null default ''
);
alter table public.riit_enquiries enable row level security;
revoke all on public.riit_enquiries from anon, authenticated;
grant all on public.riit_enquiries to service_role;
create index if not exists riit_enquiries_created_idx on public.riit_enquiries(created_at desc);
-- No browser/anonymous policies. The server uses the secret service-role key.
