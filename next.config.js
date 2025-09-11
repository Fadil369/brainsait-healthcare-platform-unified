/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // Resolve lockfile warning by specifying correct workspace root
  outputFileTracingRoot: path.join(__dirname),

  // Enhanced production optimization
  poweredByHeader: false,
  compress: true,

  // Performance optimizations - swcMinify is deprecated in Next.js 15

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Security headers for healthcare compliance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' https://js.stripe.com 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.stripe.com https://nphies.sa",
              "frame-src 'self' https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Environment configuration
  env: {
    CUSTOM_KEY: "BrainSAIT_Healthcare_Platform",
    APP_VERSION: "2.0.0",
  },

  // Experimental features for enhanced performance
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Remove custom Turbopack rules to avoid missing loader issues

  // Webpack customization for healthcare-specific optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for healthcare data processing
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Handle medical data formats as source to avoid extra loaders
    config.module.rules.push({
      test: /\.(fhir|hl7|dicom)$/i,
      type: "asset/source",
    });

    return config;
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
