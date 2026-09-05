# RT-CP-UI-001-2-3 — red team on Players Board (anchored re-run, RD-002)

```yaml
id: RT-CP-UI-001-2-3
version: 1
schema: loops/ui-loop/graph/schemas.md#red-team-report
depends_on: [CP-UI-001-2.v3, IR-CP-UI-001-2-2, RT-CP-UI-001-2-2, RD-002]
anchor: RT-CP-UI-001-2-2
```

Ground truth checked read-only in `D:\AddictedtoAI-c2`: `frontier.mjs::vendorClaimFact` reads only
`modelDoc.data.facts`, no org path exists; S22(a) rereads the org corpus independently and its own
falsifier reproduces FM1 on `alibaba-cloud.md` ("Qwen, launched in beta April 2023…") when the
fallback is restored — gate-covered, not just IR-claimed. `data/derived/catalog.json` newest rows
checked live: `x-ai`'s newest is `model/x-ai-grok-4-6`, whose only `source: cited` fact is
`field: vendor_description`, value "SpaceXAI's smartest model with frontier performance on coding,
knowledge work, and STEM" — `CLAIM_FIELD` matches `description`, so this IS one of the board's 4
rendered claims today, verbatim, via `extLink(..., 'model record')`, a label naming neither vendor
nor domain. `openai-gpt-5-6-terra.md`'s `vendor_role` ("The balanced default…") would hit the same
path had it still been newest for OpenAI; it isn't (`gpt-6-astra` supersedes it, no cited fact).
`renderPlayersBoard`'s dominant-note threshold (`share > 0.9`) against the shipped split (4/16 =
25% present) never fires either way, so `CLAIM_PRESENT` ("claimed · unverified") never renders
anywhere on this build — confirmed by reading the constant's two call sites.

## Anchor disposition (FM1–FM3, RD-002's named modes)

**FM1 (content edit in disguise — org fact laundered into a model's claim cell): MITIGATED.**
`firstCitedFact(org)` is gone from the code path; `vendorClaimFact` takes `modelDoc` only. Verified
independently of the IR's own claim: S22(a) re-derives from `content/wiki/org/*.md` directly (not
from the render module) and its falsifier test, when it restores the old fallback, reproduces the
exact defect class on a *different* org (`alibaba-cloud`) than RT-2's NVIDIA finding — the fix is
stated over the corpus, not over one named string, so it does not recur under a different org.

**FM2 (empty-state-reads-as-evidence — zero hatched cells): MITIGATED.** S22(b) measures the
rendered background pattern (not the `.board-hatch` class) at both 1440 and 390 and requires
0 < hatched/total ≤ 0.9, two-sided per its own falsifier-opposite. IR reports 12/96 hatched at 1440,
10/96 at 390; consistent with S22(b)'s pass. The concept's "honest blanks" mechanism now has a live
example a reader or judge can point to.

**FM3 (rot-within-a-week — alphabetical home door): MITIGATED.** `boardExcerpt` now ranks by
`changeRecencyByEntryId(site)` over `site.changes`, the same feed the home page's own lead already
reads. S24 checks 390 reachability AND that the door does not outrank the changed feed (R6), both
directions exercised by its falsifier. Residual: orgs with *no* dated change still fall back to A–Z
(documented, not a defect) — a floor state, not the whole mechanism.

## New grounded modes

```json
{"failure_modes": [
  {"id":"FM-N1","mode":"hype-adjacent copy","scenario":"CLAIM_FIELD (`score|bench|eval|index|throughput|latency|speed|performance|capabilit|claim|role|description|verified|accuracy|swe|agent`) is typed by field NAME, not by whether the value is a quantified claim. It matches marketing/positioning fields identically to benchmark fields: `vendor_description`, `vendor_role`, `tier_role`, `generation_claim` all qualify. Live on the shipped board: x-ai's newest row (`model/x-ai-grok-4-6`, confirmed newest by `created` in catalog.json) has exactly one cited fact, `vendor_description` = \"SpaceXAI's smartest model with frontier performance on coding, knowledge work, and STEM\" — a superlative sentence with no number in it — and it renders verbatim in the VENDOR CLAIM cell, attributed only via `extLink(..., 'model record')`, a label naming neither the vendor nor the source domain. Because the present/absent split is 25/75 (neither >90%), `CLAIM_PRESENT` ('claimed · unverified') never prints anywhere on this build (confirmed: its only reader is the >90% branch) — so this sentence reads with LESS framing as a claim than the pre-RD-002 per-row badge gave it","probability":5,"severity":3,"detectability":4,"mitigation_exists":false,"element":"frontier.mjs vendorClaimFact/CLAIM_FIELD; /frontier board, x-ai/SpaceXAI row"},
  {"id":"FM-N2","mode":"one-sided invariant","scenario":"`vendorClaimFact`'s `find()` returns the FIRST CLAIM_FIELD match in facts-array order, with no ranking between a quantified benchmark and a positioning tagline. Grounded: `openai-gpt-5-6-terra.md` lists `vendor_role` before `capture_the_flag_score`; had this row still been newest for OpenAI, the tagline preempts the number by document position alone. Neither S22 nor S22b asserts anything about WHICH matching fact is chosen when a doc carries more than one — the new gates verify identity, reachability and layout, never claim SELECTION","probability":3,"severity":2,"detectability":3,"mitigation_exists":false,"element":"frontier.mjs vendorClaimFact (find order)"}
]}
```

**What will be wrong about this in a week:** the board will still show at least one row whose
"vendor claim" is an adjective-laden tagline (SpaceXAI's today) at the same weight as another row's
dated, numbered score, with no per-cell framing distinguishing the two — which org draws that row
rotates with `created` timestamps on every rebuild.

**What every other AI news site already shows:** vendor copy dressed as a comparison-table fact,
usually a whole "About" blurb per row. RD-002 fixed the worse version (a fact about the wrong
entity); the field-name filter that replaced FM1 still admits the vendor's own adjectives under the
identical "claim" framing as a cited number, now that the more visible defect is gone.
