# Bind a price to the vendor that posts it

## What was re-measured before designing anything

`addictedtoai-ak9` was filed 2026-08-29 and last triaged 2026-09-04. Its
numbers are the ones an investigation took a week ago and several have moved.
Everything below was re-read or re-run in this worktree
(`D:/addictedtoai-worktrees/impl-spec-pulse`, cut from `main` at `e76fb30`) on
2026-09-06.

**Still true.**

- `data/sources/registry.json` still marks `price_input` (`pricing.prompt`) and
  `price_output` (`pricing.completion`) `"event": false`, and the flag is still
  honoured in exactly one condition in `pulse/lib/diff.mjs` (`spec.event ===
  false`, `:230`) plus the matching interpretation gate at `:386`.
- **No `/endpoints` fetch exists anywhere.** `grep` over `pulse/` and `lib/`
  finds the word `endpoints` only in `lib/price-attribution.mjs`'s prose and in
  one unrelated analytics test. Nothing has been built toward this.
- The registry's robots record for `openrouter-models` is still dated
  **2026-08-28** and still says, verbatim: *"It is a public, unauthenticated JSON
  API and is fetched once per day."* That sentence is what a companion fetch
  would falsify, which is ak9's cost 3 and it is unchanged.
- `pulse/lib/diff.mjs:408–411` still names this issue as the thing that will
  clear the flag: *"When price events are re-keyed to vendor posted rates and
  become trustworthy, ak9 clears `event: false` in the registry and
  interpretation returns here by itself — with no second switch to find."* So
  the switch this change is written toward already exists and is documented; this
  change does not throw it.

**Measured now, and it corrects the bead's own cost estimate.**

- The gap is real and datable. `data/changes.jsonl` holds **182 lines**, of which
  23 are `field_change` and of those exactly **8 `price_input` and 8
  `price_output` — all 16 dated 2026-08-29**, the day before the flag went in.
  The site has emitted no price event of any kind for eight days. "A gap, not a
  destination" is now a measurement.
- ak9 costs the companion fetch at "396 extra HTTP requests per daily run, one
  per row". Measured on `data/sources/openrouter-models/latest.json` (`fetched_at`
  `2026-09-05T06:00:04.599Z`, 1,136,809 bytes): **431 rows**, of which **404
  carry a non-zero `pricing.prompt`** — so 404 requests if the fetch is keyed on
  row id, not 396.
- **And it need not be 404.** Those 404 priced rows span only **335 distinct
  `canonical_slug` values**; 69 of the ids carry a `:free`/`:batch`-style variant
  suffix over a slug already counted. Keying the companion fetch on the canonical
  slug — which is also what the endpoint path is addressed by — costs **335
  requests**, a 17% saving the bead did not have, and it stops the same provider
  listing being fetched three times for three variants of one model.
- The tier problem ak9 asks to "also settle while here" is already documented
  with measurements in this tree, in `data/price-attribution-debt.json`'s
  `residual_hazard` field: the headline is one **service tier** among several the
  **same** provider lists — `openai/flex` at 0.5×, `openai` standard at 1×,
  `openai/fast` at 2×; `google-ai-studio` flex/standard/priority at 1×/2×/3.6×;
  `azure/eu` and `azure/us` at +10%. So "OpenAI charges $2/M" is under-specified
  *even when OpenAI is the top provider and the attribution check is satisfied*.
- One data point in the other direction, and it is worth carrying because it is
  the only coverage evidence on disk: on the 22 rows fetched live on 2026-08-31
  (all HTTP 200, recorded in the same file), **the snapshot headline equalled the
  vendor's own standard-tier endpoint rate on every one**. Twenty-two rows out of
  404 is not a coverage estimate, and it is not used as one below.

**Not re-measurable here, and named rather than assumed.** ak9's cost 2 — "the
vendor is often absent from its own model's provider list" — cannot be checked
from disk, because no companion snapshot exists. It stays the bead's claim. This
change does not depend on how often it happens: it specifies what an absent
vendor rate does, and that behaviour is correct at any coverage level.

## The findings

