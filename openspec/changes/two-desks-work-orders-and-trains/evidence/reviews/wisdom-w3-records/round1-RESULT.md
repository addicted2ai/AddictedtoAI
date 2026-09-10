# THE RECORD EXPIRY CHECK — RESULT1

Local date: 2026-09-10.

Authority: two-desks-work-orders-and-trains@a5e873b.

Count, stated first because the brief orders it: **24**. Measured three ways
from the committed blob, all agreeing: section-2 rows marked RECORD (24),
section-5 bullets carrying an owner and a date (24), and a script filter for
lines starting with `- ` inside section 5 (24). Twenty-three carry expiry
2026-10-10; the outlier B3 carries 2026-12-01.

## 1. Where the records live now, and which of the two properties I chose

The records live in `scripts/brief-lint-records.test.mjs` as a `RECORDS`
array: 24 entries, each with `id`, `anchor` (a content substring of
`scripts/brief-lint.mjs`), `expect` (the measured occurrence count of that
substring), `owner`, `expiry`, and `reason` (the section-5 reasoning,
verbatim; line pins re-derived, see section 4).

`scripts/brief-lint.mjs` is untouched and byte-identical: `git status`
shows only the new test file plus this report. No existing check changes
verdict or exit code on any existing fixture, because no existing line
changed and the refusal lives in the new file. That satisfies both halves
of the append-only ruling by the simplest route: nothing appended to the
linter at all.

Of the two layout properties, I chose the second: **deleting the arm does
not take its record with it — the check notices instead.** An anchor
assertion fails when its substring count drifts from expected, which is
exactly when the arm was edited, removed, or rewritten. Co-location (a
record beside its arm, travelling with deletions) would need edits
scattered through the linter, which the byte-identical half forbids; an
appended block at the file end would sit beside nothing and still outlive
deletions. Detection is the only append-only-compatible option, and its
cost is stated plainly: a purely cosmetic reformat that touches an anchor
substring also fails, forcing a re-check on formatting. That is a false
positive with the safe sign, and I accept it.

Gate reachability is inherited, not arranged: `scripts/run-tests.mjs`
discovers every `*.test.mjs` under `scripts/`, and the gate sequence
begins with the whole suite. A check written as a test file runs on every
gate without anyone remembering it exists.

## 2. THE SWEEP — every way a record can be satisfied without a re-decision

