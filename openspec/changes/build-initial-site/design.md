# Design — build-initial-site

## Context

See `proposal.md` for motivation and the capability list; see
`specs/*/spec.md` for the operating rules themselves. This document decides
how to implement them.

Constraints that shape everything here:

- **The tree is empty.** Only tooling exists (`openspec/`, `.beads/`,
  harness dirs, `CLAUDE.md`, `AGENTS.md`, `.env.local`, `.gitignore`,
  `.vercel/project.json`). The old site is reachable in git history and is
  deliberately **off-limits**: no file, data, or prose is mined from it.
  The directory surface is "carried forward" as a surface concept, rebuilt
  from fresh feeds and fresh curation.
- **Nothing is pushed** during this change (hard rule in `CLAUDE.md`). Every
  deploy-dependent verification is split into a local form (now) and a
  launch-checklist form (maintainer-gated).
- **Two phases.** The build may use anything available now (Claude Code,
  subagents, a Max account). The operating phase must run on ~$20/month
  Claude Pro + ~$10/month OpenCode Go (possibly + $20/month OpenAI) with any
  model/provider/harness. Nothing the operating phase depends on may assume
  build-phase abundance.
- **The implementer may be a weaker model.** Tasks name commands and
  expected outputs; this design prefers boring, heavily-documented choices
  over clever ones.

## Goals / Non-Goals

**Goals:**

- A deployable static site with the five surfaces populated with real,
  review-passed entries.
- The Pulse running end-to-end locally (fetch → diff → data → build) with
  zero model access.
- The Desk runnable end-to-end for one job (brief → executor → review →
  merge) with the runner chosen from `runners.yml`.
- Analytics verified by behavior against a local production build.
- The specs in `openspec/specs/` as the durable constitution.

**Non-Goals:**

- No governance/provenance apparatus beyond the one colophon page.
- No accounts, comments, newsletter, search-server, or any dynamic backend.
- No visitor-facing inference of any kind.
- No scheduled/cloud automation of the Pulse yet (the maintainer starts
  runs; scheduling is a launch-checklist item using the OS scheduler).
- No social distribution machinery of any kind, ever (settled input).
- No mining of the previous site.

## Decisions

### D1. Stack: Next.js (App Router), static output, content as files

**Choice.** Next.js 15, App Router, `output: 'export'`-style fully static
generation (every route statically generated at build; no server runtime
required). Content lives as files:

```
content/
  wiki/<kind>/<slug>.md        entry: YAML front matter + optional prose body
  learn/<slug>.md              static education pages
  tutorials/<slug>.md          dynamic education pages
  blog/<slug>.md               posts
  directory/tools/<slug>.md    curated tool listings
data/
  sources/<source-id>/latest.json      newest snapshot per source
  sources/<source-id>/previous.json    prior snapshot (diff base)
  changes.jsonl                append-only dated diff history (small, one
                               JSON object per detected change)
  derived/                     generated: catalog rows, freshness, queue,
                               wants, backlinks, alias registry
  analytics/summary.json       maintainer-supplied aggregate (absent = fine)
```

**Why.** Vercel-native (the project and domain already exist there); the
most widely known React/SSG stack, which matters when a weak model
implements and a different weak model maintains; static output keeps the
no-visitor-inference and zero-runtime-cost rules structural. Front matter +
Markdown is readable by a non-programmer and by every harness.

**Alternatives.** *Astro* — arguably better for content sites, but less
training-data coverage and it adds a second mental model (islands) for no
needed capability. *Plain SSG script* — maximum control, but hand-rolling
routing/feeds/sitemaps is exactly where a weak implementer botches details.
Next.js is the boring choice; boring is the point.

### D2. The Pulse and the Desk are separate programs (the spine)

**Choice.** Two entry points, no shared scheduler:

- `pulse/run.mjs` — deterministic; no model imports anywhere in its
  dependency graph; runnable by an OS scheduler; performs the pipeline in
  `specs/pulse`.
