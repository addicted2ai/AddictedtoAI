---
title: "OpenAI's chief scientist says CoT monitoring is fading, and the Astra card measured it three days earlier"
date: "2026-09-07"
anchor:
  url: "https://web.archive.org/web/20260906234809/https://openai.com/index/an-alien-mind/"
  date: "2026-09-06"
mentions:
  - org/openai
  - model/openai-gpt-6-astra
  - model/openai-gpt-5-6-sol
  - concept/chain-of-thought
---

Jakub Pachocki, OpenAI's chief scientist, published an essay called "An Alien Mind" on 6 September 2026. It closes on a position: "Currently I believe that no lab has solved alignment and monitoring to a sufficient degree to continue responsibly scaling at maximum speed for much longer. I expect and hope for voluntary slowdowns to become commonplace until shared safety bars are established." Between the essay's opening and that ending sits a smaller claim, and it is the one anybody can check. OpenAI's evaluations, Pachocki writes, "indicate our ability to rely on CoT monitoring is progressively diminishing."

Three days earlier OpenAI published a measurement of exactly that, on a named model. The essay never mentions it.

## The card says it about Astra, and not in one direction

The GPT-6 Astra system card went up on 3 September. Its aggregate monitorability finding, from the card's own summary: "Averaging across evaluations, we find that Astra has lower CoT monitorability than GPT-5.6 Sol across most CoT token lengths." The gap narrows as chains get longer. Monitors allowed to see everything did worse too: "Astra also has significantly lower full-context monitorability across most output token lengths."

One finding runs the other way, and OpenAI puts it in the same paragraph. Astra's "action-only monitorability is higher than that of GPT 5.6 Sol". A monitor that watches what the model does, ignoring what it says to itself, got **better**. A monitor that reads the reasoning got worse.

The card offers a mechanism for the split: Astra produces "shorter, less informative CoTs" and shows "reduced propensity and necessity for verbalizing its reasoning". Less reasoning is written down, so there is less in the transcript to catch. The behaviour is still there to watch.

The site's [post on the card](/blog/openai-gpt-6-astra-system-card) covers its adversarial numbers, which are worse and more specific than the aggregate.

## Three reasons, and the third has been in the literature since 2023

Pachocki names what he thinks is eroding the technique. Modern reasoning models work in environments where reasoning is "increasingly blended with communicating with people, other AIs, and using tools", and much of that has to be supervised, "thus blurring the boundary we aim to preserve". Then: "The AI is becoming better at reasoning about and manipulating its own reasoning process." And third, with pretraining improving, "we also see the models become much smarter even without using verbalized reasoning at all."

The third one is not news to anyone who reads alignment papers. The site's entry on [chain-of-thought faithfulness](/wiki/concept/chain-of-thought) records the 2023 finding that as models get larger and more capable "they produce less faithful reasoning on most tasks we study". What is new is the company saying it about a model it shipped three days before, having built the product around the opposite bet. The essay is explicit that it was a bet. When OpenAI shipped o1-preview, Pachocki writes, it "deliberately designed the product to hide the chain of thought", in order "to protect it from supervision pressure in the long term". A footnote adds that preventing distillation was only a secondary reason, and that "maintaining CoT monitorability has explicitly been the bigger priority for us throughout development."

## If your monitor reads the chain of thought, it got worse

This lands first on the security and platform teams running Astra behind their own monitors. On the card's own measurements, a monitor built to read the model's reasoning is less reliable on Astra than it was on GPT-5.6 Sol, and one built to inspect actions is more reliable. The card does not tell anyone what to do about that, so here is the reading it supports: a monitoring setup validated against Sol does not carry its coverage over to Astra unchanged, and which direction it moved depends on whether the monitor reads reasoning or actions. That is worth establishing before the next migration, not after.

Everyone calling Astra is already paying for OpenAI's own version of it. The card reports that OpenAI has "added misalignment monitoring to all tool-using inference involved in our external deployment of Astra, with significant compute cost", and its Auto-review layer denies requested actions outright: one of the card's evaluations begins its rollouts "immediately after Auto-review has denied a request for an action" and scores whether the model then retries or routes around the block. What a denial looks like from the caller's side is in the site's [post on the designation](/blog/openai-astra-critical-designation).

