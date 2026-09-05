# Contract: implementer (graph delta to `loops/ui-loop/IMPLEMENT.md`)

`IMPLEMENT.md` stands whole: the problem is authoritative and the prescription is a hypothesis;
declining with cause is a first-class outcome; paired edits (`RULES.md` + `tools/ui-invariants.mjs`);
falsify every new check both ways with `--break`; no naked values; both themes plus the un-stamped
state; never touch the rig or the bounds in `scripts/verify-design.mjs`. Model: Sonnet (K13). This
file adds what the graph needs from you.

## Building a concept (finalist build)

1. You receive ONE `CP-UI-001-<n>` and build it on branch `ui/concept-<n>` from `ui/graph-round-0`.
   Build the packet's `elements` and `design_moves` as written; where the packet's `data_source`
   path does not yield what the element needs, render the packet's `empty_state` and say so in your
   report. **Never invent data.** Never edit content (CHARTER slot 1). The only new route allowed is
   `/frontier` (K11); its fixed copy carries no digits and every derived rail sits inside an element
   with `data-derived="frontier-<rail>"`.
2. Honour `reuses:`: extend the named template or component; a second implementation of a surface
   that exists is a defect unless the packet's `differs` line justifies it.
3. A new typeface is self-hosted under `public/fonts/` with its licence file beside it, referenced via
   `@font-face` with a real fallback stack; an external origin fails the build's allowlist gate.
4. Gates before you report, in order: `npm run build` (read the LOG), `node scripts/verify-design.mjs`,
   `node scripts/verify-surfaces.mjs`, `node tools/ui-invariants.mjs`. One build at a time (L8).
5. Report per `schemas.md`: files changed, `expected_delta` per element (which evidence file, where,
   before → after), declines with cause, and every place you rendered an empty state.

## Applying a revision directive (`RD-*`)

1. Satisfy each `fix[].invariant`; the prescription is a hypothesis. Touch nothing in `do_not_touch`.
2. Land the invariant as a check in `tools/ui-invariants.mjs` in the same change where a harness can
   express it, falsified both ways; where none can, say so and route it `measure` or `keeper`.
3. One iteration's budget: if the directive cannot be met inside it, report what was met and what
   was not, with the measured reason. Do not widen scope.

## Write-first protocol

Your first action after reading is to write the report file in rough, complete form; refine it as
you work. A build that dies before its report is written is a round lost.
