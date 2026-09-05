# Paired comparison, third set — independent assessment

Twelve pairs, 1440px light-theme captures. Footer build stamps ignored throughout.

## Verdicts

| Pair | Choice | Magnitude | Confidence |
|------|--------|-----------|------------|
| 1  | X    | 2 | medium |
| 2  | Y    | 2 | medium |
| 3  | SAME | 0 | high |
| 4  | X    | 2 | medium-high |
| 5  | Y    | 2 | medium-high |
| 6  | Y    | 2 | medium-high |
| 7  | X    | 3 | high |
| 8  | Y    | 3 | high |
| 9  | X    | 2 | medium |
| 10 | Y    | 2 | medium |
| 11 | X    | 2 | medium-high |
| 12 | SAME | 0 | high |

## Pair by pair

**Pair 1 — open data / download page. Choice X, magnitude 2.**
Two mechanisms move together. Y right-aligns the file-path column to the container edge and adds a hairline rule under every row; X keeps the path at a fixed second column near the label and keeps every row label underlined. Y's rules do bind label to value, and Y avoids a two-line wrap. But Y strips the underline from what is, on this page, the entire point: each row is a download link. In Y the rows read as plain body text with no affordance, while the one link that keeps its underline (the whole-dataset JSON) now looks like the only clickable thing on the page. Y also opens a roughly 700px gap between label and value where X's is about 200px. The standard I am applying: on a page whose sole job is handing over files, link affordance outranks column tidiness. X.

**Pair 2 — model catalog, 396 rows, seven columns. Choice Y, magnitude 2.**
Note first that X is a 900px viewport capture and Y a 13,427px full-page capture, so only the shared top region is directly comparable; I read Y's tail separately. Y adds per-row hairline rules, sets model names and read-dates in link blue without underline, and renders STATUS as a bordered pill. X has no row rules, underlines names and dates in ink colour, and sets status as quiet grey small caps. Here the rules earn their keep: the data genuinely needs seven columns across 1150px, and tracking a row from model name to context window is a real task the rules make easier. Y's cost is boxing the constant — nearly every row says ACTIVE, so the pill is chrome repeated 390 times; the red DEPRECATED pill lower down does pop, but it would pop harder against a field of unboxed grey. On balance the row-tracking gain in a wide numeric comparison table outweighs the badge noise. Y, but narrowly, and the badge decision is the wrong half of it.

**Pair 3 — colophon. SAME, magnitude 0.**
Pixel-differenced: the only non-identical region is y1061–1207, which is the "This build" line and the footer stamp — the timestamp I was told to ignore. Column measure, paragraph rag, the bold lede sentence, the definition-list block at the foot, rule position and footer are otherwise byte-identical.

**Pair 4 — tools directory. Choice X, magnitude 2.**
The difference is confined to the category index at the top; the listing body below is identical in both (I compared the full scroll). X: underlined category names, count in a near second column, list-like 36px row rhythm. Y: no underline, count right-aligned to the far margin, hairline rule per row. This is a table of contents — twelve rows, every one a link, counts of a single digit. Y strings a "2" out to 1140px from its label and then needs a rule to reconnect it, solving a problem its own alignment created; X never has the problem. And again the underline is removed from a set of items that exist only to be clicked. X.

**Pair 5 — changelog / "what changed". Choice Y, magnitude 2.**
Here only the entry rules differ; the sidebar, the impossible-to-routine block and the site index below are identical. X separates changelog entries by whitespace alone, but entries are variable height and several wrap, putting a trailing "source" on its own line. The within-entry line gap (about 26px) and the between-entry gap (about 39px) are close enough that grouping is ambiguous — you cannot tell at a glance whether a stray "source" belongs above or below. Y's hairline per entry resolves it outright. Link treatment is unchanged in both, so none of the affordance cost from pairs 1 and 4 applies. Rules used where variable row height actually breaks proximity grouping. Y.

**Pair 6 — same comparison as pair 4, sides swapped. Choice Y, magnitude 2.**
Y here is the file that was pair 4's X. Same reasoning: category index with link affordance intact and the count kept near its label, versus an index whose links look like plain text and whose counts are flung to the far margin.

