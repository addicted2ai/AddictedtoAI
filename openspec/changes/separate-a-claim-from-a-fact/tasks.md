# Tasks

Drafted, not implemented. Every box below is open except task 27, the drafting
gate, which was run. The change is deliberately not archived: it has no
implemented tasks, `DESK-ORDER-001` §6 sequences §4 fourth, and the maintainer's
2026-09-05 instruction is that the ui-loop session reads this delta before it is
treated as final.

Line numbers were read from the tree on 2026-09-05 and are pointers, not
promises.

## The claim record — a seventh content type

- [ ] 1. `lib/paths.mjs`, `CONTENT_TYPES` (line 42): add
      `claim: { dir: 'claims', glob: 'claims/**/*.md' }`. Create
      `content/claims/README.md`, which the loader skips as it skips
      `content/wiki/README.md`.
- [ ] 2. `lib/schema.mjs`: a `claimSchema`, `.strict()`, registered in `SCHEMAS`
      (line 420). `subject` reusing the existing `entryId`; `field` reusing
      `FIELD_NAME_RE`; `quote` a non-empty string; `source_url` reusing
      `httpUrl`; `source_host` a lowercase host; `accessed` reusing `isoDate`;
      `verified` optional and modelled as
      `z.union([z.literal(false), z.object({ by, url, date }).strict()])`.
      **`verified: true` must produce a message naming the file and saying a
      confirmation carries `by`, `url` and `date`** — a bare union rejection
      would name the union and teach nothing.
- [ ] 3. `lib/schema.mjs`: `PROSE_FIELDS.claim` and `NON_PROSE_FIELDS.claim`,
      every string field classified with its reason. Without this
      `assertFieldsClassified` (line 663) fails the build, which is the intended
      behaviour of that gate and the reason this is a task rather than an
      afterthought. `quote` is NON_PROSE for the reason `facts[].value` is
      (line 502): it is the data layer, transcribed. Note in the reason that the
      volatile-literal scan would in any case exempt it, because the record
      carries a sibling `accessed` date — the mechanical exemption in
      `lib/currency.mjs`, not a blessed-field list.
- [ ] 4. `claimSchema.superRefine`: `source_host` equals the host parsed from
      `source_url`, lowercased. Message names both values.
- [ ] 5. `lib/corpus.mjs`, `urlFor` (lines 30-49) **throws for an unknown type**,
      so a seventh type without a branch breaks the build immediately. A claim's
      URL is its subject entry's URL plus a stable fragment
      (`/wiki/org/moonshot-ai#claim-<slug>`), which requires the subject lookup —
      decide whether `urlFor` takes the corpus or whether claims are resolved in
      a separate pass, and record the decision in the code.
- [ ] 6. The carve-outs a route-less content type needs, each verified by
      grepping for how the six existing types reach the surface: the sitemap
      (`app/sitemap.ts`), the search index, `lib/crawlers.mjs`'s llms.txt, and
      the indexability join. A claim is **not** a document; it must not appear in
      any of them in its own right. This is the largest unknown in the change and
      the reason item 2 of the proposal's uncertainty list exists.
- [ ] 7. `lib/corpus.mjs`, `checkReferences` (lines 162-219): resolve a claim's
      `subject` against `corpus.byId` exactly as `mentions` is resolved, so an
      unresolvable subject fails the build naming the file and the id.
- [ ] 8. A duplicate check: two claim records sharing all of `subject`, `field`,
      `source_url` and `accessed` fail the build naming both files. Records
      sharing only `subject` and `field` are legal — a vendor repeating itself is
      real — and a test asserts that.
- [ ] 9. `lib/reviews.mjs`, `reviewablePieces` (line 280): append claims to the
      fixed list. The comment above it says the order is part of the join, so add
      at the end and say why in the same comment.
- [ ] 10. **Do not add anything to `MECHANICAL_FRONT_MATTER_KEYS`**
      (`lib/review-hash.mjs:71`). A test asserts that neither `verified` nor
      `claims` is a member, with the reason in the assertion message: the filter
      matches by key name across every content kind (`:99-102`), so exempting
      `verified` would exempt any key of that name on any kind, and a
      verification is a judgment that publishes through review. This is the same
      mechanism `tag-the-corpus-by-domain` navigated from the other side.
