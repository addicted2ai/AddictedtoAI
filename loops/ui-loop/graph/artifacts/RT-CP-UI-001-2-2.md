# RT-CP-UI-001-2-2 — red team on Players Board (built, round 2)

```yaml
id: RT-CP-UI-001-2-2
version: 1
schema: loops/ui-loop/graph/schemas.md#red-team-report
depends_on: [CP-UI-001-2.v2, IR-CP-UI-001-2-1, RT-CP-UI-001-2-1]
anchor: RT-CP-UI-001-2-1
```

Ground truth checked read-only in `D:\AddictedtoAI-c2`: `frontier.mjs` vendor-claim cell
(`firstCitedFact(modelDoc) ?? firstCitedFact(org)`); `nvidia-nemotron-3-5-lightning.md` has
no `cited` fact (grep), `org/nvidia.md` does; `site.mjs:105` sorts `entries` by
`display_name.localeCompare` (alphabetical, not recency); `content/wiki/org/{deepseek,z-ai}.md`
carry non-Latin aliases (`深度求索`, `智谱`) rendered via `.alias{font-family:var(--mono)}`
(globals.css:1827), the new Space Grotesk Latin subset; `manifest.json` captured only
`/wiki/concept/ai-winter` for the wiki-entry template, never the org pages;
`frontier--{light,dark}--1440.png` show all 16 rows fully populated, zero hatched cells.

## Anchor disposition
FM1/FM2 (payload/licence) MITIGATED: OFL, licence filed, measured 10,860B/10,300B under
cap. FM3 (join, reader-cannot-find) MITIGATED by K21 (editorial; every org always renders).
FM5 (unseen surface) MITIGATED: 6 frontier captures exist. FM6 (single-source) MITIGATED:
column declined, not shipped. FM7 (dark contrast) MITIGATED: theme-token colours, clean in
both capture themes. FM8 (dead space) MITIGATED: board fills edge-to-edge, no dead track.
FM10 (lede cut) MITIGATED: keeper-ruled (K12), gate-covered (S13/S14/S18, 19/19). FM4
(hatch dominates the board) DID NOT MATERIALIZE — the opposite did, see FM2 below.

```json
{"failure_modes": [
  {"id":"FM1","mode":"content edit in disguise","scenario":"the vendor-claim cell falls back from the model's own cited fact to the ORG's cited fact when the model has none (frontier.mjs: `firstCitedFact(modelDoc) ?? firstCitedFact(org)`) — undocumented in the packet, whose vendor-claim data_source names only content/wiki/model/*.md. Live: NVIDIA's Nemotron 3.5 Lightning has no cited fact, so the cell shows org/nvidia.md's company-founding fact ('5 April 1993, by Jensen Huang, Chris Malachowsky') labelled 'claimed \u00b7 unverified' in the model's own row, as if it were a claim about the model","probability":5,"severity":4,"detectability":3,"mitigation_exists":false,"element":"board vendor-claim cell, NVIDIA/Anthropic/Cohere/Tencent rows"},
  {"id":"FM2","mode":"empty-state-reads-as-evidence","scenario":"the concept's entire bet is 'a board full of honest blanks is more persuasive than a page full of numbers'; the captured board (all 16 orgs \u00d7 4 non-lead columns) renders ZERO hatched cells at 1440 in either theme. Partly because FM1 launders org trivia into the one column most likely to be empty. The reader promise ('saw exactly which cells the site could not fill') and the hatch styling ship inert on day one \u2014 nothing exercises the mechanism a judge or reader would see","probability":4,"severity":4,"detectability":5,"mitigation_exists":false,"element":"/frontier board, all captured rows"},
  {"id":"FM3","mode":"rot-within-a-week","scenario":"the home Frontier door ('Today's shape' aside) is `boardExcerpt(orgs,...,3)` over `site.entries` sorted `display_name.localeCompare` (site.mjs:105) \u2014 alphabetical, not recency or activity. It shows Alibaba Cloud/Anthropic/Cohere today and will show the identical three organisations every day this org list is unchanged, regardless of what the tracked feeds actually moved on","probability":5,"severity":3,"detectability":4,"mitigation_exists":false,"element":"home '.home-side' Frontier door"},
  {"id":"FM4","mode":"unseen surface","scenario":"Space Grotesk is subset to the Latin range 'labels/dates/prices use'; two org wiki entries commit non-Latin aliases rendered in that exact font (`.alias{font-family:var(--mono)}`) \u2014 deepseek.md's '\u6df1\u5ea6\u6c42\u7d22', z-ai.md's '\u667a\u8c31'. manifest.json's wiki-entry capture is /wiki/concept/ai-winter only; neither org page was ever rendered by the rig, so a silent fallback-font mismatch on exactly the two pages most likely to trigger it is invisible to every gate","probability":3,"severity":2,"detectability":5,"mitigation_exists":false,"element":"/wiki/org/deepseek, /wiki/org/z-ai .entry-aliases"},
  {"id":"FM5","mode":"one-sided invariant","scenario":"the lead-change strip's empty state ('no lead change recorded yet') is asserted as honest per RT-1's ground truth (changes.jsonl still carries no lead-change kind, unchanged this round) \u2014 but the strip has never rendered anything BUT this state, in any round, on any capture; the non-empty branch (5 items, dated) is dead code with zero live coverage, an invariant tested from only the side that always passes","probability":3,"severity":2,"detectability":4,"mitigation_exists":false,"element":"'Last recorded lead change' strip"}
]}
```

**What will be wrong about this in a week:** the lead-change strip still reads "no lead
change recorded yet" (no producer for that data exists), the home door still names the
same three alphabetically-first organisations regardless of what actually moved, and the
board's honesty mechanism (the hatch) still has no live example to point to \u2014 the
things a week of real feed churn would normally expose are exactly the things this build
has frozen out of scope this round.

**What every other AI news site already shows:** a comparison grid where a missing figure
is quietly backfilled with adjacent-but-irrelevant company trivia (a founding date, a
headquarters, an "about the company" line) so every cell looks occupied. FM1 means Players
Board does this too, in the one column pitched as its point of differentiation \u2014 the
zero-hatch board (FM2) currently reads exactly like the incumbents it was built to be
unlike.
