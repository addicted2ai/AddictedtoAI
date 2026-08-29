---
job: seed-the-bitter-lesson
verdict: approve
reasons: []
would-cite: >-
  Anyone quoting Sutton as licence for scaling LLMs — this page forces the
  caveat, pairing Brooks' six-day rebuttal with Sutton's own 2025 statement
  placing LLMs on the human-knowledge side of his dichotomy.
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched 2026-08-28.

- en.wikipedia.org/wiki/Bitter_lesson: author Richard S. Sutton, published
  13 March 2019 on incompleteideas.net — the three facts citing it are
  supported.
- The thesis quotation was verified verbatim against the cited braddelong
  substack crosspost: "The biggest lesson that can be read from 70 years of
  AI research is that general methods that leverage computation are
  ultimately the most effective, and by a large margin." The crosspost also
  carries the chess-1997 and HMM speech passages the entry compresses
  ("newer methods that were more statistical in nature and did much more
  computation, based on hidden Markov models (HMMs)") — "beat the linguists"
  is a fair compression of the essay's contrast with knowledge of "words, of
  phonemes, of the human vocal tract".
- Observation, not a defect: the essay's own URL
  (incompleteideas.net/IncIdeas/BitterLesson.html, linked in prose over
  http) fails an https fetch from here with a self-signed-certificate
  error. The entry wisely cites Wikipedia and the crosspost for its facts.
- rodneybrooks.com/a-better-lesson: dated March 19, 2019; exactly six
  numbered objections; all three quotations verbatim ("It is sleight of
  hand in moving the human intellectual work to somewhere else", the
  total-cost sentence, and "seventy six words shorter than Sutton's post");
  the CNN translation-invariance point is Brooks' point 1 as the entry says.
- dwarkesh.com/p/richard-sutton: published September 26, 2025; title
  "Richard Sutton – Father of RL thinks LLMs are a dead end"; the quoted
  passage ("The more human knowledge we put into the large language models,
  the better they can do. So it feels good. Yet, I expect there to be
  systems that can learn from experience.") is in the transcript verbatim;
  the no-goal/no-surprise argument is Sutton's, in his own words ("They'll
  not make any changes if something happens, based on what happens").

All three primary documents say what the entry says they say, and the
entry's assembled claim — most-quoted argument, disputed by its author,
rebutted within the week — is the thing a reader cannot get from any one of
them. Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, one issue filed

Round one cited a Substack crosspost for the thesis because the essay's own
URL failed an https fetch. **It fetches fine over http** — 7,297 bytes from
`http://www.incompleteideas.net/IncIdeas/BitterLesson.html` — so this recheck
verified the thesis against the primary document rather than a crosspost:
"The Bitter Lesson / Rich Sutton / March 13, 2019 / The biggest lesson that
can be read from 70 years of AI research is that general methods that
leverage computation are ultimately the most effective, and by a large
margin." Author, date, venue and thesis all confirmed at source.

The three supporting cases, from the essay itself: chess — "the methods that
defeated the world champion, Kasparov, in 1997, were based on massive, deep
search"; Go — "A similar pattern of research progress was seen in computer
Go, only delayed by a further 20 years"; speech — "there was an early
competition, sponsored by DARPA, in the 1970s ... based on hidden Markov
models (HMMs). Again, the statistical methods won out over the
human-knowledge-based methods." **Note for a later pass: `Deep Blue` is
ABSENT from the essay.** The essay says "the methods that defeated ...
Kasparov, in 1997"; the entry supplies the system's name as a gloss and does
not attribute it to Sutton. That is correct as fact and honest as attribution
— not a defect.

Brooks (52,166 B, "A Better Lesson March 19, 2019" — six days after
13 March): all three quotations verbatim, including the closing "This review,
including this comment, is seventy six words shorter than Sutton's post."
**The objection count is measured, not eyeballed**: the region between "wrong
for a number of reasons" and that closing line contains exactly one `<ol>`
holding exactly six `<li>` elements. Six numbered objections, confirmed
structurally. The CNN point is Brooks' own wording: "the very essence of CNNs
is that the front end of the network is designed by humans to manage
translational invariance". Searching `translation invariance` returns ABSENT
— the source writes `translational`; a word-form false absence.

Dwarkesh (474,170 B): title "Richard Sutton – Father of RL thinks LLMs are a
dead end", dated "Sep 26, 2025" (the string "September 26, 2025" is ABSENT —
format variant). The long quotation is verbatim in the transcript. The
entry's closing characterisation of his objection is also his own words, in
two places: "There's no goal. If there's no goal ... There's no right thing
to say. There's no ground truth" and "they have no prediction in the
substantive sense that they won't be surprised by what happens. If something
happens that isn't what you might say they predicted, they will not change".

**Filed: addictedtoai-9bu.** Three sentences in this entry assert facts about
readership that no source can support and none is cited for — "The rebuttal
came six days later and is rarely read", "the most-quoted argument in favour
of the current paradigm", and "most of the people quoting it have never
seen". Everything else here is now byte-verified against three primary
documents; these three are the only unsupported assertions, and they are
claims about the world rather than framing. Not corrected in this pass
because the right fix is a corpus-wide policy on unmeasurable readership
claims, not a one-entry rewrite.
