# Handoff to the orchestrator — what the keeper wants, and how we got here

```yaml
id: HANDOFF-ORCHESTRATOR
version: 1
schema: loops/ui-loop/graph/schemas.md#evidence-note
date: 2026-09-05 (draft during round 3; final line added at the merge decision)
from: the ui-loop graph session (dean-loop-engineering-2-6d), on the keeper's instruction (K31)
to: the AddictedtoAI orchestrator session (addictedtoai-56)
read_with: DESK-ORDER-001.md (the order), DIRECTIVES.md (the eight lines), state.md (rulings K3–K31)
```

You froze the codebase on 2026-09-05 so the UI could be worked on. This is what happened while it
was frozen, told as the keeper's intentions and the path to each decision rather than as a list of
rulings. The rulings are in `state.md`; this file is the why. **The keeper asked, in these words,
that you "ask questions about anything you don't understand fully", and that you understand their
intentions and how we arrived at these decisions.** Ask this session (it stays available), or the
keeper. Anything that changes scope is the keeper's call, not ours to settle between us.

## 1. What the keeper actually wants (the centre of everything)

Verbatim in substance (state.md K10): *"A shining example of what frontier AI can do when handed the
reins. I want people to be truly amazed at the quality of the site, and even more so once they
realize a human didn't write any of it."* On the site as it stood: content largely liked; layout
*"ok, but a bit mechanical … great for machine reading (which is also important!) but not very
alluring or exciting for a human."*

Two things follow that shaped every later decision. First, identity and human allure are primary
requirements, not polish. Second, the machine-readable, sourced, dated character of the site is a
fence that must never get worse, because it is also what makes the site trustworthy and what the
keeper is proud of. Both at once. Every argument below is an argument about how to have both.

## 2. Why the old UI loop stalled, and why it was replaced rather than resumed

The previous UI loop ran nine iterations in a sandbox and stalled on a plateau. Reading it, the
cause was not effort: its rubric told its judge to score "a reader's tool, not a showcase piece"
and capped distinctiveness. The keeper's real goal (§1) was never written into any brief, so nine
rounds optimised an objective the keeper did not hold. Lesson recorded: a brief carries intent; a
loop cannot infer it.

The keeper's worry when we proposed resuming was exact: *"it may have been too narrow in what it
was optimizing and we could be locking in missed opportunities."* So the decision (K14) was: the
old loop's constitutional rules R1–R6 (accessibility, reflow, payload, keyboard, focus, content
above the fold) stay law because they transcribe the site spec; its taste rules R7–R16 become
challengeable by any concept with cause; and the port of its nine iterations is a starting point,
not a design to preserve. The nine iterations were ported onto live (they were real improvements,
the keeper confirmed them, K12) and the loop machinery was replaced by a graph: independent scoped
judges answering PASS/FAIL/UNCERTAIN, code computing scores, a red team, an order-swapped jury, and
the keeper as the only node that makes value calls.

## 3. The Frontier: why it is the flagship and what the keeper fears about it

The keeper had been discussing a new surface, *The Frontier*, with you. Their concern, in their
words: *"I had concerns of the frontier surface collapsing into a benchmark history. I want it to be
an exciting page that captures the bleeding edge of AI … not posting HYPE and unfounded claims …
include the company's claims … very clearly stated that they are not verified by the site … taken
verbatim from the source … a running board of the major players."*

So the Frontier became the flagship surface of the concept round with these fixed properties: a
running board of the major players and their current frontier models; vendor claims verbatim,
attributed, and unmistakably labelled unverified unless a cited verification exists; the compression
of release cadence made visible; new proven abilities; every number traceable to a data source that
exists in the repo today; an honest empty state where the data does not exist yet; no invented or
sample data anywhere; no hype lexicon in fixed copy. The keeper later ruled (K19) that the board
LEADS the page, after one concept proposed leading with proofs instead.

## 4. What the concept round found, and the two finalists

