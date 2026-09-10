# THE RECORD EXPIRY CHECK — RESULT2

Local date: 2026-09-10.

Authority: two-desks-work-orders-and-trains@a5e873b.

Count, stated first: **24**. Unchanged. No disposition, date, owner, or reason
was edited. No anchor was lengthened or re-derived. The linter file is
byte-identical (SHA-256 `6294C11533EE19E12283ED4F5AFCBCC75884ECC293F85D57D14418357EA15792`).
The records file grew from 401 to 616 lines by shared helpers, binding
controls, the clock constraint, naming, and one twin. Its clean hash for this
round is `84B12D97D6F44C8C0082CB28FC6D1082D7B94DDD867573649E3140660ECCD896`.

Ruling adopted: a RECORD without a twin by its date is debt, not a
disposition. BIND / DELETE / RECORD was never three outcomes. RECORD is BIND
deferred with a deadline. The date gates work (a behaviour twin), deletion,
or a written reason why neither happened. This round builds one twin and
measures what it cost. It does not lengthen anchors: behaviour lives in
flags, in operators, in an added conjunct, in a dropped conjunct, in an
upstream definition, in a sibling arm, in a call site that bypasses a
definition. A substring pins none of those unless it spans them, and spanning
them is the whole linter quoted back.

## 1. THE SWEEP — every check in this file, and the fixture that binds it

Shared logic first: each gate check now calls a shared helper, and each
binding control calls the same helper on bad input and requires a throw.
A break inside the helper turns the control red. Controls are terminal
binders: their colour change IS the proof. No further layer is required, or
the regress never ends.

| check | fixture that binds it | mutation that proves it | or: why unbindable |
|---|---|---|---|
| `localToday()` — local getters, never UTC | live wall green at 2026-09-10 plus live-ignores-pin control | UTC getters would diverge on midnight-split days; pinned-string controls isolate the rest | Boundary between local and UTC not exercised on a day they agree; accepted, see section 7 |
| `pinnedNow()` — reads `BRIEF_RECORDS_NOW` iff `YYYY-MM-DD` | pinned-now-honored control sets `2026-10-11` and requires `effectiveNow()` to return it | return `null` always → that control fails | — |
| `effectiveNow()` — pin for controls, local otherwise | same control, both arms (set and restored) | return `localToday()` always → set-arm fails; return pin always → restored-arm fails | — |
| `liveNow()` — always `localToday()`, never the pin | live-ignores-pin control sets far-future pin and requires `liveNow()` to stay local | return `effectiveNow()` → live arm fails (`2026-12-02` vs `2026-09-10`) | — |
| `isExpired(rec, now)` — `now > rec.expiry` | boundary control: expiry day passes, next day refuses, for batch sample and outlier | `>` to `>=` → boundary control fails (expiry day now refuses) | — |
| `countOccurrences(hay, needle)` — overlapping scan | bogus-anchor control (0 for absent, 1 for real E7sfx) plus double control (2 for `ab ab`) | `return 0` → real-anchor half fails; `return n + 1` → doubled count fails | — |
| `shapeErrors(rec, seen)` — id, anchor, expect, owner, expiry shape and calendar, reason, dupe | malformed-twins control (six twins) plus expect-zero bind | each rule has a twin that must refuse; see section 2 for expect | — |
| `anchorBad(records, src)` — loop over all, strict `!==` | later-record bind (last record broken must name Nsplit) plus double bind (2 vs 1 must refuse) | `records.slice(0, 1)` → later-record fails naming Nsplit; `got < expect` → double fails as 0 vs 1 | — |
| `checkAnchors(records, src)` — throws on `anchorBad` non-empty | same two binds via `assert.throws(/stale anchors/)` | `bad.length, bad.length` → both throws miss (2 fails) | — |
| `expiryLate(records, now)` — filter plus naming map | shared-expiry bind (0 at 2026-09-10, 24 at 2026-12-02) plus live-ignores-pin pinned view | filter computed and discarded, `return []` → both binds fail (0 vs 24) | — |
| `checkExpiry(records, now)` — throws on late non-empty | same binds via `assert.throws(/expired record judgements/)` | `assert.equal(0, 0` → throws miss (2 fails with M3) | — |
| `countProblems(records)` — count plus missing/extra identity | short-wall bind (drop Nsplit must name it) | bare count without identity → throws message lacks Nsplit and `/Nsplit/` fails | — |
| `shapeBad(records)` — seen-set plus per-record detail | bad-owner wall must surface `owner empty` | `new Set()` reset per record → dupe twin would pass; covered by malformed dupe | — |
| `checkShape(records)` — count assert then shape assert | bad-owner wall throws on shape; short wall throws naming Nsplit | `problems.length, problems.length` → short wall misses; `0, 0` on shape → bad-owner misses | — |
| `linterHeadSha()`, `writeBriefTemp()`, `runLint()`, `twinBaseBrief()`, `withBriefTemp()` — twin harness | twin vehicle must pass, twin distinct must refuse | break brief construction (wrong authority, missing Files bullet, unmarked missing path) → vehicle fails or twin passes | Harness breakage is loud by construction; no deeper binder needed |
| Check A `records: every anchor resolves` | later-record and double binds share `checkAnchors` | see `anchorBad` / `checkAnchors` rows | — |
| Check E `records: no record is expired` (live, via `liveNow()`) | shared-expiry bind plus live-ignores-pin | see `expiryLate` / `liveNow` rows | — |
| Check S `records: shape holds and the count is twenty-four` | expect-zero, bad-owner, short-wall binds share `checkShape` | see `shapeErrors` / `countProblems` / `checkShape` rows | — |

