-- =====================================================================
-- Bizce sizce — anti-spam rate limits + AI-ready comment moderation
-- =====================================================================

-- ---- Rate limit: votes (anti-bot rapid voting) ----------------------
-- One vote per topic is already enforced. This blocks automated bursts:
-- at most 20 votes per user in any rolling 60 seconds.
create or replace function public.rate_limit_votes()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select count(*) into n from public.votes
  where user_id = new.user_id and created_at > now() - interval '60 seconds';
  if n >= 20 then
    raise exception 'rate_limit_votes' using errcode = 'check_violation';
  end if;
  return new;
end $$;
drop trigger if exists rl_votes on public.votes;
create trigger rl_votes before insert on public.votes
  for each row execute function public.rate_limit_votes();

-- ---- Rate limit: comments (anti-spam) -------------------------------
-- At most 5 comments per user in any rolling 10 minutes.
create or replace function public.rate_limit_comments()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select count(*) into n from public.comments
  where user_id = new.user_id and created_at > now() - interval '10 minutes';
  if n >= 5 then
    raise exception 'rate_limit_comments' using errcode = 'check_violation';
  end if;
  return new;
end $$;
drop trigger if exists rl_comments on public.comments;
create trigger rl_comments before insert on public.comments
  for each row execute function public.rate_limit_comments();

-- ---- Simplify the moderation trigger --------------------------------
-- The trigger now only copies the commenter's region and marks every new
-- comment 'pending'. Auto-mode topics get their final decision from the
-- AI moderator in the app layer (which then flips status to approved /
-- rejected). Manual-mode topics stay pending for admin review.
create or replace function public.moderate_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_region region_kind;
begin
  select region into v_region from public.profiles where user_id = new.user_id;
  new.region := v_region;
  new.status := 'pending';
  return new;
end $$;
-- (trigger on_comment_insert already points at this function)
