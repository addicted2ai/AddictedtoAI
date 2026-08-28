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

- [x] 1.1 Scaffold a Next.js 15 App Router project at the repository root
      (`package.json`, `next.config.mjs` with **literal `output: 'export'`**
      per design D1, `app/`, `tsconfig` or `jsconfig`, ESLint off by
      default to keep the toolchain small). Also write
      `scripts/serve-static.mjs` — a small dependency-free static file
      server (`node scripts/serve-static.mjs out 3000`) used by every
      local-serve verification in this change, because `next start`
      refuses to run under `output: 'export'`. Verify: `npm install` exits
      0; `npm run build` exits 0 producing `out/` with an `index.html`;
      the serve script serves that page at `http://localhost:3000/` (curl
      returns 200 and the placeholder text).
- [x] 1.2 Create the content and data skeleton from design D1
      (`content/wiki/`, `content/learn/`, `content/tutorials/`,
      `content/blog/`, `content/directory/tools/`, `data/sources/`,
      `data/derived/`, `pulse/`, `loop/`, `scripts/`) with a `README.md`
      one-liner in each explaining what belongs there. Verify: the
      directories exist and `git status` shows them staged after commit.
- [x] 1.3 Commit policy per design D1: the **entire `data/` tree is
      committed** — snapshots (latest and previous), changes.jsonl,
      proposals, reviews, all derived files including the rolling
      link-check state (`data/linkcheck.json`) and the append-only job ledger
      (`data/ledger.jsonl`) — both state files at the data root, since
      `data/derived/` holds only what every Pulse run recomputes — plus the
      search index and config.json. Ensure
      `.gitignore` excludes only build output (`.next/`, `out/`) and the
      environment files, never anything under `data/`. Also create
      `data/config.json` — the one normative loop config, a reserved path
      per specs/loop — with `publish: false`, the budget bounds (upkeep
      floor 40, new-writing ceiling 45, machinery ceiling 10), the
      per-type job caps (a map of every job type to its cap, defaults
      derived from the type's tier: cheap types 30 min, frontier authoring
      types 60 min), and the degradation thresholds (capacity events in
      trailing 48h: 1/2/3).
      Verify: `npm run build` then `git status` shows no unintended
      untracked build artifacts; `git check-ignore
      data/derived/queue.json` reports not ignored; `data/config.json`
      parses and contains all four groups of keys.

## 2. Content model and build core (specs/wiki, specs/site)

- [x] 2.1 Implement front-matter schema validation for all five content
      types (entry: id / kind / display_name / aliases-with-classes /
      status / maintenance / feeds / facts / timeline / mentions / optional
      themes — the normative shape is the worked example in specs/wiki;
      tutorial: subjects/verified_against/verified_on/reverify_days; post:
      date; learn: level/prerequisites/outcome; tool listing:
      url/pricing/last_verified/entry-link). Build fails with file path + field name on
      any violation. Verify: a deliberately malformed fixture entry makes
      `npm run build` fail naming the file and field; removing it makes the
      build pass.
- [x] 2.2 Implement the closed `kind` list, duplicate-id detection, and id
      format validation per specs/wiki. Verify: fixtures with a bad kind, a
      duplicated id, and a non-kebab-case id each fail the build with the
      specified error content.
- [x] 2.3 Implement fact rendering: `cited` facts render value + source link
      + accessed date, with build-injected overdue marker when past their
      volatility interval; `feed` facts render from `data/derived/` values;
      a feed fact whose declared row id is vanished (per the freshness
      computation) renders its last-known value with a visible as-of date
      per specs/wiki. Verify: fixture entries for each case — including a
      vanished-row fixture — render the expected markup (checked by a unit
      test on the rendering function).
- [x] 2.4 Implement transclusion `{{fact:<kind>/<slug>#<field>}}` resolved
      at build; unresolved reference fails the build naming file and
      reference. Verify: one passing fixture and one failing fixture behave
      as specified.
- [x] 2.5 Implement the derived alias registry with the three link classes
      and exclusive-collision build failure. Verify: fixture collision
      fails the build naming both entries; the derived
      `data/derived/aliases.json` is regenerated on build.
