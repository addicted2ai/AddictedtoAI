---
date: 2026-09-13
slug: pair-a-departure-with-a-de-suffixed-arrival
type: machinery
summary: >
  `pulse/lib/diff.mjs`'s substitution discriminator pairs a departing row with
  an arriving one only when their dated slug stems are equal, so it sees a
  publisher moving a dated checkpoint onto the same name and misses a publisher
  dropping a lifecycle suffix from it. `inception/mercury-2.5-preview` left the
  catalog in the 2026-09-09 fetch and `inception/mercury-2.5` arrived in the
  same fetch, and because the stems are `inception/mercury-2.5-preview` and
  `inception/mercury-2.5` the pairing did not fire and the departure was
  recorded, and is rendered, as `retired`. The proposed job would extend the
  stem comparison to accept an arriving stem that equals the departing stem
  with a declared lifecycle suffix removed — the suffix list declared in
  `data/sources/registry.json` beside `substitution_rule`, never inferred — and
  would leave every departure with no such arrival producing exactly what it
  produces today.
evidence: >
  Measured 2026-09-13 on this repository and on the live source.
  `data/changes.jsonl` carries both halves of the 2026-09-09 fetch under one
  snapshot-hash pair (`…|c445d17afde865af|5881134797f7ecd5|…`):
  `inception/mercury-2.5-preview|$retirement` and
  `inception/mercury-2.5|$arrival`. The departed row's `canonical_slug` was
  `inception/mercury-2.5-preview-20260831` and the arriving row's is
  `inception/mercury-2.5-20260908`, so `datedSlugStem` yields
  `inception/mercury-2.5-preview` against `inception/mercury-2.5` and
  `substitutionSuccessors` returns `[]` — run directly against the real
  registry rule and these two rows, it returns `[]`, while the qwen pair the
  rule was built for still returns
  `[{"row_id":"qwen/qwen3.8-max-0902",…}]`. The discriminator was live when
  this happened: it merged 2026-09-07 (`ceff728`), two days before the fetch.
  That the departure was not a retirement is settled by the publishers.
  Inception's https://www.inceptionlabs.ai/blog/introducing-mercury-2-5
  (Product, Sep 8, 2026, fetched 2026-09-13) says "Today, we’re releasing
  Mercury 2.5, our most capable production model yet";
  https://openrouter.ai/inception/mercury-2.5-preview answers HTTP 307 to
  /inception/mercury-2.5 and
  https://openrouter.ai/api/v1/models/inception/mercury-2.5-preview/endpoints
  returns HTTP 200 whose payload is the successor's record (all fetched
  2026-09-13).
  It reaches readers on this branch's own build of 2026-09-13:
  `out/catalog/changed.html` renders "2026-09-09 Inception: Mercury 2.5 Preview
  retired" immediately followed by "2026-09-09 Inception: Mercury 2.5 arrival",
  and `out/index.html` is worse — its window ends on the retirement line, and
  the string "Mercury 2.5" occurs exactly twice in that file, both of them
  inside that one line (the rendered markup and its RSC payload copy), so the
  successor's arrival is not on the home page at any wording. The home page
  says a model was retired and carries nothing that says otherwise.
---

Noticed while repairing the vanished `inception/mercury-2.5-preview` row. The
repair's finding is that a preview graduated; the change log had already
recorded the graduation as a retirement, and the rule written three days earlier
to stop exactly that did not fire.

It did not fire for a reason worth stating precisely, because it is not a bug in
`substitutionSuccessors`. That function asks whether the publisher moved a name
onto newer weights, and it answers by comparing dated stems, which is right for
the case it was built from: Alibaba pointed `qwen3.8-max` at a newer snapshot,
the stem stayed `qwen/qwen3.8-max`, the pairing held. A preview graduating is a
different publisher act with the same consequence for a reader — the name the
catalog serves the model under changed, and the old name became a pointer to the
new one — and it changes the stem, because the whole point of shipping is that
the word *preview* comes off. One comparison answers the first question and
cannot answer the second.

The proposed change is a second acceptance in the same comparison, not a second
mechanism. Today `substitutionSuccessors` accepts an arriving stem when it
equals the departing stem. It would additionally accept one that equals the
departing stem with a trailing declared lifecycle suffix removed —
`-preview`, and whatever else the registry declares, as an explicit list beside
`substitution_rule` in `data/sources/registry.json`. That placement is the
load-bearing part of the proposal. The suffix set is a fact about how one
publisher names things, `registry.json` is where this repository already keeps
such facts, and a list inferred from the strings would be the four-digit-tail
trap `datedSlugStem`'s own comment documents: a rule that strips what looks like
a suffix will eventually fold two real models into one stem and invent a
substitution out of a name.

Two properties have to survive, and they are what a job here should be measured
against. A departure with no same-stem and no de-suffixed arrival must produce
byte-identical output to today — `ibm-granite/granite-4.1-8b` is the case that
must not move. And the direction must stay one-way: a departing `…-preview`
pairing with an arriving base name is a graduation, while a departing base name
pairing with an arriving `…-preview` is not the same event and should not be
claimed as one.

What this deliberately does not propose, on the same reasoning the earlier
`substituted-rows-report-as-retirements` gave: it does not rebind any entry's
`feeds:` map to the arriving row, and it does not decide what the site should
say about the pair. Whether the preview listing and the production listing ran
the same weights is not answered by either publisher — the repair that prompted
this looked, and left the question open on the page. The machinery's job is to
stop printing the word *retired* about a model that shipped, and to hand the
successor's row id to whoever writes the sentence.

No expiry is set. The evidence above is durable: both change lines are in
`data/changes.jsonl` permanently, and the two canonical slugs are written out
here, so nothing in the argument depends on a snapshot that has not yet rotated.
