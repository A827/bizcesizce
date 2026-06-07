-- AI-generated topic suggestions land in the same approval queue as user
-- suggestions. They have no human author, and carry extra context.
alter table public.topic_suggestions alter column suggested_by drop not null;
alter table public.topic_suggestions add column if not exists source text not null default 'user';
alter table public.topic_suggestions add column if not exists source_url text;
alter table public.topic_suggestions add column if not exists category text;
alter table public.topic_suggestions add column if not exists rationale text;