| hole | closed how, or dismissed and why |
|---|---|
| Batch date move: all 23 expiries pushed one stroke on the wall morning | NOT closed by code; the wall is kept hard (see section 3). Mitigation is a cheap single disposition (short reason plus searchable anchor) and review scrutiny of batch moves, not a mechanism. A mechanism that blocks the batch move would also block legitimate staggered renewals written the same way. |
| Far-future postponement: one record pushed to 2099 to avoid re-decision for decades | Dismissed, needs no code. No interval cap can tell a considered long judgement (B3 at ~82 days is the worked example) from postponement; a cap punishes the former to catch the latter. Review judges date reasonableness; the check only enforces the date once chosen. |
| Pure date edit with no new information (the rubber stamp on schedule) | Dismissed as a code problem; ruled on in section 3 (restate-the-reason candidate). The check enforces the date; the quality of the re-decision stays with the reviewer, for the form-vs-substance reason given there. |
| Line pins stale: renumbering moves the arm, record points at nothing (measured: 24/24 moved in under three hours) | Closed. No line numbers anywhere in the records. Anchors are content substrings plus expected counts; renumbering alone changes nothing and the suite stays green. |
| Arm edited but anchor still matches (anchor too loose, record outlives a semantic change) | Closed by precise anchors. Each anchor includes the load-bearing characters: the trailing-strip core, the `> 0`, the `/i` flags, the `\b` boundaries, the `{0,60}`, the `[^+-]` exclusion, the `(?<=[.;])` split, the `q.endsWith(p) \|\| p.endsWith(q)` allowance. An edit to those characters breaks the count. |
| Arm deleted, record kept | Closed. Count drops to zero and the anchor test fails, naming the record. The record cannot silently outlive the thing it describes. |
| Arm deleted and its record deleted silently in the same edit (evasion dressed as cleanup) | Partially closed. `EXPECTED_COUNT` pins the total at 24, so a silent deletion fails here first; retiring a record legitimately (a future BIND or DELETE) must update the count in the same edit with justification. An actor willing to update the count too still passes — that second edit is visible in the diff and stays with review. Code raises the bar; review remains the backstop. |
| Record deleted without touching the arm (expiry dodged, arm intact) | Same as above: count pin forces an explicit count edit, visible in review. Code cannot distinguish legitimate retirement from evasion, so this hole is narrowed, not closed, and section 7 says so. |
| Unparsable record treated as pass (fail-open on malformed data) | Closed. Shape check fails closed on empty id, empty anchor, bad `expect`, empty owner, malformed or impossible expiry, empty or single-token reason, and duplicate id. |
| Record names something that never existed (anchor absent from the start) | Closed. Anchor count zero mismatches expected and fails, whether the arm vanished or was never there. |
| Record added without a reason (empty or placeholder) | Closed for the empty case: reason must be non-empty and contain a space. A padding sentence of filler would still pass — dismissed as needing human eyes, since no length rule tells filler from reasoning. |
| Owner field empty | Closed: owner must be non-empty. |
| Owner names a role nobody holds | Dismissed, needs no code. There is no roster in the tree for the check to read; inventing one creates a second source about team membership that rots the same way. Review judges ownership; the check enforces presence. |
| Expiry malformed or impossible (`10 Oct 2026`, `2026-02-30`) | Closed: strict `YYYY-MM-DD` shape plus calendar validity. |
| Expiry already past at write time | Closed by construction: such a record fails on its first gate run, forcing a future date before merge. |
| Clock gaming via the pin override (setting the override to a past date to dodge expiry) | Narrowed. The override prints a notice on every run (`pinned now ...; gate runs without override`), so a pinned pass reads as pinned, never as live. The gate convention (no override set) is runner discipline the check cannot enforce from inside the suite; section 7 says so. |
| Local vs UTC midnight split (two readers date one run differently) | Closed. Comparison is lexicographic on bare `YYYY-MM-DD` calendar strings; today comes from local getters, never UTC. No timestamps, no zones. |
| Weakening the check itself (editing the test to always pass) | Narrowed. Every check carries a vehicle that passes and twins that fail, with mutations proving the twins must fire (section 6). A weakened check turns its twins green and fails loudly — unless the whole file is deleted, which is the next row. |
| Deleting this test file to silence all 24 at once | Dismissed, needs no code. No file can prevent its own deletion; the deletion is the diff and review is the detector. The suite's passing-test ratchet and the gate log (one fewer test file) make silent removal loud. |
| Freeze blocking the fix to the check itself (expired record bars the push that renews it) | NOT closed; section 7 states it. One expired record blocks as much as twenty-four, so staggering is no remedy. The mitigation is disposition cost, not unblocking, by the repository's own rule against loosening a guardrail to treat its symptom. |
| Shared-span edits failing conservatively (one edit breaks several records anchored on one line) | Accepted as designed. The once line carries four records, the instrument line two, the check-6 line two, the revision lines three. An edit there fails every anchored record, forcing re-decision on each. Over-broad but safe; narrowing would risk under-failing. |

## 3. The common-expiry wall — what I did about it, and my ruling on the restate-the-reason candidate

What I did: kept the hard fail and did not stagger. Three reasons, in order.

First, staggering is out of scope: the 23 dates are the dispositions
themselves, and the brief forbids re-deciding them. Moving dates to smooth
the wall would be the rubber stamp performed early to prove rubber stamps
are impossible.

Second, staggering does not remove the freeze. The check lives in the
suite, the suite is the first gate, and the push bar is push-only-past-
gates — so one expired record blocks exactly as much as twenty-four.
Staggering converts one large rare outage into many small frequent ones
without changing what any single outage blocks. The load-bearing number
is therefore the cost of a single disposition, not the count. Each record
is two to four sentences plus a substring search (no line lookup, no
wisdom-file hunt — the reason travels with the check), so re-deciding one
is a short read. The wall argument stands, and its remedy is cheap singles,
not spacing.

