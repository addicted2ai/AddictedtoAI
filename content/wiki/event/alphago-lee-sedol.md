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
timeline:
  - date: "2016-01-27"
    event: "DeepMind reveals the Nature paper and the previously secret 5-0 win over Fan Hui"
    source_url: "https://research.google/blog/alphago-mastering-the-ancient-game-of-go-with-machine-learning/"
  - date: "2016-03-08"
    event: "match announced with a one-million-dollar purse, pledged to charity if AlphaGo wins"
    source_url: "https://blog.google/innovation-and-ai/products/alphagos-ultimate-challenge/"
  - date: "2016-03-13"
    event: "Lee Sedol wins game four, the only human win of the match"
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

Demis Hassabis announced the match on 8 March 2016, the day before it began:
five games in Seoul between 9 and 15 March, and a purse that DeepMind said in
advance it would donate to UNICEF, STEM charities and Go organisations if
AlphaGo won. The money was never the stake.

What made the match plausible had been disclosed six weeks earlier. On
27 January 2016, David Silver and Hassabis published the result that AlphaGo,
"using a single machine, won all but one of its 500 games" against the other
strong Go programs, and revealed a match that had been played behind closed
doors between 5 and 9 October 2015 against the three-time European champion
Fan Hui, which AlphaGo won five games to nil. The same post noted that
"experts predicted it would be at least another 10 years until a computer
could beat one of the world's elite group of Go professionals." The paper is
Silver et al., *Nature* 529 (7587), 484-489.

AlphaGo won the Seoul match four games to one. The game worth keeping is the
fourth, on 13 March, where Lee playing white won by resignation after 180
moves — the wedge at move 78 that commentators immediately recognised, and
that AlphaGo answered badly. Hassabis said that day that Lee "was too good for
us today and pressured #AlphaGo into a mistake that it couldn't recover from."
The Korea Baduk Association subsequently awarded AlphaGo an honorary 9 dan, in
recognition of its "sincere efforts" to master the game.

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
rate against KataGo running at superhuman settings" — KataGo being stronger
than the AlphaGo that played Lee. The adversaries do not win by playing Go
well; they exploit a systematic misreading of large cyclically connected
groups, slowly re-surrounding a group the engine does not believe is in
danger. The attack is legible enough that Pelrine, an amateur player, learned
it by studying the adversary's games and then "used the cyclic attack to
repeatedly beat superhuman versions of both KataGo and Leela Zero by himself,"
with no algorithmic assistance during play. Adversarial training against the
attack did not remove the underlying vulnerability.

Game four in Seoul was not the last time a human beat a top Go engine. It was
the last time one did it by playing better Go.
