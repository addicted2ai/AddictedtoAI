# Evidence — the industry submission behind `ai-and-the-law`'s Authors Guild clause

Job j-20260911-06 (verify), directive line 133, beads `addictedtoai-o9d`.
**The question:** `content/learn/ai-and-the-law.md` line 164 asserted that
"an industry submission to the Copyright Office's inquiry cites [Authors Guild
v. Google] by name" with no link and no verifiable source — the page's only
unlinked factual assertion. **The branch taken:** FOUND, and linked. The
sentence survives with a citation; nothing was cut and nothing was hedged.

Raw transcript: `verify-ai-and-the-law-industry-submission.raw.txt` in this
directory (real stdout of the fetch and extraction scripts, run 2026-09-11
local; fetched bodies lived under the OS temp directory, never in the tree).
Every quotation below was checked against locally extracted PDF text, never
against a search engine's or a WebFetch summary.

## What was fetched (2026-09-11 local)

The inquiry is the Copyright Office's August 2023 notice of inquiry on
copyright and artificial intelligence; its docket is `COLC-2023-0006` on
regulations.gov (confirmed via the Office's own study page,
`https://www.copyright.gov/policy/artificial-intelligence/`, and the
regulations.gov API, which returned docket-filtered comment titles including
"Comment from Google", "Comment from Microsoft Corporation", "Comment from
Computer & Communications Industry Association (CCIA)" and "Comment from BSA |
The Software Alliance").

Attachment PDFs were fetched from the docket's own file store with
`node:fetch` — no API key, no converter, bytes saved to temp:

| URL | Status | Bytes |
|---|---|---|
| `https://downloads.regulations.gov/COLC-2023-0006-9003/attachment_1.pdf` (Google) | 200 `application/pdf` | 240,445 |
| `https://downloads.regulations.gov/COLC-2023-0006-8740/attachment_1.pdf` (CCIA initial) | 200 `application/pdf` | 283,057 |
| `https://downloads.regulations.gov/COLC-2023-0006-8688/attachment_1.pdf` (BSA) | 200 `application/pdf` | 289,544 |

Two publisher-hosted mirrors (BSA's own policy-filings PDF and a Berkeley Law
mirror of the BSA attachment) returned 403 to this machine's fetcher and were
NOT used as evidence — recorded so a reviewer does not mistake them for
findings. The regulations.gov API itself rate-limited (`OVER_RATE_LIMIT` on
the public demo key) and was used only for docket discovery, never for the
substring check.

## The document, and the literal substring

The linked document is Google LLC's "Artificial Intelligence and Copyright,
88 Fed. Reg. 59942, Docket No. COLC-2023-0006, October 30, 2023" — its cover
page reads "Google LLC appreciates the opportunity to submit these comments in
response to the U.S. Copyright Office's notice of inquiry". An industry
submitter, the inquiry's docket, the inquiry's subject: all three on the
cover.

PDF page 10 (16-page file) contains, by local extraction:

> For example, in Authors Guild v. Google, Inc.,32 Google's creation of
> digital scans of more than 20 million books was deemed to be a
> transformative fair use because, among other things, it enabled the creation
> of Google Book Search and the ability to engage in statistical analysis of
> language through text-and-data mining.33

Counts over the full extracted text: "Authors Guild" 2, "Authors Guild v.
Google" 1, "804 F.3d 202" 1. The clause on the page says the submission
"cites it by name" — it does, twice over, case name and reporter citation.

## Ruling out the instrument

Three checks, because this corpus has been burned by extractors before:

1. **Two independent extractors agree on the words.** PyMuPDF returns the
   passage with normal spacing; PyPDF2 returns the same words in the same
   order but one word per line (`For\nexample,\nin\nAuthors\nGuild\nv.\nGoogle,\nInc....`),
   which is why a naive single-line count on the PyPDF2 output reads 0. The 0
   is a whitespace artifact of the search, not an absence in the document —
   and the reason it is recorded rather than hidden.
2. **Raw bytes disagree and that is expected, not alarming.** `Authors Guild`
   occurs 0 times in the raw bytes: the file's subset fonts remap glyph codes
   (PyPDF2 renders every `fi` ligature as NUL, e.g. `Arti\x00cial`), so a
   raw-byte search cannot see the text. Presence via two agreeing extractors
   stands; a raw-bytes miss on a subset-embedded PDF proves nothing either
   way.
3. **The negative control extracted fine.** The BSA attachment (12 pages,
   43,111 extracted chars) contains none of "Authors Guild", "804 F.3d 202" or
   "Google Books" — a genuine 0 from a clean extraction, which is what makes
   it a control rather than a second failure. Corroboration the other way:
   the CCIA initial comment contains "Authors Guild v. Google, Inc., 804 F.3d
   202 (2d Cir. 2015)" (line-broken mid-phrase in extraction, hence
   single-line "Authors Guild v. Google" 0 but "Authors Guild" and
   "804 F.3d 202" 1 each). Two industry submissions cite the case; the page
   needed one, and Google's — the defendant's own filing citing its own case —
   is the cleanest.

## Stability of the link target

The chosen URL was fetched twice, hours apart in the run: HTTP 200 both
times, 240,445 bytes both times, sha256
`5b12c9f45f5ffc0dbbddcfdcff201dd912ab96c2fb51b17863ca51aac88af156`
byte-identical. It is the docket's own file store, not a mirror, so it moves
only if the docket moves.

## What changed in the repository

- `content/learn/ai-and-the-law.md` — the bare clause became a linked one:
  "[an industry submission to the Copyright Office's inquiry cites it by
  name](https://downloads.regulations.gov/COLC-2023-0006-9003/attachment_1.pdf)".
  No word of the sentence changed; no hedge, no gesture at unnamed
  submissions.
- This narrative and its `.raw.txt` — the evidence the acceptance checks
  require.

No `verified_on` / `last_verified` stamp was touched: static learn pages
carry no such field (front matter is title, level, outcome, prerequisites,
mentions — see `specs/education-static`), and the build enforces no stamp on
this surface. The page's approval record
(`data/reviews/seed-learn-ai-and-the-law.md`) now binds previous bytes; that
rebind is the expected consequence of this edit and is for the review pass,
not for this job to write.
