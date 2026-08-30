# Design: make-the-blog-worth-sending

This document is the argument. The operative text is the five spec deltas and
`tasks.md`; a future model that disagrees with a choice should find its
reasons here and weigh them rather than silently reorganise. Every
measurement cited was taken 2026-08-30 by script over the named file, unless
it names an issue instead.

## D1 — What an award-winning blog is, on this site

The blogs on this subject that people actually send each other do a small
number of things, and they do them recognisably:

- **They react to events with judgment, fast.** The value is never the
  announcement — every newsletter has that — it is the announcement plus what
  it means plus a measurement nobody else took.
- **They synthesise accumulated events into a shape.** "You missed forty
  things this month; here is what they add up to."
- **They have memory.** Posts cite earlier posts; threads develop; a claim
  made in March gets revisited in August. A reader returns to a blog that
  remembers, and sends the piece that pays off something they half-noticed.
- **They show receipts nobody else has.**
- **They say who is affected and what to do.** The previous site's best
  reflex: *"if you use Manus, read this paragraph first."*

Now the lens of this site. Its one asset no human blogger has is the
**Pulse**: a deterministic observer that snapshots its sources on a clock,
diffs them, and appends dated, sourced, excerpted event lines to
`data/changes.jsonl`. The site holds byte-exact records of what the model
economy's own pages said, and when they changed. That makes one specific
award-worthy identity available that is available to nobody else at this
price: **the blog of record for the observable AI economy** — the surface
where a retirement, a repricing, a licence swap or an arrival is witnessed
with primary evidence, dated to the day it was observed, and told with its
consequences. The existing five posts already prove the receipts half
(`same-catalog-same-day` is genuinely good forensics); what is missing is
everything event-shaped, everything with an actor, and everything with a
reader's stake in it.

So the definition this change builds toward: **every post is either a news
note — an event, witnessed, with who it lands on — or a synthesis — recorded
evidence assembled into a shape no single event shows — and every post
passes the test of being worth sending to a specific person.** What the blog
refuses to publish is equally definitional: the unanchored survey written
because the catalog was there to survey, the summary of an announcement
every newsletter covered, and anything correct, sourced, and forgettable.

## D2 — Two ends, two producers, and why they are different mechanisms

The maintainer values both ends. They have structurally different causes, so
they get structurally different producers:

- **A news note is caused by an event.** The cause is already recorded as
  data by the Pulse. So the producer is the derived queue — the same pattern
  as `interpret`, which already turns "the world changed" into "a job should
  judge it." The queue mechanically detects *that something happened*;
  whether it is worth a note is judgment, and judgment is the job: a
  `blocked: not worth a note` outcome is a success, exactly as the executor
  protocol already treats honest blocks. The queue never scores
  noteworthiness — scoring is guessing, and the Pulse never guesses.
- **A synthesis is caused by a model noticing accumulated shape.** No
  deterministic predicate detects "enough events have piled up to mean
  something." The designed home for that is the proposal channel — specified
  since the founding change as "the only model-originated source," consuming
  side complete and tested, producing side never built (`addictedtoai-6ov`).
  This change wires it, because the synthesis end has no other plausible
  trigger.

Why notes must not go through proposals: proposals cool for 3 days by spec,
and news decays — a note about Tuesday's retirement published Saturday is not
news. Why syntheses must not come from the queue: the queue is recomputed
pure state, and "I have noticed a shape" is not derivable state; putting it
there would mean either a model in the Pulse (forbidden, structurally
enforced) or a fake determinism that scores corpus "quality" on a rubric
(rejected in D7).

**Candidate mechanics, and the numbers behind them.** Measured supply: 90
lines in `data/changes.jsonl`; the 60 seeded `release` events average 1.05/day
over their 57-day span with 30 of 57 days carrying at least one; the single
live diff day so far (2026-08-29) produced 29 world events at once — 2
retirements, 10 arrivals, 17 field changes. Two consequences are designed in:

