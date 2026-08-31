# Proposal: link-the-machines-work-to-beads

## Why

The maintainer raised this on 2026-08-31, on seeing the Desk's four machinery
proposals: *"If any of those are tied to beads issues, or need to be, we need to
make sure there is a reliable, preferably mechanical, link the jobs to beads
issues."*

Filed as `addictedtoai-occ0`. The bar he set is **mechanical**, not
conventional — a rule agents are asked to follow is not an answer here, because
this repository's whole design is *guardrails are mechanisms, not instructions*.

### What was re-measured on 2026-08-31, before designing anything

`addictedtoai-occ0` proposed a shape. Four of its claims were re-derived from
committed state before any of it was built, and **two do not survive
measurement**. Both corrections are load-bearing — one of them would have sent
this change to build a guardrail on a code path with no traffic — so they are
recorded here rather than in a commit message.

**1. The ledger gap is real, and it is the whole of the maintainer's question.**
`data/ledger.jsonl` carries 18 job lines. **Zero** reference a beads id; no such
field exists. The keys in use are exactly `ts, id, type, runner, provider, tier,
mm, outcome, note, phases`. *"What did the machine ever do about
`addictedtoai-X`"* cannot be asked of any artifact in this repository.

**2. "`data/proposals/dropped/` holds ten expired post proposals" is false, and
so is the conclusion drawn from it.** The issue reads those ten files as ideas
that *"expired unselected and now exist nowhere else"* — the buried deferral,
*"produced mechanically, ten times, in one day."* Measured:

- None of the ten carries an expiry-sweep note, and none is named
  `<slug>.expired-<stamp>.md`, which is the only name `sweepExpired` writes.
- All ten carry `status: declined`, `declined_by_job: j-20260831-0{1,3}` and a
  `failed_test:` — they are the **scout's deliberately recorded declines**,
  written straight into `dropped/` by the executor.
- The in-flight spec `make-the-blog-worth-sending` **requires exactly this**:
  *"What the scout declines SHALL be recorded, never silently dropped: each
  considered-and-declined story becomes one record in `data/proposals/dropped/`,
  naming which test it failed and what would make it worth refiling."*
- All ten satisfy it. 10/10 name the failed test; 10/10 name a refile condition.

They are not buried deferrals. They are a spec working as written, and the
executor complied with it voluntarily, since nothing checks compliance.

**3. The expiry sweep has never fired. Neither has three of its four siblings.**
Scanning all 15 retired proposal files for the marker each mechanism writes:

| retirement path | ever fired? |
|---|---|
| expiry sweep (`sweepExpired`) | **no** — 0 |
| over-cap drop (`applyProposalMergeRules`) | **no** — 0 |
| duplicate discard (`discardDuplicate`) | **no** — 0 |
| self-amplification discard (merge rules) | **no** — 0 |
| consumption (`consumeProposal`) | yes — 2 |

`addictedtoai-occ0` proposed making the sweep to `dropped/` the mechanical
trigger, calling it *"the load-bearing half."* **It carries no load.** A
requirement hung there would have guarded a door nothing walks through, while
all ten motivating files came in through a different one — an executor writing
into `dropped/` as ordinary job output, which no mechanism inspects. Building it
as proposed would have produced a guardrail that measurably prevents nothing:
the exact *reads-as-present-and-does-nothing* shape this repository keeps
catching.

**4. The stated hazard around review records does not exist.**
`addictedtoai-occ0` warns that adding a key to a review record would invalidate
every existing binding, because `lib/review-hash.mjs` hashes front matter minus
`MECHANICAL_FRONT_MATTER_KEYS`. Traced: `writeRecordSubjects` calls
`reviewedHashOfFile(join(repoRoot, s))` where `s` is a **subject content path**.
The hash is taken over the reviewed *content file*, never over the review record
itself. A key added to a review record invalidates nothing. The warning was
precautionary and is withdrawn — which matters, because it was the stated reason
not to touch reviews, and the real reason not to is different (design D3).

## What Changes

The join the maintainer asked for, at the three places work enters and the one
place it is recorded — and **nothing hung on the sweep**.

- **One definition of the id format**, `loop/lib/issues.mjs`, format-only and
  free of `bd`. Validation splits: FORMAT anywhere, EXISTENCE only locally.
- **`issue:` becomes a real key on a proposal**, format-validated at parse time
  beside `slug` and `type`. A malformed value is `malformed` and skipped loudly,
  exactly as a bad `type` already is. Today the key parses and does nothing.
- **A directive needs no new syntax.** Ids are harvested from the line's prose,
  so the maintainer's existing habit becomes mechanical and every line already
  in the file stays valid.
- **The ledger line carries the join** as an optional **list**, omitted when
  empty, with `LEDGER_FIELDS` unchanged so every line already written stays
  valid.
- **A local existence gate**, `scripts/verify-issue-links.mjs`, never in the
  build.

**Deliberately not built:** a requirement that a dropped proposal carry an id.
It would demand an issue per scout decline — ten in one night — which is the
manufactured backlog noise `addictedtoai-occ0`'s own first constraint forbids,
in service of a loss that measurement says is not happening.

## Impact

- Affected specs: `loop`
- Affected code: `loop/lib/issues.mjs` (new), `loop/lib/proposals.mjs`,
  `loop/lib/directives.mjs`, `loop/lib/ledger.mjs`, `loop/run.mjs`,
  `scripts/verify-issue-links.mjs` (new), `loop/tests/issues.test.mjs` (new)
- **Not** affected: `scripts/prebuild.mjs`. Verified: the prebuild reads neither
  `data/proposals/` nor `data/ledger.jsonl`, so no build path reaches the join.
- Filed separately, not fixed here: `addictedtoai-fyd3` (the scout's
  drop-record requirement has no mechanism — 10/10 complied voluntarily),
  `addictedtoai-fvoo` (four of the five retirement paths have never executed).
