---
date: 2026-09-02
slug: claude-fable-5-1-mythos-5-1
type: post
summary: >
  A post on Anthropic's Claude Fable 5.1 and Claude Mythos 5.1 launch
  (announced September 1, 2026; OpenRouter rows 2026-09-02) — the same model
  shipped under two safeguard regimes, anchored on the announcement page and
  the llm-releases feed. The note-shaped claims: cache-read pricing cut 75% to
  $0.25/M, making Fable 5.1 about 25% cheaper than Fable 5 on typical
  workloads and up to ~45% on highly agentic ones at unchanged base pricing
  ($10/$50 per Mtok); the benchmark table (Terminal-Bench-Science 52.6% vs
  Fable 5's 24.7%, CursorBench 3.2.0 73.4%, Humanity's Last Exam 65.0% with
  tools); Mythos 5.1 available only through the Cyber Verification Program and
  the Life Sciences Verification Program, the latter developed in partnership
  with the US government; Enterprise Frontier Safeguards giving eligible
  enterprise customers zero-data-retention privacy by hosting data on their
  own cloud infrastructure; and the anti-distillation API change — new API
  accounts can no longer manually edit Claude's prior context in multi-turn
  conversations. Fable 5.1 is also Anthropic's first release carrying the EU
  AI Act text watermark.
evidence: >
  Anthropic announcement "Introducing Claude Fable 5.1 and Claude Mythos
  5.1", fetched 2026-09-02 — https://www.anthropic.com/claude-fable-and-mythos-5-1
  (same model, different safeguards; "Cache reads now cost 75% less, or $0.25
  per million tokens"; typical-workload savings ~25% and up to ~45% for
  "highly agentic" workloads; "$10 per million input tokens and $50 per
  million output tokens"; benchmark table incl. Terminal-Bench-Science 52.6%
  vs 24.7% and CursorBench 3.2.0 73.4% and HLE 65.0% with tools; Mythos 5.1
  via CVP and LSVP, LSVP "developed in partnership with the US government";
  EFS "customers store their data on their own cloud infrastructure"; "it is
  no longer possible for new API accounts... to manually edit Claude's prior
  context"; watermarked outputs per the EU AI Act Code of Practice for models
  released after August 2, 2026). llm-releases feed items, fetched
  2026-09-02 — https://llm-releases.com/models/claude-fable-5-1 and
  https://llm-releases.com/models/claude-mythos-5-1 (pubDate Sep 1, 2026;
  cache reads cut 75% to $0.25/Mtok; 1M context / 128K output; first Anthropic
  release with the EU watermark; Mythos 5.1 "available only through the Cyber
  Verification Program and Life Sciences Verification Program... Access
  limited to vetted US organizations; not publicly token-billed"). The change
  feed carries the OpenRouter arrival rows for anthropic/claude-fable-5.1 and
  its :batch twin, dated 2026-09-02.
expires: 2026-09-09
proposed_by_job: j-20260902-07
proposed_by_type: scout
discarded_attempts: 1
---

# Claude Fable 5.1 and Claude Mythos 5.1 — one model, two safeguard regimes, ~25–45% cheaper

## Why now

The launch is one day old, it is the largest model announcement of the week,
and most of what a stranger would want to know is not in the change feed: the
cache-read repricing is a cost change every token-paying reader can act on,
the Mythos 5.1 access regime is a policy story with a named partner (the US
government), and the anti-distillation API change lands on every developer
who uses Claude. The feed lines alone — one arrival row plus its batch twin —
capture none of it.

## Would-send test

"Anthropic shipped Fable 5.1 — same model as Mythos 5.1, but 25–45% cheaper
to run via a cache-read repricing, and new API accounts can't edit prior
context anymore." Anyone who pays for Claude tokens, or watches frontier
deployment policy, clicks through. This is the most sendable story of the
sweep: it combines a price change, a safety regime, and a developer-facing
API change in one dated launch, all verified from the announcement page
fetched during this run.

