# RT-CP-UI-001-2-4 — red team on Players Board (anchored re-run, RD-003)

```yaml
id: RT-CP-UI-001-2-4
version: 1
schema: loops/ui-loop/graph/schemas.md#red-team-report
depends_on: [CP-UI-001-2.v4, IR-CP-UI-001-2-3, RT-CP-UI-001-2-3, RD-003]
anchor: RT-CP-UI-001-2-3
```

Ground truth checked read-only in `D:\AddictedtoAI-c2`. `claimRank` requires `source: cited` AND a
digit in `value`. Sampled 5 Tier-1 values across `content/wiki/model/*.md` — all carry digits, no
legitimate benchmark excluded by the digit guard. `git diff 1e3ddd7...HEAD --stat`: only
`app/globals.css`, `lib/render/frontier.mjs`, `RULES.md`, `tools/ui-invariants.mjs` changed;
`home.mjs` untouched; CSS diff is one new `.board-lede` rule (`.board-note`'s tokens) plus dropping
`.frontier-door-row`'s `border-bottom` — no copy outside the one lede sentence changed.

## Anchor disposition (FM-N1/FM-N2, RD-003's named modes)

**FM-N1 (hype-adjacent copy — positioning tagline in the claim cell): MITIGATED for the shipped
instance.** x-ai's `vendor_description` no longer qualifies; the live 3-of-16 claim rows are now
`intelligence_index_by_effort`, `observed_throughput_p50`, `internal_blind_eval` — all numeric,
gate-covered by S22(d), falsified both directions (allow-listing `vendor_description` alone did not
fire, recorded honestly, until the digit guard was also removed; emptying both Sets fired the
opposite). Real fix. But see FM-N3: mitigating the *tagline* case surfaced a different attribution
defect in the *same* Tier-2 set RD-003 did not test for.

**FM-N2 (one-sided invariant — first-match document order): MITIGATED.** `vendorClaimFact` now ranks
(tier 1 > tier 2, ties broken by document order) rather than `find()`-first, verified by reading
`claimRank`/`vendorClaimFact` directly. `openai-gpt-5-6-terra.md` lists `vendor_role` (no tier)
ahead of `terminalbench_comparison` (tier 1, digit) — the ranked scan picks the benchmark regardless
of position. No gate asserts order on a doc with two same-tier candidates; none of the 16 has two.

## New grounded modes

```json
{"failure_modes": [
  {"id":"FM-N3","mode":"unlabelled claim","scenario":"CLAIM_FIELDS_QUANTIFIED admits fields by NAME with no check on WHO produced the value; two of its five instances are third-party measurements the source doc's own prose separates from a vendor claim. `inception-mercury-2-5-preview.md`: `observed_throughput_p50`='359 tok/s', `source_url` openrouter.ai — body text: 'OpenRouter's own page carries a DIFFERENT number... a vendor capability claim against a traffic-derived median — OpenRouter computes them over a rolling 30-minute window of live traffic.' Inception's own vendor number (1,107 tok/s) isn't even captured as a fact. LIVE today: this is one of the IR's own named 3-of-16 rendered claims (org's newest row per catalog.json). `google-gemini-3-8-flash.md`: `output_tokens_per_task`='~48k'/`cost_per_task`='~$0.58', `source_url` llm-releases.com — same paragraph: 'An independent reading... turns that sentence into arithmetic' vs. 'Google's own launch numbers ... are vendor-reported' for the adjacent tier-1 field. Google's newest row too, but a tier-1 field (hle_verified) currently outranks these — dormant, not live; one rebuild that drops that field puts an analyst's arithmetic in the VENDOR CLAIM cell under the lede's 'quoted verbatim from the vendor'. Root cause: `source: cited` means 'has a citation', not 'is the vendor's own assertion' — `claimRank` reads source+digit, never who is cited","probability":4,"severity":4,"detectability":5,"mitigation_exists":false,"element":"frontier.mjs claimRank/CLAIM_FIELDS_QUANTIFIED; inception-mercury-2-5-preview.md#observed_throughput_p50 (live), google-gemini-3-8-flash.md#output_tokens_per_task+cost_per_task (dormant)"},
  {"id":"FM-N4","mode":"unseen surface","scenario":"S25 (the lede's fold-safety/legibility gate) declares `viewports: [[1440,900],[390,844]]` only. R2 — the site's reflow floor — is 320px, and S25 never runs there: no assertion 'not verified' stays in the first viewport, or that contrast holds, at the narrowest declared width. Same gate only ever forces `data-theme` to 'light'/'dark' explicitly; it never measures the un-stamped default (bare `:root`, resolving off `prefers-color-scheme`) — the state most first-time visitors arrive in. Likely benign by construction (shared `--muted`/`--paper` tokens) but untested by the one fix meant to guarantee this sentence is never lost, and S25's own falsifier notes already found one real timing bug in this exact theme-measurement code (dark pass reading the light ground)","probability":2,"severity":3,"detectability":3,"mitigation_exists":false,"element":"tools/ui-invariants.mjs S25 (viewports array; theme loop over ['light','dark'] only)"}
]}
```

**What will be wrong about this in a week:** whichever org's newest row carries a Tier-2 field with
no Tier-1 field ranking above it keeps stating a third party's measurement as "the vendor claims,"
under a lede that says the opposite of what the source page itself says about that number; which org
draws that row rotates with `created`.

**What every other AI news site already shows:** a blended "specs" row — vendor marketing,
third-party benchmark sites, and the site's own measured numbers — under one attribution that hides
how different those sources' incentives are. RD-003 fixed the tagline case; the Tier-2 set inherited
the same undifferentiated-source problem one layer down.

**Standing questions:** (1) should `claimRank` distinguish a vendor's own assertion from a third
party's measurement before either occupies a column labelled "Vendor claim"? (2) is exercising only
two forced theme stamps and two of the site's three declared breakpoints an acceptable floor for a
gate whose whole job is "this sentence must always be visible and legible," or does S25 need 320 and
the un-stamped default too?
