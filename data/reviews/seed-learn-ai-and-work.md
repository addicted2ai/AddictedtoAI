---
job: seed-learn-ai-and-work
verdict: revise
reasons:
  - false-or-unsupported-claim
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

**Revise, on two claims.** This is a strong page — the best thing on the surface
about a subject that is almost always written badly — and I want that on the
record before the findings, because the verdict is not a judgment about its
quality. It is that two of its claims do not currently survive a check against
their own cited sources, and one of them is a misstatement of a named study's
finding on the paragraph the page itself calls "the useful part".

**Sendable sentence**, verbatim, so the record shows the page passes that test:

> The cash machine never decided whether tellers kept their jobs. What decided
> was whether cheaper branches made banks want more branches, and that was never
> a question about the machine.

## Finding 1 — the augmentation result is stated as the opposite of what the paper found

The page writes:

> The split inside that result is the useful part. Employment fell in the
> occupations where the software does the task, and rose in the ones where it
> assists the person doing it. Two opposite outcomes, one technology, the same
> year.

The paper is the Stanford/ADP "Canaries in the Coal Mine" working paper. I
fetched it (the cited August 2025 path redirects to
`CanariesintheCoalMine_Nov25.pdf`, HTTP 200, 2.29 MB) and extracted its text.
Its Fact 3, in the paper's own words, in two places:

- Section heading: "Fact 3: Entry-level employment has declined in applications
  of AI that automate work, **with muted changes for augmentation**".
- Six-facts list: "Entry-level employment has declined in applications of AI that
  automate work, **with muted effects for those that augment it**."

And in the body: "In contrast, Panel C indicates that the occupations with the
highest estimated augmentation shares have **not experienced a similar pattern**.
Employment changes for young workers are **not ordered by augmentation
exposure**, as the fifth quintile has among the fastest employment growth. The
findings are consistent with automative uses of AI substituting for labor while
augmentative uses do not."

The paper reports the **absence** of a decline, explicitly declining to claim an
ordering. The page reports a **rise**, and then names the pair "two opposite
outcomes". There is partial textual support — the top augmentation quintile does
have among the fastest growth — but the sentence that says so is the same
sentence that says the changes are not ordered by augmentation exposure, which is
a caution against precisely the inference the page draws.

Why this is rejection-grade rather than a nitpick: the page's own thesis is that
"the measurements that exist are real, and every one of them is narrower than the
way it travels". This is the page over-reading a measurement, in the paragraph it
flags as the payoff, on the most contested question it covers, and attributing to
three named researchers a finding they wrote two separate hedges to avoid making.
The fix is small — "and did not fall where it assists the person doing it", or
the paper's own "muted" — and it costs the rhetorical symmetry of "two opposite
outcomes", which is presumably why the sentence reads as it does.

## Finding 2 — the teller figure no longer matches its own live citation

