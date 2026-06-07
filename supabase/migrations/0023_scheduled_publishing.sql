-- Scheduled publishing: a topic can be created hidden (is_active = false) with
-- a publish_at timestamp; it auto-activates at/after that time.
alter table public.topics add column if not exists publish_at timestamptz;
create index if not exists topics_publish_at_idx on public.topics (publish_at)
  where publish_at is not null and is_active = false;