- [ ] 11. Render claims on the subject entry's page: the label on the claim, the
      attributing party before the fragment, the three verification states as
      three renderings and absent as none, the source link and `accessed` date.
      One test per state, and a test that a subject with cited facts and no claim
      records renders no claim block at all.

## The vendor test — one implementation, no second copy

- [ ] 12. `lib/schema.mjs`, `entrySchema` (line 209): `publishes_from`, optional
      array of strings. The schema is `.strict()`, so without this the key is
      rejected outright.
- [ ] 13. A new module holding the registrable-domain rule and the multi-label
      public-suffix table, read by every consumer. Precedent for the shape:
      `TOOL_CATEGORIES` was split into `lib/tool-categories.mjs` (beads
      `addictedtoai-bju`) so a second consumer could read the closed list without
      a second copy, and that file's header says nothing else should declare one.
- [ ] 14. Tests for that module drawn from the round-5 addendum's own worked
      cases, because they are the ones the two previous implementations got
      wrong: `www.tencent.com` → `tencent.com`; `deepmind.google` →
      `deepmind.google`; `blog.google` → `blog.google`, and **not** equal to
      `deepmind.google` or `google.com`; `google.attacker.example` →
      `attacker.example`. Plus the two rejected tests as negative cases: a
      label-identity test that clears `google.<anyone-else>`, and an
      `endsWith('.' + recorded)` test, each asserted to be wrong on a case the
      correct rule gets right.
- [ ] 15. A build gate: a `publishes_from` value that is not equal to its own
      registrable-domain reduction fails, naming the entry, the value and the
      reduction to declare instead (`platform.kimi.ai` → `kimi.ai`).
- [ ] 16. The attribution function itself, in one place: a claim is the subject's
      when `source_host`'s registrable domain is in the subject's
      `publishes_from`, or its registrable label is one of the subject's name
      tokens (`display_name` and declared `aliases`). Nothing else. A test per
      branch and a test that a third party's host matches neither.

## The change-line kinds, which are not closed today

- [x] 17. A new `lib/change-kinds.mjs` exporting the closed list —
      `arrival`, `release`, `field_change`, `retirement`, `annotation`,
      `lead-change` — with the reason in its header. `pulse/lib/` already imports
      from `../../lib/` (`pulse/lib/indexnow.mjs:101-102`), so one home is
      reachable from both sides.
- [x] 18. **Delete `MATERIAL_KINDS` (`lib/changes.mjs:35`).** It is imported
      nowhere — confirmed by grep, by
      `loops/ui-loop/graph/knowledge/review-frontier.md:137`, and by the live
      carried finding `data/carried/j-20260905-04-carry-1.md` — and three of its
      five values (`price`, `context`, `status`) are material field names, not
      kinds, appearing as a `kind` on zero of the 182 lines. Updating it instead
      of deleting it leaves two lists, one of which is wrong and unread.
- [x] 19. `pulse/lib/diff.mjs`, `appendChanges` (line 334): refuse a candidate
      whose kind is not a member, naming the kind. Replace the literals at the
      emission sites (lines 209, 232, 250, 301) with reads of the constant, and
      the equality tests in `lib/changes.mjs` (172-173, 196, 202) and
      `pulse/lib/queue.mjs:323` likewise.
- [x] 20. The build's summary reports the count of committed lines carrying an
      unrecognised kind, and does **not** fail. `readChanges`
      (`lib/changes.mjs:45-57`) already tolerates a malformed line on the stated
      grounds that it is the Pulse's problem to report; this keeps that stance and
      makes the report exist.
- [x] 21. A test that a `lead-change` line inside the trailing window produces no
      `interpret` queue item. `uninterpretedChanges` filters `kind !==
      'field_change'` (`pulse/lib/diff.mjs:397`), so this is true today by
      accident of that filter's shape; the test is what makes it a decision.

