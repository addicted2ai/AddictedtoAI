---
date: 2026-09-06
slug: pulse-probe-declared-upstream-repos
type: machinery
summary: >
  Add a Pulse step that resolves the `hugging_face_id` each OpenRouter catalog
  row declares, and turns an unreachable one into a repair finding in the
  derived queue. The Pulse already treats a declared feed row id that vanishes
  from a snapshot as a repair finding (specs/wiki, "A vanished row cannot pose
  as current"); the same reasoning applies one hop further out, to the upstream
  weights repository a live row points at. Today nothing reads that field at
  all, so a row can keep selling inference against a repository that has been
  withdrawn and the site records it as ordinary. The job would probe each
  declared id once per Pulse run, record status per id beside the snapshot, and
  raise a finding only on a non-200 — it would NOT change the row's `status`,
  delist it, or infer why the repo is gone, because a 401 from a model host is
  a fact about reachability and nothing more.
evidence: >
  Measured on 2026-09-06 while writing `org/microsoft`, against the committed
  snapshot `data/sources/openrouter-models/latest.json` (`fetched_at`
  2026-09-05T06:00:04.599Z, `row_count` 431) and the live
  `https://openrouter.ai/api/v1/models`.
  (1) 179 of the 431 rows declare a `hugging_face_id`. Probing
  `https://huggingface.co/api/models/<id>` once for each: 178 answer HTTP 200,
  and exactly one does not — `microsoft/wizardlm-2-8x22b`, whose declared id
  `microsoft/WizardLM-2-8x22B` answers HTTP 401 with
  `{"error":"Invalid username or password."}`. The repository page
  `https://huggingface.co/microsoft/WizardLM-2-8x22B` answers 401 as well, and
  `https://huggingface.co/api/models?author=microsoft&search=wizard` returns an
  empty array.
  (2) That row is not dormant. `https://openrouter.ai/api/v1/models/microsoft/
  wizardlm-2-8x22b/endpoints` returns a live endpoint, "Novita |
  microsoft/wizardlm-2-8x22b", with `uptime_last_30m` 100 — so the catalog is
  carrying a purchasable row whose declared upstream has been unreachable since
  April 2024, per
  `https://www.404media.co/microsoft-deleted-its-llm-because-it-didnt-get-a-safety-test-but-now-its-everywhere/`
  (23 April 2024, retrieved 2026-09-06).
  (3) The one hit in 179 is the argument for the check rather than against it:
  the sweep is cheap, it is almost always silent, and the single case it found
  had gone unnoticed for twenty-eight months and was found by hand.
proposed_by_job: j-20260906-09
proposed_by_type: entry
---

The Pulse's existing guarantee stops one hop short of where the reader is.
A declared feed row id that disappears from a snapshot already produces a repair
finding and renders its last-known value with an as-of date, because a
disappearance is exactly the kind of thing prose must not be allowed to paper
over. But the row itself carries a second declared pointer — `hugging_face_id`,
the upstream weights repository — and that pointer is read by nothing in this
repository. Its truth is currently established only when a human happens to
follow it.

The asymmetry matters because the two pointers fail in opposite directions. A
vanished feed row is loud: the model stops being purchasable and the catalog
notices. A vanished upstream repository is silent: the row stays live, the price
stays current, uptime stays at 100, and the only thing that has changed is that
the artefact the row names can no longer be inspected by anyone deciding whether
to trust it. That is the state `microsoft/wizardlm-2-8x22b` has been in since
April 2024, and it is the state the corpus recorded as unremarkable until this
week.

Scope discipline is the whole design here, and it is why this is worth writing
down rather than improvising later. The check should answer one question — does
the declared id resolve — and stop. It should not conclude the model is dead: a
401 from Hugging Face does not distinguish deleted from private from gated, and
the surviving public weights for this particular model are a third-party mirror
that is entirely reachable. It should not edit the row's `status`, which is
feed-bound and belongs to the router. It should not go looking for a
replacement repository, because choosing which stranger's re-upload counts as
the real weights is an editorial judgment and this is a probe. A finding in the
queue, naming the row and the status code, hands that judgment to a person.

Cost is small and bounded: one HEAD request per declaring row, 179 today, and
the result is a per-id status file beside the snapshot that a later job can
diff. The failure mode to guard against is the obvious one — a Hugging Face
outage marking 179 rows unreachable at once — which argues for raising a finding
only when a single id fails against a mostly-healthy sweep, and for recording
the sweep's own success rate alongside it.
