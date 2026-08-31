# data/reviews/

Review verdict records (`specs/review`). One file per reviewed piece:
`seed-<slug>.md` for launch seed content, `<job-id>.md` for Desk jobs. Each
records the verdict and its reasons from the closed list, plus — for prose —
the required non-empty `would-cite` field. The merge step refuses without a
recorded `approve`, and refuses an `approve` whose `would-cite` is empty.

`evidence/` holds transcripts and captured outputs that back a verdict (for
example the real runs behind a tutorial's shown output).

A record may also carry `carry:` — zero or more small findings the reviewer
noticed but did not block the merge on (beads addictedtoai-2bo). Each needs
its own `title` and `detail`; `loop/lib/carry.mjs` transcribes every entry
into `data/carried/` at merge, and `pulse/lib/queue.mjs` reads that directory
into the derived queue. This is distinct from `proposal:`, which is a
job-sized idea; a carry is a correction too small to be one.
