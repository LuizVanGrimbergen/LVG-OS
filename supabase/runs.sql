-- LVG OS: runs (jogs) with distance and time; the app works out the pace.
-- Run once in the Supabase SQL Editor.

create table public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  distance_km numeric(5, 2) not null check (distance_km > 0 and distance_km < 1000),
  duration_s integer not null check (duration_s > 0 and duration_s < 86400),
  created_at timestamptz not null default now()
);
create index runs_user_day_idx on public.runs (user_id, day);

-- Row level security: only your own rows.
alter table public.runs enable row level security;
create policy "Own rows: select" on public.runs for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Own rows: insert" on public.runs for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Own rows: update" on public.runs for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own rows: delete" on public.runs for delete to authenticated
  using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.runs to authenticated;
revoke all on public.runs from anon;
