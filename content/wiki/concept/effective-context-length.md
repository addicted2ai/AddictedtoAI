---
id: concept/effective-context-length
kind: concept
display_name: "Effective context length"
status: active
maintenance: stable
aliases:
  - name: "Effective context length"
    class: exclusive
  - name: "Effective context"
    class: shared
facts:
  - field: ruler_finding
    source: cited
    value: "of 17 long-context models evaluated, all claiming 32K or more, only half maintained satisfactory performance at 32K"
    source_url: "https://arxiv.org/abs/2404.06654"
    accessed: "2026-08-28"
    volatility: dated
  - field: nolima_finding
    source: cited
    value: "of 13 models claiming at least 128K, 11 fell below half their short-context baseline at 32K"
    source_url: "https://arxiv.org/abs/2502.05167"
    accessed: "2026-08-28"
    volatility: dated
  - field: nolima_gpt4o
    source: cited
    value: "GPT-4o fell from a 99.3% short-context baseline to 69.7% at 32K"
    source_url: "https://arxiv.org/abs/2502.05167"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2024-04-09"
    event: "RULER published, adding multi-hop tracing and aggregation tasks to needle-in-a-haystack"
    source_url: "https://arxiv.org/abs/2404.06654"
  - date: "2025-02-07"
    event: "NoLiMa published, removing literal overlap between question and needle"
    source_url: "https://arxiv.org/abs/2502.05167"
mentions:
  - concept/kv-cache
---

Advertised context length is how many positions a model will accept without
erroring. Effective context length is how far in it still does the task. Both
numbers are published; only one of them is on the model card.

The gap stayed invisible because of the test that made long context legible in
the first place. Needle-in-a-haystack hides a sentence in a long document and
asks for it back, and models pass it at their full advertised length. Its flaw is
structural: the needle usually shares words with the question, so the model can
find it by literal matching, and no long-range understanding is required to score
well.

Two benchmarks were built to close that hole, ten months apart, and they agree.

**RULER** (NVIDIA, 2024-04-09) keeps the needle test and adds needles of varying
type and quantity, plus two categories that literal matching cannot solve:
multi-hop tracing, which follows a chain of variable assignments, and
aggregation, which requires touching the whole input. Seventeen models, thirteen
tasks. Nearly all scored close to perfectly on plain needle retrieval; nearly all
degraded as the input grew; and of models advertising 32K or more, only half held
satisfactory performance at 32K. The paper singles out Yi-34B, advertised at
200K, as having "large room for improvement" as length and task complexity rise.

**NoLiMa** (2025-02-07) attacks the same weakness from the other side: it builds
needles with minimal lexical overlap with the question, so locating one requires
inferring a latent association rather than matching a string. Of thirteen models
advertising at least 128K, eleven fell below half their short-context baseline by
32K. GPT-4o, among the strongest tested, fell from 99.3% to 69.7%.

The two results describe one phenomenon. What degrades with length is not the
ability to hold text — the KV cache addresses every position it was built for —
but the ability to find the relevant span when nothing lexical points at it.
Retrieval that a keyword search would also solve survives long inputs. Retrieval
that requires a semantic hop does not.

Practical consequence: an advertised context number is a statement about
addressable positions, and a claim about usable length needs a named benchmark, a
length, and a date. The two above are the ones designed to answer it, and both
publish per-length curves rather than a single number, because the answer is a
curve.
