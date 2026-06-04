-- =====================================================================
-- Bizce sizce — security hardening
-- =====================================================================
-- Closes three holes:
--  1) CRITICAL: a signed-in user could set their own profiles.is_admin = true
--     through the API (the update policy allowed editing any column of their
--     own row). This trigger blocks non-service-role callers from ever
--     changing is_admin.
--  2) Self-reported demographics (region/age/…) could be changed AFTER they
--     were first set, letting someone re-attribute their votes. We now FREEZE
--     each demographic once it has a value (first-run setup still works).
--  3) Votes could be cast on inactive/hidden topics via the API. The insert
--     policy now requires the topic to be active.
-- =====================================================================

-- ---- 1 & 2: protect the profiles row from client tampering -----------
create or replace function public.protect_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Service-role (server-side admin actions) may do anything.
  if auth.role() = 'service_role' then
    return new;
  end if;

  -- Never let a normal user change their admin flag.
  new.is_admin := old.is_admin;

  -- Freeze each demographic once it has been set (null -> value is allowed
  -- exactly once, during first-run setup; value -> different value is not).
  if old.region     is not null then new.region     := old.region;     end if;
  if old.age_band   is not null then new.age_band   := old.age_band;   end if;
  if old.gender     is not null then new.gender     := old.gender;     end if;
  if old.education  is not null then new.education  := old.education;  end if;
  if old.employment is not null then new.employment := old.employment; end if;
  if old.origin     is not null then new.origin     := old.origin;     end if;

  return new;
end $$;

drop trigger if exists protect_profile_trg on public.profiles;
create trigger protect_profile_trg before update on public.profiles
  for each row execute function public.protect_profile();

-- ---- 3: votes only on active topics ----------------------------------
drop policy if exists "insert own complete vote" on public.votes;
create policy "insert own complete vote" on public.votes
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and p.region   is not null
        and p.age_band is not null
        and p.region   = votes.region
        and p.age_band = votes.age_band
    )
    and exists (select 1 from public.topics t where t.id = votes.topic_id and t.is_active)
  );
