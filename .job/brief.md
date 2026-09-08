# Job j-20260908-05 — `entry`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260908-05`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260908-05`
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
- **Work source**: directive (DIRECTIVES.md line 144)

## The outcome

`content/wiki/model/z-ai-glm-5-2-free.md` states its date twice in one sentence — judge the wording and improve it if you agree, WITHOUT breaking the census check. The sentence reads "A live fetch of the catalog on 2026-09-07 ([...]) carried 430 rows as observed on 7 September 2026, and confirmed the withdrawal." The orchestrator wrote it that way this morning and thinks the doubled date is worse prose than the page deserves; that is an opinion offered as context and not as a conclusion to accept, and if you judge the sentence sound as it stands then say so and improve something else on the page you can defend. THE CONSTRAINT IS THE INTERESTING PART AND IT IS NOT OPTIONAL: `lib/snapshot-census.mjs` pairs a census claim with a date IN ITS OWN PARAGRAPH, and clears it only when that paragraph carries the exact marker `as observed on DATE` in prose with the date immediately after it. This paragraph carries TWO census claims, "430 rows" and "eighteen `:free` rows". Removing the ISO date `on 2026-09-07` does NOT remove the anchor — it moves it to the next date in the paragraph, which is the 2026-09-06 snapshot three lines up, and the build then demands a marker naming 6 September, which would be FALSE because the fetch happened on the 7th. That was measured this morning, not theorised: the first repair attempt did exactly this and the build failed a second time with a different date. So `npm run build` must stay green and the marker must keep naming 7 September 2026. WHY THIS LINE EXISTS AT ALL, said plainly: the page carries two review records written against bytes that changed when the census was hedged, so `verify-launch` reports it `mismatched` and the launch minimums are not met. A pure re-review cannot clear that (addictedtoai-vqbo), because a job that changes nothing writes no record. This line therefore asks for a real judgement that produces a diff, which is a workaround for a machinery gap and is named as one rather than dressed up as editorial need. Read the page on its own terms; the surrounding facts, the two dates 2026-09-06 and 2026-09-07, and the row counts are all correct and none of them is what is being questioned.


This is **one job with one outcome**. It ends in exactly one merge or one
discard. Do not widen it: a diff that exceeds the stated outcome is a
`scope-violation` at review and the whole job is rejected for it.

## Acceptance checks

- The entry validates against the front-matter schema for its kind; the build passes.
- Every cited fact carries a reachable source and an accessed date, and the source says what the fact says.
- Volatile values are transclusions or feed-bound, never literals.
- Aliases are classed sanely (exclusive / shared / manual).
- If the entry carries prose, the prose adds something the data alone does not.
- The branch still passes every gate the loop runs on it before review:
  `npm run test`, `npm run build`, `node scripts/verify-surfaces.mjs`, `node scripts/verify-design.mjs`. This list is
  generated from the gate set itself, so it cannot drift from what will actually run.
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
`data/proposals/dropped/` with a note naming them. Declaring `frontier: true`
does not lift it: the frontier exemption is the SCOUT'S cap and no other job's,
and a `entry` job's flagged proposal is counted exactly as before. A proposal on a branch that
is DISCARDED dies with the branch: ideas do not
outlive the rejection of the work that produced them. At merge the loop stamps
this job's type (`entry`) onto each kept proposal, overwriting whatever you
wrote there, and a proposal whose stamped origin type equals the type it proposes
is auto-discarded with a pointer to the self-amplification rule — so this job
cannot propose another `entry`. Noticing across types is the designed path.

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
this job type (targeted and truncated — the full files are in this worktree at the paths named below, read them if you need more).

### From `specs/wiki` (full text: `D:/AddictedtoAI/openspec/specs/wiki/spec.md`)

2 requirements omitted here: the pending amendment below restates them in full. Quoting both would spend the excerpt budget on superseded text and hand you two versions of one rule.

### Requirement: Feed binding joins on declared ids, never on names

A feed-bound fact is joined to its source row by an **explicitly declared
row id**, never by name matching — name matching is guessing, and this
design never guesses. Concretely:

- An entry that binds any fact to a feed SHALL declare, in a `feeds` map in
  its front matter, the row id it corresponds to in each source, using that
  source's own id field (for OpenRouter, the row's `id` such as
  `anthropic/claude-opus-5`; each source's registry entry names which field
  is its row id).
- Each feed-bound fact declares the source id and the field path within the
  joined row (dot notation, e.g. `pricing.prompt`).
- A feed row whose id is declared by no entry feeds the model catalog and
  the changed feed; it SHALL never modify any existing entry. For a source
  with a `mints` mapping it additionally mints a **new** stub record per
  the ingest-minting rule in `pulse` — creating a new record and touching
  an existing entry are different operations, and only the first is ever
  automatic.
- A declared row id that is absent from the current snapshot SHALL cause
  the fact to render its last-known value with a visible as-of date, and a
  repair finding enters the derived queue. It never renders as current.

**The worked example** — the complete front matter of one entry, normative
for field names and shapes (prose body follows the closing delimiter):

```yaml
id: model/claude-opus-5
kind: model
display_name: "Claude Opus 5"
status: active            # active | preview | announced | deprecated | retired | dead
maintenance: living       # living | stable | dormant
aliases:
  - name: "Claude Opus 5"
    class: exclusive
  - name: "Opus 5"
    class: shared
  - name: "Claude"
    class: manual
feeds:
  openrouter-models: "anthropic/claude-opus-5"   # this source's row id
facts:
  - field: price_input
    source: feed
    feed: openrouter-models
    path: pricing.prompt
    volatility: fast
  - field: context_window
    source: feed
    feed: openrouter-models
    path: context_length
    volatility: fast
  - field: release_date
    source: cited
    value: "2026-05-01"
    source_url: "https://www.anthropic.com/news/claude-opus-5"
    accessed: "2026-08-27"
    volatility: dated
timeline:
  - date: "2026-05-01"
    event: released
    source_url: "https://www.anthropic.com/news/claude-opus-5"
mentions: []
```

#### Scenario: A declared join updates the entry

- **WHEN** the snapshot row `anthropic/claude-opus-5` changes its
  `pricing.prompt` value
- **THEN** the entry above renders the new `price_input` at next build,
  because the join was declared — not inferred

#### Scenario: An undeclared row never modifies an existing entry

- **WHEN** a new row appears in a feed and no entry declares its id
- **THEN** it appears in the model catalog and (if material) the changed
  feed, no existing entry's facts change, and — only if the source
  declares a `mints` mapping — a new stub record is created per `pulse`

#### Scenario: A vanished row cannot pose as current

- **WHEN** an entry declares a row id that the latest snapshot no longer
  contains
- **THEN** the bound facts render their last-known values with a visible
  as-of date and a repair finding appears in the derived queue

### Requirement: Entries are tiered, and only worthy pages are indexed

Every entry is either a **stub** (structured data only, no prose body) or
**full** (has a prose body). Stubs SHALL exist freely at zero inference cost:
they render a page from their data (identity, facts, timeline, backlinks),
they appear in the client-side name search (defined in `site`) and in the
open dataset, but they carry `noindex` and appear in no browse listing.

An entry SHALL be indexed (no `noindex`, present in browse listings) only if
at least one of:

- it has a prose body that passed review, or
- it has 2 or more facts and at least one recorded timeline event, or
- its status is `deprecated`, `retired`, or `dead` (an obituary with dated
  lifecycle facts is worth indexing: the vendor deletes theirs).

The indexability decision SHALL be derived at build time from these rules,
never authored by hand.