- [x] 2.6 Implement the wrap-only alias linker with all five rules from
      specs/wiki and the required fixture tests (exclusive wrapped; shared
      plain; manual plain; second occurrence plain; code block plain).
      Verify: `npm test` runs the linker fixtures and all pass; breaking a
      rule in the linker makes a fixture fail.
- [x] 2.7 Implement `mentions` front matter → "Referenced here" rail and
      computed "Appears in" backlinks (`data/derived/backlinks.json`);
      unresolvable mention id fails the build. Verify: fixture pages show
      both rails after build; a bogus mention fails the build.
- [x] 2.8 Implement `{{want:Name}}` (renders plain, increments
      `data/derived/wants.json` with distinct referring pages). Verify:
      two fixture pages wanting the same name produce a count of 2 with
      both page paths listed.
- [x] 2.9 Implement derived indexability (`noindex` rules from specs/wiki)
      and redirects: a checked-in `redirects.json` from which the build
      generates `vercel.json` redirect rules (Next's `redirects()` does not
      exist under static export — the host applies these), plus the
      internal-link check (broken internal link fails the build). Verify: a
      stub fixture renders with `noindex` and is absent from browse
      listings; an indexed fixture is present; a fixture redirect entry
      appears in the generated `vercel.json`.
- [x] 2.10 Implement the currency-literal build warning (numbers adjacent
      to `tokens`/`context`/`$`/version patterns in prose outside the wiki
      data layer produce a named warning, not a failure). Verify: a fixture
      prose file with a hard-coded price produces the warning naming file
      and line.

## 3. The Pulse (specs/pulse)

- [x] 3.1 Re-verify the two launch sources live before wiring: fetch
      `https://openrouter.ai/api/v1/models` and `https://llm-releases.com`
      once each; record in `data/sources/registry.json` their URL, yielded
      fields, which field is the row id (the join key — see specs/pulse and
      specs/wiki), `fetch_every_days`, `expected_change_days`, the `mints`
      mapping on `openrouter-models` only (`kind: model` — see specs/pulse
      and design D7; `llm-releases` is non-minting), robots/terms check
      result, and the verification date. If either no longer serves usable data, choose a replacement
      that does, record why, and note it in the final report. Verify:
      `registry.json` exists with both entries carrying a dated
      verification result.
- [x] 3.2 Implement fetch → snapshot (`latest.json`/`previous.json`) →
      hash → diff for registered sources, appending material changes
      (price, context, status, new arrival, retirement), each embedding
      its relevant source-row excerpt per specs/pulse (the archived source
      reference), to
      `data/changes.jsonl` as dated, sourced objects. Verify: running
      `node pulse/run.mjs` twice in a row produces zero new change lines
      the second time; a hand-edited `previous.json` price produces
      exactly one change line naming old and new values.
- [x] 3.3 Implement the data layer derivation: model catalog rows and
      status tables in `data/derived/` from the snapshots. Verify: catalog
      rows exist after a Pulse run and a spot-checked row matches the raw
      snapshot value.
- [x] 3.4 Implement freshness computation (overdue cited facts, tutorial
      staleness incl. 2× demotion state, listing verification, rolling
      link check ≤30 days with its state in `data/linkcheck.json`,
      suspect-source flag at 3× the registry's `expected_change_days` —
      never the fetch cadence — and vanished feed rows: declared row ids
      absent from the latest snapshot) into
      `data/derived/freshness.json`. Verify: fixtures for each state
      produce the expected freshness records.
- [x] 3.5 Implement the derived queue (`data/derived/queue.json`,
      recomputed each run, ranked, capped at 50, no identity/history) with
      the full specs/pulse enumeration — including refusing sources,
      vanished feed rows, and uninterpreted material changes on
      price/licence/status from the trailing 14 days (the source of
      `interpret` jobs). Verify: fixing a fixture's overdue fact and
      re-running the Pulse removes it from the queue; re-running with no
      state change produces a byte-identical queue; fixtures for a
      refusing source, a vanished row, and an unannotated material change
      each produce a queue item of the right type.
- [x] 3.6 Implement the STOP file check and refusal handling (403/429 →
      recorded refusal, daily retry cap, last snapshot served with visible
      date). Verify: creating `STOP` makes `node pulse/run.mjs` exit
      immediately saying so; a mocked 403 source is marked refusing.
