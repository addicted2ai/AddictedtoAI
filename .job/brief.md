# Job j-20260911-04 — `repair`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260911-04`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260911-04`
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
- **Work source**: directive (DIRECTIVES.md line 128)

## The outcome

walk the deferred learn cross-links and add the ones whose targets now exist — `addictedtoai-ckn`. The learn wave was written out of dependency order, and because an internal link to a nonexistent page FAILS THE BUILD, each writer correctly worked around a link the surface should have. Those workarounds were never revisited. TWO INSTANCES ARE RECORDED, both reported unprompted by their writers on 2026-08-30, and BOTH TARGETS NOW EXIST — confirm that on disk before acting, do not take it from this line. (1) `content/learn/why-bigger-got-better.md` says the walls (data, power, money) point "at the costs page", meaning `what-it-costs-to-build-and-run-ai`, and resolved it with a dated aside ending "a subject of its own" that carries no link. The aside should now gain the link. (2) `content/learn/looking-inside-a-model.md` had a must-cover referencing `what-a-neural-network-is` as the page that established "nobody can read the numbers"; the page established the premise itself from `what-a-model-is` and the clause was reworded to a writer's note in 7db206e. THIS ONE IS A JUDGEMENT, NOT A LINK: decide whether `looking-inside-a-model` should now DECLARE `what-a-neural-network-is` as a prerequisite (foundations → advanced is a legal down-edge) or keep standing on its own, and write down which and why. Adding the prerequisite is a real change to the curriculum graph, so do not do it casually; the page currently stands on its own and that is a defensible answer. THE RULE THAT MAKES THIS DELICATE, and it is the whole reason instance 2 exists: among learn pages a page may assume only its transitive prerequisites, so adding a LINK is safe while adding an ASSUMPTION is a spec-violation. A link that tells the reader where a subject lives is always allowed; a sentence that leans on what the target teaches is allowed only if the edge is declared. Search the learn surface for other deferred edges of the same shape while you are in here — phrases like "a subject of its own", "its own page", "beyond this page" sitting next to a page that now exists — and add any you can defend, reporting each. Run the build: an added internal link is exactly the edit that can fail it. Every page you touch here carries an approval record and this job rebinds them.


This is **one job with one outcome**. It ends in exactly one merge or one
discard. Do not widen it: a diff that exceeds the stated outcome is a
`scope-violation` at review and the whole job is rejected for it.

## Acceptance checks

- The specific broken thing is fixed, and the fix was verified by running the check that found it.
- The diff touches only what the repair needs.
- If the underlying resource is genuinely gone, record that as the finding rather than inventing a replacement.
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
and a `repair` job's flagged proposal is counted exactly as before. A proposal on a branch that
is DISCARDED dies with the branch: ideas do not
outlive the rejection of the work that produced them. At merge the loop stamps
this job's type (`repair`) onto each kept proposal, overwriting whatever you
wrote there, and a proposal whose stamped origin type equals the type it proposes
is auto-discarded with a pointer to the self-amplification rule — so this job
cannot propose another `repair`. Noticing across types is the designed path.

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

 ### From `specs/pulse` (full text: `D:/AddictedtoAI/openspec/specs/pulse/spec.md`)

### Requirement: Freshness is computed, staleness cannot hide

The Pulse SHALL compute, every run: which cited facts are past their
volatility interval, which tutorials are past `reverify_days` (and past
2×, for demotion), which directory listings failed verification, which
links in the corpus are broken (rolling, every link at least every 30
days), and which declared feed rows have vanished (a row id an entry's
`feeds` map declares that is absent from the latest snapshot — the state
behind the last-known-value rendering in `wiki`). All staleness display
(overdue markers, tutorial banners, demotions, could-not-verify marks,
vanished-row as-of dates) derives from this computation at build time.

Additionally: a source or extractor that has reported "no change" for 3×
its registry-declared `expected_change_days` (not its fetch cadence — the
two are different fields) SHALL be flagged suspect, its dependent facts
switching from displaying "last checked" to "last changed", so a silently
broken fetcher cannot make the site look fresher than it is.

#### Scenario: A silent extractor is caught

- **WHEN** a source known to change roughly weekly reports no change for
  three weeks
- **THEN** its facts display "last changed <date>" instead of "checked
  <recent date>", a suspect flag renders on affected pages, and a repair
  finding enters the derived queue

---

### From `specs/site` (full text: `D:/AddictedtoAI/openspec/specs/site/spec.md`)

### Requirement: Published URLs never break

No published URL SHALL ever 404. Renames and removals leave permanent
redirects. Removing content is allowed (pruning weak pages is healthy) but
the URL redirects to the nearest surviving parent with a notice. The build
SHALL verify every internal link resolves; a broken internal link fails the
build.

#### Scenario: A pruned page leaves a redirect

- **WHEN** a page is removed as not worth keeping
- **THEN** its URL permanently redirects to its section index and the
  redirect is recorded in a checked-in redirects file

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

**A later verdict that lands on a post SHALL settle the voice question rather
than inherit it.** A `reads-human` answers for the bytes its writer read. A
repair, a revision or any later job may rewrite those bytes and be approved by a
reviewer of its own, and the piece is then bound and clean while the only
reviewer that ever answered the voice question read an older version. **The job
type does not say whether that happened.** The type says what the job was for;
the merged subjects say what it touched, and a job of any type may touch a post.
So every **approving** verdict on a job whose merged subjects include a blog
post SHALL answer for **each such post**, in one of two ways, and a post among
those subjects that is left unanswered is refused exactly as a blank
`reads-human` is refused:

