---
title: How a model reads your documents
level: mechanics
outcome: >-
  You can trace a question through retrieval — chunking, embedding, search and
  pasting — and say which stage failed when a document-grounded answer is wrong.
prerequisites:
  - how-machines-represent-meaning
  - why-context-is-not-memory
  - how-models-are-trained
mentions:
  - technique/retrieval-augmented-generation
  - concept/embeddings
  - concept/effective-context-length
---

Upload a staff handbook to a chat product and ask how much notice unpaid leave
requires. The answer arrives with a source attached: section 4.2. Open section
4.2. It is about unpaid leave, it is the right section, and it says nothing
about notice.

Nothing there is broken. The citation is real, the section is the correct one,
and the answer is still wrong. That combination is what the ordinary failure of
a document-grounded system looks like, and it becomes legible the moment you
know what the product actually did with the handbook.

## Nothing was learned and nothing was stored

The model did not change. Its weights were fixed when [training
ended](/learn/how-models-are-trained), they are identical before your upload
and after it, and the next person to ask will be talking to the same model you
were. Whatever the interface implies, no part of your handbook is inside it.

What happened instead was a search, assembled from parts that each have a name.

The handbook was cut into passages of a few hundred words. Those passages are
chunks. Each chunk went through an embedder and came back as [a position on a
map](/learn/how-machines-represent-meaning), and the positions were filed in a
store that records, for each one, which chunk it came from. That store is the
index. Your question went through the same embedder and became a position too.
The index handed back the few chunks whose positions sat nearest it. Their text
was pasted into the model's input above your question, and the model answered a
prompt it had never seen, containing text it had never seen.

That is the whole arrangement. The field calls it
[retrieval-augmented generation](/wiki/technique/retrieval-augmented-generation),
shortened to RAG, and the name is worth having mainly so you can recognise the
thing in somebody else's writing. The letters explain nothing. The shape
explains everything: a product that says it has read your documents has done no
reading. It arranged for a search to put a few paragraphs in front of the model
a moment before the model spoke.

## The obvious alternative, and why nobody takes it