- [x] 3.7 Zero-model verification: run `node pulse/run.mjs` in an
      environment with all model-provider environment variables unset and
      confirm exit 0 through all steps; grep the `pulse/` dependency graph
      for model SDK imports and confirm none. Verify: the command exits 0
      and the import check finds nothing.
- [x] 3.8 Implement launch-feed seeding per specs/pulse: on first ingestion
      of the release/retirement source, its dated historical records seed
      `data/changes.jsonl` marked `seeded: true` with original dates and
      sources; seeding is idempotent. Verify: after the first Pulse run,
      `changes.jsonl` contains seeded entries with real dates; a second
      run appends no duplicates (line count unchanged apart from any
      genuinely observed change).
- [x] 3.9 Implement the publish step per specs/pulse: reads
      `data/config.json`; with `publish: false` it prints one skip line
      and does nothing else; with `publish: true` it commits, pushes,
      then polls the live `/status.json` build stamp for up to 10 minutes
      and writes `HOLD.md` if the stamp does not advance. **Do not execute
      a real push in this change** — verify the false-path live and the
      true-path via `--dry-run`, which must print the exact commands and
      the poll target without executing them. Verify: with
      `publish: false` the skip line appears; `--dry-run` with a temporary
      `publish: true` prints the intended commands and performs no commit
      and no push (confirm `git rev-parse HEAD` is unchanged before and
      after).
- [x] 3.10 Implement mechanical stub minting and lifecycle timeline
      appends per specs/pulse: the registry's `mints` mapping (declared at
      launch only on `openrouter-models`, `kind: model`, slug normalized
      from the row id); on ingest, every row of a minting source whose row
      id no entry declares mints a stub entry file (deterministic id,
      `display_name` from the row, `feeds` binding, standard fact
      bindings, maintenance `living`, all aliases classed `manual`);
      and a diffed **status** change on any declared row appends the
      dated, sourced timeline event to the joined entry's front matter.
      Verify: a fixture snapshot with one undeclared row produces exactly
      one stub with `manual` aliases and a valid schema; a second run
      mints nothing; a non-minting source's new row creates no file; a
      fixture status flip appends exactly one timeline event and a re-run
      appends no duplicate.

## 4. Surfaces (specs/wiki, directory, education-static, education-dynamic, blog, site)

- [x] 4.1 Wiki entry pages: render identity, facts with sources and
      freshness, timeline, prose body when present, "Appears in" rail,
      dormant stamp when classed dormant. Verify: fixture entries of each
      shape render all specified elements.
- [x] 4.2 Directory: model catalog page (filterable client-side from
      pre-rendered data, fetch date visible, missing values rendered
      absent), plus the three standing tables (full catalog,
      deprecations/retirements, changed-in-30-days), each with a stable
      URL and a JSON sibling. Verify: pages render from Pulse data; the
      JSON siblings parse; a missing context window renders as absent not
      guessed; and every listing page states its sort criterion per
      specs/directory (DOM check: the sort-order statement is present on
      each standing table and the tools listing).
- [x] 4.3 Curated tools directory: listing template with
      url/pricing/last_verified and the could-not-verify / discontinued
      markers driven by freshness data. Verify: fixtures for a healthy, an
      unverifiable, and a dead listing render the specified markers.
- [x] 4.4 Learn (static education): ladder index generated from page
      declarations (level, outcome, prerequisites) and page template
      showing all three. Verify: fixture pages produce a correctly ordered
      generated index and render prerequisite links.
- [x] 4.5 Tutorials (dynamic education): page template with build-injected
      verification stamp, staleness banner, moved-on banner (from feed
      data), demotion at 2× interval (noindex + delisted + full-width
      notice + URL still resolves), archived state for dead subjects.
      Verify: fixtures for fresh, stale, moved-on, demoted, and archived
      states each render exactly the specified treatment.
- [x] 4.6 Blog: post template with visible date, appended-correction
      support, feeds inclusion, and the over-ceiling build warning from
      specs/blog (more than 3 published posts dated within any trailing 7
      days → named warning, not a failure). Verify: fixture post with a
      correction block renders both the original text treatment and the
      dated correction; a fixture set of 4 posts dated within 7 days
      produces the warning naming the dates.
