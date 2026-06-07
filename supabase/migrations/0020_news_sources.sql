-- News sites the AI scanner pulls headlines from. Managed in the admin panel.
create table if not exists public.news_sources (
  id          uuid primary key default gen_random_uuid(),
  url         text not null unique,
  label       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Locked down: only the service role (admin actions / scanner) touches it.
alter table public.news_sources enable row level security;

-- Seed with the current defaults.
insert into public.news_sources (url, label) values
  ('https://www.kibrispostasi.com/c35-KIBRIS_HABERLERI', 'Kıbrıs Postası — İç Haberler'),
  ('https://www.kibrispostasi.com/',                     'Kıbrıs Postası — Ana sayfa')
on conflict (url) do nothing;
