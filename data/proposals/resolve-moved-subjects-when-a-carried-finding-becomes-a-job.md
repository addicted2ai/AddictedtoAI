---
slug: resolve-moved-subjects-when-a-carried-finding-becomes-a-job
type: machinery
date: 2026-09-02
origin: review of job j-20260902-21
noted_by: the reviewer of job j-20260902-21 (claude-code-opus)
proposed_by_job: j-20260902-21
proposed_by_type: repair
---
A carried finding freezes its `subject:` path at verdict time (`loop/lib/carry.mjs` writes it into `data/carried/`), and the path is replayed verbatim into the repair brief's "Target" line whenever `pulse/lib/queue.mjs`'s `carriedFindingItems` surfaces it. Nothing revisits the path in between. When the subject is a proposal, the interval is exactly where proposals move: a consumed proposal is renamed to `data/proposals/consumed/<slug>.consumed-<timestamp>.md`, so the brief names a file that does not exist and an unlucky runner reports `blocked:` on a repair that was perfectly doable. The job would resolve a vanished subject at the point the finding becomes work — checking `consumed/`, `dropped/` and `rejected/` for the same slug — and either name the resolved path in the brief or say plainly in the brief that the subject moved and where to, so the runner is not left inferring it.

## Evidence

In this diff the brief's stated target is `data/proposals/glm-5-3-license-revenue-gate.md`, which does not exist on the branch. `git log --diff-filter=A` dates the carry file (`data/carried/j-20260902-19-carry-1.md`) to `e612ae6 job j-20260902-19: records (done)` and the archive copy (`data/proposals/consumed/glm-5-3-license-revenue-gate.consumed-20260903T031545.md`) to `104e342 pulse: 2026-09-02 data and content update` — the proposal was consumed after the carry was written and before the repair job started, so the brief shipped a stale path. This author resolved it silently and correctly; the next one has no reason to.

## Origin

Transcribed by the loop from the verdict record for job j-20260902-21 (`j-20260902-21.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