- `loop/run.mjs` — the Desk; reads `runners.yml`, `DIRECTIVES.md`, the
  derived queue, and the budget ledger; assembles one job at a time.

**Why.** The site's liveness must not be hostage to inference availability
(the operating budget is bursty consumer allowances). The front page
changing daily on zero inference is the property the whole economics rests
on. This is the intended spine from the design inputs, adopted deliberately.

**Alternative.** One loop with cheap/expensive lanes — rejected: collapsing
deterministic maintenance and model work into one queue is how the previous
version starved the site to feed the machinery.

### D3. The work queue is derived state, never a ledger

**Choice.** `data/derived/queue.json` is recomputed from current site state
on every Pulse run (overdue facts, overdue tutorials, failed listings,
broken links, demand-eligible wants, suspect sources), ranked, capped at 50
entries. It has no identity, no history, no "closing".

**Why.** The previous site died of tracked work accumulating faster than it
closed — the backlog wrecked the scheduler. A recomputed snapshot cannot
backlog: fix the state and the item vanishes; ignore it and the queue is the
same size tomorrow, not bigger. Beads stays the tracker for judgment-shaped
work (bugs, ideas) at human-filed volume; OpenSpec stays the constitution.
Three stores, three shapes of thing, no mirroring.

**Alternative.** Beads issues per finding — rejected: hundreds of
machine-filed issues recreate the docket that killed version one.

### D4. Publication flow is plain git, no PR machinery

**Choice.** Operating phase: a job runs on a branch in the working repo;
review happens on the branch's diff; the loop merges to `main` locally;
deploy = push (which Vercel builds). No pull requests, no GitHub API, no
`gh` dependency.

**Why.** Portability. Requiring `gh`/PRs binds the loop to GitHub tooling
and re-creates the three-git-identities/approval-classifier swamp the
previous site fought for weeks. Plain `git` is available to every harness
and every executor. Review independence comes from the reviewer invocation,
not from PR ceremony.

**Trade-off.** No branch-protection backstop; the guarantee that unreviewed
work cannot merge lives in the loop's merge step (which refuses without a
recorded verdict) and in the review spec's breaker. Accepted: the previous
site proved server-side gates get gamed around anyway, at enormous cost.

### D5. Cost unit: model-minutes per tier, measured by the loop

**Choice.** The loop timestamps executor invocation and return; the delta in
minutes is recorded per tier in `data/derived/ledger.jsonl` (one line per
job: id, type, runner, tier, MM, outcome). Budgets in `specs/loop` are
enforced by the selector reading the rolling 30-day ledger.

**Why.** Tokens are invisible across consumer subscriptions; "rounds" ranged
200K–9M tokens; wall-clock per tier is the one thing the orchestrator can
always measure and the maintainer can always read. Its known weakness (a
stalled fetch inflates minutes) is acceptable at this scale and visible in
the ledger.

### D6. Wiki mechanics: transclusion syntax, alias registry, linker

- **Transclusion syntax**: `{{fact:<kind>/<slug>#<field>}}` in Markdown,
  resolved at build; unresolved → build error. Chosen for grep-ability and
  for being inert in any other Markdown renderer.
- **Mentions**: front-matter list `mentions: [model/foo, tool/bar]`;
  backlinks computed into `data/derived/backlinks.json` at build.
- **Alias registry**: derived at build from entry front matter into
  `data/derived/aliases.json`; collision of `exclusive` aliases fails the
  build with both ids named.
- **Linker**: a remark/rehype-stage transform implementing the five rules in
  `specs/wiki`, with the fixture tests required there living in
  `pulse/tests/linker.test.mjs` and run by `npm test` and by the build.
