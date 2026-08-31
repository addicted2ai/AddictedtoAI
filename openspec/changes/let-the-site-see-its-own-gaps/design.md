# Design: let-the-site-see-its-own-gaps

## D1 — Why a *declaration* is the only honest inward signal

Every queue reason today answers a question with a measurable answer: is this
source refusing? is this link dead? is this fact past its interval? did this row
vanish? The queue never asks a question whose answer is a judgment, and that is
not an oversight — `addictedtoai-18c` records what happened the last time
something on this site decided for itself that more work was needed.

An inward-looking signal has to clear the same bar, and almost none can. "This
entry is thin", "this prose is weak", "this surface has a hole" are all
judgments; a model scoring the corpus against a rubric is the shape the issue
explicitly forbids, because it is unfalsifiable and this repository's design is
measurement over assertion.

A **declaration** escapes that. If a surface has written down what it intends to
cover, then the difference between the declaration and the corpus is arithmetic:
a set of slugs minus a set of filenames. Nobody's opinion enters it. It is
falsifiable by a directory listing. And — this is the property that makes it a
queue reason rather than a backlog — **it retires by itself**: publish the page
and the item is gone at the next recomputation, with nothing to close.

That is why this change is possible for `education` and not for the other
surfaces: `education-static` is the only capability that already requires a map
of record. This change does not invent the declaration. It notices that one
already exists, that the spec already obliges authors to keep it true, and that
nothing has ever checked.

## D2 — Why the build gate and the queue item are one change

They are the same measurement read in two directions.

| Direction | Meaning | Who acts | Treatment |
|---|---|---|---|
| page ∉ curriculum | the map has stopped describing the territory | the author, now | **build error** |
| curriculum entry ∉ pages | the site declared an intention it has not met | the Desk, later | **queue item** |

Splitting them would ship half a guarantee. The build gate alone makes the map
trustworthy and does nothing about the gap; the queue item alone offers work
against a map that anyone can silently contradict — and a coverage claim
computed against an untrusted map is worth nothing at all. Shipping only the
queue item would be the more tempting half, because it is the one that looks
like it answers the maintainer, and it is the half that is unsound on its own.

The asymmetry in treatment is deliberate and follows the house rule already
stated in `pulse/lib/corpus.mjs`: *the build is strict, the Pulse is tolerant.*
An undeclared page is a thing an author is doing **right now**, so it stops
them; the fix is one line in the curriculum and the spec already tells them to
write it. An unmet declaration is a thing the site has **not yet** done, which
is not an error in anything — nothing on the site is wrong because a page it
intends to write does not exist yet.

## D3 — The rank, and the argument for it

`curriculum-gap` is rank **28**, between `want-eligible-mint` (30) and
`carried-finding` (25).

Below every breakage and every timer, because nothing is wrong: no page is
stale, no link is dead, no reader sees anything false. A surface that has not
finished growing is not a surface that has rotted, and the whole rank table is
ordered by "how much does this damage the site's claim to be current".

Below `want-eligible-mint` specifically. That reason means three or more
published pages link to a name that does not exist, so a reader is hitting the
gap today; it also mints a stub, which is cheap. A curriculum gap is a standing
intention nobody is currently walking into, and it costs an `education` job at
the 120-minute cap. When both are offered, the cheap thing that unblocks live
links should go first.

Above `carried-finding` (25), and the reason is the one that entry's own comment
gives for sitting where it does: a carried finding *cannot retire on its own* —
some later job's diff has to delete the file that names it — which is why it is
ranked low enough that a stuck one can never dominate the queue. A curriculum
gap has the opposite property. It retires mechanically the moment the page
exists, so it can never stick, and it does not need the protection that rank 25
buys.

## D4 — `prune` should never be queue-reachable (a decision, not a deferral)

`addictedtoai-3zf` part (d) asks whether the trigger-less types should ever be
queue-reachable, and observes that the current state — capacity with no trigger
and no record of a decision — is the part that is actually wrong. Here is the
decision for `prune`, and it is **no**.

Pruning is removal. Three things follow:

1. **The measurement does not exist.** Every queue reason is derived from
   something measurably wrong with committed state. "This is the weakest
   content" is not a measurement; it is exactly the rubric score the issue
   forbids. Nothing computable from `content/` distinguishes a page worth
   removing from a page nobody has linked to yet.
2. **The failure mode is asymmetric and reaches the reader.** Every other queue
   item, if it fires wrongly, wastes a job. This one, if it fires wrongly,
   deletes something worth keeping and 404s a published URL. The repository's
   own acceptance check for the type — *"No published URL 404s as a result"* —
   is a bound on the job, not on the trigger.
3. **The existing route is the right one and is not blocked.** A `prune`
   reaches the Desk through a proposal or a directive: an actor with evidence
   names the specific thing and why. That is the correct amount of friction for
   an irreversible act.

