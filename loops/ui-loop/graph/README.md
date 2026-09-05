# ui-loop graph — topology (round 1 onward)

The graph is the engineering artifact. Every edge is a real data dependency: nodes talk only through
the files named in `schemas.md`. Ported from `D:\shared_workspace\dean-loop-engineering-2` (its
`graph/topology.md`, `gates/README.md`, `docs/prompts/*`), re-cut for a static site's presentation
layer. The sandbox loop's own deterministic layer (`scripts/verify-design.mjs`,
`tools/ui-invariants.mjs`, `tools/ui-evidence.mjs`) is kept whole; what is new is the topology.

## Nodes

| # | Node | Kind | Model (K13) | Reads | Writes |
|---|---|---|---|---|---|
| 00 | constitution + rubric | anchor | — | — | `CHARTER.md`, `RULES.md` R1–R16, `openspec/specs/site` design bar, `rubric` below |
| 01 | keeper | human | — | frontier pages, pair reviews | rulings `K*` in `state.md`, `STOP` |
| 02 | concept-generator | generator | **Fable** | `BRIEF-UI-001`, constitution, `knowledge/` | 3–5 `CP-UI-001-n` |
| 03 | implementer | builder | Sonnet | one `CP` or one `RD` + `IMPLEMENT.md` + `contracts/implementer.md` | a built branch `ui/concept-n`, an implementer report |
| 04 | gates | code | — | packets, exports, manifests | `GR-*` (`gates.mjs`), verify-design/surfaces/invariants text |
| 05a | judge-hierarchy | judge | Opus | screenshots ONLY + packet | `JV-hier-*` |
| 05b | judge-structure | judge | Opus | screenshots + `invariants.txt` + `verify-design.txt` | `JV-struct-*` |
| 05c | judge-system | judge | Opus | contact sheets + `app/globals.css` tokens + packet | `JV-sys-*` |
| 06 | red-team | adversary | Sonnet | packet/branch, `knowledge/`, prior RT | `RT-*` |
| 07 | scoring | code | — | `JV-*`, `RT-*`, rubric | `SCORE-*` (`score.mjs`) |
| 08 | disagreement-analyzer | analyzer | Haiku | `JV-*`, `RT-*` | `DR-*` |
| 10 | arbitrator / jury | jury | **Fable** | `DR-*`, verdicts, constitution; finalists for pairwise | `AR-*`, `RD-*`, pairwise rankings |
| 12 | reader test | human | keeper | `MR-*` backlog | `CAL-*` (find-task results) |

Effort: every spawned agent inherits the session's effort; the session runs at **medium** for
dispatches (K13). A judge is never downgraded below Opus without a two-judge agreement measurement.

## Flow (round 1 = concept round)

```
BRIEF-UI-001 ─▶ 02 generator (Fable) ─▶ CP×4
                      │
                      ▼
               04 gates.mjs --packets   (size, fields, data sources exist, digit-free copy, hype lexicon,
                      │PASS              reuse line present)  FAIL ─▶ back to generator, zero judge spend
                      ▼
               05a + 05c judges ∥ (text audit of packets; pixel questions deferred) + 06 red team
                      ▼
               07 score.mjs ─▶ 08 analyzer ─▶ 10 arbitrator ranks; KEEPER picks ≤2 to build
                      ▼
               03 implementers ∥ (one branch per finalist, real data only, honest empty states)
                      ▼
               04 gates (build log, verify-design, verify-surfaces, invariants, rig coverage)
                      ▼
               tools/ui-evidence.mjs per finalist ─▶ 05a+05b+05c full panel + 06 ─▶ 07 ─▶ 08
                      ▼
               10 jury: pairwise, order-swapped, ≤2 finalists (pointwise always precedes pairwise)
                      ▼
               KEEPER picks from the frontier (never a collapsed average) ─▶ merge pick into ui/graph-round-0
                      ▼
               ≤3 targeted revisions: RD (invariants, do_not_touch, re_evaluate) ─▶ 03 ─▶ 04 ─▶ affected judges only
                      ▼
               stop conditions (score.mjs, ANDed) ─▶ MR-UI-001 reader test ─▶ keeper: merge? (K3) push? (K4)
```

## Rubric v2 (owner of the weights; `score.mjs` reads this table)

| Tag | Dimension | Weight | Judge |
|---|---|---|---|
| HIER | First-read hierarchy and findability | 20 | 05a |
| DENS | Density and chrome fit (surface-conditioned, RULES R8) | 10 | 05a |
| TABL | List and table craft | 15 | 05b |
| RESP | Responsive integrity at 390 / 768 / 1440 | 10 | 05b |
| TYPE | Typographic system | 10 | 05c |
| COLR | Colour discipline | 5 | 05c |
| FAM | Family coherence | 10 | 05c |
| ALLR | Identity and allure (K10: alluring to a human, zero hype) | 20 | 05c |

Hard gates, code, no judge: axe zero violations in both themes; no horizontal scroll at 320px;
first-load JS ≤ 150 KB gzipped; `tools/ui-invariants.mjs` all green (S18 included: the entry template
concept must satisfy or the keeper retires the clause); rig coverage complete for every contract.

Dimension score = 10 × PASS / questions (UNCERTAIN is not PASS); a `(critical)` FAIL caps the
dimension at 2. Overall = Σ weight × score / 10, out of 100, **reported, never a target** (K7).

## Stop conditions (ANDed, computed by `score.mjs`, never asserted)

hard gates 100% · every dimension ≥ 8 · zero red-team criticals · keeper section of `state.md`
empty · revisions ≤ 3 (else mandatory keeper check-in) · last two iterations improve < 1% ·
no open `MR-*` · rig coverage complete. Then the frontier goes to the keeper.

## Budgets

One concept round; ≤2 finalists built and fully panelled; ≤3 revision iterations; jury once.
No spend ceiling (K9) but every agent writes its artifact first, rough, then refines: a death before
the write loses the whole analysis.
