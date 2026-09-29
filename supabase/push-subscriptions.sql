-- LVG OS: phone notifications (reminders).
-- Run once in the Supabase SQL Editor, after schema.sql.

create table public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Own rows: select" on public.push_subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Own rows: insert" on public.push_subscriptions for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Own rows: update" on public.push_subscriptions for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own rows: delete" on public.push_subscriptions for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.push_subscriptions to authenticated;
revoke all on public.push_subscriptions from anon;
