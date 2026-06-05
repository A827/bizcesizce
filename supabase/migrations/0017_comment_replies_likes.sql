-- =====================================================================
-- Bizce sizce — comment replies + likes
-- =====================================================================

-- Replies: a comment can point to a parent comment.
alter table public.comments add column if not exists parent_id uuid references public.comments(id) on delete cascade;
-- Denormalised like counter (kept in sync by triggers below).
alter table public.comments add column if not exists like_count int not null default 0;

-- ---- Likes table ----------------------------------------------------
create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
alter table public.comment_likes enable row level security;

-- Anyone signed in may read likes; a user may add/remove only their own.
drop policy if exists "read likes" on public.comment_likes;
create policy "read likes" on public.comment_likes for select using (true);
drop policy if exists "like own" on public.comment_likes;
create policy "like own" on public.comment_likes for insert with check (auth.uid() = user_id);
drop policy if exists "unlike own" on public.comment_likes;
create policy "unlike own" on public.comment_likes for delete using (auth.uid() = user_id);

-- ---- Keep comments.like_count in sync -------------------------------
create or replace function public.bump_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.comments set like_count = like_count + 1 where id = new.comment_id;
  elsif (tg_op = 'DELETE') then
    update public.comments set like_count = greatest(0, like_count - 1) where id = old.comment_id;
  end if;
  return null;
end $$;

drop trigger if exists comment_like_count on public.comment_likes;
create trigger comment_like_count
  after insert or delete on public.comment_likes
  for each row execute function public.bump_like_count();
