# Design: make-the-blog-worth-sending

This document is the argument and the measurement record. The operative
text is the five spec deltas, `tasks.md`, and the voice document at
`openspec/style/blog-voice.md`. Every number below was measured on
2026-08-30 by the method stated beside it; the derivation scripts' logic is
described precisely enough to re-run, and the lint tasks pin both corpora
into tests so the two-direction validation outlives this document.

## D1 — What an award-winning blog is, on this site

The blogs on this subject that people actually send each other react to
events with judgment, fast; synthesize accumulated events into shapes; show
receipts nobody else has; and say who is affected and what to do. The
site's one structural asset no human blogger has is the Pulse: a
deterministic observer with byte-exact, dated records of what the model
economy's own pages said and when they changed. The identity this change
builds toward: **the blog of record for the observable AI economy** — every
post a news note (a dated event, witnessed, with who it lands on) or a
synthesis (recorded evidence assembled into a shape no single event shows),
every post worth sending to a specific person, and none of it about the
site that wrote it.

What the blog refuses is equally definitional: the unanchored survey
written because the catalog was there to survey; the rewritten
announcement; anything correct, sourced, and forgettable; and its own
reflection. The maintainer's verdict on the five current posts — use them
"as examples of what not to do" — and on the predecessor's twelve —
excellent judgment, "obviously AI generated" prose — fixes both ends of the
standard: the old site's editorial discipline, without its voice, about
the world, never about the machine.

## D2 — The scout: the maintainer's sentence, read through the architecture

His words: *"one pulse per day spawns a scout that looks for content that
clears the bar, and then if it finds worthwhile material to cover or
synthesize from, creates job in the desk queue."* Three constraints shape
the reading:

1. **The Pulse must stay model-free** — `pulse/verify-zero-model.mjs`
   enforces it structurally. So the Pulse does not become the scout; it
   *triggers* the scout: on each run it derives a scout item into the
   queue exactly when the ledger records no `scout` job started on the
   current local date. Deterministic (ledger + clock, nothing else),
   idempotent within a day, and still a pure recomputation.
2. **The derived queue cannot be written by models** — it is recomputed
   from state every run, which is the founding answer to the previous
   site's ever-growing ledger. So the scout's output cannot be "jobs in
   the queue" literally; it is **candidates in `data/proposals/`** — the
   loop's one model-originated work source, whose consuming machinery
   (slug dedup, rejection index, selector wiring) already exists and is
   tested. His outcome holds — the scout finds material, and jobs exist
   that the Desk will select — through the one channel the constitution
   already built for exactly this. This is the one interpretive step taken
   on his sentence, and it is flagged in D9.
3. **News decays, and proposals cool for 3 days** — which would kill every
   note. Hence the one rule change in the proposals channel: a proposal
   declaring `expires:` skips cooling and dies at its expiry, swept to
   `data/proposals/dropped/` mechanically. Cooling filters ideas by
   survival; expiry filters evidence by decay. Both are time-based honesty
   checks; a candidate carries the one that fits its evidence. The known
   cost: any job could dodge cooling by declaring `expires:` — accepted,
   because an expiring candidate self-destructs if not selected promptly,
   the scout's filings are reviewed before they merge, and the cooling
   filter's purpose (ideas that still look good three days later) has no
   meaning for evidence with a shelf life.

The rest of the scout's shape is the maintainer's, made mechanical:

- **Three per day, ranked, the rest discarded.** The cap is enforced at
  the scout's merge — excess candidate files are moved to the drop record
  by the loop, by the scout's own stated ranking, else by filename — not
  requested of the model. Three is deliberately loose against the
  predecessor's measured 0.81 published posts/day; it bounds a burst, and
  nothing anywhere treats it as a target.
- **Discards are records.** Every declined story becomes a file in
  `data/proposals/dropped/` naming the failed test and the refile
  condition — the predecessor's `docket/dropped/` discipline, which is
  what made its 57% kill rate auditable (44 filed over 9 active days, 25
  dropped, each with a `## Dropped` section naming its test; measured by
  reading `docket/` at `d34040b`). `dropped/` is a record, never a block:
  it does not feed slug suppression, so a story returns when its refile
  condition arrives. `rejected/` remains the only auto-blocking index.