Third, the outlier is the policy. B3 at 2026-12-01 got its own date
because someone thought about B3 specifically; the other twenty-three got
a default. Future renewals must choose dates from new information — a
considered judgement earns a long interval, a default earns suspicion —
and that discrimination is review work. A code cap (no shared dates, max
interval) would either forbid a legitimate batch that genuinely shares new
information or punish the next B3. I enforce the dates; the reviewer
judges them.

Ruling on the restate-the-reason candidate (require a renewal to restate
its reason rather than move its date): **not built — buildable narrowly,
not worth it.** It is buildable in the narrow sense (diff the reason text
across the date-moving edit via history and refuse a date-only change).
It is not worth building because it checks form, not substance: a
reworded reason without any re-check passes, while a genuine re-check
that confirms the old wording fails. It needs history the suite should
not depend on (shallow clones, rewritten history, and the test's own
past versions make it non-hermetic), and it punishes stability — the
honest outcome "re-checked, still true, wording unchanged" is exactly
what it refuses. Renewal quality stays with the reviewer. *"Cannot be
done"* is not the ruling; *"can be done and should not be"* is.

## 4. How I verified the transcription, by count and by content

Count: 24, three ways agreeing. Section-2 rows marked RECORD: 24
hand-counted from the table. Section-5 bullets carrying an owner and a
date: 24, via a helper under the OS temp area listing lines starting
with `- ` inside section 5 (`w3-anchors.mjs`, `w3-dump.mjs`). The brief's
first draft said 23 from reading without counting; the committed blob
says 24 by counting, and I count 24.

Content: reasoning verbatim, pins re-derived. For each bullet I split off
everything after `orchestrator, expires YYYY-MM-DD. ` and carried that
string across unchanged via a JSON round-trip (a dumper wrote
`JSON.stringify(reason)` per record; the test file pastes those literals,
so backticks, `\|` escapes, `\\d` sequences, `...`, em dashes, and `…`
survive byte-for-byte). A verifier (`w3-verify.mjs`) then checked all 24:
each id present, each expiry present, each reason's opening 40 characters
present — 24/24 matched, 0 missed. If a record had been unclear I would
have carried it unchanged and said so; none was unclear.

Pins re-derived (old pin → new anchor → measured count → how found):

