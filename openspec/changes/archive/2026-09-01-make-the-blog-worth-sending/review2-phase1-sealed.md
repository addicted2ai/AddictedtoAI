# Review 2 — phase 1, sealed

Written 2026-08-30 by a second sealed reviewer, before `design.md`, `review.md`
or `review-phase1-sealed.md` were opened. Sources read: `proposal.md`,
`tasks.md`, the five spec deltas, `openspec/style/blog-voice.md`, the live
repository, and git history including `d34040b`.

**Verdict at the end of phase 1: fit to execute with named fixes.** The
structure — a deterministic daily trigger in the Pulse, judgment in the Desk, a
mechanical cap at merge, expiry instead of backlog, two forms with finish lines
— survived every attack I made on it. The defects are in the *evidence* offered
for the voice bar, in one config edit that the machinery cannot repair later,
and in what the design leaves unobservable.

---

## 0. Two disclosures, first, because both affect how this review should be read

**I caused a push to `origin/main`.** Instructed to test the model-free
invariant by running it rather than reasoning about it, I ran
`node D:/AddictedtoAI/pulse/verify-zero-model.mjs`. That script spawns the real
`pulse/run.mjs` (`verify-zero-model.mjs:39`, `spawn(process.execPath, [RUN, …])`),
and with `"publish": true` the run reached its publish step and pushed,
fast-forwarding the remote from `cfbe6d5` to `1aa6e58`. Observed output:
`pulse: publish — pushed origin main at 1aa6e58d3e4e`, then
`live build stamp carries 1aa6e58d3e4e`. I was told never to push and did not
intend to.

What was and was not published, measured rather than assumed: the run created
no commit of its own (`nothing of this run's own to commit — publishing what is
already committed`); `git rev-parse HEAD` and `origin/main` are both
`1aa6e58d3e4ea11c855b863c44096d6f0bea8491`; `git log 1aa6e58..HEAD` is empty.
The published content is exactly the author's already-committed change, and the
Pulse's own build ran and succeeded before the publish step — the ordering
`CLAUDE.md` calls load-bearing did its job. No uncommitted work reached the
remote.

The general hazard is worth recording independently of my mistake:
**`pulse/verify-zero-model.mjs` reads as a read-only verifier and is a full
production run with a live push in it.** Any future instruction of the form
"run the zero-model check rather than reasoning about it" carries a deploy.

**A concurrent agent is editing this working tree.** `git status` shows
uncommitted modifications to `lib/learn.mjs`, `lib/render/learn.mjs`,
`lib/site.mjs`, `lib/surfaces.test.mjs`, `openspec/curriculum/learn.md` and two
`teach-the-whole-subject` files — the `checkPrerequisiteLevels` work from that
change's task 1.1. The tree was clean at session start. `npm test` below was run
against that mixed state.

---

## 1. What I independently re-measured

| Claim in the artifact | How I measured it | Held? |
|---|---|---|
| twelve predecessor posts at `d34040b` | `git ls-tree` on `app/blog`: 13 files, one is the index | **yes** |
| "76 headers", "22 of them What/Why/How" | own JSX walker over all 12 posts | **yes, exactly 76 / 22** |
| self-narration in "ten of the twelve" | own regex over the documented phrase list | **yes** (max 23, doc says 22) |
| 13.0 em-dashes / 1,000 words (`proposal.md`) | 248 em-dashes ÷ 18,999 words = **13.05** | **yes** |
| human sample "tops out at 2.1" semicolons | max 2.14 | **yes** |
| focal-word "human sample's maximum (1.3/1k)" | max 1.32 | **yes** |
| the lint fires on all twelve (composite) | own implementation of §3's closed list | **yes, 12/12** |
| the lint fires on none of the human sample | own implementation | **8/9 — one fires** |
| semicolons "the negative corpus runs 2.7–11.1" | measured **1.84–9.39** | **no** |
| semicolons "every one of the twelve fired" | measured **9/12** | **no** |
| em-dashes "negative corpus median 15.9" | measured median **14.36** | **no** |
| the lint would fail the build on the 5 live posts (§1-before-§3 rationale) | own implementation on `content/blog/*.md` | **yes, 5/5** |
| `posts: 2` at `scripts/verify-launch.mjs:88` | read | **yes** |
| ceiling symbols in the 5 named files | grep, plus the call site in `lib/site.mjs:68` | **yes** |
| `corroboration` 68, `listing-verification-due` 60, 62 free | `pulse/lib/queue.mjs:35–63` | **yes** |
| `loadConfig` throws on a type without a cap | `loop/lib/config.mjs:99–102` | **yes** |
| `loop/lib/proposals.mjs` exports four, none creating | grep: `rejectionIndex`, `readProposals`, `discardDuplicate`, `rejectionIndexText` | **yes** |
| `postSchema` strict, so `covers:`/`anchor:` fail today | `lib/schema.mjs:311–320` | **yes** |
| `data/proposals/` holds a README and `rejected/` holding another | `find` | **yes** |
| `lib/render/blog.mjs` carries the "three in any seven days" copy | line 74 | **yes** |
| change feed supports a `{key, date}` join; annotations carry no event | 90 lines, 89 with `key`, exactly 1 `annotation` | **yes** |
| the selector sheds by config **category** (traceability row, task 2.1) | `loop/lib/budget.mjs:371–380` reads `shed.exclude_types` | **no** |
| the loop delta's "exactly three" disclosed edits | word-diff of every MODIFIED block against `openspec/specs/` | **no — one more** |
| `npm test` | ran it | **489 pass, 0 fail** |
| `openspec validate … --strict` | ran it | **valid** |
| autonomy invariant (no runtime step waits on a person) | swept all five deltas | **holds** |
| model-free invariant | ran `verify-zero-model.mjs` | **holds** (exit 0) |

