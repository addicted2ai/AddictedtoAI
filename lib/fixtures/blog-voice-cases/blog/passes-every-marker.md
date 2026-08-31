---
title: "A post that trips nothing"
date: "2026-08-28"
mentions: []
---

Anthropic cut the price of its smallest model by half on 12 August, and said
the new rate holds until the end of the year. The company's own pricing page
carries the figure. Nothing else about the tier changed — the context window,
the rate limits and the availability regions are all where they were the week
before.

Two groups notice a change like this. The first is anyone running a batch job
against that tier, whose monthly bill halves without them touching a line of
code. The second is anyone who chose a competitor on price in the spring, for
whom the arithmetic that decided it has now moved.

## The rate that changed, and the one that did not

Input tokens are the half that moved. Output stayed where it was, which is the
detail most of the coverage left out, and it is the one that decides whether
the cut reaches a given workload at all. A summarisation job reads far more
than it writes, so it sees most of the benefit. A code generation job writes
far more than it reads, so it sees very little.

The announcement gives no reason for the change and does not say what happens
in January. Anthropic names neither a competitor nor a cost, and it would be a
guess to supply either.

Anyone whose bill matters should read their own token split before deciding
anything. The vendor's page has the rates. A week of usage has the ratio —
together they answer the question, and no summary of the news can.
