/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

// CSP (Content-security-policy)
// locks down where scripts/styles/images/fetches/frames can load from
const csp = [
  "default-src 'self'", // default rule: only load resources from your own domain
  "base-uri 'self'", // prevents from changing base url of the site
  "object-src 'none'", // prevents usage of <object>, <embed>, <applet>. Those are rarely used and might be abused.
  "frame-ancestors 'none'", // prevents my site from being embedded in an iframe on another site
  /**
   * Controls where JS can load scripts from
   * Allows unsafe-eval in dev for HMR (hot module replacement)
   * Allows to load from trusted services with https
   */
  `script-src 'self' https: 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,

  /** Controls CSS loading
   * 'self': only from your own domain.
   * 'unsafe-inline': allow inline styles (needed because Next.js injects some).
   * https:: allow stylesheets from trusted HTTPS CDNs.
   */
  "style-src 'self' 'unsafe-inline' https:",

  /**
   * Controls where images can be loaded from
   * your own site
   * local images (via data: or blob: URLs),
   * HTTPS sources
   * RetailCRM CDN (s3-s1.retailcrm.tech).
   */
  "img-src 'self' data: blob: https: s3-s1.retailcrm.tech",

  /**
   * Controls where where fetch(), WebSocket, and React Query requets can go.
   * your backend ('self')
   * RetailCRM
   * YooKassa
   * CDEK
   * Telegram
   * jsDelivr (for widget scripts)
   * WebSocket (wss:)
   */
  `connect-src 'self' ${process.env.RETAILCRM_BASE_URL || ""} ${process.env.RETAILCRM_TEST_BASE_URL || ""} https://api.yookassa.ru https://api.cdek.ru https://api.telegram.org https://cdn.jsdelivr.net wss:`,
  `frame-src 'none'`, // controls where widgets / iframes can load from
  "font-src 'self' data: https:", // fronts allowed from my origin, https
  "worker-src 'self' blob:", // allow blob workers
  "form-action 'self'", // forms are only submitted to my domain
  "upgrade-insecure-requests", // tell browser to upgrade `http` to `httpS` automatically
].join("; ");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-s1.retailcrm.tech",
        pathname: "/ru-central1/retailcrm/**",
      },
    ],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  async headers() {
    const common = [
      { key: "Content-Security-Policy", value: csp },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" }, // CSP frame-ancestors already denies, this helps legacy UAs
      { key: "Permissions-Policy", value: "camera=(), microphone=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      { key: "X-DNS-Prefetch-Control", value: "off" },
    ];

    if (isProd) {
      common.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers: common,
      },
    ];
  },
};

export default nextConfig;
