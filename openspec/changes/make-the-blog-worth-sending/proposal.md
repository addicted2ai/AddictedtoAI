# Proposal: make-the-blog-worth-sending

## Why

The maintainer asked, on 2026-08-30, for the blog to be overhauled into an
award-winning blog, seen through the lens of this site and its mission — not a
plumbing fix, and not the execution of a settled list. The question this
change answers first is what an award-winning blog *on this subject, on this
site, written by this machinery* would be, and the answer worked backwards
into specs.

**The answer, in one sentence:** the blog of record for the observable AI
economy — every post either a **news note** (a dated event, witnessed with
primary evidence, that says who it lands on and what changes for them) or a
**synthesis** (recorded evidence assembled into a shape no single event
shows), both held to the test of whether a reader would *send* the piece to a
specific person, not merely concede its accuracy.

The blog today fails that description in a precise, measured way. Every claim
below was re-measured on 2026-08-30 rather than carried over from the
conversation that prompted this change:

1. **One genre, human-directed, five posts.** All five published posts
   (`content/blog/`, dates 2026-08-14 to 2026-08-28) are surveys of a catalog
   or a document set — derived-view censuses, several of them excellent. Not
   one is about something that happened to somebody; not one names an
   affected party; every one exists because a human directed it. The craft is
   there. The genre monoculture is the defect.
2. **No producer.** The string `post` appears nowhere in
   `pulse/lib/queue.mjs` (the whole file was read; the queue emits only
   `repair`, `verify`, `interpret` and `entry` items). The blog has no queue
   trigger. Its only other route, proposals, has a consuming side that is
   complete and tested and a producing side that does not exist:
   `loop/lib/proposals.mjs` exports exactly four functions, all readers, and
   `data/proposals/` has held nothing but a README and an empty `rejected/`
   since 2026-08-28 (`addictedtoai-6ov`).
3. **The supply the producer would draw on already exists.**
   `data/changes.jsonl` holds 90 lines: 60 seeded `release` events spanning
   2026-06-29 to 2026-08-24 (30 of those 57 calendar days carried at least
   one), and 30 live lines from the Pulse's first real diff on 2026-08-29 —
   2 retirements, 10 arrivals, 17 field changes (8 input-price, 8
   output-price, 1 status), 1 annotation. Every line carries a date, a source
   URL, an excerpt and a kind. That is dated, actor-shaped, primary-sourced
   news, recorded by deterministic machinery, feeding nothing but the changed
   feed and `interpret` jobs.
4. **The bar selects the wrong genre for a blog.** The editorial spec's third
   test is would-cite — "could paste this URL as support" — and contains no
   send test (the string `send` appears nowhere in
   `openspec/specs/editorial/spec.md`). You cite a reference; you send a
   story. All three editorial tests are satisfiable by a well-made table with
   no actor and no reader stake, which is what the five posts are
   (`addictedtoai-18c`). The old site's author track carried the missing
   half explicitly: *"You fail if what you publish is correct, sourced, and
   forgettable."*

The maintainer values both ends — the news note and the synthesis — and
argues the rate controls (the 3-in-7 ceiling, any floor) are the wrong
instruments: the right control is a worthiness bar. This change agrees about
the variable and disagrees about the instrument: a bar with no mechanism
fails this repository's own stated preference, so the control here is moved
to a variable a model cannot game — **the evidence class of the post** (see
`design.md` D4).

## What Changes

**Two forms, named, each with its own finish line** (`specs/blog`). A news
note leads with what happened and who it lands on, has no minimum length, and
is finished when the affected reader knows what to do; a synthesis states its
derivation method and rests on enumerable dated evidence. Posts link their
predecessors on the same subject — a blog with no memory of itself is a stack
of press releases.

**News notes are anchored in evidence the author cannot create**
(`specs/blog`). A note declares its anchor in front matter: change-feed keys
resolved against `data/changes.jsonl` (written only by the deterministic,
model-free Pulse), or an external primary source with a date, which review
fetches. The build fails an anchor that does not resolve or is stale. This is
the mechanism that keeps the uncapped lane honest.

