-- =====================================================================
-- Bizce sizce — auto daily rotation + email notification preferences
-- =====================================================================

-- Track when a topic was last the daily question, so the rotator can cycle
-- fairly through polls instead of repeating the same one.
alter table public.topics add column if not exists last_daily_on date;

-- Per-user email notification preferences + an unsubscribe token.
alter table public.profiles add column if not exists notify_daily   boolean not null default true;
alter table public.profiles add column if not exists notify_replies boolean not null default true;
alter table public.profiles add column if not exists unsubscribe_token uuid not null default gen_random_uuid();
