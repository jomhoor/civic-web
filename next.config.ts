import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const isHttps = apiUrl.startsWith('https://');

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self'
    ${apiUrl}
    https://*.walletconnect.com
    https://*.walletconnect.org
    wss://*.walletconnect.com
    wss://*.walletconnect.org
    https://*.infura.io
    https://*.alchemy.com
    https://rpc.ankr.com
    https://polygon-rpc.com
    https://explorer-api.walletconnect.com;
  frame-src 'self' https://*.walletconnect.com https://*.walletconnect.org;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${isHttps ? 'upgrade-insecure-requests;' : ''}
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // CSP temporarily commented out to debug Network Error
          // {
          //   key: "Content-Security-Policy",
          //   value: cspHeader.replace(/\n/g, " ").trim(),
          // },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
