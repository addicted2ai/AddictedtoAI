# Tasks — catch-the-constitution-up-to-the-code

This change ships **no executable change**. The usual column, *the task that
implements this clause*, is therefore filled by the task that already
implemented it under an earlier change, and the check column names the test
that already measures it. The point of keeping the table is unchanged: a
normative sentence with nothing behind it is invisible twice over, and the way
to catch that is to enumerate every SHALL and name its implementation and its
check, rather than to read the two documents and form an impression.

## 1. Author the deltas

- [x] **1.1** `specs/wiki` — one ADDED requirement for the price-attribution
      gate (`addictedtoai-t2g`).
- [x] **1.2** `specs/review` — one ADDED requirement covering `carry:` and the
      older reviewer-noted proposal (`addictedtoai-frm2`), plus two MODIFIED
      bodies for tense only (`addictedtoai-sut`).
- [x] **1.3** `specs/pulse` — two ADDED requirements: the carried-finding queue
      class (`addictedtoai-frm2`) and the slug-collision finding
      (`addictedtoai-javv`).
- [x] **1.4** `specs/loop` — three MODIFIED bodies: the warm-up window with the
      `dyw` correction (`addictedtoai-fq4a`), the budget refusal's settled
      pointer (`addictedtoai-sut`), and the reviewer-side no-output criterion
      (`addictedtoai-lllt`, whose body also carried `sut`'s defect).

## 2. Verify

- [x] **2.1** `node scripts/check-spec-deltas.mjs --strict` — run **before**
      archiving. A MODIFIED heading the target spec does not carry aborts the
      archive (exit 1, nothing changed); a REMOVED heading it does not carry
      only *warns*, completes the archive, and leaves the requirement standing
      in `openspec/specs/` — the genuinely silent failure, and unrecoverable in
      place because the change directory has already moved.
- [x] **2.2** `openspec validate catch-the-constitution-up-to-the-code --type
      change --strict --no-interactive`.
- [x] **2.3** The full gate set, serially: `npm test`, `npm run build`,
      `verify-launch`, `verify-design`, `verify-surfaces`, `verify-analytics`,
      `measure-payload`.

## 3. Traceability — every normative clause, what implements it, what measures it

### wiki: A listed price is a property of a listing, not of a company (ADDED)

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| the build fails an attributing verb near a `price_*` transclusion without a provider-layer clause | `lib/price-attribution.mjs`, wired in `lib/build-content.mjs` | `lib/price-attribution.test.mjs` |
| row-attributing verbs are compliant and are not flagged | same | same — the corpus's remedy idiom is a pinned pass case |
| the exemption is the remedy; there is no ignore marker | same | same |
| prose does not name the top provider | same | same |
| the fact itself is never edited | the check reports on prose only and never rewrites a fact | `lib/price-attribution.test.mjs` |
| pre-existing instances warn, and the debt list only shrinks | `data/price-attribution-debt.json` + the reporting in `lib/price-attribution.mjs` | the debt-list length printed by the prebuild |

### review: A reviewer's non-blocking finding reaches work without editing anything (ADDED)

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| a record may carry `carry:` entries of `{title, detail, subject?}` | `parseCarry` in `loop/lib/verdict.mjs` | the verdict parser's tests |
| a record may carry a reviewer-noted proposal | `transcribeNotedProposal` in `loop/lib/proposals.mjs` | the proposals tests |
| neither ever affects the verdict | `parseVerdict` reads them independently | the verdict parser's tests |
| the reviewer brief documents both | `loop/lib/review.mjs` | the brief-text tests |
| a carried finding is not a second route to publication | it becomes an ordinary queue item under the ordinary rules | the merge gate's existing review requirement |

### review: two MODIFIED bodies (tense only)

| Body | What changed | Why it is not a behaviour change |
|---|---|---|
| `A review record names the bytes it reviewed` | opening diagnosis rewritten in the conditional | every bullet, scenario and normative sentence is byte-identical |
| `Missing, unbound, and mismatched are three findings, not one` | same | same |

### pulse: A carried finding is queue state, and its file is the state (ADDED)

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| a merged `carry:` entry writes one file to `data/carried/` | `transcribeCarriedFindings` in `loop/lib/carry.mjs`, called from `loop/run.mjs` | the carry tests |
| the queue produces one item per file, every run | the carried-finding class in `pulse/lib/queue.mjs` | `pulse/tests/queue.test.mjs` |
| it ranks below world- and declaration-derived findings | rank 25 in `pulse/lib/queue.mjs` | `pulse/tests/queue.test.mjs` |
| retirement is deletion by the fixing job's own diff, with no merge bookkeeping | file presence is the state | `pulse/tests/queue.test.mjs` |
| not a second route to publication | ordinary job, ordinary review gate | the merge gate |

### pulse: A row whose slug is already taken is a finding (ADDED)

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| all three conditions — live, undeclared, path occupied by a non-declaring entry | `findSlugCollisions` in `pulse/lib/mint.mjs`; `slug_collisions` in `pulse/lib/freshness.mjs`; reason `slug-collision` in `pulse/lib/queue.mjs` | `pulse/tests/mint.test.mjs`, `freshness.test.mjs`, `queue.test.mjs` |
| the Pulse edits nothing and chooses neither reading | the finding carries observation only | `pulse/tests/mint.test.mjs` |
| a genuinely absent row does not fire | the occupied-path gate | the third negative case in `pulse/tests/mint.test.mjs` |

### loop: Spending is budgeted in model-minutes with floors and ceilings (MODIFIED)

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| a ceiling is measured against max(observed rolling total, warm-up window) | `warmUpMm()` in `loop/lib/budget.mjs` | `loop/tests/budget.test.mjs` |
| the upkeep floor always reads the observed total | the floor path in `loop/lib/budget.mjs` | `loop/tests/budget.test.mjs` |
| the window is derived, never a config key | `warmUpMm()` + `largestCapMinutes()` | `loop/tests/budget.test.mjs` |
| the unit is one invocation's cap, not a job's bounded total | `loop/lib/budget.mjs` | the `dyw the warm-up denominator measures one invocation` test |

### loop: A budget refusal states the arithmetic it refused on (MODIFIED)

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| a refusal prints MM, denominator, and the denominator's origin | `refusalArithmetic()` in `loop/lib/budget.mjs` | `loop/tests/budget.test.mjs` |
| a substituted denominator announces itself | same | same |

*Also removes a pointer to `addictedtoai-tr8` as an open question. It was ruled
on 2026-08-31 and the ruling is what the requirement above now states.*

### loop: A runner proven unable to run is refused (MODIFIED)

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| an author run producing nothing is evidence about the runner | `loop/lib/result.mjs`, `loop/run.mjs` | `loop/tests/runner-health.test.mjs` |
| for the reviewer role the evidence is an absent verdict record plus empty stdout | `reviewProducedNothing()` in `loop/lib/result.mjs`; `phase()` for `review*` in `loop/run.mjs` | the `G8A` tests |
| a malformed record is output, not silence | `reviewProducedNothing()`'s documented decision | the `G8A` tests |
| the streak accumulates per invocation and per role | `invocationsFor` in `loop/lib/health.mjs`'s `noOutputStreak()` | the `G8A` tests |
| three consecutive runs refuse the runner for both roles | `loop/lib/health.mjs` | `loop/tests/runner-health.test.mjs` |
| refusal is checked before invocation and before resumption | `loop/run.mjs` | `loop/tests/runner-health.test.mjs` |
| refusal names its cause and its clearing command; one real run clears it | `loop/lib/health.mjs` | `loop/tests/runner-health.test.mjs` |
| lines recording no invocation neither count nor clear | `loop/lib/health.mjs` | `loop/tests/runner-health.test.mjs` |
| refusal never writes `HOLD.md` | `loop/lib/breakers.mjs` is not called | the `C41 refusing a runner writes no HOLD.md` test |

## 4. Deliberately not in this change

- [x] **4.1 `addictedtoai-8wm0` — left open, and the reason is the whole point
      of this change.** It reads like spec debt and is not: its own task 2 is to
      *implement* a usable-runner predicate at the start gate, enumerating every
      author-cleared runner in `runners.yml` and checking each against both the
      conformance and health gates. Landing its requirement text here would put
      a fifth breaker into the constitution with nothing behind it — the exact
      defect this change exists to remove. The `A runner proven unable to run is
      refused` body now points at `8wm0` by id in place of the closed
      `addictedtoai-pfv`.
- [x] **4.2 No detector for the present-tense-diagnosis defect.**
      `addictedtoai-sut` is right that a regex over *today* / *currently* / *at
      present* inside a requirement body fires on legitimate uses. That this one
      is a review-time judgment rather than a mechanism is recorded in
      `proposal.md` so it is not rediscovered.
