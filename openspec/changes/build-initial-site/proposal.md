# Proposal: build-initial-site

## Why

AddictedtoAI is being rebuilt from an empty tree. The previous version died of
machinery: a governance apparatus grew roughly seven lines of process for every
line of site, a tracked backlog wrecked its own scheduling system, and almost
nothing a visitor could read got built. This founding change replaces that with
two deliverables, different in kind:

1. **The operating rules** — the durable specs the site runs under afterward:
   what each surface is, how the wiki substrate binds them together, what the
   loop may and may not do, the editorial bar every piece must clear, and the
   mandatory review that stands between any model-written work and publication.
2. **The initial build** — the machinery, the five required surfaces, and real
   entries in them, deployable to Vercel, with Google Analytics verified as
   actually receiving events (not merely rendering a script tag — the previous
   site passed that test and failed the real one for months).

After this change lands, routine content production — wiki entries, blog
posts, tutorial re-verification, directory refreshes — **never** touches
`openspec/`. An OpenSpec change is required only to change the rules.

## What Changes

- **The wiki substrate** is created: typed, sourced, dated entries that every
  other surface references rather than restates. Correcting a fact in one
  place corrects it everywhere it appears. Linking is deterministic and
  wrap-only; a wrong link is structurally impossible.
- **Five visitor surfaces** ship with real entries from day one: static
  education, dynamic education (tutorials with visible verification state),
  blog, directory (feed-fed model catalog with standing tables for prices,
  context windows, deprecations and retirements, plus curated tools), and the
  wiki itself.
- **The home page** is a "what changed" view derived from the wiki's data
  layer — it changes daily at zero inference cost.
- **The Pulse** is created: a deterministic, model-free engine (fetch, hash,
  diff, link-check, freshness, rebuild) on a schedule. The site stays alive in
  a week where no inference runs at all.
- **The Desk** is created: the budgeted, portable agentic loop that produces
  and maintains content under the specs, startable with any model, any
  provider, any harness, by an ordinary command.
- **Editorial standard and mandatory review** are specified as operating
  rules: a reviewer has explicit standing to reject work as dull, derivative,
  or not worth a reader's time — not only as factually wrong — and no run
  reviews its own output.
- **Google Analytics** ships wired and verified end-to-end: an automated check
  proves collection requests are accepted, and a named maintainer step
  confirms events appear in GA4 Realtime at launch.
- **Citable assets** ship: RSS/Atom feeds, sitemap, and the structured layer
  published as an open CSV/JSON dataset. No social accounts, no outward
  posting by the system, ever.

## Capabilities

### New Capabilities

- `wiki`: the substrate — entry schema, sourced facts, aliases, tiers and
  maintenance classes, the growth rule (mentions never create obligations),
  transclusion, the mentions metadata layer, and the wrap-only alias linker.
- `education-static`: evergreen explainers, basics through advanced, built not
  to rot — perishable specifics live in the wiki, never inline.
- `education-dynamic`: tutorials that track the frontier, each carrying a
  declared perishable surface and a visible verification state; exactly what a
  reader sees when a tutorial's subject has moved on.
- `blog`: dated stories about the technologies, methods, models and companies
  advancing the field; never silently rewritten; titles may not outclaim
  bodies.
- `directory`: the feed-fed model catalog (standing tables: every callable
  model with price and context window; deprecations and retirements) and the
  curated tools directory, every row sourced and re-verified.
- `site`: static rendering, the derived home page, navigation, URL stability,
  citable assets (feeds, sitemap, open dataset), the one-page colophon that
  carries the AI-authorship record, design and accessibility bar, and the
  no-visitor-inference rule.
- `analytics`: GA4 wiring, the verification that events actually arrive
  (automated collect-endpoint check plus maintainer Realtime confirmation),
  and what the loop does with the signal.
- `pulse`: the deterministic engine — source registry, snapshot/hash/diff,
  derived data, link checking, freshness computation, the derived work queue,
  rebuild; provably runs with zero model access.
- `loop`: the Desk — job model, work sources, budgets and degradation,
  breakers, the portability contract (model X / provider Y / harness Z), the
  swap procedure, and the line between routine work and OpenSpec changes.
- `editorial`: the quality bar — what a piece must earn before it publishes,
  what gets cut, and how breadth and standard coexist.
- `review`: mandatory review — who reviews, what is checked per kind of work,
  what a rejection requires, how disagreement resolves, and how review
  survives a model swap.

### Modified Capabilities

None — `openspec/specs/` is empty; this is the founding change.

## Impact

- **Repository**: everything. The tree is empty except tooling
  (`openspec/`, `.beads/`, `.claude/`, `.agents/`, `.opencode/`, `.vercel/`,
  `CLAUDE.md`, `AGENTS.md`, `.env.local`, `.gitignore`). This change creates
  the site, its content, and its machinery.
- **Deployment**: the existing Vercel project (`.vercel/project.json`)
  deploys `www.addictedtoai.net` on push. **Nothing is pushed during this
  change** — the hard rule in `CLAUDE.md` stands until the maintainer
  personally lifts it at relaunch. All deploy-dependent verification is
  staged: local production build now, live verification in the
  maintainer-gated launch checklist.
- **Analytics**: `.env.local` exists and may contain a GA4 measurement ID;
  its contents are treated as suspect, never printed, and verified by
  behavior (the collect-endpoint check), not by inspection.
- **Tracking**: beads (`bd`) carries bugs, discovered work and follow-ups,
  and persistent memory via `bd remember`. The loop's mechanical work queue
  is *derived state recomputed by the Pulse*, deliberately not beads issues
  and not OpenSpec tasks — an accumulating ledger of machine-filed work is
  the failure that killed the previous version.
- **Build vs. operating phase**: the specs govern the operating phase. The
  build itself may use any harness features available now (Claude Code
  subagents, parallel agents, a Max account); the product must not inherit
  those dependencies.
