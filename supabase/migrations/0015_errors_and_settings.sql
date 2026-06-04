-- =====================================================================
-- Bizce sizce — error monitoring + site announcement
-- =====================================================================

-- ---- Error log (admin-only) -----------------------------------------
create table if not exists public.app_errors (
  id         uuid primary key default gen_random_uuid(),
  message    text,
  stack      text,
  path       text,
  kind       text,            -- 'client' | 'server'
  created_at timestamptz not null default now()
);
create index if not exists app_errors_created_idx on public.app_errors (created_at desc);
alter table public.app_errors enable row level security;
-- Only admins may read. Inserts happen via the service role (logError),
-- which bypasses RLS, so no insert policy is needed.
drop policy if exists "admin read errors" on public.app_errors;
create policy "admin read errors" on public.app_errors for select using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
);

-- ---- Site settings: a single-row announcement banner ----------------
create table if not exists public.site_settings (
  id                  int primary key default 1 check (id = 1),
  announcement_tr     text,
  announcement_en     text,
  announcement_active boolean not null default false,
  updated_at          timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings enable row level security;
-- Everyone can read the (single) settings row; only admins can change it.
drop policy if exists "read settings" on public.site_settings;
create policy "read settings" on public.site_settings for select using (true);
drop policy if exists "admin write settings" on public.site_settings;
create policy "admin write settings" on public.site_settings for all using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
);
