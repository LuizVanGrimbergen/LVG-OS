-- LVG OS: Sydney goals and the bucket list with my godfather.
-- Run once in the Supabase SQL Editor, after the other files.

-- More goal categories.
alter table public.goals drop constraint goals_category_check;
alter table public.goals add constraint goals_category_check
  check (category in ('sport', 'work', 'career', 'comfort', 'health', 'growth'));

-- Bucket list: things to do in Sydney and the rest of Australia.
create table public.bucket_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  section text not null check (section in ('sydney', 'australia')),
  -- Free text, e.g. "March" or "New Year's Eve"
  planned text check (char_length(planned) <= 100),
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index bucket_list_user_idx on public.bucket_list (user_id);

-- Row level security: only your own rows.
alter table public.bucket_list enable row level security;
create policy "Own rows: select" on public.bucket_list for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Own rows: insert" on public.bucket_list for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Own rows: update" on public.bucket_list for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own rows: delete" on public.bucket_list for delete to authenticated
  using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.bucket_list to authenticated;
revoke all on public.bucket_list from anon;

-- Starting content, for the first (and only) user. The SQL Editor has no auth.uid().
insert into public.goals (user_id, title, category, kind, target, created_at)
select (select id from auth.users order by created_at limit 1), title, category, kind, target,
  now() + n * interval '1 millisecond'
from (select *, row_number() over () as n from (values
  ('Land a permanent developer job in Sydney within 1 month', 'career', 'count', 1),
  ('Make 20 new LinkedIn connections in the Sydney tech scene', 'career', 'count', 20),
  ('Go to 2 meetups a month', 'career', 'percent', 100),
  ('Speak English fluently, without fear', 'career', 'percent', 100),
  ('Present or speak at a meetup', 'career', 'count', 1),
  ('Learn a new tech skill: Next.js deployment, testing or AWS basics', 'career', 'percent', 100),
  ('Launch a portfolio website with 2–3 strong projects', 'career', 'percent', 100),
  ('Send 5 targeted applications every week', 'career', 'percent', 100),
  ('Have coffee with a Sydney developer every week', 'career', 'percent', 100),
  ('Take a weekend trip alone', 'comfort', 'count', 1),
  ('Go to an event alone and talk to at least 3 new people', 'comfort', 'count', 1),
  ('Start a conversation with a stranger (on the ferry, in a café…)', 'comfort', 'count', 1),
  ('Do something I''m (still) bad at, like an open mic or a dance class', 'comfort', 'count', 1),
  ('Get in the best shape of my life', 'health', 'percent', 100),
  ('Keep a steady training routine (4x a week)', 'health', 'percent', 100),
  ('Stick to a healthy diet', 'health', 'percent', 100),
  ('Discover something new in Sydney every week', 'health', 'percent', 100),
  ('Meal prep on Sunday for the whole week', 'health', 'percent', 100),
  ('Run the City2Surf (14 km, Sydney → Bondi)', 'health', 'count', 1),
  ('Swim in the Bondi Icebergs pool', 'health', 'count', 1),
  ('Read 1 book a month', 'growth', 'count', 12),
  ('Write down 3 things I''m grateful for every evening', 'growth', 'percent', 100),
  ('Track my budget and save for the bucket list', 'growth', 'percent', 100),
  ('Listen to an English podcast every week', 'growth', 'percent', 100)
) as v (title, category, kind, target)) as g;

insert into public.bucket_list (user_id, title, section, created_at)
select (select id from auth.users order by created_at limit 1), title, section,
  now() + n * interval '1 millisecond'
from (select *, row_number() over () as n from (values
  ('Stunt flying!', 'sydney'),
  ('Beat my godfather at karting and get a top 50 lap record', 'sydney'),
  ('Bondi to Coogee coastal walk', 'sydney'),
  ('Sydney Harbour Bridge climb', 'sydney'),
  ('On a boat on New Year''s Eve (fireworks!)', 'sydney'),
  ('Manly ferry at sunset', 'sydney'),
  ('Blue Mountains hike', 'sydney'),
  ('Kayaking in Sydney Harbour', 'sydney'),
  ('A show at the Sydney Opera House', 'sydney'),
  ('Vivid Sydney light festival (May–June)', 'sydney'),
  ('A rugby or AFL match together', 'sydney'),
  ('Take a surf lesson', 'australia'),
  ('Dive or snorkel the Great Barrier Reef', 'australia'),
  ('See Uluru', 'australia'),
  ('Spot kangaroos and koalas in the wild', 'australia'),
  ('Visit Melbourne', 'australia'),
  ('Road trip along the Great Ocean Road', 'australia'),
  ('Whale watching (May–November)', 'australia'),
  ('Skydive over the beach at Wollongong', 'australia'),
  ('Sail the Whitsundays', 'australia'),
  ('A real Aussie BBQ on the beach', 'australia')
) as v (title, section)) as b;
