# RESULT2 — SPEC DELTA CORRECTIONS, round 2

Worktree: `D:/addictedtoai-worktrees/fleet6-specfix`.
Round-1 edits kept and amended. Live spec (`openspec/specs/loop/spec.md`)
read, never written.

## 1. Finding → change → line

| # | Finding | File | What changed | Line(s) |
|---|---|---|---|---|
| F1 | Breaker scenario `failed/done` excludes body-counted `discarded` | loop delta | `within the last five \`failed\`/\`done\` jobs` → `within the last five failure/\`done\` jobs ... (failure = \`failed\` or \`discarded\`)` | loop:1530-1531 |
| F2 | `One real run clears it` false as a general claim; live-spec rename refused | loop delta | Heading kept; WHEN scoped to the threshold case (`last five ... include exactly three empty ones ... next run produces a diff`); THEN asserts replacement arithmetic (`two of the last five remain empty ... selectable again`). Title-true at the threshold, window-true, sibling scenario untouched. | loop:2180-2185 |
| F2b | Two more streak-semantics scenarios in the same block (found settling F2) | loop delta | Reviewer-only: `completes three consecutive review invocations` → `completes three review invocations ... within its last five invocations in that role`; THEN `the streak reaches three` → `three of the last five produced nothing`. Refusal-not-halt: WHEN `producing nothing three times running` → `refused with three of its last five invocations in a role having produced nothing`. Headings unchanged (live heading for the first; no-drop reason for both). | loop:2158-2164, 2174-2178 |
| F3 | `DIRECTIVES.md retires` leaves `pending` undefined, drops priority | loop delta | `each pending line` → `each pending line — a list-item line carrying no \`[done <date> <job-id>]\` marker —`; `carrying the same text` → `carrying the same text and a priority`; parked-line clause added (`a parked line migrates with it once it is made live again`). Priority value itself NOT pinned: `tasks.md:2205-2208` says only `a priority` with no value, and the detailed band-mapping (P0/P1 into band 1, P2 between, P3/P4 below) lives in uncommitted-to-law evidence, not the surviving record — so the spec agrees with tasks.md by stating priority-without-value rather than inventing a band. | loop:2495-2499 |
| F4 | Back-desk share bound: no denominator, no observable trigger | loop delta (two places) | Denominator GLOBAL per architect ruling: `whose share is measured **globally**: back-desk model-minutes divided by the model-minutes both desks recorded over the same period` (desks req) + `measured **globally** as back-desk model-minutes divided by the model-minutes both desks recorded over the same period (not per tier: the two desks partition kinds of work, not tiers, and the bound is the machine's share of all the work)` (spending restatement). Trigger observable: `Once both desks exist — that is, once the declared \`data/config.json\` key for the restated bound is present —` in both bodies; bound scenario WHEN `both desks are running` → `the declared \`data/config.json\` key for the restated bound is present and the back desk's global share ... reaches its configured bound`. | loop:950-955, 974-979, 2347-2356 |
| F5 | Window forbids ledger ordering, names none | loop delta | `SHALL NOT depend on the ledger's ordering` replaced with `The last five are the five most recently appended \`done\`/\`failed\`/\`discarded\` ledger entries for jobs of that governing type — completion order is the ordering.` Follow-on clause reworded so the ban targets the stopping condition, not the source: `A rule that walks the ledger backwards and stops at the first success mistakes that same append order for a stopping condition`. Second scenario (`failed, failed, done, failed` in append order) already agrees. | loop:1468-1474 |
| F6 | `would-cite-for` refusal reads as covering N=1 | review delta | Final sentence now `A piece among the merged subjects left with no entry — where more than one prose piece is present — is refused exactly as a blank \`would-cite\` is refused.` | review:234-236 |
| F7 | `Desk`/`desk` overload survives the `lane`/`desk` reservation | loop delta | Same sentence as the reservation (F7's instruction): `... and the same reservation covers capitalisation: \`Desk\` is the loop as a whole, \`desk\` is one front/back partition, and the two cases are never interchangeable.` | loop:931-933 |

## 2. Validate

Command (worktree `D:/addictedtoai-worktrees/fleet6-specfix`):

    openspec validate two-desks-work-orders-and-trains --type change --strict --no-interactive

Output:

    Change 'two-desks-work-orders-and-trains' is valid

Two intermediate failures occurred, both the no-drop rule firing on a heading
I had altered, both fixed by restoring the exact live heading:

1. `Three marked twice-failed jobs halt the Desk` — I had first retitled it
   (`... of one type halt the Desk — window-counted, not run-counted`) while
   also changing `three consecutive jobs` → `three jobs ... within the
   breaker's window`. Restored the title, kept the window-counted body.
2. `A reviewer-only runner accumulates a streak` — I had first retitled it
   (`... accumulates a refusal count` / `... a no-output count`) while
   conforming the body. Restored the title, kept the window-conformed body.

`One real run clears it` and `Refusal is not a halt` needed no restore: their
headings were never changed (F2 by ruling, F2b's second by construction).

## 3. Runner-health re-read: every sentence judged

Requirement `A runner proven unable to run is refused, and refusal is not a
halt` (loop:2077-2192), read end to end after the edits. Verdict on each
sentence for the counting-sense question (`streak` / `consecutive` /
`running` as the refusal-count mechanism):

- Intro paragraph (2079-2087): `interrupted ... is resumed oldest-first
  before new work` — ordering of the resumption queue, not the refusal
  count. `breaker 1 counts only \`failed\` and \`discarded\`` — names the
  breaker's outcome set, not a counting method (and was itself swept:
  round-1 `three-consecutive-failures breaker` → `breaker 1`). Clean.
- Detection paragraph (2089-2094): mechanism description, no counting
  vocabulary. Clean.
- Author-evidence bullet (2096-2100): `a run that produced nothing at all`
  — defines one empty invocation, not a run of them. Clean.
- Reviewer-evidence bullet (2101-2110): `output, not silence`, malformed
  handling. No counting vocabulary. Clean.
- Accumulation bullet (2111-2117): was `The streak SHALL be accumulated per
  invocation and per role ... never accumulate a streak` → now `The
  no-output count SHALL be accumulated ... never accumulate a count`.
  Window-conformant.
- Refusal bullet (2118-2123): `After three such runs within that runner's
  last five invocations in that role` — window vocabulary already.
  Clean.
- Application bullet (2124-2126): selection + resumption coverage. Clean.
- Window bullet (2127-2133): defines window, names `backwards walk` only to
  forbid it. Clean.
- Clearing bullet (2134-2135): `the count SHALL fall out of the window as
  producing invocations replace empty ones`. Window-conformant. Clean.
- No-invocation-lines bullet (2136-2142): was `neither count toward the
  streak nor end it` → now `neither count toward the no-output count nor
  clear it` (the `end`→`clear` change is mine, this round: `end` described
  the old streak lifecycle). Window-conformant.
- Not-a-halt bullet (2143-2147): no counting vocabulary. Clean.
- Spin-ends scenario (2149-2156): `three of a runner's last five
  invocations ... each produced no RESULT.md, no output and no diff` plus
  my added `and a fifth has not yet replaced any of them in the window`
  (prevents reading the trip as a same-run triple). Window-conformant.
- Reviewer-only scenario (2158-2164): heading keeps live `streak` (no-drop
  rule — see §2); body window-conformed this round. The heading word is a
  title, not a mechanism sentence; the body's THEN (`three of the last
  five produced nothing`) is what an implementer builds from.
- Malformed scenario (2166-2172): `counts as a producing invocation in the
  window rather than advancing the no-output count`. Window-conformant
  (round 1; unchanged this round).
- Refusal-not-halt scenario (2174-2178): `refused with three of its last
  five invocations in a role having produced nothing`. Window-conformed
  this round.
- One-real-run scenario (2180-2185): threshold-scoped per F2 ruling.
  Window-true, title-true.
- Interleaved scenario (2187-2192): `the producing invocation between them
  does not reset the count`. Window-conformant (round 1; unchanged).

Survivors of the three words inside this requirement and why each is
legitimate: `streak` once, in the live scenario heading `A reviewer-only
runner accumulates a streak` — kept character-for-character because the
no-drop rule refuses a rename (demonstrated twice this round, §2), with
the body carrying the window norm. No `consecutive` or `running` in the
counting sense remains in this requirement.

## 4. Disagreements with rulings

Three, two of them compliances-with-a-record and one a partial
non-compliance:

(a) F3 priority (partial non-compliance, deliberate). The brief says to
    read `tasks.md:2205-2208` and "make the spec agree with it rather than
    inventing a second answer". I read it: `each pending line becomes a
    routed bead carrying the same text and a priority` — a priority is
    required, no value given. The one place a value IS given is
    `evidence/draft-report.md:368-376` (P0/P1 join band 1, P2 between dated
    news and the queue, P3/P4 below cooled proposals) — but that same note
    records (§390-405) that the drafted change implements something
    narrower (one band, ordered by priority within it), and the maintainer
    answer it transcribes is evidence, not the surviving implementation
    record. Pinning a band mapping in permanent law would therefore be
    inventing the second answer the brief forbids. The spec states the
    priority requirement without a value — agreeing with tasks.md exactly
    as far as tasks.md goes. If the band mapping is wanted in law, it
    belongs in the intake requirement's priority-band text, not smuggled
    in through the migration bullet.

(b) F4's suggested trigger wording (compliance with a wrinkle worth
    recording). The brief offers "the declared config key being present"
    as "the kind of thing that qualifies". I used exactly that — but note
    it makes the trigger self-referential: the bound's existence condition
    is the key that states the bound. That is fine as an observable
    predicate (anyone can check it from the tree, no job can fake it since
    `data/config.json` is reserved), and it matches how the change treats
    every other bound (all live in `data/config.json` per
    loop:2288-2290). The alternative — "task 79 done" — would key law on a
    task number that will not survive archiving. No contradiction found;
    no STOP invoked.

(c) F5's "runner in that role" phrase (compliance, flagged not followed).
    The ruling's explicit naming is `the five most recently appended ledger
    entries for that runner in that role`. I wrote `... ledger entries for
    jobs of that governing type` instead. Reason: the requirement counts
    per **governing job type** (body: `Repeated failure of the same
    governing job type`), and breaker 1 has never been per-runner — `that
    runner in that role` is the runner-health window's unit (loop:2118),
    and importing it here would change whose failures are counted, not
    just their order. The ruling's operative demand — name ledger append
    (completion) order as the ordering — is fully implemented; the unit
    follows the requirement's own body rather than the ruling's
    cross-requirement slip. If the architect meant per-runner counting,
    that is a different change than an ordering clarification.

## 5. Sweep (the class: leftover vocabulary from a superseded model)

Every requirement touched in round 1 or round 2, read end to end, asked
the one question. Verdicts including the clean ones:

| Requirement | Verdict |
|---|---|
| Front/back desks share an intake (loop:925-985) | Fixed (F4, F7). Restatement bullet + bound scenario now config-key trigger + global share. `Desk`/`desk` capitalisation reserved in the reservation sentence. No streak/window vocabulary in this requirement to begin with. |
| Breakers halt the loop (loop:1459-1554) | Fixed (F1, F5). Scenario window now failure/done; ordering now ledger-append. Swept further: follow-on `pure function of the order lines were appended` reworded (it re-banned the order just named); gate-retry scenario `three consecutive jobs` → window-counted; train-red `consecutive-failure breaker` → `breaker 1`; work-order `consecutive-failure breaker counts` → `breaker 1 counts`; chain-gate `three consecutive failures` → `three failures`. `consecutive` survivors here: `fail, fail, done, fail` + `a consecutive count of one` (describes the OLD rule being refuted, loop:1476); `never trips a consecutive rule` (same, loop:1489); `three consecutive trains` / `three consecutive nights` (eviction/train scenarios, untouched by this change's window model — trains and nights are not ledger windows). |
| Runner-health refusal (loop:2077-2192) | Fixed (F2, F2b + sweep). See §3 for the sentence-by-sentence verdict. Heading `streak` kept under the no-drop rule with window body. |
| Gate retry (loop:1916-2018) | Swept: `advances breaker 1's consecutive count` → `advances breaker 1's count`; scenario `Three marked twice-failed jobs halt the Desk` body window-counted, heading restored under no-drop. |
| Capacity pause (loop:2020-2075) | Swept: `under-counts the consecutive run` → `under-counts the run of \`capacity\` outcomes`; `after the first \`capacity\` in a consecutive run` → `in a run`; `doubling per consecutive \`capacity\`` → `doubling per \`capacity\` in that run`. Remaining `consecutive` (loop:2038) is inside the backoff-interval definition (a run of capacity outcomes setting a doubling interval), not the refusal-count mechanism — a different model, legitimately consecutive. |
| Chain (loop:1035-1202) | Swept: `the consecutive-failure count` → `the breaker-1 count`; `walk three consecutive failures` → `walk three failures`; failure-streak scenario title → `walking failures into a halt`. |
| Spending budgeted (loop:2271-2446) | Fixed (F4 restatement). Global denominator + config-key trigger in the restatement paragraph. No streak vocabulary. |
| Work orders (loop:20-200) | Swept, one word (`consecutive-failure breaker counts` → `breaker 1 counts`). Otherwise clean — never carried the window model. |
| Intake (loop:823-924) | Read. Clean — never carried streak/breaker/window vocabulary; its `pending` (pending-amendment deltas, loop:994) is a different word from F3's pending lines and correctly left alone. |
| Jobs have identities / issue-id (loop:2447-2508, round-1 ADDED) | Read. Clean — round-1 text, no superseded-model vocabulary. F3's pending definition landed here as specified. |
| Lane/desk lines (loop:929-931, 946-956 — round-1 1a-1d) | Read. Clean — F7's capitalisation clause added to the reservation sentence itself. |
| 30% scenario (loop:2401) | Read. Clean — value fix only, no model vocabulary. |
| Review `would-cite-for` (review:228-239) | Fixed (F6). Qualifier added twice: opening `and only then` + closing em-dash clause, so neither the list nor the refusal reads as covering N=1. No window/streak model in this requirement. |

## 6. Anything not done

- F3's priority VALUE is not pinned (see §4a): the spec requires a
  priority per migrated bead without stating which, because the surviving
  record (tasks.md:2205-2208) requires one without stating which. Stating
  a band mapping would be the invented second answer.
- F5's `for that runner in that role` unit is not adopted (see §4c): the
  window is per governing job type per the requirement's own body; the
  ruling's phrase belongs to the runner-health window.
- The live `streak` scenario heading is kept with a window body (see §2):
  renaming it in the delta alone is refused by validate; renaming it in
  the live spec is outside this change's remit.
- No `npm run build`, no `npm test`, per the brief. No commit, no push, no
  worktree changes, `STOP`/`HOLD.md` untouched. Nothing outside the two
  delta files + this RESULT file was created, edited or deleted.