- **No backlog.** A candidate not taken expires and is swept; nothing
  carries forward unjudged. The predecessor's author track named its own
  carried queue as the bottleneck — "ten weeks of backlog for stories with
  a one-week shelf life" (`prompts/tracks/author.md` at `d34040b`) — and
  its fix ("take the freshest viable item, not the oldest") was an
  instruction. Expiry is that fix as a mechanism.
- **The quiet day opens the synthesis branch and never a floor.** When no
  external story clears the bar, the scout considers whether accumulated
  recorded evidence supports a synthesis. If nothing clears there either,
  it ends `blocked: nothing cleared the bar` — a ledger-recorded success.
  The branch is an avenue, not an obligation; a floor reintroduced through
  it would contradict the explicit "0 posts is acceptable" and the
  no-cadence rule at once, so the spec text says so in as many words.
- **The charge is outward, and review enforces it.** "Bring back work the
  site could not have thought of by looking at itself" is the predecessor
  Scout track's charge verbatim; its failure condition — "every item could
  have been written without leaving the repository" — is this scout's
  named `spec-violation`, checked by the reviewer against the candidates'
  retrieval-dated external evidence. This answers `addictedtoai-18c`'s
  bigger finding directly: the old queue input was the site's own
  snapshot diffs, and "a better prompt handed a census queue will still
  write censuses." The scout *is* the widened aperture, at the judgment
  layer rather than the registry layer.

Autonomy, stated once because the whole design leans on it: every judgment
above is a **model's**, constrained by mechanism — the scout judges under
a mechanical cap and a review gate; the reviewer judges from a closed
reason list with forced own-words fields; nothing anywhere waits on a
person. The humans hold brakes (`STOP`, `HOLD.md`, reserved paths), never
workflow.

## D3 — The bar reads strict, and where that choice was made

The maintainer: "I want the bar to be high though!" Where a permissive and
a strict reading both fit, the strict one was taken, at these named
points:

1. **Both tests, conjunctive, for every post** — worth a stranger's
   attention *and* true/checkable/current — with the stranger judged as
   someone who never learns an AI made it (novelty counts for nothing).
2. **Posts must pass the send form**; citable alone does not publish a
   post. Stricter than `addictedtoai-18c`'s "prefers sendable."
3. **Anchor freshness is two-sided and universal**: every declared anchor
   within the 7 days ending on the post's date — no laundering a stale
   event with one fresh line beside it (the sealed review's finding 9,
   fixed in the strict direction).
4. **Event-driven candidates expire in at most 7 days**, syntheses 14 —
   the predecessor's one-month `expires:` was its loosest setting and its
   queue rotted; the strict windows encode "news decays" directly.
5. **The voice lint fails the build** rather than warning — the
   fail-don't-warn house rule, applied because the marker list is closed,
   calibrated, and quote-exempting, so a legitimate use has an escape
   (blockquote, correction block) that a warning would not need.
6. **Self-narration fires at one occurrence**, the tightest calibrated
   threshold in the lint (10 of 12 negative-corpus posts carry it; 0 of 9
   human pieces do).

## D4 — What this revision removed, and why

