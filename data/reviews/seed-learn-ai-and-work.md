---
job: seed-learn-ai-and-work
verdict: approve
reasons: []
would-cite: >-
  Someone about to quote the 47 per cent figure as a prediction that half of all
  jobs are disappearing — this page settles that its own authors wrote "we make
  no attempt to estimate how many jobs will actually be automated", and hands
  back the distinction between a projection built at a desk and a signal counted
  in a named group over a stated period.
reviewer: rec-a — fresh-context seed reviewer, no edit rights, seven learn pages
date: 2026-08-30
---

Checklist: education page (foundations), judged against `openspec/curriculum/learn.md`
§2, §3 and its §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. Sources fetched raw and matched by literal substring on
2026-08-30.

**This record carried `revise` earlier today, on two claims. Both are now fixed
in commit `752f2f2`, I re-verified both against their sources rather than against
the commit message, and the verdict is now `approve`.** The history is kept below
rather than overwritten, because the gate failing on this page is the thing that
produced the fix.

**Sendable sentence**, verbatim:

> The cash machine never decided whether tellers kept their jobs. What decided
> was whether cheaper branches made banks want more branches, and that was never
> a question about the machine.

## The two defects, and what I re-checked

### 1. The augmentation result — fixed, and the fix is better than a deletion

The page had said employment "rose in the ones where it assists the person doing
it. Two opposite outcomes, one technology, the same year." The Stanford/ADP
paper reports an *absence*, not a rise, and had written two separate hedges to
avoid claiming an ordering.

It now reads:

> Employment fell in the occupations where the software does the task, and the
> authors report only muted effects where it assists the person doing it — young
> workers' employment changes, they say, are not ordered by how exposed an
> occupation is to being assisted. One direction shows a decline and the other
> shows no clear pattern at all, which is a weaker and more honest finding than a
> mirror image would have been.

**I checked this against the paper and not against the report I wrote, because
the replacement text was drafted from my report, and taking a paraphrase on trust
from a summary is the exact failure this finding was about.** Matched by literal
substring against my own extraction of the PDF:

- "the authors report only muted effects where it assists the person doing it" ←
  the paper's six-facts list: "Entry-level employment has declined in
  applications of AI that automate work, **with muted effects for those that
  augment it**." The operative phrase is the paper's own, and it is attributed to
  the authors on the page rather than asserted.
- "young workers' employment changes, they say, are not ordered by how exposed an
  occupation is to being assisted" ← "**Employment changes for young workers are
  not ordered by augmentation exposure**, as the fifth quintile has among the
  fastest employment growth." Near-verbatim, with "augmentation exposure"
  glossed into plain words, which is right for the foundations rung and does not
  change the claim.
- "One direction shows a decline and the other shows no clear pattern at all" ←
  Fact 3's heading for the decline, and "the occupations with the highest
  estimated augmentation shares have **not experienced a similar pattern**" for
  the absence.

The closing clause — "a weaker and more honest finding than a mirror image would
have been" — is the page's own comment, not attributed to anyone, and it is
accurate about the evidence. It is also the reason this is an improvement rather
than a repair: the page now teaches the reader that an absence of effect is not
the opposite of an effect, which is the same lesson the page's whole thesis is
built on, demonstrated on its own most contested paragraph.

### 2. The teller figure — reverted, and it now matches the live source exactly

The page had said "counted about 347,400 tellers in 2024", sourced to the BLS
Occupational Outlook Handbook. It now reads "counted about 339,200 tellers in
2025".

I re-fetched the live page myself rather than accepting the fix: HTTP 200,
105,856 bytes. It contains "Tellers held about 339,200 jobs in 2025", the figure
339,200 occurs three times, and **the string `347` occurs zero times**. The
page's number, year and hedge word ("about") now match the source exactly, and
the rest of the sentence — branch numbers falling because of technological change
as customers moved to phones — remains supported verbatim.

The provenance is worth keeping on the record, because it is the more useful
half. The original text was 339,200/2025 and was correct. An earlier defect sweep
changed it to 347,400/2024 from a 2026-08-19 Wayback snapshot, on the stated
grounds that bls.gov 403s every anonymous route. That premise was false —
bls.gov returns 200 to a request carrying a browser user-agent — and BLS rebased
the Handbook between 19 and 30 August, so the snapshot was already stale. A
correct figure was replaced by a stale one because unreachability was asserted
from one method instead of tested with a second. Filed as `addictedtoai-0pf`.

