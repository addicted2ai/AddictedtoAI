---
job: seed-learn-where-ai-fails-people
verdict: approve
reasons: []
would-cite: >-
  Anyone sitting in front of a deployment proposal whose safety case is the
  sentence "there is a human in the loop" — this page shows why that reviewer
  defers (agreeing is free and leaves no trace, overriding is personal and
  carried alone) and what a real answer has to name instead: who checks, what
  saying no costs them, and how the person it was wrong about ever finds out.
reviewer: rec-o — background review job, fresh context, no edit rights on content
date: 2026-08-30
---

Orientation rung, depth 2, 1,555 body words. Unchanged since the rung review;
read fresh. This page carries more external citation load than the other six
of my seven combined, so I re-fetched all four sources myself rather than
inheriting the rung review's verification.

## The sendable sentence

> "An accuracy rate is a promise made to the people the examples had most of."

Bolded by the page. Runner-up, and the one I would send: "An error no single
person made is an error no single person can be asked to undo."

## Method

Four sources fetched as raw HTML by script (browser user-agent), written to
disk, then matched by literal substring against normalised bytes — HTML
entities decoded and all whitespace collapsed, to defeat entity escaping and
mid-phrase line wrapping. No summariser or extractor was used at any point.
All four returned HTTP 200. Where a probe came back absent I read the
surrounding bytes before concluding anything, and **every absence turned out to
be my probe's wording, not a missing claim** — which is exactly the failure
mode this project has recorded.

## Verified to the source's own bytes

**ACLU (Robert Williams).** Source: "Detroit police arrested Robert Williams …
on his front lawn in front of his wife and two little daughters (ages 2 and 5).
Robert was hauled off and locked up for nearly 30 hours." The page's "in front
of his wife and their two young daughters, and held him for nearly thirty
hours" is exact; ages 2 and 5 make "young" precise.
- The quote is verbatim: "One officer responded, 'The computer must have
  gotten it wrong.'"
- The interrogation scene: "While interrogating Robert, an officer pointed to
  the image and asked if the man in the photo was him. Robert said it wasn't,
  put the image next to his face" — the page's rendering is faithful.
- "Robert was still held for several more hours" and "The charges have since
  been dismissed" — both present.
- The lineup: "Detroit police put Robert William's driver's license photo in a
  lineup with other Black men and showed it to the shop security guard, who
  hadn't even witnessed the alleged robbery firsthand." The page's "showed it
  to a shop security guard who had not witnessed the robbery" is exact, and
  the page's chronology (lineup before arrest) matches the source's.
- "In fact, people are almost never told when face recognition has identified
  them as a suspect" — the page's "That account notes that people identified
  this way are almost never told" is near-verbatim.
- **"January 2020" is nowhere in the source as a string**, which is the one
  finding a careless check would have miscalled. The article is dated June 24,
  2020, opens "Early this year", and later reads "released later that night
  into a cold and rainy January night". The date is supported by the source,
  just not quotable from it.

**NIST (December 2019 demographic study).** "The NIST study evaluated 189
software algorithms from 99 developers — a majority of the industry." The
page's "189 face recognition algorithms from 99 developers, most of the
industry" carries the rung review's recorded nit ("most" for "a majority") and
nothing worse.
- "For one-to-many matching, the team saw higher rates of false positives for
  African American females." The page scopes this correctly — "Picking a face
  out of a database … at higher rates for African American women" — rather
  than generalising it across both tasks, which is the commonest way this
  study is misreported.
- "the consequences could include false accusations" — verbatim, and the page
  quotes it as a quotation.
- "those that are the most equitable also rank among the most accurate" — the
  page's "the ones that treated groups most equally ranked among the most
  accurate, so nothing had to be traded away to get there" is a fair reading.
- "There was no such dramatic difference in false positives in one-to-one
  matching between Asian and Caucasian faces for algorithms developed in Asia"
  — and the page again scopes it to the right task ("the report's other task,
  checking a photograph against one other rather than against a whole
  database").
- "Grother reiterated that the NIST study does not explore the relationship
  between cause and effect" and "These results are an encouraging sign that
  more diverse training data may produce more equitable outcomes". The page's
  "Its authors were careful to say they had not studied the cause, and named
  the training data as the obvious place to look" is exact on both halves.

**Gender Shades (PMLR v81).** Abstract, verbatim: "these datasets are
overwhelmingly composed of lighter-skinned subjects (79.6% for IJB-A and 86.2%
for Adience)"; "We evaluate 3 commercial gender classification systems";
"darker-skinned females are the most misclassified group (with error rates of
up to 34.7%)"; "The maximum error rate for lighter-skinned males is 0.8%."
Every figure the page states matches, including the two it renders in words —
"close to eight in ten" for 79.6% and "nearer nine in ten" for 86.2%, both of
which round honestly.

