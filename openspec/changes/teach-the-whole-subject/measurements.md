# Measurements — `teach-the-whole-subject`

Task 6.2(d) requires the surface's completion claims to be recorded as
measurements with a date and a stated method, per the house rule that a claim
is a measurement. Everything below was **re-measured at HEAD on 2026-08-30
(local)**, by a script that reads `content/learn/*.md` front matter through
`gray-matter` and replicates `ladder()`'s sort — level index, then prerequisite
depth, then **title** — rather than reading the rendered page. Re-runnable;
nothing here is a recollection.

> **Re-run 2026-08-30 after the final review.** The first version of this record
> measured commit `5dcf76b` and reported **37** pages. That was honest when
> written and stale within hours: `machines-that-act-in-the-world` was added to
> the curriculum and written afterwards, and nothing forced this file to catch
> up. Three figures moved — the total (37 → **38**), the foundations row
> (11 → **12**), and the capstone's depth (8 → **9**). Every *conclusion* below
> survived the change, which is the point worth recording: the coverage
> equality, the in-order guarantee and the capstone's position follow from level
> and depth, not from the totals. The final review caught the staleness by
> re-running the script instead of reading the table; the numbers here are that
> re-run, independently reproduced.

> **Corrected 2026-08-30.** The first version of this record said the final
> tiebreak was the **slug**. It is the title: `lib/learn.mjs:114` sorts on
> `d.get(a.slug) - d.get(b.slug) || a.data.title.localeCompare(b.data.title)`.
> The orientation reviewer caught it by checking the code rather than trusting
> the brief it was given, which had the same error.
>
> Every result below is unchanged — first page, last page, zero in-order
> violations, zero up-the-ladder edges and exact coverage are all determined by
> level and depth, not by the tiebreak. What *was* wrong is the printed reading
> order in two depth bands: foundations d2 and mechanics d4 each reorder under
> the correct sort. The figures were right for the wrong reason, which is worth
> recording as plainly as a wrong figure would be.

## (a) Coverage

| | |
|---|---|
| Entries named in curriculum §4 (`^#### \`slug\``) | **38** |
| Pages published in `content/learn/` | **38** |
| Named but unpublished | **0** |
| Published but unnamed | **0** |

The set equality is exact in both directions, which is the check the
`education-static` delta requires: *"the check is a read of the curriculum
against `content/learn/`, not anyone's recollection."*

## (b) Distribution

| Rung | Measured | Required by 6.2(b) |
|---|---|---|
| orientation | 8 | 8 |
| foundations | 12 | 11 |
| mechanics | 11 | 11 |
| advanced | 7 | 7 |
| **total** | **38** | **37** |

Exact on every rung except foundations, which carries one more page than 6.2(b)
required. The extra is `machines-that-act-in-the-world`, added to the curriculum
on 2026-08-30 to cover embodiment — a named gap in area A that the original
catalog did not fill. The task's figure is left as written rather than
back-edited, so the difference between what was planned and what shipped stays
visible.

## (c) Order

| | |
|---|---|
| First page in generated order | `what-ai-actually-is` |
| Last page in generated order | `how-to-think-about-what-comes-next` |
| Pages preceding one of their own prerequisites | **0** |
| Prerequisites pointing up the ladder | **0** |
| Unresolvable prerequisite slugs | **0** |

The capstone lands last at **depth 9, alone in its band** — deeper than any
other page, so its position is a consequence of the graph rather than of the
alphabet. That is stronger than the change originally claimed: at the time the
sealed review checked, the capstone shared a depth band and the tie was broken
by title.

The in-order guarantee is the one the delta states as a scenario — *"every
prerequisite of every page they reach has already appeared earlier in the
order"* — and it holds for all 38 pages with no exceptions.

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