1. **Grouping.** 8 input-price and 8 output-price changes on one day are not
   sixteen stories. Candidates group deterministically by (source, date,
   kind, vendor), so three ids retired by one vendor on one day are one
   candidate carrying three lines. Grouping is the only editorial-shaped
   decision the Pulse makes, and it is a total function of recorded fields —
   no judgment, no model.
2. **Expiry.** Candidates derive from the trailing 7 days only, so the queue
   cannot backlog with stale news — the derived-queue property applied to
   events. An uncovered candidate expiring is the system working: the bar
   declined, and news the bar declined decays instead of accumulating into
   the work-ledger failure that killed the previous site.

Coverage is a mechanical join: a published post declares the change-feed
keys it covers (`covers:` front matter), and a covered group stops being a
candidate. The join deliberately suppresses candidates only — two posts may
cite the same event (a note, then a synthesis) without conflict.

## D3 — The anchor: the uncapped lane requires evidence a model cannot create

The requirement that a news note declare its anchor — change-feed keys that
must resolve against `data/changes.jsonl`, or an external primary source
whose date the build checks and whose content review fetches — is the
load-bearing mechanism of this whole change, so its property is worth
stating exactly:

**`data/changes.jsonl` is written only by the deterministic, model-free
Pulse.** A model cannot manufacture a feed line; it can only cover one that
the world caused. So the one publishing lane with no count ceiling is the
lane whose admission ticket is evidence the author cannot create. The
external-anchor variant is admittedly weaker — a URL is claimable — which is
why its date-window check is mechanical (build) and its existence-and-content
check is the review step's existing fetch-and-confirm duty, which is already
mandatory for every external claim in a post. An anchor that does not hold is
`false-or-unsupported-claim`, the closed list's oldest reason.

This converts the biggest component of the worthiness bar — *did anything
actually happen?* — from vibes into a checkable claim, which is the answer to
the strongest objection to bar-only control (see D4).

## D4 — The rate control: where this change dissents from both positions

The maintainer's position: ceiling and floor are both wrong; the right
control is a worthiness bar, which prevents slop and still allows bursts.
The counter-argument he was given: a bar is only a control if the thing
evaluating it doesn't want to pass, and this repository prefers mechanisms
over instructions.

This change takes a third position: **both are right about the other's
weakness.** The fixed 3-in-7 ceiling is a mechanism aimed at the wrong
variable — it counts posts when the failure mode is a *genre*. A blog of
record that hits a count ceiling in the week five real things happen goes
silent at exactly the moment it earns its name; the old spec's stated
purpose, "a capacity glut converts to depth rather than volume," does not
even apply to notes, because a glut of capacity cannot manufacture events.
And the pure bar is an instruction aimed at the right variable — the review
gate's own spec is honest that no mechanical check can compel judgment, and
an author-reviewer pair that wants to publish will publish.

So the control moves to the variable that distinguishes the genres and is
mechanically checkable: **the evidence class.**

- **Anchored notes: no count ceiling.** Rate-limited by the world (one
  candidate group, one note; 7-day expiry) — and still bounded in spend by
  two untouched mechanisms this change deliberately leans on rather than
  duplicates: the new-writing model-minute ceiling (45% of tier MM, enforced
  by the selector) and capacity shedding, which sheds `post` first. "No
  ceiling" never means unbounded; it means the binding constraint is minutes
  and events, not an arbitrary count.
- **Unanchored posts: 1 in any rolling 7 days**, down from 3. The
  manufacturable genre — the catalog is always there to survey — is capped
  *tighter* than today, and the scarcity is intended to convert to depth in
  exactly the way the old ceiling hoped volume-capping would. Same named
  enforcement point (the selector), same build warning, so the enforcement
  machinery moves rather than grows.

Dissent recorded on the supply claim too: the maintainer finds it *"hard to
believe that there isn't likely at least one good topic to write about a
day."* Measured, the current aperture does not carry that: 1.05 events/day
on average, 53% of days with any event at all, most events routine catalog
rows, from exactly two registered sources (`openrouter-models`,
`llm-releases` — measured from `data/sources/registry.json`). One good topic
a day is reachable, but the lever is aperture (more Pulse sources: more
deprecation pages, licence files, status pages, changelogs), not exhortation
— and widening the aperture is routine source-registry work needing no spec
change, deliberately left out of this one (D7). The no-floor rule survives
untouched for the same reason it was written: zero posts in a slow week is
the bar working.

