# scripts/

Standalone operational scripts. All are plain `.mjs` run by absolute or
repo-relative path; none is a harness feature.

| Script | What it does |
|---|---|
| `serve-static.mjs` | dependency-free static server for `out/` — `node scripts/serve-static.mjs out 3000`. Exists because `next start` refuses to run under `output: 'export'` (design D1); every local-serve verification in this change uses it |
| `prebuild.mjs` | everything that must happen before `next build`. `npm run build` is `node scripts/prebuild.mjs && next build`. Register new prebuild steps in its `STEPS` array rather than editing `package.json` |
| `run-tests.mjs` | what `npm test` runs: finds `*.test.mjs` under the source directories and hands them to Node's built-in test runner |
| `verify-analytics.mjs` | task 5.2 — Playwright check that GA4 actually receives one `page_view` per direct load and one more per client-side navigation |
| `verify-launch.mjs` | task 6.6 — prints and checks the launch minimums. Runs its own `npm run build` by default; `--no-build` skips it and prints a loud SKIP rather than a PASS |
| `verify-design.mjs` | tasks 4.7 and 4.11 — the specs/site bar measured against a real browser: axe-core in both themes, no horizontal scroll at 320px, the first-load JS bound, and a scripted keyboard-only traversal |
| `verify-surfaces.mjs` | tasks 4.2, 4.8, 4.9, 4.10, 4.13 — the checks that need the *exported* site rather than the fixtures: sort notes, the colophon, the citable assets, the origin allowlist, the build stamp |
| `measure-payload.mjs` | task 4.11 — first-load JavaScript gzipped from `out/`, kept as three separate figures because they fail for different reasons; the numbers land in `data/launch.json` under `js_payload` |

**Do not run two of these concurrently when both build.** Two `next build`
processes share one `.next/` and fail with `ENOENT` on `pages-manifest.json`
*after* the pages have generated (`addictedtoai-6s7`). Build once, then run the
rest against that `out/`.

**The `package.json` manifest has a single owner.** Every dependency any
phase of this change needs is already installed, and every command any phase
needs already has an npm script. If something genuinely appears to be
missing, stop and report it rather than editing the manifest.
