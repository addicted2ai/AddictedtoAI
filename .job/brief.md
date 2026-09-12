# Job j-20260911-06 — `verify`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260911-06`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260911-06`
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
- **Work source**: directive (DIRECTIVES.md line 133)

## The outcome

settle the one unverifiable claim on `content/learn/ai-and-the-law.md` — `addictedtoai-o9d`. Line 164, re-read on 2026-09-08 and unchanged: after correctly linking Authors Guild v. Google, Inc. to CourtListener, the sentence continues "and an industry submission to the Copyright Office's inquiry cites it by name". That clause is the page's ONLY factual assertion with no link and no verifiable source; every other current claim on the page is either linked to a fetched primary source or carried by a wiki entry, which is what makes this one stand out rather than being ordinary. The reviewer who found it recorded the gap rather than assuming, which was right. YOUR JOB IS TO SETTLE IT, EITHER WAY: find the submission and link it, or cut the clause. THE STANDARD IS THE SURFACE'S STANDING ONE and it is not negotiable — a dated external fact that cannot be fetched and literally substring-checked gets CUT rather than asserted. This claim is not dated, which is why it did not trip the rule when the page was written, but it is the same shape: an assertion about what a specific document says, with nothing a reader can follow. So: fetch the Copyright Office's inquiry docket, find a submission that names the case, confirm by literal substring that it does, and link THAT document. If you cannot — and comment dockets are large, so this may take real work — CUT THE CLAUSE. The sentence around it survives either way, which is the reason this is a clean either/or rather than a dilemma. DO NOT WEAKEN IT INTO A HEDGE. "Some submissions are said to cite it" is worse than both options: it keeps an unverifiable assertion and adds vagueness. If you cut, do not replace it with a gesture at unnamed submissions. Report what you fetched, what it said, and which branch you took. On the absence half, remember that absence is never proven until you have ruled out your own instrument: one failed fetch method is not a finding. This page carries an approval record and this job rebinds it.


This is **one job with one outcome**. It ends in exactly one merge or one
discard. Do not widen it: a diff that exceeds the stated outcome is a
`scope-violation` at review and the whole job is rejected for it.

## Acceptance checks

- The verification was actually executed or actually re-fetched. Plausibility is not verification.
- The evidence of the run (transcript or reproduced output) is captured under `data/reviews/evidence/`.
- The verification stamp / `verified_on` / `last_verified` is updated to the real date the check ran, and to nothing else.
- If the check FAILED, that is the result: record the failure honestly rather than adjusting the stamp.
- The branch still passes every gate the loop runs on it before review:
  `npm run build`, `node scripts/verify-surfaces.mjs`. This list is
  generated from the gate set itself, so it cannot drift from what will actually run.
- The diff contains nothing you cannot defend from a source or a run.


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
`data/proposals/dropped/` with a note naming them. Declaring `frontier: true`
does not lift it: the frontier exemption is the SCOUT'S cap and no other job's,
and a `verify` job's flagged proposal is counted exactly as before. A proposal on a branch that
is DISCARDED dies with the branch: ideas do not
outlive the rejection of the work that produced them. At merge the loop stamps
this job's type (`verify`) onto each kept proposal, overwriting whatever you
wrote there, and a proposal whose stamped origin type equals the type it proposes
is auto-discarded with a pointer to the self-amplification rule — so this job
cannot propose another `verify`. Noticing across types is the designed path.

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
- **This invocation ends the moment you end your turn.** There is no next turn
  here and nothing waits for you: the process exits when you stop speaking, and
  any command still running is orphaned, not awaited. So **never start a
  process in the background and then stop to wait for it.** Run `npm test` and
  `npm run build` in the FOREGROUND, read their output, then write
  `RESULT.md`, then stop. Measured on 2026-09-06 (job `j-20260906-17`): an
  author committed its work, said it was waiting on the suite and ended its
  turn; the process exited immediately, `RESULT.md` was never written so the
  run was recorded `interrupted`, and the orphaned suite kept running inside
  the deleted worktree and held the machine-wide test lock against every other
  suite on the machine.
- **Never merge, rebase, or pull `main` — or any other branch — into this
  branch.** The loop merges; you do not. Your work is judged as the diff of
  this branch against `main` as it stands when the run ends, and a merge
  from `main` puts every commit `main` gained meanwhile — the maintainer's
  own edits to reserved files included — into your branch's history, where a
  reviewer reads them as yours. Measured on 2026-09-07 (job
  `j-20260907-13`): an author ran `git merge main` twice to "freshen" its
  branch, inherited a registry commit no job may make, and the reserved-path
  breaker halted the Desk. If `main` has moved, that is not your concern.
