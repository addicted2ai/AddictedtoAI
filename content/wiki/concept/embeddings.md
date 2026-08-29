---
id: concept/embeddings
kind: concept
display_name: "Embeddings"
status: active
maintenance: stable
themes:
  - argument
aliases:
  - name: "Embeddings"
    class: shared
  - name: "Word embeddings"
    class: shared
  - name: "Vector embeddings"
    class: shared
  - name: "Embedding"
    class: manual
facts:
  - field: analogy_exclusion_rule
    source: cited
    value: "\"In the default implementation of word2vec, gensim as well as the code from Bolukbasi et al. 2016, the input terms of the analogy query are not allowed to be returned.\""
    source_url: "https://ar5iv.labs.arxiv.org/html/1905.09866"
    accessed: "2026-08-28"
    volatility: static
  - field: analogy_accuracy_without_exclusion
    source: cited
    value: "Google Analogy accuracy falls from 0.74 to 0.21 for 3CosAdd and from 0.75 to 0.47 for 3CosMul when the input terms are allowed to be returned"
    source_url: "https://ar5iv.labs.arxiv.org/html/1905.09866"
    accessed: "2026-08-28"
    volatility: dated
  - field: doctor_analogy_result
    source: cited
    value: "\"man is to doctor as woman is to X\" returns gynecologist under the constrained method and doctor when the constraint is lifted"
    source_url: "https://ar5iv.labs.arxiv.org/html/1905.09866"
    accessed: "2026-08-28"
    volatility: dated
  - field: cosine_similarity_warning
    source: cited
    value: "cosine similarity of embeddings from regularized linear models \"can yield arbitrary and therefore meaningless 'similarities'\" — for some models not even unique, for others implicitly controlled by the regularization"
    source_url: "https://arxiv.org/abs/2403.05440"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2019-05-23"
    event: "the analogy method's exclusion constraint documented and its effect on the famous results measured"
    source_url: "https://arxiv.org/abs/1905.09866"
  - date: "2024-03-08"
    event: "cosine similarity of learned embeddings shown to be arbitrary under some regularizations"
    source_url: "https://arxiv.org/abs/2403.05440"
mentions:
  - concept/tokenization
---

An embedding is a lookup table: one learned vector per vocabulary entry, or per
input, positioned by a training objective so that things used alike land near each
other. Two operations are performed on such tables constantly — vector arithmetic
and cosine ranking — and both have a published result showing the answer depends
on a choice made outside the vectors.

**The analogy demonstration has a rule in it.** "Man is to king as woman is to
queen" is the standard exhibit for what embeddings do, and the same construction
supplied the standard evidence of encoded bias: man is to computer
programmer as woman is to homemaker. Malvina Nissim, Rik van Noord and Rob van der
Goot examined the code on 23 May 2019 and found a constraint nobody was quoting:
"In the default implementation of word2vec, gensim as well as the code from
Bolukbasi et al. 2016, the input terms of the analogy query are not allowed to be
returned."

Lift that constraint — let the method return whatever vector is actually closest —
and accuracy on the Google analogy set falls from 0.74 to 0.21 for 3CosAdd and
from 0.75 to 0.47 for 3CosMul, "because the second term is returned as answer (man
is to king as woman is to king, thus D==B)." The nearest vector to the query is
very often just one of the words you put in. Applied to the bias exhibit, the
constrained method answers gynecologist and the unconstrained method answers
doctor, which is where the paper's title comes from: *Fair Is Better than
Sensational: Man Is to Doctor as Woman Is to Doctor.*

The finding cuts both ways and the paper says so — it does not show the biases are
absent, it shows that the instrument used to display them was configured to never
return the unremarkable answer. A demonstration that cannot output "doctor" will
output the most doctor-adjacent gendered word available, whatever the geometry
says.

**Cosine similarity is not a fixed measurement either.** Harald Steck, Chaitanya
Ekanadham and Nathan Kallus studied embeddings from regularized linear models on
8 March 2024, where closed forms are available, and derived "how cosine-similarity
can yield arbitrary and therefore meaningless 'similarities.'" For some models the
similarities are not even unique; for others they are "implicitly controlled by the
regularization" rather than by anything in the data. Deep models combine several
regularizations at once, so the same warning applies with less visibility: the
ranking a vector store returns is partly a function of how the encoder was
regularized, and that term is invisible at query time.

Neither result says embeddings do not work. They say that the two things everyone
does with them return answers shaped by a default nobody set deliberately — an
exclusion list in a helper function, a weight-decay coefficient chosen for
training stability. When an embedding demo is surprising, the first question is
what the retrieval step was forbidden to return.
