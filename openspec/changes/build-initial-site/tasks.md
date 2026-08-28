# Tasks — build-initial-site

**Ground rules for every implementing session and every subagent brief (each
one stopped a real unattended run; repeat them in any sub-brief you write):**
never use `cd` in any command, anywhere; keep shell command strings short
(write a script file and run it by absolute path instead of a long
one-liner); prefer the Read/Write/Edit/Grep/Glob tools over `cat`, `sed -i`,
`echo >`, `grep`, `find`; **never `git push`, `bd dolt push`, `gh pr
create`/`merge`, `vercel deploy`, or anything that transmits this repository
off this machine** — the remote publishes `www.addictedtoai.net` on push and
the tree was deliberately emptied; never manipulate credentials on a command
line; never print a secret or the contents of `.env.local`; if a tool call
is blocked, report it and stop. Commit locally after every task group (at
minimum). Specs referenced below live in
`openspec/changes/build-initial-site/specs/`.

## 1. Foundations

- [ ] 1.1 Scaffold a Next.js 15 App Router project at the repository root
      (`package.json`, `next.config.mjs` configured for fully static
      generation, `app/`, `tsconfig` or `jsconfig`, ESLint off by default to
      keep the toolchain small). Verify: `npm install` exits 0 and
      `npm run build` exits 0 producing a static build with a placeholder
      home page.
- [ ] 1.2 Create the content and data skeleton from design D1
      (`content/wiki/`, `content/learn/`, `content/tutorials/`,
      `content/blog/`, `content/directory/tools/`, `data/sources/`,
      `data/derived/`, `pulse/`, `loop/`, `scripts/`) with a `README.md`
      one-liner in each explaining what belongs there. Verify: the
      directories exist and `git status` shows them staged after commit.
- [ ] 1.3 Add `.gitignore` entries for build output already covered plus
      `data/derived/` cache exceptions per design (derived files that the
      site build needs at deploy time must be committed: alias registry,
      backlinks, queue, changes.jsonl are committed; ephemeral caches are
      not). Verify: `npm run build` then `git status` shows no unintended
      untracked build artifacts.

## 2. Content model and build core (specs/wiki, specs/site)

- [ ] 2.1 Implement front-matter schema validation for all five content
      types (entry: id/kind/aliases/status/maintenance/facts/timeline;
      tutorial: subjects/verified_against/verified_on/reverify_days; post:
      date; learn: level/prerequisites/outcome; tool listing:
      url/pricing/last_verified). Build fails with file path + field name on
      any violation. Verify: a deliberately malformed fixture entry makes
      `npm run build` fail naming the file and field; removing it makes the
      build pass.
- [ ] 2.2 Implement the closed `kind` list and duplicate-id detection per
      specs/wiki. Verify: fixtures with a bad kind and a duplicated id each
      fail the build with the specified error content.
- [ ] 2.3 Implement fact rendering: `cited` facts render value + source link
      + accessed date, with build-injected overdue marker when past their
      volatility interval; `feed` facts render from `data/derived/` values.
      Verify: fixture entries for each case render the expected markup
      (checked by a unit test on the rendering function).
- [ ] 2.4 Implement transclusion `{{fact:<kind>/<slug>#<field>}}` resolved
      at build; unresolved reference fails the build naming file and
      reference. Verify: one passing fixture and one failing fixture behave
      as specified.
- [ ] 2.5 Implement the derived alias registry with the three link classes
      and exclusive-collision build failure. Verify: fixture collision
      fails the build naming both entries; the derived
      `data/derived/aliases.json` is regenerated on build.
- [ ] 2.6 Implement the wrap-only alias linker with all five rules from
      specs/wiki and the required fixture tests (exclusive wrapped; shared
      plain; manual plain; second occurrence plain; code block plain).
      Verify: `npm test` runs the linker fixtures and all pass; breaking a
      rule in the linker makes a fixture fail.
