# DESK-ORDER-001 — what the Frontier needs from the Desk

```yaml
id: DESK-ORDER-001
version: 1
schema: loops/ui-loop/graph/schemas.md#evidence-note
status: SIGNED OFF by the keeper 2026-09-05 (check-in decision 5, K39)
date: 2026-09-05
depends_on: [BRIEF-UI-001.v1, EN-domain-facet.v1, frontier-plan.md, JURY-BRIEF-UI-001, state.md K11 K19 K21 K22 K24 K30]
addressed_to: the AddictedtoAI orchestrator (Desk), on unfreeze
from: ui-loop graph, keeper-approved rulings K21, K22, K24, K30 (2026-09-05)
```

The UI loop built `/frontier` twice and found the same thing both times: the surface's ceiling is
set by data the Desk does not yet produce. This is the order, in priority, each item stated as a
data or spec change with the keeper ruling behind it. Nothing here changes content already written.
Where an item is an OpenSpec change it says so; registry rows are ordinary data changes
(`data/sources/registry.json` note).

## 1. Frontier-flagged editorial records (K30) — OpenSpec: `blog`, `loop`

The Frontier's domain section is driven by scout-flagged, domain-tagged editorial records: the
three most recent per domain, with leaders-by-index secondary where a licensed index exists. Not a
feed, not a ranking.

**Front matter (posts, and anchored notes that qualify):**

```yaml
frontier: true                 # optional; absent = false
frontier_reason: F1 | F2 | F3 | F4 | F5     # required when frontier: true; one of the criteria below
domains: [coding, agents]      # required when frontier: true; ≥1 value from the closed vocabulary (§3)
```