- [x] 4.7 Home page: changed feed from `data/changes.jsonl` (dated lines
      linking entries and sources — populated at launch by the 3.8
      seeding, and rendering an `interpret` annotation line alongside its
      change when one exists, per specs/loop), recent deprecations strip,
      latest post and tutorial, doors to all five surfaces and the
      showpiece; content above the fold at 1440×900 and 390×844 (no
      full-viewport hero). Verify: build renders the feed with the seeded
      history present (not an empty feed); a fixture annotation line
      renders with its change; a screenshot or DOM check confirms content
      above the fold at both sizes.
- [x] 4.8 Colophon: one page, out of primary nav, stating what the site is
      and that an AI writes and maintains it under review, linking the
      public commit history. Verify: the page exists, is ≤1 page, and no
      primary-nav link points to it.
- [x] 4.9 Citable assets: RSS/Atom for blog, tutorials, and the changed
      feed; sitemap; generic Open Graph tags (no social handles); the open
      dataset (entries, facts, timelines, catalog, deprecations) as JSON +
      CSV at a stable URL with CC BY 4.0 stated inside the payload.
      Verify: each generated feed parses cleanly with the `rss-parser`
      npm package (devDependency) and exposes a title, items, and valid
      item dates; the dataset downloads, parses, and contains the license
      string.
- [x] 4.10 Third-party origin allowlist enforcement: build fails if any
      rendered page references a network origin other than the site itself
      and Google Analytics. Verify: a fixture page with a stray CDN script
      fails the build naming page and origin.
- [x] 4.11 Design pass to the specs/site bar: typographic identity (max 2
      typefaces), dark/light themes, data-dense tables, fast static loads.
      Verify: WCAG AA contrast on both themes via automated check
      (axe-core or equivalent) with zero violations on home, one entry,
      one table page; no horizontal scroll at 320px on those pages;
      first-load JS ≤ 150 KB gzipped on those three pages, with the
      measured values recorded in `data/launch.json` under `js_payload`;
      and a scripted keyboard-only traversal (Playwright: Tab/Enter) that
      reaches and activates the nav links, the search box, and the theme
      toggle on those three pages — every interactive element reachable
      without a mouse per specs/site.
- [x] 4.12 Client-side name search per specs/site: build emits
      `data/derived/search-index.json` (id, display name, aliases, kind,
      status, title — every page including stubs); a search box filters it
      in-browser with no server or external service. Verify: typing a stub
      fixture's alias surfaces the stub's page in results; the index file
      regenerates on build.
- [x] 4.13 Build stamp per specs/site: UTC timestamp + short commit hash
      rendered in the footer and served at `/status.json`. Verify: two
      builds from two different commits produce different stamps in both
      places.
- [x] 4.14 The Impossible → Routine showpiece per specs/site: delta record
      schema (capability, end A date+source, end B date+source, optional
      metric), rendered as a dated, newest-first progression with each
      end's source one click away; schema validation fails the build on an
      unsourced end. Verify: fixtures render as specified; a fixture delta
      missing end B's source fails the build naming the file.

## 5. Analytics (specs/analytics)

- [x] 5.1 Implement the GA4 component: gtag loader emitted on every page
      when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, nothing emitted when
      unset, **and a route-change tracker** (client component watching the
      pathname) that fires `page_view` with the new path and title on
      every client-side navigation. Load the variable through the
      framework's `.env.local` support; never print the file or the
      variable. Verify: build with the variable set contains the loader on
      every sampled page and the tracker component; build with it unset
      contains no analytics markup.
- [x] 5.2 Implement `scripts/verify-analytics.mjs` per specs/analytics
      (Playwright; load home + one content page directly, assert **exactly
      one** `page_view` collect request per direct load — zero is the
      dead-tag failure, two is the gtag-plus-tracker double-fire — with
      matching `tid` and 2xx per page; **then click an internal link from
      home without a full reload and assert a further collect request
      carrying the new path**; print one evidence line per assertion; also
      print any Content-Security-Policy header observed and fail if one
      exists that omits the GA origins; exit nonzero on any failure).
      Verify: against a local exported build (`npm run build` then
      `node scripts/serve-static.mjs out 3000` — `next start` does not run
      under `output: 'export'`), the script exits 0 including the
      click-through assertion; with the route-change tracker temporarily
      disabled, it exits nonzero naming the click-through assertion (then
      re-enable).
