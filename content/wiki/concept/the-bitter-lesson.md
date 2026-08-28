---
id: concept/the-bitter-lesson
kind: concept
display_name: The Bitter Lesson
status: active
maintenance: stable
themes:
  - argument
  - culture
  - history
aliases:
  - name: The Bitter Lesson
    class: exclusive
  - name: bitter lesson
    class: shared
facts:
  - field: author
    source: cited
    value: "Richard S. Sutton"
    source_url: "https://en.wikipedia.org/wiki/Bitter_lesson"
    accessed: "2026-08-28"
    volatility: static
  - field: published
    source: cited
    value: "2019-03-13"
    source_url: "https://en.wikipedia.org/wiki/Bitter_lesson"
    accessed: "2026-08-28"
    volatility: static
  - field: venue
    source: cited
    value: "incompleteideas.net, the author's personal site"
    source_url: "https://en.wikipedia.org/wiki/Bitter_lesson"
    accessed: "2026-08-28"
    volatility: static
  - field: thesis
    source: cited
    value: "general methods that leverage computation are ultimately the most effective, and by a large margin"
    source_url: "https://braddelong.substack.com/p/hoistedcrosspost-richard-s-sutton"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2019-03-13"
    event: "essay published on the author's personal site"
    source_url: "https://en.wikipedia.org/wiki/Bitter_lesson"
  - date: "2019-03-19"
    event: "Rodney Brooks publishes the rebuttal, A Better Lesson"
    source_url: "https://rodneybrooks.com/a-better-lesson/"
  - date: "2025-09-26"
    event: "Sutton argues on the Dwarkesh Podcast that LLMs are not what the lesson recommends"
    source_url: "https://www.dwarkesh.com/p/richard-sutton"
mentions:
  - event/alphago-lee-sedol
  - concept/scaling-laws
---

Richard Sutton published a short essay on his own website on
13 March 2019, under the title [The Bitter
Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html). The claim:
"The biggest lesson that can be read from 70 years of AI research is that
general methods that leverage computation are ultimately the most effective,
and by a large margin." The supporting cases are chess, where Deep Blue's
search beat the knowledge-engineering programme in 1997; Go, where the same
pattern repeated two decades later; and the DARPA speech competitions of the
1970s, where statistical methods based on hidden Markov models beat the
linguists. In each, researchers had invested in encoding what humans know
about the domain, and in each that investment was overtaken by methods that
mostly consumed more compute.

Two things about its reception are worth having in one place.

**The rebuttal came six days later and is rarely read.** Rodney Brooks
published *A Better Lesson* on 19 March 2019 with six numbered objections. The
sharpest is not that Sutton is wrong about compute but that the human
knowledge never left — it moved. Convolutional networks have translation
invariance designed in by hand at the front end. Somebody chooses the
architecture and the training regime. Somebody assembles and labels the
dataset, and "this is just as much building knowledge in as it would be to
directly build a color constancy stage. It is sleight of hand in moving the
human intellectual work to somewhere else." Brooks' proposed replacement
lesson is an accounting one: "we have to take into account the total cost of
any solution, and that so far they have all required substantial amounts of
human ingenuity." He closes by noting his review is "seventy six words shorter
than Sutton's post."

**The author does not accept the use the essay is put to.** The bitter lesson
is routinely cited as the intellectual licence for scaling language models.
Sutton disagrees. On the Dwarkesh Podcast published 26 September 2025 — the
episode is titled "Richard Sutton – Father of RL thinks LLMs are a dead end" —
he placed language models on the human-knowledge side of his own dichotomy,
not the compute side: "The more human knowledge we put into the large language
models, the better they can do. So it feels good. Yet, I expect there to be
systems that can learn from experience." Such systems, on his account, have
historically eaten the lunch of knowledge-heavy ones — which is the essay's
argument, aimed at the thing the essay is usually quoted to defend. His
specific objection is that a model with no goal and no ground truth cannot be
surprised by an outcome, and so cannot learn while it operates.

That leaves the essay in an unusual position: the most-quoted argument in
favour of the current paradigm, disputed by its author, with a substantive
rebuttal published within the week that most of the people quoting it have
never seen. It is worth reading all three primary documents before citing any
of them; each is short.