**The per-event queue deriver (the previous draft's centerpiece) is
withdrawn entirely.** The revision brief kept it as "not wrong, but not
sufficient"; this change goes further and removes it, on the sealed
review's measurements: its grouping key was undefined for 60 of 90 feed
lines (`release` row ids are UUIDs with no vendor; measured again this
revision — 0 of 60 contain `/`, 29 of 29 live lines do); its `field_change`
clause had been emptied by the registry's own `event: false` flags on both
price fields (`diff.mjs:224`; verified in `data/sources/registry.json`),
reducing it to `status` — one line in the entire live history; and its
rank-35 items sat in `QUEUE_CAP` truncation range, where a dropped
candidate is gone, not deferred. Three repairs were available; removal is
better than all of them, because the scout reads the same feed with
judgment attached — the daily scout item carries the trailing-7-day
uncovered event lines as assembled context — and story-forming (which
events are one story) is judgment, which is exactly what the deriver's
grouping key was trying to fake deterministically. One producer with the
feed as an input beats two producers for one surface, one of which cannot
group two thirds of its supply. What is lost: a model-free candidate floor
when the Desk is down. Nothing real is lost there — candidates without a
model to write posts publish nothing either way.

**The count ceiling on published posts is gone — both of them.** The live
3-in-7 (enforced twice, as `POST_CEILING = 3` in `lib/posts.mjs` and
`BLOG_CEILING_POSTS = 3` in `loop/lib/config.mjs` — the sealed review's
finding 7, two constants equal by coincidence) and this change's own
earlier 1-in-7 unanchored lane. The lane design was defeated honestly:
nothing forbade a synthesis declaring `covers:`, the build checked only
that the reference resolved, so a survey naming one recent feed line
escaped the cap — the classifier read front matter while the claim was
about genre (finding 5). Rather than repair the classifier, the control
moves to where the maintainer put it: **the scout's 3/day filing cap**,
which is mechanical at merge, plus the bar, plus the untouched
model-minute ceiling and capacity shedding. The predecessor's evidence
supports it: quality was controlled by a 57% kill rate, not by its 3/week
ceiling, which its own author track named as the bottleneck. My earlier
position — one count control independent of the judge — is satisfied
better by the filing cap than by the publication ceiling it replaces: it
sits where the volume is created, it cannot be escaped by front matter,
and it needs no genre classifier at all.

**"The blog remembers itself" is dead, not weakened.** Measured by the
sealed review over the five real posts: 6 of 10 pairs share a mention, the
required link is the immediately previous post in 3 of 4 cases, one link
compelled on `org/openai` alone — a chain, not a thread (finding 10). The
maintainer's "the blog is not about this site" settles the rest: the
requirement is removed outright, and continuity is the wiki's job (posts
reference entries; entries carry timelines).

**The five published posts are deleted**, per the maintainer, as part of
this change — with their three dependencies handled in the same tasks:
`FLOORS.posts = 2` at `scripts/verify-launch.mjs:88` goes to 0 (verified
present this revision), their five seed review records are removed with
them (an orphaned record is a standing false alarm in the reviews join),
and the blog index gets an honest empty state (the copy at
`lib/render/blog.mjs` that still advertises "three in any seven days" goes
with the ceiling it describes).

## D5 — The two tests, restored with their history

The predecessor's CHARTER (read at `d34040b`) holds the pair: *"Would this
be worth a stranger's attention if they never learned an AI made it?"* and
*"Is it true, checkable, and current?"*, with the judge "a stranger who
does not know or care how this site was made" and the named failure
*"Passing 2 but not 1 is a scrupulously honest site nobody visits."* The
live editorial spec carries test 2's machinery (would-cite) and nothing
for test 1 — the same defect the charter's own amendment log records
against itself: its `serves:` vocabulary held four values, all naming
test 2, so *"no advancing-track item arguing test 1 could have been filed
without failing a frontmatter check"* for the vocabulary's entire
twelve-day life. The editorial delta closes the modern instance: clause 3
becomes the stranger test, would-cite and would-send its two operational
forms, and "correct, sourced, and forgettable" a named failure. The blog
requires the send form because sending is what stories do and citing is
what references do — the felt difference `addictedtoai-18c` traced to a
single substituted word.

## D6 — The voice: research, calibration, and the honest gaps

**The problem.** The maintainer requires posts that "feel human when
read", with the site's AI-authorship disclosure untouched — craft, not
concealment. The predecessor's twelve posts, initially offered as the
voice standard, are the opposite: his own verdict is "obviously AI
generated," confirmed by measurement below. So **no positive exemplar of
the target voice exists in this repository.** The compensation is
threefold: the voice document defines the voice on its own terms with
fresh before/after pairs (`openspec/style/blog-voice.md` §2); the
mechanical half is a lint calibrated against a labeled negative corpus and
a human sample, its tests asserting both directions; and the judgment half
is a model-run review rejection (`reads-as-generated`) with a forced
own-words field (`reads-human`), the same shape as `would-cite`.

