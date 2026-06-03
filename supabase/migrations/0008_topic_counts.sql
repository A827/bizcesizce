-- =====================================================================
-- Bizce sizce — total vote counts per topic (for "trending" sort)
-- Aggregate only; never exposes individual votes.
-- =====================================================================
create or replace function public.topic_counts()
returns table (topic_id uuid, votes bigint)
language sql security definer set search_path = public as $$
  select topic_id, count(*) as votes from public.votes group by topic_id;
$$;
grant execute on function public.topic_counts() to authenticated;