**Criteria (exactly one cited; the scout's "why passed" record shows frontier candidates declined):**

- **F1** a capability shown for the first time, with an artifact anyone can check (executed
  transcript, paper with code, public demo).
- **F2** a lead change on a published index, or a rescoring that moved a leader.
- **F3** a release by a covered organisation of a model it positions as its frontier, or an
  open-weights release matching a covered lab's frontier on a published measure.
- **F4** a verbatim vendor claim by a major player about a new ability, labelled unverified.
- **F5** a material change in access: a frontier model withdrawn, gated, or opened.

Not qualifying: a new checkpoint, a price change, a benchmark post with no new artifact, a tool
release. Test: what every other AI news site already shows does not qualify on its own.

**Scout requirement (loop spec):** the daily sweep always looks for F1–F5 events across all
domains, using the radar feeds in §5 as inputs. **Cap clause (blog spec):** a story flagged
`frontier: true` does not count against the three-candidates-per-day cap; the new-writing budget
share (≤45%) still binds it; the flag must cite its criterion or the candidate fails filing.

**Gate (build):** `frontier: true` without `frontier_reason` in F1–F5 or without ≥1 valid
`domains` value fails the build. **Backfill:** tag the existing posts (15 on 2026-09-05) once,
editorially; the section is then not empty on day one.

**Display contract (UI, next brief):** per domain, the three most recent flagged records by
`anchor.date`, each with kind, title verbatim, source, date; a domain with none shows its last dated
record and its age ("nothing flagged in N days"), never feed arrivals as filler. Optional muted
machine line per domain: catalog arrivals this week (count from `changes.jsonl`), visibly separate.

## 2. Board membership and coverage (K21)

A player is on the board because the site covers it; feeds fill cells. The board today has 16
organisation entries; 34 catalog providers have no entry and never surface. Order: widen
`content/wiki/org/` coverage far beyond API-model vendors — labs without an API product,
open-weights groups, image/video/audio, robotics, research groups. Each new org entry needs its
`feeds` map (the join the board relies on) or it renders an all-blank row (allowed, honest). Each org
entry should also list its PRODUCT-BRAND domains as aliases (e.g. Moonshot's `kimi.ai`): the board
attributes a vendor claim only when the cited source's registrable domain is the vendor's own, so a
brand domain missing from the aliases makes a real vendor claim render as a blank (RT FM-N6).

## 3. The `domain` facet (K22) — OpenSpec: wiki schema, directory

Closed, small, set-valued, optional on models, orgs, tools, techniques and frontier indices.
Research and recommendation in `EN-domain-facet.md` (Opus, 2026-09-05): nine values —
`text, coding, agents, image, video, audio, research, science-math, robotics` — chosen over
modality-only and capability-only alternatives because it is the only vocabulary the data on disk
seeds (measured 2026-09-05 excluding `text`, which K38 removed: 265 of 431 feed rows take ≥1 modality domain and 166 take none and are correctly general/untagged; 181 carry an AA index for coding/agents). **The three
open questions are answered:** "general" is the UNMARKED default and `text` is not a tag (keeper,
K38); no Artificial Analysis value renders until republication rights are cleared (K24/K34, beads
addictedtoai-ego8 and -c563); domain sections order by domain id, a pure function of names per the
directory spec (K34). The facet vocabulary is therefore eight tagged values: `coding, agents,
image, video, audio, research, science-math, robotics`, with untagged = general. `domain` and tool
`category` are different axes: 28 of 35 tool listings map to no domain, so it is optional on tools.
Build gate: any `domains` value outside the vocabulary fails.

## 4. Independent indices and claims (K24, plan §1/§5.3)

- **Index columns appear only when a registry index exists.** Register each published index as a
  metric with `publisher`, `direction`, `label`, terms-check date. Present today in the feed:
  `benchmarks.artificial_analysis.{intelligence,coding,agentic}_index` on 181 rows;
  `benchmarks.design_arena[]` (arena, category, elo, rank, win_rate) on 165 rows across 25
  arena/category pairs. Neither publisher's republication terms are verified (AA terms URL 404'd on
  2026-09-05; Design Arena unchecked). Settle rights before any index value renders; until then the
  board carries catalog-derived columns (K24) and the domain section shows records, not positions.
- **Lead-change event kind.** `changes.jsonl` has arrival/release/field_change/retirement/annotation
  and no `lead-change`; the plan's `data/derived/frontier.json` does not exist. Add both per plan
  §2.3 (arrival vs rescoring distinguished).
- **Vendor-claim record.** Both finalist builds rendered founding dates as "claimed · unverified"
  because the only structure available was "any cited fact". Define a claim record: verbatim quote,
  source URL, accessed date, field/ability named, `verified: false | {by, url, date}`. 21 cited facts
  exist across 446 model entries today; the claim cell renders the honest empty state until these
  exist.

## 5. Radar feeds for the scout (registry rows; ordinary data changes)

Inputs to the scout, never displayed raw: Hugging Face Hub (open weights; licence and modality
metadata per model), covered organisations' blogs and release notes (RSS; the source of verbatim
claims), arXiv listings for the research domain, GitHub releases for covered tools. Each row records
robots/terms and a last-verified date as the registry requires.

## 6. Sequence

