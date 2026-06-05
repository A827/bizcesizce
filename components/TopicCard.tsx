'use client';
import { useState } from 'react';
import { useLang } from './LanguageProvider';
import { Comments } from './Comments';
import { SponsorSlot } from './SponsorSlot';
import { castVote, castVoteOption, getResults, getOptionResults, TopicResults } from '@/lib/actions';
import { Topic, OptionResult } from '@/lib/types';
import { Choice, MIN_BREAKDOWN_TOTAL, MIN_BUCKET, MIN_VERDICT_TOTAL } from '@/lib/constants';

function pct(a: number, total: number) {
  return total === 0 ? 0 : Math.round((a / total) * 100);
}

export type TopicCardData = {
  topic: Topic;
  myChoice: Choice | null;
  myOptionId: string | null;
  results: TopicResults | null;
  optionResults: OptionResult[] | null;
};

export function TopicCard({ data }: { data: TopicCardData }) {
  const { t, lang } = useLang();
  const { topic } = data;
  const isMulti = topic.poll_type === 'multi';

  const [myChoice, setMyChoice] = useState<Choice | null>(data.myChoice);
  const [myOptionId, setMyOptionId] = useState<string | null>(data.myOptionId);
  const [results, setResults] = useState<TopicResults | null>(data.results);
  const [optionResults, setOptionResults] = useState<OptionResult[] | null>(data.optionResults);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [rate, setRate] = useState(false);

  const question = lang === 'tr' ? topic.question_tr : topic.question_en;
  const voted = isMulti ? myOptionId !== null : myChoice !== null;
  const label = (o: { label_tr: string; label_en: string | null }) =>
    lang === 'tr' ? o.label_tr : (o.label_en || o.label_tr);

  function handleResult(res: { ok: boolean; reason?: string }, after: () => Promise<void> | void) {
    if (res.ok || res.reason === 'already_voted') { after(); }
    else if (res.reason === 'rate_limited') setRate(true);
    else setError(true);
  }

  async function voteBinary(choice: Choice) {
    if (busy || voted) return;
    setBusy(true); setError(false); setRate(false);
    const res = await castVote(topic.id, choice);
    handleResult(res, async () => { setMyChoice(choice); setResults(await getResults(topic.id)); });
    setBusy(false);
  }

  async function voteOption(optionId: string) {
    if (busy || voted) return;
    setBusy(true); setError(false); setRate(false);
    const res = await castVoteOption(topic.id, optionId);
    handleResult(res, async () => { setMyOptionId(optionId); setOptionResults(await getOptionResults(topic.id)); });
    setBusy(false);
  }

  // ----- Binary derived values -----
  const agree = results?.total_agree ?? 0;
  const disagree = results?.total_disagree ?? 0;
  const bTotal = agree + disagree;
  const agreePct = pct(agree, bTotal);
  const userOnMajority = myChoice === 'agree' ? agree >= disagree : disagree >= agree;

  // ----- Multi derived values -----
  const mTotal = (optionResults ?? []).reduce((s, o) => s + o.votes, 0);
  const topOption = (optionResults ?? []).reduce<OptionResult | null>(
    (best, o) => (!best || o.votes > best.votes ? o : best), null);
  const userPickedTop = topOption?.option_id === myOptionId;

  return (
    <article className={`card${topic.is_daily ? ' daily' : ''}`} style={topic.image_url ? { overflow: 'hidden' } : undefined}>
      {topic.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={topic.image_url} alt={question}
          style={{ width: 'calc(100% + 44px)', maxHeight: 220, objectFit: 'cover', margin: '-22px -22px 14px', display: 'block' }} />
      )}
      {topic.is_daily && <div className="kicker">{t('dailyKicker')}</div>}
      <h2 className="question">{question}</h2>
      {(lang === 'tr' ? topic.description_tr : (topic.description_en || topic.description_tr)) && (
        <p className="muted" style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.5 }}>
          {lang === 'tr' ? topic.description_tr : (topic.description_en || topic.description_tr)}
        </p>
      )}
      {topic.source_url && (
        <p style={{ margin: '-6px 0 14px' }}>
          <a href={topic.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>{t('source')} →</a>
        </p>
      )}

      {/* ---------- NOT VOTED: show choices ---------- */}
      {!voted && (isMulti ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(topic.options ?? []).map((o) => (
            <button key={o.id} className="btn" disabled={busy} onClick={() => voteOption(o.id)}>{label(o)}</button>
          ))}
        </div>
      ) : (
        <div className="vote-row">
          <button className="btn btn-accent" disabled={busy} onClick={() => voteBinary('agree')}>{t('agree')}</button>
          <button className="btn" disabled={busy} onClick={() => voteBinary('disagree')}>{t('disagree')}</button>
        </div>
      ))}

      {/* ---------- VOTED: reveal ---------- */}
      {voted && (isMulti ? (
        <div className="bar-wrap">
          {(optionResults ?? []).map((o) => {
            const p = pct(o.votes, mTotal);
            const mine = o.option_id === myOptionId;
            return (
              <div key={o.option_id}>
                <div className="bar-label">
                  <span style={mine ? { color: 'var(--accent)' } : undefined}>{label(o)}</span>
                  <span className="bar-pct">{mTotal ? p : 0}%</span>
                </div>
                <div className="bar agree"><span style={{ width: `${mTotal ? p : 0}%` }} /></div>
              </div>
            );
          })}
          <div className="total">{mTotal.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} {t('totalVotes')}</div>
          {topic.is_daily && mTotal >= MIN_VERDICT_TOTAL && (
            <div className={`verdict ${userPickedTop ? 'majority' : 'outlier'}`}>
              {userPickedTop ? t('withMajority') : t('outlier')}
            </div>
          )}
          <a className="btn btn-ghost btn-block" style={{ marginTop: 16 }}
             href={`/api/share?topic=${topic.id}&option=${myOptionId}&lang=${lang}`} target="_blank" rel="noreferrer">
            {t('share')}
          </a>
        </div>
      ) : (
        <div className="bar-wrap">
          <div className="bar-label"><span>{t('agree')}</span><span className="bar-pct">{bTotal ? agreePct : 0}%</span></div>
          <div className="bar agree"><span style={{ width: `${bTotal ? agreePct : 0}%` }} /></div>

          <div className="bar-label"><span>{t('disagree')}</span><span className="bar-pct">{bTotal ? 100 - agreePct : 0}%</span></div>
          <div className="bar disagree"><span style={{ width: `${bTotal ? 100 - agreePct : 0}%` }} /></div>

          <div className="total">{bTotal.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} {t('totalVotes')}</div>

          {topic.is_daily && bTotal >= MIN_VERDICT_TOTAL && (
            <div className={`verdict ${userOnMajority ? 'majority' : 'outlier'}`}>
              {userOnMajority ? t('withMajority') : t('outlier')}
            </div>
          )}

          {topic.is_daily && (() => {
            const bigRegions = (results?.regions ?? []).filter((r) => r.agree + r.disagree >= MIN_BUCKET);
            if (bTotal < MIN_BREAKDOWN_TOTAL || bigRegions.length === 0) {
              return <div className="total" style={{ marginTop: 12 }}>{t('breakdownSoon')}</div>;
            }
            return (
              <div className="region-table">
                <div className="kicker">{t('byRegion')}</div>
                {bigRegions.map((r) => {
                  const rTotal = r.agree + r.disagree;
                  const rPct = pct(r.agree, rTotal);
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
      ))}

      {error && <p className="error" style={{ marginTop: 12 }}>{t('errorGeneric')}</p>}
      {rate && <p className="error" style={{ marginTop: 12 }}>{t('rateLimited')}</p>}

      {voted && topic.is_daily && <SponsorSlot placement="reveal" />}

      {topic.comments_enabled && <Comments topicId={topic.id} canComment={voted} />}
    </article>
  );
}
