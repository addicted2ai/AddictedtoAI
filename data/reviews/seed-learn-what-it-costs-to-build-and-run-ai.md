---
job: seed-learn-what-it-costs-to-build-and-run-ai
verdict: approve
reasons: []
would-cite: >-
  Anyone reading a headline that one chatbot answer costs some quantity of water
  or electricity — this page settles that the figure is mostly a statement about
  how busy the machine was and where the reporter drew the accounting boundary,
  and it proves it with two careful measurements an order of magnitude apart.
reviewer: rec-a — fresh-context seed reviewer, no edit rights, seven learn pages
date: 2026-08-30
---

Checklist: education page (advanced), judged against `openspec/curriculum/learn.md`
§2, §3 and its §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. Sources fetched raw and matched by literal substring on
2026-08-30.

**Sendable sentence**, verbatim:

> Whether training or serving dominates a model's lifetime cost is not a fact
> about the model but a fact about how many people use it.

This page has more genuine candidates than any other of my seven. Runners-up:
"the price is known in advance and the thing bought is not"; "A product that
meters you is telling you what its marginal cost is"; and "A chokepoint made of a
factory takes years to reproduce. A chokepoint made of a minimum bet reproduces
itself continuously."

## What I verified myself

Twenty-three literal-substring checks across eight sources. Zero failures. Four
came back absent on first pass and all four resolved to abstract-versus-body
placement once I fetched the full text — none to fabrication.

- **Llama 3 `2407.21783`** (body, PDF extracted) — the power-fluctuation
  sentence verbatim, including "due to all GPUs waiting for checkpointing or
  collective communications to finish", and "tens of megawatts, stretching the
  limits of the power grid".
- **Cottier `2405.21015`** — "has grown precipitously at a rate of 2.4x per year
  since 2016"; the chips-and-staff sentence in full; "energy consumption (2-6%)".
  All verbatim. This is the page's most consequential claim — that electricity is
  a minor line on a training invoice — and it is quoted rather than inferred.
- **LLaMA `2302.13971`** (body) — the inference-optimal passage verbatim in both
  halves. The page's use of it is the sharpest structural move here: a training
  decision taken for a serving reason, quoted from the people who took it.
- **BLOOM `2211.02001`** (body) — "433,195 kWh", "230,768 requests", "914 kWh",
  "approximately 18 days", "without any batching", "remain idle in between user
  requests", "approximately 24.7 tonnes", "50.5 tonnes". All eight verbatim. The
  page quotes the §4.2 prose figure rather than the Table 1 variant, which is
  the version that survives a quotation check.
- **Gemini `2508.15734`** — "the median Gemini Apps text prompt consumes 0.24 Wh
  of energy", "0.26 mL", "five drops", "33x reduction in energy consumption", and
  the full boundary list including "idle machine capacity". All verbatim.
- **Luccioni `2311.16863`** (body table) — "can vary by a factor of over 1450",
  with 0.002 and 2.907 both present.
- **Water `2304.03271`** — "can directly evaporate 700,000 liters of clean
  freshwater" and "kept a secret", and I confirmed they sit in the same sentence,
  which is what licenses the page's contrast between a measurement you can argue
  with and a number that exists because there is nothing to argue with.
- **Our World in Data** — both boundary quotations verbatim, including "does not
  allow a separate estimate for AI use".

Front matter checked against §4: `outcome` verbatim, `prerequisites` exact. The
page carries `technique/quantization` in `mentions` beyond §4's two suggestions;
it resolves, and the body earns it (the quantisation link is live in the
trailing-edge section), so this is the mentions contract being honoured rather
than drifted from — §4's list is explicitly a suggestion.

**Prerequisite closure computed from front matter.** Every body link is inside
it. No undeclared assumption; four declared prerequisites, all four paid off by
name in the prose.

## What I took on trust

The Epoch price series page was fetched and the "ranging from 9x to 900x per
year" quotation verified against it, but I did not audit the series itself. I did
not check the Sequoia material (it is the capstone's, not this page's). The
arithmetic-intensity and batching claims imported from
`/learn/the-hardware-that-runs-ai` and `/learn/how-inference-is-served` were
taken as those pages' business, not re-derived. I did not attempt to verify the
subsidy section, which is the one section that makes no external claim — by
design, since its whole point is that the evidence is missing.

## One finding, minor, and unrepaired

The Epoch price quotation carries **no as-of date**, in the paragraph whose next
sentence calls this series "the most reliably misquoted number in the subject".
Every other volatile figure on the page is anchored to a dated paper. It is F6a
in `review-advanced.md` and it is still there — this page has had no commit since
`edd5a58`, before the reviews, so my brief's premise that all my pages were
edited afterwards does not hold for it.

Not rejection-grade: the figure is verbatim-correct on the live source today,
it is not a currency literal or a valuation (which are what the entry's must-not
names), and the surrounding paragraph does more to inoculate a reader against
misusing the number than a date would. But it is the one place the page's own
date-and-source discipline slackens, and on this page that is worth a line. Filed
as `addictedtoai-bc0` so it does not die inside an approve record.

## Judgment

Approve.

The entry asked for training, serving and energy in one causal frame, and the
frame is genuinely causal rather than a three-part survey: arithmetic intensity
explains why the same rented hour buys different amounts of work, that explains
why training and serving are different exchange rates rather than a big and a
small bill, and that in turn explains the subscription strain, the metering, and
a real training decision taken for a serving reason.

The boundary-drawing section is the best numeracy teaching I have read on this
surface, and it teaches by construction rather than by definition: the same
team's own two measurements of the same model, the doubling that comes from
widening the boundary, and two careful figures an order of magnitude apart with
the distance attributed to utilisation and accounting. The page then grades its
own sources by standing — a disclosure with its method attached versus an
estimate that exists because disclosure is absent — which is a distinction almost
nothing written about AI energy makes.

The minimum-ticket argument is the page's original contribution: it explains why
the training layer has not widened as hardware got cheaper, which expense alone
does not explain, and it does it without a single dollar figure. No boom framing,
no doom framing, no company financials.
