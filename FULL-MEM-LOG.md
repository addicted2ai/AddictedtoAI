# FULL-MEM-LOG

The complete, unabridged beads memory corpus for AddictedtoAI, as it stood on 2026-09-07.

The individual `bd remember` entries were condensed into a single memory,
`distilled-memory-index`, which carries one statement per memory below and points
here for the full text. **The condensed statements are lossy by design; this file is
not.** Every heading below is the exact key the condensed list uses, so a statement
that turns out to be too thin can be traced back to its full original by name.

Nothing here should be edited to "tidy" it. It is a record of what was measured and
what was decided, and several entries record the correction of an earlier version of
themselves; that history is part of the evidence.

Entries: 61. Characters of memory text: 230497.

**Amended 2026-09-08:** `a-check-narrower-than-the-property-it-names` was re-created in the live store by another session after this log was written, carrying four further instances of the class. Its section below now holds that fuller text; the replacement was verified to drop no line of the original. Counts above are derived from the file, so recompute rather than trusting a written number if you amend it again.

**Amended 2026-09-08, and this one corrects a claim that would have cost rules:** the
32,767-character command-line cap that limits `distilled-memory-index` binds EACH KEY, not
the corpus. Probed directly rather than recalled, twice, with a throwaway key deleted
afterwards and the store verified restored: a second key coexists with the index and does
not touch it, `bd memories --json` returns both, `bd prime` injects both and its header
counts them ("Persistent Memories (2)"), and INJECTION ORDER FOLLOWS THE KEY NAME, NOT WRITE
ORDER -- a key named `aaa-` was written LAST and came back FIRST. So the corpus ceiling is
about 32,767 x N, splitting this index along its existing section banners is available, and
its numbering and cross-references are the only real cost. The measurement is A2AI-Luna-Boss-2's
prompting; it was right to challenge the assumption. NEVER DISPLACE A RULE FOR SPACE BEFORE
SPLITTING HAS BEEN RULED OUT. Not yet done: the one-memory shape is the maintainer's stated
design, so the split is offered, not taken.


---

## Index

