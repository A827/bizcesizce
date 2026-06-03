import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0d0d0f', color: '#e8c547',
        fontSize: 360, fontWeight: 700, fontFamily: 'serif' }}>
        B
      </div>
    ),
    { ...size }
  );
}