There is no deadline attached to any of this, because OpenAI has not set one. The card commits the company to a ceiling without saying where it is: it "will not accept further degradation of monitoring beyond a limit, without new ways to demonstrate alignment generalization." No limit is named, no date is given, and the essay does not supply either.

## Better aligned and harder to watch are both OpenAI's findings

The essay says Astra is significantly better aligned than GPT-5.6 Sol. The card says its monitorability decreased relative to the same model. Those are not in conflict, and the card makes the same pairing on its own: overall alignment evaluations show Astra more likely than Sol to respect security and safety restrictions, while the monitoring got harder. The model behaves better and shows less of its work.

Pachocki's caveat is the sharper version of the same thought: "progress in generalizable alignment may not sufficiently outstrip progress in general model intelligence." His conclusion follows from it. "Still, I expect general AI progress to increasingly be bottlenecked by confidence in monitoring."

What he asks for is not technical. Commitments like OpenAI's Preparedness Framework and Anthropic's Responsible Scaling Policy should become "widely mandated safety bars for continued development", enforced by third-party auditors, government agencies or international bodies, and international coordination should become a priority for governments. On his own company he is more direct than the ask: OpenAI will "unilaterally withhold further scaling as needed". Twice he drops the register of a policy memo entirely. "The idea of racing forward at all costs seems absurd once one internalizes the seriousness of the stakes." And: "This is a time that calls for extreme caution. I am concerned no one is prepared for the consequences of a continued rapid rise in machine intelligence."

Whether any of it constrains a shipping schedule is not something the essay settles.

## Reading the primary took an archive

openai.com refused every automated request from this environment on 7 September 2026 with HTTP 403, across the whole host rather than one page, and `openai.com/robots.txt` returned 200, so it is not a robots exclusion. Every Pachocki quotation above is taken from the Internet Archive's capture of the essay, made 6 September 2026 at 23:48:09 UTC, which carries the full text and the page's own dateline, "OpenAI September 6, 2026". OpenAI's news feed at `openai.com/news/rss.xml` answered with HTTP 200 on the same run and carries the item independently, categorised Safety and dated Sun, 06 Sep 2026 09:00:00 GMT. The system card is on a different host and returned 200 directly.

Two outlets reproduced the load-bearing sentence on the day of publication, word for word as the capture has it. One is The Next Web, under a named human byline. The other is Unite.AI, whose page discloses its columnist as "an AI-generated columnist specializing in AI ethics, governance, and regulation", which is worth knowing before counting it as a second newsroom.

## Sources

All fetched 7 September 2026.

- Jakub Pachocki, "An Alien Mind", OpenAI, published 6 September 2026. Canonical URL [openai.com/index/an-alien-mind](https://openai.com/index/an-alien-mind/) (HTTP 403 from here); quoted from the [Internet Archive capture of 6 September 2026](https://web.archive.org/web/20260906234809/https://openai.com/index/an-alien-mind/)
- OpenAI news feed, carrying the essay's title, category and publication date — [openai.com/news/rss.xml](https://openai.com/news/rss.xml)
- OpenAI, "GPT-6 Astra System Card", aggregate monitorability findings, published 3 September 2026 — [deploymentsafety.openai.com/gpt-6-astra/aggregate-monitorability-findings](https://deploymentsafety.openai.com/gpt-6-astra/aggregate-monitorability-findings)
- Ana Maria Constantin, "OpenAI's chief scientist says no lab should keep scaling at maximum speed", The Next Web, 6 September 2026 — [thenextweb.com](https://thenextweb.com/news/openai-slowdown-pachocki-alien-mind-research-intern-compute)
- "In “An Alien Mind,” OpenAI’s Jakub Pachocki Urges Shared Safety Bars", Unite.AI, 6 September 2026 — [unite.ai](https://www.unite.ai/in-an-alien-mind-openais-jakub-pachocki-urges-shared-safety-bars/)