1. §1 fields + criteria + gate, and the backfill (unblocks the UI's next brief immediately).
2. §3 vocabulary after the keeper's three answers; gate on it.
3. §5 radar feeds registered.
4. §4 claim record and lead-change kind; rights checks; indices registered only when rights clear.
5. §2 coverage widening, ongoing.

The UI loop consumes these as data; the templates already iterate columns and rows from arrays
(IR-CP-UI-001-2-1 § K22), so none of this requires a template change to render.

## Appendix — proposed `DIRECTIVES.md` lines (keeper pastes or approves; K6: this loop does not write that file)

`DIRECTIVES.md` is the Desk's highest-priority work source, one typed line per job (`specs/loop`);
`machinery` is the type for the site's own code and the loop's scripts and is capped at 10% of the
budget. The spec changes (§1 fields/criteria/cap clause, §3 wiki schema) are OpenSpec changes and go
through the Desk's change process first; the lines below are the jobs that follow.

```
- machinery: implement DESK-ORDER-001 §1 — post front matter `frontier`/`frontier_reason` (F1–F5)/`domains`, the build gate (flag without reason or valid domain fails), and the scout's F1–F5 sweep + cap exemption once the blog/loop OpenSpec change lands; spec: loops/ui-loop/graph/knowledge/DESK-ORDER-001.md §1
- verify: backfill `frontier`/`frontier_reason`/`domains` on the existing blog posts against DESK-ORDER-001 §1 criteria; record declines in the review
- machinery: register the scout's radar feeds (Hugging Face Hub, covered orgs' release RSS, arXiv, GitHub releases) as registry rows with robots/terms and last-verified dates; DESK-ORDER-001 §5
- machinery: add `lead-change` (arrival vs rescoring) to changes.jsonl and derive data/derived/frontier.json per frontier-plan §2.3; DESK-ORDER-001 §4
- machinery: define the vendor-claim record (verbatim, source, accessed, ability named, verified{by,url,date}) and migrate the 21 cited facts that are claims; DESK-ORDER-001 §4
- verify: check Artificial Analysis and Design Arena republication terms; record the outcome in the registry; no index value renders until cleared; DESK-ORDER-001 §4
- entry: org entries for the 34 catalog providers with no wiki entry (one line per org when filed), each with its `feeds` map; DESK-ORDER-001 §2
```

## Amendments from the handoff (2026-09-05, K44; orchestrator's questions, ui-loop's answers)

- **F2 and K24.** An F2 record may describe a publisher's rescoring qualitatively — publisher, index
  and version, date, direction, coverage change — with no index value, ratio, rank or per-model score
  in its copy; the publisher's own changelog is the anchor. Artificial Analysis's 2026-09-04 v4.2
  rebase qualifies.
- **§3 implementation line** (was missing). Seeded domain values are machine-maintained and sit
  beside `timeline` in `MECHANICAL_FRONT_MATTER_KEYS` **under a key of their own (`domains_seeded`),
  never the literal key `domains`**: that list is matched by key NAME across every content kind
  (`lib/review-hash.mjs:71, 99-102`), so exempting `domains` would silently remove a POST's editorial
  `domains` from the reviewed surface and delete 9c9t's review requirement with no error anywhere
  (found by the 9c9t author, 2026-09-05). Editorial assignments and overrides are the `domains` field
  and go through review. One field must not carry two freshness regimes; one key name must not carry
  two kinds' regimes either — a key-name filter is not a per-kind rule (the same lesson as "a
  field-name test is not a source test", implementer ledger #10).
- **§4 is its own OpenSpec change**, drafted by an interpret line before its machinery lines. The
  vendor-claim record lives BESIDE the entry (its own clock; a later verification must not dirty
  prose), carries the source URL host (for the board's registrable-domain vendor test, S22(e)), and
  `verified` is tri-state: absent / false / {by, url, date}.
- **DIRECTIVES repairs** by the orchestrator (67cd566) accepted: drafting line for 9c9t (livelock
  otherwise), domain line carries its answers inline, one org entry per line with the backlog on 2ok0.

## Amendments from the 1hjf draft review (2026-09-05)

- **Seeding is APPEND-ONLY** (ratified under K40 as K47; the 1hjf author's finding): a seeded domain
  value is never removed by a later run whose signal is absent — the AA v4.2 rebase dropped
  `agentic_index` presence 166→99 and `intelligence_index` 164→52 overnight while `coding_index` held
  181→181, so a recomputing rule would have silently un-tagged 67 entries with no editorial decision.
  Removal is editorial (`domains_excluded`). Recommended, author's call: when a seeding signal
  disappears for an entry, the Pulse writes a `field_change` record so the disappearance is visible.
- **Fields**: `domains_seeded` (machine, append-only, in `MECHANICAL_FRONT_MATTER_KEYS`), `domains`
  (editorial additions), `domains_excluded` (editorial removals); rendered set = (seeded ∪ domains) −
  excluded; a gate fails an excluded value that is in neither seeded nor domains.
- **Kinds**: the facet is optional on EVERY wiki kind (widened from §3's list; a `benchmark` entry
  for FrontierMath is `science-math` by any reading; one `entrySchema` for all kinds means restricting
  is more machinery, not less). Both tool sets carry it: directory listings and wiki tool entries.
- **Ordering**: MODIFYING `directory`'s "No placement is ever sold" to add `domain` to the pure-function
  ordering list is accepted (superset, 8 of 9 units byte-identical).
- Counts: 544 wiki entries (545 files incl. the README); 14 blog posts (15 files incl. the README).