- [ ] 2.7 Implement `mentions` front matter → "Referenced here" rail and
      computed "Appears in" backlinks (`data/derived/backlinks.json`);
      unresolvable mention id fails the build. Verify: fixture pages show
      both rails after build; a bogus mention fails the build.
- [ ] 2.8 Implement `{{want:Name}}` (renders plain, increments
      `data/derived/wants.json` with distinct referring pages). Verify:
      two fixture pages wanting the same name produce a count of 2 with
      both page paths listed.
- [ ] 2.9 Implement derived indexability (`noindex` rules from specs/wiki)
      and the redirects file honored by the build (no internal 404s; broken
      internal link fails the build). Verify: a stub fixture renders with
      `noindex` and is absent from browse listings; an indexed fixture is
      present; a fixture redirect resolves.
- [ ] 2.10 Implement the currency-literal build warning (numbers adjacent
      to `tokens`/`context`/`$`/version patterns in prose outside the wiki
      data layer produce a named warning, not a failure). Verify: a fixture
      prose file with a hard-coded price produces the warning naming file
      and line.

## 3. The Pulse (specs/pulse)

- [ ] 3.1 Re-verify the two launch sources live before wiring: fetch
      `https://openrouter.ai/api/v1/models` and `https://llm-releases.com`
      once each; record in `data/sources/registry.json` their URL, yielded
      fields, cadence, robots/terms check result, and the verification
      date. If either no longer serves usable data, choose a replacement
      that does, record why, and note it in the final report. Verify:
      `registry.json` exists with both entries carrying a dated
      verification result.
- [ ] 3.2 Implement fetch → snapshot (`latest.json`/`previous.json`) →
      hash → diff for registered sources, appending material changes
      (price, context, status, new arrival, retirement) to
      `data/changes.jsonl` as dated, sourced objects. Verify: running
      `node pulse/run.mjs` twice in a row produces zero new change lines
      the second time; a hand-edited `previous.json` price produces
      exactly one change line naming old and new values.
- [ ] 3.3 Implement the data layer derivation: model catalog rows and
      status tables in `data/derived/` from the snapshots. Verify: catalog
      rows exist after a Pulse run and a spot-checked row matches the raw
      snapshot value.
- [ ] 3.4 Implement freshness computation (overdue cited facts, tutorial
      staleness incl. 2× demotion state, listing verification, rolling
      link check ≤30 days, suspect-source flag at 3× expected cadence) into
      `data/derived/freshness.json`. Verify: fixtures for each state
      produce the expected freshness records.
- [ ] 3.5 Implement the derived queue (`data/derived/queue.json`,
      recomputed each run, ranked, capped at 50, no identity/history).
      Verify: fixing a fixture's overdue fact and re-running the Pulse
      removes it from the queue; re-running with no state change produces
      a byte-identical queue.
- [ ] 3.6 Implement the STOP file check and refusal handling (403/429 →
      recorded refusal, daily retry cap, last snapshot served with visible
      date). Verify: creating `STOP` makes `node pulse/run.mjs` exit
      immediately saying so; a mocked 403 source is marked refusing.
- [ ] 3.7 Zero-model verification: run `node pulse/run.mjs` in an
      environment with all model-provider environment variables unset and
      confirm exit 0 through all steps; grep the `pulse/` dependency graph
      for model SDK imports and confirm none. Verify: the command exits 0
      and the import check finds nothing.

## 4. Surfaces (specs/wiki, directory, education-static, education-dynamic, blog, site)

- [ ] 4.1 Wiki entry pages: render identity, facts with sources and
      freshness, timeline, prose body when present, "Appears in" rail,
      dormant stamp when classed dormant. Verify: fixture entries of each
      shape render all specified elements.
- [ ] 4.2 Directory: model catalog page (filterable client-side from
      pre-rendered data, fetch date visible, missing values rendered
      absent), plus the three standing tables (full catalog,
      deprecations/retirements, changed-in-30-days), each with a stable
      URL and a JSON sibling. Verify: pages render from Pulse data; the
      JSON siblings parse; a missing context window renders as absent not
      guessed.
