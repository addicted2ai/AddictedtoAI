# Evidence — post `reference-urls-that-still-return-200`

Every fact in the post was checked live on 2026-08-28. Nothing was taken from
a prior note or a design document.

## The twelve-URL table (as published)

`rot-table.mjs` — manual redirect following, one pass:

```
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

## Status of the two leads named in the change's design inputs

Both were checked today rather than assumed. **Neither had healed.**

- **The Aider leaderboard banner.** Live, and still showing a date well in
  the past. See below for the exact string and the cog block that generates
  it.
- **paperswithcode.com.** Live as a redirector. Its behavior turned out to be
  more interesting than "it redirects": four path shapes, three different
  fates, one of them correct.

## Aider leaderboard, in detail

```
$ node aider.mjs
GET https://aider.chat/docs/leaderboards/ -> 200, 569700 bytes,
last-modified: Sat, 25 Apr 2026 16:45:23 GMT
```

The banner, and the cog block that produces it, as they appear in the page's
HTML:

```html
<p class="post-date" style="margin-top: 20px;">
By Paul Gauthier,
last updated
<!--[[[cog
import subprocess
import datetime

files = [
    'aider/website/docs/leaderboards/index.md',
    'aider/website/_data/polyglot_leaderboard.yml',
]

def get_last_modified_date(file):
    result = subprocess.run(['git', 'log', '-1', '--format=%ct', file], capture_output=True, text=True)
    if result.returncode == 0:
        timestamp = int(result.stdout.strip())
        return datetime.datetime.fromtimestamp(timestamp)
    return datetime.datetime.min

mod_dates = [get_last_modified_date(file) for file in files]
latest_mod_date = max(mod_dates)
cog.out(f"{latest_mod_date.strftime('%B %d, %Y.')}")
]]]-->
November 20, 2025.
<!--[[[end]]]-->
</p>
```

Run identifiers extracted from the page:

```
$ node aider3.mjs
distinct run ids: 68
oldest 3:
   2024-12-21  polyglot-deepseek-diff
   2024-12-21  polyglot-gpt-4o-mini
   2024-12-21  polyglot-haiku-diff
newest 8:
   2025-07-11  xai-or-grok4-high
   2025-07-17  kimi-k2-diff-or-pricing
   2025-08-06  gpt-oss-120b-high-polyglot
   2025-08-23  gpt-5-high
   2025-08-25  gpt-5-low
   2025-08-25  gpt-5-medium
   2025-10-03  deepseek-v3.2-chat
   2025-10-03  deepseek-v3.2-reasoner
```

## Date arithmetic

```
$ node days.mjs
2025-11-20 -> 2026-08-28 : 281 days
2025-10-03 -> 2026-08-28 : 329 days
2025-10-03 -> 2025-11-20 : 48 days
2026-04-25 -> 2026-08-28 : 125 days
2024-12-21 -> 2026-08-28 : 615 days
249/398 = 0.626
```

A first draft of the post said "44 days" for the third of these. The
arithmetic check corrected it to 48 before publication.

## The 249-of-398 comparison

From the OpenRouter snapshot taken the same day (see the
`openrouter-catalog-watch` evidence file for the fetch transcript):

```
$ node since.mjs
snapshot 2026-08-28T20-26-39-358Z.json 398 rows
rows with created > 2025-10-03: 249
rows with created > 2025-11-20: 227
rows with created > 2026-01-01: 201
by created year: {"2023":8,"2024":39,"2025":150,"2026":201}
```

## The tiny-imagenet substitution

```
$ node tiny.mjs
id: zh-plus/tiny-imagenet | downloads: 17401 |
tags: task_categories:image-classification, task_ids:multi-class-image-classification,
      annotations_creators:crowdsourced, language_creators:crowdsourced,
      multilinguality:monolingual, source_datasets:extended|imagenet-1k,
      language:en, size_categories:100K<n<1M, format:parquet, modality:image

ILSVRC/imagenet-1k id: ILSVRC/imagenet-1k | gated: auto |
tags: task_categories:image-classification, task_ids:multi-class-image-classification,
      annotations_creators:crowdsourced, language_creators:crowdsourced,
      multilinguality:monolingual, source_datasets:original, language:en,
      license:other, size_categories:1M<n<10M, format:parquet
```

`source_datasets:extended|imagenet-1k` and `size_categories:100K<n<1M` against
`source_datasets:original` and `size_categories:1M<n<10M` are the whole basis
for the post's claim that the redirect target is a derived, smaller dataset.
No claim is made about who configured the redirect or why.

## DNS

```
DNS www.paperswithcode.com -> 3.169.202.99
DNS paperswithcode.com     -> 3.169.202.99
DNS portal.paperswithcode.com -> 3.169.202.113
```

The `www` host resolves and then fails the TLS handshake; that is the basis
for "resolves in DNS to the same address as the apex ... and then fails the
TLS handshake".

## Link check of every URL the post links

```
200  https://aider.chat/docs/leaderboards/
200  https://huggingface.co/papers/trending
200  https://huggingface.co/papers/1706.03762
200  https://huggingface.co/datasets/zh-plus/tiny-imagenet
200  https://huggingface.co/datasets/ILSVRC/imagenet-1k
200  (redirected -> https://crfm.stanford.edu/helm/classic/latest/) https://crfm.stanford.edu/helm/classic/latest
200  https://huggingface.co/spaces/lmarena-ai/arena-leaderboard
200  https://openrouter.ai/api/v1/models
```

## Claims removed during drafting for lack of support

- "Half the citations in the wild carry the `www`" — no measurement of
  citation frequency was made; the sentence was rewritten to describe the
  behavior only.
- "the short form that a thousand model cards use" — same reason.
- "the file is being regenerated" — the `last-modified` header supports "the
  file was written on that date" and nothing about an ongoing process.
