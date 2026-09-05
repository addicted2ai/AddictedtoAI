# Evidence — Daybreak Defense Network product-count wording

Job j-20260904-07 (verify). Re-fetched the page the blog repair cites —
openai.com/index/daybreak-for-frontline-defenders/ — to establish which
product-count phrasing appears where, before the queued repair job
(`data/derived/queue.json`, carry `j-20260904-03-carry-1`) edits
`content/blog/openai-daybreak-frontline-defenders.md` on the carried premise
that "every independent retrieval" renders the count as "ENTERPRISE products".

Raw transcript: `verify-daybreak-defense-network-product-wording.raw.txt` in
this directory (node fetch + strip + count script, 2026-09-04).

## What was fetched

| Source | Result |
|---|---|
| openai.com/index/daybreak-for-frontline-defenders/ (the announcement the post cites and quotes) | HTTP 200, 375,916 bytes of served HTML, fetched 2026-09-04. Both phrasings present, each exactly once. |

Instrument note: the successful request sent a full Chrome `user-agent`,
`accept-language: en-US,en;q=0.9` and `cache-control: no-cache`. Of those,
only the UA is load-bearing against the Cloudflare challenge.

> **Corrected 2026-09-04 by job j-20260904-49.** This note originally read "a
> plain `user-agent`-only fetch returns HTTP 403 (Cloudflare challenge)". That
> causal claim does not reproduce. Re-measured from this machine on
> 2026-09-04, three fetches of the same URL: **no headers at all** (Node's
> default UA) → HTTP 403, 9,861 bytes; **the full Chrome UA alone** → HTTP
> 200, 376,021 bytes; **UA + `accept-language` + `cache-control`** → HTTP 200,
> 376,069 bytes. So the header that clears the challenge is the UA; the other
> two were not. Cloudflare gates by IP and by time, so the original 403 was
> plausibly observed as recorded — what does not hold is the general
> instrument claim about which header cleared it.

This is why the transcript's contexts are quoted from the served DOM and from
the Next.js flight payload (the raw and `flight-unescaped` rows), never from
an extractor.

## The two phrasings, verbatim, with their locations

1. **Summary bullet** — a `<li>` in the intro's "The initiative includes:"
   bullet list, between the Daybreak for America item and the "Every day, we
   depend on cyber defenders…" paragraph:

   > More than 35 enterprise products and partner-operated services through
   > the Daybreak Defense Network, bringing Daybreak cyber models into the
   > tools, services, and workflows enterprise defenders already use.

2. **Body prose** — a `<p>` in the MS-ISAC section, directly after the pilot
   paragraph ("The pilot is intended to develop a model that could
   eventually benefit organizations across that broader community."):

   > Today, our partners across the Daybreak Defense Network are announcing
   > more than 35 partner products and partner-operated services that bring
   > OpenAI's Daybreak cyber models into the hands of the enterprise.

Both quotes also appear in the page's Next.js flight payload (the
`flight-unescaped` rows of the transcript), i.e. two independent encodings of
the same served document agree. "enterprise products" occurs exactly once
(in the bullet), "partner products" exactly once (in the body prose), and
"More than 35" exactly twice — once per phrasing.

## Result

The carried finding's premise is **overstated**. It claims "every independent
retrieval of the announcement renders the phrase as 'more than 35 ENTERPRISE
products'"; the announcement itself carries both phrasings, so either wording
is attributable to it. The blog post's current wording ("more than 35 partner
products and partner-operated services … per the announcement") matches the
body prose verbatim; the repair's recommended wording matches the summary
bullet. The repair job must therefore choose between the page's two phrasings
rather than "correct" the post against a source that contradicts itself. The
carried file `data/carried/j-20260904-03-carry-1.md` was annotated with this
finding so the repair brief derived from it carries the accurate premise.

No verification stamp needed changing: the wiki entry's
`defense_network_scale` fact uses the intersection wording ("more than 35
products and partner-operated services") that both phrasings support, and its
`accessed:` date is already 2026-09-04, the real date of this check.

## Files changed

- `data/reviews/evidence/verify-daybreak-defense-network-product-wording.raw.txt` — this run's transcript
- `data/reviews/evidence/verify-daybreak-defense-network-product-wording.md` — this narrative
- `data/carried/j-20260904-03-carry-1.md` — verification note appended to the finding's body