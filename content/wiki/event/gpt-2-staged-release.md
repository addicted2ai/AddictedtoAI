---
id: event/gpt-2-staged-release
kind: event
display_name: "The GPT-2 Staged Release"
status: dead
maintenance: dormant
themes:
  - history
  - argument
aliases:
  - name: "GPT-2 staged release"
    class: exclusive
  - name: "staged release"
    class: shared
  - name: "GPT-2"
    class: manual
facts:
  - field: parameters
    source: cited
    value: "1.5 billion (1542M), a 48-layer Transformer"
    source_url: "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf"
    accessed: "2026-08-28"
    volatility: static
  - field: training_data
    source: cited
    value: "WebText: about 8 million documents, 40 GB of text, from outbound Reddit links with at least 3 karma"
    source_url: "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf"
    accessed: "2026-08-28"
    volatility: static
  - field: release_stages
    source: cited
    value: "124M in February, 355M in May, 774M in August, 1.5B in November 2019"
    source_url: "https://arxiv.org/abs/1908.09203"
    accessed: "2026-08-28"
    volatility: static
  - field: detector_accuracy
    source: cited
    value: "about 95% on 1.5B outputs, RoBERTa-based classifier"
    source_url: "https://arxiv.org/abs/1908.09203"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2019-08-24"
    event: "OpenAI posts the first version of 'Release Strategies and the Social Impacts of Language Models', accompanying the 774M release"
    source_url: "https://arxiv.org/abs/1908.09203"
  - date: "2019-11-13"
    event: "the updated report accompanies the release of the full 1.5 billion parameter model, nine months after the first announcement"
    source_url: "https://arxiv.org/abs/1908.09203"
mentions:
  - org/openai
  - concept/scaling-laws
---

In February 2019 OpenAI announced a language model and declined to release
most of it — the event that made "release strategy" a topic in machine
learning. The paper trail is unusually complete, because the company
published a report on its own decision, in two dated versions, and the
report is franker than the coverage was.

The model: GPT-2, "a 1.5B parameter Transformer that achieves state of the
art results on 7 out of 8 tested language modeling datasets in a zero-shot
setting but still underfits WebText." WebText itself is the quietly
influential invention — no curated corpus, just the text of about 8 million
web pages, 40 GB, harvested from every outbound Reddit link that had earned
at least 3 karma, "a heuristic indicator for whether other users found the
link interesting, educational, or just funny." Internet points as a data
filter, at the foundation of everything that followed.

The decision: release the 124 million parameter version in February and
withhold the rest, "due to concerns about the potential for misuse, such
as generating fake news content, impersonating others in email, or
automating abusive social media content production." Then a staircase: the
355M model in May, 774M in August, and the full 1.5B in November 2019.
"This delay of nine months allowed time between model releases to conduct
risk and benefit analyses as model sizes increased" — and, in one of the
report's more candid aims, gave "the general public time to adapt to a
world in which it is prudent to mistrust everything they read a little
more."

What the monitoring actually found is the part worth keeping. "Our threat
monitoring did not find evidence of GPT-2 direct misuse in
publicly-accessible forums but we did see evidence of discussion of
misuse" — discussion that had declined by May, from actors who
"demonstrated limited technical understanding of ML." Partner research at
Cornell found that people rated cherry-picked GPT-2 news continuations as
credible about 66% of the time at 355M and around 75% at the larger sizes,
and that among survey respondents who doubted the stories, "none indicated
that they believed the story did not have a human author." OpenAI's own
detection work landed at a RoBERTa-based classifier that catches 1.5B
outputs with roughly 95% accuracy — good, and openly described as a moving
target in "a cat and mouse game."

The report also concedes the argument its critics had made from the start.
Since the small model and the paper were already public, "'security
through obscurity' is not a valid release strategy going forward because
motivated actors can still replicate results even if we choose not to
release." Replications duly appeared: two students at Brown published a
GPT-2-scale model in part to prove the point, while Connor Leahy at the
Technical University of Munich "wrote about his intent to publish a
replicated version of GPT-2 but changed his mind after discussion with
researchers." The staged release did not keep the capability scarce. What
it did — visible in the report's inventory of partnerships, legal
templates for model sharing, and detection baselines — was manufacture
the first public infrastructure for arguing about releases at all.

The era's flavor is preserved in two details of the record. The famous
demo output was a news story about talking unicorns in the Andes, labeled
in the paper as a cherry-pick of ten samples. And a footnote reports that
Alec Radford, testing himself against his own model on trivia questions,
"answered 17 of 100 randomly sampled examples correctly," followed by a
smaller-type correction: "He actually only got 14 right but he should have
gotten those other 3." The paper that started the argument about whether
machines write too convincingly contains, in its published PDF, a joke
about a human padding his score.
