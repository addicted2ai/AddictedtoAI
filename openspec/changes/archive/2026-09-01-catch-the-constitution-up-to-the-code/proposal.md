# Catch the constitution up to the code

## Why

`openspec/specs/` is a reserved path. That is correct and is not in question:
it means no job, and no ruling made outside the OpenSpec workflow, can quietly
rewrite the rules it is judged against. It has a cost, and the cost has now
been measured.

Six mechanisms landed between 2026-08-30 and 2026-08-31. Each was built, wired
and tested; each stopped at the boundary of `openspec/specs/` and filed an
issue instead of a delta. Nothing archived them, because archiving is a
ceremony nobody runs on the day the work lands. The result is a constitution
that does not describe its own system:

| Issue | What runs | What the spec says |
|---|---|---|
| `t2g` | the build fails a price sentence that attributes a listed rate to a company | nothing |
| `frm2` | `carry:` carries a reviewer's non-blocking finding into the queue | nothing, and nothing about the older noted-proposal mechanism it was modelled on either |
| `javv` | a re-listed row whose slug is occupied becomes a queue finding | nothing |
| `lllt` | a reviewer-only runner accumulates a no-output streak | detection is written entirely in author terms, which the reviewer role cannot satisfy |
| `fq4a` | ceilings are measured against a warm-up window when the observed total is too small to mean anything | shares are the observed rolling total, full stop |
| `sut` | — | three requirement bodies open by diagnosing, in the present tense, a world their own rule abolishes |

The last row is the one that shows why this matters beyond bookkeeping. A
constitution whose bodies assert a state of the system that the requirement
below them removes reads as **false to anyone who checks it against the code** —
and checking the spec against the code is exactly what a reviewer is asked to
do. `lllt` is the sharper case: `specs/loop` requires the runner refusal to
apply "for the author and reviewer roles" while the detection bullet directly
above it names `RESULT.md` and a branch diff, neither of which a reviewer
produces. The requirement could not be literally satisfied for half of what it
claimed to cover. That is the `untasked-shall-is-invisible` shape seen from the
other side: not a rule with no implementation, but an implementation the rule
described wrongly.

## What was re-measured before designing anything

Following the precedent set by `let-the-site-see-its-own-gaps`, the claims this
change is built on were re-derived rather than inherited from the issues.

- **`8wm0` is not spec debt and is not in this change.** It reads like the
  others and is labelled `decision-followup`, but its own text carries three
  tasks and the second is to *implement* a usable-runner predicate at the start
  gate, enumerating every author-cleared runner in `runners.yml` and checking
  each against both gates. A catch-up change cannot close it. Writing its
  requirement text without the predicate would produce exactly the defect this
  change exists to remove — a rule with nothing behind it. It stays open, and
  the `A runner proven unable to run is refused` body now points at it by id
  rather than at the closed `addictedtoai-pfv`.
- **Two issue bodies name issues that have since been ruled.** `A budget refusal
  states the arithmetic it refused on` says the denominator question "is open and
  tracked as `addictedtoai-tr8`"; `tr8` was ruled on 2026-08-31 and `fq4a` is its
  follow-on. Leaving that sentence would have shipped a fresh stale pointer in
  the same change that removes several.
- **`sut`'s own warning was checked and is respected.** It argues that rewriting
  argument under cover of a mechanical cleanup destroys the one property that
  made the earlier narration change checkable — a reviewer being able to tell
  mechanical fixes from editorial ones by diffing. Here the two `specs/review`
  bodies are touched *only* for tense and are declared as unchanged in
  substance in the delta preamble, while the three `specs/loop` bodies had to be
  rewritten for `lllt` and `fq4a` regardless. Rewriting those bodies twice, in
  two changes, would be worse than doing both at once and saying so.

## What changes

Nothing executable. This change is entirely `openspec/specs/`, and every
normative sentence it adds describes behaviour that is already implemented and
already measured by an existing test. `tasks.md` names both for each clause, in
place of the usual implementing task.

- **`specs/wiki`** — one ADDED requirement: a listed price is a property of a
  listing, not of a company.
- **`specs/review`** — one ADDED requirement covering `carry:` *and* the older
  reviewer-noted proposal it was modelled on; two MODIFIED bodies, tense only.
- **`specs/pulse`** — two ADDED requirements: the carried-finding queue class,
  and the slug-collision finding.
- **`specs/loop`** — three MODIFIED bodies: the budget ceiling gains the warm-up
  window with the `dyw` correction folded in, the budget refusal stops pointing
  at a settled question, and the runner refusal gains the reviewer-side
  detection criterion it always claimed to have.

## What this does not do

- It does not touch `runners.yml`, `data/config.json`, or any code.
- It does not implement `8wm0`.
- It does not add a detector for the present-tense-diagnosis defect. `sut` is
  right that a regex over *today* / *currently* / *at present* inside a
  requirement body would fire on legitimate uses, and a check with a known
  false-positive rate on a corpus this small is a check that gets ignored. That
  this one is review-time judgment rather than mechanism is itself worth having
  written down, which is what this paragraph is for.
