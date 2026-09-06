# Tasks

Drafted 2026-09-06 (local) on branch `impl/spec-review`. Every box is open.

**Read this before working the list.** Most of what the delta requires is
already built and already measured — `loop/run.mjs:443-502`,
`loop/lib/gates.mjs:64-119`, and 18 tests in
`loop/tests/gate-transport-retry.test.mjs`. Each task below therefore says which
of the two it is:

- **PIN** — the behaviour exists; the work is a test that fails if it is removed,
  plus the mutation that proves the test bites. A behaviour with no test is a
  behaviour the next refactor deletes for free, and the delta's whole reason for
  existing is that this mechanism's safety argument currently lives only in
  source comments.
- **BUILD** — the behaviour does not exist and must be written.

There are seven normative sentences. Every one is named by the task that
satisfies it and the task that measures it.

## The retry itself

- [ ] 1. **N1 — PIN.** `loop/run.mjs:443-502`: a failing gate run is followed by
      exactly one more run of the same scripts in the same worktree; a passing
      retry continues the run and records no failure; a failing retry settles
      `failed`. Covered today by
      `loop/tests/gate-transport-retry.test.mjs:173, 187, 211, 409, 496`. Add
      the sentence the tests do not assert: that there is **no third run** —
      a gate hook counting its invocations, asserted at exactly 2 on a failure
      that never passes.
- [ ] 2. **N2 — PIN.** The retry reads no classification as a precondition.
      `gate-transport-retry.test.mjs:373` covers an explicitly unflagged
      failure; extend it so the assertion is about the **call count** on a
      failure whose output carries no marker and whose `transport` flag is
      `false`, not only about the outcome. This is the sentence
      `addictedtoai-xzdd` had to restore once already, and the "optimisation"
      that would undo it is retrying only marked failures.

## The marker and where the decision is made

- [ ] 3. **N3 — PIN.** One declared wording in one place
      (`loop/lib/gates.mjs:64`), both emitting sites interpolating it, an
      unmarked failure classifying as unexplained. Covered by
      `gate-transport-retry.test.mjs:163, 249, 260, 276`. Add the missing
      negative: `loop/` itself carries no second hard-coded copy of the
      sentence, scanned the way `pulse/` already is at line 276 — the guard
      currently watches only the directory the first re-invention happened in.
- [ ] 4. **N4 — PIN.** The classification is computed over each script's full
      output at capture (`gates.mjs:211`) and read from the flag
      (`gatesHitTransportFailure`, `gates.mjs:86-89`), never re-derived from the
      truncated log. Covered by `gate-transport-retry.test.mjs:331, 358`.

## The refusal, which is the only new mechanism in this change

- [ ] 5. **N5 — BUILD.** `loop/tests/breakers.test.mjs`: the control that does
      not exist today. Three consecutive same-type jobs, each failing its gates
      **twice** with the machine-failure marker present in every run, trip
      breaker 1 and write `HOLD.md`. Today this passes by construction because
      no exemption exists; the test is what makes removing that construction a
      red build instead of a silent policy change. Pair it with the existing
      `gate-transport-retry.test.mjs:549` control — a retried-then-**passed**
      gate is not a failure toward breaker 1 — so the two together say exactly
      where the line is.
- [ ] 6. **N5 — BUILD.** A source guard beside the test: `loop/lib/breakers.mjs`
      contains no read of the classification. Scan the file for the exported
      marker constant, for `transport`, and for the accessor names
      `isTransportFailure` / `gatesHitTransportFailure`, and fail on a hit,
      naming this requirement. A guardrail is a mechanism, not an instruction,
      and the instruction "do not exempt marked failures" is otherwise enforced
      by nothing at all.

## The record

- [ ] 7. **N6 — PIN.** `gateFailureNote` (`gates.mjs:101-119`) names each failing
      script with its exit status (or "could not run"), says whether the marker
      was present, and says when a retry failed again. Covered by
      `gate-transport-retry.test.mjs:187, 211, 229`. Add the assertion that the
      literal unqualified string `gates failed` never appears **alone** as a
      note — a substring assertion on the ledger line, so a future refactor
      cannot regress to the flat note the beads were filed about.
- [ ] 8. **N7 — PIN.** The job's permanent record carries
      `gates = {retried, passed, transport, first_failed}` on a retried run and
      **no** `gates` key on a run whose gates passed first time
      (`run.mjs:487-494`). Covered by `gate-transport-retry.test.mjs:508, 536`.

## Mutation proof

- [ ] 9. Each mutation applied alone, then reverted with the file's hash
      compared before and after:
      **(a)** make the retry conditional on `gatesHitTransportFailure` — task 2's
      call-count test must fail while task 1's and task 5's still pass;
      **(b)** allow a second retry — task 1's no-third-run assertion must fail
      alone;
      **(c)** add an exemption to `checkConsecutiveFailures` that skips a
      failure whose note contains `transport-marked` — task 5 must fail and task
      6 must fail, and every existing breaker test must still pass, which is the
      point: the exemption is invisible to every test that exists today;
      **(d)** move the `transport` computation after the log truncation — task
      4's covering test must fail alone.
      Four mutations failing four disjoint sets is the evidence these are four
      mechanisms rather than one described four times.

## Gates

- [ ] 10. `openspec validate retry-the-gates-once-and-name-the-failure --type
      change --strict --no-interactive`, and `node
      scripts/check-spec-deltas.mjs --strict`. Run at drafting time.
- [ ] 11. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics`.

## Not tasks of this change, recorded so they are not read as omissions

- **The suppliers of these failures** — `addictedtoai-ovrk` (a lock test that
  flakes under load), `addictedtoai-ucbv` (loopback fixtures),
  `addictedtoai-e71c` (resident processes taking ports). Fixing the machine is
  better than classifying it and is not this change.
- **Any change to the breaker enumeration.** The delta modifies no requirement.
- **Any configuration for the retry.** It has none and gains none;
  `data/config.json` is untouched and is a reserved path besides.