- [x] 5.3 Record the local verification result (date, pages tested, pass)
      in `data/launch.json` under `analytics_local`. Verify: the file
      exists with the recorded result.

## 6. Seed content — real entries, through review (specs/editorial, specs/review, design D9)

- [x] 6.1 Write 40 wiki entries (mix per design D9: frontier model
      families, major labs and orgs, key tools, 6–8 post-2023
      concepts/techniques, plus history/culture/argument entries from D9's
      candidate list), each schema-valid with sourced facts; at least 12
      carry prose bodies, of which **at least 3 are history/culture/
      argument entries** (front-matter `themes:` containing `history`,
      `culture`, or `argument`) — the owner asked for the whole field, not
      a price sheet. Volatile model facts bind to feed data where the
      feeds carry them. Verify now (without depending on the 6.6 script,
      which is written later): `npm run build` exits 0 with no schema
      errors, and a Glob count of `content/wiki/**/*.md` shows ≥40 files
      with ≥12 containing prose bodies; the full automated floor check
      runs in 6.6.
- [x] 6.2 Write 4 static education pages covering design D9's ladder tops,
      each with level/outcome/prerequisites and zero perishable literals.
      Verify: build passes with no currency-literal warnings on these
      pages.
- [x] 6.3 Write 2 tutorials from design D9's named credential-free
      candidates — (a) in-browser inference with transformers.js (npm +
      ~25 MB model, no keys, no installs beyond npm), (b) a model-price
      tracker against the OpenRouter public models endpoint (public JSON,
      no key) — whose steps are actually executed in this environment
      during authoring (capture the outputs shown), with full perishable
      declarations. If a candidate proves unexecutable, substitute another
      credential-free small-footprint subject and record why in the final
      report; never hunt for credentials and never install software.
      Verify: each tutorial's front matter is complete and its
      `verified_on` is the authoring date; the shown outputs come from
      real runs (transcripts kept under `data/reviews/evidence/`).
- [x] 6.4 Write 2 blog posts per design D9: candidate 1 documents the
      reference-rot phenomenon from facts checked live at authoring time
      (read the Aider leaderboard's own banner date today; observe where
      paperswithcode.com actually redirects today; substitute other live
      instances if these leads have healed) — no fact enters a post on
      the authority of this change's design inputs alone; candidate 2 is
      the dated-delta piece whose acceptance test is the dated-delta
      demonstration with receipts (every date sourced from the launch
      data), not topic coverage. Verify: each claim in each post carries
      a working source link; the reviewer in 6.5 re-fetches them.
- [x] 6.5 Run every seed prose piece (entry bodies, education pages,
      tutorials, posts, deltas) through the review flow as its first live
      exercise: separate reviewer invocation with fresh context, the
      specs/review checklist for its kind, verdict + reasons + the
      required non-empty `would-cite` field recorded in
      `data/reviews/seed-<slug>.md`. Revise-once/discard rules apply — a
      seed piece that fails twice is replaced, not forced through.
      Verify: every published seed prose file has a recorded `approve`
      verdict whose `would-cite` field is non-empty and specific to the
      piece; the file count matches.
- [x] 6.6 Write `scripts/verify-launch.mjs`: prints and checks the launch
      minimums (≥40 entries, ≥12 bodies of which ≥3 carry a
      history/culture/argument theme, 4 learn pages, 2 tutorials, 2
      posts, ≥12 deltas, ≥20 curated tools each linking a resolvable wiki
      entry, catalog rows > 0, seeded changed-feed non-empty, search index
      present, all reviews recorded with non-empty `would-cite`, build
      passing). Verify: the script exits 0 and its printed counts match
      reality when spot-checked by hand.
- [x] 6.7 Curate 20 tool listings (fresh research, not mined from the old
      tree), each with a live-verified URL, `last_verified` set, and a
      link to a wiki entry per specs/directory — creating a stub entry for
      any listed tool not already among the 40 (stubs are data-only and
      cheap; they count toward the entry total). Verify: verify-launch
      reports ≥20 with every listing's entry link resolving, and the
      Pulse's link check passes them.
