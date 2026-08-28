# scripts/

Standalone operational scripts. All are plain `.mjs` run by absolute or
repo-relative path; none is a harness feature.

| Script | What it does |
|---|---|
| `serve-static.mjs` | dependency-free static server for `out/` — `node scripts/serve-static.mjs out 3000`. Exists because `next start` refuses to run under `output: 'export'` (design D1); every local-serve verification in this change uses it |
| `prebuild.mjs` | everything that must happen before `next build`. `npm run build` is `node scripts/prebuild.mjs && next build`. Register new prebuild steps in its `STEPS` array rather than editing `package.json` |
| `run-tests.mjs` | what `npm test` runs: finds `*.test.mjs` under the source directories and hands them to Node's built-in test runner |
| `verify-analytics.mjs` | task 5.2 — Playwright check that GA4 actually receives one `page_view` per direct load and one more per client-side navigation |
| `verify-launch.mjs` | task 6.6 — prints and checks the launch minimums |

**The `package.json` manifest has a single owner.** Every dependency any
phase of this change needs is already installed, and every command any phase
needs already has an npm script. If something genuinely appears to be
missing, stop and report it rather than editing the manifest.
