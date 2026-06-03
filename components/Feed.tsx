'use client';
import { useLang } from './LanguageProvider';
import { TopicCard, TopicCardData } from './TopicCard';

export function Feed({ items }: { items: TopicCardData[] }) {
  const { t } = useLang();
  if (items.length === 0) return <div className="empty">{t('emptyFeed')}</div>;
  return (
    <>
      {items.map((it) => (
        <TopicCard key={it.topic.id} data={it} />
      ))}
    </>
  );
}
