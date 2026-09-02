# Design: make-the-blog-worth-sending

This document is the argument and the derivation history. The operative
text is the five spec deltas, `tasks.md`, and the voice document at
`openspec/style/blog-voice.md`; the **measurement record of record** is
`openspec/style/blog-voice-calibration.md`, which lives outside the paths
archiving moves because the voice document's recalibration rule anchors
to it. Every number below was measured on 2026-08-30 by the method stated
beside it, and the voice numbers were re-derived that day from raw
sources after the second sealed review showed the first derivation's
semicolon distribution was an instrument artifact (D6, "the correction
record"). The lint tasks pin both corpora into tests so the calibration
outlives this document.

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
5. **The voice lint warns and never fails the build** — the one named
   exception to the strict-reading rule, decided after the second sealed
   review and on the maintainer's own directive that feeling human "is
   stylistic preference and can only be measured so accurately" while
   quality is what matters. An earlier revision chose fail-don't-warn on
   the premise that the markers fire only on illegitimate use; the second
   review measured the house model tripping the punctuation rates in 15
   of 15 of its long-form repository documents — including the voice
   document itself — and none of those can reach for a blockquote to fix
   a semicolon rate. A fail-closed gate would have had a stable silent
   failure mode: post job writes, build fails on the lint, job ends
   `failed`, three failures trip breaker 1, `post` work stops, scout
   candidates expire unselected, and the blog stays empty while every
   component reports success at its own contract. The lint joins the
   repository's two deliberate warn-not-fail cases (a currency literal in
   prose; the old over-ceiling post rate). The voice gate that binds is
   the model-run review verdict `reads-as-generated` — a named rejection
   reason, which is what "NO HUMAN judgment" requires — and the reviewer
   may cite the lint's warnings as evidence.
6. **Self-narration warns at one occurrence**, the tightest calibrated
   threshold in the lint (10 of 12 negative-corpus posts carry it; 0 of 9
   human pieces do, on every sample measured).

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

