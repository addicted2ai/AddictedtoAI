# Tasks

**Authored and complete 2026-09-06.** Every box below is ticked because this
change makes **no code change of any kind** — each task is the writing of one
`MODIFIED` block, and the block is the deliverable. There is nothing here for a
later implementation pass to do; the only step left is review and archive,
which is the orchestrator's.

Each block was extracted from the live spec programmatically and re-verified
programmatically: undoing its single correction reproduces the live requirement
byte for byte. A `MODIFIED` body replaces the **whole** requirement body, so
that check is the one that matters.

## The four corrected requirements

- [x] 1. `specs/blog/spec.md` — MODIFIED "A frontier flag is earned, declared,
      and gated at the build": "withdrawn as keeper ruling K46" →
      "withdrawn as ruling K46, taken under the K40 delegation". Body copied
      whole (6680 bytes), one sentence changed.

- [x] 2. `specs/pulse/spec.md` — MODIFIED "A lead change and a rescoring are
      different events, and the difference is computed": "the state both
      finalist builds were in when each hard-wired an empty element instead" →
      "the state both finalist builds were in on day one, and the state in
      which one of them hard-wired an empty element instead". Body copied whole
      (6050 bytes), one sentence changed.

- [x] 3. `specs/wiki/spec.md` — MODIFIED "A seeded domain and an editorial
      domain are separate fields": the volume sentence gains the clause "3 of
      them rows that left the snapshot altogether". Body copied whole (10439
      bytes), one sentence changed; the 71 and the 182 are unchanged.

- [x] 4. `specs/directory/spec.md` — MODIFIED "A tool listing may declare the
      domains it serves": "onto at least two listings in three" → "onto 23 of
      the 35". Body copied whole (3739 bytes), one sentence changed.

## The archived copies and the carry files

- [x] 5. The same four sentences corrected in the archived changes that carried
      them — `archive/2026-09-06-flag-what-moved-the-frontier` (`proposal.md`
      and `specs/blog/spec.md`), `archive/2026-09-06-separate-a-claim-from-a-fact`
      (`specs/pulse/spec.md`), and `archive/2026-09-06-tag-the-corpus-by-domain`
      (`proposal.md`, `specs/wiki/spec.md` and `specs/directory/spec.md`).

- [x] 6. The four carry files deleted in the same diff as their fix, which is
      what retires the queue item: `j-20260905-16-carry-1.md`,
      `j-20260905-19-carry-1.md`, `j-20260905-21-carry-1.md` and
      `j-20260905-22-carry-1.md`.

## Validation

- [x] 7. `npx openspec validate correct-wordings-the-archive-carried --type
      change --strict --no-interactive` passes.

- [x] 8. `node scripts/check-spec-deltas.mjs --strict --root <worktree>` passes:
      four `MODIFIED` headings, every one of them resolving to a requirement
      that exists in its live spec, and no collision with another unarchived
      change.
