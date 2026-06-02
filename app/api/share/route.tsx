// Generates a clean, branded result image for WhatsApp / Instagram.
// Square (1080x1080) so it looks right in social feeds.
import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { getResults } from '@/lib/actions';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get('topic');
  const choice = (searchParams.get('choice') as 'agree' | 'disagree') ?? 'agree';
  const lang = (searchParams.get('lang') as 'tr' | 'en') ?? 'tr';

  if (!topicId) return new Response('Missing topic', { status: 400 });

  const supabase = await createClient();
  const { data: topic } = await supabase
    .from('topics').select('question_tr, question_en').eq('id', topicId).single();
  if (!topic) return new Response('Not found', { status: 404 });

  const results = await getResults(topicId);
  const total = results.total_agree + results.total_disagree;
  const agreePct = total ? Math.round((results.total_agree / total) * 100) : 0;
  const myPct = choice === 'agree' ? agreePct : 100 - agreePct;

  const question = lang === 'tr' ? topic.question_tr : topic.question_en;
  const sideLabel = choice === 'agree'
    ? (lang === 'tr' ? 'Katılıyorum' : 'Agree')
    : (lang === 'tr' ? 'Katılmıyorum' : 'Disagree');
  const prompt = lang === 'tr' ? 'sen ne diyorsun?' : 'what do you think?';

  const YELLOW = '#e8c547', CORAL = '#ff5d52', BG = '#0d0d0f', TEXT = '#f4f1e9', MUTED = '#9a978f';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: BG, color: TEXT, padding: 72, justifyContent: 'space-between',
        fontFamily: 'sans-serif' }}>
        {/* Logo */}
        <div style={{ fontSize: 40, fontWeight: 600 }}>
          Bizce<span style={{ color: YELLOW }}>sizce</span>
        </div>

        {/* Question */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ fontSize: 60, lineHeight: 1.15, fontWeight: 600 }}>{question}</div>

          {/* My side + headline % */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <div style={{ fontSize: 120, fontWeight: 700, color: choice === 'agree' ? YELLOW : CORAL }}>
              {myPct}%
            </div>
            <div style={{ fontSize: 36, color: MUTED }}>
              {sideLabel}
            </div>
          </div>

          {/* Bar */}
          <div style={{ display: 'flex', width: '100%', height: 26, borderRadius: 999,
            background: '#1f1f25', overflow: 'hidden' }}>
            <div style={{ width: `${myPct}%`, background: choice === 'agree' ? YELLOW : CORAL }} />
          </div>
          <div style={{ fontSize: 28, color: MUTED }}>
            {total.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} {lang === 'tr' ? 'oy' : 'votes'}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 32, color: MUTED }}>
          <span style={{ color: YELLOW }}>{prompt}</span>
          <span>bizcesizce.com</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
