-- LVG OS: AI coach weekly reviews.
-- Run once in the Supabase SQL Editor.

create table public.weekly_reviews (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Monday of the reviewed week
  week_start date not null,
  content text not null check (char_length(content) <= 5000),
  created_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

alter table public.weekly_reviews enable row level security;

create policy "Own rows: select" on public.weekly_reviews for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Own rows: insert" on public.weekly_reviews for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Own rows: update" on public.weekly_reviews for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own rows: delete" on public.weekly_reviews for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.weekly_reviews to authenticated;
revoke all on public.weekly_reviews from anon;