**The problem, ordered the way the maintainer ordered it.** Quality
outranks sounding human: his instruction is that feeling human is a
stylistic preference that "can only be measured so accurately", so the
voice work serves the quality bar rather than gating it, and nothing in
it is concealment — the AI-authorship disclosure stands untouched
(`addictedtoai-18c`'s scope correction, applied). The predecessor's
twelve posts, initially offered as the voice standard, are the opposite:
his own verdict is "obviously AI generated," confirmed by measurement
below. So **no positive exemplar of the target voice exists in this
repository**, and nothing yet demonstrates the target voice is reachable
by the house model — the second review measured its long-form output
tripping the punctuation markers in every register. The response is
threefold, with the weight on the third: the voice document defines the
voice on its own terms with fresh before/after pairs, written to be
followable by a weaker model (`openspec/style/blog-voice.md` §2); the
mechanical half is an **advisory** lint calibrated against a labeled
negative corpus and a human sample, warning with named markers and never
failing the build; and the gate is the model-run review rejection
(`reads-as-generated`) with a forced own-words field (`reads-human`), the
same shape as `would-cite`.

**The corpora, and where their record now lives.** Negative: the twelve
predecessor posts at `d34040b` (`app/blog/*/page.js`; 18,600 body words
under the corrected instrument). Human: nine by-lined pieces on the same
beat — model releases, pricing, policy — 16,107 body words, five outlets,
three pieces pre-ChatGPT and so uncontaminated by assistance (fetched
2026-08-30). The full manifest — per-piece sources, dates, word counts,
per-document measured values, the instrument, and the limits — is
**`openspec/style/blog-voice-calibration.md`**, beside the voice document
and outside every path archiving moves, because the voice document's
recalibration rule must keep pointing at its evidence after this change is
archived. This design section is the history of the derivation; that file
is the record of record.

Known limits, stated there in full and summarized here: two of the nine
human pieces are a personal technical blog, not journalism; one author
(Willison) contributes 47% of the human words; the human pieces run
2020–2025 against a wholly-2026 negative corpus; lengths are not matched
(519–6,835 words against 790–2,423); at least one fetch carries site
chrome that trips a marker; prose extraction from live HTML is
approximate, and extraction variance alone was measured moving a
semicolon verdict from 7/12 to 12/12 across instrument variants. The
lint task pins both corpora so growing either re-runs the calibration.

**The correction record.** This section's first version reported semicolon
distributions (min 2.7, max 11.1, "fires on 12/12, the strongest
separator") that did not survive independent re-measurement. Two
instrument artifacts were found, both inflating semicolon counts: the JSX
component's closing `); }` leaked one semicolon into every post, and
undecoded `&sect;` entities counted one statute citation per `;` — the
reported maximum (a legal-analysis post citing twelve section numbers)
was that artifact, in the first derivation and in the second review's
re-measurement alike. The numbers below are from the corrected
instrument, described in the calibration record precisely enough to
re-run.

**The inventory.** Six families measured; per-1k-word rates unless noted.
"AI med/max" and "human med/max" are per-piece medians and extremes.

| marker | AI corpus | human corpus | disposition |
|---|---|---|---|
| semicolons | med 3.22, min 1.85, max 5.98 | med 0, max 2.15 | **lint (advisory): > 2.5/1k** — warns on 10/12, 0/9. The margin is one mark: `gemini-3-7-flash` clears the line at 2.53 |
| em-dashes | w-avg 13.33, med 15.0, range 4.96–21.22; 9/12 > 10 | w-avg 4.53, med 2.69, max 9.90 | **lint (advisory): > 10/1k** — warns on 9/12, 0/9, the human max one dash under the line. Density, never presence; also the most meme-recognized tell (reception counts) |
| self-narration ("this post/piece", "labelled as such", "measured here"…) | 10/12 posts ≥ 1; median 3.5; max 26 | 0/9, and 0/8 on the fresh sample | **lint (advisory): ≥ 1 occurrence**, outside correction blocks — warns 10/12, 0/9. The cleanest marker measured |
| What/Why/How headers | 22 of 76 headers; 12/12 posts ≥ 1 | 0 of 24 headers | **lint (advisory): ≥ 2 per post** — warns 5/12, 0/9 (kept conservative singly; coverage comes from the union) |
| focal-word family (delve, robust, pivotal, tapestry, …) | **0.05/1k** — the corpus is nearly clean | **0.87/1k** — ordinary journalistic use | **lint (advisory) at ≥ 3/1k as a register guard only** (over double the human per-piece max of 1.34). At presence level this famous family fails BOTH validation directions here — it fires on good human journalism and passes the labeled AI corpus. The house model does not delve; the next runner might, which is the only reason it stays at all. Measured false-positive mode: one quoted word in a short piece clears the rate |
| "not just X, but Y" | 0.11/1k | 0.24/1k — twice the AI rate | **cut from lint; review judges density**. Measured folklore for this register |
| "is not X, it's Y" antithesis | 0.16/1k | 0.06/1k | too rare to mechanize; **review** |
| ellipses | 0.26/1k | 0.42/1k | no signal; **named folklore** |
| sentence-length burstiness (CV) | med 0.55, range 0.48–0.66 | med 0.59, range 0.46–1.90 | **failed validation as a lint; review judges rhythm.** The literature's strongest family did not separate: edited journalism is itself smooth (Ars 0.48, Verge 0.46 sit below the AI median), and only one human piece (Willison, 1.90) is bursty. Consistent with CT² (arXiv:2310.05030): burstiness estimations "cannot be considered reliable" alone |
| paragraph-length CV | med 0.83 | med 0.44 | separated in the **inverted** direction from theory (news grafs are uniformly short); cut, recorded so nobody re-adds it the right way round without re-measuring |
| type-token ratio | med 0.45, min 0.37 | med 0.51, min 0.48 | thin margin, confounded by bound-fact repetition; **review** |
| "The" as sentence opener | med 24% | med 8%, max 23% | margin too thin; **review** |
| Conclusion/Key-takeaways headers, "let's dive", "deep dive", "only time will tell", "stands as a testament", "navigate the complexities", "it's worth noting that", "in today's rapidly evolving" | 0 | **1** — MIT TR's "Deep Dive" section label, fetched as page chrome | **lint (advisory), presence** — register guards with catalog evidence (Wikipedia AISIGNS), for the model-swap case. The one human fire is a chrome artifact, and it is also the demonstration that presence guards false-positive on quoted or foreign material |
| bold-lead bullet runs | present (coordinator-measured on gpt-5-6-price-drop) | not measurable in news HTML | **lint (advisory) on our own markdown**, validated against the negative corpus and the catalog only — stated as such |

Provenance, row by row: the semicolon, em-dash, self-narration,
What/Why/How, focal and register-guard rows were re-derived 2026-08-30
with the corrected instrument and are the calibration record's numbers.
The burstiness, paragraph-CV, type-token, "The"-opener, "not just X, but
Y", antithesis and ellipsis rows carry the first derivation's numbers,
not independently re-measured — kept because their dispositions (cut, or
sent to review) are direction-level calls that do not hang on the exact
values, and marked so nobody cites them as verified.

**How the assembled union performs** (measured with the corrected
instrument): at least one marker trips on **12 of 12** negative-corpus
posts and on **1 of 9** human pieces — the chrome artifact above. No
single marker covers all twelve (`frontier-cyber` is carried by the
What/Why/How count alone), the closest margins are one punctuation mark
in either direction, and the thresholds are **fitted** to these two
samples — the honest claim is that they separate the house model's
measured register from edited technology writing on the corpora measured,
plus one adversarially chosen fresh sample (eight era-matched TechCrunch
pieces: no punctuation or narration marker fires on any). They are not a
validated general AI detector, and the second review measured the same
model tripping the punctuation rates in 15 of 15 of its long-form
repository documents — the fact that decided D3.5's warn-not-fail. The
lint's tests pin both corpora and assert the calibration record's firing
counts, so a lint edit that silently changes either direction fails its
tests.

**Reliability grading, per the instruction to separate evidence from
folklore:**

- *Evidenced and mechanized as advisory markers*: semicolon density,
  em-dash density (locally calibrated with single-mark margins; em-dash
  additionally carries reception evidence — the "ChatGPT hyphen" is a
  named meme with mainstream coverage, so readers run the check
  regardless of its statistical merit); self-narration (the cleanest:
  zero human occurrences on every sample measured); What-headers; the
  register guards (Wikipedia's AISIGNS catalog, maintained from thousands
  of flagged instances, plus Kobak et al.'s excess-vocabulary
  measurements — the strongest external evidence in this literature —
  with one measured chrome false positive on the human sample).
- *Evidenced elsewhere, failed locally, sent to review*: burstiness and
  uniformity (real in the literature, wrong shape on professionally
  edited journalism); lexical family at presence level (Kobak's effect is
  register-dependent and this house register does not show it).
- *Folklore, named so nobody re-adds it*: em-dash **presence** (the meme's
  strong form — banning the dash — would have flagged a human maximum of
  9.9/1k while the real signal is density; the dash-loving human sits one
  dash under the density line);
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
- **A build-failing voice gate** — an earlier revision chose it; the
  second sealed review's measurement reversed it (the house model trips
  the punctuation markers in every register it writes, so fail-closed had
  a stable silent-empty-blog failure mode — D3.5). The lint warns; the
  review verdict gates.
- **A pass-case fixture proving the target voice reachable before
  execution** — the second review's proposed fix for the fail-closed
  gate. Mooted by making the lint advisory: no build gate now needs a
  demonstrated pass case, and the first honest test of reachability is
  the first real post through review, which task 5.1's follow-up issue
  records.
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
| 2 `event: false` empties field list | deriver removed, and with it the deriver's own anchoring to registry field sets. Two restated live requirement bodies still carry "price/licence/status" verbatim (the pulse queue enumeration; the loop `interpret` bullet) — inherited from the live spec unchanged, neither introduced nor worsened by this change |
| 3 directive anchor syntax existed nowhere | lanes removed; no anchor classification exists to declare |
| 4 draft-post fixture forbidden by schema | the task requiring it is gone with the coverage join's old consumer; no task references `draft:` |
| 5 uncapped lane escapable via `covers:` | dissolved: no lane, no count gate to escape; `covers:` is evidence and feed-coverage marking only (D4) |
| 6 ceiling-1 warns permanently on old corpus | moot twice over: the five posts are deleted and the warning machinery is removed |
| 7 two ceiling constants | both removed, with their tests |
| 8 anchor never rendered | now normative: the rendered note shows its dated, linked anchor |
| 9 newest-anchor laundering; one-sided window | strict fix: every declared anchor, two-sided window |
| 10 self-linking degenerates into a chain | requirement killed outright, not weakened |
| 11 `QUEUE_CAP` truncation of rank-35 items | deriver removed; the scout item is one high-ranked line per day |
| 12 self-amplification blocked at one hop only | the requirement body now says exactly that: the guard closes the tight loop, not every loop, with cooling and the rejection index named as the bounds. The requirement title — live text, restated — still reads "cannot self-amplify"; the body's one-hop honesty is the operative text, and retitling a live requirement is not this change's to do |
| C1 "all readers" | corrected: three readers and one mover; none creates a proposal |
| C2 "empty rejected/" | corrected: it holds a README |
| C3 "every line carries…" | corrected: 89 of 90; the annotation line has neither source URL nor excerpt |
| C4 curly-apostrophe "verbatim" trap | the task no longer quotes `brief.mjs` text as a search string |
| archive trap: "the 3-in-7 ceiling it replaces" inside a requirement | comparison prose lives here and in delta preambles now, not in requirement bodies. The second review found two sites this claim had missed — "removed with this change" in the blog quota requirement, the predecessor's 57% kill rate in the scout requirement — both moved to preambles 2026-08-30 |
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
2. **The execution-time `data/config.json` edit** — a reserved path:
   never a Desk job's edit, applied by the orchestrator on the same
   authority as any approved-change application. Its actual shape,
   corrected after the second sealed review measured that the selector
   sheds by the literal `degradation.shed_levels[].exclude_types` arrays
   (`loop/lib/budget.mjs:372`), not by budget categories, which feed only
   the ceiling:
   - **Done, 2026-08-30, by the orchestrator**: `scout` added to all
     three `exclude_types` arrays — without which the loop delta's own
     shed-order sentence was unimplemented and `scout` stayed selectable
     at every shed level.
   - **Remaining at execution start (task 2.1)**:
     `job_caps_minutes.scout: 60` and `scout` in the
     `budget.categories.new_writing` list. Order matters:
     `loadConfig` throws on any `JOB_TYPES` entry without a cap
     (`loop/lib/config.mjs:99`), so the config gains the cap before
     `loop/lib/config.mjs` gains the type. The cap is 60, not the 30
     first proposed: every live cap is 120, the scout is the one job
     defined by fetching the outside world, and a network-slow night
     under a 30-minute cap ends `interrupted` — which breakers exclude —
     silently and repeatedly. 60 keeps a real bound at half the universal
     cap while leaving fetch room; the second review flagged the
     unexplained 30, and this is the recorded reason for its
     replacement.

Everything else this document once held as open — the ceiling constant,
the send test's strictness, grouping, directive lanes — is decided above,
with reasons, per the instruction to choose rather than defer.

## D10 — The second sealed review's findings, disposed

Disposed 2026-08-30, before execution, with every number re-derived from
raw sources rather than carried from either prior document (`review2.md`
is the finding record; the corrected measurements live in
`openspec/style/blog-voice-calibration.md`).

| finding | disposition |
|---|---|
| 1 config edit incomplete; traceability row false | the three `exclude_types` edits applied by the orchestrator 2026-08-30 and verified against `budget.mjs:372`; task 2.1 and the traceability row corrected; D9.2 rewritten (cap 60, reason recorded) |
| 2 three distributions do not reproduce | re-measured from `d34040b` with a third instrument; **both** prior semicolon reports carried instrument artifacts (the first derivation's `&sect;` miscount produced the 11.1 max; the second review's own numbers carried the same entity gap, and this derivation's first pass leaked the JSX closer). Corrected numbers — 1.85–5.98, 10/12, no single covering marker — now in the calibration record, the voice document, and D6 |
| 3 thresholds fitted, reported as validated | stated as fitted, with the single-mark margins named, everywhere the numbers appear; "validation" language removed |
| 4 comparison corpus misdescribed | the limits (genre, era, length, chrome, one-author share, five-not-six outlets, three-not-four pre-ChatGPT) moved into the permanent calibration record; "technology journalism" corrected |
| 5 corpora not in the lint's format | disclosed in the calibration record with the measured size of the effect; moot as a gate risk — the lint no longer gates |
| 6 no demonstrated pass case | dissolved by decision, not by fixture: the lint is advisory (D3.5 reversed, maintainer's directive cited); the voice gate is the review verdict; the fail-then-breaker-then-empty-blog chain cannot start from a warning |
| 7 voice doc anchors maintenance to an archived path | corpora manifest moved to `openspec/style/blog-voice-calibration.md` beside the voice document (the education-static curriculum pattern); `design.md` cited as history only; task 3.7's pointer updated |
| 8 blocked streak has no witness | one normative clause in the loop delta: the build derives the consecutive-blocked count from the ledger into the published `/status.json` — observability without obligation; tasked |
| 9 drop records prove form, never rate | the scout requirement now says so in `would-cite`'s own idiom — the records make the check auditable, nothing measures the considered count; the 57% comparison moved to the delta preamble |
| 10 freshness window floats on the author's date | one sentence of honesty in the anchor requirement: the check guarantees internal consistency; absolute recency is held by `expires:` and review's dates check |
| 11 "exactly three" is four | preamble re-counted by word-diff and now discloses four, naming the budget-rationale sentence |
| 12 smaller | §7→§6 cite fixed; task 1.1 names the actual five review records and the two orphaned evidence files; `pulse/lib/corpus.mjs`'s comment referencing a deleted post handled in task 1.1; the scout cap reasoned at 60 (D9.2) |
