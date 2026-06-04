-- =====================================================================
-- Bizce sizce — richer profiles (fun signup wizard)
-- =====================================================================
-- Adds personal fields collected during the new step-by-step signup:
--   first_name, last_name, date_of_birth, marital_status, phone.
-- (region / gender / education / employment / origin already exist.)
-- Also denormalises the author's FIRST NAME onto each comment so it can be
-- shown publicly without exposing the rest of the profile.
-- =====================================================================

-- ---- Marital status value list (fixed, enforced as a type) -----------
do $$ begin create type marital_kind as enum
  ('Bekar','İlişkisi var','Evli','Boşanmış','Dul','Belirtmek istemiyorum');
  exception when duplicate_object then null; end $$;

-- ---- New profile columns (all nullable so existing rows are fine) -----
alter table public.profiles add column if not exists first_name     text;
alter table public.profiles add column if not exists last_name      text;
alter table public.profiles add column if not exists date_of_birth  date;
alter table public.profiles add column if not exists marital_status marital_kind;
alter table public.profiles add column if not exists phone          text;

-- Light sanity checks (kept loose on purpose).
do $$ begin
  alter table public.profiles add constraint first_name_len check (first_name is null or char_length(first_name) <= 60);
  exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.profiles add constraint last_name_len check (last_name is null or char_length(last_name) <= 60);
  exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.profiles add constraint phone_len check (phone is null or char_length(phone) <= 30);
  exception when duplicate_object then null; end $$;

-- ---- Public author name on comments ---------------------------------
alter table public.comments add column if not exists author_name text;

-- The moderation trigger already runs on insert and copies the region.
-- Extend it to also copy the poster's first name onto the comment, so the
-- UI can show "Ayşe" without ever reading other people's profiles.
create or replace function public.moderate_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_mode comment_mode_kind;
  v_flagged boolean;
  v_region region_kind;
  v_name text;
begin
  select comment_mode into v_mode from public.topics where id = new.topic_id;
  select region, first_name into v_region, v_name from public.profiles where user_id = new.user_id;
  new.region := v_region;
  new.author_name := v_name;

  -- Basic rules filter (placeholder; real AI moderation runs in the action).
  v_flagged := new.body ~* '(salak|aptal|orospu|piç|yavşak|geri zekal|fuck|shit|idiot)';

  if v_mode = 'auto' and not v_flagged then
    new.status := 'approved';
  else
    new.status := 'pending';
  end if;
  return new;
end $$;

-- moderate_comment trigger already exists (created in 0003); no re-create needed.
