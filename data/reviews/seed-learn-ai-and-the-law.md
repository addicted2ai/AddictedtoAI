---
job: seed-learn-ai-and-the-law
verdict: approve
reasons: []
would-cite: >-
  Someone citing the two June 2025 California rulings as proof that training on
  copyrighted books is lawful — this page shows that one of them turned on how a
  library was stocked and the other on which argument the plaintiffs failed to
  make, that both were trial courts binding nobody but their own parties, and
  that the judge who ruled for the defendant wrote that in most cases the answer
  will likely be yes.
reviewer: independent record reviewer, seven-page set (fresh context, no edit rights)
date: 2026-08-30
---

Checklist: education page (mechanics, Area F), against `openspec/curriculum/learn.md`
§2, §3 and the §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. This is the page carrying today's repaired
misquotation, so it got the deepest source work of my seven: ten legal sources
fetched to disk, four of them PDFs whose streams I inflated and whose text
operators I extracted myself rather than trusting any converter.

**Sendable sentence, verbatim** — the page's bolded pair:

> Nobody with the power to decide is arguing about what these systems do. They
> are arguing about what these systems count as, and every candidate answer was
> settled before any of them existed.

## The repaired misquotation — verified independently, not inherited

The mechanics review (finding 1) recorded that the page had quoted Article 4(3)
of the 2019 copyright directive as *"has been expressly reserved"* when the
directive says *"has **not** been expressly reserved"*, and `c8ae982` repaired
it. I treated that as a claim to check, not a fact to accept.

I fetched `eur-lex.europa.eu` CELEX:32019L0790 to disk (275,977 bytes) and
searched the raw bytes. The string `expressly reserved` occurs **exactly once**
in the whole document, at Article 4(3):

> 3.   The exception or limitation provided for in paragraph 1 shall apply on
> condition that the use of works and other subject matter referred to in that
> paragraph has not been expressly reserved by their rightholders in an
> appropriate manner, such as machine-readable means in the case of content
> made publicly available online.

Two findings follow, and both matter:

1. `has been expressly reserved by their rightholders in an appropriate manner`
   is **absent** from the source. The pre-repair quotation was genuinely
   fabricated text inside quotation marks — the meaning was preserved by the
   inverted frame, but the words were not the directive's. The review was right.
