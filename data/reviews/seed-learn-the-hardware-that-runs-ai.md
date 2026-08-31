---
job: seed-learn-the-hardware-that-runs-ai
verdict: approve
reasons: []
would-cite: >-
  Someone reading an accelerator launch announcement and taking its headline
  arithmetic figure for the speed they will get — this page supplies the second
  number the announcement omits, memory bandwidth, together with the twenty-year
  measurement showing arithmetic throughput growing three times every two years
  while memory bandwidth managed 1.6, which is why the chip is usually waiting
  rather than computing.
reviewer: independent record reviewer, seven-page set (fresh context, no edit rights)
date: 2026-08-30
---

Checklist: education page (mechanics, Area C), against `openspec/curriculum/learn.md`
§2, §3 and the §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. Sources fetched to disk 2026-08-30, including the
Llama-3 paper's full text rather than its abstract, because that is where its
numbers live.

**Sendable sentence, verbatim** — the page's bolded line:

> An accelerator's headline speed is the speed of its arithmetic, and the
> arithmetic is almost never what you are waiting for.

The closing line is nearly as good and does different work ("The calculating was
never the expensive part"), because by then the page has shown the same shape at
three scales — chip waiting on memory, server waiting on network, company
waiting on a packaging queue.

## What I verified at source

- **arXiv 2403.14123** — the abstract reads "peak server hardware FLOPS has been
  scaling at 3.0x/2yrs, outpacing the growth of DRAM and interconnect bandwidth,
  which have only scaled at 1.6 and 1.4 times every 2 years, respectively." The
  page renders this as arithmetic throughput at three times every two years,
  "while memory bandwidth and the links between chips managed only 1.6 and 1.4
  times over the same interval." The pairing is correct in both directions —
  DRAM to memory bandwidth, interconnect to links between chips — which is the
  thing that would be easy to get backwards. "A 2024 survey of two decades" is
  exact: arXiv 2403, "over the past 20 years".
- **arXiv 1602.01528** — "is two orders of magnitude more expensive than ALU
  operations" and "dominates the required power" both present verbatim, and the
  page's gloss ("Roughly a hundred times more energy") is the correct reading of
  two orders of magnitude.
- **arXiv 2407.21783 (full text, not the abstract)** — every cluster number
  checks against the paper's own sentences: "During a 54-day snapshot period of
  pre-training, we experienced a total of 466 job interruptions. Of these, 47
  were planned … The remaining 419 were unexpected"; "Approximately 78% of the
  unexpected interruptions are attributed to confirmed hardware issues"; "we
  achieved higher than 90% effective training time", where the paper defines
  effective training time as "the time spent on useful training over the elapsed
  time" — which is exactly how the page states it; and "16K GPU training" for
  the page's "up to sixteen thousand". I also re-derived the page's own
  arithmetic: 54 days is 1,296 hours, and 1,296 / 466 is 2.8, so "an
  interruption about every three hours, for weeks" is right.
- **Extreme ultraviolet lithography (Wikipedia)** — the article says the named
  company "is the only company that produces and sells EUV systems for chip
  production … though Reuters reported in December 2025 that China had developed
  its own prototype EUV lithography system." The page's "a single company was
  the only producer and seller of them, with a prototype built in China reported
  that December" is supported, and it deliberately does not name the company,
  which is the role-first rot defence §4 asks for.

## The defect the earlier review found, confirmed repaired

The mechanics review's finding 5 recorded an undated spec literal: "memory chips
are stacked in towers of as many as thirty-two". §4's must-not for this page
names spec-sheet figures as exactly the thing to date or transclude. I checked
the current bytes rather than the report: the page now reads "memory chips are
stacked in towers — as of 2026, as many as thirty-two high", with the date
carrying the link. `git show 79466a8` shows that edit. Fixed, and fixed in the
armoured form the page already used two sections earlier.

## A finding of my own — a must-cover delivered by substitution

§4 requires "the supply chokepoint as structure (design concentrated in one
company, leading-edge fabrication in one region — no market numbers in prose)".
The page delivers *a* supply chokepoint account, and a good one: lithography
machines from a single supplier, and advanced packaging as a second scarce
capacity with its own queue, closing on "An accelerator company can have every
logic die it ordered and still ship nothing." But the two structural facts §4
actually names — **accelerator design concentrated in one company**, and
**leading-edge fabrication concentrated in one region** — are not stated. The
page's one company is the lithography maker, not the accelerator designer, and
no region is named as a concentration.

I resolved this in the page's favour rather than calling `spec-violation`, and
the reasoning is worth recording because a later reviewer will hit the same
line. §4 gives that exact pair of facts to `who-builds-ai` in almost identical
words, and this page explicitly hands that half off: "The industrial
consequences of a chain this narrow are somebody else's subject. What the
machine explains is why the narrow places are narrow." That is a division of
labour that avoids duplicating a neighbour, and it is stated on the page rather
than done quietly. The reader still leaves holding the required understanding —
that chokepoints exist and why they cannot be competed away quickly.

What the page owes and did not pay is §0.5: a deviation from an entry is
supposed to be an amendment to the curriculum in the same commit, visibly, with
a sentence of reasoning. That did not happen, so the map still describes a page
that does not exist. Recorded here rather than repaired, since a reviewer who
edits the map destroys the evidence. The earlier mechanics review did not
record this.

## Rung, terms, links

Mechanics admission test met — every named part is defined where it lands:
accelerator ("The chip doing this arithmetic is called an accelerator, whatever
its manufacturer is calling the product line this year" — which also inoculates
the noun against rot), arithmetic throughput, memory bandwidth, arithmetic
intensity, logic die, packaging. Closure is `how-a-language-model-works` and
`how-models-are-trained` plus their ancestors; `what-a-neural-network-is` is in
it and the page's one link there is earned. `who-builds-ai` and
`how-inference-is-served` sit outside the closure and are both deferrals whose
sentences stand alone, which §5 permits.

Front matter matches §4: level, both prerequisites, outcome verbatim. All three
mentions and all eight internal links resolve on disk. The prefill/decode
pre-seeding §4 asked for is present and explicit, and serving economics are
handed to the advanced page rather than annexed.

## Taken on trust

I did not verify the Wikipedia HBM article's "up to 32" independently of the
page's own citation beyond confirming the figure appears there; and the two
Wikipedia sources are secondary by nature, which the page's dating partly
insures against. I did not check the three wiki entries' contents.

Approve. The two-numbers frame is the spec-sheet literacy nothing
consumer-facing teaches, and the page earns its ending honestly: the same
wait-on-the-slower-thing shape recurs at chip, server and industry scale, which
is a generalisation the reader can carry to a claim this page never makes.
