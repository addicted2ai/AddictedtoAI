# DR-CP-UI-001-1-2 — disagreement report, Dated Ledger v2 (built)

```yaml
id: DR-CP-UI-001-1-2
version: 1
schema: loops/ui-loop/graph/schemas.md#disagreement-report
depends_on: [JV-hier-CP-UI-001-1-2, JV-struct-CP-UI-001-1-2, JV-sys-CP-UI-001-1-2, RT-CP-UI-001-1-2, SCORE-CP-UI-001-1-2, IR-CP-UI-001-1-1]
```

## 1. Conflicts

**C1 — is S18 in this packet's scope?** JV-hier (q6, DENS FAIL, critical:false) treats the wiki-entry
S18 gap as "declared S18 debt, not re-filed" — accepted, out of scope. JV-struct (q7, RESP FAIL,
**critical:true**) re-files it as F-struct-4: 34.5% vs the 60% floor, "under half the distance,"
and cites CP-UI-001-1's own reuse line ("filling S18's dead column") as the scope anchor IR did not
meet. RT's anchor check agrees with JV-struct ("packet asserted a fix its own build did not
deliver"). likely_cause: scope-overlap. route: arbitration. question: does the packet's own
`/wiki/<entry>` reuse promise put S18 inside CP-UI-001-1's scope (JV-struct/RT), or is it accepted
cross-packet debt per RULES.md iter-09 as JV-hier treats it — and does that change its criticality?

**C2 — does a presentation fix close K19, or is the board unfixable by UI alone?** F-hier-2-3 and
F-sys-2-1 both prescribe a display fix (collapse the empty column to one line, route: ui-fixable).
RT's FM11 finds the deeper cause: `renderIndexBoard` columns are literal source ids
(`llm-releases`, `openrouter-models`), never the packet's declared Intelligence/Coding/Agentic
metrics, and no cell ever queries a value (`mitigation_exists:false`) — IR's own empty_states line
confirms no snapshot carries `benchmarks.artificial_analysis.*_index`. A column collapse satisfies
the judges' invariant text but not K19's "reads as a leader board" intent. likely_cause:
missing-evidence (RT saw the source code path; the judges judged only renders). route: arbitration.
question: does collapsing the column at presentation level close F-hier-2-3/F-sys-2-1 as written,
or does FM11 mean no revision-directive on this element is complete without also wiring a real
metric column (a scope decision, not a CSS one)?

## 2. Convergent findings

- **/frontier fails to reflow at 390 (and 768)** — filed independently by F-hier-2-1 (HIER,
  critical), F-struct-1 (RESP, critical, q4/q5), and F-sys-2-2 (FAM, "opposite narrow treatment
  from /catalog"). All three prescribe the same fix: reuse `renderCatalogGroups`/the `<details>`
  pattern /catalog already ships at ≤390. Strongest revision candidate — three-judge, one root
  cause, one named fix already proven in this build.
- **32 identical empty board cells** — filed independently by F-hier-2-3 (DENS), F-sys-2-1 (ALLR,
  weakest dimension), and RT FM11. Judges frame it as an empty-state granularity bug; RT frames it
  as no-lookup-ever-possible (see C2). All three agree the visible symptom and the column-level
  collapse direction.
- **F-struct-2 gate-coverage gap** — verify-design's reflow oracle samples only 4 routes and never
  /frontier; this is the mechanism behind why the reflow FAILs above were never caught pre-panel.
  No counter-finding; stands alone but explains C1/convergence-1's root cause.

## 3. Implementer declines contested

- **S18 "pre-existing debt" decline — CONTESTED.** IR: "pre-existing debt … not a regression."
  JV-struct re-files as F-struct-4 (critical) with counter-argument: the packet's own `reuses` line
  named this exact clause as something the build would close, so "pre-existing" undercounts the
  packet's own commitment; RT's anchor section agrees ("asserted a fix its own build did not
  deliver"). See C1 for the routed question.
- **CatalogFilter left unwired — NOT contested.** Checked against JV-struct's carried_forward
  verbatim: "Accepted, not re-filed; S8 and S22 hold without it." No judge or RT re-files this as a
  finding. Flagging the mismatch with the expectation that this would be contested: it is not, on
  the artifacts as written.

## 4. Keeper items

- FM11: no snapshot currently carries any Intelligence/Coding/Agentic index value for any org — should
  /frontier's flagship board ship on a presentation-only fix (collapse to one line) while carrying
  zero real comparative data, or does shipping the flagship route require a data-sourcing decision
  first?
- SCORE-CP-UI-001-1-2 reports `all_met:false` with 3 open MRs (MR-UI-001/002/003) and
  `keeper_section_empty.met:false` (1 open item) — does the keeper want a check-in now, at
  iteration 2 of the revision cap?
