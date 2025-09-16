/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker deployment configuration
  output: 'standalone',
  
  // Disable static export for Docker
  trailingSlash: false,
  
  // Image optimization for Docker
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    unoptimized: false, // Enable optimization in Docker
  },

  // Enhanced security headers for healthcare compliance
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
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.brainsait.com https://nphies.sa",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            key: "X-HIPAA-Compliant",
            value: "true",
          },
          {
            key: "X-Healthcare-Platform",
            value: "BrainSAIT-v2.0",
          },
        ],
      },
    ];
  },

  // Environment configuration
  env: {
    CUSTOM_KEY: "BrainSAIT_Healthcare_Platform",
    APP_VERSION: "2.0.0",
    DEPLOYMENT_TARGET: "docker-free-tier",
  },

  // Webpack optimization for Docker
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for healthcare data processing
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Handle medical data formats
    config.module.rules.push({
      test: /\.(fhir|hl7|dicom)$/i,
      type: "asset/source",
    });

    return config;
  },

  // Redirects for healthcare routes
  async redirects() {
    return [
      {
        source: '/health',
        destination: '/api/health',
        permanent: true,
      },
    ];
  },

  // Experimental features for Docker
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'framer-motion'
    ],
  },
};

module.exports = nextConfig;
