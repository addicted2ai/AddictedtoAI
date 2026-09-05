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

Classes: wrong-decline · semantic-mislabel · fake-empty-state · rule-violation-quiet · scope-creep · gate-skipped ·
data-invented · content-edit-in-disguise. Reads: `IR-*` reports, `JV-*` findings routed
`ui-fixable`, `RT-*` modes grounded in an implementer choice.
