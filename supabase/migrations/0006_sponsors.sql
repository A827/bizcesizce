-- =====================================================================
-- Bizce sizce — sponsors (direct, labelled ad slots; no programmatic ads)
-- =====================================================================

do $$ begin
  create type sponsor_placement as enum ('reveal','feed','footer');
exception when duplicate_object then null; end $$;

create table if not exists public.sponsors (
  id         uuid primary key default gen_random_uuid(),
  label_tr   text not null,
  label_en   text,
  url        text not null,
  placement  sponsor_placement not null default 'reveal',
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sponsors enable row level security;

-- Signed-in users can see ACTIVE sponsors; admins see all.
drop policy if exists "read active sponsors" on public.sponsors;
create policy "read active sponsors" on public.sponsors for select using (
  is_active = true
  or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
);

-- Only admins create/edit/remove sponsors.
drop policy if exists "admin manage sponsors" on public.sponsors;
create policy "admin manage sponsors" on public.sponsors for all using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
);
