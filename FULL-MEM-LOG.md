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

Entries: 58. Characters of memory text: 109706.

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
