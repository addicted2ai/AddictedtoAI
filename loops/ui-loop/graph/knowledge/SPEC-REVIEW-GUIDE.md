# SPEC-REVIEW-GUIDE — why each Desk-order requirement exists (for reviewing the three OpenSpec drafts)

```yaml
id: SPEC-REVIEW-GUIDE
version: 1
schema: loops/ui-loop/graph/schemas.md#evidence-note
date: 2026-09-05
purpose: keeper instruction via the orchestrator (K45) — "run the specs by the other session before finalizing, since it has additional context to their origin"; this file is that context written down so it survives compaction and can be read by whoever reviews
reviews: addictedtoai-9c9t (blog/loop), addictedtoai-1hjf (wiki schema/directory), the §4 change (claim record + lead-change)
```

Review test per requirement, in this order: (1) does it say what the round decided; (2) has it kept
the reason that makes it survive an implementer; (3) does it warn against what a finalist build
already got wrong. Column 3 is the implementer ledger (`implementer-ledger.md`); a spec that does
not encode a ledger row re-teaches it at full price.

## 9c9t — frontier-flagged editorial records (DESK-ORDER-001 §1)

| Requirement | What was decided | Why (origin) | Ledger / build lesson |
|---|---|---|---|
| Records, not rankings, drive the domain section | K30 | Keeper first asked for "top 3 models per domain"; the site's rules forbid stating a rank as its own claim (directory spec; plan §5.3), the only ranking data has unverified rights, and a ranking table "has no motion in it" against K10's pace. Keeper then proposed timestamped news and releases; saturation worry led to editorial curation. | Dated Ledger's board rendered feeds as if they were indices (ledger #5); Players Board's board with no data behind it read as a second catalog (jury). |
| `frontier: true` requires `frontier_reason` ∈ F1–F5; `domains` OPTIONAL, absent = general (the ≥1 bar was withdrawn by K46 / BLIND-002) | K30, tightened in discussion; K46 | The cap exemption is a loophole unless the flag has a bar (the criterion); the ≥1-domain bar was written while `text` still carried general stories and would have made a court filing, a regulator's action, a licence term or a system card unflaggable. | Do not resurrect the ≥1 bar (pitfall 14). |
| F1–F5 criteria + "not qualifying" list | keeper agreed the draft verbatim ("I agree with everything you just said") | Red team's standing question "what does every other AI news site already show" is the test; a new checkpoint, price change, benchmark post with no artifact, tool release do not qualify. | — |
| Flagged story exempt from 3/day cap but NOT from the ≤45% writing share | keeper + orchestrator | Exemption without a binding budget invites flagging everything. | — |
| Feeds (HF, GH, RSS, arXiv) are the scout's radar, never display | K30 | Keeper: "they would over saturate immediately without some kind of filtering." | — |
| Quiet domain shows last record + age, never feed filler | K30 | Red team's rot-within-a-week mode; "empty-state-reads-as-evidence". | Dated Ledger's 32 identical empty cells read as broken (JV-sys v2). |
| One date meaning per kind, labelled | discussion | release = pubDate, arrival = catalog listing date, claim = accessed; mixing silently is the rot mode. | — |
| News titles verbatim, attributed; hype check on fixed copy only | BRIEF anti-requirements | Release notes are hype by trade. | — |
| F2 may be qualitative under K24 (no values) | K44 | AA v4.2 rebase 2026-09-04 is the year's largest F2 event; K24 bars values, not the publisher's act. Medians/quartiles stay in the review record. | — |
| Post keys are EDITORIAL, go through review; 15-post backfill is the correct cost | K44 | Review hash binds front matter minus `timeline`. | — |

## 1hjf — the domain facet (DESK-ORDER-001 §3)

| Requirement | What was decided | Why (origin) | Ledger / build lesson |
|---|---|---|---|
| Facet, not hierarchy; many-to-many; alongside kind and category | K22 | Keeper: "a new meta type of 'domain' … to tie things together (tools, frontier, wiki)"; tool `category` = "the job it is for" (directory spec) is a different axis — 28 of 35 listings map to no domain. | — |
| Closed vocabulary: coding, agents, image, video, audio, research, science-math, robotics; "general" unmarked | K38 (+ EN-domain-facet §1/§5, option B) | `text` on 431/431 rows discriminates nothing; modality-only cannot express coding/agents/research; capability-only discards free modality tags. | — |
| Seeded values machine-maintained under their OWN key `domains_seeded` (beside `timeline`); editorial `domains` via review | K44 + 9c9t author's finding | 545 wiki files; one field must not carry two regimes; and `MECHANICAL_FRONT_MATTER_KEYS` is matched by key name across all kinds, so exempting the literal key `domains` would silently un-review posts' editorial domains. | A key-name filter is not a per-kind rule — same shape as ledger #10 (field-name test ≠ source test). |
| Build gate: value outside vocabulary fails | K22 | Closed list keeps the directory spec's pure-function ordering honest. | — |
| Domain sections order by domain id | K34 (BLIND-001) | Directory spec: "no placement is ever sold". | — |
| The UI already absorbs a domain as data, no template edit | K22, both IRs | Both finalists documented data-only landing points (board columns, catalog COLUMNS, tools grouping, facts rows). | — |

## §4 — vendor-claim record and lead-change kind (DESK-ORDER-001 §4)

| Requirement | What was decided | Why (origin) | Ledger / build lesson |
|---|---|---|---|
| A claim record distinct from "any cited fact" | §4, K44 | BOTH finalists independently rendered org founding dates and founders under "claimed · unverified" because the only structure was "cited fact" (ledger #2, #4). | The single most repeated defect of the run. |
| Record lives BESIDE the entry | K44 | Claim ages on the source's clock; a later verification must not dirty prose (review hash). | — |
| Fields: verbatim quote, source URL + host, accessed date, ability/field named, `verified` tri-state (absent / false / {by,url,date}) | §4, K44 | Board renders "not verified" for false only; host needed for the vendor-sourced test. | — |
| Only vendor-sourced claims render as vendor claims (registrable domain = vendor's own or alias) | RD-004/RD-005 | Opus allow-list admitted OpenRouter's measured throughput and llm-releases.com analyses as "vendor claims" (ledger #10, RT FM-N3); label-token host match was spoofable (FM-N5). | Field-name tests are not source tests. |
| Org entries record the hosts they publish from, brand domains included, in `publishes_from` (K48; was "as aliases") | §2 amendment, §4 draft | Missing brand domain renders a real claim as an honest-looking blank (RT FM-N6). | — |
| Claims labelled unverified visibly, attributed at the row, vendor name first | BRIEF R-B; RD-003/RD-005 | Chip removal left "unverified" only in a column header (F-sys-3-1); the one-line clamp truncated the attribution (F-sys-5-1). | Label and attribution must survive the layout. |
| `lead-change` kind distinguishes arrival vs rescoring; `frontier.json` derived | plan §2.3 | "A leader can lose the lead without anything shipping" (plan §1). | Both finalists' lead-change element was an empty state on day one. |
| Index values render only with a registry index AND cleared rights | K24, K34 | AA terms URL 404'd; Design Arena unchecked (beads ego8, c563). | Dated Ledger's board hard-wired its empty state (ledger #6): the renderer must LOOK UP, then collapse. |
