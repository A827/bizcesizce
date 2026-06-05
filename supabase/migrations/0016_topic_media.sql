-- =====================================================================
-- Bizce sizce — richer polls: image, description, source link
-- =====================================================================

alter table public.topics add column if not exists image_url       text;
alter table public.topics add column if not exists description_tr   text;
alter table public.topics add column if not exists description_en   text;
alter table public.topics add column if not exists source_url       text;

-- ---- Public storage bucket for poll images --------------------------
insert into storage.buckets (id, name, public)
values ('topic-images', 'topic-images', true)
on conflict (id) do nothing;

-- Anyone can read images (the bucket is public); only admins can write.
drop policy if exists "public read topic images" on storage.objects;
create policy "public read topic images" on storage.objects
  for select using (bucket_id = 'topic-images');

drop policy if exists "admin upload topic images" on storage.objects;
create policy "admin upload topic images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'topic-images'
    and exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
  );

drop policy if exists "admin change topic images" on storage.objects;
create policy "admin change topic images" on storage.objects
  for update to authenticated using (
    bucket_id = 'topic-images'
    and exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
  );

drop policy if exists "admin delete topic images" on storage.objects;
create policy "admin delete topic images" on storage.objects
  for delete to authenticated using (
    bucket_id = 'topic-images'
    and exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
  );
