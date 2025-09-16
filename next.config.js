/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://brainsait-healthcare-1757618402.s3-website-us-east-1.amazonaws.com'
    : '',
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion'
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production'
      ? 'https://vmzuql0azj.execute-api.us-east-1.amazonaws.com/prod'
      : 'http://localhost:3001/api',
    NEXT_PUBLIC_SITE_URL: process.env.CLOUDFRONT_URL || 'https://brainsait-healthcare-1757618402.s3.amazonaws.com',
    NEXT_PUBLIC_S3_WEBSITE_URL: 'http://brainsait-healthcare-1757618402.s3-website-us-east-1.amazonaws.com',
    NEXT_PUBLIC_S3_HTTPS_URL: 'https://brainsait-healthcare-1757618402.s3.amazonaws.com',
  },
  // Headers removed for static export compatibility
  /*async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://api.stripe.com")',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.brainsait.com https://nphies.sa https://api.stripe.com",
              "frame-src 'self' https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-HIPAA-Compliant',
            value: 'true',
          },
          {
            key: 'X-Healthcare-Platform',
            value: 'BrainSAIT-v2.0',
          },
        ],
      },
    ];
  },*/
};

module.exports = nextConfig;
