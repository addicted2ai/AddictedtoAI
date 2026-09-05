# ui-loop iteration 1 — implementation queue

Scope: the SHARED DESIGN SYSTEM only — `app/globals.css` and `app/layout.tsx`.
Do not edit any page template, any component, `content/`, `data/`, `public/`,
or any user-facing string. Seven items, merged from the two iteration-0 verdicts
(`iter-00-a.json`, `iter-00-b.json`) and trimmed by the keeper (KP2).

Items marked **found by both judges** were filed independently by two judges over
the same evidence; they are the most robust findings in the set.

Every field below is VERBATIM from the verdict. The `problem` is authoritative;
the `prescription` is a hypothesis you may decline with cause. Satisfy the
`invariant`.

---

## S1 — Row surfaces have no measure; the name column absorbs the whole shell

**impact 8** · **found by both judges**

### source: `iter-00-a` item I1 (impact 8)

**problem** — Row-based list surfaces have no measure. The token system defines only --measure (38rem) for prose and --shell (76rem) for the page shell, with nothing in between, so every list row stretches to the full 1216px shell and its metadata is pushed to the far right edge. On /tools the jump list sets the word 'agents' at x=145 and its count '2' at x=1280 - 1135px of empty space bridged only by a hairline. On /wiki the entry name sits at the left edge and its type plus status badge at the right, up to 1100px away, for 95 consecutive rows. On /data eleven rows separate a title from its file path across roughly 700px. The reader must traverse the full viewport width to bind a name to the one fact that qualifies it, on the site's primary navigation surfaces. The 390px capture proves the association is achievable: at that width the type label moves directly under the name and left-aligns, so the mobile treatment reads better than the desktop one.

**invariant** — On any row-based list surface, the horizontal gap between a row's primary label and its right-most metadata cell is at most 24rem; equivalently, list rows are constrained to a list measure token rather than defaulting to --shell.

**governing_rule** — None

**prescription (HYPOTHESIS)** — Add a third width token (e.g. --measure-list: 46rem) between --measure and --shell and apply it to the /tools category jump list, the /wiki index rows and the /data resource rows; or keep full width and move the metadata to a fixed column immediately after the longest label rather than right-aligning it to the container edge. Checked R1-R6: none governs measure, so no rule constrains this remedy.

**evidence** — loops/ui-loop/evidence/current/index-tools--light--1440.png, index-wiki--light--1440.png, data--light--1440.png, index-wiki--light--390.png

### source: `iter-00-b` item I4 (impact 7)

**problem** — .browse-row is 'grid-template-columns: minmax(0, 1fr) auto auto', so the name column absorbs the entire shell and welds the type and status cells to the far right edge. On /wiki at 1440 the entry name ends around x=215 and its type ('concept', 'org', 'model') begins around x=1170 — roughly 950px of empty row between a value and the attribute that describes it, repeated for 85 rows. The reader must traverse the full page width to associate each name with its kind, or track along a rule. The same shape recurs on /data, where 'Entries — identity, lifecycle, indexability' sits at the left margin and '/dataset/entries.csv' at the right with about 700px of nothing between. That the layout is wrong rather than merely wide is settled by the site's own 390px rendering of the identical component, where name and badge sit adjacent and the row reads correctly, and by /colophon, whose Records/Catalog/Change-history block packs label and value into a tight left-aligned pair. The system already contains the right idiom and the index templates use the wrong one.

**invariant** — In a two-value list row, the horizontal gap between the end of the primary value and the start of its associated attribute shall not exceed the width of the primary value column's longest entry.

**governing_rule** — null — checked R1 through R6; none constrains column distribution. The remedy narrows a grid and cannot affect R2, which the row already satisfies.

**prescription (HYPOTHESIS)** — Change .browse-row to a bounded track set — e.g. 'minmax(0, 32rem) auto auto' with 'justify-content: start' — so the name column stops at its content and type and status follow immediately after it, leaving the residue at the right of the row rather than inside it. Apply the same bounding to the /data listing rows.

