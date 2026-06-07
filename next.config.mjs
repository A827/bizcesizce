/** @type {import('next').NextConfig} */

// Security headers applied to every response. The CSP is intentionally
// conservative: it locks down the high-value, low-breakage directives
// (no plugins/objects, no <base> hijack, no framing, force HTTPS) without
// restricting script/connect sources — that keeps AdSense, Turnstile,
// Supabase and Vercel Analytics working. A stricter script-src CSP with
// nonces is a possible future step.
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
