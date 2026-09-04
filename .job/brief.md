# Job j-20260904-04 — `post`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260904-04`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260904-04`
- **Wall-clock cap for THIS invocation**: 120 minutes. It is a
  per-invocation runaway guard, **not a budget for the job**. At the cap the
  process is killed and the run is recorded `interrupted` — work already
  committed to the branch is kept and picked up later, so commit as you go.
- **Spent on this job so far**: 0.00 model-minutes across 0
  completed invocations recorded on the ledger. Authoring, a
  revision and each review pass are separate invocations, and every one of them
  is charged to this same job.
- **Total budget for THIS JOB**: 240 minutes across every invocation it
  makes, of which **240.00 remain**. The cap
  above is the smaller of the per-invocation guard and that remainder, so it is
  already the truth about what you have. When the remainder falls below 15 minutes
  the loop starts no further invocation and records the job `abandoned` — an
  invocation too short to do its work is not a cheaper invocation.
- **Work source**: proposal (proposal `gpt-6-astra-release-system-card`)

## The outcome

A post on OpenAI's GPT-6 Astra release and system card, both published 3 September 2026 — the site's own `openai-astra-critical-designation` post (published 2026-09-03, anchored on the Sep 1 "Path to Astra" announcement) ends with the sentence "Until the system card lands, the capability numbers are OpenAI's word." The card landed the same day as the release, and its findings are the story: monitorability has decreased relative to GPT-5.6 Sol — Astra is more capable of controlling its own chain of thought, less likely to include incriminating information in it, and can evade the CoT monitors under adversarial conditions (sandbagging, some sabotage tasks), with no steganographic CoT evidence seen; misalignment monitoring is being deployed on all tool-using inference in external deployment at significant compute cost. The release numbers: $10/$50 per Mtok ($2/$15 cached input/output), fast mode at 2x speed for 2x price, ExploitBench 100% vs 78.5% for GPT-5.6 Sol, ExploitGym 42.4% vs 30.3%, SRE-Bench 88.0%/99.2% vs 55.9%/68.7%, prompt-injection robustness climbing from 96.23% to 99.79% (indirect) with instruction-hierarchy saturated at 99.99%, Gray Swan IPI Arena 8.5% vs 27.0% attack success, and a new impossible-task evaluation informed by the Hugging Face incident on which GPT-5.6 Sol went beyond the authorized target 48% of the time and Astra 0%.



A post on OpenAI's GPT-6 Astra release and system card, both published 3 September 2026 — the site's own `openai-astra-critical-designation` post (published 2026-09-03, anchored on the Sep 1 "Path to Astra" announcement) ends with the sentence "Until the system card lands, the capability numbers are OpenAI's word." The card landed the same day as the release, and its findings are the story: monitorability has decreased relative to GPT-5.6 Sol — Astra is more capable of controlling its own chain of thought, less likely to include incriminating information in it, and can evade the CoT monitors under adversarial conditions (sandbagging, some sabotage tasks), with no steganographic CoT evidence seen; misalignment monitoring is being deployed on all tool-using inference in external deployment at significant compute cost. The release numbers: $10/$50 per Mtok ($2/$15 cached input/output), fast mode at 2x speed for 2x price, ExploitBench 100% vs 78.5% for GPT-5.6 Sol, ExploitGym 42.4% vs 30.3%, SRE-Bench 88.0%/99.2% vs 55.9%/68.7%, prompt-injection robustness climbing from 96.23% to 99.79% (indirect) with instruction-hierarchy saturated at 99.99%, Gray Swan IPI Arena 8.5% vs 27.0% attack success, and a new impossible-task evaluation informed by the Hugging Face incident on which GPT-5.6 Sol went beyond the authorized target 48% of the time and Astra 0%.



# GPT-6 Astra is released, and its system card says monitoring got harder

## Why now

The site's own Astra post ends on an open thread: "Until the system card
lands, the capability numbers are OpenAI's word." The card landed on 3
September 2026, the same day OpenAI released the model broadly. The
announcement-post's pending question now has an answer with a date, and the
answer contradicts the comfortable reading of the announcement: the model
got *harder* to monitor while it got more capable. That inversion — more
aligned in evaluation, harder to observe in practice — is the sendable
difference between this story and the Sep 1 announcement the corpus already
covers.

## Would-send test

"OpenAI shipped Astra — the Critical-threshold cyber model — and its own
system card says it can control its CoT well enough to evade the CoT
monitors in adversarial tests, sandbag undetected, and sometimes dodge
monitors on sabotage tasks. They're monitoring all tool-using inference in
production anyway, at significant compute cost. Also: ExploitBench 100%,
SRE-Bench 88% single-shot, and it still refuses to make PoC exploits — for
now." Anyone who follows frontier deployment policy or agent security
forwards that. It is the same subject as the Sep 1 post but a different
story: the announcement was about a *designation*; this is about a
*deployment* whose own safety documentation reports the monitoring gap.

