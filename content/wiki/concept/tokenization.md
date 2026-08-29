---
id: concept/tokenization
kind: concept
display_name: "Tokenization"
status: active
maintenance: stable
themes:
  - history
aliases:
  - name: "Tokenization"
    class: shared
  - name: "Subword tokenization"
    class: shared
  - name: "Byte pair encoding"
    class: shared
  - name: "BPE"
    class: manual
  - name: "Glitch token"
    class: shared
facts:
  - field: bpe_adapted_for_translation
    source: cited
    value: "Sennrich, Haddow and Birch adapted the byte pair encoding compression algorithm to open-vocabulary translation, posted 31 August 2015"
    source_url: "https://arxiv.org/abs/1508.07909"
    accessed: "2026-08-28"
    volatility: static
  - field: subword_bleu_gain
    source: cited
    value: "1.1 BLEU on WMT 15 English-German and 1.3 BLEU on English-Russian over a back-off dictionary baseline"
    source_url: "https://arxiv.org/abs/1508.07909"
    accessed: "2026-08-28"
    volatility: dated
  - field: anomalous_tokens_found
    source: cited
    value: "141 candidate anomalous tokens, found by testing all 50,257 vocabulary entries of GPT-2 and GPT-3"
    source_url: "https://www.greaterwrong.com/posts/aPeJE8bSo6rAFoLqg/solidgoldmagikarp-plus-prompt-generation"
    accessed: "2026-08-28"
    volatility: dated
  - field: glitch_token_definition
    source: cited
    value: "tokens present in the tokenizer vocabulary but that are nearly or entirely absent during model training"
    source_url: "https://aclanthology.org/2024.emnlp-main.649/"
    accessed: "2026-08-28"
    volatility: static
  - field: letter_counting_failure
    source: cited
    value: "DeepSeek-V3 returned \"2\" or \"3\" in ten independent trials when asked how many Ds are in DEEPSEEK"
    source_url: "https://arxiv.org/abs/2509.04664"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2015-08-31"
    event: "byte pair encoding, a 1994 compression algorithm, repurposed as a subword segmenter for neural translation"
    source_url: "https://arxiv.org/abs/1508.07909"
  - date: "2023-02-05"
    event: "anomalous tokens in the GPT-2 and GPT-3 vocabularies catalogued and demonstrated"
    source_url: "https://www.greaterwrong.com/posts/aPeJE8bSo6rAFoLqg/solidgoldmagikarp-plus-prompt-generation"
  - date: "2024-05-08"
    event: "automated detection of under-trained tokens published, naming the tokenizer/model training disconnect as the cause"
    source_url: "https://arxiv.org/abs/2405.05417"
mentions:
  - concept/embeddings
  - concept/hallucination
---

A model does not read characters. Before training starts, a separate program
fixes a vocabulary of strings, and from then on every input is a sequence of
integers indexing that list. The vocabulary is built by a different procedure,
usually on a different corpus, at a different time from the model. Nearly
everything odd about tokenization follows from that ordering.

The dominant method began as compression. Byte pair encoding repeatedly replaces
the most frequent adjacent pair of symbols with a new symbol; Sennrich, Haddow
and Birch adapted it for translation on 31 August 2015, describing their
segmentation as "based on the byte pair encoding compression algorithm," and
measured 1.1 BLEU on WMT 15 English-German and 1.3 on English-Russian against a
back-off dictionary baseline. What the procedure produces is not a dictionary of
words. It is an ordered merge list: a frequency table of one corpus, frozen
before a single gradient step is taken.

**The vocabulary can contain strings the model never learned.** A string frequent
enough in the tokenizer's corpus to win a merge, but filtered out of or absent
from the training corpus, gets a vocabulary slot and an embedding row that
receives almost no gradient. On 5 February 2023 Jessica Rumbelow and Matthew
Watkins tested all 50,257 vocabulary entries of GPT-2 and GPT-3 and published 141
candidates that behave anomalously. Asked to repeat ` SolidGoldMagikarp` back,
`davinci-instruct-beta` returned "distribute"; ` StreamerBot` produced insults;
several produced different outputs at temperature zero, which the sampler alone
cannot do. The names were not random: the post traces them to strings that "may
have been scraped from backends of e-commerce sites, Reddit threads, log files
from online gaming platforms," several of them usernames from a subreddit devoted
to counting.

Sander Land and Max Bartolo turned this into a detector, published at EMNLP 2024,
and stated the mechanism plainly: "the disconnect between tokenizer creation and
model training" produces "tokens present in the tokenizer vocabulary but that are
nearly or entirely absent during model training." The repair is not more
training. It is deleting the entry.

**Characters are not addressable.** A token is an opaque integer; the spelling
that produced it is not part of what the model receives. Tasks that operate below
the token — counting letters, rhyme, reversing a string, character-level edits —
require reconstructing information the input representation discarded. Kalai and
colleagues recorded a clean instance in September 2025: asked how many Ds are in
DEEPSEEK, DeepSeek-V3 returned "2" or "3" across ten independent trials. The
model is not failing at arithmetic on a quantity it can see. It cannot see the
quantity.

Both failures have the same shape. The vocabulary is a compression decision, made
once, by a program that will never observe what the model is later asked to do
with it — and it is not revisable afterwards, because every weight in the
embedding table is indexed by it.
