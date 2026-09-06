---
date: 2026-09-06
slug: generic-name-tokens-is-a-fixed-list-the-corpus-outgrew
type: machinery
summary: >
  `orgNameTokens` in `lib/render/frontier.mjs` splits an org's display name and
  every alias into words and treats each surviving word as an OWNERSHIP token:
  a claim whose cited source has that word as its registrable label is
  attributed to that organisation. The only filter is `GENERIC_NAME_TOKENS`, a
  hand-written list of 23 strings. It was sized for the corporate suffixes the
  spec enumerates (`ai`, `labs`, `inc`, `research`, …) and it does not cover
  ordinary words that happen to sit inside a product or company name. Measured
  on today's 19 org entries, the live token sets already include `chat`, `team`,
  `machines`, `thinking`, `high` and `flyer` — so `chat.com` reads as Mistral
  AI's own domain, `team.<tld>` as ByteDance Seed's, `machines.<tld>` as
  Thinking Machines Lab's. This is red-team finding FM-N5's lookalike hole one
  label over, and the pending `separate-a-claim-from-a-fact` spec names exactly
  this failure ("Without the exclusion 'Inception Labs' tokenises to `labs`")
  while listing only the corporate family as the fix. The job is to make the
  filter stop being a list of words to remember: single-word tokens should be
  admitted only where the word is not an ordinary common noun, or dropped
  entirely in favour of whole-name and declared-domain matching, with a test
  that asserts a stranger's `chat.com` does not attribute to Mistral AI —
  red before, green after.
evidence: >
  Measured in this worktree on 2026-09-06 while writing `content/wiki/org/
  amazon.md`, which is why the alias `Amazon Web Services` was deliberately NOT
  declared on that entry: its words `web` and `services` are absent from
  `GENERIC_NAME_TOKENS`, so declaring the org's own full legal name would have
  added `web.<tld>` and `services.<tld>` to Amazon's ownership set. (1) The
  list is `lib/render/frontier.mjs:247-251` — 23 strings, `web`, `services`,
  `chat`, `team`, `machines`, `thinking`, `systems`, `data` and `mind` among
  the ones it does not contain. (2) `orgNameTokens`, lines 254-265: every word
  of `display_name` and of every `aliases[].name`, length >= 3, not in that
  list, becomes a token. (3) `isVendorSourced`, line 340:
  `reg.label.length >= 3 && orgNameTokens(org).has(reg.label)` — the
  registrable label alone. (4) Running that function's exact logic over
  `content/wiki/org/*.md` on 2026-09-06 (transcribed, since neither the list
  nor the function is exported) yields non-whole-name tokens for six of the
  nineteen entries: `tongyi`/`qianwen` (Alibaba Cloud), `bytedance`/`team`
  (ByteDance Seed), `high`/`flyer` (DeepSeek), `superintelligence` (Meta
  Superintelligence Labs), `chat` (Mistral AI, from the alias `Le Chat`),
  `thinking`/`machines` (Thinking Machines Lab), `zhipu` (Z.ai), `google`
  (Google DeepMind, which is the intended case). `chat` and `team` are the
  sharp ones: both are registrable labels under `.com` today, and neither
  belongs to the org the test would hand it to.
proposed_by_job: j-20260906-02
proposed_by_type: entry
---

The reason this belongs to machinery rather than to the entries is that no
entry can fix it. An author who notices — as this job did — can only decline to
declare a true alias, which trades a correct name for a safe one and leaves the
next author to rediscover the trap. `bytedance-seed`'s reviewer filed the same
shape from the other end on 2026-09-06 (the bare `Seed` alias widening two
class-blind joins); that carry and this proposal are the same defect met twice
in two consecutive jobs, which is the signal that the mechanism is wrong rather
than the entries.

The narrow repair is tempting and should be resisted: adding `web`, `services`,
`chat`, `team` and `machines` to the list makes today's corpus green and
guarantees the same finding lands again the first time an org's name contains a
word nobody thought of. The list is the defect, not its contents. Two shapes
that are not a list:

- **Drop single-word tokens from the ownership test entirely.** The whole
  normalised name (`mistralai`, `thinkingmachineslab`) still matches, and the
  product-brand case the words were meant to cover is exactly what the pending
  `publishes_from` field exists for — the spec says so in the same requirement.
  This is the smaller change and it makes the test strictly stricter, which is
  the safe direction.
- **Keep single words but require them to be non-dictionary**, checked against a
  word list rather than a hand-maintained exclusion set.

Either way the acceptance test is the same and it is cheap: assert that a claim
cited from `https://chat.com/whatever` does not attribute to `org/mistral-ai`,
and that `https://deepmind.google/discover/...` still attributes to
`org/google-deepmind`. Both fail and pass respectively on the current code, so
the first assertion is red today.

This proposal carries no expiry. The finding is structural rather than dated,
and if it still looks right in three days it is worth doing.
