-- =====================================================================
-- Bizce sizce — public (logged-out) read access for SEO pages
-- =====================================================================
-- Aggregate result functions are SECURITY DEFINER and only ever return
-- counts (never individual votes), so they are safe to expose to anonymous
-- visitors. Active topics and their options are already publicly readable
-- via RLS; this just lets logged-out crawlers/visitors see the numbers.
-- =====================================================================

grant execute on function public.topic_results(uuid)        to anon;
grant execute on function public.topic_option_results(uuid) to anon;
grant execute on function public.topic_counts()             to anon;
