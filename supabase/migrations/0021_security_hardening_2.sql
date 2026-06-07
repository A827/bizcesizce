-- =====================================================================
-- Bizce sizce — security hardening (round 2)
-- =====================================================================
-- 1) Enforce the minimum-sample privacy rule INSIDE topic_results, not just
--    in the client. Per-region rows are now suppressed unless that region
--    has at least 5 votes, so the aggregate API can never reveal a tiny
--    (potentially de-anonymising) regional tally. The TOTAL row is always
--    returned. The UI already hid small regions, so there is no visible
--    change — this just closes a direct-API privacy gap.
-- 2) Restrict comment_likes reads to the caller's own rows, so no one can
--    enumerate which user liked which comment. Public like counts come from
--    comments.like_count (maintained by a SECURITY DEFINER trigger), so the
--    app is unaffected.
-- =====================================================================

create or replace function public.topic_results(p_topic_id uuid)
returns table (region text, agree_count bigint, disagree_count bigint)
language sql security definer set search_path = public as $$
  select 'TOTAL' as region,
         count(*) filter (where choice = 'agree')    as agree_count,
         count(*) filter (where choice = 'disagree') as disagree_count
  from public.votes where topic_id = p_topic_id
  union all
  select v.region::text,
         count(*) filter (where choice = 'agree'),
         count(*) filter (where choice = 'disagree')
  from public.votes v where v.topic_id = p_topic_id
  group by v.region
  having count(*) >= 5;
$$;

grant execute on function public.topic_results(uuid) to anon, authenticated;

drop policy if exists "read likes" on public.comment_likes;
create policy "read likes" on public.comment_likes
  for select using (auth.uid() = user_id);
