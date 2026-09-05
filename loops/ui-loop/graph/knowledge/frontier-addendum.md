
---

## 11. Addendum (2026-09-04, after independent review) — tools, capabilities, and two findings

**What this supersedes.** §1's description of proven capabilities as "a strip
on `/frontier`" and §10's placement of the capability strip in Phase 4 are
superseded by §11.3 and §11.5 below: capabilities become a full section and
move to Phase 1. §2.3's derived/authored table is **extended**, not replaced,
by §11.2. Nothing else above is rewritten; the reviewer's findings stand
against the text as it was. The measurements here come from a fourth probe,
`frontier-probe-tools.mjs`, beside this file.

**Two review findings this addendum honours.** (1) The safety of `/frontier`
rests on being *outside* `checkSnapshotCensus`'s scope, not on satisfying it;
a rotting census sentence typed into the page's own lede is invisible to every
check in the repository. §11.4 adds the guardrail that puts the page inside a
fence. (2) `data/changes.jsonl` is edited in place by approved repair jobs
(annotation `text`, twice this week), so §6.2's "immutability" wording
overstates what the file guarantees. Nothing in this addendum relies on that
file being immutable; the tools and capabilities limbs read no ledger at all.
For §6, the honest restatement — left for the change author, since I am not
rewriting in place — is: *the frontier module never edits or deletes a line;
what the file as a whole permits is the open question
`data/proposals/settle-what-append-only-means-for-changes-jsonl.md` asks the
spec to settle, and the frontier lines should be named there as the class that
is never edited.* The tests in §6.2(4) measure the module, not the file.

### 11.1 Why tools were dropped, and what is actually there

Models rank because a feed row carries numbers. Tools carry none. What the
corpus records about a tool, measured on the tree today:

- **35 listings** in `content/directory/tools/`, schema
  `lib/schema.mjs:359-381`: `title, url, pricing (prose), last_verified,
  entry, category, mentions, discontinued`. **No listing date, no version, no
  metric.** All 35 carry the same `last_verified: 2026-08-28` — the seed date
  — and all 35 read `ok` in `data/derived/freshness.json`.
- **38 `tool/*` wiki entries**, **zero with a prose body**, 29 cited facts in
  total (7 are `license`; `version` and `latest_release` appear once each),
  **4 timeline events across 3 entries, all dated 2023** (`tool/sglang`
  2023-12-12, `tool/vllm` 2023-09-12, `tool/llama-cpp` 2023-06-05).
- **No registered source yields tool rows** (`data/sources/registry.json`
  has two sources, both about models), so no change line and no lifecycle
  append will ever mention a tool. specs/education-dynamic:3-7 says this in so
  many words: the surface for "the newest tools" is the one that "has no free
  feed behind it".
- **4 tutorials**, all `fresh`, every one pinning a tool at an exact version
  or dated state in `verified_against` (`transformers-js: 4.2.0`,
  `onnx-runtime-web: 1.26.0-dev.20260416-b7804b056c`, `llama-cpp: GGUF version
  3`, `openrouter: /api/v1/models as served 2026-08-28, total_count 398`),
  with `verified_on` and a `reverify_days` of 30 or 60 — seven distinct tool
  ids across them.
- **The 28 deltas mention 5 model ids and 0 tool ids.**

The directory also forbids the two shortcuts a "tools frontier" would reach
for: ordering by count (`lib/listings.mjs:114-118`; specs/directory:92-95),
and any order that is not a pure function of stated names
(specs/directory:86-90). A `pricing` string is prose and cannot be compared. So
there is no computed ranking of tools waiting to be used, and inventing a
score — GitHub stars, download counts, a model's opinion — would be a fabricated
metric that an interested party can move, which is the placement the directory
refuses to sell.

