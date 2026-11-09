-- Server-only learning records. No browser key can access this table.
create table if not exists public.riit_records (
 id text primary key,
 kind text not null check (kind in ('user','question','attempt','booking','settings')),
 owner text not null,
 created_at timestamptz not null default now(),
 payload jsonb not null
);
create index if not exists riit_records_kind_owner_created on public.riit_records(kind,owner,created_at desc);
alter table public.riit_records enable row level security;
revoke all on public.riit_records from public,anon,authenticated,service_role;
grant select,insert,update,delete on public.riit_records to service_role;
