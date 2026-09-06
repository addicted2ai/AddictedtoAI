# Tasks

Drafted, not implemented. Every box below is open except task 14, which is the
drafting gate and was run. The change is deliberately not archived: it has no
implemented tasks, and DESK-ORDER-001 §6 sequences §3 after §1.

**The ui-loop review the maintainer required has happened** (2026-09-05,
recorded in DESK-ORDER-001 §3 under "Amendments from the 1hjf draft review").
It approved the draft and ratified every open judgment in it. Two things
followed and both are already in the task text below: the stale-edit gate on
`domains_excluded` (tasks 2, 8, 9), and the decision against writing a change
line when a seeding signal disappears (tasks 11, 12). No box was ticked for
either — they are drafting corrections, not implementation.

**Task 1 of `flag-what-moved-the-frontier` is a hard prerequisite.** That change
creates `lib/domains.mjs`; this one reads it and creates no second constant. If
§1 has not landed, this change cannot start — that is the intended coupling, not
an ordering accident.

## The schema, on both record types

- [x] 1. `lib/schema.mjs`, `entrySchema` (line 209): add `domains`,
      `domains_excluded` and `domains_seeded`, each an optional array of values
      from `DOMAINS` imported from `lib/domains.mjs`. The schema is `.strict()`,
      so without this the three keys are rejected outright and no entry can
      carry them. Use the existing `closedList` helper so the error names the
      file, the field, the offending value and the allowed values — the message
      shape an unknown `kind` already produces.
- [x] 2. `lib/schema.mjs`, `entrySchema.superRefine`, two checks, each an issue
      whose `path` names the field and the value: a value present in both
      `domains` and `domains_excluded`; and a value in `domains_excluded` that
      is in neither `domains_seeded` nor `domains` — an exclusion that removes
      nothing, which is the stale edit the requirement names. Both read only
      the front matter of the file being validated, never the current snapshot:
      that is what keeps an editorial key uncoupled from the feed, and it holds
      only because seeding is append-only, so a publisher dropping a signal
      never removes the value the exclusion is answering.
- [x] 3. `lib/schema.mjs`, `toolSchema` (line 359): add `domains` only —
      optional, same closed list. Not `domains_seeded` and not
      `domains_excluded`: no feed seeds a tool listing, so there is nothing to
      exclude, and a key that can never do anything is a key that will be
      misread. `category` is untouched.
- [x] 4. Confirm `postSchema` (line 341) still does **not** accept
      `domains_seeded`. It is `.strict()` and does not declare the key, so this
      holds today; task 10 makes it hold tomorrow.

## The reviewed surface, which is where this change can do silent damage

- [x] 5. `lib/review-hash.mjs`: add `'domains_seeded'` to
      `MECHANICAL_FRONT_MATTER_KEYS` (line 71) beside `'timeline'`, and extend
      the header comment — the file's own docblock says the list is the one
      declared place and that an unlisted mechanical key produces mismatches on
      pieces nobody touched, so a new entrant states why it is licensed.
      **Add `'domains_seeded'` and nothing else.** Adding the bare key
      `domains` would exempt a *post's* editorial `domains` from review, because
      the filter matches by name across every content kind with no per-kind
      scoping (`lib/review-hash.mjs:99-102`).
- [x] 6. `lib/review-hash.test.mjs`: update the exact-contents assertion at
      line 57, which currently asserts `['timeline']` and will fail on task 5 —
      it is meant to. Assert the new list exactly, and assert it is still
      frozen.
- [x] 7. `lib/review-hash.test.mjs`: assert that `domains` and
      `domains_excluded` are **absent** from the list, and that an entry
      gaining either changes its `reviewedHash` while an entry gaining
      `domains_seeded` does not. Three assertions, because the pair is the
      whole point: a test that only checks the exemption passes if everything
      is exempt.

## The tests that make the gate a mechanism

