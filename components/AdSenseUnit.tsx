'use client';
import { useEffect } from 'react';

// A single Google AdSense display unit. Renders nothing unless BOTH a
// publisher client id (NEXT_PUBLIC_ADSENSE_CLIENT) and an ad slot id are
// configured — so the site stays clean until AdSense is approved + set up.
declare global {
  interface Window { adsbygoogle?: unknown[]; }
}

export function AdSenseUnit({ slot, width = 160, height = 600 }:
  { slot?: string; width?: number; height?: number }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client || !slot) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* noop */ }
  }, [client, slot]);

  if (!client || !slot) return null;
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'inline-block', width, height }}
      data-ad-client={client}
      data-ad-slot={slot}
    />
  );
}