- [x] 6.8 Curate ≥12 Impossible → Routine deltas (widened from 8 per
      review — launch stock is the cheapest place to buy the reaction
      while build-phase abundance lasts) — each end dated and sourced live
      at authoring time (research-result end and commodity end), reviewed
      like any prose per 6.5. Verify: verify-launch reports ≥12 deltas;
      every end's source URL resolves in the Pulse's link check; each has
      an `approve` verdict recorded.

## 7. The Desk and portability (specs/loop, specs/review)

- [x] 7.1 Create `runners.yml` with at least two entries (the current
      Claude Code setup as default `author`+`reviewer`, and one non-Claude
      combination such as OpenCode+DeepSeek, marked unverified until
      conformance passes), each carrying the full schema from specs/loop —
      id, `provider` (the lane key), tier, command template, roles,
      optional `capacity_stderr_pattern` — plus `DIRECTIVES.md` (empty,
      with a one-line header explaining its role and the
      `[done <date> <job-id>]` completion marker). Verify: files exist; `runners.yml`
      parses; and within the machinery paths only (`loop/`, `pulse/`,
      `scripts/`, `data/config.json`) no file names a specific model,
      provider, or harness outside `runners.yml` (grep those paths for
      the registered runner names) — the content corpus names models
      constantly because models are the site's subject, so content paths
      are out of scope for this check.
- [x] 7.2 Implement `loop/run.mjs`: first resume the oldest resumable
      `job/*` branch per specs/loop (last ledger line `interrupted` or
      `capacity`, lane not paused, under 14 days old — re-invoke with the
      branch's committed `.job/brief.md` plus the fixed continue
      preamble; discard older branches with an `abandoned` ledger line);
      otherwise select one job (directives first — skipping any directive
      carrying a `[done ...]` marker, and appending that marker to a
      directive's line when its job completes — then the derived queue,
      then ripe proposals from `data/proposals/` with exact-slug duplicate
      suppression against `data/proposals/rejected/`), assign the job id
      (`j-<yyyymmdd>-<seq>`), create branch `job/<id>`, commit the
      assembled self-contained brief to it as `.job/brief.md` (task,
      acceptance checks, relevant spec excerpts, ground rules, and the
      instruction to end by writing `RESULT.md` per the executor result
      protocol), invoke the runner's command template under the job
      type's wall-clock cap from `data/config.json`, read `RESULT.md`'s
      first line for status (`done` / `blocked: <reason>` / `capacity`;
      absent or malformed after exit/kill → `interrupted`), honor a
      runner's optional `capacity_stderr_pattern`, compute the diff
      itself, run schema/build checks, require a recorded review verdict
      before merging, on merge invoke the shared publish step from 3.9
      (which prints its skip line while `publish` is false), and write the
      ledger line (id, type, runner, provider, tier, MM, outcome) to
      `data/ledger.jsonl`. Verify: a dry-run mode prints the selected (or
      resumed) job and assembled brief without invoking anything, the
      brief text contains the RESULT.md instruction, the branch name
      embeds the job id, and the ledger line schema includes provider.
- [x] 7.3 Implement budget enforcement from the rolling 30-day ledger
      (per-tier shares; ceilings AND the upkeep floor's own enforcement
      per specs/loop) and outcome classification. Verify: unit tests with
      synthetic ledgers show the selector refusing new-writing at the
      ceiling, machinery at 10%, and offering only upkeep when the floor
      is unmet; outcome classification is tested with mock executors that
      really write, malform, or omit `RESULT.md` (done / blocked /
      capacity / interrupted each observed from the file system, not from
      synthetic status values); resumption is tested with a real mock
      branch — a `job/*` branch with a committed `.job/brief.md` and an
      `interrupted` ledger line is picked up before any new selection,
      with no retry consumed, and a 15-day-old mock branch is discarded
      with an `abandoned` line; lane pausing is tested with a synthetic
      ledger — a lane whose latest line is `capacity` is paused for the
      backoff interval (1h, doubling per consecutive capacity line, 6h
      max), computed from ledger lines plus clock arithmetic with no
      pause file, and a success line resets the sequence; and a fixture
      `DIRECTIVES.md` shows a `[done ...]`-marked directive skipped while
      an unmarked one is selected.