**Pair 7 — wiki index, 495 records. Choice X, magnitude 3.**
The clearest case in the set, and it turns on status hierarchy rather than rules. X sets ACTIVE as quiet grey small caps and boxes only the exceptions — RETIRED and DEAD in red outline. Scrolling the full index, the dead and retired entries leap off a calm field; that is exactly what someone auditing a reference index wants to find. Y boxes every status, so RETIRED and DEAD become red-tinted boxes among grey boxes and lose most of their salience. Boxing the common case destroys the exception's signal. Y additionally removes the underline from all 495 entry links and pushes type plus status to the right margin, requiring row rules to reconnect them. Y's one genuine gain is that its right-alignment makes the status column flush, where X's is ragged because the type words vary in length — a tidiness point, not worth the hierarchy loss. X.

**Pair 8 — same comparison as pair 7, sides swapped. Choice Y, magnitude 3.**
Y here is pair 7's X: exception-only red badges on a quiet grey status field, underlined entry links.

**Pair 9 — same comparison as pair 2, sides swapped. Choice X, magnitude 2.**
X here is pair 2's Y: per-row rules across a genuinely wide seven-column numeric table. Same narrow margin, same reservation about the ACTIVE pill.

**Pair 10 — same comparison as pair 1, sides swapped. Choice Y, magnitude 2.**
Y here is pair 1's X: underlined download links, path column kept near its label.

**Pair 11 — same comparison as pair 5, sides swapped. Choice X, magnitude 2.**
X here is pair 5's Y: hairline rules bounding variable-height changelog entries so wrapped "source" lines group correctly.

**Pair 12 — blog index. SAME, magnitude 0.**
Pixel-differenced: 212 differing pixels, all inside y644–652 / x1159–1211, which is the footer build timestamp. Date gutter, headline measure, underline weight, the four-item rhythm and the rule above the list are identical.

## Closing

**Raw count: X chosen 5 (pairs 1, 4, 7, 9, 11), Y chosen 5 (pairs 2, 5, 6, 8, 10), SAME 2 (pairs 3, 12).**

That 5–5 balance is not evidence of my neutrality and should not be read as such. Hashing the twenty-four files shows the set is built from **six distinct comparisons, five of which appear twice with the sides mirrored**: pairs 1/10, 2/9, 4/6, 5/11 and 7/8 are byte-identical file sets with X and Y swapped, and pairs 3 and 12 are the two unique, non-differing pairs. The side balance is therefore forced by the construction. I found the duplication after judging pairs 1, 2, 3, 4, 5, 7 and 12, which means those seven are independent readings and the remaining five (6, 8, 9, 10, 11) are mirrored restatements rather than fresh looks. I am flagging that rather than presenting ten independent judgements I did not make.

**Materially different: 5 distinct comparisons (10 of 12 presented pairs). Identical: 1 distinct comparison presented as 2 pairs (3 and 12), differing only in the build stamp.**

The differences do form a consistent pattern, and it is a single design change applied uniformly: one variant across all five differing comparisons adds per-row hairline rules, right-aligns the secondary column to the container edge, removes underlines from link text, and boxes every status value; the other keeps underlined links, a near second column, quiet grey statuses with red boxes on exceptions only, and whitespace-only row separation.

My verdicts do **not** follow that pattern, and that is the substantive finding. Over the five distinct comparisons I chose the rules variant twice and the underline variant three times, because the four mechanisms bundled in that change are not equally good:

- **Row rules are right where row height varies or the table is genuinely wide** — the changelog (5/11) and the 396-row seven-column catalog (2/9). They are unnecessary on a twelve-row category index or a two-column list, where they exist only to repair the gap the right-alignment opened.
- **Right-aligning to the container edge is wrong on narrow-value columns.** Sending a single digit or a short path 1140px from its label manufactures the association problem the rules then solve.
- **Removing link underlines is a straightforward loss** on the three pages that are pure navigation or download indexes (1/10, 4/6, 7/8), where nearly every row is a link and nothing else signals it.
- **Boxing every status is the worst of the four.** On the wiki index (7/8) the quiet-grey-with-red-exceptions treatment is a good system and the box-everything treatment destroys it; on the catalog (2/9) the same cost applies and is only outweighed by the rules gain.

So: the change reads as a single house move, but it is right on data tables with variable or wide rows and wrong on link indexes. Every page whose second column is short and whose rows are all links came out worse.
