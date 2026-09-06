# Job j-20260906-02 — `entry`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260906-02`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260906-02`
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
- **Work source**: directive (DIRECTIVES.md line 102)

## The outcome

write the wiki org entry for the catalog provider `amazon` — Amazon, whose Nova line is a first-party frontier attempt from a company better known here as a host — the entry should not conflate Amazon the model builder with Bedrock the router. It carries 5 catalog rows and has no entry today. DESK-ORDER-001 §2 and keeper ruling K21: a player is on the board because the site COVERS it, never because a feed carries it — feeds fill cells, they do not decide membership. The board today has 16 org entries against 58 catalog providers, so 34 providers never surface at all. WHAT THE ENTRY MUST CARRY OR THE ROW IS BLANK: its `feeds` map, which is the join the board relies on, and its product-brand registrable domains in `publishes_from` (ui-loop K48 — NOT `aliases`, because an alias is a NAME and the alias registry decides linking, `lib/schema.mjs:492`). THE BRAND DOMAIN IS NOT PAPERWORK: the board attributes a vendor claim only when the cited source's registrable domain is the vendor's own, so a missing one makes a REAL vendor claim render as an honest-looking blank — and NOTHING FAILS when the declaration is absent (red-team FM-N6), which is exactly why the burden sits on this entry rather than on the renderer. An org with no feed binding still renders an all-blank row, which is allowed and honest; an org with a wrong one is not. Apply `specs/editorial`: give an enthusiast something they did not know or assemble scattered things for the first time, be specific with dates and mechanisms, and source every new claim from a page you actually fetched. Do not restate a facts table in sentences. Written by the orchestrator, not the maintainer. addictedtoai-2ok0


This is **one job with one outcome**. It ends in exactly one merge or one
discard. Do not widen it: a diff that exceeds the stated outcome is a
`scope-violation` at review and the whole job is rejected for it.

## Acceptance checks

- The entry validates against the front-matter schema for its kind; the build passes.
- Every cited fact carries a reachable source and an accessed date, and the source says what the fact says.
- Volatile values are transclusions or feed-bound, never literals.
- Aliases are classed sanely (exclusive / shared / manual).
- If the entry carries prose, the prose adds something the data alone does not.
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

### Requirement: Entries carry structured, sourced, dated facts

Each entry SHALL carry zero or more facts in its structured front matter.
Every fact MUST declare:

- a field name (for example `context_window`, `price_input`, `license`,
  `status`),
- a value,
- a source: either `feed` (the value is bound to a named field of a named
  Pulse data source and rendered from the data layer at build time) or
  `cited` (a manual value with a `source_url` and an `accessed` date),
- a volatility class: `fast` (re-check within 14 days), `slow` (re-check
  within 120 days), `static` (not re-checked), or `dated` (true as of its
  date, displayed with the date, never re-checked).

A `cited` fact whose `accessed` date is older than its volatility interval
SHALL be rendered with a visible overdue marker. A fact MUST never render
without its source being reachable from the rendered page (a link for
`cited`, the named source for `feed`).

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

# wiki Specification

## Purpose
The wiki is the site's cornerstone substrate: one typed, sourced, dated record
per thing in AI. Every other surface references wiki entries rather than
restating their facts, so correcting a fact in one place corrects it
everywhere it appears.

## Requirements

### Requirement: Connection lives in a metadata layer

Every prose page (wiki body, education page, tutorial, blog post) SHALL carry
a `mentions` list of entry ids in its front matter. The rendered page SHALL
show a "Referenced here" rail listing those entries; each entry page SHALL
show an "Appears in" backlink list of every page that mentions it. Backlinks
SHALL be computed at build time from the `mentions` lists, never hand
maintained. A `mentions` id that does not resolve to an entry SHALL fail the
build.

#### Scenario: Backlinks appear without editing the entry

- **WHEN** a new blog post lists `model/claude-opus-5` in its `mentions`
- **THEN** after the next build, the post shows the entry in its
  "Referenced here" rail and the entry page lists the post under
  "Appears in", with no edit to the entry file

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

A transclusion whose target entry or field does not exist SHALL fail the
build. Enforcement of the no-hard-coding rule is the reviewer's named
checklist item for every prose piece (see `review`); the build additionally
warns on currency-shaped literals (a number adjacent to `tokens`, `context`,
`$`, `/month`, or a version pattern) in prose outside the wiki data layer.

#### Scenario: Correcting a fact corrects every surface

- **WHEN** a fact value is corrected on its owning entry
- **THEN** every page that transcludes it shows the corrected value at the
  next build, with no other file edited

#### Scenario: Broken transclusion fails the build

- **WHEN** a prose file transcludes `model/foo · price_input` and no such
  entry or field exists
- **THEN** the site build fails naming the prose file and the missing
  reference

---

