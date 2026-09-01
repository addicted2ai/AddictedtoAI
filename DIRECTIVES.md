# DIRECTIVES.md — the maintainer's work, first in line

The highest-priority of the loop's three work sources (`specs/loop`). Write
one directive per list item; the Desk takes them before the derived queue and
before proposals. Nothing else writes to this file except the completion
marker described below.

**Form — one line per directive, job type first:**

```
- <job-type>: <what you want done>
```

`<job-type>` is one of the closed list in `specs/loop`: `interpret`,
`verify`, `entry`, `tutorial`, `post`, `education`, `repair`, `prune`,
`machinery`. The type is required because every selector rule — the budget
ceilings, the upkeep floor, the wall-clock cap, capacity shedding, the blog
ceiling — is keyed by it. A line without a recognised type is **skipped with
a loud warning naming the line**, never guessed at: guessing the type would
spend the wrong budget under the wrong cap.

**Completion marker.** When a directive's job completes, the loop appends
`[done <date> <job-id>]` to that line and skips it forever after. A directive
is never silently re-run. Removing finished lines is yours, at leisure.

```
- repair: the OpenRouter link on the pricing entry 404s [done 2026-09-03 j-20260903-01]
```

---

<!-- directives below this line -->

- verify: re-verify the five cited facts on `org/z-ai` against their sources. Fetch each `source_url` and confirm the page still says what the fact claims, then update `accessed` where it holds and report anything that no longer matches rather than quietly correcting it. This is upkeep, which the specs rank above new writing for a reason: a fact that has drifted is worse than a fact that is missing. [done 2026-08-29 j-20260829-02]

- entry: write a prose body for `org/z-ai`. Its record already carries five sourced facts and five dated timeline events and no prose at all, so this is writing rather than research — read what the record already establishes and find the story in it. Apply the editorial bar in `specs/editorial`: it must give an enthusiast something they did not know or assemble scattered things for the first time, be specific with dates and numbers and mechanisms, and be worth linking. Do not restate the facts table in sentences — that is on the cut list. Every new claim needs a source you actually fetched. [done 2026-08-29 front-load wave, branch fl/orgs commit 8df93fd — written by a hand-spawned agent, NOT by a loop job, so there is no job id to name; see beads addictedtoai-g1l]

- entry: re-review `content/wiki/model/moonshotai-kimi-k2-5.md`. Its approval record (`data/reviews/j-20260831-10.md`) was written against bytes that have since changed, so `verify-launch` reports the piece `REVIEWED THEN CHANGED` and the launch minimums are not met. Read the entry as it now stands and judge it on its own terms; this is a re-review, so the page may well need no edit at all. Confirm in particular that the opening no longer rests on the vanished `expiration_date` feed field, that the `deprecated`-versus-`active` disagreement between this page and the derived catalog row is still explained rather than asserted, and that no row-count census is stated without an anchor the page's own transclusions share. Context, offered as context and not as a conclusion to accept: the entry was authored and approved by job j-20260831-10, then edited under `addictedtoai-7q8`, which replaced a flat "388 rows in the OpenRouter snapshot" census with a qualitative claim needing no date. That edit was made directly on `main` by a repair sweep and so never passed the review gate, which is why this line exists. Written by the orchestrator rather than the maintainer, because a `mismatched` record cannot reach the derived queue (`addictedtoai-ccky`) and this is the only input that reaches the Desk. [done 2026-08-31 j-20260831-11]

- entry: re-review `content/wiki/model/moonshotai-kimi-k2-5.md` again. Its most recent approval (`data/reviews/j-20260901-14.md`) was written against bytes that have since been reverted, so `verify-launch` reports the piece `mismatched` and the launch minimums are not met. Read the entry as it now stands and judge it on its own terms; a re-review may legitimately conclude the page needs no edit at all. The specific thing to weigh: the page declares `status: deprecated` while the derived catalog row reads `active`, and the body explains why — Moonshot's documentation files `kimi-k2.5` under "Deprecated Models" and says calls return a 404, while OpenRouter cleared the expiry its catalog status derives from. Judge whether the page explains that divergence rather than merely asserting it, and whether a reader who wants to know "can I call this model" is answered. Context, offered as context and not as a conclusion to accept: job j-20260901-14 flipped this field to `active` and rewrote that paragraph to follow the router; the orchestrator reverted both under `addictedtoai-qupq`, because `addictedtoai-ij4h` had measured all 396 feed-bound entries days earlier and ruled that a stub's status derives from its feed while a reviewed entry's authored claim stands. You are not being asked to ratify that revert — you are being asked whether the page as it stands is sound. Written by the orchestrator because a `mismatched` record still cannot reach the derived queue. [done 2026-09-01 j-20260901-15]
