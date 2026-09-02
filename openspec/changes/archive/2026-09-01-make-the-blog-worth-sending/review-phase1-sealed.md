# Phase-1 sealed findings — `make-the-blog-worth-sending`

Written 2026-08-30 by a reviewer with no authorship stake and no edit rights
beyond this file and `review.md`. **`design.md` has not been opened.** Read in
phase 1: `proposal.md`, `tasks.md`, all five spec deltas, and the live
repository (`openspec/specs/`, `content/blog/`, `lib/`, `pulse/`, `loop/`,
`data/`).

The seal matters here for the reason the repository already recorded: an
executing model reads the tasks and the deltas, never the design. Judging the
artifact without `design.md` is the realistic test of whether it is executable.
Findings A1, A2, A4, A5 and D2 below are all defects an executor would hit
holding exactly what a phase-1 reviewer holds.

---

## What was independently re-measured

Every number the change asserts was re-derived from raw sources, not from the
change's own intermediate output.

| Claim in the change | Re-measured | Held? |
|---|---|---|
| 5 published posts, dates 2026-08-14 to 2026-08-28 | front matter of all 5 files: 08-14, 08-17, 08-25, 08-28, 08-28 | **yes** |
| `data/changes.jsonl` holds 90 lines | `wc -l` = 90; 90 parsed | **yes** |
| 60 seeded `release` events, 2026-06-29 to 2026-08-24 | 60 lines, all `kind: release`, all `seeded: true`, range exact | **yes** |
| 30 of those 57 calendar days carried ≥1 | 30 distinct seeded dates; inclusive span 57 days | **yes** |
| 30 live lines: 2 retirements, 10 arrivals, 17 field changes, 1 annotation | exact, by `kind` count | **yes** |
| field changes = 8 input-price, 8 output-price, 1 status | exact, by `field` count | **yes** |
| `post` appears nowhere in `pulse/lib/queue.mjs` | `grep -c` = 0, **and** every `item()` call enumerated: only `repair`, `verify`, `interpret`, `entry` | **yes** (two methods) |
| `send` appears nowhere in `openspec/specs/editorial/spec.md` | whole 106-line file read | **yes** (exhaustive) |
| `loop/lib/proposals.mjs` exports exactly four functions | 4 exports | yes |
| …"all four are readers" | `discardDuplicate` writes a file and `unlinkSync`s another | **no — see C1** |
| `data/proposals/` holds a README and an empty `rejected/` | `rejected/` holds a `README.md` | **no — see C2** |
| every change line carries date, source URL, excerpt, kind | 90 have `kind` and `date`; **89** have `source_url` and `excerpt` | **no — see C3** |
| rank 35 is below every `repair` and `verify` rank in `RANKS` | reason→type map built from every `item()` call; lowest repair/verify rank is `overdue-fact-slow` = 45 | **yes** |
| rank 35 is above `want-eligible-mint` at 30 | confirmed in `RANKS` | yes |
| every named file and symbol exists | `postSchema`, `RANKS`, `BLOG_CEILING_POSTS`, `blogCeilingGate`, `ACCEPTANCE_BY_TYPE.post`, `CHECKLISTS.post`, `ceilingBreaches`, `warnPostCeiling`, `lib/render/blog.mjs:74` copy — all present | **yes** |
| `openspec validate … --strict` passes | run: `Change 'make-the-blog-worth-sending' is valid` | **yes** |
| the tree is green to start from | `npm test`: 489 tests, 489 pass, 0 fail | **yes** |

**MODIFIED restatements, checked verbatim against `openspec/specs/`.** All five
requirement blocks were extracted from both sides, split into paragraph and
scenario units, whitespace-normalised and compared. **No unrelated clause
drifted anywhere.** `pulse` changes only the queue enumeration; `loop` is
byte-identical above its appended paragraph, exactly as its preamble claims;
`review` changes only the blog-post bullet; `editorial` changes only clause 3,
its one scenario, and the appended forgettable sentence; `blog` rewrites its
requirement body, which is the point of the change. This is the check that most
often finds silent damage, and there is none.

