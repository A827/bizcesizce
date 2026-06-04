-- =====================================================================
-- Bizce sizce — sponsor impression / click tracking
-- =====================================================================
-- Simple aggregate counters on each sponsor (no per-user tracking, no
-- cookies). A SECURITY DEFINER function lets any signed-in visitor bump
-- the counter without being able to edit anything else on the row.
-- =====================================================================

alter table public.sponsors add column if not exists impressions bigint not null default 0;
alter table public.sponsors add column if not exists clicks      bigint not null default 0;

create or replace function public.track_sponsor(p_id uuid, p_kind text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_kind = 'click' then
    update public.sponsors set clicks = clicks + 1 where id = p_id and is_active;
  else
    update public.sponsors set impressions = impressions + 1 where id = p_id and is_active;
  end if;
end $$;

grant execute on function public.track_sponsor(uuid, text) to anon, authenticated;
