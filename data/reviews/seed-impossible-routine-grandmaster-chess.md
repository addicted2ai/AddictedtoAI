---
job: seed-impossible-routine-grandmaster-chess
verdict: approve
reasons: []
would-cite: >-
  Someone claiming the 2009 pocket-device result meant engines had passed the
  world champion on a phone: this delta dates both ends and shows the 2009 field
  was a category 7-8 round-robin, so what collapsed between 1997 and 2009 was
  the hardware, not the standard of opposition.
reviewer: rr2b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29 and confirmed by literal substring match against the fetched bytes,
not by asking a summariser what a page says.

- https://theweekinchess.com/html/twic131.html: the masthead renders
  "THE WEEK IN CHESS 131 - 12<sup>th</sup> May 1997". Recording the method,
  because it is a trap: the literal needle "12th May 1997" returns ABSENT, since
  the `th` sits inside a `<sup>` tag and tag-stripped text reads "12 th May
  1997". The date is correct; a naive substring test would "disprove" it. Body
  carries verbatim "Kasparov's loss to Deep Blue in New York last night was a
  landmark achievement for computer science", and the crosstable gives
  DEEP BLUE 3.5 / Kasparov, Gary 2.5 across columns 1-6. The delta's derivation
  — issue dated the 12th, "last night", therefore game six on 11 May — is stated
  openly rather than passed off as the source's own date.
- https://en.chessbase.com/post/breakthrough-performance-by-pocket-fritz-4-in-buenos-aires:
  byline 8/27/2009, matching the routine end's date. Verbatim: "In this category
  seven tournament the program, running on a handheld Pocket PC, scored a
  stunning 9.5/10 points, with an Elo performance of 2938." Also verbatim, in
  the game introduction: "Watch the tiny handheld PC outplay a 2522
  grandmaster". So the score, the 2938, the handheld and the quoted "2522
  grandmaster" are all carried by the cited page, in its own words.
- The delta's absence claim — "That report does not itself say the program
  finished first" — is the harder claim, so I earned it byte-level across the
  whole 102KB page: "first place", "winner" and "won the tournament" are all
  absent, and the only " won " occurrences are in the teaser and meta
  description, about *last* year's Pocket Fritz 3 ("Last year Pocket Fritz 3 won
  comfortably"). The claim is true, and moving the first-place assertion into
  prose under a different source is the right handling.
- https://www.hiarcs.com/games/mercosur2009/mercosur09.html: verbatim "HIARCS
  ran on a HTC Touch HD (ARM/528Mhz) mobile device"; "undefeated 9½/10 points
  (9 wins, one draw)"; "Category 8, GM Norm = 7.3"; and the crosstable rank 1
  "Pocket Fritz 4 powered by HIARCS 2600 2938 GBR ... 9½" above "GM Rodriguez
  Vila, Andres 2522", "GM Valerga, Diego 2507" and "GM Slipak, Sergio 2469".
  Every name and rating in the second paragraph is exact.
- The two-source disagreement the delta reports is real: I confirmed "category
  seven" on ChessBase and "Category 8" on HIARCS independently. Declining to
  quote either as settled is correct.

Round 1 (r1-opus) found: (a) the routine end asserts Pocket Fritz 4 *won* the
Mercosur Cup, which the ChessBase report does not say — real, and **fixed** by
moving the first-place claim into prose under the HIARCS crosstable; (b) the
routine end asserts the field *included grandmasters*, which "the ChessBase page
does not say ... the only rated player named in it is 'Rodriguez Vila,A (2522)',
given without a title" — **this round-one finding was wrong.** The page says, in
so many words, "Watch the tiny handheld PC outplay a 2522 grandmaster". r1-opus
recorded asking the page for its body text twice with different prompts to guard
against a summarisation artifact, and was told the wrong thing both times: the
exact failure mode `addictedtoai-1n1` describes, a tool denying a string that is
present verbatim. No harm resulted — the fixer used the phrase correctly and put
it in quotation marks — but the finding should not be inherited. (c) the
structural note that end B cleared a mid-tier GM field rather than the strongest
human alive — **fixed**, and fixed by adding the third paragraph rather than by
quietly softening the ends.

It clears the bar as it now stands. The payload is the thing an enthusiast
usually gets wrong about this pairing, argued from ratings in a crosstable
rather than asserted: a category 7-8 field is strong grandmaster opposition and
is not Kasparov, so the quantity that collapsed in twelve years is the hardware.
Every figure at both ends is carried verbatim by a page I matched byte-level,
the one place the sources conflict is disclosed instead of resolved, and the one
date that had to be derived shows its working. Strongest piece in my slice.
