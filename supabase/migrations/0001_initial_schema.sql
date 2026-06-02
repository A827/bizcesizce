-- =====================================================================
-- Bizce sizce — initial database schema
-- =====================================================================
-- This file defines every table, rule and safeguard for the app.
-- The most important rules (one vote per person per topic, fixed
-- region/age lists, "only aggregates are visible") are enforced HERE,
-- at the database level — so they hold no matter what the app does.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Reusable value lists (enforced as types, so bad values are impossible)
-- ---------------------------------------------------------------------

-- The only regions that can ever be stored. No free text anywhere.
do $$ begin
  create type region_kind as enum (
    'Lefkoşa', 'Girne', 'Mağusa', 'Güzelyurt', 'İskele', 'Lefke'
  );
exception when duplicate_object then null; end $$;

-- The only age bands that can ever be stored.
do $$ begin
  create type age_band_kind as enum (
    '18-24', '25-34', '35-44', '45-54', '55+'
  );
exception when duplicate_object then null; end $$;

-- A vote can only be one of these two values.
do $$ begin
  create type vote_choice as enum ('agree', 'disagree');
exception when duplicate_object then null; end $$;

-- Topic categories.
do $$ begin
  create type topic_category as enum (
    'Politics', 'Local', 'Economy', 'Lifestyle',
    'Transport', 'Environment', 'Other'
  );
exception when duplicate_object then null; end $$;

-- Suggestion review status.
do $$ begin
  create type suggestion_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;


-- ---------------------------------------------------------------------
-- profiles — extra info attached to each signed-in user
-- ---------------------------------------------------------------------
-- One row per user. Created on first sign-in. The user must choose a
-- region and age band before they are allowed to vote.
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  region      region_kind,        -- null until first-run setup is done
  age_band    age_band_kind,      -- null until first-run setup is done
  is_admin    boolean not null default false,  -- owner-only screens
  created_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- topics — the questions people vote on
-- ---------------------------------------------------------------------
create table if not exists public.topics (
  id           uuid primary key default gen_random_uuid(),
  question_tr  text not null,
  question_en  text not null,
  category     topic_category not null default 'Other',
  is_daily     boolean not null default false,  -- the featured question of the day
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Only ONE topic can be the daily question at a time.
-- This partial unique index allows many rows with is_daily = false,
-- but at most one row with is_daily = true.
create unique index if not exists one_daily_topic
  on public.topics ((is_daily))
  where is_daily = true;


-- ---------------------------------------------------------------------
-- votes — one record per person per topic
-- ---------------------------------------------------------------------
-- region and age_band are COPIED here at vote time, so that historical
-- statistics stay correct even if a user could ever change their profile.
create table if not exists public.votes (
  id          uuid primary key default gen_random_uuid(),
  topic_id    uuid not null references public.topics(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  choice      vote_choice not null,
  region      region_kind not null,
  age_band    age_band_kind not null,
  created_at  timestamptz not null default now(),

  -- THE HARD RULE: one vote per person per topic. Votes are final.
  constraint one_vote_per_user_per_topic unique (user_id, topic_id)
);

-- Make the live "count the votes" queries fast.
create index if not exists votes_topic_idx  on public.votes (topic_id);
create index if not exists votes_region_idx on public.votes (topic_id, region);


-- ---------------------------------------------------------------------
-- topic_suggestions — ideas submitted by users, pending owner review
-- ---------------------------------------------------------------------
create table if not exists public.topic_suggestions (
  id           uuid primary key default gen_random_uuid(),
  question_tr  text not null,
  question_en  text,
  suggested_by uuid not null references auth.users(id) on delete cascade,
  status       suggestion_status not null default 'pending',
  created_at   timestamptz not null default now()
);


-- =====================================================================
-- ROW-LEVEL SECURITY
-- =====================================================================
-- This is the "only aggregates are public, identities never are" rule.
-- We turn on RLS so that, by default, NOBODY can read raw rows. Then we
-- add narrow, explicit permissions.
-- =====================================================================

alter table public.profiles          enable row level security;
alter table public.topics            enable row level security;
alter table public.votes             enable row level security;
alter table public.topic_suggestions enable row level security;

-- --- profiles -------------------------------------------------------
-- A user can see and edit ONLY their own profile.
drop policy if exists "own profile read"  on public.profiles;
create policy "own profile read"  on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "own profile write" on public.profiles;
create policy "own profile write" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update using (auth.uid() = user_id);

-- --- topics ---------------------------------------------------------
-- Anyone signed in can READ active topics. Only admins can change them.
drop policy if exists "read active topics" on public.topics;
create policy "read active topics" on public.topics
  for select using (
    is_active = true
    or exists (select 1 from public.profiles p
               where p.user_id = auth.uid() and p.is_admin)
  );

drop policy if exists "admin manage topics" on public.topics;
create policy "admin manage topics" on public.topics
  for all using (
    exists (select 1 from public.profiles p
            where p.user_id = auth.uid() and p.is_admin)
  );

-- --- votes ----------------------------------------------------------
-- IMPORTANT: there is NO "select" policy for ordinary users on the raw
-- votes table. That means no one can read individual votes through the
-- app. Live statistics are served by the safe aggregate function below.
-- A user may insert ONLY their own vote, and only if their profile is
-- complete and the copied region/age match their profile.
drop policy if exists "insert own complete vote" on public.votes;
create policy "insert own complete vote" on public.votes
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and p.region   is not null
        and p.age_band is not null
        and p.region   = votes.region
        and p.age_band = votes.age_band
    )
  );

