---
date: 2026-09-05
slug: artificial-analysis-indices-rebased-invisibly
type: machinery
summary: >
  The `openrouter-models` rows carry a `benchmarks.artificial_analysis` block —
  `agentic_index`, `coding_index`, `intelligence_index` — that the source
  registry does not list in `yields`, so it reaches no snapshot diff, no
  catalog column, no entry fact and no changed-feed line. Between the
  2026-09-04 and 2026-09-05 snapshots those numbers moved on 165 of the 179
  rows that carry them, in one direction only, and the site recorded nothing.
  The proposed job decides the question the registry's own
  `material_fields_note` already decided for price — is this a column, a fact,
  an event, or none of those — and writes the decision down beside that note
  with the measurement behind it, rather than leaving the field unyielded by
  default. The likely answer is that it is NOT an event, for the same reason
  price is not: the movement looks like an upstream rescoring, not the world
  changing. But "not an event" recorded is a different state from "never
  looked at", and only the first survives the next reader.
evidence: >
  Measured 2026-09-05 on this repository's own snapshots,
  `data/sources/openrouter-models/{previous,latest}.json` (fetched
  2026-09-04T06:00:03Z and 2026-09-05T06:00:04Z), 425 rows present in both.
  179 carry `benchmarks.artificial_analysis`; 165 of those saw it change
  overnight. Per field, over the rows carrying both readings — `agentic_index`:
  97 down, 0 up, 14 unchanged, 68 null/number transitions;
  `intelligence_index`: 50 down, 0 up, 16 unchanged, 113 transitions;
  `coding_index`: 176 unchanged, 1 up, 2 down. Worked example:
  `ibm-granite/granite-4.2-8b` went agentic 9.2 -> 3.8 and intelligence
  19.6 -> 13.9 with coding steady at 22.4, and `benchmarks` was the ONLY
  top-level key of that row to change between the two snapshots.
  `anthropic/claude-fable-5.1`, `anthropic/claude-haiku-4.5` and their `:batch`
  twins moved the same shape the same night.
  Currently invisible: `grep -c artificial_analysis data/changes.jsonl` is 0
  over the whole change log, and `benchmarks` appears nowhere in the
  `openrouter-models` entry of `data/sources/registry.json`.
expires: 2026-09-12
---

Noticed while repairing the vanished `ibm-granite/granite-4.1-8b` row: the
2026-09-04 and 2026-09-05 rows for its sibling `granite-4.2-8b` are identical
in every top-level key but `benchmarks`, where two indices both fell by roughly
a third.

The shape of the move is the argument. Zero of 147 numeric changes across
`agentic_index` and `intelligence_index` went up, while `coding_index` sat
still on 176 of 179 rows. One hundred and sixty-five models do not get worse at
agentic work overnight and stay exactly as good at coding. Something upstream
was re-scored or re-normalised, and the honest reading is the one the registry
already applies to `pricing.prompt`: the value is verbatim but what it measures
moved, so a movement is an artifact of the publisher's method rather than a
fact about the model.

That is a reason to *decide* about the field, not a reason to keep ignoring it.
The registry's `material_fields_note` exists precisely because deleting a field
and marking it `event: false` look the same from the outside and are not the
same thing — the note names that trap (`addictedtoai-8ho`). `benchmarks` is
currently in the third state, neither carried nor consciously refused: it is
simply absent from `yields`, which is what a field looks like when it was added
to the upstream API after the registry entry was written. A machinery job
should yield it or record why it does not, and if it yields it, say in the same
breath whether a move in it is an event, a column, or only a fact — with this
measurement as the reason.

The expiry is not urgency about the idea, which will keep. It is that
`previous.json` only rotates when a fetch differs from `latest`, so the
2026-09-04 reading behind these counts is a few days from being unrecoverable
(`addictedtoai-64fk`). The numbers above are written out here so the argument
survives the rotation; a job that wants to re-measure rather than trust them
has to start soon.