## The lead-change lines and the derived file

- [x] 22. The `frontier` block on the source registry: declared metrics with
      publisher, path, direction, label, republisher; the eligibility exclusions
      as declared patterns with the measurement behind each recorded in the row;
      and the republication decision per metric (terms URL, date read, outcome,
      verbatim excerpt). Adding to the registry is an ordinary data change
      (`specs/pulse`); the shape it must carry is the requirement.
- [x] 23. `pulse/lib/frontier.mjs`: leaders, ranked rows and counts into
      `data/derived/frontier.json`; `lead-change` candidates from the standing
      diff with a computed `cause`; keys a pure function of the two row hashes,
      the metric and the kind. One write call, `appendChanges`. No clock read:
      the snapshot's own date only. `describeChange` (`lib/changes.mjs:171-182`)
      gains one branch, with no adjective in the sentence it produces.
- [x] 24. `pulse/tests/frontier.test.mjs`, fixtures under the OS temp dir per the
      test convention: (a) unchanged snapshots → zero lines and a byte-identical
      derived file; (b) a new row taking the lead → exactly one line,
      `cause: arrival`; (c) the old leader marked down → `cause: rescored`;
      (d) the same leader marked down with no identity change → the other event,
      not a lead change; (e) re-running (b) appends nothing; (f) deleting the
      appended line and re-running restores it.
- [x] 25. A one-time seeding script run by the orchestrator, not by a job and not
      by the Pulse: replay the committed snapshot blobs via Node plumbing
      (`execFileSync('git', ['show', '<sha>:<path>'])`, never `git show` through
      Git Bash — the CLAUDE.md Windows note about MSYS mangling `rev:path`),
      append `seeded: true` lines with keys derived from the snapshot date, and
      one baseline line per metric stating that observation began there.
      Idempotent; never overwrites an observed entry.
- [x] 26. The renderer test that distinguishes an empty state from a picture of
      one: a fixture with a cleared metric makes the same renderer produce a
      value. Asserting that the renderer is empty when nothing is registered
      proves only what a hard-wired string would also prove — which is exactly
      how the shipped defect passed its own review.

## Gates

- [x] 27. `openspec validate separate-a-claim-from-a-fact --type change --strict
      --no-interactive`, and `node scripts/check-spec-deltas.mjs --strict`. Run
      at drafting time.
- [ ] 28. `npm test`, `npm run build`, `node scripts/verify-launch.mjs`,
      `verify-design`, `verify-surfaces`, `verify-analytics`.

## Not tasks of this change, recorded so they are not read as omissions

- **Filing any claim record, and migrating any existing fact into one.** Which of
  the 92 cited facts on the 16 org entries are claims is an editorial judgment
  through the review gate and belongs in a directive line. The claim surface
  renders empty until records exist, which is §4's own instruction.
- **Building `/frontier` or the players board.** The display contract binds any
  surface that renders a claim or an index value; this change builds none.
- **Registering any index, or clearing anyone's republication terms.**
  `addictedtoai-ego8` (Artificial Analysis) and `addictedtoai-c563` (Design
  Arena) are `verify` work with owners.
- **The benchmark model** — `frontier-plan.md` §5's `benchmark:` and
  `verification:` blocks on cited facts, the `benchmark/*` entries, the evidence
  files and the coverage line. It overlaps this change at the word "verified" and
  is deliberately separate: a benchmark score is a measurement with a method, a
  vendor claim is a sentence somebody said, and folding them together is the
  collapse this change exists to undo. Where they meet is that a vendor-claimed
  benchmark score is both, and whichever of the two lands second inherits the job
  of saying how they compose.
- **Adding a job type or a queue reason.** Both are separately gated and neither
  is needed to file a claim record.
- **`data/carried/j-20260905-04-carry-1.md`.** It is a correction to a proposal's
  sentence, its file *is* the queue item, and it retires by being fixed and
  deleted in the same diff. Task 18 removes the constant it complains about,
  which does not make its correction wrong or its file this change's to delete.
