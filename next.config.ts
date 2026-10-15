import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy without nonces (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md),
 * so the public pages stay static. Only our own domain, plus Supabase for the dish photos.
 * Adding a third-party script, font, map or video? It must be listed here — and in the privacy notice.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.supabase.co",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  // no "X-Powered-By: Next.js": don't advertise the stack
  poweredByHeader: false,
  // the floating "N" badge covers the mobile buttons while reviewing the site
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        // the staff app's service worker controls the admin path without a trailing slash
        source: "/gestore-prometeo-2026/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/gestore-prometeo-2026" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
      {
        source: "/gestore-prometeo-2026/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  experimental: {
    // dish photos are resized in the browser, this is just headroom
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
