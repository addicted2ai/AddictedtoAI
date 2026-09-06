# Tasks

Implemented 2026-09-06 (local), on branch `impl/flag` under mission
`addictedtoai-h0z0`: tasks 1–11 — the vocabulary and the criteria in
`lib/domains.mjs`, the build gate on `postSchema`, the review-hash guard, the
scout's cap exemption at merge, and the scout and post briefs — are done and
ticked, and task 12 (the drafting gates) was run at drafting time. **Task 13 is
the only open box**: the six gates on merged `main`, which are the
orchestrator's to run and not a job's.

**Tasks 10–11 landed on BOTH sides of the review gate, and the second side is
recorded here because it is the one the tasks do not name.** The tasks say
"the brief", and the brief is the AUTHORING half: `ACCEPTANCE_BY_TYPE.scout`
and `ACCEPTANCE_BY_TYPE.post` in `loop/lib/brief.mjs`, plus the front-matter
contract block in `proposalRule('scout')` — the block that says "front matter
exactly", which now carries `frontier`, `frontier_reason` and `domains`
alongside the six original keys, because a key absent from it is a key the job
is told not to write.

The JUDGING half is `loop/lib/review.mjs`, `CHECKLISTS.post` (the frontier
entry and the F2 permitted/forbidden lists) and `CHECKLISTS.scout` (the
unflagged-cap entry and the frontier-decline entry), measured in
`loop/tests/review-blog-bar.test.mjs`. It is not scope creep and it is not
optional: `excerptsFor` assembles spec text for the AUTHOR's brief alone, so a
reviewer receives no spec text at all, and the delta's scenarios "review
rejects the flag as `spec-violation` naming the not-qualifying list" and
"naming the forbidden list" are impossible unless the checklist carries both
lists itself. Task 11's "both lists go in the brief verbatim" was read as "and
in the checklist", which is the correct reading; this paragraph makes it a
visible one rather than a fact recoverable only from commit messages
`35c1760` / `131dac6`.

## The vocabulary and the schema

- [x] 1. `lib/domains.mjs` (new): the closed domain vocabulary — `coding`,
      `agents`, `image`, `video`, `audio`, `research`, `science-math`,
      `robotics` — as one frozen constant, and the frontier criteria `F1`–`F5`
      as another. **One definition in the source tree**: the §3 wiki facet
      reads this file when it lands rather than restating the list. Two closed
      lists of the same eight values drift, and the drift is silent.
- [x] 2. `lib/schema.mjs`: add `frontier`, `frontier_reason` and `domains` to
      `postSchema`. The schema is `.strict()`, so without this the three keys
      are rejected outright and no post can carry them. `frontier` defaults
      false; the other two are optional at the field level and made conditional
      by task 3, because a required field would reject every unflagged post.
- [x] 3. `lib/schema.mjs`: a `superRefine` on `postSchema` — `frontier: true`
      with no `frontier_reason`, a `frontier_reason` outside F1–F5, or any
      `domains` value outside the vocabulary is an issue whose `path` names the
      offending field. **An absent or empty `domains` is not an issue**,
      flagged or not: absence is the vocabulary's "general" (K46), and a gate
      that fails it contradicts the vocabulary. This is
      the build gate: schema validation runs in the `content` prebuild step
      (`scripts/prebuild.mjs` STEPS), which already reports the file and the
      field, so the gate needs no new step and no new entry point.

## The tests that make the gate a mechanism

- [x] 4. Tests beside `lib/schema.mjs`, one per refusal, each naming the field
      it expects in the error: flag with no reason; flag with `frontier_reason:
      F6`; flag with `domains: [legal]`; flag with `domains: [text]` (the
      vocabulary deliberately excludes it — general is unmarked).
- [x] 5. The controls, without which task 4 proves nothing: a post with no
      `frontier` key validates exactly as before; a post with
      `frontier: false` and no other new key validates; a fully valid flagged
      post validates and round-trips all three values; and — the control that
      pins K46 — a flagged post with a valid `frontier_reason` and **no**
      `domains` key validates, as does one with `domains: []`.
