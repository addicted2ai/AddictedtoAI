# Stage 0 packet B1 — VERDICT: revise

## Findings

1. loop/lib/specs.mjs:278-281 violates the first brief requirement, and the
   pinned test hides it at loop/tests/brief-excerpt-budget.test.mjs:154-174.
   The first zero-score section of every source is still accepted by the
   item.picked.length > 0 exception. The pinned corpus creates one
   unrelated amendment section in each of its nine delta files; a direct probe
   of the committed code produced unrelated_count=9 in the excerpt.
   The assertion then filters out both unrelated and surplus headings before
   comparing sets, so this wrong world passes. The implementation must select
   only the named requirements and their relevant pending deltas, and the test
   must assert that unrelated sections are absent rather than filtering them
   away.

2. loop/lib/specs.mjs:278 does not enforce the excerpt ceiling when there are
   substantial pending deltas. The new per-capability share is applied
   separately to every constitution and every delta, so a three-capability,
   three-change corpus with 7,000-character repair amendments produced
   excerpt_chars=68877 and brief_chars=87272 with max_chars=24000.
   This violates the requirement that the budget be a bound the assembled brief
   actually meets. The committed fixture uses zero- or 2,000-character deltas,
   so it cannot expose this. Add an adversarial large-delta fixture and enforce
   a real total bound while preserving the intended non-shrinking allocation.

3. loop/tests/brief-excerpt-budget.test.mjs:145-183 claims no cuts for every
   job type, but the pinned corpus contains only pulse, site, and review specs.
   For types such as verify, the other capabilities in SPECS_FOR_TYPE are
   absent, so no source exists to cut and the assertion passes vacuously. A
   large missing education-dynamic or wiki requirement would still pass.
   Populate the pinned corpus for every capability used by JOB_TYPES, or assert
   that every expected source is present before making the no-cut claim.

4. The mutation evidence at RESULT.md:106-111 does not satisfy the Stage 0
   mutation-table contract. Rows 1-4 identify the main production decisions,
   but row 6 groups a large test range under “remove or weaken” without naming
   a concrete plausible mutation, an actual red assertion, or a hash. Row 5 is
   a duplicate of row 3 and likewise has no restoration hash. The table also
   records fixture brief is 32230 characters; my exact reruns produced 32050,
   and both A and B additionally failed the guidance arm at test line 208.
   Enumerate each changed decision or explicitly justify each non-behavioural
   line, and record the real test count, all failing arms, and before/after
   hash for each row.

5. .agent-brief.md:153-159 and RESULT.md:134-136 narrow the standard in a way
   the frozen authority does not permit. The requirement and task 5 both
   require the governing type and declared subjects; the brief says declared
   subjects “do not exist yet” and are not this packet’s responsibility. An
   author who followed that instruction did the brief’s job, but the brief is
   not faithful to the requirement. Correct the brief/authority or implement
   subject-aware selection; the current prose cannot be used as an exemption.

## The mutations I re-ran myself

Every run below reported its test count; no zero-test exit was treated as a
pass. The four source/test hashes before mutation were:

- specs.mjs: 718ADD8C461C59FBB13FC4539E1FFEEBDFCA27AED32F379B4F233DD98DE9BD17
- config.mjs: 140DA854CCC965950E5897D6A443BAE226231EE4788FA004AD09A69F0C5BB9AE
- brief.mjs: CEE9CC22944B594111FC4E572C28A477935F2BCBA51BEDD5855B6A47664BB84F
- brief-excerpt-budget.test.mjs: C46B04A36A79C498BDE969C95C8FA2509C8703EC20E4F7E5E8A39BA457CA62D3

- Mutation A — restored the deleted pass 2b round-robin loop in
  loop/lib/specs.mjs. The focused run exited 1 with 9 tests, 7 passed and 2
  failed: fixture brief is 32050 characters at line 177, and the guidance
  regex at line 208 did not match. Two arms moved red. Removing the loop again
  restored the specs hash exactly to
  718ADD8C461C59FBB13FC4539E1FFEEBDFCA27AED32F379B4F233DD98DE9BD17; the
  restored run was 9/9.

- Mutation B — restored BRIEF_EXCERPT_MAX_CHARS to 88000 in config.mjs. The
  focused run exited 1 with 9 tests, 6 passed and 3 failed:
  88000 !== 24000 at line 136, fixture brief is 32050 characters at line
  177, and the guidance regex at line 208. The live measurement simultaneously
  changed to largest 181966 with no cut types. Restoring 24000 returned the
  config hash exactly to
  140DA854CCC965950E5897D6A443BAE226231EE4788FA004AD09A69F0C5BB9AE; the
  restored run was 9/9.

- Mutation-table row 2 — restored Math.floor(maxChars / plan.length) at
  specs.mjs:278. The focused run exited 1 with 9 tests, 8 passed and 1 failed:
  the allocation assertion at line 193 reported 3 !== 0. Restoring the
  denominator returned the specs hash exactly to
  718ADD8C461C59FBB13FC4539E1FFEEBDFCA27AED32F379B4F233DD98DE9BD17; the
  restored run was 9/9.