**evidence** — loops/ui-loop/evidence/current/index-wiki--light--1440.png, data--light--1440.png, index-wiki--light--390.png, prose--light--1440.png

---

## S2 — Structure is carried by borders, and the DEFAULT state is boxed

**impact 8** · **found by both judges**

### source: `iter-00-a` item I3 (impact 7)

**problem** — Separation is carried by borders rather than by rhythm, and the default state is boxed. Every row on every list surface carries a hairline rule: 24 on the home feed, 95 on /wiki, 396 on /catalog, 12 on the /tools jump list, 14 on /data. The catalog table is additionally wrapped in a full outer box border, making it read as a card. On top of that, a bordered status pill is drawn on every single row including ACTIVE, which is roughly 70% of /wiki and nearly all of /catalog - 396 plus 95 boxes spent marking the unexceptional case, which leaves the exceptional case (DEPRECATED, RETIRED, DEAD) no more visually prominent than the norm. The wiki entry header adds five bordered pills in a row in two colour families.

**invariant** — A list surface draws a rule only at a group boundary, not between every pair of sibling rows; and a status marker is rendered as a bordered box only for non-default states.

**governing_rule** — RULES.md R1

**prescription (HYPOTHESIS)** — Drop the per-row hairline on /wiki, /tools and /data and let uniform row height plus a consistent left edge carry the separation, keeping a rule only where a category changes. Drop the catalog's outer table border. Render ACTIVE as plain muted small-caps text with no border and reserve the boxed ember treatment for DEPRECATED, RETIRED and DEAD only. Checked R1: removing borders must not push any text below the contrast floor, so ACTIVE must stay at --muted or darker, never lighter.

**evidence** — loops/ui-loop/evidence/current/index-wiki--light--1440.png, table-catalog--light--1440.png, wiki-entry--light--1440.png, index-tools--light--1440.png

### source: `iter-00-b` item I2 (impact 8)

**problem** — Structure is carried by borders, not by type and space. Every list on the site draws a 1px rule under every row — 396 on /catalog, roughly 85 on /wiki, 24 on the home changed-feed, 12 on the /tools jump list, 11 on /data — and /catalog additionally draws a box around the whole table. On top of that, .badge puts a bordered uppercase chip on EVERY row including the default state: roughly 60 grey 'ACTIVE' chips on /wiki and 396 on /catalog, all saying the same thing. A badge that appears on every row carries no information; it is decoration, and it dilutes the ember-toned DEAD/RETIRED/DEPRECATED chips that do carry meaning. The cost is higher in dark: --rule #2c303b against --paper #14161c reads as a stronger ladder than #d7d8e0 on #f6f6f8 does in light, so the same chrome budget is over-spent in the dark theme. The site already contains the correct pattern — /learn rules only at level boundaries, uses no badges, and is the most scannable page on the property.

**invariant** — A list row shall not carry a bottom rule and a status chip simultaneously; and a status indicator shall render only for rows whose status differs from the collection's default.

**governing_rule** — null — checked R1 through R6; none governs divider density or badge policy. R1 constrains contrast only, and the remedy removes marks rather than adding low-contrast ones, so it cannot regress R1.

**prescription (HYPOTHESIS)** — In globals.css, remove border-bottom from .browse-row and .data-table tbody tr and let the existing 0.35rem padding plus a single --rule-strong line under the header carry the group. Render .badge only when data-tone is set (ended/early/theme); for the default 'active' state emit nothing, or plain --muted mono text with no border and no background.

**evidence** — loops/ui-loop/evidence/current/table-catalog--dark--1440.png, index-wiki--light--1440.png, index-learn--light--1440.png

---

## S3 — The templates do not share a grid

**impact 7** · found by one judge

### source: `iter-00-b` item I3 (impact 7)

