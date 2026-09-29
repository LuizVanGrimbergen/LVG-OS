-- LVG OS: recurring tasks and daily habits.
-- Run once in the Supabase SQL Editor.

-- Recurring tasks: a rule that creates a task on the days it applies to.
create table public.recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  kind text not null check (kind in ('weekly', 'monthly')),
  -- weekly: ISO weekdays, 1 = Monday … 7 = Sunday
  weekdays smallint[] not null default '{}',
  -- monthly: day of the month (shorter months use their last day)
  month_day smallint check (month_day between 1 and 31),
  start_date date not null,
  created_at timestamptz not null default now(),
  check (
    (kind = 'weekly' and cardinality(weekdays) > 0)
    or (kind = 'monthly' and month_day is not null)
  )
);
create index recurring_tasks_user_idx on public.recurring_tasks (user_id);

-- Tasks created from a rule remember it; skipping one hides it instead of deleting,
-- so it isn't created again.
alter table public.tasks
  add column recurring_id uuid references public.recurring_tasks (id) on delete set null,
  add column skipped boolean not null default false,
  add constraint tasks_recurring_day_key unique (recurring_id, day);

-- Daily habits and the days you did them.
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  icon text not null default 'check',
  created_at timestamptz not null default now()
);
create index habits_user_idx on public.habits (user_id);

create table public.habit_logs (
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  primary key (habit_id, day)
);
create index habit_logs_user_day_idx on public.habit_logs (user_id, day);

-- Row level security: only your own rows.
do $$
declare
  t text;
begin
  foreach t in array array['recurring_tasks', 'habits', 'habit_logs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Own rows: select" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Own rows: update" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Own rows: delete" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end
$$;

create policy "Own rows: insert" on public.recurring_tasks for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Own rows: insert" on public.habits for insert to authenticated
  with check ((select auth.uid()) = user_id);
-- A log must belong to you and to one of your own habits.
create policy "Own rows: insert" on public.habit_logs for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid()))
  );
