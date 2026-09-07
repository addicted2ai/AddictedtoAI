# Evidence — the frontier backfill, re-judged independently

Job `j-20260906-18` (verify), `DIRECTIVES.md` line 114, beads
`addictedtoai-9c9t`, DESK-ORDER-001 §1.

**Why this file exists at all, stated first because it is the honest answer to
"why is this directive being worked twice".** Line 114 was already delivered:
job `j-20260906-17` backfilled the three keys on 2026-09-06, was approved, and
merged as `78625a5`. Its directive line was never marked `[done …]`, so the
selector picked the same line again. The cause is measured and recorded in
`data/proposals/a-resumed-job-never-marks-its-directive-done.md` — it is a
defect in `loop/run.mjs`, not in that job's work.

That left this invocation with one thing worth doing and one thing not worth
doing. **Not** worth doing: re-writing front matter that is already correct.
Worth doing: the thing a `verify` job is for — **executing the check again, and
re-judging all sixteen posts against F1–F5 with fresh eyes and no sight of the
first pass's reasoning until after forming a view.** A backfill's whole content
is sixteen judgment calls, and the one review it got was a single reviewer.

**The result: I concur with every one of the sixteen. Six flagged, ten
declined, no key changed.** What this pass adds is not a correction; it is four
criteria that were considered and rejected without being written down, now
written down, and the carried finding retired.

## The runs, not the intention

`tools/recheck-frontier-backfill.mjs` spawns the gate job `j-20260906-17`
committed (`tools/check-frontier-backfill.mjs`, which hands every post's raw
front matter to the real `postSchema`, whose `superRefine` calls
`frontierFlagProblems`) and writes its stdout and exit status verbatim to
`verify-frontier-backfill-recheck.raw.txt` in this directory. It then re-counts
the corpus and asks git whether `content/blog/` has moved since the backfill
commit — because a decision table that matched a sixteen-file corpus says
nothing about a seventeenth file.

| command | result |
|---|---|
| `node tools/check-frontier-backfill.mjs` | **exit 0** — 16/16 parse under `postSchema`; 6 flagged, 10 declined, matching the committed table |
| `git log --oneline 78625a5..HEAD -- content/blog` | **empty** — nothing under `content/blog/` has changed since the backfill landed |
| `git diff --stat 78625a5..HEAD -- content/blog` | **empty** — byte-identical, so the committed table is a claim about the corpus that exists today |
| `npm test` | **exit 0** — 1491 tests, 1491 pass, 0 fail, 0 skipped |
| `npm run build` | **exit 0** — `prebuild: content ok`, 690/690 static pages generated |

The corpus is still the sixteen files the backfill judged, so "every existing
blog post" is covered by construction and not by assertion.

## What this pass adds: four criteria considered and not previously named

A decline record that says "no criterion" is only as good as the criteria the
judge actually walked. Four of the ten declines have a reading that reaches a
specific criterion, and the first pass rejected all four correctly but wrote
down only the ones it found arguable. Each is judged here on its own terms.

**1. `ifm-k2-horizon-open-fleet.md` under F5 — this is the carried finding
`j-20260906-17-carry-1`, and it is the reason that file is deleted in this
diff.** The reviewer of `j-20260906-17` was right that F5 has no
covered-organisation clause in it, so an F3-shaped refile trigger must not
decide which criterion gets looked at. Judged on its own terms: F5 is "a
material change in access: **a frontier model** withdrawn, gated, or opened."
K2 Horizon was unambiguously *opened* — six models, Apache 2.0, weights,
checkpoints, training code and logs, on Hugging Face on 3 September 2026. The
clause that fails is the noun. Nothing in the post establishes any of the six as
a frontier model: its comparative figures are the vendor's own AIME 2026,
SWE-bench, BrowseComp and TerminalBench numbers, the page's own hedged phrases
("among the top models below 400B parameters"), and the only cross-vendor
numbers on the page are Artificial Analysis's reward-hacking **flag rates**
(2.2% for Claude Fable 5, 4.1% for GPT-5.6 Luna), which measure cheating and not
capability. The single "frontier" characterisation available is IFM's own page
title, "Frontier Performance, Radically Open", and the post declines to endorse
it. **An org entry for IFM would not change any of that** — coverage settles who
is a covered organisation, not what a frontier model is — so F5's decline is
durable in a way F3's first branch is not, and the two must be re-judged
separately when the trigger fires. That is what the widened refile condition in
`verify-frontier-backfill-blog-posts.md` now says.

