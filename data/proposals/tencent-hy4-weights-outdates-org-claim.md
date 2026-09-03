---
date: 2026-09-02
slug: tencent-hy4-weights-outdates-org-claim
type: repair
summary: >
  Repair content/wiki/org/tencent.md's third paragraph, which says Hy4 preview
  "has not this time" shipped downloadable weights at preview stage and
  reasons "with no published weights there is no third party to host the row".
  Hy4 preview was open-sourced on its release day (2026-08-28): instruct
  weights and an FP8 variant are published on Hugging Face
  (tencent/Hy4-preview, Apache-2.0), ModelScope, GitCode and CNB. The two
  sentences rest on the OpenRouter row's null hugging_face_id, which is a
  field observation, not the absence of weights. The repair keeps the
  snapshot observation (the row's hugging_face_id is still null on
  2026-09-02) and corrects the inference drawn from it.
evidence: >
  - https://huggingface.co/tencent/Hy4-preview — model card and LICENSE file
    (Apache-2.0, "Tencent Hy4 preview is licensed under the Apache-2.0"),
    fetched 2026-09-02
  - https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/ —
    "Tencent has released and open-sourced Tencent Hy4 preview", dated
    2026-08-28, fetched 2026-09-02
  - https://openrouter.ai/tencent/hy4-preview — the OpenRouter row's
    hugging_face_id remains null in the 2026-09-02 snapshot, the field the
    org entry reads, fetched 2026-09-02
  - content/wiki/model/tencent-hy4-preview.md (this job's entry) records the
    open-sourcing as dated facts
---

The org entry's sentence is two claims joined: "the only one of Tencent's
seven rows with no Hugging Face id" (true of the OpenRouter snapshot then and
now) and "which means ... has not this time [shipped downloadable weights]"
(false — the weights are downloadable since release day). The second sentence,
"with no published weights there is no third party to host the row", uses the
same absence as the reason Tencent is the sole provider; the reason is now
stale even though the observation (sole provider Tencent Cloud) still holds.
A repair job would split the snapshot observation from the inference so the
entry stops asserting the opposite of the model card next to the model's own
entry.