## D5 — Sendability: add, don't replace — and why posts specifically require it

`addictedtoai-18c` traced the felt difference between the old blog and the
new one to a single substitution: the old author track's *"publish something
a stranger would SEND to someone else"* became the spec's *"could paste this
URL as support."* You send a story; you cite a reference. All three current
editorial tests are satisfiable by an actor-less table, and the five posts
are the proof by construction.

The fix follows the issue's own direction — add alongside, never replace —
because would-cite was written against the previous site's real failure
(accurate and unread reference prose) and the cut list is doing daily work.
The third test becomes worth-linking-**or**-worth-sending. For the general
corpus this is a strict widening: entries pass exactly as before. The named
failure from the old prompt comes with it, as a normative sentence, because
it is the sharpest available statement of the bar: correct, sourced, and
forgettable is a failure, not a near miss.

For **posts**, this change goes one step further than the issue's
"blog prefers sendable": a post must *pass* the send test — citable alone
does not publish a post. Preference without mechanism is how a monoculture
persists; and the cost of the stricter reading is low, because the send test
is not a genre test — a census with a genuinely sendable finding (the
1,000×-on-price headline) passes it easily. What dies is exactly and only
the survey with no finding anyone would forward.

The review-side change is deliberately minimal: the post checklist verifies
form, anchor and affected party, and the post's `would-cite` record answers
"who would send this, and to whom" — same field, same mechanics (non-empty,
non-duplicated), so the merge gate's careful machinery around blank values
is reused rather than duplicated.

## D6 — The proposal producer, and the self-amplification guard

The wiring itself is small (two brief sections, a transcription step) and is
specified in the loop delta. The design decisions worth defending:

- **"At most one" is enforced by the loop, not requested of the model.** A
  merged branch that added several proposal files keeps exactly the first by
  filename; the rest are discarded with a note. Deterministic, ugly, and
  honest — the same shape as discarding the reviewer's edits.
- **Proposals ride the merge.** A proposal written on a branch that is
  discarded dies with the branch. The alternative — salvaging ideas from
  rejected work — is laundering: it lets a failed job's judgment survive the
  failure of the work that judgment produced.
- **The loop stamps the proposing job's type onto the proposal at merge**,
  overwriting whatever the executor wrote, and a proposal whose stamped type
  equals the type it proposes is auto-discarded on the same terms as a
  rejected-slug duplicate — mechanically, spending no inference. The
  requirement's own title is the rule: work sources cannot self-amplify, and
  a `post` job proposing more `post` jobs is self-amplification in its
  purest form. Cross-type noticing — an `interpret` job that has read three
  weeks of licence churn proposing a synthesis post — is the designed path
  and the entire point. The maintainer's route (dropping a file in
  directly) is untouched: no proposing job exists, so the rule cannot apply.
- **Side effect worth naming:** wiring the producer gives all five
  previously trigger-less job types (`tutorial`, `post`, `education`,
  `prune`, `machinery`) their first model-originated route, which is a
  partial answer to `addictedtoai-3zf` — obtained by finishing a mechanism
  the constitution already specified rather than by inventing a new one.

## D7 — Considered and rejected

- **A separate news surface.** Rejected, agreeing with `addictedtoai-18c`:
  one post every few days split across two surfaces is two half-dead
  surfaces; the old blog carried the whole range in one; and the cost side
  (capability spec, routes, feed, schema, floors, nav, plus a permanent
  "news or blog?" judgment nobody answers consistently) is all still true.
  The issue's revisit trigger stands: if dated actor-driven items ever
  exceed what the blog can carry, reopen.
- **Noteworthiness scoring in the Pulse.** A ranked "how interesting is this
  event" signal would put judgment in the engine that is defined by having
  none. The Pulse detects and groups; the bar decides. The queue item's rank
  expresses only the standing rule that the site's truth (repairs, verifies)
  outranks new writing.
