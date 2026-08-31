# Design

## D1 — `MODIFIED`, not `ADDED`

The body contains a sentence that must be **repealed**: *"Whether a job's total
should be bounded is a question this requirement leaves open."* An added
requirement cannot repeal a sentence in another one — it would leave the
constitution saying two incompatible things and a later reader to guess. The
same reasoning `record-state-before-anything-reads-it` used for the pulse
publish requirement, and the same asymmetry: add where addition is honest,
modify where only modification can repeal a `SHALL`.

## D2 — Scenario headings are identity

`openspec validate --strict` refuses a `MODIFIED` block that renames a scenario,
reporting that it "omits scenario(s) the current spec still has" — the archive
cannot distinguish a rename from a deletion. Both existing scenario headings are
therefore reproduced **verbatim**, and the three new ones are appended after
them.

## D3 — The requirement fixes a property, not a number

The implementation uses `JOB_TOTAL_CAP_MULTIPLIER = 2`. The requirement does not
say `2`. It says: the smallest multiple leaving the author and one review pass
each their full per-invocation guard unconditionally.

That phrasing is doing real work in both directions. It pins the value from
below — a multiple of 1 lets an author consume the budget a review must have,
which would quietly convert a spend limit into a review-quality limit. It pins
it from above — a multiple equal to the number of invocations a job can make is
exactly today's entitlement and bounds nothing. And it leaves the digit free, so
retuning is a code edit rather than a constitutional amendment, while a retune
that defeats the bound violates the spec and is caught.

Writing `2` into the constitution would have been the easier sentence and the
wrong one: it would freeze an implementation detail at the altitude where only
invariants belong.

## D4 — Why the numbers are not in `data/config.json`

Three reasons, and "the file is reserved" is deliberately not the first:

1. `data/README.md` documents `config.json` as four key groups, and
   `build-initial-site` task 1.3 verifies that count. A fifth group is a
   documentation and test change as well as a config change.
2. Deriving keeps the total coherent when a per-type cap is edited. This is the
   argument `budget.mjs` already makes for its warm-up denominator, so the
   pattern is established rather than invented here.
3. `loop/lib/config.mjs` already holds `LANE_BACKOFF_*`, `PROPOSAL_COOLING_DAYS`
   and `RESUMABLE_MAX_AGE_DAYS` — the documented home for values that are
   normative in `specs/loop` and deliberately not operator-tunable.

If the maintainer prefers tunability, the minimal alternative is recorded in
`addictedtoai-o5t`: a fifth group `"job_budget": {"total_cap_multiple": 2,
"min_invocation_minutes": 15}`, which also requires amending `data/README.md`
and task 1.3's four-group check.

## D5 — `abandoned` rather than a new outcome

`abandoned` already means "given up on, not on its merits"; it is already
excluded from `FAILURE_OUTCOMES`, so budget exhaustion cannot trip the
consecutive-failure breaker and disable a whole job type for a reason unrelated
to that type's quality; and an `abandoned` branch is already non-resumable, so
the resume sweep cannot spin on it. `discarded` would have counted as a failure.
A new outcome would have touched `OUTCOMES`, `config.mjs`, the ledger schema and
every reader of it, for no gain.

## D6 — The bound is exact, and that is why the cap is lowered rather than checked

The rejected alternative was to leave the per-invocation caps alone and check
the total after each invocation. That bound lies about its own value by exactly
one cap, because the invocation that crosses the line runs to its full cap
first. Capping each invocation at `min(perInvocationCap, remainder)` makes the
stated bound the real one.

## D7 — What the bound counts, stated as a limit

The bound counts what the **ledger** records. A run whose process ends before
writing its ledger line contributes nothing to it. That is an architectural
boundary rather than an arithmetic defect — the ledger is the only durable
record, and a second notion of spend beside it would drift from it, which is the
same argument the ledger-ordering requirement makes. It is named in the
requirement rather than left as a silent assumption, and tracked as
`addictedtoai-z7a`.