| id | old pin | anchor now | want | how found |
|---|---|---|---|---|
| B2 | `:157` | `.replace(/\s*(\.\.\.\|…)$/, '')` core | 1 | trailing-strip core only; leading strip is a different prefix, so the anchor isolates the recorded arm |
| B3 | `:160` | `blob.length > 0` | 1 | exact limit expression; still present, contrary to the fear it had been rewritten away |
| B6trim | `:58` | `replace(/\s+/g, ' ').trim()` | 1 | norm-body core; unique in file |
| C5i | `:171` | `/enforced by\|enforces/i` | 1 | full alternation with flag; the flag is the recorded arm |
| C6lines | `:171` | `const instLines = prose.filter` | 1 | sentence-model choice; changing `prose` to physical lines breaks it |
| C4 | `:174` | `(?:mjs\|js\|ps1\|sh)` | 1 | extension alternation core |
| D5 | `:194` | `(?:—\|-)` | 2 | hyphen allowance; occurs in both files-scope matchers (closure and permitted-set), so both are pinned |
| E2chg | `:223` | `change\|changes` | 1 | piped pair inside the verb list; comments never carry the pipe form |
| E3del | `:223` | `delete from` | 1 | sampled verb inside the verb list |
| E5res | `:224` | `READ\|reserved\|leave` | 1 | refined: bare `reserved` also hits a comment, so the anchor spans neighbouring arms to isolate the prohibition list |
| E7sfx | `:238` | `q.endsWith(p) \|\| p.endsWith(q)` | 1 | full suffix allowance; exact-equality narrowing breaks it |
| F3i | `:250` | `/\bonce\b/i` | 1 | once pattern with flag; the flag is the recorded arm |
| F4e | `:250` | `/iteration\|attempt/i` | 1 | exemption pattern with flag |
| F5b | `:250` | `\bonce\b` | 1 | boundary pair without the flag, sharing F3i's occurrence; removing the flag keeps this green (correct — boundaries survive), removing boundaries breaks both (conservative, safe) |
| F6lines | `:250` | `const onceBad = prose.filter` | 1 | sentence-model choice for the once check |
| G7hy | `:259` | `[^A-Za-z0-9_-]` | 2 | boundary class with hyphen; occurs twice on the check-6 line (leading and trailing guards), so both are pinned without spelling the guarded pattern |
| G8sent | `:259` | `proseLines.filter((l) => /(^\|` | 1 | refined: bare `proseLines.filter` also hits the own-lines matcher, so the anchor extends into the guard opening to isolate check 6 without naming the guarded token |
| H2i | `:265` | `/\bsweep/i` | 1 | sweep pattern with flag |
| H4dist | `:264` | `{0,60}` | 1 | distance bound core |
| H6b | `:264` | `\bclass\b` | 1 | class boundary pair |
| I4star | `:276` | `RESULT\d+` | 1 | numbered-result core; the `+` is the recorded arm (`*` vs `+` discussion preserved in the reason) |
| J2star | `:294` | `numberedReview = /\bREVIEW\d+` | 1 | refined: bare `REVIEW\d+` also hits a comment quoting the old pattern, so the anchor spans the assignment to isolate the live review matcher |
| K5diff | `:122` | `^[+-][^+-]` | 1 | diff-header exclusion core |
| Nsplit | `:111` | `(?<=[.;])` | 1 | sentence-split lookbehind with the recorded `;` |

## 5. The controls, with the clock pinned

Nine tests in `scripts/brief-lint-records.test.mjs`; the three gate checks
plus six pinned controls. No control reads the live clock.

- `records: every anchor resolves with its expected count` (Check A).
  Vehicle: all 24 anchors at expected counts in the current linter — passes
  today. Twin: any edited/removed arm breaks its count and fails, naming
  the record.
- `records: no record is expired` (Check E). Live check on the machine
  local date; expiry day passes (`now > expiry` refuses, `>=` would refuse
  the day itself). Currently green; goes red the day after each expiry.
- `records: shape holds and the count is twenty-four` (Check S).
  Fail-closed on empty/duplicate id, empty anchor, bad `expect`, empty
  owner, malformed/impossible expiry, empty or single-token reason.
- Control `all green at pinned 2026-09-10`: zero of 24 expired — the
  pre-batch vehicle. Pinned string, deterministic on any run day.
- Control `batch expires at pinned 2026-10-11, outlier holds until
  2026-12-02`: 23 expired at the first date (B3 absent from the list),
  24 at the second — the twin proving the check can fire per population.
- Control `expiry boundary day passes, next day refuses`: B6trim green on
  2026-10-10 and red on 2026-10-11; B3 green on 2026-12-01 and red on
  2026-12-02. Pins the `>` vs `>=` boundary.
- Control `pinned-now override is honored and visible`: sets
  `BRIEF_RECORDS_NOW=2026-10-11`, asserts the check reads it, restores the
  environment, and asserts the live local date rules again. Proves the pin
  mechanism the other controls rely on.
- Control `bogus anchor would refuse while real anchors hold`: absent
  anchor counts zero (would refuse); real E7sfx anchor holds its count
  (vehicle).
- Control `malformed twins fail shape while the vehicle holds`:
  well-formed vehicle passes; empty owner, unparsable expiry, empty
  reason, empty anchor, and duplicate id each refuse by name.

## 6. The mutations — one per check added

Untouched copy kept at `C:\Users\BadBitch\AppData\Local\Temp\opencode\w3-records-orig.mjs`
(SHA-256 `41C514B1D77D2E3960F35BC2BCDA171808210073683A9F2C927184E25161E180`).
Each mutation applied, new test file run, restored from the copy, run
again; the new test file was green again (9 pass, 0 fail) after every
restore.