- **Never create or remove a git worktree, and never touch `node_modules`.**
  `node_modules` in this worktree is a JUNCTION to the shared install, so
  `git worktree remove --force`, `rm -rf node_modules`, `npm ci` and
  `npm install` all go THROUGH it and empty the shared install for every
  worktree and every running job on the machine at once. Measured on
  2026-09-07 (job `j-20260907-03`): an author made a scratch worktree for a
  measurement, removed it with `--force`, and the shared install was emptied
  under every other suite on the machine for ten minutes. You do not need a
  second checkout — this branch is the measurement; commit and compare.
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
this job type (targeted; relevant material was omitted or cut — the full files are in this worktree at the paths named below, read them if you need the omitted or complete text).

 ### From `specs/education-dynamic` (full text: `D:/AddictedtoAI/openspec/specs/education-dynamic/spec.md`)

### Requirement: Re-verification is standing upkeep with priority over new tutorials

Re-verifying existing tutorials SHALL be standing upkeep work generated by
the Pulse (a tutorial past its interval appears in the derived work queue)
and SHALL take priority over writing new tutorials whenever both compete for
the same budget. A new tutorial SHALL NOT be started while any existing
tutorial stands demoted for staleness, unless the demoted tutorial's subject
is dead (archival is the correct end state, not re-verification).

#### Scenario: Upkeep outranks growth

- **WHEN** the loop has budget for one tutorial-sized job and one tutorial is
  overdue for re-verification
- **THEN** the re-verification is selected before any new tutorial is started

---

### From `specs/wiki` (full text: `D:/AddictedtoAI/openspec/specs/wiki/spec.md`)

### Requirement: A vendor claim is its own record, filed beside the entry

A **vendor claim** is a thing a party said about itself or its product. A
**fact** is a value the site records with a source. The corpus has had only the
second shape, and the cost of that was paid twice: both finalist builds of
`/frontier` rendered organisation founding dates and founders under
"claimed · unverified", independently, because the only structure available for
"what this vendor says" was "any cited fact"
(`loops/ui-loop/graph/knowledge/implementer-ledger.md` rows 2 and 4). A founding
date is not a vendor claim and SHALL never render as one — and measured on
2026-09-05, all thirteen of the `founded` facts that a first-cited-fact rule
selects are cited from `en.wikipedia.org`, so what shipped was an
encyclopaedia's account of an incorporation presented as a company's own words.

RD-004 states the confusion exactly, and the requirement exists to make the
sentence mechanically true: *`source: cited` records that a value carries a
citation, never that the citation is the vendor's own assertion.*

**The record is a content record of its own, and it is NOT a field on the
entry.** Two mechanisms, not a preference:

- A review record binds a piece's **reviewed surface** — its body plus its front
  matter minus the mechanically-maintained keys, matched by key **name** across
  every content kind. A claim carried in an entry's front matter would either sit
  on that mechanical list, publishing a model-transcribed quotation unreviewed
  and exempting the same key name on every other kind that ever declares it; or
  sit off it, so that a claim arriving — or a verification landing months later
  on a claim already filed — marks the entry mismatched and demands a fresh
  verdict on prose nobody touched.
- A claim ages on **its source's** clock. An entry's cited facts are re-checked
  on the entry's volatility cadence, and the Pulse computes overdue facts every
  run. "Anthropic said this on 2026-08-27" is true forever and re-checking it
  means nothing; what moves is whether anyone has verified it, on the verifier's
  clock. One file cannot answer to two freshness regimes.

Therefore:

- A claim SHALL be a single file under `content/claims/`, validated by its own
  schema, loaded by the same corpus loader as every other content type, and
  classified field-by-field as author prose or not — the exhaustiveness rule in
  "Author-written front matter is prose for the volatile-literal check" applies
  to it in full, and a new string field on it that is classified in neither list
  SHALL fail the build.
- Each record SHALL declare, and the build SHALL fail naming the file and the
  field when any is missing or malformed:
  - **`subject`** — the entry id the claim is about, in the `<kind>/<slug>` form,
    resolved against the corpus exactly as `mentions` is. A subject naming no
    entry SHALL fail the build. The join is **declared, never inferred**: no
    name match, no host match, no title match, for the reason `feeds` binds on a
    declared row id.
  - **`field`** — a snake_case name for the ability or field the claim is about.
    It names what the claim is *about* and SHALL NOT be resolved against the
    subject's `facts`: a claim record and a cited fact sharing a name is exactly
    the collapse this requirement exists to prevent, and a build that joined them
    would rebuild the defect out of the repair.
  - **`quote`** — the claim in the source's own words, verbatim. Classified
    **not author prose**, for the reason `facts[].value` already is: it is the
    data layer, transcribed, and a verbatim record cannot be wrong.
  - **`source_url`** — the document the quote was read from.
  - **`source_host`** — the host component of `source_url`, lowercased. The build
    SHALL fail when it does not equal the host parsed from `source_url`. It is
    redundant on purpose: it is the input to the vendor test below, so carrying
    it puts that input in the file a reviewer reads instead of behind a URL parse
    at render time.
  - **`accessed`** — the local date the source was read, as every dated record in
    this repository uses local dates.
  - **`verified`** — optional, and **three-valued** (below).