- **Wants**: computed at build by scanning prose for registered
  "wanted-name" patterns is deliberately NOT attempted (fuzzy matching =
  guessing). Instead, authors record a want explicitly with
  `{{want:Name}}` (renders as plain text, increments the counter). Zero
  false positives; a missing want costs nothing.

### D7. Feeds at launch: two sources, small on purpose

`data/sources/` starts with exactly two registered sources:

1. `openrouter-models` — `https://openrouter.ai/api/v1/models` (public JSON:
   pricing, context length, created; verified live 2026-08-27 by the design
   inputs — re-verify during implementation).
2. `llm-releases` — `https://llm-releases.com` (releases plus first-class
   retirements/deprecations; same caveat).

Each entry in the registry records its robots/terms check result and date.
More sources (HuggingFace API, Ollama library, GitHub repos, killedbyai)
are ordinary data additions during operation — the registry is designed for
growth, the launch set is designed to be verifiable in one sitting.

### D8. Analytics verification: Playwright against a local prod build

`scripts/verify-analytics.mjs` uses Playwright (devDependency) to load
pages, capture requests matching `/g/collect`, and assert tid + 2xx per
`specs/analytics`. It runs against `npx next start` serving the production
build with `NEXT_PUBLIC_GA_MEASUREMENT_ID` set from `.env.local` (loaded as
environment, never printed). GA4 accepts hits from any origin, so local
verification is real delivery verification; the launch checklist adds the
GA4 Realtime confirmation with the maintainer's eyes on the live property.

**Why Playwright over Puppeteer:** first-class request interception and a
maintained Windows story; either would do.

### D9. Seed content: counts, and everything passes its own machinery

Day-one content (the "real entries" the mandate requires), all of it run
through the review flow as review's first live exercise:

| Surface | Minimum | Notes |
|---|---|---|
| Wiki | 40 entries total; ≥ 12 with review-passed prose bodies | Prose-first picks: the current frontier model families, major labs, 6–8 post-2023 concepts/techniques where canonical sources are stale (per the education scout: RLHF/DPO, quantization, KV-cache, MCP, context windows, speculative decoding) |
| Education (static) | 4 pages | Top of the ladder: orientation; how an LLM actually works; how models are trained/adapted; how inference is served and priced |
| Education (dynamic) | 2 tutorials | Must be executable in this environment so verification is real (e.g., local models via Ollama; an OpenRouter-API quickstart) |
| Blog | 2 posts | Candidate 1: the field's own references are rotting (Aider banner, Papers-with-Code redirect — re-verify every fact live before writing). Candidate 2: what the launch dataset shows (e.g., retirement velocity). Both must clear the editorial bar or be replaced |
| Directory | Catalog from feeds (whatever the sources yield, expected 200+ rows) + 20 curated tool listings + the three standing tables | Curated picks favor what enthusiasts actually run (coding agents, local runners, image/video tools) |

Counts are minimums for launch, not quotas afterward; after launch the blog
has no floor at all (`specs/blog`).

### D10. Visual identity: designed once, in the build, to a stated bar

The build includes a deliberate design pass (typography, color system,
dark/light, density) meeting `specs/site`. Implementation guidance: system
of 2 typefaces max, data-dense tables as a first-class visual element, the
changed-feed as the hero. The bar is verifiable by the checks named in
tasks (axe-core pass, no horizontal scroll at 320px, content above the fold
at 1440×900 and 390×844). Taste beyond the checks is exercised in review.

### D11. Operating-phase instructions live in AGENTS.md

At the end of the build, `AGENTS.md` gains an "Operating the site" section
(how to start the Pulse and a Desk run, where the specs live, the review
flow, the swap procedure) — written harness-neutrally. `CLAUDE.md` keeps
only Claude-Code-specific mirrors plus the working rules. The no-push hard
rule stays in both files verbatim until the maintainer personally removes
it at launch; nothing in this change touches that block except to note the
launch checklist exists.

### D12. What was considered and cut

