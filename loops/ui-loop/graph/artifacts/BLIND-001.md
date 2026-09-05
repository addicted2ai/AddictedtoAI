# BLIND-001 — blind-agent ruling, five open questions (K32)

```yaml
id: BLIND-001
version: 1
schema: loops/ui-loop/graph/schemas.md#evidence-note
depends_on: [CHARTER.md, RULES.md, state.md (K3–K33), HANDOFF-ORCHESTRATOR.v1,
  BRIEF-UI-001.v1, SCORE-CP-UI-001-2-3.v1, RT-CP-UI-001-2-3.v1, JV-sys-CP-UI-001-2-3.v3,
  JV-hier-CP-UI-001-2-3.v1, JV-struct-CP-UI-001-2-3.v1, MR-UI-001..003.v1,
  implementer-ledger.md, EN-domain-facet.md, openspec/specs/directory/spec.md]
```

Fresh agent, no prior context, these files only, no human reachable. A value call, new
scope, a merge, a push or a keeper-reserved step is KEEPER REQUIRED.

## 1. A fourth, narrowly scoped iteration — KEEPER REQUIRED

**Anchor.** K7 (≤3 revisions, then keeper check-in), applied by K29: *"RD-002 is iteration
3 of 3 — hard stop after it regardless of score."*

**Reason.** The cap spends its stop ON the check-in, so a fourth round in its place
substitutes loop work for the step the ruling reserves, and "regardless of score"
forecloses the argument that the remainder is small. The defects are not the reason to
stop: F-sys-3-1 (R8), F-hier-11 (R8 and RD-002 fix 3's own "no per-row rules") and RT FM-N1
(`CLAIM_FIELD` admits `vendor_description`; `CLAIM_PRESENT` never prints here) are each
anchored, prescribed and inside the brief's anti-requirements. **Record:** carry the three
to the check-in as one costed packet (judges system + hierarchy, red team anchored FM-N1),
so the keeper answers go/no-go on a written scope.

## 2. Merge to main — KEEPER REQUIRED

**Anchor.** K3 (no merge until the keeper says all is in order); K4 for the push.

**Reason.** K3 reserves the merge by name, and the record shows the state is not in order:
`SCORE-CP-UI-001-2-3` has `all_met false` — `hard_gates_pass` false (no GR for v3),
`rt_criticals_zero` false (FM-N1, risk 60), `all_dimensions_ge_8` false (HIER 7.5, DENS
6.67, RESP 6.67; JV-struct q5 carries the /catalog@768 FAIL), `keeper_section_empty` false
(3), `no_open_measurement_request` false (MR-UI-001..003, open by design). The brief also
requires `CAL-UI-001` *before any merge*; it does not exist. **Record:** the merge
goes to the keeper with this list; no graph action clears it.

## 3. The MRs — KEEPER REQUIRED to run; scheduling already ordered

**Anchor.** K9: *"Reader test: the keeper alone."* Each MR names the keeper as the
instrument (stopwatch, two builds, verbatim first interpretation), and MR-UI-001 is the
brief's own success criterion.

**Reason.** No other node can produce it, so it cannot be run or closed without the keeper;
a substitute reader is invented evidence. Scheduling is already decided
— `state.md` Next(keeper) 1 orders them on the revised Players Board preview. **Record:**
the graph may stand up the preview builds and the task script and mark the MRs ready;
execution waits.

## 4. Implementer tier Sonnet → Opus — KEEPER REQUIRED

**Anchor.** `implementer-ledger.md`: *"The decision rule is the keeper's; this file is the
evidence"*; HANDOFF §6: *"decide the tier on evidence."* K13 sets the tiers.

**Reason.** A standing tier change is a cost/quality value call the ledger reserves, and
the evidence is not decisive on its own terms: 7 Sonnet defects across two builds against
one Opus revision (entry 8, clean on five fixes) that still carries a quiet rule slip
(entry 9 = F-hier-11) — one sample, no control, different task shapes.
**Record:** keep the ledger running; put the tier to the keeper with that asymmetry.

## 5. The three domain-facet questions (EN §6) — two resolvable, one not

**5a. Alphabetical vs declared ordering (Q10) — RESOLVABLE.** Anchor:
`openspec/specs/directory/spec.md`, "No placement is ever sold": a category order *"SHALL
be a pure function of the category names, and SHALL NOT be derived from the order in which
the categories are declared"*, not adjustable without an OpenSpec change; EN §8 restates it
for this facet. **Resolution:** /frontier orders domain sections by domain id; declaration
order and member count are forbidden, the criterion stated on the page. Record it in
`DESK-ORDER-001` as spec-derived, not a preference still owed an answer.

**5b. Republishing Artificial Analysis values (Q7) — RESOLVABLE, negative, for now.**
Anchor: K24 (index columns only once a registry index exists), HANDOFF §5 (no index value
renders until rights are cleared; two rights beads open), and the
brief's anti-requirement against depending on a single third-party index. **Resolution:**
no AA value renders on /frontier while the terms are unverified. The affirmative grant is a
rights determination outside the graph, not cleared here.

**5c. Keep `text` or make "general" the unmarked default (Q1) — KEEPER REQUIRED.** No
clause fixes it: K22 seeds the vocabulary and says *the keeper picks*, and EN §4.1 holds
both readings defensible (`text` is 431/431, near-useless; absence-as-general
loses the editorial "published as general-purpose" signal).