- **answer the question afresh**, in a non-empty, non-duplicated
  `reads-human`, as above. One such field answers for every post among the
  merged subjects that the record carries no carry-forward entry for — it is
  one reviewer's own-words judgment of the prose that reviewer read, and this
  requirement does not divide it per post; or
- **carry the prior answer forward**, in a `reads-human-from` entry naming the
  post it answers for, the earlier approving record it stands on, and the
  reviewer's own-words statement of why this diff did not move that post's
  voice.

`reads-human-from` SHALL be a **list of entries** — each naming its post, its
record and its statement — and not a single record-wide field. A job's merged
subjects may hold more than one blog post, each post's voice verdict lives in a
record of its own, and a single carry-forward could therefore approve one post
while leaving another bound and unanswered. An entry naming a path that is not
among the merged subjects is refused on the same terms as one whose record does
not hold up.

The two branches are not equally available to every job, and that is the point.
A `post` job is already held to the **fresh** answer by the paragraph above; the
choice is what this requirement adds for every **other** job whose diff reaches
a post.

The merge SHALL refuse a `reads-human-from` entry whose named record does not
exist, does not approve **the post that entry names**, or carries no non-empty
`reads-human` of its own, and SHALL refuse one whose statement is empty or
exactly duplicates the statement in any **other** record — on the same terms and
at the same point it refuses a blank `would-cite`. Two entries in the **same**
record may carry the same statement: one job making the same trivial correction
to two posts has one honest sentence to write about both, and the duplicate rule
is there to catch a sentence recycled across reviews. Any path that reports on a
post's voice SHALL resolve that post's own entry — the one naming it — to the
record that answered, and SHALL report a post whose entry reaches no such record
exactly as it reports one whose own record has none.

A post whose current approving record carries neither a `reads-human` nor a
`reads-human-from` entry naming it is not invalid where that record predates
this requirement — every record written before the merge
began asking the question is one, exactly as every record written before the
merge began writing `reviewed:` carries no `reviewed:` key. It is a distinct,
named state, and it is satisfied by any earlier approving record naming that
piece which carries a non-empty `reads-human`. A record written **after** this
requirement SHALL NOT enter that state: the merge refuses it at the point above,
so the reach-back reaches only records that could not have carried a
carry-forward. Reporting such a post as unanswered would redden a check over
records nobody may now write, which is a guardrail firing on its own history.

The two branches are not interchangeable, and neither collapses into the other.
Asking a repair reviewer to produce a voice verdict on a three-sentence licence
correction asks it of a diff with no voice in it, and the sentence it would
write is the forced-judgment field the duplicate rule already exists to catch.
Letting it write nothing is how an answer comes to speak for bytes that are
gone. Naming the record it stands on is answerable from what a repair reviewer
actually sees.

Stated with the same honesty this requirement states about `would-cite`: the
carry-forward compels the **form** — a reviewer named the record it stands on
and said why the prose did not move — and never the correctness of that
judgment. A reviewer that carries a verdict forward across a rewrite has
committed a `spec-violation` against this requirement, catchable by the next
reviewer of that piece and by nothing mechanical.

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

#### Scenario: A repair carries the voice verdict forward instead of inventing one

- **WHEN** a repair job corrects three licence sentences in an already-approved
  post and its reviewer approves the diff
- **THEN** the verdict carries a `reads-human-from` entry naming that post, the
  post's earlier approving record, and why the correction did not move the
  post's voice; the merge accepts it, and no reviewer is made to write a voice
  verdict about a diff

#### Scenario: A carry-forward that stands on nothing is refused

- **WHEN** an approving post verdict carries a `reads-human-from` entry whose
  named record does not approve the post that entry names, or carries no
  `reads-human` of its own
- **THEN** the merge refuses the verdict, naming the record it could not stand
  on, exactly as it refuses a blank `would-cite`

#### Scenario: A repair that lands on a post and answers neither way is refused

- **WHEN** a job whose type is not `post` merges an edit to a `content/blog/`
  post and its reviewer approves with neither a `reads-human` nor a
  `reads-human-from` entry naming that post
- **THEN** the merge refuses the verdict, because the obligation follows the
  merged subjects and not the job type, and the reviewer re-issues it naming the
  record it stands on

#### Scenario: A job that lands on two posts answers for both

- **WHEN** one job's merged subjects hold two `content/blog/` posts and its
  approving verdict carries a `reads-human-from` entry for the first post only,
  with no `reads-human` of its own
- **THEN** the merge refuses the verdict, naming the second post as the one left
  unanswered, and the reviewer re-issues it with an entry for that post too or a
  fresh `reads-human` covering it — and every path that reports on a post's
  voice resolves each of the two posts through its own entry, so the merge and
  the launch check agree post by post

#### Scenario: A post approved before the carry-forward existed is a named state

- **WHEN** a post's current approving record was written before this requirement
  and carries neither field, and an earlier approving record naming that post
  carries a non-empty `reads-human`
- **THEN** the voice question counts as answered by that earlier record, no
  check fails on the post, and a record written after this requirement in the
  same shape is refused at merge instead of joining that state

---

### PENDING AMENDMENT to `specs/review` — in-flight change `two-desks-work-orders-and-trains`
(full text: `D:/AddictedtoAI/openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.



[... CUT: requirement "The reviewer judges quality with full standing, from a named reason list" from `D:/AddictedtoAI/openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md` ...]