**NBER w25943.** Abstract, verbatim: "lenders charge Latinx/African-American
borrowers 7.9 and 3.6 basis points more for purchase and refinance mortgages
respectively"; "FinTech algorithms also discriminate, but 40% less than
face-to-face lenders"; "These results are consistent with both FinTech and
non-FinTech lenders extracting monopoly rents in weaker competitive
environments or profiling borrowers on low-shopping behavior." Four authors
(Bartlett, Morse, Stanton, Wallace), 2019.
- The page renders "Latinx" as "Latino" and "40% less than face-to-face
  lenders" as "40 per cent less than the ones where a person sits across a
  desk" — both faithful.
- The page's treatment of causation is the best thing in its sourcing: "The
  researchers report the pattern as consistent with lenders charging more
  where borrowers shop around less" attributes the interpretation to the paper
  and does not upgrade "consistent with" into a cause. That is the discipline
  the whole surface claims and it is practiced here.

Zero fabrications, zero misquotations, zero figures that do not appear in the
source. On a project whose reviews have caught invented citations, that is the
headline of this record.

## Other checks

- Front matter: five keys exactly; `outcome` verbatim from §4; prerequisites
  `[learning-from-examples, what-ai-is-used-for]` as declared; the single
  mention `concept/hallucination` resolves and is linked in the body.
- Transitive closure computed from front matter:
  `learning-from-examples`, `what-ai-is-used-for`, `what-ai-actually-is`. Both
  back-references land inside it and both are true of the current text:
  "the pile is the world" is in `learning-from-examples` verbatim, and
  "You are the second pass" is in `what-ai-is-used-for` verbatim. Nothing on
  the page leans on an undeclared learn page.
- Must-not held: no existential-risk material, no hallucination mechanics
  (the term is linked to the wiki and used, correctly, only to mark the
  wrong-*for*-you case), no policy advocacy — the closing section asks a
  question and refuses to recommend a rule.
- Automation bias is given its meaning in the sentence that names it, after
  three sentences that build the incentive first. That is §3's failure mode 2
  handled the right way round.

## Finding: the hiring case, still absent, still unamended

`review-orientation.md` finding 3 named it and the repair pass did not act on
it. §4 asks for "canonical cases — hiring, credit, face recognition — as dated
asides with sources". Grepped the page for hiring, hire, recruit, résumé and
job application: **no match.** Face recognition (three primary sources) and
credit (one) are covered; hiring is not, and curriculum §4's entry carries no
amendment recording the cut.

I am not raising `spec-violation` on it, and the reasoning is narrow. The
education-static spec's scenario for that reason code fires when a page
appears in no curriculum entry, or when a page leans on an undeclared
prerequisite; neither is true here. The omission breaches §0.5's
amend-visibly rule — a process obligation on whoever cut the beat — rather
than any SHALL the page itself violates. And §3's failure mode 5 makes the
editorial case for the cut: two domains driven to mechanism beat three
surveyed. What is missing is the sentence of reasoning in the curriculum, not
the material in the page.

Recorded so it is visible in a durable place. Like the `where-ai-came-from`
finding, this now exists only inside sealed rung reviews and these records,
which is the shape the project's own deferral rule warns evaporates; it wants
its own issue.

## Taken on trust

The wiki entry `concept/hallucination` was not audited against its sources.
I did not attempt to verify the arrest date against court records beyond what
the ACLU account supports, nor the NIST report PDF behind the press release —
the page cites the press release and the press release carries every claim the
page makes of it.

Approve, and without reservation. This is the best page of the seven and
possibly on the surface: it teaches bias as a mechanism a reader can run
forward ("who its examples had least of, and what disagreeing with it will
cost the person assigned to check it") rather than as a catalogue of scandals,
and every number in it is where the page says it is, saying what the page says
it says.