- [ ] 4.3 Curated tools directory: listing template with
      url/pricing/last_verified and the could-not-verify / discontinued
      markers driven by freshness data. Verify: fixtures for a healthy, an
      unverifiable, and a dead listing render the specified markers.
- [ ] 4.4 Learn (static education): ladder index generated from page
      declarations (level, outcome, prerequisites) and page template
      showing all three. Verify: fixture pages produce a correctly ordered
      generated index and render prerequisite links.
- [ ] 4.5 Tutorials (dynamic education): page template with build-injected
      verification stamp, staleness banner, moved-on banner (from feed
      data), demotion at 2× interval (noindex + delisted + full-width
      notice + URL still resolves), archived state for dead subjects.
      Verify: fixtures for fresh, stale, moved-on, demoted, and archived
      states each render exactly the specified treatment.
- [ ] 4.6 Blog: post template with visible date, appended-correction
      support, feeds inclusion. Verify: fixture post with a correction
      block renders both the original text treatment and the dated
      correction.
- [ ] 4.7 Home page: changed feed from `data/changes.jsonl` (dated lines
      linking entries and sources), recent deprecations strip, latest post
      and tutorial, doors to all five surfaces; content above the fold at
      1440×900 and 390×844 (no full-viewport hero). Verify: build renders
      the feed from fixture changes; a screenshot or DOM check confirms
      content above the fold at both sizes.
- [ ] 4.8 Colophon: one page, out of primary nav, stating what the site is
      and that an AI writes and maintains it under review, linking the
      public commit history. Verify: the page exists, is ≤1 page, and no
      primary-nav link points to it.
- [ ] 4.9 Citable assets: RSS/Atom for blog, tutorials, and the changed
      feed; sitemap; generic Open Graph tags (no social handles); the open
      dataset (entries, facts, timelines, catalog, deprecations) as JSON +
      CSV at a stable URL with CC BY 4.0 stated inside the payload.
      Verify: feeds validate against an RSS/Atom validator library check;
      the dataset downloads, parses, and contains the license string.
- [ ] 4.10 Third-party origin allowlist enforcement: build fails if any
      rendered page references a network origin other than the site itself
      and Google Analytics. Verify: a fixture page with a stray CDN script
      fails the build naming page and origin.
- [ ] 4.11 Design pass to the specs/site bar: typographic identity (max 2
      typefaces), dark/light themes, data-dense tables, fast static loads.
      Verify: WCAG AA contrast on both themes via automated check
      (axe-core or equivalent) with zero violations on home, one entry,
      one table page; no horizontal scroll at 320px on those pages.

## 5. Analytics (specs/analytics)

- [ ] 5.1 Implement the GA4 component: gtag loader emitted on every page
      when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, nothing emitted when
      unset. Load the variable through the framework's `.env.local`
      support; never print the file or the variable. Verify: build with
      the variable set contains the loader on every sampled page; build
      with it unset contains no analytics markup.
- [ ] 5.2 Implement `scripts/verify-analytics.mjs` per specs/analytics
      (Playwright; home + one content page; assert `/g/collect` request
      with matching `tid` and 2xx response; per-page evidence lines; exit
      nonzero on any failure). Verify: against a local production build
      (`npm run build` then `npx next start`), the script exits 0 and
      prints the evidence lines; against a build with the variable unset,
      it exits nonzero naming the missing collect request.
- [ ] 5.3 Record the local verification result (date, pages tested, pass)
      in `data/launch.json` under `analytics_local`. Verify: the file
      exists with the recorded result.

## 6. Seed content — real entries, through review (specs/editorial, specs/review, design D9)

- [ ] 6.1 Write 40 wiki entries (mix per design D9: frontier model
      families, major labs and orgs, key tools, 6–8 post-2023
      concepts/techniques), each schema-valid with sourced facts; at least
      12 carry prose bodies. Volatile model facts bind to feed data where
      the feeds carry them. Verify: `node scripts/verify-launch.mjs`
      (written in 6.6) reports ≥40 entries, ≥12 with bodies, 0 schema
      errors.
