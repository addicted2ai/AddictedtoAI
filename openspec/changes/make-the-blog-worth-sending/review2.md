# Review 2 — `make-the-blog-worth-sending` (revised)

Second sealed review, 2026-08-30, by a fresh-context reviewer with no edit
rights and no authorship stake. Phase-1 findings are in
`review2-phase1-sealed.md`, written and committed (`fe4179b`) before
`design.md`, `review.md` or `review-phase1-sealed.md` were opened.

**Verdict: fit to execute with named fixes.** The frame is right and is better
than the draft it replaces — a deterministic trigger in the Pulse, judgment in
the Desk, a cap that binds on files rather than on behaviour, expiry instead of
backlog, two forms with separate finish lines. Nothing below is a redesign.

**One fix must land before execution starts** (§2.1's config edit, which the
machinery cannot repair afterwards). **Four must land before §3**, all in the
voice work, which is where this revision put its weight and where the evidence
does not carry it. **Four more before the blog is called complete.**

---

## The one-paragraph version

The previous review defeated the draft's load-bearing claim. This revision
disposed of nearly every finding, and it disposed of them honestly — mostly by
deleting the machinery the findings were about. But deleting that machinery
moved the weight onto a **new** load-bearing mechanism, the voice lint and its
two-corpus calibration, which no prior review has examined. That is where I
attacked, and it is where the defects are. The good news is bounded: the lint
*test* the tasks specify will pass, and the human side of the calibration
generalises to a fresh corpus I chose myself. The bad news is that the reported
distributions do not reproduce, the thresholds are fitted to the two samples
they are reported as validated on with margins of a single punctuation mark, and
nothing anywhere demonstrates that a post this system can write is able to pass
the gate that will fail its build.

---

## What was re-measured rather than trusted

Every number re-derived from raw sources — the JSX at `d34040b`, the live
`data/*`, the live `openspec/specs/` — never from the change's own intermediate
output. The one exception is flagged in §"provenance" below and is not used to
support any conclusion.

| Claim | Independently measured | Held? |
|---|---|---|
| twelve predecessor posts at `d34040b` | 13 files under `app/blog`, one is the index | **yes** |
| AI corpus "19,017 body words" (D6) | **18,999** by my own extractor — 0.09% apart | **yes** |
| "13.0 em-dashes per 1,000 words" (proposal) | 248 ÷ 18,999 = **13.05** | **yes** |
| em-dashes "range 5.0–21.6", "9/12 > 10" (D6) | 4.93–21.14; **9/12** | **yes** |
| em-dash "w-avg 13.3" (D6) | 13.05 | **yes** |
| self-narration "10/12 posts ≥ 1" (D6) | **10/12** (max 23, D6 says 22) | **yes** |
| What/Why/How "22 of 76 headers", "fires 5/12", "12/12 posts ≥ 1" (D6) | **22 of 76**, **5/12**, **12/12** | **yes, exactly** |
| focal family "human max 1.3/1k" (D6) | 1.32 | **yes** |
| human sample "tops out at 2.1" semicolons | 2.14 | **yes** |
| human corpus "16,480 body words" (D6) | 16,333 | **yes** |
| composite: the lint fires on all twelve | **12/12** | **yes** |
| semicolons "min 2.7, max 11.1" (D6) | **1.84 – 9.39** | **no** |
| semicolons "fires on 12/12", "strongest separator" | **9/12**; third strongest | **no** |
| semicolons "med 4.2" (D6) | median **3.17**; aggregate 4.21 | **no (median)** |
| em-dashes "median 15.9" (`blog-voice.md` §3) | **14.36** | **no** |
| the lint fires on none of the human sample | **8 of 9** — one fires | **no** |
| lint fires on all five live posts (the §1-before-§3 rationale) | **5/5** | **yes** |
| `posts: 2` at `verify-launch.mjs:88` | read | **yes** |
| ceiling symbols in the five named files + call site | grep; `lib/site.mjs:68` | **yes** |
| `corroboration` 68, `listing-verification-due` 60, 62 free | `pulse/lib/queue.mjs:35–63` | **yes** |
| `loadConfig` throws on a type without a cap | `loop/lib/config.mjs:99–102` | **yes** |
| `proposals.mjs`: four exports, three readers one mover, none creating | grep + read | **yes** |
| `postSchema` is `.strict()` | `lib/schema.mjs:311–320` | **yes** |
| `lib/render/blog.mjs` carries the "three in any seven days" copy | line 74 | **yes** |
| feed supports a `{key, date}` join; annotations carry no event | 90 lines, 89 with `key`, exactly 1 annotation | **yes** |
| the selector sheds by config **category** (traceability row / task 2.1) | `budget.mjs:371` reads `shed.exclude_types` | **no** |
| loop delta's "deliberate edits … are exactly three" | word-diff of all MODIFIED blocks vs live | **no — four** |
| D8: "no spec text anchors to registry field sets any more" | two requirement bodies still say price/licence/status | **no** |
| D8: comparison prose "not in requirement bodies" | two requirement bodies carry it | **no** |
| `npm test` | ran it | **489 pass, 0 fail** |
| `openspec validate … --strict` | ran it | **valid** |
| autonomy invariant | swept all five deltas | **holds** |
| model-free invariant | ran `verify-zero-model.mjs` | **holds** (exit 0) |