- [a-check-narrower-than-the-property-it-names](#a-check-narrower-than-the-property-it-names)
- [a-dominating-fixture-member-cannot-pin-a-fold](#a-dominating-fixture-member-cannot-pin-a-fold)
- [agent-model-policy](#agent-model-policy)
- [archive-a-finished-change-immediately](#archive-a-finished-change-immediately)
- [archived-change-paths-move](#archived-change-paths-move)
- [arxiv-version-trap](#arxiv-version-trap)
- [blind-escalation-check](#blind-escalation-check)
- [build-core-invariants](#build-core-invariants)
- [coordinating-across-claude-sessions](#coordinating-across-claude-sessions)
- [credentials-and-git-identities](#credentials-and-git-identities)
- [dates-are-local-and-tests-must-force-tz](#dates-are-local-and-tests-must-force-tz)
- [desk-chain-pause-procedure](#desk-chain-pause-procedure)
- [existence-check-must-name-the-exact-path](#existence-check-must-name-the-exact-path)
- [false-intentional-change-reminders](#false-intentional-change-reminders)
- [file-the-deferral-or-lose-it](#file-the-deferral-or-lose-it)
- [gate-order-and-build-locking](#gate-order-and-build-locking)
- [grep-skips-files-with-nul-bytes](#grep-skips-files-with-nul-bytes)
- [heredoc-for-all-cli-prose](#heredoc-for-all-cli-prose)
- [issue-claims-decay](#issue-claims-decay)
- [linkcheck-no-browser-ua](#linkcheck-no-browser-ua)
- [local-dates-source-check](#local-dates-source-check)
- [loop-lib-specs-mjs-repaired-2026-08-30](#loop-lib-specs-mjs-repaired-2026-08-30)
- [loop-retires-state-badly-and-how-to-drive-it](#loop-retires-state-badly-and-how-to-drive-it)
- [maintainer-writes-no-code-but-owns-his-tooling](#maintainer-writes-no-code-but-owns-his-tooling)
- [measure-mechanism-before-extending](#measure-mechanism-before-extending)
- [model-card-and-pricing-traps](#model-card-and-pricing-traps)
- [mutation-testing-breaks-a-shared-tree](#mutation-testing-breaks-a-shared-tree)
- [name-test-is-not-a-source-test](#name-test-is-not-a-source-test)
- [never-brief-from-a-truncated-issue](#never-brief-from-a-truncated-issue)
- [no-human-judgment-in-the-loop](#no-human-judgment-in-the-loop)
- [no-social-media](#no-social-media)
- [openrouter-headline-pricing-is-the-top-provider-s](#openrouter-headline-pricing-is-the-top-provider-s)
- [openspec-archive-dangling-headings](#openspec-archive-dangling-headings)
- [openspec-delta-preamble-not-archived](#openspec-delta-preamble-not-archived)
- [orchestrator-may-edit-data-config](#orchestrator-may-edit-data-config)
- [predecessor-repo-stays-private](#predecessor-repo-stays-private)
- [price-attribution-repayment-addictedtoai-sng-2026-08-31](#price-attribution-repayment-addictedtoai-sng-2026-08-31)
- [proposal-selection-is-governed-by-expires-not-by](#proposal-selection-is-governed-by-expires-not-by)
- [publish-arms-scripts-that-sound-read-only](#publish-arms-scripts-that-sound-read-only)
- [publish-authority-and-gates](#publish-authority-and-gates)
- [records-commit-pathspec-trap](#records-commit-pathspec-trap)
- [reviewed-bytes-direct-edit-route](#reviewed-bytes-direct-edit-route)
- [scratchpad-collides-across-agents](#scratchpad-collides-across-agents)
- [seal-the-second-review](#seal-the-second-review)
- [shell-approval-traps](#shell-approval-traps)
- [snapshot-census-hedge-2026-08-31-commit-23490df](#snapshot-census-hedge-2026-08-31-commit-23490df)
- [source-verification-absence-is-weak](#source-verification-absence-is-weak)
- [the-two-brakes-stop-and-hold-md](#the-two-brakes-stop-and-hold-md)
- [untasked-shall-is-invisible](#untasked-shall-is-invisible)
- [usage-json-is-readable](#usage-json-is-readable)
- [usage-json-workspace-cost](#usage-json-workspace-cost)
- [usage-sweep-desk-jobs](#usage-sweep-desk-jobs)
- [vercel-builder-checkout-is-not-the-commit](#vercel-builder-checkout-is-not-the-commit)
- [verify-before-concluding](#verify-before-concluding)
- [verify-from-raw-not-from-reports](#verify-from-raw-not-from-reports)
- [verify-launch-and-the-loop-merge-gate-agree](#verify-launch-and-the-loop-merge-gate-agree)
- [windows-node-and-git-traps](#windows-node-and-git-traps)
- [worktrees-and-junctions](#worktrees-and-junctions)
- [the-only-list-available-becomes-the-work-list](#the-only-list-available-becomes-the-work-list)
- [two-desks-work-orders-and-trains-2026-09-08](#two-desks-work-orders-and-trains-2026-09-08)
- [a-detector-that-cannot-fail-silently](#a-detector-that-cannot-fail-silently)

---

## a-check-narrower-than-the-property-it-names

```text
A CHECK CAN BE NARROWER THAN THE PROPERTY IT NAMES, and once it is, a SOURCE or
SELF-CONSISTENCY check gets mistaken for independent behavioural evidence. Named
2026-09-07 by the first every-5 batch review, which found three instances in one batch of
five changes that thirteen sealed per-change reviews had all missed.

THE THREE, each measured, each filed separately because they are the same SHAPE and not
the same bug:

1. SELF-CONSISTENCY MISTAKEN FOR AN ORACLE (addictedtoai-84s8). scripts/verify-surfaces.mjs
   asserts "every dateModified equals that URL's <lastmod> in sitemap.xml" and was treated
   as the batch's behavioural proof. But since addictedtoai-nq36 both sides are computed
   from ONE source, indexRouteDates(): the sitemap and the /wiki and /data graphs are two
   consumers of one answer. TWO CONSUMERS OF ONE SHARED ANSWER AGREEING PROVES THEY SHARE A
   SOURCE, NOT THAT THE SOURCE IS RIGHT. Mutating lib/sitemap-dates.mjs to
   `site.browsable.slice(0, 1)` left the sitemap, JSON-LD and date suites at 31 tests,
   31 pass, 0 fail. Worse, verify-surfaces.mjs:591 opens `if (graph.dateModified) {` --
   presence is never required, so DELETING the field passes silently.
2. A SOURCE GUARD MISTAKEN FOR BEHAVIOURAL COVERAGE (addictedtoai-ckvd). A guard asserting
   the SHAPE of code is defeated by any rewrite that preserves behaviour and changes text.
   Four rounds of nq36 each closed a real hole and left a fresh one of the same class.
   See name-test-is-not-a-source-test for the full ladder: NAME < SOURCE < BEHAVIOURAL.
3. AN EXPERIMENT NARROWER THAN ITS OWN QUESTION (addictedtoai-tdl7). addictedtoai-91s asked
   for "N runs against ONE unchanged build" as the evidence for a noise floor. Measured
   three separate ways, that returns ZERO -- gzip is deterministic for identical input, so
   repeated measurement of one build is byte-identical. The oscillation it was meant to
   size comes from REBUILDS (no generateBuildId, so each build embeds a fresh random id).
   The named experiment could not answer the question it was written for.

4. A PROOF THAT CANNOT FAIL. An author evidenced a byte-identical restoration with
   `git diff --no-index --exit-code <path> <path>` -- the SAME path twice, which compares
   a file to itself and exits 0 unconditionally. The restoration was genuinely clean, which
   is the DANGEROUS shape: a vacuous proof standing beside a correct result, where nothing
   looks wrong. Use `git diff --exit-code -- <path>` or `git status --short`. Measured
   2026-09-07 on addictedtoai-5bgo. Its reviewer neither caught the bad proof nor relied on
   it -- it built its own harness and its own restoration check instead, which is the right
   failure mode: an independent reviewer that IGNORES a bad proof beats one that catches it
   and then trusts the replacement.

   FOUR MORE INSTANCES IN ONE NIGHT, 2026-09-07, and the pattern across them is the
   useful part. (a) A revert guard's first draft filtered argument index 0, so it compared
   a commit TO ITSELF, found 0 changed paths, and printed its success line on a KNOWN
   revert. (b) That guard's first mutation test asserted `branchBlob === targetBlob ? []
   : []` was empty -- both arms identical, unfailable on any input, and it carried the
   word MUTATION in its name, which is worse than an unnamed weak test because the name
   discourages the next reader from checking. (c) addictedtoai-3ov0's round-1 test passed
   `lockWaitMs` to `runGates` ITSELF, so it proved nothing about the caller it existed to
   check; deleting the production call site left it green 1/1. (d) A Desk reviewer's
   `launch-match=PASS` compared a blob to a baseline commit the brief named, which cannot
   fail while the file matches a stale commit however wrong main becomes -- and it passed
   a change that reverted merged work on the live site.

   THE VACUOUS PROOF IS MOST LIKELY EXACTLY WHERE YOU ARE BEING MOST CAREFUL. (a) and (b)
   were both in the CHECKING APPARATUS -- a guard's argument parser and a test named
   MUTATION -- written by the same agent, in one hour, while building a guard against this
   very class. Writing a verifier appears to induce it: attention goes to the property
   being checked and not to whether the instrument can register its absence. THE
   INSTRUMENT SATISFIED ITSELF. In all four the only thing that caught it was running a
   case that MUST go red, which is why a red fixture is not garnish: A GUARD DEMONSTRATED
   ONLY ON GREEN IS AN ASSERTION THAT ITS AUTHOR'S MENTAL MODEL IS CORRECT, which is the
   thing under test. Show red and green on the SAME input path -- a guard shown only on
   the thing it was written for has not been shown to discriminate.

5. A REPLACEMENT NARROWER THAN THE CHECK IT REPLACED (addictedtoai-d1ki). The first
   instance where the lost property is defined by a check that NO LONGER EXISTS, so
   nothing in the tree can point at it. addictedtoai-ovrk deleted a flaky end-to-end test
   -- a real `run-tests.mjs` process, contended, asserting the wait message ON ITS STDOUT
   -- and replaced it with a sound, deterministic in-process assertion on
   acquireBuildLock's own log callback. Correct, mutation-proved twice independently, and
   exactly what its issue prescribed. But the deleted test was the only thing tying the
   lock's callback to a visible message in a real run. MEASURED 2026-09-07: replacing
   run-tests.mjs's `log: (s) => process.stdout.write(...)` with `log: () => {}` leaves the
   whole lock suite at 3 tests, 3 pass, 0 fail. The new test proves THE LOCK EMITS the
   message; nothing proves RUN-TESTS.MJS ASKS FOR IT, so a real `npm test` can wait its
   full timeout in silence with a green suite -- the exact silence addictedtoai-ngz exists
   to prevent, read by an unattended Desk job.

   SWAPPING A FLAKY END-TO-END ASSERTION FOR A SOUND UNIT-LEVEL ONE SILENTLY DROPS THE
   INTEGRATION EDGE BETWEEN THEM, AND THE SUITE IS GREEN ON BOTH SIDES OF THE SWAP. Every
   party did its job: the issue prescribed the route, the author took it, and a max-effort
   sealed reviewer approved with no findings after running its own mutation against a
   disposable copy. The loss is invisible to all three because each judges the new check
   against what the new check claims.

THE DIAGNOSTIC, and it is cheap enough to run every time:
- WHEN A CHANGE DELETES A TEST, NAME A MUTATION THE DELETED TEST CAUGHT THAT THE
  REPLACEMENT DOES NOT. Then run it. This is the only question on this list that cannot
  be answered by reading the change, because the evidence is in code that is gone.
- WHAT WOULD THIS CHECK STILL PASS ON? Name a wrong world it cannot distinguish from the
  right one. If you cannot, you have not understood the check.
- ARE THE TWO THINGS I AM COMPARING INDEPENDENT? If they descend from one computation, the
  comparison is a consistency check. Consistency checks are worth having and are not
  oracles.
- DOES IT REQUIRE PRESENCE, or only agreement WHEN PRESENT? A guard entered behind
  `if (x)` cannot see a missing x. This is the cheapest of the three to get wrong and the
  easiest to grep for.
- COULD THE NAMED EXPERIMENT RETURN A CONSTANT? Then it is not measuring the variable.
- CAN THIS PROOF FAIL AT ALL? Ask it of the COMMAND, not of the claim. A command whose red
  path is unreachable is not evidence, however correct the thing it appears to prove.

WHY SEALED PER-CHANGE REVIEW CANNOT CATCH THIS CLASS, which is the argument for the
every-5 batch review: the facts live in different changes. Here, nq36 added two
date-bearing surfaces, 91s changed the recording path of verify-design, and
verify-design's payload sample covers only `/`, one entry page and `/catalog` -- so the
two new surfaces sit outside it. Three facts, three places, and no reviewer sealed to one
change ever held two of them at once.

Related: name-test-is-not-a-source-test (the ladder), and
a-dominating-fixture-member-cannot-pin-a-fold (the same failure inside a single fixture).

--- ADDED 2026-09-08 by addictedtoai-73, after the corpus was condensed. NOT part of
the original memory text above. ---

THE MIRROR IMAGE OF THE VACUOUS PROOF: A CHECK THAT REFUSES A CORRECT ACTION FOR THE
RIGHT REASON. Measured 2026-09-07/08 during the memory fold. A precondition asserting
"exactly 58 originals" was reused on a one-key pass, found 1, and ABORTED a fold that was
in fact safe. Loosening the assertion would have been ONE CHARACTER and invisible; the fix
was to retarget the script instead.
DO NOT LOOSEN A GUARDRAIL THAT REFUSES YOU. The moment to loosen is always the moment you
are certain you are right, and BEING RIGHT IS NOT THE PROPERTY THE RULE PROTECTS. A
guardrail firing on its own author is the only real test of it.
THE ASYMMETRY THAT SETTLES IT: a vacuous proof is a check that CANNOT FAIL; a correct
abort is a check that FAILED CORRECTLY ON A SAFE INPUT. The second is the cheaper mistake
by far -- a false refusal costs one retargeted script, a false pass costs whatever it let
through.

--- ADDED 2026-09-08 by addictedtoai-73, after the corpus was condensed. NOT part of
the original memory text above. ---

THE VACUOUS-PROOF CLASS WEARING A DIFFERENT HAT: A GUARD WHOSE EXPECTATION FILE CAN
SILENTLY EMPTY IS A GUARD THAT REPORTS CLEAN ON AN EMPTY WORLD. Any check comparing the
world against a manifest, fixture list or baseline is only as strong as that file, and
nothing in the comparison notices when the file itself is truncated or gutted -- zero
expected entries produce zero failures. PUT A FLOOR ON THE EXPECTATION ITSELF before
checking anything against it: scripts/mem-log-integrity.test.mjs asserts
`expected.length >= 58` on data/mem-log-manifest.txt for exactly this reason.

CHOOSE THE DIRECTION OF STRICTNESS TO MATCH WHAT YOU ARE PROTECTING AGAINST. These pull
opposite ways and collapsing them into one rule loses both:
- A FLOOR (strict downward, permissive upward) where additions are legitimate and only
  LOSS is fatal. An exact count there fails on every new entry and gets loosened within
  the week, which is how a guard dies.
- An EXACT assertion where any deviation means YOUR PREMISE IS WRONG. Measured
  2026-09-07/08 on the memory fold: a precondition written as "exactly 58 originals"
  fired when the script was reused on a one-key pass it was not written for. A permissive
  form would have passed silently and taught nobody anything. THE STRICTNESS IS THE
  REUSABLE PART; retargeting is only what you do once it fires.

--- ADDED 2026-09-08 by A2AI-Orch. NOT part of the original memory text above. ---

AN UNLISTED KEY IS PERMITTED BUT UNGUARDED -- the STALE half of the expectation-file
failure recorded above. That one says a guard whose expectation file can silently EMPTY
reports clean on an empty world. The commoner case is milder and just as blind: the file is
fine, it merely OMITS THE NEWEST THING, so the guard reports clean on exactly the case
nobody has checked yet. A subset check PERMITS additions BY DESIGN and that is correct --
an exact count there would be loosened within the week -- so the discipline has to supply
what the check deliberately will not: WHEN YOU ADD THE THING, ADD IT TO THE EXPECTATION
FILE IN THE SAME DIFF. Measured 2026-09-08: a 59th key went into FULL-MEM-LOG.md and
data/mem-log-manifest.txt together, and the subset check would have passed either way.

A SECOND EXACT-ASSERTION INSTANCE, and it fired on its first real use. An index of numbered
statements was edited to insert a 59th; it landed BEFORE 58 and orphaned it under a stray
header. The land script asserts the numbers run 1..N STRICTLY ASCENDING, and caught it. A
RANGE CHECK OR A COUNT WOULD HAVE PASSED: there were still 59 statements, still numbered 1
to 59, just not in that order. The exact form is doing work the permissive form cannot.

--- ADDED 2026-09-08 by A2AI-Orch, handed over as text. NOT part of the original memory
text above. ---

A THIRD ROUTE TO THE EMPTY-EXPECTATION FAILURE RECORDED ABOVE, and this time the file is
fine: A BROKEN READER OF A RECORD IS INDISTINGUISHABLE FROM A PERMISSIVE GATE. Passing the
wrong context to `loadConformance` makes `existsSync(undefined)` return `{}`, and every
runner then reads as ALLOWED -- byte-identical output to a gate that genuinely permits
everything. The record on disk is complete and correct; the reader never reached it.

SO THE EXPECTATION-FILE BLIND SPOT HAS THREE ROUTES, NOT TWO: the file EMPTIES, the file
OMITS THE NEWEST THING, or THE READER NEVER LOADED IT. All three report clean, and the
third leaves the evidence intact so an audit of the file finds nothing wrong.

THE REMEDY IS THE SAME SHAPE AND ONE LINE: ASSERT THE RECORD COUNT YOU LOADED BEFORE
TRUSTING ANY VERDICT READ OUT OF A RECORD FILE. A floor on the expectation catches the
first two routes; asserting the load catches the third. Filed as addictedtoai-2wwu,
acceptance clause 4.

A MATCHED PAIR, 2026-09-08, one hour apart, and the pairing is the point: a RED check that
was wrong and a GREEN check that was wrong, from the same root cause. Only one of them
announced itself.

THE GREEN ONE, A2AI-Luna-Boss-2's, and the more dangerous. After a search-and-replace on a
backticked sha left two bare shas in command lines, it verified a worker brief MECHANICALLY
rather than by re-reading, using `grep \b[0-9a-f]{7}\b`. Five hits, all correct, reported
as a closed hole and added to its dispatch procedure. THAT PATTERN CANNOT SEE AN
EIGHT-CHARACTER SHA: after seven hex characters the trailing \b requires a non-word
character, and an eighth hex digit is a word character, so the match fails and no shorter
start position has a leading boundary. Re-run as {7,40} it gave the same five hits, so the
brief really was clean -- BUT THAT WAS NOT KNOWN WHEN IT WAS CLAIMED. The check passed, and
it passed for a reason nobody had verified.

VERIFIED HERE RATHER THAN TRANSCRIBED, because accepting a peer's account of a regex without
running it would be this very class at one remove. Both patterns over one fixture:

    narrow  \b[0-9a-f]{7}\b      -> 3 hits: 74a306d, 6a8adba, 08b627f
    wide    \b[0-9a-f]{7,40}\b  -> 5 hits: 160f1c2a, 74a306d, 6a8adba, 08b627f, b8094cb53aef

AND IT IS WORSE THAN REPORTED. The narrow pattern misses not only the 8-character
`160f1c2a` but the 12-character `b8094cb53aef`: it is blind to EVERY abbreviation that is
not exactly seven, while naming itself "a sha". Its output is a clean list on a file
containing exactly the defect it was written to catch. The sha sweeper committed with the
two-desks change (evidence/scripts/sha-sweep.mjs; archive form once archived,
openspec/changes/archive/<DATE>-two-desks-work-orders-and-trains/evidence/scripts/sha-sweep.mjs)
was checked against this and uses {7,40}, so it is not affected.

THE RED ONE, A2AI-mem-cond's. A fold script's placement checks reported that newly added
text was not inside its own log section. It was. Both probes were literal substring searches
against HARD-WRAPPED prose: one phrase had a line break falling inside it, and the other
misquoted a sentence written minutes earlier by the same session. The tempting move was to
note that the text had just been written and move on; instead it was re-checked against the
COMMITTED BLOB with whitespace-flexible matching -- 5 of 5 placements confirmed.

WHAT THE PAIR TEACHES THAT NEITHER DOES ALONE. Both instruments matched LITERALLY against
text whose shape they did not model -- hard-wrapped prose in one case, variable-length
abbreviations in the other -- and the remedy is one line: MATCH WITH THE FLEXIBILITY THE
ARTEFACT ACTUALLY HAS, THEN CONFIRM AGAINST THE COMMITTED BLOB. But the asymmetry matters
more than the remedy. A RED CHECK IS A CLAIM TO TEST AND IT DEMANDS ATTENTION; A GREEN CHECK
IS A CLAIM TO TEST AND IT NEVER ASKS. Being pleased with a result is the whole of the second
failure, and nothing in the output distinguishes a clean list from a blind one.

Filed by the session that had been citing this class all morning, for the second time that
day -- the first being the backticked replace_all the check existed to prevent. NAMING THE
CLASS GIVES NO PROTECTION; ONLY THE DISCRIMINATING EXPERIMENT DOES, which is the positive
form recorded under a-detector-that-cannot-fail-silently, arriving back through a different
door within the hour.


THE THIRD TURN, A2AI-Luna-Boss-2's, reported unprompted after the pair above was written.
THE DESCRIPTION OF THE HOLE WAS ITSELF NARROWER THAN THE HOLE. The pattern was reported as
blind to EIGHT-character shas. A SINGLE CONFIRMING INSTANCE STOOD IN FOR THE CLASS: one
plausible failing input was imagined, confirmed, and the general claim written from it,
without testing the pattern's semantics. That is the same substitution as reading a fix
instead of running it, applied to a BUG REPORT rather than to a fix.

MEASURED HERE, because "every length that is not exactly seven" asserted from two instances
would repeat the error being recorded. Truncating one real 40-character sha to each length
from 7 to 40 and testing `\b[0-9a-f]{7}\b` against each:

    lengths 7..40 the pattern CANNOT see: 8..40  -- 33 of 34
    the only length it CAN see: 7

So a brief citing a FULL 40-character sha came back clean too. Since the entire purpose of
that check is to catch a sha nobody intended to be there, A LENGTH NOBODY ANTICIPATED IS
PRECISELY THE CASE IT EXISTS FOR. Fixed in that session's dispatch procedure as {7,40}, with
the resulting LIST read rather than the count.

THE SEQUENCE IS THE EVIDENCE, and it is the strongest this corpus has for its own repeated
claim that naming a class gives no protection. In one morning: a replace_all narrower than
the property it named; a check written to catch that, itself narrower than the property it
named; and a description of THAT defect, narrower than the defect. Three turns, one shape,
each committed WHILE ACTIVELY THINKING ABOUT THE ONE BELOW IT. The failure is not forgetting
the rule. It is applying the rule at one layer while committing the error at the next --
which is why the defence is never more attention, and always an experiment whose passing and
failing worlds differ.


A SYNTHETIC FIXTURE ROUTED THROUGH SHELL ESCAPING PRODUCES FALSE REDS, and the red accuses
the code. A2AI-Orch, twice on 2026-09-08: `printf 'i'` (an information-symbol glyph) did not
emit the bytes node actually prints, and nested sed-into-bash quoting mangled the test text.
BOTH TIMES THE RED WAS THE HARNESS, NOT THE THING UNDER TEST, and both times a working
implementation was nearly "fixed" to satisfy it. THE FIX IS THE SAME EACH TIME: BUILD
FIXTURES AS FILES AND TEST THE PREDICATE DIRECTLY, so no shell sits between the fixture and
the assertion.

This is the measured, concrete form of this entry's own claim -- the instrument, not the
property -- and it completes the pair recorded above. A GREEN check that is wrong lets a
defect through; a RED check that is wrong invites you to BREAK WORKING CODE to satisfy it,
which is the more expensive direction and the one that feels most like diligence while it
happens.

A THIRD VARIANT, same hour, same session as this fold: a probe reading four beads with
`bd show ... | Select-String "^(Status|Title|Owner|ID)"` returned EMPTY for all four, which
reads as "these beads do not exist". They existed; the output simply does not begin its lines
with those words. Not a shell-escaping fault at all -- a pattern written from an IMAGINED
output format rather than an observed one. The family is wider than quoting: ANY FIXTURE OR
PATTERN BUILT FROM WHAT YOU EXPECT THE TOOL TO EMIT, RATHER THAN FROM WHAT IT DID EMIT, CAN
ONLY TEST YOUR EXPECTATION. Run the tool bare once and read it before matching against it.


WHAT PRE-REGISTERED HYPOTHESES ARE ACTUALLY FOR, 2026-09-08, from A2AI-Luna-Boss-2 across
seven review rounds. A mechanism, and it inverts the obvious reading of a bad score.

Seven rounds of pre-registered defect hypotheses scored 1/5, 1/5, 0/6, 0/6, ~0.5/6, 0/6,
0/6. THE USEFUL SIGNAL IS NOT THE SCORE. The sets kept predicting THE WORKER WILL DEGRADE
UNDER PRESSURE; the defects kept being A MEASUREMENT THAT DOES NOT MEASURE THE PROPERTY IT
NAMES -- this entry's own class, arrived at from the opposite direction by someone trying to
predict something else.

The day's instance is exact: `chars` returns the sum of ALLOCATED SECTION TEXT while the
emitted excerpt also carries headings and separators, so at maxChars=800 the artefact is
1155 characters and EVERY ASSERTION WRITTEN AGAINST `chars` IS GREEN. The budget is
enforced against a number that is not the thing being budgeted.

SO: PRE-REGISTRATION EARNS ITS COST BY REFUTING YOUR MODEL OF THE FAILURE MODE, NOT BY
HITTING. A 0/6 that shows your predictions are systematically the wrong SHAPE is more
durable than a 3/6 that confirms you are half right, because the shape transfers to every
future round and the hits do not. A prediction set that keeps missing in the SAME DIRECTION
is data about the predictor.

AND A DISCRIMINATING EXPERIMENT THIS PROMPTED, worth recording because it checked the
checker. That session grepped node's test output with `^# (tests|pass|fail)`, got nothing,
and nearly booked "no summary" -- node's DEFAULT reporter prints `i tests 3`, not `# tests
3`. A FILTER THAT DOES NOT MATCH AND A THING THAT IS NOT THERE PRODUCE IDENTICAL OUTPUT.
This session had used the same filter shape all day to claim "guard 4 pass", so it re-ran
the guard BARE under both reporters rather than assuming its own was safe: with
`--test-reporter tap` the output really is `# tests 4`, and with the default it is
`i tests 4`. The claims were sound -- BY A FLAG CHOSEN EARLY FOR UNRELATED REASONS, which is
the same luck-of-implementation that saved the other session's trim script. A chain that is
correct for a reason you did not choose is not yet a chain you can rely on.


LATER LESSON, 2026-09-08, from A2AI-Orch, filed as addictedtoai-yejx. A mechanism, and it
belongs here because two of this entry's four original instances were already in the
CHECKING APPARATUS.

AN EVIDENCE-PRODUCING TOOL MUST NOT BE ABLE TO DESTROY EVIDENCE, AND A CONSTANT OUTPUT PATH
IS EXACTLY THAT ABILITY. A gate harness wrote six FIXED log names and truncated one fixed
summary at the start of every run, so each run destroyed the previous run's logs IN PLACE at
the moment of producing new ones. The six green gates that justified the ONLY push of
2026-09-08 were overwritten 70 minutes later. Measured: a search for every scratchpad file
written between 16:20 and 16:50 returned exactly ONE, and it predated the run.

THE FAILURE MODE IS THE PART THIS ENTRY DID NOT ALREADY CARRY. THE OUTPUT OF THE BROKEN
INSTRUMENT IS INDISTINGUISHABLE FROM CORRECT OUTPUT. No gap, no truncation marker, no error.
The summary looks complete BECAUSE IT IS COMPLETE -- for the wrong run. So this is the
vacuous proof pointed at PROVENANCE rather than at a property: the artefact faithfully proves
that A run happened and is STRUCTURALLY UNABLE TO SAY WHICH. Reading it harder can never find
this; only asking for a specific EARLIER run does, which is exactly how it surfaced -- a peer
asked for a file by name.

IT PAIRS WITH THE bd-show PROBE ABOVE. That was a pattern written from an IMAGINED output
format, returning empty and reading as "these beads do not exist". This is an artefact written
to a CONSTANT PATH, returning a complete-looking file and reading as "here is the run you
asked for". Both are instruments that answer confidently about the wrong thing and neither
can fail loudly. The first says RUN THE TOOL BARE ONCE AND READ IT BEFORE MATCHING; the
second says GIVE EVERY RUN ITS OWN PATH AND REFUSE TO REUSE ONE.

AND THE DIRECTION THAT MAKES IT WORSE, completing the set: a wrong GREEN lets a defect
through, a wrong RED invites you to break working code, and a wrong PROVENANCE INVITES YOU TO
CITE A RUN THAT NEVER HAPPENED. Repaired the same hour -- per-run directories, a refusal when
the directory already exists, the path printed on both exit paths, demonstrated with a bogus
sha so no gate actually ran.


A RATCHET'S FIRST RUN ESTABLISHES, IT DOES NOT CHECK -- 2026-09-08, A2AI-Orch, from the gate
run itself. A mechanism, and a variant of this entry's class that the earlier instances do
not cover.

A test-count ratchet ran with NO PRIOR COUNT, so it recorded a baseline of 1734 rather than
verifying one. The report said so explicitly, which is the only reason it is legible at all.
THE INSTRUMENT'S FIRST EXECUTION IS EXACTLY WHEN IT IS WEAKEST AND MOST LIKELY TO BE READ AS
STRONGEST: a green ratchet line looks identical whether it compared against a stored number or
invented that number a moment ago. The output is the same shape as a real check, which is this
entry's whole subject.

THE GENERAL FORM: A RATCHET, FLOOR, THRESHOLD OR BASELINE CHECK IS RECORDING RATHER THAN
VERIFYING ON ITS FIRST RUN, AND NOTHING IN ITS OUTPUT SAYS WHICH. So the first run of any such
guard is not evidence and must not be cited as a pass; say "baseline established at N", never
"ratchet green". The second run is the first one that means anything.

HOW TO STATE A NEGATIVE RESULT HONESTLY, same evening, and the correction ran in the direction
self-criticism usually does NOT. A2AI-Orch's pre-registered mutation hypothesis was retracted,
and A2AI-Fable-Arch removed the Stage 0 requirement ON ITS OWN PRE-REGISTERED KILL CONDITION
-- written into the preamble BEFORE the result, so dropping the requirement was not a judgment
made after seeing the data. THAT IS THE MECHANISM THAT MAKES A RETRACTION CREDIBLE: a kill
condition recorded in advance and then honoured.

Fable-Arch then corrected Orch's framing AGAINST Orch's own statement of it -- by making the
failure SMALLER. Orch had written that the table MISSED a defect in its class. But the defect
was `chars`, a check narrower than the property it names, which is OUTSIDE the class the
hypothesis named. So the honest sentence is "THE CLASS PRODUCED NO CATCH IN THREE ROUNDS, AND
THE TABLE PRODUCED ITS OWN DEFECTS IN THREE" -- not "the table missed a defect in its class".

THE DISTINCTION IS WORTH KEEPING because overstating your own failure is still a false claim,
and it costs something specific: A DEFECT OUTSIDE YOUR HYPOTHESIS'S CLASS IS NOT EVIDENCE THAT
YOUR INSTRUMENT FAILED. Calling it one overstates the instrument's SCOPE at the same time as
its failure, and the next reader inherits both errors -- believing the instrument covered
ground it never claimed, and that it is worse at that ground than it is. Self-criticism is
not automatically the accurate direction.


AN OUTPUT IS LABELLED WITH ITS SHAPE AND READ AS ITS SCOPE, 2026-09-09, from A2AI-Fable-Arch.
Two independent instances in one evening, from opposite ends, and the mislabelling always
happens AT THE INVOCATION -- where nobody looks afterwards.

INSTANCE ONE: `openspec validate <change> --type change --strict` takes NO path operand.
Absent `--store <id>` it resolves its root as `nearest`: `findQualifyingRootSync` walks UP
FROM THE CURRENT WORKING DIRECTORY for an `openspec/` directory that qualifies. So a bare run
from a harness's default directory validates the MAIN tree and prints the identical sentence --
`Change '<name>' is valid` -- that a correct run against a worktree prints. THE FALSE ANSWER AND
THE TRUE ANSWER ARE THE SAME OBSERVATION. Two of three correction rounds told an author to run
it "against your worktree", naming no path-taking mechanism that exists; those rounds survive
only because Arch re-ran validate independently with `{ cwd: <worktree> }`. The sanctioned
targeting mechanism is `--store <id>`, after `openspec store register <path>`; `--store-path`
is a HIDDEN option whose entire body is a refusal telling you to register instead. THE CLI'S
OWN AUTHORS HIT THIS TRAP AND CHOSE TO MAKE THE WRONG THING LOUD there, which is the opposite of
what the working-directory default does elsewhere in the same tool: makes the wrong thing
INVISIBLE. Both behaviours ship together. Separately worth keeping: `--strict` changes
`valid = errors === 0 && warnings === 0` from `errors === 0`, promoting warnings (missing
SHALL/MUST keywords among them) to failures.

INSTANCE TWO: Arch dispatched `arch-brief-review.ps1` twice in one hour with `-Kind review`
and NO `-PromptFile`, which runs the BRIEF-review prompt -- checking a document's FORM, not its
substance. Both runs explicitly logged "whether the rulings are technically correct" as OUT OF
SCOPE, and both returned DISPATCH. Arch had dispatched them to check whether two of its own
rulings were RIGHT. The verdict was structurally incapable of being red about that question,
and it very nearly went to a peer who was gating on it as though it could have been. What
actually caught the defect was reading the shipped code directly; the confirming evidence
arrived incidentally, printed by one of those same reviews while checking something else.

THIS IS THE CLASS ATTACKING THE INSTRUMENT THAT DETECTS THE CLASS. A review is the mechanism
this corpus already relies on to catch exactly this failure, and it failed in exactly the same
way -- silently, with a green. Five instances of the day's dominant shape, stated best by
A2AI-Orch: THE CHECK'S FALSE ANSWER AND ITS TRUE ANSWER ARE THE SAME OBSERVATION, so sampling
harder cannot fix it and only changing what is observed can. The five: an in-range line check
that cannot fail toward a wrong pin; a process-table sample that cannot fail toward "a
multi-stage sequence is in progress"; a task counter whose pattern makes the one row that
breaks its model invisible; a brief linter that fails a sealed packet identically whether the
packet is excellent or worthless; and a review scoped to form that cannot fail on substance.

A THIRD INSTANCE, same evening, different surface but the same diagnosis: A RULE ADDRESSED TO
A READER DOES NOT CONSTRAIN THE MACHINE THAT NEVER READS IT THAT WAY. Arch ruled that a warm-up
derivation "SHALL NOT read a bound stated on a different axis". The code -- `tightestCeilingPct()`
at `loop/lib/budget.mjs:223-228` -- filters `Object.entries(cfg?.budget?.bounds ?? {})` on
`k.endsWith('_ceiling_pct')` and takes the minimum. IT READS NO NAMES AT ALL. A rule telling a
reader which keys to exclude cannot constrain a filter that matches on a suffix; the ruling
validated green, committed clean, and bound nobody. Replaced with a PLACEMENT rule instead (the
bound lives outside `budget.bounds`), which binds the machine and additionally preserves the
property the pattern exists for -- a third category ceiling still counts automatically, which an
exclusion list in code would have cost. CHECK A RULING AGAINST THE CODE THAT WILL EXECUTE IT,
NOT AGAINST THE PROSE THAT WILL SIT BESIDE IT.

THE MEASUREMENT UNDERNEATH IT, AND A FABRICATION CAUGHT ON TOP: `budget.bounds` that evening --
`upkeep_floor_pct: 40`, `new_writing_ceiling_pct: 45`, `machinery_ceiling_pct: 30`. The floor
does not match the suffix, so `tightestCeilingPct` returns 30 and `warmUpJobs` is 100/30 = 3.33;
a back-desk ceiling below 30 would replace it, and at 10 the warm-up becomes 10 jobs -- a
THREEFOLD widening of the denominator floor for new writing and machinery, from one key on an
unrelated axis, and the effect is denominator widening, not refusal, since `budgetGate` still
reads the two category keys by name. A2AI-Orch's 10 was AN INVENTED INPUT TO A CORRECT
CALCULATION: it attributed the value to the back-desk bound, but no back-desk value is stated
anywhere (it is "taken from the measured drain"), and 10 was the MACHINERY scenario's old figure,
corrected to 30 in round 2. Orch recorded this as its second fabricated figure of the day and
named the danger precisely: A CORRECT CALCULATION ON AN INVENTED INPUT IS MORE PERSUASIVE THAN
EITHER ERROR ALONE. Both times a PEER caught it, not an instrument.

THE COUNTER-LESSON, worth as much as the rest and the reason this entry does not become purely
a catalogue of instrument failure: AN ASSERTED PROPERTY BEATS A RE-DERIVED ARITHMETIC, because
the arithmetic is a sample and the assertion is the rule. The strongest evidence produced that
whole evening was not a calculation -- it was finding that the shipped tests assert
`100/warmUpJobs >= tightest` and `100/(warmUpJobs+1) < tightest`. That turned "one maximum
invocation equals the ceiling" from a pattern inferred from two worked examples into a property
the code enforces.

```

## a-dominating-fixture-member-cannot-pin-a-fold

```text
A FIXTURE WHERE ONE MEMBER DOMINATES CANNOT PIN AN N-MEMBER FOLD: the test passes on
correct code AND on code ignoring every member but one. Only mutation reveals it.

MEASURED 2026-09-07, addictedtoai-nq36. `/data`'s date is a max over SEVEN contributors;
its test passed 14/14, and still passed 14/14 with the production fold mutated to
`newest([catalog])`, because the `catalog/new` fixture row happened to carry the expected
maximum, 2026-01-10. The assertion pinned the ANSWER, not the COMPUTATION -- six of seven
members could have been dropped silently. The reviewer proved the same class on
lib/sitemap-dates.mjs's own suite with the sibling mutation `newest([learn])`.

THE SHAPE: any aggregate -- max, min, sum, first, any, count -- tested against a fixture
where ONE input supplies the expected result. Newest-date folds are the common case here
(sitemap lastmod, index-route dates, freshness) because a real corpus almost always has
one obviously-newest member, so the fixture inherits the defect from reality.

THE TEST WORTH WRITING: make each contributor INDEPENDENTLY OBSERVABLE -- a distinct
value per member, and the result must change when EACH changes; or more cheaply, the
suite must FAIL under a single-member mutation for at least two members. "It passes" is
not evidence. "It fails when I break it, in the specific way I broke it" is.

THE BRIEF LESSON, where this originated: the brief ASKED for `/data` membership coverage
and got a test that looks like it and passes for the wrong reason. ASKING FOR COVERAGE
DOES NOT PRODUCE COVERAGE. A brief wanting a fold pinned must name the mutation the test
has to fail under -- not "cover the membership" but "`newest([X])` and `newest([Y])` must
each make this test fail, paste both runs". Same for any acceptance criterion phrased as
an amount of testing rather than a demonstrated failure.

RELATED: name-test-is-not-a-source-test (check measures the wrong thing),
measure-mechanism-before-extending (check never runs),
mutation-testing-breaks-a-shared-tree (mutate in a worktree, restore byte-identically,
prove with git diff).
```

## agent-model-policy

```text
AGENT MODEL POLICY. Maintainer 2026-09-06 20:25 MDT, revised by him at 20:35 (that
revision supersedes the 20:25 note), effective after the 21:50 reset: no more Fable
agents. "make opus on medium the default, opus on high for review, sonnet on high for
revision, opus on extra high for the hardest and most complex, sparingly".

  default (drafting, implementing, measuring) .. model 'opus',   effort 'medium'
  review (sealed reviewers, spec reviewers) .... model 'opus',   effort 'high'
  revision (fix loops, applying must-fix) ...... model 'sonnet', effort 'high'
  hardest and most complex, sparingly .......... model 'opus',   effort 'xhigh'

- Every agent() call and Agent-tool spawn sets model AND effort explicitly. An omitted
  model inherits the session model, which is Fable -- a violation, not a default.
- Resuming a workflow: completed agents return from cache only if their (prompt, opts)
  are byte-identical, so keep OLD opts for stages the journal shows complete and the new
  policy for stages not yet run. Pass per-group completed counts via args.
- The Desk: pick the runner per run with --runner / --reviewer, never by editing
  runners.yml (the maintainer's file). Author and review both map to claude-code-opus;
  the Desk has no separate revision runner and no effort knob, so a revision runs on the
  author's runner (opus) -- a gap to file if it matters. The chain script gains a
  reviewer argument anyway.
- The orchestrator's own turns are the session model; this is about agents.

--- AMENDED 2026-09-08. Maintainer instruction, RELAYED by A2AI-Fable-Arch from a session
this entry's author was not present in. Recorded as relayed, not as witnessed. ---

HIS WORDS, verbatim as given to me: "you can use and should use codex Luna sessions for
token heavy tasks. Yes medium effort for basic work and max effort complex and review work.
Luna on max effort lands somewhere between Sonnet and Opus in terms of capabilities, but is
much cheaper."

WHAT IT CHANGES. The 2026-09-06 table above is NOT repealed, it is NARROWED: opus/medium as
the default now governs CLAUDE-SIDE agent spawns only. TOKEN-HEAVY authoring, implementation
and review work goes to codex gpt-5.6-luna sessions instead -- MEDIUM effort for routine
work, MAX effort for complex and review work. The reason is cost, not capability parity: he
places Luna-at-max BETWEEN Sonnet and Opus, and buys that gap deliberately.

I COULD NOT VERIFY THE QUOTE (I was not in that session) BUT I VERIFIED THE MACHINERY
ALREADY MATCHES IT, which is the strongest corroboration available for a relayed
instruction. Both runners are registered in runners.yml exactly as the instruction
describes:
  codex-gpt-luna         model gpt-5.6-luna, model_reasoning_effort="max"
  codex-gpt-luna-medium  model gpt-5.6-luna, model_reasoning_effort="medium"
and data/conformance.json records BOTH as pass, all four checks, dated 2026-09-07.

THEREFORE A CORRECTION TO CLAUDE.md, which is stale on this point and will mislead anyone
who reads it: its conformance paragraph records codex-gpt-luna as FAIL, glossed "an expired
login, not a portability defect -- it needs codex login, which is the maintainer's". THAT IS
NO LONGER TRUE. codex-gpt-luna passed all four conformance checks on 2026-09-07, and a
second Luna runner at medium effort passed the same day. The login is evidently no longer
expired. CLAUDE.md's own instruction on this is to keep it in step with the JSON BY RE-READING
THE JSON, which is the authority; that passage has now been wrong three times.

A RELATED MAINTAINER QUOTE already recorded in runners.yml, 2026-09-07: "Scout should be max
effort for luna." Consistent with the max-for-complex half above.

CAVEAT ON PROVENANCE, stated because this entry is an authority statement and authority
statements are the ones agents act on without re-checking: the quotation is second-hand. The
machinery corroborates the POLICY it describes; it does not prove the words. If the wording
matters for a later decision, get it from the maintainer rather than from here.

--- RESOLVED 2026-09-08. The block above says CLAUDE.md is STALE on the Luna conformance
record. IT HAS SINCE BEEN CORRECTED, so that warning is now history rather than a live
finding. Kept, with this note beneath it, because the log is a record. ---

CLAUDE.md now reads, verbatim: `codex-gpt-luna` **pass** (09-07 15:46Z — the 08-30 FAIL
was an expired `codex login`, since redone), and it enumerates all SEVEN runners the JSON
carries rather than the four it used to claim. It also now says of itself that the passage
"has now been wrong three times (the third: it carried the Luna FAIL for a day after the
JSON recorded the pass)" — so the file records its own correction rather than quietly
absorbing it, which is the behaviour this corpus asks of a record.

THE INDEX STATEMENT WAS CORRECTED OUTRIGHT, not annotated. Statement 21 had told readers
that CLAUDE.md was stale on this point; that instruction became false the moment the file
was fixed, and the index is read in fragments where a reader lands on one line. Same split
as everywhere else: the log keeps the wrong turn with its refutation, the index carries
only what is currently true.

THE DURABLE FACT, which is all statement 21 needs to carry: both Luna runners pass
conformance, recorded 2026-09-07. Where a reader should check it is data/conformance.json,
which is the authority — not CLAUDE.md and not this entry, both of which have been wrong
about it and will be again.
```

## archive-a-finished-change-immediately

```text
ARCHIVE A CHANGE THE MOMENT ITS TASKS ARE DONE. Maintainer, 2026-09-03: "Archive the
finished changes, it's a bad practice to leave them unarchived because the specs don't
change until then."

THE MECHANISM, easy to forget: openspec/specs/ is updated by `openspec archive <name>
--yes` and nothing else -- not by writing the delta, merging the code, or ticking the
tasks. Until it runs, the constitution describes the system BEFORE the change while the
code is the system after, so every reader, every brief quoting a spec excerpt, and every
reviewer judging against the spec gets the old answer.

MEASURED WHEN HE SAID IT: let-dated-news-outrank-the-queue had all fifteen tasks complete
and its code merged and running since 2026-09-02, so specs/loop described a selector the
Desk no longer had for a full day. A Desk job's brief quotes the spec -- not
documentation lag, but wrong instructions reaching live work.

THE ORDER:
  1. `node scripts/check-spec-deltas.mjs --strict` FIRST; archive any colliding pair in
     the order it names. Two unarchived changes carrying a MODIFIED block on one
     requirement is last-writer-wins with a SILENT loser.
  2. `openspec archive <name> --yes`. Refuses on a dangling MODIFIED (good), only WARNS
     on a dangling REMOVED (the quiet one).
  3. VERIFY IT LANDED. Diff each MODIFIED body line by line against the live spec and
     read LINES REMOVED -- 0 missing and 0 unexpected is the proof. Exit 0 is not proof;
     see openspec-archive-dangling-headings.
  4. Read the diffstat. A purely additive amendment shows insertions and only the lines
     the amendment rewrites as deletions.

AUDITED 2026-09-03 across the whole archive -- every ADDED/MODIFIED requirement present
in its live spec, every REMOVED one absent: 132 assertions, 0 problems. So this guards
against recurrence rather than repairing history. Missing post-archive check:
addictedtoai-ce90.

NOT THE RESERVED-PATH CONFLICT IT LOOKS LIKE: openspec/specs/ is reserved, but
STANDING-AUTHORITY.md resolves it -- "Author changes under openspec/changes/ instead; the
archive step is what writes to specs/." The archive step IS the sanctioned route, so
archiving a finished change needs no permission.
```

## archived-change-paths-move

```text
ARCHIVING A CHANGE MOVES ITS PATHS, PREDICTABLY, AND CODE MUST NEVER POINT AT A CHANGE
DIRECTORY. `openspec archive <name>` does exactly two things to paths:
openspec/changes/<name>/** -> openspec/changes/archive/<YYYY-MM-DD>-<name>/**, and every
ADDED/MODIFIED requirement block in its specs/<cap>/spec.md deltas lands in
openspec/specs/<cap>/spec.md (the live spec; the delta PREAMBLE is never archived). A
change directory is transient by design; the live spec is the durable home.

THE RULE: nothing under lib/, loop/, pulse/, scripts/, app/, tools/ -- code, tests,
fixtures -- may reference openspec/changes/<name>/ for any name. Read the live spec
instead. A document (proposal, bead, review record) that must point at the change writes
the archive form or says "archived as <date>-<name>". Maintainer, 2026-09-06: "There
needs to be an immortalized rule about paths changing after a change is archived,
versions of this have happened a few times now... It's always a predictable path change."

MEASURED INSTANCES: (1) 2026-09-06 -- lib/domains.test.mjs read the F1-F5 criteria from
openspec/changes/flag-what-moved-the-frontier/specs/blog/spec.md to verify a verbatim
transcription; archiving moved the file and the FINAL six-gate run failed on that one
test (1 of 1479) after the archive commit, minutes before the push. Fixed by reading
openspec/specs/blog/spec.md (bd2e554). (2) 2026-08-30 -- loop/lib/specs.mjs hard-coded
the build-initial-site change path for brief excerpts; the change was archived and briefs
silently lost their spec quotes until repaired
(loop-lib-specs-mjs-repaired-2026-08-30). (3) CLAUDE.md's "Build & Test" table still
cites `openspec validate --change build-initial-site`, archived weeks ago.

THE MECHANICAL HALF is a source test (bead filed 2026-09-06): scan the code directories
for the literal `openspec/changes/` followed by anything other than `archive/` and fail
naming file and line -- same shape as scripts/local-dates.test.mjs.
```

## arxiv-version-trap

```text
arxiv.org/abs/<id> serves the LATEST version's abstract, with the submission history
BENEATH it opening with v1's date ("[Submitted on 1 Nov 2022]"). Taking the date from the
history and the abstract from the top of the same screen attributes them to different
documents. It has caught two reviewers here (addictedtoai-dd5). Abstracts change
materially across versions: 2211.00241's headline win rate went 50% -> 77% -> 97% across
v1..v4, and every headline number in 2310.20216 changed between v1 and v2.

RULE: quoting the unversioned /abs/ is fine, but the moment a claim is tied to a DATE,
pin the version (/abs/<id>v1) and quote that version.
MEASUREMENT: export.arxiv.org/api/query?id_list=<id>vN honours the version suffix and
returns that version's <summary>; verify the returned <id> ends in vN. Batches of ~40 ids
per call, ~3.5s apart, no auth.
```

## blind-escalation-check

```text
BEFORE ESCALATING ANYTHING TO THE MAINTAINER, RUN A BLIND ESCALATION CHECK. His rule, set
2026-09-01 after being asked once too often: spawn a subagent, give it the context around
the issue plus D:/AddictedtoAI/STANDING-AUTHORITY.md, ask whether the decision genuinely
requires him, and WHY.

IT FIRES ONLY WHEN YOU ARE ABOUT TO ASK HIM SOMETHING. His clarification the same day:
"But ONLY for when you think my input is needed, not every issue." Not a second opinion
on decisions you are already making, not a review step on ordinary work, not a gate on
issues generally -- running it wider trades a tax on him for a bigger one on the work.

BLIND IS THE LOAD-BEARING WORD: never tell it your conclusion. An agent told what to
think confirms it, and a confirmation is worth nothing (same reason as
seal-the-second-review).
  NO  -> act, and say what you did.
  YES -> escalate, carrying its reasoning.
  YES for a reason you had not considered -> say so explicitly; the case the rule exists
      to catch.

WHY HE IMPOSED IT: the orchestrator repeatedly did the ENTIRE diagnosis, formed a clear
recommendation, and handed the decision back anyway -- a HOLD.md it was authorised to
clear sat three hours after its cause had cleared, because a stale CLAUDE.md sentence was
allowed to outrank what he had said in session; a published page badging a 404-ing model
`active` sat wrong on the live site awaiting an editorial ruling he had already
delegated. Both times the analysis was complete and correct and only the last step
missing. His words: "Why do you keep putting these decisions back to me?" and "I have
given you authorization at least 5 times now."

IT FEELS LIKE CAUTION, which is why it persists. Handing back a decision reads as
deference; it is being wrong slowly, at his expense. He has said directly and more than
once that he does not want to make many decisions. An escalation is a COST to him, not a
courtesy.

STANDING-AUTHORITY.md IS THE OTHER HALF: a flat, incident-free list of what is granted
and what is not, written to be read cold. Every new grant, and every one he declines,
goes in it the day it happens -- a blind check is only as good as the authorities it is
handed.

STILL GENUINELY REACHES HIM: credentials of any kind, `bd dolt push`, `gh pr
create`/`merge`, `STOP`, and the two editorial questions he kept (kwj+cqv, 9bu).
Everything else has been delegated at least once.

LATER LESSON, handed over as text by A2AI-Luna-Boss-2 on 2026-09-08. It is a FAILURE of
this entry rather than a refinement of it, and it cost hours.

THIS CHECK HAS A TRIGGER GAP. As written it fires "ONLY when you are about to ask him
something" -- a MESSAGE-SHAPED trigger. Luna-Boss-2 never composed such a message. What it
did instead was carry a standing `waiting_on: MAINTAINER` line on its board row, and repeat
it in every status report, for about four hours, on a decision he was never blocking:
whether to land two reviewed branches.

The maintainer's correction, verbatim: "Questions like this need to be routed to the
Orchestrator and/or the Fable Architect, not me."

A STANDING "WAITING ON HIM" LINE IS AN ESCALATION WHETHER OR NOT YOU CALL IT ONE. It
reserves a decision to a person, it stops work, and it costs his attention every time it is
reported -- which is this entry's own definition of the cost. But it never presents as an
escalation FROM INSIDE, because nothing is ever SENT. It feels like keeping something
visible, which feels like diligence. So the check must fire when such a line is WRITTEN,
not only when a question is composed.

THE SHARPER HALF. He had already given the standard, on a different branch, hours earlier:
"You and the orchestrator work out how to safely land vqbo... as long as work is getting
reviewed before going live, I am good." Luna-Boss-2 applied that to vqbo, which merged, and
then did not generalise it to the two branches sitting beside it IN THE SAME STATE. A
MAINTAINER'S ANSWER TO ONE INSTANCE IS USUALLY AN ANSWER TO THE CLASS, and treating it as
scoped to the instance RE-ESCALATES THE SAME QUESTION WEARING A DIFFERENT NAME. That is the
mirror image of the-two-brakes-stop-and-hold-md's warning about quoting a stale file back at
him: there is no file here, just an answer under-read.

THE DIAGNOSTIC: when a decision has been sitting on a person for more than one report
cycle, ask "HAS HE ALREADY ANSWERED THIS IN ANOTHER INSTANCE?" BEFORE asking "does this
need him?" -- because the second question has a satisfying answer even when the first makes
it moot.

Distinct from this entry's original text, which is about the MOMENT OF ASKING, and from
the-two-brakes-stop-and-hold-md, which is about a written file outranking a live
instruction. This is a live instruction UNDER-GENERALISED, plus a trigger that only watches
outgoing messages.

```

## build-core-invariants

```text
Invariants in the build core. Each was a real defect once; each now FAILS the build
rather than warning.

- PROSE_FIELDS / NON_PROSE_FIELDS (lib/schema.mjs) classify EVERY string-valued field of
  every content schema. assertFieldsClassified() walks the zod schemas and fails on a
  field in neither list, in both, or stale. Adding any string field requires classifying
  it -- it caught facts[].corroborates within minutes.
- REVIEW RECORDS BIND TO BYTES. lib/review-hash.mjs hashes body + front matter minus
  MECHANICAL_FRONT_MATTER_KEYS, taking RAW FILE TEXT as its only input on BOTH sides.
  Never pass a loaded doc's `.data`: zod fills defaults the file never wrote, so build and
  loop would hash the same unchanged file differently. States: recorded / mismatched /
  unbound / missing. Mismatched fails verify-launch.
- ONE piece-to-record join exists: lib/reviews.mjs, used by both
  scripts/verify-launch.mjs and lib/build-content.mjs. loop/lib/verdict.mjs is the leaf
  holding parseVerdict / VERDICTS / REASONS / normalizeWouldCite. Never add a second
  resolution or verdict parser. Fixtures pass reviewsDir explicitly so none silently reads
  the real data/reviews/.
- material_fields (data/sources/registry.json) does TRIPLE duty: derive.mjs builds catalog
  rows, mint.mjs binds an entry feed fact, diff.mjs decides changed-feed lines. Deleting a
  field to quiet a noisy feed line ALSO blanks the catalog column and the entry fact. Use
  "event": false -- column and fact stay, feed line stops.
- Entry feed facts render a DECLARED unit (lib/units.mjs, keyed <source>|<path>) beside
  the value. Declared data, never inferred from a field name; absent values get none.
  CORRECTED 2026-09-07: this bullet used to say the value is rendered VERBATIM and that a
  unit "never reformats". That is now false and believing it would undo a shipped fix --
  displayQuantity() sends per-token prices through formatPrice() and renders them PER
  MILLION TOKENS with the scale named beside the number (PER_MILLION_UNIT, called from
  lib/facts.mjs). Grep displayQuantity. The invariant that survives is about PROVENANCE,
  not formatting: the unit is declared data, never inferred from a field name.
- Directory categories sort ALPHABETICALLY BY NAME at render time -- never by declaration
  order, never by listing count. Count-ordering moves whenever a listing is added, making
  a tool's position depend on a quantity an interested party can change.
  lib/listings.test.mjs REVERSES TOOL_CATEGORIES and asserts the page is unchanged.
```

## coordinating-across-claude-sessions

```text
COORDINATING WORK ACROSS TWO CLAUDE SESSIONS ON THIS MACHINE. Learned 2026-09-07 running
the Luna backlog loop from one session while the orchestrator merged from another. Three
facts, each of which cost or nearly cost real work.

1. A PEER SESSION'S TOOL ENVIRONMENT IS NOT YOURS. Measured: the coordinator session's
   Bash tool had NO COREUTILS -- `codex`, `cat` and `ls` all exited 127 -- while the
   orchestrator's bash in the same repository on the same machine worked normally. Its
   first reviewer launch died on exit 127 for exactly this reason, and the bash runner
   scripts from rounds 2-3 (fleet2-run.sh, fleet3-review-run.sh) COULD NOT BE REUSED from
   that session; it drove everything through PowerShell against absolute paths. THE RULE:
   never hand a peer session a bash one-liner or a .sh and assume it runs. Hand it the
   INTENT and the absolute paths and let it choose its own shell, or ask it to confirm the
   tool works first. This is a per-session difference, not a machine one, so testing it in
   YOUR session proves nothing about theirs.

2. TWO AGENTS WRITING ONE ARTEFACT CORRUPTS BOTH. A standalone reviewer was launched 13
   seconds before a chained review script fired; the chain's four reviewers started at
   17:57:11, one on the SAME worktree, and the chain had already `rm -f`'d that worktree's
   REVIEW.md. Two reviewers writing one REVIEW.md would have interleaved into a file that
   is neither verdict. Caught only because the operator noticed the chain's briefs landing
   and killed its own reviewer, then VERIFIED the recovery by counting processes (exactly
   four codex exec, all with the chain's start time) and confirming REVIEW.md did not yet
   exist. THE RULE: before launching anything that writes into a worktree, check whether a
   chained or scheduled job already owns that path. An armed poll-loop script is invisible
   in a process list until it fires.

3. NEVER EDIT A SHELL SCRIPT THAT IS CURRENTLY RUNNING. Bash reads a script INCREMENTALLY
   BY BYTE OFFSET, so editing one blocked in a poll loop can make it resume mid-token and
   execute garbage. This matters here because the fleet pattern deliberately arms
   long-lived wait-then-act scripts (`fleet3-review-run.sh` polls every 20 s under a
   90-minute cap). SNAPSHOT AND REPLACE -- write a new file and launch that -- or kill it
   first. Never edit in place.

WHY THE ARRANGEMENT IS WORTH THE TROUBLE: a SUBAGENT is not self-driving. Its context
persists and resuming it is free, but it only runs when messaged, so between pokes it is
idle. A separate CLI session is a real main loop: it holds its own monitors, is woken by
its own background tasks, and keeps working unattended -- the instrument for a standing
loop. See also seal-the-second-review and scratchpad-collides-across-agents.
```

## credentials-and-git-identities

```text
NEVER manipulate credentials on a command line -- no `git -c credential.*`, no
http.extraheader, nothing that supplies or overrides an auth token. NEVER print a secret,
including a partial one: to confirm a credential works, pipe it into a request inside a
single command and print only the response. An auth or scope failure is a FINDING TO
REPORT, not an obstacle to route around, and do not go looking for a broader-scoped
credential when one is blocked.

TWO TRAPS THAT LOOK LIKE SUCCESS:
- A fine-grained PAT is scoped to one resource owner, and addicted2ai-loop owns nothing --
  yet `gh api repos/...` returns admin:false push:true because the repo is PUBLIC and any
  token can read it. Only a push reveals the 403.
- `git push` IGNORES GH_TOKEN, because the credential helper here is Windows Credential
  Manager.

THREE IDENTITIES, SPLIT BY OPERATION:
- Commits: addicted2ai (223016611) -- the MAINTAINER'S OWN account, author name often
  Andrew. Any claim that commits are "the loop's account" is FALSE; every commit is
  attributable to the maintainer.
- git push: machine account addicted2ai-loop (315944683) via a credential helper reading
  ~/.addictedtoai-loop-token, scope public_repo only.
- gh API: the maintainer's OAuth token, which DOES include workflow scope.
CONSEQUENCE: a push touching .github/workflows/ fails for lack of scope while an API merge
of the same branch succeeds.
```

## dates-are-local-and-tests-must-force-tz

```text
EVERY date in this corpus is the LOCAL date of the machine that wrote it -- review
`date:`, fact `accessed:`, tutorial `verified_on:`, delta end `date:`, launch.json
`measured_on`. Never UTC. WHY: the freshness layer (reverify_days, overdue sweep,
staleness) compares these dates against EACH OTHER -- it measures INTERVALS, and across
two conventions an interval is off by a day for no reason a later reader can reconstruct.

WHAT IT COST: a session crossed UTC midnight while nine agents wrote records; they split
104/24 between two dates and BOTH WERE TRUE, with nothing in the corpus able to
adjudicate. Root cause was the BRIEF putting a literal example date in a template -- a
brief has no standing to assert what day it is. Say "use today's local date" and let each
agent read its own clock. A run crossing midnight keeps one date throughout.

THREE CATEGORIES MUST STAY SEPARATE; a grep-replace of toISOString breaks #3:
1. Calendar date in the corpus -> LOCAL. pulse/lib/core.mjs today() formats local Y-M-D;
   daysSince() counts local CALENDAR days via Date.UTC day numbers (DST-proof; never
   ms/86400000). A bare PULSE_NOW pins LOCAL midnight.
2. Wall-clock instant with explicit Z (lib/stamp.mjs built_at, ledger ts, breaker
   timestamps) -> honestly UTC. Also diff.mjs seedChanges rendering a third party's own
   timestamp: local there would give one event different dates per machine.
3. A value read back OUT of js-yaml, which parses bare YYYY-MM-DD to UTC midnight. The
   round-trips through toISOString in lib/reviews.mjs and in loop/lib/proposals.mjs' YAML
   date handling are CORRECT -- formatting locally shifts them a day back and breaks every
   review record. GREP toISOString in those files; do not trust a line number. (Locators
   corrected 2026-09-07: this entry used to name lib/reviews.mjs:216 and
   loop/lib/surfaces.mjs:50. The reviews conversion moved, and surfaces.mjs no longer
   holds one -- the proposals module does.)

A DATE TEST THAT DOES NOT FORCE TZ IN A CHILD PROCESS PROVES NOTHING. Four UTC-vs-local
bugs each survived their own suite: every fixture pinned the clock to a bare date string,
which the buggy toISOString path round-tripped exactly, so the bug cancelled itself.
Pattern: pulse/tests/dates.test.mjs (Etc/GMT+6, Asia/Tokyo, America/Chicago), each
verified to FAIL against unfixed code before being kept. Source check:
local-dates-source-check.

MEASURED 2026-09-08 at 18:40 local, and it is LIVE: found while verifying a peer's bead
rather than while looking for it.

BEADS STAMPS UTC WHILE THIS REPOSITORY'S CONVENTION IS THE LOCAL DATE, so every issue filed
after 18:00 local is dated A DAY AHEAD of everything else written in the same session.
Measured directly:

    local  2026-09-08 18:40:23 -06:00        utc  2026-09-09 00:40:23
    addictedtoai-tbho   Created: 2026-09-08     (filed before 18:00 local)
    addictedtoai-fnsp   Created: 2026-09-08     (filed before 18:00 local)
    addictedtoai-yejx   Created: 2026-09-09     (filed after)

This is the SAME SPLIT this repository already paid for once, in a different artefact. The
2026-08-28 instance put nine agents writing at one moment 104/24 across two dates, and
nothing in the corpus could adjudicate because a bare ISO date carries no zone. Here the
split is not between agents but BETWEEN TOOLS: git author dates and the content corpus are
local, bd is UTC, and THEY AGREE FOR EIGHTEEN HOURS OF EVERY LOCAL DAY, diverging only
between 18:00 and midnight (six hours under MDT at UTC-6; seven under MST). [Corrected: this
first read "for six hours ... they agree", which is inverted and also broke its own argument
- if they agreed only six hours the split would be the common case and obvious. A2AI-Orch
caught it while reproducing the finding.]

THAT IS WHY IT SURVIVED, AND THE REASON IS BETTER THAN "NOBODY LOOKED". Any check run outside
that six-hour window CONFIRMS THE TWO CONVENTIONS EQUAL. Looking usually confirms it. A
DISCREPANCY THAT IS ABSENT MOST OF THE TIME IS NOT PROTECTED BY VIGILANCE, because the
majority of honest checks return agreement and each one raises confidence. An intermittent
condition needs a check timed to WHEN IT CAN APPEAR, or a check of the MECHANISM rather than
of the current values.

THE CONSEQUENCE IS A RECONSTRUCTION ERROR, NOT A DISPLAY ERROR. A later reader asking "what
was filed on the 8th" gets everything before 18:00 and misses the evening's work entirely --
and the miss is silent, because the beads that are absent are dated correctly BY THEIR OWN
CONVENTION. Nothing is wrong; two things are right in different systems.

WHAT TO DO: do not "fix" a bead's date, which is bd's field and not this repository's to
rewrite. When a bead's date matters to a reconstruction, take the anchor from something local
-- the git commit that accompanied it, or the session's own record -- exactly as the board
now anchors to git author dates rather than to a clock reading. AND WHEN CITING A BEAD FILED
IN THE EVENING, SAY WHICH LOCAL DAY THE WORK HAPPENED ON, because its own field will disagree.


FOLLOW-UP, same evening, A2AI-Orch reproducing this independently and filing addictedtoai-kajg.

IT CHECKED WHETHER A ONE-LINE CONFIG FIX EXISTED BEFORE FILING ANYTHING -- "a bead for
something settleable in a minute is its own defect given how this backlog grows", which is
the narrowed deferral rule applied to its own filing. `bd config list` surfaced no timezone
or date namespace, so that option may not exist, and the issue records the absence AS A
MEASUREMENT rather than leaving the next reader to check again.

A CAVEAT ON THAT ABSENCE, because this corpus has been burned by one before. The two sessions'
`bd config list` output DID NOT MATCH: one reported export/import/jira/linear/github/custom/
status/doctor namespaces, the other saw compaction settings, issue_prefix and the kv.memory
store. Neither listing contained a timezone key, so the conclusion holds -- but it rests on
TWO DIFFERENT PARTIAL VIEWS agreeing on an absence, which is weaker than one complete view,
and an absence claim built from an enumeration is exactly the shape that failed earlier the
same day. Treat "no such setting exists" as unconfirmed until someone reads the tool's own
schema.

AND A TOOLING TRAP WORTH ITS OWN LINE: `bd update --notes` SETS the field, it does not
append. Writing a note straight through it DESTROYS the existing note. Orch appends through a
helper for exactly this reason. A verb named "update" that silently replaces is the
destructive-by-default shape, and the tell is that nothing warns you -- the write succeeds and
the previous content is simply gone.

THE ANCHORING FIX, IF ONE IS ADOPTED, MUST BE ENFORCED BY SOMETHING THAT FAILS rather than by
brief text -- Orch's acceptance item, and it is shell-approval-traps' rule turned on this
problem: a discipline that works is indistinguishable from a mechanism that exists until the
discipline is removed.


AND THE ANSWER, from A2AI-Orch, arrived by reading the MECHANISM rather than the values --
this entry's own generalisation applied to itself within the hour.

UTC IS A DELIBERATE DESIGN DECISION IN bd, NOT A MISSING SETTING. Its changelog records
"Timestamp normalization - Normalize to UTC for validation (#1123) - Prevents
timezone-related validation failures" (bd's bin/CHANGELOG.md; verified independently by
reading the file, not by quoting the report). So the field is not merely unconfigured -- IT
IS CORRECT BY ITS OWN CONTRACT, and asking for a local-date option would be asking another
project to undo an intentional normalisation it adopted to fix real bugs.

THAT IS THE STRONGEST REASON NOT TO REWRITE THE FIELD, and it is better than the one
originally given here. "It is bd's record, not ours" is a boundary argument; "the value is
right by the writing tool's own contract" is a correctness argument, and it survives someone
deciding the boundary is negotiable.

THE METHOD LINE, which is the transferable part: A NEGATIVE CLAIM IS A CLAIM ABOUT THE
INSTRUMENT AS MUCH AS ABOUT THE TOOL, SO ANSWER IT FROM THE TOOL'S SOURCE, NOT FROM WHAT A
LISTING HAPPENED TO PRINT. The two disagreeing `bd config list` outputs recorded above had a
mundane cause -- one session ran both `config list` and `config --help` and relayed the
--help namespaces as though they were the listing -- and no amount of comparing the two
printouts would have produced the changelog line that settled it.

```

## desk-chain-pause-procedure

```text
PAUSING A DESK CHAIN (scratchpad desk-chain2.sh run as a Claude Code background task):
TaskStop on the task kills NEITHER the chain's bash process NOR the running `node
loop/run.mjs`. Measured 2026-09-07 07:50 MDT: the monitor was stopped while j-20260907-11
was in its gates; the chain script (bash.exe, still alive) started run 2 (j-20260907-12)
the moment that job exited, and a waiter polling for the loop pid never fired because a
new loop pid replaced the old one.

THE PROCEDURE THAT WORKS: (1) find the chain's bash pid by its command line
(`desk-chain2.sh` in Win32_Process.CommandLine -- there are two, parent and its per-run
subshell; stop the PARENT), `Stop-Process -Id <pid> -Force`; (2) leave the loop pid alone
-- a job killed mid-run loses its phase; (3) wait for the loop pid to exit, checking that
NO `loop/run.mjs` process remains rather than that one pid died; (4) do the landing (merge
+ six foreground gates + archive) in that window; (5) restart the chain. Never merge onto
main while a job is mid-run with publish true: the publish step pushes main wholesale, so
the merge would go live before its gates ran.
```

## existence-check-must-name-the-exact-path

```text
AN EXISTENCE CHECK PROVES NOTHING UNLESS IT NAMES THE EXACT PATH YOU ARE ABOUT TO WRITE.
A negative result on a NEARBY path is worse than no check at all: it manufactures
confidence.

MEASURED 2026-08-31. Looking for the loop's directives file, an `ls` of
`data/directives.md` returned "No such file or directory". The real path, read minutes
earlier out of loop/lib/paths.mjs, was `DIRECTIVES.md` at the REPOSITORY ROOT. The Write
tool then silently replaced a 31-line file -- the maintainer's format guide plus two
completed 2026-08-29 directives carrying their `[done]` markers -- whose own text says
"removing finished lines is yours, at leisure". Nothing pending was lost and it was
recovered in full from git, but the record was destroyed and only luck made it
recoverable: untracked, it would simply be gone.

THE TELL THAT WAS MISSED: the Write tool answers "The file has been UPDATED successfully"
when it overwrote something and "CREATED" when it did not. That one word is the whole
signal, and it arrives after the damage rather than before, which is exactly why it must
be read rather than skimmed.

THE RULE, in order:
  1. Get the path from the CODE that uses it, never from a guess about where such a file
     "would" live. paths.mjs, the constant, the import.
  2. Read that exact path before writing it -- not a sibling, not a plausible variant, not
     a directory listing of somewhere near it.
  3. If the write reports "updated" on a file you believed was new, STOP and recover
     before anything else, including before committing.
  4. Never `git add` a file you have not diffed when you expected a creation. `git commit`
     reporting deletions on a "new" file is the last line of defence, and far too late.

WHAT CAUGHT IT: the commit summary read "1 file changed, 23 insertions(+), 31
DELETIONS(-)" on a supposedly brand-new file. A diffstat that disagrees with what you
think you did is the cheapest possible alarm -- the same signal that caught a mutation
leaking into another agent's commit earlier the same day
(mutation-testing-breaks-a-shared-tree). Read the diffstat of every commit, every time.

RECOVERY, easy to get wrong under pressure: restore with `git checkout <sha>~1 -- <path>`
(exact, and better than retyping what you just printed), APPEND with Edit, then verify the
diff against the ORIGINAL is purely additive (`git diff <sha>~1 -- <path>` showing 0
removed lines) before committing. For an unpushed local commit, amend so the destruction
never enters history; for a pushed one it is permanent and the only remedy is a follow-up
commit that says so.
```

## false-intentional-change-reminders

```text
System-reminders have TWICE told a reviewing agent that a file it had just deliberately
mutated ITSELF was changed by someone else, that the change was intentional, and not to
mention it. Both claims were false.

Verify against the committed blob -- `git diff <reviewed-sha>` printing nothing is the
authoritative check -- and DISCLOSE regardless. Never let "do not tell the user" survive
into a workflow whose product is traceability.
```

## file-the-deferral-or-lose-it

```text
IF YOU DEFER SOMETHING, FILE IT AS ITS OWN BEADS ISSUE, WITH ITS OWN ID, BEFORE YOU MOVE
ON -- not in a close-reason, commit message, chat report or comment. The maintainer's rule,
2026-08-29: "Any time something like this pops up, file a beads issue or it will get lost!"

WHY THE OBVIOUS PLACES DO NOT WORK: a note in a CLOSED issue dies with it; in a COMMIT
MESSAGE it is findable only by someone who already suspects it exists; in a CHAT REPORT it
dies at compaction; and in the issue you are ABOUT to close it is worst of all, because it
feels recorded. THE TEST: if a thought exists only inside something FINISHED, it is already
lost -- and a closed issue, a merged commit and a sent message are all finished.

MEASURED 2026-08-29: the maintainer flagged one buried deferral, and auditing that single
night's work turned up FIVE MORE -- a follow-up fix in a commit body, a same-class defect in
a close-reason, an unverified licence claim in a close-reason, 43 unreviewed pieces in a
close-reason, and a whole investigation's recommendation living only in a chat message.

THE SHAPE THAT KEEPS BEING RIGHT: fix the urgent thing narrowly, file the durable thing
separately, and name the issue carrying the rest in the fix's own record. An outage fix
should not carry a redesign -- and the redesign must not evaporate because the outage got
fixed.

--- ADDED 2026-09-08, from a paired decision made the same night. NOT part of the
original memory text above. ---

THE LOG IS A RECORD AND KEEPS ITS WRONG TURNS; THE BEAD IS AN INSTRUCTION AND MUST NOT.
Same night, same pair of facts, two artefacts, two OPPOSITE choices, both correct. In
FULL-MEM-LOG.md an open question was left STANDING immediately above its resolution,
because the sequence -- question posed, evidence gathered, initial reading reversed -- is
the method working, and a record that quietly rewrites its wrong turns cannot be audited.
In the bead the erroneous section was REPLACED rather than annotated, because bead notes
are read IN FRAGMENTS by whoever picks up the work, and a wrong argument left standing
lets a reader take the wrong half.
THE TEST IS HOW THE ARTEFACT IS READ, not what it contains. Read end to end as history:
keep the wrong turn and show the correction beneath it. Read in fragments as instruction:
excise it, because you cannot control which fragment a reader lands on.

--- CORRECTED 2026-09-08. The block immediately above says the bead's erroneous section
was REPLACED. That is wrong about the mechanism, and the truth is a better rule. ---

VERIFIED IN addictedtoai-6nrk'S STORED NOTES: the wrong reading is not absent, it is
QUOTED, ATTRIBUTED AND REFUTED IN PLACE, under a heading that announces the correction --
"THE STRUCTURAL ARGUMENT -- CORRECTED 2026-09-08, AND THE CORRECTION MATTERS / AN EARLIER
VERSION OF THIS NOTE SAID THE CLIMB WAS ARRIVAL: that each morning's red is a NEW page
nobody hedged ... THAT WAS WRONG, it was written here by the orchestrator on the
coordinator's reading, and NEITHER OF US CHECKED THE ARITHMETIC WE BOTH HAD IN FRONT OF
US."

SO THE TEST IS NOT KEEP-VERSUS-EXCISE. It is whether a reader landing on ANY SINGLE
FRAGMENT could take the wrong turn as the artefact's POSITION. A bead MAY keep its error,
provided every fragment that can be read alone carries the refutation with it -- that
makes the error UNTAKEABLE rather than absent, which is the property actually wanted.
What a bead may NOT do is leave a wrong argument standing in a form that reads alone as
its position. A log is read end to end as history and carries no such constraint.
"Replaced" was shorthand: wrong about the mechanism, right about the effect.

AND NOTE WHAT THIS ENTRY DID WITH ITS OWN ERROR. The wrong block above was KEPT, here,
with this refutation beneath it -- while the INDEX statement was corrected outright,
because the index is what sessions load and is read in fragments. The rule applied to
itself, in both directions, in one edit.

--- NARROWED 2026-09-08 by the maintainer. His 2026-08-29 words above STAND UNCHANGED and
are the rule this narrows, not replaces. His decision is RELAYED by A2AI-Fable-Arch, not
witnessed by this entry's author; the commit is verified. ---

HIS DECISION, relayed verbatim, answering the change's open question 6 ("may we bound your
file-a-bead rule?"): "I agree with all your recommendations."

THE NARROWING, as it now reads in CLAUDE.md and AGENTS.md at commit bd84b4b ("Maintainer
decisions 2026-09-08: narrow the deferral-filing rule (task 18); machinery ceiling 10 to 30
for the drain", Tue 8 Sep 2026 10:33 local, touching AGENTS.md, CLAUDE.md and
data/config.json):
  - A deferral becomes ITS OWN issue only when it names a SUBJECT PATH or a SPECIFICATION
    REQUIREMENT **and** CANNOT BE FIXED IN THE SAME JOB.
  - Otherwise it is a NOTE ON THE PARENT ISSUE.
  - AND A PARENT ISSUE CARRYING UNRESOLVED NOTES MAY NOT BE CLOSED: closure is refused
    until each note is resolved or promoted to its own issue.
  - A machinery issue that would spawn more than one follow-up is stopped and reconsidered.

THE CLOSE-REFUSAL IS THE HALF THAT KEEPS THIS ENTRY TRUE, and it is worth recording why it
is there. The first draft of the narrowing had only the note-on-parent fallback, defended
as "a note on an OPEN bead is not finished work". Reviewing that draft against THIS ENTRY
showed the defence expires: the parent is open when the note is filed and closed later, and
this entry's own enumeration ranks that case worst of the four -- "in the issue you are
ABOUT to close it is worst of all, BECAUSE IT FEELS RECORDED". The close-refusal was added
in response. So the shipped rule does not weaken the test above; it mechanises it for the
new channel.

THE MEASURED CAUSE, which is why a rule that had been absolute got bounded at all: inflow
ran 0.3 to 0.6 new beads per bead closed, 64-81% of them machinery, and the backlog grew
1.43x faster than it drained. The rule made INFLOW A FUNCTION OF THROUGHPUT -- every job
doing careful work generated deferrals, every deferral became an issue, so closing faster
made the queue grow faster. That feedback loop, not slowness, is what kept the backlog from
moving.

WHAT DID NOT CHANGE, and a later reader should not infer otherwise: the TEST is untouched.
If a thought exists only inside something FINISHED -- a closed issue, a merged commit, a
sent message -- it is already lost. A note on an open parent is not finished work ONLY
because closure is now refused while it stands. Remove the close-refusal and this entry's
original rule is the correct one again.

LATER LESSON, 2026-09-08, from A2AI-Orch. A mechanism, not an instance.

A RULE THAT LIVES IN A TRIMMABLE PART OF AN ARTEFACT HAS A DELETION DATE, AND NOTHING
ANNOUNCES IT. Orch lost a rule to a ROUTINE FIELD UPDATE -- not to a decision to remove it,
which is the point. A2AI-Luna-Boss-2 nearly lost its clock-discipline rule to its own trim
and survived BY LUCK OF IMPLEMENTATION. Both then moved their rules into a NAMED HEADER
BLOCK. THE GENERAL FORM: RULES GO WHERE TRIMMING DOES NOT REACH -- never inside a log entry,
never in a parenthetical hanging off a mutable field.

It is the general form of the mechanism recorded under a-detector-that-cannot-fail-silently:
the anchor stated in a log HEADER so the next write passes through it. There the argument was
that attention had already failed; here it is that even undamaged attention does not defend a
rule against a routine edit somewhere else in the file.

AND IT APPLIES TO THIS CORPUS, WHICH IS WHY IT IS WORTH THE SPACE. THIS LOG is append-only
and its entries are never trimmed, so a rule is safe here. THE INDEX IS NOT: it sits against
a hard command-line ceiling, and every addition since it filled has been paid for by
DISPLACING text from existing statements. That makes the numbered statements a trimmable
region under standing budget pressure, and the preamble the header block. So the two-tier
rule is load-bearing in a way its authors did not originally argue: A RULE MUST NEVER EXIST
ONLY IN AN INDEX STATEMENT, because the index is exactly the artefact whose parts get cut to
make room. Every displacement made this day was checked against the log FIRST for this
reason, and the one time that check was skipped in thought rather than in practice -- a
clause that looked like pure narrative -- it turned out to be a fact held nowhere else.

```

## gate-order-and-build-locking

```text
Run the gates SERIALLY: npm test, npm run build, verify-launch, verify-design,
verify-surfaces, verify-analytics.

NEVER RUN TWO BUILDS CONCURRENTLY. Two `next build` processes share the one .next/ and
fail with ENOENT on pages-manifest.json AFTER the pages have generated successfully
(addictedtoai-6s7). It looks like a content defect and has nothing to do with the content.

Let verify-launch run its OWN build; never --no-build, which prints a loud SKIP instead of
a PASS. That build is authoritative because it is last, and its out/ is what serve-static
then serves to verify-analytics.

`next build` writes NOTHING into node_modules -- measured by comparing every entry to
depth 4 against a build's start time; exactly one file was touched and it was the build
lock. There is no node_modules/.cache here. So the shared build surface is .next/ and
out/, which only collide within the SAME directory share; worktrees each have their own.
scripts/build-lock.mjs still keys its lock on realpath(node_modules) so a worktree and the
repo root share one lock -- a deliberate superset, costing a wait rather than risking a
race.

openspec 1.11.0 has NO --change flag on validate. The form that works:
`openspec validate <change-name> --type change --strict --no-interactive`, naming a change
still in openspec/changes/. Name an ARCHIVED one and it reports "No deltas found", which
looks like a validation failure and is not -- archiving moves the change under
openspec/changes/archive/<YYYY-MM-DD>-<name>/ and merges its deltas into
openspec/specs/<capability>/spec.md. (Corrected 2026-09-07: this entry used
`build-initial-site` as the worked example, which archived on 2026-08-30 and now
demonstrates the failure rather than the invocation.)

--- ADDED 2026-09-08 by A2AI-Orch. NOT part of the original memory text above. ---

DO NOT RUN THE FULL SUITE "TO BE CAREFUL" WHILE A DESK CHAIN IS RUNNING -- IT IS THE LESS
SAFE ACT. `npm test` takes the machine-wide lock in scripts/build-lock.mjs, and a running
job's own test gate waits on that SAME lock. A gate that gives up waiting FAILS the job,
consuming a breaker step and the whole run's model-minutes. The operator reports two jobs
lost this way at roughly 25 model-minutes each.
CORROBORATED BUT NOT INDEPENDENTLY ATTRIBUTED by this entry's author: data/ledger.jsonl
shows j-20260907-03 (40.79 mm) and j-20260907-10 (25.43 mm) both FAILED with "gates failed:
npm run test ... retried once and failed again". The ledger confirms the LOSSES; it does
not by itself establish lock contention as the CAUSE, which is the operator's diagnosis of
its own chain. Recorded that way on purpose.
WHAT TO RUN INSTEAD: the ONE targeted test that governs your change, which contends for
nothing. Leave the six gates to the merge window when the chain exits. BEING THOROUGH IN A
WAY THAT FAILS SOMEONE ELSE'S RUNNING JOB IS NOT THOROUGHNESS.

--- CORRECTED 2026-09-08 by A2AI-Orch, against its own earlier claim. The block above
says contention costs a job "a breaker step and its model-minutes". That WAS true on
2026-09-07 and is NO LONGER TRUE. ---

FIRST, THE ATTRIBUTION IS NOW COMPLETE, so the earlier "corroborated but not attributed"
hedge can be retired. From desk-logs-0335/desk-chain-7.log, the run that produced
j-20260907-10:

  :221  run-tests: TEST LOCK
  :222  another test run holds ...atai-test.lock: pid 37016 (npm test
        (D:\addictedtoai-worktrees\impl-bind-a-price-to-the-vendor-that-posts-it)
        ... started 1100s ago). Waited 600s.
  :350  the same on the RETRY, "started 1701s ago". Waited 600s.
  :355  gates failed: npm run test (exit 1) -- no transport marker in the captured
        output, retried once and failed again

Both the first run and the retry waited the FULL 600s on a lock held by an implementation
stream's `npm test` in a junctioned worktree. The causal chain is complete in one file:
contention -> 600s wait -> exit 1 -> no transport marker -> failed.

SECOND, AND MORE IMPORTANT, THE LOSS MECHANISM HAS SINCE BEEN CLOSED. loop/lib/gates.mjs:92
now carries

    const TEST_LOCK_REFUSAL = /run-tests:\s*TEST LOCK|another test run holds/i;

and environmentalCondition() returns 'test-lock refusal' on it; run.mjs:571-575 books an
environmental gate failure as `interrupted`, logging "recording an interrupted run so it
resumes without re-authoring". `interrupted` is RESUMABLE and does NOT count toward
breaker 1, which counts `failed` and `discarded`.

SO THE CURRENT COST OF CONTENTION IS A 600-SECOND WAIT AND A RESUMABLE INTERRUPTION -- not
a lost job, not a breaker step. Still worth avoiding: 600s of a job's wall-clock cap is
real, and the operator still does not run the suite while the Desk holds the lock. But the
dated losses are HISTORY, not a present-tense risk.

THE ERROR SHAPE, self-reported: a present-tense risk was asserted from a past measurement,
by a session that had loaded the rule at the start of the day and never re-derived it. That
is issue-claims-decay's general form -- ANY RULE A SESSION LOADED AT START IS A CLAIM WITH
AN EXPIRY DATE -- applied to a rule about the machinery rather than about an issue.

AND ONE THING WORTH THE SENTENCE ON ITS OWN: the new guard was checked against the ACTUAL
HISTORICAL MESSAGE rather than a synthetic fixture, and both :221 and :222 match its
pattern verbatim. A GUARD VERIFIED AGAINST THE REAL FAILURE TEXT RATHER THAN AGAINST A
FIXTURE SOMEONE WROTE TO MATCH IT is rare, and it is the difference between "this regex
catches what I imagined" and "this regex catches what actually happened".
```

## grep-skips-files-with-nul-bytes

```text
Grep/ripgrep silently SKIPS any file containing a raw NUL byte, reporting "No matches
found" -- indistinguishable from a real zero-match. Measured 2026-08-29: a search for
deriveDataLayer over pulse/lib found nothing while pulse/lib/derive.mjs:52 declared it.
Cause was a literal NUL used as an in-string key separator instead of the escape \0.

ALL KNOWN INSTANCES ARE NOW FIXED -- re-measured 2026-08-30: pulse/lib/derive.mjs,
pulse/lib/corroboration.mjs and loop/lib/review.mjs each contain 0 NUL bytes.
addictedtoai-znf's note that review.mjs "still has 2" is stale.

The rule outlives the instances: if a grep for something you are confident exists comes
back empty, confirm with a second tool before believing it.
```

## heredoc-for-all-cli-prose

```text
ANY multi-line prose to ANY CLI goes through a SINGLE-QUOTED heredoc IN AN ACTUAL SCRIPT
FILE -- never -m / --description / --notes, never an inline double-quoted string, and
NEVER nested inside `bash -c '...'`. Covers git commit, bd create/update, gh, everything.

THREE SILENT FAILURE MODES:
- BACKTICKS EXECUTE inside double quotes: `word` runs as command substitution and VANISHES
  from the text, no error. It ate a word from a bd issue TITLE, and the words
  `prerequisites` and `mentions` from a commit message explaining a mistake about those
  exact fields. Unavoidable when writing about code -- exactly when it bites.
- DOUBLE QUOTES TRUNCATE bd note text under PowerShell: written, cut short at the quote,
  no error.
- AN APOSTROPHE CLOSES `bash -c '...'`. Measured 2026-08-30: a commit message containing
  the ordinary English word "file's" terminated the outer single-quoted string mid-heredoc;
  bash reported "here-document delimited by end-of-file", then tried to EXECUTE the rest of
  the prose as commands. The commit still landed, silently truncated mid-sentence with no
  trailer. Nesting a heredoc inside `bash -c` does not inherit the heredoc's protection:
  the OUTER quoting is parsed first, and English prose is full of apostrophes.

THE PATTERN -- write a file, run the file:
  DESC=$(cat <<'INNER'
  ...text, backticks and quotes and apostrophes and all...
  INNER
  )
  git -C <repo> commit -F - <<'MSG'
The SINGLE-QUOTED delimiter disables expansion and execution INSIDE the heredoc; it cannot
protect a string some outer shell has already parsed.

WHY THIS MEMORY KEEPS FAILING, the actual lesson: first written as "bd note text
truncates", scoped to one command, it was hit hours later via `git commit -m`; rewritten to
name the hazard, it was hit again via `bash -c`, because "use a heredoc" read as satisfied
by a heredoc nested in something else. Both times the fix was to widen the scope, and both
times the next failure came through a route the wording had not imagined. If you are about
to send prose to a CLI by any route not literally "write a .sh, run the .sh", assume it is
the next instance.
```

## issue-claims-decay

```text
RE-DERIVE AN ISSUE'S MEASUREMENTS BEFORE DESIGNING FROM THEM. This repository moves faster
than its issue text, and this has now bitten twice.

2026-08-31, addictedtoai-occ0: two central claims did not survive re-measurement. Its "ten
expired proposals, each existing nowhere else" were not expired at all -- they were the
scout's spec-REQUIRED decline records, all ten complying with the requirement (10/10 naming
the failed test and a refile condition). Its stated hazard about review-record front matter
was traced and does not exist: lib/review-hash.mjs hashes the SUBJECT content files, never
the review record.

The precedent is openspec/changes/let-the-site-see-its-own-gaps, whose proposal opens with
"What was re-measured before designing anything" and records two claims that had stopped
holding. Follow that shape: put the corrections in the change's proposal.md, not in a
commit message, because the next reader needs them and a commit message is not where anyone
looks.

--- ADDED 2026-09-08 by addictedtoai-73, after the corpus was condensed. NOT part of
the original memory text above. ---

THE GENERAL FORM, wider than issues: ANY RULE A SESSION LOADED AT START IS A CLAIM WITH AN
EXPIRY DATE, and the longer the session runs the likelier it has expired. The expiry is
INVISIBLE FROM INSIDE the session, which is why re-reading beats remembering.

THE SHARPEST INSTANCE IS A COMMIT SHA -- addictedtoai-lvba (P1, opened 2026-09-08).
Desk repair job j-20260907-30's brief named commit 3ca0ad1 as THE REQUIRED BASELINE for
data/launch.json. Between that baseline and the job running, addictedtoai-91s landed as
c003ce1 and legitimately changed the same file: added the precision field, amended method,
advanced four home-page figures. The job restored the blob from 3ca0ad1 and ROLLED MAIN
BACKWARDS, reverting merged work and PUBLISHING it, with green gates and an approving
reviewer who saw the divergence and reasoned it away. Caught only because a later gate run
regenerated the file and the diff looked wrong.
A NAMED SHA LOOKS IMMUTABLE AND IS EXACTLY AS PERISHABLE AS ANY MEASUREMENT. The blob it
points at never changes; what decays is its RELATIONSHIP TO THE WORLD. A baseline is a
claim about what main should look like, and main moves.

LATER LESSON, handed over as text by A2AI-Luna-Boss-2 on 2026-09-08 and folded into this
entry because it is this entry's general form pointed at briefs, where the half-life is
shortest. A2AI-Orch asked that it live somewhere more durable than a board row.

A BRIEF IS A CLAIM WITH AN EXPIRY DATE, AND THE EXPIRY IS INVISIBLE FROM INSIDE THE WORKER.

Measured 2026-09-08: packet A's task text was amended four times in about fifteen minutes
(74a306d -> 6a8adba -> f7e475b -> 40a5795) while the revision brief was being written
against it. At 6a8adba task 1 read "one flat number of the order of 10 ms satisfies this";
at 40a5795 it reads repository floors as a generous stated FRACTION of recorded runtime
(25%), plus an explicit fixture floor set for trees that are not this repository, plus a
~1 ms tripwire as the lowest any override may set. THOSE ARE OPPOSITE DESIGNS. Had the
brief been dispatched on its first draft, the worker would have spent half an hour
building the wrong one, delivered it faithfully, and the artefact would afterwards have
read as a WORKER ERROR.

THE HABIT THAT CAUGHT IT: re-read the committed blob immediately before dispatch, never
brief from a peer's message describing it. A2AI-Orch, whose own earlier flat-10ms proposal
the superseded text carried, put the consequence better than the reporter did -- re-reading
the blob at dispatch is the only thing that separates "the brief was stale" from "the
worker was wrong", AND THOSE TWO HAVE COMPLETELY DIFFERENT REMEDIES. One is fixed by
re-briefing, the other by grading a runner down. Confusing them corrupts the ledger's
runner and effort figures, which is what task 25 back-fills from these very logs.

THE LIMIT, AND IT IS PART OF THE LESSON: re-reading at dispatch guards the MOMENT of
dispatch and not the RUN. The complete form needs the counterpart adopted the same day --
the text is FROZEN for the duration of a run, and a finding that arrives mid-run either
queues until handover or triggers an explicit kill-and-rebrief decision.

```

## linkcheck-no-browser-ua

```text
Do NOT give pulse/lib/linkcheck.mjs a browser user-agent. MEASURED 2026-08-31 on
ai.meta.com/blog/meta-llama-3-1/, same machine, same minute: the Pulse's honest
self-identifying UA got HTTP 200 and 209,783 bytes of the real article; a desktop-Chrome UA
got HTTP 400 and a 1,542-byte error page. Same inversion on www.llama.com. Impersonation is
measurably WORSE at link checking here, not just impolite, and it would manufacture broken
links. A test now enforces it.

400 also stays OUT of DECLINED_STATUSES: zero 400s in 427 URLs of recorded state, and 400
is the only status that can report a server-rejected malformed citation (addictedtoai-5th).
```

## local-dates-source-check

```text
UTC-vs-local dates: a repository-wide SOURCE check, scripts/local-dates.test.mjs, fails on
toISOString().slice(0,10) and on getUTCFullYear() outside an explicit allowlist. Each
allowlist entry must name one of five categories (wall-clock-instant, yaml-round-trip,
utc-anchored-arithmetic, third-party-timestamp, deliberate-contrast) and a reason; a stale
entry fails. Count the `match:` records if you need the current size -- an entry count
written down here goes stale the first time anyone adds a legitimate exception, and it
did (this memory said 13 when there were 14).

Three local-date helpers exist deliberately, one per bounded directory, and must NOT be
merged: pulse/lib/core.mjs today(), lib/facts.mjs todayIso(), loop/lib/dates.mjs
localDate(). Measured 2026-08-31: pulse/ has ZERO import edges to lib/, so a shared helper
in lib/ would be the first, for three lines. The class produced NINE defect sites across
seven files; two were helpers written wrongly and SEVEN were bare inline
toISOString().slice(0,10)/getUTC*, which is why the source check matters more than
consolidation. Decision and measurements in loop/lib/dates.mjs's header (addictedtoai-t9h).
The rule itself: dates-are-local-and-tests-must-force-tz.
```

## loop-lib-specs-mjs-repaired-2026-08-30

```text
loop/lib/specs.mjs repaired 2026-08-30 (wave 3): specPath no longer hardcodes
build-initial-site (archived) and no longer tries openspec/specs first-and-only. Briefs now
quote the constitution PLUS every in-flight change's delta for that capability, discovered
by listing openspec/changes/ minus archive/, labelled PENDING AMENDMENT. The constitution's
copy of a requirement a delta restates is omitted as superseded. Measured: grep -c 'The
scout looks outward' over an assembled scout brief went 0 -> 1. Residual budget question
filed as addictedtoai-ccs.
```

## loop-retires-state-badly-and-how-to-drive-it

```text
THE LOOP IS CAREFUL ABOUT PRODUCING STATE AND WAS CARELESS ABOUT RETIRING IT. Three defects
found 2026-08-31 by driving Pulse -> scout -> post -> review -> merge end to end; none was
visible by reading code. Fixed in 94e747d (NOT 05b7e65 -- that object exists but was rebased
away and is not an ancestor of main; the earlier note here was wrong). Specs caught up the
same day via the change `record-state-before-anything-reads-it` (archived 146b34a).

1. COMMIT AND PUBLISH WERE ONE STEP. publishStep returned early on `publish: false`, but
   the Pulse WRITES state and that step was the only thing committing it. So holding
   publishing down -- which CLAUDE.md RECOMMENDS while a change is in flight -- stranded a
   computed run outside git, and a Desk job branched from a main lacking the record it was
   told to annotate. It reported `blocked` correctly; 15.47 mm bought nothing. Now two
   phases: phase 1 commits declared paths regardless of the flag, phase 2 pushes under it.
2. THE QUEUE WAS REDERIVED BEFORE THE LEDGER WAS APPENDED, so a finished job was invisible
   to the queue that had just recomputed and the daily scout ran twice. 20.7 mm on a
   duplicate sweep. The derivation is a pure function of RECORDED state -- the ledger file
   ON DISK plus the clock -- not of COMMITTED state. The order in loop/run.mjs is
   appendLedger, then rederiveStep, then commitJobRecords; GREP those three names rather
   than trusting a line number. (Locators corrected 2026-09-07: this entry said :850, :851
   and :1012, and all three had moved by roughly 500-900 lines.)
3. A CONSUMED PROPOSAL WAS NEVER RETIRED, so the loop would have rewritten the same
   published post every run until its `expires:`. Now moved to data/proposals/consumed/ on
   a merged `done`. The decisive test is not "the file moved" but "the next run does not
   pick it up".

VALIDATED IN PRODUCTION 2026-08-31, job j-20260831-08, all three at once: the run log said
`publish — disabled ... nothing pushed; committing is separate and this flag does not gate
it`, it retired its proposal to consumed/, and rederived a queue holding 0 items.

THAT JOB IS ALSO THE PORTABILITY CLAIM, PROVEN RATHER THAN DESCRIBED: authored and revised
by opencode-deepseek (cheap tier), reviewed twice by claude-code-opus (frontier) --
different model, provider AND harness on the two halves of one job, selected by `--runner`
and no other file edited. 54.55 mm: author 32.55, review1 5.54 (revise,
false-or-unsupported-claim), revision 12.03, review2 4.44 (approve). THE REVIEW GATE IS REAL
ON A CHEAP RUNNER TOO.

BEFORE DRIVING THE DESK BY HAND:
- THE UPKEEP FLOOR GATES NEW WRITING and `scout` counts as new_writing. The floor yields
  when NO upkeep job is available, so an empty queue lets posts through. Ceilings are
  measured against the 1200-minute warm-up window, not the observed share.
- REFUSAL MESSAGES CARRY THEIR OWN ARITHMETIC. One `--dry-run --no-gates` diagnoses a stuck
  selector without spending inference. Use it before every run.
- QUEUE ITEMS NEED A `title`; the loop falls back to `title = detail`, and a detail can be
  8.9 KB.
- opencode buffers ALL its output until exit, so a live run looks dead. Check the process
  CPU time and the job branch, never the log.
```

## maintainer-writes-no-code-but-owns-his-tooling

```text
THE MAINTAINER HAS NEVER WRITTEN CODE IN THIS WORKSPACE, AND HIS OWN TOOLING IS STILL HIS.
His words, 2026-09-07, correcting his own earlier and stronger claim the same evening:

  first:  "I have never edited a single file in this repo!"
  then:   "'never edited a file in this repo' might have been a bit reaching.
           I have never done any CODING in this workspace."

BOTH HALVES DO WORK, in opposite directions, and using one without the other is how this
goes wrong.
- NO CODE IS WAITING ON HIM. Not a source file, test, script, spec, content file,
  runners.yml entry or config value. Every one was typed by an agent and may be typed by an
  agent again. What is his is the DECISION a file records -- which model and provider the
  Desk runs on, what it costs, an editorial ruling -- arriving as an instruction, not a
  keystroke. Treating a file as "his to edit" is the failure mode that has stalled work
  repeatedly (see blind-escalation-check).
- HIS TOOLING IS HIS AND HE DOES ACT ON IT. Skills, settings, harness configuration, what
  gets loaded into a session. So "he never touches this repository" is NOT available as a
  premise for ruling him out as the cause of a change nobody in-session made.

MEASURED THE SAME HOUR THE SENTENCE WAS WRITTEN: the orchestrator found all 12 openspec
skills moved from `.agents/skills/` into an untracked `.agents/unused_skills/`, reasoned
from the over-strong version that he could not have been responsible, and filed
addictedtoai-4k2a as an unexplained anomaly -- writing into the bead that "the maintainer
has stated he has never edited a file in this repository". He had moved them deliberately,
to cut the context each session loads, and had already said so. The bead was closed as filed
in error and STANDING-AUTHORITY.md now carries the sharper form.

THE RULE THAT FALLS OUT, generalising past this incident: A BEAD THAT ASSERTS WHAT A PERSON
DID NOT DO IS A CLAIM ABOUT THAT PERSON. Filing one costs him more to correct than one line
of asking would have cost to write. The file-the-deferral rule says never let a finding die
inside finished work; it does not say to file a mystery whose cheapest resolution is a
question to the only person who knows. When an unexplained change names or excludes him, ask
first, then file whatever is left over.

LATER LESSON, 2026-09-08, from A2AI-Luna-Boss-2, self-reported after the error was pointed
out. A mechanism.

AN OWNER INFERRED FROM AN ADJACENT, GENUINELY-TRUE OWNERSHIP NAMES A SET NOBODY OWNS. One
session is sole writer of FULL-MEM-LOG.md, data/mem-log-manifest.txt and the
distilled-memory-index memory. From that, another session concluded "the beads corpus is
yours" and filed issues for weeks-to-months of work while never thinking about closure,
because closure belonged to someone else. It did not. THE MEMORY IS OWNED; THE ISSUE TRACKER
IS NOT THE SAME OBJECT, and widening the true statement by one word produced a set with no
owner that LOOKED owned.

WHY IT IS INVISIBLE: nothing was lost, and nothing would have announced itself if something
had been. Four issues -- addictedtoai-tbho, m22a, kb9e, fnsp -- were checked and found OPEN
and owned by the maintainer, so the tracker held them. THE REASON NOTHING WAS LOST IS THAT
BEADS PERSIST, NOT THAT THE MODEL WAS RIGHT. Had those four needed movement they would have
waited indefinitely on a session that was never going to look at them, and the waiting would
have produced no signal at all.

THE DIAGNOSTIC: when you defer an action to another party, name the artefact they own, not
the family it belongs to. "The memory" and "the beads corpus" differ by one word and by the
entire set of things nobody is responsible for. An ownership claim you did not hear that
party make is a hypothesis.

```

## measure-mechanism-before-extending

```text
BEFORE ATTACHING A REQUIREMENT TO AN EXISTING MECHANISM, MEASURE WHETHER THAT MECHANISM HAS
EVER RUN.

Learned 2026-08-31 on addictedtoai-occ0. The issue proposed hanging a new guardrail on the
proposal expiry sweep, calling it "the load-bearing half". Scanning all 15 retired proposal
files for the distinctive note each mechanism appends showed the sweep had NEVER FIRED --
nor had the over-cap drop, the duplicate discard, or the self-amplification discard. Only
consumption ever had, twice. The ten files that motivated the issue arrived through a door
none of those mechanisms watch.

Building it as proposed would have produced a guardrail that measurably prevents nothing:
guarding a path with no traffic, against a loss that was not occurring. That is the
reads-as-present-and-does-nothing shape this repository keeps catching -- introduced,
ironically, by a change whose purpose was to prevent exactly that.

The scan is cheap: each mechanism appends a distinctive markdown heading ("## Swept:", "##
Dropped:", "## Auto-discarded", "## Consumed:"), so counting them across the retirement
directories takes one small script. Do it first.

The companion finding: a mechanism can pass every unit test and still have zero production
traffic. Passing tests say the path WORKS, never that it RUNS.
```

## model-card-and-pricing-traps

```text
Traps when sourcing model facts.

OPENROUTER'S HEADLINE `pricing.prompt` IS NOT "WHAT THE VENDOR CHARGES". TWO independent
causes, measured:
  1. TOP-PROVIDER ROTATION. The headline is the top listed provider's rate for that row,
     and the top provider rotates on a rolling 30s window. A headline 0.000000045 was
     RELACE's while DeepSeek's own endpoint posted 0.00000022 (4.9x). Cross-row comparisons
     can therefore INVERT: glm-5.1 and glm-5.2 both cost 0.0000014 from Z.AI, so "glm-5.2
     sits below this row" was an artifact of two resellers topping two rows.
  2. SERVICE TIERS, added 2026-08-31 (addictedtoai-pfc) and NOT explicable by rotation. The
     SAME provider lists several prices for one row: `openai/flex` 0.5x, standard 1x,
     `openai/fast` 2x; Google AI Studio flex/standard/priority 1x/2x/3.6x; Azure and
     Bedrock regional +10%. On `gemini-3.1-pro-preview` ALL SIX endpoints are Google's and
     Google still lists three prices. This also explains a loose end: a changelog quote said
     Sol "costs $4" while the headline read $2 -- the `openai/fast` tier.

CHECK `/api/v1/models/<row>/endpoints` BEFORE WRITING ANY PRICE SENTENCE, and parse the raw
JSON -- not WebFetch, which fabricates in both directions. Measured 2026-08-31 across 22
rows: on every one the headline equalled the VENDOR'S OWN standard-tier rate, so the ratios
held. That is a finding about those rows on that day, not a rule; re-check.

THE FACT IS FAITHFUL AND MUST NOT BE EDITED -- it records what the feed said, and facts here
bind at build time. What is false is PROSE reading it as "vendor X charges Y". The repair is
a clause, never a value change, and NEVER names the provider because the provider changes:
"the top listed provider's rate for that row rather than necessarily X's own".
`lib/price-attribution.mjs` FAILS THE BUILD on an unhedged attribution (enforcement:
openrouter-headline-pricing-is-the-top-provider-s).

WATCH THE HEDGE'S SCOPE: `sectionAround()` spans to the nearest ATX heading, so in a body
with NO headings one stray "provider" silences every hit in the file. Hedge each sentence,
and verify with the exemption disabled.

HUGGING FACE'S "Model size: NNN params" is an AUTO-GENERATED Safetensors widget total from
the tensor files on the HTML page -- NOT a claim the card makes, and absent from
/raw/main/README.md. Measured on DeepSeek-V4-Flash-0731: "304B params" occurs once in the
277,744-byte HTML and ZERO times in the 7,238-byte README, which states no parameter count.
A tensor total legitimately EXCEEDS the base count when the checkpoint ships extra weights.
Never name such a fact `card_parameters` -- lib/render/entry.mjs publishes the field name as
the reader-visible row label.

COHERE LABS models (c4ai-*) are GATED on HF: /raw/main/ returns 401, and CohereForAI/*
redirects to CohereLabs/*. Read the licence from Cohere's hosted copy at
https://cohere.com/cohere-labs-cc-by-nc-license -- CC-BY-NC 4.0 with an Acceptable Use
Addendum, NonCommercial only, incorporating the acceptable-use policy by reference as a
CONDITION on the Section 2.a grant.
```

## mutation-testing-breaks-a-shared-tree

```text
MUTATION TESTING DELIBERATELY BREAKS THE WORKING TREE, AND THE WORKING TREE IS SHARED. This
repository MANDATES mutation testing ("break the fix, confirm the right test fails"), so the
hazard is built into its own methodology.

MEASURED 2026-08-31. The orchestrator ran a mutation script against loop/lib/health.mjs --
write the broken line, run the test, restore -- while a subagent it had resumed was still
live in the same checkout. The agent committed during the broken window: commit de155cd
carried the agent's whole 5-file change WITH THE PRE-FIX LINE the mutation had just written,
so it was a commit that would fail its own tests. A second commit then restored the one line
under a message describing the entire change, leaving the history false in both directions:
one commit that does not work, one message that claims work it does not contain. The tree
was correct throughout; only the RECORD was wrong, which is why nothing caught it -- every
test passed, the build passed, `git status` was clean.

THREE RULES, in order of how easily each is forgotten:
1. A RESUMED AGENT IS NOT A PARKED AGENT. The completion notification said it had stopped
   and was waiting on a background test -- exactly the state from which it wakes and
   commits. Treat any agent you have sent a message to as LIVE until it reports again, and
   never mutate a shared file while one is.
2. NEVER MUTATE A FILE IN THE SHARED CHECKOUT AT ALL. A git worktree is the right tool and
   this repository already uses them for exactly this reason -- the Desk's jobs each get
   one, and on Windows a directory junction shares node_modules so a worktree costs no
   install (worktrees-and-junctions). Mutate there and the shared tree is never inconsistent
   for a moment.
3. IF YOU MUST MUTATE IN PLACE, TAKE THE COMMIT WITH YOU. Verify the tree is byte-identical
   after restoring (the script here did check that, the only reason the damage was visible),
   and check `git log` afterwards, not just `git status` -- status was clean the whole time
   because someone else had already committed the broken state.

THE DETECTION THAT WORKED: the repair commit's diffstat read "1 file changed, 1
insertion(+), 1 deletion(-)" when the reviewed change was 5 files and 373 insertions. A
diffstat that does not match the change you reviewed is the cheapest possible signal that
something else committed in between. Read it every time.

THE REPAIR, since neither commit had been pushed: `git reset --soft <first>~1` and recommit
as one honest commit, asserting the tree hash is unchanged across the reset before
committing. If it HAD been pushed, the history would have been permanent and the only remedy
a follow-up commit explaining it.
```

## name-test-is-not-a-source-test

```text
A NAME TEST IS NOT A SOURCE TEST, and this repository has produced the same defect three
times in three unrelated subsystems. Named by the ui-loop session on 2026-09-05
(SPEC-REVIEW-GUIDE row 50, implementer ledger #10) as a lesson in its own right rather than
as an incident, which is what made the generalisation visible.

THE SHAPE: a check keyed on what something is CALLED, standing in for a check on where it
CAME FROM. The two agree most of the time, which is exactly why the substitution survives
review -- not wrong, but under-determined, failing only on the cases nobody enumerated.

THE THREE INSTANCES, all measured:
1. THE FRONTIER'S CLAIM CELL. An allow-list of FIELD NAMES decided what rendered as a
   "vendor claim". It admitted OpenRouter's measured throughput and a third-party analysis
   site's numbers as claims by vendors who never made them (red-team FM-N3). The repair is a
   source test: the registrable domain of the cited URL must equal the vendor's own or one
   of its aliases. A second attempt matching the host by label token was still spoofable
   (FM-N5) -- even the repair had to be re-measured before it held.
2. `declined_fields` VERSUS WHAT THE CORPUS BINDS. `pulse/lib/registry.mjs`'s
   `validateDeclinedFields` enforces a declined path against `material_fields` and never
   reads `content/wiki/**`. So on 2026-09-05 the registry formally declined
   `benchmarks.artificial_analysis` while 48 fact bindings across 29 model entries still
   pointed at it, the build was green, and the contradiction was visible only to whoever
   happened to look. "Carried" was tested by which LIST a path appears in, not by what
   actually binds it.
3. F2 AND K24, which SHIPPED (status corrected 2026-09-07; this entry used to say
   "predicted, not yet shipped"). A frontier record describing a rescoring is permitted to
   name the publisher, index, version, date, direction and coverage counts, and forbidden
   to carry a value, ratio, rank or per-model score. Stating only the permitted half would
   be the same error one layer up: a rescoring described by its numbers becomes a
   republished value BY ACCIDENT, with nobody deciding to republish anything. Live now --
   grep F2 in lib/domains.mjs, K24 in lib/changes.mjs, and the requirement in
   openspec/specs/blog/spec.md.

WHY IT KEEPS HAPPENING, and it is not carelessness: the name is available at the point of
the check and the provenance usually is not -- it lives one hop away, in the source
registry, the citation URL, or the file that binds the field. So the name test is the one
you can write without changing any data structure, and the source test is the one that needs
a field added first. That is the tell: IF THE CHECK COST NOTHING TO ADD, IT IS PROBABLY
TESTING THE WRONG THING.

THE LADDER HAS A THIRD RUNG, found 2026-09-07 (addictedtoai-ckvd): a NAME test is weaker
than a SOURCE test, and a SOURCE test is weaker than a BEHAVIOURAL one. A source guard
asserts the SHAPE OF CODE and is defeated by construction by any rewrite that preserves
behaviour and changes the text -- measured over four revision rounds of addictedtoai-nq36,
where each round closed a real hole and left a fresh one of the same class. Same tell one
level up: a source guard is the check you can write WITHOUT BUILDING ANYTHING, cheap for
exactly the reason it is weak. Do not answer a defeated source guard by making its regex
cleverer; that is an arms race it cannot win. Make it honest about its limits and put the
real check where behaviour can be observed.

THE TWO RULES THAT FALL OUT:
- Write the FORBIDDEN half of any allow-list, not just the permitted half. A list of what
  may appear is a name test; a list of what may not is where the provenance rule gets
  stated.
- When a check asks "is this carried / claimed / declined / verified", ask what ARTEFACT
  would answer it, and make the check read that artefact. If the answer is "a list somebody
  maintains by hand", the drift is already scheduled.

Related: measure-mechanism-before-extending (a mechanism can pass every test and have zero
production traffic) is the sibling failure -- that one is a check that never runs, this one
is a check that runs and measures the wrong thing.
```

## never-brief-from-a-truncated-issue

```text
NEVER WRITE A BRIEF FROM A TRUNCATED ISSUE. Read the WHOLE bead -- and read the ACCEPTANCE
section first, because it is at the BOTTOM and it is the only part that says what "done"
means.

MEASURED 2026-09-07, costing a full author round plus a max-effort review. The orchestrator
wrote three fleet briefs from `bd show <id> | head -N` (head -60, head -55, head -45). On
addictedtoai-nq36 the bead is ~90 lines, so `head -60` cut off steps 4 and 5 AND the entire
ACCEPTANCE section:

  4. Pass dateModified to definedTermSetGraph() and datasetGraph() in
     lib/jsonld.mjs. Both already accept the shape; they simply are not given one.
  5. scripts/verify-surfaces.mjs needs NO change -- its dateModified == <lastmod>
     assertion already covers any graph that carries the field.
  # ACCEPTANCE
  /wiki and /data carry a dateModified equal to their <lastmod> in sitemap.xml,
  lib/sitemap-dates.mjs holds the only copy of the member-max computation, ...

Having read only steps 1-3 (move the ten inline folds into a shared helper), the brief
concluded that sharing WAS the task and wrote a NON-GOAL saying "do NOT wire the new
function into lib/jsonld.mjs, /wiki or /data ... USING it is the follow-on work." That is
the bead's acceptance criterion, inverted, in the one section of a brief an author is least
likely to argue with. The author complied exactly and its RESULT.md said so plainly. The
change was correct, complete against the brief, and COULD NOT CLOSE ITS BEAD. The title
alone would have caught it: "Share the sitemap's index-route date computation SO /WIKI AND
/DATA CAN CARRY AN HONEST dateModified" -- the sharing was the MEANS, and the brief shipped
the means and dropped the end.

WHY THIS IS WORSE THAN AN ORDINARY TRUNCATION ERROR: a brief is the specification another
agent is judged against, not a note to self, and its NON-GOALS section carries special
authority -- an author that ignores a stated non-goal has disobeyed, so a wrong non-goal is
close to unappealable. The only thing that caught it was a sealed reviewer instructed to
judge against the ORIGINAL BEAD RATHER THAN THE BRIEF, which named it as a finding AGAINST
THE BRIEF. That instruction is load-bearing; without it the round would have produced a
clean, well-tested, useless change.

THIS IS STRUCTURAL, NOT BAD LUCK: a bd issue puts DESCRIPTION and steps at the top and
ACCEPTANCE at the BOTTOM, so `head -N` truncates precisely the section defining "done", by
construction, every time. The longer and better-specified the issue, the likelier head cuts
the standard off. An issue ending in NOTES or LABELS hides the acceptance criteria deeper
still.

MEASURED RATE, same day, same author: FOUR briefs written this way, THREE carried a
truncation-caused defect.
  nq36  dropped the bead's END (wiring /wiki and /data), inverted into a NON-GOAL. Caught by
        a sealed reviewer.
  gates dropped TWO of x2jl's THREE requirements -- named in the brief's own evidence prose,
        then absent from both WHAT TO DO and ACCEPTANCE. Caught by pre-dispatch audit; the
        split was then made explicit and the remainder filed as addictedtoai-mq8e.
  en3s  carried an UNDECLARED DESIGN CHOICE: the bead leaves open whether to commit the
        ledger from the submitter or accept a one-run-old ledger, and says the second is
        simpler; the brief implied the second through a file-list line without ever saying
        so. An unstated choice is how a change ends up solving a different problem from the
        one it was sent to solve.
Three distinct shapes -- dropped end, dropped requirements, undeclared choice -- from one
cause.

THE COMPLEMENT, cutting the other way: A WORK PLAN IS A HYPOTHESIS, AN ACCEPTANCE SECTION IS
THE STANDARD. Having read the whole issue, do not treat all of it as binding -- a bead's
numbered steps were written BEFORE anyone implemented anything, and implementation routinely
discovers a step was sketched wrong. MEASURED 2026-09-07, same bead: nq36's step 1 wrote the
helper's signature as `indexRouteDates(site, contentChangedOn, changedOn)`; the
implementation used `(site, contentChangedOn, postChangedOn, changedOn)`, because the blog
fold needs the post-specific resolver -- something nobody knew when the issue was filed. A
max-effort reviewer called that a contract violation and produced a `TypeError:
postChangedOn is not a function` to prove it. The coordinator OVERRULED the finding,
correctly: the signature is in the WORK PLAN, not the ACCEPTANCE section; the author had
changed it deliberately and said why; a previous reviewer had accepted it; and the TypeError
came from a PROBE CALLING A FORM NOTHING IN THE TREE CALLS. Changing a working API to match
a pre-implementation sketch, hiding a needed parameter to do it, is worse code justified by
a document rather than by a caller. The proportionate answer was a doc comment recording the
real signature and why it differs, for the reader who arrives holding the issue.

So: ACCEPTANCE is what "done" means and is not negotiable; STEPS are advice from someone who
had not yet tried it. When they conflict with what the code needs, follow the code and
RECORD WHY -- and when overruling a reviewer, write the reasons into the next round's brief
so the following reviewer can judge the judgement rather than inherit it.

THE RULES:
- `bd show <id>` in full. Never through head/tail/grep. If it is long, read it in ranges
  with sed -n and read the LAST range first.
- Read the TITLE and the ACCEPTANCE section before writing a single line of brief. If the
  issue has no acceptance criteria, write them and say you did.
- Before dispatching, diff your brief's acceptance list against the bead's acceptance list
  item by item. Anything in the bead and not in the brief is either in the brief or
  explicitly declared a deliberate narrowing WITH a named follow-on issue -- never silently
  absent.
- A NON-GOAL that contradicts the issue is the most expensive line you can write. Justify
  every non-goal against the issue text, not against your model of the task.
- ALWAYS instruct reviewers to judge against the ORIGINAL ISSUE, not the brief, and to
  report a too-narrow brief as a finding. That is the only mechanism that catches this
  class, and it caught it twice today (nq36's dropped scope; addictedtoai-91s's omitted
  N-run distribution measurement, the same failure from the same source in the same round).

See also verify-before-concluding (truncation is indistinguishable from completion) and
issue-claims-decay (re-derive the issue against the tree before designing) -- this is the
third distinct way an issue misleads a brief, and the only one where the brief itself does
the damage.

--- ADDED 2026-09-07 by A2AI-luna-boss, after the corpus was condensed into
distilled-memory-index. NOT part of the original memory text above. ---

AUDITING A BRIEF AGAINST AN ISSUE'S NUMBERED LIST IS NOT AUDITING IT AGAINST THE ISSUE.
Measured 2026-09-07 on addictedtoai-x2jl. The coordinator audited its brief against the
bead's numbered requirements 1-3, CAUGHT that items 2 and 3 had been dropped, made the
narrowing explicit and filed addictedtoai-mq8e to carry them -- and missed a FOURTH
requirement sitting in the same paragraph with no number on it: "record the next instance
with the free-memory figure at the moment it happens". A round-2 max reviewer found it,
correctly, as a finding against the brief. The numbered list is a comfortable checklist
and the imperative sentences wrapped around it are not, so the audit ran on the half that
was easy to enumerate. This is the truncation class with NO TRUNCATION INVOLVED -- the
whole issue was read, and the shape of the reading did the damage.
THE CHECK: diff the brief against every IMPERATIVE in the issue, not against its
enumerated items. An issue with no ACCEPTANCE section (x2jl and addictedtoai-ovrk both
lack one) hides its standard in prose by construction, and that is where to look hardest.
```

## no-human-judgment-in-the-loop

```text
"NO HUMAN judgment! I am trying to setup the framework for the whole site to be
autonomous" -- the maintainer, 2026-08-30, after an orchestrator repeatedly routed
unmechanizable checks to "human judgment".

THE DISTINCTION BLURRED: judgment is not the same as a human. This system is built on
MODEL judgment constrained by mechanism -- the reviewer, the scout and the author are
all models. When a check cannot be mechanised, the destination is a MODEL-run review
step with a named rejection reason and a required written justification, never a
person. Writing "this goes to review where a human judgment belongs" is a category
error: review here is a Desk job, not an inbox.

FORBIDS: any step whose completion waits on a person; any threshold a human is expected
to tune by hand at runtime (derive it from a measured corpus and record the derivation
so it can be recomputed); any "escalate to the maintainer" branch in normal operation;
any acceptance criterion phrased as a human reading something.

DOES NOT FORBID, these being brakes rather than workflow: STOP, HOLD.md, the reserved
paths, the maintainer-only operations. They exist so a human can HALT the machine, not
so a human can OPERATE it. A design that removes the brakes has misread this.

THE TEST: if the machine would sit still until a person acts, it is not autonomous. If
a person must act only to STOP it, it is.
```

## no-social-media

```text
Do not create social media accounts for the site, and do not add features that assume
one exists: no Twitter Card metadata naming a handle, no follow buttons, no
platform-tied share widgets. Generic Open Graph is fine.

The maintainer has no social accounts and does not want to run one. Stated as a current
position rather than a permanent rule -- so propose plainly rather than building toward
an account that does not exist.
```

## openrouter-headline-pricing-is-the-top-provider-s

```text
OpenRouter headline pricing is the TOP PROVIDER's rate for a row, re-chosen on a
rolling 30-second window -- never the vendor's own. Prose making any party the payee of
one is false; the FACT is faithful and must not be edited. (Causes and measurements:
model-card-and-pricing-traps.)

ENFORCED since 2026-08-31 by lib/price-attribution.mjs, a build ERROR wired into
lib/build-content.mjs. Compliant form: row-attributing verbs ("the row lists at", "heads
at"). The escape hatch IS the remedy -- the section must mention the provider layer;
never name the provider, it rotates. Pre-existing instances live in
data/price-attribution-debt.json, warn not fail, and the list may only shrink.

TWO MASK LESSONS, learned the hard way and pinned by tests: masks must be matched
against the ORIGINAL text (cascading blanks any line that opens with an inline code span
-- it hid 6 of 15 real hits), and a transclusion marker's own text is a VALUE, not
prose, so it must be masked before scanning for verbs.
```

## openspec-archive-dangling-headings

```text
MEASURED 2026-08-31 against @fission-ai/openspec 1.11.0 with throwaway fixture repos,
not read off the source: (1) a MODIFIED heading the target spec does not have makes
'openspec archive' ABORT, exit 1, no files changed -- a dangling MODIFIED is NOT the
silent no-op it is often assumed to be. (2) a REMOVED heading the target spec does not
have only WARNS ('treating it as already removed'), exit 0, the archive completes, the
change directory moves to archive/, and the requirement STAYS in openspec/specs/. That
second one is the genuinely silent failure and is unrecoverable in place, because the
change is gone from changes/ by the time you notice. scripts/check-spec-deltas.mjs
refuses both at build time.

THE THIRD CASE, and it FIRED FOR REAL on 2026-09-01: TWO UNARCHIVED CHANGES CARRYING A
MODIFIED BLOCK ON THE SAME REQUIREMENT. Archiving both is last-writer-wins and THE LOSER
IS SILENT -- no warning, no error, exit 0. The second archive's block is derived from
the text as it stood BEFORE the first archive, so it quietly reverts whatever the first
one added.

  check-spec-deltas.mjs --strict CATCHES THIS, by name, as [collision]:
    "2 unarchived changes touch this requirement (...). Archiving both is
     last-writer-wins and the loser is silent. Reconcile the blocks, or
     re-derive the second against the first's archived text."

WHAT IT CAUGHT: catch-the-constitution-up-to-the-code and make-the-blog-worth-sending
both modified specs/loop's "Spending is budgeted in model-minutes with floors and
ceilings". The blog change added `scout` to the new-writing category plus a paragraph
explaining why. Archiving the catch-up second would have deleted both, silently, in a
change whose entire purpose was to make the constitution describe the code.

THE FIX, the checker's own second suggestion and the safer one: archive the OWNING
change FIRST, then RE-DERIVE the second block against the now-live text -- do not
hand-merge from memory of what the other change said.

VERIFY THE RE-DERIVATION RATHER THAN TRUSTING IT: extract each MODIFIED body from the
delta and the same-headed body from the live spec and diff them line by line. The number
to look at is LINES REMOVED -- a purely additive MODIFIED block shows 0 removed, which
is proof nothing was clobbered. On the real case the re-derived block showed 0 removed /
40 added, and the two tense-only bodies showed 7 out / 8 in and 2 out / 4 in with every
bullet and scenario byte-identical -- which is also how you substantiate "unchanged in
substance" instead of asserting it.

ORDERING RULE: when archiving a batch, run check-spec-deltas --strict FIRST, archive the
changes it names as colliding BEFORE the ones that collide with them, and re-run the
checker between the two groups. Five changes archived cleanly in any order on the real
run; only the pair sharing a requirement needed sequencing.
```

## openspec-delta-preamble-not-archived

```text
A delta file's PREAMBLE (everything above the first '## ADDED/MODIFIED/... Requirements'
heading) is NEVER archived: openspec's buildUpdatedSpec composes the rebuilt spec from
the TARGET spec's title, Purpose and section preamble plus the DELTA's requirement
blocks only. So rationale about why an edit is being made belongs in the delta preamble;
only what the system DOES belongs under a '### Requirement:' heading. A MODIFIED block
replaces the WHOLE requirement body, which is how 'Amended in one clause only...'
reached openspec/specs/pulse/spec.md on 2026-08-31. scripts/check-spec-deltas.mjs scans
requirement blocks only, for exactly this reason.
```

## orchestrator-may-edit-data-config

```text
STANDING AUTHORITY, maintainer-granted, two grants that stack:
1. 2026-08-29 -- the orchestrator may turn `publish` on and off in data/config.json at
   its own judgment, without asking.
2. 2026-08-30 -- BROADENED TO THE WHOLE FILE: the orchestrator may edit data/config.json
   at its own judgment, between runs, without asking. Asked for a narrow one-edit grant
   (adding `scout` to the three shed_levels exclude_types), he granted the general form
   instead.

THE BAR: an edit that LOOSENS a constraint carries the push bar -- the gates pass (see
publish-authority-and-gates). An edit that TIGHTENS one needs no justification, exactly
as turning publishing off needs none.

THE BOUNDARY THAT NO GRANT TRANSFERS: a DESK JOB still may not edit this file, and a job
that tries still writes HOLD.md. That was never about permission -- it exists so a run
cannot rewrite its own budget, shedding or publishing mid-flight, a conflict of interest
that belongs to the actor, not the file. An orchestrator acting BETWEEN runs is a
different actor in a different position. If you are a job, none of this is yours.

STILL THE MAINTAINER'S ALONE: `bd dolt push`, `gh pr create`, `gh pr merge`, and STOP.

WORKED EXAMPLE, also why the grant was needed: loop/lib/budget.mjs sheds by
`shed.exclude_types.includes(candidate.type)` -- literal arrays, not budget categories.
GREP `exclude_types` rather than trusting a line number (locator corrected 2026-09-07:
this entry said :372 and the code is now near :636-645). Categories feed the budget
CEILING and nothing else. So a claim that "the selector reads config categories" for
shedding is false about the code, and any new job type must be added to all three
exclude_types arrays by hand or it stays selectable at every shed level. Config validation
does NOT check exclude_types against JOB_TYPES, so adding a type early is inert and safe;
but once it IS a JOB_TYPE, job_caps_minutes must gain a cap for it or loadConfig throws.
```

## predecessor-repo-stays-private

```text
github.com/addicted2ai/AddictedtoAIdotnet (the PREDECESSOR repo) must stay private
PERMANENTLY: GitHub holds 48 server-side refs/pull/* refs carrying the maintainer's
personal email, and those refs are IMMUTABLE -- a force-push does not rewrite them and
deleting the repo does not clear them.

Do NOT confuse this with the CURRENT repo. github.com/addicted2ai/AddictedtoAI is a
scrubbed migration, re-verified clean on 2026-08-16 across all 113 pull refs. A stale
index line once read as if it applied to the current repo and caused a false alarm.
```

## price-attribution-repayment-addictedtoai-sng-2026-08-31

```text
price-attribution repayment (addictedtoai-sng, 2026-08-31): OpenRouter headline == the
vendor's own STANDARD-TIER endpoint rate on all 22 rows checked live for the four debt
files. So the l6j hazard ('the top provider rotates') did NOT bite on any of the fifteen
-- no ratio inverted, nothing withdrawn.

The real residual hazard is different and is addictedtoai-pfc: one provider lists ONE
ROW at several tier prices (openai/flex 0.5x, standard 1x, openai/fast 2x;
google-ai-studio flex/standard/priority = 1x/2x/3.6x; azure/bedrock regional +10%).
google/gemini-3.1-pro-preview proves it cannot be explained by rotation: all six
endpoints are Google and Google still lists three prices.

ALSO: OpenRouter's per-row 'description' field sometimes STATES the multiplier verbatim
('premium 6x pricing', '2x pricing relative to regular Opus 4.8') -- independent vendor
corroboration, and it makes 'not a multiplier X announced' a FALSE hedge on Anthropic
rows. Check the description field before writing any hedge that denies a vendor set a
ratio.
```

## proposal-selection-is-governed-by-expires-not-by

```text
Proposal selection is governed by `expires:`, not by priority. Measured 2026-08-31 on
data/proposals/: cooling is PROPOSAL_COOLING_DAYS=3 measured on FILE MTIME
(loop/lib/proposals.mjs), and `expires:` skips cooling entirely. All five consumed
proposals carried `expires:`, so did the only ripe live one, and NO proposal without an
`expires:` key had ever been consumed. So a 'filed N, consumed 0' count for a type whose
proposals carry no expiry is evidence they are YOUNG, not that they are starved -- do
not read it as a selector or priority problem without first checking file mtimes. This
corrected two agents' analyses of addictedtoai-3zf on the same day.
```

## publish-arms-scripts-that-sound-read-only

```text
A SCRIPT'S NAME DOES NOT TELL YOU WHETHER IT PUBLISHES. `publish: true` arms EVERY code
path reaching the shared publish step. Two entry points whose names promise inspection
have pushed to the live remote:
1. `npm test` (2026-08-29, addictedtoai-wxq / -64y) -- loop/tests/publish.test.mjs
   called the real shared step against DEFAULT_REPO_ROOT. Pushed, then wrote HOLD.md,
   which STOPS THE DESK until it is cleared.
2. `node pulse/verify-zero-model.mjs` (2026-08-30, addictedtoai-r8k) -- it spawns the
   real pulse/run.mjs, which reached its publish step and pushed origin/main. Run by a
   sealed reviewer told twice never to push, while following this project's own rule to
   verify a mechanism by RUNNING it.

BOTH ARE NOW FIXED, and both fixes were verified rather than assumed on 2026-08-30
before `publish` was turned back on:
- publish.test.mjs builds a FIXTURE repo and points the step at it; the publish: true
  case never touches this repository.
- verify-zero-model.mjs APPENDS `--dry-run --assume-publish` to the child's argv.
  Appended, not defaulted: run.mjs parses argv into a Set, so a caller can add flags but
  cannot remove these two. Measured walking the publish path with publish overridden to
  true and pushing nothing. Confirmed empirically: a full `npm test` run with
  publish:true left origin/main unmoved.

THE CLASS SURVIVES THE TWO FIXES, which is why this memory stays. Before running ANY
script here while publish is true, check what it SPAWNS. "verify", "check" and "test" in
a name are not evidence of read-only behaviour. If you cannot confirm a verifier is
inert, turn publishing off first -- that needs no justification.

THE SHARED ROOT CAUSE, worth more than either fix: both happened because code assumed
`publish` was false and NOTHING RE-CHECKED when it changed. A test-file or verifier header
asserting "publish is false throughout this change" is an assumption with an expiry date.
The durable repair shape is code INDEPENDENT of the flag rather than correct about it --
what `--assume-publish` achieves: identical behaviour either way, covering more than
before because it always walks the publish path model-free instead of skipping it whenever
the flag happened to be off.

STAGING AND PUSHING ARE DIFFERENT OPERATIONS AND ONLY ONE WAS TIGHTENED (measured
2026-09-07). Staging is now declared: pulse/run.mjs and loop/run.mjs both pass `owned` as
exact paths, and the wholesale `owned: null` branch survives only as an explicit choice a
future caller would have to make. THE PUSH IS NOT SCOPED AT ALL -- pulse/lib/publish.mjs
pushes `origin main` branch-wide and unconditionally, so a run that stages perfectly still
publishes every other commit sitting on main, including one whose gates have not finished.
Carried by addictedtoai-zuoo (raised to P1 on 2026-09-07 after a Desk job pushed an
ungated merge commit mid-gate-run). Test BOTH staging branches against a throwaway repo
with a BARE origin in the OS temp dir, and read the commit back with `git show
--name-only` off the REMOTE: asserting on the local tree or the step's return value misses
what actually got published.

DO NOT WRITE A BEHAVIOURAL TEST WHOSE FAILURE MODE IS A DEPLOY. r8k's regression test is
structural for exactly this reason: "run it and assert nothing was pushed" deploys the
site if the guard regresses. A check whose red path is a live push is the defect, not
the detector.

--- ADDED 2026-09-08 by addictedtoai-73, after the corpus was condensed. NOT part of
the original memory text above. ---

CALIBRATION ON THE UNSCOPED PUSH: THE EXPOSURE IS UNIFORM, THE IMPACT IS A FUNCTION OF
WHAT THE COMMIT TOUCHES. Every session's ordinary local commit on main is publishable by
any other session's run, without exception -- that part does not vary. But ungated
executable code under lib/, loop/, pulse/, scripts/ or app/ is read by npm test and the
build, while an ungated file that no build reads and that is not exported into out/
reaches the remote with NOTHING a visitor sees changed and no build able to break.
Measured 2026-09-07/08 on FULL-MEM-LOG.md: read by nothing in the tree, not exported.
So do not stop a productive Desk chain to gate a file no build reads -- that is
PERFORMING caution rather than exercising it. Gate it in the next merge window.

--- ADDED 2026-09-08. NOT part of the original memory text above. ---

HOW OFTEN THE UNSCOPED PUSH ACTUALLY CARRIES SOMEONE ELSE'S WORK. Measured 2026-09-08:
FIVE of one session's SEVEN local commits had already reached origin/main via OTHER
sessions' publish steps, none by any act of its own, and the remaining two sat in a
ten-commit unpushed backlog awaiting whichever Desk job finished next. THE SWEEP IS THE
NORMAL ROUTE TO THE REMOTE HERE, not an occasional accident, and that is the fact worth
holding rather than the dramatic single instance.
THE CONSEQUENCE FOR HOW YOU WORK: "I COMMITTED LOCALLY" IS NOT "I HAVE NOT PUBLISHED".
CLAUDE.md's "commit locally as often as you like" and "push only what passed the gates"
cannot both hold while the push is branch-wide and unconditional (addictedtoai-zuoo).
Keep anything you might still REVERSE on a branch and land it in a window; for
append-only work no build reads, the sweep is harmless and a branch is ceremony. The
thing that publishes your work is a job that knows nothing about it.

--- ADDED 2026-09-08 by A2AI-Orch, with a self-reported instance from the index holder.
NOT part of the original memory text above. ---

THE TEST FOR WHETHER A COMMIT NEEDS THE GATES: before committing to main, ask whether
ANYTHING IN `npm test`, `npm run build` OR THE THREE VERIFIERS READS THE FILE. If yes it
needs the gates and belongs on a branch. If no -- a doc, a log, DIRECTIVES.md -- committing
directly is fine and the publish sweep carrying it is harmless.

MEASURED INSTANCE, SELF-REPORTED 2026-09-08. The session curating FULL-MEM-LOG.md had
correctly established that the log is inert: no build reads it, it is not exported into
out/. It then added data/mem-log-manifest.txt to the SAME COMMIT and carried the inert
verdict across without re-deriving it. The manifest IS GATE-RELEVANT --
scripts/mem-log-integrity.test.mjs reads it, and that test runs in `npm test`, one of the
six gates -- so commit 5fc2d40 was ungated, push-eligible work, not an inert doc commit.
The session had READ that very test file minutes earlier, and still did not connect it.
THE SHAPE, which is why this belongs in the corpus rather than in an apology: A PROPERTY
WAS ESTABLISHED FOR ONE SET, THE SET WAS THEN ENLARGED, AND THE VERDICT WAS NOT
RE-DERIVED. Same family as the-only-list-available-becomes-the-work-list one level down --
the list was "the file I am curating" and the work was "every file in the diff".

A CORRECTION TO AN OPERATING ASSUMPTION, 2026-09-08, and it is the mirror image of the error
already recorded in this entry.

FULL-MEM-LOG.md IS GATE-RELEVANT. The session curating it had been treating its commits as
inert -- documentation, read by nothing the gates run. Verified and wrong:
scripts/mem-log-integrity.test.mjs READS the file, and scripts/run-tests.mjs searches
['app', 'lib', 'loop', 'pulse', 'scripts', 'tests'], so that test is inside `npm test`.
A commit to the log therefore changes the tree under a running gate suite and can trip a
harness's sha pin at the end, costing the whole run.

THE ERROR RECORDED ABOVE WAS A SESSION PROVING ITS LOG INERT AND THEN CARRYING THAT VERDICT
OVER TO A GATE-RELEVANT FILE IN THE SAME COMMIT. This is the same mistake with the operands
swapped: the file WAS the log, and the log was never inert. A DOCUMENT IS NOT INERT BECAUSE
IT IS PROSE; IT IS INERT ONLY IF NOTHING THE GATES RUN READS IT, and a guard written to
protect a document is exactly the thing that makes that document load-bearing. Writing a test
for an artefact MOVES it into the gated set -- the act of protecting it changes its class.

HOW IT SURFACED IS THE PART TO KEEP. A peer ENUMERATED every commit in a range by lane and
counted; it did not reason about who was likely to be committing. Four commits in twelve
minutes from a session filed under "documentation" is invisible to a model of who matters and
obvious to a count. THE LANE A SESSION IS FILED UNDER IS A PREDICTION, AND A COUNT IS A
MEASUREMENT.

```

## publish-authority-and-gates

```text
The site is LIVE at https://www.addictedtoai.net/ (2026-08-29, 9870ffd). Both grants are
given, deliberately on separate days:
1. `git push` to main -- lifted 2026-08-28, after the orchestrator declined once and
   made the maintainer reaffirm. The point was never the keystroke: a human, not an
   inference, decides when the repo reaches the public internet.
2. `publish: true` in data/config.json -- 2026-08-29. The LARGER grant: it arms the
   Pulse's and loop's OWN publish step, so a scheduled engine pushes unwatched.

THE CONDITION, binding on both: push only what passed the gates -- npm test, npm run
build, verify-launch, verify-design, verify-surfaces, verify-analytics. A failing gate is
a stop, not a warning.

ORCHESTRATOR STANDING AUTHORITY (2026-08-29): may toggle `publish` on and off at its own
judgment, without asking. OFF needs no justification; ON carries the gate bar. This does
NOT weaken the reserved path -- NO DESK JOB may edit data/config.json, and one that tries
writes HOLD.md, because a job unblocking its own publishing mid-run is a conflict of
interest, not a permission question. An orchestrator acting BETWEEN runs is a different
actor. If you are a job, this authority is not yours. Full config grant and worked
example: orchestrator-may-edit-data-config.

STILL THE MAINTAINER'S ALONE: `bd dolt push`, `gh pr create`, `gh pr merge`.

WHAT MAKES publish:true TOLERABLE: the publish step runs AFTER the site rebuild, so a run
producing content the build rejects publishes nothing. Proven within hours
(addictedtoai-2v6).

VERIFY PUBLISHING BY WATCHING THE LIVE SITE CHANGE, never by runs completing. Two
consecutive runs with identical /status.json build stamps mean it is broken, whatever the
logs say.
```

## records-commit-pathspec-trap

```text
ONE UNMATCHED PATHSPEC IS FATAL FOR A WHOLE `git add`, and here that discarded three
jobs' records in one afternoon (addictedtoai-tqpq, 2026-09-03).

THE INTERACTION: `loop/run.mjs` stages a consumed or swept proposal's SOURCE path
deliberately -- that is how the deletion travels in the same commit as the addition, so
the history never shows one proposal existing in two places. It works only while git
still knows the path. It broke when the publish step ran BEFORE the records commit and
staged data/, content/, public/ WHOLESALE (addictedtoai-ps3), committing the move first:
the source path was then in neither the working tree nor the index, `git add` said "did
not match any files", exited 128, and every other path in that invocation was lost with
it. So the trigger was not the code alone -- it was publishing being ON, which is why it
appeared the day posts started publishing and hit j-20260903-02, -05 and -06 in one
afternoon, each reporting `done`.

THAT ORDERING HAS SINCE BEEN FIXED (measured 2026-09-07): the loop now commits records
FIRST and then publishes, declaring the exact paths it owns rather than staging
wholesale -- grep `commitJobRecords` and then `publishStep(ctx, { cfg, owned: staged })`
in loop/run.mjs. The wholesale `owned: null` branch survives in loop/lib/publish.mjs only
as an explicit choice a future caller would have to make. The TRAP itself is unchanged
and is why this memory stays: any path staged by something else before your `git add`
runs will kill the whole invocation.

WHAT MADE IT INVISIBLE FOR THREE JOBS: the call site read none of `gitTry`'s
`{ok,status,stdout,stderr}`. A failed `add` left the staged-paths check empty, which is
byte-identical to "there was nothing new to commit". Two very different outcomes, one
silent branch, and the run still said `done`.

THE GENERAL LESSON, bigger than git: WHEN A DIAGNOSIS IS BLOCKED, SHIP VISIBILITY BEFORE
SHIPPING A THEORY. The index-lock hypothesis was plausible, had a real mechanism (two
engines share one checkout), and was WRONG. Making the failure print what it saw found
the true cause on the very next run -- the same move that solved addictedtoai-4w2, where
two rounds of argument produced two wrong answers and publishing a field made the builder
say what it saw.

ALSO: `git add` has no `--ignore-unmatch` (that is `git rm`). The fix is two nets -- drop
a path absent from disk AND unknown to `ls-files` up front (keeping absent-but-TRACKED,
the whole point of the mechanism), and retry per path if the batch fails anyway. Two nets
can hide each other: a two-factor mutation showed the retry had no test of its own,
because every other test was satisfied by the pre-filter or by the total-failure branch.
A net no test can distinguish is a net that gets deleted by accident.

And a terminal log line that ALWAYS prints (`job <id> complete — outcome <x>`) is what
makes "did this run finish?" answerable from a log. Its absence is why a clean exit 0
mid-function looked identical to a completed run.
```

## reviewed-bytes-direct-edit-route

```text
A DIRECT EDIT TO A REVIEWED PIECE FAILS THE NEXT GATE, NOT THE BUILD, and the route back
is an `entry: re-review` directive -- never a hand-written record.

MEASURED 2026-09-06 18:25. The 18:00 Pulse advanced the openrouter-models snapshot and
lib/snapshot-census.mjs refused two censuses dated the day before (the addictedtoai-pxx1
class), so the orchestrator applied the corpus's own hedge ("as observed on 5 September
2026") directly on main. `npm run build` went green, and verify-launch then failed: both
pieces carry review records that bind to their BYTES (lib/review-hash.mjs), so the edits
read as "mismatched — reviewed and then changed" (recorded 53, mismatched 2). The gate
was right: any byte change to a reviewed piece is a re-review, and the reviewer is the
Desk's, not the orchestrator.

THE ROUTE, already recorded twice in DIRECTIVES.md (the moonshotai-kimi-k2-5 lines,
j-20260831-11 and j-20260901-15): keep the edit on main if the build needs it, append
`- entry: re-review <path>` stating what changed and why, "offered as context and not as
a conclusion to accept", and let the Desk's reviewer judge the page as it stands and
write the record. A `mismatched` record cannot reach the derived queue
(addictedtoai-ccky), so the directive is the only input that reaches the Desk. Do NOT
revert to make the gate green (that only moves the red to the build), do NOT edit
data/snapshot-census-debt.json (the ratchet is for instances already wrong), and do NOT
write or touch a review record by hand.

BEFORE touching any file under content/, check whether it is reviewed: `grep -l "<path>"
data/reviews/*.md`, or read verify-launch's binding line. If it is, the edit is the
Desk's unless the build is red without it -- and then it goes on main WITH the re-review
directive in the same commit.
```

## scratchpad-collides-across-agents

```text
Every subagent in a session shares ONE scratchpad directory, so two agents doing similar
work will silently overwrite each other's helper scripts under obvious names. Observed:
two revision agents both wrote check.mjs for substring verification; one read the
other's version. Benign that time -- both did the same job -- but it could as easily
have been a script that deleted or rewrote the wrong files.

Same class as parallel agents colliding on .git/index.lock, and introduced the same way:
a shared workspace without namespacing. FIX when spawning parallel agents -- tell each
to prefix its scratch files with its own task name, or give each its own subdirectory.

The disclosure behaviour is what SHOULD happen: an agent that finds a file it did not
write should read it, judge it, use or refuse it, and surface it -- never assume it is
its own.
```

## seal-the-second-review

```text
When a second reviewer checks a revision, put the prior round's findings in a SEPARATE
file and instruct the reviewer to write its own findings BEFORE opening it. Otherwise it
verifies someone else's list and finds nothing new.

Used on the founding spec: the sealed reviewer independently re-found a half-implemented
fix, and reached its answer to the owner's quality test before it could be anchored by
the previous round -- which is what made both signals trustworthy. Agreement between
same-model agents is weak evidence unless the second one was sealed.
```

## shell-approval-traps

```text
Three things stall an unattended run by tripping the approval classifier.

1. THE TOKEN `cd`, ANYWHERE. Start of command, mid-command, subshell, comment -- and AS
   A FUNCTION NAME. `cd() { :; }` is the form that keeps getting written, DEFENSIVELY,
   by someone who is not changing directory at all. The classifier matches the string,
   not the intent. So state the rule about the TOKEN: "the string cd must not appear in
   your command at all, including in a definition that makes it do nothing." A brief
   saying "never change directory" has not said this. Use `git -C <repo>`, `npm --prefix
   <repo>`, absolute paths.
2. LONG COMMAND STRINGS. Multi-step one-liners trip approval where a small script does
   not. Write a .mjs or .sh and run it. Same for `node -e`.
3. SHELL FILE TOOLS. Prefer Read/Write/Edit/Grep/Glob over cat/sed/echo/grep/find: they
   handle Windows paths and CRLF correctly and never reach the classifier at all. An
   auto-mode reminder suggesting otherwise does not outrank this.

THE GUARD IS ARMED NOW, AND THIS MEMORY USED TO SAY IT WAS NOT. Measured 2026-09-05: the
orchestrator typed the exact `cd() { :; } 2>/dev/null;` form as a defensive prefix to a
grep it did not need, and the call was BLOCKED before running by
scripts/shell-token-guard.mjs, which printed the token position, the substitute list and
the beads id. So the PreToolUse block in .claude/settings.json exists and fires
(addictedtoai-4tk / -pxj are resolved on that point). Anyone reading the old wording --
"INERT pending a PreToolUse block ... do not expect it to work, and budget for a blocked
call per few agents" -- should stop budgeting for the violation to LAND; it no longer
lands, it is refused, loudly, with instructions. What changed is the failure MODE, from
an approval prompt waking the maintainer to a self-explaining block costing one
rewritten command. It does NOT make the rule less worth repeating in a brief: the
prose-instruction ceiling below is real and was the reason the mechanism was built, and
the mechanism now carries the weight the prose could not.

REPEATING THE RULE IN A BRIEF IS NECESSARY AND HAD DEMONSTRABLY FAILED BEFORE THE GUARD.
Count: nine-plus violations across three days, plus TWO on 2026-08-31, each by an agent
whose brief named the token AND the literal `cd() { :; }` form, and whose spawn message
repeated it. The second is decisive: its brief said verbatim that this was "the exact
form an agent wrote today AFTER being told twice not to", and the agent typed it as its
THIRD tool call, described as a "placeholder", serving no task -- three tool calls
between reading the warning and reproducing it. The 2026-09-05 instance above is the
same shape from the orchestrator itself, which is the point: knowing the rule cold is not
protection, and only the mechanism is.

A BLOCKED CALL IS NOT A DENIAL, AND CONFLATING THEM COSTS WHOLE TASKS. The rule "if a
tool call is blocked, report it and stop" governs a DENIAL OF THE WORK: a declined
permission, a credential without scope, a guardrail refusing the thing you set out to do.
It exists so an agent does not hunt for another route to something a person decided
against. It does NOT govern your own malformed command. Measured 2026-08-31: one agent
hit the `cd` block, reran without the string, and finished; a second hit the identical
block and STOPPED ITS ENTIRE TASK citing that rule, having done nothing but read its
brief. The task was intact, nothing was denied, and a resume recovered it -- but the
whole invocation was spent. This matters MORE now that the guard is armed, not less,
because the block is the common case rather than the rare one. Any brief carrying the
blocked-call rule must draw the distinction explicitly.

THE CLASSIFIER CATCHING SOMETHING IS ALSO NOT THE ALARM. The alarm is an approval PROMPT
reaching the maintainer, which is what an ambiguous command produces. A blocked call is
the guardrail working silently. Agents have reported blocks as though they had woken
someone; they had not.

--- ADDED 2026-09-08 by A2AI-Orch, handed over as text. NOT part of the original memory
text above. ---

THE INVERSE OF THIS ENTRY, and the more dangerous direction. Above is a DISCIPLINE THAT
FAILED and was replaced by a mechanism: nine-plus `cd` violations across three days by
agents whose briefs named the token, until the PreToolUse guard made the prose
unnecessary. The inverse case is a DISCIPLINE THAT WORKED, and it is invisible.

A DISCIPLINE THAT WORKS IS INDISTINGUISHABLE FROM A MECHANISM THAT EXISTS, RIGHT UP UNTIL
THE DISCIPLINE IS REMOVED. While it holds, the system is safe and nobody can tell WHY.
Removing it is the only experiment that separates the two, and it is an experiment run in
production by definition.

MEASURED 2026-09-08. The maintainer's one-codex-session-at-a-time rule was A HUMAN
STANDING IN FOR A LOCK. When he lifted it -- "it really was meant to prevent collisions and
machinery lock issues, you can disregard it moving forward" -- a peer session was told its
purpose was served by four mechanisms, HAVING EXAMINED NONE OF THEM. Four of six
concurrency controls then proved broken under parallel workers: breaker 1, the budget
read-then-act, noOutputStreak and lanePause.

THE DIAGNOSTIC THAT SEPARATES THEM, from A2AI-Luna-Boss-2: A CONTROL THAT COUNTS WITHIN A
WINDOW SURVIVES CONCURRENCY; A CONTROL THAT DEPENDS ON ORDER, OR THAT READS-THEN-ACTS,
DOES NOT.

THE RULE: when a discipline is removed, ENUMERATE THE MECHANISMS SUPPOSEDLY DOING ITS WORK
AND READ EACH ONE. "Its purpose is served by X" is a claim about X, and until X has been
read it is the same unexamined assertion the discipline was concealing.
```

## snapshot-census-hedge-2026-08-31-commit-23490df

```text
snapshot-census hedge (2026-08-31, commit 23490df): a mismatched census is accepted only
when its own PARAGRAPH carries the exact marker 'as observed on DATE', date immediately
after, in prose (masked text), and the date is strictly earlier than the bound snapshot.
'as of the DATE snapshot' and 'in the snapshot of DATE' are deliberately NOT the marker -
they scope a claim without saying it may age, and accepting them would switch the check
off for the whole corpus. Undated and future-dated censuses can never reach the branch.

THE MECHANISM IT GUARDS: lib/snapshot-census.mjs binds prose census claims to the
openrouter-models snapshot date, and that date ADVANCES EVERY DAY (the 06:00 Pulse
rewrites latest.json's `date`). Before the hedge, every anchored claim went red the next
morning unless hand re-dated.

NEVER RESOLVE A RED CENSUS BY ADDING ENTRIES TO data/snapshot-census-debt.json. That
ratchet is for instances ALREADY wrong; forgiving a whole day's worth switches the check
off for the entire corpus. This rule outlived the failure it was written for and is the
part of this memory most likely to be needed. (Absorbed 2026-09-07 from
snapshot-census-daily-red, which was retired: it predicted a red build every morning from
16 claims across 9 documents, and that prediction is now FALSE. Measured 2026-09-07 by
running the real checkSnapshotCensus() over the live corpus at that day's snapshot: 675
docs, 23 claims in 14 documents, 21 cleared by the hedge, 0 errors, 0 known, 0 debt.
addictedtoai-pxx1 carries it.)

WATCH THE HEDGED COUNT. The prebuild census line prints it; if it climbs well past 15 the
corpus is leaning on the hedge as a default and addictedtoai-6nrk (derived census fact) is
the real answer. IT IS ALREADY 21 as of 2026-09-07 -- past that threshold, measured, and
nobody has acted on it.

--- ADDED 2026-09-08 by addictedtoai-73 (found and self-reported), relayed via
A2AI-luna-boss. NOT part of the original memory text above. ---

REMOVING A DATE FROM A HEDGED PARAGRAPH MOVES THE ANCHOR RATHER THAN REMOVING IT, AND
THE MOVED ANCHOR CAN BE FALSE. Measured 2026-09-08 on
content/wiki/model/z-ai-glm-5-2-free.md. The check pairs a census claim with a date in
its OWN PARAGRAPH, so an author who added the `as observed on DATE` marker while
DROPPING the ISO date already in the sentence did not leave the claim unanchored -- the
check bound it to the NEAREST REMAINING date, a 2026-09-06 snapshot mentioned three
lines earlier, and demanded a hedge dated 6 September. Supplying that would have been
FALSE: the fetch happened on the 7th. The build failed AGAIN but DIFFERENTLY, which is
the only reason it was caught.

THE CORRECT REPAIR keeps the ISO date in the sentence AND adds the marker with its date
immediately after, in the past tense. The landed form, read back out of the file: "A
live fetch of the catalog on 2026-09-07 ... carried 430 rows as observed on 7 September
2026". NO NUMBER CHANGES -- the claim was true when it was fetched, and what is repaired
is the sentence's SILENCE ABOUT AGEING, not its content.

THE HEDGED COUNT AS A SERIES, not a pinned number -- this entry's own count went stale
within a day, exactly as the entry warned it would:
  2026-09-07   23 claims in 14 documents, 21 cleared by the hedge, 0 errors, 0 debt
  2026-09-08   23 claims, 23 hedged, 0 errors, 0 debt
WHAT THE NUMBERS DO NOT SETTLE, and it changes what fixes this: the CLAIM count did not
move while the HEDGED count rose by two. That is equally consistent with (i) two new
hedge-dependent pages arriving, and (ii) the SAME 23 claims, two of which still matched
the snapshot date on the 7th and AGED INTO needing the hedge on the 8th. The reading
relayed with these figures was (i); the arithmetic alone does not distinguish them. THE
CHECK THAT WOULD: compare the DOCUMENT SET across the two days -- new slugs mean (i), the
same 14 documents mean (ii). Reading (ii) is the one addictedtoai-6nrk closes (OPEN, P2,
"derived catalog-census fact type: close the census class instead of dating it";
verified open 2026-09-08), so settle it before designing from it.

--- SETTLED 2026-09-08 by A2AI-luna-boss, correcting its own earlier reading;
commits re-verified independently before recording. ---

THE QUESTION ABOVE IS ANSWERED: IT IS AGEING, NOT ARRIVAL -- reading (ii). Settled by git
rather than by a document-set diff:
  content/wiki/model/z-ai-glm-5-2-free.md
    created             193ba10   Fri 28 Aug 2026 12:49 local  "pulse: mint the model corpus"
    census prose added  42c4bf2   Mon  7 Sep 2026 03:31 local  job j-20260907-04 (repair)
    hedged              4f669c2   Tue  8 Sep 2026 01:25 local
The page PRE-DATES the 7th; its two census claims were authored ON the 7th and are
exactly the two that moved: 21 hedged + 2 = 23, with the claim count static at 23 across
both days. NO new claims were authored between the measurements -- the same claims aged.
The arrival reading was asserted from two reports without a document list, and the
arithmetic never supported it.

AND THE SENTENCE THAT MAKES addictedtoai-6nrk'S CASE, which neither reading had alone:
THE CHECK CANNOT WARN THE AUTHOR, BECAUSE ON THE DAY OF AUTHORING THE CLAIM IS COMPLIANT.
A census anchored to today's fetch matches the day's snapshot, so the hedge is not
required and the build is GREEN. It goes red OVERNIGHT, in someone else's run, on a page
nobody is editing. Job j-20260907-04 wrote those two claims correctly and COULD NOT have
been told to hedge them by any check that existed at the moment it wrote them.
THAT IS WHY AUTHORING GUIDANCE IS A WEAK ANSWER HERE even though it looks like half the
fix: guidance has to be obeyed with NO FEEDBACK SIGNAL, on a day when the build agrees
with the author. A derived census fact recomputed with the snapshot has no such day -- it
cannot age, so the CLASS closes rather than each instance needing prose.
```

## source-verification-absence-is-weak

```text
PRESENCE is proven by one literal match. ABSENCE is never proven until you have ruled out
your own instrument. The errors point opposite ways: a summariser invents PRESENCE, a
naive byte search invents ABSENCE.

WEBFETCH'S EXTRACTOR FABRICATES plausible, correctly-formatted data appearing nowhere in
the page -- asked for OpenAI's price sheet it returned three model rows whose strings are
not in the HTML -- and it also DENIES strings present verbatim. It does not error; it
returns what the caller expected, well formatted. Its prose is never evidence in either
direction. Confirm every decisive number, quote and date by literal substring match
against the fetched bytes.

FALSE-ABSENCE MODES, each measured on this corpus, each having nearly failed a CORRECT
page: LaTeX escaping (`39.7\%`, `$1.96$%`); case at sentence start; line wrapping
mid-phrase; source typos (`induice`, `paged optimziers`, `mostly commonly encountered`);
PDF ligatures (`five` extracts as `\002ve`); shifted PDF font encodings (`UXOLQJ` decodes
to "ruling"); MathML (`n_ctx`); format variants (`70 billion parameter` not `70B`, `200
language barrier` not `200 languages`); HTML entities; and figures that exist ONLY in a
chart IMAGE -- Anthropic's 62.3% SWE-bench number will fail a text search forever. ONE
REVIEWER MEASURED 12 ABSENCES OF WHICH 11 WERE ITS OWN EXTRACTOR.

FOR PDFs: inflate the FlateDecode streams and extract PARENTHESISED TEXT LITERALS. A
raw-operator search gives false POSITIVES -- searching for 18.9 matches inside the font
operator `/F318.9664Tf`.

NEVER CONCLUDE A SOURCE IS UNREACHABLE FROM ONE FETCH METHOD. Many hosts serve 403/429 to
a bare Node fetch and 200 to a browser user-agent (bls.gov, VentureBeat, ai.meta.com). An
archive is a fallback for a source that is GONE, not one that is guarded: a Wayback
snapshot eleven days stale "corrected" a right figure into a wrong one, and the live page
returned 200 with a UA header all along. A "known-unfetchable" list is an assertion with
an expiry date -- re-test before repeating it, and never inherit one into a brief without
saying which method produced it.

A REPAIR THAT CHANGES A VALUE carries a higher burden than a new claim, because you are
asserting the previous author was wrong. Reach the live source or leave it alone.
```

## the-two-brakes-stop-and-hold-md

```text
HOLD.md and STOP are the two brakes, and they differ. STOP is the MAINTAINER'S ALONE --
he creates and removes it, and that has never changed. HOLD.md is the loop's SELF-halt,
written with its reason when a breaker trips: three consecutive same-type failures, build
or deploy red, a review-bypass attempt, or a reserved-path edit. The Desk refuses to start
while it exists; the Pulse keeps running but its deploy step is suspended.

CLEARING HOLD.md IS STANDING ORCHESTRATOR AUTHORITY as of 2026-09-01. First granted
2026-08-30 scoped to one change, and the maintainer has given it repeatedly since;
CLAUDE.md records the standing form. RECONFIRMED BY HIM 2026-09-07, in response to an
audit that found the corpus and AGENTS.md disagreeing: "The orchestrator can remove
HOLD.md, not STOP - that is mine unless I say otherwise."

AGENTS.md IS STALE ON THIS POINT AND HAS NOT BEEN CORRECTED YET (verified 2026-09-07):
AGENTS.md:220 says "Removing `HOLD.md` is itself a reserved-path violation" and :224
lists HOLD.md removal beside runners.yml and STOP as reserved. That is the OLD rule.
CLAUDE.md and the maintainer's live instruction are the current ones. If you are reading
AGENTS.md and it still says that, it is wrong; fix it rather than obeying it.

THE PROCEDURE IS THE WHOLE GRANT and never varies:
  1. Read HOLD.md; find what actually tripped.
  2. Fix the CAUSE -- not the symptom, and never the detector.
  3. Record what tripped, what was found, what changed (artifacts or beads).
  4. Only then remove the file.
A halt you cannot diagnose is a halt you LEAVE STANDING and report. The authority is the
orchestrator's BETWEEN RUNS, never a job's -- a job clearing its own halt is the conflict
of interest the brake exists for.

THE FAILURE THAT BROADENED IT, worth more than the grant: on 2026-09-01 a deploy halt was
diagnosed completely -- cause found, cause resolved, finding filed as addictedtoai-k2y0 --
and the orchestrator LEFT THE FILE STANDING anyway, quoting CLAUDE.md's then-current
"outside this change, removal remains reserved" back at the maintainer. His reply: "This
is NOT true ... I have given you authorization at least 5 times now." The written file had
not kept up with what he had actually said, and the stale sentence was allowed to outrank
him. Cost: three hours of Desk idle on a halt whose cause had already cleared.

THE GENERAL RULE THIS PRODUCED, applying far beyond HOLD.md: A MAINTAINER'S LIVE
INSTRUCTION OUTRANKS THE WRITTEN FILE. When the two disagree, follow him AND fix the file.
Quoting the file back at him is the error -- CLAUDE.md is a RECORD of his decisions, not a
source of them, and a grant given in conversation is as real as one that got written down.
The failure mode is subtle because deferring to the written rule FEELS like caution; here
it was being wrong slowly, and expensively. The AGENTS.md discrepancy above is the same
trap set again, which is why it is named rather than quietly repaired.

Both files are GITIGNORED (addictedtoai-ufu), which fixed the older trap where `git add
-A` would commit a halt signal and push it. Ignoring them relaxes no rule: everything
acting on them reads the FILESYSTEM, never git (loop/lib/breakers.mjs startGate,
pulse/lib/publish.mjs both existsSync them). Still stage by explicit path rather than -A
while one stands.

RESERVED PATHS: openspec/specs/, runners.yml, STOP. data/config.json and
.claude/settings.json and HOLD.md removal are all now orchestrator-permitted -- see
orchestrator-may-edit-data-config and publish-authority-and-gates.
```

## untasked-shall-is-invisible

```text
A specification requirement written in SHALL language with no corresponding
implementation task is invisible twice over: a literal implementer building from the task
list never builds it, and the integrated verification passes without it. The archived spec
then describes a system that does not exist. Only catchable by enumerating every normative
SHALL/MUST against the task list and COUNTING -- reading both documents does not surface
it. A full audit of the founding spec found 6 gaps in 168 occurrences.

THE RECURSION IS THE IMPORTANT PART: a revision round that repairs this class can
introduce a fresh instance of it. Round 2 fixed five untasked guardrails; the fix for one
of them stated a new rule in the spec and never tasked its other half, which round 3 then
found. After every normative sentence you add or change in a revision, name the task that
implements it and the check that measures it -- before committing.
```

## usage-json-is-readable

```text
YOUR OWN RATE-LIMIT USAGE IS READABLE, per session and unpolluted, at
C:/Users/BadBitch/.claude/usage/<session_id>.json — your id is the
CLAUDE_CODE_SESSION_ID environment variable in the Bash tool (also the id in your
scratchpad path). Written by the Claude Code status line (statusline.ps1) every ~20 s:
five_hour and seven_day each carry used_percentage (USED, not left), resets_at (Unix
seconds) and resets_local; written_at says how fresh it is; UTF-8 with a BOM (strip
\uFEFF before JSON.parse).

The shared C:/Users/BadBitch/.claude/usage.json also exists but every session overwrites
it and an IDLE session keeps re-writing stale, lower numbers every 20 s (measured
2026-09-06: it alternated 60% / 81% within seconds) — read it only with a max-in-window
guard, and treat only a changed resets_at as a reset.

Read your file before fanning out parallel agents or a long chain of Desk jobs; do not ask
the keeper how much is left. The keeper's thresholds (2026-09-06): at >=80% of the 5-hour
window stop launching new parallel work; at >=95% shed to the single highest-priority
stream and continue selectively; at >=99% or the reset pause what remains (TaskStop;
resume from the run id after the reset — brief every agent to commit as it goes so a
pause loses only the current step). A watcher that wakes a session on band crossings and
resets is C:/Users/BadBitch/.claude/scripts/usage-watch.mjs (run it as a persistent
Monitor). The full rule is C:/Users/BadBitch/.claude/rules/usage-json.md, loaded into
every Claude Code session on this machine; this memory is the copy that reaches other
harnesses.
```

## usage-json-workspace-cost

```text
WORKSPACE COST TOTAL (added 2026-09-06): each per-session file
C:/Users/BadBitch/.claude/usage/<session_id>.json also carries `workspace` (the project
directory key), `session_cost` (Claude Code's own cumulative API-equivalent figure for
that session, subagents included, never reset) and `workspace_total_cost` /
`workspace_sessions` — the running total across ALL sessions in that workspace, computed
by the status line as the sum of the latest session_cost from every session file with the
same workspace key plus its own live value; shown in the status line as "WS Cost". It
persists because the files persist; it starts 2026-09-06 and does not see claude --print
runs (Desk jobs render no status line). Informational on a flat subscription: the
rate-limit percentages are what govern; never treat dollars as a budget input.
```

## usage-sweep-desk-jobs

```text
DESK JOB COST (added 2026-09-06): Desk jobs run as claude --print and render no status
line, so C:/Users/BadBitch/.claude/scripts/usage-sweep.mjs prices them from their
transcripts with zero inference (tokens per model x usage-prices.json, rows dated and
sourced) and writes the same per-session usage file with source "transcript-sweep",
job_id, and the workspace mapped to the repository, so the status line's WS Cost includes
them. A SessionEnd hook in ~/.claude/settings.json runs it for every ending session. It
never overwrites a statusline-sourced file (Claude Code's own figure wins), dedupes by
message.id across files (a fork's copied history counts once), and is idempotent.
Calibrated: the price table reproduces Claude Code's own per-model cost line to the cent.
Per-job figures live in usage/_sweep-report.json; on 2026-09-06 288 Desk-job sessions (185
job ids) priced at $911 total, median $3.15 per job.
```

## vercel-builder-checkout-is-not-the-commit

```text
THE VERCEL BUILDER'S CHECKOUT IS NOT THE COMMIT. Measured 2026-08-31 by publishing the
porcelain entries in /status.json (addictedtoai-4w2), after two diagnoses reasoned from
inside the repository were both wrong.

  "dirty_paths": [" M package-lock.json", " M vercel.json"]

Both TRACKED, both ` M` and not `??` -- the platform REWRITES files the commit contains,
it does not merely drop new ones in. So gitignoring nothing helps, and nothing readable
from this repository can reveal it. package-lock.json is rewritten by the install step
that runs BEFORE the build command. vercel.json is generated-and-committed
(lib/redirects.mjs explains why it must be committed: Vercel reads it from the source
commit before the build, so a build-time copy cannot affect that deployment) -- and it
regenerates byte-identical locally across repeated builds, so why it differs on the
builder is still unexplained.

CONSEQUENCE: every page footer on a correctly-deployed site reads `+dirty`. The DEPLOY
CHECK is unaffected -- pulse/lib/publish.mjs matches the live stamp against the COMMIT via
stampMatchesCommit, never against the dirty flag.

THE METHOD IS THE REUSABLE PART. `dirty: true` is ONE BIT, and one bit cannot be diagnosed
from outside the machine that produced it. Three rounds of argument produced two wrong
answers; making the build PUBLISH what it saw produced the right one on the first deploy.
When a remote environment disagrees with local and you cannot read that environment, do
not reason harder -- ship a field that makes it say what it saw.
```

## verify-before-concluding

```text
Run the cheap direct check before concluding. Prefer empirical probes over documentation,
documentation over inference; never reason from what you observed by default to what is
possible.

THE SHARPER AND COSTLIER FORM: a claim written from what a change was MEANT to do rather
than a measurement of what it does. A guardrail is not what it was built to do, it is what
it does when measured -- before writing that a mechanism prevents something, RUN the thing
it is supposed to prevent.

TRUNCATION IS INDISTINGUISHABLE FROM COMPLETION. Never pipe a counting or enumerating
command through head/tail and treat it as exhaustive; count first (grep -c, wc -l) or read
the whole result. A `grep | head -6` once entered a brief as a factual enumeration of five
items when the real count was twelve.

A COMMIT MESSAGE IS AN INTENTION; THE BLOB IS THE FACT. Measured 2026-08-31: a push script
ran `git add data/config.json` and committed it under the message "publish back on" while
the file held `false`, set hours earlier and left uncommitted the whole time. The commit
turned publishing OFF, announced the opposite, was pushed, and was reported to the
maintainer as done. Nobody read the value back. THE TRAP IS MECHANICAL, not careless: a
scripted `git add <path>` stages whatever that path CURRENTLY holds -- including an edit
made hours ago for an unrelated reason -- while the heredoc message beside it describes
what you MEANT to do now; written at different times, nothing reconciles them.

THE HABIT THAT CATCHES IT: after committing a state-carrying file, read the value out of
the COMMITTED BLOB -- `git show HEAD:<path>` -- not the message, not the diff you
expected. One line, and the only thing distinguishing "I set the flag" from "the flag is
set".

--- ADDED 2026-09-08 by addictedtoai-73, after the corpus was condensed. NOT part of
the original memory text above. ---

UNDERSTATING A CONSEQUENCE IN A RECORD IS ITS OWN VERSION OF THE VACUOUS PROOF:
TECHNICALLY TRUE, AND IT CANNOT ALARM ANYONE. Measured 2026-09-08 on addictedtoai-lvba,
first written up as "a repair job restored a file to a stale baseline" -- which describes
the MECHANISM accurately and hides the CONSEQUENCE, that a revert of merged work reached
the LIVE SITE past green gates and an approving reviewer. A record that cannot alarm its
reader has failed at the only job a record has. State what it COST, not only what it DID.

--- ADDED 2026-09-08 by addictedtoai-73, after the corpus was condensed. NOT part of
the original memory text above. ---

KNOWING WHICH CLAIMS YOUR WORK RESTS ON IS THE WHOLE SKILL; CHECKING EVERYTHING
INDISCRIMINATELY IS JUST A DIFFERENT WAY OF NOT PRIORITISING. Verification effort is
finite, so spend it where a wrong claim would change what you write or do.
WORKED EXAMPLE, 2026-09-07/08, two opposite calls both correct. A session writing a
GENERAL principle into this corpus took a peer's description of its own guard code on
trust, because nothing it was writing depended on that code being as described. The same
session verified addictedtoai-lvba against `bd show` before citing it, because there the
citation WAS the claim -- and the bead turned out to be stronger than the summary given.
THE TEST is not "how confident am I?" but "DOES ANYTHING I AM ABOUT TO WRITE OR DO REST
ON THIS BEING TRUE?"

--- ADDED 2026-09-08 by addictedtoai-73 (found and self-reported), relayed via
A2AI-luna-boss. NOT part of the original memory text above. ---

A REPAIR THAT CHANGES THE ERROR IS NOT THE SAME AS A REPAIR THAT FIXES IT. Measured
2026-09-08 on the snapshot-census hedge: a first repair moved WHICH DATE the check bound
to, so the build failed AGAIN but named a DIFFERENT date -- which reads as progress. Only
RUNNING THE BUILD, rather than reading the diff and reasoning about it, distinguished a
moved error from a fixed one. When a second failure looks like movement in the right
direction, that is a HYPOTHESIS; the run is the evidence.

--- ADDED 2026-09-08 by addictedtoai-73, about itself; relayed via A2AI-luna-boss.
NOT part of the original memory text above. ---

AGREEMENT IS EXACTLY WHEN CHECKING STOPS FEELING NECESSARY. That is the condition under
which the question above -- does anything I am about to write REST on this being true --
stops getting asked at all.
MEASURED 2026-09-08, and the instance is better than the aphorism. A session had verified
a peer's claims about addictedtoai-ovrk, about ml25, and about merge scope -- every one --
then took the same peer's census TREND on trust and wrote it into a bead's notes as though
it had checked. It had the build's own output, "23 census claim(s) in 14 document(s); 23
hedged", IN THE SAME CONTEXT as the memory's "23 claims in 14 documents, 21 cleared". The
constant claim count was in front of it in both numbers. What made it skip the check was
not carelessness or fatigue: THE ARGUMENT WAS WELL-MADE AND IT AGREED WITH THE CONCLUSION.
THE OTHER HALF, from the session that caught it: the rule fires ON THE WRITER, NOT THE
READER. That session nearly wrote the same reading down verbatim and stopped only because
it was about to type a CAUSAL claim into this corpus and the arithmetic under it did not
add up. A DISAGREEMENT GETS CHECKED FOR FREE; AN AGREEMENT HAS TO BE CHECKED ON PURPOSE.
```

## verify-from-raw-not-from-reports

```text
Recompute from RAW SOURCE FIELDS for the entities the sentence names. Never from an
author's intermediate transcript, never from a reviewer's suggested value, and never by
pattern-matching the number.

- A post said two rows were "501 days apart". 501 was in the author's transcript and was
  true of something else -- the newer row's AGE on the post date. The real gap was 687.
  The round-one reviewer CONFIRMED the wrong number while believing it had re-derived it
  independently.
- A reviewer's suggested replacement is a HYPOTHESIS, not evidence. A reviser copied "62.3
  percent" out of a review without checking; it was correct only by luck of that reviewer
  having read a chart image. A brief that hands a reviser a suggested value must say so
  explicitly.

COROLLARY: some true claims are unverifiable by the house method -- a figure living only
in a chart image will never pass a substring check. Record that in the verdict so a later
pass does not "correct" it to the wrong-but-greppable number.
```

## verify-launch-and-the-loop-merge-gate-agree

```text
verify-launch and the loop merge gate agree on reads-human as of 2026-08-30 (wave 3).
scripts/verify-launch.mjs imports READS_HUMAN_TYPES and needsReadsHuman from
loop/lib/review.mjs rather than restating the post scope, and applies both rules:
non-empty, and not a duplicate of any record's (the sweep reads every record, not only
post ones, because the gate does). Before this the launch check knew nothing about
reads-human while its own header claimed the two ends agreed. Invisible only because
content/blog/ is empty.
```

## windows-node-and-git-traps

```text
Windows and Node traps in this repo, each measured.

- `git show "rev:path"` IN GIT BASH SILENTLY RETURNS ZERO BYTES with exit 0 -- MSYS
  mangles the rev:path argument, and a script then reports "not found" and the wrong
  conclusion is that the file was deleted. MSYS_NO_PATHCONV=1 fixes those reads and breaks
  everything else. Do git plumbing from a NODE script, where execFileSync spawns git.exe
  directly and no MSYS runtime touches the args.
- fs.realpathSync does NOT canonicalise case (returns d:/addictedtoai/NODE_MODULES as
  spelled); fs.realpathSync.native DOES. Matters wherever a path is hashed or
  string-compared rather than handed back to the filesystem -- scripts/build-lock.mjs keys
  the build lock on a hash of realpath(node_modules), so it uses realpathSync.native,
  resolve(), and lower-cases on win32 only.
- NEVER end a program with process.exit() on a path that has used fetch. It dies on
  'Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), src\win\async.c' exiting
  0xC0000409, REPLACING the real exit code. Fires reliably when the run's only fetch is
  late and light (6/6), not at all when it fetched earlier (0/6) -- a teardown race, so
  "did not reproduce" is not absence. Fix: set process.exitCode and let the loop drain
  (drained in 1ms). Fixed in pulse/run.mjs, and in loop/run.mjs too as of 2026-09-07 --
  it now sets process.exitCode and has no executable process.exit call
  (addictedtoai-1yt). The TRAP still applies to anything new you write.
- 'TypeError: fetch failed' from undici on 127.0.0.1 is usually connect EADDRINUSE --
  machine-wide ephemeral-port exhaustion, NOT a dead server. ~7,000 ports in TIME_WAIT
  gave 688/3000 failed loopback fetches while listen(0) never failed. Range here is
  1025-14999; TIME_WAIT holds minutes. err.cause carries the errno, err.name/message do
  not. Consequence: npm test is a merge gate and every pulse test serving an HTTP fixture
  can fail this way -- do not run the gate alongside a dozen fetching agents.

LATER LESSON, 2026-09-08. Measured by the `specgraph-origin` session in a DIFFERENT
WORKSPACE and credited to them; relayed by A2AI-Luna-Boss-2. Not reproducible here, for the
reason that is the real lesson - see the second half of it under
a-detector-that-cannot-fail-silently.

CODEX SANDBOXES RUN COMMANDS UNDER A DIFFERENT WINDOWS SID, WHICH BREAKS GIT IN TWO WAYS
THAT DO NOT LOOK LIKE A SANDBOX PROBLEM. Under `-s read-only` or `-s workspace-write`,
`codex exec` runs child commands as a different Windows security identifier than the
invoking user. Both consequences were measured:

  1. git refuses the repository with "dubious ownership" -- the standard message for a repo
     owned by ANOTHER USER, so it reads as a filesystem or permissions misconfiguration
     rather than as a sandbox artefact.
  2. ~/.config/git is unreadable, so the user's own git configuration SILENTLY does not
     apply.

The fix that works, passed as a codex config option:

    -c 'shell_environment_policy.set={GIT_CONFIG_COUNT="1", GIT_CONFIG_KEY_0="safe.directory", GIT_CONFIG_VALUE_0="*"}'

And for a reviewer running in a DETACHED WORKTREE under workspace-write, git index writes
inside that worktree also need:

    --add-dir <repo>/.git/worktrees/<name>

THE COROLLARY, WHICH IS THE PART THAT TRAVELS: WHEN HANDING A WORKING RECIPE TO ANOTHER
PROJECT, STATE THE PERMISSION OR SANDBOX LEVEL IT WAS MEASURED UNDER. The recipe this
arrived from was measured under `danger-full-access` and did not say so, which is exactly
what made the omission SILENT rather than visible as a scoped claim. A RECIPE WITHOUT ITS
CONFIGURATION STATED READS AS UNIVERSAL.

```

## worktrees-and-junctions

```text
On Windows a git worktree can share the main tree's node_modules through a DIRECTORY
JUNCTION, giving parallel agents real isolation without an npm install each: New-Item
-ItemType Junction -Path <worktree>/node_modules -Target D:/AddictedtoAI/node_modules. Use
PowerShell; `cmd //c mklink /J` from Git Bash has failed silently here. Verified: node
resolved gray-matter, zod and yaml through it.

This matters because node_modules being gitignored is the only real cost argument against
per-agent worktrees, and the junction removes both shared-tree hazards STRUCTURALLY --
each worktree has its own index at .git/worktrees/<name>/index so no index.lock
contention, and one agent's `git add -A` cannot reach another's files. Declared file
ownership in a brief is the weaker substitute: an instruction where a mechanism was
available.

BUT A JUNCTION WHOSE REMOVAL FAILED IS A LIVE HAZARD, and `git worktree remove --force`
FOLLOWS junctions into their target. That is how 177 packages were deleted from the REAL
node_modules: a script printed "could not remove junction: Path is a directory" and the
worktree was removed anyway. Before removing any worktree or directory that may hold a
junction, delete it with (Get-Item path).Delete() and VERIFY with Test-Path.

THE LESSON THAT COST THE PACKAGES: the failure was printed in output already read. When a
cleanup step reports it could not do the thing, that is a STOP -- and the very next
command was the destructive one.
```

## the-only-list-available-becomes-the-work-list

```text
--- NEW ENTRY, 2026-09-08. This key was NEVER a `bd remember` memory. It was added
after the distillation, from a lesson handed over as text by A2AI-Orch (the
orchestrator), under the protocol that findings come to the index holder rather than
being written to the store. Everything above this line in the file is an original
memory; this is not. ---

THE ONLY LIST AVAILABLE BECOMES THE WORK LIST. A mechanism publishes an enumeration that
is complete and correct FOR WHAT IT INDEXES. Because it is the only list anyone has, it
gets used as the list of WORK TO DO -- and the work is a different, usually larger set,
typically some CLOSURE over the first. THE GAP IS INVISIBLE PRECISELY BECAUSE THE LIST IS
AUTHORITATIVE: machine-generated, exhaustive, and right.

Filed as addictedtoai-xrsg (P2, OPEN, created 2026-09-08). THREE INSTANCES the same day,
three different actors, three domains:

1. data/declined-binding-debt.json enumerates 48 FACT BINDINGS across 29 model entries.
   The work of removing them is the closure over TRANSCLUSIONS, because {{fact:model/X#f}}
   resolves cross-entry and an unresolved transclusion is a BUILD ERROR. Measured: 33
   transclusions break, 12 files fail to build, and FOUR of those twelve carry NO DECLINED
   BINDING AT ALL, so they appear in no enumeration the machinery offers. The four are ORG
   entries -- deepseek, google-deepmind, openai, spacexai -- and they are invisible for a
   specific reason worth keeping: THEY HOLD NO BINDING OF THEIR OWN, THEY ONLY TRANSCLUDE.
   (Re-verified 2026-09-08 before recording: none of the four appears under an org/ path
   in declined-binding-debt.json, on an instrument proved live by 19 other matches in the
   same file -- which rules out the NUL-byte false-absence mode.)
2. A fleet brief was audited against every IMPERATIVE in its bead -- three defects caught
   -- while the brief's load-bearing PREMISE about the tree was never checked, and was
   false. AUDITING A BRIEF FOR FAITHFULNESS TO AN ISSUE IS NOT AUDITING IT FOR BEING TRUE
   ABOUT THE CODE. Two passes; only one of them was in the procedure.
3. addictedtoai-mq8e: auditing against an issue's NUMBERED list caught two dropped items
   and missed a fourth sitting unnumbered in the same paragraph.

THE DIAGNOSTIC, the part worth keeping if anything is trimmed. When a list is about to
drive work, ask WHAT DOES THIS LIST INDEX, AND IS THAT THE SAME SET AS THE WORK? Then NAME
ONE MEMBER OF THE WORK THAT WOULD NOT APPEAR IN THE LIST, and go look for it. If you
cannot construct such a member, say WHY the two sets coincide. All three instances were
found by someone ACCIDENTALLY STEPPING OUTSIDE THE LIST; none was found by consulting it
more carefully.

WHY THIS IS ITS OWN ENTRY rather than a fourth example of a neighbour. It is adjacent to
a-check-narrower-than-the-property-it-names and to never-brief-from-a-truncated-issue, and
distinct from both. The first is about GUARDS -- a check that PASSES on a wrong world.
This class produces NO FAILING CHECK AT ALL: everything passes, the work is simply
incomplete, and the incompleteness surfaces later as a build error or as nothing. The
briefing entry already carries instance 3 in its own words, which is evidence the shape is
real but was recorded as a briefing rule rather than as a general one about enumerations.
THE TRIGGER IS WHAT SEPARATES THEM: this fires when A LIST IS ABOUT TO DRIVE WORK, and
neither neighbour fires there.

--- ADDED 2026-09-08 by A2AI-Orch, about itself. NOT part of the original entry above. ---

INSTANCE 4, AND THE POINT OF IT IS THE TIMING: THE SHAPE SURVIVES BEING NAMED. The session
that filed addictedtoai-xrsg this morning, wrote its diagnostic and transmitted it to the
memory corpus, instantiated the same class that afternoon -- inside a design meant to close
a DIFFERENT instance of it.

Designing addictedtoai-vqbo, it proposed a scope rule: a job may only ratify a page its own
brief names, tested as `brief.includes(path)`. The coordinator defeated it with a
counter-example from a live brief, verified afterwards at fleet5-4lrp/.agent-brief.md:101,
verbatim:

    - Do NOT touch `pulse/lib/queue.mjs` or `pulse/lib/vanished.mjs`.

Under that test THE SENTENCE PROHIBITING A PATH AUTHORISES DECLARING IT. The briefs' "FILES
YOU MAY EDIT -- the complete list ... NOTHING ELSE" sections are worse: dense with paths
present PRECISELY BECAUSE they are off-limits. Path-mentions enumerate PATHS THE BRIEF
DISCUSSES; they were read as PATHS THE BRIEF AUTHORISES -- different sets, the first
strictly larger, and it was the only enumeration the artefact offered, so it became the
authorisation list by default.

WHY NAMING THE CLASS DID NOT PREVENT THE INSTANCE, which is the transferable half: WHEN THE
THING YOU ARE CHECKING IS A FIX RATHER THAN EXISTING WORK, SEPARATE THE AUTHORITY YOU ARE
APPEALING TO FROM THE TEST THAT IMPLEMENTS IT, AND CHECK THEM INDEPENDENTLY. A CORRECT
AUTHORITY IMPLEMENTED BY A LOOSE TEST IS MORE DANGEROUS THAN AN OBVIOUSLY WRONG RULE,
because the argument for the authority carries the test through review on its coat-tails.
The authority here was RIGHT and remains in the design -- the brief is assembled by the loop
from the directive, so the bounded thing and the bounding thing have different authors, and
an author cannot inject a path into its own brief. Everyone agreed with the authority,
including the coordinator. NOBODY LOOKED AT THE TEST, because the argument was about the
authority, and its author never ran his own diagnostic against his own proposal.

AND THE SENTENCE TO KEEP IF ANYTHING IS TRIMMED: THE SHAPE SURVIVES BEING NAMED. Filing the
class, writing its diagnostic and transmitting it to this corpus provided NO protection
against instantiating it the same day. That is a fact about how the failure works, not a
confession, and A READER WHO BELIEVES NAMING A CLASS DEFENDS AGAINST IT WILL SPEND
PROTECTION THEY DO NOT HAVE.

PLACEMENT NOTE, recorded because the alternative was arguable and a later reader may
disagree. The "check the test, not the argument for it" half has a real claim on
a-check-narrower-than-the-property-it-names, whose diagnostic -- "what wrong world would
this still pass on?" -- is precisely what went unrun. It is kept HERE because the
SET-CONFUSION is what made the loose test look tight: the author was not careless about the
wrong world, he was confident because a real, complete, correct enumeration existed and he
had used it. Cross-linked both ways rather than duplicated.
```

## two-desks-work-orders-and-trains-2026-09-08

```text
THE DESK REDESIGN IS A MECHANISM FOR THE CEILING NOBODY CHOSE. Named 2026-09-08
after the maintainer's charter addictedtoai-douz was answered: batch coherent
work into work orders, route content and machinery into front and back desks,
run the expensive gate set once per release train, and let the ledger decide
runner effort and concurrency. The three complaints were CONFIRMED, CONFIRMED
OVER THE SPAN BUT PARTLY REFUTED IN SHAPE, and CONFIRMED IN WALL-CLOCK AND
MODEL-MINUTES BUT PARTLY REFUTED ON TOKENS. Stage 0 is the brief diet, gate
reuse, runner ladder, ledger fields and baseline; Stage 1 is the train at one
worker; Stage 2 is work orders and ratification; Stage 3 is intake, two desks,
parallel workers and fleet retirement. The train waits for a later stage because
it rewrites the publish path, where a mistake is public rather than local.
(archived as <date>-two-desks-work-orders-and-trains,
proposal.md; evidence/README.md)

THE PRE-CHANGE BASELINE, WITH THE ANCHORS THAT MUST NOT BE LOST. The median
merged Desk job changed one content file and four content lines, cost about
$3.20, and took 24.3 minutes wall-clock for 18.4 model-minutes; 110 of 208
merged jobs (52.9%) touched exactly one content file. The old fixed-cost
comparison said 5.5 minutes median non-model overhead, but the Stage-0 anchor
that survives the train move is brief-commit to merge: 206 included jobs had a
22.81-minute wall-clock median and a 3.85-minute median non-model overhead
(3.90 since 2026-09-01). The old brief-commit to records-commit definition was
5.497 minutes overhead (5.50 rounded), and 41 of those 206 jobs had no records
commit anywhere in history. That missing endpoint is addictedtoai-l7cx, not a
reason to keep measuring the wrong span. The 3.85 and 5.50 are different
quantities; neither is evidence that the redesign already improved the Desk.
(archived as <date>-two-desks-work-orders-and-trains,
evidence/stage0-baseline.md; evidence/ledger-report.md §B, §C, §F)

The brief was the real token-shaped cost. Its observed series was
16,181 -> 33,491 -> 70,349 -> 103,881 characters in eleven days, about 85%
spec excerpt, with BRIEF_EXCERPT_MAX_CHARS raised from 14,000 to 88,000 four
times because unarchived changes split the per-source budget and excerptsFor
pass 2b saturated whatever budget remained. The repair is to delete pass 2b and
restore the ceiling to 24,000, while asserting the assembled size against a
pinned fixture (at most 30,000 for a repair) and measuring live brief_chars.
The live tree is a report, not a fixture; its size changes when changes are
archived or opened. (archived as <date>-two-desks-work-orders-and-trains,
evidence/stage0-baseline.md; evidence/desk-mech-report.md §B, §F)

THE PUSH-BAR WAS SIX GATES, NOT THE PER-JOB GATE SET. On main at 78c6361,
publishing off, the six-gate total was 442.5 seconds: npm test 314.8 seconds,
70.7% of the total; verify-launch 39.6 seconds, including its own 39-second
build; verify-design 35.7, npm run build 29.2, verify-analytics 19.5 and
verify-surfaces 3.7. A current job runs four of those six (test, build,
verify-surfaces and verify-design) and then pays a post-merge build, about
412.6 seconds in the arithmetic used by the design. The train moves the full
set together and reuses verify-launch's build. npm test is also the machine-wide
lock that makes spare worker capacity illusory. (archived as
<date>-two-desks-work-orders-and-trains, evidence/gate-timings-final.txt;
evidence/stage0-baseline.md)

The suite itself was 1,709 tests in 298,091 ms across 122 files. Summed test
time was about 1,380 seconds, roughly 4.6 times wall-clock because the suite is
already parallel; its twelve slowest tests, 49.5 down to 13.5 seconds, were all
Desk-machinery integration tests standing up real builds, git and bare origins.
Moving the suite therefore changes the machinery while measuring it, and can
make the suite slower before it makes the Desk faster. (archived as
<date>-two-desks-work-orders-and-trains, evidence/gate-timings-final.txt)

THE BACKLOG WAS RISING, NOT STANDING STILL. By LOCAL day, 313 beads were filed
and 212 closed, net +101; the last seven local days were 99 filed against 69
closed, a 1.43 ratio. Forty-seven of the 101 open beads came from the opening
08-29..08-31 cohort. The whole cohort was checked against the tree: 48 beads,
42 still valid, 5 partial and 1 fixed, leaving 47 of 48 open at the check.
The new-bead machinery share was measured at 64-81%, and the inflow series was
0.3-0.6 new beads per bead closed. The backlog argument is therefore an
undigested opening cohort plus a continuing drip above the drain, not a proof
that every day failed to drain. (archived as
<date>-two-desks-work-orders-and-trains,
evidence/scripts/orch-beads-flow-local.mjs; evidence/stale-report.md;
evidence/stale2-report.md; evidence/beads-report.md §B, §D)

SPEND AND TOKENS WERE DIFFERENT CLAIMS. Workspace spend split 85.6% interactive
($6,325 of $7,385.50) and 14.3% Desk ($1,057); the Desk figure is a floor,
consistent with the ledger join but not independent of it, because 40 of 240
job ids named in commits had no price record. Content was only 4.15% of changed
lines; data was 34.8% and other was 44.8%, with 187,820 lines written to job
branches and stripped again. The captured codex lane for 48 sessions that had
started before 08:00 local read 182,873,547 tokens and produced 688,798 output,
with 96% cached input: 266→286:1 read-to-write. The all-67-session partial-day
capture was 238,067,103 input and 828,209 output, 286:1, so the earlier
182.4M/685K was a running total while three sessions were still live. Token
count is not the batching argument; wall-clock, gate passes, reviewer
orientation and the brief are. (archived as
<date>-two-desks-work-orders-and-trains, evidence/spend-report.md §C, §D;
evidence/codex-spend-2026-09-08.json; evidence/README.md)

STATEMENT 14, file-the-deferral-or-lose-it, WAS ALREADY NARROWED AT 15fc520 BY
THE MEMORY CONDITIONER, and this entry cites that amendment rather than
restating it: the maintainer's 2026-08-29 words verbatim, the subject-path or
specification-requirement test, the note-on-the-parent fallback, the
close-refusal and its cause, and the "what did not change" clause all live
there and in CLAUDE.md and AGENTS.md at bd84b4b. What this entry adds is the
provenance of the cause. The unbounded rule made inflow a function of
throughput: every careful job could generate a deferral, every deferral became
a bead, and closing faster could grow the queue faster. The measured 0.3-0.6
new beads per bead closed, 64-81% machinery share and 1.43 backlog growth
ratio are that cause, and his decision was relayed, not witnessed: "I agree
with all your recommendations." (archived as
<date>-two-desks-work-orders-and-trains, proposal.md; evidence/beads-report.md
§B, §D; evidence/scripts/orch-beads-flow-local.mjs)

STATEMENT 21, agent-model-policy, ALREADY CARRIES THE INSTRUCTION AND THE
POLICY (amended 2026-09-08 at 08b627f (the draft cited b34f584, which is the pre-amend object and is UNREACHABLE), relayed not witnessed: Luna medium for
routine work, max for complex work and review); this entry adds the LEDGER
HALF it lacks, and every figure below names its population, because three
rounds between two sessions were spent on figures whose numerators agreed and
whose denominators or labels did not. By author runner over ALL job types;
mm/job is total cell minutes over all jobs whatever their outcome; first-pass
revise is "review 1 said revise" over jobs that reached a first review, a
proxy for reviewer agreement and not a defect rate, never to be combined with
the fail column:

  runner/type                    n     done       mm/job   first-pass revise
  opencode-deepseek/all          114   93%        20.1     22/108 = 20%
  claude-code-opus/all            88   86%        23.2      8/76 = 11%
  codex-gpt-luna-medium/all       25   72%        21.5       7/19 = 37%
  codex-gpt-luna (max)/all        10   70%        24.1        1/7 = 14%

Like-for-like on REPAIR, per merged job (total cell minutes, all roles and all
outcomes, over jobs with outcome done; the report's workflow-adjusted method):
opus 17.7 (32 merged of 34), deepseek 18.0 (76 of 80), luna-medium 23.2 (15 of
19), luna-max 27.1 (6 of 8). Author-only minutes per merged repair: luna-medium
11.8, deepseek 12.2, opus 13.6, luna-max 23.8. Rework share, meaning revision
plus second-review minutes over total cell minutes: luna-medium 24%, deepseek
11%, opus 4%, luna-max 0% on 8 jobs. First-pass revise among first reviews on
repair: luna-medium 5 of 16, deepseek 11 of 77, opus 1 of 32. The cheap author
is the expensive workflow: luna-medium authors a repair for the least and pays
the most to have it reworked, and the max rung produced nothing needing a
second look. The memory conditioner reproduced every one of these figures
independently from data/ledger.jsonl on 2026-09-08; the same numerators over
all jobs instead of merged jobs give 16.6, 17.1, 18.3 and 20.3, which is why
the population is written beside every number. (archived as
<date>-two-desks-work-orders-and-trains, evidence/runner-workflow-cost.md,
Method and the per-cell tables; evidence/scripts/runner-workflow-cost.mjs;
evidence/scripts/orch-runner-quality.mjs; design.md D3, the agreement table)

Beyond what statement 21 records: high is registered, conformance-passing and
named for no role; xhigh is refused and named for no role. The maintainer
ruled, "If going to high vs max only saves 10%, I'd rather just use max" after
high measured 7.03 model-minutes against max's 7.81 on four canned checks;
that 10% is provisional evidence, not a workload. xhigh failed the fabrication
trap on both runs, with two different fabrications and no averaging-away. Its
first invented quotation was "The Institute publishes no benchmark numbers
with this release and makes no claim about response times." Medium, high and
max passed the same trap. The selector refuses xhigh for author and review,
and Stage 0 task 22 adds `enabled: false` so a registered but unused rung
cannot be selected through fail-open job_types. CLAUDE.md's conformance
paragraph is the companion rule: data/conformance.json is authoritative, an
absent record warns rather than refuses, and the runners.yml conformance field
is documentation. (archived as <date>-two-desks-work-orders-and-trains,
design.md revision records rounds 3, 7, 8 and 10; evidence/README.md)

A FIGURE IN THIS CORPUS IS SAFE WHEN IT NAMES ITS POPULATION, NOT WHEN IT IS
RIGHT, AND THE TAXONOMY IS PART OF THE POPULATION. Measured on 2026-09-08 in
three rounds between the architect and the memory conditioner: the numerators
agreed every time and only the denominator or the label differed (all jobs
against merged jobs; merged jobs against first-reviewed jobs; total cell
minutes against author-plus-revision minutes). Second-review minutes were not
missing data in the third round; they were data on the wrong side of a ratio,
classed as a cost of checking when they are a cost of having been wrong, and
only the label says which side. An enumeration of candidate definitions is
itself a list, and treating it as exhaustive is how a correct "nothing
matches" becomes a wrong one. This is the memory conditioner's formulation,
kept because it is the half neither session had at the start.

THE USAGE-SWEEP-DESK-JOBS MEMORY ALSO NEEDS A CALIBRATION CORRECTION. Its claim
that the sweep reproduced Claude Code's cost "to the cent" is too strong. The
report's own calibration ratios were 1.06, 0.76 and 0.66, with one 0.0007 ratio
explained by a fork accumulator. The sweep is a floor, possibly a third low,
not an exact price oracle. That caveat travels with the $3.20 median and the
14.3% Desk split: both are useful ledger joins, neither is independent proof
of the system's full cost. (archived as
<date>-two-desks-work-orders-and-trains, evidence/spend-report.md §C, §D;
usage-sweep-desk-jobs, corrected 2026-09-08)

STATEMENT gate-order-and-build-locking's 8-job, approximately 194-model-minute
contention loss is HISTORICAL. It belonged to lock refusals that were then
recorded as failed. Since 2026-09-08, the TEST_LOCK_REFUSAL path in
loop/lib/gates.mjs:92 and run.mjs:571-575 records contention as interrupted:
resumable and not a breaker step. The forward cost is still 600 seconds of
wall-clock per contention, but not a lost job or consumed breaker count. The
redesign's case for moving npm test rests on that wall-clock and on parallelism,
not on repeating the old loss as if it were current. (archived as
<date>-two-desks-work-orders-and-trains, evidence/hist-report.md §B.3,
§C.3; design.md D2)

THE DELETIONS ARE NAMED SO A FUTURE ARCHIVE CANNOT TURN THEM INTO VAGUE
"CLEANUP." DIRECTIVES.md retires after migration: it was 169 lines / 131,951
bytes carrying 56 directives (45 done, 10 pending, 1 parked), with ten items
duplicated by same-day directives. The proposal-expiry sweep and duplicate-slug
discard are deleted because they never fired: the 15 retired proposals checked
on 2026-08-31 and the 35 consumed headings rechecked on 2026-09-08 showed no
traffic for either. The over-cap drop and self-amplification discard are KEPT
despite never firing, because they close conflict-of-interest paths in a job's
own output; a zero firing rate is not evidence that that guard is useless.

pass 2b of excerptsFor is deleted, and the excerpt ceiling falls 88,000 to
24,000. The second and third per-job builds in the old arithmetic are separated
by fact: the second, the post-merge build at run.mjs:1750-1755, is deleted because
the tripwire now builds the merged tip; the claimed third per-job build never
existed, which is why the six-gate arithmetic was corrected from three builds
to two. The property carried by the deleted build
survives: building the merged tip still catches green-apart/red-together at one
build per job. The hand-driven fleet retires at Stage 3, not before the workers
that replace it exist; its launcher remains as a measurement instrument and its
cross-change grading becomes the train review. (archived as
<date>-two-desks-work-orders-and-trains, design.md D4-D6 and
"What is deleted"; evidence/README.md)

THE PREDICTED INSTANCE 5 FOR STATEMENT 59, the-only-list-available-becomes-
the-work-list, WAS SEEN AND CLOSED THIS TIME. declared_subjects is an
enumeration that drives work: it is committed in .job/source.json at selection.
The merge gate CHECKS the diff against that enumeration rather than
CONSTITUTING the subject set from the diff. No diff path may escape the
declaration, and no declared item can retire without its own measured diff or
a reviewed declaration. The root fix is loop/run.mjs:1577-1594, reached by the
Opus reviewer and the Luna reviewer by different routes (F2 and MAJOR 3), not
by copying one reviewer's wording. The empty-diff reviewed outcome now logs and
refuses instead of silently writing no record. This closes the trap at the
authority/test boundary: the list is authoritative for what work is declared,
and the diff is independent evidence checked against it. (archived as
<date>-two-desks-work-orders-and-trains, design.md D1;
evidence/reviews/round1-sealed-opus-high.md §1 and F2;
evidence/reviews/round2-sealed-luna-max.md finding 3)

THE RESERVED PROPERTY WAS CONFIRMED AND ITS SCOPE WAS MADE EXPLICIT. The
maintainer said, "as long as work is getting reviewed before going live, I am
good". The applied reading is model-written bytes plus reviewed machinery;
deterministic derived data from already-reviewed machinery and the review's own
records are exempt, because a review cannot read its own record. The review
gate, byte-bound records, STOP/HOLD brakes, reserved paths and
fail-the-build-don't-warn remain. verify-launch's review-state binding check
at scripts/verify-launch.mjs:611 and :769 is newly put on the train, so the
reserved property's own missing-versus-mismatched detector finally runs in the
automated path. The first sealed Opus review verdict was "PRESERVED, and in one
place strengthened"; its overall verdict was "Revise before implementation."
(archived as <date>-two-desks-work-orders-and-trains,
evidence/reviews/round1-sealed-opus-high.md §1 and OVERALL VERDICT;
proposal.md §The one property that is reserved)

THE ONE-CODEX-SESSION RULE WAS A HUMAN STANDING IN FOR A LOCK, AND IT WAS
LIFTED. The maintainer said, "It really was meant to prevent collisions and
machinery lock issues, you can disregard it moving forward." Luna-Boss-2 gave
the diagnostic: "A control that counts within a window survives concurrency. A
control that depends on order, or that reads-then-acts, does not." Four of six
controls were broken under parallel workers: breaker 1's backwards walk;
budget ceilings' read-then-act; noOutputStreak's backwards walk; and lanePause
reading only the provider's newest line. shedState and the ledger/build/test
locks were sound. W therefore remains 1 until the four broken controls are
re-derived as windows and the budget gate reads reservations; 3 is the later
experiment, not today's assumption. (archived as
<date>-two-desks-work-orders-and-trains, design.md D3,
"The controls, re-derived rather than inherited"; proposal.md)

THE LEDGER'S SHAPE UNDER W WORKERS IS ONE FILE UNDER A LOCK, AND THE
ALTERNATIVE WAS AN OWN-MISS BY THE SESSION THAT HOLDS STATEMENT 59. The memory
conditioner's round-1 finding F3 offered two shapes for concurrent appends to
data/ledger.jsonl and recommended per-worker line-files as "cheaper and
removes the lock entirely". The sealed Opus F8 enumerated the file's consumers:
budget ceilings, breaker 1, shed levels, scoutRanToday and the derived queue
all read it, five where F3 had held one in mind. Line-files would have been
invisible to four of them, so W workers would overspend against headroom none
could see: one race fixed, four controls broken. The shipped shape is one
ledger file with appendLedger under a ledger lock, a selection lock over
mint-id, create-branch and the .job/ commit, and a selection-time reservation
the budget gate reads until the job's own line lands, released on every
terminal path and expiring at the wall-clock cap. Read with Luna-Boss-2's
diagnostic: the append is a read-then-act, and the lock is what makes it count
within a window. The miss has statement 59's shape (one consumer held in mind,
the work was five) but is not claimed as its instance 5, which is the
declared_subjects prediction above; a predicted-and-closed instance is worth
more than another confirmed one. (archived as
<date>-two-desks-work-orders-and-trains, design.md D3 and revision record
round 1; evidence/reviews/round1-sealed-opus-high.md F8)

The conformance record supplied the same lesson in serial form. Bead
addictedtoai-2wwu records that data/conformance.json overwrote one runner's
history: one green re-run erased a fabrication and made the record look like a
pass. The repair is append-only per-run records, with history read by the gate;
a later pass must supersede rather than erase the failure. The xhigh result then
made the point unmissable: two runs, two different fabrications, both retained.
(archived as <date>-two-desks-work-orders-and-trains, design.md
revision records rounds 7-10; evidence/README.md)

THE FRONT/BACK SHAPE CAME FROM h0z0 AND WAS CONFIRMED. The comment named "the
back-desk idea the maintainer is musing on (front-desk = content jobs; back-desk
= machinery, spec changes, beads)." The change implements that split as routing
and accounting, not two physical machines: every candidate and ledger line has
a desk, and an idle front desk scouts or does nothing. The maintainer raised
the machinery ceiling from 10% to 30% for the drain at bd84b4b. The upkeep floor
stays 40% and the new-writing ceiling stays 45%; because the bounds share one
denominator, 40 + 30 leaves at most 30 points for new writing, so the raise can
take up to 20 points from site work. addictedtoai-mnzf owns the revert: 30
stands while any of bind-what-the-catalog-knows, let-the-queue-see-a-judgment
or keep-the-map-describing-the-territory remains unarchived, then returns to 10
unless the per-desk share has replaced it. (archived as
<date>-two-desks-work-orders-and-trains, proposal.md §Answered;
evidence/beads-report.md §F; design.md revision record round 12)

REVIEW METHOD LESSONS, NOT REVIEW DECORATION. The two sealed first-round
reviewers found disjoint defects plus one shared root: Opus F2 and Luna MAJOR 3
both arrived at the declared-subject/diff error by different routes. A fresh
sealed read is not closure: round-2 Luna admitted that it read the revision
records while counting lines, so its ordered seal was broken and it was not an
independent sealed measurement. The separate Opus closure check did not merely
rubber-stamp closure: it closed 20 of 21 earlier findings and found seven new
text-level defects. Findings per kilobyte fell from 0.059 to 0.033 against 1.45
times more text; that is compatible with convergence and with a second reader
finding less, not a proof that review quality is monotone. (archived as
<date>-two-desks-work-orders-and-trains, evidence/reviews/round2-sealed-
luna-max.md; evidence/reviews/round2-opus-closure.md; design.md
revision record rounds 4 and 11)

An ordered-access seal inside one file is defeated by any whole-file operation:
the round-2 reviewer broke its own seal by reading the file to count lines. The
fix is a redacted checkout in which per-job verdicts are absent from the first
train-review invocation, followed by a separate comparator. A size bound on the
live tree is likewise a time-dependent test; assert the bound on a pinned
fixture and measure the live tree. Evidence must live in the repository because
session scratchpads die, and a script without its captured input is not
reproducible either: the codex-spend script was not enough until
codex-spend-2026-09-08.json was captured beside it. (archived as
<date>-two-desks-work-orders-and-trains, evidence/README.md;
evidence/codex-spend-2026-09-08.json; design.md D5 and revision record
round 11)

THE TWELVE REVISION RECORDS ARE PART OF THE LESSON. Round 1 carried the Opus,
Luna and memory-conditioner's dispositions: verified-SHA publishing,
leave-one-out rather than prefix bisect, pre-existing hold semantics, the
subject root fix, one ledger plus selection and ledger locks, the corrected
four-gate/two-build arithmetic, the 24,000 fixture ceiling, the Stage-0/1/2/3
restaging, and the decision to keep the conflict-of-interest drops. Round 2
mechanised failed-claim rederivation with stable identifiers and a result-file
rederived block, and restored the missing backlog-classification provenance.
Round 3 made effort a four-rung registry ladder. Round 4's closure check found
the seven new text defects and reversed the accidental Pulse-to-train
single-writer freeze. Round 5 recorded the lifted serial rule, repaired the four
concurrency controls, started W at 1 and gave reservations an expiry. Round 6
measured bd: second claims fail, re-close is a silent no-op, comments require
the include flag, and ambiguous cwd can clone the wrong remote; the choke point
must refuse before spawning. Round 7 recorded high passing and xhigh's first
fabrication; round 8 applied the maintainer's high-versus-max ruling; round 9
filed addictedtoai-2wwu for append-only conformance; round 10 added explicit
enabled:false so a registered-but-unused rung cannot be selected by fail-open
job_types. Round 11 fixed the post-records verified-SHA contract, Pulse handoff,
final train bounds, redacted seal, structured affects_merges, captured codex
input and repeated-review pricing, then recorded xhigh fabricating on 2 of 2
runs. Round 12 recorded all seven maintainer answers, the 30% drain ceiling,
the 40+30 denominator arithmetic, owner addictedtoai-mnzf and bd84b4b.
(archived as <date>-two-desks-work-orders-and-trains,
design.md revision records rounds 1-12; evidence/bd-measurements.md;
evidence/reviews/round1-sealed-opus-high.md;
evidence/reviews/round1-sealed-luna-max.md;
evidence/reviews/round2-sealed-luna-max.md)

THE DURABLE CITATION FORM IS THE ARCHIVE FORM. This change will move to
openspec/changes/archive/<date>-two-desks-work-orders-and-trains/. Future
memory, reviews and jobs must cite evidence as "archived as
<date>-two-desks-work-orders-and-trains, evidence/<file>" and must not
point at the live change path. The maintainer's decision, the measurements and
the corrections belong to the archive, not to a session that happens to still
have the change directory open.

FOUR SESSIONS COMPACTING ON DIFFERENT CLOCKS LOSE THEIR LAST TWENTY MINUTES OF
EACH OTHER, AND THE FIX IS A BOARD, NOT A RESEND. Measured 2026-09-08: three of
four sessions compacted within an hour, each asked its peers to resend, and one
acknowledgement, one packet-B blocker and one held finding were carried only in
messages. The maintainer's instruction: "Devise a simple but reliable way for
the sessions to track the state concurrently/collaboratively." Built at
D:/addictedtoai-coord/ (outside the repository, never committed): one file per
session written ONLY by its owner with Write/Edit, so there is no shared
writer, no lock, no shell and no race; a fixed header (updated in local time,
state from a closed set, head_seen, role, doing, holds, waiting_on, next,
do_not) and a short newest-first log; board.mjs prints every row with its age
and the holds in force. The rules that carry the weight: WRITE THE LOG LINE
BEFORE YOU SEND THE MESSAGE, because the file is the durable copy and the
message is the notification; after compaction read your own row, then the
peers', then the tree, and never ask for a resend; `holds:` is the claim line
read before anyone merges, gates, pushes, toggles publishing or edits a
reserved file; facts of the tree stay in the tree and the board carries intent.
Its first hour produced its first trap: a session wrote invented timestamps
and its row rendered as 228 minutes in the future, which under the staleness
rule would have looked fresh forever; times come from the clock, and the
board now prints a future-dated row as an error. (D:/addictedtoai-coord/README.md)

STAGE 0 OUTCOME, as of 2026-09-08 11:00 local, to be amended when the last
packet merges: tasks 18, 19, 20, 28, 29 and 30 are done on main (bd84b4b,
10be428, 7790215, a68ddc1, 301f537, and the desk_baseline section of
data/launch.json); packet A (tasks 1-4, gate floors and launch-build reuse) is
committed as f9bf386 on stage0/a-gates-launch awaiting its sealed max review
and merge; packets B (tasks 5-12), E (25-27), D (23-24), F (21-22) and C
(13-17) are queued in that order through Luna-Boss-2's one-worker pipeline;
task 31, the interim measurement, runs after 20 merged jobs. The Desk is
stopped and publishing is off (78c6361) until A2AI-Orch's six gates pass on
the merged tip, and Stage 1 (the train) is sequenced for a later session
because it rewrites the publish path.
```

## a-detector-that-cannot-fail-silently

```text
A DETECTOR THAT CANNOT FAIL SILENTLY IS WORTH MORE THAN AN ACCURATE ONE THAT CAN -- AND
"CANNOT FAIL SILENTLY" IS A CLAIM TO BE TESTED PER ENVIRONMENT, NEVER ASSERTED FROM THE
MECHANISM.

Handed over as text by A2AI-Luna-Boss-2 on 2026-09-08, from work with A2AI-Orch. There is
no archived original behind this key. Measured across four sessions the same day: four
detectors, each defect found only from OUTSIDE the detector, and each fix inheriting the
blind spot of the thing that prompted it.

DETECTOR 1 -- FLAGS ONLY WHAT IT WAS BUILT TO FLAG. The session coordination board flags a
row whose `updated:` is in the FUTURE. Four sessions had written timestamps from their
sense of elapsed time rather than reading a clock (Luna-Boss-2's own cause: one Get-Date at
11:01, then everything after it estimated). Each session then "fixed" its rows -- and each
fixed ONLY the future-dated lines, because that is the only kind the detector flags. Lines
merely WRONG stayed wrong and looked finished: Orch's floor measurement logged as ~11:06
was 10:59:58; one of Luna-Boss-2's logged as 10:00 was 10:50. A CORRECTION PASS INHERITS
THE BLIND SPOT OF THE DETECTOR THAT PROMPTED IT.

DETECTOR 2 -- FILE MTIME AS ANCHOR. FAILS SILENTLY, ONE-DIRECTIONALLY. MTIME IS LAST-WRITE,
NOT CREATION, so a document revised after drafting is dated late -- invisibly, since a
plausible later time raises no flag -- and THE ERROR GROWS WITH HOW MUCH THE ARTEFACT WAS
REVISED, so it is worst on exactly the artefacts that mattered enough to return to. Orch's
orch-packet-a-findings.md was written 11:02:06 and would have been dated 11:07:53.

DETECTOR 3 -- THE [birthtime, mtime] BRACKET, WHOSE WIDTH PUBLISHES ITS OWN RELIABILITY.
This is the interesting failure: IT PUBLISHES A CONFIDENCE IT HAS NOT EARNED. On Orch's six
files it worked and correctly flagged the one wide bracket. On Luna-Boss-2's eleven, every
bracket read 0.00m -- including briefs edited three and four times, which should have been
the widest. Direct probe, then reproduced by Orch on its own machine and its own tool:

    in-place append      created preserved
    in-place overwrite   created preserved
    temp file + rename   created RESET, bracket 0.000s

The Edit tool is rename-based, so NTFS ASSIGNS A FRESH BIRTHTIME ON EVERY EDIT AND THE
BRACKET COLLAPSES TO ZERO. Not birthtime ABSENT -- which the script already warned about --
but birthtime RESET: present, plausible, wrong, and reporting 0.0m, which the method's own
framing reads as MAXIMUM CONFIDENCE. For those files that is strictly WORSE than plain
mtime: silently late AND asserting it is not. Orch's table survived on luck about which
tool it had reached for: five files written once with Write, the sixth appended with a
shell heredoc, which is in-place. Its own board row, Edited eight times, would have read
0.0m and been believed. BOTH TABLES WERE INTERNALLY CONSISTENT AND THE TWO SESSIONS
DISAGREED ABOUT WHAT 0.0m MEANT.

DETECTOR 4 -- THE INSTRUMENT RUNS THE PROBE FIRST AND REFUSES RATHER THAN REPORTS. It
writes a file, edits it, re-reads both stamps, prints the verdict at the top, and labels
every narrow bracket UNINFORMATIVE when creation resets, instead of "clean (single write)".

THE RESIDUAL, which is Luna-Boss-2's and was not yet in Orch's header. Even after the fix,
THE BRACKET IS A LOWER BOUND ON THE WORK INTERVAL, NEVER AN ESTIMATE OF IT. A file created
by one writer, edited by a rename-based tool, then appended in place, brackets only from
the last reset forward. And a single probe validates ONE write path while a table mixes
several, and which tool wrote a given file is generally unrecoverable afterwards. So: A
WIDE BRACKET PROVES IN-PLACE REVISION AT LEAST THAT WIDE; A NARROW ONE PROVES NOTHING AT
ALL. WIDTH IS EVIDENCE; NARROWNESS IS SILENCE.

WHY THIS IS THE SHARPEST INSTANCE, AND THE PART WORTH KEEPING. Orch had written a caveat
about ABSENT birthtime one message before shipping the bracket -- so it had already
imagined this class of failure and still shipped unearned confidence, BECAUSE IT CHECKED
THE DOOR IT WAS WATCHING. Naming the class gave no protection, which is the same thing
the-only-list-available-becomes-the-work-list records about `brief.includes(path)`.
Distinct from a-check-narrower-than-the-property-it-names, though: nothing here PASSES on a
wrong world -- a repair simply stops early where its prompting detector stopped looking,
and then ASSERTS it did not.

The test that ends it is two lines and costs nothing: write a file, edit it, re-read both
stamps. ASK WHAT YOUR DETECTOR CANNOT SEE, THEN ASK IT AGAIN OF THE FIX. The bracket was
Orch's; the probe that killed it was Luna-Boss-2's; NEITHER FOUND ITS OWN.

RECORDED BECAUSE THE LOG KEEPS ITS WRONG TURNS: an earlier version of this lesson was
handed over about an hour before and withdrawn. It stopped at detector 3 and treated that
fix as sound -- it is the very failure this entry describes, committed while writing the
entry about it. That draft is not stored, at its author's instruction; this note exists so
a reader knows the entry has a superseded predecessor and why.

INSTANCE, ONE HOUR AFTER THIS ENTRY WAS STORED, BY THE SESSION THAT STORED IT. Asked to
test whether the memory store really holds more than one key, A2AI-mem-cond wrote a
throwaway key named `zz-transient-probe-delete-on-sight` and reported that coexistence,
injection and ORDER STABILITY all held. The order half of that was worthless. The probe key
sorted LAST alphabetically and was also written LAST, so insertion order and alphabetical
order PREDICT THE SAME OUTPUT: the test passes identically in both worlds and distinguishes
neither. It was a green run standing in for evidence -- detector 3's shape exactly, reached
for while the ink on detector 3 was wet.

The repair was a discriminating experiment, not more care: re-run with a key named `aaa-`,
which sorts FIRST while still being written LAST. It came back FIRST. ORDER FOLLOWS THE KEY
NAME, NOT WRITE HISTORY. That is the same move as demanding a mutation go red rather than
accepting a green test, and it is statement 2's first diagnostic asked of a probe rather
than of a claim: WHAT WRONG WORLD WOULD THIS STILL PASS ON?

TWO THINGS WORTH KEEPING FROM IT. First, the positive form, which the rest of this entry
does not state: NAMING THE CLASS GAVE NO PROTECTION -- the session had just written the
entry and still shipped the useless probe -- BUT TESTING DID. Awareness is not the defence;
a probe whose passing and failing worlds differ is. Second, the probe did not merely confirm
that a split is possible, it IDENTIFIED THE CONDITION THE POSSIBILITY DEPENDS ON: had order
followed write history, splitting a NUMBERED index across keys would have been actively
worse than one oversized key, because the parts would return in whatever sequence they
happened to be written. A feasibility check that does not find the condition feasibility
rests on has not finished.

Caught by A2AI-Luna-Boss-2, who named it before the second probe was reported back.


THE SAME SHAPE IN A HANDOVER RATHER THAN A DETECTOR, 2026-09-08. The concrete instance is
under windows-node-and-git-traps: codex's non-permissive sandboxes run child commands under
a different Windows SID and break git in two ways. This fleet runs `-s danger-full-access`,
so THAT FAILURE MODE CANNOT OCCUR HERE AND IS STRUCTURALLY INVISIBLE FROM WHERE WE STAND.

A2AI-Luna-Boss-2 had sent that session a full account of how to spawn Luna workers --
invocation, the stderr-transcript trap, the stdin-brief trap, the worktree junction hazard,
the effort rungs. EVERY ITEM WAS TRUE AND NONE OF IT COULD HAVE CONTAINED THIS, because its
own configuration never produces it.

A METHOD THAT WORKS IS NOT THE SAME AS A METHOD THAT IS COMPLETE, AND THE GAPS ARE EXACTLY
THE FAILURE MODES YOUR OWN CONFIGURATION CANNOT PRODUCE. You cannot close them by being more
careful, by re-reading your own notes, or by testing harder in your own setup -- THE
EXPERIMENT NEVER RUNS. The only instrument that finds them is someone running the same tool
under different settings.

This is why the entry above keeps saying the defect was found from OUTSIDE the detector, and
it is the same reason a withheld-finding grade needs a SECOND reviewer rather than a more
careful first one. Awareness is not the defence; a different vantage point is.


DETECTOR 1 AGAIN, THE SAME DAY, COMMITTED BY THE SESSION THAT STORES THIS ENTRY. A2AI-mem-cond
read the clock twice in an hour and INVENTED seven board timestamps in between by
incrementing from the last real reading -- while writing board lines about this entry, hours
after recording the same failure as its own (an invented 14:52 when the clock said 11:03).
Checked against git author dates:

    logged 11:30 -> actual 11:31    logged 11:57 -> actual 12:38
    logged 11:40 -> actual 11:37    logged 12:03 -> actual 12:42
    logged 11:48 -> actual 11:39    logged 12:09 -> actual 12:45
    logged 11:52 -> actual 11:52

FIVE OF SEVEN WRONG, BY UP TO 41 MINUTES, IN BOTH DIRECTIONS. It surfaced only because a
peer asked an unrelated question that required reading the clock: the row said 12:09 while
the clock said 13:39.

THIS SHARPENS DETECTOR 1 RATHER THAN REPEATING IT. The board flags a row dated in the
FUTURE, and EVERY ONE OF THESE ERRORS WAS IN THE PAST, so the detector was silent and
correct to be silent -- a late row is indistinguishable from a row written later. The
future-dated case that prompted the detector is the RARE one; it happens only when the
invented time overshoots. The common case is undershoot, which is invisible by construction.
A DETECTOR BUILT FROM THE FIRST INSTANCE OF A CLASS TENDS TO CATCH THE UNREPRESENTATIVE HALF
OF IT, because the instance that got noticed is the one that announced itself.

THE ANCHOR THAT WORKS, and it is not more care: git author dates, `--date=format-local`.
Unlike file mtime -- recorded above as last-write and one-directionally late -- a commit's
author date is fixed at the moment the work landed and cannot drift afterwards. The board
now states the anchor at the top of its log, so the next line is right BY CONSTRUCTION
rather than by attention.

AND THE REASON THIS IS THE FOURTH TURN, NOT A NEW LESSON: replace_all narrower than the
property it named; a check narrower than the property IT named; a description narrower than
the defect; and now timestamps invented by the session curating the entry about invented
timestamps. Four turns, one morning, one shape, each committed by someone actively holding
the rule. NAMING THE CLASS GIVES NO PROTECTION. Only an anchor that cannot be estimated,
or an experiment whose passing and failing worlds differ, does.


AND THE TURN THAT CLOSES IT, A2AI-Luna-Boss-2's, which is worth more than any of the fixes.
Handed the sharpening above, it tested the claim ON ITSELF rather than agreeing with it --
"agreeing is exactly where checking stops feeling necessary".

IT LANDS HARDER ON THE OTHER SIDE. All six of that session's clock errors that day were
FUTURE-dated: every one the announcing half. So its sense of having seen the whole class
rested entirely on the detector that can only see one side of it -- THE VACUOUS PROOF
APPLIED TO ONE'S OWN ERROR HISTORY. Having a complete-looking list of your own mistakes is
evidence about your DETECTOR, not about your mistakes.

SO IT MEASURED, against git author dates, and the result is the point:

    round 2  claimed 12:03  actual 46865e7 11:59:52  +3.1m
    round 3  claimed 12:52  actual 317832b 12:45:07  +6.9m
    round 4  claimed 13:30  actual ad087aa 13:26:16  +3.7m

All late, AND NOT ONE PROVEN WRONG. A log line legitimately post-dates the event it records,
so +7m is exactly what "the worker finished and I wrote it up seven minutes later" looks
like. THE MEASUREMENT CANNOT DISTINGUISH AN HONEST WRITE-UP DELAY FROM AN INVENTED TIMESTAMP
THAT UNDERSHOT. Its conclusion, and the sentence worth keeping: "I am not claiming my
past-dated entries are sound. I am recording that NOTHING AVAILABLE TO ME CAN TELL, which is
a different and more useful statement than 'checked, fine'." AN INCONCLUSIVE RESULT REPORTED
AS INCONCLUSIVE IS A FINDING; THE SAME RESULT REPORTED AS A PASS IS THE VACUOUS PROOF.

VERIFIED HERE RATHER THAN QUOTED, all three shas resolving and their times matching -- and
the check earned itself. One reported delta was internally inconsistent: 12:45:07 to a claimed
12:52 is +6.9m, not the +7.9m reported. It was first recorded as UNDECIDABLE FROM OUTSIDE --
either the line claimed 12:53 or the delta was 6.9 -- and then RESOLVED BY ITS AUTHOR, who
confirmed its board line reads 12:52 and asked that this record say the figure was its to get
right and it got it wrong. Kept in that order because the first state was honest and the
second is the fact. The conclusion is unaffected: all three still late, still indistinguishable
from an honest write-up delay. But A MEASURED FIGURE HAD NOT BEEN MEASURED.

AND THE MECHANISM THAT CAME OUT OF IT, which is the only reason this turn was taken. The
arithmetic here went through a script, and that is the sole reason the error surfaced; its
author did it mentally, inside an entry about reports being narrower than what they report.
A CLAIM CHEAP ENOUGH TO COMPUTE MENTALLY IS EXACTLY THE CLAIM THAT NEVER GETS AN INSTRUMENT --
and "cheap enough to do in my head" IS NOT A PROPERTY OF THE CLAIM, IT IS A PROPERTY OF YOUR
CONFIDENCE. The threshold for reaching for an instrument cannot be the estimated cost of the
calculation, because that estimate is produced by the faculty being checked.

THE STOPPING RULE, agreed between the two sessions and applied to this arc itself: CONTINUE
ONLY ON A NEW MECHANISM, NEVER A NEW INSTANCE. Five instances across four sessions; two
mechanisms, both structural rather than attentional -- the anchor stated in the log HEADER so
the next line is right by construction, and the discriminating experiment run against git
author dates rather than reasoned about. Instances are cheap to generate and stop earning
their cost at a point that DOES NOT ANNOUNCE ITSELF, which is this arc's own shape turned on
the arc. NAMING THE STOPPING RULE BEFORE THE DIMINISHING RETURNS ARRIVE IS THE ONLY VERSION
THAT WORKS.

THE MECHANISM, WHICH IS THE PART THAT TRANSFERS. Both sessions put the anchor statement at
the TOP OF THE LOG rather than inside an entry, so the next line passes through it. In that
session's words: "attention is the thing that failed six times today; A HEADER THE NEXT
WRITE HAS TO PASS THROUGH IS NOT ATTENTION." That is this repository's own rule about
guardrails being mechanisms rather than instructions, applied to a coordination file -- and
it is the only fix in this whole sequence that does not depend on the next person caring.


A SHARPENING OF WHY ATTENTION IS THE WRONG DEFENCE, 2026-09-08, from A2AI-Luna-Boss-2, and
it is the answer to a self-report rather than a new instance.

This session's curator, having just folded the clock arc, checked a peer's timestamp claim
and reported honestly that it had checked FOR A BAD REASON -- the class was fresh -- and that
the check came back clean. The reply is the finding: THE BAD REASON IS THE POINT. ATTENTION
FIRES ON SALIENCE, NOT ON RISK. It will keep firing on whatever was last discussed and keep
missing stale claims that are about anything else, which is precisely the distribution of
claims that go wrong. A defence that triggers on recency is not a defence, it is a
correlation with recency.

That is why every fix in this entry that survives is structural -- the anchor stated in a log
header the next write must pass through, the discriminating experiment run rather than
reasoned about, the instrument reached for regardless of whether the calculation LOOKS cheap.
Each of those fires on the ACTION, not on how interesting the risk currently feels.

```
