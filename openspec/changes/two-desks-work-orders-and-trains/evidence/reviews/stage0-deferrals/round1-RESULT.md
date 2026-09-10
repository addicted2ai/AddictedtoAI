# RESULT1 — Stage 0 tasks 16 and 17: the deferral reporter and its test

Date (local): 2026-09-10. Files: `scripts/lint-deferrals.mjs` (new, task 16),
`scripts/tests/lint-deferrals.test.mjs` (new, task 17). Nothing else touched —
`git status --porcelain` shows only these two files (plus the untracked
`.agent-brief.md` the orchestrator placed, which is not mine). Run by absolute
path: `node --test <worktree>/scripts/tests/lint-deferrals.test.mjs`.
`npm test` was not run here, per the brief (no `node_modules` in this worktree).

## 1. Baseline colour and post-mutation colour of every assertion

| Assertion | Baseline (recorded before any mutation) | Under mutation | After revert |
|---|---|---|---|
| arm 0 — BOM-marked export parses like a plain one | GREEN (pass) | n/a (not mutated) | GREEN |
| arm 1 — path-naming issue (`issue-path-1`, `lib/stamp.mjs`) not reported | GREEN | n/a | GREEN |
| arm 1b — requirement pointer (`specs/loop/spec.md`) and declared `metadata.subject` each keep an issue out | GREEN | n/a | GREEN |
| arm 2 — neither-naming issue reported by id (`issue-vague-1`) | GREEN | RED under Mutation A (id absent; the mutant exits 0 in silence) | GREEN (re-run after revert) |
| arm 3 — closed (`Closed`, pinning lower-case) neither-naming issue not reported | GREEN | n/a | GREEN |
| arm 4 — exit 0 plain / non-zero `--strict`, identical rows | GREEN | n/a | GREEN |
| arm 5 — missing file, unparseable file, non-array top level, missing argument each refuse non-zero naming the path, zero stdout rows | GREEN | n/a | GREEN |
| B1 — source check over `scripts/lint-deferrals.mjs` alone (no subprocess facility, no tracker invocation) | GREEN | RED under Mutation B (reasons reported: touches child_process facility, calls a process-spawning function, names the `bd` binary) | GREEN (re-run after revert) |
| B2 — standing boundary: nothing under `lib/`, and no step in the prebuild `STEPS` array, imports or spawns the tracker | GREEN | GREEN under Mutation B (unchanged — explicitly NOT the witness) | GREEN |

Every mutation was applied, run, and reverted inside its arm, and each arm
asserts the revert is byte-identical (`readFileSync(...) === original`) and
re-runs the affected check after the revert. No mutation text survives in
either file.

## 2. Suite totals, read from the runner's own summary lines

Independent verification by orchestrator (2026-09-10 local) with
`wisdom/tools/suite.mjs` from outside the run: `{tests:11, pass:11,
fail:0}` on the as-received tree, matching the report. Own mutation
(`SUBJECT_RE` roots replaced with `XXXNEVER`) turned arm 1 red
(11 pass / 1 fail, `issue-path-1` reported), reverted byte-identical
(hash `aab78097ac6b102580a3934e4f4ed5ec657a3ade` after fix — see §5).

Open question from handoff confirmed: an export whose only unroutable
issue lacks an `id` exited 1 under `--strict` with zero stdout rows
(plain exit 0, strict exit 1, both silent). Fixed before merge: skipped
no-id issues are announced on stderr
(`lint-deferrals: N unroutable issue(s) with missing id skipped`),
exit behavior unchanged, comment updated. New arm 5b locks it.
Post-fix totals below (12 tests).

First full run (baseline, mutations self-applied-and-reverted inside arms):

```text
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8186.109
```

Second full run (after all mutation cycles, final on-disk state — pre-fix):

```text
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1248.1586
```