**Normative sentence census.** The change estimates "roughly 30" against a
32-row table. Measured: **37 normative sentences across the five deltas — 29
new, 8 restated verbatim from live text.** One of the 29 (`blog` delta's own
"A SHALL with no task is invisible twice over") is meta-prose, not a
requirement, leaving **28 substantive new normative sentences against 32 rows.**
Every one of the 28 maps to a row; the 4 extra rows carry non-SHALL obligations
(lane classing, the no-anchor default, the synthesis exemption, clause 3's
either-test). **The table is over-complete, not under-complete** — no untasked
SHALL, and no untasked MAY. That is the check the brief warned would fail, and
it does not.

---

## A. Must land before execution starts

These change what gets built. An executor starting on §2 without them builds
the wrong mechanism.

### A1. The grouping key cannot group `release` lines — the first kind the spec names

Task 2.1 specifies grouping by `(source, date, kind, vendor-prefix of row_id)`.
Measured over all 89 lines carrying a `row_id`:

| `kind` | `row_id` shape | count |
|---|---|---|
| `release` | UUID (`00a6e024-dee9-…`) | **60** |
| `arrival` | `vendor/model` | 10 |
| `field_change` | `vendor/model` | 17 |
| `retirement` | `vendor/model` | 2 |

**29 of 89 row_ids contain a `/`; 60 are UUIDs containing none.** Every
`release` line — the entire seeded history, and the first kind both the spec
and the task enumerate — has no vendor anywhere in `row_id`, and none in `key`
either (`seed|llm-releases|<uuid>`). The vendor exists only inside
`excerpt.source_name`, which the grouping rule does not mention.

Simulating the rule over the seeded history therefore yields **one candidate
per line, every day** — the rolling 7-day count equals the line count exactly
on all 30 seeded days. The pulse delta's headline scenario ("one vendor's three
model ids … exactly one post candidate") cannot be satisfied for `release` at
all.

Two further splits measured in the live 2026-08-29 diff:

- **`kind` in the key splits one model's own day.**
  `deepseek/deepseek-v4-flash-0731` appears as an `arrival` *and* as two price
  `field_change`s. Same model, same day, same source → **two** candidates.
- **`~z-ai/glm-latest` groups separately from `z-ai/…`** — OpenRouter's variant
  tilde makes one vendor two vendors. Measured: 12 distinct "vendor prefixes"
  among 29 slash ids, one of which is `~z-ai`.

Net: the live diff yields **16 candidate groups from 29 eligible lines, 9 of
them singletons** — and the day's two retirements (`allenai`, `arcee-ai`) become
two separate stories, which is precisely the outcome the "same-day related
events are one story" requirement exists to prevent.

### A2. Two of the three `field_change` fields the spec names emit nothing

The pulse delta: candidates derive from `field_change` "on material fields
(price, licence, status)". Measured against `data/sources/registry.json`, the
only source registry:

| field | registered on | emits change lines? |
|---|---|---|
| `price_input` | `openrouter-models` | **no — `event: false`** |
| `price_output` | `openrouter-models` | **no — `event: false`** |
| licence | **no registered source declares one** | never |
| `status` | `openrouter-models` | yes |
| `context_window` | `openrouter-models` | yes (not named by the delta) |

`pulse/lib/diff.mjs:224` is the mechanism: `if (spec.event === false) continue;`

This is not an oversight in the registry — it is a decision the repository
already measured and documented at `pulse/lib/diff.mjs:49–60`
(`addictedtoai-8ho`): OpenRouter's pricing is *"one provider's posted rate …
with the top provider re-chosen on a rolling 30-second outage window"*, the
committed snapshots show one row moving "down 10.81% and then down another
10.56% in 20 hours", and the conclusion recorded is that **"a price line here is
a routing artifact wearing an event's clothes."**

So the new requirement names, first among its news sources, a class of event
this repository has already ruled is not an event. Consequences, both real:

1. **Today** the `field_change` clause reduces to `status` alone — **one line in
   the entire live history.** The 16 price lines in the 2026-08-29 diff are
   historical and will not recur.
2. **Later**, `diff.mjs:380` anticipates `addictedtoai-ak9` clearing
   `event: false` when prices are re-keyed. The moment it does, price lines
   resume and become news candidates automatically, with no further review —
   the spec pre-authorises notes about the artifact.

The change never mentions `event: false`, `addictedtoai-8ho` or `ak9`.

### A3. The uncapped lane is escapable by front matter — the load-bearing claim fails

