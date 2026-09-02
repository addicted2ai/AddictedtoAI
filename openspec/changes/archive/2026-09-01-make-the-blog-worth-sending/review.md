# Review — `make-the-blog-worth-sending`

Sealed review, 2026-08-30, by a fresh-context reviewer with no edit rights and
no authorship stake. Verdict: **fit to execute with named fixes.** The frame —
two named forms, each with its own finish line; a rate control moved from
counting posts to classing evidence; a queue producer for the news end and the
proposal channel for the synthesis end — is right, and is a better answer than
either position it arbitrates between. Nothing below is a redesign.

Four fixes must land **before §2 starts**, because they determine what the
producer is rather than how well it works. One more must land **before the blog
is called complete**, and it is the one that decides whether the change achieves
its stated purpose.

`review-phase1-sealed.md` beside this file is the reviewer's phase-1 findings,
written and committed (`751f99b`) before `design.md` was opened.

## Why this was run sealed, and what it bought

`design.md` holds the author's reasoning *and*, in §D8, its own list of what it
was least sure about. A reviewer who reads that first verifies the author's list
and finds nothing new.

The second reason is specific to this repository, and it paid: **a Desk executor
reads `tasks.md` and the deltas, never `design.md`.** So phase 1 held exactly
what an executing model holds, which is the realistic test of whether the
artifact is executable at all.

Four findings exist **only** because of the seal, and in each case it is
`design.md`'s own §D8 that would have closed the question prematurely:

| Finding | What §D8 says | What sealed measurement found |
|---|---|---|
| **A1** grouping key | D8.2: the key "may split or lump stories … both errors are cheap" | the key has **no value at all** for 60 of 90 lines — not imprecise, undefined |
| **A2** `event: false` | D2/D4 cite confident measurements taken from the very files involved | both price fields are **switched off** in the registry the design read for a different number |
| **A4** directive anchors | D8.3 hands you the syntax: `[anchored: <key>]` | that syntax exists **in no executable artifact** — not the delta, not `tasks.md` |
| **B6** queue starvation | D8.5: a busy repair week could **delay** a note past expiry | `QUEUE_CAP` **truncates** the candidate out of the file; delay is visible, absence is not |

Each of those reads as anticipated if you meet the design first. None of them is.

## What was re-measured rather than trusted

Every quantitative claim was re-derived from raw sources — never from the
change's own intermediate output.

| Claim | Independently measured | Held? |
|---|---|---|
| 90 lines in `data/changes.jsonl` | 90 | **yes** |
| 60 seeded `release` events, 2026-06-29 → 2026-08-24 | exact; all `kind: release`, all `seeded: true` | **yes** |
| 30 of those 57 calendar days carried ≥1 | 30 distinct dates, inclusive span 57 | **yes** |
| live diff: 2 retirements, 10 arrivals, 17 field changes, 1 annotation | exact by `kind` | **yes** |
| field changes = 8 input-price, 8 output-price, 1 status | exact by `field` | **yes** |
| 5 posts, 2026-08-14 → 2026-08-28 | front matter of all five | **yes** |
| `post` appears nowhere in `pulse/lib/queue.mjs` | `grep -c` = 0 **and** every `item()` call enumerated | **yes** (two methods) |
| `send` appears nowhere in the live `editorial` spec | whole 106-line file read | **yes** (exhaustive) |
| rank 35 sits below every `repair`/`verify` rank | reason→type map built from every `item()`; lowest is `overdue-fact-slow` = 45 | **yes** |
| every named file and symbol exists | all 8 checked, incl. `lib/render/blog.mjs:74` copy | **yes** |
| MODIFIED blocks restate live text unchanged | all 5 extracted, unit-split, normalised, compared | **yes — zero drift** |
| `openspec validate … --strict` | run: `Change '…' is valid` | **yes** |
| tree is green to build on | `npm test`: **489 pass, 0 fail** | **yes** |
| `proposals.mjs` exports 4 functions, **"all readers"** | 4 exports; `discardDuplicate` writes then `unlinkSync`s | **no** |
| `rejected/` is **empty** | holds a 440-byte `README.md` | **no** |
| **every** change line carries date, source URL, excerpt, kind | **89 of 90** (the annotation has neither) | **no** |

