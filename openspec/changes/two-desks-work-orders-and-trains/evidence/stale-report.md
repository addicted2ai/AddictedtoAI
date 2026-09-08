# Stale-bead verification — 2026-08-31 audit wave

**Cohort size: 27, not ~37.** `bd list --status open --json --limit 0`, filtered to
issues whose `created_at` (stored UTC) falls on **local date** 2026-08-31 in
`America/Denver` (the machine's local timezone, per CLAUDE.md's "every date is
the local date of the machine that wrote it" convention — plain UTC-date
filtering would have shifted several late-UTC/early-local rows across the
boundary). Full open-issue set is 101; the per-local-day histogram (2026-08-29
through 2026-09-08) shows 2026-08-31 as the single largest day at 27, with nothing
close to 37 on any adjacent day either. Ids and titles saved to
`stale-cohort.json` in this scratchpad directory.

## Table

| id | priority | theme | edit-or-create | verdict | evidence |
|---|---|---|---|---|---|
| addictedtoai-6nrk | P2 | machinery-lib | CREATE/CODE | STILL-VALID | No derived census-fact mechanism exists; `lib/snapshot-census.mjs` still checks prose against `CENSUS_RE`/hedge text only. Bead's own 2026-09-08 notes measure the hedge count still climbing (23/23 hedged, past its own 15-claim alarm threshold). |
| addictedtoai-wemx | P2 | machinery-loop | CREATE/CODE | STILL-VALID | `loop/lib/select.mjs:88-104` still runs the same 4-tier order (directives, expiring proposals, queue, other proposals); no decision record added. `data/ledger.jsonl` now holds 14 `"type":"machinery"` jobs since 2026-09-04 — the measurement this bead was waiting on now exists in the data but nobody has written the decision down. |
| addictedtoai-p805 | P2 | machinery-loop | CREATE/CODE | PARTIAL | Reviewer-noticing→proposal production already proven per its own notes; consumption is no longer zero (14 machinery jobs ran since 2026-09-04, confirmed via `grep -c '"type":"machinery"' data/ledger.jsonl` = 14), but no standing measurement artifact (a derived proposal-by-channel count) exists — the actual deliverable is still missing. |
| addictedtoai-kat1 | P2 | machinery-pulse | CREATE/CODE | STILL-VALID | `pulse/lib/queue.mjs` `QUEUE_PRODUCIBLE_TYPES` = `['education','entry','interpret','repair','scout','verify']` — `tutorial` still absent; no producer for tutorials exists. |
| addictedtoai-8wm0 | P2 | machinery-loop | CREATE/CODE | STILL-VALID | `openspec/specs/loop/spec.md:563-584` still lists exactly 4 breakers ("No other condition halts the loop"); the D7 fifth breaker text is not landed. |
| addictedtoai-ccky | P2 | machinery-pulse | CREATE/CODE | STILL-VALID | `pulse/lib/queue.mjs` has zero matches for "mismatched"; no producer joins `lib/reviews.mjs`'s review-state mismatch into a queue item. |
| addictedtoai-pfq0 | P2 | machinery-loop | CREATE/CODE | STILL-VALID | `loop/run.mjs:383-388` still returns immediately on `classified.status === 'blocked'` before any proposal-harvest code runs (the discarded-path half was fixed separately, per the bead's own 2026-09-04 note, reconfirmed). |
| addictedtoai-bibj | P2 | content-corpus | EDIT | STILL-VALID | `content/wiki/org/z-ai.md:31` ("...until the 2025 rebranding") and `:43` ("the first major Chinese LLM company to IPO") remain unqualified against the cited source; only the filing commit (ac481c1) touches the file. |
| addictedtoai-ucbv | P2 | verification-tests | CREATE/CODE | STILL-VALID | `pulse/tests/publish.test.mjs`, `publish-verify.test.mjs`, `helpers.mjs` still bind ephemeral loopback ports via `createServer`/`listen(0)` (7 sites); no shared fixture server or non-TCP transport added. |
| addictedtoai-pfc | P2 | machinery-lib | CREATE/CODE | STILL-VALID | `lib/price-attribution.mjs:70-88` "WHAT IT DOES NOT CATCH" still names only the verbless class, not the tier-spread class. Blocker `addictedtoai-ak9` closed 2026-09-07 but only added a `vendor_posted_rate` fact in `pulse/lib/derive.mjs` — check and corpus still use the tier-ambiguous `#price_input`. |
| addictedtoai-0vh | P2 | machinery-scripts | CREATE/CODE | STILL-VALID | `lib/arxiv-pin.mjs` only enforces the structural "quote beside an unversioned link" rule; no fetch-based checker verifies quote text against the arXiv API anywhere in the tree. |
| addictedtoai-en3s | P3 | machinery-pulse | CREATE/CODE | **FIXED** | Commit `b2b3f41` ("Merge fleet4/en3s: submit a URL only when it is newer than its last success", 2026-09-08 03:16, names `addictedtoai-en3s` explicitly in its message) rewrote `pulse/lib/indexnow.mjs`'s `successfulDates()`/qualifying logic to compare `<lastmod>` against the last successful submission per URL instead of "today." Confirmed the function exists at `pulse/lib/indexnow.mjs:120`. **Bead should be closed** — it is open but the described defect no longer exists. |
| addictedtoai-3liq | P3 | machinery-lib | CREATE/CODE | STILL-VALID | `CENSUS_RE` (`lib/snapshot-census.mjs:189-192`) has no exclusion for a matched number that is actually a date component; `findDates()` is consulted only for hedge-anchoring, never to suppress a census false match. |
| addictedtoai-k7d | P3 | content-corpus + machinery-lib | mixed (EDIT content + CREATE/CODE check) | STILL-VALID | `content/wiki/org/meta-superintelligence-labs.md:117` ("Meta lists...") and `alibaba-cloud.md:82` ("Alibaba listed...") unchanged; `lib/price-attribution.mjs` still has no subject test distinguishing "row lists price" from "company lists row." `ak9` (closed 2026-09-07) supplied only raw vendor-rate data, not the fix. |
| addictedtoai-vt2 | P3 | content-corpus | EDIT (support data) | STILL-VALID | `data/arxiv-pin-debt.json` still holds all 10 body-quote entries verbatim, unchanged since the filing commit (2fc0325). |
| addictedtoai-r4m | P3 | machinery-lib | CREATE/CODE | STILL-VALID | No cross-row price-ratio detector or derived-ratio fact exists; only the filing commit (2fc0325) references r4m in git log. Explicitly depends on 6nrk's proposed derived-fact mechanism landing first. |
| addictedtoai-tm4a | P3 | machinery-lib | CREATE/CODE | STILL-VALID | `lib/day-gap-attribution.mjs:306` still scopes the check to `doc.type === 'post'`; `DAY_GAP_RE` (line 139) unchanged since the module's one build commit (9c5d1e0). |
| addictedtoai-gd28 | P3 | machinery-lib | CREATE/CODE | STILL-VALID | `CENSUS_RE` unchanged; `content/wiki/org/tencent.md:106` still carries the exact number-less superlative the bead names as an uncaught shape. |
| addictedtoai-us7x | P3 | content-corpus | EDIT | STILL-VALID | `content/wiki/model/z-ai-glm-4-5v.md` still declares no `expiration_date` fact (0 hits); 3 later commits touched the file, none added the fact block. |
| addictedtoai-pfy9 | P3 | content-corpus | EDIT | STILL-VALID | All three flagged phrases stand verbatim in `content/learn/machines-that-act-in-the-world.md`: line 29, line 66, line 71. |
| addictedtoai-9gj1 | P3 | content-corpus | EDIT | STILL-VALID | `content/deltas/professional-level-go.md:7` `source_url` is still the 303-redirecting `https://www.nature.com/articles/nature16961`, not repointed. |
| addictedtoai-451e | P3 | content-corpus | EDIT | STILL-VALID | `content/blog/claude-session-theft-infostealers.md:40` still reads "shows up only in BleepingComputer's reporting" — the flagged `only` was never trimmed. |
| addictedtoai-d3mq | P3 | machinery-scripts | CREATE/CODE | STILL-VALID | `scripts/shell-token-guard.mjs:517-523,567-568` still only documents the `Start-Process -ArgumentList` and cmd case-insensitivity gaps in comments; no parser/case-folding code added. |
| addictedtoai-obcr | P3 | machinery-scripts | CREATE/CODE | STILL-VALID | `scripts/shell-token-guard.mjs:695` (`<# #>` block comment) and `:708-710` (here-string body) still skipped, unmeasured; no attended-measurement result recorded. |
| addictedtoai-9q5 | P3 | machinery-loop | CREATE/CODE | STILL-VALID | `loop/lib/specs.mjs:172-180` (`chunkHeading`'s pending-amendment text) still doesn't say where rationale goes or that a MODIFIED block replaces the whole body. |
| addictedtoai-fh7 | P3 | machinery-scripts | CREATE/CODE | STILL-VALID | No archive wrapper script exists (`Glob scripts/*archive*` empty); `scripts/check-spec-deltas.mjs` still only runs pre-build/`--strict`. Its own follow-up, addictedtoai-ce90 (filed 2026-09-04), is also still open. |
| addictedtoai-6m3 | P3 | machinery-scripts | CREATE/CODE | STILL-VALID | `scripts/shell-token-guard.mjs:476-479` header still marks the `#`-comment and heredoc-body skip as an unmeasured assumption (companion question to obcr — Bash arm vs. PowerShell arm). |

## Totals

- **STILL-VALID: 25**
- **PARTIAL: 1** (addictedtoai-p805)
- **FIXED: 1** (addictedtoai-en3s — recommend flagging for closure)
- **MOOT: 0**
- **CANNOT-TELL: 0**

Every claim in this cohort resolved to a static, directly-checkable fact
(file/line/regex/commit-log state) — none needed a build or test run to
settle, consistent with the "no verify scripts" constraint on this pass.

## Natural batches among the STILL-VALID ones (same file/surface)

1. **`lib/snapshot-census.mjs` census-check family** — 6nrk, 3liq, gd28, r4m.
   All four live in the same regex/hedge mechanism. r4m and gd28 explicitly
   depend on 6nrk's proposed derived-fact shape landing first; 3liq is an
   independent false-positive fix (date components matching as row counts)
   that doesn't need 6nrk. A single review pass over this file could resolve
   3 of the 4 (gd28, 3liq, and unblock r4m by deciding 6nrk).

2. **Desk/queue selection machinery** — wemx, p805, kat1, ccky, pfq0 (plus
   8wm0 on the adjacent breaker-spec text). All in `loop/lib/select.mjs`,
   `loop/run.mjs`, `pulse/lib/queue.mjs`, or the openspec loop spec. wemx and
   p805 are near-duplicates by their own notes ("when either is answered,
   close both") and both are now unblocked by the same new evidence: 14
   machinery-type jobs in `data/ledger.jsonl` since 2026-09-04 that neither
   bead's notes reflect yet. kat1 and ccky are both one-line additions to
   `QUEUE_PRODUCIBLE_TYPES`/a queue producer in the same file.

3. **`lib/price-attribution.mjs` price-check family** — pfc, k7d. Both were
   blocked on addictedtoai-ak9 (closed 2026-09-07); ak9 supplied raw
   vendor-rate data but neither check logic nor the content wording (k7d
   names `meta-superintelligence-labs.md` and `alibaba-cloud.md`) was
   migrated to use it. Both are now unblocked and share the same file to
   edit.

4. **`scripts/shell-token-guard.mjs` unmeasured-assumption family** — d3mq,
   obcr, 6m3. obcr and 6m3 are literally the same "does the classifier trip
   inside a comment/heredoc" question asked for the Bash arm and the
   PowerShell arm respectively; all three want one attended maintainer
   session poking the guard with real approval prompts, which is explicitly
   the kind of measurement no unattended job can produce.

5. **`arxiv-pin` verification pair** — 0vh (no fetch-based quote verifier
   exists) and vt2 (the 10 quotes that verifier would need to check, sitting
   unverified in `data/arxiv-pin-debt.json`). Building 0vh's mechanism is the
   direct way to retire vt2's debt list.

6. **openspec spec-delta discipline pair** — 9q5 (`loop/lib/specs.mjs`
   rationale-placement text) and fh7 (no post-archive delta-merge check /
   wrapper). Different files but the same review pass (spec-delta lifecycle)
   could reasonably cover both, per batch D's own note.

7. **Content-page EDIT batch (Desk-mediated only)** — bibj, us7x, pfy9,
   9gj1, 451e, k7d's two wiki sentences, gd28's tencent.md sentence, vt2's
   10 quotes. None of these are code changes; every one requires editing an
   already-reviewed content page, which per CLAUDE.md can only go through
   the Desk (review re-binding, `entry: re-review` directive, etc.), not a
   direct edit.

## Flag for follow-up

- **addictedtoai-en3s is FIXED and should be closed.** The merge commit
  `b2b3f41` names the bead id directly in its message and the code change
  matches the bead's own preferred fix (option b: accept a one-run-old
  ledger, `isEngineWrite` recognizing `data/indexnow.jsonl`). This agent made
  no bd writes per its read-only mandate — closing it is a follow-up action
  for whoever picks this report up.
- **addictedtoai-wemx and addictedtoai-p805** are both now unblocked by the
  same fact (14 machinery jobs ran since 2026-09-04) that postdates both
  beads' last notes; worth a fresh triage pass rather than continuing to
  treat them as blocked on absent data.