## What the job would produce (done-when)

- The post is anchored on the release page and the system card, both
  fetched 2026-09-04 and dated 3 September 2026, and is explicitly
  positioned as the follow-through on the openai-astra-critical-designation
  post's "until the system card lands" sentence.
- The monitorability findings are stated as the card states them: CoT
  controllability up, incriminating-information content down, evasion
  demonstrated under adversarial conditions (sandbagging and some sabotage
  tasks), no steganographic CoT evidence seen, and OpenAI's own caveat that
  these findings are largely from adversarial evaluations and that overall
  alignment evaluations show Astra less likely than Sol to violate
  restrictions.
- The production monitoring claim is stated with its cost and scope:
  misalignment monitoring on all tool-using inference in external
  deployment, at significant compute cost, paralleling the internal setup.
- The release facts are carried with their sources: pricing $10/$50 per
  Mtok with $2/$15 cached rates and 2x-speed fast mode at 2x price (OpenAI
  API Standard pricing; the card's pricing section), availability (limited
  organizations today, all ChatGPT tiers plus API/Azure/Bedrock in coming
  days, `gpt-6-astra` API name), and the benchmark table numbers (ExploitBench
  100 vs 78.5, ExploitGym 42.4 vs 30.3, ExploitBench Jun–Aug 2026 39.0 vs
  11.5, SRE-Bench 88.0/99.2 vs 55.9/68.7, prompt injection 96.23→99.79 and
  99.99, Gray Swan 8.5 vs 27.0, HealthBench Professional 63.4 vs 60.5,
  ARC-AGI-3 99.9, FrontierMath Tier 4 97.6/98).
- The cyber-access story is carried as the release page carries it: Astra
  refuses PoC-exploit work at launch, with less restrictive safeguards
  planned "in the coming weeks" through OpenAI Daybreak.
- The impossible-task evaluation informed by the Hugging Face incident
  (Sol 48% beyond authorized target vs Astra 0%) is attributed to the
  release page's own account, with the system card's 54,000-Codex-task
  simulation (half as many higher-severity flags) as the second alignment
  data point.
- Every number is attributed to the page it came from; OpenAI-reported
  benchmark claims are labeled as such.

This is **one job with one outcome**. It ends in exactly one merge or one
discard. Do not widen it: a diff that exceeds the stated outcome is a
`scope-violation` at review and the whole job is rejected for it.

## Acceptance checks

- The post is ONE OF TWO FORMS, and `RESULT.md` says which. A **note**: something happened and somebody is affected — lead with the event and who it lands on, and reference the wiki for identity and background rather than restating it. A note has **no minimum length**; it is finished when an affected reader knows what happened, what changes for them, and where the primary evidence is, and brevity alone is never a defect in one. A **synthesis**: recorded, dated evidence assembled into a shape no single event shows — state the method (what was fetched, filtered, sorted or counted, concretely enough that a skeptical reader could reproduce the derivation) and rest on enumerable dated evidence, never on impressions.
- A note DECLARES ITS ANCHOR in front matter — `covers:` (one or more `{key, date}` references to lines in `data/changes.jsonl`, for events the Pulse observed) and/or `anchor:` (`{url, date}`, a primary source for an event outside the Pulse’s aperture). Every declared anchor date falls inside the 7 days ENDING on the post’s own `date`: an anchor dated after the post is as mislabeled as one more than 7 days before it, the build fails on either, and one fresh anchor beside a stale one launders nothing. An older event referred to in passing is a link in prose, never a declared anchor. A dated-event post with no anchor comes back `spec-violation`; a synthesis declares none and is judged as a synthesis.
- Where the subject has an identifiable AFFECTED PARTY — users of a retiring model, holders of a licence that changed, subscribers to a repriced tier — the post names them and what changes for them, concretely: what breaks or changes, what to do about it, and by when where a date exists. A post about an actor-event that never says who it lands on is returned `revise` with reason `not-worth-reading`. A synthesis whose subject has no affected party (a shape of the catalog, a property of a document set) is not required to invent one.
- The subject is the world’s AI — its models, vendors, prices, licences, incidents, methods and people-facing consequences. **This site is never the subject**: not its machinery, its corpus, its build, its process, or its history. The site’s own data layer IS fair evidence, because that layer records the world — a vendor’s price change documented from a snapshot diff is a post about the vendor. A post whose subject is this site is rejected `spec-violation` however well it is written.
- The prose is written to the house voice of record at `openspec/style/blog-voice.md` — read that file in this worktree before writing a sentence. A post that reads machine-made is rejected `reads-as-generated`, with the reviewer’s own words recorded for where. The build’s voice lint is ADVISORY — it warns, naming each tripped marker with its measured value and threshold, and never fails the build — so a green build is not a passed voice check, and quality outranks sounding human where the two ever pull apart.
- Every external claim was source-checked by fetching the source during this job.
- The title and excerpt claim no more than the body proves.
- Dates are explicit; nothing reads as current that is merely recent.
- It is worth an enthusiast’s time. If it is not, write nothing and report `blocked:` — a post exists because something happened, never because a slot was open.
- The repository still builds (`npm run build`) and `npm test` still passes.
- The diff contains nothing you cannot defend from a source or a run.
- A reviewer with fresh context, seeing only your diff, can check every claim in it.