- **Person entries** — cut (collision + defamation risk; `specs/wiki`).
- **Auto-created wants from fuzzy mention scanning** — cut (guessing).
- **A hand-maintained coverage map** — cut (a second territory copy that
  rots; demand ranking replaces it).
- **PR-based review gates** — cut (D4).
- **Numeric quality scores** — cut (`specs/review`; scores become targets).
- **Newsletter/accounts/comments** — cut (personal data + moderation with
  no operator).
- **Embeddings/vector search** — cut (second inference dependency; alias
  registry + backlinks suffice at this scale).
- **Dead-man alarms, seeded-defect schedulers, canary batteries** — cut
  from v1 as apparatus; the four breakers in `specs/loop` plus the linker
  and build fixtures are the safety floor. Revisit only with evidence.

## Risks / Trade-offs

- [Feed sources close or change shape] → Refusals are recorded as data
  (`specs/pulse`); the site serves last-known values with visible dates;
  adding replacement sources is an ordinary data change. The dependency on
  other people's free endpoints is real and cannot be removed.
- [The changed feed is noise (too many immaterial diffs)] → The Pulse's
  diff-to-feed filter starts strict (price, context, status, arrivals,
  retirements only); widening it is a data change. If still noisy, tighten
  the filter — never add a model to the Pulse.
- [Local merges without server-side gates let a misbehaving run publish] →
  The merge step refuses without a recorded review verdict; the breaker
  halts on any bypass attempt; the maintainer can revert any commit. The
  worst case is one revert — accepted for the portability it buys.
- [MM budgets mis-track real allowance burn] → The ledger records
  interruptions; if interrupted jobs exceed ~15% of starts, re-size job
  caps (a data change). The unit is imperfect by design and visible.
- [Seed tutorials cannot be executed in this environment] → Choose subjects
  executable locally (D9); a tutorial whose steps cannot be run here is
  disqualified as a seed pick by `specs/education-dynamic`.
- [The site is true, current, connected — and dull] → No internal metric
  can catch this; the editorial bar and review's `not-worth-reading`
  standing are the defense, and the analytics signal accumulates toward an
  external answer. Named honestly as the design's residual risk.
- [GA collect requests blocked by the verifying machine (adblock/DNS)] →
  The verification script fails loudly either way; run on a clean profile;
  the launch Realtime check is the final authority.

## Migration Plan

Build order (task phases mirror this): repository skeleton → content model
and build → wiki substrate + linker → Pulse → surfaces → analytics → seed
content (through review) → Desk + portability → docs. Nothing deploys
during the change.

**Launch (maintainer-gated, after this change lands):**

1. Maintainer lifts the no-push rule (edits `CLAUDE.md`/`AGENTS.md`).
2. `git push` → Vercel builds → verify `https://www.addictedtoai.net/`
   serves the new site.
3. Run `node scripts/verify-analytics.mjs https://www.addictedtoai.net` —
   all assertions pass.
4. Maintainer GA4 Realtime confirmation per `specs/analytics`.
5. Maintainer schedules the Pulse (OS scheduler, 4×/day,
   `node pulse/run.mjs`).
6. Record the launch date and the Realtime confirmation in the launch
   record (`data/launch.json`).

**Rollback:** any bad deploy is one `git revert` + push; Vercel redeploys
the previous state. No data store exists outside the repo.

## Open Questions

Safely deferrable — none of these change the specs, the approach, or the
task breakdown:

- Which additional feed sources join the registry after launch (HuggingFace,
  Ollama library, GitHub release watching) and in what order.
- Whether the Pulse eventually runs on a scheduler beyond the local machine
  (e.g., GitHub Actions) — a launch-later operational choice with known
  credential-scope pitfalls to check first.
- Whether a second model family is registered for review once operating
  budgets settle.
- The exact shape of `data/analytics/summary.json` once the maintainer's
  first export exists (the loop tolerates absence indefinitely).
