# Tasks: let-the-site-see-its-own-gaps

Every normative sentence in `specs/` names its task here, and every task names
the check that measures it. The traceability table at the bottom is the audit.

## 1. The shared reading of the curriculum

- [x] **1.1 — Parse the curriculum's catalog.** Add `curriculumSlugs(text)` to
  `lib/learn.mjs`: slice the document from the `## §4` catalog heading to the
  next `## §` heading, and return every `#### \`slug\`` entry in that section,
  in document order, deduplicated. A document with no catalog section returns
  `null` — distinct from an empty catalog, which returns `[]`, because "the map
  is unreadable" and "the map is empty" are different facts and only one of them
  is a build failure. *(design D7)*
  **Check:** `lib/learn.test.mjs` — 38 slugs from the real curriculum; a
  `#### \`x\`` outside §4 is not an entry; no catalog section yields `null`.

- [x] **1.2 — The curriculum path is a constant.** Add `CURRICULUM_FILE` to
  `lib/paths.mjs` beside the other roots, so no module builds the path itself.
  **Check:** used by 1.3; `lib/learn.test.mjs` reads the real file through it.

## 2. The build gate — an undeclared page stops the build

Implements: *"A published learn page whose slug appears in no curriculum entry
SHALL fail the build, naming the page's file, the slug, and the path of the
curriculum of record, before any page renders"*, *"SHALL read the curriculum's
catalog section and no other part of it"*, and *"SHALL fail with one error
naming that file, rather than one error per page"*.

- [x] **2.1 — `checkCurriculumCoverage(learnDocs, curriculumText, diags)`** in
  `lib/learn.mjs`, beside `checkPrerequisiteCycles` and
  `checkPrerequisiteLevels` and following their shape exactly (a `diags.error`
  carrying `file`, `field`, `message`, `rule`). Rule name `learn-undeclared`
  for a page outside the map, `learn-no-curriculum` for an unreadable map. The
  unreadable case emits exactly one error and returns.
  **Check:** `lib/surfaces.test.mjs` — an undeclared page errors naming file,
  slug and curriculum path; a declared page passes; an unreadable curriculum
  emits exactly one error however many pages are published.

- [x] **2.2 — Call it from `lib/site.mjs`** immediately beside the other two
  learn checks, before `site.diags.throwIfErrors('surfaces')` — which is what
  makes "before any page renders" true rather than intended, on the same
  reasoning `teach-the-whole-subject` task 1.1 recorded for its own call site.
  **Check:** task 5.1's mutation — add an undeclared page to `content/learn/`
  and watch `npm run build` stop.

- [x] **2.3 — The real corpus is clean.** A test that loads the real corpus and
  the real curriculum and asserts zero errors, so the guarantee is measured on
  the shipped tree and not only on fixtures.
  **Check:** `lib/surfaces.test.mjs`, "the real learn corpus is fully declared".

## 3. The queue producer — a declared page nobody wrote becomes work

Implements: *"the Pulse SHALL derive one queue item for each enumerated page
that `content/` does not publish"*, the `education`/`curriculum-gap`/rank
clause, the set-difference clause, the retire-by-recomputation clause, and the
tolerant-reading clause.

- [x] **3.1 — `RANKS['curriculum-gap'] = 28`** in `pulse/lib/queue.mjs`, with
  the rank's argument written in place as every other entry's is — below
  `want-eligible-mint` (30), above `carried-finding` (25). *(design D3)*
  **Check:** `pulse/tests/curriculum-queue.test.mjs` asserts the ordering
  against both neighbours rather than the literal 28.

- [x] **3.2 — `readCurriculumSlugs(root)`** in `pulse/lib/queue.mjs`: the
  Pulse's own tolerant parse, returning `[]` for an absent, unreadable or
  catalog-less file. Its header states why it does not import `lib/learn.mjs`
  and points at `pulse/lib/corpus.mjs`'s boundary. *(design D6)*
  **Check:** 3.5's absent-curriculum test; and 4.1's cross-parser agreement.

