---
id: technique/retrieval-augmented-generation
kind: technique
display_name: "Retrieval-Augmented Generation"
status: active
maintenance: stable
aliases:
  - name: "Retrieval-Augmented Generation"
    class: exclusive
  - name: "Retrieval augmented generation"
    class: shared
  - name: "RAG"
    class: manual
facts:
  - field: first_published
    source: cited
    value: "2020-05-22"
    source_url: "https://arxiv.org/abs/2005.11401"
    accessed: "2026-08-28"
    volatility: dated
  - field: what_the_paper_trained
    source: cited
    value: "a general-purpose fine-tuning recipe: the query encoder and the seq2seq generator are trained jointly, and the document encoder is not"
    source_url: "https://arxiv.org/abs/2005.11401"
    accessed: "2026-08-28"
    volatility: static
  - field: index_scale
    source: cited
    value: "a dense vector index of 21M 100-word chunks from a December 2018 Wikipedia dump"
    source_url: "https://arxiv.org/abs/2005.11401"
    accessed: "2026-08-28"
    volatility: dated
  - field: natural_questions_result
    source: cited
    value: "44.5 exact match on Natural Questions for RAG-Sequence and 44.1 for RAG-Token, against 41.5 for DPR, 40.4 for REALM and 36.6 for T5-11B with salient span masking"
    source_url: "https://arxiv.org/abs/2005.11401"
    accessed: "2026-08-28"
    volatility: dated
  - field: frozen_document_encoder
    source: cited
    value: "updating the document encoder requires periodically re-indexing every document; the authors report they do not find this step necessary for strong performance"
    source_url: "https://arxiv.org/abs/2005.11401"
    accessed: "2026-08-28"
    volatility: static
  - field: deployed_definition
    source: cited
    value: "load documents, split them, embed the chunks into a vector store, retrieve per question, and put the retrieved text in the prompt — inference-time access to data, with nothing trained"
    source_url: "https://docs.langchain.com/oss/python/langchain/rag"
    accessed: "2026-08-28"
    volatility: slow
  - field: position_sensitivity
    source: cited
    value: "accuracy is highest when the relevant passage sits at the beginning or the end of the input and degrades significantly when it must be read from the middle, even for explicitly long-context models"
    source_url: "https://arxiv.org/abs/2307.03172"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2020-05-22"
    event: "RAG published by Lewis and colleagues at Facebook AI Research, UCL and NYU"
    source_url: "https://arxiv.org/abs/2005.11401"
  - date: "2023-07-06"
    event: "Lost in the Middle measures a U-shaped curve in how models use retrieved passages by position"
    source_url: "https://arxiv.org/abs/2307.03172"
mentions:
  - concept/effective-context-length
  - tool/langchain
  - tool/qdrant
---

The paper that named this is not describing the thing the name now denotes, and
the difference is the training.

**What was published.** Lewis and colleagues (2020-05-22) combined a parametric
memory — a pretrained seq2seq model — with a non-parametric one:
{{fact:technique/retrieval-augmented-generation#index_scale}}. The paper compares two
formulations: RAG-Sequence conditions the whole generated sequence on the same
retrieved passages, and RAG-Token can use a different passage for each token.
Crucially,
{{fact:technique/retrieval-augmented-generation#what_the_paper_trained}}. The
generator learns to use retrieval; retrieval learns which passages that generator
can use.

On open-domain question answering the result was
{{fact:technique/retrieval-augmented-generation#natural_questions_result}} — a
generative model beating the extractive retrieve-and-read architectures that had
owned the benchmark, while also being editable: swap the index, change what the
model knows, no gradient step.

**The shortcut the authors found, and everyone kept.** The obvious design would
learn the document encoder too, so that the index adapts to the task along with
everything else. The authors did not:
{{fact:technique/retrieval-augmented-generation#frozen_document_encoder}}. That
sentence is why the technique propagated. The expensive half was measured to be
optional, which left a design any team could build from an off-the-shelf embedding
model and a vector store.

**What the word means now.** Follow the current mainstream framing —
{{fact:technique/retrieval-augmented-generation#deployed_definition}} — and note
what has gone: the query encoder is no longer trained against the generator, and
the generator is not trained at all. Deployed RAG kept the paper's diagram and
dropped its recipe. It is a prompt-construction strategy that inherited a name
from a fine-tuning result.

**The assumption that inherits badly.** A trained generator learned to attend to
what retrieval handed it. An untrained one only receives it, and position turns
out to matter: {{fact:technique/retrieval-augmented-generation#position_sensitivity}}.
That measurement bears directly on the two easiest knobs in a retrieval pipeline.
Increasing the number of retrieved passages pushes middling-rank passages into the
middle of the prompt, where they are read worst; a reranker earns its cost mainly
by moving the right passage to an end. Neither behaviour is visible in a retrieval
metric — recall counts the passage as retrieved either way.
