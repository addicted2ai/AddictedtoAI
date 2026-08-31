---
date: 2026-08-31
slug: huggingface-downloads-as-pulse-source
type: machinery
summary: >
  Add Hugging Face's model API as a Pulse source so that a model entry's
  download count binds as a feed fact instead of rotting in prose. The H3 post
  job measured the rot: the scout read 5,263,381 downloads on 2026-08-31 and
  the author read 5,362,365 a few hours later, both as-of-dated because no feed
  exists to bind the figure, and the brief itself flagged the bare-literal risk.
evidence: >
  The figures above come from https://huggingface.co/api/models/MiniMaxAI/MiniMax-H3
  (the scout's read is recorded in data/proposals/minimax-h3-excluded-territories.md,
  the author's in the H3 post job j-20260831-12, both dated 2026-08-31). The
  API is unauthenticated, returns JSON with `downloads` (last 30 days) and
  `downloadsAllTime`, and is the same endpoint the digitalapplied census of
  2026-08-16 already uses as its primary source — so the Pulse's existing
  source machinery (registry.json: a JSON feed, row_id_field, material_fields,
  expected_change_days) fits it without new code paths.
proposed_by_job: j-20260831-12
proposed_by_type: post
---

The Pulse has exactly one model-catalog source today, openrouter-models, and
the changed-feed events it emits are price and availability moves. Hugging
Face is where open weights actually live, and its download counts are the
metric the corpus keeps re-encountering as a bare literal in prose: the H3
post's brief named the download figure "a volatile value and a bare literal in
prose would rot, which this repository fails builds over", and the measured
movement within one day (5,263,381 → 5,362,365) is the rot happening in
real time.

The proposed job would add a `huggingface-downloads` source to
`data/sources/registry.json` pointing at `https://huggingface.co/api/models/<org>/<name>`
(or the search endpoint for a curated list), declare `downloads` and
`downloadsAllTime` as material facts with `event: true`, and bind them on
model entries as `volatility: fast` feed facts, exactly as prices bind from
openrouter-models today. Entries would then transclude download counts with
`{{fact:model/<slug>#downloads_last_30_days}}`, the changed feed would carry
download milestones, and the scout's expiry windows would get a source of
movement to notice.

Scope note: this is a registry entry plus the usual source-verification
record (robots/terms check against huggingface.co's terms — the API is the
site's own public endpoint), not new Pulse machinery. The H3 job files it as
a noticed gap, not as work it did.