- [x] 7.4 Implement the review step: reviewer invocation from
      `runners.yml` (`reviewer` role), fresh context, diff + checklist in,
      verdict file out (`data/reviews/<job-id>.md` — same directory as the
      seed reviews, which use `seed-<slug>.md`) with verdict + reasons
      from the closed list **and the required non-empty `would-cite` field
      for prose**; merge refuses without an `approve`, and refuses an
      `approve` whose `would-cite` field is empty; any tree changes made
      by the reviewer invocation are discarded; for a proposal-originated
      job, the reviewer brief includes the rejection index (the slugs and
      reasons from `data/proposals/rejected/`) per specs/review; the
      revise-once/discard-on-second mechanics. Verify: a test job with a
      planted `false-or-unsupported-claim` is rejected and, after a second
      failure, discarded with the record kept; a mock `approve` with a
      blank `would-cite` is refused by the merge step, and so is a mock
      `approve` whose `would-cite` text exactly duplicates (after
      whitespace trimming) the field of an existing review record; a mock
      reviewer that edits the tree has its edits discarded (the diff is
      empty after the review step); and a mock proposal-originated job's
      reviewer brief contains the rejection index.
- [x] 7.5 Implement breakers and holds per specs/loop (three consecutive
      same-type failures — counting only `failed` and `discarded`
      outcomes, never `blocked`/`interrupted`/`capacity`/`abandoned`;
      build/deploy red; review bypass attempt; reserved-path edit attempt
      → write `HOLD.md` and stop; `STOP` honored at run start). Verify:
      each breaker is unit-tested to write `HOLD.md` with its reason; a
      synthetic ledger with two `failed` and one `blocked` of the same
      type does NOT trip breaker 1, while three `failed`/`discarded` do;
      the loop refuses to start while `STOP` or `HOLD.md` exists.
- [x] 7.6 Implement `loop/conformance.mjs` with the four canned checks
      (trivial edit; insufficient-information → blocked; fabricated-quote
      trap; reserved-path probe), each PASS condition defined in terms of
      the executor result protocol per specs/loop — a check completed
      without a well-formed `RESULT.md` FAILs regardless of the diff —
      each printing PASS/FAIL with evidence, and the recorded result
      gating selection: `loop/run.mjs` refuses a runner with any recorded
      conformance FAIL for `author` or `reviewer` roles. Verify: running
      it against the default runner prints four PASS lines; a
      deliberately-sabotaged mock runner (wrong diff, missing RESULT.md,
      fabricated quote) produces the expected FAILs including the
      protocol FAIL; and `loop/run.mjs` refuses to select the FAILed mock
      runner, naming the failed check.
- [ ] 7.7 Run one real job end-to-end through the Desk (a small `repair`
      or `interpret` job from the derived queue; if the queue happens to
      be empty at this point, plant a seeded-state fixture — e.g. set one
      curated listing's `last_verified` past its interval — so a real
      queue item exists, and note the planting in the ledger line): brief
      → executor → review → merge, ledger line written. Verify: the merged
      commit exists, the ledger line names the runner, provider, and MM,
      the review verdict file exists with a non-empty `would-cite` field
      if prose was touched, and the run log shows the publish step's
      skip line (publish is false throughout this change).
- [x] 7.8 Implement the surface and degradation selector rules the specs
      assert — each a real selector behavior with its own synthetic-state
      test in 7.3's style:
      (a) blog ceiling per specs/blog: a `post` job is refused while 3
      published posts carry dates within the trailing 7 days — test with
      a fixture content set of 3 recent posts (refused) and 2 (allowed);
      (b) tutorial upkeep priority and the demotion gate per
      specs/education-dynamic: when a tutorial re-`verify` item and a new
      `tutorial` job compete in the same tier, `verify` wins; and a
      `tutorial` job is refused entirely while any tutorial stands
      demoted for staleness (dead-subject archived tutorials do not
      block) — test both branches with fixture freshness states;
      (c) proposal duplicate suppression and cooling per specs/loop: a
      proposal whose `slug` matches one in `data/proposals/rejected/` is
      auto-discarded with a pointer to the earlier reason before any model
      is invoked, and a proposal younger than 3 days is not selectable
      while a 4-day-old one is — test with fixture proposals;
      (d) capacity degradation per specs/loop: shed level from `capacity`
      classifications in the tier's trailing-48h ledger (1 → no
      `post`/`education`; 2 → also no `entry`/`tutorial`; 3+ → only
      `verify`/`repair`/material-`interpret`) — test each level with a
      synthetic ledger.
      Verify: `npm test` runs all four rule groups and each refusal names
      its rule in the selector's output.