11 collected, 11 passed, 0 failed, before and after. (The duration difference
is machine noise; the first run's arm 5 took ~6 s on its four subprocess
spawns, the second's under 0.3 s.)

Post-fix run (orchestrator, after no-id stderr announcement + arm 5b):

```text
ℹ tests 12
ℹ pass 12
ℹ fail 0
```

12 collected, 12 passed, 0 failed, confirmed both by direct
`node --test` and by `wisdom/tools/suite.mjs` with `expectTests:12`.

## 3. The enumeration-and-exclusions comment, quoted from the file

From `scripts/lint-deferrals.mjs`, verbatim:

```text
 * WHAT COUNTS AS "NAMES A SUBJECT PATH OR A SPECIFICATION REQUIREMENT".
 * A regular expression over prose is a classifier, and this comment is where
 * the classifier says what it is, following the convention `brief-lint.mjs`
 * sets in its own header (including the limit it cannot catch).
 *
 * A SUBJECT PATH is a slash-bearing path under one of these roots:
 *   loop/ pulse/ scripts/ lib/ app/ tools/ content/ data/ openspec/
 *   public/ wisdom/ loops/
 * followed by at least one name character. Exclusions, each with its reason:
 * - A BARE FILE NAME with no slash does NOT count. Prose is full of bare
 *   words that collide with file names ("status", "report", "index"), and a
 *   match on one would route a vague deferral as named. A subject must locate
 *   the repair target; a bare word locates nothing.
 * - A path inside a FENCED BLOCK or a QUOTED (`>`) line COUNTS. Subject-hood
 *   is about naming a repair target, not about prose style: a path in an
 *   example or a quotation still names a location, and asking a reporter to
 *   tell "mentioned as an example" from "mentioned as the subject" is asking
 *   it to read intent, which it cannot do. Excluding quoted text would let a
 *   real subject hide behind one `>` character.
 * - A path naming a DIRECTORY rather than a file COUNTS (trailing slash or
 *   not, e.g. `content/wiki/` or `content/wiki`). Repair work is routinely
 *   scoped to a directory, and demanding a file extension would refuse
 *   legitimate directory-scoped subjects while catching nothing vague.
 * - The roots are NOT an allow-list of exact directories: any
 *   `<root>/<something>` counts rather than only paths that exist in the
 *   tree. An issue may name a path that does not exist yet (that can be the
 *   defect), and refusing it here would report a well-specified deferral as
 *   vague. Existence is intake's question, not this reporter's.
 *
 * A SPECIFICATION REQUIREMENT reference is a `specs/<capability>` path, in
 * either the `specs/<capability>` or the `openspec/specs/<capability>` form,
 * with an optional `/spec.md` tail and an optional `:line` pin
 * (e.g. `specs/loop`, `specs/loop/spec.md`, `specs/loop/spec.md:1688`,
 * `openspec/specs/review/spec.md`). Exclusions, each with its reason:
 * - A CAPABILITY NAME ALONE (e.g. the bare word "loop" or "pulse") does NOT
 *   count. Bare capability words are topic language — nearly every machinery
 *   deferral says "loop" somewhere — and accepting one as a requirement
 *   pointer would route vague deferrals as named. A requirement reference
 *   must point at the constitution, not at a topic.
 * - The capability slot is NOT validated against the eleven known names, on
 *   purpose: an allow-list goes stale the day a capability is added and then
 *   silently reports routable issues as unroutable. A `specs/<name>` shape is
 *   a deliberate pointer no matter which capability it names.
 *
 * FIELDS SEARCHED: the six text fields `machinery-share.mjs` reads — `title`,
 * `description`, `notes`, `design`, `acceptance`, `context` — joined as text,
 * PLUS a declared `metadata.subject`. None of the six is dropped: each has
 * been observed carrying a subject in real issues (design and acceptance
 * especially on carried findings), and searching fewer would miss subjects
 * the author stated plainly. `open-by-day.mjs` reads no text field at all, so
 * there is no narrower convention to inherit — only the six-field precedent.
 * An ABSENT `metadata` object means NO DECLARED SUBJECT, not an error: the
 * subject convention is not a guarantee, and erroring on its absence would
 * refuse well-formed exports. A `metadata.subject` that is present and a
 * non-empty string counts as naming a subject path without further shape
 * checks, because it is a declared routing field rather than prose.
 *
 * OPEN means `String(status ?? '').toLowerCase() !== 'closed'`, matching both
 * existing consumers. A MISSING status counts as open: only an explicit
 * `closed` is finished work, and treating an unmarked issue as finished would
 * hide it from the report. Entries with no string `id` cannot be reported by
 * id and are skipped.
 *
 * LIMIT, stated so nobody trusts this for more than it does: the check cannot
 * tell a subject NAMED as the repair target from a path mentioned in passing
 * ("see also `lib/stamp.mjs` for the pattern"), so a vague deferral that
 * drops a passing path reference reads as routable. That over-counts
 * routable, never under-counts vague — the safe direction for a report whose
 * job is to surface the vague ones.
```

## 4. Anything the brief got wrong

Two candidate errors checked, one confirmed absent and one real finding about
the brief's own review (the second red-before-mutation arm the brief discloses
itself — I verify it rather than re-discover it):

1. The brief's measurements all check out against this tree. `loop/lib/beads.mjs`
   does not exist (`Test-Path` returns False); `scripts/verify-issue-links.mjs:128`
   is the `execFileSync(bin, [...pre, 'list', ...])` spawn with the `:96–:102`
   spawn-shape reasoning; `machinery-share.mjs:8-9` reads exactly the six text
   fields claimed; `open-by-day.mjs` reads only `status` and
   `created_at ?? created`. B2's load-bearing distinction checks out too:
   `lib/stamp.mjs:32` imports the subprocess facility and spawns git at
   `:58`/`:71`/`:111`, and `lib/` carries no tracker invocation of any kind,
   so B2-as-written-about-the-tracker is green and a child-process-wide B2
   would indeed have been red at baseline.
2. Real finding, and it is about the brief's review rather than its facts: the
   brief discloses that its own review caught the second red-before-mutation
   arm (the `child_process`-wide B2), and that disclosure is accurate — but the
   same trap was sitting in the artifact the brief orders me to write, and
   nothing in the brief told me to check for it there. My reporter's header
   comment as first drafted contained the literal tokens `node:child_process`
   and `@beads/bd` in its prose ("no `node:child_process` import, no ...
   `@beads/bd` entrypoint"), which would have turned B1 — the witness arm —
   red at baseline under the call-shaped patterns the test uses. I caught it
   with a token scan before writing the test and reworded to "no subprocess
   import of any kind ... no tracker-package entrypoint". The lesson for the
   next brief of this kind: a source check that scans for tokens must name its
   tokens, because the implementation's own comments are then in scope for
   them. A check described only as "never imports X and never invokes Y" lets
   the author write a comment that names X.
3. Nothing was left out. No part was blocked.