- [x] 8. Tests beside `lib/schema.mjs`, one per refusal, each naming the field
      it expects in the error: an entry with `domains: [legal]`; an entry with
      `domains: [text]` (the vocabulary deliberately excludes it — general is
      unmarked); an entry with `domains: [general]` (there is no such value);
      an entry with `domains_seeded: [legal]`; an entry with
      `domains_excluded: [legal]`; an entry with `audio` in both `domains` and
      `domains_excluded`; an entry with `domains_excluded: [video]` and `video`
      in neither `domains_seeded` nor `domains`; a tool listing with
      `domains: [legal]`; a tool listing with `domains_seeded: []`, which the
      tool schema must reject as an unknown key.
- [x] 9. The controls, without which task 8 proves nothing: an entry with none
      of the three keys validates exactly as before; an entry with
      `domains: []` validates; an entry excluding a value its own
      `domains_seeded` carries validates (the legal exclusion, which is what
      makes task 8's refusal a check on staleness rather than on the key
      existing); a fully populated entry round-trips all three arrays; every
      one of the eight vocabulary values validates in each of the three fields
      — in `domains_excluded` alongside the same value in `domains_seeded`,
      since a bare exclusion is now an error.
- [x] 10. A test asserting `postSchema` **rejects** `domains_seeded`. This is
      not a tautology about `.strict()`: it is the guard on the one crossing
      that would silently undo `flag-what-moved-the-frontier`'s review
      requirement, and it must fail loudly if someone later relaxes the post
      schema or renames the machine key to `domains`.

## The seeding, which is the Pulse's and is append-only

- [x] 11. `pulse/`, in the data-layer update step: derive `domains_seeded` from
      named feed fields on entries that declare a joined row, and **append
      only** — a signal absent from the current snapshot removes nothing, and
      the disappearance appends no line to `data/changes.jsonl` (decided
      against with its measurements in `proposal.md`).
      Proposed field list, to be confirmed by the implementing change:
      `image`/`video`/`audio` from `architecture.input_modalities` and
      `output_modalities`; `coding` and `agents` from the *presence* of
      `benchmarks.artificial_analysis.coding_index` and `agentic_index`.
      `research`, `science-math` and `robotics` have no feed signal and are
      editorial only. No model invocation on any path, and no index value is
      read onto a page — only whether the field is present.
- [x] 12. Tests in `pulse/`: a second run over an unchanged snapshot appends
      nothing (idempotence). A snapshot that has **lost** the field that seeded
      a value leaves that value in place — the regression test for the measured
      166→99 `agentic_index` drop across the 2026-09-04 and 2026-09-05
      snapshots, which under a recomputing rule would have untagged 67 entries.
      That same test asserts the run appended **no** line to
      `data/changes.jsonl`, which is where the declined recommendation becomes
      a mechanism instead of a sentence. A snapshot that gains a signal appends
      exactly one value and not a duplicate.
- [x] 13. A test that a seeding run over an entry with a bound review record
      leaves that record reporting **matched**, joining tasks 5 and 11 at the
      point they are supposed to meet. Verify by running the seed and
      recomputing the hash, not by asserting the key is on a list — the list
      membership is task 6's claim, and this is the claim that it works.

## Gates

- [x] 14. `openspec validate tag-the-corpus-by-domain --type change --strict
      --no-interactive`, and `node scripts/check-spec-deltas.mjs --strict`.
      Run at drafting time.
- [ ] 15. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics`.

## Not tasks of this change, recorded so they are not read as omissions

- The **backfill** — assigning editorial domains to the 544 wiki entries and 35
  tool listings that want one — is editorial work through the review gate and
  belongs in a directive line, not here. It is deliberately unbounded by this
  change: nothing is required to carry a domain.
- **`lib/domains.mjs` itself** is task 1 of `flag-what-moved-the-frontier`.
- **Rendering or grouping by domain** on any surface is the UI's brief and
  belongs to `site`. The ordering rule in the `directory` delta binds such a
  surface when it appears; this change builds none.
- **The index registry and per-index domains** are DESK-ORDER-001 §4 and are
  their own change.
- **Republication rights for Artificial Analysis and Design Arena** are a
  `verify` directive (beads `addictedtoai-ego8`, `-c563`). Nothing in this
  change waits on them, because seeding reads field presence and never a value.