**The corpora.** Negative: the twelve predecessor posts at `d34040b`
(`app/blog/*/page.js`, prose extracted by stripping JSX/tags with
paragraph and header boundaries preserved; 19,017 body words). Human: nine
by-lined pieces of technology journalism on the same beat — model
releases, pricing, policy — 16,480 body words, six outlets, four pieces
pre-ChatGPT and so uncontaminated by assistance (all fetched and measured
2026-08-30):

| piece | outlet / author | words |
|---|---|---|
| llms-in-2024 (2024-12-31) | simonwillison.net | 7,122 |
| the-gpt-4-barrier (2024-03-08) | simonwillison.net | 847 |
| GPT-4 launch (2023-03-14) | The Verge | 1,001 |
| Claude 3 launch (2024-03-04) | The Verge | 529 |
| GitHub Copilot (2021-06-29) | The Verge | 620 |
| GPT-3 explainer (2020) | The Verge (J. Vincent) | 3,760 |
| GPT-4 announce (2023-03) | Ars Technica | 920 |
| GPT-5 pricing (2025-08-08) | TechCrunch | 757 |
| GPT-3 (2020-07-20) | MIT Tech Review | 924 |

Known limits, stated: one author (Willison) contributes 48% of the human
words; the corpus is nine pieces, not ninety; and prose extraction from
live HTML is approximate. The thresholds carry margins, and the lint task
pins both corpora so growing either re-runs the whole calibration.

**The inventory.** Six families measured; per-1k-word rates unless noted.
"AI med/max" and "human med/max" are per-piece medians and extremes.

| marker | AI corpus | human corpus | disposition |
|---|---|---|---|
| semicolons | med 4.2, min 2.7, max 11.1 | med 0.3, max 2.1 | **lint: > 2.5/1k** — fires on 12/12, 0/9. The strongest separator measured |
| em-dashes | w-avg 13.3, med 15.9, range 5.0–21.6; 9/12 > 10 | w-avg 4.4, med 2.7, max 9.4 | **lint: > 10/1k** — fires on 9/12, 0/9. Density, never presence; also the most meme-recognized tell (reception counts) |
| self-narration ("this post/piece", "labelled as such", "measured here"…) | 10/12 posts ≥ 1; median 3; max 22 | 0/9 | **lint: ≥ 1 occurrence**, outside correction blocks — fires 10/12, 0/9 |
| What/Why/How headers | 22 of 76 headers; 12/12 posts ≥ 1 | 0 of 25 headers | **lint: ≥ 2 per post** — fires 5/12, 0/9 (kept conservative singly; coverage comes from the union) |
| focal-word family (delve, robust, pivotal, tapestry, …) | **0.1/1k** — the corpus is nearly clean | **0.9/1k** — robust, pivotal, crucial, leverage, comprehensive all occur | **lint at ≥ 3/1k as a register guard only** (double the human max of 1.3). At presence level this famous family fails BOTH validation directions here — it fires on good human journalism and passes the labeled AI corpus. The house model does not delve; the next runner might, which is the only reason it stays at all |
| "not just X, but Y" | 0.11/1k | 0.24/1k — twice the AI rate | **cut from lint; review judges density**. Measured folklore for this register |
| "is not X, it's Y" antithesis | 0.16/1k | 0.06/1k | too rare to mechanize; **review** |
| ellipses | 0.26/1k | 0.42/1k | no signal; **named folklore** |
| sentence-length burstiness (CV) | med 0.55, range 0.48–0.66 | med 0.59, range 0.46–1.90 | **failed validation as a lint; review judges rhythm.** The literature's strongest family did not separate: edited journalism is itself smooth (Ars 0.48, Verge 0.46 sit below the AI median), and only one human piece (Willison, 1.90) is bursty. Consistent with CT² (arXiv:2310.05030): burstiness estimations "cannot be considered reliable" alone |
| paragraph-length CV | med 0.83 | med 0.44 | separated in the **inverted** direction from theory (news grafs are uniformly short); cut, recorded so nobody re-adds it the right way round without re-measuring |
| type-token ratio | med 0.45, min 0.37 | med 0.51, min 0.48 | thin margin, confounded by bound-fact repetition; **review** |
| "The" as sentence opener | med 24% | med 8%, max 23% | margin too thin; **review** |
| Conclusion/Key-takeaways headers, "let's dive", "deep dive", "only time will tell", "stands as a testament", "navigate the complexities", "it's worth noting that", "in today's rapidly evolving" | 0 | 0 | **lint, presence** — zero-cost register guards with catalog evidence (Wikipedia AISIGNS), for the model-swap case |
| bold-lead bullet runs | present (coordinator-measured on gpt-5-6-price-drop) | not measurable in news HTML | **lint on our own markdown**, validated against the negative corpus and the catalog only — stated as such |

