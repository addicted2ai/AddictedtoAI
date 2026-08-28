---
id: event/alphago-lee-sedol
kind: event
display_name: AlphaGo versus Lee Sedol
status: dead
maintenance: dormant
themes:
  - history
  - culture
aliases:
  - name: AlphaGo versus Lee Sedol
    class: exclusive
  - name: Google DeepMind Challenge Match
    class: exclusive
  - name: AlphaGo
    class: manual
facts:
  - field: location
    source: cited
    value: "Seoul, South Korea"
    source_url: "https://blog.google/innovation-and-ai/products/alphagos-ultimate-challenge/"
    accessed: "2026-08-28"
    volatility: static
  - field: result
    source: cited
    value: "AlphaGo 4, Lee Sedol 1"
    source_url: "https://deepmind.google/research/alphago/"
    accessed: "2026-08-28"
    volatility: static
  - field: prize_usd
    source: cited
    value: 1000000
    source_url: "https://blog.google/innovation-and-ai/products/alphagos-ultimate-challenge/"
    accessed: "2026-08-28"
    volatility: static
  - field: games_played
    source: cited
    value: 5
    source_url: "https://blog.google/innovation-and-ai/products/alphagos-ultimate-challenge/"
    accessed: "2026-08-28"
    volatility: static
  - field: nature_citation
    source: cited
    value: "Silver et al., Nature 529 (7587), 484-489"
    source_url: "https://www.britgo.org/deepmind2016/press1"
    accessed: "2026-08-28"
    volatility: static
  - field: cyclic_adversary_win_rate
    source: cited
    value: ">97% against KataGo at superhuman settings"
    source_url: "https://ar5iv.labs.arxiv.org/html/2211.00241"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2016-01-27"
    event: "Google reveals the Nature paper and the previously secret 5-0 win over Fan Hui, and announces that AlphaGo will play Lee Sedol in Seoul in March"
    source_url: "https://research.google/blog/alphago-mastering-the-ancient-game-of-go-with-machine-learning/"
  - date: "2016-03-08"
    event: "day before play, DeepMind sets out the terms: five games in Seoul, no handicap, a one-million-dollar purse pledged to charity if AlphaGo wins"
    source_url: "https://blog.google/innovation-and-ai/products/alphagos-ultimate-challenge/"
  - date: "2016-03-13"
    event: "Lee Sedol beats AlphaGo in game four"
    source_url: "https://techcrunch.com/2016/03/13/defeated-go-world-champion-beats-deepmind-ai-in-penultimate-match/"
  - date: "2016-03-15"
    event: "match ends 4-1 to AlphaGo"
    source_url: "https://deepmind.google/research/alphago/"
  - date: "2017-10-18"
    event: "AlphaGo Zero, trained from random play with no human games, beats the version that beat Lee 100-0"
    source_url: "https://deepmind.google/discover/blog/alphago-zero-starting-from-scratch/"
  - date: "2019-11-29"
    event: "Lee Sedol's retirement from professional Go reported, citing AI"
    source_url: "https://www.abc.net.au/news/2019-11-29/go-grandmaster-lee-se-dol-retires-computers-cannot-be-defeated/11745872"
  - date: "2022-11-01"
    event: "adversarial policies published that beat superhuman KataGo in over 97% of games"
    source_url: "https://arxiv.org/abs/2211.00241"
mentions:
  - concept/the-bitter-lesson
---

Google announced the match on 27 January 2016, six weeks before it began:
"AlphaGo's next challenge will be to play the top Go player in the world over
the last decade, Lee Sedol. The match will take place this March in Seoul,
South Korea." The terms came the day before play — five games, no handicap,
and a purse of one million US dollars that DeepMind said in advance would be
"donated to UNICEF, STEM charities and Go organizations" if AlphaGo won. The
money was never the stake.

What made the challenge plausible was in that same January post. It reported
that "Using a single machine, AlphaGo won all but one of its 500 games"
against the other strong Go programs, and revealed a match that had been
played behind closed doors between 5 and 9 October 2015 against the
three-time European champion Fan Hui, which AlphaGo won five games to nil.
The post also noted that "experts predicted it would be at least another
10 years until a computer could beat one of the world's elite group of Go
professionals." The paper is Silver et al., *Nature* 529 (7587), 484-489.

AlphaGo won the Seoul match four games to one. The game worth keeping is the
fourth, on 13 March, and the move worth keeping is Lee's 78th, played with
white. DeepMind's own account of the match singles it out: "Known as 'God's
Touch', this move was just as unlikely and inventive as the one AlphaGo played
two games earlier." Hassabis said that day that Lee "was too good for us today
and pressured #AlphaGo into a mistake that it couldn't recover from." By
DeepMind's account the match "earned AlphaGo a 9 dan professional ranking —
the first time a computer Go player had received the highest possible
certification."

Nineteen months later the version Lee played was itself obsolete. On
18 October 2017 DeepMind published AlphaGo Zero, which "learns to play simply
by playing games against itself, starting from completely random play," and
which after three days of self-play beat "the previously published version of
AlphaGo ... by 100 games to 0." The supervised bootstrap from human games —
the part that had made a machine strong enough to sit across from Lee — turned
out to be a handicap, not a foundation.

Lee stopped competing in 2019. He told Yonhap that "with the debut of AI in Go
games, I've realised that I'm not at the top even if I become the number one,"
and that "even if I become the number one, there is an entity that cannot be
defeated."

That last sentence is now known to be false in a specific and strange way. In
November 2022 a group including Tony Wang, Adam Gleave, Kellin Pelrine, Sergey
Levine and Stuart Russell published adversarial policies achieving "a >97% win
rate against KataGo running at superhuman settings" — KataGo being, in the
paper's words, "the strongest publicly available Go AI system at the time of
writing." "Our adversaries do not win by playing Go well." They exploit a
blind spot around large cyclically connected groups: "first, set up an
'inside' group and let or lure the victim to surround it, creating a cyclic
group. Second, surround the cyclic group. Third, guarantee the capture before
the victim realizes it is in danger and defends." The engine holds a win
probability above 99% for most of the game and typically sees the loss coming
about one move before the group falls.

The attack is legible enough that a person can run it by hand: "one of our
authors, a Go expert, was able to learn from our adversary's game records to
implement this attack without any algorithmic assistance," and, playing under
ordinary conditions on the KGS server, "obtained a greater than 90% win rate
against a top ranked KataGo bot that is unaffiliated with the authors" — also
beating "KataGo and Leela Zero playing with 100k visits each, which is
normally far beyond human capabilities." Adversarial training did not close
the hole: the core vulnerability "persists even in KataGo agents adversarially
trained to defend against our attack."

Game four in Seoul was not the last time a human beat a top Go engine. It was
the last time one did it by playing better Go.
