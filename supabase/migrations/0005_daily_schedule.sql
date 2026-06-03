-- =====================================================================
-- Bizce sizce — schedule daily questions in advance
-- =====================================================================
-- Each topic can be assigned a date to be "question of the day". The app
-- picks the topic whose scheduled_daily_date = today (Cyprus time) as the
-- daily one — so the daily question rotates automatically, no manual flip.
-- The old is_daily flag stays as a fallback / manual override.

alter table public.topics add column if not exists scheduled_daily_date date;

-- At most one topic per calendar date.
create unique index if not exists one_topic_per_daily_date
  on public.topics (scheduled_daily_date)
  where scheduled_daily_date is not null;
