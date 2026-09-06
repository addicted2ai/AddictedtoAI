---
slug: implement-publishes-from-on-the-entry-schema
type: machinery
date: 2026-09-06
origin: review of job j-20260906-03
noted_by: the reviewer of job j-20260906-03 (claude-code-opus)
proposed_by_job: j-20260906-03
proposed_by_type: entry
---
`lib/schema.mjs`'s `entrySchema` is `.strict()` and has no `publishes_from` key, so an org entry that declares one fails the build — while the in-flight change `separate-a-claim-from-a-fact` specifies the field as REQUIRED editorial completeness, and the spec excerpts the Desk pastes into every `entry` brief carry that pending text verbatim. A job is therefore instructed to author a field the build rejects, with no way to tell from the brief that the requirement is not yet buildable. This job would implement the field as the delta specifies it — optional, set-valued, each value equal to its own registrable-domain reduction or the build fails naming the entry, the value and the reduction — and wire it into `orgOwnDomains`/`isVendorSourced` in `lib/render/frontier.mjs`, which today reads only the entry's own cited source URLs and name tokens.

## Evidence

Measured on 2026-09-06 against `lib/schema.mjs` on this branch (the branch touches no code: `git diff --stat main...HEAD -- lib scripts package.json` printed nothing). Parsing `content/wiki/org/nous-research.md`'s front matter with `entrySchema.safeParse`: as authored -> valid: true; with `publishes_from: ['nousresearch.com']` added -> valid: false, `[{"code":"unrecognized_keys","keys":["publishes_from"],"message":"Unrecognized key: \"publishes_from\""}]`. This job's own brief named the field as a must-carry ("its product-brand registrable domains in `publishes_from` (ui-loop K48 ...)"), so the demand and the rejection are both live today. Nous Research is also a real instance of the gap rather than a hypothetical one: it publishes the Psyche network from `psyche.network` (linked from https://nousresearch.com/introducing-hermes-4-3 and from the Consilience model card, both fetched 2026-09-06), whose registrable label `psyche` is not one of the org's name tokens — `orgNameTokens` yields {nousresearch, nous}, with `research` dropped as a generic corporate word — so a future claim cited from that domain renders unattributed with nothing failing.

## Origin

Transcribed by the loop from the verdict record for job j-20260906-03 (`j-20260906-03.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
