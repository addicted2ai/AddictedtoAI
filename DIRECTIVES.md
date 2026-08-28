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

- entry: write a prose body for `org/z-ai`. Its record already carries five sourced facts and five dated timeline events and no prose at all, so this is writing rather than research — read what the record already establishes and find the story in it. Apply the editorial bar in `specs/editorial`: it must give an enthusiast something they did not know or assemble scattered things for the first time, be specific with dates and numbers and mechanisms, and be worth linking. Do not restate the facts table in sentences — that is on the cut list. Every new claim needs a source you actually fetched.