Why not train the model on the handbook and skip the search? [The training
page](/learn/how-models-are-trained) gives the reason in principle: facts belong
in retrieval, where they can be corrected without a training run and cited when
used. There is also a measurement. In December 2023, [Fine-Tuning or
Retrieval?](https://arxiv.org/abs/2312.05934) compared the two approaches across
knowledge-intensive tasks and reported that "while unsupervised fine-tuning
offers some improvement, RAG consistently outperforms it, both for existing
knowledge encountered during training and entirely new knowledge." The same
abstract puts the blunter half plainly: "LLMs struggle to learn new factual
information through unsupervised fine-tuning". What did help was exposing the
model to many variations of the same fact.

That detail explains the result. Training moves an enormous number of weights by
a tiny amount per example, so a sentence seen once, in one phrasing, is a faint
nudge competing with everything else the run is nudging. Getting it back out
reliably means writing it many times in many ways, which is an absurd thing to
do to a handbook that already states it once, clearly, in section 4.2.

The second problem has nothing to do with accuracy and is the worse of the two.
A fact absorbed into weights has no address. Nobody can point at it, amend it
when the policy changes, or remove it when it turns out to have been
confidential, and the model cannot cite it, because there is no longer a thing
there to cite. Retrieval leaves facts in files. Files can be corrected,
versioned, permissioned and quoted.

## The cut happens before anything is searched

Chunking looks like plumbing, and a surprising share of wrong answers are
decided there. The reason is that the unit which gets embedded is the chunk, by
itself. Not the document. Not the chunk before it. A chunk carries no memory of
the heading three pages up, and its position on the map is computed from its own
words alone.

Prose is not written to survive that. A section heading announces its subject
once and the following four pages never repeat it. A table's meaning lives in
column headers that a cut can strand from the rows beneath them. A paragraph
opens "This does not apply to contractors" and the antecedent of "this" sits in
the previous chunk, which leaves the exemption filed under a subject it never
names.

Exceptions suffer most, and it is a consequence of how documents are written.
The rule is stated first and the qualification follows it, so the qualification
is the part most likely to end up alone in a chunk that does not say what it
qualifies. What you get is a retriever that reliably finds the rule and reliably
misses the carve-out. That is the exact recipe for a confident, sourced, wrong
answer about your own policy.

## Nearness is the only question the search asks

[The map's signature](/learn/how-machines-represent-meaning) is that it is
uncanny at roughly and unreliable at exactly. Retrieval is where that stops
being a curiosity, because nobody opens a handbook for the gist. They open it
for the number, the deadline, the version a rule applies to, and the sentence
saying when it does not. Those are the *exactly* cases, and nearness has no
purchase on them. A passage saying a policy does not apply keeps the same
company as one saying it does. Last year's figure and this year's figure sit
almost on top of each other, and the difference between them is the only thing
you asked about.

So the retriever returns something. It always returns something. Ranked by
distance, the top result is whatever was closest, and closest carries no promise
of containing an answer.

How much that costs was measured, and the number runs the wrong way from
intuition. In January 2024, [The Power of
Noise](https://arxiv.org/abs/2401.14887) varied what went into the retrieved set
and found that "the retriever's highest-scoring documents that are not directly
relevant to the query (e.g., do not contain the answer) negatively impact the
effectiveness of the LLM." Then the finding that makes the point: "adding random
documents in the prompt improves the LLM accuracy by up to 35%."

Put those two results side by side. **The retriever's second-best guess does
more damage than a random passage: irrelevance is visible and gets ignored,
while a near miss is topical, fluent, written in your document's own voice, and
answers the question next to the one you asked.** It is the material a wrong
answer needs in order to look sourced.

## After the paste it is ordinary input

Once the chunks are in the input they hold no special standing. [The input is
one flat sequence](/learn/why-context-is-not-memory), the retrieved passage and
your question arrive through the same channel, and nothing marks one as evidence
and the other as request. Everything that page establishes about long inputs
applies here unchanged. Position matters. Attention is a fixed budget divided
among more competitors as the input grows. An advertised length is not a usable
one, and how far in a model still does the work is [a separately measured
quantity](/wiki/concept/effective-context-length) with its own benchmarks.

Which is why the instinctive repair backfires. When a grounded answer comes back
wrong, the first move nearly everybody makes is to retrieve more passages. That
does not conjure the missing one. It promotes middling candidates into the
middle of the input, where they are read worst, and the candidates being
promoted are the near misses. [The wiki
entry](/wiki/technique/retrieval-augmented-generation) carries the measurement,
and what a reranker buys by re-scoring the retrieved passages before they are
pasted.

One further property of the paste is worth carrying around. The model answers
from the pasted passages and from its weights at the same time, and nothing in
the input separates the two. A grounded answer can be half quotation and half
recollection, and it reads identically either way. "It cited a source" and "it
used the source" are different claims, and only the first one is visible on the
screen.

## Retrieval upgrades the fake citation to a misattributed one

Ask a model with no retrieval for a source and it produces one: an author who
publishes in the field, a title in the right register, a journal that runs that
sort of work, a plausible year. Every property is correct except the existence
of the document. The citation was generated the way the sentence was, by the
same process, in the same pass. [Why that produces confident
falsehoods](/learn/why-models-are-confidently-wrong) is a subject of its own.

With retrieval the citation points at a chunk the system actually fetched, so it
resolves. It opens. That is a genuine upgrade, from invented to attached, and
attached can be audited in a way invented never could.

What it is not is verified. The sentence and the citation beside it emerge from
one pass, and no step in that pass compares them. In April 2023, Nelson F. Liu,
Tianyi Zhang and Percy Liang ran a human audit of four commercial generative
search engines and found their responses "fluent and appear informative, but
frequently contain unsupported statements and inaccurate citations": on average
"a mere 51.5% of generated sentences are fully supported by citations and only
74.5% of citations support their associated sentence." The paper's own phrase
for what such a system presents to a reader is [a facade of
trustworthiness](https://arxiv.org/abs/2304.09848).

Which returns us to section 4.2. That link resolved because it came out of the
retrieval record, not because anything compared the passage against the sentence
it was attached to. A citation converts an unfalsifiable claim into a falsifiable
one. It does not perform the falsification. Somebody still has to open it.

## Where the old method still wins

The map places things by the company they keep, so a string that appears rarely
and in no consistent company never acquires a useful position. Error codes are
like that. So are part numbers, clause references, surnames, and the name of an
internal function. Nearness cannot find them, because nearness was never
computed over anything that tells them apart, and [the similarity score itself
is a shakier instrument than it looks](/wiki/concept/embeddings). Matching the
characters can find them, which is what keyword search has done for decades.

This is not nostalgia. In April 2021, [BEIR](https://arxiv.org/abs/2104.08663)
ran ten retrieval systems across eighteen datasets assembled specifically to
test how each behaves away from the data it was tuned on. The comparison ranged
from plain keyword matching to the embedding-based retrievers this page has been
describing. One result travelled: "Our results show BM25 is a robust baseline".
BM25 is the standard keyword-ranking method, and it predates every learned
system in the comparison. The embedding-based systems were the computationally
efficient option and "often underperform other approaches" once taken out of
their home domain.

Deployed systems mostly run both and merge the rankings, an arrangement called
hybrid search, and the reason is not diplomacy. The two methods fail on
different queries. Keyword search misses the paraphrase; the map misses the
identifier. Real questions about real documents contain identifiers often enough
that dropping either method is a decision you will feel.

## The failure is usually upstream of the model

"It hallucinated" is the wrong first guess about a document-grounded answer, and
it names the wrong stage most of the time. The stages leave different
fingerprints, and one look at what was retrieved separates them. Passages that
contain the answer, next to a reply that contradicts it, point at the paste,
where the passage was competing against everything else in a long input.
Passages that are on-topic and missing the qualification point at the cut, which
orphaned it. Passages about the adjacent question point at the search, doing
exactly what it does. And text that exists in the document but appears in no
passage at all points at a chunk that does not say what it is about, which is a
cut failure wearing a search failure's clothes.

All four checks start in the same place, and this is the part the "it knows your
data" framing hides. The retrieved passages are a short list of ordinary text,
and most systems will show it to you. The whole of what the system knew about
your documents at the moment it answered is on that list. It is not the weights
and it is not your file, and unlike either of those it is something you can read
in about a minute.

You are not debugging a model. You are reviewing a search result.