- **A cadence floor, any form.** "One good topic a day" as a target is how a
  blog fills with censuses; the previous site is the counterexample of
  record, and `addictedtoai-3zf` already names quota triggers as the thing a
  fix must not do.
- **Removing the ceiling entirely (the pure-bar position).** Rejected above
  (D4), with the dissent recorded: the repository's own review spec admits
  no mechanical check can compel judgment, so at least one control must not
  depend on the judge.
- **Routing notes through proposals.** 3-day cooling kills news (D2).
- **`interpret` annotations as the note trigger** (annotation says "this
  matters" → candidate). Rejected: it chains two model judgments where one
  suffices, adds a day or more of latency, and `interpret` draws from a
  14-day window measured against materiality, not note-worthiness. The two
  jobs stay siblings drawing on the same feed.
- **Exclusive coverage** (build-fails a second post citing a covered event).
  Rejected: the join exists to stop candidate re-issue, not to forbid a
  synthesis from citing events its notes covered. Suppression, not
  exclusivity.
- **Widening the Pulse aperture in this change.** It is the right lever for
  the maintainer's one-a-day instinct, and it is routine source-registry
  work, not a rule change; bundling it here would couple a spec change to
  operational tuning. Filed as its own issue at execution time (task 5.3) —
  not buried here, per the deferral rule.
- **Prediction tracking** (posts register falsifiable claims; a later job
  scores them). The award-blog "memory" property, mechanised. Genuinely
  attractive, genuinely a new subsystem; the cheap 80% is the
  prior-post-linking requirement, which costs one brief-assembly step and
  one review check. The rest waits until the blog has enough posts for
  threads to exist.
- **A `news` job type distinct from `post`.** The closed job-type list would
  grow for zero mechanical gain: both forms are `post` jobs distinguished by
  their evidence, which the brief already carries.

## D8 — What this change is least sure about

Recorded for the reviewer and the maintainer, because the uncertainty is
part of the artifact:

1. **The unanchored ceiling's number (1-in-7) is a judgment call.** The
   argument for 1: scarcity converts to depth, and the measured corpus shows
   the genre is manufacturable at will (five in fourteen days, all
   human-directed). The argument for 2: a genuinely great synthesis pair
   (the licence piece and the retirement piece landed 8 days apart) would
   have been throttled. The mechanism is indifferent to the constant; the
   maintainer should feel free to set it at 2 before execution. What this
   change is sure about is the *shape*: unanchored capped, anchored not.
2. **The grouping key (source, date, kind, vendor) may split or lump
   stories.** A vendor repricing on two consecutive days is two candidates;
   ten unrelated vendors arriving one day are ten. Both errors are cheap —
   the job may write one note covering several groups (declare all their
   keys), and a group nobody wants expires — but if lumping errors dominate
   in practice, the key is one line of the derivation to change, and the
   spec states the property (deterministic, story-shaped) rather than the
   tuple for exactly this reason. The tuple lives in `tasks.md` and the
   implementation.
3. **Whether directive-sourced posts should count in the unanchored lane.**
   This change says yes unless the directive names an anchor, on the
   principle that the lane is about evidence, not authorship. But directives
   are the maintainer's channel, and a maintainer who wants three surveys in
   a week arguably outranks the lane. The selector refusal will name its
   rule either way; overriding it is one directive-line edit
   (`[anchored: <key>]`) rather than a spec fight.
4. **The send test's wording resists mechanisation on purpose.** "Would send
   to a specific person with no more explanation than 'look'" is judgment,
   asked through the same one mechanism the repository already trusts for
   judgment questions (the non-empty, non-duplicated record field). If the
   reviewer population turns out to wave everything through, the fix is
   review-side (a stricter reviewer runner), not more bar prose.
5. **Latency between event and note is bounded by Desk cadence, which this
   change does not control.** With the Desk running daily and candidates
   ranked below repairs, a busy repair week could delay a note past its
   7-day expiry. That is the designed trade (site truth first, news decays)
   — but if the live measurements in task 5.2 show notes systematically
   expiring unwritten, the rank, the window, or the Desk schedule is the
   lever, in that order.