## What I verified across the rest of the page, and what I trusted

Everything below was checked in the first pass and none of it was touched by the
fix commit. Every external claim on the page holds.

- **Bessen (IMF, 2015)** — "20 to 13 between 1988 and 2004" and "Bank branches in
  urban areas increased 43 percent", both verbatim, with "urban" confirmed rather
  than assumed. "Cash handling became less important and human interaction more
  important" is verbatim and correctly flagged as "In Bessen's words". The power
  loom's "98 percent of the labor needed to weave a yard of cloth" verbatim, with
  "the number of factory weaving jobs increased". The coordination claim matches
  "weavers' remaining skills, such as those needed to coordinate work across
  multiple looms". The timing point matches "decades to build the training
  institutions and labor markets needed to develop major new technical skills on
  a large scale".
- **Frey & Osborne** — "702 detailed occupations", "47 percent", "unspecified
  number of years", "perhaps a decade or two", and the decisive "make no attempt
  to estimate how many jobs will actually be automated", all verbatim in the PDF.
- **Census BTOS `CES-WP-24-16`** — the 3.7%-to-5.4% sentence verbatim, and the
  survey's own question wording "in producing goods or services" confirms the
  earlier scope correction. I also checked the sentence I most doubted, "few of
  them reported cutting employment because of it", and was wrong to doubt it: the
  paper says "the results do not indicate that a large fraction of firms has
  reduced, or will reduce, employment due to AI use" and "there is little
  evidence that AI use is associated with a decline in firm employment".
- **Copilot RCT `2302.06590`** — "55.8% faster than the control group" and "HTTP
  server in JavaScript", verbatim.
- **Support agents `2304.11771`** — "5,172 customer support agents" and "15\%"
  (LaTeX-escaped in the source) verbatim, and the heterogeneity sentence matches
  direction for direction.
- **Canaries, beyond the fixed paragraph** — "six facts", ages 22-25, "a 16%
  relative employment decline in the most exposed occupations", stability for
  experienced workers, ADP as "the largest payroll processing firm in America",
  and the authors' caveat verbatim. The exposure-measure description in the
  following paragraph is correct and was itself an earlier repair: §3.2 says "We
  focus on the GPT-4 based exposure measures", with the Anthropic usage data as
  "The second approach".
- **SOC 2028** — the BLS page confirms a review of the 2018 SOC manual for
  possible revision in 2028.

Front matter checked against §4: `outcome` verbatim, `prerequisites` exact,
`mentions` empty as the entry allows. Prerequisite closure computed from front
matter (`what-ai-is-used-for`, `what-ai-actually-is`); the one out-of-closure body
link, `/learn/what-models-are-trained-on`, is a deferral that stands without the
link and was explicitly adjudicated as a non-edge in the curriculum's §5.

**Trusted rather than re-verified**: the IMF article's underlying data, and the
1985 bank-window scene, which is illustrative rather than a claim.

**One gloss I checked and am leaving on the record rather than in a report.** The
page says "over the late nineteenth century weavers' wages rose sharply against
other workers'", where Bessen's sentence is "It took decades until technical
skills and training were standardized; when that happened, factory wages rose
sharply." The comparative "against other workers'" is the page's addition, not
the source's. It is too small to hold a verdict on and I am not holding one on
it, but a later editor should either source the comparison or drop it.

## Judgment

Approve. Both blocking defects are fixed, I verified each against its source
rather than against the report that prompted it, and nothing else on the page
fails a check.

What the page does well was never in doubt and should be stated as plainly as the
defects were. The task frame converts an anxiety topic into an analysis topic in
its first four paragraphs. It tells the teller story properly and then demolishes
the use it is usually put to, which is harder and rarer than either telling or
debunking it. The lopsided-instruments section — a shrinking job is counted on
schedule, a new one waits for someone to write a code for it — is an original
observation I have not seen elsewhere, and it explains a bias in the statistics
without alleging one in the statisticians. And the projection/signal distinction
in the closing paragraphs is the most usable thing written on this subject
anywhere I know of, which is why the capstone is right to generalise it.
