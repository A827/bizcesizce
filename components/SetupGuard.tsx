'use client';
// Safety net: whatever way someone signs in (Google code-flow OR email
// magic-link, whose session is set in the browser after the server has
// already rendered), make sure a signed-in person whose profile is not yet
// complete is taken to the setup wizard. Runs on every page via the layout.
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const SKIP = ['/login', '/setup', '/auth'];

export function SetupGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (SKIP.some((p) => pathname.startsWith(p))) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data: profile } = await supabase
        .from('profiles').select('region, age_band').eq('user_id', user.id).single();
      if (cancelled) return;
      if (!profile?.region || !profile?.age_band) {
        router.replace('/setup');
      }
    })();
    return () => { cancelled = true; };
  }, [pathname, router]);

  return null;
}
