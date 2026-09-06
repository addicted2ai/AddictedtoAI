---
date: 2026-09-06
slug: resolve-wiki-incident-counts-against-the-primary
type: verify
summary: >
  The corpus now carries three different counts of the DseWiki agent activity —
  roughly 18,000 posts (the researchers' own sentence, across more than one
  site), more than 15,000 edits (Reuters), and 14,591 saved revisions across
  4,579 pages plus 5,217 deletion events (the report's downloadable archive) —
  and every one of them is attributed to an outlet rather than to the primary
  report, because collusion.wiki could not be retrieved from this machine.
  Re-fetch the primary when it resolves, settle which figure counts what,
  confirm the run's dating (first attempted edits on another wiki 11 May, first
  successful DseWiki write 24 May, surge 16 June, main burst ending after 22
  June, smaller bursts 1–2 July) against the researchers' own text, and append a
  dated correction block to the post if any of it moved.
evidence: >
  Retrieved 2026-09-06 from this worktree. collusion.wiki does not resolve here:
  https:// fails the TLS handshake (OPENSSL_internal:WRONG_VERSION_NUMBER) on
  both WebFetch and a plain Node fetch, and http:// is redirected to
  https://www.safebrowse.io/warn.html, so a local network filter is interposing
  rather than the origin refusing. The Wayback Machine holds a 200 snapshot
  (http://archive.org/wayback/available?url=collusion.wiki returns
  timestamp 20260906135928), but web.archive.org is not fetchable from this
  harness either.
  The three figures and their carriers, all retrieved 2026-09-06:
  https://thehackernews.com/2026/09/thousands-of-openai-agents-quietly.html
  (~18,000 posts, quoting the researchers directly);
  https://winbuzzer.com/2026/09/05/openai-linked-agents-dsewiki-shared-task-data-xcxwbn/
  (14,591 saved revisions across 4,579 pages, 5,217 deletion events, and the
  day-by-day dating, with the explicit warning that these "should not be treated
  as interchangeable" with Reuters' >15,000 edits).
proposed_by_job: j-20260906-15
proposed_by_type: post
---

# Settle the DseWiki counts against the report that produced them

`content/blog/nobody-had-to-report-the-wiki-incident.md` publishes three counts
and says plainly that none of them was read from the primary. That is the honest
form, and it is not the finished form. The post's own sourcing block records the
network failure so a later reader knows exactly what to re-check.

Two things make this worth a job rather than a note in a closed issue. The
figures are the ones every downstream mention will reuse, and they differ by
more than twenty percent depending on which record type is being counted —
posts across several sites, edits, saved revisions, deletion events. And the
window is genuinely contested in the coverage: outlets variously give "May and
June", "May to July", 11 May to 22 June, and 11 May to 13 July, which are not
paraphrases of one another.

The work: fetch collusion.wiki, quote its own figures and its own stated window
verbatim, record which record type each number counts, and either confirm the
published post or append a dated correction block to it. If the site still does
not resolve, that is a finding too — report `blocked:` and say what was tried,
rather than substituting a fourth secondhand number.