- [ ] 6.2 Write 4 static education pages covering design D9's ladder tops,
      each with level/outcome/prerequisites and zero perishable literals.
      Verify: build passes with no currency-literal warnings on these
      pages.
- [ ] 6.3 Write 2 tutorials whose steps are actually executed in this
      environment during authoring (capture the outputs shown), with full
      perishable declarations. Verify: each tutorial's front matter is
      complete and its `verified_on` is the authoring date; the shown
      outputs come from real runs (transcripts kept under
      `data/reviews/evidence/`).
- [ ] 6.4 Write 2 blog posts (design D9 candidates or better), re-verifying
      every external fact live at authoring time — no fact enters a post
      on the authority of this change's design inputs alone. Verify: each
      claim in each post carries a working source link; the reviewer in
      6.5 re-fetches them.
- [ ] 6.5 Run every seed prose piece (entry bodies, education pages,
      tutorials, posts) through the review flow as its first live
      exercise: separate reviewer invocation with fresh context, the
      specs/review checklist for its kind, verdict + reasons recorded in
      `data/reviews/<slug>.md`. Revise-once/discard rules apply — a seed
      piece that fails twice is replaced, not forced through. Verify:
      every published seed prose file has a recorded `approve` verdict; at
      least the file count matches.
- [ ] 6.6 Write `scripts/verify-launch.mjs`: prints and checks the launch
      minimums (≥40 entries, ≥12 bodies, 4 learn pages, 2 tutorials, 2
      posts, ≥20 curated tools, catalog rows > 0, all reviews recorded,
      build passing). Verify: the script exits 0 and its printed counts
      match reality when spot-checked by hand.
- [ ] 6.7 Curate 20 tool listings (fresh research, not mined from the old
      tree), each with a live-verified URL and `last_verified` set.
      Verify: verify-launch reports ≥20 and the Pulse's link check passes
      them.

## 7. The Desk and portability (specs/loop, specs/review)

- [ ] 7.1 Create `runners.yml` with at least two entries (the current
      Claude Code setup as default `author`+`reviewer`, and one non-Claude
      combination such as OpenCode+DeepSeek, marked unverified until
      conformance passes) plus `DIRECTIVES.md` (empty, with a one-line
      header explaining its role). Verify: files exist; `runners.yml`
      parses; no other file in the repo names a model, provider, or
      harness outside it (grep check, excluding docs and this change).
- [ ] 7.2 Implement `loop/run.mjs`: select one job (directives → derived
      queue → ripe proposals), assemble a self-contained brief (task,
      acceptance checks, relevant spec excerpts, ground rules), create a
      branch, invoke the runner's command template, compute the diff
      itself, run schema/build checks, require a recorded review verdict
      before merging, write the ledger line (id, type, runner, tier, MM,
      outcome). Verify: a dry-run mode prints the selected job and
      assembled brief without invoking anything.
- [ ] 7.3 Implement budget enforcement from the rolling 30-day ledger
      (floors/ceilings per specs/loop) and the interrupted-vs-failed
      distinction. Verify: unit tests with synthetic ledgers show the
      selector refusing new-writing at the ceiling and machinery at 10%,
      and an interrupted job resuming without consuming a retry.
- [ ] 7.4 Implement the review step: reviewer invocation from
      `runners.yml` (`reviewer` role), fresh context, diff + checklist in,
      verdict file out (`data/reviews/<job-id>.md` with verdict + reasons
      from the closed list); merge refuses without an `approve`; the
      revise-once/discard-on-second mechanics. Verify: a test job with a
      planted `false-or-unsupported-claim` is rejected and, after a second
      failure, discarded with the record kept.
