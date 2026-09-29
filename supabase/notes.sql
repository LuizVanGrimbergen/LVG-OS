-- LVG OS: quick capture notes.
-- Run once in the Supabase SQL Editor.

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index notes_user_created_idx on public.notes (user_id, created_at desc);

alter table public.notes enable row level security;

create policy "Own rows: select" on public.notes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Own rows: insert" on public.notes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Own rows: update" on public.notes for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own rows: delete" on public.notes for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.notes to authenticated;
revoke all on public.notes from anon;
