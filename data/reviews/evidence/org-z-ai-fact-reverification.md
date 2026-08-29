# Evidence — re-verification of `content/wiki/org/z-ai.md` cited facts

Job j-20260829-02. All five `facts:` entries in `content/wiki/org/z-ai.md`
declare `source: cited`, `source_url: https://en.wikipedia.org/wiki/Zhipu_AI`.
Each was re-fetched live on 2026-08-28 and checked against the current
front-matter value. Nothing was assumed from the prior `accessed` stamp.

## Fetch

```
$ curl -s "https://en.wikipedia.org/wiki/Zhipu_AI" -o zhipu.html -w "HTTP %{http_code} SIZE %{size_download}\n"
HTTP 200 SIZE 389414
```

Raw HTML was stripped of tags/scripts/styles and searched for the keyword
substrings backing each fact (`verify-zai.mjs`, run then discarded — the
output below is what it printed):

```
FOUND: "Founded in 2019"
  ...g Kong Stock Exchange as Z.AI Co., Ltd. , and branded internationally as Z.ai . History [ edit ] Logo from 2019 to 2025 Founded in 2019, the startup company began from Tsinghua University and was later spun out as an independent company. [ 14 ] [ 15 ] Res...

FOUND: "Headquarters"
  ...Traded as SEHK : 2513 Industry Artificial intelligence Founded 2019 ; 7 years ago ( 2019 ) Founders Tang Jie Li Juanzi Headquarters Beijing , China Key people Zhang Peng (CEO) Products GLM Number of employees 800+ (2024) Website zhipuai .cn z .ai Part...

FOUND: "formerly known as"
  ...is a Chinese artificial intelligence company specializing in open weights large language models (LLMs). The company was formerly known as Zhipu AI outside China until its rebranding in 2025. [ 5 ] [ 6 ] [ 3 ] Z.ai's flagship product is the GLM (General Lang...

FOUND: "MIT License"
  ...oduct is the GLM (General Language Model) family of LLMs, which the company has released under the free and open-source MIT License since July 2025; they have also released vision language models and text-to-video models . As of 2024, it is one of Chi...

FOUND: "8 January 2026"
  ...] [ 34 ] That same year, the company changed its official name to Knowledge Atlas Technology JSC Ltd. [ 35 ] [ 36 ] On 8 January 2026, Z.ai held its IPO on the Hong Kong Stock Exchange to become a listed company. [ 37 ] [ 38 ] [ 10 ] It is considered to...

FOUND: "Hong Kong Stock Exchange"
  ...rns. [ 9 ] It is considered to be China's first major LLM company that went through an initial public offering , on the Hong Kong Stock Exchange in January 2026, closing the day at US$558 million . [ 10 ] Z.ai owns AMiner , a research database similar to Google Sc...

FOUND: "first major"
  ...ment blacklisted the company in its Entity List due to national security concerns. [ 9 ] It is considered to be China's first major LLM company that went through an initial public offering , on the Hong Kong Stock Exchange in January 2026, closing the...
```

A second, independent pass fetched the same URL through the model-assisted
web-fetch tool with an explicit extraction prompt, to cross-check the raw-HTML
reading. It returned the same five facts with matching quotes (year 2019;
"Headquarters: Beijing, China"; former name Zhipu AI until the 2025
rebranding; MIT License since July 2025; IPO 8 January 2026 on the Hong Kong
Stock Exchange, described as China's first major LLM company to IPO).

## Fact-by-fact result

| field | front-matter value | source confirms | verdict |
|---|---|---|---|
| `founded` | `"2019"` | "Founded in 2019, the startup company began from Tsinghua University" | **matches** |
| `headquarters` | `"Beijing, China"` | infobox: "Headquarters Beijing , China" | **matches** |
| `former_name` | `"Zhipu AI, until the 2025 rebranding"` | "formerly known as Zhipu AI outside China until its rebranding in 2025" | **matches** |
| `weights_license` | `"MIT License, since July 2025"` | "released under the free and open-source MIT License since July 2025" | **matches** |
| `listing` | `"Hong Kong Stock Exchange, 8 January 2026 — the first major Chinese LLM company to IPO"` | "On 8 January 2026, Z.ai held its IPO on the Hong Kong Stock Exchange" + "considered to be China's first major LLM company that went through an initial public offering" | **matches** |

All five hold. No drift found.

## Note on the `accessed` stamp

All five facts already carried `accessed: "2026-08-28"` — the same date this
re-verification ran — from the entry's original authoring commit (`7602fc8`,
the only commit that has ever touched this file). Because the stamped date
already equals the date of this real, executed check, and every value it
attests to was reconfirmed against the live source, no edit to
`content/wiki/org/z-ai.md` was needed or made: rewriting an already-correct
date to the same date is a no-op, not upkeep. The stamp is now genuinely
backed by an executed check rather than an unverified assumption.

## Aside (out of scope, not acted on)

The article also states the company changed its *official legal* name to
"Knowledge Atlas Technology JSC Ltd." in the same year as the IPO, separate
from the "Z.ai" consumer brand. This does not contradict `former_name` (which
concerns the Zhipu AI → Z.ai brand, not the legal entity name) and is not one
of the five cited facts in front matter, so it was not touched — flagging it
here only in case a future entry wants to cite it.