- [ ] 7.5 Implement breakers and holds per specs/loop (three consecutive
      same-type failures; build/deploy red; review bypass attempt;
      reserved-path edit attempt → write `HOLD.md` and stop; `STOP`
      honored at run start). Verify: each breaker is unit-tested to write
      `HOLD.md` with its reason; the loop refuses to start while `STOP`
      or `HOLD.md` exists.
- [ ] 7.6 Implement `loop/conformance.mjs` with the four canned checks
      (trivial edit; insufficient-information → blocked; fabricated-quote
      trap; reserved-path probe), each PASS/FAIL with evidence. Verify:
      running it against the default runner prints four PASS lines; a
      deliberately-sabotaged mock runner produces the expected FAILs.
- [ ] 7.7 Run one real job end-to-end through the Desk (a small `repair`
      or `interpret` job from the derived queue): brief → executor →
      review → merge, ledger line written. Verify: the merged commit
      exists, the ledger line names the runner and MM, and the review
      verdict file exists.

## 8. Documentation and change hygiene

- [ ] 8.1 Add the "Operating the site" section to `AGENTS.md`
      (harness-neutral: starting the Pulse and a Desk run, where specs
      live, the review flow, the swap procedure with its verification, the
      STOP/HOLD semantics), leaving the no-push hard rule block untouched.
      Mirror only Claude-Code specifics into `CLAUDE.md`. Verify: both
      files render the new sections; the hard-rule block is byte-identical
      to before (git diff shows no change inside it).
- [ ] 8.2 Update `CLAUDE.md`'s Build & Test / Architecture placeholder
      sections with the real commands (`npm run build`, `npm test`,
      `node pulse/run.mjs`, `node loop/run.mjs`) and a five-line
      architecture summary pointing at the specs. Verify: sections no
      longer read "Not yet established".
- [ ] 8.3 Run `openspec validate --change build-initial-site --strict` and
      fix anything it reports. Verify: validation exits clean.
- [ ] 8.4 Final integrated verification, in order: `npm test` (all
      fixtures), `npm run build` (clean), `node pulse/run.mjs` (exit 0,
      no model env), `node scripts/verify-launch.mjs` (exit 0),
      `scripts/verify-analytics.mjs` against a local production build
      (exit 0). Verify: all five exit 0 in a single fresh session, and
      the results are recorded in `data/launch.json` under
      `build_verification`.
- [ ] 8.5 Commit everything locally with clear messages. Verify:
      `git status` clean; `git log` shows the work; **nothing pushed** —
      unpushed local commits are the correct end state of this change.

## 9. Launch checklist — MAINTAINER-GATED (do not perform; blocked until the no-push rule is lifted)

- [ ] 9.1 MAINTAINER: lift the no-push hard rule in `CLAUDE.md` and
      `AGENTS.md`. Verify: the blocks are removed or amended by the
      maintainer's own edit.
- [ ] 9.2 MAINTAINER (or agent, once 9.1 is done): `git push`; watch the
      Vercel deployment; verify `https://www.addictedtoai.net/` serves the
      new site (positive string match on the home page, `curl -sL`).
- [ ] 9.3 Run `node scripts/verify-analytics.mjs
      https://www.addictedtoai.net` — exit 0 with evidence lines.
- [ ] 9.4 MAINTAINER: GA4 Realtime confirmation per specs/analytics (open
      property → Reports → Realtime, visit the site, see ≥1 active user
      and the page_view within 5 minutes); record the pass date in
      `data/launch.json` under `analytics_realtime`.
- [ ] 9.5 MAINTAINER: schedule the Pulse 4×/day via the OS scheduler
      running `node pulse/run.mjs`. Verify: two consecutive scheduled runs
      complete (check the Pulse's run log dates).
- [ ] 9.6 Record the launch date in `data/launch.json`; sync the delta
      specs to `openspec/specs/` (archive the change per the OpenSpec
      workflow) so the constitution is in its permanent home. Verify:
      `openspec/specs/` contains the eleven capabilities and the change is
      archived.