### PENDING AMENDMENT to `specs/wiki` — in-flight change `separate-a-claim-from-a-fact`
(full text: `D:/AddictedtoAI/openspec/changes/separate-a-claim-from-a-fact/specs/wiki/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

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
  is invisible: R13 (v) carries both halves, `lib/render/frontier.mjs`'s
  `orgOwnDomains` implements it, and invariant `S22` clause (e) re-derives both —
  so a spec carrying one half reads as a correction of the other two rather than
  as an omission, and the next implementer "fixes" the gate back to match it. Its
  own name-token filter is not decoration: **all thirteen** `founded` facts in
  this corpus cite `en.wikipedia.org`, so an unfiltered "records citing itself
  from" admits an encyclopaedia as a vendor-owned domain — the exact defect the
  first requirement exists to end, re-entering through the test meant to catch it.

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

### PENDING AMENDMENT to `specs/wiki` — in-flight change `tag-the-corpus-by-domain`
(full text: `D:/AddictedtoAI/openspec/changes/tag-the-corpus-by-domain/specs/wiki/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

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

# wiki — delta for tag-the-corpus-by-domain

Two requirements added. Nothing here changes what an entry is, how it is
identified, how its facts are sourced, or how it is reviewed. `kind` is
untouched and still a closed partition; `domain` is a second, orthogonal axis
that sits beside it.

The vocabulary and the two-field split are transcribed from
`loops/ui-loop/graph/knowledge/DESK-ORDER-001.md` §3 (keeper-signed 2026-09-05)
and its K44 amendment, with the three open questions answered as §3 records
them. They are not re-decided here. The research behind the vocabulary is
`loops/ui-loop/graph/knowledge/EN-domain-facet.md`; the round-by-round reason
for each clause is `loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md`, the
rubric this draft was written against.

§3's later amendment — "Amendments from the 1hjf draft review", 2026-09-05 —
ratifies this draft's open judgments rather than overturning them: the facet on
every wiki kind, both tool sets, the three field names, the three-plain-string-
lists shape, and the append-only seeding rule as **K47**. Those are settled and
are not re-decided here either. The one requirement written after that review is
the `domains_excluded` gate below, and the one open recommendation it left to
the author — a change line when a seeding signal disappears — is decided against
below, with the reasoning in `proposal.md`.

## ADDED Requirements

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

---

### PENDING AMENDMENT to `specs/review` — in-flight change `separate-a-claim-from-a-fact`
(full text: `D:/AddictedtoAI/openspec/changes/separate-a-claim-from-a-fact/specs/review/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

### Requirement: A claim record is judged against the bytes of the source it quotes

A claim record is a verbatim quotation, a host, a date and a verification state,
transcribed by a model from a page the reviewer can fetch. Every one of those is
checkable, and each has a failure mode that a reader of the diff alone would
miss. Where a diff contains claim records, the reviewer SHALL additionally:

**The build can check every field of this record except the one that matters.**
`source_host` is a string comparison, `subject` is a corpus lookup, `accessed` is
a date, `verified: true` is a shape — all of them gates. `quote` is none of them:
verbatim-ness is a comparison against a document the build never fetches, and a
build that did fetch it would make every rebuild depend on a third party's
uptime and on the page not having changed since. So this one clause belongs to
the reviewer and to nobody else, and there is no gate to fall back on if the
reviewer skips it.

- **Fetch `source_url` and confirm `quote` is present in the fetched bytes,
  verbatim.** Plausibility is not verification. The instrument SHALL be ruled out
  before absence is concluded — inflate compressed streams and read
  parenthesised text literals, expect ligatures and escaping, and search
  fragments that straddle neither. A quote that is genuinely absent from the
  document is `false-or-unsupported-claim`; a quote absent from one representation
  of a document is a misattribution to be traced before it is called anything
  worse.
- **Confirm `source_host` equals the host of `source_url`,** and judge the vendor
  test's *input* rather than its output: is this host really a place the subject
  publishes from? The check itself is mechanical, but what it compares against is
  a declaration somebody made, and a wrong `publishes_from` value attributes a
  stranger's words to a named company. Where the diff adds a `publishes_from`
  value, the reviewer SHALL confirm the domain independently and say how.
- **Read `verified` for what it asserts.** A record claiming more than was done
  is `intent-not-measurement`: `verified: {by, url, date}` requires that the named
  document actually supports the confirmation, fetched and confirmed, not
  described. A `verified: false` requires that a check happened and failed, and
  the reviewer SHALL reject a `false` written as a placeholder for "nobody
  looked" — absence is how that is spelled, and the difference is the whole point
  of the three states.
- **Check that nothing in the diff turns a fact into a claim.** A cited fact
  moved into a claim record, or a claim record filed for a value that is a
  measurement by a third party rather than an assertion by the subject, is
  `spec-violation` against the requirements in `wiki` — and it is the specific
  defect this record type was created to end, found twice in shipped work by two
  independent builders.

The standing instruction is unchanged and applies here in its sharpest form: for
every claim about what something does, run the cheap direct check; for every
sourced claim, confirm the source supports it. A claim record is the one content
shape in this corpus whose entire content is a sourced claim.

#### Scenario: The quote is confirmed against the document, not the diff

- **WHEN** a diff files a claim record quoting a vendor's launch post
- **THEN** the reviewer fetches that post and the verdict cites the fetch and
  what was found in it, not the record's own description of the source

#### Scenario: A verification state that outruns the work is rejected

- **WHEN** a record declares `verified: {by, url, date}` and the named URL does
  not support the claim
- **THEN** the reviewer returns a non-approval citing `intent-not-measurement`,
  naming the record and the URL

#### Scenario: A placeholder negative is not a finding

- **WHEN** a record declares `verified: false` and nothing in the diff or the
  job's evidence shows that a check was attempted
- **THEN** the reviewer requires the key removed rather than left, because absent
  means nobody looked and `false` means somebody looked and failed

#### Scenario: A measurement filed as a claim is a spec violation

- **WHEN** a diff files a claim record whose source is a third party's
  measurement of the subject's product rather than the subject's own statement
- **THEN** the reviewer returns a non-approval citing `spec-violation`, naming
  the requirement in `wiki` that a claim is the subject's own only when the
  source is

# review — delta for separate-a-claim-from-a-fact

One requirement added. Nothing here changes the verdict list, the closed reason
list, the `would-cite` and `reads-human` fields, the revision mechanics, the
hash binding, or the four-state join. The existing checklist requirement, "What
is checked depends on what the work is", is left untouched: this adds a
checklist for a record type that did not exist when it was written, rather than
restating it.

## ADDED Requirements
