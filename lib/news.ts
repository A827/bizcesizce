// AI topic discovery. Reads recent North Cyprus news headlines, asks Claude to
// propose a few neutral, civic, debatable poll questions (TR + EN), and drops
// them into the topic_suggestions queue for the admin to approve.
//
// Uses the same ANTHROPIC_API_KEY as comment moderation. If the key is missing
// it does nothing (returns a clear message) rather than failing.
import { createAdminClient } from '@/lib/supabase/admin';
import { CATEGORIES } from '@/lib/constants';

// News pages to scan. Server-side fetch on Vercel (full network). Override with
// NEWS_SOURCES env (comma-separated URLs). Defaults to Kıbrıs Postası.
const DEFAULT_SOURCES = [
  'https://www.kibrispostasi.com/c35-KIBRIS_HABERLERI',
  'https://www.kibrispostasi.com/',
];

type Headline = { title: string; url: string };

function decodeEntities(s: string): string {
  return s
    .replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

// Pull <a href="...nNNNNN-...">Title</a> news links out of a page's HTML.
function extractHeadlines(html: string, host: string): Headline[] {
  const out: Headline[] = [];
  const seen = new Set<string>();
  const re = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    let url = m[1];
    if (url.startsWith('/')) url = host + url;
    if (!/\/n\d{4,}/.test(url)) continue; // looks like a news article id
    const title = decodeEntities(m[2].replace(/<[^>]+>/g, ' '));
    if (title.length < 18 || title.length > 160) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ title, url });
    if (out.length >= 60) break;
  }
  return out;
}

async function fetchHeadlines(): Promise<Headline[]> {
  const sources = (process.env.NEWS_SOURCES?.split(',').map((s) => s.trim()).filter(Boolean)) ?? DEFAULT_SOURCES;
  const all: Headline[] = [];
  const seen = new Set<string>();
  for (const src of sources) {
    try {
      const host = new URL(src).origin;
      const res = await fetch(src, {
        // Present as an ordinary browser visitor (no site-identifying UA) so a
        // routine read of public pages doesn't flag our project pre-launch.
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'accept-language': 'tr-TR,tr;q=0.9,en;q=0.8',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        cache: 'no-store',
      });
      if (!res.ok) continue;
      const html = await res.text();
      for (const h of extractHeadlines(html, host)) {
        if (seen.has(h.url)) continue;
        seen.add(h.url); all.push(h);
      }
    } catch { /* skip a source that fails */ }
  }
  return all.slice(0, 50);
}

export type AiSuggestion = {
  question_tr: string; question_en: string;
  category: string; source_url: string; rationale: string;
};

const SYSTEM = `You help editors of "Bizce sizce", a civic opinion-poll site for North Cyprus (KKTC).
From a list of recent news headlines you propose poll questions the public can vote on.

Rules for every question:
- It must be a clear yes/no opinion statement people can agree or disagree with (binary poll).
- NEUTRAL wording. Never take a side, never imply the "right" answer, no loaded or emotional language.
- Locally relevant to North Cyprus daily life or civic debate (economy, transport, environment, education, local services, politics, lifestyle).
- Evergreen-ish: about the underlying issue, not a fleeting detail or a single person's quote.
- Avoid anything defamatory about a named private individual, and avoid sensational crime details.
- Provide a natural Turkish version (question_tr) and a faithful English version (question_en).
- category MUST be one of: ${CATEGORIES.join(', ')}.
- source_url MUST be copied exactly from the most relevant headline you used.
- rationale: one short Turkish sentence on why it's worth polling.

Return ONLY a JSON array, no prose. Each item: {"question_tr","question_en","category","source_url","rationale"}.`;

async function proposeFromHeadlines(headlines: Headline[], avoid: string[], count: number): Promise<AiSuggestion[]> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return [];
  const list = headlines.map((h, i) => `${i + 1}. ${h.title}\n   ${h.url}`).join('\n');
  const user = `Recent headlines:\n${list}\n\n`
    + `Avoid duplicating these existing/ pending questions:\n- ${avoid.slice(0, 60).join('\n- ') || '(none)'}\n\n`
    + `Propose ${count} strong, varied poll questions as a JSON array.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}`);
  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? '';
  const start = text.indexOf('['); const end = text.lastIndexOf(']');
  if (start < 0 || end < 0) return [];
  let parsed: AiSuggestion[];
  try { parsed = JSON.parse(text.slice(start, end + 1)); } catch { return []; }
  const validUrls = new Set(headlines.map((h) => h.url));
  const cats = new Set<string>(CATEGORIES as readonly string[]);
  return (parsed ?? [])
    .filter((s) => s && s.question_tr && s.question_en)
    .map((s) => ({
      question_tr: String(s.question_tr).trim(),
      question_en: String(s.question_en).trim(),
      category: cats.has(s.category) ? s.category : 'Other',
      source_url: validUrls.has(s.source_url) ? s.source_url : '',
      rationale: String(s.rationale ?? '').trim().slice(0, 240),
    }));
}

export async function ingestNews(count = 4): Promise<{ ok: boolean; inserted: number; message: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, inserted: 0, message: 'ANTHROPIC_API_KEY not set' };
  }
  const headlines = await fetchHeadlines();
  if (headlines.length === 0) return { ok: false, inserted: 0, message: 'No headlines fetched' };

  const db = createAdminClient();
  // Build the "avoid duplicates" list from active topics + recent pending suggestions.
  const [{ data: topics }, { data: pend }] = await Promise.all([
    db.from('topics').select('question_tr').limit(200),
    db.from('topic_suggestions').select('question_tr').eq('status', 'pending').limit(100),
  ]);
  const avoid = [
    ...((topics ?? []) as { question_tr: string }[]).map((t) => t.question_tr),
    ...((pend ?? []) as { question_tr: string }[]).map((t) => t.question_tr),
  ];

  let proposals: AiSuggestion[];
  try { proposals = await proposeFromHeadlines(headlines, avoid, count); }
  catch (e) { return { ok: false, inserted: 0, message: `AI error: ${(e as Error).message}` }; }
  if (proposals.length === 0) return { ok: true, inserted: 0, message: 'No new proposals' };

  // De-dupe against existing question text (case-insensitive) before inserting.
  const existing = new Set(avoid.map((q) => q.toLowerCase()));
  const rows = proposals
    .filter((p) => !existing.has(p.question_tr.toLowerCase()))
    .slice(0, count)
    .map((p) => ({
      question_tr: p.question_tr, question_en: p.question_en,
      category: p.category, source_url: p.source_url || null,
      rationale: p.rationale || null, source: 'ai', status: 'pending' as const,
    }));
  if (rows.length === 0) return { ok: true, inserted: 0, message: 'All proposals were duplicates' };

  const { error } = await db.from('topic_suggestions').insert(rows);
  if (error) return { ok: false, inserted: 0, message: error.message };
  return { ok: true, inserted: rows.length, message: `${rows.length} suggestion(s) added` };
}