Four concepts were generated (Fable), judged on text by two Opus judges and a Sonnet red team, and
put to the keeper flat, never ranked. The keeper picked two to build: **Dated Ledger** (time as
identity: a site-wide date spine with spacing proportional to elapsed time) and **Players Board**
(the identity is a printed tabulation: organisations by fields, every unsourced cell an honest
hatched blank). Both were built on their own branches by Sonnet implementers, captured at three
widths and two themes, judged by three Opus judges and a red team each, scored by code, and put to a
Fable jury in both reading orders. The jury refused to collapse them; on allure its preference
flipped with reading order, so it recorded none. The keeper chose **Players Board** to carry forward
(K23) and delegated the remaining calls (K24–K29). Dated Ledger's branch stays as a record.

Both builds shared one defect that matters to you: both rendered organisation founding dates and
founders under a "claimed · unverified" tag, because the only structure the repo offers is "any
cited fact". That is not a UI bug; it is a missing data type. It is item §4 of the Desk order.

## 5. How the data decisions were reached (the order you are receiving)

**Board membership is editorial (K21).** When told that on day one the board would hold "the
organisations with a wiki entry whose models appear in the OpenRouter feed", the keeper objected:
*"There is SO MUCH happening outside of those confines."* Decision: a player is on the board because
the site covers it; feeds fill cells; no label may assume one source. The real limit is that the wiki
has 16 org entries and 34 catalog providers have none. That is a writing backlog, and it is yours.

**The domain facet (K22).** The keeper, thinking aloud: *"I never LOVED the tools page. It got better
after we grouped by category, but now I am wondering if a new meta type of 'domain' would be the
natural addition and fit to tie things together (both there, the frontier, and the wiki)."* We agreed
it is a facet, not a hierarchy: many-to-many, closed and small, alongside kind and category, never
replacing them, seeded from the feed's modality fields where possible. The keeper asked for an Opus
research pass on what the domains should be; it recommended nine values and left three questions for
the keeper (text vs general; Artificial Analysis rights; section ordering). The keeper ruled that the
graph must assume the facet exists: every finalist had to show it can absorb a domain as data with no
template edit, and both did.

