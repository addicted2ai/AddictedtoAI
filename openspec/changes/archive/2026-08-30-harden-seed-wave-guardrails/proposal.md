# Proposal: harden-seed-wave-guardrails

## Why

On 2026-08-28 a twelve-agent authoring wave and a nine-reviewer review wave ran
over this repository. 37 of 83 new pieces failed review, and repairing them
surfaced six defects that are not in the content at all — they are in the
machinery, and they are one species. Each is a rule this project relies on
that is currently an **instruction** rather than a **mechanism**. `CLAUDE.md`
states the principle in those words: *"Guardrails are mechanisms, not
instructions."* These are the places where it is not yet true.

The six, as measured:

- **`addictedtoai-zlq`** — a review record is joined to a piece **by name**,
  never to the bytes it judged. Edit an approved page and the approval stands
  unchanged, describing text that no longer exists. Surfaced while routing an
  edit to `org/moonshot-ai`, approved in an earlier round.
- **`addictedtoai-48r`** — `findCurrencyLiterals` scans the body. Only 6 of 29
  deltas have a prose body over 40 characters, so the volatile-literal check is
  **vacuous on 23 of them**. Nothing is currently rotting (measured: 8
  front-matter currency literals across 4 files, **zero unanchored by a date**),
  and the reviewer report that raised it was wrong about the fire. The
  structural half is the finding: nothing forces a front-matter field to be
  checked, or even to be classified.
- **`addictedtoai-473`** — an entry carried `284B` for a model whose own model
  card and an independently cited post both say `304B`. Transcribing the feed
  verbatim was correct; the argument the prose built on it was not. Nothing in
  the design compares a feed-bound value against a cited value for the same
  quantity on the same entry, because the Pulse fetches, hashes and diffs and
  never adjudicates between sources.
- **`addictedtoai-pfv`** — a permanently dead runner is now *refused*, with the
  cause and the clearing command printed on every run. `specs/loop` does not
  describe that refusal at all, and its breaker list is closed, so whether a
  Desk with no usable runner should halt is undecided.
- **`addictedtoai-tr8`** — `loop/lib/budget.mjs` measures ceilings against
  `max(observed total, warm-up)`. `specs/loop` says a share is the category's MM
  over the tier's rolling total, full stop. The code's low-n reading is
  defensible and unrecorded.
- **`addictedtoai-o5t`** — the wall-clock cap is per invocation. A job that is
  revised once makes four invocations, each entitled to the full cap: with
  today's `data/config.json` (every type at 120 minutes) that is **480 minutes
  for one job**, against a 1200 MM warm-up denominator — 40% of the window, from
  one job, on a 45% ceiling. Every brief prints the cap in a form that reads
  like a job budget.

Three of these (`zlq`, `48r`, `473`) have a mechanism this change specifies.
Three (`pfv`, `tr8`, `o5t`) are decisions the maintainer has read and not yet
made; this change specifies only their undisputed floor and drafts the options
in `design.md` for him to settle.

## What Changes

**Review records get bound to bytes (`zlq`).** The merge step already knows
which content files landed — it writes `subject:` for exactly that reason. It
additionally records a hash of each one's *reviewed surface*, so the join can
tell four states apart where it can tell one today: **recorded** (hash matches),
**mismatched** (reviewed then changed), **unbound** (a record from before this
change, carrying no hash), and **missing** (no record joins at all). Missing and
mismatched are opposite findings and the current check reports neither. A
mismatch fails the launch check and is never allowed to change a page's
indexability — de-indexing approved work over a whitespace edit is the failure
`lib/reviews.mjs`'s header already refuses for the absence case. And because a
mismatch must have a way to clear, a re-review is made able to supersede the
record it replaces: today it cannot, because the canonical `seed-<url>.md` name
is tried before any front-matter subject and the older record claims the piece
first.

**The volatile-literal check stops being vacuous (`48r`).** Every string-valued
front-matter field in every content schema must be classified as author prose or
not, in one declared place, and a field that is neither fails the build — the
same discipline that makes adding a content field an edit to `lib/schema.mjs`.
Author-prose fields are scanned exactly as bodies are, with one exemption: a
literal inside an object that carries an ISO-date sibling is a dated
observation, not a rotting claim. The build reports how many documents actually
had a field scanned, so the next time a check is vacuous on 23 of 29 documents,
the number is on the screen instead of in an audit. Measured correction to the
originating report, recorded here so no fixer acts on it: a delta's ends are
already anchored **by the schema** — `deltaEnd.date` is a required field — so
the four files the reviewer flagged are correct as written.

