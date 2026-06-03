-- =====================================================================
-- Bizce sizce — per-option demographic breakdown + admin ops
-- =====================================================================

-- Per-option breakdown by each demographic dimension (admin only).
create or replace function public.admin_option_breakdown(p_topic_id uuid)
returns table (dimension text, bucket text, option_label text, votes bigint)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin) then
    raise exception 'not authorized'; end if;
  return query
    select d.dim, d.bucket, o.label_tr, count(*)::bigint
    from public.votes v
    join public.topic_options o on o.id = v.option_id
    cross join lateral (values
      ('region', v.region::text), ('age', v.age_band::text), ('gender', v.gender::text),
      ('education', v.education::text), ('employment', v.employment::text), ('origin', v.origin::text)
    ) as d(dim, bucket)
    where v.topic_id = p_topic_id and d.bucket is not null
    group by d.dim, d.bucket, o.label_tr;
end $$;
grant execute on function public.admin_option_breakdown(uuid) to authenticated;

-- Site overview totals (admin only).
create or replace function public.admin_overview()
returns table (total_votes bigint, votes_today bigint, total_topics bigint, total_comments bigint, total_users bigint)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin) then
    raise exception 'not authorized'; end if;
  return query select
    (select count(*) from public.votes),
    (select count(*) from public.votes where created_at::date = (now() at time zone 'UTC')::date),
    (select count(*) from public.topics),
    (select count(*) from public.comments),
    (select count(*) from public.profiles);
end $$;
grant execute on function public.admin_overview() to authenticated;

-- Admin audit log.
create table if not exists public.admin_audit (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);
alter table public.admin_audit enable row level security;
drop policy if exists "admin read audit" on public.admin_audit;
create policy "admin read audit" on public.admin_audit for select using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
);
-- Inserts happen via the service-role client in server actions (bypasses RLS).