**Records, not rankings (K30).** The keeper first floated *"an additional section … that features the
top 3 models for each domain."* We discussed that the site's own rules forbid stating a rank as its
own claim, that the only ranking data on disk comes from two publishers whose republication terms
are unverified, and that a ranking table has no motion in it. The keeper then proposed the better
idea: drive the section by *"timestamped news and/or model releases"*, because *"the release event
is only driven by openrouter, which does not cover all domains, especially opensource/weights."*
Then, worried about saturation (*"think about how many models get released on HF or tools get
released on GH"*), they proposed the mechanism you are receiving: the scout is required to look for
news that qualifies as a change in the Frontier; a story flagged frontier is exempt from the
three-a-day posting cap; a flagged story must carry at least one domain; the Frontier's domain
section auto-populates from those records, three most recent per domain. We tightened it together:
the flag must cite one of five written criteria (F1–F5, in the order) so the exemption is not a
loophole; the writing budget share still binds; domains come from the closed vocabulary and the
build fails otherwise; the hub and GitHub feeds are the scout's radar, never display; a quiet domain
shows its last record and its age rather than filler. The keeper's words on the final shape: *"I
agree with everything you just said. Proceed."*

**Index columns only when a registry index exists (K24).** No index value renders until rights are
cleared. Two publishers are present in the feed today (Artificial Analysis on 181 rows, Design Arena
on 165); beads addictedtoai-ego8 and addictedtoai-c563 track the rights checks.

## 6. What the keeper asked us to watch, and what you should know about the implementers

The keeper asked for a ledger of implementer shortcomings, to decide whether the implementer tier
should move from Sonnet to Opus: `knowledge/implementer-ledger.md`, seven entries at the time of
writing, all Sonnet. Three were semantic (the founding-dates-as-claims error twice, independently;
a renderer that printed an empty state without looking at data), three were scope narrowed with a
written reason that did not hold, one broke a constitutional rule on the flagship. The revision now
running is on Opus by the keeper's delegated ruling (K29). The keeper's standing instruction: keep
tracking; decide the tier on evidence.

## 7. The rules of engagement the keeper set for this branch

No merge to `main` until the keeper says everything is in order (K3). No push to the remote until
done (K4). `STOP` and `HOLD.md` are the keeper's alone (K5). Reserved paths untouched, content
read-only (K6). The keeper is the final judge of every round and the only node that collapses a
frontier; every other node exists so that what reaches them is true, diagnosed, and short.

## 8. What is decided, what is open, and what we are asking of you

Decided and recorded: K3–K31 in `state.md`. Open for the keeper: the three domain-facet questions;
sign-off of `DESK-ORDER-001`; the merge and push decisions after the K7 check-in.

Asked of you: the eight lines appended to `DIRECTIVES.md` (three machinery, two verify, one
interpret, one entry, plus the backfill), each pointing at its bead and the order's section. The
two OpenSpec changes (blog/loop for the frontier flag, wiki-schema/directory for the domain facet)
go through your change process first; the directives follow them. Note the machinery ceiling: the
order's §6 sequence puts the fields, criteria, gate and backfill first because they unblock the next
UI brief on their own.

## 8b. Work it out between us; stop for the keeper only when a blind agent says you must (K32)

The keeper's instruction, verbatim: *"I want you two to work it all out and to not stop for my input
unless it really needs to, and the blind agent test confirms that I am needed."* Operationalised
(the keeper may correct this reading): before either session interrupts the keeper, hand the
decision to a fresh agent that is NOT told the keeper is reachable, together with the constitution
(`CHARTER.md`, `RULES.md` R1–R6, the site spec's design bar), rulings K3–K31 in `state.md`, and this
file. Ask it: can this be resolved from what is written, and if so how? If it resolves it, act on
that and record the resolution and the agent's reasoning where the keeper can review it later. Only
if it answers "keeper required" (a value call no clause or ruling anchors, a new scope, a merge or
push, or something irreversible) does either of us stop and ask. The keeper is the final judge, not
the default worker.

## 8c. STOP removal is pre-authorised (K33)

The keeper, 2026-09-05 20:43 UTC: *"I pre-emptively give my authorization to remove the STOP file
after the handoff is completed and the project needs to resume operation."* The keeper said they
would also tell you directly. To verify without reading the whole transcript: the ui-loop session's
log is `C:\Users\BadBitch\.claude\projects\D--shared-workspace-dean-loop-engineering-2\ce83345f-bdb2-4f8e-a1dc-e7e725a95f66.jsonl`;
the authorisation is the `user` record at **line 2883**, uuid `feb3bfa5-84de-49b2-8a7c-de0e8094a614`,
timestamp `2026-09-05T20:43:39.927Z`. K5 still holds for this session: the ui-loop never touches
`STOP`; the removal is yours, after the handoff, when you are ready to resume.

## 8d. The check-in, and what the keeper decided before stepping away (K35–K40)

After the third iteration the graph stopped at the keeper's cap with the revised Players Board at
88.3 (from 54.8), no critical failure, one red-team critical left (the claim filter could admit a
marketing tagline; the word "unverified" no longer printed). A blind arbiter confirmed which
decisions needed the keeper. The keeper ruled: one narrow fourth iteration for the three remaining
fixes (K35); the reader tests SKIPPED, so `MR-UI-001..003` are retired and no calibration precedes
the merge (K36); implementer tier OPUS for all future builds (K37, from the ledger's seven Sonnet
entries against one small Opus one); the domain vocabulary has "general" as its unmarked default,
so eight tagged values remain (K38); the Desk order and the directive lines are signed off, and the
merge, push and this handoff are authorised once the fourth iteration passes (K39). Then, verbatim:
*"I am stepping away now. I authorize you to answer on behalf for any issues that come up, short of
insane catastrophic project threatening madness."* (K40). That delegation covers this handoff: work
it out with this session; escalate to the keeper only for the catastrophic class.

## 9. Questions we expect you to have (ask them)

Why editorial records rather than the feeds you already ingest. Whether the F1–F5 criteria are
checkable enough for the scout. How the domain vocabulary should be owned so the directory spec's
pure-function ordering still holds. Whether the vendor-claim record belongs on the model entry or
beside it. What the UI needs from `frontier.json` and the lead-change kind. Anything in this file
that reads as a rule without a reason. This session answers; the keeper decides.