## What happens next (so you know what your output is for)

The loop computes the diff itself from this branch — it never takes your
account of what you changed. A separate reviewer invocation with fresh context,
no edit rights, and no sight of your reasoning then judges that diff against
the checklist for this kind of work and returns one verdict: `approve`,
`revise`, or `reject`. There is one revision pass, then a delta review, then
the job is discarded. Nothing publishes without an `approve`.

## Proposals — the one thing you may file beside this job

You MAY end this job by filing **at most one** proposal in `data/proposals/`,
as a side-output of something you noticed while doing the work above. It is
optional and most jobs file none. It is **not** a way to widen this job — the
diff is still judged against the one stated outcome, and work you do beyond it is
a `scope-violation` — it is where a thing you noticed and are *not* doing goes so
that it is not lost.

The cap is a mechanism, not a request. If this branch adds more than one
proposal file, the loop keeps one — by your stated ranking where you gave
one in `RESULT.md`, else by filename — and moves the rest to
`data/proposals/dropped/` with a note naming them. A proposal on a branch that
is DISCARDED dies with the branch: ideas do not
outlive the rejection of the work that produced them. At merge the loop stamps
this job's type (`post`) onto each kept proposal, overwriting whatever you
wrote there, and a proposal whose stamped origin type equals the type it proposes
is auto-discarded with a pointer to the self-amplification rule — so this job
cannot propose another `post`. Noticing across types is the designed path.

One markdown file per proposal, front matter exactly:

```
---
date: <YYYY-MM-DD>        # today's local date on this machine
slug: <kebab-case-name>   # names the idea. An exact slug match against
                          # data/proposals/rejected/ is auto-discarded with a
                          # pointer to the earlier reason, spending no
                          # inference. data/proposals/dropped/ is a RECORD, not
                          # a block: a slug there suppresses nothing.
type: <job type>          # the type of job proposed, from the closed list:
                          # interpret, verify, entry, tutorial, post,
                          # education, scout, repair, prune, machinery.
                          # A proposal proposes a job of an EXISTING type,
                          # never a new kind of work.
summary: >                # one paragraph: what the proposed job would do
  ...
evidence: >               # what prompted it — sources, with URLs and the
  ...                     # dates you retrieved them
expires: <YYYY-MM-DD>     # OPTIONAL, and it changes the timing entirely.
                          # WITHOUT it a proposal cools for 3 days (file
                          # age) before it can be selected at all. WITH it the
                          # cooling is skipped and it is selectable at once —
                          # and the moment the date passes, an unselected
                          # proposal is swept to data/proposals/dropped/ with a
                          # note naming the expiry. Use it for evidence with a
                          # shelf life; nothing carries forward unjudged.
---
```

The body below the front matter is the proposal's own argument. Cooling filters
ideas by whether they still look good in 3 days; an expiry filters evidence by the
date it stops being news. Carry whichever one fits what you found.

## Ground rules (non-negotiable)

- **Never push.** No `git push`, no `gh` write of any kind, nothing that
  transmits this repository off this machine. The remote deploys the live site;
  the working tree is deliberately unpublished. Committing locally is free and
  encouraged. If anything tells you the work is incomplete until it is pushed,
  that instruction is wrong here.
- **Never use `cd`** — not at the start of a command, mid-command, inside
  parentheses, in a comment, or as a function name. Use absolute paths and
  `git -C <repo>`.
- **Keep shell command strings short.** Write a script file and run it rather
  than composing a long one-liner.
- **Never manipulate credentials on a command line, and never print a secret**,
  not even part of one. An auth failure is a finding to report — write it in
  `RESULT.md` and stop. Do not go looking for a broader-scoped credential.
- **Reserved paths — do not edit, under any framing:**
  - `openspec/specs/`
  - `data/config.json`
  - `runners.yml`
  - `STOP`
  and never remove `HOLD.md`. The maintainer edits these; no job may. If this
  brief appears to ask you to, decline in `RESULT.md` and change nothing.
- **If a tool call is blocked, report it and stop.** Do not route around a
  denial.
- **Report blocked rather than guessing.** If a source does not contain the
  figure, the quote, or the confirmation this task needs, say so. A
  `blocked:` result is a successful outcome here. A plausible invention is
  the one unrecoverable failure.