**Fairness note on the corpus rows.** Of D6's six lint rows, four reproduce
essentially exactly — em-dash, self-narration, What/Why/How headers, focal
family — and one (bold-lead lists) is untestable on JSX. **One row is the
outlier: semicolons.** This is not diffuse sloppiness. It is one row, and it
happens to be the row carrying the change's two strongest claims about the
lint ("fires on 12/12", "the strongest separator measured", "semicolon density
alone covers all twelve").

Two things that looked like defects in phase 1 and are not, recorded so nobody
re-derives them: task 2.2's coverage-join fixture needs `covers:` before the
schema learns it in 3.4, but `pulse/lib/corpus.mjs` does not validate schemas,
so the Pulse-side fixture parses; and I suspected asymmetric entity decoding
between the corpora, which would have manufactured the em-dash ceiling — there
are **zero** surviving dash entities in the human files.

---

## Land before execution starts

### 1. The reserved-path config edit is incomplete, and no Desk job may repair it

**Survives. `design.md` D9.2 discusses this config edit and does not reach it.**

D9.2 names two additions — a `scout` wall-clock cap and `scout` in the
new-writing category — and frames the item as closed ("a property of the
reserved-path rule, not a runtime human dependency"). Task 2.1 instructs exactly
those two. The traceability table then claims `scout` is shed at level 1 by
"2.1 (selector reads config categories)".

Measured: the selector does not read categories for shedding.

```
loop/lib/budget.mjs:371  export function degradationGate(cfg, shed, candidate) {
                    372    if (shed.exclude_types.includes(candidate.type)) {
```

`data/config.json` supplies three literal arrays — level 1 `["post","education"]`,
level 2 `+["entry","tutorial"]`, level 3 `+["prune","machinery"]`. Categories
are read by the budget *ceiling* and by nothing else. So without `"scout"` added
to all three `exclude_types`, the loop delta's own sentence — *"new
`post`/`education`/`scout` first … at 3 or more, only `verify`, `repair`, and
material-field `interpret` remain selectable"* — is unimplemented, and `scout`
stays selectable at every shed level including the third.

Why before execution rather than during: `data/config.json` is reserved. A Desk
job that edits it writes `HOLD.md` and stops. Task 2.1's orchestrator edit is
the only moment the plan provides for correcting it. An incomplete edit leaves
the autonomous machinery unable to fix its own capacity-shedding, which is
precisely the class of thing the reserved-path rule exists to keep out of a
job's hands — and therefore out of its reach.

**Fix:** name the three `exclude_types` edits in task 2.1, and correct the
traceability row, which is a false statement about the code.

---

## Land before §3 — the voice work

The blast radius is narrower than it looks, and I want that on the record before
the defects: **the lint test task 3.7 specifies will pass.** It asserts that
each of the twelve posts fires *at least one* marker and that none of the nine
human pieces fires. The first is true under my measurement. The second is true
under the author's extraction and fails only on a chrome artifact under mine.
What fails is the account of *why the thresholds are where they are* — and that
account lives in `openspec/style/blog-voice.md`, the permanent artifact this
change adds, the document every future writer is told to write to and every
recalibration is told to work from.

### 2. Three reported distributions do not reproduce, and the denominators agree

**Survives, and the seal is what made it findable.**

My extractor walks the JSX, keeps text nodes and string-literal expressions,
decodes entities, and counts. Two independent checks say it is the same
extraction the author used: it yields **18,999** words against D6's stated
**19,017** (0.09% apart), and it reproduces `proposal.md`'s aggregate em-dash
figure to three significant figures — **13.05** against 13.0. Same denominator,
same method. On that footing:

| D6 / `blog-voice.md` §3 | measured |
|---|---|
| semicolons "min **2.7**, max **11.1**" | **1.84 – 9.39** |
| semicolons "fires on **12/12**" | **9 of 12** |
| semicolons "the strongest separator measured" | third — self-narration fires 10/12 |
| semicolons "med 4.2" | median **3.17** (4.21 is the corpus *aggregate*) |
| em-dashes "median 15.9" | **14.36** |

The three posts under the semicolon threshold are `chatgpt-ads` (1.84),
`frontier-cyber` (2.20) and `gemini-3-7-flash` (2.36).

I tried to reproduce the reported figures rather than assume they were wrong,
because an extraction disagreement is a different finding from a wrong number.
Six variants:

| variant | semicolons/1k | fires |
|---|---|---|
| full prose text | 1.84–9.39 | 9/12 |
| minus the post-meta line | 1.86–9.43 | 9/12 |
| minus the Sources section | 1.01–6.24 | 7/12 |
| minus both | 1.02–6.27 | 7/12 |
| naive tag-strip of the **whole file** | 5.74–14.99 | **12/12** |
| counted before entity decoding | 49.50–87.32 | 12/12 |

Only the whole-file strip yields 12/12, and it does so by counting the
JavaScript above the JSX — `import` statements, `const` declarations, the
JSON-LD object literal — as prose. I also tested whether undecoded entities
could explain the gap (each entity ends in `;`); no single entity class
reproduces D6's shape. **I could not construct any method that yields
2.7–11.1 while preserving the 19,017-word denominator D6 states**, so I report
the discrepancy without asserting its cause.

The consequence for the change is bounded and specific: D6's own summary that
*"semicolon density alone covers all twelve"* is false. The composite 12/12
holds only as a union, and one post — `frontier-cyber` — is carried by a single
marker, the What/Why/How header count, which D6 itself describes as "kept
conservative singly". The 12/12 has a single point of failure at one document.

### 3. Every threshold is fitted to the sample it is then reported as validating on

**Survives. D6 concedes "the thresholds carry margins" and never states them.**

`blog-voice.md` §3 says each threshold was "measured, not chosen … so that each
marker fires on the former and on none of the latter", and D6 heads the result
"**Two-direction validation** of the assembled lint". That is a description of
fitting a decision boundary to a two-class sample and then reporting the fit as
a validation. Measured slack, in whole tokens, because a document cannot contain
half a semicolon:

| document | needs, to flip |
|---|---|
| `verge-gpt4-launch-2023` (human) | **+1 semicolon** to fire |
| `willison-gpt4-barrier` (human) | **+1 em-dash** to fire |
| six of the nine human pieces | +2 semicolons or fewer |
| `ultrafast-mode` (AI) | **−1 semicolon** to pass |
| `gpt-5-6-price-drop` (AI) | **−1 em-dash** to pass |

The honest generalisation claim is therefore much weaker than "12/12 and 0/9":
*on the two samples the thresholds were drawn from, the thresholds separate
them, in the closest cases by a single punctuation mark.* That is worth having.
It is not evidence that the markers separate AI writing from human writing in
general, and the spec's normative sentence — promoted verbatim into
`openspec/specs/` on archive — asserts the stronger thing.

### 4. The comparison corpus is not what the permanent document says it is

**Partly answered by the design, and the part that survives is in the wrong
document.**

Credit first, because D6 is more candid than I assumed while sealed. It names
`simonwillison.net` openly in its table, and states three limits in its own
words: *"one author (Willison) contributes 48% of the human words; the corpus is
nine pieces, not ninety; and prose extraction from live HTML is approximate."*
I verified the 48% (7,969 of 16,480). That is the disclosure the method
obligation asks for, and it is there.

What survives is that **none of it reaches `openspec/style/blog-voice.md`**,
which is the document that outlives the change and that §3 offers as the record
of the calibration. It calls the sample "a nine-piece human sample of technology
journalism on the same beat". Measured:

- **Two of nine are not journalism** — `willison-llms-2024` and
  `willison-gpt4-barrier` are a personal technical blog.
- **Not length-matched.** 527–7,003 words against the AI corpus's 846–2,489.
  `willison-llms-2024` alone needs +16 semicolons and +25 em-dashes to fire; a
  large denominator suppresses every density in the set.
- **Not era-matched, and this is not disclosed anywhere.** The negative corpus
  is entirely August 2026. The human sample is 2020, 2020, 2021, 2023, 2023,
  2024, 2025 — none from 2026.
- **Two counts in D6 are off.** "six outlets" — I count **five**
  (simonwillison ×2, The Verge ×4, Ars, TechCrunch, MIT Tech Review). "four
  pieces pre-ChatGPT" — I count **three** (Verge GPT-3 2020, Verge Copilot 2021,
  MIT TR 2020).
- **At least one file carries site chrome.** `techreview-gpt3-2020` opens with
  the nav rail twice over, closes with two *other* articles' headlines and a
  newsletter solicitation, and carries an undecoded `won&#x27;t`. Chrome inflates
  the denominator and deflates every rate — and it trips a marker: "Deep Dive",
  MIT Technology Review's section label, fires the zero-tolerance register guard,
  against §3's "None of these fire on either corpus today."

**Fix:** move the limits D6 already states, plus the era and genre mismatch, into
`blog-voice.md` §3, and stop calling all nine "technology journalism".

### 5. Neither calibration corpus is in the format the lint will run on

**Survives. D6 addresses extraction twice and never addresses format.**

The negative corpus is JSX. The human sample is news HTML. The lint runs on
Markdown in `content/blog/`. Every threshold is a ratio whose denominator is
"words after extraction", and §3's exclusion rule — "counted outside code
fences, blockquotes, and dated correction blocks" — is markdown-shaped and
cannot have been applied to either calibration corpus, neither of which has a
code fence or a markdown blockquote. D6 concedes the problem for exactly one
marker (bold-lead lists: "not measurable in news HTML … stated as such"); the
same concession is owed to every density threshold. The size of the effect is
the variant table in finding 2: extraction choice alone moves the semicolon
result from 7/12 to 12/12.

### 6. The lint has no demonstrated pass case, and the available evidence says the author model cannot reach it

**Survives, unanswered anywhere in the design, and it is the finding I rank
highest.**

D6 frames the absence of a positive exemplar and says the "compensation is
threefold": the voice document defines the voice on its own terms, the lint is
calibrated both ways, and review judges the rest. None of those three is a
demonstration that a post this system can write passes the gate. Task 3.7's
validation proves the lint **rejects** twelve documents and **spares** nine.
Nothing proves it **admits** anything.

I ran my implementation of §3's closed list over everything long-form in this
repository that the house model wrote:

| corpus | fires |
|---|---|
| the five live blog posts | **5 of 5** |
| the eleven live `content/learn/` pages | **11 of 11** |
| this change's `proposal.md`, `tasks.md`, two spec deltas | **4 of 4** |
| `CLAUDE.md`, `AGENTS.md`, `teach-the-whole-subject/review.md` | **3 of 3** |
| **`openspec/style/blog-voice.md` itself** | **fires, on six markers** |

The voice document runs **14.97 semicolons per 1,000 words against the 2.5 it
sets, and 19.05 em-dashes against the 10 it sets** — six times and roughly twice
its own limits. (Its focal-word and self-narration hits are quotation artifacts;
the punctuation rates are not.) `tasks.md` runs 36.25 semicolons/1k, nearly four
times the *negative corpus's* maximum of 9.39.

The generous reading — a blog post is a different register from a spec, and the
model is being told to write differently — is fair, and I hold it open. But D3.5
chose fail-don't-warn on a specific premise: *"the marker list is closed,
calibrated, and quote-exempting, so a legitimate use has an escape (blockquote,
correction block) that a warning would not need."* That premise assumes the
markers fire only on illegitimate use. Fifteen of fifteen documents by the same
model say otherwise, and none of them can reach for a blockquote to fix a
semicolon rate.

Chain it against the autonomy the maintainer asked for. A post job writes; the
build fails on the lint; the job ends `failed`. Three consecutive `failed` post
jobs trip breaker 1 and stop `post` work. The scout keeps filing candidates that
expire unselected and sweep to `dropped/`. The blog stays empty. Every component
reports success at its own contract, no statement anywhere is false, and nothing
surfaces it (finding 8).

**Fix, and it is one task line:** add to 3.7 a third assertion — at least one
purpose-written fixture post, in the target voice, that the lint **passes** —
and write it before the thresholds are frozen. If it cannot be written, that is
the finding, and now is when it is cheap.

### 7. The permanent voice document anchors its own maintenance to a path archiving moves

**Survives, and it is sharper because the author demonstrably knew this trap.**

`openspec/style/blog-voice.md:85–87`:

> The distributions, the corpora, and the derivation method are recorded in the
> `make-the-blog-worth-sending` change's `design.md`; recalibrating means
> re-running that derivation on a new corpus, never re-deciding a number by hand.

Task 3.7 likewise sends the executor to "`design.md` D6" for the human sample's
sources and retrieval dates.

Measured, not reasoned: `openspec archive` moved `build-initial-site` to
`openspec/changes/archive/2026-08-30-build-initial-site/`, `design.md` included.
So within one archive cycle the permanent document's only pointer to its own
evidence — and its only sanctioned route to changing a threshold, since it
forbids re-deciding by hand — points at a path that no longer exists.

The document's own opening paragraph explains why it does not live under
`openspec/changes/`: "archiving moves a change's own files". D8 carries two
archive-trap rows. The lesson was applied to the document's location and not to
its references.

**Fix:** move the corpora manifest — sources, retrieval dates, per-document
measured values — into `openspec/style/` beside the voice document, and cite
`design.md` as history only.

---

## Land before the blog is called complete

### 8. `blocked: nothing cleared the bar` is invisible to every detector in the loop

**Survives as reframed. D7 rejects a cadence floor, correctly, and that is not
what this asks for.**

The prior review called `blocked:` "the single best idea in the change" and I
agree. My finding is that it has no witness. Measured in the two modules that
could provide one:

- `loop/lib/breakers.mjs:10` — "an empty queue ends a run normally, and a
  `blocked:` result is a success". Breaker 1 counts "only `failed` and
  `discarded` — blocked, interrupted, capacity and abandoned outcomes are"
  excluded.
- `loop/lib/health.mjs:81–90` — `noOutputStreak` counts trailing lines whose
  `signal === 'no-output'`, i.e. the *runner* produced nothing. A scout that
  runs, thinks and writes a `RESULT.md` beginning `blocked:` has produced
  output, so it **ends** the streak.

Nothing aggregates blocked outcomes. A scout returning `blocked:` daily for a
year trips nothing, and every spec sentence correctly instructs everyone not to
treat it as a failure. Combined with finding 6, the system's cheapest stable
equilibrium — scout runs, blocks, blog stays empty — is indistinguishable from
the design working.

**Fix, and it is not a floor:** record the blocked streak where a later job or a
person can read it. `data/status.json` already exists and the prebuild already
writes it. Observability without obligation.

### 9. The drop record proves form, never rate

**Survives. D2's own analogy is what breaks it.**

D2 argues the drop records make the bar auditable, citing the predecessor:
"44 filed over 9 active days, 25 dropped, each with a `## Dropped` section
naming its test". On the predecessor the docket held the **denominator** — 44
candidates, independently filed, so 57% is computable. Here **nothing measures
how many stories the scout considered.** A scout that sweeps forty sources,
files three and writes zero drop records has, by its own account, declined
nothing; the review checklist's "every declined story has a drop record" is
vacuously satisfied. A scout filing three weak candidates with three pro-forma
drop records is byte-indistinguishable from a diligent one.

So `proposal.md`'s "The cap and the drop records are mechanisms at the merge,
not instructions" is half true, and it is the less important half. The **cap** is
a mechanism, and it binds only against overfiling — the failure nobody fears.
The **bar** — "I want the bar to be high" — is an instruction to a model checked
by another model. That is a legitimate design here, and the repository says so
plainly about `would-cite`. It should say so here too, rather than offering the
drop records as proof they cannot supply.

### 10. The anchor's freshness window floats on a date the author chooses

**Survives, minor. D3.3 fixes what the prior review found; this is beside it.**

The build compares each declared anchor against "the 7 days ending on the post's
own `date`". Post dates are validated by `isoDate` (`lib/schema.mjs:130–133`) —
format and calendar reality only. I grepped `lib/schema.mjs`, `lib/posts.mjs`
and `lib/build-content.mjs` for any future-date or recency guard: **none
exists.** So the pair (post date, anchor date) moves together and the check still
passes; a post dated 2026-01-15 with an anchor dated 2026-01-14 builds cleanly
forever. In practice the scout's 7/14-day `expires:` keeps candidates fresh, so
this is a gap between what the check guarantees and what the prose around it
implies, not an open door. One sentence of honesty in the spec, or one line
comparing the post date to the build date.

### 11. The loop delta's "exactly three" disclosure is one short

**Survives, minor.** I word-diffed every `## MODIFIED Requirements` block against
the live text. All three disclosed edits are present and exactly as described,
and everything else is the requirement's declared purpose — **except one**.
"Spending is budgeted in model-minutes" also gains:

> `scout` spends from the new-writing share deliberately: discovery is the first
> stage of writing, and when writing is over its ceiling, finding more to write
> is the first thing to stop.

Good reasoning; I would keep it. It is still a fourth edit inside a restated
block, in a document that says there are three, and it will be promoted verbatim
into `openspec/specs/`.

### 12. Smaller

- `specs/blog/spec.md:3` cites "`tasks.md` §7"; the traceability table is **§6**.
- Task 1.1's five `data/reviews/seed-*.md` records all exist and the glob is
  right, but only three carry the `seed-blog-` prefix; the other two are
  `seed-same-catalog-same-day.md` and
  `seed-reference-urls-that-still-return-200.md`. It also misses
  `data/reviews/evidence/post-same-catalog-same-day.md` and
  `post-reference-urls-that-still-return-200.md`. I checked whether that matters:
  no code joins that directory (the only reference anywhere is a brief string at
  `loop/lib/brief.mjs:62`), so these are orphans, not false alarms — but the task
  asserts "nothing else references them".
- `pulse/lib/corpus.mjs:65` names
  `content/blog/reference-urls-that-still-return-200.md` in a comment that will
  point at nothing after §1.
- The proposed `scout` cap is **30** minutes; every cap in `data/config.json`
  today is **120**. The scout is the one job defined by fetching the outside
  world, and `interrupted` — like `blocked:` — is excluded from breaker 1. Record
  a reason, or use 60.

---

## Was the prior review actually disposed of?

Checked against the artifact, not against D8's summary of it. **Fifteen of
eighteen rows: genuinely disposed. Two: substantively disposed under an
overstated claim. One: declared and not done.**

**Genuinely disposed** — verified in the artifact: findings 1, 3, 4, 5, 6, 7, 8,
9, 10, 11, C1, C2, C4, and the rank/aperture item. I confirmed the specific ones
worth confirming: `[anchored: <key>]` appears nowhere (finding 3 dissolved with
the lanes); `draft:` appears in no task or delta as a front-matter key, only as
the ordinary English word (finding 4); the anchor is now normative *and* tasked
at 3.6 (finding 8); the window is two-sided and universal (finding 9); the
self-linking requirement is gone outright, not weakened (finding 10).

**Overstated:**

- **Row 2** claims "no spec text anchors to registry field sets any more (the
  archive-trap lesson, applied)". Measured: `specs/pulse/spec.md:62` and
  `specs/loop/spec.md:35` both still carry "price/licence/status", both inside
  requirement bodies. Mitigating and worth stating: both are verbatim
  restatements of live text, so the change neither introduces nor worsens the
  trap. The substantive half — the deriver is gone — is true. The claim as
  written is not.
