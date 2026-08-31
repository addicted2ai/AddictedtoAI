---
job: seed-alphago-lee-sedol
verdict: approve
reasons: []
would-cite: >-
  Still the one page pairing the 2016 match record with the 2022 cyclic
  exploit — now with every quotation on a fetchable page — so it settles
  both "machines won" and the asterisk: the last human wins over top Go
  engines came from an exploit a person can run by hand, not from better Go.
reviewer: seed-review-6.5; delta review by a separate fresh invocation (no authorship of the entry or its revision)
date: 2026-08-28
---

Checklist: wiki entry. Every listed source was fetched on 2026-08-28.

Verified and supported:

- blog.google "ultimate challenge" post: published 8 March 2016 by Demis
  Hassabis; five games 9–15 March in Seoul; "$1 million USD in prize money";
  "If AlphaGo wins, the prize money will be donated to UNICEF, STEM charities
  and Go organizations." Purse fact, games_played, location all supported.
- research.google 27 Jan 2016 post: "Using a single machine, AlphaGo won all
  but one of its 500 games against these programs"; Fan Hui match "played
  behind closed doors between October 5-9 last year. AlphaGo won by 5 games
  to 0"; "Experts predicted it would be at least another 10 years until a
  computer could beat one of the world's elite group of Go professionals."
  All three quotations verbatim.
- deepmind.google/research/alphago: "AlphaGo's 4-1 victory in Seoul, South
  Korea, in March 2016" — result fact supported.
- britgo.org press1: "Silver D. et al. ... Volume 529, issue 7587, pp
  484-489" — nature_citation fact supported.
- deepmind AlphaGo Zero post, 18 Oct 2017: "learns to play simply by playing
  games against itself, starting from completely random play"; "After just
  three days of self-play training, AlphaGo Zero emphatically defeated the
  previously published version of AlphaGo ... by 100 games to 0." Verbatim.
- ABC News 29 Nov 2019: both Lee retirement quotes verbatim as attributed to
  Yonhap.
- arXiv 2211.00241: abstract contains "achieving a >97% win
  rate against KataGo running at superhuman settings" and "The core
  vulnerability uncovered by our attack persists even in KataGo agents
  adversarially trained to defend against our attack" — the 97% figure and
  the adversarial-training sentence are supported.
  **Corrected 2026-08-31 (addictedtoai-dd5): this line originally read "(v1 1
  Nov 2022)". Both strings are v4 (13 Jul 2023), and neither is in v1.** See
  the version note at the foot of this record.
- TechCrunch 13 Mar 2016: Hassabis quote "was too good for us today and
  pressured #AlphaGo into a mistake that it couldn't recover from" verbatim;
  move 78 as the pressure point supported.

Required changes (all false-or-unsupported-claim):

