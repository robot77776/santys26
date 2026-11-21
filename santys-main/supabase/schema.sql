-- Тайный Санта 2026
-- Выполнить целиком в Supabase → SQL Editor → New query.
create extension if not exists pgcrypto;

create table if not exists public.game_settings (
  id integer primary key check (id = 1),
  registration_open boolean not null default true,
  drawn boolean not null default false,
  drawn_at timestamptz
);
insert into public.game_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  wishes text not null default '',
  avoid text not null default '',
  notes text not null default '',
  registration_key text not null unique,
  access_token_hash text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  giver_id uuid primary key references public.participants(id) on delete cascade,
  recipient_id uuid not null unique references public.participants(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (giver_id <> recipient_id)
);

alter table public.game_settings enable row level security;
alter table public.participants enable row level security;
alter table public.assignments enable row level security;

-- Не создаём публичных RLS-политик. Чтение/запись выполняется только сервером
-- Vercel через SUPABASE_SERVICE_ROLE_KEY. Никогда не добавляйте service role key
-- в NEXT_PUBLIC_* переменные и не помещайте его в браузерный код.