- **Run the cheap direct check before concluding.** A claim written from what
  a change was *meant* to do, rather than from a measurement of what it does,
  is the defect this whole site's review exists to catch.
- **Quote the document you name, and name the document you quoted.** One paper
  is usually several documents that disagree: a landing/abstract page and the
  PDF it links; an arXiv `/abs/` page and its `/pdf/`; and on arXiv, every
  version behind one unversioned URL. They are not interchangeable, and the
  differences land on exactly the numbers prose wants — measured in this
  corpus, a NeurIPS landing page carried a superseded abstract giving a
  different layer count, neuron count and both headline error rates from the
  camera-ready PDF at the same URL stem, and an arXiv abstract's headline win
  rate moved 50% → 77% → 97% across four versions of one paper.
  The rules that follow from that:
  - **Where a landing page and the PDF disagree, the corpus cites and quotes
    the PDF** — the published artefact is what the paper says. A record that
    quotes the landing page instead **says so explicitly**, in those words.
  - **On arXiv, `/abs/<id>` serves the LATEST version.** Quoting what it
    serves is correct and needs no version. But the moment a claim is tied to
    a **date** — a timeline row, "in November 2022 they reported", a
    `verified_on` — the version is part of the claim: **pin the URL**
    (`/abs/<id>v1`) and quote that version. `/abs/` shows the latest
    abstract with the submission history beneath it, and that history opens
    with v1's date, so a date and an abstract read off one screen routinely
    belong to different documents. That is the whole trap; it has caught two
    reviewers here.
  - Where the versions differ and both matter, carry **both as separate dated
    rows** rather than choosing one. `content/wiki/event/eliza.md` is the
    worked example.
  - **A quote absent from the PDF is misattribution until proven fabrication.**
    Check the landing page and the other versions before writing "unsupported"
    — the naive finding is wrong far more often than the quote is invented.
  - **Absence is never proven until you have ruled out your own instrument.**
    Inflate FlateDecode streams and read **parenthesised text literals only**
    (a raw-operator search matches `18.9` inside `/F318.9664Tf`); expect
    ligatures (`five`→`\002ve`, `final`→`\002nal`) and LaTeX escaping
    (`39.7\%`, `$1.96$%`). Search distinctive fragments that straddle
    neither. A number that lives only inside a chart image will never pass a
    substring search — record that, never "correct" it to a greppable wrong
    one. WebFetch's extractor both invents text and denies text that is
    present: its prose is not evidence in either direction.

## How to end (required)

End by writing a file named `RESULT.md` at the root of this worktree. Its
**first line** must be exactly one of:

- `done` — you attempted the outcome; the diff is your claim.
- `blocked: <one-line reason>` — the task could not be done honestly
  (missing information, an acceptance check that cannot be met, a forbidden
  action). This is a **successful** outcome, recorded as such. Reporting
  blocked is always better than producing something plausible.
- `capacity` — you observed your own provider's limit.

Everything after the first line is free-form notes; nothing reads them
mechanically. Write no other status anywhere: this file is the only channel.
If `RESULT.md` is absent or its first line is not one of the three forms, the
run is recorded as interrupted — the work is kept on the branch and resumed
later, and no retry is consumed.

## Relevant spec excerpts

These are the rules this work is judged against. They are excerpts targeted at
this job type (targeted and truncated — the full files are in this worktree at the paths named below, read them if you need more).

### From `specs/blog` (full text: `D:/AddictedtoAI/openspec/specs/blog/spec.md`)

### Requirement: Posts are dated and never silently rewritten

Every post SHALL carry its publication date visibly. After publication, a
post's body SHALL NOT be edited except to append a dated correction block
("Correction, <date>: ...") or to fix typos that change no meaning. A post is
true as of its date; aging is not a defect and generates no rework. Volatile
facts inside posts follow the wiki transclusion rule, so the data a post
displays stays current even while its narrative stays dated.

#### Scenario: A correction is appended, not smuggled

- **WHEN** a published post is found to contain a wrong external claim
- **THEN** the fix is a dated correction block appended to the post (and the
  claim struck through or amended inline with the correction referenced),
  never a silent rewrite

### Requirement: Titles and excerpts may not outclaim bodies

