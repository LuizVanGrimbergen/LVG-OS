-- LVG OS database schema.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Every row belongs to the signed-in user (user_id defaults to auth.uid()),
-- and row level security makes sure you can only ever see your own rows.

-- Tasks, one list per day
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  title text not null check (char_length(title) between 1 and 200),
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index tasks_user_day_idx on public.tasks (user_id, day);

-- Goals with a count or percentage
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  category text not null check (category in ('sport', 'work')),
  kind text not null default 'count' check (kind in ('count', 'percent')),
  current integer not null default 0 check (current >= 0),
  target integer not null check (target > 0),
  created_at timestamptz not null default now()
);
create index goals_user_idx on public.goals (user_id);

-- Places you've been to (country_id is the ISO 3166 numeric code)
create table public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  country_id text not null check (country_id ~ '^[0-9]{3}$'),
  created_at timestamptz not null default now()
);
create index places_user_idx on public.places (user_id);

-- Countries ticked off by hand
create table public.visited_countries (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  country_id text not null check (country_id ~ '^[0-9]{3}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, country_id)
);

-- Morning intention and evening reflection, one row per day
create table public.daily_notes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  intention text check (char_length(intention) <= 500),
  reflection text check (char_length(reflection) <= 500),
  primary key (user_id, day)
);

-- Personal settings, one row per user
create table public.settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  smoke_free_since date
);

-- Row level security: only your own rows, for every action.
do $$
declare
  t text;
begin
  foreach t in array array['tasks', 'goals', 'places', 'visited_countries', 'daily_notes', 'settings'] loop
    execute format('alter table public.%I enable row level security', t);

    execute format(
      'create policy "Own rows: select" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Own rows: insert" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Own rows: update" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Own rows: delete" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);

    -- New tables aren't exposed to the Data API by default; allow signed-in users only.
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end
$$;
