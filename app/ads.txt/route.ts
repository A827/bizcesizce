// Serves /ads.txt for Google AdSense. Generated from the publisher id so it
// is always correct once NEXT_PUBLIC_ADSENSE_CLIENT is set; empty otherwise.
export const dynamic = 'force-static';

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // e.g. ca-pub-1234567890123456
  const pub = client ? client.replace(/^ca-/, '') : '';   // -> pub-1234567890123456
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '';
  return new Response(body, { headers: { 'content-type': 'text/plain' } });
}