**The rate control moves from counting posts to classing evidence**
(`specs/blog`). No floor, unchanged. Anchored notes carry **no count
ceiling** — their rate is limited by the world (one candidate group, one
note; candidates expire in 7 days) and by the existing model-minute budget
and capacity shedding, which this change does not touch. Unanchored posts —
the manufacturable genre — drop from 3-in-7 to **1 in any rolling 7 days**,
enforced at the same named point (the selector) with the same build warning.

**The Pulse derives post candidates, and they expire** (`specs/pulse`).
Event lines of kinds `release`, `arrival`, `retirement` and material
`field_change` from the trailing 7 days, grouped deterministically so
same-day related events form one story, minus groups any published post
already covers, become queue items proposing `post` jobs — ranked below every
repair and verify, carrying their evidence. An uncovered candidate expiring
is a normal outcome: news the bar declined decays instead of accumulating.

**The proposal producer is wired** (`specs/loop`, resolving
`addictedtoai-6ov` for its two model-originated routes). Every brief states
the job may end with at most one proposal; the review brief asks the reviewer
to note one; the loop transcribes and stamps them. "At most one" and "never
your own job type" are mechanisms — mechanical discard, spending no
inference — not instructions. This is the synthesis end's producer: a
synthesis is caused by a model noticing accumulated shape, which is exactly
"a Desk run ending by writing a proposal about whatever it noticed."

**The bar gains its missing half** (`specs/editorial`, `specs/review`). The
third editorial test becomes worth-linking-**or**-worth-sending, with both
tests defined, and "correct, sourced, and forgettable" named as a failure.
Posts specifically must pass the send test — citable alone does not publish a
post. The blog-post review checklist verifies the form, the anchor, and the
affected party, and the post's `would-cite` record answers the send question
in the reviewer's own words; the field's mechanics (non-empty,
non-duplicate) are untouched.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `blog`: one modified requirement (the rate control), three added (the two
  forms; the anchor; the affected party).
- `pulse`: one added requirement (post candidates derive and expire), one
  modified (the derived-queue enumeration gains them).
- `loop`: one modified requirement (work-source 3 gains its producing side
  and the self-amplification guard).
- `editorial`: one modified requirement (the earn-your-reader bar's third
  test widens; the forgettable failure is named).
- `review`: one modified requirement (the blog-post checklist).

## Impact

- **Machinery**: `lib/schema.mjs` (post front-matter keys `covers:` and
  `anchor:` — unknown keys fail the build by design, so this is a named
  edit), a build check for anchor resolution and staleness,
  `pulse/lib/queue.mjs` (candidate derivation, coverage join, expiry, rank),
  `loop/lib/config.mjs` (ceiling constants), `loop/lib/surfaces.mjs` (the
  reshaped gate), `loop/lib/brief.mjs` (post acceptance checks, the proposal
  section, prior-post surfacing), `loop/lib/review.mjs` (reviewer proposal
  noting), the merge step (proposal transcription, stamping, at-most-one),
  and tests beside each. No new dependency, no `package.json` edit, no
  `data/config.json` edit (the ceiling constants are deliberately code, per
  `data/README.md`).
- **Content**: none. This change writes no posts; it builds the thing that
  does. `content/blog/README.md` is updated to describe the two lanes.
- **Data**: `data/changes.jsonl` is read, never written, by everything here.
  `data/proposals/` begins receiving files through the wired routes.
- **Specs**: deltas against five capabilities in `openspec/specs/`, listed
  above. Nothing anchors a permanent requirement to a path archiving moves:
  every standing obligation added here points at `openspec/specs/`,
  `content/`, `lib/`, `pulse/` or `loop/` paths.
- **Deployment**: nothing here pushes. The gate condition in `CLAUDE.md`
  stands for whoever executes this change.
