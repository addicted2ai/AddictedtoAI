# DR-CP-UI-001-2-2 — disagreement report, Players Board v2

```yaml
id: DR-CP-UI-001-2-2
version: 1
schema: loops/ui-loop/graph/schemas.md#disagreement-report
depends_on: [JV-hier-CP-UI-001-2-2, JV-struct-CP-UI-001-2-2, JV-sys-CP-UI-001-2-2, RT-CP-UI-001-2-2, SCORE-CP-UI-001-2-2]
```

## 1. Conflicts

**Element: `/` right rail `.frontier-door` (home Frontier door).**
- hier Q2: PASS — position/cost is fine: feed still leads at both viewports, door's R6
  displacement to ~2,400px at 390 is "a cost of R6, not displacement" (also F-hier-10).
- sys Q5: FAIL (critical) — anchored downgrade: the door carries none of the board's
  identity (zero hatch mechanism, no board-specific styling), only a label-face change
  (F-sys-2-4).
- likely_cause: scope-overlap (HIER rules position/lead-order on this element; ALLR rules
  family-coherence/mechanism-transfer on the same element — both correct on their own axis).
- route: arbitration.
- question: Given HIER already accepts the door's position and R6/R2 cost as compliant,
  must the door additionally carry board-specific styling (row rules, `.board-lead`
  weight, per F-sys-2-4) to satisfy family coherence, or does the accepted fixed-excerpt
  form (F-hier-2, declined-with-cause) already discharge ALLR?

## 2. Convergent findings

**`#frontier` VENDOR CLAIM cell/column** — filed independently by all three judges and
red-team: F-hier-5, F-hier-6 (chip loudest+clipped mid-word, 16/16 rows); F-struct-4,
F-struct-5 (chip boxed at default tone, column clips at 1440/off-screen at 768);
F-sys-2-1b, F-sys-2-3, F-sys-2-7 (fallback substitutes org trivia for a missing model
claim, so the hatch mechanism never fires and the label is wrong); RT-FM1, RT-FM2 (same
`firstCitedFact(modelDoc) ?? firstCitedFact(org)` fallback, ground-truthed in code; zero
hatched cells across 112 captured cells). Two intertwined defects, same cell: (a) content
is mislabelled/fallback-sourced, (b) visual weight is a default-state chip that also
truncates. Strongest revision candidate this round.

**Wiki-entry `.entry-rails` / R13** — filed independently by hier and struct: F-hier-7
(post-F-K12 fix, content occupies one measure-wide column against empty space, page grew
2349→2950px); F-struct-2 (heading rules span the grid track, not the block, R10);
F-struct-3 (REFERENCED HERE/APPEARS IN column at 44.9%, under R13's 60% floor — "the
shape S18 governed survived its retirement"). All three describe the same template
regressing after the S13/S14/S18 rewrite.

## 3. Implementer declines contested

None. The only implementer decline (F-hier-2, home door as a board fragment) is accepted
by both hier ("declined-with-cause, accepted") and struct ("declined with cause on
R6/R2 grounds ... not re-filed"); F-sys-2-4 explicitly states it is "not a re-file of the
declined F-hier-2" but a distinct family-coherence ask (see Conflict 1). The index-position
decline is likewise accepted, not re-filed (struct carried_forward).

## 4. Keeper items

- S13/S14/S18 wiki-entry clauses were retired and S14 repurposed by the implementer
  unilaterally this round (IR-CP-UI-001-2-1 rule_changes) — does the keeper ratify this
  RULES.md rewrite, given F-struct-3 shows the shape S18 governed still exists on the
  same template under the new rules?
- F-hier-10 (route: keeper): does K19 require `/frontier` be reachable from home's first
  viewport at 390, or only from the route itself, given the rail currently folds the door
  in after the whole changed feed (~2,400px in)?
