# IR-CP-UI-001-2-1 — implementer report, Players Board

```yaml
id: IR-CP-UI-001-2-1
version: 1
schema: loops/ui-loop/graph/schemas.md#implementer-report
depends_on: [CP-UI-001-2.v1, JV-hier-CP-UI-001-2-1, JV-sys-CP-UI-001-2-1, RT-CP-UI-001-2-1]
branch: ui/concept-2
worktree: D:\AddictedtoAI-c2
head: TBD-fill-after-commit
```

## Gates
- build: PASS (`npm run build`; log clean of errors, /frontier exported, first-load JS 103 kB shared)
- verify-design (port 3112): PASS, 46/46 checks; `data/launch.json` restored after
- verify-surfaces: PASS, all checks (allowlist unchanged, nav lists `/frontier`)
- ui-invariants: PASS, 19/19; S13/S14/S18 rewritten this round (see rule_changes)

## Typeface (K16, F-sys-2-1)
**Space Grotesk** (Florian Karsten, OFL 1.1). Source: `google/fonts`
`ofl/spacegrotesk/SpaceGrotesk[wght].ttf` (variable, downloaded at authoring time). Instantiated to
500/700 (`fonttools varLib.instancer`), subset to the Latin range this site's labels/dates/prices
use (`pyftsubset --flavor=woff2`). `public/fonts/SpaceGrotesk-Medium-subset.woff2` (10,860 B),
`SpaceGrotesk-Bold-subset.woff2` (10,300 B) — both under the ~30 KB/weight cap. Licence:
`public/fonts/SpaceGrotesk-OFL.txt`. `--mono` (`app/globals.css`) now leads with `'Space Grotesk'` —
reused, not forked: that token was already "labels, headers, cells, dates, ids, prices, navigation"
site-wide (46 call sites), so one edit is the family's full reach. `ascent/descent/line-gap-override`
set from the font's own metrics (98.4/29.2/0%). No external origin.

## Family (K20)
- **frontier**: new — the board.
- **home**: Frontier door added (fixed 2-col excerpt, decline below).
- **catalog**: two dense lines/row at <390px (R-D).
- **wiki entry (prose)**: facts retired from the two-column grid to a full-measure fragment after
  prose (F-K12/S18, see rule_changes).
- **wiki model record (no prose)**: unchanged — facts-first still correct.
- **wiki index, tools, learn, blog, tutorials, impossible-routine, data**: unchanged, because none is
  in the packet's `surfaces` and none shares the board's row/column shape; all inherit the grotesk
  via `--mono` already.

## K21 (board membership is editorial)
`renderPlayersBoard` iterates ALL 16 `content/wiki/org/*.md` entries unconditionally — no filter by
feed presence (`lib/render/frontier.mjs`, `boardRowHtml`'s `!row` branch renders the full hatched row).
**0 of 16 orgs render an all-blank row today** (all 16 matched >=1 catalog provider by alias). Column
labels ("Current model", "Read") are generic; the Read cell states whichever feed id the matched
row's own `source` carries (`data/sources/registry.json`), never a hard-coded "OpenRouter".

## K22 (domain facet, future — no data added)
Confirmed absorbable with no template edit: **/frontier** — `BOARD_COLUMNS` is a plain array driving
head + cells; a domain column/group is one more entry reading `row.domain`/`modelDoc.data.domain`.
**/catalog** — `COLUMNS` in `lib/render/catalog.mjs` is the same shape; `CatalogFilter.tsx` filters
over `data-*` row attributes, so a domain is one more attribute + filter option. **/tools** — listings
already group by category via `listingStates`; domain is an additional grouping/filter, same
mechanism. **wiki entries/index** — `renderFacts` renders whatever is in `doc.factsHtml`; a domain
fact is one more row in the (now full-measure) facts fragment; `.browse` rows take a domain the same
way they take `data-kind`/`data-status` today.

## Empty states
Index-position column: omitted whole (no registry `frontier` block, no independent index — RT ground
truth). Lead-change strip: "no lead change recorded yet" (`changes.jsonl` has no `lead-change` kind).
Vendor claim: "no vendor claim on file" where neither the model nor org entry has a `cited` fact.
Price/context/current-model cells: hatched, labelled, per-cell, only where that org's matched
provider(s) lack the value.

## Declines
- **F-hier-2** (home door as a board fragment): declined. R6 requires the changed feed to lead; R2
  forbids a new horizontal scroll at 390px. A 3-row, 7-column board in an overflow container as the
  door risks both. Built instead as a fixed 2-column excerpt (org, newest listing) — same join,
  `renderFrontierDoor`/`boardExcerpt`, no board grid, no overflow container on `/`.
- **F-hier-1/F-hier-4**: applied. Hatch is muted italic text on a light `--rule` diagonal, never
  heavier than a filled cell; `.board-lead` (org + current model) is the one 700-weight column pair —
  the board's first-read entry point.
- Index position (packet element): declined as a rendered column, per the packet's own empty_state
  ("whole column omitted when no index is published") — no registry data exists to source it from.

## rule_changes (RULES.md R13, S13/S14/S18)
Wiki entry's two-column grid retired (never reached the 60% floor after its one lever was spent, and
its mobile `order` rule contradicted F-K12). `S13`'s and `S18`'s wiki-entry clauses retired (no track
left to ask about). `S14` repurposed: now asserts PROSE's bottom edge sits above FACTS's top edge at
every viewport (F-K12's actual property, the opposite of the old S14's intent). Falsified both ways:
break forcing FACTS ahead of PROSE in paint order (fired), break `.entry-facts{margin-top:-4000px}`
(fired); both restored, full `ui-invariants` run 19/19 after.

## Files
Changed: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `lib/render/entry.mjs`,
`lib/render/home.mjs`, `loops/ui-loop/RULES.md`, `tools/ui-invariants.mjs`.
New: `app/frontier/page.tsx`, `lib/render/frontier.mjs`, `public/fonts/*` (2 woff2 + OFL licence).