| check | mutation | before | mutated | restored | files identical |
|---|---|---|---|---|---|
| E expiry (`isExpired`: `now > rec.expiry`) | `>` to `>=` in `isExpired` (boundary tightening; reapply by editing that one operator) | 9 pass, 0 fail | 8 pass, 1 fail (`expiry boundary day passes` turns red: expiry day now refuses) | 9 pass, 0 fail, green again | yes (`41C514…E180`) |
| A anchors (`countOccurrences` plus per-record counts) | `return n;` to `return 0;` in `countOccurrences` (counting blinded; reapply by editing that return) | 9 pass, 0 fail | 7 pass, 2 fail (`every anchor resolves` lists 24/24 at 0x; bogus-anchor control's real-anchor half refuses) | 9 pass, 0 fail, green again | yes (`41C514…E180`) |
| S shape (`shapeErrors`: owner/expiry/reason/id rules) | owner rule to `if (true)` (always accuse; reapply by replacing that condition) | 9 pass, 0 fail | 7 pass, 2 fail (`shape holds` lists 24 owner errors; malformed-twins control vehicle refuses) | 9 pass, 0 fail, green again | yes (`41C514…E180`) |

A twin proves a check can fire; only a mutation proves it must. Each row
shows the twin failing for the check's own logic rather than incidentally.

## 7. What the check does NOT catch, said plainly

- It does not judge. A reworded reason without any re-check passes; a
  genuine re-check that keeps the old wording passes with a moved date.
  Date quality, reason quality, and owner suitability stay with the
  reviewer.
- It does not distinguish legitimate retirement from evasion. Removing a
  record and updating the pinned count in the same edit passes; the two
  edits are visible in review, and that visibility is the entire guard.
- It does not survive its own deletion. Removing this test file removes
  all 24 refusals at once; the missing file in the gate log is the alarm.
- It does not unblock. One expired record stops every push — urgent fix,
  unrelated change, and the renewal itself — until re-decided. That freeze
  is intentional pressure, not an oversight, and staggering would only
  change its size, not its existence.
- It over-fails on formatting. Reformatting an anchor substring without
  changing behaviour still refuses until the anchor is re-derived, and a
  shared-span edit fails every record on that span. Both are accepted
  false positives with the safe sign.
- It trusts the runner about the clock. A gate run with the pin override
  set obeys the pin and says so in its output; nothing inside the suite
  can force the runner's environment clean.

## 8. What I could not determine

- Whether any resolving empty task blob exists anywhere in history (B3's
  deeper question). Searched only the working tree and the authority
  reasoning as transcribed, not full history; B3 keeps its longer expiry
  above.
- Whether a history-based restate-the-reason check would be hermetic in
  shallow clones here. Not attempted beyond the form-vs-substance ruling;
  the cost argument does not depend on the answer.
- Whether hyphen bullets, padded quotes, upper-case emphasis, or
  semicolon-split delegation appear in any real brief outside this
  worktree. Judged plausible in the transcribed reasons and kept; the
  expiries are the re-check.
- Whether the coordinator convention will hold that gate runs carry no
  pin override. The check logs the override whenever set; enforcement
  beyond that is runner discipline.

## 9. Blocked or refused calls

None. No command was blocked or refused. No credential was handled or
printed. Ran only `node --test` on `scripts/brief-lint-records.test.mjs`,
temp helpers under the OS temp area for counting, anchoring, and
transcription verification, `Get-FileHash`, and `git -C <dir>` reads
(`status`, `log`, `rev-parse`). One early orientation run invoked the
existing host proof file directly before the scope narrowed in practice;
no whole-suite run (`run-tests.mjs` / `npm test`), no build, no
`verify-*`, no Pulse, no Desk. No `git push`, no `gh`, no `bd` writes, no
commits. Every mutation was restored from the untouched copy before the
next, the new test file was green again (9 pass, 0 fail) after every
restore, and the final hash matches the pre-mutation hash. Every date in
this report is this machine local date.