This is the claim the design rests on, stated in the blog delta: *"the one lane
with no count ceiling admits only posts carrying evidence a model cannot
manufacture"*, and *"a capacity glut can manufacture surveys at will, but it
cannot manufacture events."* Attacked as instructed. It does not survive.

Three specified facts compose into the hole:

1. **Form is defined by the anchor, not by the content.** "A post declaring no
   anchor is a synthesis"; a note is "a post anchored to a dated event". So a
   survey that declares `covers:` is definitionally a news note — not a
   violation to be caught, a reclassification.
2. **Nothing forbids a synthesis declaring `covers:`.** Indeed a synthesis
   "SHALL rest on enumerable dated evidence", and `data/changes.jsonl` is where
   that evidence lives. Declaring it is the natural thing to do.
3. **The published set is classed by front matter alone** (blog delta; task 3.1:
   count only posts with "no `covers:`/`anchor:` front matter"). The build check
   in task 1.2 asks only that the reference **resolve to a line** and be within
   7 days — never that the post is about it.

Therefore: a survey naming one recent feed line is anchored, is refused by no
count ceiling, and **does not count against the 1-in-7 unanchored cap** — so it
does not block the next one either. The manufacturable genre becomes uncapped
by adding one front-matter key whose only test is that a real line exists. There
are 90 such lines available.

The selector side leaks the same way from the other end: task 3.1 puts
"proposals … declaring an anchor" in the anchored lane, and proposals are, in
the loop spec's own words, "the only **model-originated** source."

What survives the attack, and deserves saying: **`covers:` is genuinely
unforgeable.** It resolves against a file only the deterministic, model-free
Pulse writes, and the build fails an unresolved reference. The defeated claim is
not "the anchor is real" — it is "the anchor selects the genre."

### A4. A directive has no way to declare an anchor

Task 3.1 classifies "queue post candidates, and proposals/directives declaring
an anchor" as anchored. A proposal has front matter, so this is definable. A
**directive is a plain line the maintainer types into `DIRECTIVES.md`** — no
front matter, no schema, and neither the delta nor the tasks define any syntax
for declaring an anchor in one.

The lane classifier therefore has an undefined input on the *highest-priority*
work source (`select.mjs`: directives are priority 1). Both defaults are wrong
in a specific way: default-unanchored refuses the maintainer's own directive
whenever one survey was published in the trailing 7 days; default-anchored makes
"write me a survey" an uncapped lane. An executor must guess, and the likely
guess — substring-matching the directive text — is a check defeated by typing a
word.

### A5. Task 2.2 requires a fixture the schema forbids

Task 2.2: *"a draft post (`draft: true`) suppresses nothing."*

`lib/schema.mjs:311` — `postSchema` is `.strict()` with exactly four keys:
`title`, `date`, `mentions`, `corrections`. **A post carrying `draft: true`
fails the build**, so the fixture the test requires cannot exist in the corpus.
Task 1.1 adds `covers:` and `anchor:` and does not add `draft:`.

Measured: `draft` appears in exactly one non-test source file in `lib/`,
`loop/lib/` and `pulse/lib/` — `loop/lib/surfaces.mjs:48`, a defensive check
against a flag the schema has never permitted. Tasks 1.1 and 2.2 contradict each
other; one of them has to move.

---

## B. Must land before the surface is called complete

### B1. Dropping the ceiling to 1 makes the existing corpus warn, permanently

Measured by running `ceilingBreaches` from `lib/posts.mjs` over the real five
posts, then re-running the same window logic at the proposed constant:

| ceiling | breach windows on today's corpus |
|---|---|
| 3 (today) | **0** |
| 2 | 1 (2026-08-25 → 08-28, 3 posts) |
| **1 (proposed)** | **2** — (08-14 → 08-17, 2 posts) and (08-25 → 08-28, 3 posts) |

All five published posts are unanchored (front-matter keys today are exactly
`date, mentions, title`), so all five count. `npm run build` goes from zero
post-ceiling warnings to two, on history that was legal under the rule in force
when it was written, and they can never be cleared — the five are legitimate
syntheses with no honest anchor to add. Task 3.2 specifies fixture tests and
"five same-week anchored posts warn nothing"; it never mentions the real corpus.
Task 1.2 does check the real corpus, but only for the anchor rule.

