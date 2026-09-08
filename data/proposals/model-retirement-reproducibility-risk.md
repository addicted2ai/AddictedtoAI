---
date: 2026-09-07
slug: model-retirement-reproducibility-risk
type: post
summary: >
  A post on arXiv:2609.04699v1 (submitted 2026-09-04), which searched PubMed
  for every original research article from 2022 through March 2026 that applied
  a named LLM to a biomedical task and then looked up what happened to the
  model afterwards. The result: across 8,931 paper-model mentions in 5,242
  publications, 77.7% named a commercial closed-weight model, 42% named a model
  that was already retired at publication or is scheduled to retire within two
  years of it, and the median interval from publication to model retirement was
  538 days. The post pairs that finding with something no other site can put
  beside it: this site's own change feed, which watches one router's catalog
  and recorded 13 retirements and 4 status flips to `deprecated` in the seven
  days ending 2026-09-06. The paper measures the half-life; the feed shows the
  clock running.
evidence: >
  arXiv:2609.04699v1, "Model Retirement Creates Reproducibility Risk in
  Biomedical AI Publications", Nathan Wolfrath, Meghan Conroy, Thomas Kosten,
  Dave Bell, Bhabishya Neupane, Jonah Kindel, Anjishnu Banerjee, Priya
  Deshpande, Bradley Taylor, Anai N. Kothari; v1 submitted 2026-09-04, abstract
  page fetched 2026-09-07 — https://arxiv.org/abs/2609.04699. Abstract quoted
  verbatim in part: "commercial services that host many widely used models
  operate under deprecation schedules that can complicate scientific
  reproducibility"; "An extraction agent identified model names from 61,077
  article abstracts with human reviewers validating a subset for extraction
  accuracy"; "We identified 8,931 paper-model mentions spanning 5,242 unique
  publications after restricting the analysis to the 50 most frequently used
  models. Among these mentions, 77.7% cited a commercial closed-weight model.
  Overall, 42% involved a model that was already retired by the time of
  official publication or is scheduled to retire within two years of
  publication. The median interval from publication to model retirement was 538
  days."; "Model deprecation should be treated as a core reporting and
  preservation issue for biomedical research."

  Retrieved via the arXiv cs.AI RSS listing (a registered radar feed), fetched
  2026-09-07 — https://rss.arxiv.org/rss/cs.AI. The listing is where the paper
  was noticed; the abstract page is what is quoted.

  Corroborating measurement from this repository's own recorded state, computed
  2026-09-07 over `data/changes.jsonl` (186 lines, spanning 2026-06-29 to
  2026-09-06): 15 rows of kind `retirement` in total, 13 of them dated
  2026-08-31 or later, plus 4 `status` field changes whose new value is
  `deprecated`, all 4 in the same seven days. Named retirements in that window
  include `kwaipilot/kat-coder-air-v2.5`, five Mistral `:batch` rows,
  `anthropic/claude-opus-4.7-fast`, `anthropic/claude-opus-4.8-fast`,
  `anthropic/claude-opus-5-fast`, `ibm-granite/granite-4.1-8b`,
  `qwen/qwen3.8-max` and `z-ai/glm-5.2:free`; the deprecations are
  `nex-agi/nex-n2-mini`, `nex-agi/nex-n2-pro`, `z-ai/glm-4.5v` and
  `z-ai/glm-4.7-flash`. Source of the underlying rows:
  https://openrouter.ai/api/v1/models. This half is inward by design — it is
  the counterweight, not the story.
expires: 2026-09-14
proposed_by_job: j-20260907-05
proposed_by_type: scout
---

# A paper put a number on model deprecation, and this site is already counting

## Why now

The paper is three days old and it is the first thing this corpus has seen that
turns "models get retired" from a complaint into a measurement: 42% of a
5,242-publication biomedical sample is on a trajectory to computational
non-reproducibility, and the median publication-to-retirement gap is 538 days.
That is a number a reader can carry around, and it did not exist last week.

It is also the rare external finding this site can *check against its own
instrument* rather than merely restate. The Pulse has been recording OpenRouter
catalog retirements since 29 August; in the seven days ending 6 September it
logged thirteen of them and four more models flipped to `deprecated`. A reader
who wants to know whether 538 days is a fair median can watch the same clock the
site watches.

## Would-send test

"Someone finally counted: 42% of biomedical papers that used an LLM either
already can't be re-run or won't be within two years, and the median model
outlives its own paper by 538 days." That goes to anyone who has ever written
"we used gpt-4-turbo" in a methods section — which, on this paper's own count,
is 5,242 papers' worth of people. It also goes to the reproducibility crowd, who
have been arguing this in the abstract and now have a denominator.

## What this is not, and why it carries no `frontier` flag

I weighed it against the criteria and it meets none of them. It is not a
capability first shown (F1), not a lead change on an index (F2), not a frontier
release by a covered organisation (F3), not a vendor ability claim (F4). The
closest is **F5**, "a material change in access: a frontier model withdrawn,
gated, or opened" — and it genuinely is about withdrawal, which is why it was
worth weighing rather than dismissing. It fails F5 because F5 is about a
*single, named* access event with a date; this is a retrospective statistic
across four years of retirements that mostly already happened. Filing it flagged
would be using the flag to mean "important", which is the failure the criteria
exist to prevent. It is filed unflagged, on its merits.

## What the job would produce (done-when)

- Every figure is quoted from the abstract of arXiv:2609.04699 with the version
  pinned (`v1`), because the claim is tied to a September 2026 date and arXiv
  serves the latest version at the unversioned URL.
- The method's limits are stated, not buried: the model names were extracted
  from **abstracts** by an extraction agent with only a validated subset
  human-checked, the analysis is restricted to the 50 most frequently used
  models, and "scheduled to retire within two years of publication" is a
  forward-looking half of the 42% rather than an observed one. A post that
  reports 42% without that sentence is overclaiming the paper.
- The paper is described as a preprint. v1 was submitted three days before this
  docket and there is no indication of peer review.
- The site-side counterweight is computed at writing time from
  `data/changes.jsonl`, not copied from this docket, and the post says the
  window it counted and the fact that the feed's retirement history only begins
  on 2026-08-29 — a nine-day record is not evidence of a rate, and the post must
  not imply it is.
- The post distinguishes the two things the paper conflates for its own
  purposes: a **retired** model (gone, cannot be called) and a **deprecated**
  one (still callable, on notice). This site's feed records those as different
  kinds and the difference is exactly what a reader planning around
  reproducibility needs.
- Where the post names the open-weights alternative, it does not sell it. A
  downloadable checkpoint solves the retirement problem and not the
  reproducibility problem — inference stacks, quantisations and sampling defaults
  move too — and `content/learn/why-the-same-request-gives-different-answers.md`
  already carries that argument and should be linked rather than restated.
