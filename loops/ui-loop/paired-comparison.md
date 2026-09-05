# Paired comparison — findings

Method: each pair was diffed pixel-wise at native 1440px resolution to localise change, then the
differing bands were read at 1:1 and the whole page at reduced scale. Footer build stamps were
excluded from consideration throughout.

| Pair | Page | Choice | Magnitude | Confidence |
|------|------|--------|-----------|------------|
| 1 | wiki entry — "AI winter" | SAME | 0 | high |
| 2 | blog index | SAME | 0 | high |
| 3 | open data / dataset index | X | 2 | medium |
| 4 | wiki A–Z index | Y | 3 | medium |
| 5 | colophon | SAME | 0 | high |
| 6 | model catalogue (standing table) | X | 3 | high |
| 7 | home / what-changed | X | 2 | medium |
| 8 | learn index | SAME | 0 | high |
| 9 | tools directory | X | 1 | medium |

## Pair 1 — SAME
Pixel diff over the full 1440x3097 capture returns 212 differing pixels, all inside a 9px band at
rows 3042–3050, columns 1159–1211 — the footer build stamp, which is excluded. Everything else is
bit-identical: prose measure, the tag chips under the title, heading scale, rule positions,
paragraph leading. Nothing else to report.

## Pair 2 — SAME
Same result: 212 differing pixels, confined to rows 644–652 / columns 1159–1211, i.e. the footer
stamp. Both captures are 1440x900 and identical elsewhere — the dated post list, its date column
position, the two-line wrap on the first headline, and the rule above the list all match exactly.

## Pair 3 — X, magnitude 2
Two treatments of the same file list. X runs each row across the full 1210px measure with a 1px
hairline rule beneath it and right-aligns the monospace path against the right edge, so the paths
form a rail and the rule carries the eye across the gap. Y drops the row rules, caps the label
column at roughly 250px and parks the path column at x≈420, leaving the right ~740px empty; the
narrow label column forces "Impossible → Routine — dated pairs with both sources" to wrap onto a
second line, and every label carries a link underline, putting a horizontal tick under all
twenty-one rows. Y's one advantage is that left-aligned paths align their `/dataset/` prefixes,
which X's right-alignment ragged out; that does not offset the lost measure, the wrap, and the
absent row delimiters.

## Pair 4 — Y, magnitude 3
A ~100-row A–Z index, and the decisive mechanism is column alignment. In X the metadata sits at a
fixed x≈310 as "type status" set left-to-right, so the status column is ragged — `concept ACTIVE`,
`org ACTIVE`, `technique ACTIVE` each start the status at a different x, and a reader scanning for
lifecycle state has no column to run down. Y right-aligns the type against a fixed edge and places
the status chip in a fixed right-hand column, giving two true columns, and adds a hairline rule per
row to bind name to state across the wider gap. Y also recovers the full measure, so the longest
entry (Dartmouth Summer Research Project…) no longer wraps to two lines. Cost of Y: every row gets a
chip, including ACTIVE, so the boxed treatment no longer marks the exception by itself — but the
red border and red text still separate DEAD/RETIRED/DEPRECATED from the grey ACTIVE, so the
exception signal survives. On a page whose whole job is scanning 100 rows for type and status, the
aligned columns win clearly.

## Pair 5 — SAME
914 differing pixels in two bands. The lower band (rows 1199–1207, cols 1159–1211) is the footer
stamp. The upper band (rows 1061–1071, cols 353–474) was read at 1:1 and is also a rendered
timestamp in the body text (`…-08-31T21:11:00Z · unknown`). No structural difference: same measure,
same heading scale, same section rules, same paragraph spacing.

## Pair 6 — X, magnitude 3
The 396-row price table, seven columns spanning the full 1200px. X puts a 1px hairline rule under
every row; Y has none. On a table this wide, tracking from a model name at the left edge to its
CONTEXT figure and READ date at the right edge with no horizontal guide is exactly the error the
rule exists to prevent, and Y's row pitch is not loose enough to substitute for it. Two supporting
differences run the same way: X carries links in link colour and reserves the underline, while Y
underlines both the model name and the READ date on every row, laying two columns of ticks through
the table; and X sets STATUS as a bordered chip in a fixed column while Y sets it as plain grey
text, which reads as one more data cell rather than a state marker. Numeric alignment is identical
in both (prices and context right-aligned under right-aligned headers), so the difference is
entirely row banding and colour role. Noted separately and excluded from the judgement: the Y
capture is 900px tall and cuts mid-row through "AionLabs: Aion-3.0-Mini" with no footer, against
13427px for X — that is a truncated screenshot, not a page boundary.

## Pair 7 — X, magnitude 2
Identical content; X adds a 1px rule under each changelog entry and about 1.5px more row pitch.
This matters more than a rule-per-row usually would because many entries wrap — the price-change
lines push their `source` link onto a second line — and without a rule the gap between an entry's
continuation line and the next entry's first line is barely larger than the gap inside the entry.
X's rules make each dated entry one delimited block; Y leaves the reader to infer entry boundaries
from a whitespace difference of a few pixels. Everything else on the page (sidebar, impossible →
routine blocks, footer grid) is unchanged.

## Pair 9 — X, magnitude 1
Only the twelve-row category index at the top of the page differs; the ~200 listing rows below are
pixel-identical when the captures are aligned at the bottom. X gives each index row the full measure
with a hairline rule and right-aligns the count against the right edge; Y drops the rules, sets the
count at x≈460 next to the label, and underlines each category name. X's version reads as a proper
count table with an aligned numeral column and a rule to carry the eye; Y keeps label and number in
one fixation, which is a genuine benefit when the counts are single digits, and its underlines
advertise that the categories are jump links. Small payload, small consequence either way — hence
magnitude 1.

## Overall

Four of the nine pairs are materially different (3, 4, 6, 7) and one is different but marginal (9).
Four are identical apart from the excluded build stamp (1, 2, 5, 8) — those four are byte-level
matches everywhere else, not merely similar.

The five differing pairs are all the same change seen on five pages. One variant sets list and table
rows across the full measure with a 1px hairline rule per row, a right-aligned trailing column
(path, count, type + status chip) forming a rail, and link colour rather than underline; the other
drops the row rules, caps the label column so the trailing value sits mid-page with the right third
or half empty, wraps the longest labels, and underlines every link. I chose the ruled/full-measure
variant every time, on four pages as X and on one (pair 4) as Y — so the preference is for that
treatment, not for a side. The mechanism it wins on is consistent: horizontal banding and a fixed
right-hand column are what let a reader carry a row across a wide page and run a value column
vertically, which is the whole task on a catalogue, an index and a changelog. Its one real cost,
visible in pair 3, is that right-aligning variable-length strings ragged out their shared prefixes;
that cost is worth paying for numbers and chips, and is the weakest case for it where the trailing
column is a file path.