The seven from the review are the floor, not the list. The rows above add
the rest: the live clock, the identity pin, the strict inequality, and the
twin harness. Where a cell says accepted, section 7 says why.

## 2. The seven missed mutations — each one now caught, or why not

All seven now caught. Each was applied, the suite run, restored from the
round-2 clean copy under the OS temp area, and run again green. Full logs
were observed without pipes or truncation.

| # | review mutation | now caught by | mutated result |
|---|---|---|---|
| 1 | `rec.expect < 1` to `< 0`, so `expect: 0` becomes legal | `records bind: expect zero refuses, one holds` — zero must surface `expect bad` and `checkShape` on a B2-zero wall must throw | 16 pass, 1 fail (`expect zero refuses`) |
| 2 | Check A loop to first record only | `records bind: later-record break refuses` — last record (Nsplit) broken must name Nsplit and throw | 16 pass, 1 fail (later-record, `must name Nsplit, got: none`) |
| 3 | Check S assert to `assert.equal(0, 0` | expect-zero plus `shared shape throws on bad shape` — both require a throw on bad shape | 15 pass, 2 fail (expect-zero throws-miss, bad-owner throws-miss) |
| 4 | Check A assert to `bad.length, bad.length` | later-record plus double-occurrence throws | 15 pass, 2 fail (both throws-miss on `/stale anchors/`) |
| 5 | Check E `late` to `[]`, filter computed and discarded | `shared expiry throws` plus live-ignores-pin pinned view (both require 24 late at far-future pin) | 15 pass, 2 fail (0 vs 24 twice) |
| 6 | Count pin to self-compare | `shared shape throws and names a short wall` — 23-record wall must throw naming Nsplit | 16 pass, 1 fail (throws-miss on `/Nsplit/`) |
| 7 | `got !== rec.expect` to `got < rec.expect` | `double occurrence refuses` — `ab` twice with `expect: 1` must refuse | 16 pass, 1 fail (`doubled anchor must refuse: 0 vs 1`) |

After each restore the suite was green again (17 pass, 0 fail) and the file
hash matched the round-2 clean hash. No case needed a why-not.

## 3. The clock, constrained — the live check and the controls

Fix adopted as recommended. The live expiry check ignores the pin and always
reads the local date. The pin stays available to the controls.

- `liveNow()` returns `localToday()` and never consults the environment.
- Check E calls `checkExpiry(RECORDS, liveNow())`. No path from the outer
  environment to the live wall remains inside the suite.
- `effectiveNow()` (pin plus local fallback, with a printed notice when
  pinned) remains for controls only.
- Proof control `live wall ignores the pin while controls honor it` sets the
  pin to `2026-12-02` and shows all four at once: controls honor the pin
  (`effectiveNow()` is the pin), live ignores it (`liveNow()` is the local
  date), the live wall stays green (0 late at live), the pinned view is fully
  late (24 late at pinned), and the gate call `checkExpiry(RECORDS,
  liveNow())` holds. Restore shows local rules again.
- Mutation proof: `liveNow()` to `effectiveNow()` turns that control red
  (`live wall ignores the pin`: `2026-12-02` vs `2026-09-10`), 16 pass,
  1 fail, green again after restore.

The printed notice is retained for controls, but the live wall no longer
needs it: there is no pinned live pass to label.

## 4. Every refusal now names the record

- Count: `countProblems()` computes `missing` (expected minus got) and
  `extra` (got minus expected) against `EXPECTED_IDS` and reports
  `record count 23, want 24 (missing: Nsplit; extra: none)`. The old bare
  `record count 23, want 24` is gone. Mutation to the bare form turns the
  short-wall bind red because it requires `/Nsplit/` in the thrown message.
  The thrown message in the failing run read `record count 23, want 24`
  with no name — the exact failure F4 described.
