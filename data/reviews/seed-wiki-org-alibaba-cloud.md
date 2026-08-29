---
job: seed-wiki-org-alibaba-cloud
verdict: approve
reasons: []
would-cite: >-
  Someone deciding whether a given Qwen row can be self-hosted before opening its
  model card: in the 28 August 2026 snapshot the seventeen rows with no Hugging
  Face weights are exactly the seventeen named max, plus or flash, with no
  exception in either direction.
reviewer: rr2b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Census re-run from
scratch against `data/sources/openrouter-models/latest.json` (2026-08-28, 388
rows); sources fetched 2026-08-29 and confirmed by literal substring match.

Verified by measurement, exhaustively rather than by sampling:

- 52 rows under `qwen/`, 58 under `openai/` — second only to OpenAI, exact.
- Exactly 17 qwen rows carry no `hugging_face_id`, and exactly 17 carry `max`,
  `plus` or `flash` as an id token. The two sets are identical. I ran both
  exception lists explicitly and both are empty: no tier-named row publishes
  weights, no non-tier row withholds them. This is the page's central finding and
  it is exactly right in both directions.
- The parameter-naming accounting checks out too: of the 35 open rows, 33 carry a
  parameter count in the id itself, `qwen/qwen3-coder` carries one outside the id,
  and `qwen/qwen3-coder-next` is the sole row carrying none in id, display name
  or canonical slug. 33 + 1 + 1 = 35.
- `qwen/qwen3.8-max` created 2026-08-03; `qwen/qwen3.8-2.4t-a95b` created
  2026-08-12 — nine days. Both prompt 0.000002; context 1,048,576 against
  1,000,000, so "marginally larger" is right. The a95b description carries
  verbatim "the open-weight variant of [Qwen3.8 Max]" and "95 billion active
  parameters out of 2.4 trillion total".
- `qwen/qwen3.7-flash` created 2026-07-27 at 0.00000003; `qwen/qwen3.8-flash`
  created 2026-08-26 at 0.00000015. Exactly five times, exactly thirty days, both
  `hugging_face_id` null, both `["text","image","video"]`, both context
  1,000,000. Every element of that sentence holds, and the ratio is anchored to
  the dated snapshot as the rule requires.

Verified by fetching en.wikipedia.org/wiki/Qwen (raw wikitext, matched literally):
"Alibaba launched a beta of Qwen in April 2023 under the name Tongyi Qianwen,
then opened it for public use in September 2023"; "By May 2026, the Qwen app had
234 million users"; "There are over 200,000 variations of Qwen's open-source AI
models on the Hugging Face's model list"; "more than US$50 million annually";
"Many Qwen models are distributed under the free and open-source Apache License,
the source-available Qwen License"; "The cloud version of Qwen3.8-Max was
released on 3 August 2026 ... approximately 95 billion parameters active per
forward pass, and supports a context window of up to one million tokens"; "On 14
August 2026, Alibaba followed up ... with the release of Qwen3.8-27B ... released
with the Apache 2.0 license". Every fact and both timeline events confirmed.

Round 1 (r6-fable) found: `false-or-unsupported-claim` on "The other thirty-five
are named by parameter count", together with the lede's "never once broken the
rule" and a closer claiming any Qwen model could be settled without opening its
page — **fixed, and fixed honestly**. The census is now stated as the one-way
rule the data actually supports, "never once broken" is scoped to the tier
vocabulary where it is true with zero exceptions, the closer is scoped to rows in
the snapshot, and both coder-row exceptions are named in the text.

Two blemishes the fix introduced or left, neither disqualifying. First,
`qwen/qwen3-coder` "carries its 480B only in its display name" is not quite true —
its canonical slug is `qwen/qwen3-coder-480b-a35b-07-25` and its Hugging Face id
is `Qwen/Qwen3-Coder-480B-A35B-Instruct`, both of which carry it. The word "only"
matters because the very next clause treats id, display name and slug as three
distinct fields. Round one's wording was more careful ("only in its display name,
not in the id the piece names rows by"); compressing it created the imprecision.
Second, the opener "Qwen tells you its licence in the model's name" overstates
what the census shows: the correspondence establishes whether weights are
*published*, not under which licence, and the page's own `weights_license` fact
records two different licences among the open rows. The body states the rule
correctly in terms of downloadable and withheld; only the topic sentence drifts.
I also note an omission the page could have caught with the check it already ran
elsewhere: it reports modality for the flash pair but not for the max/a95b pair,
where the open variant takes text only against the closed row's text, image and
video. "Cost the hosted flagship nothing on the price sheet" stays literally true.

It clears the bar as it now stands, and this is a one-clause fix rather than a
failed argument. The thing worth linking — an exhaustive, exception-free
correspondence between a marketing tier vocabulary and an open-weights policy,
plus a flash tier whose price quintupled in thirty days with the window and
modalities held constant — is verified to the row, and the defective clause lives
inside the secondary convention the page itself flags as the half that breaks.
