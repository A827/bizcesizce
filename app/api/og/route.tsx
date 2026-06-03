// Default Open Graph image (1200x630) for link previews on social/chat.
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET() {
  const YELLOW = '#e8c547', BG = '#0d0d0f', TEXT = '#f4f1e9', MUTED = '#9a978f';
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: BG, color: TEXT, padding: 80, justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 84, fontWeight: 700 }}>
          Bizce<span style={{ color: YELLOW }}>sizce</span>
        </div>
        <div style={{ fontSize: 40, marginTop: 16, color: TEXT }}>
          Kuzey Kıbrıs ne düşünüyor?
        </div>
        <div style={{ fontSize: 30, marginTop: 8, color: MUTED }}>
          Oyla, anında sonuçları gör · bizcesizce.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
