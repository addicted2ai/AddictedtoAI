# Schemas — the only way nodes talk

Ported from `dean-loop-engineering-2/graph/schemas/*` and re-cut for this loop. Every artifact lives
under `loops/ui-loop/graph/artifacts/` as `<ID>.md` (YAML front matter + short prose) or `<ID>.json`
where a schema says JSON. Every artifact starts with the universal header:

```yaml
id: <PREFIX>-<...>
version: 1
schema: loops/ui-loop/graph/schemas.md#<section>
depends_on: [<upstream artifact ids WITH versions>]
```

Rules (constitutional): size budgets are hard (`gates.mjs` FAILs over budget — over budget means the
artifact is wrong, not the budget); one owner per number, referenced by name everywhere else;
deltas, never restatements; structured over prose; a `depends_on` that names nothing on disk FAILs.

## Size budgets (bytes) — owner of these numbers

| Prefix | Artifact | Budget |
|---|---|---|
| `BRIEF-UI` | concept brief | 9000 |
| `CP-UI` | concept packet | 6500 |
| `JV` | judge verdict (JSON) | 9000 |
| `RT` | red-team report | 6000 |
| `SCORE` | score (JSON, machine-written) | 6000 |
| `DR` | disagreement report | 5000 |
| `AR` | arbitration decision | 4000 |
| `RD` | revision directive | 3000 |
| `MR` | measurement request | 2000 |
| `CAL` | calibration (reader test result) | 3000 |
| `GR` | gate report (machine-written) | 6000 |
| `state.md` | resume file | 8000 |

## concept-brief

Graph INPUT. Written by the keeper (drafted by the orchestrator, keeper-approved). Fields:
`status` (queued | active | complete), `requirements` (each testable, each citing a constitution
clause: `CHARTER`, `RULES R<n>`, `site-spec design bar`, or a keeper ruling `K<n>`), `anti_requirements`,
`mandatory_first_steps`, `success_criteria`, `concept_count` (3–5), `concept_round_panel`,
`finalists_built` (≤2), `revision_cap` (≤3). A requirement that cannot cite a clause is UNANCHORED
and needs keeper sign-off.

## concept-packet (`CP-UI-<brief>-<n>`)

One candidate direction, one packet. Text only in the concept round; the generator is bold and
does not rank its own concepts.

```yaml
name: <two-word working name>
core_idea: <3 sentences max — the bet this concept makes>
reader_walks_away_with: <one sentence, in the visitor's words>
surfaces: [<routes/templates touched>]
elements:                      # every visible element that carries data
  - name: <element>
    purpose: <what the reader does with it>
    data_source: <repo path(s) present TODAY, e.g. data/sources/openrouter-models/latest.json>
    empty_state: <what renders when the source has nothing; never sample data>
    provenance_label: <how "claimed / verified / derived" reads on the element, or n/a>
design_moves: {type: <>, colour: <>, layout: <>, motion: <>}   # each a decision, not an adjective
reuses:                        # Reuse before you draw (per surface)
  - {surface: <>, nearest_existing: <template/component/rule>, differs: <what, in one line>}
fence:                         # how the hard rules hold BY CONSTRUCTION
  a11y: <> ; reflow_320: <> ; payload: <> ; digit_free_fixed_copy: <> ; no_external_origins: <>
known_risks: []                # honest — the red team will find them anyway
open_questions: []             # each tagged research | measure | evidence-fix | keeper
build_estimate: {files: [<paths>], new_files: [<paths>]}
```

## judge-verdict (`JV-<hier|struct|sys>-<packet>-<v>.json`)

```json
{ "id": "JV-hier-CP-UI-001-2-1", "version": 1, "judge": "judge-hierarchy",
  "packet": "CP-UI-001-2", "packet_version": 1,
  "anchor": { "previous_verdict": null, "delta_seen": null },
  "questions": [ { "q": 1, "tag": "HIER", "verdict": "PASS|FAIL|UNCERTAIN", "critical": false,
                   "element": "<selector or route+region>", "evidence": "<file>", "note": "<≤2 sentences>" } ],
  "findings": [ { "id": "F-hier-1", "tag": "HIER", "problem": "<authoritative>", "evidence": "<file>",
                  "invariant": "<true/false condition>", "governing_rule": "RULES.md R8 | null",
                  "prescription": "<hypothesis>", "confidence": 0.0, "route": "ui-fixable|evidence-fix|measure|research|keeper" } ],
  "carried_forward": [], 
  "diagnosis": { "strongest": "", "weakest": "", "critical_issue": "", "highest_value_improvement": "", "confidence": 0.0, "evidence_ids": [] },
  "downstream": { "weakness": "", "cause": "", "recommendation": "", "confidence": 0.0 } }
```

No numeric scores anywhere in a verdict. `meta: true` only on the one question the contract marks
`(meta)`; `score.mjs` excludes it from numerator and denominator and FAILs a verdict inventing more.

## red-team-report (`RT-<packet>-<v>`)

Reasons to reject; never scores. The report is markdown with the universal header AND one
```json fence carrying `{"failure_modes": [...]}`; each mode: `{id, mode, scenario, probability 1-5,
severity 1-5, detectability 1-5 (5 = undetectable until the visitor sees it), mitigation_exists,
element}`. `score.mjs` reads that fence, computes p×s×d and flags ≥ `RT_CRITICAL = 50`. Taxonomy for this loop:
rot-within-a-week (a number that dates), hype-adjacent copy, unlabelled claim, single-source
dependency (AA licence `addictedtoai-ego8`), unseen surface (route or band the rig did not capture),
relocation-not-resolution, one-sided invariant, external origin, payload creep, theme leak
(un-stamped state), contrast in dark, reader-cannot-find (findability regression), empty-state
reads as evidence.

## disagreement-report (`DR-<packet>-<v>`)

Element-level conflicts between judges' findings, each with `likely_cause` (taste | missing-evidence
| scope-overlap) and `route` (arbitration | research | measure | evidence-fix) and a precise
`question`. `measure` = the answer lives on a real reader ("would a person find…"). Items tagged
`keeper` route to the keeper section of `state.md` immediately, never to another instrument round.

## revision-directive (`RD-<nnn>`)

`target`, `fix` (ranked `{finding_id, invariant}`), `do_not_touch` (explicit), `re_evaluate`
(ONLY the affected judges), `budget: one iteration`. Never "redesign everything".

## measurement-request (`MR-UI-<nnn>`) and calibration (`CAL-UI-<nnn>`)

The graph's only way to ask a human. `question` (one measurable, stated so two people would run the
same test), `instrument` (e.g. "keeper, stopwatch, 5 find-tasks on a preview build"), `acceptance`,
`status: open | scheduled | closed | retired`, `closed_by: CAL-UI-<nnn>`. An open MR blocks the stop
condition. `CAL` records the raw observations (task, success, seconds, notes), never a verdict.

## score (`SCORE-<packet>-<v>.json`, machine-written) and gate report (`GR-*`, machine-written)

Written only by `score.mjs` and `gates.mjs`. Running either to "check" writes an artifact nobody
commissioned: use `--dry-run`.