The page writes: "The US Bureau of Labor Statistics [counted about 347,400
tellers in 2024](https://www.bls.gov/ooh/office-and-administrative-support/tellers.htm)".

I fetched that URL live, with an ordinary browser user-agent: HTTP 200, 105,856
bytes. **The string `347` does not occur anywhere in it.** The page now reads
"Tellers held about 339,200 jobs in 2025", and the quick-facts table and the
projections table independently agree on 339,200 / 2025.

I then established why, rather than reporting a mismatch. The Wayback snapshot of
2026-08-19 does carry "Tellers held about 347,400 jobs in 2024". So BLS rebased
the Occupational Outlook Handbook from a 2024 to a 2025 base year sometime
between 19 and 30 August 2026, and the figure went stale inside eleven days.

Three things follow, and they are worth separating.

1. The number is not a fabrication and was not wrong when written. As a
   historical statement — BLS published 347,400 for 2024 — it remains true.
2. It is nonetheless a defect **now**: a reader who follows the citation, which
   this site's whole method invites, does not find the number. On a page whose
   closing argument is that a signal must be checkable, a citation that no longer
   evidences its claim is the wrong kind of failure to ship.
3. The uncomfortable part. This clause was itself the "repair" — commit
   `79466a8` changed it *from* "339,200 in 2025", which is exactly what BLS
   publishes today. The repair's own message records that it used the 2026-08-19
   Wayback snapshot because "bls.gov 403s every anonymous route". That premise is
   false: bls.gov returns 200 to a request carrying a browser user-agent. An
   archive was used where the live source was reachable, the archive was eleven
   days stale, and a correct figure was replaced with a stale one.

Filed separately as `addictedtoai-0pf`, because the durable lesson — prefer the
live source; reach for Wayback only after a live fetch with a UA header has
actually failed — outlives this page's fix.

The rest of that sentence is fine: "says branch numbers have been falling because
of technological change, as customers moved to banking on their phones" is
supported verbatim by the live page ("the number of bank branches has been in
decline due to technological change. As more people use online banking tools...").

## What I verified and what held — which is nearly everything else

I checked every external claim on this page. Excluding the two findings above,
all of them hold, several at a level of exactness worth naming.

- **Bessen (IMF, 2015)** — "20 to 13 between 1988 and 2004" and "Bank branches in
  urban areas increased 43 percent", both verbatim, with "urban" confirmed in the
  source rather than assumed. "Cash handling became less important and human
  interaction more important" is verbatim and correctly flagged as "In Bessen's
  words". The power loom's "98 percent of the labor needed to weave a yard of
  cloth" verbatim, with "the number of factory weaving jobs increased". The
  coordination claim matches "weavers' remaining skills, such as those needed to
  coordinate work across multiple looms". The timing point matches "decades to
  build the training institutions and labor markets needed to develop major new
  technical skills on a large scale".
- **Frey & Osborne** — "702 detailed occupations", "47 percent", "unspecified
  number of years", "perhaps a decade or two", and the decisive sentence "make no
  attempt to estimate how many jobs will actually be automated", all verbatim in
  the PDF. This is the page's best move and it is exact.
- **Census BTOS `CES-WP-24-16`** — "from about 3.7% at the start of the
  collection in September 2023 to about 5.4% at the end of February 2024",
  verbatim. **The second repair in this commit is correct and materially so**: the
  survey question reads "did this business use Artificial Intelligence (AI) **in
  producing goods or services**?", so the pre-repair "for any business purpose"
  did overstate the measure's scope, and the new wording is the paper's own.
  I also checked the sentence I most doubted — "few of them reported cutting
  employment because of it" — and was wrong to doubt it: the paper says "the
  results do not indicate that a large fraction of firms has reduced, or will
  reduce, employment due to AI use" and "there is little evidence that AI use is
  associated with a decline in firm employment". "Often did so to substitute for
  worker tasks" matches the paper's own quantifiers ("many businesses", "a
  significant fraction").
- **Copilot RCT `2302.06590`** — "55.8% faster than the control group" and "HTTP
  server in JavaScript", both verbatim, so the page's deflation of the number is
  built on the task the study actually set.
- **Support agents `2304.11771`** — "5,172 customer support agents" and "15\%"
  (LaTeX-escaped in the source, one of the false-absence modes) verbatim, and the
  heterogeneity sentence matches direction for direction: "Less experienced and
  lower-skilled workers improve both the speed and quality of their output while
  the most experienced and highest-skilled workers see small gains in speed and
  small declines in quality."
- **Canaries, everything except Finding 1** — "six facts", ages 22-25, "a 16%
  relative employment decline in the most exposed occupations", stability for
  experienced workers, "data from ADP, the largest payroll processing firm in
  America", and the authors' caveat quoted verbatim ("the facts we document may
  in part be influenced by factors other than generative AI"). **The third repair
  is correct and the pre-repair text had it backwards**: section 3.2 says "The
  first uses exposure measures from Eloundou et al. (2024), who estimate AI
  exposure by O*NET task using ChatGPT... We focus on the GPT-4 based exposure
  measures", and the Anthropic Economic Index usage data is explicitly "The
  second approach". So the primary measure is a model's rating of listed tasks
  and the observed-usage measure is the check, exactly as the page now says.
- **SOC 2028** — the BLS page confirms a "review of the 2018 Standard
  Occupational Classification (SOC) Manual for possible revision in 2028".

Front matter checked against §4: `outcome` verbatim, `prerequisites` exact,
`mentions` empty as the entry allows.

**Prerequisite closure computed from front matter** (`what-ai-is-used-for`,
`what-ai-actually-is`). One body link falls outside it,
`/learn/what-models-are-trained-on`. It is legal: the paragraph defers to that
page and then stands on its own ("Treat that hole as real"), and the curriculum's
§5 audited this exact link on 2026-08-30 and recorded that it "likewise defers
and stands without the link". Same rung, so no upward edge either.

## What I took on trust

The IMF article's own underlying data. The 1985 bank-window scene, which is
illustrative rather than a claim. One small gloss I checked and let stand with a
note: the page says "over the late nineteenth century weavers' wages rose sharply
against other workers'", where Bessen's sentence is "It took decades until
technical skills and training were standardized; when that happened, factory
wages rose sharply" — the comparative "against other workers'" is the page's
addition, not the source's. Too small to be a reason, but a later editor should
either source it or drop the comparison.

## Judgment

Revise. Finding 1 alone would carry it: a foundations page whose argument is that
every measurement is narrower than the way it travels cannot itself widen one, and
it is a named study's finding stated as its opposite. Finding 2 compounds it with
a citation that no longer supports its number.

Both fixes are one sentence each and neither touches the page's structure. When
they land, this page should be approved without hesitation — the task frame, the
projection/signal distinction, the honest demolition of the teller story it just
told, and the lopsided-instruments section (a shrinking job is counted on
schedule, a new one waits for a code) are all first-rate, and the three closing
questions are the most usable thing written on this subject anywhere I know of.
