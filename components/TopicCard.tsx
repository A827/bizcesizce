'use client';
import { useState } from 'react';
import { useLang } from './LanguageProvider';
import { Comments } from './Comments';
import { castVote, getResults, TopicResults } from '@/lib/actions';
import { Topic, MyVote } from '@/lib/types';
import { Choice, MIN_BREAKDOWN_TOTAL, MIN_BUCKET, MIN_VERDICT_TOTAL } from '@/lib/constants';

function pct(a: number, b: number) {
  const total = a + b;
  return total === 0 ? 0 : Math.round((a / total) * 100);
}

export function TopicCard({
  topic, initialVote, initialResults,
}: { topic: Topic; initialVote: MyVote; initialResults: TopicResults | null }) {
  const { t, lang } = useLang();
  const [myChoice, setMyChoice] = useState<Choice | null>(initialVote?.choice ?? null);
  const [results, setResults] = useState<TopicResults | null>(initialResults);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [rate, setRate] = useState(false);

  const question = lang === 'tr' ? topic.question_tr : topic.question_en;
  const voted = myChoice !== null;

  async function vote(choice: Choice) {
    if (busy || voted) return;
    setBusy(true); setError(false); setRate(false);
    const res = await castVote(topic.id, choice);
    if (res.ok || res.reason === 'already_voted') {
      setMyChoice(choice);
      setResults(await getResults(topic.id));
    } else if (res.reason === 'rate_limited') {
      setRate(true);
    } else {
      setError(true);
    }
    setBusy(false);
  }

  const agree = results?.total_agree ?? 0;
  const disagree = results?.total_disagree ?? 0;
  const total = agree + disagree;
  const agreePct = pct(agree, disagree);
  const disagreePct = 100 - (total ? agreePct : 0);
  const userOnMajority = myChoice === 'agree' ? agree >= disagree : disagree >= agree;

  return (
    <article className={`card${topic.is_daily ? ' daily' : ''}`}>
      {topic.is_daily && <div className="kicker">{t('dailyKicker')}</div>}
      <h2 className="question">{question}</h2>

      {!voted ? (
        <div className="vote-row">
          <button className="btn btn-accent" disabled={busy} onClick={() => vote('agree')}>{t('agree')}</button>
          <button className="btn" disabled={busy} onClick={() => vote('disagree')}>{t('disagree')}</button>
        </div>
      ) : (
        <div className="bar-wrap">
          <div className="bar-label"><span>{t('agree')}</span><span className="bar-pct">{total ? agreePct : 0}%</span></div>
          <div className="bar agree"><span style={{ width: `${total ? agreePct : 0}%` }} /></div>

          <div className="bar-label"><span>{t('disagree')}</span><span className="bar-pct">{total ? disagreePct : 0}%</span></div>
          <div className="bar disagree"><span style={{ width: `${total ? disagreePct : 0}%` }} /></div>

          <div className="total">{total.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} {t('totalVotes')}</div>

          {topic.is_daily && total >= MIN_VERDICT_TOTAL && (
            <div className={`verdict ${userOnMajority ? 'majority' : 'outlier'}`}>
              {userOnMajority ? t('withMajority') : t('outlier')}
            </div>
          )}

          {topic.is_daily && (() => {
            // Min-sample guard: only show the breakdown once there are enough
            // total votes, and only show regions that themselves clear MIN_BUCKET.
            const bigRegions = (results?.regions ?? []).filter((r) => r.agree + r.disagree >= MIN_BUCKET);
            if (total < MIN_BREAKDOWN_TOTAL || bigRegions.length === 0) {
              return <div className="total" style={{ marginTop: 12 }}>{t('breakdownSoon')}</div>;
            }
            return (
              <div className="region-table">
                <div className="kicker">{t('byRegion')}</div>
                {bigRegions.map((r) => {
                  const rTotal = r.agree + r.disagree;
                  const rPct = pct(r.agree, r.disagree);
                  return (
                    <div className="region-row" key={r.region}>
                      <span>{r.region}</span>
                      <span className="mini-bar"><span style={{ width: `${rPct}%` }} /></span>
                      <span className="mono" style={{ textAlign: 'right' }}>{rPct}%</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <a className="btn btn-ghost btn-block" style={{ marginTop: 16 }}
             href={`/api/share?topic=${topic.id}&choice=${myChoice}&lang=${lang}`} target="_blank" rel="noreferrer">
            {t('share')}
          </a>
        </div>
      )}

      {error && <p className="error" style={{ marginTop: 12 }}>{t('errorGeneric')}</p>}
      {rate && <p className="error" style={{ marginTop: 12 }}>{t('rateLimited')}</p>}

      {topic.comments_enabled && <Comments topicId={topic.id} canComment={voted} />}
    </article>
  );
}
