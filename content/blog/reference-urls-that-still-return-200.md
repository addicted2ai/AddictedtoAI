---
title: "Nine of twelve AI reference URLs return 200. Four of them are not what was cited."
date: "2026-08-28"
mentions:
  - tool/openrouter
---

A link checker looks at an HTTP status. Twelve URLs of the kind that appear in
citations — a coding leaderboard, a state-of-the-art table, a dataset page, an
arena — were fetched on 2026-08-28 with redirects followed by hand:

```text
checked 2026-08-28T20:55:07.540Z

https://aider.chat/docs/leaderboards/
   200  569700B

https://paperswithcode.com/
   302 -> https://huggingface.co/papers/trending
   200  1508226B

https://paperswithcode.com/sota/image-classification-on-imagenet
   302 -> https://huggingface.co/papers/trending
   200  1508226B

https://paperswithcode.com/task/question-answering
   302 -> https://huggingface.co/papers/trending
   200  1508226B

https://paperswithcode.com/dataset/imagenet
   302 -> https://huggingface.co/datasets/zh-plus/tiny-imagenet
   200  522225B

https://paperswithcode.com/paper/attention-is-all-you-need
   302 -> https://huggingface.co/papers/1706.03762
   200  291998B

https://www.paperswithcode.com/
   NO RESPONSE  ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE

https://huggingface.co/datasets/imagenet-1k
   302 -> https://huggingface.co/imagenet-1k/datasets
   404  52275B

https://chat.lmsys.org/
   NO RESPONSE  ENOTFOUND

https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard
   307 -> https://huggingface.co/spaces/lmarena-ai/arena-leaderboard
   200  31765B

https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard
   307 -> https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
   200  44037B

https://crfm.stanford.edu/helm/latest/
   200  232B  meta-refresh -> https://crfm.stanford.edu/helm/classic/latest
```

Three fail in a way anyone would notice: two never complete a request at all,
one ends in a 404. The other nine answer `200`, and a link checker marks all
nine green.

Of those nine, three land exactly where the citation pointed. Four land on
content that has nothing to do with the path requested. One is the page it
claims to be, with data that stopped 329 days ago. One arrives only through a
mechanism no link checker follows.

## A page that is up to date about being out of date