**Disagreeing sources become work, not silence (`473`).** A fact may declare
`corroborates: <field>`, naming another fact on the same entry that measures the
same quantity — a declared join, in the same spirit as `feeds`, never a name
match or a fuzzy one. Every Pulse run compares declared pairs and, when they
disagree, files a `verify` item in the derived queue naming both values and both
sources. The Pulse still never adjudicates: it does not edit a fact, pick a
winner, or fail the build. A verbatim feed fact stays verbatim.

**Three spec gaps get their undisputed floor, and their decision drafted.**
`specs/loop` gains: that a runner proven unable to run is refused on the same
terms as a conformance failure and that this refusal is *not* a halt (`pfv`);
that a budget refusal states the arithmetic it refused on, including which
denominator it used and where that denominator came from (`tr8`); and that a
job's total spend is recorded per invocation phase and stated in every brief as
what it is — a per-invocation runaway guard, not a job budget (`o5t`). The
disputed halves — a fifth breaker, the warm-up denominator itself, and a bound
on total job spend — are drafted as alternatives with a recommendation in
`design.md` and are deliberately **not** written as requirements here.

## Capabilities

### New Capabilities

None. Every requirement lands in a capability that already exists.

### Modified Capabilities

- `review`: three added requirements — a record names the bytes it reviewed; the
  join reports missing, unbound and mismatched as three findings; a re-review
  supersedes the record it replaces.
- `wiki`: two added requirements — author-written front matter is prose for the
  volatile-literal check (extending *"Volatile facts travel by transclusion,
  never by restatement"*, which is unchanged); a fact may declare the fact it
  corroborates.
- `pulse`: one added requirement — declared corroborations are compared every
  run and disagreement enters the derived queue as a `verify` item.
- `loop`: three added requirements — runtime refusal of a runner that cannot run
  at all; budget refusals state their arithmetic; a job's total spend is
  measured and honestly named. None of the three modifies the breaker list, the
  budget bounds, or the job-type list.

`editorial` is deliberately untouched: nothing here changes the quality bar, and
inventing a requirement to make a capability appear in the list is how this
project's own audit found six untasked normative clauses in 168 on the founding
spec — a requirement nothing builds and nothing measures.

## Impact

- **Machinery**: `lib/reviews.mjs` (the join and its four-state result),
  `lib/currency.mjs` (front-matter scanning), `lib/schema.mjs` (the prose-field
  classification and `corroborates`), `lib/build-content.mjs` (the summary
  counts), `loop/lib/review.mjs` (writing `reviewed:` beside `subject:`, and the
  merge-gate cross-check), `loop/lib/brief.mjs` and `loop/lib/review.mjs` (what
  a brief says about the cap), `loop/lib/budget.mjs` (the refusal's stated
  arithmetic), `loop/lib/ledger.mjs` (per-phase MM), `pulse/lib/` (the
  corroboration comparison and its queue item), `scripts/verify-launch.mjs` (the
  four-state report). No new dependency; no edit to `package.json`.
- **Content**: none required. No existing file becomes invalid. Existing review
  records carry no hash and classify **unbound**, which is reported and does not
  fail — the migration is that records written from here on are bound, and the
  unbound count only falls.
- **Data**: `data/reviews/*.md` gain a `reviewed:` key; `data/ledger.jsonl`
  gains per-phase model-minutes; `data/derived/queue.json` gains a
  corroboration item kind. `data/config.json` is **not** changed by this
  proposal — every key it would gain belongs to one of the three open decisions.
- **Specs**: `openspec/specs/` is empty because `build-initial-site` has not been
  archived. These deltas are written against the requirements as they stand in
  `openspec/changes/build-initial-site/specs/`, and archiving order matters:
  `build-initial-site` must archive first, or this change's deltas have no
  baseline to apply to.
- **Deployment**: nothing is pushed. The hard rule in `CLAUDE.md` stands.
