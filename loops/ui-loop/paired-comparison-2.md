# Paired comparison, second set — independent reading

Method: each pair was first diffed pixel-by-pixel to locate every region that actually
changed, then the changed regions (and the surrounding page) were read visually at full
size. The footer build stamp was diffed separately and excluded from every judgement.

| Pair | Page | Choice | Magnitude | Confidence |
|------|------|--------|-----------|------------|
| 1 | wiki entry — "AI winter" | SAME | 0 | high |
| 2 | A–Z index of all entries | Y | 3 | medium |
| 3 | open data / downloads | Y | 3 | high |
| 4 | blog index | SAME | 0 | high |
| 5 | change feed + sidebar | Y | 2 | medium |
| 6 | model catalog (standing table) | Y | 2 | low |
| 7 | learn index | SAME | 0 | high |
| 8 | colophon | SAME | 0 | high |
| 9 | tools directory | Y | 2 | medium |

---

## Pair 1 — SAME (0)

The only pixels that differ anywhere in 1440×3097 are columns 1159–1211 of a single
nine-pixel band at y=3042: the hour-minute-second of the footer build stamp. Everything
else — the CONCEPT / CONCEPT-AI-WINTER eyebrow, the display heading, the ACTIVE STABLE line,
the three outlined topic chips, the "Also called" line, the rule under the header block,
the entire body — is bit-identical. Nothing a visitor could perceive.

## Pair 2 — Y (3)

This is the site's A–Z register of every entry, and the thing a visitor scans for is
lifecycle state: which of these is dead.

X lays each row across the full 1152px measure with a hairline rule beneath it, the type
word right-aligned near x=1230 and a bordered status badge flush to the right edge. Y caps
the name column at ~400px, left-aligns the type word at x=540, drops the per-row rules, and
— the decisive change — boxes only the exceptions. ACTIVE becomes plain grey small caps;
RETIRED and DEAD keep the red-bordered badge.

Three mechanisms move. (a) **Hierarchy** — in X every one of ~400 rows carries a badge, so
the exception is signalled only by hue and the boxes themselves become field texture; in Y
the box *is* the exception marker, and the dead entries pop out of the column at a glance.
(b) **Association distance** — X separates a name from its status by roughly 900px, which
is why it needs a rule per row to bind them; Y puts the type word 60px after the name, so
the pairing survives without rules and ~400 hairlines leave the page. (c) **Alignment** —
X right-aligns ragged-length type words, so their left edges stagger; Y stacks them on a
common left edge.

Y pays for this twice. Long names now wrap to two lines, and the status token floats after
a variable-width type word ("concept ACTIVE" vs "org ACTIVE"), so status is not a true
column — the one alignment X gets right and Y loses. The right 700px of a 1440 viewport
also sits empty. Net still clearly Y: exception-only badging is worth more on this page
than a right-aligned status column.

## Pair 3 — Y (3)

The downloads page, where the visitor's whole task is "find the file I want and click it".

X sets each row as description-left / path-right-aligned-to-the-container-edge, ruled. The
paths are monospace and share a prefix, but because they are right-aligned and of unequal
length their **left edges stagger across six different x positions** — `/dataset/` never
stacks, so the one part of the string that is scannable cannot be scanned. The label is also
separated from its path by up to 620px of white, which is what forces the per-row rule.
Worse: nothing in the list is underlined or coloured, so a visitor cannot tell what is
clickable — the page's own footer links *are* underlined, which makes the list read as inert.

Y left-aligns the path column at x=540. The shared `/dataset/` prefix stacks perfectly and
the distinguishing filename reads straight down the column; the label-to-target gap collapses
to ~60px, so the connecting rules are no longer load-bearing and are removed; and the labels
are underlined, making the affordance explicit and consistent with the rest of the site.

Cost: one long label wraps to two lines, and the right half of the container is unused. Both
are cheap next to fixing a ragged path column and an invisible affordance.

## Pair 4 — SAME (0)

Identical but for columns 1159–1211 of the y=644 footer band — the build stamp again. The
blog index heading, the four-line standfirst, measure, leading and the post list are
pixel-for-pixel the same.

## Pair 5 — Y (2)

The dated change feed with its right-hand sidebar. Entries are **variable height**:
single-line ones, and two-line ones where the trailing `source` link wraps.

X separates entries by whitespace only. Because the intra-entry line gap (~25px) and the
inter-entry gap (~43px) are of the same order, a wrapped `source` line is genuinely ambiguous
about which entry it belongs to. Y adds a hairline between entries, spanning the date column
to the main-column edge at x=851.

The mechanism is grouping: with ragged row heights, proximity alone is a weak boundary and a
rule is the standard fix. It also brings the main column into line with the sidebar, which
already rules its section heads. The cost is a ladder of ~40px-pitch hairlines and 24px of
added page height. A modest improvement; I would not defend it as more than that.

