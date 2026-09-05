# RT-CP-UI-001-4-1 — red team on Provenance Gutter

```yaml
id: RT-CP-UI-001-4-1
version: 1
schema: loops/ui-loop/graph/schemas.md#red-team-report
depends_on: [CP-UI-001-4.v1]
anchor: null
```

## Findings

Ground truth: only 21 `source: cited` vendor facts exist across 446 model
entries - the "claimed" band is near-empty, not merely "empty on day one" as
its own known_risk states; `data/changes.jsonl` has no `lead-change` kind
yet; no `data/derived/frontier.json` or registry `frontier` block exists
today.

```json
{"failure_modes": [
  {"id":"FM1","mode":"contrast in dark","scenario":"own known_risk names it directly: three-colour glyph system risks contrast for --muted in dark; --muted is normally tuned to sit quietly against paper, and here it becomes one of three load-bearing distinguishing colours on every gutter glyph, every template","probability":4,"severity":4,"detectability":4,"mitigation_exists":false,"element":"provenance glyph, --muted, dark theme"},
  {"id":"FM2","mode":"reader-cannot-find","scenario":"a paragraph with no fact carries an empty gutter; on long prose (sampled: content/wiki/concept/ai-winter.md runs many unstamped paragraphs) the gutter is empty most of the page, so scanning for 'is this sourced' has no anchor across a long scroll","probability":3,"severity":3,"detectability":3,"mitigation_exists":false,"element":"gutter, long unstamped prose"},
  {"id":"FM3","mode":"unlabelled claim","scenario":"the claimed band is honest, but with 21 cited facts across 446 entries its real content is dominated by its own empty-state line far more often than by an actual glyph+claim pair - the one place the glyph system would prove itself at scale is mostly fallback text","probability":3,"severity":3,"detectability":3,"mitigation_exists":true,"element":"frontier band - claimed"},
  {"id":"FM4","mode":"single-source dependency","scenario":"the indexed band is the AA-gated feed, framed as one of three co-equal bands a reader compares as a rigor signal; an AA refusal that empties it changes the apparent balance of the whole flagship's central device, not just one column","probability":3,"severity":4,"detectability":4,"mitigation_exists":true,"element":"frontier band - indexed"},
  {"id":"FM5","mode":"unseen surface","scenario":"the gutter is proposed on every template (7 surface classes) - the widest footprint of the four concepts - yet no capture exists at any width/theme on any of them; a narrow failure on one template (e.g. /learn's existing ladder, its own R13 breakpoint) would not be caught until all are captured","probability":4,"severity":4,"detectability":5,"mitigation_exists":true,"element":"gutter, all seven surfaces"},
  {"id":"FM6","mode":"relocation-not-resolution","scenario":"own known_risk: a stamp on every paragraph can read as noise on long entries - the current unlabelled-claim defect is resolved by taxing every paragraph with a glyph regardless of whether it carries a claim, the L4 shape of a defect traded for an ambient page-wide cost","probability":3,"severity":3,"detectability":3,"mitigation_exists":false,"element":"gutter on unstamped paragraphs"},
  {"id":"FM7","mode":"payload creep","scenario":"'glyphs under one kilobyte total' does not say whether that covers shared definitions only or markup repeated at every stamped item across seven surface classes; inline SVG repeated hundreds of times per long index page differs sharply from a shared CSS mask","probability":2,"severity":2,"detectability":3,"mitigation_exists":false,"element":"glyph markup, repeated instances"},
  {"id":"FM8","mode":"rot-within-a-week","scenario":"the coverage census ('how many cells each band could fill, printed') sits closest of any element in this round to the literal digit-run review-frontier.md (a) warns about (321-323 movement in 8 days); the fence names no render module that enforces the [data-derived] boundary for it","probability":3,"severity":4,"detectability":4,"mitigation_exists":true,"element":"coverage census"},
  {"id":"FM9","mode":"one-sided invariant","scenario":"R13 already caps a template at two declared grid tracks; this concept proposes the gutter as a third rail on every template including ones already using both, and until the keeper rules, nothing stops it shipping as an ad-hoc addition that looks like a rail without satisfying R13's actual constraint","probability":3,"severity":3,"detectability":3,"mitigation_exists":true,"element":"gutter vs R13 track discipline"},
  {"id":"FM10","mode":"content edit in disguise","scenario":"F-K12's lede cut applies here too, plus this concept decides per paragraph whether a glyph is warranted - an editorial judgment call not named as reviewed by anyone","probability":3,"severity":2,"detectability":3,"mitigation_exists":false,"element":"per-paragraph glyph placement"}
]}
```

**What will be wrong about this in a week:** the claimed band and most
paragraph gutters stay near-empty (21 cited facts site-wide, most prose
unstamped); the device meant to make rigor legible at a glance spends most of
its area on absence, and that ratio does not move on editorial timescales.

**What every other AI news site already shows:** confidence conveyed by tone
and polish, never a literal per-fact provenance stamp. The most structurally
different bet of the four, and also the one least demonstrated today: no
capture exists, its proving band is thinnest, and the R13 gutter-as-rail
ruling has not happened.