**problem** — The templates do not share a grid. Against a --shell of 76rem (1216px) with a consistent 145px left margin, the content's RIGHT edge lands in three different places depending on template: about 1295px on /catalog, /wiki and /data (full shell), about 1000px on /learn (rail plus column), and about 750px on /blog/*, /wiki/* and /colophon (--measure, 38rem). Nothing occupies the difference — no sidenotes, no table of contents, no secondary rail — so a reader moving between two pages of one property sees the text block change width by 545px with no signal that anything changed. Link treatment drifts the same way across the three index templates: /catalog sets model names in accent plus underline, /wiki sets entry names in plain --ink with no underline at all, /blog sets post titles in accent bold with no underline. Three indexes, three conventions for the same act of clicking a row.

**invariant** — Every page template shall place its primary content column against one of at most two declared grid tracks, and a row-title link shall use one identical resting treatment (colour and underline) on every index template.

**governing_rule** — null — checked R1 through R6; none constrains grid or link treatment. R6 pins home-page above-the-fold content only and is unaffected by column geometry.

**prescription (HYPOTHESIS)** — Declare two tracks in globals.css and use only those: a reading track at --measure and a full track at --shell, with prose templates either centring the reading track inside the shell or filling the residue with the page's own structured data (see I5). Then unify the row-title link: pick one of the three existing treatments — accent colour, no underline at rest — and apply it to .browse-name, the /catalog model cell and the /blog post title alike.

**evidence** — loops/ui-loop/evidence/current/table-catalog--light--1440.png, index-learn--light--1440.png, article--light--1440.png, index-wiki--light--1440.png, index-blog--light--1440.png

---

## S4 — The accent is applied to every link, so colour marks nothing

**impact 7** · found by one judge

### source: `iter-00-a` item I4 (impact 7)

**problem** — The accent is applied to every link, and on a reference site nearly every noun is a link, so colour has stopped marking state and become the body colour. /catalog renders 396 indigo model names beside 396 indigo dates - two fully coloured columns; /blog is 100% indigo content; the /learn descriptions are speckled with indigo mid-sentence. The stylesheet's own comment states the intent - indigo means 'follow this' - which the render contradicts at this density, and it neutralises ember as an alarm because a red badge no longer stands out against an already coloured field. Compounding it, one semantic gets three treatments: a link to a record is dark serif on the /wiki index, indigo bold serif on the /blog index and indigo mono on /catalog. On /data one link is blue and underlined while eleven sibling links in the same rows carry no link treatment at all, so what is clickable is unreadable.

**invariant** — Within any single list or table surface, at most one column carries the accent colour; and one semantic - a link to a record - has exactly one visual treatment across every template.

**governing_rule** — RULES.md R1

**prescription (HYPOTHESIS)** — Set list and table links in --ink and carry affordance with an underline (or underline-on-hover) rather than with hue, reserving --accent for prose inline links and for the one primary action per surface; then apply that single treatment to the /wiki, /blog and /catalog indexes alike, and give the /data right-hand paths the same treatment as the /dataset link above them. Checked R1: any link-colour change must keep axe contrast clean in both themes; checked R5: if affordance moves to an underline, the focus indicator must stay visually distinct from it.

**evidence** — loops/ui-loop/evidence/current/table-catalog--light--1440.png, index-blog--light--1440.png, index-wiki--light--1440.png, data--light--1440.png, index-learn--light--1440.png

---

## S5 — Section rules are scoped to the shell while their content is scoped to --measure

**impact 7** · found by one judge

### source: `iter-00-a` item I2 (impact 7)

**problem** — Section rules are scoped to the shell while the content they divide is scoped to --measure, so a 1152px rule repeatedly underlines a 605px column and points at empty space. Worst on the wiki entry - the site's most numerous template at 495 records - where the body runs 2400px down a 610px left-hand column while the header rule, the FACTS block and the footer columns all span the full 1152px: the page has two conflicting widths and the eye must re-anchor at every transition. The same defect appears on the article (605px prose under a 1152px rule), the colophon (600px prose, 1152px rule over a 480px definition list) and /data. Three different left edges appear on one wiki entry page - prose at 97, FACTS values at 205, APPEARS IN at 497 - none sharing a grid line.