- **Row 12** claims the self-amplification wording "now says exactly that". The
  body does, well and explicitly. The prior review asked to "widen the check or
  narrow the title", and the requirement is still titled "Work comes from three
  sources and **cannot self-amplify**". Restated live text, so a small thing —
  but the title was the half the finding named.

**Declared, not done:**

- **The archive-trap row.** D8: "comparison prose lives here and in preambles
  now, not in requirement bodies." Measured, two sites, both inside
  `### Requirement:` blocks and both promoted verbatim on archive:
  - `specs/blog/spec.md:226` — *"the machinery that enforced the previous 3-in-7
    ceiling is removed **with this change**, not left disabled"*. This is the
    prior review's finding in the same shape: comparison prose in a requirement
    body, referring to a rule that will exist nowhere, plus a "this change"
    self-reference that dangles the moment the change is archived.
  - `specs/loop/spec.md:318` — *"the predecessor's measured 57% kill rate was
    legible only because every kill was filed"*.

And the change adds a **new** instance the prior review could not have seen. The
voice requirement's body contains a normative sentence asserting a measured
result — *"it fires on every one of the twelve predecessor posts, and on none of
the human sample"* — which archiving promotes into reserved, uncorrectable text,
whose supporting corpora live in a `design.md` that archiving moves (finding 7),
and half of which my measurement contradicts.

