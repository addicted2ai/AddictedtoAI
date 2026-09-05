# RT-CP-UI-001-2-1 — red team on Players Board

```yaml
id: RT-CP-UI-001-2-1
version: 1
schema: loops/ui-loop/graph/schemas.md#red-team-report
depends_on: [CP-UI-001-2.v1]
anchor: null
```

## Findings

Ground truth: `data/changes.jsonl` has no `lead-change` kind yet (182 lines,
arrival/release/retirement/annotation only); no `data/derived/frontier.json`
or registry `frontier` block; 21 vendor `cited` facts across 446 model
entries; `public/fonts/` does not exist today, so the self-hosted face has
zero rig history at any width or theme.

```json
{"failure_modes": [
  {"id":"FM1","mode":"payload creep","scenario":"the self-hosted grotesk subset has no byte number pinned anywhere ('a stated byte cap' is asserted, not stated); transfer sits outside R3's JS bound by design but the gates have nothing concrete to check before the build","probability":3,"severity":3,"detectability":3,"mitigation_exists":false,"element":"public/fonts/ subset"},
  {"id":"FM2","mode":"external origin","scenario":"the face and its exact licence terms are filed as a research open_question, not chosen; verify-design's allowlist gate runs on whatever gets committed, so the highest legal/build risk item ships unresolved at design time","probability":3,"severity":4,"detectability":3,"mitigation_exists":true,"element":"public/fonts/ new typeface"},
  {"id":"FM3","mode":"reader-cannot-find","scenario":"the org-to-model join 'relies on wiki feeds maps; unmapped models fall off the board' (own known_risk) - a visitor searching for a model lacking that mapping finds it on /catalog but not on the board that claims to be the whole field on one screen","probability":3,"severity":4,"detectability":3,"mitigation_exists":false,"element":"board rows (organisations)"},
  {"id":"FM4","mode":"relocation-not-resolution","scenario":"hatched stripes replace missing-value noise with a pattern that, at board scale, covers most columns on day one (21 vendor facts; index columns gated on unsettled AA rights) - the honesty signal for one empty cell becomes a dominant texture across the board (the L4 shape)","probability":4,"severity":3,"detectability":4,"mitigation_exists":false,"element":"hatched blank cells, board-wide"},
  {"id":"FM5","mode":"unseen surface","scenario":"the board is the largest new component this round (new grid + new font + new join) and evidence/current has no /frontier capture at any width/theme; the reflow and woff2-subset claims are unverified until a capture exists","probability":4,"severity":4,"detectability":5,"mitigation_exists":true,"element":"/frontier board, all widths/themes"},
  {"id":"FM6","mode":"single-source dependency","scenario":"index-position cells' only fallback is omission; if AA rights are refused the fallback is honest, but the packet's own promise ('saw exactly which cells the site could not fill') then applies to its most distinguishing column","probability":3,"severity":4,"detectability":3,"mitigation_exists":true,"element":"index position cells"},
  {"id":"FM7","mode":"contrast in dark","scenario":"hatched stripes use --rule at 45 degrees as a filled repeating pattern, not the thin border it is presumably tuned for; a pattern read as a deliberate stamp in light mode can read as a rendering glitch in dark if never checked at this density","probability":3,"severity":3,"detectability":4,"mitigation_exists":false,"element":"hatched blank, dark theme"},
  {"id":"FM8","mode":"one-sided invariant","scenario":"'R8 test passes, values tracked across' is asserted, not measured; R7's own addendum shows a cap satisfied on paper while producing dead space when the cap is too generous for mostly-hatched columns","probability":3,"severity":3,"detectability":3,"mitigation_exists":false,"element":"board grid column tokens"},
  {"id":"FM9","mode":"reader-cannot-find","scenario":"catalog@390 folds four fields onto one dense line at the narrowest width; no truncation behaviour is named for a long model name plus four values, the exact overflow class L5 warns full-page captures cannot see","probability":3,"severity":3,"detectability":4,"mitigation_exists":false,"element":"catalog@390 dense rows"},
  {"id":"FM10","mode":"content edit in disguise","scenario":"F-K12's lede-before-facts needs cutting an existing multi-sentence opening to one sentence (sampled: content/wiki/concept/ai-winter.md); no owner is named for that editorial cut","probability":3,"severity":2,"detectability":3,"mitigation_exists":false,"element":"/wiki lede before facts"}
]}
```

**What will be wrong about this in a week:** the board's promise - "saw
exactly which cells the site could not fill" - stays true mostly because most
cells still cannot be filled (21 vendor facts, AA unsettled, incomplete feeds
maps), so honesty and unfinished-looking read identically; a week of
snapshots barely changes that ratio.

**What every other AI news site already shows:** a comparison table with
blanks silently omitted or dashed. This concept's visible, explained absence
is real differentiation, but only if filled cells outnumber hatched ones by
enough margin - currently unmeasured and gated on an unresolved licence
question.
