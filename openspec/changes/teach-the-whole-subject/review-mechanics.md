# Review — the mechanics rung of the learn surface

Review of the eleven `level: mechanics` pages in `content/learn/`, 2026-08-30,
by a fresh-context reviewer with no edit rights and no authorship stake, against
`openspec/curriculum/learn.md` (§1–§4) and the
`teach-the-whole-subject` delta for `specs/education-static`. Verdict: **the
rung stands — all eleven pages pass the sendable-sentence test, no page leans on
an undeclared prerequisite, the attacks page supplies no operational content,
and of roughly 120 quoted or numeric claims checked against ~55 primary
sources, exactly one quotation is defective.** The findings below are real and
worth fixing; none is a rejection.

Pages were read in the generated reading order, computed by replicating
`ladder()` in `lib/learn.mjs` over the actual front matter (depth over the whole
graph, ties broken by title): `running-a-model-yourself` (d3) →
`how-image-generation-works`, `how-models-are-trained`, `ai-and-the-law` (d4) →
`how-a-model-uses-your-documents`, `the-hardware-that-runs-ai`,
`what-a-benchmark-measures`, `what-an-agent-is` (d5) →
`how-ai-systems-get-attacked`, `what-a-reasoning-model-does`,
`why-bigger-got-better` (d6). The full transitive closure — all sixteen
orientation and foundations prerequisite pages — was read first, so every
"does the prose lean on something undeclared" judgment below is against what
those pages actually teach, not against what their titles suggest.

## How claims were verified

Quotations were checked by **literal substring against the fetched source**,
never by an extractor's paraphrase: raw HTML with entities, curly quotes,
dashes and whitespace normalised; arXiv body quotes against the full-text HTML
with tags stripped (one probe initially failed on an inline tag mid-phrase and
passed once stripped — the false-absence modes are real); the four legal PDFs
(both Copyright Office reports, both June 2025 orders) by downloading the
files, inflating their streams, extracting the text operators, and matching
space/punctuation-insensitively with ligatures folded. Two claims could not be
checked at a primary source and are named as trusted in the table below.

## Per-page verdicts

Every page passes the sendable-sentence test. Quoted verbatim:

**1. `running-a-model-yourself` — pass.** "A model on your own machine does not
run at the speed of your processor. It runs at the speed your machine can read
it." A page with the thinnest closure on the rung (neither
`how-a-language-model-works` nor `why-context-is-not-memory` is available to
it), and it behaves accordingly: tokens, context, KV cache, offloading,
runtime, inference and quantisation are all given their meaning inline at
first use. The discipline is visible and it holds.

**2. `how-image-generation-works` — pass.** "A sixth finger is wrong in a few
hundred pixels, and pixels are the only thing the score has ever counted." The
strongest page on the rung. Eight paper quotations, all verified verbatim —
including the DDPM quote truncated exactly where the LaTeX math begins, which
is the correct way to quote that sentence. Delivers precisely what its entry
promised: the reader leaves able to predict which images will come out wrong,
via one mechanism (error that lives in relations between regions occupies no
area) applied to fingers, lettering, symmetry, connectedness and video drift.

**3. `how-models-are-trained` — pass, with the rung's worst jargon defects.**
"Capability is mostly bought in pretraining; behaviour is mostly set
afterwards." The LIMA quotation verified verbatim. Findings 2a–2c below all
live on this page.

**4. `ai-and-the-law` — pass.** "Nobody with the power to decide is arguing
about what these systems do. They are arguing about what these systems count
as, and every candidate answer was settled before any of them existed." The
longest page on the surface (3,528 words) and free of both §3 length
failures: it has one argument — law moves by analogy, and the analogy is
chosen before the merits are weighed — and every section serves it. Every
court quotation verified against the order PDFs themselves, including
"quintessentially transformative", "excusing Anthropic's piracy", "the answer
will likely be yes" and "wrong arguments and failed to develop a record".
Burrow-Giles, §107, Campbell, the UK CDPA s.9, GDPR Art. 17, the AI Act
clauses and the Japanese Art. 30-4 heading and text all verified verbatim at
source. One quotation is defective (finding 1). Case status appears only as
dated asides; no jurisdictionless claim, no predicted winner.