2. The text now on disk quotes `has not been expressly reserved by their
   rightholders in an appropriate manner, such as machine-readable means in the
   case of content made publicly available online` — present at byte 174,356 of
   my copy, character for character. The repaired frame ("applies only on
   condition that the use") also tracks the directive's own construction
   ("shall apply on condition that the use"). **The repair is correct and the
   quoted span is now literal.**

That is the class of error the record is for: on a page whose thesis is that
exact wording decides outcomes, a quotation that inverts a statutory condition
is the defect that most deserves to be caught, and the only way to catch it is
to read the statute.

## What else I verified at source

Every statutory and judicial quotation on the page, by literal substring:

- **Burrow-Giles** (law.cornell.edu 111/53): all four spans present — "the
  remainder of the process is merely mechanical, with no place for novelty,
  invention, or originality"; "so far as they are representatives of original
  intellectual conceptions of the author"; "selecting and arranging the costume,
  draperies, and other various accessories"; "On the question as thus stated we
  decide nothing". Oscar Wilde is in the record, as the page says.
- **17 U.S.C. §107**: all three quoted factors present verbatim.
- **Campbell** (510/569): "adds something new, with a further purpose or
  different character, altering the first with new expression, meaning, or
  message" present verbatim.
- **Japan, Article 30-4**: heading "Exploitation without the Purpose of Enjoying
  the Thoughts or Sentiments Expressed in a Work" present; the operative text
  present ("It is permissible to exploit a work, in any way and to the extent
  considered necessary … in any other case in which it is not a person's purpose
  to personally enjoy or cause another person to enjoy the thoughts or
  sentiments expressed in that work"), with the proviso "would unreasonably
  prejudice the interests of the copyright owner"; and data analysis is indeed
  named as one such case, at item (ii).
- **UK CDPA s.9(3)**: present verbatim.
- **EU AI Act** (CELEX:32024R1689): "risk-based approach", "a reservation of
  rights expressed pursuant to Article 4(3) of Directive (EU) 2019/790", and "a
  sufficiently detailed summary about the content used for training" all
  present. The page's point that the AI statute *defers* on copyright is
  visible in the regulation's own cross-reference.
- **GDPR Art. 17**: heading "right to be forgotten" and "the right to obtain
  from the controller the erasure of personal data concerning him or her
  without undue delay", both present.
- **Both June 2025 orders**, from the PDFs: "the purpose and character of using
  copyrighted works to train LLMs to generate new text was quintessentially
  transformative"; "Creating a permanent, general-purpose library was not itself
  a fair use excusing Anthropic's piracy"; "in most cases the answer will likely
  be yes"; "stands only for the proposition that these plaintiffs made the wrong
  arguments and failed to develop a record in support of the right one". The
  first order's own header confirms "Filed 06/23/25", so "filed 23 June" and
  "two days later" are exact.
- **Copyright Office**, both reports: "More than a century ago, the Court
  analyzed the nature of authorship in a case involving the then-new technology
  of the camera"; "prompts alone do not provide sufficient human control to make
  users of an AI system the authors of the output"; "essentially function as
  instructions that convey unprotectible ideas"; the qualifier "given current
  generally available technology"; and "lost sales, market dilution, and lost
  licensing opportunities". January 2025 attaches to the Part 2
  copyrightability report, which is where the page attaches it.

Two probes returned ABSENT and both were false absences I ran down before
concluding anything: the UK and Japanese provisions each begin their sentence
with a capital that the page lowercases inside a running quotation. The spans
are otherwise character-identical. That is ordinary quotation practice, not a
defect.

## Could not verify — stated plainly

- **CourtListener is unreachable from here.** Both case links returned HTTP 202
  with a zero-byte body. So *Authors Guild v. Google*, 804 F.3d 202 (2d Cir.,
  October 2015) and the Bridgeport line "Get a license or do not sample" are
  **taken on trust**; I confirmed neither at a primary source. No quotation from
  Authors Guild appears on the page, so the exposure there is a citation only;
  the Bridgeport exposure is one quoted sentence.
- **One factual claim on this page carries no source at all**: "an industry
  submission to the Copyright Office's inquiry cites it by name." On a page
  where every other assertion of fact carries a link, this one is bare, and I
  could not check it. Recorded as a finding rather than fixed. It is not
  load-bearing — the analogy section works if the sentence is deleted — but it
  is the page's own standard breached once.

## Coverage, bounds and rot

All five §4 durable questions are present as questions, with both sides of the
training fight argued at the level of *which factor each side is arguing*
(purpose and character versus market effect, and market effect split into its
narrow and broad versions) rather than as advocacy. The meta-point about
analogy carries the page and is paid off in the closing paragraph.

Must-nots: no legal advice; no predicted winner — the two orders are set against
each other and the page draws the opposite of a conclusion from them; no outcome
forecasts. I considered whether the three-systems section violates
"jurisdiction-by-jurisdiction current status" and concluded it does not: it
compares *structural machinery for permitting things* (open standard, enumerated
list, purpose test), all of which predates the technology, rather than reporting
where each country currently stands. The page makes that distinction itself —
"A sentence about whether training on unlicensed work is lawful is not yet a
claim until it names a country."

Rot: case status appears only as dated asides; the one live-state claim is
explicitly stamped ("As of 2026-08 there is no settled account of what erasure
requires from a trained model") and hedged in the right direction. No model
names, prices or scores. Front matter matches §4 exactly — level, three
prerequisites in order, outcome verbatim; `mentions` is legitimately empty per
§4, and all three internal links resolve.

Approve, and it is the longest page on the surface at ~3,540 words with neither
§3 length failure present: one argument, and every section is evidence for it
rather than another item on a list.