## Pair 6 — Y (2, low confidence)

The 396-row standing price table. One capture is the full page and the other is a 900px
viewport shot, so only the top 900px is comparable; both show the same page and the same
rows, and the judgement rests on that window.

X: model names and read-dates are saturated blue with no underline, and every STATUS cell is
an outlined pill. Y: links are ink with an underline, ACTIVE is plain grey small caps, and
row pitch is about 3% tighter (31.3px vs 32.2px).

The call is close and I want to be honest about that. X's cost is a vertical band of ~396
identical bordered boxes running between CONTEXT and READ — chrome that differentiates
nothing, since nearly every row says ACTIVE, and which leaves a genuinely deprecated row to
be distinguished by hue alone. Y's cost is the mirror image: two full columns of underline
hatching, under 396 model names and 396 dates. What tips it is the reader's actual task —
comparing $/MTOK. In Y the type is one ink and the right-aligned numerals are the only thing
carrying weight, so prices win the page; in X two columns of blue plus a column of boxes
compete with the numbers. Y's exception-only badging is also the system that scales, since a
DEPRECATED row still gets its red box. Direction: Y. Confidence low.

## Pair 7 — SAME (0)

3872px tall, and the only differing pixels are columns 1159–1211 at y=3817 — the build stamp.
Heading, standfirst measure, and the ladder of learn entries below are identical.

## Pair 8 — SAME (0)

Two differing bands here rather than one, at y=1061 and y=1199, which is worth flagging
because it looks like a real change until you read it: the first is the "This build" row in
the colophon's own metadata table, the second is the footer. Both are the same timestamp
rendered twice on the same page. Nothing else differs.

## Pair 9 — Y (2)

The tools directory. The difference is confined to the twelve-row category jump-list near the
top; everything from the AGENTS heading down is pixel-identical in both.

X rules each row and right-aligns the single-digit count at x=1280 — roughly 1100px from its
label. That is a table-of-contents pattern and the rules do the binding honestly, so it is
defensible. What is not defensible is that the category names carry no underline and no
colour: this list exists purely to jump into the page below, and X gives no signal that any
of it is clickable.

Y underlines the names and moves the counts to a left-aligned column at x=540. The affordance
becomes explicit and the label-to-count distance drops by two thirds. The counts' new position
is arbitrary though — neither adjacent to the short labels nor at a container edge — and
losing the rules costs a little of the row-tracking X had. A smaller win than pairs 2 and 3,
because X's version was the least broken of the three list treatments.

---

## Summary

**Five of nine pairs are materially different** (2, 3, 5, 6, 9). **Four are identical** (1, 4,
7, 8) — the only differing pixels in those four are build-stamp digits, which were excluded by
instruction and would in any case be invisible to a visitor. The identical four are all
prose-led pages: a wiki entry, the blog index, the learn index, the colophon. The five that
changed are all **list or table pages**. Whatever produced this set touched tabular layout and
left running text alone.

The differences form a consistent pattern, and one clear enough that I should name it rather
than pretend to nine independent judgements. In every differing pair the same side (Y as
labelled here) applies one design position:

1. **Collapse association distance.** Stop stretching a row across the full 1152px measure with
   its second field pinned to the far edge; put the second field in a left-aligned column a few
   dozen pixels after the first. Pairs 2, 3, 9.
2. **Left-align what has a shared prefix.** Right-aligned monospace paths and type words
   stagger their left edges; left-aligning them makes the column scannable. Pair 3 most sharply.
3. **Spend the badge on the exception.** Drop the box from ACTIVE, keep it on RETIRED / DEAD /
   DEPRECATED. Pairs 2 and 6.
4. **Make link affordance explicit.** Underline the labels rather than leaving them as
   undifferentiated body text. Pairs 2, 3, 9 — and in pair 6 this is traded against dropping
   the blue.
5. **Use rules where grouping is ambiguous, not as default furniture.** Rules are removed from
   fixed-height two-column rows (2, 3, 9) and *added* to the variable-height change feed (5).
   That looks contradictory and isn't: it is the same principle applied to different content.

I judged each pair before noticing the pattern, and picked the same side five out of five. Two
caveats on that. First, the position has a consistent cost I flagged repeatedly and want on the
record: capping the first column at ~400px leaves the right half of a 1440 viewport empty on
pairs 2, 3 and 9, and forces some labels to wrap. On a narrower viewport that cost vanishes; at
1440 it reads as an unfinished page, and someone applying a fill-the-measure standard could
reasonably score those three the other way. Second, pair 6 is close to a genuine wash — I made
a call, but a reasonable designer could take the other side, and it should not be counted as
confirming the pattern.

The strongest single change in the set is pair 3's path column. The weakest is pair 6.