- A claim SHALL be treated as `dated` by construction. No re-check work SHALL
  ever be generated for a claim record, and no overdue marker SHALL render on
  one. What can go stale is its verification state, not the claim.
- Several claims MAY name the same `subject` and `field` — a vendor repeating
  itself, or two sources for one assertion — and a surface orders them by
  `accessed`, newest first. Two records sharing all of `subject`, `field`,
  `source_url` and `accessed` are a duplicate and SHALL fail the build naming
  both files.
- A claim record SHALL NOT mint a route of its own. Its rendered home is its
  subject's entry page, at a stable fragment, and it SHALL NOT appear in the
  sitemap or the search index as a document in its own right.
- **No surface SHALL construct a claim from an entry's `facts`**, whatever those
  facts are named and whatever their `source_url` says. A claim surface with no
  claim records renders empty. That empty state is the honest one, and it is the
  state the corpus is in on the day this lands.

**`verified` is three states and they are not two.** The distinction is the
whole point, and the defect it prevents is the one this requirement opens with —
a default that reads as a finding:

- **absent** — nobody has looked. A surface SHALL render **no statement about
  verification at all**. It SHALL NOT say "unverified", "not verified",
  "unconfirmed" or anything else that asserts a check which never happened.
- **`false`** — someone looked and did not confirm it. A surface renders
  "not verified" (or the equivalent it has chosen) for this case and **only**
  this case.
- **`{ by, url, date }`** — someone looked and confirmed it, naming who, the
  document that supports the confirmation, and the local date.

`verified: true` SHALL fail the build, naming the file: a confirmation with no
verifier, no document and no date is a claim about a check rather than a record
of one, which is the `intent-not-measurement` defect written into the schema.

**The worked example** — a complete claim record, normative for field names and
shapes:

```yaml
---
subject: org/moonshot-ai
field: agentic_task_completion
quote: "Kimi K2 completes multi-step engineering tasks end to end, without a human in the loop."
source_url: "https://platform.kimi.ai/blog/k2-launch"
source_host: platform.kimi.ai
accessed: "2026-09-05"
verified: false
---
```

#### Scenario: A founding date cannot render as a vendor claim

- **WHEN** a surface renders what an organisation says about itself, and the
  organisation's entry carries a cited `founded` fact — sourced, as all thirteen
  in this corpus are, from an encyclopaedia — and no claim record
- **THEN** the surface renders its empty state, because a claim is read from a
  claim record and from nowhere else — and the founding date renders where it
  always did, as a sourced fact on the entry

#### Scenario: An unlooked-at claim says nothing about verification

- **WHEN** a claim record carries no `verified` key
- **THEN** every surface rendering it renders no verification statement of any
  kind — not "unverified", not "unconfirmed", not an empty verification slot
  that reads as a negative finding

#### Scenario: A negative finding is recorded, not implied

- **WHEN** a verifier fetched the source and could not confirm the claim, and
  records `verified: false`
- **THEN** the surface renders "not verified", and the record shows that a check
  happened and failed rather than that no check happened

#### Scenario: A confirmation must name its evidence

- **WHEN** a claim record declares `verified: true`
- **THEN** the build fails naming the file, because a confirmation carries
  `by`, `url` and `date` or it is not a confirmation

#### Scenario: A claim's subject is a declared entry

- **WHEN** a claim record names a `subject` that no entry declares
- **THEN** the build fails naming the file and the id, exactly as an unresolved
  `mentions` id does

#### Scenario: A verification does not re-review the entry

- **WHEN** a `verified` block is added to an existing claim record whose subject
  entry carries an approved review record
- **THEN** the entry's review record still reports the entry as matching, and the
  claim record itself reports mismatched until a fresh verdict is recorded
  against its changed bytes

#### Scenario: A claim never goes overdue

- **WHEN** a claim record's `accessed` date is a year old
- **THEN** no overdue marker renders on it and no re-check work enters the
  derived queue, because a claim is a dated statement about the day it was made

---

### From `specs/review` (full text: `D:/AddictedtoAI/openspec/specs/review/spec.md`)

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
