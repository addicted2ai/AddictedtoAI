# Measurements — `teach-the-whole-subject`

Task 6.2(d) requires the surface's completion claims to be recorded as
measurements with a date and a stated method, per the house rule that a claim
is a measurement. Everything below was measured on **2026-08-30 (local)**
against the working tree at commit `5dcf76b`, by a script that reads
`content/learn/*.md` front matter through `gray-matter` and replicates
`ladder()`'s sort — level index, then prerequisite depth, then slug — rather
than reading the rendered page. Re-runnable; nothing here is a recollection.

## (a) Coverage

| | |
|---|---|
| Entries named in curriculum §4 (`^#### \`slug\``) | **37** |
| Pages published in `content/learn/` | **37** |
| Named but unpublished | **0** |
| Published but unnamed | **0** |

The set equality is exact in both directions, which is the check the
`education-static` delta requires: *"the check is a read of the curriculum
against `content/learn/`, not anyone's recollection."*

## (b) Distribution

| Rung | Measured | Required by 6.2(b) |
|---|---|---|
| orientation | 8 | 8 |
| foundations | 11 | 11 |
| mechanics | 11 | 11 |
| advanced | 7 | 7 |
| **total** | **37** | **37** |

Exact on every rung. This matches the figure the sealed review derived
independently before any page of this change was written.

## (c) Order

| | |
|---|---|
| First page in generated order | `what-ai-actually-is` |
| Last page in generated order | `how-to-think-about-what-comes-next` |
| Pages preceding one of their own prerequisites | **0** |
| Prerequisites pointing up the ladder | **0** |
| Unresolvable prerequisite slugs | **0** |

The capstone lands last at **depth 8, alone in its band** — deeper than any
other page, so its position is a consequence of the graph rather than of the
alphabet. That is stronger than the change originally claimed: at the time the
sealed review checked, the capstone shared a depth band and the tie was broken
by title.

The in-order guarantee is the one the delta states as a scenario — *"every
prerequisite of every page they reach has already appeared earlier in the
order"* — and it holds for all 37 pages with no exceptions.

## Gates

Run serially on 2026-08-30 after the final page landed, per the
never-two-builds rule:

- `npm test` — **492 pass, 0 fail**
- `npm run build` — **succeeds**; 497 wiki routes plus every learn, tutorial,
  post, delta and tool route statically exported
- Corpus load — **0 errors, 0 warnings**

## What this does not measure

Coverage and order are structural. **They say nothing about whether the pages
are any good**, which is the editorial bar (`not-worth-reading`,
approachability, the sendable sentence) and is review's job, not a script's. A
surface can pass every check on this page and still fail the requirement that
every page contain a sentence a reader would repeat to someone else.

Nine pages also reported the same curriculum defect while being written —
must-cover prose naming learn pages that are not among that entry's
prerequisites, so following the instruction literally would be a
`spec-violation`. Each writer worked around it correctly and reported it; it is
filed as `addictedtoai-fc8` and is **not** closed by these measurements.
