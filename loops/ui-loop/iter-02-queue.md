# Iteration 2 — work queue

**Surface: `/catalog`.** Two items, both impact 9, drawn from `verdicts/iter-01.json`.
They interact — the verdict says so explicitly — so they are worked together by one
implementer rather than split.

**Scope.** `app/globals.css`, `app/layout.tsx`, and the `/catalog` page template.
**`loops/ui-loop/RULES.md` and `tools/ui-invariants.mjs` are ALWAYS in scope** and are
never counted against a scope line — landing the invariant is part of landing the fix
(SKILL.md H3; this exemption exists because the orchestrator got it wrong last round).

**Deferred, deliberately, to a template-scoped iteration 3:** I16 and I17 (both are the
grid-track-convergence family, together with the re-filed DC2), I18 and I19 (index-link
and divider-policy completions). Declining for scope is not declining on merit.

---

## Read this before you touch anything: last round's remedy was faithful and wrong

Iteration 1's S7 was implemented exactly as prescribed and produced the severe regression
you are now fixing. The prescription was sound; **the problem statement's premise was
false.** `IMPLEMENT.md`'s standing contract already says the problem is authoritative and
the prescription is a hypothesis. Iteration 1 added the sharper case: **verify the premise
too.** See state.md D6, JUDGE.md L4, and R11's inline post-mortem.

---

## I15 — /catalog column headers cover the rows they label (impact 9)

**Problem, verified independently by the orchestrator.** At scroll position 0 the thead
lies on top of its own data rows, both themes, both viewports. Measured at 1440: thead
462.3–491.1 against rows at 445.1–476.9 and 476.9–508.2. At 390: thead 904.9–933.7,
landing on rows 3 and 4. The displacement equals `--header-h` exactly. The site's 396-row
price table has no legible column labels.

**Premise findings — measured, not reasoned. Do not re-derive these from CSS alone.**

1. `.table-wrap` declares only `overflow-x: auto`, but per CSS the visible cross-axis
   coerces to `auto`. Confirmed live: `getComputedStyle(.table-wrap).overflowY === "auto"`.
   `.table-wrap` is therefore the thead's nearest scrolling ancestor, **not the viewport.**
2. `.table-wrap` has `clientHeight === scrollHeight === 12435`. **It does not scroll
   vertically.** Consequence: `position: sticky` on the thead has *never* had any effect,
   in any variant tested, including the pre-S7 `top: 0`. The stickiness R11 was written to
   protect does not exist and never did. The original I7 collision could not occur.
3. **The obvious revert is NOT sufficient, and this was observed, not predicted.** With
   `top: 0` patched in and the site rebuilt, `tools/ui-invariants.mjs` S7 clause 1 passes
   and **clause 2 fails**: `"column labels are not visible while row 50 is on screen
   (thead top -1161.7px)"`. It clears the overlap and leaves a 396-row table with no
   column labels. Treat "revert to top: 0" as a measured dead end.
4. **One remedy shape is known to work, measured at 1440 and 390.** Capping the container
   (`.table-wrap { max-height: calc(100vh - var(--header-h)); overflow-y: auto }`) with
   `thead th { top: 0 }` makes the container a real scrollport: thead pinned at 416.3
   across `scrollTop` 0 / 400 / 2000, never occluded, no overlap at rest. **R2 still holds
   at 320px** — page `scrollWidth === clientWidth === 320`, wrap scrolls in x.
   This is evidence, not an instruction. It is one shape that satisfies the invariant; if
   you find a better one, take it, and say why.

**Invariant (already written and already failing — make it pass honestly).**
`tools/ui-invariants.mjs` id `S7` is registered and currently FAILS. It asserts both
clauses of R11: at rest the column labels shall not intersect any tbody row, and while the
table is being read they shall remain visible and clear of the site header. Both clauses
have been *observed* failing, separately.
**You may not weaken, narrow or skip this check to go green.** If you believe the check
itself is wrong, say so in your report with the geometry that shows it, and stop.

**Constraints.** R2 is non-negotiable: the page shall not scroll horizontally at 320px;
wide content scrolls in its own container. R1 (axe, both themes) is the domain floor —
note that a keyboard-operable scrollable region needs to remain operable; verify rather
than assume. If you remove `position: sticky` from the thead entirely as the honest
resolution, that is a legitimate outcome — but then retire R11 with a tombstone and say
plainly that the table has no persistent column labels, rather than leaving a decorative
declaration that does nothing.

---

## I1 — /catalog is unusable at 390px (impact 9, unresolved since iteration 0)

**Problem.** At 390px the catalog shows the MODEL column and nothing else; in/mtok,
out/mtok, context and status are off-screen inside the horizontally scrolling container.
The 320px reflow oracle measures the table at full desktop width (thead 1111px, tr 1111px)
inside a 320px page that does not itself scroll — **so R2 passes while the surface delivers
396 names and no numbers.** This is R2 being satisfied and useless, and it is the
second-oldest item in the loop.

**Invariant.** At 390px the `/catalog` listing shall present, without horizontal scrolling,
the model name AND at least the input price, output price and lifecycle status per row.

**Prescription (hypothesis).** Below the 33.999rem breakpoint, drop `.data-table` out of
table layout into a stacked record-per-row presentation — model name as the row heading,
then a compact label/value grid for in/out/context/status. Alternatively keep a table with
a prioritised three-column subset and the remainder in a per-row disclosure. The stacked
form is likelier to hold at 320px too.

**Interaction with I15, stated by the judge and re-stated here because it is the whole
lesson of last round:** any stacked mobile form must not reintroduce a displaced or
occluding header. Whatever you build at 390 must satisfy S7's *both* clauses at 390, or
must legitimately have no thead at that width — in which case make S7 express that
explicitly rather than passing by accident on a missing element. **A check that passes
because the thing it measures is absent is a vacuous check.**

---

## Landing requirements

Per `IMPLEMENT.md`: every accepted item's invariant lands as an executable check in the
same change as the fix, each with a `falsifier` record — you must **break the property,
observe the check fail, and restore**. `auditRegistry()` refuses entries without it.
Add the R7-style rule text to `RULES.md` for anything new, and amend R11's entry if the
resolution changes what it asserts.

Report to `loops/ui-loop/verdicts/iter-02-implementer.md`. Write it as a file — a report
that is only returned did not happen.
