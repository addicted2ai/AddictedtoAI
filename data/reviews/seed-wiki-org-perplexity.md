---
job: seed-wiki-org-perplexity
verdict: revise
reasons:
  - false-or-unsupported-claim
would-cite: >-
  Nobody should cite this page's litigation paragraph as it stands: it dates
  the Dow Jones and New York Post suit to June 2024 when the complaint was
  filed on 21 October 2024, in the very passage whose purpose is to separate
  filed suits from cease-and-desist letters by date.
reviewer: rr1b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Censuses re-run from
`data/sources/openrouter-models/latest.json` (snapshot 2026-08-28, 388 rows)
with my own script; every quotation matched as a literal substring against
bytes I fetched on 2026-08-29.

**Everything the page is really about, verified exactly:**

- 30 rows carry `pricing.internal_reasoning`: 27 `google/` plus 2 `~google/`
  alias rows = 29 Gemini, and the thirtieth is `perplexity/sonar-deep-research`
  at 0.000003. Its pricing object is prompt + completion + internal_reasoning
  + web_search 0.005, so "on top of input, output and a per-search charge" is
  the literal shape of the record.
- 123 rows carry `pricing.web_search`. `perplexity/sonar-pro-search` at
  **0.018** is the maximum in the snapshot. Google's highest is 0.014, and
  every OpenAI row and every Anthropic row that carries the field is exactly
  0.01 — I checked the distinct values per vendor rather than the maxima, so
  "nearly twice what OpenAI and Anthropic charge" (1.8x) is not hiding a
  cheaper row.
- Exactly five `perplexity/` rows; `hugging_face_id` is the empty string on
  all five. `sonar-pro-search` `created` = 2025-10-30.
- https://openrouter.ai/perplexity/sonar-deep-research: carries verbatim
  "Prompt tokens (user prompt) + Citation tokens (these are processed tokens
  from running searches)". I fetched the listing page for this one because the
  API `description` truncates before the quoted clause — the snapshot alone
  cannot support the fact.
- The snapshot's own `description` fields carry verbatim "a premier reasoning
  model powered by DeepSeek R1 with Chain of Thought" and "Exclusively
  available on the OpenRouter API".
- en.wikipedia.org (Special:Export wikitext) supports, verbatim: August 2022
  founding; the four founders; San Francisco, California; "a valuation of
  $21.21 billion following its Series E-6 funding round"; "Its real-time
  search engine (API service) is called Sonar and is based on Meta's Llama
  model"; the August 2025 Cloudflare stealth-crawler and robots.txt finding;
  "In October 2024, The New York Times sent a cease-and-desist notice";
  "In June 2025, UK broadcaster the BBC threatened legal action";
  "On August 8, 2025, the Japanese newspaper company Yomiuri Shimbun filed a
  lawsuit"; "Later that month, two more Japanese newspaper companies, The
  Asahi Shimbun and The Nikkei, also sued"; and "In February 2026, Perplexity
  transitioned to a subscription-first model by discontinuing its
  AI-integrated advertising strategy".

**Defect 1 — a false date, introduced by the round-one fix.**

"The publishers that have taken it to court are Dow Jones and the New York
Post, **in June 2024**". The complaint was filed on **21 October 2024**. The
cited Wikipedia article's prose does say "In June 2024", but its own citations
on that same sentence contradict it, and I checked each:

- the WSJ reference attached to the sentence is dated `2024-10-21`, titled
  "Wall Street Journal, New York Post Sue AI Startup Perplexity, Alleging
  'Massive Freeriding'";
- I fetched the Engadget piece it also cites: `article:published_time` is
  `2024-10-22T05:01:35+00:00`, headline "Wall Street Journal and New York Post
  **are suing** Perplexity AI for copyright infringement" — present tense, the
  day after filing;
- the article's *next* sentence reads "On October 24, 2024, Perplexity AI
  published an official response ... asserting that the claims in the lawsuits
  were misleading";
- its Variety reference is dated `2024-10-25`, "After News Corp's Dow Jones
  Sues".

The only June 2024 item anywhere in that article is a Forbes opinion piece of
June 11, 2024, which is not a lawsuit. This is an inherited source error, but
it is still a false dated claim, and it lands in the one passage whose entire
function is to be precise about dates: the next sentence dates the NYT
cease-and-desist to October 2024 specifically to contrast a threat with a
filed suit — and the filed suit was the same month, which dissolves the
contrast the paragraph is built on. Correction: **21 October 2024**.

**Defect 2 — a sentence that contradicts its own paragraph.**

"Outside Google's family, no vendor in the catalog bills reasoning separately
at all." The sentence immediately before it names
`perplexity/sonar-deep-research` as the thirtieth such row, and Perplexity is
outside Google's family. By measurement there is exactly one non-Gemini row
that bills reasoning separately and it is Perplexity's. As printed the
sentence is false; it is also a restatement of the 30 = 29 + 1 split the
reader was given two sentences earlier, which is the cut list's "restating in
prose what a transclusion already shows". Round 1 quoted this sentence and
confirmed it, reading it as "no *other* vendor" — that reading is what the
author meant and the census behind it is right, but it is not what the page
says. Deleting the sentence loses nothing.

Recorded, not blocking: the same Wikipedia article carries "In October 2025,
Reddit sued Perplexity in federal court in New York, alleging that it and
three other companies unlawfully scraped its data" — a scraping suit absent
from a paragraph about contested scraping, though defensible if "publishers"
is read strictly as newspapers. And the `underlying_models` fact names
"Anthropic" and "Moonshot AI", neither of which appears anywhere in the cited
wikitext; the article's infobox lists model names (Claude Opus 4.7, Kimi
K2.6). The mapping is correct and round 1 flagged the same method; I agree it
is safe, and note it only so it is not re-litigated.

Round 1 (r6-fable) found one blocking defect: a sentence flattening the NYT,
the BBC, Dow Jones and the Japanese publishers into "have filed copyright
suits against it", when two of the four never filed. **Fixed, and fixed well
— but the fix introduced Defect 1.** The repair added dates that the previous
sentence did not carry, and one of them is wrong. This is exactly the case the
seal exists for: I found the date independently, from the source's own
citations, before opening this record.

**Which case this is, plainly, because it is the last judgment anyone makes
about this page:** this is a *one-clause* failure, not a dead thesis. Every
census the page is built on — the reasoning-token distribution, the 123-row
per-search census and its maximum, the five rows with no weights of their own,
the DeepSeek R1 line — survived measurement exactly, and they exist nowhere
else. If a correction is possible instead of a discard, it is four words in
one sentence ("in June 2024" → "in October 2024") and the deletion of one
redundant sentence, and the page then publishes. I am recording the corrected
date here so it survives even if the body does not. But the page as it now
stands asserts a checkable fact about the world that is wrong by four months,
in the passage that exists to get such facts right, and a reader cannot
correct it from anything on the page. Revise.