**Two-direction validation of the assembled lint** (union of the lint rows
above): fires on **12 of 12** negative-corpus posts (semicolon density
alone covers all twelve; em-dash, self-narration and What-headers overlap
it) and on **0 of 9** human pieces. Both numbers are the assertion the
lint's own tests must keep true against the pinned corpora — a lint change
that breaks either direction fails its tests.

**Reliability grading, per the instruction to separate evidence from
folklore:**

- *Evidenced and mechanized*: semicolon density, em-dash density (both
  locally calibrated, zero measured false positives; em-dash additionally
  carries reception evidence — the "ChatGPT hyphen" is a named meme with
  mainstream coverage, so readers run the check regardless of its
  statistical merit); self-narration; What-headers; the zero-cost register
  guards (Wikipedia's AISIGNS catalog, maintained from thousands of
  flagged instances, plus Kobak et al.'s excess-vocabulary measurements —
  the strongest external evidence in this literature).
- *Evidenced elsewhere, failed locally, sent to review*: burstiness and
  uniformity (real in the literature, wrong shape on professionally
  edited journalism); lexical family at presence level (Kobak's effect is
  register-dependent and this house register does not show it).
- *Folklore, named so nobody re-adds it*: em-dash **presence** (the meme's
  strong form — banning the dash — would have flagged a human maximum of
  9.4/1k while the real signal is density an order of magnitude higher);
  "not just X, but Y" (human journalism uses it more than this AI corpus);
  ellipsis habit (no signal either direction).

**Sources**, all retrieved 2026-08-30: Wikipedia, "Signs of AI writing"
(en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing); Kobak,
González-Márquez, Horvát et al., "Delving into LLM-assisted writing in
biomedical publications through excess vocabulary," Science Advances /
arXiv:2406.07016; "Why Does ChatGPT 'Delve' So Much?" arXiv:2412.11385;
"Counter Turing Test CT²," arXiv:2310.05030; "Stylometric detection of
AI-generated texts," Digital Scholarship in the Humanities,
doi:10.1093/llc/fqag064; Know Your Meme, "ChatGPT Em Dash"; Rolling Stone,
"'ChatGPT Hyphen': Are Em Dashes a Giveaway of AI Writing?"; The Ringer,
"Stop AI-Shaming Our Precious, Kindly Em Dashes" (2025-08-20).

## D7 — Considered and rejected

- **A separate news surface** — rejected with `addictedtoai-18c`, whose
  revisit trigger (dated items exceeding what the blog can carry) stands.
- **Noteworthiness scoring in the Pulse** — judgment in the engine defined
  by having none; the scout exists so the Pulse never has to score.
- **A cadence floor, any form, including via the synthesis branch** — the
  branch opens an avenue; `blocked: nothing cleared the bar` is a success;
  "0 posts is acceptable" is the maintainer's own sentence.