[`aider.chat/docs/leaderboards/`](https://aider.chat/docs/leaderboards/) is a
live page. The server returned `200` and a `last-modified` header of
`Sat, 25 Apr 2026 16:45:23 GMT` — the file itself was written 125 days before
this check.

The page carries its own byline: *"By Paul Gauthier, last updated November
20, 2025."* That is 281 days before this check, and the page does not hide it.
Look at the HTML around it and you find the date is generated, not typed:

```python
files = [
    'aider/website/docs/leaderboards/index.md',
    'aider/website/_data/polyglot_leaderboard.yml',
]
...
mod_dates = [get_last_modified_date(file) for file in files]
latest_mod_date = max(mod_dates)
cog.out(f"{latest_mod_date.strftime('%B %d, %Y.')}")
```

It is the newest git commit touching either of two files. That is a well-built
stamp, and it still measures the wrong thing for the question a reader is
asking. Editing a footnote in `index.md` advances the date; adding no model
for a year does not retard it.

The data underneath says something more specific. The page's HTML carries 68
distinct benchmark run identifiers, each of the form
`<date>-<time>--<run name>`. The oldest is dated 2024-12-21. The three newest:

```text
2025-08-25  gpt-5-medium
2025-10-03  deepseek-v3.2-chat
2025-10-03  deepseek-v3.2-reasoner
```

The newest run identifier on the board is dated 329 days before this check,
and 48 days before the banner's own "last updated" date. That 48-day gap is
the distance between "someone touched the repository" and "someone ran the
benchmark", and only one of the two is on the page.

For scale: the OpenRouter catalog served 398 models on the same day, of which
249 carry a `created` timestamp later than 2025-10-03. A reader who takes
that leaderboard as the current state of coding models is missing about
five-eighths of what is on sale.

Nothing here is a defect in the page. The banner is honest, the date is
computed, the URL resolves. The failure is entirely in the inference a reader
makes from `200` plus a recent-looking layout.

## Four shapes of the same domain, four different fates

`paperswithcode.com` now answers every request with a 302. Where it sends you
depends on the path, and the four shapes behave differently enough to be worth
separating.

A **paper** URL redirects correctly.
`/paper/attention-is-all-you-need` lands on
[`huggingface.co/papers/1706.03762`](https://huggingface.co/papers/1706.03762)
— the same paper, identified by its arXiv id. Someone built a real mapping for
that path.

A **SOTA table** URL does not.
`/sota/image-classification-on-imagenet` lands on
[`huggingface.co/papers/trending`](https://huggingface.co/papers/trending),
a feed of what is popular today. So does `/task/question-answering`. So does
the bare domain. The response is `200` and 1,508,226 bytes of a page that has
no relationship to the citation. A SOTA table was the thing that site was
cited *for*; it is the one path with no destination.

A **dataset** URL lands on a different dataset. `/dataset/imagenet` redirects
to
[`huggingface.co/datasets/zh-plus/tiny-imagenet`](https://huggingface.co/datasets/zh-plus/tiny-imagenet).
Its card tags it `source_datasets:extended|imagenet-1k` and
`size_categories:100K<n<1M`. The dataset a reader was chasing is tagged
`source_datasets:original` and `size_categories:1M<n<10M`, and lives at
[`ILSVRC/imagenet-1k`](https://huggingface.co/datasets/ILSVRC/imagenet-1k).
The redirect resolves, returns `200`, and shows an image-classification
dataset with a similar name and an order of magnitude fewer rows. This is the
worst kind of rot: not a dead end but a plausible substitute, which a human
skimming and a script scraping will both accept.

And **the `www` host does not answer at all**. `www.paperswithcode.com`
resolves in DNS to the same address as the apex — `3.169.202.99` — and then
fails the TLS handshake. A citation written with the `www` gets a connection
error, not a redirect, from an address that is serving redirects.

Meanwhile `huggingface.co/datasets/imagenet-1k` — the un-namespaced short
form, from before that dataset moved under an owner — 302s to
`huggingface.co/imagenet-1k/datasets`, and that URL returns 404. The live copy
is at `ILSVRC/imagenet-1k`, and the redirect does not point there.

## Two moves done right, on the same host

The comparison matters, because it shows this is not a law of nature.

`huggingface.co/spaces/lmsys/chatbot-arena-leaderboard` 307s to
`spaces/lmarena-ai/arena-leaderboard`. `spaces/HuggingFaceH4/open_llm_leaderboard`
307s to `spaces/open-llm-leaderboard/open_llm_leaderboard`. Both are org
renames; both land on the same artifact under its new owner; both preserve the
citation exactly. Same host, same redirect mechanism, correct result.

The hard failures are the honest ones. `chat.lmsys.org` does not resolve —
`ENOTFOUND`, no server, no ambiguity. A dead name tells you it is dead. A 302
into a trending feed does not.

## "Latest" that means "classic"

`crfm.stanford.edu/helm/latest/` returns `200` and 232 bytes: a bare document
whose only content is `<meta http-equiv="refresh" content="0; URL=https://crfm.stanford.edu/helm/classic/latest">`.
The path that says *latest* is a stub pointing at the path that says
*classic*. Both words are accurate and they mean opposite things to a reader.
A checker that follows only HTTP redirects never sees the second hop at all,
because a meta refresh is not a redirect.

## The measurement that would have caught these

Link rot is the failure everyone tests for, because a 404 is trivially
machine-detectable. Reference rot — a URL resolving to something that no
longer supports the claim it was cited for — is invisible to that same test.
Nine green checks: four landing on unrelated content, one on a frozen board,
one reachable only through a meta refresh.

Three checks separate them, none expensive:

- **Record the byte length or a hash of the destination when you cite it.**
  Every paperswithcode SOTA path in this set now returns the identical
  1,508,226 bytes. Two different citations resolving to the same page is a
  detectable signal, and no status code will ever show it.
- **Follow meta refreshes, not just 3xx.** One of the twelve moves only that
  way.
- **Read the destination's own date, and compare it to what you are claiming
  from it.** The Aider leaderboard tells you `November 20, 2025` without being
  asked; the gap between that and its newest run has to be read from the data.

Every fetch above is reproducible: twelve URLs, manual redirect following, one
pass, timestamped `2026-08-28T20:55:07.540Z`. Any of these may be repaired
tomorrow, which is the argument for dating the check rather than the claim.
