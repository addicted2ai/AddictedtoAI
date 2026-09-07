---
date: 2026-09-07
slug: verbatim-sweep-of-published-blog-quotations
type: repair
summary: >
  Re-fetch every source cited by a post in `content/blog/` and check each
  double-quoted span in that post against the fetched bytes, normalising only
  what a careful reviewer would normalise (markup stripped, curly quotes and the
  six Unicode hyphen/dash forms folded, whitespace collapsed). Fix the spans
  that are not verbatim, as dated correction blocks where the meaning moved and
  as quotation-boundary repairs where it did not. The failure this catches is
  not invention: it is a quoted span that silently drops or reorders words
  present in the source, which reads as a verbatim quotation and is not one.
  Scope it to the blog corpus and cap it at the posts whose sources still
  resolve; a source that has gone 403 or 404 is a finding to record, not a
  repair to guess at.
evidence: >
  Found while checking this job's own draft with exactly that instrument, on
  2026-09-07. Applied to the draft it caught two of my own defects before
  commit — a quoted span whose first word had been silently lowercased, and one
  that dropped two words present in the source — which is what prompted running
  it against a neighbour.

  The seed instance, in already-published work:
  `content/blog/openai-gpt-6-astra-system-card.md` line 32 reads `The card
  reports misalignment monitoring "added to all tool-using inference involved in
  our external deployment of Astra, with significant compute cost"`. The card
  says "we have additionally added misalignment monitoring to all tool-using
  inference involved in our external deployment of Astra, with significant
  compute cost" — the words "misalignment monitoring" sit between "added" and
  "to all", so the string inside the quotation marks does not occur in the
  source. Verified 2026-09-07 against
  https://deploymentsafety.openai.com/gpt-6-astra/aggregate-monitorability-findings
  (HTTP 200). The meaning is unchanged, which is precisely why nobody caught it
  and why a mechanical pass is the thing that will.

  Not a duplicate of `data/proposals/source-quote-extractor-for-review.md`
  (2026-09-03, type `machinery`), which proposes the extractor a reviewer would
  reach for. This proposes the sweep and the fixes; that tool would make the
  sweep cheaper, and neither waits on the other. A build-time version is out of
  scope by spec: `specs/review` states that verbatim-ness "belongs to the
  reviewer and to nobody else", because a build that fetched would make every
  rebuild depend on a third party's uptime.
---

The corpus already assumes this check happens. `specs/review` makes the
reviewer's fetch the only gate on verbatim-ness, and says so in the sharpest
terms available: the build can check every field of a claim record except the
one that matters, and there is no gate to fall back on if the reviewer skips it.
That is a correct division of labour and it has a measurable consequence — the
check runs once, at review, against a page that was up that day, by a reviewer
reading a diff rather than a corpus.

The seed defect shows what slips through. It is not a fabricated quotation and
not a changed meaning. It is a quotation mark opened two words early, which no
reader can detect without the source open, and which a reviewer scanning for
"does the source support this claim" answers yes to correctly. The claim *is*
supported. The span is still not what the document says.

The reason to sweep rather than fix the one instance is that the defect class is
invisible by construction, so its rate is unknown. One found in the first
neighbour checked is not an estimate, but it is enough to justify measuring. The
job should report the rate it finds even where it repairs nothing, because a
sweep that comes back clean is worth as much as one that does not — it retires
the question.

Two boundaries worth writing into the job's brief. Repairs to published posts
follow the existing rule that a post is true as of its date and is not silently
rewritten, so a span whose meaning moved gets a dated correction block rather
than an edit. And the instrument must rule itself out before it reports an
absence: markup between two words of a quotation is a normalisation problem, not
a misquote, and this corpus has already been bitten twice by extractors that
denied text that was present.
