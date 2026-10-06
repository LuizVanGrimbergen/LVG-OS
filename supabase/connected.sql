-- LVG OS: notes inbox, coach chat, mood, smoke-free money.
-- Run once in the Supabase SQL Editor, after the other files.

-- Notes: archive instead of delete, so the inbox stays clean.
alter table public.notes add column archived_at timestamptz;

-- Evening mood, 1 (rough) … 5 (great).
alter table public.daily_notes add column mood smallint check (mood between 1 and 5);

-- What smoking used to cost, for "money saved".
alter table public.settings
  add column cigarettes_per_day smallint check (cigarettes_per_day between 1 and 100),
  add column pack_price numeric(6, 2) check (pack_price > 0),
  add column pack_size smallint not null default 20 check (pack_size between 1 and 100);

-- Follow-up chat with the coach about a weekly review.
create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Monday of the review's week
  week_start date not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index coach_messages_week_idx on public.coach_messages (user_id, week_start, created_at);

-- Row level security: only your own rows.
do $$
declare
  t text;
begin
  foreach t in array array['coach_messages'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Own rows: select" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Own rows: insert" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Own rows: update" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Own rows: delete" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end
$$;