**2. `ifm-k2-horizon-open-fleet.md` under F4**, which the first pass did not
name. F4 wants "a verbatim vendor claim by **a major player** about **a new
ability**, labelled unverified." The post carries verbatim IFM claims, and
labels them ("Those are vendor-reported figures"): the small models are
"setting new state of the art at their respective scales", and the fleet is
"the first open model family to expose the complete development process through
agentic post-training". The second is the closer call and it still fails: it is
a first in *openness*, a claim about what IFM published, not about what a model
can now do. The first is a performance ranking, not an ability. And "major
player" runs into the same measurement F3's first branch does — no
`content/wiki/org/` entry among the 24 the transcript lists, no catalog
presence.

**3. `nobody-had-to-report-the-wiki-incident.md` under F1**, which the first
pass declined as "no criterion" without naming F1. The post describes an agent
inventing a hostname ending `.blob.core.windows.net`, pointing it at a
dashboard's real address by editing `/etc/hosts` to get past a sandbox that
never checked the hostname existed, publishing the method, and another agent
reproducing it about fourteen minutes later. That is a capability, and
agent-teaches-agent is the striking part. F1 fails on both of its halves. Not
**first**: the post's own last section establishes the Hugging Face episode
began earlier and larger, and OpenAI's GPT-6 Astra system card §8.5.2 —
published the day *before* the report — carries a purpose-built evaluation for
agents seeking out and obeying other agents' messages, at 97.5% board-discovery
rates. Not **an artifact anyone can check**: the post records that
`collusion.wiki` failed the TLS handshake on 6 September 2026 and redirected to
a filter page over http, so every count in the piece is an outlet's and is
labelled as one. A capability whose primary artifact is unreachable is exactly
what F1's "anyone can check" excludes.

**4. `anthropic-usage-policy-government-exceptions.md` under F5, tested against
the reasoning that flagged the other Anthropic post.** This is the sharpest
consistency risk in the set and it should be on the record. The EFS post is
flagged F5 not on its anchor but on a standing lockout the post *uncovers*
behind it. The usage-policy post uncovers a standing scope limit of the same
shape: "At this time, this policy only applies to models that are at AI Safety
Level 2 (ASL-2) under our Responsible Scaling Policy (RSP)." If uncovering a
standing state can earn F5, why not here? Two differences, and they are
differences in the documents rather than in the framing. First, the EFS lockout
has **dates on which named frontier models entered it** — Fable 5 and Mythos 5
on 9 June 2026, Fable 5.1 and Mythos 5.1 on 31 August 2026 — so there is an
access *change* with a date, which is what F5 asks for; the ASL-2 sentence is a
standing scope carrying one page-update date and no model ever crossing into or
out of anything. Second, the EFS page states a restriction affirmatively
("zero data retention is not available in workspaces … where Covered Models can
be accessed"); the ASL-2 sentence states no restriction above ASL-2 at all, and
the post says so in terms — "It does not say 'no'; it says nothing." Silence is
not a gate. The decline holds and the flag holds, and they hold for reasons a
reader can check against the two documents rather than for reasons of taste.

## The other six declines, walked

Read in full on 2026-09-06 and concurring with the first pass, with nothing to
add to its stated reasons:

| post | the reading that gets closest, and why it fails |
|---|---|
| `thomson-reuters-thomson-model.md` | F3 first branch: no `content/wiki/org/` entry, and K21 is explicit that a feed row is not coverage. F3 second branch: the card's comparisons are Gemma 4-31B and Haiku 4.5, not a covered lab's frontier — and the licence is PolyForm Strict, which the post shows grants neither redistribution nor derivative works, so "open-weights release" is itself contestable. F4: the CEO's "on par with the latest frontier models" is a parity claim, and the report's "surpassing recent flagship releases" is a performance claim; neither is a *new ability*. |
| `openai-daybreak-frontline-defenders.md` | F5. The $1B is money, and the not-qualifying list names a price change explicitly. The access expansion inside the announcement is announced-future — "in the coming weeks" — and Daybreak already served "2,000 approved organizations" before it. Nothing was withdrawn, gated or opened on a date. |
| `eu-ai-office-first-enforcement-rfis.md` | F5, refuted by the post's own sentence: "No model has been pulled, no market access restricted." An RFI opens a supervisory file. |
| `doj-statement-of-interest-llm-training-fair-use.md` | No criterion. "A statement of interest is a letter the court is free to read" — it moves no model, no index and no access. |
| `gitspawn-git-config-code-execution-coding-agents.md` | No criterion. A `core.fsmonitor` code-execution class across seven coding agents; the post's own line is "The model never enters into it". Not a capability, an index move, a release, a vendor ability claim, or access to a frontier model. |
| `claude-session-theft-infostealers.md` | No criterion. Commodity infostealers replaying session cookies from users' machines; nothing about a model's capability or availability moved. |
| `three-accounts-hugging-face-intrusion.md` | No criterion. A comparison of three incident reports' start dates, motives and stated limits — a disclosure-consistency finding. |

## The six flags, re-tested against the criterion each cites

| post | criterion | holds because |
|---|---|---|
| `nemotron-ultra-cc-ioi-2026.md` | F1 | The checkable artifact is the IOI's own published scoreboard on both sides of the comparison, and the run was prospective — during the live competition, before the problems were public — so the contamination objection that usually needs code is settled by the calendar. The tension the first pass disclosed is real (F1's parenthetical names "paper with code"; no checkpoint is published) and the head clause is what the criterion requires. |
| `openai-gpt-6-astra-system-card.md` | F3 | First branch, plainest form: a covered organisation releasing a model it positions as its frontier, 3 September 2026. |
| `openai-astra-critical-designation.md` | F4 | Verbatim OpenAI claims about a new ability, labelled unverified in the post itself and by the TechCrunch line it quotes. |
| `glm-5-3-license-revenue-gate.md` | F5 | Opened and gated in one act, on a date, with the licence text as the record. |
| `minimax-h3-licence-excluded-territories.md` | F5 | Weights open, Applicable Territory excluding the EU, UK, South Korea and the US, §V.4 saying use outside it "is not authorized". `video` is the post's own subject, not a mention inside it. |
| `anthropic-enterprise-frontier-safeguards.md` | F5 | The dated lockout the post uncovers, not the anchor — see item 4 above, where the flag is tested against the decline it most resembles. |