**invariant** — Every horizontal rule spans exactly the width of the content block it divides, and every column start on a page aligns to a shared grid track.

**governing_rule** — None

**prescription (HYPOTHESIS)** — Scope section rules to the same width container as the content beneath them rather than to .shell. On the wiki entry, either widen the prose block toward the shell or narrow the header rule, FACTS block and cross-reference columns to the prose measure so the template resolves to one width. Checked R1-R6: none governs rule width.

**evidence** — loops/ui-loop/evidence/current/wiki-entry--light--1440.png, article--light--1440.png, prose--light--1440.png

---

## S6 — One semantic, three link treatments across the index templates

**impact 6** · found by one judge

### source: `iter-00-b` item I6 (impact 6)

**problem** — On the /wiki index the 85 entry names are set in plain --ink with 'text-decoration: none', and acquire accent colour and an underline only on :hover. At rest — the state every screenshot in the stack captures, and the state a reader sees before moving the mouse — nothing distinguishes a clickable entry from static text. The wiki index is the site's alphabetical front door to 495 records and it presents as a printed list. This is not an axe violation and axe passed cleanly on the sampled routes, so the measured oracle is silent on it by design; and hover is a declared screenshot blind spot, which is precisely why the resting state is the one that must carry the affordance.

**invariant** — Every row-title link shall be distinguishable from non-interactive text by colour or underline in its resting state, without hover or focus.

**governing_rule** — RULES.md R1 — checked: R1 requires zero axe violations, which the current treatment already satisfies, so this is not an R1 failure. Any remedy must keep the new resting colour above the contrast threshold R1 enforces in BOTH themes; --accent (#4a3bd4 in light) already clears it as used on /blog.

**prescription (HYPOTHESIS)** — Give .browse-name 'color: var(--accent)' at rest, matching the treatment /blog already uses for post titles, and reserve the underline for hover. This also discharges half of I3's link-consistency invariant.

**evidence** — loops/ui-loop/evidence/current/index-wiki--light--1440.png, index-wiki--dark--1440.png (mechanism confirmed at app/globals.css .browse-name, lines ~1169-1179)

---

## S7 — Two elements both claim position: sticky; top: 0 in one scroll context

**impact 6** · found by one judge

### source: `iter-00-b` item I7 (impact 6)

**problem** — Two elements claim 'position: sticky; top: 0' in the same scroll context. '.site-header' is sticky at top:0 with z-index 10, and '.data-table thead th' is also sticky at top:0 with no z-index. On /catalog — a 13,427px table — the column headers will therefore stick underneath the site header and be occluded, so the sticky header that exists to keep MODEL / IN / OUT / CONTEXT visible across 396 rows does not do it. The screenshot stack cannot show this: every capture is a full-page render of the document at scroll position zero, where both elements sit at their natural position and the collision has not yet occurred. Flagged from the token system I was invited to read; the observability gap is filed separately as I13.

**invariant** — When /catalog is scrolled past its first rows, the table's column headers shall remain fully visible and unoccluded by the site header.

**governing_rule** — null — checked R1 through R6; none covers sticky stacking. R2 is unaffected: the change is vertical offset and z-index only.

**prescription (HYPOTHESIS)** — Set '.data-table thead th { top: var(--header-h); z-index: 5 }' with --header-h declared from the actual site-header height, keeping it below the site header's z-index 10. Verify with a scrolled capture once I13 lands. If the collision turns out not to occur, decline with cause and record it as a known evidence lie.

**evidence** — app/globals.css lines ~198-201 (.site-header) and ~858-862 (.data-table thead th); no capture in loops/ui-loop/evidence/current/ can show a scrolled state — see I13

---
