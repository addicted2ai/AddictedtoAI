# Contract: judge-structure

Dimensions owned: **TABL — list and table craft (15)**, **RESP — responsive integrity at 390 / 768 /
1440 (10)**. Model: Opus (K13).

Reads (exactly): the packet under evaluation, `RULES.md` R7, R8, R10–R13, R15 and addenda,
`JUDGE.md` § Known evidence lies, `graph/contracts/judge-discipline.md`, the evidence named below.
You do NOT read the token file or judge typography, colour or identity: those are judge-system's.
Writes: `graph/artifacts/JV-struct-<packet>-<v>.json`.

## Required evidence (rig coverage gate reads the `coverage:` line)

coverage: labels=table-catalog,home,data,index-wiki,index-tools,index-blog,index-learn,index-tutorials,index-routine,wiki-entry,wiki-model; themes=light,dark; viewports=1440,768,390; files=invariants.txt,verify-design.txt

Screenshots `evidence/<set>/<label>--<theme>--<viewport>.png` for labels `table-catalog`, `home`,
`data`, `index-wiki`, `index-tools`, `index-blog`, `index-learn`, `index-tutorials`, `index-routine`,
`wiki-entry`, `wiki-model`, `frontier` (when built), themes light and dark, viewports 1440, 768 and
390. Text: `evidence/<set>/invariants.txt` (the `tools/ui-invariants.mjs` run for this build) and
`evidence/<set>/verify-design.txt`. A measured quantity is READ from those files, never estimated
from pixels; the pixels confirm what the number says. Blind to: hover, focus, motion, scrolled
states (a `capture: viewport` entry shows the first viewport only).

## Questions

1. `[TABL]` **(critical)** On `/catalog` at 1440, do the column labels stay inside their corridor and
   clear of the sticky header while the table is read (invariants S7/S11 clauses), and on `/tools`
   do shared columns align page-wide within 1px (S19, R13)?
2. `[TABL]` Does each row give its highest visual weight to the value that differs between rows,
   with repeated non-discriminating values quieter (R8 addendum, S17)?
3. `[TABL]` At 390, is the catalog usable: every record's name, prices and status readable, every
   row reachable without a route change; and does the concept materially reduce the scroll from the
   93,963px baseline (R-D) while staying one addressable page?
4. `[RESP]` **(critical)** At 390, 768 and 1440: no page-level horizontal scroll (verify-design
   reflow line), no collapsed hierarchy, wide content scrolling inside its own container?
5. `[RESP]` Does 768 hold as its own layout rather than a stretched phone or a squeezed desktop?
   (First captures ever at this band; say what you saw.)
6. `[TABL]` Do rules and dividers span the content they divide, not the shell (R10, S5)?
7. `[RESP]` Are dead tracks absent: no two-column grid whose shorter column is under 60% of the
   taller (R13, S18)? Read the S18 line in `invariants.txt`, then confirm in the screenshot.
8. `(meta)` Self-check: did any verdict rest on a number you estimated rather than read? Excluded
   from scoring.

Concept round: judge-structure does NOT sit on the concept-round panel (nothing is built yet); its
first verdict is on the built finalists.
