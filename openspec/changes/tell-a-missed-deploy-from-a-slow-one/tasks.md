# Tasks

Six of the seven bullets in `specs/pulse`, "The Pulse publishes what it builds",
are added or changed (16 SHALL/MUST clauses when counted clause by clause, since
several bullets state a rule and its fail-closed case together). Each has an
implementing task and a testing task below, and every testing task names the
mutation that proves it measures something.

All work is in `pulse/lib/publish.mjs` and `pulse/tests/`. Nothing under
`loop/`, `lib/`, `content/` or `data/` is touched by this change.

## The check: containment, not equality

- [x] 1. `pulse/lib/publish.mjs`: replace `stampMatchesCommit(id, sha)` with a
      containment test. Keep the existing hex-abbreviation guard
      (`/^[0-9a-f]{7,40}$/`, seven being git's own floor) and the
      `stampId`-reads-`commit` behaviour verbatim; add resolution of the stamp
      through the local repository to one commit object and an ancestry test
      answered by git (`merge-base --is-ancestor <pushed> <live>`), with one
      read-only `git fetch origin main` before resolving so a stamp naming a
      commit another actor pushed can be resolved at all. Implements: *the
      stamp identifies the commit this run pushed, or a commit that contains
      it*.
- [x] 2. `pulse/lib/publish.mjs`: fail closed on everything the test cannot
      answer — a stamp that is not a hex abbreviation, one that resolves to no
      commit object after the fetch, one that resolves ambiguously, and a git
      invocation that errors. Each is "not landed", never "landed". Implements:
      *neither SHALL one that resolves to no commit the local repository can
      name … the check SHALL fail closed on it*.
- [x] 3. `pulse/tests/publish-verify.test.mjs`: a fixture repository where the
      live stamp names a descendant of the pushed commit — the check passes and
      no hold is written; and the control without which that proves nothing, a
      stamp naming a **sibling** commit on a fork of the same parent, which does
      not pass. Mutation: replace the ancestry test with string equality and
      confirm the descendant case fails while the sibling case still passes;
      restore and verify the file byte-identical by hash. Tests task 1.
- [x] 4. `pulse/tests/publish-verify.test.mjs`: four fail-closed cases, each
      asserting "not landed" — `unknown`, a bare timestamp, a well-formed
      abbreviation of a commit not in the repository, and a git failure injected
      at the ancestry call. Mutation: make the unresolvable case return `true`
      and confirm exactly these tests fail and none of task 3's. Tests task 2.

## The confirmation window

- [x] 5. `pulse/lib/publish.mjs`: after the first budget elapses with no match,
      poll a second window of at least `3 × POLL_BUDGET_MS` before concluding
      failure. Both durations are parameters of the verify function (it already
      takes `pollBudgetMs`), so the tests can run them in milliseconds. The
      result SHALL record which window the match landed in. Implements: *the
      Pulse SHALL poll a second, confirmation window of at least three times the
      first … the two SHALL NOT be recorded as the same fact*.
- [x] 6. `pulse/tests/publish-verify.test.mjs`: a stamp that starts carrying the
      pushed commit only after the first budget elapses — the deploy is landed,
      no `HOLD.md` exists afterwards, and the result names the confirmation
      window; plus the control, a stamp that never carries it, which still
      writes the hold. Mutation: delete the second window and confirm the first
      test fails while the control passes. Tests task 5.

## The hold says which failure it is

- [x] 7. `pulse/lib/publish.mjs`: compute a classification from the readings the
      loop already holds, as a frozen closed set in one place, decided in this
      order so the set is exhaustive. A *reading* is a poll of the live stamp
      after the push (the `before`/`baseline` read at `:637–638` is not one), so
      the loop needs a success counter it does not have today — `lastSeen` starts
      at `baseline` (`:666`) and only advances on `live.ok` (`:669–671`), so it
      cannot distinguish "no poll succeeded" from "every poll returned the
      baseline". Then: `unreadable` when no reading succeeded; `never-advanced`
      when at least one reading succeeded and every reading that succeeded
      equalled the pre-push baseline; `advanced-elsewhere` for every other
      outcome, including a baseline that could not be read while later readings
      could, readings that disagreed with each other, and a reading that is not a
      commit at all. `writeHold(root, reason)` gains the pushed
      commit, the last stamp read, both window durations and the classification,
      states them outright, and writes as its **first body line** the
      machine-readable marker `deploy-hold: <pushed sha> <classification>` — one
      line, exact prefix, so a later invocation can tell this hold from the four
      the Desk's breakers write, none of which names a commit
      (`loop/lib/breakers.mjs:72, 80, 93, 233` — consecutive-failure, red-build,
      review-bypass, reserved-path). The existing free-text clause
      `— unchanged since before the push` is replaced by the named
      classification rather than kept beside it, so there is one statement of the
      outcome and not two. Implements: *the hold SHALL name which failure it is …
      and SHALL carry the pushed commit, the last stamp read, both window
      durations, and the classification* and *a deploy hold SHALL be
      machine-identifiable as one*.
- [x] 8. `pulse/tests/publish-verify.test.mjs`: six holds, each asserting the
      written file carries the `deploy-hold:` marker line with the pushed commit,
      the classification's name, the last stamp read and **both window durations
      as written values, not merely a duration-shaped field** — one per
      classification, plus the three residual and boundary cases: a baseline that
      was unreadable while later readings succeeded and a reading that is not a
      commit at all (`unknown`), both classifying `advanced-elsewhere`; and the
      case the replaced clause actually gets wrong — **a baseline that was read
      successfully and every post-push poll failing**, which classifies
      `unreadable` and whose hold text must not say the stamp was unchanged since
      before the push. That case is today's defect measured rather than assumed:
      the clause at `publish.mjs:710` is guarded by `baseline &&`, so an
      unreadable baseline makes it disappear silently, while a **readable**
      baseline followed by nothing readable leaves `lastSeen === baseline` (it
      only advances on `live.ok`, `:669–671`) and the clause fires — asserting
      "unchanged since before the push" on a run that read nothing after the
      push. Mutations: collapse `unreadable` into `never-advanced` and confirm
      only the two `unreadable` tests fail; drop the confirmation-window duration
      from the hold text and confirm only the duration assertions fail. Tests
      task 7.

## The read-only re-test of a standing hold

- [ ] 9. `pulse/lib/publish.mjs`: at the standing-hold branch (`:568–570`
      today, which returns before any live read), parse the file for task 7's
      `deploy-hold: <sha> <classification>` marker. **With no marker, return
      exactly as today and append nothing** — the hold belongs to another brake
      and names no commit to ask about. With one, read the live build stamp once
      and append one dated observation saying whether the commit **the marker
      names** is now served, under the same containment test as task 1. No push,
      no remote write, no second reading, and no rewrite of an earlier
      observation. **A dry run reads and prints the observation and appends
      nothing**: the standing-hold branch is reached *before* the dry-run branch
      (`:568–571` returns; the dry-run branch is `:599–624`), so the naive
      implementation would make `--dry-run` append to a guardrail file — which
      contradicts the line that branch already prints, `DRY RUN — nothing was
      committed and nothing was pushed`. `dryRun` is in scope at the hold branch
      already. **The `publish: false` return stays ahead of this branch**
      (`:561-566` returns before `:568`), so a run with publishing disabled
      performs no re-test, reads no stamp, and appends and prints nothing for
      the hold — the disabled line stays the whole of that run's report.
      Implements: *a standing deploy hold SHALL be re-tested, and the
      re-test SHALL take no outward action … at most one observation per
      invocation*, *a standing hold carrying no such marker SHALL NOT be
      re-tested*, *a dry run SHALL append nothing*, and *under `publish: false`
      no re-test is performed and nothing is printed or appended for the hold*.
- [ ] 10. `pulse/lib/publish.mjs`: the re-test returns the same
      `{ published: false, reason: 'hold' }` it returns today. It removes
      nothing, rewrites nothing, and does not reach the push. Implements: *the
      re-test SHALL NOT clear, weaken or rewrite the hold, and SHALL NOT resume
      publishing*.
- [ ] 11. `pulse/tests/publish.test.mjs`: with a marked hold standing and a live
      stamp that now contains the held commit, one invocation appends one
      observation naming the date and the stamp; a second invocation appends a
      second observation and leaves the first intact; the hold's original text is
      unchanged throughout; the file still exists; nothing was pushed (assert on
      the git spy, not on the log line); and **the live-stamp fetch spy records
      exactly one call per invocation** — the assertion for *SHALL read the live
      build stamp once*, whose mutation is a second read, which makes the count
      two and fails it. Mutation: make the re-test delete the
      hold on a positive observation and confirm the "hold is still there" and
      "nothing was pushed" assertions fail while the append assertions pass —
      two failing assertions in disjoint places is the evidence that the append
      and the non-clearance are independent behaviours rather than one described
      twice. Tests tasks 9 and 10.
- [ ] 12. `pulse/tests/publish.test.mjs`: the negative half — a marked hold
      standing with a live stamp that does **not** contain the held commit
      appends an observation saying exactly that, and a run whose live read fails
      appends an observation saying the stamp was unreadable rather than
      appending nothing. An observation that only ever fires on good news is a
      log line, not a record. Then the other negative, on a different axis: a
      hold written by the Desk's **reserved-path breaker** (breaker 4,
      `BREAKERS.RESERVED_PATH`, no `deploy-hold:` marker) is left byte-identical,
      with the live-stamp fetch
      spy recording **zero** calls — a re-test that reads the site to decide
      whether a reserved-path halt has cleared is asking a question that has no
      answer. Then the third negative, on the flag axis rather than the marker
      axis: a **marked** hold standing under `publish: false`, one invocation —
      the live-stamp fetch spy records **zero** calls, `HOLD.md` is
      byte-identical compared by hash against a copy taken before the call, and
      the run prints **exactly one** output line containing `publish`, which is
      the assertion `pulse/tests/publish.test.mjs` already makes on such runs.
      A mode that performs no deploy verification cannot perform the re-test,
      which is part of it, and cannot add a second publish-step line. Mutations:
      key the re-test on the file's existence rather than on
      the marker and confirm only the reserved-path case fails; move the re-test
      ahead of the `publish: false` return and confirm only the disabled case
      fails, on all three of its assertions. Tests task 9.
