import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Home-screen / bookmark icon for iOS and modern browsers.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0d0d0f', color: '#e8c547',
        fontSize: 120, fontWeight: 700, fontFamily: 'serif', borderRadius: 36 }}>
        B
      </div>
    ),
    { ...size }
  );
}