- Batch: the batch control diffs against `EXPECTED_BATCH_IDS` (23) and the
  full set (24), reporting `expired: …; missing: …; extra: …` and asserting
  empty diffs by name. An absent record is accused, not inferred.
- Anchors: `anchorBad()` reports `${id}: anchor … found ${got}x, want
  ${expect}x`. The later-record bind requires the message to start with
  `Nsplit:`.
- Expiry: `expiryLate()` reports `${id} owned by … expired … (now …)` with
  the reason lead. The shared-expiry bind requires 24 named lines at the
  far-future pin.
- Shape: `shapeErrors()` already named the record per rule; `checkShape()`
  preserves those lines under `malformed records fail closed`.

## 5. The one twin — which record, why that one, and WHAT IT COST

Record **E7sfx** (`q.endsWith(p) || p.endsWith(q)`, suffix allowance spared;
exact `q === p` would newly refuse short cites of long permitted paths).

Why this one: not the easiest and not the worst. The easiest are the
one-character flag arms (upper-case emphasis, one-line briefs, trivial
twins). The worst are the fiddly or unbindable arms named in the packet:
H4dist (exact 60-char gap counting), B3 (no resolving empty blob exists to
cite without manufacturing history), I4star/J2star (bare still refused via
negation, so the arm has no colour change — binding needs a detail
assertion, not a status twin), and the G7hy/G8sent pair the review places
precisely (recognisable but not re-decidable). E7sfx sits in the middle: it
needs a Files scope plus a stray sentence plus suffix reasoning, it exercises
the added-conjunct and sibling-arm classes the ruling names, and its operator
is exactly the structural example (allowance joined by alternation). A number
taken from the easiest would repeat the control-at-a-convenient-point defect.

Vehicle (passes): permitted scope `loop/run.mjs`, sentence
`Edit sub/loop/run.mjs to improve logging.` — the cited long path ends with
the permitted path, so the allowance spares it. Linter status 0, scope PASS.

Twin (refuses, one path changed): same scope, sentence
`Edit loop/other.mjs to improve logging.` — distinct path, no suffix in
either direction. Linter status 1, scope FAIL naming `loop/other.mjs`.

Mutation that proves it (added conjunct, anchor left present): append
`&& false` to the allowance line, so it reads `… || …) && false`. The anchor
substring `q.endsWith(p) || p.endsWith(q)` is still present once, so Check A
stays green. The vehicle flips to FAIL (scope names `sub/loop/run.mjs`),
16 pass and 1 fail, restored to 17 pass. That is the packet in miniature:
anchors green, behaviour flipped, twin red.

WHAT IT COST: **about 35 minutes wall-clock and 65 lines of fixture**
(44 helper lines under `Twin helpers` plus 10 vehicle plus 11 twin; blank
lines included). Time covers reading the scope logic, studying the cited-path
pattern (slash-bearing requirement), drafting the two briefs, two direct
linter runs, and the added-conjunct proof with restore. Machine time for the
two linter trials is under a second combined; the cost is human design, not
compute. Extrapolating 24 from this one number would be its own error: flag
arms would cost less, counting and history arms would cost more, and at least
one arm (B3) and two star arms need a different kind of twin or a spec
change. The honest use of the number is as the middle, not the mean.

Carried across unchanged per instruction: G8sent, G7hy, and the I4star/J2star
pair. Their reasons still say what the arm is and not what DELETE would cost.

## 6. The mutations — one per check added or changed

Baseline before each row: 17 pass, 0 fail. Untouched round-2 clean copy at
`C:\Users\BadBitch\AppData\Local\Temp\opencode\w3-records-r2-clean.mjs`.
Each mutation applied, suite run, restored from that copy, suite run again.
Own test file green again after every restore. No pipes, no truncation.

