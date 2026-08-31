# The voice calibration — corpora and measurements

This is the measurement record behind `openspec/style/blog-voice.md` §3: the
two corpora, the instrument, the per-document numbers, and the limits. It
lives beside the voice document — outside `openspec/changes/` (archiving
moves a change's own files, so a permanent document that anchored its
evidence there would start pointing into an archive directory within one
cycle) and outside `openspec/specs/` (reserved; this record must stay
amendable, because recalibrating obliges rewriting it). The
`make-the-blog-worth-sending` change's `design.md` holds the history of how
these numbers were first derived and then corrected; this file, not that
one, is the record of record.

**Recalibrating means re-running a derivation of this shape on a new corpus
and rewriting this file — never re-deciding a number by hand.**

## The corpora

**Negative corpus** — the twelve predecessor blog posts at commit `d34040b`
(`app/blog/<slug>/page.js`, excluding the index): `ai-security-week`,
`california-detection-mandate`, `chatgpt-ads`, `claude-code-auto-mode`,
`copilot-consolidation`, `cyber-eval-cascade`, `fable-5-export-controls`,
`frontier-cyber`, `gemini-3-7-flash`, `gpt-5-6-price-drop`,
`manus-meta-split`, `ultrafast-mode`. Labeled by the maintainer himself —
"The quality was very good, but obviously AI generated" — on the exact
surface and subject at issue, which is what makes it a good negative corpus.
18,600 body words under this file's instrument.

**Human sample** — nine by-lined pieces on the AI beat, fetched 2026-08-30,
16,107 body words under this instrument. Word counts below are this
instrument's; earlier documents said 16,480 and a second measurement said
16,333 — extraction variance of about 2%, which is part of why no threshold
here deserves decimal-point confidence.

| piece | outlet / author | date | words |
|---|---|---|---|
| llms-in-2024 | simonwillison.net | 2024-12-31 | 6,835 |
| the-gpt-4-barrier | simonwillison.net | 2024-03-08 | 808 |
| GPT-4 launch | The Verge | 2023-03-14 | 994 |
| Claude 3 launch | The Verge | 2024-03-04 | 519 |
| GitHub Copilot | The Verge | 2021-06-29 | 605 |
| GPT-3 API explainer | The Verge (J. Vincent) | 2020 | 3,719 |
| GPT-4 announce | Ars Technica | 2023-03 | 920 |
| GPT-5 pricing | TechCrunch | 2025-08-08 | 748 |
| GPT-3 profile | MIT Tech Review | 2020-07-20 | 959 |

The pieces are identified by title, outlet and date rather than by URL —
enough to re-locate them, recorded here because the original derivation did
not keep the URLs.

## What the sample is, honestly

- **Not all journalism.** Two of the nine (both Willison pieces) are a
  personal technical blog, not edited newsroom output. Calling all nine
  "technology journalism" was wrong and earlier versions of the voice
  document did.
- **One author is 47% of the words.** The two Willison pieces are 7,643 of
  16,107 words.
- **Not era-matched.** The human pieces run 2020–2025; the negative corpus
  is entirely August 2026. Nothing here controls for five years of drift in
  either human style or house style.
- **Not length-matched.** Human pieces run 519–6,835 words against the
  negative corpus's 790–2,423. A large denominator suppresses every density,
  and `llms-in-2024` alone would need double-digit extra marks to trip any
  rate threshold.
- **Five outlets, not six; three pre-ChatGPT pieces, not four** (Verge
  GPT-3 2020, Verge Copilot 2021, MIT TR 2020) — two counts an earlier
  version of this record had wrong.
- **At least one file carries site chrome.** The MIT Tech Review fetch
  includes nav rail, other articles' headlines, and the outlet's "Deep
  Dive" section label — which trips the register-guard marker. That fire is
  a chrome artifact, not a property of the prose, and it is the one human
  "hit" in the table below.
