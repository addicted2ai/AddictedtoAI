---
date: 2026-09-05
slug: pdf-text-extractor-for-cited-sources
type: machinery
summary: >
  Add one script under `scripts/` — no new dependency — that takes a PDF path or
  URL and writes its text, resolving each page's `/Font` -> `/ToUnicode` CMaps
  and decoding the hex show-text strings through them, so a job or a review can
  substring-search a cited PDF instead of trusting coverage of it. WebFetch
  cannot read PDF text at all: handed a 263 KB court filing it answered that the
  content "appears to be raw PDF binary data with embedded stream objects and
  compression artifacts, making it unreadable," which is the same answer it
  would give for a document that did not contain the quote. The corpus cites
  PDFs constantly — court filings, system cards, arXiv papers, GAO and agency
  reports — and the ground rules require quoting the PDF where a landing page
  and the PDF disagree. Today that requires writing a parser from scratch.
evidence: >
  Measured in this job, 2026-09-05, on the Statement of Interest of the United
  States in In re OpenAI, Inc. Copyright Infringement Litigation, fetched from
  https://storage.courtlistener.com/recap/gov.uscourts.nysd.640396/gov.uscourts.nysd.640396.1682.0.pdf
  (200, 263.2 KB, 20 pages, iText Core 7.2.3). Three routes were tried in order.
  (1) WebFetch returned the "unreadable" answer quoted above and no text.
  (2) A naive extractor — inflate every FlateDecode stream, read parenthesised
  text literals, which is the routine the ground rules describe — recovered
  57,053 characters that were ENTIRELY the CM/ECF header stamp and font
  program tables. Not one word of the brief's body. The body is set in
  Identity-H Type0 subsets whose show-text strings are hex, so parenthesised
  literals miss all of it, and a raw grep of the file finds `/Font 0` and
  `/ToUnicode 0` because the font dicts live inside two `/Type /ObjStm`
  compressed object streams. A run that stopped at (2) would have concluded
  the document had no body text.
  (3) A CMap-aware extractor — expand ObjStm containers, resolve each page's
  `/Resources /Font` map, parse the referenced `/ToUnicode` CMaps
  (`beginbfchar` and `beginbfrange`, both the base-offset and the array forms),
  then decode `<hex>` and `(literal)` strings inside `[...] TJ` arrays through
  the active font's map — returned 47,223 characters across all 20 pages,
  including every quotation this job published. One detail is worth carrying
  into the implementation: a font-run split inside a word renders as
  "improperly collapse d" for "collapsed" and "s he" for "she", so the writer
  reads the extraction and does not paste it. A tolerant search, not an exact
  one, is what a checker should offer.
  The two nearest existing proposals do not cover this.
  `data/proposals/source-quote-extractor-for-review.md` (2026-09-03) is about
  HTML attribute parsing; `data/proposals/primary-source-fetch-route-for-blocked-vendor-pages.md`
  (2026-09-04) is about getting a 200 out of a host that blocks bots. Both
  assume that once the bytes arrive the text is readable. For a PDF it is not.
proposed_by_job: j-20260905-06
proposed_by_type: post
---

`specs/review` requires a reviewer to fetch a blog post's external anchor and
confirm it documents the event, and requires every cited fact in a wiki entry to
be confirmed against its source. The ground rules go further and say that where a
landing page and the PDF disagree, the corpus cites and quotes **the PDF**, and
that absence is never proven until you have ruled out your own instrument.

A reviewer who fetches a PDF anchor today has no instrument. WebFetch hands back
prose the ground rules already say is not evidence in either direction, and for
a PDF it does not even do that — it reports the bytes as unreadable. So the
honest options are to write a parser inside the review invocation, which is what
this job did and which costs real minutes on every run that needs it, or to
confirm the anchor from secondary coverage, which is the weaker check the
`primary-source-fetch-route-for-blocked-vendor-pages` proposal was filed about.

The failure mode worth naming is not the missing capability. It is step (2)
above. The naive extractor did not error. It returned 57,053 characters, exit 0,
looking exactly like a successful extraction, and every one of those characters
came from the page-header stamp rather than the document. A `grep` for a quote
against that output returns nothing, and nothing is indistinguishable from a
quote the document does not contain. That is the shape this repository already
knows: truncated output is indistinguishable from complete output. A shared
script fixes it once, and can say plainly how many pages it decoded and how many
it could not, so a zero is visible as a zero.

Scope, deliberately small: one file under `scripts/`, standard library only
(`zlib.inflateSync` is the whole dependency), a `--find <fragment>` mode that
reports present or absent with a tolerant match, and a page count in its output
so a partial decode announces itself. Not in scope: encrypted PDFs, and scanned
PDFs with no text layer, which should be detected and reported as such rather
than silently returning nothing.
