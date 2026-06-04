-- =====================================================================
-- Bizce sizce — account moderation (ban / suspend)
-- =====================================================================
-- Adds profiles.is_banned. A banned account can still sign in and read,
-- but cannot vote or comment (enforced in RLS, not just the UI). Only the
-- service role (admin actions) can change the flag; the protect_profile
-- trigger stops a user flipping it on themselves.
-- =====================================================================

alter table public.profiles add column if not exists is_banned boolean not null default false;

-- Extend the profile-protection trigger to also freeze is_banned for
-- non-service-role callers (so a user can never unban themselves).
create or replace function public.protect_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  new.is_admin  := old.is_admin;
  new.is_banned := old.is_banned;
  if old.region     is not null then new.region     := old.region;     end if;
  if old.age_band   is not null then new.age_band   := old.age_band;   end if;
  if old.gender     is not null then new.gender     := old.gender;     end if;
  if old.education  is not null then new.education  := old.education;  end if;
  if old.employment is not null then new.employment := old.employment; end if;
  if old.origin     is not null then new.origin     := old.origin;     end if;
  return new;
end $$;

-- Votes: only from a non-banned, complete profile, on an active topic.
drop policy if exists "insert own complete vote" on public.votes;
create policy "insert own complete vote" on public.votes
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and p.is_banned = false
        and p.region   is not null
        and p.age_band is not null
        and p.region   = votes.region
        and p.age_band = votes.age_band
    )
    and exists (select 1 from public.topics t where t.id = votes.topic_id and t.is_active)
  );

-- Comments: only from a non-banned user, on a comment-enabled active topic.
drop policy if exists "post comment" on public.comments;
create policy "post comment" on public.comments for insert with check (
  auth.uid() = user_id
  and exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_banned = false)
  and exists (select 1 from public.topics t where t.id = topic_id and t.comments_enabled and t.is_active)
);