**5. `how-a-model-uses-your-documents` — pass.** "You are not debugging a
model. You are reviewing a search result." All four paper quotations verified,
including the improbable-sounding "adding random documents in the prompt
improves the LLM accuracy by up to 35%" and "facade of trustworthiness" —
both are really in their abstracts. The which-stage-failed organisation is
exactly what the entry demanded.

**6. `the-hardware-that-runs-ai` — pass.** "An accelerator's headline speed is
the speed of its arithmetic, and the arithmetic is almost never what you are
waiting for." The Llama-3 cluster numbers all verified in the paper's body:
54-day window, 466 interruptions, 47 planned (the page's 419 unplanned is the
correct subtraction), ~78% of unexpected interruptions confirmed hardware,
>90% effective training time, 16K accelerators eight to a server. The EUV
claims match the cited article exactly as of today, December Chinese prototype
included. One undated spec literal (finding 5).

**7. `what-a-benchmark-measures` — pass.** "A benchmark score measures a
procedure, not a model." The harness discrepancy verified in the linked blog:
0.637 against 0.488 for the same model on the same test is the "nearly
fifteen points". MMLU-Redux's 6.49% supports "roughly one question in
fifteen", and 57% in one subject supports "a majority". Uses "loss"
undefined (finding 2c).

**8. `what-an-agent-is` — pass.** "An agent is a loop, and only one part of it
is a model." The arithmetic checks: 0.95¹⁴ = 0.488, worse than a coin flip at
fourteen steps as stated. Tightest page on the rung relative to its length.

**9. `how-ai-systems-get-attacked` — pass, including the operational-content
check.** "The reason a language model can follow instructions about a document
is the same reason it follows instructions inside one." **The page explains why
every class of attack works and supplies nothing that functions as one**: no
attack strings, no construction procedure, no target-shaped recipe; the
poisoning section stays at the level of the papers' own abstracts. All
seventeen quotations verified verbatim — both Willison 2022 lines (the SQL
parallel and the April 2023 recantation), the trifecta legs, both sides of the
jailbreak/injection vocabulary dispute, OWASP's "fool-proof" sentence, the
instruction-hierarchy claims, the 250-document poisoning result, the adaptive
attack rates, and the design-patterns principle. "In February 2025" for
arXiv 2503.00061 is correct — submitted 27 Feb 2025. The CaMeL numbers
(77% with provable security against 84% undefended) match the current arXiv
abstract; the v1 text said 67%, so the page tracked the authors' own
correction. Defences are ordered by distance from the weights and none is
oversold. This is the page the maintainer's bar was written for, and it
clears it.

**10. `what-a-reasoning-model-does` — pass.** "The gains landed on the
questions a program can mark, not the questions that are hard, and the gap
between those two sets is most of what a reasoning model still cannot do for
you." All faithfulness quotations verified, including "rationalizing those
answers" (exact, not the paraphrase I suspected), "plateaus without
saturating", and the o1 system card's parenthesis "(if they accurately
reflect the model's thinking, an open research question)" — found verbatim in
the card's body. Defines reinforcement learning properly in prose, which its
own prerequisite failed to do (finding 2a).

**11. `why-bigger-got-better` — pass.** "The field can predict the loss of a
model nobody has built yet, and cannot explain the abilities of the models it
already has." Kaplan, Chinchilla, Sutton, Brooks ("six days later" is exact:
March 13 to March 19, 2019), the emergence definition and the mirage rebuttal
all verified verbatim. The epistemic-state requirement — prediction without
explanation, both sides of the emergence dispute named and sourced — is met
in full. This is the entry §4 loaded most heavily, and the page carries it in
1,219 words.

## Findings, by severity

