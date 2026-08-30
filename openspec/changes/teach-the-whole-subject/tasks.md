# Tasks: teach-the-whole-subject

**How to work this list.** One page per task. Your brief is `openspec/curriculum/learn.md`:
§0 (how to use it), §2 (your rung), §3 (how to write, and what "done"
means), and your page's §4 entry. **The order below is load-bearing**: a
prerequisite naming a page that does not exist under `content/learn/` fails
the build (`lib/corpus.mjs`, `unresolved-reference`), so a task may only be
taken when the tasks it names under "Needs" are checked. Tasks with no
"Needs" line depend only on pages already published today. Every page goes
through the ordinary review gate; nothing here bypasses it.

## 1. Machinery

- [x] **1.1 — Prerequisites may never point up the ladder.** Add
  `checkPrerequisiteLevels(learnDocs, diags)` to `lib/learn.mjs` beside
  `checkPrerequisiteCycles`: for each page, each prerequisite whose
  `LEARN_LEVELS.indexOf(level)` is greater than the page's own is a
  `diags.error` naming the page's file, the field, both slugs and both
  levels. Call it from `lib/site.mjs` beside the cycle check. Tests in
  `lib/surfaces.test.mjs`: an up-pointing prerequisite errors naming both
  levels; same-level and down-level pass; the real corpus is clean.
- [x] **1.2 — The rung purposes on the index.** Rewrite `LEVEL_BLURBS` in
  `lib/render/learn.mjs` to state each rung's purpose in reader terms, taken
  from curriculum §2 (assumed reader and end-capability, one line each) —
  not topic lists, which break as coverage widens. No test pins the current
  strings (verified by grep, 2026-08-29); update any that appears later.

## 2. Orientation — the reader gets the map of the world

- [x] **2.1 — `what-ai-actually-is`** (orientation). The surface's new root;
  every orientation page hangs off it.
- [x] **2.2 — `learning-from-examples`** (orientation). Needs: 2.1.
- [x] **2.3 — Edit `what-a-model-is`**: front matter only, `prerequisites:
  [what-ai-actually-is]`. Body untouched. Needs: 2.1.
- [x] **2.4 — `where-ai-came-from`** (orientation). Needs: 2.1.
- [x] **2.5 — `what-ai-is-used-for`** (orientation). Needs: 2.1.
- [x] **2.6 — `who-builds-ai`** (orientation). Needs: 2.1.
- [x] **2.7 — `where-ai-fails-people`** (orientation). Needs: 2.2, 2.5.

## 3. Foundations — the metaphors become causal models

- [x] **3.1 — `what-a-neural-network-is`** (foundations). Needs: 2.2, 2.3.
- [x] **3.2 — Edit `how-a-language-model-works`**: front matter only,
  `prerequisites: [what-a-model-is, what-a-neural-network-is]`. Body
  untouched. Needs: 3.1.
- [x] **3.3 — `the-kinds-of-models`** (foundations). Needs: 3.1.
- [x] **3.4 — `how-machines-represent-meaning`** (foundations). Needs: 3.1.
- [x] **3.5 — `what-models-are-trained-on`** (foundations). Needs: 2.2.
- [x] **3.6 — `getting-good-answers`** (foundations). Prerequisites already
  published.
- [x] **3.7 — `open-weights-and-closed-models`** (foundations).
  Prerequisites already published.
- [x] **3.8 — `where-your-words-go`** (foundations). Prerequisites already
  published.
- [x] **3.9 — `when-you-cannot-trust-your-eyes`** (foundations). Needs: 3.3.
- [ ] **3.10 — `ai-and-work`** (foundations). Needs: 2.5.

## 4. Mechanics — the parts get their names

- [x] **4.1 — `why-bigger-got-better`** (mechanics). Prerequisites already
  published.
