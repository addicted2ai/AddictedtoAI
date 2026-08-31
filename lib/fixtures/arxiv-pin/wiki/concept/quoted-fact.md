---
id: concept/quoted-fact
kind: concept
display_name: "Quoted Fact"
status: active
maintenance: stable
aliases:
  - name: "Quoted Fact"
    class: exclusive
facts:
  - field: quoted_definition
    source: cited
    value: "\"a definition reproduced word for word from the abstract\""
    source_url: "https://arxiv.org/abs/2206.07682"
    accessed: "2026-08-28"
    volatility: static
  - field: paraphrased_finding
    source: cited
    value: "two metrics account for most of the claimed abilities"
    source_url: "https://arxiv.org/abs/2206.07682"
    accessed: "2026-08-28"
    volatility: static
  - field: embedded_quotation
    source: cited
    value: "the three phases in order — \"a full sentence lifted verbatim from the paper's own abstract\" — with the summary around it written here"
    source_url: "https://arxiv.org/abs/2301.05217"
    accessed: "2026-08-28"
    volatility: static
  - field: embedded_term
    source: cited
    value: "the finetuned model, given \"A is B\", cannot answer the reverse"
    source_url: "https://arxiv.org/abs/2309.12288"
    accessed: "2026-08-28"
    volatility: static
  - field: pinned_quotation
    source: cited
    value: "\"a second definition, reproduced word for word, correctly pinned\""
    source_url: "https://arxiv.org/abs/2304.15004v4"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2022-06-15"
    event: "\"Emergent Abilities of Large Language Models\" posted, naming the idea"
    source_url: "https://arxiv.org/abs/2206.07682"
mentions: []
---

A concept entry whose facts exercise every front-matter case: a value that is
entirely a quotation and must be pinned; a paraphrase citing the very same paper
that must stay unversioned; a paraphrase with a verbatim sentence EMBEDDED in
it, which must be pinned too, because the rule is about the quotation and not
about how much of the field it fills; an embedded quoted TERM, which is below
the word floor and must not demand a version; and a quotation already pinned.
The timeline quotes a TITLE, which is not a quotation from the document and is
out of scope.