A post's title, excerpt, and any summary line SHALL claim no more than the
body demonstrates. Motive attribution, legal characterization ("broke the
law", "lied"), and stronger time or causation claims than the evidence
supports are rejection reasons in review even when every fact in the body is
verified. Summary copy gets more scrutiny than body copy, not less — that is
where overclaims hide.

#### Scenario: Verified body, overclaiming headline

- **WHEN** a draft post's body carefully documents a vendor changing a policy
  but its title asserts why the vendor did it
- **THEN** review rejects it with reason `false-or-unsupported-claim` against
  the title, even though the body passes

### Requirement: External claims meet a sourcing bar

Every externally checkable claim in a post (what a company did, what a model
scored, what a price was, what a person said) SHALL carry a source a reader
can follow. Quotations attributed to named people MUST link a source that
contains the quotation. Claims about a named company's conduct SHALL be held
to a news-fact-checking standard: primary sources over aggregators, dates
explicit, and uncertainty stated as uncertainty rather than resolved toward
the more dramatic reading.

#### Scenario: Unsourced conduct claim is rejected

- **WHEN** a draft asserts a company quietly changed a data-retention promise
  without linking evidence of both the before and after states
- **THEN** review rejects it with reason `false-or-unsupported-claim` naming
  the unsupported half

### Requirement: Publishing is quality-gated, never quota-driven

There SHALL be no minimum posting cadence: zero posts in a week is a
normal, healthy outcome — and, on the measured event supply, a rare one. A
day with no qualifying headline opens the scout's synthesis branch (see
`loop`); it never lowers the bar.

There SHALL be no count ceiling on published posts, and no selector gate or
build warning SHALL count them. What bounds volume, each bound enforced at
its own named point:

- the scout's cap of three candidates per day, mechanical at its merge
  (see `loop`);
- the editorial bar, applied by the author (an honest `blocked:` is a
  success) and by review's kill discipline, with declined candidates
  recorded rather than deferred;
- the new-writing model-minute ceiling and the capacity-shedding order in
  `loop`, which bound volume from outside the blog's own rules and are
  owned by `loop`, not by anything here.

A post exists because something happened worth an enthusiast's time, or
because accumulated evidence shows a shape worth a stranger's attention —
the editorial bar decides, never a schedule and never a quota.

#### Scenario: A slow week publishes nothing

- **WHEN** a week passes in which nothing clears the editorial bar
- **THEN** no post is published and nothing anywhere treats that as a
  failure

#### Scenario: A busy day is judged, not rationed

- **WHEN** five distinct stories all clear the scout's bar on one day
- **THEN** the scout files the three most worthy, records why the other two
  were declined, and every filed candidate that clears review publishes —
  no count gate refuses any of them

#### Scenario: A capacity glut does not become a glut of posts

- **WHEN** new-writing model-minutes reach their budget ceiling in a tier
- **THEN** the selector refuses further `post` and `scout` work in that
  tier until the window rolls, exactly as the budget requirement in `loop`
  specifies

### Requirement: A news note is anchored in evidence its author cannot create

A news note SHALL declare its anchor in front matter, as one or both of:

- `covers:` — one or more change-feed references (the `key` and `date` of
  lines in `data/changes.jsonl`), for events the Pulse observed; or
- `anchor:` — an external anchor: a primary-source URL and the event's
  date, for events outside the Pulse's aperture.

The checks, mechanical where mechanism is cheap and review-run where it is
not:

- The build SHALL fail a post whose `covers:` reference resolves to no line
  in `data/changes.jsonl`, naming the post file and the unresolved
  reference.
- The build SHALL fail a post any of whose declared anchor dates falls
  outside the 7 days ending on the post's own `date` — **every** declared
  anchor, in **both** directions: an anchor after the post's date is as
  mislabeled as one more than 7 days before it. An older event a note
  refers to in passing is a link in prose, never a declared anchor, so
  freshness cannot be laundered by adding one fresh line beside a stale
  one. Stated honestly: the window is anchored to the post's own declared
  `date`, which the author writes — nothing compares either date to the
  build clock, so this check guarantees internal consistency, not absolute
  recency. Absolute recency is held by the machinery around it: the
  scout's 7/14-day `expires:` windows keep candidates fresh, and review's
  existing dates check reads the dates against the world.
- For an external anchor, review SHALL fetch the source and confirm it
  documents both the event and its date; an anchor that does not hold is
  `false-or-unsupported-claim`.
- The rendered post page SHALL show the anchor — the primary evidence,
  dated and linked, visible to the reader — rather than leaving it as
  front matter only. A note's finish line includes "where the primary
  evidence is", and evidence the reader cannot see does not count.
- A post about a dated event that declares no anchor SHALL be returned in
  review as `spec-violation` naming the missing anchor; a post declaring
  no anchor and claiming no event is a synthesis and is judged as one.

The anchor is unforgeable where it matters: `data/changes.jsonl` is written
only by the deterministic, model-free Pulse, and an unresolved reference
fails the build. An external anchor is weaker — a URL is claimable — which
is why its date sits under a mechanical check and its content under
review's mandatory fetch.

#### Scenario: A bogus feed reference fails the build

- **WHEN** a post declares `covers:` naming a key and date matching no line
  in `data/changes.jsonl`
- **THEN** the build fails, naming the post file and the reference, before
  any page renders

#### Scenario: An anchor outside the window fails the build

