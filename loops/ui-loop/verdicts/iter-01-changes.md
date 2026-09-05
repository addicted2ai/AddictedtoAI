# Iteration 1 — change manifest

Handed to the judge with the iteration-0 verdict block as its anchor. Facts only.

**Scope of this iteration.** One implementer, one surface: the shared design system
(`app/globals.css` + `app/layout.tsx`). No page template, component, content file or
user-facing string was touched. Seven items (S1–S7) merged from `iter-00-a` and
`iter-00-b` and trimmed by the keeper (KP2). The per-template items in both iteration-0
verdicts were deliberately NOT worked this round.

**Gates, re-run by the orchestrator rather than taken on the implementer's report.**
`npm run build` clean (log read, not exit code); `scripts/verify-design.mjs` 45 checks,
0 failures, axe clean in both themes; `tools/ui-invariants.mjs` 5 registered, 5 pass.

**Evidence.** `evidence/baseline/` holds the 40 captures the iteration-0 verdicts were
scored from. `evidence/current/` holds 40 re-captures at this HEAD, all identity-verified,
no duplicates. **All 40 differ.** Before/after comparison is available for every route,
theme and viewport.

---

## Implemented

| item | sources | what changed | rule landed |
|---|---|---|---|
| S1 | `a`I1 + `b`I4 | `--measure-list: 24rem` token added; `.browse-row` bounded to `minmax(0, var(--measure-list)) auto auto` with `justify-content: start` | R7 |
| S2 | `a`I3 + `b`I2 | per-row `border-bottom` removed from `.browse-row`, `.rail-item`, `.strip-item`, `.data-table th/td`; `.table-wrap` outer border removed; group boundary drawn once; `.badge:not([data-tone])` renders borderless and transparent | R8 |
| S4 | `a`I4 | `.browse-name`, `.rail-title a`, `.data-table a` resting state is `--ink` with an underline; `--accent` now appears only on `:hover` / `:focus-visible` | R9 |
| S5 | `a`I2 | `.entry-head`, `.facts`, `.rails`, `.listing-facts` bounded to `max-width: var(--measure)` to match `.prose` | R10 |
| S6 | `b`I6 | one resting record-link treatment across `/wiki`, `/blog`, `/catalog` — same change as S4 | R9 |
| S7 | `b`I7 | `--header-h` token measured from `.site-header`'s real `offsetHeight` by an inline script in `layout.tsx`; `.data-table thead th` uses `top: var(--header-h)` instead of `top: 0` | R11 |

Three iteration-0 items — `b`I3's link half, `a`I4 and `b`I6 — converged on **one** fix
(R9), filed independently by two judges about three different templates.

**Expected visual deltas, for verification against the evidence:**

- `/wiki`, `/tools`, `/data` @1440 both themes — row metadata sits immediately after the
  row label rather than at the shell's right edge.
- `/wiki`, `/catalog`, `/tools`, `/data`, `/` @1440 both themes — no rule between sibling
  rows; catalog table has no outer box; default-state badges render as plain text while
  `DEPRECATED` / `RETIRED` / `DEAD` keep the bordered chip.
- `/catalog`, `/blog`, `/wiki` @1440 both themes — record links are ink with an underline
  at rest, not accent.
- `/wiki/[kind]/[slug]`, `/blog/[slug]`, `/colophon` @1440 both themes — header rule,
  FACTS block and cross-reference columns stop at the prose's right edge.
- **S7 is NOT OBSERVABLE in this evidence set.** Every capture is taken at scroll
  position 0, and the defect only appears once `/catalog` is scrolled past its first rows.
  The DOM invariant (`ui-invariants.mjs` id `S7`) asserts it instead. Do not score S7 as
  unresolved on the basis of a screenshot that cannot show it; treat it as
  `not-visible-in-evidence` and, if you want it evidenced, file an `evidence-fix` for a
  scrolled capture.

---

## Declined with cause — carried forward, adjudicated by the orchestrator

Both were re-derived against source rather than accepted on the implementer's word.

**DC1 — S5's second clause: column-start alignment across a page. ACCEPTED, binding.**
The clause asked every column start to align to a shared track (prose x=97, FACTS values
x=205, APPEARS IN x=497). Satisfying it requires deleting the `.facts` label column, whose
`<dt>` / `<dd>` markup is authored in `app/colophon/page.tsx` and
`app/wiki/[kind]/[slug]/page.tsx` — outside this iteration's two-file scope. The
implementer's second argument also stands: unlabelled facts read worse than misaligned
ones. Block **width** matching shipped as R10. **Do not re-file column-start alignment as
a CSS item.**

**DC2 — S3's grid half: track convergence across templates. ACCEPTED for this iteration.
Its stated reason was WRONG and the correction changes its disposition.**
The implementer wrote that the container class "is chosen in each page's own `page.tsx`".
It is not: `.shell` is applied at `app/layout.tsx:127`, and `.prose { max-width:
var(--measure) }` is declared in `globals.css` — both were in scope. What is per-template
is which content *carries* `.prose` versus sitting bare in `.shell`. The conclusion
survives — tokens can be rescaled, but content cannot be reassigned to a track from those
two files — so the decline holds for a shared-system-only iteration.
**This is achievable work that was out of scope, not work that is wrong.** If it is still
a defect in the current evidence, re-file it; it is queued for a template-scoped
iteration.

---

## Standing note on the loop's own instrument

The iteration-0 baseline you are anchored to (`iter-00-b`, overall 6.8) is one of a pair.
Its partner `iter-00-a` scored 7.0 on identical evidence. **The measured noise floor is
0.2 on the overall**, and per-category spread between those two judges reached a full
point. Hold a category unless you can name the visible change that moved it.
