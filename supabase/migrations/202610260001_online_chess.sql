-- Online multiplayer rooms for Demo 3D Chess.
-- Apply this migration in the Supabase SQL Editor before configuring the app.
create table if not exists public.chess_rooms (
  id uuid primary key,
  fen text not null,
  moves jsonb not null default '[]'::jsonb,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  result text,
  white_token_hash text not null,
  black_token_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chess_rooms_status_created_idx
  on public.chess_rooms (status, created_at desc);

alter table public.chess_rooms enable row level security;

-- Intentionally create no anon/authenticated policies: clients must use the
-- server API. The server accesses this table with SUPABASE_SERVICE_ROLE_KEY.
-- Never expose that key in NEXT_PUBLIC_* variables.