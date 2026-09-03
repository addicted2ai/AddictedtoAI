---
slug: unit-literal-after-transclusion-lint
type: machinery
date: 2026-09-03
origin: review of job j-20260903-07
noted_by: the reviewer of job j-20260903-07 (claude-code-opus)
proposed_by_job: j-20260903-07
proposed_by_type: repair
---
Add a prebuild step that fails the build when a unit-rendering transclusion is immediately followed by a prose literal duplicating the rendered unit — "tokens" after a fact whose FEED_UNITS entry is "tokens", "per token"/"USD"/"Mtok" after a "USD per token" fact — scanning the text that follows the closing braces across line wraps rather than per line. The corpus already fails the build on unknown front-matter keys, bogus mentions and unresolved transclusions; this is the same class and the same remedy. It also addresses the real cause rather than the instance: adding a path to lib/units.mjs silently changes how every piece of prose that already transcludes that path reads, and nothing today tells the author which pages just changed meaning.

## Evidence

Measured on branch job/j-20260903-07 at 2196fc1cc6a9, 2026-09-03. Two successive hand sweeps of this exact defect class, each reviewed, still needed a machine to close: the author's same-line pattern found four of the six instances; the pass-1 reviewer's cross-newline scan found the fifth (openai-gpt-5-4.md:55-56, where the transclusion ended one line and the literal "tokens." opened the next). My own scan of all 368 transclusions in content/ — 152 of them targeting a fact that unitFor() gives a unit, 0 targets unresolvable — now returns 0 suspects, but only because it reads 60 characters past the closing braces including newlines. Separately, seven of the seven figures the sweep's own drop record quotes for the lines it judged clean do not match what lib/facts.mjs renders for those transclusions, which is what a hand audit of rendered output costs and a mechanical check does not.

## Origin

Transcribed by the loop from the verdict record for job j-20260903-07 (`j-20260903-07.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
