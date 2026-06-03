-- =====================================================================
-- Bizce sizce — v2: richer demographics + comments + admin analytics
-- =====================================================================

-- ---- New demographic value lists (fixed, enforced as types) ----------
do $$ begin create type gender_kind as enum
  ('Kadın','Erkek','Diğer','Belirtmek istemiyorum'); exception when duplicate_object then null; end $$;
do $$ begin create type education_kind as enum
  ('İlkokul','Lise','Üniversite','Yüksek lisans ve üzeri'); exception when duplicate_object then null; end $$;
do $$ begin create type employment_kind as enum
  ('Öğrenci','Kamu','Özel sektör','Serbest','Emekli','Çalışmıyor'); exception when duplicate_object then null; end $$;
do $$ begin create type origin_kind as enum
  ('Kuzey Kıbrıs','Güney Kıbrıs','Türkiye','Diğer'); exception when duplicate_object then null; end $$;

-- ---- Add columns to profiles (nullable so existing rows are fine) -----
alter table public.profiles add column if not exists gender     gender_kind;
alter table public.profiles add column if not exists education  education_kind;
alter table public.profiles add column if not exists employment employment_kind;
alter table public.profiles add column if not exists origin     origin_kind;

-- ---- Copy the same onto votes at vote time (nullable) -----------------
alter table public.votes add column if not exists gender     gender_kind;
alter table public.votes add column if not exists education  education_kind;
alter table public.votes add column if not exists employment employment_kind;
alter table public.votes add column if not exists origin     origin_kind;

-- ---- Topic comment settings -----------------------------------------
do $$ begin create type comment_mode_kind as enum ('manual','auto');
  exception when duplicate_object then null; end $$;
do $$ begin create type comment_status_kind as enum ('pending','approved','rejected');
  exception when duplicate_object then null; end $$;

alter table public.topics add column if not exists comments_enabled boolean not null default false;
alter table public.topics add column if not exists comment_mode comment_mode_kind not null default 'manual';

-- ---- Comments table --------------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  topic_id   uuid not null references public.topics(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 600),
  status     comment_status_kind not null default 'pending',
  region     region_kind,
  created_at timestamptz not null default now()
);
create index if not exists comments_topic_idx on public.comments (topic_id, status);

alter table public.comments enable row level security;

-- Anyone signed in can read APPROVED comments; users see their own; admins see all.
drop policy if exists "read approved comments" on public.comments;
create policy "read approved comments" on public.comments for select using (
  status = 'approved'
  or auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
);

-- A user may post a comment only on a topic where comments are enabled.
drop policy if exists "post comment" on public.comments;
create policy "post comment" on public.comments for insert with check (
  auth.uid() = user_id
  and exists (select 1 from public.topics t where t.id = topic_id and t.comments_enabled and t.is_active)
);

-- Only admins can moderate (update/delete) comments.
drop policy if exists "admin moderate comments" on public.comments;
create policy "admin moderate comments" on public.comments for all using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
);

-- ---- Moderation trigger: set status + copy region on insert ----------
-- 'manual' topics -> pending (admin approves). 'auto' topics -> approved,
-- unless the body trips the basic rules filter, then -> pending for review.
-- (Clean seam: replace the keyword check with a real AI/LLM call later.)
create or replace function public.moderate_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_mode comment_mode_kind;
  v_flagged boolean;
  v_region region_kind;
begin
  select comment_mode into v_mode from public.topics where id = new.topic_id;
  select region into v_region from public.profiles where user_id = new.user_id;
  new.region := v_region;

  -- Basic rules filter (placeholder for AI moderation).
  v_flagged := new.body ~* '(salak|aptal|orospu|piç|yavşak|geri zekal|fuck|shit|idiot)';

  if v_mode = 'auto' and not v_flagged then
    new.status := 'approved';
  else
    new.status := 'pending';
  end if;
  return new;
end $$;

drop trigger if exists on_comment_insert on public.comments;
create trigger on_comment_insert before insert on public.comments
  for each row execute function public.moderate_comment();

-- ---- Admin analytics: breakdown by every dimension ------------------
create or replace function public.admin_breakdown(p_topic_id uuid)
returns table (dimension text, bucket text, agree bigint, disagree bigint)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin) then
    raise exception 'not authorized';
  end if;
  return query
    select 'region', v.region::text,
           count(*) filter (where v.choice='agree'), count(*) filter (where v.choice='disagree')
    from public.votes v where v.topic_id = p_topic_id and v.region is not null group by v.region
    union all
    select 'age', v.age_band::text,
           count(*) filter (where v.choice='agree'), count(*) filter (where v.choice='disagree')
    from public.votes v where v.topic_id = p_topic_id and v.age_band is not null group by v.age_band
    union all
    select 'gender', v.gender::text,
           count(*) filter (where v.choice='agree'), count(*) filter (where v.choice='disagree')
    from public.votes v where v.topic_id = p_topic_id and v.gender is not null group by v.gender
    union all
    select 'education', v.education::text,
           count(*) filter (where v.choice='agree'), count(*) filter (where v.choice='disagree')
    from public.votes v where v.topic_id = p_topic_id and v.education is not null group by v.education
    union all
    select 'employment', v.employment::text,
           count(*) filter (where v.choice='agree'), count(*) filter (where v.choice='disagree')
    from public.votes v where v.topic_id = p_topic_id and v.employment is not null group by v.employment
    union all
    select 'origin', v.origin::text,
           count(*) filter (where v.choice='agree'), count(*) filter (where v.choice='disagree')
    from public.votes v where v.topic_id = p_topic_id and v.origin is not null group by v.origin;
end $$;
grant execute on function public.admin_breakdown(uuid) to authenticated;

-- ---- Admin analytics: votes over time (by day) ----------------------
create or replace function public.admin_timeseries(p_topic_id uuid)
returns table (day date, agree bigint, disagree bigint)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin) then
    raise exception 'not authorized';
  end if;
  return query
    select (v.created_at at time zone 'UTC')::date as day,
           count(*) filter (where v.choice='agree'), count(*) filter (where v.choice='disagree')
    from public.votes v where v.topic_id = p_topic_id
    group by day order by day;
end $$;
grant execute on function public.admin_timeseries(uuid) to authenticated;
