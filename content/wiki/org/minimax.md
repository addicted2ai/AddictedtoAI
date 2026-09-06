---
id: org/minimax
kind: org
display_name: MiniMax
status: active
maintenance: stable
aliases:
  - name: MiniMax
    class: exclusive
  - name: MiniMax Group Inc.
    class: exclusive
  - name: 稀宇科技
    class: shared
facts:
  - field: founded
    source: cited
    value: "December 2021"
    source_url: "https://en.wikipedia.org/wiki/MiniMax_Group"
    accessed: "2026-09-05"
    volatility: static
  - field: self_described_founding
    source: cited
    value: "\"Founded in early 2022\", on the company's own About page"
    source_url: "https://www.minimax.io/about"
    accessed: "2026-09-05"
    volatility: static
  - field: legal_name
    source: cited
    value: "MiniMax Group Inc. — 稀宇科技, Xīyǔ Kējì"
    source_url: "https://en.wikipedia.org/wiki/MiniMax_Group"
    accessed: "2026-09-05"
    volatility: static
  - field: headquarters
    source: cited
    value: "Xinyan Mansion, Guiqing Road, Xuhui, Shanghai, China"
    source_url: "https://en.wikipedia.org/wiki/MiniMax_Group"
    accessed: "2026-09-05"
    volatility: slow
  - field: name_origin
    source: cited
    value: "the minimax algorithm"
    source_url: "https://en.wikipedia.org/wiki/MiniMax_Group"
    accessed: "2026-09-05"
    volatility: static
  - field: listing
    source: cited
    value: "Hong Kong Stock Exchange, ticker 100, since 9 January 2026"
    source_url: "https://en.wikipedia.org/wiki/MiniMax_Group"
    accessed: "2026-09-05"
    volatility: dated
  - field: first_product
    source: cited
    value: "Glow, a virtual-character chat app launched October 2022 and removed from Chinese app stores in 2023"
    source_url: "https://en.wikipedia.org/wiki/MiniMax_Group"
    accessed: "2026-09-05"
    volatility: static
  - field: consumer_apps
    source: cited
    value: "Talkie, for international markets, June 2023; Xing Ye (星野), for China, September 2023"
    source_url: "https://en.wikipedia.org/wiki/MiniMax_Group"
    accessed: "2026-09-05"
    volatility: static
  - field: us_copyright_suit
    source: cited
    value: "September 2025 — Disney, Universal and Warner Bros. Discovery allege Hailuo AI infringed their copyrighted characters"
    source_url: "https://en.wikipedia.org/wiki/MiniMax_Group"
    accessed: "2026-09-05"
    volatility: dated
  - field: roleplay_program_length
    source: cited
    value: "\"our third year optimizing Role-Play in Talkie / Xingye\", stated 27 January 2026"
    source_url: "https://www.minimax.io/news/a-deep-dive-into-the-minimax-m2-her-2"
    accessed: "2026-09-05"
    volatility: dated
timeline:
  - date: "2026-01-09"
    event: "Initial public offering on the Hong Kong Stock Exchange"
    source_url: "https://en.wikipedia.org/wiki/MiniMax_Group"
  - date: "2026-01-23"
    event: "minimax/minimax-m2-her listed on OpenRouter — the role-play model behind Talkie and Xingye"
    source_url: "https://openrouter.ai/minimax/minimax-m2-her"
  - date: "2026-01-27"
    event: "MiniMax publishes its Role-Play Bench write-up for MiniMax-M2-her"
    source_url: "https://www.minimax.io/news/a-deep-dive-into-the-minimax-m2-her-2"
  - date: "2026-05-31"
    event: "minimax/minimax-m3 listed on OpenRouter"
    source_url: "https://openrouter.ai/minimax/minimax-m3"
  - date: "2026-08-02"
    event: "The MiniMax H3 community licence takes effect, excluding the European Union, the United Kingdom, the Republic of Korea and the United States from its grant"
    source_url: "https://huggingface.co/MiniMaxAI/MiniMax-H3/raw/main/LICENSE"
mentions:
  - model/minimax-minimax-01
  - model/minimax-minimax-m1
  - model/minimax-minimax-m2
  - model/minimax-minimax-m2-1
  - model/minimax-minimax-m2-5
  - model/minimax-minimax-m2-7
  - model/minimax-minimax-m2-7-free
  - model/minimax-minimax-m2-her
  - model/minimax-minimax-m3
  - model/minimax-minimax-m3-batch
  - model/minimax-minimax-m3-free
---

Ten of the eleven MiniMax rows OpenRouter lists are the coding-and-agents
line, from MiniMax-01 in January 2025 through M3. The eleventh is
`minimax/minimax-m2-her`, and it is the odd one twice over. It carries
a window of {{fact:model/minimax-minimax-m2-her#context_window}} where every
other M2-series row carries {{fact:model/minimax-minimax-m2#context_window}},
and
the router's own copy calls it
["a dialogue-first large language model built for immersive roleplay"](https://openrouter.ai/minimax/minimax-m2-her)
rather than anything about agents or code. Four days after it was listed,
MiniMax published
[a write-up](https://www.minimax.io/news/a-deep-dive-into-the-minimax-m2-her-2)
saying what it is: the model underneath Talkie and Xingye, tuned against a
hundred-turn conversation.

The write-up is the unusual part. MiniMax says that before mid-2024 its
iteration cycle was "tethered to traditional online A/B testing", and that it
gave that up for a reason with nothing to do with statistics — swapping the
model under a long-running character was received as "a violation of the
character's established voice", and users reverted or complained rather than
accept the better one. What replaced it is a benchmark built on an inversion:
"While 'alignment' (what makes a response great) is subjective, 'misalignment'
(what makes a response wrong) is surprisingly objective." So the scoring hunts
failures instead of ranking merit — reference confusion when one model is
asked to voice several characters at once, physical-logic errors where two
characters who have said goodbye and walked apart keep talking at normal
volume, and replies that act or speak on the user's behalf. MiniMax reports
M2-her first overall on that benchmark and **fifth** on its Stories dimension,
setting against itself there Gemini's rich vocabulary, Claude's steady plot
advancement and Doubao's vivid expression. A vendor placing itself fifth on a
third of its own benchmark is not the usual shape of a launch post.

The small window follows from the target rather than contradicting it.
MiniMax's stated failure mode for everyone else is "context bloat" — models
that hit a "performance wall" after turn 20 and pad to compensate for lost
focus — against which it says M2-her "maintains response length within the
optimal range" across a hundred turns. A hundred disciplined turns is what
{{fact:model/minimax-minimax-m2-her#context_window}} buys. A hundred bloated
ones is not.

Nothing MiniMax is currently being sued over has a row on the router. Its own
model menu lists six things in three groups — three text models, one video
model, two for speech and music — and only the text group reaches a
language-model router at all. That leaves the company's legal exposure sitting
entirely on the half with no listing: the American studios' copyright suit
names Hailuo, the video service, and H3's territorial carve-out governs
weights the router never carried. The eleven rows are the part of MiniMax that
a price-and-context table can see, and they are not where the argument about
this company is happening.