## What the job would produce (done-when)

- The post is anchored on the Anthropic announcement page and the llm-releases
  feed items, both fetched and quoted in this docket, and dated Sep 1–2, 2026.
- The cost math is stated exactly as the announcement states it: cache reads
  at $0.25/M (75% lower), ~25% typical / up to ~45% agentic savings, $10/$50
  per Mtok otherwise, measured "at default effort over four weeks of actual
  usage in August 2026".
- The benchmark claims are reported as Anthropic-reported, with the table's
  own caveats (safeguard interventions zeroing OSWorld/AutomationBench runs,
  the OSWorld 2.0 task-release non-comparability footnote, the
  Terminal-Bench-Science leaderboard reproduction note).
- Mythos 5.1's access programs (CVP, LSVP with US government partnership)
  are stated with their source, including that access is currently limited to
  US organizations.
- Enterprise Frontier Safeguards are described as the announcement describes
  them: customer-hosted infrastructure, phased rollout from this fall, zero
  data retention for eligible customers until then.
- The anti-distillation change (new API accounts cannot manually edit prior
  context in multi-turn conversations, rolling out gradually) is stated with
  the Help Center reference the announcement names.
- The EU AI Act watermark is stated with the Code of Practice date (models
  released after August 2, 2026) and the detection-API rollout.

---

## Discarded attempt 1: job j-20260903-03

- date: 2026-09-03
- job: j-20260903-03 (post)
- refused for: `false-or-unsupported-claim`

A reviewer refused this work twice and the branch was discarded. The candidate is still live — what was rejected was the writing, not the idea — but it no longer outranks the derived queue, and its `expires:` still sweeps it on time.

**Read this before attempting it again.** The section below is why the last attempt did not merge; an attempt that repeats it will be refused the same way.

### What the reviewer said

## First: the diff pasted into my brief is stale, and this review is against the branch

The brief says the diff was computed from commit `0839d78329bd`. It was not —
the post file it shows is the pre-revision version, containing both sentences
the pass-1 review required changed. I read the file on disk and the branch
history before concluding anything:

```
$ git -C .../j-20260903-03-review-2 log --oneline -5
0839d78 job j-20260903-03: revision
8685d2e job j-20260903-03 (post): revise per review — cache-read share sentence and suspension dates
1b8d063 job j-20260903-03 (post): Claude Fable 5.1 and Mythos 5.1 launch note
4f65bc0 job j-20260903-03: brief
b2aa018 pulse: 2026-09-03 data and content update

$ git ... rev-parse HEAD
0839d78329bde29e9fb89b6ccd9d81844e3bc449
$ git ... status --porcelain
(clean)
```

The revision is committed and is what I reviewed. Recording this because a
delta review that trusted the pasted diff would have re-issued pass 1's
verdict verbatim against work that had already been done.

## The actual delta

```
$ git ... diff --stat 1b8d063 0839d78
 content/blog/claude-fable-5-1-mythos-5-1.md |  4 ++--
 data/derived/search-index.json              | 12 +++++++++++-
```

Two prose lines, plus the search index picking up the new post (`"count": 644`
→ `645`, one `/blog/claude-fable-5-1-mythos-5-1` doc row). The index is derived
output regenerated by the build for the post this job adds; it is the
consequence of the diff, not a widening of it. No reserved path touched. No
scope violation.

## Finding 1 — cache-read share: FIXED, and the fix is supported

Was: "Cache reads are the cost most users actually pay."
Now: "Cache reads are about a third of a typical Fable bill and most of an
agentic one, which is why the same 75% cut produces 25% and 45%."

I fetched the anchor myself rather than reading pass 1's account of it:

```
$ curl -sL -o /tmp/fable51.html -w "%{http_code} %{size_download}\n" \
    https://www.anthropic.com/claude-fable-and-mythos-5-1
200 449695
```

