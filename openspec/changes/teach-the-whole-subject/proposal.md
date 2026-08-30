# Proposal: teach-the-whole-subject

## Why

The maintainer asked for it on 2026-08-29, in these words: *"a coherent
progressive surface that encompasses the subject of AI from top to bottom.
Someone who knows nothing about it should have a thorough understanding of it
if they read the whole surface. The tone should be easy and approachable for
all audiences, not just technical readers."*

The learn surface today is ten pages, and they are good pages — but they are
almost entirely one corner of the subject, deepened. A reader who finishes all
ten understands how a language model turns text into text, how it is trained,
served, benchmarked and safety-trained, and why it is confidently wrong and
nondeterministic. That reader still does not know where any of this came from,
what it costs, who builds it, what it is used for, where it fails people, what
an image generator or a recommender is, what happens to the words they type,
or how to weigh the next confident forecast they read. "Top to bottom" is a
coverage requirement before it is an ordering requirement, and coverage is
what is missing.

Three facts about the machinery shaped this blueprint, each verified in the
tree rather than assumed:

1. **The ladder is an ordered array, not a set of labels.**
   `LEARN_LEVELS = ['orientation', 'foundations', 'mechanics', 'advanced']`
   in `lib/schema.mjs` *is* the sort order of the generated index. This
   blueprint keeps all four rungs and does not touch the array: the rungs map
   onto real reader states, every existing page carries one, and extending or
   renaming the ladder is a schema change whose price (edit the array, revisit
   every page's level, re-justify the index) buys nothing the four rungs
   cannot already hold once their meanings are stated properly (design D2).

2. **Prerequisites are learn slugs only, and they are checked — except in one
   direction.** `learnSchema` validates `prerequisites` against `SLUG_RE` (no
   `kind/slug` entry ids — those go in `mentions`), `lib/corpus.mjs` fails the
   build on a prerequisite naming a page that does not exist, and
   `lib/learn.mjs` fails it on a cycle. But nothing stops a prerequisite from
   pointing **up** the ladder — a foundations page could require an advanced
   one, and the generated reading order would silently send a strictly
   in-order reader forward for something they needed already, the exact thing
   the within-rung topological sort exists to prevent. With 27 new pages about
   to be written by many hands over months, that gap gets closed by a build
   check, not by vigilance (task 1.1).

3. **The `outcome` field is rendered by two surfaces and must stand alone as a
   sentence.** The schema's refinements (capital first letter, must not begin
   "After this/reading") exist because three outcome styles once grew in the
   tree simultaneously and every live page rendered a collided junction. Every
   outcome in this blueprint's catalog is written to those refinements, in the
   corpus's established "You can …" form, so an executing model copies a
   compliant sentence instead of inventing a style.

## What Changes

**A curriculum for the whole subject: 37 pages, of which 27 are new.** The
subject is divided into six areas — the thing itself, where it came from, how
it is made, how it runs and is used, how to judge it, and the world around it
(design D1) — and every page in the catalog (`openspec/curriculum/learn.md`) serves a named
area at a named rung. Proposed distribution: **orientation 8, foundations 11,
mechanics 11, advanced 7** (today: 2 / 2 / 3 / 3). Every catalog entry carries
the working title, level, a schema-compliant `outcome` sentence, its
prerequisites, what the page must cover, and what it must not drift into —
enough for a model to write the page from the entry alone, months from now,
without this conversation.

**The ladder's rungs get stated meanings.** Each rung's purpose, the reader
capability at its end, and the admission test for placing a page on it are
written down (curriculum §2), and the index blurbs in `lib/render/learn.mjs`
are updated to state the purposes in reader terms (task 1.2). A page's rung is
set by what it *assumes*, never by how hard its topic sounds — law lands on
mechanics and history on orientation for reasons the admission test makes
mechanical.

**One small piece of machinery: prerequisites may never point up the
ladder.** A new check beside `checkPrerequisiteCycles` in `lib/learn.mjs`
fails the build when a page's prerequisite sits on a later rung, naming both
pages and both levels (task 1.1). This turns the reading-order guarantee —
top to bottom, never sent forward — from a convention 37 pages could drift
out of into a property the build enforces. No schema change: `LEARN_LEVELS`
and `learnSchema` are untouched.

**Two existing pages gain one prerequisite line each.** `what-a-model-is`
gains `what-ai-actually-is`, and `how-a-language-model-works` gains
`what-a-neural-network-is` — because the new curriculum genuinely inserts
pages before them, and the reading order is computed from these declarations.
No other edit to any existing page; no level moves; nothing is rewritten.

**Tone requirements with review teeth.** "Approachable for all audiences"
cannot live in the schema, so it lives where this repository keeps its
editorial standards: named failure modes, before/after examples, and tests an
executing model can run against its own draft (curriculum §3), plus spec
requirements phrased in the review gate's existing vocabulary
(`not-worth-reading`, `spec-violation`). The sendable-sentence test follows
the direction of `addictedtoai-18c`: a page with nothing a reader would quote
to someone else is a summary, not a page.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `education-static`: one modified requirement — *"The curriculum is a ladder
  with stated prerequisites"* gains the level-monotonicity rule and the
  stated rung purposes. Two added requirements — the surface is grown against
  a written map of the whole subject, and every page must land for its rung's
  reader, with tone failures nameable in review. Written as a delta against
  the capability as it stands in `openspec/changes/build-initial-site/specs/`;
  archiving order matters, as it did for `group-tool-listings-by-category`.

No other capability is touched. `education-dynamic` in particular is not:
tutorials own steps-you-run, and several catalog entries explicitly fence
their pages off from drifting into tutorial territory rather than the other
way round.

## Impact

- **Machinery**: `lib/learn.mjs` (one new exported check),
  `lib/site.mjs` (one call site, beside the existing cycle check),
  `lib/render/learn.mjs` (`LEVEL_BLURBS` text only), `lib/surfaces.test.mjs`
  (tests for the new check; no existing test pins the blurb strings — checked
  by grep before writing this). No new dependency, no `package.json` edit, no
  CSS change, no schema change.
- **Content**: 27 new files under `content/learn/`, landed in dependency
  order over as many runs as it takes (a prerequisite naming an unwritten
  page fails the build, so the wave order in `tasks.md` is load-bearing).
  Two one-line front-matter edits to existing pages.
- **Wiki**: no entry is required to change. Catalog entries suggest
  `mentions` only from entries that exist today (verified against
  `content/wiki/` on 2026-08-29); where a page wants a concept with no entry
  yet, the writer drops the mention or files the stub as separate wiki work —
  a bogus mention is a build error.
- **Tests**: extension of `lib/surfaces.test.mjs` for the monotonicity check
  (up-pointing prerequisite fails naming both pages; same-rung and
  down-pointing pass; the real corpus is clean).
- **Data**: none. Nothing in `data/` changes shape.
- **Deployment**: nothing here pushes. This change was authored without
  running a build, and the gate condition in `CLAUDE.md` stands for whoever
  executes it.
