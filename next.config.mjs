/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'btazadgvylssbhlrizjh.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Force HTTPS for a year. No includeSubDomains (would affect other
          // blainercosta.com subdomains). Add preload later once confident.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000',
          },
          // Anti-clickjacking: refuse to render inside any frame.
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Block MIME-type sniffing.
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Origin isolation so window.opener can't cross-origin access us.
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // Send full referrer only to same-origin; less data leakage cross-site.
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Deny powerful APIs by default; we don't use any of these.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