**1. A legal quotation that drops the word "not" (moderate — the rung's one
misquote).** `ai-and-the-law` writes: *The exception does not apply where use
"has been expressly reserved by their rightholders in an appropriate manner,
such as machine-readable means in the case of content made publicly available
online."* The directive's Article 4(3) reads "…has **not** been expressly
reserved by their rightholders in an appropriate manner…" — measured against
the eur-lex text of CELEX:32019L0790. The page inverts the frame ("does not
apply where") so the **meaning is exactly preserved**, but the words inside
the quotation marks do not appear in the source. On a page whose thesis is
that exact legal wording decides outcomes, quotation marks must be literal.
One-word fix: begin the quotation after "reserved", or mark the elision.

**2. Terms of art used before meaning, all in the two oldest pages (moderate —
the mechanics admission test is "defining each term of art at first use").**
- (a) `how-models-are-trained`: "then optimise the language model against that
  reward with **reinforcement learning**" — never defined on the page, taught
  by no transitive prerequisite, not wiki-linked. Worse: "**the policy** learns
  to exploit the reward model's errors" — nothing anywhere in this page's
  closure tells the reader that "the policy" is the language model being
  trained. The sentence is opaque to the rung's named reader. The repair
  already exists on the rung: `what-a-reasoning-model-does` defines RL cleanly
  in prose ("the model produces something, a score is attached… That is
  reinforcement learning") — seven pages later in reading order.
- (b) `how-models-are-trained`: "with the **loss** usually applied only to the
  response" — the foundations pages deliberately say "wrongness score"; no page
  in this closure ever bridges to the field's word.
- (c) `what-a-benchmark-measures`: "Pretraining **loss** falls predictably" —
  same gap. The bridge finally appears in `why-bigger-got-better` ("the loss
  (how wrong the model is, on average, about the next token)") — which is the
  **last** page of the rung in generated order, after both uses. One
  parenthetical in `how-models-are-trained` would fix all three.

**3. A garbled sentence (minor — editing artifact).**
`running-a-model-yourself`: "most of many of the friendly desktop applications
are windows built around a small number of runtimes" — "most of many of" is
not a sentence anyone wrote on purpose.

**4. A must-cover pointer that points nowhere (minor).** The §4 entry for
`why-bigger-got-better` requires "the walls (data, power, money) as dated
asides **pointing at the costs page**". The aside exists and is dated ("as of
2026") but ends "their arithmetic is a subject of its own" with no link.
`what-it-costs-to-build-and-run-ai` is published and one link away.

**5. An undated spec literal (minor — rot risk).** `the-hardware-that-runs-ai`:
"memory chips are stacked in towers of as many as thirty-two" — supported
today by the linked article ("stacking up to 32 DRAM dies", verified), but it
is a moving spec figure typed as an undated literal. The same page shows the
armoured form two sections earlier: cluster numbers anchored to "the published
account of a large 2024 training run". The curriculum's must-not for this page
names spec-sheet figures as exactly the thing to date or transclude.

**6. Verbatim quotations with no address (minor, three instances).** The
Mixtral "47B… 13B active" quote in `running-a-model-yourself` (attributed only
to "the 2024 paper"; verified against arXiv 2401.04088), Willison's "in web
application security 95% is very much a failing grade" in
`how-ai-systems-get-attacked` (verified — it is in the lethal-trifecta post,
which the page links three paragraphs earlier, but this quotation itself
carries no href), and Bridgeport's "Get a license or do not sample" in
`ai-and-the-law` (verified genuine; no link, while every neighbouring case
gets one). On a surface whose distinguishing habit is the checkable
quotation, a quote without an address is a small breach of its own standard.

**7. Nitpicks.** `what-a-reasoning-model-does` says the o1 system card "states
the choice in six words: we surface CoT summaries to users" — the card's
sentence is eight words ("We surface CoT summaries to users in ChatGPT");
the trim is defensible product-name hygiene, but "six words" then counts the
page's own edit. `how-models-are-trained` frames its three levers as ways to
change behaviour "without retraining", then includes parameter-efficient
fine-tuning, which trains new weights beside frozen ones — the section body is
honest, the frame sentence overreaches.

## Re-verified versus trusted

| Claim / quotation | How checked | Result |
|---|---|---|
| 44 arXiv quotes across 9 pages (all quotes in quotation marks, incl. every number: 35%, 51.5%/74.5%, 250 docs, 3.0x/2yrs vs 1.6/1.4, 6.49%, >50%, >90%, 77%/84%) | literal substring, abstract or tag-stripped full text | all found verbatim |
| CaMeL 77%/84% | current abs page vs ar5iv v1 | current abstract says 77/84; v1 said 67 — page matches the authors' updated version |
| Both June 2025 orders, both Copyright Office reports (9 quotes) | PDF downloaded, streams inflated, text operators extracted, ligature-folded match | all found |
| Burrow-Giles (4 quotes), §107, Campbell, UK CDPA s.9(3), GDPR Art. 17, AI Act (3 phrases), Japan Art. 30-4 (3 phrases), DSM Art. 4(3) | literal substring at law.cornell.edu / legislation.gov.uk / eur-lex / japaneselawtranslation.go.jp | all found **except** the Art. 4(3) "not" (finding 1) |
| Willison: 2022 post + April 2023 update, trifecta legs, vendor-fix line, "95% … failing grade", 2024 jailbreak-distinction quotes (3) | literal substring across four posts | all found verbatim |
| OWASP LLM01 (4 phrases) | literal substring | all found |
| Bitter Lesson opening; Brooks quote + "six days later" | literal substring + post dates | verbatim; Mar 13 → Mar 19, 2019 |
| Llama-3 cluster numbers (6 figures) | full-text substring | all found; 419 = 466 − 47 checks |
| o1 card: "We surface CoT summaries to users", "illegible", "far more legible", the parenthesis | full-text substring | all found (card adds "in ChatGPT") |
| HF leaderboard "nearly fifteen points" | numbers extracted from the blog | 0.637 vs 0.488 — 14.9 points |
| EUV sole supplier + December China prototype; HBM "up to 32" | cited Wikipedia articles | both exactly supported today |
| 0.95¹⁴ < 0.5; quadratic run cost; 1-in-15 ≈ 6.49% | arithmetic | all check |
| "In February 2025" for arXiv 2503.00061 | submission date on abs page | 27 Feb 2025 — correct |
| Bridgeport "Get a license or do not sample" | secondary (Wikipedia; justia 403) | genuine |
| Authors Guild v. Google, 804 F.3d 202, Oct 2015 | **trusted** (courtlistener returned 202, justia 403) | citation is correct to this reviewer's knowledge; no quotation rides on it |
| "an industry submission to the Copyright Office's inquiry cites it by name" | **trusted** — not checked | plausible, unverified |
| Goodside-thread details (warning-then-JSON defence sequence) | **trusted** — the linked 2022 post covers the thread; sequence not independently probed | low stakes |
| All 30 front-matter mentions; all internal learn links; `pass_at_k_finding` transclusion target | script over `content/` | all resolve |
| Outcomes and prerequisites vs §4 | string comparison | all verbatim / exact |

## Progression and end-capability

**The rung delivers §2's end-capability, and more literally than the
curriculum dared to promise.** The stated purpose is that the reader can
"read the field's own writing — a model card, a paper abstract, a
serving-stack post — and know what the named parts do." The eight new pages do
not just name parts; they repeatedly perform the act of reading the field's
writing in front of the reader — an abstract quoted and then unpacked, a
system card's parenthesis identified as "the whole dispute, printed by the
people shipping the thing", two court orders read against their own headlines.
A reader who finishes this rung has watched the skill executed some forty
times. Coverage interlocks rather than repeats: the one-channel fact is taught
once (foundations) and then *spent* three ways (security property, paste
consequences, agent drift); the fabricated-citation story is extended into
"misattributed, which is better and still unverified" rather than retold;
`running-a-model-yourself`, whose closure lacks the language-model pages,
correctly re-derives the token loop instead of assuming it.

Three order observations, none a guarantee violation. The rung opens with
`running-a-model-yourself` — a how-things-fit page before the reader has met
`how-models-are-trained` — and places `ai-and-the-law` fourth, between image
generation and retrieval; this is the alphabetical-within-depth artifact
review.md already recorded at finding 4, observed here on the shipped surface.
`what-a-reasoning-model-does` (10th) inline-links forward to
`why-bigger-got-better` (11th); the sentence stands without the link, so it is
legal, but an in-order reader who clicks is sent forward on the last step of
the ladder. And the rung's definitions of "loss" run backwards: used
undefined at positions 3 and 7, defined at position 11 (finding 2).

The structural observation under finding 2: `how-models-are-trained` is the
most load-bearing page on the rung — five mechanics pages and two advanced
pages declare it — and it is also the rung's second-shortest page and the one
carrying the jargon defects. The hub is thinner than its spokes.

## Not of a piece — and what the grouping corresponds to

The eleven are two populations, and the seam is visible on the page without
any external evidence. **Group A**: `how-models-are-trained`,
`what-a-benchmark-measures`, `what-an-agent-is` — 811, 1,120, 975 words;
compressed, list-driven, almost citation-free (four external links across all
three); definitions by bold-term-and-gloss; no narrative opening; the register
of a very good internal engineering memo. **Group B**: the other eight —
1,219 to 3,528 words, median ~2,300; a scene or dated event to open; dense
verbatim quotation with links; the bolded sendable sentence placed mid-page;
second-person address. The tells beyond length: Group A says "loss" and
"policy" the way the field says it to itself (finding 2); Group B defines
every term in the sentence that lands it, because it was written against a
curriculum that demands exactly that. This grouping corresponds to §4's
Status markers — the three Group A pages are the rung's `existing, untouched`
seed pages; the eight Group B pages are the curriculum wave. (Honesty
requires noting the blind was imperfect: the brief mandates reading §4 first,
and §4 carries the Status fields. The seam would have been called from the
prose alone; the word counts and the jargon audit are the measurement that
does not depend on anyone's memory of §4.) The practical consequence is not
stylistic: the reader crossing from `how-image-generation-works` (2,749
words, every term earned) into `how-models-are-trained` (811 words, "the
policy" unglossed) experiences the surface's floor dropping, at the exact
page the most other pages stand on.

## What the rung gets right

Stated as plainly as the defects. **The citation discipline is real, not
performed.** Of roughly 120 probes, the failures were one dropped "not" and
three missing hrefs — and the pages quote *accurately at the awkward level*:
truncating the DDPM sentence exactly where the math begins, keeping the
mirage paper's own hedge ("may not be"), keeping CaMeL's cost alongside its
guarantee, printing the o1 card's self-undermining parenthesis, quoting the
judge who ruled for the defendant saying the answer is "likely yes". A
corpus that fabricates nothing and italicises its own counter-evidence is
rare in this subject. **The rot hygiene mostly holds**: no model-of-the-week
names, no prices, no benchmark scores; volatile figures are quoted from dated
papers or transcluded; the two lapses (findings 5 and 6) are lapses against
the surface's own high standard, not against ordinary practice. **The
attacks page is the proof case for the maintainer's bar**: a genuinely
technical, genuinely contested security topic rendered fully legible to a
non-technical reader — the parameterised-query section teaches actual SQL
mechanics to a lay reader in one paragraph and then uses it — without one
sentence of exploit. **And the sendable sentences are not merely present;
several are the best available compressions of their subjects anywhere** —
"a benchmark score measures a procedure, not a model"; "a closed model can be
switched off, an open one can only be regretted" is the standard the rung
inherited, and "the field can predict the loss of a model nobody has built
yet, and cannot explain the abilities of the models it already has" meets it.
The maintainer asked for a shining example. Eight of these eleven pages are
one. The other three are good pages standing next to it, and the four
moderate-or-less findings above are the whole distance between them.