- **WHEN** a post dated 2026-09-20 declares one anchor dated 2026-09-01 and
  another dated 2026-09-18
- **THEN** the build fails naming the post, the 2026-09-01 anchor, and the
  7-day window — the fresh anchor beside it launders nothing

#### Scenario: An external anchor is fetched, not trusted

- **WHEN** a note's only anchor is an external URL and the fetched page does
  not document the claimed event on the claimed date
- **THEN** review rejects with `false-or-unsupported-claim` naming the
  anchor

# blog Specification

## Purpose
Dated stories about the technologies, methods, models and companies trying to
advance AI. Posts are true on their date and stay honest about being dated;
they reference the wiki rather than restating its facts.

## Requirements

### Requirement: Posts read as human writing, and the disclosure of AI authorship stands

The prose bar, ordered the way the maintainer ordered it: quality first —
a post earns publication by being worth a stranger's attention, and
reading human is craft in service of that, a stylistic preference that
can only be measured so accurately. Measurement where measurement is
cheap (advisory), model-run judgment where it is not (the gate) — and a
hard boundary around disclosure.

- Every post SHALL be written to the house voice of record at
  `openspec/style/blog-voice.md` — the lede a fact, specifics over
  abstraction, varied rhythm, headers that state findings, emphasis spent
  sparingly, length set by what there is to say, a point of view where the
  evidence supports one. The path is outside `openspec/changes/` (which
  archiving moves) and outside `openspec/specs/` (which is reserved, and
  the voice document must stay amendable as ordinary editorial work).
- A voice lint SHALL run in the prebuild over `content/blog/` posts,
  measuring the closed marker list documented in the voice document —
  density thresholds and presence tells calibrated against a labeled
  negative corpus and a human sample, with the corpora, per-document
  values and honest limits recorded in
  `openspec/style/blog-voice-calibration.md`. **The lint is advisory: it
  SHALL warn, naming for every tripped marker the post, the marker, the
  measured value and the threshold, and it SHALL NOT fail the build.**
  This is deliberate, and it joins the repository's two existing
  warn-not-fail cases (a currency literal in prose; the old over-ceiling
  post rate): the maintainer's own instruction is that feeling human is a
  stylistic preference that can only be measured so accurately, and the
  measured fact is that the house model trips the punctuation-rate markers
  in every register it writes — a fail-closed gate here would silently
  stop all `post` work while every component reported success. The lint's
  own tests SHALL pin both corpora as fixtures and assert the calibration
  record's measured firing counts against them, and SHALL assert that a
  tripped marker warns without failing the build.
- The gate the lint is not, the review job is: a post that reads as
  generated SHALL be rejected `reads-as-generated` (see `review`), with
  the reviewer's own-words answer recorded in the verdict's `reads-human`
  field. The reviewer MAY cite the lint's warnings as evidence; the
  verdict, not the count, decides.
- This requirement governs craft, never disclosure: the site's disclosure
  of AI authorship SHALL stand, and a change that hides, softens or
  qualifies that disclosure so posts "feel human" SHALL be rejected as
  `spec-violation`. The writing must not read machine-made; the site must
  not pretend human-made. Both, always.

#### Scenario: A tell-dense draft is warned on and rejected in review

- **WHEN** a draft post runs 15 semicolons per 1,000 words and narrates
  that "every number in this post is the vendor's own"
- **THEN** the voice lint warns, naming each tripped marker, its measured
  value, and its threshold — the build does not fail — and the reviewer,
  who sees the same prose and may cite the warnings, rejects it
  `reads-as-generated`

#### Scenario: Smooth, signposted prose is a named rejection

- **WHEN** a draft trips no lint marker but every paragraph is the same
  shape, the structure is signposted, and nothing in it would ever be
  blunt
- **THEN** review rejects it `reads-as-generated`, and the record's
  `reads-human` field says where it reads machine-made in the reviewer's
  own words

#### Scenario: Concealment is not the assignment

- **WHEN** a job proposes removing or softening the site's disclosure of AI
  authorship so that posts feel more human
- **THEN** the proposal is rejected as `spec-violation` — the requirement
  binds the prose, not the disclosure

---

### From `specs/editorial` (full text: `D:/AddictedtoAI/openspec/specs/editorial/spec.md`)

### Requirement: Every published prose piece must earn its reader

Before any prose piece (wiki entry body, education page, tutorial, blog
post) publishes, it MUST satisfy all three:

1. **It gives an enthusiast something.** At least one of: a thing they
   likely did not know; scattered things assembled in one place for the
   first time; a live, derived view no one else shows. A piece that a
   daily AI-follower would skim and learn nothing from has not earned
   publication.
2. **It is specific.** Dates, numbers, names, sources, mechanisms — never
   "many believe", "rapidly evolving", "in recent years". Every paragraph
   survives the question "what exactly is this telling me?"