The fix is cheap (grandfather by date, or count only posts dated on or after the
change lands) and the choice should be explicit, because a permanent warning
nobody can clear trains readers to ignore the whole warning class.

### B2. The ceiling exists as two independent constants with no link between them

- `lib/posts.mjs:20` — `export const POST_CEILING = 3;` (build warning)
- `loop/lib/config.mjs:56` — `export const BLOG_CEILING_POSTS = 3;` (selector)

Two copies, equal only by coincidence, in two of the five top-level components
CLAUDE.md describes as "five things, and the boundaries between them are the
design". Task 3.1 changes the loop's; task 3.2 says the build should count
"against the new constant" without saying which one or where it lives, and there
is no shared module to import from without `lib/` taking a dependency on
`loop/`. Nothing tests that the two agree. A miss makes the build report a
3-in-7 rule while the selector enforces 1-in-7 — divergent in the direction that
hides over-publishing.

### B3. The anchor is never rendered, so the reader cannot see the primary evidence

The blog delta's finish line for a note: it is finished "when an affected reader
knows what happened, what changes for them, **and where the primary evidence
is**."

`lib/render/blog.mjs:42` — `renderPostPage` renders title, date, body and
corrections. Nothing else. No task adds `covers:`/`anchor:` rendering; the only
render edit in the whole change is task 3.2's one-line index copy at line 74.
So the anchor is schema'd, build-checked and review-fetched, and then invisible
on the page — the note's evidence reaches the reader only if the author
separately writes the link into the prose, which nothing requires or checks.

One thing here works better than expected and is worth recording: front-matter
URLs **are** picked up by the Pulse's rolling external link check.
`pulse/lib/corpus.mjs:120` `extractLinks` walks `file.data` recursively and
scans every string for `https?://`, and `corpusLinks` includes `corpus.prose`.
So a fabricated `anchor.url` that 404s eventually surfaces as a `broken-link`
repair item. The **liveness** half of the external anchor is mechanically
covered; only its **aboutness** rests on the reviewer's fetch.

### B4. The staleness check launders old news, and is one-sided

"The build SHALL fail a post whose **newest** declared anchor date … precedes
the post's own `date` by more than 7 days."

Because it reads the *newest* of the declared anchors, a post covering a
six-month-old event passes by additionally declaring one fresh line. The
aggregation choice defeats the rule's stated purpose ("a 'news' note about a
stale event is mislabeled, not early"). Use the **oldest** load-bearing anchor,
or require every declared anchor inside the window.

Separately the window is one-sided: only "precedes … by more than 7 days" is
checked, so a post dated 2026-09-01 declaring an anchor dated 2026-12-01 builds
clean.

### B5. "The blog remembers itself" degenerates into "link the previous post"

The delta makes this a SHALL and defines subject-sharing as **mention overlap**:
"Where earlier published posts share the post's subject (mention overlap with
existing posts), the post SHALL link at least the most recent of them."

Measured over the five real posts (46 distinct mentions, 10 pairs):

- **6 of 10 pairs share at least one mention (60%).**
- Applying the rule to each post in date order, the required link is **the
  immediately previous post in 3 of the 4 cases** where any link is required.
- One of those is compelled on a single shared mention, `org/openai`, joining a
  post about knowledge-cutoff definitions to a post about open licences.

There is no threshold and no relevance test, so on this corpus the requirement
produces a chain, not a thread — and a mandatory link a reader gains nothing
from. Requiring overlap on the post's *subject* entities, or ≥2 shared
non-organisation mentions, or making the link a MAY that review judges, all fix
it.

### B6. `QUEUE_CAP` truncates from the bottom, and post candidates sit second-lowest

`pulse/lib/queue.mjs:238` — `items.slice(0, QUEUE_CAP)` with `QUEUE_CAP = 50`,
applied after a rank-**descending** sort. At rank 35 post candidates are the
second-lowest class in `RANKS` (only `want-eligible-mint` at 30 is lower), so
they are among the first items dropped when the queue is full — and because
candidates expire at 7 days and the queue has no memory, a dropped candidate is
gone rather than deferred.