-- A user may check whether THEY personally have already voted (so the UI
-- can show the locked/revealed state) — but they only ever see their own row.
drop policy if exists "read own votes" on public.votes;
create policy "read own votes" on public.votes
  for select using (auth.uid() = user_id);

-- (No update/delete policy anywhere = votes are final and unchangeable.)

-- --- topic_suggestions ---------------------------------------------
drop policy if exists "suggest a topic" on public.topic_suggestions;
create policy "suggest a topic" on public.topic_suggestions
  for insert with check (auth.uid() = suggested_by);

drop policy if exists "read own suggestions" on public.topic_suggestions;
create policy "read own suggestions" on public.topic_suggestions
  for select using (
    auth.uid() = suggested_by
    or exists (select 1 from public.profiles p
               where p.user_id = auth.uid() and p.is_admin)
  );

drop policy if exists "admin manage suggestions" on public.topic_suggestions;
create policy "admin manage suggestions" on public.topic_suggestions
  for all using (
    exists (select 1 from public.profiles p
            where p.user_id = auth.uid() and p.is_admin)
  );


-- =====================================================================
-- SAFE STATISTICS — the only way the app reads vote results
-- =====================================================================
-- This function returns ONLY aggregate counts (totals and per-region
-- breakdown). It never returns who voted. The app calls this to draw
-- the result bars. SECURITY DEFINER lets it read the votes table on the
-- user's behalf while RLS still blocks raw access everywhere else.
-- =====================================================================
create or replace function public.topic_results(p_topic_id uuid)
returns table (
  region        text,
  agree_count   bigint,
  disagree_count bigint
)
language sql
security definer
set search_path = public
as $$
  -- 'TOTAL' row first, then one row per region.
  select 'TOTAL' as region,
         count(*) filter (where choice = 'agree')    as agree_count,
         count(*) filter (where choice = 'disagree') as disagree_count
  from public.votes where topic_id = p_topic_id
  union all
  select v.region::text,
         count(*) filter (where choice = 'agree'),
         count(*) filter (where choice = 'disagree')
  from public.votes v where v.topic_id = p_topic_id
  group by v.region;
$$;

-- Allow signed-in users to call the safe stats function.
grant execute on function public.topic_results(uuid) to authenticated;


-- =====================================================================
-- Auto-create a blank profile the moment someone signs in for the first
-- time. (region/age stay empty until they complete first-run setup.)
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