- [x] 6. `lib/review-hash.test.mjs`: assert that `frontier`, `frontier_reason`
      and `domains` are **absent** from `MECHANICAL_FRONT_MATTER_KEYS`, and
      that a post gaining any of them changes its `reviewedHash`. This is a
      guard against a specific, identified future defect, not a tautology:
      `reviewedSurface` filters keys by name across every content kind with no
      per-kind scoping (`lib/review-hash.mjs:99-102`), so the §3 change adding
      a machine-seeded entry field literally named `domains` to that list would
      silently exempt a **post's** editorial `domains` from review. The test
      makes that a red build in the change that does it.

## The scout's cap, and the exemption that lifts it

- [x] 7. `loop/lib/proposals.mjs`, `applyProposalMergeRules` (line 674): before
      the `entries.slice(cap)` split, partition the added candidate files into
      three groups — valid-flagged, unflagged, and invalid-flagged. Only
      unflagged files are counted against `proposalCapFor(type)`. **The
      exemption applies to the scout's cap and to no other**: DESK-ORDER-001
      exempts a flagged story from the three-candidates-per-day cap, and
      nothing decided that an ordinary job's one-proposal side-output rule may
      be lifted by flagging. A non-scout job's flagged proposal is capped
      exactly as before.
      Valid-flagged files are all kept. Invalid-flagged files — `frontier:
      true` with no `frontier_reason`, a reason outside F1–F5, or a `domains`
      value outside the vocabulary — go to
      `data/proposals/dropped/` with a note naming the missing or invalid
      field, and do **not** rejoin the unflagged group. A flag that does not
      hold must not be able to buy a place among the three by failing.
- [x] 8. Tests in `loop/tests/`: four candidates, one validly flagged, all four
      merge. Four candidates, none flagged, one is dropped — the control that
      proves the cap still binds. A flagged candidate with no criterion is
      dropped with the reason named and does not displace an unflagged one.
      Stamping and self-amplification discard still run on the kept set in the
      documented order (cap, stamp, discard), unchanged.
- [x] 9. Mutation test, both halves separately: revert the partition and
      confirm the exemption test fails while the control passes; revert the
      invalid-flag drop and confirm that test fails while the others pass. Two
      mutations failing disjoint sets is the evidence the halves are
      independent rather than one mechanism described twice. Restore and verify
      the file byte-identical by hash.

## The briefs, because a job is told or it cannot know

- [x] 10. `loop/lib/brief.mjs`, `ACCEPTANCE_BY_TYPE.scout` (line 128): add the
      standing frontier sweep — F1–F5 asked on every run across every domain,
      the not-qualifying list and its test, radar feeds as inputs that are
      never displayed raw, the flag's own bar, that a valid flag does not spend
      one of the three, and that a flag applied to fill a quiet domain is the
      failure the criteria exist to prevent. A Desk job is one written prompt
      in and files out; an untold job cannot know.
- [x] 11. `loop/lib/brief.mjs`, `ACCEPTANCE_BY_TYPE.post`: add the three keys,
      the F2 permitted and forbidden lists in full, and that adding any of the
      three to an already-reviewed post is a review event rather than a
      correction. Both lists go in the brief verbatim — a brief that carries
      only the permitted list re-teaches the field-name-is-not-a-source-test
      lesson at full price.

## Gates

- [x] 12. `openspec validate flag-what-moved-the-frontier --type change
      --strict --no-interactive`, and
      `node scripts/check-spec-deltas.mjs --strict`. Run at drafting time.
- [ ] 13. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics`.

## Not tasks of this change, recorded so they are not read as omissions

- The **backfill** of the existing posts is DESK-ORDER-001's own `verify`
  directive line, deliberately separate. Measured 2026-09-05: all 14 posts
  under `content/blog/` are named by at least one review record carrying a
  `reviewed:` hash, so every tag lands on an already-reviewed surface and goes
  back through the review gate. That cost is the correct one and is not to be
  avoided by exempting the keys.
- The **display contract** is the UI's next brief and belongs to `site`.
- The **radar feed registry rows** are ordinary data changes (`specs/pulse`:
  adding a source is not an OpenSpec change).
- The **`lead-change` event kind** and the **vendor-claim record** are §4 and
  are their own change.