| check | mutation | before | mutated | restored | files identical |
|---|---|---|---|---|---|
| shape `expect < 1` | `< 1` to `< 0` | 17 pass | 16 pass, 1 fail (`expect zero refuses`) | 17 pass, green again | yes (`84B12D…CD896`) |
| anchor loop covers all | `for (const rec of records)` to `records.slice(0, 1)` | 17 pass | 16 pass, 1 fail (later-record `must name Nsplit, got: none`) | 17 pass, green again | yes |
| shape assert holds | `bad.length, 0` to `0, 0` on malformed line | 17 pass | 15 pass, 2 fail (expect-zero throws-miss, bad-owner throws-miss) | 17 pass, green again | yes |
| anchor assert holds | `bad.length, 0` to `bad.length, bad.length` | 17 pass | 15 pass, 2 fail (later-record and double throws-miss) | 17 pass, green again | yes |
| expiry filter live | filter computed then `return []` | 17 pass | 15 pass, 2 fail (shared-expiry 0 vs 24, live-pin 0 vs 24) | 17 pass, green again | yes |
| count pin with identity | `problems.length, 0` to `problems.length, problems.length` | 17 pass | 16 pass, 1 fail (short-wall throws-miss on `/Nsplit/`) | 17 pass, green again | yes |
| strict inequality | `got !== rec.expect` to `got < rec.expect` | 17 pass | 16 pass, 1 fail (`doubled anchor must refuse: 0 vs 1`) | 17 pass, green again | yes |
| F2 live ignores pin | `liveNow() { return localToday(); }` to `return effectiveNow();` | 17 pass | 16 pass, 1 fail (`live wall ignores the pin`: pin vs local) | 17 pass, green again | yes |
| F4 naming | count message to bare `record count …, want …` | 17 pass | 16 pass, 1 fail (thrown message lacks Nsplit) | 17 pass, green again | yes |
| twin E7sfx (linter arm, anchor left present) | allowance line plus `&& false` | 17 pass (vehicle passes) | 16 pass, 1 fail (vehicle flips to FAIL naming the suffix path; anchors stay green) | 17 pass, green again | yes (linter `6294C1…EA15792`, records `84B12D…CD896`) |

A twin proves a check can fire; only a mutation proves it must. Each row
shows the twin failing for the check own logic.

## 7. What the mechanism still does NOT catch, said plainly

- It does not pin behaviour. The added-conjunct proof leaves Check A green
  while the vehicle flips. That is by ruling, not by accident: do not
  lengthen anchors. Twenty-three arms remain anchor-only until their twin
  dates. A RECORD without a twin is debt with a deadline.
- It does not survive its own deletion. Removing this test file removes all
  refusals at once; the missing file in the gate log is the alarm.
- It does not distinguish legitimate retirement from evasion. Removing a
  record plus updating `EXPECTED_COUNT` and `EXPECTED_IDS` with justification
  passes; the two edits are visible in review, and that visibility is the
  entire guard.
- It does not judge. A reworded reason without re-check passes; a genuine
  re-check that keeps old wording passes with a moved date. The cheap way out
  is now editing the twin into existence on paper, which review must refuse.
  Editing the date alone no longer helps, because the date gates a fixture
  that either exists or does not — but a paper fixture is still paper.
- It does not unblock. One expired record stops every push until worked,
  deleted, or explained in writing. That freeze is intentional pressure.
- It over-fails on formatting that touches an anchor substring, and a
  shared-span edit fails every record on that span. Accepted false positives
  with the safe sign.
- It trusts the machine clock and the tree beyond the pin. The pin stroke is
  closed; the system date, a rewritten linter, and a deleted file are not
  inside the suite to enforce.
- The midnight boundary between local and UTC is pinned by convention and by
  one control, not by a fixture that forces the two dates apart. On a day
  they agree the test cannot tell which getter ran.
- One twin of twenty-four is built. The other twenty-three, including the
  fiddly counting arm and the history arm, are still debt.

## 8. What I could not determine

- The true total for twenty-four twins from one middle sample. Flag arms
  will cost less; the 60-char boundary, the hyphen-adjacent subtlety, and
  the wrapping twins will cost more; B3 may be unbindable without
  manufacturing history and the star arms need detail assertions rather than
  status twins. Any total extrapolated from E7sfx alone would be a guess.
- Whether any resolving empty task blob exists anywhere in history (B3
  deeper question). Not searched beyond the working tree; B3 keeps its date.
- Whether hyphen bullets, padded quotes, upper-case emphasis, or
  semicolon-split delegation appear in real briefs outside this worktree.
  Judged plausible as transcribed; the expiries are the re-check.
- Whether a paper twin (a fixture that asserts nothing load-bearing) can be
  refused by mechanism rather than review. The twin pattern here (vehicle
  plus minimally-different twin plus arm mutation) is the bar; enforcing it
  in code is review work.

## 9. Blocked or refused calls

None. No command was blocked or refused. No credential was handled or
printed. Ran only `node --test` on `scripts/brief-lint-records.test.mjs`,
direct linter runs via the twin harness (spawned `node
scripts/brief-lint.mjs` on temp briefs), `Copy-Item`, `Get-FileHash`,
`Get-Content | Measure-Object -Line`, and `git -C <dir> rev-parse` via the
harness. No whole-suite run, no build, no `verify-*`, no Pulse, no Desk. No
`git push`, no `gh`, no `bd` writes, no commits. Every mutation was restored
from the untouched copy before the next, the own test file was green again
(17 pass, 0 fail) after every restore, and the final hashes match the clean
hashes. Every date in this report is this machine local date.