1. **The opening sentence and the 2016-03-08 timeline row say the match was
   announced on 8 March 2016.** The entry's own cited source for 2016-01-27
   (research.google post) announces the match: "AlphaGo's next challenge will
   be to play the top Go player in the world over the last decade, Lee Sedol.
   The match will take place this March in Seoul, South Korea." The match was
   announced 27 January; the 8 March post announced details and the purse on
   the eve of play. Reword both prose and timeline ("match details and purse
   announced" or equivalent), or the entry contradicts its own source.
2. **The quoted string "used the cyclic attack to repeatedly beat superhuman
   versions of both KataGo and Leela Zero by himself" appears in quotation
   marks with no source that contains it.** It is not on the cited arXiv page
   (checked; the abstract says only "human experts can implement it without
   algorithmic assistance to consistently beat superhuman AIs" — no Pelrine,
   no Leela Zero, no "cyclic"). Cite the document that carries the quotation
   (the FAR AI project page could not be text-checked from here — it renders
   empty to a plain fetch, which is an observation, not a pass) or restate
   without quotation marks within what 2211.00241 supports.
3. **The Korea Baduk Association "sincere efforts" quotation has no source
   anywhere in the entry.** The cited deepmind.google page confirms a 9 dan
   certification but names no awarding body and does not contain the quoted
   phrase. Add a source containing it or drop the quotation.
4. Minor, same class: game-four specifics (Lee playing white, resignation
   after 180 moves, the "wedge") are not in the cited TechCrunch piece,
   which supports only move-78 pressure. Source them or soften to what the
   source carries.

Everything else in the piece measured true, and the closing argument (the
last human win by playing better Go vs. wins by exploit) is well-earned by
the sources once the quotations are anchored. One revision pass should
settle all four points.

## Delta review (commit db1e2df only) — approve

All four named findings fixed; the revision's substantial new material was
verified line by line against fresh fetches.

1. Announcement date. Fetched
   research.google/blog/alphago-mastering-the-ancient-game-of-go-with-machine-learning/
   — dated January 27, 2016, carrying verbatim: "AlphaGo's next challenge
   will be to play the top Go player in the world over the last decade, Lee
   Sedol. The match will take place this March in Seoul, South Korea."
   Fetched blog.google/innovation-and-ai/products/alphagos-ultimate-challenge/
   — dated Mar 08, 2016, first game March 9, and carrying "The games will be
   even (no handicap), with $1 million USD in prize money" and "If AlphaGo
   wins, the prize money will be donated to UNICEF, STEM charities and Go
   organizations." Every element of the revised 2016-03-08 row — day before
   play, five games, no handicap, purse, charity pledge — is on that page,
   and the opening paragraph now matches both sources.
2. The unfetchable Pelrine quotation is gone; every replacement string was
   matched as a substring of ar5iv.labs.arxiv.org/html/2211.00241: "97% win
   rate against KataGo running at superhuman settings"; "the strongest
   publicly available Go AI system at the time of writing"; "Our adversaries
   do not win by playing Go well"; the three-stage description ("first, set
   up an 'inside' group ... before the victim realizes it is in danger and
   defends" — verbatim in Appendix G, inner quote marks converted for
   nesting); "one of our authors, a Go expert, was able to learn from our
   adversary's game records to implement this attack without any algorithmic
   assistance"; "obtained a greater than 90% win rate against a top ranked
   KataGo bot that is unaffiliated with the authors"; "KataGo and Leela Zero
   playing with 100k visits each, which is normally far beyond human
   capabilities"; "persists even in KataGo agents adversarially trained to
   defend against our attack". The unquoted paraphrase also checks: the
   paper says "Typically the victim predicts that it will win with over 99%
   confidence for most of the game, then suddenly realizes it will lose with
   high probability, often just one move before its cyclic group is
   captured." The new cyclic_adversary_win_rate fact is the abstract's own
   number. I also tested the revising agent's stated reason for abandoning
   goattack.far.ai rather than citing it: fetched, HTTP 200, exactly 71
   characters of rendered text — "JavaScript is required to view this
   website." The claim was accurate and the removal was the right call.
3. Korea Baduk Association and "sincere efforts" are gone. The 9-dan
   material now quotes deepmind.google/research/alphago/, and both strings
   match verbatim: "earned AlphaGo a 9 dan professional ranking — the first
   time a computer Go player had received the highest possible
   certification" and "Known as 'God's Touch', this move was just as
   unlikely and inventive as the one AlphaGo played two games earlier" (the
   page ties the quote to "Lee Sedol played a Move 78", supporting the
   entry's framing). One note: the source's sentence subject is "This game";
   the entry renders it as "the match" — the source's own antecedent is the
   4-1 victory in its preceding sentence, so this is a fair reading, not a
   defect.