Combined with `select.mjs` selecting exactly one job per run
(`floor.candidates[0]`), the anchored lane's real bound is queue position, not
the budget. The delta's list of what bounds "no ceiling" — events, the
model-minute budget, capacity shedding — is accurate as far as it goes and
omits the binding one. Measured today: `total_before_cap` is **0**, so nothing
is being truncated right now; nothing in the change measures or guards it later.

Task 5.2's measurement plan says "with … an **empty** repair/verify queue",
which shows the author knows selection is subordinate. That honesty is worth
noting — the gap is that the truncation interaction is nowhere.

### B7. Self-amplification is blocked at one hop, under a requirement titled "cannot self-amplify"

Task 4.3 / the loop delta: auto-discard "any proposal whose stamped origin type
equals its proposed type." That blocks `post` → `post`. It does not block
`post` → `interpret` → `post`, and the delta explicitly blesses the second leg:
"Cross-type noticing (an `interpret` job proposing a synthesis `post`) is the
designed path."

With 3-day cooling per hop the cycle is ~6 days rather than ~3 — bounded, not
closed. The mechanism does exactly what its sentence says; the requirement's
*title* claims more. Worth either widening the check or narrowing the title.

---

## C. Accuracy defects in the change's own evidence

The change is unusually well measured (see the table above), which makes the
four misses worth naming precisely rather than waving at.

- **C1.** "`loop/lib/proposals.mjs` exports exactly four functions, **all
  readers**" (proposal §2 and the `loop` delta preamble). `discardDuplicate`
  (`proposals.mjs:146`) does `writeFileSync` then `unlinkSync`. Three readers
  and one mover. The load-bearing claim — that **none of them creates a
  proposal** — is true, and is what the sentence should say.
- **C2.** "`data/proposals/` has held nothing but a README and an **empty**
  `rejected/`". `rejected/` contains a 440-byte `README.md`.
- **C3.** "**Every** line carries a date, a source URL, an excerpt and a kind."
  89 of 90. The annotation line has `kind`, `date`, `annotates`, `job` and
  `text`, and neither `source_url` nor `excerpt`. Harmless — annotations are
  excluded from candidates by design — but "every" is the word the brief warns
  about.
- **C4.** Task 1.3 says the existing check is "kept **verbatim**" and then
  quotes it as `worth an enthusiast's time or report `blocked:``. The actual
  string in `brief.mjs:83` uses a curly apostrophe (`enthusiast’s`) and reads
  *"It is worth an enthusiast’s time. If it is not, write nothing and report
  `blocked:` — a post exists because something happened, never because a slot
  was open."* Measured: `enthusiast’s` occurs once in `brief.mjs` and zero
  times in `tasks.md`; `enthusiast's` the reverse. An executor searching for the
  task's string finds nothing — the literal-substring false-absence trap, inside
  a task whose instruction is "verbatim".

---

## D. Archive traps

`openspec archive` promotes requirement blocks into the reserved
`openspec/specs/` verbatim, checking only that tasks are complete. Verified:
delta **preambles are not promoted** (the live specs carry `# … Specification`
/ `## Purpose` / `## Requirements` only), so the `loop` delta's preamble prose
is safe. Everything inside a `### Requirement:` block is not.

- **D1.** The blog requirement ends: *"The unanchored ceiling is deliberately
  tighter than **the 3-in-7 ceiling it replaces**."* That is inside the
  requirement body, so on archive it becomes permanent normative-adjacent text
  in a reserved path, referring to a rule that by then exists nowhere — and no
  job may correct it.
- **D2.** The proposal states: *"Nothing anchors a permanent requirement to a
  path archiving moves."* True as written, and I checked it — no delta
  references `openspec/changes/…`. But the trap has a second form the proposal
  did not consider: the pulse requirement anchors a permanent obligation to a
  **data-defined field set** (price, licence, status) that lives in
  `data/sources/registry.json`, whose own header says *"Adding or removing a
  source is an ordinary data change, not an OpenSpec change."* Finding A2 is
  that trap already sprung before archiving: an ordinary data edit has already
  emptied two of the three fields the requirement names, and after archiving the
  requirement is in a path no job may correct.

---

## E. Recorded decisions wanted, either way

