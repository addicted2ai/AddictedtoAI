---
job: seed-open-frontier-weights
verdict: approve
reasons: []
would-cite: "For arguments about how release norms moved: the same field went from withholding a language model as too risky to publish to shipping a 405-billion-parameter flagship for anyone to download, each end datable to a public source."
reviewer: task-6.5 seed reviewer (fresh context, no edit rights)
date: 2026-08-28
---

Checked both ends by fetching.

- End A: fetched the Slate article; publication date February 22, 2019
  matches the front matter. Observed verbatim: "OpenAI decided to release a
  'much smaller' version of the model and withhold the data sets and
  training codes that were used to develop it" — every clause of the delta's
  end-A sentence (withholds full GPT-2, publishes much smaller version,
  keeps back datasets and training code) is supported.
- End B: fetched the Meta blog post; publication date July 23, 2024 matches.
  Observed verbatim: "Unlike closed models, Llama model weights are
  available to download. Developers can fully customize the models for their
  needs and applications, train on new datasets, and conduct additional
  fine-tuning," with the 405B flagship described as "competitive with
  leading foundation models across a range of tasks, including GPT-4,
  GPT-4o, and Claude 3.5 Sonnet" — supporting both the sentence and the
  "405 billion parameters" metric, and the "largest-class" framing in the
  capability line.

On the author's disclosed compromise: end A cites a dated secondary report
because OpenAI's own announcement (February 14, 2019) 403s from here. The
delta dates its end to the source it actually cites, which is the honest
way to run that compromise. If the primary ever becomes reachable, re-dating
end A to 2019-02-14 against it would be tighter; not required.

Quality: I rank this higher than the author does. The reversal — an
organization judging one model too dangerous to publish, and the industry
five years later publishing a frontier-class model outright — is one of the
sharpest ironies on the surface, and it is told without editorializing.

## Recheck 2026-08-29 (wave addictedtoai-flh) — approve stands

Re-examined because this delta was approved in the earlier seed round, which
the 2026-08-29 seed wave never revisited.

- End A, the Slate article (411,369 bytes, HTTP 200, page dated "Feb 22,
  2019"): "the organization said, it would not be releasing the full algorithm
  due to 'safety and security concerns.' Instead, **OpenAI decided to release
  a 'much smaller' version of the model and withhold the data sets and
  training codes** that were used to develop it." All three clauses of the
  delta's end-A sentence are in that one sentence. Date and claim hold.
- End B, `ai.meta.com/blog/meta-llama-3-1/` — **the live URL now returns HTTP
  400** from this machine (twice, with a browser user-agent; the body is
  Meta's generic "Sorry, something went wrong" error page, 1,542 bytes, not a
  404). That is an observation about the host, not evidence about the content,
  so I verified the cited page from the Internet Archive's capture of that
  exact URL, `web.archive.org/web/20240724231532/https://ai.meta.com/blog/meta-llama-3-1/`
  (188,780 bytes, HTTP 200, captured 2024-07-24). It carries the byline
  "**July 23, 2024**" and, verbatim: "Unlike closed models, **Llama model
  weights are available to download. Developers can fully customize the models
  for their needs and applications, train on new datasets, and conduct
  additional fine-tuning.**" and "include **Llama 3.1 405B**—the first
  frontier-level open source AI model." Date, claim and the "405 billion
  parameters" metric all supported.
- The metric was corroborated independently of any blog post: the Hugging Face
  API record for `meta-llama/Llama-3.1-405B` gives
  `safetensors.total = 405,853,388,800` parameters, i.e. 405B to the stated
  precision, with `createdAt 2024-07-16` and the `license:llama3.1` tag.

Filed separately as a durable follow-up: the live 400 on the cited Meta URL is
a link-health question for the whole corpus, not for this delta alone, and it
belongs in the linkcheck layer rather than in this record. Nothing in the
delta changed.
