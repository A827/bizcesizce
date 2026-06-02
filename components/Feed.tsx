'use client';
import { useLang } from './LanguageProvider';
import { TopicCard } from './TopicCard';
import { Topic, MyVote } from '@/lib/types';
import { TopicResults } from '@/lib/actions';

type Item = { topic: Topic; vote: MyVote; results: TopicResults | null };

export function Feed({ items }: { items: Item[] }) {
  const { t } = useLang();
  if (items.length === 0) return <div className="empty">{t('emptyFeed')}</div>;
  return (
    <>
      {items.map((it) => (
        <TopicCard key={it.topic.id} topic={it.topic} initialVote={it.vote} initialResults={it.results} />
      ))}
    </>
  );
}