**One structural observation about the disposition as a whole.** Roughly half of
D8's rows are disposed by *removing the machinery the finding was about* — the
proposal says so itself, honestly. That was the right call in every case I
checked. But it means the prior review's findings were largely **dissolved
rather than repaired**, and the weight they were bearing moved onto the voice
lint, which no sealed review had examined until this one. That is not a criticism
of the disposal; it is the reason a second sealed pass was worth running.

---

## The load-bearing claim, attacked

The claim the design rests on, stated in D2's own summary paragraph: **every
judgment is a model's, constrained by mechanism — so "NO HUMAN judgment" costs
nothing.**

Mechanism genuinely binds in three places, and I verified each. The daily
trigger is a pure function of ledger and clock. The merge cap is enforced on
files, not requested of the model. `expires:` converts a backlog into a sweep,
which is the predecessor's named bottleneck fixed as a mechanism rather than an
instruction. Those are real and they are the best engineering in the change.

It does not bind in the two places the change most wants it to. The **bar** is a
model instruction wearing a mechanism's clothes (finding 9). The **voice** is a
threshold set that separates the two samples it was drawn from, has never been
shown to admit anything, and fires on fifteen of fifteen documents by the model
that must pass it (findings 2–6). Compose them and the system has a stable
failure mode in which every component reports success and nothing is published,
with no detector anywhere (finding 8).