- [ ] **4.2 — `what-a-reasoning-model-does`** (mechanics). Needs: 3.6.
- [ ] **4.3 — `how-image-generation-works`** (mechanics). Needs: 3.3, 3.4.
- [ ] **4.4 — `how-a-model-uses-your-documents`** (mechanics). Needs: 3.4.
- [ ] **4.5 — `how-ai-systems-get-attacked`** (mechanics). Prerequisites
  already published.
- [ ] **4.6 — `running-a-model-yourself`** (mechanics). Needs: 3.7, 3.8.
- [x] **4.7 — `the-hardware-that-runs-ai`** (mechanics). Prerequisites
  already published.
- [ ] **4.8 — `ai-and-the-law`** (mechanics). Needs: 2.7, 3.3, 3.5.

## 5. Advanced — the load-bearing details and the live arguments

- [ ] **5.1 — `what-it-costs-to-build-and-run-ai`** (advanced). Needs: 2.6,
  4.1, 4.7.
- [x] **5.2 — `looking-inside-a-model`** (advanced). Prerequisites already
  published.
- [ ] **5.3 — `the-safety-debates`** (advanced). Needs: 2.7, 4.1.
- [ ] **5.4 — `how-to-think-about-what-comes-next`** (advanced, the
  capstone — lands last in the generated reading order by prerequisite
  depth, and is written knowing it). Needs: 3.10, 4.1, 5.3.

## 6. Verification

- [ ] **6.1 — After each wave**: `npm test`; then whoever publishes runs the
  full gate set per `CLAUDE.md` (the publish step already requires it). The
  ladder index must show every landed page on its rung with no new
  diagnostics, and the two edited pages must show their new "Assumes" lines.
- [ ] **6.2 — At spine completion, measure the surface**: (a) coverage —
  read curriculum §4 against `content/learn/` and confirm every entry
  published and every area of §1 served; (b) distribution — 37 pages,
  orientation 8 / foundations 11 / mechanics 11 / advanced 7; (c) order —
  the generated reading order starts at `what-ai-actually-is` and ends at
  `how-to-think-about-what-comes-next`, and no page precedes any of its
  prerequisites; (d) record the measurements with date and method, per the
  house rule that a claim is a measurement.

## 7. Traceability — every normative clause, its task and its check

### Requirement: The curriculum is a ladder with stated prerequisites (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| levels defined by what a page may assume, not topic | curriculum §2; every §2–§5 page task | review against the rung admission tests; 6.2(b) |
| every page declares level, outcome, prerequisites | every page task | `learnSchema` (existing); build fails on a missing field |
| prerequisites SHALL never point up the ladder; violation fails the build naming both | 1.1 | `lib/surfaces.test.mjs`: up-pointing prerequisite errors naming both levels; real corpus clean |
| in-order reader never sent forward | 1.1 (cross-rung) + existing within-rung toposort | 6.2(c) measures it on the finished surface |
| each level has a stated purpose and admission test; index states it | 1.2; curriculum §2 | 6.1 — the rendered index carries the reader-terms blurbs |

### Requirement: The surface is grown against a written map (ADDED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| a written curriculum divides the subject and enumerates every page | `openspec/curriculum/learn.md` | 6.2(a) reads it against the tree |
| no learn page publishes outside the curriculum; additions amend it visibly | curriculum §0 step 5; every page task | review: `spec-violation` per the delta's scenario |
| coverage checkable when the spine completes | 6.2 | 6.2(a) is the check, recorded with date and method |

### Requirement: Every page lands for its rung's reader (ADDED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| written for the rung's named reader; assumes only transitive prerequisites | curriculum §3 tests (named-reader pass, the forgetting); every page task | review: `spec-violation` naming the undeclared assumption |
| term of art given its meaning at introduction (orientation/foundations); no notation below mechanics | curriculum §3 (term-of-art audit) | review, per the jargon scenario |
| at least one sendable sentence per page | curriculum §3 (sendable sentence); every page task | review: `not-worth-reading` in those words when the reviewer cannot name it |
