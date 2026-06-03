-- =====================================================================
-- Bizce sizce — multiple-choice polls (single-select, 2–6 options)
-- =====================================================================
-- Backwards compatible: existing topics stay poll_type='binary' and keep
-- using votes.choice (agree/disagree). New 'multi' topics use options.

do $$ begin create type poll_type_kind as enum ('binary','multi');
  exception when duplicate_object then null; end $$;

alter table public.topics add column if not exists poll_type poll_type_kind not null default 'binary';

-- ---- Options for a multiple-choice topic -----------------------------
create table if not exists public.topic_options (
  id        uuid primary key default gen_random_uuid(),
  topic_id  uuid not null references public.topics(id) on delete cascade,
  label_tr  text not null,
  label_en  text,
  position  int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists topic_options_topic_idx on public.topic_options (topic_id, position);

alter table public.topic_options enable row level security;

drop policy if exists "read options" on public.topic_options;
create policy "read options" on public.topic_options for select using (
  exists (select 1 from public.topics t where t.id = topic_id
          and (t.is_active or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)))
);
drop policy if exists "admin manage options" on public.topic_options;
create policy "admin manage options" on public.topic_options for all using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
);

-- ---- votes: support an option answer ---------------------------------
alter table public.votes add column if not exists option_id uuid references public.topic_options(id) on delete cascade;
alter table public.votes alter column choice drop not null;
-- Exactly one of (choice, option_id) must be set.
do $$ begin
  alter table public.votes add constraint vote_has_one_answer
    check ((choice is not null) <> (option_id is not null));
exception when duplicate_object then null; end $$;

-- Validate that a chosen option actually belongs to the voted topic.
create or replace function public.validate_vote_option()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.option_id is not null then
    if not exists (select 1 from public.topic_options o
                   where o.id = new.option_id and o.topic_id = new.topic_id) then
      raise exception 'option does not belong to topic';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists validate_vote_option_trg on public.votes;
create trigger validate_vote_option_trg before insert on public.votes
  for each row execute function public.validate_vote_option();

-- ---- Per-option results (aggregate only) -----------------------------
create or replace function public.topic_option_results(p_topic_id uuid)
returns table (option_id uuid, label_tr text, label_en text, votes bigint)
language sql security definer set search_path = public as $$
  select o.id, o.label_tr, o.label_en, count(v.id) as votes
  from public.topic_options o
  left join public.votes v on v.option_id = o.id
  where o.topic_id = p_topic_id
  group by o.id, o.label_tr, o.label_en, o.position
  order by o.position;
$$;
grant execute on function public.topic_option_results(uuid) to authenticated;