and grepped the raw HTML (not WebFetch — its extractor mangles this page's
tables):

```
$ grep -o -E "Cache reads now cost[^<]{0,80}" /tmp/fable51.html
Cache reads now cost 75% less, or $0.25 per million tokens.

$ grep -c "25% less than Fable 5 for typical workloads" /tmp/fable51.html
1
$ grep -c "up to approximately 45" /tmp/fable51.html
1

$ grep -o -i -E ".{140}cache reads make up most.{80}" /tmp/fable51.html
covers Fable usage across Claude Enterprise, Claude Code, and the API. Highly
agentic workload covers context-heavy, tool-heavy work, where cache reads make
up most of the cost.
```

The arithmetic the sentence now states is the announcement's own: base pricing
is unchanged, so the only moving component is cache reads, and a 75% cut in a
component of share `s` takes `0.75 × s` off the bill. `0.75 × s = 0.25` gives
`s ≈ 1/3` ("about a third"); `0.75 × s = 0.45` gives `s = 0.60` ("most"), which
is exactly what the chart caption says about the agentic column. Supported,
and it now explains the two headline numbers instead of contradicting them.

## Finding 2 — suspension dates: the dates are right, and the same sentence is now wrong about who got access back

Was: "...since June, when a nineteen-day suspension of both ended with access
restored for approved partners."

Now: "Anthropic announced Fable 5 and Mythos 5 as one model under two safeguard
settings on 9 June 2026, suspended access to both on 12 June, and restored it
on 1 July for a set of US organizations following US government approval."

The three dates check out, and so does the "one model" framing. I fetched the
source the site's own wiki row cites:

```
$ curl -sL -o /tmp/f5.html -w "%{http_code} %{size_download}\n" \
    https://www.anthropic.com/news/claude-fable-5-mythos-5
200 371122
```

- Dateline, from the page's own header payload: `"Claude Fable 5 and Claude
  Mythos 5"` … `"Jun 9, 2026"`. ✓ 9 June.
- One model, two safeguard settings, on that page: *"we're also launching
  **Claude Mythos 5**. It's the same underlying model as Fable 5, but with the
  safeguards lifted in some areas."* ✓ — the "two-regime structure is not new"
  claim holds, and the wiki row's shorter "announced as a tier above the Opus
  class" is not the only thing the source says.
- Suspension: *"we suspended access to both models for all users"*, and the
  Jun 12, 2026 update *"We are suspending access to Claude Fable 5 and Claude
  Mythos 5."* ✓ 12 June, both.
- Restoration date: the page's `latestUpdates` block, `"date":"2026-07-01"`,
  `"summary":"Access to Claude Fable 5 and Mythos 5 is now restored."` ✓
  1 July.

**But the trailing clause is false.** The same update says, in two consecutive
paragraphs:

> Fable 5 will be available starting tomorrow, Wednesday, July 1, to users
> **globally** on the Claude Platform, Claude.ai, Claude Code, and Claude
> Cowork.

> We **also** restored access to Mythos 5 **for a set of US organizations**,
> following the US government's approval on June 26.

Fable 5 came back globally. Only Mythos 5 came back restricted. The post's
sentence says access to *both* was "restored ... on 1 July for a set of US
organizations" — the antecedent of "it" is "access to both", and the modifier
attaches to the whole restoration. As written it tells a reader that Fable 5
has been available only to a set of US organizations since July, which is
wrong by two months of a flagship model's availability.

This site's own entry has it right, and the post's own sentence links to it —
`content/wiki/org/anthropic.md`:

```
  - date: "2026-07-01"
    event: "access restored; Mythos 5 returned to a set of US organisations
            following US government approval"
```

The wiki row keeps "Mythos 5" as the subject of the restricted half. The
revision compressed the row and dropped that subject, which inverts what it
says. The post also contradicts itself downstream: it cites the OpenRouter
catalog's public per-token pricing for `anthropic/claude-fable-5` as evidence
two paragraphs later, which is not how a model restricted to a set of US
organizations is billed.

