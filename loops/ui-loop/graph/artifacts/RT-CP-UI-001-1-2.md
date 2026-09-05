# RT-CP-UI-001-1-2 — red team on the BUILT Dated Ledger (anchored re-run)

```yaml
id: RT-CP-UI-001-1-2
version: 1
schema: loops/ui-loop/graph/schemas.md#red-team-report
depends_on: [CP-UI-001-1.v2, IR-CP-UI-001-1-1, RT-CP-UI-001-1-1]
anchor: RT-CP-UI-001-1-1
```

## Anchor verification (not re-filed; grounded against the built branch)

FM1 (unseen surface) — **mitigated**: `/frontier` captured all 6 combos, `evidence/current/`.
FM2 (single-source dependency on AA) — **superseded, not fixed**: `renderIndexBoard`'s
columns are `site.freshness.sources` (`llm-releases`, `openrouter-models` — literal source
ids), never the packet's declared metrics (Intelligence/Coding/Agentic Index). No AA value
is wired at all, so FM2's mechanism cannot fire — replaced by FM11 below, which is worse.
FM3 (lead-change empty) — unchanged, capture shows "No lead change recorded yet."; not
claimed fixed. FM7 (ember theme leak) — checked: `--ember`/`--ember-soft` both defined in
light (`app/globals.css:176-177`) and dark (`:242-243,259-260`); no leak found. FM9
(relocation via shared spine track) — **confirmed still true, not fixed**: IR's own S18 line
says "Still honestly FAILING, unchanged in kind" (34.5%, floor 60%) although
`CP-UI-001-1.md`'s own `reuses` line for `/wiki/<entry>` promised the shared track would be
"filling S18's dead column." The packet asserted a fix its own build did not deliver.

## New failure modes (the delta: the actual build, not the concept)

```json
{"failure_modes": [
  {"id":"FM11","mode":"relocation-not-resolution","scenario":"the packet's 'index columns (current leaders)' element is built as renderIndexBoard: columns = registered data SOURCES (LLM-releases, OpenRouter-models), never the three declared metrics; cell render is `sources.map(() => el('td',...,'no index published for this window'))` — org and source are both ignored, so all 32 cells (16 orgs x 2 columns) are hardcoded to the same string with no lookup that could ever resolve to a value. K19 asked whether the spine 'reads as' a players board; captured at all 6 combos it reads as one column-header row repeating identical filler 16 times per column — not a leader board under any future data state, only a template that never queries one.","probability":5,"severity":4,"detectability":5,"mitigation_exists":false,"element":"lib/render/frontier.mjs renderIndexBoard (THE BOARD)"},
  {"id":"FM12","mode":"unlabelled claim","scenario":"renderVendorClaims takes `org.data.facts.find(f => f.source === 'cited')` — the first cited fact in file order, whatever field it is. For 13/16 orgs that is `founded` (a date); for alibaba-cloud, inception-labs and meta-superintelligence-labs it is a different field carrying quoted marketing language ('the world's first commercially available family of diffusion large language models'; 'the Muse Spark open weights release'), rendered under the identical 'claimed · unverified' card shape with no field name shown. Provenance is labelled per the fence, but the CLAIM TYPE is not: a reader cannot tell a founding date from a vendor superlative, and three of sixteen cards on the flagship route are product taglines dressed as the same neutral fact-card as a founding year.","probability":5,"severity":3,"detectability":4,"mitigation_exists":false,"element":"lib/render/frontier.mjs renderVendorClaims; content/wiki/org/inception-labs.md, meta-superintelligence-labs.md, alibaba-cloud.md"}
]}
```

FM11 and FM12 compound: the vendor-claim cell was declined at model grain and wired at org
grain "beside the index" (packet's own purpose line), but there is no index on the page for
it to sit beside (FM11) — so /frontier's two data-bearing sections both resolve to org
trivia, and the route the keeper named as the site's flagship currently carries zero
comparative model data anywhere in frame.

## What will be wrong about this in a week

The spine (`THE PACE`) groups the 40 most recent change lines into five daily buckets,
2026-09-01 through 2026-09-05 — every `--gap-days` is 1, so `clamp(1.6rem, 1*1.6rem, 12.8rem)`
renders identical spacing five times running (confirmed in the capture, not the 8-day depth
FM6 assumed — it is shallower and flatter than predicted). The concept's whole bet, cadence
read through spacing before any label, is invisible on day one and stays invisible until a
gap actually varies. THE BOARD will still be reading "no index published for this window"
32 times regardless of any date, because nothing in `renderIndexBoard` reads a value — this
is not a day-one condition that ages out.

## What every other AI news site already shows

A leaderboard with actual numbers on it. This build's page is titled "The Frontier," opens
with "THE BOARD," and shows no comparative number anywhere on the route — a harder version
of the same gap RT-1 flagged, now visible in the real artifact rather than argued from the
packet's prose.
