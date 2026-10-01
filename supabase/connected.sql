-- LVG OS: tasks linked to goals, notes inbox, coach chat, mood, smoke-free money, place photos.
-- Run once in the Supabase SQL Editor, after the other files.

-- Tasks (and recurring rules) can count towards a goal.
alter table public.tasks
  add column goal_id uuid references public.goals (id) on delete set null;
alter table public.recurring_tasks
  add column goal_id uuid references public.goals (id) on delete set null;
create index tasks_goal_idx on public.tasks (goal_id) where goal_id is not null;

-- Ticking a linked task moves its goal forward (+1, or +10 for percent goals); unticking moves it back.
create function public.step_goal_from_task() returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  delta integer;
begin
  if new.goal_id is null or new.done = old.done then
    return new;
  end if;
  select case when g.kind = 'percent' then 10 else 1 end into delta
    from public.goals g where g.id = new.goal_id;
  if delta is null then
    return new;
  end if;
  update public.goals g
    set current = greatest(0, least(g.target, g.current + case when new.done then delta else -delta end))
    where g.id = new.goal_id;
  return new;
end
$$;

create trigger tasks_step_goal
  after update of done on public.tasks
  for each row execute function public.step_goal_from_task();

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

-- Photos of places; the files live in the private "place-photos" storage bucket under <user id>/.
create table public.place_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  path text not null unique,
  created_at timestamptz not null default now()
);
create index place_photos_place_idx on public.place_photos (place_id, created_at);

-- Row level security: only your own rows.
do $$
declare
  t text;
begin
  foreach t in array array['coach_messages', 'place_photos'] loop
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

-- Storage: a private bucket; you can only touch files in your own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('place-photos', 'place-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Own place photos: select" on storage.objects for select to authenticated
  using (bucket_id = 'place-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Own place photos: insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'place-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Own place photos: delete" on storage.objects for delete to authenticated
  using (bucket_id = 'place-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
