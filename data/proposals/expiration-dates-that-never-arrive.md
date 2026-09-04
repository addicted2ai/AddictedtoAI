---
slug: expiration-dates-that-never-arrive
type: post
date: 2026-09-04
origin: review of job j-20260904-08
noted_by: the reviewer of job j-20260904-08 (claude-code-opus)
proposed_by_job: j-20260904-08
proposed_by_type: interpret
---
A post measuring what OpenRouter's `expiration_date` has actually been worth, from this repository's own snapshot history rather than from any vendor statement. Eight daily snapshots (2026-08-28 to 2026-09-04) contain four rows that carried a death date, and not one of those dates has ever elapsed into a retirement: kimi-k2.5 held 2026-08-31 for three snapshots and cleared it on the day it fell due; glm-4.5v dropped 2026-12-31 and restored it four days later; nex-n2-mini and nex-n2-pro announced 2026-09-04 on 2026-09-01 and pushed it to 2026-09-08 the very next day. The piece would say plainly what that means for a reader planning a migration — the marker is a soft, movable, and so far unfulfilled schedule — and would qualify the site's own derived `deprecated` badges, which is a thing the site can say about itself that no vendor page will. Best written after 2026-09-08 and 2026-09-10, when it can also report whether those two dates were kept.

## Evidence

Measured during this review by walking every committed version of data/sources/openrouter-models/latest.json with git show from a Node script: 2026-09-01 nex-n2-mini/pro expiration_date "2026-09-04"; 2026-09-02 through 2026-09-04 the same rows read "2026-09-08" — a four-day deferral that emitted no change record at all, because the derived status stayed `deprecated` and expiration_date is not itself a material field. kimi-k2.5: "2026-08-31" on the 08-28, 08-29 and 08-30 snapshots, null from 08-31. glm-4.5v: "2026-12-31" on 08-28, null 08-29 to 09-01, "2026-12-31" again from 09-02. The interpretation already in data/changes.jsonl for the nex-n2 rows (j-20260901-08, j-20260901-09) forecast `retired` "once 2026-09-04 passes"; today is 2026-09-04 and both rows are live with a 2026-09-08 date instead. The schema wording quoted by j-20260902-02 — https://openrouter.ai/openapi.json, components.schemas.Model.properties.expiration_date, "the date after which the model may be removed" — is the vendor's own hedge.

## Origin

Transcribed by the loop from the verdict record for job j-20260904-08 (`j-20260904-08.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