None of that is fatal and none of it is a redesign. Finding 1 is a one-line
correction to a task. Finding 6 is one added fixture. Finding 8 is a counter
written to a file that already exists. Findings 2–5 and 7 are corrections to a
document, not to a mechanism.

---

## The corpus methodology, assessed

Asked directly: **do the reported hit rates support the generalisation the
change makes from them?** No — but the failure is narrower than that answer
sounds, and one half of it generalises better than the change had any right to
expect.

**They do not, as reported.** Every threshold was chosen to sit in the gap
between two specific samples, and the "two-direction validation" then reports
that it sits in that gap. There are no degrees of freedom left, and the margins
are a single punctuation mark in four documents. Nine documents from five
outlets, two of them one author's personal blog, none from the year the negative
corpus was written, are not nine independent samples of "human writing"; and
twelve posts from one generator, one site, one house style and one fortnight
are much closer to one sample seen twelve times than to twelve samples of "AI
writing". D6 discloses the second point in its own words; `blog-voice.md`, the
document that survives, discloses neither.

**One half generalises anyway, and I went looking for the opposite result.** I
built my own comparison corpus rather than reuse the author's: eight TechCrunch
AI-beat news pieces published 2026-08-28 to 2026-08-30 — matched to the negative
corpus on beat and era in a way the author's sample is not, chosen and extracted
by me. **The lint fires on 0 of 8.** Semicolons 0.00–1.46, em-dashes 0.00–8.78,
self-narration zero everywhere. The human side survives an adversarial
out-of-sample test. That is the strongest single result in favour of the voice
work and it should not be buried under the defects.

