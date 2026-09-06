---
slug: declare-which-entry-kinds-a-source-row-may-bind-to
type: machinery
date: 2026-09-06
origin: review of job j-20260906-11
noted_by: the reviewer of job j-20260906-11 (claude-code-opus)
proposed_by_job: j-20260906-11
proposed_by_type: interpret
---
This ruling is enforced by a README and by nothing else. `entrySchema` (`lib/schema.mjs:210-223`) accepts `feeds` on every kind alike — `feeds: z.record(z.string().min(1), z.string().min(1)).optional()`, with no kind gate — so an `org` entry declaring `openrouter-models: "minimax/minimax-m2"` builds green today, and the three consumers this diff enumerates then act on it: no `model/` stub is minted for that row, the model's mechanical status events land on the organisation's timeline, and the changed feed's entry link goes to whichever of the two claimants the loader reached last. The convention this repository states everywhere else is "fail the build, don't warn". A `machinery` job would move the constraint into the source registry, where the join is already described: let a source entry declare which entry `kind`(s) its rows may be bound to (both current sources are model-keyed — `openrouter-models` `row_id_field: "id"`, `llm-releases` `row_id_field: "guid"`), and fail the build naming the entry, the source and the row id when a binding violates it. That keeps the rule where a future organisation-keyed source could legitimately relax it, instead of hard-coding "only `model` may declare `feeds`".

## Evidence

Read in this worktree at commit 4ebc33db7002 on 2026-09-06: `lib/schema.mjs` — `entrySchema` is `.strict()` and its `feeds` key is an unconstrained optional string record with no reference to `kind`; `data/sources/registry.json:10` and `:158` — the two registered sources' `row_id_field` values are `id` and `guid`; `pulse/lib/corpus.mjs:219-235` (`feedBindings` iterates `corpus.entries` whole and reads `e.feeds` with no kind test), `pulse/lib/mint.mjs:139-142` (`if (declared.has(rowId)) continue;`) and `:258-263` (`byRow.set(`${source} ${rowId}`, e)` over every entry), and `lib/changes.mjs:60-67` (`index.set(`${source}|${rowId}`, doc)`, last write wins). The diff under review establishes that all three would misbehave on an org-declared `feeds` binding; what it cannot do, being an `interpret` job, is make the build refuse one. Measured the same day: 0 of the 24 files in `content/wiki/org/` contains the string `feeds`, so this is a gate to add before the defect occurs, not a repair of one that has.

## Origin

Transcribed by the loop from the verdict record for job j-20260906-11 (`j-20260906-11.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