4. Game-four specifics. "180 moves", "won by resignation" and the "wedge"
   are cut; "played with white" is now doubly supported — the cited
   blog.google page's Game 4 recap reads "Playing as white, Lee won by
   resignation after 180 moves", and the cited ABC piece quotes Lee himself:
   "My white 78 was not a move that should be countered straightforwardly."
   The misquotation fix ("Using a single machine, AlphaGo won all but one of
   its 500 games") matched with the capital U, and the unsupported
   KataGo-stronger-than-AlphaGo comparison is replaced by the paper's own
   "strongest publicly available" claim, which matched.

The revision did not merely survive: replacing a secondhand quotation with
the paper's own KGS numbers made the closing argument stronger than the
version that was returned.

## Recheck 2026-08-29 (wave addictedtoai-flh) — approve stands

Re-examined because this entry was approved in the earlier seed round, which
the 2026-08-29 seed wave never revisited. Effort went to the two highest-risk
classes here: the **superlatives** ("the first time a computer Go player had
received the highest possible certification", "the strongest publicly
available Go AI system", "the top Go player in the world over the last
decade") and every string carried inside quotation marks. All seven cited
sources were re-fetched and every quotation re-matched literally.

- `research.google/blog/alphago-mastering-the-ancient-game-of-go-with-machine-learning/`
  (166,071 bytes, dated "January 27, 2016") — "AlphaGo's next challenge will
  be to play the top Go player in the world over the last decade, Lee Sedol",
  "The match will take place this March in Seoul, South Korea", "Using a
  single machine, AlphaGo won all but one of its 500 games", "behind closed
  doors between October 5-9 last year", "AlphaGo won by 5 games to 0", "at
  least another 10 years until a computer could beat one of the world's elite
  group of Go professionals". The entry's "three-time European champion Fan
  Hui" is the post's own "the reigning 3-time European Go champion Fan Hui",
  and its "5 and 9 October 2015" is the post's "October 5-9 last year" read
  against a January 2016 dateline. Announcement date holds.
- `blog.google/innovation-and-ai/products/alphagos-ultimate-challenge/`
  (393,450 bytes) — "$1 million USD in prize money", "donated to UNICEF, STEM
  charities and Go organizations", "no handicap", "March 9", and "Playing as
  white, Lee won by resignation after 180 moves", which is what anchors the
  entry's "played with white".
- `deepmind.google/research/alphago/` (141,589 bytes) — "4-1 victory in
  Seoul", "earned AlphaGo a 9 dan professional ranking", "the first time a
  computer Go player had received the highest possible certification", "God's
  Touch", "just as unlikely and inventive as the one AlphaGo played two games
  earlier", "Move 78". The superlative is the source's own sentence, not the
  entry's inference.
- `britgo.org/deepmind2016/press1` (18,026 bytes) — "Silver", "529", "7587",
  "484-489". `nature_citation` supported.
- `deepmind.google/.../alphago-zero-starting-from-scratch/` (152,293 bytes) —
  `article:published_time` is `2017-10-18T00:00:00+00:00`, matching the
  timeline row exactly; "learns to play simply by playing games against
  itself, starting from completely random play", "three days of self-play",
  "by 100 games to 0" all raw.
- `abc.net.au/...11745872` (352,293 bytes) — "with the debut of AI in Go
  games", "I'm not at the top even if I become the number one", "even if I
  become the number one, there is an entity that cannot be defeated",
  "Yonhap", "My white 78".
- `techcrunch.com/2016/03/13/...` (229,169 bytes) — "was too good for us
  today and pressured #AlphaGo into a mistake that it couldn't recover from".
- `arxiv.org/abs/2211.00241` (42,947 bytes, "[Submitted on 1 Nov 2022") and
  `ar5iv.labs.arxiv.org/html/2211.00241` (2,216,364 bytes) — "97% win rate
  against KataGo running at superhuman settings", "the strongest publicly
  available Go AI system at the time of writing", "Our adversaries do not win
  by playing Go well", "surround the cyclic group", "guarantee the capture
  before the victim realizes it is in danger and defends", "one of our
  authors, a Go expert, was able to learn from our adversary", "obtained a
  greater than 90% win rate against a top ranked KataGo bot that is
  unaffiliated with the authors", "KataGo and Leela Zero playing with 100k
  visits each, which is normally far beyond human capabilities", "persists
  even in KataGo agents adversarially trained to defend against our attack",
  and the 99% paraphrase's source ("over 99% confidence for most of the
  game"). The arXiv author list carries Tony T. Wang, Adam Gleave, Kellin
  Pelrine, Sergey Levine and Stuart Russell, so the entry's "a group
  including …" is accurate.

Also re-derived: "Nineteen months later" for March 2016 → 18 October 2017 is
right. Nothing changed.

## Version note 2026-08-31 (addictedtoai-dd5) — the >97% figure is not the November 2022 figure

**This record named the wrong version of its own source, and the entry
inherited the error as a date.** The defect class is `addictedtoai-dd5`: a real
URL and a real quoted string that are not from each other. On arXiv the two
documents are two *versions* at one unversioned URL rather than a landing page
and a PDF, but the failure is identical.

`https://arxiv.org/abs/2211.00241` serves the **latest** version. What the page
shows is the v4 abstract with the submission history beneath it, and that
history *opens* with "[Submitted on 1 Nov 2022]". Reading the date from the
history and the abstract from the top of the same page yields "v1 says >97%",
which is false. That is the exact mechanism, and it is worth naming because the
page gives no other cue.

Measured 2026-08-31 against `export.arxiv.org/api/query?id_list=2211.00241vN`,
which honours the version suffix (verified: the request for `v1` returns
`<id>…2211.00241v1</id>` with `updated: 2022-11-01T03:13:20Z`, while the
unversioned request returns `…v4`, `2023-07-13T06:37:29Z`). The headline number
changed in every revision:

- **v1** (2022-11-01): "Our attack achieves a >99% win-rate against KataGo
  without search, and a **>50% win-rate when KataGo uses enough search to be
  near-superhuman**." Also "the adversary wins by tricking KataGo into ending
  the game prematurely".
- **v2** (2023-01-09): ">99% win rate when KataGo uses no tree-search, and a
  **>77% win rate** when KataGo uses enough search to be superhuman".
- **v3** (2023-02-18): ">99% … no tree search, and a **>97% win rate** when
  KataGo uses enough search to be superhuman".
- **v4** (2023-07-13): "achieving a **>97% win rate against KataGo running at
  superhuman settings**. Our adversaries do not win by playing Go well. …
  The core vulnerability uncovered by our attack persists even in KataGo agents
  adversarially trained to defend against our attack."

So three strings this entry quotes — the >97% clause, "Our adversaries do not
win by playing Go well", and the adversarial-training sentence — are **v4 text
and appear in no earlier version**. v1 has none of them; its near-superhuman
number is >50%, forty-seven points away.

**Fixed in the entry.** The timeline row dated 2022-11-01 asserted "beat
superhuman KataGo in over 97% of games" — a claim the paper did not make until
v3, four months later. Following the precedent already set by
`seed-wiki-event-eliza.md` (which carries the two Turing-test postings as
separate dated rows rather than choosing between them), the row now states v1's
own numbers and pins `…/abs/2211.00241v1`, and a second row dated 2023-07-13
carries the >97% result pinned to `…/abs/2211.00241v4`. The body paragraph no
longer dates the >97% quote to November 2022; it gives v1's figure, says the
attack was strengthened across three revisions, and attributes the >97% quote
to July 2023. The `cyclic_adversary_win_rate` fact is version-sensitive, so its
`source_url` moved from the unversioned ar5iv render to `…/abs/2211.00241v4`,
the document that actually carries the value.

**What is unchanged and why.** The other quoted strings are body text, not
abstract text, and were verified against the full render; nothing here shows
them to be version-specific, so they are left attributed to "the paper" as
before. This note does not claim they are in v1 — it claims nothing about them.
