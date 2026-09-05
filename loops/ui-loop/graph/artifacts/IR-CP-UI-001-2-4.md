# IR-CP-UI-001-2-4 — implementer report, Players Board (RD-004)

```yaml
id: IR-CP-UI-001-2-4
version: 1
schema: loops/ui-loop/graph/schemas.md#implementer-report
depends_on: [RD-004, IR-CP-UI-001-2-3, CP-UI-001-2.v4]
branch: ui/concept-2
worktree: D:\AddictedtoAI-c2
head: 42e84f7 (pre-commit)
```

## Gates
- build PASS (log read; 276 warnings, all pre-existing `currency-literal` content warnings; no
  error; JS 103 kB) · verify-design PASS 46/46 (`data/launch.json` restored) · verify-surfaces PASS
- ui-invariants PASS **24/24** — S22 clause **(e) NEW**; nothing else touched.

## The fix (RT FM-N3 + JV-sys F-sys-4-1) — MET

`source: cited` means "carries a citation", never "is the vendor's own assertion", and
`claimRank` read the field name and the presence of a digit, never WHO was cited. Two changes in
`lib/render/frontier.mjs`, one admission rule:

**1. Tier 2 dropped whole.** `CLAIM_FIELDS_QUANTIFIED` (`observed_throughput_p50`,
`observed_latency_p50`, `cost_per_task`, `output_tokens_per_task`, `fast_mode_speed`) is gone —
those are MEASUREMENTS, someone's reading of the model, not the vendor's claim about it. This
removes FM-N3's LIVE case: Inception's `observed_throughput_p50` "359 tok/s", OpenRouter's
rolling-window median over live traffic, rendered under a lede saying "quoted verbatim from the
vendor" while Inception's own number (1,107 tok/s) is not captured as a fact at all.

**2. Vendor-source test.** A tier-1 field renders only if its `source_url` host is the ROW
ORGANISATION'S OWN domain. Derived from data that exists, never a hand-written host list: an org
entry's own `facts[].source_url` / `timeline[].source_url` are the hosts it cites itself from, and
its OWN domains among them are the ones whose host carries its own name (`orgNameTokens`, the same
alias vocabulary `matchProviders` already joins on, minus generic corporate words —
`ai`, `labs`, `cloud`, `inc`, `group`, …). A host is the vendor's when it is one of those recorded
domains or a subdomain of one, OR when one of its labels IS an org name token — so `www.anthropic.com`
and `blog.google` (recorded) and `deepmind.google` (named, not recorded) pass, while `openrouter.ai`,
`llm-releases.com`, `huggingface.co`, `venturebeat.com` and `en.wikipedia.org` do not. This kills
FM-N3's DORMANT twin: Google's `intelligence_index_by_effort` (llm-releases.com's analyst arithmetic,
tier 1 by field NAME) is now blank whatever else the row does.

**3. Attribution in the cell (F-sys-4-1).** The claim fragment is followed by the VENDOR'S NAME,
which is the link to the cited source: `54.9% — Google DeepMind, accessed 2026-09-03`. The name is
DATA (`org.data.display_name`), not authored copy. The one-line ellipsised clamp is unchanged.

## Counts — 2 claims, 14 blanks, identical at 1440 and 390 (server-rendered)

Was 3/13. The lede's data-derived counts follow automatically: "…today **14** of 16 organisations
have none" (fixed copy unchanged, still no digit in it).

| org | field | source host | vendor domain matched |
|---|---|---|---|
| Google DeepMind | `hle_verified` | `deepmind.google` | name token `deepmind` (org entry records `blog.google`) |
| Tencent | `internal_blind_eval` | `www.tencent.com` → `tencent.com` | name token `tencent` |

The row that left: Inception's `observed_throughput_p50` (tier 2, a measurement). Blank and worth
naming because it looks vendor-ish and is not: DeepSeek's `terminal_bench_score`/`cybergym_score`
cite `huggingface.co` model cards, OpenAI's `terminalbench_score`/`capture_the_flag_score` cite
`venturebeat.com` — a vendor number republished by a third party is that third party's
publication. That is the honest render.

## rule_changes (paired, falsified both ways)

**RULES.md R13 round-4 addendum** — a column labelled as carrying what a party SAID admits a value
only where that party is the value's own cited source, and names that party in the cell; (i) a
measurement is not a claim; (ii) allow-listed field + org's own domain; (iii) the cell states the
vendor's name, because a neighbouring provenance column (READ) is otherwise read as the claim's own.

**S22 clause (e)** (`tools/ui-invariants.mjs`, rule R13). Re-derives vendor-ness from the ORG and
MODEL corpora with its OWN mapping — display names/aliases, the hosts an org entry cites itself
from, and the org's own `mentions:` list as model→org — and never imports `frontier.mjs`, because
the defect it catches IS that module deciding "cited" means "the vendor said it". Fails if a
third-party-sourced value reaches a claim cell, and fails if a rendered claim does not name the
row's own organisation. Vacuity-guarded at both ends (no orgs parsed / no third-party facts found).

Falsifiers (render-logic + rebuild, the mechanism S22 (a) and (d) already use):
- **(e-i)** vendor test disabled → FIRED: *"a vendor-claim cell renders a fact cited to a THIRD
  PARTY… “59 at high reasoning, 57 at medium, 52 at low…” (google-gemini-3-8-flash.md#intelligence_index_by_effort,
  source llm-releases.com)"* — FM-N3's dormant twin, made live and caught.
- **(e-ii)** other end, vendor test rejecting everything → FIRED: *"the VENDOR CLAIM column renders
  ZERO claims across 16 rows"* (clause (d)'s own second end).
- **(e-iii)** attribution half, `.src` reverted to "model record" → FIRED: *"a vendor-claim cell
  renders a claim that does not name the row's own organisation as its source"*.

## Falsifier honesty — one miss, a REAL DEFECT IN THE CHECK

(e-iii) did **not** fire on the first attempt (0 of 1). As first written the clause asked only that
SOME non-empty name follow the em dash, and `"model record"` satisfied that — which is precisely
the unattributed state F-sys-4-1 measured. Not a flake and not retried: the clause now compares the
`.src` label against the row's own lead cell, and the break fires. Recorded here and in the
registry's `observed` field rather than quietly patched.

## Declines
None. Nothing in `do_not_touch` edited: grid, columns, hatch, clamp, READ cell, fetch line, door,
lead pair, nav, tokens, catalog, tutorials stand; S2/S22b/S23/S24/S25 untouched; the lede's WORDS
unchanged (only its data-derived counts move, with the data). No content, data, public, copy or
route change; no CSS change at all this round.

## Files
Changed: `lib/render/frontier.mjs`, `loops/ui-loop/RULES.md`, `tools/ui-invariants.mjs`.
New: this report. Untouched: rig, `evidence/`, `content/`, `data/`, `public/`, `app/`.

## Notes for verify
Δ `frontier--*--1440/390.png`: VENDOR CLAIM 3 claims / 13 hatched → **2 / 14**; Inception's row is
now the labelled blank; each surviving claim ends `— <organisation>, accessed <date>`, the name
being the link. Δ lede: "today 13 of 16" → "14 of 16". `GR-coverage-current.json` was dirty before
this round; left alone.