- [ ] 13. `pulse/tests/publish.test.mjs`: the dry run. With a marked hold
      standing, an invocation in dry-run mode prints the observation, the
      live-stamp fetch spy records **one** call, and `HOLD.md` is byte-identical
      afterwards — compared by hash against a copy taken before the call, not by
      line count, because an appended line is what this asserts against.
      Mutation: drop the dry-run guard so the re-test appends unconditionally and
      confirm only the byte-identical assertion fails, while the printed
      observation still appears — the print and the non-append are independent.
      Tests task 9's dry-run half.

## Gates

- [ ] 14. `openspec validate tell-a-missed-deploy-from-a-slow-one --type change
      --strict --no-interactive`, and `node scripts/check-spec-deltas.mjs
      --strict`. Run at drafting time.
- [ ] 15. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics` on merged `main`. The
      orchestrator's, not a job's.

## Not tasks of this change, recorded so they are not read as omissions

- **Clearing the hold** stays the maintainer's or the orchestrator's between
  runs. No task here removes `HOLD.md`.
- **The Desk's refusal to start under a hold** is `specs/loop`, breaker 2, and
  is untouched — which is what bounds the re-test's cadence to the Pulse's
  schedule (proposal, "What this change deliberately does not do").
- **Committing `HOLD.md`** is not proposed. It is git-ignored and stays so.
