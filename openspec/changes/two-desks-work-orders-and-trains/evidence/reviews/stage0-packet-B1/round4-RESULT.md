# Stage 0, packet B1, round 4

Date: 2026-09-08 (local machine date)

## Changes

- `loop/lib/specs.mjs:259-270` now renders the excerpt through one shared
  helper. `chars` is the emitted text length.
- `loop/lib/specs.mjs:341-353` charges every constitution chunk heading and
  inter-chunk separator in the loud minimum and its shortfall.
- `loop/lib/specs.mjs:365-399` reserves the later floor content after charging
  structural overhead, and charges each pending chunk's heading/separator
  before admitting content. A cap below the full emitted minimum still throws.
- `loop/lib/specs.mjs:427` reports the emitted length as `chars`.
- `loop/tests/brief-excerpt-budget.test.mjs:334-355` changes both cap arms to
  assert `ex.text.length`, with the emitted length and cap in each diagnostic.
  The marker fixture cap is 900 because the corrected three-marker minimum is
  833; the separate shortfall test remains at cap 1.
- `loop/lib/config.mjs` and `loop/lib/brief.mjs` were inspected and unchanged:
  they already pass the authoritative cap through without measuring excerpts.

## Four requested parts and arm evidence

1. `chars` measures the emitted text. The floor arm's clean forced diagnostic
   measured `emitted length 23145`, cap `24000`; the clean targeted run was
   21 tests, 21 pass, 0 fail.
2. Headings and separators are charged. The tight-cap arm's clean run passed;
   its structural-overhead mutation (`floorOverhead = 0`) went red with the
   real diagnostic `emitted length 1295 exceeds cap 900`.
3. Later-floor reserve includes marker, heading, and separator. The floor
   arm asserts the assembled text against cap 24000, while the tight fixture
   keeps all three markers under cap 900; the corrected minimum reported by
   the live tree is 853 for the post capability set.
4. Loud failure uses the same emitted quantity. The live cap 800 failed with
   `marker shortfall=53`; the permanent cap-1 test passed with the updated
   shortfall wording.

## Mutate, red, restore

- Floor arm: the assertion boundary was mutated from `<= 24000` to `<= 0`.
  The arm went red with `emitted length 20736 exceeds cap 0` (21 tests, 20
  pass, 1 fail). The test file SHA-256 was
  `AACBBF815596AA3C5EA5C55007601835DB7B547158D3487B1B4156DAB2390F19`
  before and after restoration.
- Tight arm: the production structural reserve was mutated to
  `floorOverhead = 0`. The arm went red with `emitted length 1295 exceeds cap
  900` (21 tests, 20 pass, 1 fail). The implementation SHA-256 was
  `513400FD3352BBC873F64813A8F46E76F2F1991972172E8161A0A59A9D158A53`
  before mutation and after restoration. The intermediate overhead-only
  mutation was also restored to that same hash.

The probe used for the live measurement was deleted after use.

## Live-tree measurement beside fixture bounds

For job type `post`, `subjects: []`, on the live tree:

- cap 12000: `chars=12000`, emitted length `12000` (within cap).
- cap 800: loud failure, floor `853`, shortfall `53` (the old 800-character
  fixture is now correctly rejected rather than emitting an over-cap result).
- cap 40000: `chars=29612`, emitted length `29612` (within cap).

The fixture arms are cap 24000 with emitted length 23145, and cap 900 with
the corrected marker-only tight fixture; both are checked on emitted text.

## Tests

Targeted excerpt suite: `tests=21`, `pass=21`, `fail=0`, duration
`15864.5697 ms`.

The full `npm test` is run once after this record is written; its final
result: `tests=1725`, `pass=1725`, `fail=0`, duration `445150.6744 ms`
(447.6 seconds). It completed within the 600,000 ms timeout.
