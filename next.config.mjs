/**
 * Next.js configuration — AddictedtoAI.
 *
 * `output: 'export'` is literal and load-bearing (design D1). Consequences,
 * so that nothing downstream is surprised by them:
 *
 *  - `next start` REFUSES to run under static export. Every local
 *    verification serves the exported tree instead:
 *        npm run build && node scripts/serve-static.mjs out 3000
 *  - `redirects()` does not exist under static export. Redirects are
 *    host-applied: the build generates `vercel.json` from a checked-in
 *    `redirects.json` (task 2.9).
 *  - `/status.json` is a plain static file written into `public/` by the
 *    prebuild step (`scripts/prebuild.mjs`, task 4.13) so it lands in `out/`.
 *  - Client-side navigation still works (Next ships the router runtime),
 *    which is why the analytics route-change requirement is load-bearing
 *    (specs/analytics, task 5.1).
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Every route statically generated into out/. No server runtime anywhere.
  output: 'export',

  // The default image loader needs a server. Static export requires this.
  images: { unoptimized: true },

  // ESLint is deliberately not installed (task 1.1: "ESLint off by default
  // to keep the toolchain small"). Tell next build not to look for it.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