## 8. Documentation and change hygiene

- [x] 8.1 Add the "Operating the site" section to `AGENTS.md`
      (harness-neutral: starting the Pulse and a Desk run, where specs
      live, the review flow, the swap procedure with its verification, the
      STOP/HOLD semantics), leaving the no-push hard rule block untouched.
      Mirror only Claude-Code specifics into `CLAUDE.md`. Verify: both
      files render the new sections; the hard-rule block is byte-identical
      to before (git diff shows no change inside it).
- [x] 8.2 Update `CLAUDE.md`'s Build & Test / Architecture placeholder
      sections with the real commands (`npm run build`, `npm test`,
      `node pulse/run.mjs`, `node loop/run.mjs`) and a five-line
      architecture summary pointing at the specs. Verify: sections no
      longer read "Not yet established".
- [x] 8.3 Run `openspec validate --change build-initial-site --strict` and
      fix anything it reports. Verify: validation exits clean.
      (The installed OpenSpec is 1.11.0, whose `validate` takes the item as a
      positional argument and has no `--change` flag; the invocation that runs
      is `openspec validate build-initial-site --type change --strict`.
      It reported nothing to fix: "Change 'build-initial-site' is valid",
      exit 0.)
- [x] 8.4 Final integrated verification, in order: `npm test` (all
      fixtures), `npm run build` (clean), `node pulse/run.mjs` (exit 0,
      no model env), `node scripts/verify-launch.mjs` (exit 0),
      `scripts/verify-analytics.mjs` against the exported build served by
      `scripts/serve-static.mjs`
      (exit 0). Verify: all five exit 0 in a single fresh session, and
      the results are recorded in `data/launch.json` under
      `build_verification`.
- [x] 8.5 Commit everything locally with clear messages. Verify:
      `git status` clean; `git log` shows the work; **nothing pushed** —
      unpushed local commits are the correct end state of this change.

## 9. Launch checklist — MAINTAINER-GATED (do not perform; blocked until the no-push rule is lifted)

- [ ] 9.1 MAINTAINER: lift the no-push hard rule in `CLAUDE.md` and
      `AGENTS.md`, and set `publish: true` in `data/config.json` (this
      arms the Pulse's and the loop's publish step). Verify: the blocks
      are removed or amended by the maintainer's own edit, and
      `data/config.json` reads `publish: true`.
- [ ] 9.2 MAINTAINER (or agent, once 9.1 is done): `git push`; watch the
      Vercel deployment; verify `https://www.addictedtoai.net/` serves the
      new site (positive string match on the home page via `curl -sL`,
      and `/status.json` returns the just-pushed commit's build stamp).
- [ ] 9.3 Run `node scripts/verify-analytics.mjs
      https://www.addictedtoai.net` — exit 0 with evidence lines,
      including the click-through assertion.
- [ ] 9.4 MAINTAINER: GA4 Realtime confirmation per specs/analytics (open
      property → Reports → Realtime, visit the site and click through to
      a second page, see ≥1 active user and both page_views within 5
      minutes); record the pass date in `data/launch.json` under
      `analytics_realtime`.
- [ ] 9.5 MAINTAINER: schedule the Pulse 4×/day via the OS scheduler
      running `node pulse/run.mjs`. Verify **by observing the live site
      change, not by runs completing**: after two consecutive scheduled
      runs, fetch `https://www.addictedtoai.net/status.json` following
      each run and confirm the two build stamps differ (and, on any day
      the world changed, that a new dated line appears in the live changed
      feed). Two runs whose stamps are identical mean publishing is
      broken — investigate before calling launch done, whatever the run
      logs say.
- [ ] 9.6 Record the launch date in `data/launch.json`; sync the delta
      specs to `openspec/specs/` (archive the change per the OpenSpec
      workflow) so the constitution is in its permanent home. Verify:
      `openspec/specs/` contains the eleven capabilities and the change is
      archived.