**Normative census.** The change estimates "roughly 30" against a 32-row table.
Measured: **37 normative sentences — 29 new, 8 restated verbatim**; one of the
29 is meta-prose, leaving **28 substantive new normative sentences against 32
rows.** All 28 map to a row; the 4 extras carry non-SHALL obligations. **No
untasked SHALL and no untasked MAY.** The brief predicted this is where changes
fail. This one does not.

## Land before §2 starts

### 1. The grouping key cannot group `release` lines — the first kind it names

**Survives. Sharper than D8.2, which anticipates the wrong failure mode.**

Task 2.1 groups by `(source, date, kind, vendor-prefix of row_id)`. Measured
over all 89 lines carrying a `row_id`:

| `kind` | `row_id` shape | count |
|---|---|---|
| `release` | UUID (`00a6e024-dee9-…`) | **60** |
| `arrival` / `field_change` / `retirement` | `vendor/model` | 29 |

**29 of 89 contain a `/`; 60 are UUIDs containing none**, and the `key` field is
no better (`seed|llm-releases|<uuid>`). The vendor exists only inside
`excerpt.source_name`, which the rule does not mention. Simulated over the
seeded history the rule yields **one candidate per line on all 30 days** — the
pulse delta's headline scenario ("three ids retired by one vendor … exactly one
candidate") is unsatisfiable for `release`.

Two further splits, measured in the live diff:

- **`kind` in the key splits one model's own day.**
  `deepseek/deepseek-v4-flash-0731` is an `arrival` *and* two price
  `field_change`s → **two** candidates for one model, one day, one source.
- **`~z-ai/glm-latest` groups apart from `z-ai/…`** — OpenRouter's variant tilde
  makes one vendor two.

Net on the live diff: **16 groups from 29 eligible lines, 9 of them singletons**,
and the day's two retirements become two stories because they are two vendors.

D8.2 prices the risk as "may split or lump … both errors are cheap, and the job
may write one note covering several groups." That is a fair answer to imprecise
grouping. It is not an answer to a key that cannot be computed.

**Fix:** derive the vendor from a field that exists for every kind, or state the
grouping property per-kind. Cheap either way — but it must be decided before
2.1 is written, not after.

### 2. Two of the three `field_change` fields the spec names emit nothing

**Survives, and is the finding the design's own numbers depend on.**

The pulse delta derives candidates from `field_change` "on material fields
(price, licence, status)". Measured against `data/sources/registry.json`, the
only registry:

| field | registered | emits change lines? |
|---|---|---|
| `price_input`, `price_output` | `openrouter-models` | **no — `event: false`** |
| licence | **no source declares one** | never |
| `status` | `openrouter-models` | yes |

`pulse/lib/diff.mjs:224` is the mechanism: `if (spec.event === false) continue;`

This is a decision the repository already measured (`addictedtoai-8ho`,
documented at `diff.mjs:49–60`): OpenRouter's price is *"one provider's posted
rate … with the top provider re-chosen on a rolling 30-second outage window"*,
the snapshots show one row moving "down 10.81% and then down another 10.56% in
20 hours", and the recorded conclusion is that **"a price line here is a routing
artifact wearing an event's clothes."**

**Verified by ordering, not inferred.** The 16 price lines were written by
`4edb269` at 2026-08-29 **01:35**; `event: false` landed in `9b229be` at
2026-08-29 **11:04** — 9.5 hours later. The lines are historical; the flag is in
force. Price changes will not recur.

So today the delta's `field_change` clause reduces to **`status` alone — one
line in the entire live history.** And `diff.mjs:380` anticipates
`addictedtoai-ak9` clearing the flag later, at which point price lines resume
and become news candidates **automatically, with no further review** — the spec
pre-authorises notes about the artifact.

