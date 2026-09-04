# Evidence — re-verification of Meta Muse Spark flagship weights state

Job j-20260903-14 (verify). Re-checked, against Meta's own channels rather
than the third-party catalogue, whether the Muse Spark flagship weights have
moved from "pending". Raw transcript: `verify-meta-spark-weights-pending-status.raw.txt`
in this directory (single run of a node fetch+strip+count script, 2026-09-03).

## What was fetched (all 2026-09-03, all HTTP 200)

| Source | Result |
|---|---|
| research.meta.ai/blog/introducing-muse-code-and-muse-spark-1-2 (Meta's 1.2 announcement, Aug 5, 2026) | `weights`=0, `open-source`=0, `license`=0, `pending`=0, `open`=0 — says nothing about weights at all |
| research.meta.ai/blog/introducing-muse-spark-1-3 (Meta's 1.3 announcement, Sep 2, 2026) | `weights`=1, `open weights release`=1 — the roadmap line below; `open-source`=0, `license`=0, `pending`=0 |
| about.fb.com/news/2026/04/... (April announcement, the corpus's cited source) | `weights`=0, `open-source`=1 — "we hope to open-source future versions of the model" still live |
| huggingface.co/meta-models (org listing) | `spark`=0 — no Muse Spark repo at all; the org carries only the Muse Glimmer family |
| huggingface.co/models?search=muse+spark | only `MuseSparkAI/musespark-video` (unrelated third party), no Meta repo |
| llm-releases.com/models/muse-spark-1-2 and /muse-spark-1-3 (the badge's own source) | both still: "License Open weights · Meta license (weights pending)" and "Weights Not released" |

## The one new primary-source statement

The 1.3 announcement's closing "Looking Forward" paragraph (sole `weights`
hit on the page):

```
We have an exciting roadmap lined up, including bigger models, the Muse Spark
open weights release, and more. Stay tuned.
```

Meta's own channel therefore now *confirms* the pending state — the open
weights release is named on the roadmap, explicitly not yet shipped ("Stay
tuned"). The April "we hope to open-source future versions of the model"
remains live on about.fb.com. The 1.2 announcement contains no weight or
license statement at all, and the about.fb.com newsroom search for "muse
spark" returns only the April 8 post — no separate newsroom pages for 1.2 or
1.3 exist.

## The "Meta license (weights pending)" license-text check

No Meta license text carries that name. Checked instruments: the HF license
tag on Meta's only open-weight repo (meta-models/Muse-Glimmer-30B is tagged
`license:apache-2.0`); the HF models filter `other=meta-license` (empty
result set); the meta-models and meta-llama org pages (no such license name
rendered); both Meta announcement pages (no license text); llm-releases'
own methodology page, which describes licenses resolving "to a known
family". The name appears only as the badge on llm-releases' own Spark 1.2 /
1.3 cards, which cite no Meta document for it.

## Fact-by-fact result

| field | prior value | primary sources support | action |
|---|---|---|---|
| `flagship_weights` | "closed; Meta says it hopes to open-source future versions of the model" (cited to the April about.fb.com post) | Weights not released; Meta's 1.3 announcement names "the Muse Spark open weights release" on its roadmap | **updated** — value now states the pending state on Meta's own September authority, source_url moved to the 1.3 announcement |
| `flagship_weights_listing` | "listed 'Open weights · Meta license (weights pending)' with weights 'Not released'" (cited to llm-releases) | Badge unchanged on both cards, fetched today; the license name it quotes exists nowhere on Meta's channels | **updated** — value kept and sharpened with the license-name finding |

Both `accessed:` stamps stay 2026-09-03, the real date this check ran. The
checks FAILED in the sense the proposal named ("has the state moved?") — it
has not moved; the finding is that the pending state is now confirmed by
Meta's own announcement rather than resting on the third-party badge alone.

## Files changed

- `content/wiki/org/meta-superintelligence-labs.md` — the two facts above
- `data/reviews/evidence/verify-meta-spark-weights-pending-status.raw.txt` — this run's transcript
- `data/reviews/evidence/verify-meta-spark-weights-pending-status.md` — this narrative