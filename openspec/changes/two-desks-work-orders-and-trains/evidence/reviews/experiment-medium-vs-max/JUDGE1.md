# Blind review of X and Y

## Findings — X

1. loop/tests/portability.test.mjs:98-99 still enumerates only .mjs, .md, .json, and .yml. It does not scan the .ts/.tsx files that contain app source. Adding an unscanned.tsx runner-id fixture under all three new roots left all 13 tests green. A runner id in a real app/*.tsx page can therefore pass.

2. loop/tests/portability.test.mjs:130 uses only a > 0 floor. Mutating modelTargets() to return only data/config.json left all 13 tests green. A one-file, non-loop model scan passes. Y's two-file floor catches this particular wrong world.

3. scripts/no-change-dir-refs.test.mjs:70 decides from the whole source line. A planted named path appended to the same line as the allowed generic <name> template in the fixture passed all 3 tests. Both matches inherit the line's generic allowance.

4. The diff adds no persistent negative arm for the narrowed allow-list. Mutating isAllowed to use CHANGE_DIR or return true, and broadening each allow-list regex to /openspec\/changes\//, all stayed green at 3/3. The separate-line named-path mutation goes red, but the committed tests do not protect that behavior from these broadenings.

## Findings — Y

1. loop/tests/portability.test.mjs:103-104 has the same file-type blind spot as X. An added unscanned.tsx runner-id fixture left all 13 tests green.

2. scripts/no-change-dir-refs.test.mjs:70 has the same per-line allow-list gap as X. A named openspec/changes/planted-one/... path on a line that also contains the allowed generic template passed all 3 tests.

3. The diff adds no persistent negative arm for the allow-list. The blanket isAllowed mutant and each broadened regex mutant all remained green at 3/3. The separately appended named-path mutation is caught, but the same-line wrong world is not.

## The mutations I ran

All mutations were source transforms in a temporary Node loader. Neither implementation tree was edited. Every transform armed exactly once, ran a targeted absolute-path test, and disappeared when the process exited. The hash wrapper compared the implementation test file before and after every arm.

The TAP summary below is tests/pass/fail. Red rows had native status 1; green rows had native status 0.

There were 22 counted, armed mutation runs for X and 22 for Y. Two early probe invocations used labels without the loader prefix and were clean no-ops; they are not included.

| Mutation | X | Y |
|---|---|---|
| Remove lib/, app/, or tools/ from runnerTargets | RED, test 5, 13/12/1 for each | RED, test 5, 13/12/1 for each |
| Empty modelTargets() | RED, test 3, 13/12/1 | RED, test 3, 13/12/1 |
| Empty runnerTargets() | RED, tests 4-5, 13/11/2 | RED, tests 4-5, 13/11/2 |
| Set scan().scanned to 0 | RED, tests 3-5, 13/10/3 | RED, tests 3-5, 13/10/3 |
| Stop skipping .test.mjs files | RED, test 4, 13/12/1 | RED, test 4, 13/12/1 |
| Tighten model or runner floor to 999 | RED, test 3 or 4, 13/12/1 | RED, test 3 or 4, 13/12/1 |
| Break fixture hit or scanned-count assertion | RED, test 5, 13/12/1 | RED, test 5, 13/12/1 |
| modelTargets() returns only data/config.json | GREEN, 13/13/0 | RED, test 3, 13/12/1 |
| Add an unscanned .tsx runner-id fixture | GREEN, 13/13/0 | GREEN, 13/13/0 |
| Append named path as a new fixture line | RED, test 1, 3/2/1 | RED, test 1, 3/2/1 |
| Append named path to the generic-template line | GREEN, 3/3/0 | GREEN, 3/3/0 |
| Reinsert old build-initial-site comment | RED, test 1, 3/2/1 | RED, test 1, 3/2/1 |
| Remove explicit legitimate live-one exception | RED, test 1, 3/2/1 | RED, test 1, 3/2/1 |
| Broaden isAllowed, make it always allow, or broaden any allow-list regex | GREEN, 3/3/0 for every arm | GREEN, 3/3/0 for every arm |

Representative root-arm output:

~~~
# Subtest: the runner-id scan catches a fixture under each covered root
not ok 5 - the runner-id scan catches a fixture under each covered root
1..13
# tests 13
# pass 12
# fail 1
NATIVE_STATUS=1
~~~

Y's independent assertion named the missing root, for example: mutation runner-id target lib/ must be scanned and rejected. X's aggregate assertion still went red for each root.

The model-only-config mutant is the differentiator: X reported 1..13, pass 13, fail 0; Y reported not ok 3, pass 12, fail 1, with read 1.

The green .tsx mutant reported 1..13, pass 13, fail 0 in both trees. The green same-line named-path mutant reported 1..3, pass 3, fail 0 in both trees.

Hash restoration proof: every before/after pair was identical.

~~~
X loop/tests/portability.test.mjs       CEF427BE348007E680270362B9D06F0B4FA50D43B779DF31294E71B0A90EB128 -> same
X scripts/no-change-dir-refs.test.mjs   B26A974F0F4D54A367F566C9F509945B23070054A73B879C72BFBCFA42BD55D2 -> same
X loop/lib/specs.mjs                    BB082B836B3CC4E4E5E705BC4D6641DB0BFB4A4D5F0F832021CBB9FB42773C7A -> same
X scripts/check-spec-deltas.test.mjs    A8435A86D164CDCC859E47C790BF8C3AF35D45E4647C5F1DB7F729A19D115E1D -> same
Y loop/tests/portability.test.mjs       1D6F6CA2C93F8699D625E95A66016C25816883BAAB033B8B2ED2E3128ACC4D0C -> same
Y scripts/no-change-dir-refs.test.mjs   E4EEAAF3DB4009687BFFCB057172BD16AD60AC2AE229572A33FE6904280C0E32 -> same
Y loop/lib/specs.mjs                    BB082B836B3CC4E4E5E705BC4D6641DB0BFB4A4D5F0F832021CBB9FB42773C7A -> same
Y scripts/check-spec-deltas.test.mjs    A8435A86D164CDCC859E47C790BF8C3AF35D45E4647C5F1DB7F729A19D115E1D -> same
~~~

## The five red proofs

| Proof | X | Y |
|---|---|---|
| Planted runner id under lib/ | RED, test 5, 13/12/1 | RED, test 5, 13/12/1 |
| Planted runner id under app/ | RED, test 5, 13/12/1 | RED, test 5, 13/12/1 |
| Planted runner id under tools/ | RED, test 5, 13/12/1 | RED, test 5, 13/12/1 |
| Empty a targets list | Model floor RED, 13/12/1; runner floor RED, 13/11/2 | Model floor RED, 13/12/1; runner floor RED, 13/11/2 |
| Planted named path in an allow-listed fixture | Separate added line RED, test 1, 3/2/1 | Separate added line RED, test 1, 3/2/1 |

The last proof is not enough for the full property: placing the named path on the generic-template line stayed GREEN at 3/3 in both implementations.

## Which better meets the brief

**Y.** Both share the .tsx scan gap and the per-line allow-list gap, so neither is fully correct. Y is stronger because its MIN_SCANNED_FILES = 2 floor rejects X's one-file model-scan mutant, and its fixture assertions address lib/, app/, and tools/ independently and assert the exact fixture count. X's aggregate fixture assertion did catch the three root removals, but its > 0 floor allowed a materially narrowed model scan to pass.

## What I ran

Read the standard and both diffs in full:

~~~
Get-Content -LiteralPath 'C:\Users\BadBitch\AppData\Local\Temp\claude\D--AddictedtoAI\d005b682-58b5-4330-b9ab-4eac8f7af78d\scratchpad\f6-exp-brief.md' -Raw
Get-Content -LiteralPath 'C:\Users\BadBitch\AppData\Local\Temp\claude\D--AddictedtoAI\d005b682-58b5-4330-b9ab-4eac8f7af78d\scratchpad\f6-exp-diff-X-judge1.diff' -Raw
Get-Content -LiteralPath 'C:\Users\BadBitch\AppData\Local\Temp\claude\D--AddictedtoAI\d005b682-58b5-4330-b9ab-4eac8f7af78d\scratchpad\f6-exp-diff-Y-judge1.diff' -Raw
~~~

Clean targeted commands:

~~~
node --test --test-reporter=tap 'D:/addictedtoai-worktrees/fleet6-exp-medium/loop/tests/portability.test.mjs'
1..13; # tests 13; # pass 13; # fail 0

node --test --test-reporter=tap 'D:/addictedtoai-worktrees/fleet6-exp-medium/scripts/no-change-dir-refs.test.mjs'
1..3; # tests 3; # pass 3; # fail 0

node --test --test-reporter=tap 'D:/addictedtoai-worktrees/fleet6-exp-max/loop/tests/portability.test.mjs'
1..13; # tests 13; # pass 13; # fail 0

node --test --test-reporter=tap 'D:/addictedtoai-worktrees/fleet6-exp-max/scripts/no-change-dir-refs.test.mjs'
1..3; # tests 3; # pass 3; # fail 0
~~~

Mutation commands used the same targeted form, with the literal mutation id from the table, for example:

~~~
$env:JUDGE_MUTATION='portability-remove-lib'; node --test --test-reporter=tap --experimental-loader 'file:///D:/addictedtoai-worktrees/fleet6-exp-judge/judge-mutation-loader.mjs' 'D:/addictedtoai-worktrees/fleet6-exp-medium/loop/tests/portability.test.mjs'
$env:JUDGE_MUTATION='change-inject-named-same-line'; node --test --test-reporter=tap --experimental-loader 'file:///D:/addictedtoai-worktrees/fleet6-exp-judge/judge-mutation-loader.mjs' 'D:/addictedtoai-worktrees/fleet6-exp-max/scripts/no-change-dir-refs.test.mjs'
~~~

Each mutation command was wrapped with Get-FileHash -Algorithm SHA256 before and after, and printed the TAP summary, NATIVE_STATUS, and both hashes. The first loader form using a raw Windows loader path was refused by Node with ERR_UNSUPPORTED_ESM_URL_SCHEME / Received protocol 'd:' before the test ran; the final commands used a file URL loader and absolute test paths.

I did not run npm test, npm run build, any verify-* script, the Pulse, or any broad test command. I created judge-mutation-loader.mjs and judge-import-check.mjs only in the review workspace and deleted both. X and Y remained unmodified; their only git status entry was the pre-existing .agent-brief.md.
