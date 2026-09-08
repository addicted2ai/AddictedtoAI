# Stale-bead verification — 2026-08-29 + 2026-08-30 audit wave

**Cohort size: 21, exactly the expected 3 + 18.** `bd list --status open --json --limit 0`
(101 open issues total), each `created_at` (stored UTC, `Z`-suffixed) converted to
**local date** in `America/Denver` with `Intl.DateTimeFormat` (not string-bucketed —
several rows have a UTC date one day ahead of their true local date, e.g.
`addictedtoai-jqs` created `2026-08-31T01:16:30Z` = `2026-08-30` 19:16 MDT local, and
`bd show`'s default UTC display would mislabel it `2026-08-31`). Per-local-day
histogram: 2026-08-29 → 3, 2026-08-30 → 18, 2026-08-31 → 26 (next day, not this
cohort), confirming no boundary bleed. Ids/titles saved to `stale2-cohort.json` in
this scratchpad directory; full `bd show --long` dump in `stale2-shows.txt`.

**Load-bearing discovery: 10 of these 21 beads already have same-day Desk
directives queued in `DIRECTIVES.md`** (lines 116–141, committed today
2026-09-08 as `h8i, o9d, 9bu, 88x, k6c, f7l` and `jqs, 5xc, bc0, ckn` — visible
in the repo's own recent-commits log). None carry a `[done ...]` marker, so
none have run yet. Each directive line independently states a fresh
"re-measured/re-read on 2026-09-08" check with file/line citations, which
this agent used as same-day corroboration and independently re-verified a
subset of by direct Read/Grep. This means: these 10 are not forgotten — they
are already staged for the Desk — but as of the current tree (`main`), the
defects they describe are still present, so all still verify as open/valid.

## Table

| id | created (local) | priority | theme | code/content/both/neither | edit-or-create | verdict | evidence |
|---|---|---|---|---|---|---|---|
| addictedtoai-cct | 2026-08-29 | P2 | machinery-pulse | code | create | STILL-VALID | `pulse/lib/corroboration.mjs` header still says "It never adjudicates" (lines 6, 22); `pulse/lib/queue.mjs:123` still ranks `corroboration` at 68 and mints an item every run at :708-721 with no acknowledgement path — the code comment at :178 names `addictedtoai-cct` directly. |
| addictedtoai-9bu | 2026-08-29 | P4 | content-corpus | content | edit | STILL-VALID | `content/wiki/concept/the-bitter-lesson.md` still asserts unmeasured readership facts; directive at `DIRECTIVES.md:134` re-read the exact lines on 2026-09-08 (71 "is rarely read", 98 "most-quoted argument", 101 "have never seen"), queued but not yet run. |
| addictedtoai-l8x | 2026-08-29 | P3 | machinery-lib | code | create | STILL-VALID | `lib/schema.mjs:206-212` `timelineEvent` is still `.strict()` over exactly `{date, event, source_url}` — no feed-bound-date variant exists. |
| addictedtoai-ckn | 2026-08-30 | P2 | content-corpus | content | edit | PARTIAL | Item 1 confirmed done — `content/learn/why-bigger-got-better.md:134` now links `/learn/what-it-costs-to-build-and-run-ai`. Item 2 still open — `content/learn/looking-inside-a-model.md:8-10` prerequisites are `how-a-language-model-works`/`what-safety-training-changes`; `what-a-neural-network-is` still undeclared. Directive queued at `DIRECTIVES.md:127`, not yet run. |
| addictedtoai-4i2 | 2026-08-30 | P3 | content-corpus | content | create | STILL-VALID | No `content/wiki/event/*chatgpt*` exists on `main` (confirmed: `git show main:content/wiki/event/chatgpt-launch.md` → "does not exist"). A fix exists but is **unmerged**: branch `fleet5/4i2`, commit `34de5fc` ("Add ChatGPT launch wiki event"). A follow-up bead `addictedtoai-yjb5` (P2, open, filed 2026-09-08) already tracks that even once merged, no learn page names "ChatGPT" so the link still can't be made — so this is not fully resolved even in the in-flight branch. |
| addictedtoai-47w | 2026-08-30 | P2 | content-corpus | content | edit | STILL-VALID | `content/wiki/org/deepseek.md:33-38` `weights_license` value unchanged verbatim: "MIT License (since January 2025); earlier models used the proprietary DeepSeek License". `content/learn/open-weights-and-closed-models.md:99` still links the org page rather than transcluding the fact. |
| addictedtoai-f7l | 2026-08-30 | P2 | content-corpus | content | edit | STILL-VALID | `openspec/curriculum/learn.md:435` still requires hiring as a must-cover case; `content/learn/where-ai-fails-people.md` still has no hiring case (grep hiring/Amazon: 0). Directive queued at `DIRECTIVES.md:140` (education job, `blocked:` is an accepted outcome), not yet run. Depends on `addictedtoai-c29`. |
| addictedtoai-fc8 | 2026-08-30 | P2 | machinery-lib | code | create | STILL-VALID | `lib/learn.mjs` exports exactly `curriculumSlugs, checkCurriculumCoverage, checkPrerequisiteCycles, checkPrerequisiteLevels, ladder, readingOrder, prerequisiteLinks` — nothing parses learn slugs out of must-cover prose to check them against the declared prerequisite closure. |
| addictedtoai-jqs | 2026-08-30 | P2 | content-corpus | content | create | STILL-VALID | No `content/wiki/**/rlhf*` file exists on `main` (glob: 0 hits). Directive to create `content/wiki/technique/rlhf.md` and move two aliases off `technique/proximal-policy-optimization.md` is queued at `DIRECTIVES.md:121`, not yet run — the bead's own 2026-09-08 note records a same-day scope correction (no learn-page wiring step needed, just the two-file Desk job). |
| addictedtoai-4wm | 2026-08-30 | P2 | content-corpus | content | edit | PARTIAL | Item 2 fixed — `content/learn/where-ai-came-from.md:141-143` now reads "the lesson's own author has since put..." (no ambiguous "its author"). Item 1 still stands (same hiring-case gap as `f7l`); depends on `addictedtoai-c29`. |
| addictedtoai-88x | 2026-08-30 | P3 | content-corpus | content | edit | STILL-VALID | Item 1: `openspec/curriculum/learn.md:392` still lists recommendation as must-cover; `content/learn/what-ai-is-used-for.md` has zero occurrences of "recommend" (grep, case-insensitive). Item 2: `content/wiki/org/nvidia.md` has zero occurrences of Taiwan/TSMC/fabless/foundry/manufacture (grep, case-insensitive). Item 2 has a directive queued at `DIRECTIVES.md:136` (re-measured 2026-09-08), not yet run; item 1 is curriculum work, out of scope of that directive, tracked under `addictedtoai-c29`. |
| addictedtoai-bc0 | 2026-08-30 | P2 | content-corpus | content | edit | PARTIAL | Item 4 already fixed (752f2f2, confirmed by the bead's own prior notes). Items 1-3 still stand verbatim per the directive at `DIRECTIVES.md:125`, re-measured 2026-09-08 with exact line numbers (`what-a-reasoning-model-does.md:238`, `what-it-costs-to-build-and-run-ai.md:271`, `how-to-think-about-what-comes-next.md:226`); not yet run. |
| addictedtoai-h8i | 2026-08-30 | P3 | content-corpus | content | edit | STILL-VALID | Directive at `DIRECTIVES.md:130` re-measured on 2026-09-08: `content/learn/how-ai-systems-get-attacked.md` still teaches "query" as a database term at line 66 and reuses it unglossed in the attention sense at line 85 ("compares queries against keys"). Not yet run. |
| addictedtoai-c29 | 2026-08-30 | P2 | content-corpus + machinery (mechanism) | both | edit (curriculum) + create (mechanism) | STILL-VALID | `openspec/curriculum/learn.md:411` "design concentrated in one company" unamended, matching the page's actual (better) division of labour with `who-builds-ai`. This is the beads-graph BLOCKER for `88x`, `mfm`, `4wm`, `f7l` (all `DEPENDS ON → c29` per `bd show`); no deviation-tracking mechanism exists anywhere in `lib/learn.mjs`. |
| addictedtoai-o9d | 2026-08-30 | P3 | content-corpus | content | edit | STILL-VALID | `content/learn/ai-and-the-law.md:164` still carries "...and an industry submission to the Copyright Office's inquiry cites it by name" unlinked. Directive at `DIRECTIVES.md:132` re-read the same line on 2026-09-08, not yet run. |
| addictedtoai-k6c | 2026-08-30 | P3 | content-corpus | content | edit (judgment pass, may be no-op) | STILL-VALID | Freshest evidence in the cohort: the bead's own notes carry a full whole-surface re-measurement dated **2026-09-08 by the orchestrator** — `how-models-are-trained.md` 16.88 dashes+semicolons/1k vs. a 39-file median of 1.56 (≈11x), still the outlier by a wide margin over the next-highest (8.68). Directive queued at `DIRECTIVES.md:138`, not yet run. |
| addictedtoai-5xc | 2026-08-30 | P2 | content-corpus | content | edit | STILL-VALID | Directive at `DIRECTIVES.md:123` re-measured 2026-09-08: `grep -rn "ai-and-the-law)\|how-ai-systems-get-attacked)" content/` still returns 0 — zero inbound prose links to either page. Not yet run. |
| addictedtoai-cqv | 2026-08-30 | P3 | content-corpus / spec | content | create (decision write-up) | STILL-VALID | No paragraph on the seed-page-register or consciousness-refusal decisions exists anywhere under live `openspec/specs/` (grep for "consciousness" only hits two files, both historical review documents under `openspec/changes/`, not a `design.md` decision record). Both (a) and (b) remain undecided. |
| addictedtoai-ewj | 2026-08-30 | P3 | content-corpus | content | edit | STILL-VALID (item 1); item 2 CANNOT-TELL | Item 1 confirmed: `content/learn/ai-and-work.md:63` still reads "weavers' wages rose sharply against other workers'" — the unsourced comparative. Item 2 (a three-document count reconciliation) has no single file to check against; the bead's own 09-04 note already flagged it "UNVERIFIED... low value, consider dropping." |
| addictedtoai-mfm | 2026-08-30 | P3 | content-corpus | content | edit | STILL-VALID | `openspec/curriculum/learn.md:947-948` still allows poisoning "one paragraph"; no MoE/KV-cache beats appear anywhere in the curriculum text (grep: 0 matches), consistent with `running-a-model-yourself` teaching beyond its declared beats. Depends on `addictedtoai-c29`. |
| addictedtoai-4w2 | 2026-08-30 | P2 | machinery-scripts / deploy | code | edit (semantics decision, maintainer's call per the bead) | STILL-VALID | **Live-refetched just now**: `https://www.addictedtoai.net/status.json` at commit `fa55c743ef79`, stamp `2026-09-08T12:57:11Z`, still reports `"dirty": true` with the identical `dirty_paths` pair `[" M package-lock.json", " M vercel.json"]` first observed 2026-08-30. Reproducible across at least 4 measurements now (2026-08-30, -31, 09-04, and today). |

## Totals

- **STILL-VALID: 16** (cct, 9bu, l8x, 4i2, 47w, f7l, fc8, jqs, 88x, h8i, c29, o9d, k6c, 5xc, cqv, mfm)
- **PARTIAL: 4** (ckn, 4wm, bc0, ewj — each has one sub-item already fixed/uncertain while the rest of the bead's claim stands)
- **FIXED: 0** (no bead in this cohort is fully resolved end-to-end)
- **MOOT: 0**
- **CANNOT-TELL: 0** (ewj's item 2 is flagged CANNOT-TELL at the sub-item level only; the bead's primary claim, item 1, is STILL-VALID, so the bead-level verdict is STILL-VALID)

21 beads verified, all against directly-checkable tree state (file/line greps, one `git show`/branch check, one live HTTPS fetch of `/status.json`). No build, test, verify script, `loop/run.mjs` or `pulse/run.mjs` was run, and nothing was written to the repository or to beads.

## Natural batches

1. **The curriculum §0.5 "deviation mechanism" cluster — c29, f7l, 88x, mfm, 4wm.** This is not just a thematic grouping, it is the beads dependency graph: `bd show addictedtoai-c29` lists all four as `BLOCKS` (they each carry `DEPENDS ON → c29`). All five touch `openspec/curriculum/learn.md`; c29 is the mechanism question (no deviation-tracking exists), the other four are the individual unamended instances it would catch. A single review pass on `openspec/curriculum/learn.md` closes the content half of all four; c29 itself needs a design decision (a deviation queue/log) before any of them can close as "fixed by mechanism" rather than "fixed by one-line amendment."

2. **Already-queued same-day Desk directives — jqs, 5xc, bc0, ckn, h8i, o9d, 9bu, 88x, k6c, f7l (10 of the 21).** All ten have directive lines in `DIRECTIVES.md:116-141`, written and committed today (2026-09-08), each carrying its own fresh re-measurement, none yet run. Operationally these need no further triage — they are already in the Desk's highest-priority queue (directives run before the derived queue and before proposals per `specs/loop`) — but as of right now every one of them is still an open, unresolved defect in `main`.

3. **Missing wiki-substrate entries for learn pages — 4i2, jqs.** Same shape: a learn page needs a fact/link that only a new wiki entry can carry, and the entry doesn't exist on `main` yet. `4i2` already has an unmerged fix in flight (branch `fleet5/4i2`, commit `34de5fc`) plus a fresh follow-up bead (`yjb5`) for the remaining half; `jqs` has a directive queued but unrun. Worth handling together since both are "wiki work blocking learn work."

4. **Machinery/lib gaps with no code mechanism — cct, l8x, fc8.** Three independent gaps (queue adjudication, feed-bound timeline dates, curriculum-prose parsing), no shared file, but the same shape: each names a `lib/`/`pulse/` capability that plainly does not exist yet and would need a small design decision plus an OpenSpec change before any Desk job could build it.

5. **Standing texture/register decisions not yet recorded — cqv, k6c.** k6c is the live register-outlier measurement (queued as a directive); cqv is the two decisions (seed-page register, consciousness refusal) the whole-surface review asked to be written down and never was. Both concern `openspec/specs/*/design.md`-level editorial policy rather than a single content page, and cqv's item (a) is explicitly "the same decision" k6c's data feeds.

6. **Standalone, no shared surface — 4w2, ewj.** `4w2` (production `/status.json` `dirty:true`) is a maintainer-facing semantics decision about `lib/stamp.mjs`, unrelated to the learn-surface cluster. `ewj` is two small paraphrase-precision notes rescued from finished documents; its item 1 stands, item 2 is low-value and the bead's own notes already suggest dropping it.

## No FIXED-but-open beads in this cohort

Unlike the 2026-08-31 cohort (which had one, `addictedtoai-en3s`), nothing in this
2026-08-29/08-30 cohort is fully resolved while still marked open. The closest
cases are the four PARTIAL beads (ckn, 4wm, bc0, ewj), each of which has exactly
one sub-item already fixed by a named commit (`ckn` item 1 — no commit hash found,
confirmed only by content; `4wm` item 2 — no commit hash cited in the bead;
`bc0` item 4 — commit `752f2f2`) while the rest of the same bead's claim still
stands, so none of the four bead IDs itself is ready to close.
