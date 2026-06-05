import { createClient } from '@/lib/supabase/client';

// Uploads a poll image to the public 'topic-images' bucket (admins only,
// enforced by storage RLS) and returns its public URL.
export async function uploadTopicImage(file: File): Promise<string | null> {
  const supabase = createClient();
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('topic-images')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) return null;
  return supabase.storage.from('topic-images').getPublicUrl(path).data.publicUrl;
}