#### Scenario: A stub exists without being publishable noise

- **WHEN** ingest creates an entry with only identity and one fact
- **THEN** its page renders, is findable through the client-side name
  search, carries `noindex`, and appears in no browse listing

#### Scenario: A dead thing's entry is indexed

- **WHEN** an entry's status becomes `retired` with a dated, sourced
  timeline event
- **THEN** the entry is indexed and appears in the deprecations/retirements
  listings even if it has no prose body

### Requirement: A claim is the subject's own only when the source is

A column labelled as carrying what a party **said** SHALL admit a claim only
where that party is the claim's own cited source. This is the round-4 addendum
to `loops/ui-loop/RULES.md` R13, and it was written because an implementation
that looked correct was not: a "vendor claim" column, under a lede reading
"quoted verbatim from the vendor", rendered OpenRouter's rolling median of live
traffic (`observed_throughput_p50`) and an llm-releases.com analysis
(`output_tokens_per_task`, `cost_per_task`) as vendor claims
(`implementer-ledger.md` row 10; red-team finding FM-N3). A field-name test
standing in for a source test.

- **A measurement is not a claim, whatever field name carries it.** A third
  party's measurement of a vendor's product is that third party's statement. It
  is admissible as a third party's, never as the vendor's, and a rule that
  admits it by field name admits every future field with a similar name.
- **Ownership is read off the registrable domain, never off a host's labels.**
  The public suffix is a host's last label, except for an explicit table of
  multi-label suffixes (`co.uk`, `com.cn`, `github.io`, …) where it is the last
  two; the **registrable domain** is that suffix plus the one label to its left,
  and that label — the string a registrant actually bought — is the only one
  ownership can be read from. `www.tencent.com` is `tencent.com`;
  `deepmind.google` is `deepmind.google`, and because `.google` is a
  single-label brand TLD, `blog.google` is a **different** registrable domain
  from it and neither is `google.com`; `google.attacker.example` is
  `attacker.example`.
- **This rule SHALL be stated once in the source tree and duplicated nowhere**,
  with the multi-label suffix table beside it. The round-4 form of the test asked
  whether any dot-separated label of a cited host was one of the subject's name
  tokens — label identity with no notion of position, which cleared
  `google.<anyone-else>` for Google DeepMind exactly as `deepmind.google` did.
  An `endsWith('.' + recorded)` test has the same hole from the other side
  (red-team finding FM-N5). Both are what a second copy of this logic drifts
  back into.