- [x] **3.3 — `publishedLearnSlugs(root)`** in `pulse/lib/queue.mjs`: the
  filenames under `content/learn/`, `README.md` excluded, read the way
  `coveredKeys` reads `content/blog/` — directly, tolerantly, never through the
  build's loader.
  **Check:** covered by 3.5.

- [x] **3.4 — `curriculumGapItems(root)`** returning one `item('education',
  'curriculum-gap', slug, …)` per declared-but-unpublished slug, in curriculum
  order; called from `computeQueue`.
  **Check:** `pulse/tests/curriculum-queue.test.mjs`.

- [x] **3.5 — Tests for the four scenarios**, in
  `pulse/tests/curriculum-queue.test.mjs`, run through the real `pulse/run.mjs`
  against a throwaway root like every other Pulse test: a declared page with no
  file becomes one `education` item naming the slug; writing the file empties it
  on the next run with no other action; a fully published map yields no item and
  exits 0; an absent curriculum yields no item, exits 0 and reports nothing
  broken.

## 4. The decision on record

Implements: *"The Pulse SHALL declare, as a closed list in the queue's own
source, every job type the derived queue may produce, together with the reason
the remaining types are not on it"* and *"Every item the queue computes SHALL
carry a type from that list, and a violation SHALL fail the test suite"*.

- [x] **4.1 — `QUEUE_PRODUCIBLE_TYPES`** exported from `pulse/lib/queue.mjs`,
  carrying the six producible types and, in the comment beside it, the decision
  for each of the four that are absent — with `design.md` D4 and D5 named.
  **Check:** `pulse/tests/curriculum-queue.test.mjs` — every item a
  deliberately-mixed `computeQueue` produces carries a type from the list; the
  list is a subset of the loop's `JOB_TYPES`; and the excluded four are named.

- [x] **4.2 — The two parsers agree.** `lib/learn.test.mjs` reads the real
  `openspec/curriculum/learn.md` through `curriculumSlugs` and through the
  Pulse's `readCurriculumSlugs` and asserts identical lists. This is the price
  of D6's deliberate duplication, paid in measurement.
  **Check:** the test itself.

## 5. Verification

- [x] **5.1 — Mutation: the build gate.** Add a learn page that is in no
  curriculum entry, run `npm run build`, record that it fails naming the file
  and the slug, remove it, confirm the tree is byte-identical.
- [x] **5.2 — Mutation: the queue producer.** Add a curriculum entry for a page
  that does not exist, run the Pulse, record the item; remove it; confirm the
  queue returns to zero items and the tree is byte-identical.
- [x] **5.3 — Gates, serially, once:** `npm test`, `npm run build`,
  `node scripts/verify-launch.mjs`.

## Traceability

| Normative sentence (spec) | Task | Check |
|---|---|---|
| es: undeclared page fails the build naming file, slug, curriculum path | 2.1, 2.2 | `surfaces.test.mjs`; mutation 5.1 |
| es: reads the catalog section and no other part | 1.1 | `learn.test.mjs` (`#### \`x\`` outside §4) |
| es: unreadable curriculum is one error, not one per page | 2.1 | `surfaces.test.mjs` (exactly-one assertion) |
| pulse: one item per enumerated-but-unpublished page | 3.4 | `curriculum-queue.test.mjs` |
| pulse: `education` + `curriculum-gap`, ranked below `want-eligible-mint` | 3.1, 3.4 | `curriculum-queue.test.mjs` (neighbour ordering) |
| pulse: set difference, no scoring | 3.4 | code has no comparator; `curriculum-queue.test.mjs` order is curriculum order |
| pulse: retires by recomputation alone | 3.4 | `curriculum-queue.test.mjs` (write the page, item gone) |
| pulse: absent/unreadable curriculum yields no items, no halt | 3.2 | `curriculum-queue.test.mjs` (exit 0, zero items) |
| pulse: closed list of producible types, with reasons | 4.1 | `curriculum-queue.test.mjs` |
| pulse: every computed item carries a listed type | 4.1 | `curriculum-queue.test.mjs` |