*Required, and it is a few words:* make the split explicit — "…suspended access
to both on 12 June, and restored it on 1 July: Fable 5 globally, Mythos 5 only
to a set of US organizations following US government approval." Or drop the
restoration scope entirely and keep the three dates.

## Why this is `revise` and not an `approve` with a carry

I considered carrying it. The carry mechanism is for a one-word slip, a
dropped qualifier that changes no meaning, a citation that resolves to a login
wall. This one changes meaning: it is a checkable claim about a named
company's access policy, it is contradicted by the primary source, and it is
contradicted by the very page the sentence links. Approving prose I have
established is false, on the theory that a correction block can follow it to
the live site, is the one thing this gate exists to prevent. Everything else in
the delta is confirmed correct, and the fix is one clause — but the fix has to
happen before publication, not after.

Two other things worth saying plainly. First, pass 1's required change was
"name the dates — announced 9 June 2026, suspended 12 June, restored 1 July —
or drop the suspension clause": the revision did that *and* appended a scope
claim nobody asked for, and the new claim is where the error entered. Second,
the rest of this post remains, on my own re-checking of the anchor and on pass
1's line-by-line table, unusually well sourced — the price arithmetic, the
benchmark caveats, the access programs, EFS and the anti-distillation change
all hold. This verdict is about one subordinate clause in a background
paragraph, and I am aware of what a second non-approval costs the job.

## Housekeeping

- I made no edits to the worktree under review. I wrote one scratch extractor
  script, noticed it had landed under `.job/`, and moved it to the OS temp
  directory; `git status --porcelain` on the worktree is clean.
- I did not re-run `npm test` or `npm run build`; the loop's PASS on
  `0839d78329bd` stands and re-running it is the documented way this review
  runs out of time.
- The branch still carries no `RESULT.md`. Loop bookkeeping, not a review
  reason — noting it because it means this diff again arrives with no author's
  account attached.

### Findings the reviewer carried

#### Note that CVP access to Mythos-class models is future, not current

The post says Mythos 5.1 "ships only through two trusted-access programs, the Cyber Verification Program and the Life Sciences Verification Program", and closes "Cyber defenders and life-science researchers inside the US can apply to the two programs." The announcement is narrower on the cyber half: "The CVP currently provides access to certain Opus- and Sonnet-class models with reduced cyber safeguards for defensive security work. In the near future, this program will also include access to Claude Mythos-class models" — and the Cost and availability section offers only "To register interest in access to Claude Mythos 5.1 for cyberdefense through the CVP". LSVP has enrolled participants today; CVP has not. The post mirrors the announcement's own "It will be available through two trusted access programs", so this is not unsupported — but one clause ("Mythos-class access through the CVP is still to come") would make the affected-party paragraph accurate for the reader it is aimed at.

(The reviewer named `content/blog/claude-fable-5-1-mythos-5-1.md`, which the discarded branch never merged.)

#### Title omits the billed-by-token qualifier the announcement is careful about

The title promises "~25-45% cheaper to run". Anthropic states the saving as applying "wherever usage is billed by token" — nothing changes for seat-priced Claude subscriptions. The body carries the qualifier inside the quoted sentence; the title does not. Not an overclaim worth blocking, since the tilde and the body both do work, but the free half of the fix is to say "cheaper per token" in the title.

(The reviewer named `content/blog/claude-fable-5-1-mythos-5-1.md`, which the discarded branch never merged.)

#### Give the post a trailing newline

content/blog/claude-fable-5-1-mythos-5-1.md ends without a newline (the branch diff shows "\ No newline at end of file" on the last Sources bullet). Nothing breaks; it makes every future diff of the file touch a line it did not change. Append a newline.

(The reviewer named `content/blog/claude-fable-5-1-mythos-5-1.md`, which the discarded branch never merged.)