- A claim SHALL be attributed to its subject when `source_host`'s registrable
  domain is one of three things and **nothing else**: **one the subject declares
  publishing from**; **one the subject's own entry records citing itself from**
  (the registrable domain of a `facts[].source_url` or a `timeline[].source_url`
  on that entry, kept only where that domain's own registrable label is one of
  the subject's name tokens); or one whose registrable label is one of the
  subject's name tokens. A claim failing the test still validates and is still a
  claim; it renders attributed to whoever does own the domain, never to the
  subject.

  The recorded half is half the live rule and is written here because dropping it
  is invisible: R13 (v) carries both halves, `lib/vendor-domain.mjs`'s
  `recordedDomains` implements it — extracted from the board's own former helper
  in `lib/render/frontier.mjs`, which the board now reads rather than copies, so
  that name no longer exists in the tree — and invariant
  `S22` clause (e) re-derives both —
  so a spec carrying one half reads as a correction of the other two rather than
  as an omission, and the next implementer "fixes" the gate back to match it. Its
  own name-token filter is not decoration: **all thirteen** `founded` facts in
  this corpus cite `en.wikipedia.org` (measured 2026-09-05; re-measured
  2026-09-06 as fifteen of sixteen across a widened `content/wiki/org/`, one
  entry citing `github.com` instead), so an unfiltered "records citing itself
  from" admits an encyclopaedia as a vendor-owned domain — the exact defect the
  first requirement exists to end, re-entering through the test meant to catch it.

  **And because of that filter the recorded half admits nothing the name-token
  half does not.** It keeps a cited domain only where the domain's own
  registrable label is a name token, which is the same predicate the third path
  tests, so it is a strict subset of the third and can never fire alone. That is
  stated so an implementer told to build three admission paths is not left
  hunting for the case that exercises the second. It is written out anyway, and
  the reason is the paragraph above: a rule carrying one half of what R13 (v),
  `lib/vendor-domain.mjs` and `S22` clause (e) all carry reads as a correction
  of them. If the name-token path is ever narrowed, this half stops being a
  subset and starts doing work. *(Finding `j-20260905-22-carry-3`, verified
  against the implementation and applied 2026-09-06; asserted in
  `lib/vendor-domain.test.mjs` so the subset relation cannot rot silently.)*

- **Name tokens are identifying words, and a generic corporate word is not one.**
  The tokens of a subject are the normalised whole names — its `display_name` and
  its declared `aliases` — **and** their individual words, **excluding** the
  generic corporate family: `ai`, `labs`, `lab`, `cloud`, `inc`, `corp`,
  `corporation`, `company`, `group`, `foundation`, `pbc`, `ltd`, `llc`,
  `technologies`, `technology`, `research`, and the rest of that family. Without
  the exclusion "Inception Labs" tokenises to `labs` and the test admits
  `labs.com`; "Ai2" and every `… Research` name admit `research.example`. That is
  not a corner case — it is a large fraction of this corpus admitting a stranger's
  domain, and it is red-team finding FM-N5's lookalike hole re-opened one label
  over. A token SHALL be matched against the **one** ownership label of the
  registrable domain — the label the registrant bought — and never against any
  other label of the host, which is the same rule the bullet above states and the
  reason it is stated once.

**An entry MAY declare `publishes_from`.** A vendor's product-brand domain is
not one of its name tokens and need not appear in any source it is cited from:
Moonshot AI publishes from `kimi.ai`, and the round-5 addendum records that the
test cannot recognise that domain unless the record carries it. Left undeclared,
a real vendor claim renders as an honest-looking blank (red-team finding
FM-N6) — which is the failure mode hardest to notice, because a blank looks like
the correct handling of an absent claim. **And no build check can detect an
absent declaration**: nothing compares a `publishes_from` set against the entry's
own cited domains for completeness, and nothing could — the entry validates, the
claim validates, the render is well-formed, and the only signal that a real claim
was dropped is a blank that is byte-identical to the blank a subject with no
claims correctly produces. That undetectability is why the burden sits on the org
entry's editorial completeness rather than on a gate: a gate can catch a wrong
declaration and can never catch a missing one.

**This diverges from DESK-ORDER-001 §2 and `SPEC-REVIEW-GUIDE.md` row 51, which
record product-brand domains as `aliases`, and the divergence is deliberate**: a
host is not a name, §2 said "as aliases" when no host field existed to say
otherwise, and the mechanical reasons are the last bullet of this requirement.

- `publishes_from` SHALL be optional, set-valued, and the empty set SHALL be the
  common case. Nothing is required to declare one.
- Each value SHALL be a **registrable domain**, and the build SHALL fail naming
  the entry, the value and the reduction when a value is not equal to its own
  registrable-domain reduction — `platform.kimi.ai` is rejected with `kimi.ai`
  named as the value to declare. Declaring the registrable domain covers every
  host under it, which is what makes the field a statement about a registrant
  rather than a list of URLs to keep current.
- It SHALL be **editorial and declared**, never inferred from the entry's own
  cited source URLs, its title or its aliases, and it SHALL NOT be exempted from
  the reviewed surface. Asserting that a domain belongs to an organisation is a
  judgment about who owns what, and a wrong one attributes a stranger's words to
  a named company.
- It SHALL NOT be carried in `aliases`. An alias is a **name** — the classified
  reason for `aliases[].name` is that this site is about things called
  "Claude 4.5" — and the alias registry is what decides linking, so a hostname
  there is a name the linker may one day wrap in prose. It would also force any
  consumer to guess which aliases are domains by their shape, which is the
  field-name-for-source-test substitution this requirement exists to end.

#### Scenario: A third party's measurement is not the vendor's claim

- **WHEN** a value comes from a router's own measurement of live traffic, or from
  an independent analysis site, and a surface renders what the vendor said
- **THEN** the value does not appear there, whatever its field is called, and the
  surface renders the labelled empty state for that vendor

#### Scenario: A lookalike host is not the vendor's

- **WHEN** a claim cites `https://google.attacker.example/post` and the subject is
  Google DeepMind
- **THEN** the test fails, because the registrable domain is `attacker.example`
  and neither `attacker` nor `attacker.example` is one of the subject's name
  tokens or declared domains

#### Scenario: A brand TLD is not a subdomain

- **WHEN** the subject declares `publishes_from: [deepmind.google]` and a claim
  cites `https://blog.google/...`
- **THEN** the test fails, because `.google` is a single-label public suffix, so
  `blog.google` is a different registrable domain from `deepmind.google` — and a
  claim cited from `https://deepmind.google/discover/...` passes

#### Scenario: A declared brand domain makes a real claim visible

- **WHEN** an org entry declares `publishes_from: [kimi.ai]` and a claim cites
  `https://platform.kimi.ai/blog/...`
- **THEN** the claim is attributed to that organisation, where before the same
  record rendered as a blank indistinguishable from having no claim at all

#### Scenario: A host is declared at the registrable level

- **WHEN** an entry declares `publishes_from: [platform.kimi.ai]`
- **THEN** the build fails, naming the entry, the value and `kimi.ai` as the
  value to declare instead

#### Scenario: Declaring a domain is a reviewed judgment

- **WHEN** `publishes_from` is added to an entry that carries an approved review
  record
- **THEN** that record reports `mismatched` and the entry is not cleared until a
  new verdict is recorded, because who owns a domain is a judgment and a
  judgment publishes through review

### Requirement: Every entry is one typed record with a permanent identity

Every wiki entry SHALL be a single file whose identity is a typed id of the
form `<kind>/<slug>` (for example `model/claude-opus-5`, `org/anthropic`,
`concept/context-window`). Ids MUST be kebab-case, MUST be unique across the
corpus, and MUST never be reused or renamed. When an entry's canonical name
changes, the entry keeps its id and records the new name as an alias; if an
entry must genuinely move (wrong kind at creation), the old id SHALL become a
permanent redirect to the new id.

`kind` SHALL come from this closed list and no other value:
`model`, `org`, `tool`, `concept`, `technique`, `benchmark`, `dataset`,
`hardware`, `paper`, `event`.

There is deliberately no `person` kind. People appear in prose as plain text,
optionally with an external link. This removes the nastiest alias-collision
family (person vs. product) and the defamation-adjacent risk of maintaining
claims about living people. Adding a `person` kind requires an OpenSpec
change.

#### Scenario: Duplicate id is rejected at build time

- **WHEN** two entry files declare the same id
- **THEN** the site build fails with an error naming both file paths and the
  colliding id

#### Scenario: Unknown kind is rejected at build time

- **WHEN** an entry declares a kind outside the closed list
- **THEN** the site build fails with an error naming the file and the invalid
  kind

#### Scenario: A renamed thing keeps its id

- **WHEN** a product covered by an entry is renamed by its vendor
- **THEN** the entry's id is unchanged, the new name is added as an alias,
  the old name remains an alias, and the rename is recorded as a dated
  timeline event with a source

### Requirement: Entries carry lifecycle status and maintenance class

Every entry SHALL carry a status from: `active`, `preview`, `announced`,
`deprecated`, `retired`, `dead`. Status changes SHALL be recorded as dated,
sourced timeline events. Dead and retired things SHALL be kept, never
deleted — the lifecycle record is a differentiator, not an embarrassment.

Every entry SHALL carry a maintenance class:

- `living` — has feed-bound or `fast` facts; the Pulse re-checks on cadence.
- `stable` — `slow` facts only; re-checked on the slow cadence.
- `dormant` — explicitly stamped on its page: "A record as of <date>. No
  longer actively maintained." Costs nothing to keep, forever.

An entry whose subject dies SHALL settle to `dormant` once its final
lifecycle events are recorded. Upkeep burden tracks the living frontier of
the field, not the total corpus size.

#### Scenario: A dormant entry costs nothing and says so

- **WHEN** an entry is classed `dormant`
- **THEN** its page renders a visible "record as of <date>, no longer
  actively maintained" stamp injected by the build, and no re-check work is
  ever generated for it

#### Scenario: Status change becomes a timeline event

- **WHEN** the Pulse's data layer shows a model's status moved from `active`
  to `deprecated`
- **THEN** the entry gains a dated timeline event with the source, and the
  change appears in the home page's changed feed

### Requirement: A fact may declare the fact it corroborates

An entry can carry a feed-bound fact and a cited fact that measure the same
quantity and disagree, and nothing notices. It happened: an entry carried `284B`
parameters from OpenRouter while the checkpoint's own model card and an
independently cited post both said `304B` — OpenRouter publishes the identical
sentence on the preview row and the release row. Transcribing the feed verbatim
was correct behaviour and stays correct; a verbatim fact cannot be wrong. The
prose built an argument on the count being unchanged, and that argument was
refuted by a change two other sources record.

The comparison is cheap. What is missing is a way to say *these two facts
measure the same thing* — field names differ by necessity, since the repair for
that entry named its cited facts `repository_tensor_total` and `preview_parameters`
precisely so they would not collide with the feed-bound `parameters`.

- A fact MAY declare `corroborates: <field>`, naming another fact on the same
  entry that measures the same quantity. The join is declared, never inferred:
  name normalisation, prefix stripping and fuzzy matching are guessing, and this
  design does not guess — the same reason `feeds` binds on a declared row id.
- The build SHALL fail, naming the entry and the field, when a `corroborates`
  value names a field no fact on that entry declares, or names the declaring
  fact itself.
- `corroborates` SHALL NOT change how either fact renders, which of them is
  authoritative, or whether either is re-checked. Declaring that two sources
  disagree is not adjudicating between them, and a feed-bound fact remains what
  its source says, verbatim.

#### Scenario: A declared pair binds

- **WHEN** an entry carries a feed-bound `parameters` fact and a cited
  `repository_tensor_total` fact declaring `corroborates: parameters`
- **THEN** the build accepts both and renders each exactly as it would without
  the declaration

#### Scenario: A corroboration that names nothing fails the build

- **WHEN** a fact declares `corroborates: parameters` and the entry has no
  `parameters` fact
- **THEN** the build fails naming the entry and the field

### Requirement: Aliases are registered, classed, and collision-safe

Every entry SHALL declare its names as aliases. Every alias carries exactly
one link class:

- `exclusive` — claimed by exactly one entry and distinctive
  (`"Claude Opus 5"`, `"ComfyUI"`). Eligible for automatic linking.
- `shared` — claimed by more than one entry, or generic. Never automatically
  linked.
- `manual` — never automatically linked by any process. Single common words
  and bare brand tokens (`"Claude"`, `"Gemini"`, `"Llama"`) MUST be `manual`.

The alias registry SHALL be derived from entry front matter at build time,
never maintained as a separate hand-edited file. When two entries claim the
same alias as `exclusive`, the build SHALL fail; the resolution is to demote
the alias to `shared` or `manual` on both entries.

#### Scenario: Alias collision fails the build

- **WHEN** two entries both declare the alias `"Opus"` as `exclusive`
- **THEN** the site build fails naming both entries and the alias

#### Scenario: Bare ambiguous token is never auto-linked

- **WHEN** prose contains the word `Claude` and the alias `"Claude"` is
  classed `manual`
- **THEN** no automatic process ever wraps it in a link, regardless of
  context

### Requirement: Author-written front matter is prose for the volatile-literal check

*"Volatile facts travel by transclusion, never by restatement"* is unchanged by
this requirement; what changes is where its build-time warning can see. The
warning scans bodies. Deltas are almost entirely front matter — only 6 of 29
have a prose body over 40 characters — so the check is **vacuous on 23 of
them**, and the same shape holds anywhere front matter carries author sentences.

Two measurements shape this requirement and are recorded so nothing acts on the
wrong one. First: **no delta currently carries an unanchored literal.** Eight
front-matter currency literals exist across four files and every one sits inside
a delta end, which `lib/schema.mjs` requires to carry an ISO `date` — a delta end
is a dated historical claim by construction and a dated observation does not
rot. Nothing is burning; those four files are correct as written. Second: the
exposure is structural. Nothing forces a front-matter field to be scanned, and
nothing forces a *new* front-matter field to be classified at all, which is the
vector by which this recurs.

- Every string-valued field in every content schema SHALL be classified, in one
  declared place in `lib/`, as either **author prose** or **not author prose**,
  and the build SHALL fail when a string-valued field exists that is neither.
  This is the mechanism; the scan below is only its consequence. It is the same
  discipline that makes adding a content field an edit to `lib/schema.mjs` by
  design: `alias:` where `aliases:` was meant parses cleanly and nothing
  downstream notices.
- The build SHALL run the volatile-literal scan over every field classified
  author prose, reporting a hit in the same form and at the same severity as a
  body hit — a warning naming the file, the field, the literal and the rule.
  Severity matches the body scan deliberately: enforcement of the no-hard-coding
  rule is the reviewer's named checklist item, and a build that failed here would
  break every historical rebuild the moment a legitimate quoted price appeared.
- A hit SHALL be exempt when the object that directly contains the field carries
  a sibling key whose value is an ISO date. The exemption is mechanical, not a
  list of blessed fields: a delta end carries `date`, a blog correction carries
  `date`, a tool listing carries `last_verified`, and each of those is displayed
  with its date, so the value is a record of that date rather than a claim about
  now. A field with no dated sibling is an undated claim and is scanned.
- The build SHALL report, per content type, how many documents had at least one
  author-prose field scanned and how many had none. A check that runs on nothing
  reports the same clean result as a check that runs on everything, and that
  indistinguishability is the actual defect being fixed here; the count is what
  makes a future vacuum visible on the screen instead of in an audit.

#### Scenario: An undated front-matter literal is warned about

- **WHEN** a static education page's `outcome` states a price literal and no
  sibling key in that object carries an ISO date
- **THEN** the build warns, naming the file, the field, the literal and the
  rule, and does not fail

#### Scenario: A dated observation stays legal

- **WHEN** a delta's `routine` end states a price in its `metric` and that end
  carries its required ISO `date`
- **THEN** the build produces no warning for it

#### Scenario: A new field cannot arrive unclassified

- **WHEN** a string-valued field is added to a content schema and is listed in
  neither classification
- **THEN** the build fails naming that field

#### Scenario: Vacuity is visible

- **WHEN** the build completes
- **THEN** its summary states, per content type, the number of documents with at
  least one author-prose field scanned and the number with none

### Requirement: A listed price is a property of a listing, not of a company

A `price_*` transclusion carries OpenRouter's headline rate for a row. That
number is documented as the **top listed provider's** rate for that row, and the
top provider is re-chosen on a rolling 30-second window. It is a property of a
listing at an instant, not a statement about what any company charges. Prose
that makes some party the setter or receiver of it is false about a number that
is itself perfectly accurate — which is why the repair is never to change the
value.

Two independent causes were measured. The top provider rotates: a headline of
`0.000000045` belonged to a reseller while the vendor's own endpoint posted
`0.00000022`, a factor of 4.9, and two rows compared on their headlines can
therefore invert. Separately, one provider lists a single row at several tier
prices — a flex tier at half, a fast tier at double — so even a row whose
endpoints are all the vendor's own can carry three different numbers.

- The build SHALL FAIL when a `price_*` transclusion appears in a sentence that
  makes some party the setter or receiver of the rate — *charges*, *billed*,
  *priced*, *asks*, *costs*, *sells*, *pays* — unless the surrounding section
  mentions the provider layer. Implemented by `lib/price-attribution.mjs`, wired
  into `lib/build-content.mjs`; measured by `lib/price-attribution.test.mjs`.
- Row-attributing verbs — *lists at*, *heads at*, *carries*, *sits at* — are the
  compliant form and SHALL NOT be flagged. The corpus's remedy idiom must not be
  the thing the check fires on.
- The exemption SHALL BE the remedy, not a suppression marker: the only way to
  silence the check is to write the clause that makes the sentence true. There
  is deliberately no ignore comment, because an ignore comment would make the
  cheapest response to a true finding be to hide it.
- Prose SHALL NOT name the top provider, because it rotates. A sentence naming
  it is accurate for as long as a thirty-second window and false afterwards,
  and nothing in the corpus would ever revisit it.
- The **fact itself SHALL NOT be edited** to resolve any of this. A fact records
  what the feed said at a stated moment and binds at build time; rewriting it
  would trade a true record and a false sentence for two false ones.
- Instances predating the check SHALL be recorded in
  `data/price-attribution-debt.json` and SHALL warn rather than fail. That list
  SHALL only ever shrink, and the build SHALL report its length and name entries
  that no longer fire, so a debt that has been repaid cannot sit in the file
  looking like a debt. Implemented in `lib/price-attribution.mjs`.

#### Scenario: An attributed price fails the build

- **WHEN** a page states that a named company *charges* the rate a `price_*`
  transclusion resolves, and its section says nothing about the provider layer
- **THEN** the build fails, naming the file and the sentence

#### Scenario: The hedge is the remedy

- **WHEN** the same sentence is rewritten to attribute the number to the row —
  or its section explains that the headline is the top listed provider's rate
  rather than necessarily the vendor's own
- **THEN** the build passes, and the fact's value is unchanged

#### Scenario: Pre-existing debt warns and only shrinks

- **WHEN** the build encounters an instance recorded in
  `data/price-attribution-debt.json`
- **THEN** it warns rather than failing, reports how many such instances remain,
  and names any recorded entry that no longer fires

### Requirement: A domain says what a thing is for, and it cuts across kinds

`kind` says what a thing **is** — `model`, `org`, `tool`, `technique`,
`benchmark`. It is a partition: exactly one value, closed, permanent, never
reused. That is the right shape for identity and the wrong shape for the
question a reader actually arrives with. "What is happening in video
generation" has no answer inside any partition by kind, because the answer is a
model, an org, a tool and a technique at once.

`domain` is that second axis. An entry MAY declare the domains it belongs to.
The facet SHALL be:

- **set-valued** — a thing may be in several domains at once, and a
  multimodal model routinely is. There is deliberately no `multimodal` value:
  that is the union of several domains, not a member of the list.
- **optional, with the empty set legal and common** — "general" is the
  **unmarked default**. There is no `general` value to declare and no `text`
  value. An entry carrying no domain is not untagged-and-pending; it is
  general, and that is a complete answer.
- **orthogonal to `kind`** — it neither replaces `kind` nor is derivable from
  it. Every kind may bear it.

The vocabulary is these eight values and no others:

`coding`, `agents`, `image`, `video`, `audio`, `research`, `science-math`,
`robotics`.

**`text` is not a value, and the reason is a measurement.** Read from
`data/sources/openrouter-models/latest.json` on 2026-09-05 (`fetched_at`
`2026-09-05T06:00:04.599Z`, `row_count` 431): every one of the 431 rows takes
text in, out, or both. A facet value carried by every member of the set it is
meant to divide discriminates nothing, and a filter that selects everything is
a filter a reader learns to distrust. Absence carries the same meaning at no
cost.

**The vocabulary SHALL have exactly one definition in the source tree.** That
definition is `lib/domains.mjs`, created by the change
`flag-what-moved-the-frontier` for the post-level frontier gate, and read
unchanged by every other surface that reads a domain — this facet included.
This specification names the eight values so that the requirement is readable
and a reviewer can check it; that is not a second definition, and a build in
which this text and `lib/domains.mjs` disagree has a defect in one of them.
Two closed lists of the same eight strings drift, and the moment they do, the
post gate and the entry gate are two different checks wearing one name — which
is the reads-as-present-and-does-nothing shape this repository keeps catching.

**A value outside the vocabulary SHALL fail the build**, naming the file, the
field, the offending value and the values that are allowed. This is the
treatment an unknown `kind` and an unknown tool `category` already receive, for
the same reason: an open field drifts into `coding` / `code` / `Coding` and the
grouping stops being a partition. It is also what keeps the ordering guarantee
in `directory` honest — an order that is a pure function of the domain ids is
only a guarantee if the set of ids is closed.

The facet is **declared data, never inferred from prose.** No heuristic over an
entry's title, body, aliases or URL may assign a domain. A domain that arrives
mechanically arrives from a named feed field under the seeding requirement
below, and from nowhere else.

#### Scenario: A domain outside the vocabulary stops the build

- **WHEN** an entry declares a domain value of `legal`
- **THEN** the build fails naming the entry file, the field, the value `legal`
  and the eight allowed values, and no page is published

#### Scenario: `text` is not a domain

- **WHEN** an entry declares a domain value of `text`
- **THEN** the build fails exactly as it does for any other value outside the
  vocabulary — general is the unmarked default, and it is expressed by carrying
  no domain rather than by carrying a value every entry would qualify for

#### Scenario: An untagged entry is general, not incomplete

- **WHEN** an entry declares no domain at all
- **THEN** it validates, it publishes, and no marker, warning or work-queue
  item treats the absence as a defect to be repaired

#### Scenario: One thing is in several domains

- **WHEN** a model takes text, image and video input and its entry declares
  `image` and `video`
- **THEN** both values validate, and the entry appears under both domains on
  any surface that groups by domain

#### Scenario: A domain does not displace a kind

- **WHEN** a `technique` entry for computer use declares the domain `agents`
- **THEN** its `kind` remains `technique`, its id is unchanged, and nothing
  about the domain makes `agents` a kind — the two axes are read independently

---

### PENDING AMENDMENT to `specs/wiki` — in-flight change `bind-what-the-catalog-knows`
(full text: `D:/AddictedtoAI/openspec/changes/bind-what-the-catalog-knows/specs/wiki/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

### Requirement: A census counts the current snapshot, and prose transcludes it

A count of rows in a bound source's snapshot — how many rows a source carries,
how many belong to one provider, how many carry a field — SHALL be expressible
as a **census fact**: a fact whose value is computed at build time from the
same data layer every `{{fact:…}}` on the page renders from, and which
therefore names no date and can never be older than the page it sits on.

A census fact declares:

```yaml
facts:
  - field: catalog_rows          # a snake_case field name, as any fact
    source: census
    feed: openrouter-models      # a registered source id
    census: rows                 # an id from the closed census registry
    scope: aion-labs             # OPTIONAL: the declared provider prefix
```

It SHALL declare no `value`, no `source_url`, no `accessed` date and no
volatility class; a build finding any of those on a census fact SHALL fail,
naming the entry and the field. A census fact carries nothing an author could
have got wrong, which is the whole of its guarantee.

**The census registry is closed and has exactly one definition in the source
tree**, read by everything that resolves a census, so that two lists of the
same predicates cannot drift. A fact naming a census id the registry does not
carry SHALL fail the build, naming the entry, the field and the unknown id.

Each registered census names its source and exactly one predicate, drawn from
this closed list of predicate kinds:

- **every row** in the source's current snapshot;
- **a declared dotted path present** on a row — a value that is neither null
  nor empty;
- **a declared dotted path exactly true** on a row;
- **a row id ending in a declared literal**;
- **providers whose row count is at least a declared number** — a count of
  providers, not of rows, and the one kind that takes no scope.

The first four kinds accept the optional `scope`. A `scope` declared on a
census whose kind takes none SHALL fail the build, naming the entry, the field
and the scope — a declared value the predicate cannot use is an inert
declaration, and this build refuses those.

Adding a census over an existing predicate kind is an ordinary code change with
a test; adding a new predicate **kind** is a change to this specification,
because a predicate kind is a new shape of claim the corpus can make.

**A census joins on a declared value, never on an entry's name.** `scope`
carries the provider prefix the entry means, exactly as a feed-bound fact
carries the row id it means. Nothing infers the prefix from the entry's
`display_name`, its id or any alias, for the reason feed binding gives: name
matching is guessing. An entry needs no row of its own to carry a census — an
`org` entry has none — and no new `kind` is introduced to hold one.

**Zero and absent are different answers and SHALL render differently.** A
census whose predicate matches no row, on a scope the snapshot does contain,
renders `0`: nothing matched, and that is a fact. A census with no data layer
behind it — before the first Pulse run — renders as absent, never as `0`,
because `0` is a claim and "not fetched" is not. A `scope` value the current
snapshot matches on no row SHALL render as absent and SHALL put a repair
finding in the derived queue: a scope nothing matches is far likelier to be a
mistyped prefix than a provider that vanished overnight, and a wrong count is
worse than a missing one.

A census fact SHALL render its value with its source reachable from the page —
the named source, and the date of the snapshot it was counted in — and with no
overdue marker and no as-of hedge, because it cannot be stale. It is
transcluded by the transclusion syntax already normative in this
specification; no new marker is introduced, and the syntax stays closed.

#### Scenario: A count comes from the snapshot the page renders from

- **WHEN** an `org` entry declares a census fact scoped to its provider prefix
  and a prose sentence transcludes it
- **THEN** the rendered page states the number of rows that prefix has in the
  snapshot the page's other transclusions render from, with the source and the
  snapshot's date beside it

#### Scenario: The snapshot advances and nothing is edited

- **WHEN** the next fetch adds rows to the source and the site is rebuilt
- **THEN** every page transcluding a census over that source renders the new
  count, no file is edited, no date is updated, and no build error is raised —
  there was no date on the claim to fall out of step

#### Scenario: A predicate that matches nothing renders zero

- **WHEN** a census counts rows carrying a field, scoped to a provider the
  snapshot contains, and no row of that provider carries it
- **THEN** the fact renders `0` with its source and snapshot date

#### Scenario: No data layer renders absent, never zero

- **WHEN** a census fact is rendered before any Pulse run has produced a data
  layer
- **THEN** it renders as absent with its source named, and never as `0`

#### Scenario: A scope nothing matches is a repair finding

- **WHEN** an entry declares a census scoped to a provider prefix that no row
  in the current snapshot carries
- **THEN** the fact renders as absent, a repair finding enters the derived
  queue naming the entry and the scope, and no number is rendered

#### Scenario: An unknown census id fails the build

- **WHEN** an entry declares a census fact naming a census id the registry does
  not carry
- **THEN** the build fails naming the entry, the field and the unknown id,
  before any page renders

#### Scenario: A scope on a census that takes none fails the build

- **WHEN** an entry declares a census fact naming the providers-count census —
  the one predicate kind that takes no scope — and also declares a `scope`
- **THEN** the build fails naming the entry, the field and the scope, before any
  page renders

#### Scenario: A census fact carrying a typed value fails the build

- **WHEN** an entry declares a census fact that also declares a `value`, an
  `accessed` date or a volatility class
- **THEN** the build fails naming the entry and the offending key — a computed
  count with a typed value beside it is the restatement the binding removes

### Requirement: Volatile facts travel by transclusion, never by restatement

Prose anywhere on the site (wiki bodies, education pages, tutorials, blog
posts) SHALL state a volatile fact (any `fast` or `slow` fact: price, context
window, version, status, benchmark score) only by transcluding it from the
owning entry, rendered with its current value at build time. The normative
transclusion syntax is `{{fact:<kind>/<slug>#<field>}}` (for example
`{{fact:model/claude-opus-5#price_input}}`), chosen for grep-ability and
for being inert in any other Markdown renderer; the want marker's normative
syntax is `{{want:Name}}`. Prose MUST NOT hard-code a volatile value as
literal text.

**A count of rows in a bound source's snapshot is a volatile fact of exactly
this kind**, and it SHALL travel the same way. It changes whenever the snapshot
advances, which for a daily-fetched source is most days. Where a registered
census carries the predicate, prose states such a count only by transcluding it;
a count no registered census carries stays under the snapshot-census check and
its hedge. A date written beside a typed count does not exempt it from either:
dating a count makes it honest about the day it describes, it does not make it
current, and the page's own transclusions go on rendering from a newer snapshot
than the date names.

A transclusion whose target entry or field does not exist SHALL fail the
build. Enforcement of the no-hard-coding rule is the reviewer's named
checklist item for every prose piece (see `review`); the build additionally
warns on currency-shaped literals (a number adjacent to `tokens`, `context`,
`$`, `/month`, or a version pattern) in prose outside the wiki data layer.
The reviewer's checklist item SHALL name the census case explicitly, and a
prose piece that types a row count where a census fact could carry it SHALL be
rejected as `spec-violation` naming the census that would have carried it.

#### Scenario: Correcting a fact corrects every surface

- **WHEN** a fact value is corrected on its owning entry
- **THEN** every page that transcludes it shows the corrected value at the
  next build, with no other file edited

#### Scenario: Broken transclusion fails the build

- **WHEN** a prose file transcludes `model/foo · price_input` and no such
  entry or field exists
- **THEN** the site build fails naming the prose file and the missing
  reference

#### Scenario: A dated row count is still a restatement

- **WHEN** a draft states a provider's row count as a numeral with the
  snapshot's date beside it, and a census over that predicate is available
- **THEN** review rejects it as `spec-violation` naming the census fact that
  would have carried the number — the date makes the sentence honest about one
  morning, and the surrounding transclusions are rendering from another

# wiki — delta for bind-what-the-catalog-knows

Two requirements added and two modified. Nothing here changes what an entry
is, how a fact is sourced, how a transclusion is written, or what the reviewer
checks: it adds two bindings for values the corpus already states by hand — a
count of rows in a snapshot, and the date a catalog row was listed — so that
neither has to be typed, dated, or re-dated by anybody.

The two bindings are the same shape as the one already in the specification.
A feed-bound fact says *this value is a named field of a named row*; a census
fact says *this value is a count of the rows a named predicate matches*; a
feed-bound timeline event says *this date is a named instant on a named row*.
All three join on a declared id and none of them guesses.

Why the census half is here rather than left to the check that guards it: the
snapshot-census build check makes a typed count honest, and honest is not the
same as current. A count marked "as observed on 31 August 2026" stops being
wrong and starts being old, while the transclusions two paragraphs below it
render from the snapshot fetched this morning. On 2026-09-06, eighteen counts
across ten wiki pages are in that state and two more are one Pulse run away
from failing the build. A count that is computed cannot be in that state at
all.

## ADDED Requirements

### Requirement: A timeline date may be bound to the feed that records it

A timeline event SHALL take one of two forms, distinguished by an optional
`source` key:

- **cited** — `date`, `event` and `source_url`: a date an author read on a page
  a reader can open. An event declaring no `source` key is a cited event, so
  every event written under the single-form rule stays valid exactly as it
  stands and no entry is migrated.
- **feed** — `event`, the named source and a declared path, and **no `date`**:
  the date is computed from the instant at that path on the joined row.

```yaml
timeline:
  - event: listed in the OpenRouter catalog
    source: feed
    feed: openrouter-models
    path: created
```

**The join is declared, exactly as a feed-bound fact's is.** The entry SHALL
carry the row id in its `feeds` map, and the event SHALL name the source and
the field path within the joined row. An event naming a source the entry's
`feeds` map does not carry SHALL fail the build, naming the entry and the
event. Nothing is matched by name.

A feed-bound event declaring its own `date` SHALL fail the build, naming the
entry and the event: a typed date beside a bound one is the restatement the
binding exists to remove, and the two cannot be kept in step by anything.

**The instant is read as a UTC calendar date.** This repository's local-date
convention governs dates *authored on the machine that writes them* — a fact's
`accessed`, a review record's `date`, a tutorial's `verified_on` — and a
publisher's timestamp is not one of those. Feed instants are already read in
UTC where the build computes the days between two catalog rows, and one
convention for feed instants is what makes those numbers comparable with these
dates.

**The date SHALL be resolved before anything consumes the timeline**, so that
every consumer — the entry page's ordering, the published dataset's rows, the
indexability count, the dormant stamp — sees one shape and no consumer learns
that binding exists. The exported dataset row SHALL carry a resolved date and a
reachable source for both forms.

A feed-bound event whose declared row is absent from the current snapshot SHALL
render its last-known date with a visible as-of date, and a repair finding
enters the derived queue — the same treatment a vanished row's facts receive.
It SHALL NOT disappear from the timeline: an event that happened does not
un-happen because the row was delisted.

**A feed-bound event whose joined row carries no last-known instant at all
SHALL resolve to no date rather than fail** — never `undefined`, so nothing
downstream throws — and SHALL still render on the timeline, named and sourced,
sorted as the oldest event on the page. Two states reach this: a declared row
that has never appeared in any snapshot, which is `$vanished` from the moment
it is first joined and carries the same repair finding a vanished row's facts
already receive; and resolution running before any Pulse run has produced a
data layer at all, which carries none — nothing has run yet to notice a
missing row.

#### Scenario: A listing date is bound rather than transcribed

- **WHEN** an entry joined to a catalog row declares a timeline event bound to
  that row's listing instant
- **THEN** the entry page shows the listing date computed from the snapshot,
  with the source named, and no date appears in the entry's front matter

#### Scenario: An event with no source key is a cited event

- **WHEN** an entry carries a timeline event declaring `date`, `event` and
  `source_url` and no `source` key
- **THEN** it validates and renders exactly as it did before the two forms
  existed

#### Scenario: A feed-bound event carrying a date fails the build

- **WHEN** a timeline event declares the feed form and also declares `date`
- **THEN** the build fails naming the entry and the event

#### Scenario: A feed-bound event on an undeclared source fails the build

- **WHEN** a timeline event names a source the entry's `feeds` map does not
  carry
- **THEN** the build fails naming the entry and the event, before any page
  renders

#### Scenario: A vanished row keeps the event it dated

- **WHEN** the row a timeline event binds to is absent from the latest snapshot
- **THEN** the event renders its last-known date with a visible as-of date, a
  repair finding appears in the derived queue, and the event stays on the
  timeline

## MODIFIED Requirements

### Requirement: Entries carry structured, sourced, dated facts

Each entry SHALL carry zero or more facts in its structured front matter.
Every fact MUST declare:

- a field name (for example `context_window`, `price_input`, `license`,
  `status`),
- a value,
- a source: either `feed` (the value is bound to a named field of a named
  Pulse data source and rendered from the data layer at build time),
  `census` (the value is a count of the rows of a named Pulse data source that
  a named predicate matches, computed from that same data layer at build time)
  or `cited` (a manual value with a `source_url` and an `accessed` date),
- a volatility class: `fast` (re-check within 14 days), `slow` (re-check
  within 120 days), `static` (not re-checked), or `dated` (true as of its
  date, displayed with the date, never re-checked).

A `census` fact is the single exception to the volatility bullet: it SHALL
declare no volatility class, and a build that finds one on a census fact SHALL
fail naming the entry and the field. Nothing re-checks a count recomputed from
the current snapshot at every build, so an interval on one would describe a
staleness it cannot have.

A `cited` fact whose `accessed` date is older than its volatility interval
SHALL be rendered with a visible overdue marker. A fact MUST never render
without its source being reachable from the rendered page (a link for
`cited`, the named source for `feed` and for `census`).

#### Scenario: Feed-bound fact updates without editing the entry

- **WHEN** the Pulse's data layer records a new value for a feed-bound fact
  (for example, a model's price changes at the source)
- **THEN** the next site build renders the new value on the entry page and on
  every page that transcludes that fact, with no edit to any entry or prose
  file

#### Scenario: Overdue cited fact is visibly overdue

- **WHEN** a `fast` cited fact's `accessed` date is more than 14 days old at
  build time
- **THEN** the rendered fact carries a visible marker stating when it was
  last verified, injected by the build, not authored by hand

#### Scenario: Fact without a source fails the build

- **WHEN** an entry declares a `cited` fact with no `source_url` or no
  `accessed` date
- **THEN** the site build fails naming the entry and the field

#### Scenario: A census fact declaring a volatility class fails the build

- **WHEN** an entry declares a `census` fact carrying `volatility: fast`
- **THEN** the build fails naming the entry and the field — a value recomputed
  at every build has no re-check interval

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

### Requirement: The cut list is enforced, not aspirational

The following SHALL be cut wherever found, by authors before review and by
reviewers on sight:

- filler openers and closers ("In the rapidly evolving world of AI…", "In
  conclusion…", "It remains to be seen…");
- hedging boilerplate that conveys no probability ("it could be argued");
- restating in prose what an adjacent table or transclusion already shows;
- listicle padding — enumeration without judgment;
- self-reference outside the colophon (the site discussing its own process,
  machinery, or history);
- unsupported superlatives ("game-changing", "revolutionary") — a
  superlative requires a measurement or a source;
- any sentence written to fill space rather than to inform.

#### Scenario: Filler is a defect, not a style choice

- **WHEN** a draft opens with a paragraph that could open any AI article
- **THEN** review names it under the cut list and the piece does not publish
  until it is gone

### Requirement: The subject carries the awe; the voice stays plain

The site's wonder comes from what the field actually contains — capability
shifts, dated deltas, things that were research results becoming commodity
calls — demonstrated with receipts, never asserted with adjectives. There
SHALL be no "does this make AI look good" consideration anywhere: a story
about a failed promise or a safety incident is exactly as in-mission as a
capability story. Enthusiasm without evidence and cynicism without evidence
are the same defect.

#### Scenario: Awe as a finding

- **WHEN** a piece wants to convey that progress is fast
- **THEN** it shows dated evidence (what was impossible on date A, routine
  on date B, with sources) rather than intensifiers

# editorial Specification

## Purpose
The quality bar. Content carries no per-item change artifact, so this spec is
the only place the standard for "is this worth publishing" lives. The
previous site's review contract had no word for *boring* and produced a site
that was accurate and unread. This one does.

## Requirements

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

### Requirement: A review record names the bytes it reviewed

A record that named only a *piece*, and never the *text* it judged, would leave
an approval surviving the thing it approved. The join in `lib/reviews.mjs`
matches a record to a piece by the canonical URL-derived filename, three
accepted alternates, or a front-matter subject key, and the merge gate then
checks that the record carries a verdict from the closed list and a non-empty,
non-duplicated `would-cite`. Every one of those checks would pass unchanged
after the reviewed text had been edited. Binding the record to the bytes is
what closes that gap.

Binding is done by the one step that already knows what landed — the loop's
merge step, which writes `subject:` for exactly this reason:

- On merging a job, the loop SHALL write into that job's verdict record a
  `reviewed:` mapping from each merged content path to the SHA-256 of that
  file's **reviewed surface**, derived from the same measurement of the branch
  that produces `subject:` — one measurement, two fields, so the two can never
  describe different diffs.
- A piece's **reviewed surface** SHALL be its prose body together with its front
  matter with every mechanically-maintained key removed, and the list of
  mechanically-maintained keys SHALL live in exactly one declared place in
  `lib/`. The exclusion is not a convenience: `pulse` appends dated lifecycle
  events to an entry's `timeline` mechanically, under the review exemption, so a
  hash over whole file bytes would mark every entry mismatched the first time
  the world changed a status — a guardrail that fires on its own machinery is
  noise, and noise is how a guardrail gets switched off.
- The set of paths in `reviewed:` SHALL equal the set of joinable content paths
  written to `subject:`, and the merge SHALL refuse a record where they differ,
  in the same place and on the same terms it refuses an `approve` with an empty
  `would-cite`.
- The value shape of `subject:` SHALL NOT change. It is read by nine accepted
  key names in `lib/reviews.mjs` and by hand-written records; carrying the hash
  inside it would break the join for every record that already exists, which is
  the opposite of the outcome this requirement is for.

- The set of pieces this binding covers SHALL be every wiki entry, **whether or
  not it has a prose body**, alongside the pieces the set already carries. A
  body-less entry's reviewed surface is its front matter, which is where its
  sourced facts live, so a fact-only edit to one moves that surface exactly as a
  prose edit moves a page's. Excluding it leaves that class of edit with no
  review-completeness signal at any layer: not missing, not unbound, not
  mismatched, absent from the count entirely. **Tool listings stay outside the
  set**, unchanged and deliberately: they are data rows rather than entry facts,
  the set has excluded them since it was written, and admitting every file the
  merge can hash — which is every `content/**.md` — would extend the binding
  past the class this requirement is about.
- Extending the binding SHALL NOT extend the requirement to **have** a record.
  Which pieces the launch check refuses to launch without a record is unchanged
  and is decided by its own prose bar; a body-less piece reporting **missing**
  SHALL fail nothing, on the same terms and for the same reason **unbound**
  fails nothing.

A record with no `reviewed:` key is not invalid — every record written before
the merge began writing that key is one. It is a distinct, reported state,
defined in the next requirement.

#### Scenario: The merge binds the record to what it merged

- **WHEN** a job merges `content/wiki/org/moonshot-ai.md` with an approving
  verdict
- **THEN** the verdict record carries both `subject:` naming that path and
  `reviewed:` giving that path's reviewed-surface hash, written from the same
  branch measurement

#### Scenario: A mechanical timeline append is not an edit to reviewed text

- **WHEN** the Pulse appends a dated status event to an approved entry's
  `timeline` and nothing else in the file changes
- **THEN** the entry's reviewed-surface hash is unchanged and the record still
  reads as bound

#### Scenario: A record that names one thing and hashes another does not merge

- **WHEN** a verdict record's `reviewed:` paths differ from the joinable paths
  the merge measured for `subject:`
- **THEN** the merge refuses the record and names both sets

#### Scenario: A fact-only edit to a body-less entry is a named finding

- **WHEN** a body-less wiki entry whose record binds its reviewed surface has a
  sourced fact's value changed, and the launch check runs
- **THEN** the check fails, naming that entry as mismatched against its record,
  exactly as it does for an edited prose body

#### Scenario: Body-less entries with no record fail nothing

- **WHEN** the join runs over a corpus whose body-less entries have no review
  records at all
- **THEN** they are counted and reported as missing, no check fails on them, and
  the set of pieces the launch check requires a record for is unchanged

### Requirement: Review survives a model swap, and its limits are stated

Review MUST keep working when the reviewer is a weaker model than the
author, or the same model twice:

- **What holds regardless of models**: fresh context (the reviewer never
  sees the author's reasoning, only the diff and the checklist); no edit
  rights; the mechanical parts of every checklist (fetch the source and
  compare; run the command and read the output; check the fields exist),
  which do not require matching the author's capability; and the named
  reason list.
- **What weakens and is accepted as weakened**: subtle quality judgment from
  a weaker reviewer, and blind-spot correlation when the same model reviews
  itself (same model twice retains fresh-context independence — the
  historical record shows fresh eyes finding real defects even same-model —
  but loses family-level diversity). When `runners.yml` has only one model
  family, that thinner protection is a fact, not a failure.
- A weaker reviewer's `not-worth-reading` verdict is valid signal, not
  malfunction: if a weaker reader finds a piece dull, that is evidence about
  readers.

#### Scenario: A weaker reviewer still catches the catchable

- **WHEN** the reviewer model is weaker than the author model
- **THEN** source-fetch verification, command execution, field checks, and
  overclaim comparison still run and still block on failure — the mechanical
  floor of review does not depend on reviewer strength

### Requirement: A reviewer's non-blocking finding reaches work without editing anything

The reviewer has no edit rights, as a mechanism rather than as an instruction:
its worktree is discarded unconditionally, so it cannot fix what it finds. That
is the property that makes review trustworthy, and it is also what puts every
finding the reviewer does not block on at risk of dying in a file nobody reads
again. Measured before either mechanism below existed: **19.5%** of `approve`
verdict records carried a finding the reviewer recorded but did not block on,
and roughly **30%** of those were never rescued by any means at all.

A finding therefore travels as **data written into the verdict record**, which
is the one artifact the reviewer both produces and is trusted to produce.

- A verdict record MAY carry a `carry:` block of zero or more entries, each with
  a `title`, a `detail`, and an optional `subject` naming the file the finding
  is about. Implemented by `parseCarry` in `loop/lib/verdict.mjs`; measured by
  the verdict parser's tests.
- A verdict record MAY carry a reviewer-noted **proposal**, on the same terms
  and for the same reason. This mechanism predates `carry:` and is what `carry:`
  was modelled on. Implemented by `transcribeNotedProposal` in
  `loop/lib/proposals.mjs`.
- Neither `carry:` nor a noted proposal SHALL affect the verdict itself. A
  reviewer that could turn a finding into a rejection by writing it in a
  different field would have been given, through the back door, the editorial
  power the discarded worktree exists to withhold. The verdict remains exactly
  the value drawn from the closed list, decided on the reasons the review
  requirement already names. Implemented by `parseVerdict` in
  `loop/lib/verdict.mjs`, which reads the two independently; measured by the
  verdict parser's tests.
- The reviewer's brief SHALL document both fields, because a mechanism a
  reviewer is not told about is a mechanism that does not run. Implemented in
  `loop/lib/review.mjs`; measured by the brief-text tests.
- A carried finding SHALL NOT be a second route to publication. It becomes a
  queue item and is then subject to every rule an item from any other source
  is: selection, budget, the review gate on whatever job takes it.

#### Scenario: An approval carries a finding it did not block on

- **WHEN** a reviewer approves a piece and records a finding it judged not worth
  blocking on
- **THEN** the verdict is `approve`, unchanged, and the finding is written into
  the record as a `carry:` entry rather than lost with the discarded worktree

#### Scenario: A finding cannot become a rejection by another name

- **WHEN** a verdict record carries `carry:` entries alongside an `approve`
- **THEN** the merge treats the verdict as `approve` and the entries change
  nothing about it

### Requirement: Missing, unbound, and mismatched are three findings, not one

`lib/reviews.mjs`'s header already reasons that "unreviewed" and "named
something the join does not recognise" are the same observation from the join's
position, and that absence must therefore be reported rather than acted on.
Reviewed-then-changed is the third member of that family, and a check unable to
tell it from the other two would report a page whose approved text had since
moved as though it had never been reviewed at all — the one reading that loses
both the record and the change.

- The join SHALL classify every reviewable piece into exactly one of four
  states: **recorded** (a record joins and its recorded hash equals the piece's
  current reviewed-surface hash), **mismatched** (a record joins, carries a hash
  for that path, and the hashes differ), **unbound** (a record joins and carries
  no hash for that path), and **missing** (no record joins).
- Every path that reports on reviews — `scripts/verify-launch.mjs` and the
  prebuild's summary line — SHALL report the four states separately and SHALL
  NOT collapse mismatched into missing. They are opposite findings: missing
  means unreviewed, mismatched means reviewed and then changed, and only the
  second identifies both a specific record and the specific bytes that moved.
- `scripts/verify-launch.mjs` SHALL fail on any **mismatched** piece, naming the
  piece, the record, and the fact that the reviewed surface changed after the
  verdict.
- **Unbound** SHALL be counted and reported and SHALL NOT fail anything. Every
  record written before the merge began binding hashes is unbound, so failing on
  unbound would refuse the whole corpus of records that predate the mechanism —
  and an unbound record is exactly as informative as a record was before binding
  existed, no worse. The number to watch is that it only ever falls.
- A **mismatched** state SHALL NOT change a page's indexability. The build's
  review gate continues to read the verdict alone. Suppressing a page because
  its bytes moved would silently de-index approved work over a whitespace edit,
  which is the response `lib/reviews.mjs` already refuses to give to absence,
  for the same reason.

#### Scenario: An edited approved page is a named finding

- **WHEN** an approved entry's prose is edited after its verdict and the launch
  check runs
- **THEN** the check fails, naming that piece as mismatched against its record,
  and does not report it as missing a review

#### Scenario: A pre-existing record is unbound, not broken

- **WHEN** a seed record carrying no `reviewed:` key joins its piece
- **THEN** the piece reports as unbound, the count of unbound pieces is printed,
  and nothing fails

#### Scenario: A mismatch does not unpublish anything

- **WHEN** a piece is mismatched against its record
- **THEN** its rendered page's indexability is exactly what the verdict alone
  would produce, and no page is de-indexed by the mismatch