- **Format mismatch.** The negative corpus is JSX, the human sample is
  news-page text, and the lint runs on Markdown in `content/blog/`. Every
  rate below has "words after extraction" as its denominator, and extraction
  choices alone moved a semicolon verdict between 7/12 and 12/12 across six
  instrument variants tried during review. The numbers below are one
  instrument's, described precisely enough to re-run.

## The instrument

Measured 2026-08-30. For the JSX corpus: take the `return (` block; replace
JSX string-literal expressions (`{"…"}`, `{'…'}`, backtick literals without
`${`) with their content; drop all other `{…}` expressions with a balanced
scanner; record header texts from `<h1>`–`<h6>`; strip tags; decode HTML
entities (named and numeric); count words as whitespace-separated tokens
containing an alphanumeric. For the human sample: the fetched text as-is,
entities decoded, `#`-prefixed lines as headers.

Two instrument artifacts were found and corrected during this derivation,
recorded so the next measurer does not repeat them:

- **The JSX closer leaks.** An extractor that keeps text past the last
  closing tag counts the `); }` of the component as one semicolon per post.
- **Legal-citation entities count as semicolons.** `&sect;` (§) ends in
  `;`. One post (`california-detection-mandate`) cites a statute by section
  twelve times; undecoded, those citations inflated its semicolon rate from
  a real 3.28/1k to a reported 11.1/1k in the first derivation and 9.39/1k
  in the second. **Both previously reported semicolon maxima were this
  artifact.** Decode entities before counting.

## Per-document measurements

Negative corpus (rates per 1,000 words):

| post | words | semi | /1k | em-dash | /1k | self-narr | W/W/H hdrs |
|---|---|---|---|---|---|---|---|
| ai-security-week | 2,299 | 7 | 3.04 | 39 | 16.96 | 1 | 1 of 7 |
| california-detection-mandate | 2,137 | 7 | 3.28 | 36 | 16.85 | 26 | 3 of 6 |
| chatgpt-ads | 1,084 | 2 | 1.85 | 23 | 21.22 | 6 | 1 of 6 |
| claude-code-auto-mode | 1,625 | 7 | 4.31 | 22 | 13.54 | 0 | 2 of 7 |
| copilot-consolidation | 2,423 | 8 | 3.30 | 19 | 7.84 | 8 | 3 of 7 |
| cyber-eval-cascade | 2,218 | 7 | 3.16 | 11 | 4.96 | 4 | 1 of 7 |
| fable-5-export-controls | 1,714 | 8 | 4.67 | 32 | 18.67 | 1 | 1 of 7 |
| frontier-cyber | 895 | 2 | 2.23 | 8 | 8.94 | 0 | 3 of 6 |
| gemini-3-7-flash | 790 | 2 | 2.53 | 13 | 16.46 | 3 | 1 of 5 |
| gpt-5-6-price-drop | 1,505 | 9 | 5.98 | 16 | 10.63 | 8 | 4 of 6 |
| manus-meta-split | 919 | 4 | 4.35 | 11 | 11.97 | 8 | 1 of 6 |
| ultrafast-mode | 991 | 3 | 3.03 | 18 | 18.16 | 3 | 1 of 6 |

Aggregates: semicolons 3.55/1k (per-piece 1.85–5.98, median 3.22);
em-dashes 13.33/1k (per-piece 4.96–21.22, median 15.0); self-narration in
10 of 12 (median 3.5, max 26); What/Why/How headers 22 of 76, at least one
in 12 of 12, two or more in 5 of 12; focal-word family 0.05/1k; register
guards 0 of 12.

Human sample: semicolons 0.62/1k aggregate, per-piece max 2.15; em-dashes
4.53/1k aggregate, per-piece max 9.90 (`the-gpt-4-barrier` — one dash under
the 10/1k line); self-narration 0 of 9; What/Why/How headers 0 of 24;
focal family 0.87/1k aggregate, per-piece max 1.34; register guards fire on
1 of 9 — the MIT TR chrome artifact above.

## How the markers perform, honestly