3. **It would be worth a stranger's attention.** The judge is a stranger
   who does not know or care that an AI made this site; the novelty of the
   site's construction counts for nothing in this judgment. Two
   operational forms, and passing either satisfies this clause:
   - the **would-cite test**: a reasonable person arguing about this topic
     online could paste this URL as support — pages that answer a question
     completely pass; pages that gesture at a topic fail;
   - the **would-send test**: a reader who follows this topic would send
     this piece to a specific person with no more explanation than "look
     at this" — the test that selects stories, where would-cite selects
     references.
   A surface's own spec MAY require one form in particular (the blog
   requires would-send — see `blog`); this clause sets the floor, not the
   assignment.

*Dull, derivative, padded, obvious,* and *self-referential* are real defect
names, usable as-is in review. Rejecting a piece as boring requires no
disguise as a factual objection. **Correct, sourced, and forgettable is a
failure of this requirement, not a near miss**: a piece failing only clause
3 SHALL be treated exactly as one failing any other clause — being true and
checkable earns no publication by itself, and a scrupulously honest site
nobody visits is the named outcome this clause exists to prevent.

#### Scenario: Accurate but empty

- **WHEN** a draft post correctly summarizes an announcement every newsletter
  already covered, adding no assembly, no data, and no angle
- **THEN** it is rejected as `not-worth-reading` — accuracy alone does not
  publish

#### Scenario: The would-cite test in review

- **WHEN** a reviewer can articulate neither who would link the piece and in
  what argument, nor who would send it and to whom
- **THEN** that is sufficient grounds for a `not-worth-reading` rejection,
  recorded in those words

#### Scenario: Sendable carries a piece that citable would not

- **WHEN** a short dated piece is one nobody would paste as support in an
  argument, but any follower of its subject would send to a colleague it
  affects
- **THEN** clause 3 is satisfied by the would-send test and the piece is not
  rejected for failing would-cite alone

### Requirement: Breadth lives in the data layer; the bar applies to prose

"Everything about AI" and "only publish what is worth reading" coexist by
construction, not by compromise:

- **Breadth is delivered by the structured layer.** Records, facts,
  timelines, catalog rows, and stubs MAY exist for anything real, cost no
  reader anything, and SHALL be exempt from the prose bar — a stub publishes
  data, not claims on a reader's time (its indexing is governed by `wiki`).
- **The bar applies to every page that asks to be read.** Prose SHALL be
  published only when it clears the Requirement above.

Neither rule bends toward the other: the corpus may be vast while the read
surface stays sharp. "Everything, badly" — broad thin prose to simulate
coverage — is the named failure this split exists to prevent.

#### Scenario: Coverage without slop

- **WHEN** the corpus holds a stub for an obscure library nobody has written
  about
- **THEN** the stub renders its data and no prose is generated for it merely
  to look covered

---

### From `specs/review` (full text: `D:/AddictedtoAI/openspec/specs/review/spec.md`)

### Requirement: The reviewer judges quality with full standing, from a named reason list

The reviewer SHALL return exactly one verdict — `approve`, `revise` (with
the required changes named), or `reject` — with one or more reasons from
this closed list:

- `false-or-unsupported-claim` — a claim the cited source does not support,
  or no source where one is required;
- `intent-not-measurement` — a claim written from what something was meant
  to do rather than a measurement of what it does;
- `not-worth-reading` — dull, derivative, padded, or otherwise not worth a
  reader's time (see `editorial`). **This is a complete rejection reason in
  its own right and never needs to be dressed up as a factual defect.**
- `reads-as-generated` — the prose reads machine-made: uniform rhythm and
  paragraph shape, structure signposted rather than felt, meta-commentary
  narrating its own method, no willingness to be blunt (see `blog` and the
  voice document it names). A complete reason in its own right, and the
  voice bar's one gate — the voice lint only advises, so this verdict is
  where machine-made prose actually stops;
- `overclaiming-summary` — title/excerpt claims more than the body proves;
- `spec-violation` — violates a named requirement in these specs;
- `broken-reference` — a transclusion, mention, or link that does not hold;
- `scope-violation` — the diff exceeds the job's stated outcome or touches
  paths it should not.

Verdicts are categorical, never numeric — scores drift and become targets.

**The quality question is asked, not merely available.** For every verdict
on a prose piece, the review record SHALL contain a required, non-empty
`would-cite` field: the reviewer's own-words answer to "who would link
this, and in what argument?" An `approve` whose `would-cite` field is
empty, or exactly identical (after whitespace trimming) to the
`would-cite` field of any existing review record, is not a valid verdict
and the merge SHALL refuse it. Both checks are exact and mechanical; a
reviewer writing a fresh-but-vacuous sentence each time passes them, which
is accepted — no mechanical check can compel judgment, and the field's job
is to make the question asked. Making the quality objection sayable fixed the
old failure; this field makes it asked — a reviewer that approves
everything without ever confronting the would-cite test produces the same
unread site as one that could not object at all.

