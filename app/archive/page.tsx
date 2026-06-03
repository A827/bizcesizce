import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getResults } from '@/lib/actions';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArchiveList, ArchiveItem } from '@/components/ArchiveList';
import { ArchiveHeading } from '@/components/ArchiveHeading';
import { Topic } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Past & present daily questions: those with a scheduled date, or the
  // currently-flagged daily. Newest first.
  const { data: topics } = await supabase
    .from('topics').select('*')
    .or('scheduled_daily_date.not.is.null,is_daily.eq.true')
    .order('scheduled_daily_date', { ascending: false, nullsFirst: false });

  const list = (topics ?? []) as Topic[];
  const items: ArchiveItem[] = await Promise.all(list.map(async (t) => {
    const r = await getResults(t.id);
    return {
      id: t.id, question_tr: t.question_tr, question_en: t.question_en,
      date: t.scheduled_daily_date,
      agree: r.total_agree, total: r.total_agree + r.total_disagree,
    };
  }));

  return (
    <>
      <Header />
      <main className="shell">
        <ArchiveHeading />
        <ArchiveList items={items} />
        <Footer />
      </main>
    </>
  );
}