**What the evidence actually licenses**, stated so the change can say it
truthfully: *these markers reliably separate this house model's long-form output
from professionally edited technology news, on the samples measured and on one
fresh sample chosen independently. They are not validated as a general AI
detector, the thresholds are fitted, and nothing yet shows the target voice is
reachable.* Every clause of that is defensible. The current text claims more.

**Method credit where it is due.** The negative corpus is a genuinely good
choice — labeled by the person whose judgment matters, on the exact surface and
subject at issue. Excluding "not just X, but Y" and the delve-family at presence
level *because they failed validation in the wrong direction*, and recording
paragraph-length CV as having separated **inverted** from theory "so nobody
re-adds it the right way round without re-measuring", is exactly the discipline
this repository asks for. Reporting burstiness as a failure rather than quietly
dropping it is the same. The method is better than its arithmetic.

---

## The two invariants

**Autonomy: holds, in both directions.** I swept all five deltas for
human-actor language. No requirement routes to a person, waits on approval, or
branches on escalation. The maintainer appears only where he already did —
directives (source 1), the direct proposal drop-in, and "removing finished lines
is the maintainer's, **at leisure**", which is explicitly non-blocking. The Pulse
delta's "work that needs human judgment goes to beads" routes *away* from the
runtime path rather than pausing it. The review delta states "Nothing here
routes to a person", and it is true.

