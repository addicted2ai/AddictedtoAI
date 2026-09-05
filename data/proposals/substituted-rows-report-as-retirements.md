---
date: 2026-09-05
slug: substituted-rows-report-as-retirements
type: machinery
summary: >
  `emit_on_remove: true` turns every departed feed row into a
  `kind: "retirement"` line, and `lib/changes.mjs` renders that word to a reader
  as "retired". On 2026-09-05 one of the two departures was not a retirement at
  all: Alibaba moved the undated `qwen3.8-max` name onto a newer snapshot, so
  the row left the catalog while the model line continued and the old slug
  became a redirect. The discriminator is already in the two snapshots the diff
  is computed from — a departing row and a row ARRIVING in the same fetch whose
  `canonical_slug` shares the departing row's dated stem. The proposed job would
  compute that pairing in `pulse/lib/diff.mjs` and emit a substitution rather
  than a retirement, carrying the arriving row id so the changed feed can say
  what the name now points at. Where no same-stem arrival exists it would
  produce exactly what it produces today, which is the case that must not move.
evidence: >
  Measured 2026-09-05 on this repository and on the live source. Two rows left
  `openrouter-models` between the 2026-09-04T06:00:03Z and 2026-09-05T06:00:04Z
  fetches — `ibm-granite/granite-4.1-8b` and `qwen/qwen3.8-max` — and
  `data/changes.jsonl` records both identically, as `kind: "retirement"` (the
  file's last line, `key` ending `|qwen/qwen3.8-max|$retirement`).
  `lib/changes.mjs:173` maps that kind to the string `retired`, asserted at
  `lib/changes.test.mjs:84`, and `MATERIAL_KINDS` at `lib/changes.mjs:35`
  carries it onto the home changed feed — where it is not a hypothetical:
  `out/index.html`, built from this branch on 2026-09-05, renders the two lines
  adjacent, "2026-09-05 Qwen: Qwen3.8 Max (0902) arrival" immediately followed
  by "2026-09-05 Qwen: Qwen3.8 Max retired". Only one of the two was a
  retirement.
  Alibaba Cloud's notice
  https://www.alibabacloud.com/en/notice/model_studio_update_notice_for_qwen38max_models_863
  (dated Sep 02, 2026, fetched 2026-09-05) states "After the upgrade, the
  qwen3.8-max endpoint will automatically transition to the snapshot version
  qwen3.8-max-0902, with billing items and pricing remaining unchanged", and
  https://openrouter.ai/qwen/qwen3.8-max answers HTTP 307 to
  /qwen/qwen3.8-max-0902 (fetched 2026-09-05). The proposed discriminator
  separates the two cases on that one fetch pair with no extra HTTP: the six
  arriving row ids were `inclusionai/ling-3.0-flash-sante:free`,
  `openai/gpt-6-astra`, `openai/gpt-6-astra-pro`, `openai/gpt-6-astra-pro:batch`,
  `openai/gpt-6-astra:batch` and `qwen/qwen3.8-max-0902`, whose
  `canonical_slug` is `qwen/qwen3.8-max-20260902` against the departed row's
  `qwen/qwen3.8-max-20260803` — a shared stem `qwen/qwen3.8-max`. No arrival
  shares a stem with `ibm-granite/granite-4.1-8b-20260429`, so Granite still
  reads as the withdrawal it was.
expires: 2026-09-12
proposed_by_job: j-20260905-04
proposed_by_type: repair
---

Noticed while repairing the vanished `qwen/qwen3.8-max` row. The repair's whole
finding was that the row's departure and a sibling's arrival in the same fetch
are two halves of one publisher act — and the change log had already recorded
them as two unrelated ones, the first under a word the evidence contradicts.

The cost is on the reader, not in the data. `changes.jsonl` is a record of what
the snapshots did, and "this row id stopped being present" is a true thing to
record. But the home changed feed does not show row ids; it shows a display name
and a verb, and on 2026-09-05 it will show "Qwen: Qwen3.8 Max" and the word
*retired* about a name that resolves, today, to a live and currently served
model. That is the one failure mode the site's own design keeps naming — a
volatile value rendered as a settled fact — arriving through a verb instead of a
number.

The discriminator costs nothing, which is what makes this worth doing rather
than leaving to a repair job each time. `pulse/lib/diff.mjs` already holds both
snapshots and already computes the departure set; the arrival set is the same
comparison run the other way, and `canonical_slug` is already yielded by the
registry. A departure whose dated stem reappears on an arrival in the same fetch
is a substitution on the publisher's side, and the pairing is derivable with no
model, no network call and no judgment about the world — which is the bar the
Pulse has to clear. The `$retirement` key shape stays available for the case it
was built for.

What this deliberately does not propose is choosing what the site should *say*
about a substitution, or rebinding any entry's `feeds:` map to the arriving row.
Both are judgments about whether two checkpoints are one subject, and this
repair is the argument that they are not always: the August 3 and September 2
Qwen3.8 Max checkpoints are distinct snapshots by the vendor's own description,
with different OpenRouter records and separate wiki entries, and a mechanical
rebind would have silently moved this
page's prices onto weights it does not describe. The machinery's job is to stop
saying *retired* about a name that was re-pointed, and to hand the successor id
to whoever writes the sentence.

This complements rather than duplicates `derive-successor-from-alias-target`,
which reads `alias_target` off the `~`-prefixed pointer rows. No pointer row
covers this case — `qwen/qwen3.8-max` was an ordinary catalog row, not a `~`
alias — so the two proposals answer "what replaced this" from different
evidence, and a family with neither signal still yields nothing.

The expiry is not urgency about the idea. `previous.json` rotates only when a
fetch differs from `latest`, so the 2026-09-04 snapshot these counts are read
from is days from being unrecoverable (`addictedtoai-64fk`). The row ids and
canonical slugs are written out above so the argument survives the rotation.