- Mutation-table row 4 — restored the old “targeted and truncated” wording in
  brief.mjs. The focused run exited 1 with 9 tests, 8 passed and 1 failed: the
  guidance assertion at line 208 did not match
  /relevant material was omitted or cut/. Restoring the new wording returned
  the brief hash exactly to
  CEE9CC22944B594111FC4E572C28A477935F2BCBA51BEDD5855B6A47664BB84F; the
  restored run was 9/9.

- Own mutation — changed if (s.score === 0 && item.picked.length > 0) to
  if (s.score === 0), a plausible attempt to exclude unscored sections. The
  focused run exited 1 with 9 tests, 6 passed and 3 failed: the old-default
  cut precondition at line 81, the requirement-presence assertion at line 91,
  and the wiring precondition at line 103. Restoring the condition returned
  the specs hash to
  718ADD8C461C59FBB13FC4539E1FFEEBDFCA27AED32F379B4F233DD98DE9BD17.

## The mutation table, judged

Completeness is not met. The production decisions are recognizable in rows
1-4, but the test additions are collapsed into row 6 instead of being
enumerated per changed assertion or declared as individually non-behavioural.
Row 5 duplicates row 3. The broad row 6 mutation is not a specific mistake a
competent author could make, and it supplies no red run or hash of its own.

The mutations in rows 1-4 are plausible: restoring a deleted loop, restoring
the old denominator, restoring the old ceiling, and restoring the old wording
are all realistic mistakes. My reruns confirmed rows 1, 2, and 4; row 3 was
confirmed by mutation B. The red-arm descriptions in RESULT.md are incomplete:
A had two failing arms and B had three, while the table lists only the size and
equality arms, and its recorded 32230 measurement is not the observed 32050.
The author’s claim of a full-suite count was not re-run here because the packet
forbids the full suite; the final targeted counts below are independent.

## The fixture, and whether both mutations genuinely bite

Both required mutations genuinely bite. The fixture has three unarchived
changes and a repair type. For A, the 7,000-character pulse requirement leaves
surplus global capacity for the 2,500-character surplus section, so restoring
pass 2b makes the assembled-size bound fail. For B, 24,000 gives the pulse
source an 8,000-character share, while 88,000 gives it 29,333; the 2,500
surplus section then enters and the assembled brief reaches 32050. Thus the
two opposite conditions are present, and neither named mutation is vacuous.

The fixture is nevertheless too permissive: it filters the very unrelated and
surplus headings that would prove bullet 1, omits seven capabilities from the
all-types loop, and never tests large pending amendments. Those are separate
gaps from whether A and B bite.

## What I checked that was sound

The merge-base diff is exactly the four permitted files. No new
loop/tests/specs.test.mjs or package.json change exists. Pass 2b is removed,
the denominator is changed, the constant is 24000 with a new rationale, and
the guidance wording is updated.

The live-tree check is measurement-only: the final run printed
largest=73288 and cut types
verify,entry,tutorial,post,scout,repair; it did not assert either live size or
live cuts. The report correctly treats those six cuts as a finding rather than
raising the ceiling.

The final focused budget test was 9 tests, 9 passed, 0 failed. The final
portability test was 12 tests, 12 passed, 0 failed. git diff --check passed,
and all temporary mutations were restored to their original hashes.

## Was the brief faithful to the task and the requirement?

It was faithful about the four-file scope, the absence of a new specs test, the
live-tree measurement rule, and the need to exercise both opposite mutations.
It was not faithful about declared subjects: the frozen requirement and task 5
name them, while the brief explicitly tells the author to defer them. That
narrowing is a brief defect, even though the author followed it.

## What I ran

Authority and diff checks:

    git -C D:/AddictedToAI show fbe1306:openspec/changes/two-desks-work-orders-and-trains/tasks.md
    git -C D:/AddictedToAI show fbe1306:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
    git -C D:/addictedtoai-worktrees/fleet6-stage0-B1 diff --stat fbe1306..HEAD

The diff reported four files, 101 insertions and 44 deletions. The merge base
was fbe1306.

Final targeted commands and real summaries:

    node --test D:/addictedtoai-worktrees/fleet6-stage0-B1/loop/tests/brief-excerpt-budget.test.mjs
    node --test D:/addictedtoai-worktrees/fleet6-stage0-B1/loop/tests/portability.test.mjs
    git diff --check fbe1306..HEAD

The first test reported tests 9, pass 9, fail 0; the second reported tests 12,
pass 12, fail 0; diff check exited 0. The same first command was used for
every mutation above, with the counts and failures recorded in the mutation
section. A temporary direct probe reported unrelated_count=9, then a
large-delta probe reported excerpt_chars=68877, brief_chars=87272,
max_chars=24000; both temporary probe files were removed.

Per the sealed packet, I did not run the build, the full suite, any verify
script, the Pulse, merge, push, or bead-closing/update operations.
