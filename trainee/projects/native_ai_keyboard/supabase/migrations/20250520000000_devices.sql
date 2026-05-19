create table if not exists public.devices (
  device_id text primary key,
  platform text not null default 'ios',
  device_token text not null unique,
  locale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists devices_device_token_idx on public.devices (device_token);

alter table public.devices enable row level security;
