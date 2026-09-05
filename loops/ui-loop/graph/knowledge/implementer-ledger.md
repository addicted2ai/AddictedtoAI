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

Classes: wrong-decline · semantic-mislabel · rule-violation-quiet · scope-creep · gate-skipped ·
data-invented · content-edit-in-disguise. Reads: `IR-*` reports, `JV-*` findings routed
`ui-fixable`, `RT-*` modes grounded in an implementer choice.
