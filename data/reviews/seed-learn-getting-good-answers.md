---
job: seed-learn-getting-good-answers
verdict: approve
reasons: []
would-cite: >-
  Someone in a team channel where a colleague insists that adding "be accurate"
  or offering the model a tip improves answers — this page carries the August
  2025 measurement finding no average effect, and then explains why the belief
  survives the measurement anyway: a trick that does nothing on average still
  moves plenty of individual answers, and an individual answer is the only thing
  anyone ever inspects.
reviewer: independent record reviewer, seven-page set (fresh context, no edit rights)
date: 2026-08-30
---

Checklist: education page (foundations, Area D), against `openspec/curriculum/learn.md`
§2, §3 and the §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. Sources fetched to disk and probed by literal
substring 2026-08-30.

**Sendable sentence, verbatim** — the page's own bolded line:

> A trick that does nothing on average still changes plenty of single answers,
> and a single answer is all anyone ever checks.

That is the structural surprise, and it is doing real work: it explains the
*persistence of the folklore* from the same measurement that refutes it, which
is a harder and more useful move than refuting it. The spec's
`not-worth-reading` ground is nowhere near this page.

## What I verified at source

Both external citations, by downloading the page and matching literal
substrings rather than reading a summary:

- arXiv 2402.14531. The abstract reads "We observed that impolite prompts often
  result in poor performance, but overly polite language does not guarantee
  better outcomes. The best politeness level is different according to the
  language." The page's rendering — "impolite prompts often result in poor
  performance, while overly polite language does not guarantee better outcomes,
  and the best politeness level differs by language" — is **not inside quotation
  marks**; it is the anchor text of a link, introduced as reported speech
  ("reported that"). As a paraphrase it is faithful ("but" → "while" preserves
  the contrast; the third clause is a straight compression). No verbatim claim
  is made, so nothing is misquoted. "Across three languages" is exact: English,
  Chinese and Japanese.
- arXiv 2508.00614. "Threatening or tipping a model generally has no significant
  effect on benchmark performance" is present verbatim; the page lowercases the
  leading T inside a running sentence, which is the only difference. The framing
  checks too: four authors, August 2025, two benchmarks (GPQA and MMLU-Pro), and
  the endorsement the page attributes to a Google co-founder is in the abstract
  as "threats have been endorsed by Google Founder Sergey Brin … who observed
  that 'models tend to do better if you threaten them'". The page's closing
  finding is the abstract's second bullet, compressed accurately.

Front matter checked mechanically against §4: `level: foundations`, both
prerequisites (`how-a-language-model-works`, `why-context-is-not-memory`) exact
and in order, `outcome` verbatim. All three mentions
(`concept/in-context-learning`, `concept/chain-of-thought`,
`technique/chain-of-thought-prompting`) resolve to files on disk, as do all
three wiki links. The page has no `/learn/` links at all.

## Term-of-art audit — the rung's strict one

Foundations is the rung where the spec bites hardest ("a term of art SHALL be
given its meaning in the sentence that introduces it or the sentence before").
I listed every term and sorted it by §3's three exits:

- Introduced *after* the plain-language sentence has already carried the idea,
  which is the pattern §3 asks for and this page uses four times: in-context
  learning ("The behaviour has a name…"), chain-of-thought prompting ("Writing
  out the working has a name…"), chain-of-thought faithfulness, and system
  prompt ("A system prompt is text the product puts at the front of the same
  flat sequence your message goes into" — defined in the sentence that
  introduces it).
- Taught by a declared prerequisite, exit (a): token, attention, sampling,
  distribution, weights. I checked the strongest of these rather than assuming
  it — "attention weights are normalised to sum to one" is supported almost
  word for word by `how-a-language-model-works` ("The scores are scaled into
  shares that sum to one, a fixed budget split across the whole input"). The
  page uses the field's noun where the prerequisite used a plain one; the idea
  is genuinely in the closure.
- No equations, no notation anywhere. Numbers appear only in sentences.

Unearned assumptions: none. The transitive closure is
`how-a-language-model-works`, `why-context-is-not-memory`, `what-a-model-is`,
`what-a-neural-network-is`, `how-machines-represent-meaning`,
`learning-from-examples`, `what-ai-actually-is`, and every leaned-on fact —
one flat sequence, no revision after emission, sampling as a draw, letters
discarded at tokenisation, corrections append rather than delete — comes from
inside it.

## Coverage and bounds

Every §4 must-cover is present and none is a passing mention: the one-lever
frame opens the page; examples-as-pattern; specificity narrowing the set
("Both are instructions. Only one is doing arithmetic."); intermediate steps as
the architecture's only scratch space, with the faithfulness caveat attached;
arguing-appends imported from the context page and re-derived rather than
restated; the no-mechanism tier stated fairly, register effects conceded and
reliability effects denied; and what prompting cannot reach.

The must-not is the one I watched hardest, because design D8 says hold the line
or cut the page. There is no cookbook, no tool UI, and no procedure. The
closing imperative ("Stop asking what to say to the model. Ask what document
you are handing it to continue") is a reframe, not a step. Nothing here would
survive as a bullet in a prompt-tips listicle, which is the point.

Rot: no model name, no price, no context window, no version number, no
benchmark score anywhere in the prose. The three time-bound claims are all
dated asides by construction ("a 2024 study", "By 2025 the belief … was widely
traded", "In August 2025 four researchers"), so they read as history rather
than as current state.

## Taken on trust

The two wiki deferrals — that `concept/in-context-learning` holds "the two
experiments that disagree", and that `concept/chain-of-thought` is where
faithfulness lives — I confirmed resolve to real entries but did not read those
entries for whether they carry what the sentences promise. Nothing on this page
depends on them; both sentences stand if the reader never clicks.

Approve. This is the page the ocean of prompt advice is not: every tip arrives
attached to the reason it works or the measurement that says it does not, and
the one genuinely new idea — that a null average result and a large per-question
variance together *manufacture* believers — is stated in a sentence a reader can
carry off and use on advice this page never mentions.
