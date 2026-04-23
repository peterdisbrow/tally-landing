/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: 'https://api.tallyconnect.app/admin/:path*',
        permanent: true,
      },
      {
        source: '/admin',
        destination: 'https://api.tallyconnect.app/admin',
        permanent: true,
      },
      {
        source: '/portal',
        destination: 'https://api.tallyconnect.app/church-portal',
        permanent: false,
      },
      {
        source: '/church-portal',
        destination: 'https://api.tallyconnect.app/church-portal',
        permanent: false,
      },
      {
        source: '/church-login',
        destination: 'https://api.tallyconnect.app/church-login',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/tools/healthcheck',
        destination: '/tools/healthcheck/index.html',
      },
      {
        source: '/tools/healthcheck/',
        destination: '/tools/healthcheck/index.html',
      },
      {
        source: '/tools/checklist',
        destination: '/tools/checklist/index.html',
      },
      {
        source: '/tools/checklist/',
        destination: '/tools/checklist/index.html',
      },
      {
        source: '/clock',
        destination: '/tools/clock/index.html',
      },
      {
        source: '/clock/',
        destination: '/tools/clock/index.html',
      },
      {
        source: '/multi-clock',
        destination: '/tools/clock/index.html',
      },
      {
        source: '/multi-clock/',
        destination: '/tools/clock/index.html',
      },
      {
        source: '/streaming-config',
        destination: '/tools/streaming-config/index.html',
      },
      {
        source: '/streaming-config/',
        destination: '/tools/streaming-config/index.html',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} https://plausible.io`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              "img-src 'self' data: blob:",
              "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "media-src 'self' blob:",
              `connect-src 'self' https://plausible.io https://api.tallyconnect.app wss://api.tallyconnect.app https://timeapi.io https://worldtimeapi.org${process.env.NODE_ENV === 'development' ? ' ws://localhost:* http://localhost:*' : ''}`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