So `prune` is proposal- and maintainer-initiated **by design**, and this change
writes that down where the code can be read against it.

## D5 — `machinery` should not be queue-reachable either, and the measurement says why

The complaint lands hardest here — it is the type named after the thing the
maintainer says is being ignored — so it deserves the most careful answer.

The tempting move is a derived trigger: something that notices the machinery is
deficient and queues a job. It cannot be built honestly. "The machinery is
deficient" has no committed-state measurement; the closest available thing is a
model scoring the codebase, which is the forbidden shape, and it would be
scoring the very code that dispatched it.

More to the point, **the inward channel already exists, and it is the only part
of this whole issue that is already producing.** On 2026-08-31, four machinery
proposals were filed in a single day:

| Proposal | Filed by | Job type | Route |
|---|---|---|---|
| `derived-batch-vs-sync-price-view` | `j-20260831-01` | scout | reviewer's verdict record |
| `blocked-primary-retry-ledger` | `j-20260831-03` | scout | reviewer's verdict record |
| `price-moves-invisible-to-the-changed-feed` | `j-20260831-04` | interpret | reviewer's verdict record |
| `un-gated-main-edits-bind-wholesale` | `j-20260831-11` | entry | the job itself |

Read the routes rather than the counts. Three of the four came through
`transcribeNotedProposal` — a **reviewer** noticing a defect in the machinery
while reviewing unrelated work, and writing it into its verdict record because
that is the one channel a review has once its edits are discarded. Each names a
measured defect with a reproduction. That is an inward-looking, evidence-driven
producer of machinery work, and it is doing exactly what a derived trigger would
have been built to do, without needing a rubric.

What it lacked was not a trigger. It was three days: cooling is measured on file
mtime and every one of those proposals is hours old.

The point is worth making exactly, because "0 consumed" is the number that makes
this look like starvation. **Every one of the five consumed proposals carries
`expires: 2026-09-07`; so does the only ripe live one; and no proposal without an
`expires:` key has ever been consumed.** `expires:` skips cooling entirely
(`loop/lib/proposals.mjs`), so it is the only route by which any proposal has yet
reached selection. The four machinery proposals correctly carry no `expires:` —
cooling filters *ideas* by whether they survive three days, expiry filters
*evidence* by the date it stops being news, and a machinery defect does not stop
being true in a week. They are on the slow path on purpose, and the slow path has
not finished.

The correct action for `machinery` is therefore to **change nothing and let the
existing channel run**, and to stop reading "0 consumed" as evidence about the
selector when no machinery proposal has ever been selectable.

Three honest caveats, recorded rather than smoothed over. The channel is
opportunistic — it produces when a job happens to notice something, and nothing
measures whether it produces at all (`addictedtoai-p805`). The selector's
treatment of a *ripe* machinery proposal is still unmeasured, because the
population has never existed. And proposals genuinely are priority 3, behind
directives and the entire derived queue with the upkeep floor above them, with no
decision on record that the machinery's own improvement work belongs last — which
is a real design question that today's measurements cannot answer either way
(`addictedtoai-wemx`). None of the three is a reason to build a rubric-driven
trigger now.

## D6 — Why the Pulse parses the curriculum itself

`pulse/lib/corpus.mjs` states the boundary in its own header: *"The build owns
schema validation and fails loudly on a malformed file. The Pulse deliberately
does not share that code and deliberately does not throw: it must keep the site
alive on a day when one content file is broken."* `coveredKeys` in
`pulse/lib/queue.mjs` already reads `content/blog/` directly for precisely this
reason rather than going through the build's loader.

So the Pulse gets its own reader. An absent `openspec/` directory, an unreadable
file, or a curriculum with no catalog section yields **no items** and stops
nothing — the Pulse must run on a machine where the build would fail. The same
file missing at build time is a single build error naming the curriculum path,
not 38 errors naming every page, because a reader who deleted the map needs to
be told that, once.

The cost of two readers is that two regexes can drift apart. That is answered by
measuring it rather than by breaking the boundary: `lib/learn.test.mjs` reads
the real `openspec/curriculum/learn.md` through both parsers and asserts the
slug lists are identical. If either changes, that test fails on the next `npm
test`, which is the cheapest place to find out.

## D7 — Scoping the parse to §4

The catalog entries are `#### \`slug\` — "Title"` headings. Parsing the whole
file for that pattern and parsing only the `## §4 — The catalog` section both
return the same 38 slugs today, measured. The parse is scoped to §4 anyway,
because the whole-file form is right by luck: a glossary item or an example
written as `#### \`some-term\`` anywhere else in a 1,379-line document would
silently become a phantom curriculum entry — and a phantom entry is a permanent
queue item for a page that must never be written, which is the stuck-item
failure the rank table works hard to avoid everywhere else.