- **Repairing the per-event deriver instead of removing it** — see D4.
- **Keeping any published-post count ceiling** — see D4; the filing cap
  replaces it at the point volume is created.
- **A `news` job type** — both forms are `post` jobs distinguished by
  their evidence; the closed list grows by `scout` only.
- **Salvaging proposals from discarded branches** — laundering; they die
  with the branch.
- **A human anywhere in the runtime loop** — per the maintainer's
  autonomy instruction, every judgment is a model's under mechanism:
  the scout under cap+review, the reviewer under closed reasons and
  forced fields, thresholds derived from corpora rather than tuned by
  hand. People hold brakes only.
- **Deriving the prose voice from the predecessor posts** — they are the
  negative corpus for voice (his correction), positive for editorial
  judgment; the voice document splits them explicitly.

## D8 — The sealed review's findings, disposed

| finding | disposition |
|---|---|
| 1 grouping key undefined for `release` | deriver removed (D4); story-forming is now scout judgment |
| 2 `event: false` empties field list | deriver removed; no spec text anchors to registry field sets any more (the archive-trap lesson, applied) |
| 3 directive anchor syntax existed nowhere | lanes removed; no anchor classification exists to declare |
| 4 draft-post fixture forbidden by schema | the task requiring it is gone with the coverage join's old consumer; no task references `draft:` |
| 5 uncapped lane escapable via `covers:` | dissolved: no lane, no count gate to escape; `covers:` is evidence and feed-coverage marking only (D4) |
| 6 ceiling-1 warns permanently on old corpus | moot twice over: the five posts are deleted and the warning machinery is removed |
| 7 two ceiling constants | both removed, with their tests |
| 8 anchor never rendered | now normative: the rendered note shows its dated, linked anchor |
| 9 newest-anchor laundering; one-sided window | strict fix: every declared anchor, two-sided window |
| 10 self-linking degenerates into a chain | requirement killed outright, not weakened |
| 11 `QUEUE_CAP` truncation of rank-35 items | deriver removed; the scout item is one high-ranked line per day |
| 12 self-amplification blocked at one hop only | wording now says exactly that: the guard closes the tight loop, not every loop, with cooling and the rejection index named as the bounds |
| C1 "all readers" | corrected: three readers and one mover; none creates a proposal |
| C2 "empty rejected/" | corrected: it holds a README |
| C3 "every line carries…" | corrected: 89 of 90; the annotation line has neither source URL nor excerpt |
| C4 curly-apostrophe "verbatim" trap | the task no longer quotes `brief.mjs` text as a search string |
| archive trap: "the 3-in-7 ceiling it replaces" inside a requirement | comparison prose lives here and in preambles now, not in requirement bodies |
| archive trap: registry-defined field sets in requirement text | gone with the deriver |
| E: 3zf never updated | task 6.3 updates all three issues, not only files new ones |
| E: rank 35 above mints unauthorized | the scout item's relative rank is now normative in the pulse delta |

## D9 — What is genuinely left open

Kept to what the change cannot decide for itself:

1. **The reading of "creates job in the desk queue."** The scout files
   expiring candidates into the proposals source, which the selector
   consumes — not literal queue writes, which would break the derived
   queue's founding property (D2). This is an interpretation of the
   maintainer's sentence, made because the alternative dismantles a
   load-bearing invariant; if he meant the literal thing, that is a
   different and larger change, and this document is where the difference
   is recorded.
2. **The execution-time `data/config.json` edit** (a `scout` wall-clock
   cap — the change proposes 30 minutes — and `scout` in the new-writing
   category list). A reserved path: not a Desk job's edit, so it is
   applied by the orchestrator when this approved change is executed, on
   the same authority as any approved-change application. Named here
   because it is the one step of execution no Desk job may perform — a
   property of the reserved-path rule, not a runtime human dependency:
   nothing operates the loop by hand afterward.

Everything else this document once held as open — the ceiling constant,
the send test's strictness, grouping, directive lanes — is decided above,
with reasons, per the instruction to choose rather than defer.