- **The instrument the maintainer rejected is the one that was kept and
  tightened.** His stated position is that both ceiling and floor are the wrong
  controls and the right control is a worthiness bar. The change removes no
  floor (there was none), adds the bar — and **tightens the count ceiling from 3
  to 1** for the survey genre. The proposal is candid that it "disagrees about
  the instrument". Given that the maintainer's complaint was about *genre*, not
  *volume*, this is a substantive disagreement that should be ratified rather
  than assumed, especially since it also cuts his own directive path 3x (A4).
- **`addictedtoai-3zf` is substantially resolved and never named.** 3zf's
  measurement is that five job types have no trigger — `tutorial`, `post`,
  `education`, `prune`, `machinery`. This change gives `post` a queue trigger
  and wires the proposal producer, which is the only route to the other four.
  The proposal cites `18c` and `6ov` and not `3zf`; task 5.3 files two new
  issues and does not mention updating it. CLAUDE.md requires naming the issue
  carrying the rest.
- **`addictedtoai-18c`'s "bigger finding" is deferred to a filed issue.** 18c
  says explicitly: *"the new Pulse derives its queue from ITS OWN SNAPSHOT DIFFS
  … A better prompt handed a census queue will still write censuses."* The
  change fixes the prompt and builds the producer **on that same supply**, and
  defers widening the aperture to task 5.3(b). Measured, that supply is: **two
  registered sources**, of which the live one is a single model registry
  (`openrouter-models` wrote 29 of the 30 live lines) and the other
  (`llm-releases`) has **no material fields at all** and contributes only
  seeded `release` rows. As of today every derivable news note is "an OpenRouter
  row changed."
  Filing the issue is the right shape per CLAUDE.md, and the deferral is
  disclosed rather than buried. The question worth a recorded answer is whether
  the news lane should ship before the aperture widens, given that A2 leaves
  `status` as the only live `field_change` source.
- **Rank 35 places post candidates above `want-eligible-mint`.** The spec asks
  only for "below every repair and verify item". Task 2.1 additionally decides
  that a news note outranks minting a wiki stub three pages already want. Not a
  contradiction — an editorial priority chosen in `tasks.md` that no spec
  sentence authorises.

---

## What the change gets right, said as plainly as the defects

- **It measured what it claimed.** Every headline count in §Why re-derived
  exactly from raw JSONL: 90 lines, 60 seeded releases over 2026-06-29→08-24,
  30 of 57 days, 30 live lines splitting 2/10/17/1 with the field breakdown
  8/8/1. Four separate figures, all exact. The three misses (C1–C3) are
  qualifiers around correct numbers, not wrong numbers.
- **The traceability table is real and over-complete** — 32 rows against 28
  substantive new normative sentences, with no untasked SHALL and no untasked
  MAY. The brief predicted this is where changes fail; this one doesn't.
- **The MODIFIED restatements are clean.** Five requirement blocks compared
  unit-by-unit against live text with zero unrelated drift. That is the
  discipline that keeps a spec from rotting, and it was done.
- **`covers:` is a genuine mechanism**, not an instruction: a reference into a
  file only the model-free Pulse writes, with an unresolved reference failing
  the build. A3 defeats the genre claim built on top of it, not the anchor
  itself.
- **The diagnosis is right and is the hard part.** "You cite a reference; you
  send a story" identifies a real defect in the live editorial spec (verified:
  `send` occurs zero times in all 106 lines of it), and the two-forms split with
  separate finish lines is a genuinely better frame than a rate control. The
  "at most one proposal, never your own type" pair is the right *kind* of
  answer — mechanical discard spending no inference — even where B7 shows the
  guard is one hop shallower than its title.
- **It declines to write content.** "This change writes no posts; it builds the
  thing that does" — and the impact list correctly keeps `package.json`,
  `data/config.json` and `runners.yml` untouched, with the ceiling constants
  correctly placed in code per `data/README.md`, which I verified says exactly
  that.

---

## Provisional verdict, sealed

**Fit to execute with named fixes** — but A1, A2, A4 and A5 must land *before*
§2 starts, because they determine what the producer is. A3 must land before the
blog is called complete and is the one that decides whether the change achieves
its stated purpose: as specified, the sentence "a capacity glut can manufacture
surveys at will, but it cannot manufacture events" is false, because classing
the published set by front matter alone lets a survey buy its way into the
uncapped lane with one resolvable `covers:` key.
