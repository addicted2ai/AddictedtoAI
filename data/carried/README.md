# data/carried/

Findings a reviewer recorded but did not block the merge on (beads
addictedtoai-2bo). One markdown file per finding, written by
`loop/lib/carry.mjs` at merge from a verdict record's `carry:` block — never
by hand, and never by a reviewer directly (a reviewer has no edit rights).

Each file's front matter carries a `title` (the queue item's title — never
its `detail`, which is review prose and can run long), an optional `subject`
(the one content file the finding concerns), and the reviewing job's id as
`origin`. `pulse/lib/queue.mjs` reads every file here into the derived queue
on each Pulse run, at a deliberately low rank (`carried-finding`, 25).

**A file's presence is the state.** There is no separate "resolved" flag and
no merge-step bookkeeping to retire one: the job dispatched to fix a finding
deletes the file that names it, as part of the same diff, and the next Pulse
run stops emitting the item because nothing is left to read — the file
itself carries this instruction under its own "Retiring this item" heading.
This is the same "leaves the queue the moment the underlying state is fixed"
rule every other queue class already follows (specs/pulse), not a new one.
