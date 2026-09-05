# RT-CP-UI-001-2-5 — red team on Players Board (anchored re-run, RD-004)

```yaml
id: RT-CP-UI-001-2-5
version: 1
schema: loops/ui-loop/graph/schemas.md#red-team-report
depends_on: [CP-UI-001-2.v5, IR-CP-UI-001-2-4, RT-CP-UI-001-2-4, RD-004]
anchor: RT-CP-UI-001-2-4
```

Ground truth checked read-only in `D:\AddictedtoAI-c2` (head `e4f3c94`): `claimRank`/
`isVendorSourced`/`orgOwnDomains`/`hostNamesOrg` in `lib/render/frontier.mjs`, S22(e)'s independent
re-derivation in `tools/ui-invariants.mjs`, `content/wiki/org/*.md` source_urls, and
`content/wiki/model/moonshotai-kimi-*.md`.

## FM-N3 — MITIGATED, both cases

**LIVE case** (Inception `observed_throughput_p50`): gone — tier 2 deleted whole; IR's count (3→2)
matches. **DORMANT case** (Google `intelligence_index_by_effort`, llm-releases.com,
tier-1 by name): blocked by the new `isVendorSourced` gate — that host names no DeepMind token and
isn't a recorded own-domain, so `claimRank` returns 0 regardless of tier. Verified by S22(e)'s
falsifier log: disabling the vendor test (e-i) reproduces this case live and fires; rejecting
everything (e-ii) fires the other end; `.src` reverted to "model record" (e-iii) fires, honestly
recording its own first-attempt miss before tightening to an exact org-name compare. Closed both. **FM-N4 (S25 320px/un-stamped theme) unchanged this round** — RD-004's scope was FM-N3 only,
S25's viewports untouched, no 320px capture
exists — carried forward, not re-litigated.

## Tests

**Vendor-host match, adversarial.** `hostNamesOrg`/`named()` (duplicated in `frontier.mjs` and
S22(e)) match a token on **any** dot-separated label, not the registrable domain. `google.<third-
party-controlled>` would pass `isVendorSourced` for Google DeepMind exactly as legit
`deepmind.google` does — label identity, never position/ownership. Dormant (curated corpus, no such
host today), but FM-N3's own shape recurring: a name-shaped string standing in for verified identity.
S22(e) cannot catch it — same blind spot in the auditor as the audited code.

**Vendor with no recorded host, both directions.** Works for a display-name match with zero recorded
domains: `deepmind.google` passes via name-token fallback (DeepMind's recorded citations are only
`blog.google`/wikipedia). Fails silently for a product-brand domain absent from `aliases`:
`platform.kimi.ai` is Moonshot's own docs domain (`moonshotai-kimi-k2-5.md#api_sunset`), but
Moonshot's aliases never include "Kimi" — a tier-1 fact cited there today would reject as
third-party. Moot now (only record-metadata cites that host), but alias completeness is ungated.

**Vendor's own marketing page as a Tier-1 claim.** Allowed by design — the two live rows: DeepMind's
`hle_verified` (`deepmind.google`), Tencent's `internal_blind_eval` (`tencent.com`). No distinction
self-reported vs. audited; both clear the same bar. The fixed lede renders unconditionally, so
"not verified" stays visible — the per-row `.board-note` does NOT print this round (2/16=12.5% vs
87.5%, neither clears >90%), making the lede the ONLY carrier; S25 (unchanged, FM-N4) is what
guarantees it survives at all.

**Lede/board agreement.** DeepMind's cell ends "— Google DeepMind, accessed …", Tencent's
"— Tencent, accessed …" (data, not copy). Lede reads "14 of 16 have none" — 16−2=14, matches.

**S22(e) vacuity.** Not vacuous. Guards fire on the real corpus with explicit bail-outs
(`orgFactValues`/`deniedValues`/`orgsMeta`/`thirdPartyValues` all non-empty today); the falsifier
log shows (e-i)/(e-ii)/(e-iii) firing on live breaks, not passing by an empty set.

```json
{"failure_modes": [
  {"id":"FM-N5","mode":"unlabelled claim","scenario":"`hostNamesOrg`/`named()` (duplicated in frontier.mjs and S22(e)) match a token against ANY dot-separated host label, never the registrable domain: `host.split('.').some(l=>tokens.has(l))`. A host shaped `google.<third-party-controlled>` clears `isVendorSourced` for Google DeepMind exactly as legitimate `deepmind.google` does — label identity, never position/ownership. Dormant: no such host in the curated 16-org corpus, and the two hand-duplicated mechanisms would need fixing separately. S22(e) cannot catch this: its own vendor test shares the identical blind spot as the code it audits","probability":2,"severity":3,"detectability":5,"mitigation_exists":false,"element":"lib/render/frontier.mjs hostNamesOrg/isVendorSourced (~246-272); tools/ui-invariants.mjs S22(e) named()"},
  {"id":"FM-N6","mode":"unseen surface","scenario":"Vendor-domain recognition depends on org `aliases` carrying every product-brand token a domain might use. Moonshot's own docs domain `platform.kimi.ai` is cited today (`moonshotai-kimi-k2-5.md#api_sunset`), but Moonshot's aliases are 'Moonshot AI'/'Moonshot'/'月之暗面' — never 'Kimi' — so a tier-1 fact cited there would reject as third-party, opposite FM-N3 (a real claim reads as none-on-file). Moot today (only record-metadata cites that host), but no gate checks alias completeness against a model's own cited domains, so a future Kimi benchmark source blanks by omission with nothing failing anywhere","probability":3,"severity":3,"detectability":4,"mitigation_exists":false,"element":"content/wiki/org/moonshot-ai.md aliases; lib/render/frontier.mjs orgNameTokens/orgOwnDomains"}
]}
```

**What will be wrong about this in a week:** whichever org's newest row cites a tier-1 field to a
domain one label-hop from its own — a third-party subdomain, or its own brand missing from
`aliases` — lands on FM-N5 or FM-N6; neither trips a gate, since both share the code's own vocabulary.

**What every other AI news site already shows:** a "verified"/"independently benchmarked" badge
distinct from "vendor states" — a distinction this board still collapses into one test (tier-1 field
+ own-domain source); DeepMind's and Tencent's self-reported evals clear that bar as an audit would,
and only the page lede, not the cell, carries the caveat.
