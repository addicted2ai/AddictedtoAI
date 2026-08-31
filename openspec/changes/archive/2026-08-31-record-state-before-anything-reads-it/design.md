# Design: record-state-before-anything-reads-it

Three decisions had to be made while writing this change, and none of them is
about the implementation — that shipped. They are about how the delta is shaped
so that archiving it does not break something else.

## D1 — `loop` gets ADDED requirements, not MODIFIED ones

The draft patch this change started from (`specs-reconcile-2026-08-31.patch`)
put both loop behaviours **inside existing requirements**: the ledger paragraph
went into *"One job is one outcome with one merge or discard"*, and the
proposal-retirement paragraph went into item 3 of *"Work comes from three
sources and cannot self-amplify"*.

Both of those requirements are **already being modified by an unarchived
change**. `openspec/changes/make-the-blog-worth-sending/specs/loop/spec.md`
carries `MODIFIED` blocks for exactly those two headings (its lines 28 and 77),
because the scout needed `scout` added to the closed job-type list and needed
the proposal rules extended. An OpenSpec `MODIFIED` block replaces the whole
requirement body on archive. Two changes modifying the same heading is
last-writer-wins: whichever archived second would silently delete the other's
sentences, and nothing in `openspec validate --strict` would notice, because it
validates one change at a time.

So the loop delta **adds two requirements** instead. This is not a workaround
dressed up as a principle — both are genuinely separate normative statements
about *ordering* and *retirement*, not amendments to what a job is or where work
comes from, and each one names the requirement it sits beside. The result is
order-independent: this change and `make-the-blog-worth-sending` can archive in
either order.

## D2 — `pulse`'s publish requirement must be MODIFIED, and there is no way around it

The same trick does not work on `pulse`. The reason this change exists at all is
a sentence in an existing requirement that the shipped code **contradicts**:

> **When `publish` is `false`** … the Pulse SHALL skip the publish step entirely

An added requirement cannot repeal a `SHALL` in another one; it would just
produce a spec that says two incompatible things and leave a later reader to
guess. So *"The Pulse publishes what it builds"* is modified, in full.

The risk D1 identified is checked rather than assumed:
`make-the-blog-worth-sending`'s `pulse` delta touches *"Once per day, the Pulse
queues the scout"* (added) and *"The work queue is derived, never accumulated"*
(modified) — **not** the publish requirement. No collision.

## D3 — What is pinned as a requirement, and what is left as implementation

Three of the shipped behaviours are things the fix deliberately did **not**
change, and each was a live temptation at the time:

- An **undeclared** caller still commits nothing outside a publishing run.
  Extending a wholesale `git add data content public` to every non-publishing
  run would have invented a new hazard while fixing an old one — it is the exact
  shape of `addictedtoai-ps3`, where a scheduled Pulse swept an agent's
  half-finished `data/launch.json` into its own commit and pushed it live.
- A **hold** suspends the push only. `HOLD.md`'s own text says *"The Pulse keeps
  running; only its deploy step is suspended"*, and a hold is a deploy failure,
  not a reason to leave a computed run out of git.
- The **build gate comes first**. Publish runs after the site rebuild, so a run
  producing content the build rejects neither commits nor publishes it.

Each is written as a normative sentence rather than left in a code comment,
because all three are *absences* — behaviour that is correct because something
does **not** happen — and an absence with no requirement behind it is one
refactor away from being "cleaned up".

What is deliberately **not** lifted into the spec: the internal shape of the
step (two named phases, the `commit`/`publish` step names in the log, the
`reason` strings on the returned object). Those are how this implementation
happens to satisfy the requirements, and a spec that pinned them would forbid a
better implementation for no gain.
