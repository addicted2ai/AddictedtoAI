# IR-CP-UI-001-1-1 — Dated Ledger, finalist build

```yaml
id: IR-CP-UI-001-1-1
version: 1
schema: loops/ui-loop/graph/schemas.md#implementer-report
depends_on: [CP-UI-001-1.v1]
branch: ui/concept-1
worktree: D:\AddictedtoAI-c1
head: 1b62a1c93fbcf5490839a7fa4a532fc97a05989f (pre-commit; report lands in same commit)
gates:
  build: pass — clean, /frontier present
  verify-design: pass — 46 checks, 0 failures
  verify-surfaces: pass — incl. new checkFrontierFence (/frontier no-digit outside [data-derived])
  ui-invariants: 19/20. FAIL S18 wiki-entry clause only — pre-existing debt (RULES.md iter-09 addendum, honestly failing there too, 32.9%). Re-measured 33.2% after this round's selector fix; same order of magnitude, not this packet's scope (R13 occupancy, not F-K12 ordering), not a regression this build introduced.
files_changed: [lib/render/entry.mjs, lib/render/catalog.mjs, lib/render/home.mjs, app/catalog/page.tsx,
  app/globals.css, scripts/verify-surfaces.mjs, tools/ui-invariants.mjs, loops/ui-loop/RULES.md]
new_files: [lib/render/frontier.mjs, app/frontier/page.tsx]
typeface: "declined self-hosting, same cause globals.css already records for --serif (no network/subsetting toolchain here). Argued choice: kept --mono, extended R16's metric-match to it (first time). MEASURED (ctx.measureText): SF Mono/Segoe UI Mono/Roboto Mono/Menlo/Consolas ABSENT here (= generic monospace width); Cascadia Mono +6.6%, DejaVu Sans Mono +9.5% wider — real cross-platform risk, now metric-adjusted (93.8%/91.3%) same technique as --serif."
family:
  - "/: extended — Frontier door added (real org count); rest unchanged"
  - "/frontier: NEW — board leads (K19/K21), then spine, lead-change, capabilities, vendor claims; digit-free fixed copy, all rails [data-derived]-fenced"
  - "/catalog: extended — provider <details> at <=390px (R-D), desktop table + CatalogFilter untouched"
  - "/wiki/<entry> prose: extended — F-K12 lede/facts split; model records w/o prose unchanged (facts-first, R-C)"
  - "/wiki index, /tools, /blog, /tutorials, /impossible-routine: unchanged, because — JV-hier F-hier-1 found the packet's site-wide spine reinstates R8's retired global-chrome error; these are uniform link indexes (R8: rail FORBIDDEN)"
  - "/data, /learn, /colophon: unchanged, because — no packet element or reuse line names them"
expected_delta:
  - {element: "wiki F-K12", evidence_file: "next contact sheet /wiki/concept/ai-winter@390", before: "facts ahead of prose", after: "title, one paragraph, FACTS, rest of prose"}
  - {element: "catalog@390", evidence_file: "next contact sheet /catalog@390", before: "93,963px flat stack (I14)", after: "provider <details>, closed; S22 bounds height <20,000px"}
  - {element: "/frontier", evidence_file: "new capture, all widths/themes (rig gap, RT FM1)", before: "route absent", after: "board (empty per cell, no index data), spine (real knots), lead-change (empty), capabilities (real), vendor claims (real org facts)"}
empty_states:
  - {element: "index columns", source_path: "registry.json + org roster", what_rendered: "'no index published for this window' per cell — checked: no snapshot carries benchmarks.artificial_analysis.*_index"}
  - {element: "lead-change knots", source_path: "data/changes.jsonl", what_rendered: "dotted line + 'No lead change recorded yet.' — checked: zero kind:lead-change rows exist (RT FM3)"}
declined:
  - {item: "site-wide spine on link indexes", cause: "JV-hier F-hier-1 (R8 per-surface class, not global policy) — not built per the finding"}
  - {item: "vendor-claim at model grain (packet's literal path)", cause: "wired at org grain instead — real cited facts exist there today; model-grain join not validated across 495 entries this round"}
  - {item: "gap-clamp re-tuned to 8-day depth", cause: "clamp is real/driven by actual day-gaps; re-tuning against a reader test routed to measure, not fabricated (JV-sys F-sys-1-2)"}
  - {item: "CatalogFilter wired to grouped view", cause: "fence: 'CatalogFilter unchanged' — form is CSS-hidden at <=390 rather than extended"}
  - {item: "no-digit fence on /impossible-routine", cause: "checked, not guessed (plan §11.4 marked GUESS): its deltas aren't [data-derived]-wrapped, would false-fail on its own dates"}
rule_changes:
  - {id: "S14", change: "amended for F-K12 — clause (a) applies only where lede/facts are live-measured stacked; clause (b) loosens to 1.5x viewport with a lede. Falsified both ways."}
  - {id: "S8", change: "retargeted from #catalog-table (now hidden at 390) to .provider-row in an opened .provider-group. Falsified both ways."}
  - {id: "S18", change: "selector fix only — sums .entry-lede+.entry-rest post-split so it measures what its text names. Still honestly FAILING, unchanged in kind."}
  - {id: "S22", change: "new — R-D catalog@390 height/visibility bound. Falsified both ways."}
```

## K21/K22

**K21**: `renderIndexBoard` rows = every `content/wiki/org/*.md` entry (16, editorial, no feed join). Columns = `site.freshness.sources`, iterated not named — a new registry source is a new column with no code change.

**K22 (domain, data-only landing points, confirmed no template edit needed):** /frontier board — one more column, or a `<details>`-per-domain grouping of the same rows (mirrors `renderCatalogGroups`). /frontier spine+capabilities — one more `data-domain` attr per already-generic `<li>`. /catalog — `COLUMNS` array is additive; grouping key in `renderCatalogGroups` is one line to swap. /tools — same grouping pattern as catalog. Wiki entries — one more `doc.data.facts` entry, rendered by the existing generic `renderFacts` loop, zero code change (same mechanism `model_family`/`founded` use today).