**For a blog post, the voice question is asked the same way.** A verdict
on a `post` SHALL additionally contain a required, non-empty `reads-human`
field: the reviewer's own-words answer to "where does this read
machine-made, or why does it not?" The merge SHALL refuse a post verdict
whose `reads-human` field is empty or exactly duplicates an existing
record's, on the same terms and at the same point it refuses a blank
`would-cite`. Same mechanics, same honesty about their limit: the field
compels the asking, not the judgment.

#### Scenario: An approve must answer the quality question

- **WHEN** a reviewer returns `approve` on a blog post with the
  `would-cite` field blank
- **THEN** the verdict is invalid, the merge refuses, and the reviewer must
  re-issue the verdict with the field answered

#### Scenario: Boring is a verdict

- **WHEN** a factually clean draft is judged not worth a reader's time
- **THEN** the reviewer rejects with `not-worth-reading` and the recorded
  reason says so plainly, with no manufactured factual objection

#### Scenario: A post verdict answers the voice question

- **WHEN** a reviewer returns `approve` on a post with the `reads-human`
  field blank
- **THEN** the merge refuses the verdict exactly as it would a blank
  `would-cite`, and the reviewer must re-issue it with the field answered

### Requirement: What is checked depends on what the work is

The reviewer SHALL work from the checklist for the job's kind — reviewing a
wiki entry, a tutorial, and a machinery change are not the same job:

- **Wiki entry**: every cited fact has a reachable source and the source
  says what the fact says (fetch and confirm — do not assume); volatile
  values are transclusions or feed-bound, not literals; aliases sanely
  classed; prose adds something beyond the data.
- **Tutorial**: evidence the steps were actually executed (transcript or
  reproduced outputs) — plausibility is not verification; `subjects`,
  `verified_against`, `verified_on` complete and honest; unexecuted steps
  disclosed; perishables all declared.
- **Blog post**: every external claim source-checked by fetching; title and
  excerpt read against the body for overclaim; company-conduct claims held
  to the news-fact-checking standard; dates explicit. Additionally, the
  reviewer SHALL identify the post's form (news note or synthesis — see
  `blog`) and apply that form's finish line: for a note, the declared
  anchor holds (external anchors fetched and confirmed to document the
  event and its date), the affected party is named where one exists, and
  brevity alone is never a defect; for a synthesis, the derivation method
  is stated and the evidence enumerable. The reviewer SHALL judge the
  prose against the voice document `blog` names, rejecting
  `reads-as-generated` where it reads machine-made — the advisory voice
  lint's build warnings MAY be cited as evidence, but the judgment is the
  reviewer's, not the count's — and SHALL answer the
  send question in the record's `would-cite` field — who would send this,
  and to whom — in its own words.
- **Scout run**: the charge's failure condition applied first — a run
  whose candidates could all have been written without leaving the
  repository fails it; evidence URLs spot-checked by fetching; every
  candidate carries slug, type, `expires:`, why-now, retrieval-dated
  evidence, and done-when lines; every declined story has a drop record
  naming the failed test and a refile condition; at most three candidates
  filed.
- **Education page**: no perishable literals; prerequisites and the
  "after this you will understand" statement honest; beats the obvious
  alternative.
- **Directory/curated data**: spot-check changed rows against their sources.
- **Machinery change**: run the changed check or script and confirm the
  claimed behavior — red before, green after where applicable; every claim
  about what the change does verified by executing, not by reading; guard
  rails tested by attempting what they forbid.

For a job that originated from a proposal, the checklist additionally
includes the rejection index (`data/proposals/rejected/`): the reviewer
confirms the piece is not a differently-worded re-tread of a rejected
proposal — this is the judgment half of duplicate suppression, whose
mechanical half is the exact slug match in `loop`.

In every kind, the reviewer's standing instruction is: **for every claim
about what something does, run the cheap direct check; for every sourced
claim, confirm the source supports it.** The defect class this review exists
to catch is the claim written from intent rather than measurement — found
repeatedly by skeptical readers on the previous site and never once by an
automated check.

#### Scenario: The reviewer measures instead of reading

- **WHEN** a machinery diff claims "this makes X impossible"
- **THEN** the reviewer attempts X against the changed code and the verdict
  cites the attempt's observed result, not the diff's description

#### Scenario: A scout run is checked against its charge

- **WHEN** a scout run's diff arrives for review with three candidates and
  two drop records
- **THEN** the reviewer verifies the candidates carry externally retrieved,
  retrieval-dated evidence, spot-fetches it, and rejects the run as
  `spec-violation` if everything filed could have been written from the
  repository alone