**1. The site has no price event, and the reason it has none is correct.** The
headline is a rate on a listing whose referent rotates on a 30-second window.
`addictedtoai-8ho` was right to stop emitting it. But "stop emitting the wrong
event" is not "emit the right one", and eight days of silence on the one field
readers most want to see move is the cost of leaving it there.

**2. The value that would be right is not in the feed.** A rate that a vendor
actually posts is per-provider data, one level below the row. Reaching it means a
second fetch per row — which is not a shape the registry has, and which the
robots record for that source explicitly does not cover.

**3. A vendor rate with no tier is still under-specified.** This is the finding
that makes the difference between a fix and a half-fix. Matching `provider_name`
to the row's author yields *a* rate the vendor posts; the same vendor commonly
posts three, and the measurements above show them a factor of four apart end to
end. A price event keyed to "the vendor's rate" with no tier would be a truer
sentence than today's and still not a true one.

**4. Partial coverage is a design input, not a defect to be papered over.** Rows
with no vendor endpoint will have no vendor rate. The one thing that must not
happen is the headline sliding into the gap: that is exactly how a listing rate
becomes a vendor attribution with nobody deciding to attribute anything, which is
the defect `lib/price-attribution.mjs` was written to catch in prose and which
would then be re-introduced in data.

## The decision

**The event is re-keyed to a vendor-posted rate, identified by provider *and*
tier, or there is no event.** Absence is the house rule and it is applied without
a fallback: a row whose author is absent from its own provider listing, or which
posts several tiers with none declared canonical, has no vendor rate, emits no
price event, and does **not** borrow the headline.

**The vendor rate sits beside the listing rate; it does not replace it.** ak9
asks this to be settled and the answer is beside. Replacing the catalog column
would blank it on every uncovered row — trading a number that is true about a
listing for a hole. Both are true statements about different things, and the row
carries both under distinct names.

**No percentage threshold, ever.** Transcribed from the bead's own DO NOT, with
its reason: the 60% scheduled-window flip and the 14.7× routing flip both clear
any threshold anybody would set, while a real 2% repricing is suppressed by all
of them. The test is whose rate moved, never how far.

**A companion fetch is a declared registry shape with a courtesy bar in front of
it.** The registry gains the ability to declare a second, per-row URL with its
own cadence and snapshot; and because that multiplies a source's request rate by
the size of its covered set, declaring one is explicitly carved out of the
"adding a source is an ordinary data change" sentence, and the build refuses one
whose robots record has not been re-checked and re-dated at the new volume with
that volume written into it.

## What this change deliberately does not do

- **It does not clear `event: false`.** The flag stays until a vendor-posted rate
  exists to key the event to. `pulse/lib/diff.mjs` already documents that
  clearing it is one registry edit with no second switch to find, and that edit
  is a data change made after this change's tasks land, not part of the spec.
- **It does not register the companion source or write its robots re-check.**
  Both are ordinary data changes — under the modified requirement the *shape* is
  specified and the *bar* is enforced by the build, and filling in the row and
  re-fetching `robots.txt` is registry data like any other. The re-check is a
  courtesy act with a request rate attached, and the honest place for it is the
  day the fetch is switched on, not a week earlier in a spec.
- **It does not change any surface's labelling of the price column.** How a
  catalog names two price fields to a reader is `directory`'s and `site`'s, and
  no delta here touches either. What this change fixes is the data: two values,
  distinctly named, neither standing in for the other.
- **It does not model the whole tier landscape.** The rule is that a bound rate
  names its tier and that an undeclared-canonical multi-tier row is absent. Which
  tier a source declares canonical is registry data, per source, and deliberately
  not decided in a spec.
- **It does not resolve `addictedtoai-pfc` or `addictedtoai-k7d`.** Both are
  listed as blocked on this issue and both are prose-and-check problems downstream
  of the data existing; this change makes their fix possible and does not make it.
- **It does not touch `lib/price-attribution.mjs`.** The build check on prose
  stays exactly as it is; a vendor rate that names its provider and tier is what
  will eventually let a sentence pass it honestly rather than by hedging.

## Beads this change serves

- `addictedtoai-ak9` — the whole of it: the re-key, all three costs carried
  forward and one of them re-measured smaller, and the two questions it asks to
  be settled while here (replace-or-sit-beside, and the tier ambiguity) answered
  in the delta rather than in a comment.
