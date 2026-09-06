# Implementer ledger — shortcomings by build (append-only)

Keeper (2026-09-05): "keep track of implementer shortcomings … if they become common and
troublesome, it might warrant upgrading the implementer agent to Opus." One line per defect the
implementer introduced or wrongly declined; `caught_by` says who found it and `cost` what it took
to fix (a message, a revision directive, a panel re-run). The decision rule is the keeper's; this
file is the evidence. Sonnet is the implementer tier under K13.

| # | date | packet | model | shortcoming | class | caught_by | cost |
|---|---|---|---|---|---|---|---|
| 1 | 2026-09-05 | CP-UI-001-1 Dated Ledger | Sonnet | Declined the K16 typeface requirement citing "no network/subsetting toolchain"; the sibling build used the same machine's fonttools to download, instance and subset a face. False cause for a decline. | wrong-decline | orchestrator (reading both IRs) | one message; rebuild of one item before the panel |
| 2 | 2026-09-05 | CP-UI-001-2 Players Board | Sonnet | Vendor-claim column wired to each org's FIRST cited fact (founding dates, founders), so "claimed · unverified" sits on "5 April 1993, by Jensen Huang". Mislabelled claim; honest render was the empty state. | semantic-mislabel | orchestrator (first look at frontier--light--1440.png); panel pending | revision directive expected |
| 3 | 2026-09-05 | CP-UI-001-1 Dated Ledger | Sonnet | Left S18 (wiki-entry second-column occupancy, 34.5% vs 60% floor) failing as "pre-existing debt, out of packet scope" — but the packet's own reuses line promised "facts and timeline share the spine track, filling S18's dead column", and BRIEF R-C requires S18 green or keeper-retired. Scope narrowed against its own packet. | wrong-decline | orchestrator (IR + gate result) | panel will see it; RD expected |
| 4 | 2026-09-05 | CP-UI-001-1 Dated Ledger | Sonnet | SAME semantic mislabel as #2, independently: "What each organisation says about itself" renders org founding dates/founders under "claimed · unverified". Two builders, same error → recurring class. | semantic-mislabel | orchestrator (frontier--light--1440.png); panel pending | RD expected |
| 5 | 2026-09-05 | CP-UI-001-1 Dated Ledger | Sonnet | Board columns are the two FEEDS (llm-releases, openrouter-models) labelled "index · <feed> · read <date>", each cell "no index published": a feed is not an index (plan §2/§5.3). 16×2 identical cells; K19's board leads but says nothing. | semantic-mislabel | orchestrator; panel pending | RD expected |
| 6 | 2026-09-05 | CP-UI-001-1 Dated Ledger | Sonnet | `renderIndexBoard` cell renderer ignores org and source (`sources.map(() => 'no index published…')`): the empty state is HARD-WIRED, so no data can ever populate the board. An empty-state picture, not an empty state. | fake-empty-state | red-team RT-CP-UI-001-1-2 FM11 (risk 100) | RD; rebuild of the element |
| 7 | 2026-09-05 | CP-UI-001-1 Dated Ledger | Sonnet | THE BOARD keeps its 3-column desktop table at every width: /frontier captures are 928px wide at 390 and 937px at 768 (PNG headers). R2 (law: no horizontal scroll at 320) broken on the flagship; slipped past verify-design because its reflow sample never includes /frontier. Packet fence said "every grid track minmax(0,1fr)". | rule-violation-quiet | judge-structure JV-struct-CP-UI-001-1-2 (q4 critical FAIL) | RD; reflow rebuild |
| 8 | 2026-09-05 | CP-UI-001-2 RD-002 revision | **Opus** (K29) | Comparison row, not a defect: five of five fixes met, no declines, 12 hatched cells now render; found and fixed a second R2 overflow the widened check exposed; caught two of its OWN vacuous checks during falsification (S18 measured box height, S5 selector matched nothing) and recorded both. Report 7268 B vs 7000 budget (trim requested). Panel pending. | (none yet) | orchestrator reading IR-CP-UI-001-2-2 | — |
| 9 | 2026-09-05 | CP-UI-001-2 RD-002 revision | Opus (K29) | Home door draws a hairline between its three rows, against RD-002 fix 3's own text ("no per-row rules (R8)"). Small, and the only defect the panel found in the Opus run against seven in the two Sonnet builds. | rule-violation-quiet | judge-hierarchy JV-hier-CP-UI-001-2-3 F-hier-11 | one-line fix |
| 10 | 2026-09-05 | CP-UI-001-2 RD-003 (iteration 4) | Opus | Tier-2 "quantified" allow-list admitted third-party MEASUREMENTS (OpenRouter observed_throughput_p50; llm-releases.com cost/tokens per task) as VENDOR CLAIMS under a lede saying "quoted verbatim from the vendor". Field-name test without a source test. | semantic-mislabel | red-team RT-CP-UI-001-2-4 FM-N3 (risk 80) | RD-004, one more iteration |
| 11 | 2026-09-06 | K49 stream 3a (claim record) | stream implementer (model per a4's run) | Claim renderer attributed every claim to the subject unconditionally, never consulting the vendor test. | semantic-mislabel | sealed reviewer, mutation | fixed before merge |
| 12 | 2026-09-06 | K49 stream 3a (claim record) | stream implementer | `publishes_from` gate accepted full URLs and paths as hosts. | rule-violation-quiet | sealed reviewer, mutation | fixed before merge |

Classes: wrong-decline · semantic-mislabel · fake-empty-state · rule-violation-quiet · scope-creep · gate-skipped ·
data-invented · content-edit-in-disguise. Reads: `IR-*` reports, `JV-*` findings routed
`ui-fixable`, `RT-*` modes grounded in an implementer choice.

## Pitfall list outcomes (K49 implementation, 2026-09-06, reported by the orchestrator)

Of the 21 pitfalls sent before the streams ran: #2 kept a reviewer from making S22(e) import the
renderer; #7 caught the renderer hard-wiring the empty state (frontier.json is now looked up and
collapsed); #10 held across three streams' tests (`domains_seeded` the only new mechanical key, bare
`domains` asserted absent twice); #14 kept the ≥1-domain bar from being resurrected in the schema gate.
Not predicted, found by mutation: rows 11 and 12 above. Process lesson (theirs): archiving a change
moves its paths; a test that read a delta at its change directory failed the final gates.