Two things that looked like defects and are not, recorded so the next reader
does not re-derive them: (a) task 2.2's coverage-join test needs a fixture post
carrying `covers:` while the schema only learns that key in task 3.4 — but
`pulse/lib/corpus.mjs` does not validate schemas ("The build owns schema
validation … A file it cannot parse is counted and skipped"), so the Pulse-side
fixture parses fine; (b) I suspected the two corpora were decoded
asymmetrically, which would have manufactured the em-dash ceiling — measured
**0** surviving dash entities in the human files. The em-dash figures are sound.

---

## 2. Must land before execution starts

### F1. The reserved-path config edit is incomplete, and the machinery cannot repair it

`degradationGate` decides shedding by literal type list, not by category:

```
loop/lib/budget.mjs:371   export function degradationGate(cfg, shed, candidate) {
                     372     if (shed.exclude_types.includes(candidate.type)) {
```

and `data/config.json` supplies three literal arrays — level 1
`["post","education"]`, level 2 `+["entry","tutorial"]`, level 3
`+["prune","machinery"]`. The budget *categories* (`new_writing`, …) are read by
the budget ceiling, never by the shed gate.

Task 2.1 instructs the orchestrator to add exactly two things:
`job_caps_minutes.scout: 30` and `scout` in the `new_writing` category. The
traceability table then claims `scout` is shed at level 1 via
"2.1 (selector reads config categories)". **It does not.** Without `"scout"`
added to all three `exclude_types` arrays, the loop delta's own sentence — "new
`post`/`education`/`scout` first … at 3 or more, only `verify`, `repair`, and
material-field `interpret` remain selectable" — is unimplemented, and `scout`
stays selectable at every shed level, including level 3.

Why this must land *before* execution rather than during it: `data/config.json`
is a reserved path. No Desk job may edit it; one that tries writes `HOLD.md`.
The orchestrator's config edit at task 2.1 is the only moment this is
correctable by the plan as written. If it goes in incomplete, the autonomous
machinery cannot fix its own capacity-shedding behaviour, and the next
correction requires another out-of-band intervention.

Fix: name the three `exclude_types` edits in task 2.1, and correct the
traceability row's parenthetical, which is a false statement about the code.

---

## 3. Must land before §3 — the voice work

This is the part of the change that rests on measurement, and it is the part
where measurement does not hold up. I want to be exact about the blast radius
first, because it is narrower than it looks: **the lint test task 3.7 specifies
will pass.** It asserts that each of the twelve posts fires *at least one*
marker, and each does. What fails is the *documentation of why the thresholds
are where they are* — and that document, `openspec/style/blog-voice.md`, is the
permanent artifact this change adds to the repository and the one every future
writer and every recalibration is told to work from.

### F2. Three of the four reported distributions do not reproduce

My extractor walks the JSX, keeps text nodes and string-literal expressions,
decodes entities, and counts. It reproduces `proposal.md`'s aggregate em-dash
figure to three significant figures — 13.05 against the stated 13.0 — which is
the check that says my extraction and the author's agree. On that footing:

| `blog-voice.md` §3 says | I measure |
|---|---|
| semicolons: "the negative corpus runs **2.7–11.1**" | **1.84–9.39** |
| semicolons: "**every one of the twelve** fired" | **9 of 12** |
| semicolons: "The strongest separator measured" | third strongest; self-narration fires 10/12 |
| em-dashes: "negative corpus **median 15.9**" | **median 14.36**, 9 of 12 above the threshold |

The three posts below the semicolon threshold are `chatgpt-ads` (1.84),
`frontier-cyber` (2.20) and `gemini-3-7-flash` (2.36).

I tried to find an extraction that would reproduce the reported figures, because
a disagreement about extraction is a different finding from a wrong number. Six
variants:

| variant | semicolons | fires |
|---|---|---|
| full prose text | 1.84–9.39 | 9/12 |
| minus the post-meta line | 1.86–9.43 | 9/12 |
| minus the Sources section | 1.01–6.24 | 7/12 |
| minus both | 1.02–6.27 | 7/12 |
| naive `<[^>]*>` strip of the **whole file** | 5.74–14.99 | **12/12** |
| semicolons counted before entity decoding | 49.50–87.32 | 12/12 |

Only one variant yields 12/12, and it does so by counting the JavaScript above
the JSX — `import` statements, `const` declarations, the JSON-LD object literal
— as prose. That is the single most likely origin of the claim, and if it is the
origin, the "strongest separator measured" is measuring syntax.

### F3. Every threshold is fitted to the corpus it is then reported as passing, with sub-token margins

`blog-voice.md` §3 says every threshold was "measured, not chosen … so that each
marker fires on the former and on none of the latter". That is a description of
fitting a decision boundary to a two-class sample, and the change reports the
fit as though it were a validation. Measured slack, in whole tokens, because a
document cannot contain half a semicolon:

| human piece | needs, to fire |
|---|---|
| `verge-gpt4-launch-2023` | **+1 semicolon** |
| `willison-gpt4-barrier` | **+1 em-dash** |
| six of the nine | +2 semicolons or fewer |

and on the other side, `ultrafast-mode` passes the semicolon marker if it drops
**one** semicolon; `gpt-5-6-price-drop` passes the em-dash marker if it drops
**one** em-dash.

The honest generalisation claim is therefore much weaker than "fires 12/12 and
0/9": it is *"on the two samples the thresholds were drawn from, the thresholds
separate them, in the closest cases by a single punctuation mark."* That is
worth having — it is not nothing — but it cannot support the spec's language
that the markers are "calibrated against a labeled negative corpus and a human
sample" as if calibration and validation were the same act.

**Credit where it is due, and I went looking for the opposite result.** I built
my own comparison corpus rather than reusing the author's: eight TechCrunch
AI-beat news pieces published 2026-08-28 to 2026-08-30, fetched and extracted by
me, matched to the negative corpus on beat and era in a way the author's sample
is not. **The lint fires on 0 of 8.** Semicolons 0.00–1.46, em-dashes 0.00–8.78,
self-narration 0 everywhere. The human side of the claim *does* generalise to a
sample chosen independently and adversarially. That is the strongest single
result in favour of the change's voice work and it should not be buried under
the defects above.

### F4. The comparison corpus is not what the document says it is

`blog-voice.md` describes "a nine-piece human sample of technology journalism on
the same beat". The nine files are identifiable and I measured them:

- **Two of nine are not journalism.** `willison-llms-2024` and
  `willison-gpt4-barrier` are Simon Willison's personal technical blog.
- **Not length-matched.** 527–7,003 words against the negative corpus's
  846–2,489. `willison-llms-2024` at 7,003 words is larger than the five
  shortest AI posts combined, and a large denominator suppresses every density.
  It needs +16 semicolons and +25 em-dashes to fire.
- **Not era-matched.** The negative corpus is entirely August 2026. The human
  sample dates from 2020, 2020, 2021, 2023, 2023, 2024 and 2025. None is 2026.
- **At least one carries site chrome.** `techreview-gpt3-2020.txt` opens with
  the nav rail ("Featured / Topics / Newsletters / Events / Audio", twice),
  closes with two *other* articles' headlines and a newsletter solicitation, and
  carries an undecoded `won&#x27;t`. Nine chrome markers in one file. Chrome
  inflates the word count and deflates every per-1k rate, biasing that document
  toward not firing.
- **One of the nine fires**, contradicting §3's "None of these fire on either
  corpus today": `techreview-gpt3-2020` trips the zero-tolerance register guard
  on "Deep Dive". It is MIT Technology Review's section label, not prose — which
  is the point: the extraction that produced the 0/9 admitted chrome, and chrome
  can trip a presence marker as easily as it can suppress a density one.

### F5. Neither calibration corpus is in the format the lint will run on

The negative corpus is JSX. The human sample is news HTML. The lint runs on
Markdown in `content/blog/`. Every threshold is a ratio whose denominator is
"words after extraction", and extraction differs per format: §3's own exclusion
rule — "counted outside code fences, blockquotes, and dated correction blocks" —
is markdown-shaped and cannot have been applied to either calibration corpus,
since neither has code fences or markdown blockquotes. The bold-lead-list marker
already concedes the problem in one direction ("human news HTML does not use
markdown lists, so the two-direction test does not apply"); the same concession
is owed to every density threshold. My variant table above is the size of the
effect: extraction choices alone move the semicolon result from 7/12 to 12/12.

### F6. The lint has no demonstrated pass case, and the available evidence says the author model cannot reach it

This is the finding I consider most serious, because it is about what happens
after execution rather than about how the numbers were got.

Task 3.7's validation is two-directional in name and one-directional in effect:
it proves the lint **rejects** twelve documents and **spares** nine. Nothing
anywhere demonstrates that a post this system could actually write passes it.
I ran my implementation over everything long-form in the repository that the
house model wrote:

| corpus | fires |
|---|---|
| the five live blog posts | **5 of 5** |
| the eleven live `content/learn/` pages | **11 of 11** |
| this change's own `proposal.md`, `tasks.md`, two spec deltas | **4 of 4** |
| `CLAUDE.md`, `AGENTS.md`, `teach-the-whole-subject/review.md` | **3 of 3** |
| **`openspec/style/blog-voice.md` itself** | **fires, on six markers** |

The voice document runs **14.97 semicolons per 1,000 words against the 2.5 it
sets, and 19.05 em-dashes against the 10 it sets** — six times and roughly twice
its own limits. (Its focal-word and self-narration hits are quotation artifacts,
since it lists the banned items; the punctuation rates are not.) `tasks.md` runs
36.25 semicolons/1k — nearly four times the *negative corpus's* maximum of 9.39.

The generous reading is that a blog post is a different register from a spec and
the model is being told to write differently, and that is fair. But the change
offers no measurement that the register shift is achievable, and the lint is a
**build-failing** gate that sits **upstream** of review. Chain the consequences
against the autonomy the maintainer asked for: a post job writes, the build
fails on the lint, the job ends `failed`; three consecutive `failed` post jobs
trip breaker 1 and stop `post` work; the scout keeps filing candidates that
expire unselected and get swept to `dropped/`; the blog stays empty. Nothing in
that sequence is a false statement about the system's health — every component
reports success at its own contract — and nothing surfaces it (F8).

Fix, and it is cheap: add to task 3.7 a third assertion — at least one
purpose-written fixture post, in the target voice, that the lint **passes** —
and write it before the thresholds are frozen. If it cannot be written, that is
the finding, and it is better found now than in production.

### F7. The permanent voice document anchors its maintenance procedure to a path archiving moves

`openspec/style/blog-voice.md:85–87`:

> The distributions, the corpora, and the derivation method are recorded in the
> `make-the-blog-worth-sending` change's `design.md`; recalibrating means
> re-running that derivation on a new corpus, never re-deciding a number by hand.

Task 3.7 likewise sends the executor to "`design.md` D6" for the human sample's
sources and retrieval dates.

Measured, not reasoned: `openspec archive` moved `build-initial-site` to
`openspec/changes/archive/2026-08-30-build-initial-site/`, and
`design.md` is present at that new path. So within one archive cycle the
permanent document's only pointer to its own evidence — and the only sanctioned
route to changing a threshold, since the document forbids re-deciding by hand —
points at a path that no longer exists.

The document opens by explaining that it lives outside `openspec/changes/`
precisely because "archiving moves a change's own files", citing the learn
curriculum's move to `openspec/curriculum/learn.md` as precedent. The lesson was
applied to the document's own location and not to its references. Fix: move the
corpora manifest — sources, retrieval dates, per-document measured values — into
the voice document itself or beside it under `openspec/style/`, and cite
`design.md` only as history.

---

## 4. Must land before the surface is called complete

### F8. `blocked: nothing cleared the bar` is invisible to every detector in the loop

The design's honest outcome is also its cheapest one, and I could find nothing
that would ever notice the difference. Measured in the two modules that could:

- `loop/lib/breakers.mjs:10` — "an empty queue ends a run normally, and a
  `blocked:` result is a success". Breaker 1 counts "only `failed` and
  `discarded` — blocked, interrupted, capacity and abandoned outcomes are"
  excluded.
- `loop/lib/health.mjs:81–90` — `noOutputStreak` counts trailing lines whose
  `signal === 'no-output'`, i.e. the *runner* produced nothing at all. A scout
  that runs, thinks and writes a `RESULT.md` beginning `blocked:` has produced
  output, so it **ends** the streak.

Nothing aggregates blocked outcomes over time; no status file, queue item or
health rule counts them. A scout that returns `blocked:` every day for a year
trips nothing, and the spec correctly tells everyone not to treat it as a
failure. The maintainer asked for no minimum cadence and said zero posts is
acceptable — so the fix is not a floor, which would be the exact failure the
no-cadence rule exists to prevent. The fix is **observability without
obligation**: record the blocked streak somewhere a person or a later job can
read it (`data/status.json` already exists and is written by the prebuild), so
that "the bar is working" and "the bar has eaten the blog" are distinguishable
without either one being an error.

### F9. The drop record proves form, never rate

The change rests a good deal of weight on drop records: "The drop records are
the proof the bar is real — a high kill rate that leaves no trace is
indistinguishable from no bar at all, and the predecessor's measured 57% kill
rate was legible only because every kill was filed."

The analogy does not carry. On the predecessor the docket held the denominator —
44 candidates, independently filed, 57% killed. Here **nothing measures how many
stories the scout considered.** A scout that sweeps forty sources, files three
and writes zero drop records has, by its own account, declined nothing; the
review checklist verifies that "every declined story has a drop record", which
is vacuously satisfied. A scout that files three weak candidates and writes
three pro-forma drop records is byte-indistinguishable from a diligent one.

So `proposal.md`'s "The cap and the drop records are mechanisms at the merge,
not instructions" is half true, and it is the less important half: the **cap** is
a mechanism, and it only ever binds against overfiling, which is the failure
nobody fears. The **bar** — "I want the bar to be high" — is an instruction to a
model, checked by another model. That is a legitimate design in this repository,
which says so about `would-cite` explicitly and honestly. It should be said
here too, rather than the drop records being offered as proof they cannot be.

### F10. The anchor's freshness window is tethered to a date the author chooses

The build check compares each declared anchor date against "the 7 days ending on
the post's own `date`". Post dates are validated by `isoDate`
(`lib/schema.mjs:130–133`), which checks the format and that the string is a
real calendar date. I grepped `lib/schema.mjs`, `lib/posts.mjs` and
`lib/build-content.mjs` for any future-date or recency guard: **there is none.**

So the pair (post date, anchor date) can be moved together and the check still
passes: a post dated 2026-01-15 carrying an anchor dated 2026-01-14 builds
cleanly today and forever. The spec's claim that "freshness cannot be laundered
by adding one fresh line beside a stale one" is true and is not what I am
disputing — the two-sided window does close that. What is not closed is that the
window floats. In practice the scout's `expires:` (7 or 14 days) keeps candidates
fresh, so this is a gap between what the check guarantees and what the prose
around it implies, not an open door. Worth one sentence of honesty in the spec,
or one line in the build check comparing the post date to the build date.

### F11. The loop delta's "exactly three" disclosure is one short

The loop delta invites this check: "Deliberate edits inside restated blocks are
exactly three, disclosed here: the side-output sentence gains the scout
exception, the proposal front-matter list gains an optional `expires:`, and the
degradation lists gain `scout`."

I word-diffed every `## MODIFIED Requirements` block against the live text in
`openspec/specs/`. All three disclosed edits are present and are exactly as
described. Everything else I found is either the requirement's own declared
purpose (the job-type list gaining `scout`; the 600-word producing-side block;
the budget table's new-writing row gaining `scout`, which the delta's preceding
paragraph does narrate) — **except one**. "Spending is budgeted in
model-minutes" also gains a sentence of rationale that appears in no disclosure:

> `scout` spends from the new-writing share deliberately: discovery is the first
> stage of writing, and when writing is over its ceiling, finding more to write
> is the first thing to stop.

It is good reasoning and I would keep it. It is still a fourth edit inside a
restated block, in a document that says there are three, and it will be promoted
verbatim into `openspec/specs/` on archive. Disclose it.

---

## 5. Smaller, but real

- **F12.** `specs/blog/spec.md:3` sends the reader to "`tasks.md` §7" for the
  traceability table. The table is **§6**; there is no §7.
- **F13.** Task 1.1 deletes "the five `data/reviews/seed-*.md` records". All
  five exist and the glob is right (three are `seed-blog-*`, two are
  `seed-same-catalog-same-day.md` and
  `seed-reference-urls-that-still-return-200.md` — worth naming, since a reader
  who assumes the `seed-blog-` prefix will find only three). It misses two
  files in `data/reviews/evidence/`: `post-same-catalog-same-day.md` and
  `post-reference-urls-that-still-return-200.md`. I checked whether that
  matters: no code joins that directory — the only reference anywhere is a brief
  string at `loop/lib/brief.mjs:62` — so these are orphans, not false alarms.
  But task 1.1 asserts "nothing else references them", and two files do.
- **F14.** `pulse/lib/corpus.mjs:65` names
  `content/blog/reference-urls-that-still-return-200.md` in an explanatory
  comment. Deleting the post leaves the comment pointing at nothing.
- **F15.** The proposed `scout` wall-clock cap is 30 minutes. Every cap in
  `data/config.json` today is **120**. The scout is the one job type whose work
  is defined as fetching the outside world, and it is being given a quarter of
  the time given to jobs that do not leave the repository. A scout killed at its
  cap becomes `interrupted`, which — like `blocked:` — is excluded from breaker
  1. Worth a recorded reason, or 60.

---

## 6. The load-bearing claim I attacked, and what happened to it

The claim the whole design rests on is that **judgment can be made trustworthy
by mechanism at the edges**: the Pulse triggers deterministically, the cap binds
at merge, the drops are recorded, the lint fails the build, and the review gate
catches the rest — so that "NO HUMAN judgment" costs nothing.

It survives, but not everywhere it is claimed to. Mechanism genuinely binds in
three places, and I verified each: the daily trigger is a pure function of
ledger and clock; the merge cap is enforced on files, not on behaviour; and
`expires:` converts a backlog into a sweep. Those are real and they are the
best parts of the change.

It does not bind in the two places the change most wants it to. The **bar** is a
model instruction wearing a mechanism's clothes (F9). The **voice** is a
threshold set that separates the two samples it was drawn from and has never
been shown to admit anything (F6). And the composite of both failure modes is a
system that reports success at every component while publishing nothing, with no
detector anywhere (F8).

None of that is fatal and none of it is a redesign. F1 is a one-line correction
to a task. F6 is one added fixture. F8 is a counter written to a file that
already exists. F2–F5 and F7 are corrections to a document, not to a mechanism.

## 7. What the change gets right

Stated as plainly as the defects, because it earned it.

- **The Pulse stays model-free and the boundary is drawn exactly right.** The
  trigger is ledger-and-clock; the context is a join with "no score, no ordering
  beyond the feed's own"; every judgment lives in the Desk. The previous draft's
  mechanical candidate deriver was withdrawn rather than defended.
- **`expires:` is the right answer to the predecessor's named bottleneck**, and
  the asymmetry between `rejected/` (blocks slugs) and `dropped/` (records only,
  never blocks) is the correct distinction, drawn deliberately and tested.
- **Deletion is sequenced first for a reason that is true.** I verified the
  claim: the lint fires on all five live posts, so §3 before §1 really would
  break the build.
- **The autonomy invariant holds under a full sweep.** No requirement in any of
  the five deltas routes to a person, waits on approval, or branches on
  escalation. The maintainer appears only where he already did — directives, the
  proposal drop-in — and every one of those is non-blocking by construction. The
  review delta says "Nothing here routes to a person" and it is true.
- **The disclosure boundary is drawn hard and in the right place**, in both the
  spec and the voice document, with a scenario that makes concealment a
  `spec-violation`. "The writing must not read machine-made; the site must not
  pretend human-made" is the correct formulation of a genuinely tricky
  requirement.
- **`reads-human` copies `would-cite`'s mechanics exactly, including its
  admitted limit** — "the field compels the asking, not the judgment". That
  honesty is why the mechanism is worth having.
- **The editorial fix identifies a real, measured historical failure** — a
  vocabulary that could not name test 1 filed only test-2 work for its entire
  life — and repairs it without removing what was there.
- **The traceability table is real.** Sixteen requirements across five deltas map
  onto fourteen sections with no requirement unmapped, and `openspec validate
  --strict` passes.

---

*Phase 1 ends here. `design.md`, `review.md` and `review-phase1-sealed.md` have
not been opened.*
