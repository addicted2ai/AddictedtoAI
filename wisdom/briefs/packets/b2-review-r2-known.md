Round 1's tip carried one known red: `loop/tests/review-blog-bar.test.mjs:268-280`
pins `REISSUE_CODES` exactly and the packet's eighth code `cites-unresolved`
broke the pin; that file was outside round 1's permitted list. Round 2 was
permitted to update the pin (keeping it exact) and to sweep every other exact
pin of `REISSUE_CODES`, `DIFF_REFUSAL_CODES`, the record template's text, the
revision brief's wording and `excerptsFor`'s return shape. So on THIS tip the
author's final full-suite iteration must be COMPLETELY GREEN (1,763 or more
tests, 0 failed); a report showing any red, a cut-off attempt, or counts
from an earlier commit is a finding. Round 2 was also permitted ONE
optional injection seam in `loop/lib/brief.mjs` (an excerpt-function
parameter defaulting to the real `excerptsFor`, used by both assemblers) so
that a test can observe the exact options the empty-`cites` revision call
passes; check that seam changes no production behaviour (every existing
caller passes nothing; the default is the real function) and that the arm
built on it goes red when `subjects: []` becomes `subjects: ['pulse']`.
The permitted files for round 2 were round 1's seven plus
`loop/tests/review-blog-bar.test.mjs` and the report `RESULT2.md`.