**The honest conclusion: tools belong on The Frontier in a different shape
than a leaderboard.** What the frontier of tools *is*, in this corpus's own
terms, is *what a tool was most recently proven to do, at which version, on
which date, with evidence* — and that record already exists: it is the
tutorial (specs/education-dynamic:11-27, "verified means the steps were
actually run"). The rest is either honestly empty today or authored.

### 11.2 The tools limb — what is computable, what is authored

Extending §2.3's table:

| DERIVED, from committed state | Today's measured value | AUTHORED, through the review gate |
|---|---|---|
| **Proven in practice**: every tutorial, newest `verified_on` first, each subject joined to its `tool/*` entry, showing `verified_against` version, `verified_on`, `state` from freshness (`fresh/stale/demoted`, `lib/tutorials.mjs` via `site.tutorials`), and a link to its evidence under `data/reviews/evidence/` | 4 tutorials, 7 tools, all verified 2026-08-28 | the tutorials themselves (`tutorial` jobs; proposal-initiated by decision, `pulse/lib/queue.mjs:59-70`) |
| **Recently changed**: `tool/*` entries whose newest `timeline[].date` falls in a trailing window (365 days, GUESS), newest first, each event with its `source_url` | **empty** — the newest event on any tool entry is 2023-12-12; the section renders the honest empty notice, the way `renderDeltasIndex` does (`lib/render/delta.mjs:80-91`) | dated, sourced timeline events on tool entries (`entry` jobs) |
| **Newly listed**: listings by a listing date, trailing 90 days (GUESS) | **not computable today** — the schema carries no listing date; see below | nothing — the date is data |
| **Proven capability with a tool as its subject**: deltas and blog notes whose `mentions` include a `tool/*` id | **empty** — 0 deltas mention a tool | deltas and notes (existing kinds, existing gates) |
| **Verified alive**: listing `state` from freshness, discontinued/could-not-verify markers | 35 `ok` | nothing |

Three decisions inside that table:

1. **A listing date is a one-line schema addition, deferred until it is not
   vacuous.** `listed_on: isoDate` on `toolSchema`, classified NON_PROSE ("an
   ISO date"), backfilled once by the orchestrator from each file's first
   commit date via Node `execFileSync('git', ['log', '--diff-filter=A',
   '--format=%as', '--', path])` (plumbing, per the Windows note). Today every
   listing would read 2026-08-28 and "newest" would be the whole directory —
   the vacuous check `build-content.mjs:187-191` warns against. Add the field
   when a second wave of listings exists; until then the section is absent and
   the page does not pretend otherwise.
2. **A release feed per tool is the one genuinely mechanical frontier for
   tools, and it is a registry question, not a design question here.**
   specs/education-dynamic:52-54 already anticipates "a newer version in a
   feed" moving a tutorial's banner; no such feed is registered. A per-project
   releases feed (GitHub serves `releases.atom` for public repositories,
   unauthenticated — GUESS that this holds for the 30-odd listed open-source
   tools; robots/terms **unverified**, and 30+ daily fetches meet this
   machine's port hazard) would give release recency as a dated, sourced,
   seedable history exactly as `llm-releases` does for models
   (`registry.json:96-133`; `diff.mjs:270-315`). Cost beyond the registry:
   `extractRows` parses RSS `<item>` only (`sources.mjs:83-103`) and Atom uses
   `<entry>`, so a small parser extension. This is filed as its own beads issue
   in the list below, not assumed by any phase.
3. **What makes a tool "frontier" in the maintainer's sense — a new class of
   capability, the first tool to do X — cannot be mechanical and must be
   authored.** The corpus already has the two shapes for it: a **delta**
   (specs/site:45-74 — two dated, sourced ends, "curated, never
   auto-generated") with the tool in `mentions`, and a **blog note**
   (specs/blog:144-186 — anchored evidence, dated, never rewritten). The
   Frontier joins them; it never writes them. This is the extension of §2.3's
   line the coordinator asked to have said plainly: the tools limb's *judgment*
   lives entirely in reviewed content of existing kinds, and the surface
   contributes only the dated joins.

The tools section therefore has three stated sort criteria, one per rail, each
a date the corpus already records (`verified_on`, newest `timeline.date`,
`listed_on` when it exists), and the page prints them in the
`[data-sort-note]` form (`scripts/verify-surfaces.mjs:93-109`). No rail orders
tools against each other on anything but a date.

### 11.3 Capabilities — a section, not a strip

The maintainer named capabilities twice. A strip under-weights them, and the
corpus can carry more than a strip at zero authoring cost, because it already
holds three kinds of dated, sourced, reviewed proof:

| Proof | Date it is ordered by | Evidence the reader can follow | Kind on the page |
|---|---|---|---|
| a delta (Impossible → Routine) | `routine.date` (`lib/deltas.mjs:78-87`) | both ends' `source_url` | "became routine" |
| a tutorial | `verified_on` | `verified_against` versions + `data/reviews/evidence/` | "proven by execution" |
| a blog news note | its `date`, with a `covers:`/`anchor:` that resolves | the anchor | "reported" |

**The capabilities section is one merged date rail** — the site's recurring
shape (`lib/render/home.mjs:16-19`) — newest first, each item typed by its
proof kind and linked to the entries it mentions, with a stated criterion:
*the date each record says it became true, newest first.* Membership is a
join and nothing else: every delta; every listed tutorial (`state.listed`,
not demoted — the same rule `renderLatest` uses, `home.mjs:110`); every note
that declares an anchor (a synthesis declares none and is judged as one,
specs/blog:103-118 — it is not a dated proof and stays off this rail). No
window is needed on the section itself; the home-page door shows the newest
three.

This is "a posting of new proven capabilities" in the corpus's own vocabulary:
a *proven* capability is one with a source at each end, an executed
transcript, or an anchor the build resolved — and the rail refuses anything
without one because the three source kinds' own schemas already refuse it
(`deltaSchema` requires both `source_url`s, `schema.mjs:390-418`;
`tutorialSchema` requires `verified_against`/`verified_on`, `:289-298`; the
anchor check fails the build on an unresolved `covers:`, specs/blog:159-162).

What this does **not** do: derive a capability from a model's index moving.
A lead change is a fact about a ranking; a capability is a claim about what a
thing can do, and the corpus's rule is that such a claim is authored with
receipts (specs/editorial:114-130, "awe as a finding"). The two sit in
different sections and the fixed copy says why.

**Rate.** `tutorial` and `post` are proposal-initiated by decision
(`queue.mjs:59-70`) and deltas have no producer at all, so the rail fills at
the rate the editorial bar admits work. That is the correct rate. The scout's
brief already carries the change feed; nothing here adds a cadence, and the
section renders an honest count rather than a target.

### 11.4 The lede hazard — putting the page inside a fence

The reviewer is right that `/frontier`'s own fixed copy is unchecked prose.
Every sentence the tools and capabilities sections add to that copy inherits
the hazard. The guardrail, mechanical and cheap:

- `lib/render/frontier.mjs` emits every derived rail inside an element carrying
  `data-derived="frontier-<rail>"`. The page template's own copy lives
  outside those elements.
- `scripts/verify-surfaces.mjs` gains one assertion for `/frontier` (beside
  `checkSortNotes`): after removing every `[data-derived]` subtree, the site
  header, and the footer (whose build stamp is digits by design), **the
  remaining text of `main` contains no digit**. A number in the lede is the
  only way a census can be typed there, and a page whose fixed copy has no
  number cannot state one. Dates, counts and values then exist on the page
  only where the build put them from data.
- The same assertion should be offered to `/impossible-routine`, which shares
  the exposure and today appears to pass it (its lede has no digit), so the
  rule is a site rule rather than a frontier exception — GUESS, since I did
  not render the page; the check would say.

This does not make the page satisfy `checkSnapshotCensus`; it makes the class
of sentence that check exists for unwritable on the page. Where the two differ
is that this one is a measurement of the export, which is where the reviewer
said the exposure was.

### 11.5 What changes in §10

- **Phase 1 grows** by two derived sections with no authoring: the tools
  section (proven-in-practice rail from tutorials; recently-changed rail from
  tool timelines, rendering its honest empty state; alive/dead markers from
  freshness) and the capabilities section (the merged rail of §11.3). Both are
  joins over `site.tutorials`, `site.deltas`, `site.posts` and `corpus.entry`,
  all of which `lib/site.mjs:104-119` already builds. Phase 1 also adds the
  no-digit fence of §11.4 to `verify-surfaces`.
- **Phase 4 loses** the capability strip (now Phase 1) and **gains** two
  deferred, separately filed items: the `listed_on` schema field with its
  git backfill, taken when a second wave of listings exists; and the
  release-feed registry investigation of §11.2(2), whose first step is a
  robots/terms verification and a port-budget measurement, not a design.
- Phases 2 and 3 are unchanged, and neither depends on the tools limb.

### 11.6 Beads issues this addendum implies (each its own id, per CLAUDE.md)

- `listed_on` on `toolSchema` + one-time git backfill — deferred until it is
  not vacuous.
- Per-tool release feeds as registry sources: verify robots/terms for the
  listed projects' release feeds; measure fetch count against the
  ephemeral-port hazard; extend `extractRows` for Atom `<entry>`.
- The no-digit fence for derived-page ledes, offered site-wide.
- Restating §6.2's guarantee (2) in the frontier module's terms, and naming
  frontier lines in the append-only ruling the existing proposal asks for.
- The tool timelines carry nothing after 2023 while the directory re-verifies
  every URL every 45 days (`lib/listings.mjs:27-28`) — a directory that knows
  a tool is alive but not that it changed. Whether `entry` jobs should be
  queued to bring tool timelines current is an editorial decision worth its
  own issue, not a queue producer to add quietly.
