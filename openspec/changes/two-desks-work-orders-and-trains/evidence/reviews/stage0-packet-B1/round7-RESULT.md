# Stage 0 packet B1, round 7

## Census

Instrument: `C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/d005b682-58b5-4330-b9ab-4eac8f7af78d/scratchpad/f6-B1r7-census.mjs`.
The classifier is approximate and reports an unsure bucket separately.

- Before: 52 assertion calls; 14 with a string/template message; 32 with no
  message (lines 166, 177, 178, 183, 202, 203, 204, 205, 224, 235, 248,
  268, 269, 270, 271, 286, 287, 298, 318, 319, 334, 335, 336, 337, 359,
  372, 373, 374, 387, 396, 411, 412); 6 trailing identifiers rather than
  messages (lines 247, 367, 370, 371, 381, 423).
- After: 52 assertion calls; 26 with a string/template message; 26 with no
  message (lines 202, 203, 204, 205, 224, 235, 248, 268, 269, 270, 271,
  286, 287, 298, 318, 319, 336, 337, 359, 372, 373, 374, 411, 412); 0
  trailing identifiers.
- The census missed no additional instance. Manual review found the two
  `assert.equal` calls whose third argument was `true` in its unsure bucket;
  they were messaged because their failures otherwise print an unlabelled
  boolean. The six initial raw values were handled, including the two
  `ex.text` values, the count, marker-presence boolean, and positions array.

## Changed assertions

Line numbers below are from the final file.

- 166, 177, 178: cut counts now state observed count and expected zero or at
  least one.
- 183: the measured maximum states observed maximum and expected 24000.
- 246: empty excerpt equality now states observed excerpt and expected empty
  string.
- 247: truncation equality now states observed boolean and expected true.
- 279, 288, 327: brief length checks state observed length and the 30000 bound.
- 290, 299, 356, 380: excerpt length checks state observed length and the
  bound, deriving the variable cap where applicable.
- 334, 335: file count and unique-file count state observed and expected 12.
- 348: each per-type cut count states observed count and expected zero.
- 357, 381: `chars` equal text length messages state exactly the two compared
  values; no unrelated cap is repeated.
- 367: cut count states observed count and expected three.
- 370: marker-presence result states observed boolean and expected true.
- 371: sorted positions equality states both compared arrays.
- 375-378: separator count equality states observed separator count and
  expected two; the message contains no unrelated cap or length.
- 423, 424: truncation and empty-excerpt equalities state their observed and
  expected values.

No predicate, compared value, fixture, production file, or cap was changed.

## Deliberately unchanged assertions

Each is structural or already legible from its operands and therefore does not
need prose bolted on:

- 202: `doesNotMatch` proves the unqualified brief omits the site spec.
- 203: `match` proves the subject brief includes the site spec.
- 204: `match` proves the path-overload brief includes the site spec.
- 205: the `indexOf` ordering comparison directly names editorial and site.
- 224: `doesNotMatch` proves no site heading is admitted.
- 235: `doesNotMatch` proves unrelated pending material is absent.
- 248: `doesNotMatch` proves the pending amendment marker is absent.
- 268: deep equality directly compares the two heading arrays.
- 269: `doesNotMatch` proves unrelated content is absent.
- 270: `match` directly names the pulse governing rule.
- 271: `match` directly names the pulse end marker.
- 286: `match` directly names the pending-amendment marker.
- 287: `match` directly names the cut marker and requirement.
- 298: `includes` directly names the pending-amendment marker.
- 318: deep equality directly compares the two heading arrays.
- 319: `doesNotMatch` proves surplus pending material is absent.
- 336: the `some` predicate directly identifies the required pending pulse file.
- 337: the `some` predicate directly identifies the required review spec file.
- 359: `match` directly names each required end marker.
- 372: `match` directly names the first-content marker.
- 373: the `indexOf` comparison directly names pulse and site ordering.
- 374: the `indexOf` comparison directly names site and review ordering.
- 387: `assert.throws` directly names the marker-shortfall error pattern.
- 396: `assert.throws` directly names the full-minimum error pattern.
- 411: `match` directly names the omission/cut notice.
- 412: `doesNotMatch` directly names the forbidden truncation wording.

## Mutation re-runs

The four runs used the targeted test file and reported 23 tests each. Each
mutation exited 1, and the production file was restored after the run. The
restored SHA-256 was `513400fd3352bbc873f64813a8f46e76f2f1991972172e8161a0a59a9d158a53`
for every run.

- `const shortfall = 1;`: real TAP output had `not ok 20`; tests 23, pass 22,
  fail 1. Restoration: `true`, SHA-256 above.
- `floorMinimumTotal = 1;`: real TAP output had `not ok 19` and `not ok 20`;
  tests 23, pass 21, fail 2. Restoration: `true`, SHA-256 above.
- `chars: 0`: real TAP output had `not ok 17` and `not ok 18`; tests 23, pass
  21, fail 2. Restoration: `true`, SHA-256 above.
- inter-chunk `.join('')`: real TAP output had `not ok 18`; tests 23, pass 22,
  fail 1. Restoration: `true`, SHA-256 above.

The temporary `.r7-mutations.mjs` probe was deleted after the runs.

## Full suite

Final run: local machine date `2026-09-08`; duration `426015.0136 ms`
(`7m06.015s`). `npm test` reported tests `1727`, pass `1727`, fail `0`,
cancelled `0`, skipped `0`, todo `0`. Any tree-specific count is labeled at point of use;
the 853 live-tree floor and 833 fixture three-marker minimum are not
interchangeable.