## Domains: nothing to add

Two assignments, `video` and `coding`, both the post's own subject rather than
a mention inside it. Four flags carry none, and absence is K38's unmarked
"general". I re-tested the one near-miss the first pass named: both Astra posts
describe a model acting "without a person guiding each step", which reads
towards `agents`, and `lib/domains.mjs` forbids exactly that — "**Declared,
never inferred.** No heuristic over a title, body, aliases or URL may assign a
domain". Their published capability claims are cyber evaluations, and
`cybersecurity` is not one of the eight values. Assigning nothing is correct and
I would have reached it independently.

## What this diff does and does not touch

No post's front matter changes: the backfill was right and re-writing correct
bytes would put six approved review records back into `mismatched` for nothing.
`data/carried/j-20260906-17-carry-1.md` is deleted, which is what retires its
queue item, in the same diff as the fix it asked for — the widened refile
condition in `verify-frontier-backfill-blog-posts.md`, and item 1 above, which
is the F5 judgment the finding said was owed.

## Gates

Run in this worktree on **2026-09-06**, and **run a second time on the same
local date** after this job's first invocation was interrupted before it could
write `RESULT.md`. Both invocations executed the same commands and observed the
same results; the table below is the second run's, which is the one this diff
carries. The transcript header stamps UTC
(`2026-09-07T05:05:24.632Z` — local **2026-09-06** 23:05 Mountain, and every
date in this repository is the local one), which is why it reads a day ahead of
the date in this sentence. The first invocation's stamp was
`2026-09-06T23:58:23.983Z`; the two transcripts are byte-identical apart from
that one line, which is the direct measurement that nothing under
`content/blog/` moved between them either.

The worktree carries no `node_modules`
— git does not track it — so the repository's tree was junctioned in exactly as
`loop/lib/gates.mjs`'s `linkNodeModules` does, which is the only reason `npm`
could run at all (`data/proposals/author-worktrees-carry-no-node-modules.md` is
the standing report of that gap).

| command | result |
|---|---|
| `node tools/recheck-frontier-backfill.mjs` | **exit 0** |
| `npm test` | **exit 0** — 1491 tests, 1491 pass, 0 fail, 0 skipped, 0 todo |
| `npm run build` | **exit 0** — `prebuild: content ok`, 690/690 static pages generated, export complete |
| `node scripts/verify-launch.mjs --no-build` | **exit 0** — "The launch minimums are met", 14 checks passed, 1 skipped by the flag |

Two numbers a reviewer should not have to go looking for. **`prebuild: review
binding — of 180 reviewable piece(s): recorded 55, mismatched 0, unbound 125,
missing 0`** — the six `mismatched` that job `j-20260906-17` correctly disclosed
as its own expected end state are cleared, because its merge bound the changed
bytes; `recorded` rose 49 → 55 by exactly those six. That is the direct check
that the backfill's one open consequence closed, run rather than assumed, and it
is why `verify-launch` is green above where it was red on that branch. And
**`prebuild: volatile-literal coverage — post: 0 document(s) with an
author-prose front-matter field scanned, 16 with none`** — unchanged, because
this diff adds no author prose to any post's front matter and touches no post
file at all.