At the documented guidance thresholds (semicolons > 2.5/1k, em-dashes >
10/1k, self-narration ≥ 1, What/Why/How headers ≥ 2, register guards at
presence, focal family ≥ 3/1k), on these corpora, with this instrument:

| marker | negative corpus | human sample |
|---|---|---|
| semicolons > 2.5/1k | 10 of 12 | 0 of 9 |
| em-dashes > 10/1k | 9 of 12 | 0 of 9 |
| self-narration ≥ 1 | 10 of 12 | 0 of 9 |
| What/Why/How ≥ 2 | 5 of 12 | 0 of 9 |
| register guards | 0 of 12 | 1 of 9 (chrome) |
| focal ≥ 3/1k | 0 of 12 | 0 of 9 |
| **union** | **12 of 12** | **1 of 9 (chrome)** |

What that table does and does not show:

- **The margins are single punctuation marks.** `gemini-3-7-flash` clears
  the semicolon line by 0.03/1k — one semicolon; `the-gpt-4-barrier` (human)
  sits one em-dash under its line; the earlier claim that thresholds were
  "validated" on these corpora described fitting a boundary to two samples
  and reporting the fit. The thresholds are fitted, and this file says so
  instead.
- **The union's 12/12 has a single point of failure.** `frontier-cyber` is
  carried by one marker alone (What/Why/How ≥ 2). No single marker covers
  all twelve: the earlier claim that "semicolon density alone covers all
  twelve" was an artifact of the `&sect;` miscount and is false.
- **Self-narration is the cleanest marker** — 10/12 against zero human
  occurrences on every sample measured, and it maps directly to a
  followable instruction (show the discipline; never narrate it).
- **Rate thresholds are fragile on short pieces, and notes have no minimum
  length.** On the fresh sample below, a 256-word piece fires the focal
  marker on a single word — inside a spokesperson's quotation. One ordinary
  word in a 150-word note is 6.7/1k.

**Out-of-sample check** (run by the second sealed review, corpus chosen and
fetched independently; re-measured by this instrument): eight TechCrunch
AI-beat pieces published 2026-08-28 to 2026-08-30 — era-matched to the
negative corpus as the calibration sample is not. Semicolons 0–1.48/1k,
em-dashes 0–8.86/1k, self-narration and What/Why/How zero everywhere. No
punctuation or narration marker fires on any of the eight; the one union
fire is the quotation-plus-short-denominator artifact above. The human side
of the calibration generalises; that result is real and worth keeping.

**The excluded markers, kept so nobody re-adds them the wrong way round:**
"not just X, but Y" occurs at roughly twice the rate in the human sample as
in the negative corpus; the focal family at *presence* level fires on good
human journalism and passes the labeled AI corpus; sentence-length
burstiness did not separate (edited journalism is itself smooth; only one
human piece was bursty); paragraph-length CV separated in the **inverted**
direction from theory (news grafs are uniformly short). Re-adding any of
these requires re-running a two-direction measurement, not citing the
literature.

## What this evidence licenses

These markers reliably separate **this house model's long-form output** from
professionally edited technology writing, on the samples measured and on one
fresh sample chosen adversarially. They are **not** validated as a general
AI detector; the thresholds are fitted to the corpora above with
single-mark margins; and the same model trips the punctuation rates in
every register it writes, including its specs and its style documents — the
second sealed review measured 15 of 15 of its long-form repository
documents firing. That last fact is why the lint that consumes these
numbers **warns and never fails the build** (`specs/blog`), and why the
publishable gate on voice is the model-run review verdict
(`reads-as-generated`), not a threshold: the rates describe the house
model's default register everywhere, not a defect unique to bad posts.

**Circular-calibration warning** (the same one recorded in
`openspec/curriculum/learn.md` §3): once writers are told to stay under
these thresholds, future posts are shaped by them, and re-deriving
thresholds from those posts would measure the guidance, not the voice.
Recalibrate only against corpora the guidance did not shape.
