# RT-CP-UI-001-3-1 — red team on Proof Rail

```yaml
id: RT-CP-UI-001-3-1
version: 1
schema: loops/ui-loop/graph/schemas.md#red-team-report
depends_on: [CP-UI-001-3.v1]
anchor: null
```

## Findings

Ground truth: `content/deltas/` holds 28 files total (incl. README), so the
proof rail - the lead element of the flagship route - draws on roughly 27
real pairs plus any joined tutorial/blog note; `data/changes.jsonl` has no
`lead-change` kind yet; `:has()` is the only mechanism named for the catalog
field chooser, with no capture proving the no-`:has()` fallback renders
sanely.

```json
{"failure_modes": [
  {"id":"FM1","mode":"one-sided invariant","scenario":"R-B names 'a running board of the major players and their current frontier model(s)' as the keeper's shape for /frontier; this concept inverts that to a trailing ledger and files it as a keeper open_question rather than resolving it - if unruled before the build, the flagship may not satisfy the requirement it is built against","probability":3,"severity":5,"detectability":2,"mitigation_exists":true,"element":"leaders ledger vs R-B"},
  {"id":"FM2","mode":"reader-cannot-find","scenario":"the field chooser hides columns by default; a visitor arriving on a deep link for a specific field (e.g. context window) sees a truncated line missing exactly that field, with no cue that a checkbox fieldset below reveals it","probability":3,"severity":4,"detectability":3,"mitigation_exists":false,"element":"catalog@390 field chooser"},
  {"id":"FM3","mode":"unseen surface","scenario":":has() support forks two structurally different renders of the same page; any rig capture shows only one; 'reflow still holds' for the fallback is claimed but only verified against overflow, not sane rendering","probability":3,"severity":3,"detectability":5,"mitigation_exists":true,"element":"catalog@390, :has()-absent case"},
  {"id":"FM4","mode":"single-source dependency","scenario":"the demoted leaders ledger is still the only element with index-position data, sole-sourced to the AA-gated feed; demoting does not remove the dependency, and an AA refusal turns it into boilerplate under a rail that already names no leader by rank","probability":3,"severity":3,"detectability":4,"mitigation_exists":true,"element":"leaders ledger (trailing)"},
  {"id":"FM5","mode":"empty-state-reads-as-evidence","scenario":"the proof rail is the lead element and the whole bet; with 28 files total in content/deltas, the rail may render only a handful of pairs above the fold - thin in the hero slot reads as 'not much has happened' rather than an honest count","probability":3,"severity":4,"detectability":3,"mitigation_exists":false,"element":"proof rail (lead)"},
  {"id":"FM6","mode":"rot-within-a-week","scenario":"the rail heading and criterion line are digit-free today per fence; the likely regression is a future editor adding a count ('N proofs this month') to the heading, unflagged by any check on a .tsx file","probability":2,"severity":3,"detectability":5,"mitigation_exists":false,"element":"proof rail heading, future edits"},
  {"id":"FM7","mode":"hype-adjacent copy","scenario":"the rail's framing ('what became possible') sits close to the hype lexicon's spirit while avoiding the literal banned words; a heading drafted later under pressure ('astonishing pace of proof') would violate the anti-requirement while reading as natural copy","probability":2,"severity":3,"detectability":3,"mitigation_exists":false,"element":"rail heading / criterion line"},
  {"id":"FM8","mode":"contrast in dark","scenario":"the two-ink rule (ember/accent) is the only colour system on the signature motif, repeated at large type on /frontier; if either token's dark value was validated only at the current small pair-block scale, a regression appears exactly where the concept is proudest","probability":2,"severity":3,"detectability":4,"mitigation_exists":false,"element":"pair motif, dark theme, large type"},
  {"id":"FM9","mode":"relocation-not-resolution","scenario":"S18's dead column is resolved by facts spanning the measure after a timeline block; on the likely-more-common no-timeline entries, the block is omitted and facts sit exactly where the dead column was, minus the border - the space returns","probability":3,"severity":2,"detectability":3,"mitigation_exists":false,"element":"/wiki timeline+facts, no-timeline case"},
  {"id":"FM10","mode":"content edit in disguise","scenario":"lede-timeline-facts needs a one-sentence cut from existing multi-sentence openings (sampled: content/wiki/concept/ai-winter.md); it also foregrounds timeline events as narrative between lede and facts, changing what the page appears to assert first with no words edited","probability":3,"severity":2,"detectability":3,"mitigation_exists":false,"element":"/wiki lede+timeline+facts reorder"}
]}
```

**What will be wrong about this in a week:** the rail stays thin - proof
pairs and executed tutorials accrue at editorial rate, not daily-snapshot
rate - while the demoted leaders ledger below it changes every day; the least
dynamic part of the page holds the most prominent position.

**What every other AI news site already shows:** rankings and release feeds,
rarely a dated before/after capability pair with sources at both ends. Real
differentiation, but it may not visually match K11's own language ("a
running board of the major players"), and that gap is filed as a question,
not resolved.