The sting: **`design.md` D2's worked example of why grouping is needed is built
entirely on those 16 price lines** ("8 input-price and 8 output-price changes on
one day are not sixteen stories"), and D4 cites the same registry file for its
source count. The registry was read for one number and not for the `event` flags
beside it. The design measured the corpus at the one moment the machinery has
since invalidated.

**Fix:** name the kinds that actually emit, and state the dependency on the
registry's `event` flags where a later reader will meet it.

### 3. A directive has no way to declare an anchor — in any file an executor reads

**Answered in `design.md` D8.3, and nowhere else. This is the sealed finding.**

Task 3.1 classes "queue post candidates, and proposals/**directives** declaring
an anchor" as anchored. A proposal has front matter. A directive is a plain line
the maintainer types into `DIRECTIVES.md` — no front matter, no schema — and it
is priority 1 in `select.mjs`, the highest work source there is.

D8.3 resolves it cleanly: *"overriding it is one directive-line edit
(`[anchored: <key>]`)."* **That syntax appears in no spec delta and in no
task.** An executor holding `tasks.md` and the deltas has an undefined input to
the lane classifier on the maintainer's own channel, and both defaults are wrong
in a specific way: default-unanchored refuses his directive whenever one survey
published in the trailing 7 days; default-anchored makes "write me a survey" an
uncapped lane.

**Fix:** move `[anchored: <key>]` out of D8.3 and into the blog delta and task
3.1. One sentence, and the finding closes.

### 4. Task 2.2 requires a fixture the schema forbids

**Survives — the design does not mention drafts at all.**

Task 2.2 requires a test that *"a draft post (`draft: true`) suppresses
nothing."* `lib/schema.mjs:311` — `postSchema` is `.strict()` with exactly
`title`, `date`, `mentions`, `corrections`. **A post carrying `draft: true`
fails the build**, so the fixture cannot exist. Task 1.1 adds `covers:` and
`anchor:` and does not add `draft:`.

Measured: `draft` occurs in exactly one non-test source file across `lib/`,
`loop/lib/` and `pulse/lib/` — `loop/lib/surfaces.mjs:48`, a defensive check
against a flag the schema has never permitted. Tasks 1.1 and 2.2 contradict; one
must move.

## Land before the blog is called complete

### 5. The uncapped lane is escapable by front matter — the load-bearing claim fails

**Survives. `design.md` does not answer it; D7 makes it more likely.**

This is the claim the change rests on, stated in D3: *"the one publishing lane
with no count ceiling is the lane whose admission ticket is evidence the author
cannot create"*, and in the delta: *"a capacity glut can manufacture surveys at
will, but it cannot manufacture events."* Attacked as instructed. It does not
survive.

Three specified facts compose:

1. **Form is defined by the anchor, not the content.** "A post declaring no
   anchor is a synthesis." So a survey declaring `covers:` is definitionally a
   news note — a reclassification, not a violation to catch.
2. **Nothing forbids a synthesis declaring `covers:`** — and a synthesis "SHALL
   rest on enumerable dated evidence", which is what `data/changes.jsonl` is.
3. **The published set is classed by front matter alone** (delta; task 3.1
   counts only posts with "no `covers:`/`anchor:` front matter"), and task 1.2's
   build check asks only that the reference **resolve to a line** within 7 days
   — never that the post is *about* it.

So a survey naming one recent feed line is anchored, refused by no count
ceiling, and **does not count against the 1-in-7** — so it does not block the
next one either. The manufacturable genre becomes uncapped by adding one
front-matter key whose only test is that a real line exists. There are 90.

D7 rejects exclusive coverage — *"the join exists to stop candidate re-issue,
not to forbid a synthesis from citing events its notes covered. Suppression, not
exclusivity"* — which is correct on its own terms and positively encourages the
behaviour that opens the hole. The design reasons about the **admission
ticket**; the gap is in the **turnstile**.

**What survives the attack, and deserves saying:** `covers:` is genuinely
unforgeable. It resolves against a file only the model-free Pulse writes, and an
unresolved reference fails the build. The defeated claim is not "the anchor is
real" — it is "the anchor selects the genre."

**Fix, cheap:** class the published set by the same rule the selector uses (work
source), or require an anchored post to declare its form explicitly and let
`covers:` be evidence rather than classification. The mechanism is right; the
classifier is reading the wrong field.

### 6. Dropping the ceiling to 1 makes the existing corpus warn, permanently

**Survives.** Measured by running `lib/posts.mjs`'s own `ceilingBreaches` over
the real five posts, then re-running its window logic at the proposed constant:

| ceiling | breach windows on today's corpus |
|---|---|
| 3 (today) | **0** |
| 2 | 1 |
| **1 (proposed)** | **2** — (08-14→08-17, 2 posts) and (08-25→08-28, 3 posts) |

All five are unanchored (front-matter keys today are exactly `date, mentions,
title`), so all five count. `npm run build` goes from zero post-ceiling warnings
to two, on history legal under the rule in force when it was written, and they
can never be cleared — the five are honest syntheses with no anchor to add.
Task 3.2 specifies fixture tests only; task 1.2 checks the real corpus, but for
the anchor rule.

D8.1 shows the author looking at exactly this corpus ("the licence piece and the
retirement piece landed 8 days apart") without noticing the build consequence.

**Fix:** grandfather by date, or accept it and say so. A permanent warning nobody
can clear trains readers to ignore the class.

### 7. The ceiling exists as two independent constants

**Survives.** `lib/posts.mjs:20` `POST_CEILING = 3` (build warning) and
`loop/lib/config.mjs:56` `BLOG_CEILING_POSTS = 3` (selector) — two copies, equal
by coincidence, in two of the five components CLAUDE.md calls "five things, and
the boundaries between them are the design". Task 3.1 changes one, 3.2 the
other; nothing tests that they agree, and there is no shared module to import
from without `lib/` depending on `loop/`. A miss makes the build report 3-in-7
while the selector enforces 1-in-7 — divergent in the direction that hides
over-publishing.

### 8. The anchor is never rendered

**Survives — absent from the design entirely.** The delta's finish line for a
note is that the reader knows what happened, what changes for them, **"and where
the primary evidence is."** `lib/render/blog.mjs:42` `renderPostPage` renders
title, date, body, corrections. No task adds anchor rendering; the only render
edit in the change is task 3.2's index copy at line 74. The anchor is schema'd,
build-checked and review-fetched, then invisible — the evidence reaches the
reader only if the author separately writes the link into prose, which nothing
requires.

**Credit where it is due:** front-matter URLs *are* covered by the Pulse's
rolling external link check. `pulse/lib/corpus.mjs:120` `extractLinks` walks
`file.data` recursively for `https?://`, and `corpusLinks` includes
`corpus.prose`. A fabricated `anchor.url` that 404s surfaces as a `broken-link`
repair. The **liveness** half is mechanical; only **aboutness** rests on the
reviewer, which D3 already concedes ("a URL is claimable").

### 9. The staleness check launders old news, and is one-sided

**Survives.** The rule fails a post whose **newest** declared anchor precedes
its `date` by >7 days. Reading the *newest* means a post about a six-month-old
event passes by additionally declaring one fresh line — the aggregation choice
defeats the stated purpose ("a 'news' note about a stale event is mislabeled").
Use the oldest load-bearing anchor, or require all declared anchors inside the
window. Separately, only one direction is checked: a post dated 2026-09-01
declaring an anchor dated 2026-12-01 builds clean.

### 10. "The blog remembers itself" degenerates into "link the previous post"

**Survives.** The delta makes this a SHALL and defines subject-sharing as
**mention overlap**. Measured over the five real posts (46 distinct mentions, 10
pairs):

- **6 of 10 pairs share ≥1 mention (60%).**
- Applying the rule in date order, the required link is **the immediately
  previous post in 3 of the 4 cases** where any link is required.
- One is compelled on a single shared mention, `org/openai`, joining a post about
  knowledge-cutoff definitions to a post about open licences.

No threshold, no relevance test: on this corpus the requirement produces a
chain, not a thread. D7 calls prior-post linking "the cheap 80%" of prediction
tracking, which is the framing that skipped the check. Requiring overlap on
subject entities, or ≥2 non-organisation mentions, or making it a MAY that review
judges, all fix it.

### 11. `QUEUE_CAP` truncates from the bottom, and post candidates sit second-lowest

**Survives — D8.5 anticipates delay, not absence.**
`pulse/lib/queue.mjs:238` slices to `QUEUE_CAP = 50` **after** a rank-descending
sort. At rank 35 post candidates are the second-lowest class in `RANKS` (only
`want-eligible-mint` at 30 is lower), so they are among the first dropped when
the queue fills — and since candidates expire at 7 days and the queue has no
memory, a dropped candidate is **gone, not deferred**. With `select.mjs` taking
exactly one job per run (`floor.candidates[0]`), queue position is the real
bound on the anchored lane, not the budget.

D8.5's lever list — "the rank, the window, or the Desk schedule" — is the right
list for a *delay*. It does not reach a candidate that never appears in the file
task 5.2 measures. Measured today: `total_before_cap` is **0**, so nothing is
truncated now, and nothing in the change measures it later.

### 12. Self-amplification is blocked at one hop, under a title claiming more

**Survives.** Task 4.3 discards a proposal whose stamped origin type equals its
proposed type — blocking `post` → `post`. It does not block
`post` → `interpret` → `post`, and D6 blesses the second leg as "the designed
path and the entire point". With 3-day cooling per hop the cycle is ~6 days:
bounded, not closed. The mechanism does what its sentence says; the
requirement's *title* claims more. Widen the check or narrow the title.

## Answered by the design, and answered well

Recorded so the maintainer knows these were examined and closed, not missed.

- **The instrument the maintainer rejected was kept and tightened.** D4 and D8.1
  meet this head-on: they concede the ceiling counts the wrong variable, argue
  that a pure bar is an instruction and this repo prefers mechanisms, keep one
  control that does not depend on the judge, and explicitly invite the
  maintainer to set the constant at 2 before execution. That is the right way to
  handle a disagreement with the person you are building for. It still wants his
  ratification — but the argument is made, not assumed.
- **The aperture deferral.** D7 and D4 name it as the right lever, measure why
  ("1.05 events/day, 53% of days"), route it to its own issue per the deferral
  rule, and decline to bundle operational tuning into a spec change. Correct on
  every count. One measurement to add: the two registered sources are not
  equivalent — `openrouter-models` wrote **29 of the 30** live lines, while
  `llm-releases` declares **no material fields at all** and contributes only
  seeded `release` rows. Combined with finding 2, today's live news aperture is
  `arrival`/`retirement`/`status` on a single model registry.
- **`addictedtoai-3zf`** is named in D6 as a partial answer — correctly. The
  residue: `tasks.md` §5.3 files two new issues and does not mention updating
  3zf, and `design.md` is itself archived, so a note living only there is a note
  inside something finished. One line in 5.3 fixes it.
- **A separate news surface, noteworthiness scoring in the Pulse, a cadence
  floor, routing notes through proposals, annotation-triggered notes, exclusive
  coverage, prediction tracking, a `news` job type.** All eight rejected in D7
  with reasons that hold up. The `interpret`-annotation rejection is
  particularly good: it names the latency and the window mismatch rather than
  waving.
- **The external anchor is weaker than the feed anchor.** D3 says so plainly
  rather than claiming parity — which is why finding 8's credit belongs to the
  design as much as the code.

## Accuracy defects in the change's own evidence

The change is unusually well measured, which makes the misses worth naming
precisely.

- **"Exports exactly four functions, all readers"** (proposal §2, `loop` delta
  preamble). `discardDuplicate` (`proposals.mjs:146`) does `writeFileSync` then
  `unlinkSync`: three readers and one mover. The load-bearing claim — **none of
  them creates a proposal** — is true, and is what D2 correctly says
  ("producing side never built"). The design is more careful here than the
  proposal.
- **"An empty `rejected/`"** — it holds a 440-byte `README.md`.
- **"Every line carries a date, a source URL, an excerpt and a kind"** — 89 of
  90. Harmless (annotations are excluded by design), but "every" is the word.
- **Task 1.3's "kept verbatim"** quotes `brief.mjs:83` with a straight
  apostrophe; the source has a curly one (`enthusiast’s`) and different wording.
  Measured: `enthusiast’s` occurs once in `brief.mjs`, zero times in `tasks.md`;
  the reverse for the straight form. An executor searching for the task's string
  finds nothing — the literal-substring false-absence trap, inside a task whose
  instruction is "verbatim".

## Archive traps

`openspec archive` promotes requirement blocks into reserved `openspec/specs/`
verbatim, checking only that tasks are complete. Verified: **delta preambles are
not promoted** (live specs carry `# … Specification` / `## Purpose` /
`## Requirements` only), so the `loop` preamble's inaccuracy above stays out of
the reserved path. Everything inside a `### Requirement:` block does not.

- **The blog requirement ends** *"deliberately tighter than **the 3-in-7 ceiling
  it replaces**"* — inside the requirement body, so it becomes permanent text in
  a path no job may correct, referring to a rule that by then exists nowhere.
- **The proposal's clean bill is about paths, and the trap here is data.**
  *"Nothing anchors a permanent requirement to a path archiving moves"* is true
  — I checked; no delta references `openspec/changes/…`. But the pulse
  requirement anchors a permanent obligation to a **data-defined field set**
  (price, licence, status) living in `data/sources/registry.json`, whose own
  header says *"Adding or removing a source is an ordinary data change, not an
  OpenSpec change."* Finding 2 is that trap already sprung **before** archiving:
  an ordinary data edit has already emptied two of the three fields. After
  archiving, the stale text is unfixable.

## What the change gets right, said as plainly as the defects

- **It measured what it claimed.** Every headline count re-derived exactly from
  raw JSONL — 90 lines, 60 seeded releases over 2026-06-29→08-24, 30 of 57 days,
  30 live lines splitting 2/10/17/1 with the field breakdown 8/8/1. Four
  independent figures, all exact. The three misses are qualifiers around correct
  numbers, not wrong numbers.
- **The traceability table is real and over-complete** — 32 rows against 28
  substantive new normative sentences, no untasked SHALL, no untasked MAY.
- **The MODIFIED restatements are clean.** Five requirement blocks compared
  unit-by-unit against live text with zero unrelated drift. That is the
  discipline that keeps a spec from rotting, and it was done.
- **The diagnosis is the hard part and it is right.** "You cite a reference; you
  send a story" identifies a real defect in the live editorial spec — verified,
  `send` occurs zero times in all 106 lines of it — and the two-forms split with
  separate finish lines is a better frame than any rate control. Adding
  would-send rather than replacing would-cite is the correct call for the reason
  D5 gives.
- **`covers:` is a genuine mechanism**, not an instruction: a reference into a
  file only the model-free Pulse writes, unresolved references failing the
  build. Finding 5 defeats the genre claim built on top of it, not the anchor.
- **`blocked: not worth a note` as a success** is the single best idea in the
  change. It puts the worthiness question where judgment lives, keeps the Pulse
  free of scoring, and makes declining to write the normal outcome rather than a
  failure — which is what actually prevents slop, more than any ceiling does.
- **It declines to write content**, keeps `package.json`, `data/config.json` and
  `runners.yml` untouched, and correctly places the ceiling constants in code
  per `data/README.md` — which I checked says exactly that.

## Not findings

D8's five items are all real uncertainties, honestly recorded. Items 1
(the 1-in-7 constant) and 4 (the send test resisting mechanisation) are
correctly analysed and need no action beyond the maintainer's call on the
constant. Items 2, 3 and 5 are correctly *identified* and, as findings 1, 3 and
11 show, land one step short of the mechanism in each case — which is the
clearest evidence I can offer that sealing the review was worth doing.
