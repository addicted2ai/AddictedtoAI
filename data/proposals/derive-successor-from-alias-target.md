---
slug: derive-successor-from-alias-target
type: machinery
date: 2026-09-04
origin: review of job j-20260904-25
noted_by: the reviewer of job j-20260904-25 (claude-code-opus)
proposed_by_job: j-20260904-25
proposed_by_type: repair
---
Thread OpenRouter's `alias_target` into the derived layer so that "what replaces this row" is a computed fact rather than something a model re-derives by hand on every deprecation. The feed carries pointer rows — ids prefixed `~`, e.g. `~z-ai/glm-flash-latest`, described as "This model always redirects to the latest model in the GLM Flash family" — whose `alias_target: {name, slug}` names the current member of a family. A machinery job would read those rows in `pulse/lib/`, build a family -> current-slug map, and expose on each deprecated row the pointer row that shares its family, so the changed feed and the wiki entry can render a successor link with no inference at all. It is squarely Pulse work: deterministic, model-free, derived every run, and it does not choose between readings — where no pointer row covers a family it produces nothing, exactly as the mint refusal does.

## Evidence

Reviewing this diff required establishing by hand that `z-ai/glm-5.3-flash` succeeds `z-ai/glm-4.7-flash`, and the decisive evidence was a field no annotation has ever cited. Read from `data/sources/openrouter-models/latest.json` (date 2026-09-04) and confirmed live against https://openrouter.ai/api/v1/models (HTTP 200, fetched 2026-09-04, 426 rows): `~z-ai/glm-flash-latest` carries `alias_target: {"name":"Z.ai: GLM 5.3 Flash","slug":"z-ai/glm-5.3-flash"}`. Enumerated every row in that snapshot carrying the field rather than sampling: 13 pointer rows across 7 vendors, including `~anthropic/claude-opus-latest -> anthropic/claude-opus-5`, `~google/gemini-flash-latest -> google/gemini-3.8-flash`, `~openai/gpt-latest -> openai/gpt-5.6-sol`, `~moonshotai/kimi-latest -> moonshotai/kimi-k3` and `~z-ai/glm-latest -> z-ai/glm-5.3`. So this is a general feed feature, not one z-ai quirk. Two annotations have now spent model time on the successor question and reached opposite answers from the same feed (j-20260902-02, "no successor row is identifiable from the feed"; j-20260904-25, naming one) — which is the signal that the question deserves to be answered mechanically once instead of judged repeatedly. It is a complement to, not a duplicate of, the two standing proposals that touch this ground: `freeze-last-known-facts-on-retirement` and `batch-cohort-vanished-row-repairs` both explicitly leave "is there a successor row to rebind to" with the model. This proposes supplying that answer, from the feed, only in the cases where the feed states it.

## Origin

Transcribed by the loop from the verdict record for job j-20260904-25 (`j-20260904-25.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