No brake was wrongly removed. `STOP`, `HOLD.md`, reserved paths and the
maintainer-only operations all survive untouched. The one count control that was
removed — the 3-in-7 ceiling — is removed on the maintainer's explicit
instruction, and I note for the record that its replacement bounds *candidates*
(3/day at the scout's merge), not *posts*: posts may also arrive via directives
and via cross-type proposals, so the only remaining bound on published volume is
the new-writing model-minute ceiling. The change says this; it is a real
loosening; it is the one asked for.

The one place autonomy is threatened is indirect and is finding 6: a build gate
with no demonstrated pass case is a step that, if the model cannot clear it,
requires a person to notice and intervene — and nothing tells anyone to look.

**Model-free: holds.** `node pulse/verify-zero-model.mjs` exits 0 with the
scout's derivation being ledger-plus-clock and the item's context an explicit
join ("no score, no ordering beyond the feed's own, and no model invoked"). The
withdrawal of the per-event deriver strengthens rather than weakens this: the
Pulse gains one boolean and one join, and every judgment it used to be asked for
moved to the Desk.

---

## Provenance, and a disclosure I owe

**Provenance of the human-corpus measurements.** Nine files matching the D6
table by name and word count were already present in this session's shared
scratchpad, timestamped before the change was committed. I did not use them to
verify any AI-corpus claim; those I re-derived from `d34040b` with my own
extractor, validated against the one figure that reproduced (13.05 vs 13.0).
I used the nine only to measure the human corpus, whose extraction I did not
control — and every conclusion I draw from them (genre, era, length, chrome) is
about properties visible in the files themselves. The independent human test in
the methodology section uses a corpus I fetched and extracted myself.

**I caused a push to `origin/main`, and should not have.** Instructed to test the
model-free invariant by running it rather than reasoning about it, I ran
`node D:/AddictedtoAI/pulse/verify-zero-model.mjs`. That script spawns the real
`pulse/run.mjs` (`verify-zero-model.mjs:39`), and with `"publish": true` the run
reached its publish step and pushed, fast-forwarding the remote from `cfbe6d5`
to `1aa6e58`. I was told never to push and did not intend to.

Measured rather than assumed: the run created no commit of its own ("nothing of
this run's own to commit — publishing what is already committed"); `HEAD` and
`origin/main` were both `1aa6e58` afterwards; `git log 1aa6e58..HEAD` was empty.
What reached the remote is exactly the author's already-committed change, and
the Pulse's own build ran and succeeded before the publish step — the ordering
`CLAUDE.md` calls load-bearing did its job. No uncommitted work was published,
including a concurrent agent's in-flight `teach-the-whole-subject` edits, which
were dirty in the tree throughout this review and against which `npm test` was
run.

The general hazard is worth recording independently of my mistake:
**`pulse/verify-zero-model.mjs` reads as a read-only verifier and is a full
production run with a live push in it.** Any future instruction to "run the
zero-model check rather than reasoning about it" carries a deploy.

---

## What only the seal made findable

Four, and in each case it is `design.md`'s own confidence that would have closed
the question:

| Finding | What the design says | What sealed measurement found |
|---|---|---|
| **2, 3, 5** the calibration | D6 presents a full inventory table headed "Two-direction validation", with reliability grading and a sources list | the denominators agree to 0.09%, so the semicolon numerators are the disagreement — and no method I could construct yields the reported ones |
| **6** no pass case | D6: "the compensation is threefold", then lists three things, none of which is a demonstration | 15 of 15 documents by this model fire, including the voice document at 6× its own semicolon threshold |
| **1** the config edit | D9.2 names it as the one settled execution step, "a property of the reserved-path rule, not a runtime human dependency" | `budget.mjs:371` sheds by literal type list; the named edit does not shed `scout` |
| **8** blocked is invisible | D7 lists "A cadence floor, any form" as considered and rejected — correctly | I am not asking for a floor; there is no counter either, and both breaker paths exclude `blocked:` |

Reading D6 first, I would have re-run the author's method and confirmed the
author's table. Building an independent extractor — and then discovering it
agreed with the author everywhere except one row — is a move available only to a
reviewer who has not seen the row.

---

## What the change gets right, said as plainly as the defects

- **The Pulse stays model-free and the boundary is drawn exactly right.** The
  trigger is ledger-and-clock; the context is a declared join; every judgment
  lives in the Desk. The previous draft's centerpiece was **withdrawn rather
  than defended** when measurement went against it, which is the single most
  creditable thing in this revision.
- **`expires:` is the right answer to the predecessor's own named bottleneck**,
  and the asymmetry between `rejected/` (blocks slugs) and `dropped/` (records,
  never blocks) is a real distinction drawn deliberately and tested.
- **Deletion is sequenced first for a reason that is true.** I verified it: the
  lint fires on all five live posts, so §3 before §1 really would break the
  build. A rationale in a task list that survives independent measurement is
  rarer than it should be.
- **The autonomy invariant holds under a full sweep**, and the disclosure
  boundary is drawn hard and in the right place, with a scenario making
  concealment a `spec-violation`. "The writing must not read machine-made; the
  site must not pretend human-made. Both, always" is the correct formulation of a
  genuinely difficult requirement.
- **`reads-human` copies `would-cite`'s mechanics including its admitted limit**
  — "the field compels the asking, not the judgment". That honesty is why the
  mechanism is worth having.
- **The editorial fix repairs a real, measured historical failure** — a
  vocabulary that could not name test 1 filed only test-2 work for its entire
  life — by adding the send form rather than replacing would-cite.
- **The marker list is short on purpose, and two famous markers were cut because
  they failed validation.** Recording that paragraph-length CV separated in the
  *inverted* direction, "so nobody re-adds it the right way round without
  re-measuring", is the best sentence in `design.md`.
- **Four of D6's six lint rows reproduce exactly**, including the header counts
  to the integer (22 of 76) and the em-dash firing rate (9/12). The change did
  the measurement. One row of it is wrong, and the rest is real.
- **The traceability table is real**: sixteen requirements across five deltas
  onto fourteen sections with none unmapped, and `openspec validate --strict`
  passes.

---

*Reviewed against the artifact at `1aa6e58`, with `npm test` green (489/489) and
`openspec validate --strict` clean. Phase-1 findings, written sealed, are in
`review2-phase1-sealed.md` at `fe4179b`.*
