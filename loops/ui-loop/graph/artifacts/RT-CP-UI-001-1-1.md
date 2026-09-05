# RT-CP-UI-001-1-1 — red team on Dated Ledger

```yaml
id: RT-CP-UI-001-1-1
version: 1
schema: loops/ui-loop/graph/schemas.md#red-team-report
depends_on: [CP-UI-001-1.v1]
anchor: null
```

## Findings

Grounded checks: `data/changes.jsonl` (182 lines) has kinds
`arrival|release|retirement|annotation` only, zero `lead-change` yet
(`pulse/lib/frontier.mjs`/`frontier.json`/registry `frontier` block are plan,
not built). 21 `source: cited` vendor facts across 446 model entries.
`evidence/current/` has no `/frontier` capture at any width/theme.

```json
{"failure_modes": [
  {"id":"FM1","mode":"unseen surface","scenario":"/frontier has zero rig captures at any width/theme; ember state-flip colour and mono date face on a real snapshot are unverified","probability":5,"severity":3,"detectability":5,"mitigation_exists":true,"element":"/frontier (new route)"},
  {"id":"FM2","mode":"single-source dependency","scenario":"index-columns' only source for 'who leads' is the AA block; republication rights unsettled (review-frontier.md §6.1); if refused, every column collapses on the flagship route","probability":3,"severity":5,"detectability":4,"mitigation_exists":true,"element":"index columns"},
  {"id":"FM3","mode":"empty-state-reads-as-evidence","scenario":"lead-change knots cite changes.jsonl, which has zero such rows today; day-one every knot reads identically to the vendor-claim absence, so 'nothing happened yet' and 'untracked' look the same","probability":4,"severity":2,"detectability":4,"mitigation_exists":true,"element":"lead-change knots"},
  {"id":"FM4","mode":"rot-within-a-week","scenario":"review-frontier.md (a) measured the eligible count moving 321-323 across 8 days with no authored sentence; nothing stops a future editor typing a count into fixed spine labels, and no census check sees a .tsx file","probability":2,"severity":4,"detectability":5,"mitigation_exists":false,"element":"/frontier fixed copy"},
  {"id":"FM5","mode":"reader-cannot-find","scenario":"catalog@390 folds rows into details per provider; a searcher must know the provider, open it, then Ctrl-F within; no fallback named for engines that don't search collapsed content","probability":2,"severity":3,"detectability":3,"mitigation_exists":false,"element":"catalog@390 provider groups"},
  {"id":"FM6","mode":"one-sided invariant","scenario":"spacing clamp (1-8 row heights) bounds both sides but is unmeasured; at 8-day depth almost every gap saturates the low clamp, so the invariant holds while cadence-as-spacing, the thing it protects, is invisible (the L4 shape)","probability":4,"severity":3,"detectability":4,"mitigation_exists":false,"element":"time-scaled spine spacing"},
  {"id":"FM7","mode":"theme leak","scenario":"--ember is reserved for rare state flips; if its dark value was tuned only for existing sparse uses and never re-checked against a spine knot on the mono date face, contrast may be validated in one theme only","probability":2,"severity":3,"detectability":4,"mitigation_exists":false,"element":"ember knots, dark theme"},
  {"id":"FM8","mode":"unlabelled claim","scenario":"vendor-claim cell is an ember-outlined tag plus text; a skimming reader may register only the outline not the word, so a quoted claim can still read as the site's own once ported beside derived facts on /wiki","probability":2,"severity":3,"detectability":3,"mitigation_exists":true,"element":"vendor-claim cell"},
  {"id":"FM9","mode":"relocation-not-resolution","scenario":"S18's dead column is resolved by sharing the spine track between facts and timeline; on the many entries with no timeline, the shared track is empty just as often - the seam moves, the space returns","probability":3,"severity":3,"detectability":3,"mitigation_exists":false,"element":"/wiki facts+timeline shared track"},
  {"id":"FM10","mode":"content edit in disguise","scenario":"F-K12's 'one sentence' before facts requires cutting an existing multi-sentence opening (sampled: content/wiki/concept/ai-winter.md); the editorial cut has no named owner or review step","probability":3,"severity":2,"detectability":3,"mitigation_exists":false,"element":"/wiki lede extraction"}
]}
```

**What will be wrong about this in a week:** the spine stays sparse - 8 days
of history barely moves the clamp this packet chose - so the concept's whole
bet (cadence read through spacing, before any label) is not yet legible; day
7 looks like day 0.

**What every other AI news site already shows:** a leaderboard or changelog,
usually both, leaderboard first. This concept deliberately withholds ranking,
which is real differentiation, but the packet should defend that choice more
than `reader_walks_away_with` currently does.
