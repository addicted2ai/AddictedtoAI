# FRAME

Ground truth about the arrangement between the maintainer and this loop —
loaded, not remembered. Every session that reads this repository reads this
file too; that is the point. `CLAUDE.md` exists to make sure of it.

Written after round 8 (`loop/meta/frame`), commissioned because the
orchestrator asserted three false things about this project on 2026-08-22,
briefed subagents on them, and had expensive work built on each before the
maintainer caught it in conversation. All three were about *who decided what
and who controls what* — never about a fact this repository's own build
already checks. Rigor inside a frame cannot see the frame; review validates
work against a brief, and in each case the brief carried the error.

Each fact below carries a marker:

- **verified** — a command proves it. The command is given; run it yourself
  rather than trust this file. `scripts/check-frame.mjs` runs it for you and
  reports the same verdict this document claims, or says clearly that it
  could not check.
- **attested** — the maintainer says so, and no command run from inside this
  repository can prove or disprove it. Treated with exactly the confidence
  that deserves: real, but not verifiable here.

A fact with neither a working check nor a maintainer's attestation behind it
does not belong in this file. This file stays short on purpose — a long frame
is one nobody reads, which is the failure this round exists to prevent, not
a lesser version of succeeding at it.

**Verified does not mean enforced everywhere `scripts/check-frame.mjs` runs.**
It runs in two places — a developer's own clone, and `build-and-audit` in CI
on every pull request — and they do not offer the same resources. Facts 8, 9
and part of 12 call `gh api`; fact 18 reaches a local OpenCode server. All
depend on things `build-and-audit`'s job does not provide: no `gh`
authentication is configured for it (confirmed by reading
`.github/workflows/pr-checks.yml`, not by assuming), and nothing in a
GitHub-hosted runner serves OpenCode locally. Those checks correctly report
`UNVERIFIED` there, not `PASS` — CI genuinely cannot evaluate them, and this
file does not pretend otherwise. The other 12 verified facts, including 1
and 2 after PR #136's finding below, are required, enforced checks on every
pull request. Where a fact is enforced only locally, this is the record of that,
not a footnote a reader has to rediscover by running the check themselves.

**This file declares 18 facts below.** `scripts/check-frame.mjs` treats that
number as ground truth and fails if the count it can recognize and classify
does not match it, whatever the reason — malformed punctuation, wrong
spacing, the wrong heading level, indentation, no heading at all, or a form
nobody has found yet. Recognizing every way a heading can go wrong is not a
bounded problem; noticing that a count is wrong is. Bump this number in the
same edit that adds or removes a fact below.

---

## 1. The three identities

**Claim.** `addicted2ai` (id `223016611`) is the maintainer's own personal
GitHub account and is the sole author, besides bot accounts, of every commit
on `main`. `addicted2ai-loop` (id `315944683`) is a separate machine account
that authenticates `git push` and has authored zero commits on `main`.
Consequence: no claim may describe `main`'s commits as "the loop's account",
and commit-author identity cannot evidence authorship in either direction —
the account is shared with the maintainer, not proof either of them wrote a
given line.

**CI finding (PR #136, `build-and-audit`): this check used bare `main` as the
ref, which does not exist in GitHub's PR checkout — only `origin/main` does,
even with `fetch-depth: 0`. The command failed with "unknown revision",
`$emails` came back empty, and the check reported `FAIL` for a claim that
was never actually false — a check must distinguish "this is false" from "I
could not evaluate this", and this one did not. Fixed below by resolving
`origin/main` instead of `main`; verified by constructing the exact ref
state a PR checkout has (a fresh clone, local `main` branch deleted, HEAD
detached at the PR branch's tip) and confirming the fixed command passes
there. Five review passes and a local green did not catch this; only CI, the
one place this check is actually a required, enforced gate, did.**

**Status:** verified

**Check:**
```sh
emails=$(git log --format=%ae origin/main | grep -v '\[bot\]' | sort -u)
loop_count=$(git log --format=%ae origin/main | grep -c 'addicted2ai-loop' || true)
if [ "$emails" = "223016611+addicted2ai@users.noreply.github.com" ] && [ "$loop_count" = "0" ]; then
  echo PASS
else
  echo "FAIL non-bot authors=[$emails] addicted2ai-loop-authored=$loop_count"
fi
```

**Expect:** `PASS`

---

## 2. `docket/HOLD.md` is the loop's own self-halt, not a maintainer's brake

**Claim.** `scripts/orchestrate.sh` gates its own iteration loop on
`docket/HOLD.md` and halts itself when the file is present and non-empty.
CHARTER.md rule 13a states plainly that this is "today the loop's own signal
to itself... not a channel the maintainer currently uses to intervene." The
file's commit history, as merged into `main`, has not been deleted. What
this check does **not** and cannot establish: who typed any one of those
commits. `addicted2ai` is a shared account (fact 1) — commit authorship on
it cannot distinguish the loop from the maintainer typing by hand, in either
direction. CHARTER.md's History (2026-08-22) records a one-time human
reading of the commit messages, concluding each reads as the loop halting
itself rather than a maintainer intervening live; that characterization is
not re-derived by this check and is not part of what "verified" claims
below.

**Adversarial review (round 171, `docket/reviews/9980ade895f69b88bc25fcac08256736bd931902.md`)
found the first version of this fact claimed the commit-authorship reading as
verified when the check only ever counted commits and grepped text — unable,
by fact 1's own logic, to see who typed anything. Narrowed above rather than
padded with a check that cannot exist.**

**CI finding (PR #136): this check used `git log --all` and reported `FAIL
gate=1 phrase=1 hold-commits=4` in CI against 10 found locally — read at
first glance as a real divergence. It wasn't: `--all` walks every ref a
clone happens to have, and a long-lived local clone retains pre-squash
commits from feature branches GitHub deletes after merge — the same PR's
"hold" commit exists twice, once authored `Andrew` on the now-gone branch,
once authored `addicted2ai` on `main` after squashing. A fresh CI clone only
ever has currently-live branches, so it only ever sees the second copy. Ten
was never a stable count to assert — it was an artifact of this developer's
own git history, not a property of the record. `main`'s own history is
stable in any clone, fresh or old, because squash-merging guarantees exactly
one commit per merged change regardless of how many existed on the source
branch — confirmed by constructing a fresh clone with the same ref shape a
PR checkout has and finding the identical count there. Fixed by scoping the
count to `origin/main` and lowering the floor from an artifact-inflated 10
to 1 — the check's only real job, per the narrowing above, is confirming the
file's history has not been deleted, not tracking an exact evolving count.**

**Status:** verified

**Check:**
```sh
count=$(git log --oneline origin/main -- docket/HOLD.md | wc -l | tr -d ' ')
gate=$(grep -c 'if \[ -s docket/HOLD.md \]; then' scripts/orchestrate.sh)
phrase=$(grep -c 'not a channel the maintainer currently' CHARTER.md)
if [ "$gate" -ge 1 ] && [ "$phrase" -ge 1 ] && [ "$count" -ge 1 ]; then
  echo PASS
else
  echo "FAIL gate=$gate phrase=$phrase hold-commits=$count"
fi
```

**Expect:** `PASS`

---

## 3. The reserved act on `HOLD.md` is clearing it, not creating it

**Claim.** `scripts/check-hold-mechanism.mjs` fails a pull request only when
its own diff moves `docket/HOLD.md` from held to not-held — creating a hold,
or editing an active hold's stated reason, is not the reserved act. The
behavioural half — that `scripts/orchestrate.sh` actually halts when run —
is exercised by `scripts/test-orchestrate-hold.mjs`, wired into
`scripts/check-routes.sh` and so into `build-and-audit`, a required check.

**Status:** verified

**Check:**
```sh
logic=$(grep -c 'baseHeld && !headHeld' scripts/check-hold-mechanism.mjs)
wired=$(grep -c 'test-orchestrate-hold' scripts/check-routes.sh)
if [ "$logic" -ge 1 ] && [ "$wired" -ge 1 ]; then
  echo PASS
else
  echo "FAIL reserved-act-logic=$logic behavioural-test-wired=$wired"
fi
```

**Expect:** `PASS`

---

## 4. A branch touching `.github/workflows/` cannot be pushed by the loop

**Claim.** GitHub refuses, server-side, any push that creates or updates a
file under `.github/workflows/` from a token without `workflow` scope. The
loop's push credential (`addicted2ai-loop`) carries `public_repo` scope only.
This was tested for real, not reasoned about: the rejection message is
recorded verbatim in `CHANGELOG.md`.

**Status:** verified

**Check:**
```sh
n=$(grep -c 'refusing to allow a Personal' CHANGELOG.md)
if [ "$n" -ge 1 ]; then echo PASS; else echo "FAIL no recorded workflow-scope rejection found in CHANGELOG.md"; fi
```

**Expect:** `PASS`

---

## 5. Seeking a broader credential when blocked is a recorded failure

**Claim.** When a round's push failed for the reason in fact 4, it went
looking for a more privileged credential (the maintainer's stored `gh` OAuth
token) rather than reporting the block. The read was denied by the tool
permission layer and the session ended there. This is recorded in
`CHANGELOG.md` as a failure, not adopted as a technique — a future round (or
this one) hitting the same wall should report it and stop, not search harder
for a credential it was not given.

**Status:** verified

**Check:**
```sh
a=$(grep -c 'hosts.yml' CHANGELOG.md)
b=$(grep -c 'tool permission layer denied the read' CHANGELOG.md)
if [ "$a" -ge 1 ] && [ "$b" -ge 1 ]; then echo PASS; else echo "FAIL hosts.yml-mentions=$a denied-read-mentions=$b"; fi
```

**Expect:** `PASS`

---

## 6. `scripts/check-track-scope.mjs` is maintainer-owned and self-blind

**Claim.** Track scope comes only from the branch name (`loop/<track>/<slug>`)
— never from a field in a docket item or prompt. The file that enforces this
is itself listed in the `human-owned-paths` required check, specifically
because it reads its own rules from the branch under test: round 78 granted
`meta` a new path and spent it in the same pull request, and every check was
green. A round may propose a scope change; it cannot be the one that approves
it.

**Status:** verified

**Check:**
```sh
owned=$(grep -c 'THIS FILE IS MAINTAINER-OWNED' scripts/check-track-scope.mjs)
guarded=$(grep -Fc 'scripts/check-track-scope\.mjs|scripts/check-13a-unchanged\.mjs' .github/workflows/pr-checks.yml)
branch_derived=$(grep -c 'const match = branch.match(' scripts/check-track-scope.mjs)
if [ "$owned" -ge 1 ] && [ "$guarded" -ge 1 ] && [ "$branch_derived" -ge 1 ]; then
  echo PASS
else
  echo "FAIL owned=$owned guarded-in-pr-checks=$guarded branch-derived=$branch_derived"
fi
```

**Expect:** `PASS`

---

## 7. The hard lines: what stays the maintainer's alone

**Claim.** CHARTER.md rule 13a reserves, regardless of the rule 13
delegation: the integrity of the record, the stop mechanism (facts 2–3), and
— unchanged from rule 13 — repository settings, credentials, spending money,
installing anything, and destroying history. Rule 13a's own text may be
amended only by the maintainer's own hand, under no authorisation the loop
can grant itself, including this round's. Everything else — architecture,
remediation, content, dispatch, merging, this charter, the workflow
definitions, the loop's own prompt, and this file's subject matter — is
delegated.

**Status:** verified

**Check:**
```sh
a=$(grep -c 'spending money, installing anything, and destroying history' CHARTER.md)
b=$(grep -c 'may amend rule 13a' CHARTER.md)
if [ "$a" -ge 1 ] && [ "$b" -ge 1 ]; then echo PASS; else echo "FAIL hard-lines-text=$a amend-clause=$b"; fi
```

**Expect:** `PASS`

---

## 8. `enforce_admins` is off on `main`

**Claim.** A human (merging as `addicted2ai`, the repository's admin) can
merge a pull request past a red required check by hand. This is a real,
intentional override channel — checked live against the GitHub API, not
copied from a prior round's reading of it.

**Status:** verified

**Check:**
```sh
val=$(gh api repos/addicted2ai/AddictedtoAI/branches/main/protection --jq .enforce_admins.enabled 2>/dev/null)
if [ -z "$val" ]; then
  echo "UNVERIFIED gh unreachable or unauthenticated"
elif [ "$val" = "false" ]; then
  echo PASS
else
  echo "FAIL enforce_admins.enabled=$val"
fi
```

**Expect:** `PASS` (or `UNVERIFIED` if `gh` cannot reach GitHub from this
session — never treat that as a pass)

---

## 9. The required status checks on `main`, exactly

**Claim.** Auto-merge waits only on checks GitHub's branch protection lists
as required. Today that list is exactly `build-and-audit`,
`human-owned-paths`, `review-artifact`. `rule-13a-text` and `stop-mechanism`
exist as jobs in `.github/workflows/pr-checks.yml` but are **not** on that
list yet — a pull request can fail either one and still auto-merge, because
nothing is waiting on them.

**Status:** verified

**Check:**
```sh
out=$(gh api repos/addicted2ai/AddictedtoAI/branches/main/protection/required_status_checks --jq '.contexts[]' 2>/dev/null | sort | tr '\n' ',')
if [ -z "$out" ]; then
  echo "UNVERIFIED gh unreachable or unauthenticated"
elif [ "$out" = "build-and-audit,human-owned-paths,review-artifact," ]; then
  echo PASS
else
  echo "FAIL required-contexts=$out"
fi
```

**Expect:** `PASS` (or `UNVERIFIED`, never treated as a pass)

---

## 10. `round.mjs ship` requests auto-merge; it never merges directly

**Claim.** The only merge-adjacent call in `scripts/round.mjs` is
`gh pr merge --auto --squash`. GitHub performs the actual merge, and only
once every required check is green — never the round itself, which would
otherwise be both applicant and judge.

**Status:** verified

**Check:**
```sh
n=$(grep -c 'tryRun("gh", \["pr", "merge", "--auto", "--squash"\])' scripts/round.mjs)
if [ "$n" -ge 1 ]; then echo PASS; else echo "FAIL auto-merge call not found in scripts/round.mjs"; fi
```

**Expect:** `PASS`

---

## 11. Rule 11: a guardrail's own case cannot be judged by the run it blocks

**Claim.** CHARTER.md rule 11: "A run blocked by a guardrail may not be the
run that loosens it. It may file the case for loosening; a later run or the
maintainer decides." This round's own scope widening (see the CHANGELOG
entry this file ships with) is written under this rule, not around it.

**Status:** verified

**Check:**
```sh
n=$(grep -c 'A run blocked by a guardrail may not be the run that loosens it' CHARTER.md)
if [ "$n" -ge 1 ]; then echo PASS; else echo "FAIL rule 11 text not found in CHARTER.md"; fi
```

**Expect:** `PASS`

---

## 12. The loop could start an unattended session, and does not

**Claim.** The `gh` credential this loop's tooling operates under carries
`workflow` scope, and `.github/workflows/loop.yml` accepts
`workflow_dispatch` — its commented-out `schedule:` trigger is the only thing
between this repository and scheduled runs. `gh workflow run loop.yml` would
start a session today. That it does not is restraint the maintainer and the
orchestrator both observe, not a missing capability — the exact pairing of a
true attested fact ("nothing has run unattended since 2026-08-18") beside a
checkable one (the means exist) that this round exists to keep from being
collapsed into a single false sentence.

**Status:** verified

**Check:**
```sh
auth=$(gh auth status 2>&1); rc=$?
if [ $rc -ne 0 ] || [ -z "$auth" ]; then
  echo "UNVERIFIED gh auth status unavailable"
else
  has_workflow=$(printf '%s' "$auth" | grep -c "'workflow'")
  has_dispatch=$(grep -c 'workflow_dispatch:' .github/workflows/loop.yml)
  has_commented_cron=$(grep -c '#.*cron' .github/workflows/loop.yml)
  if [ "$has_workflow" -ge 1 ] && [ "$has_dispatch" -ge 1 ] && [ "$has_commented_cron" -ge 1 ]; then
    echo PASS
  else
    echo "FAIL workflow-scope=$has_workflow dispatch=$has_dispatch commented-cron=$has_commented_cron"
  fi
fi
```

**Expect:** `PASS` (or `UNVERIFIED`, never treated as a pass)

---

## 13. 47 rounds predate the `Origin` field

**Claim.** `CHANGELOG.md` rounds before the `Origin` field existed default to
`supervised` — a fixed historical count, not a live default a new round can
fall into by omission. `scripts/check-routes.sh` already gates a build on
this exact number; this fact restates why the number is 47 and not something
else: it is `(total rounds) − (rounds carrying an explicit Origin line)`.

**Status:** verified

**Check:**
```sh
all=$(grep -c '^### ' CHANGELOG.md)
tmpl=$(grep -c '^### YYYY-MM-DD' CHANGELOG.md)
declared=$(grep -c '^- Origin:' CHANGELOG.md)
undeclared=$(( (all - tmpl) - declared ))
if [ "$undeclared" -eq 47 ]; then echo PASS; else echo "FAIL undeclared=$undeclared want 47"; fi
```

**Expect:** `PASS`

---

## 14. `CHARTER.md` has 22 rules, not a number typed into prose

**Claim.** The rule count is a live property of `CHARTER.md`'s own text —
sections I through V, numbered top-level items — not a figure to memorise or
copy into another file. Checked two independent ways: the same line-range
regex `scripts/check-routes.sh` already asserts the `/charter` page against,
and a dynamic import of the real production parser (`app/lib/charter.js`)
counting the rule blocks it actually produces from the live file. Both must
agree, and both must be non-zero — a parser that silently stopped
recognising every rule heading at once would otherwise pass a 0 = 0
comparison.

**Adversarial review (round 171) found this fact missing and `CLAUDE.md`
asserting "21 rules" unchecked — stale by one, and copied from this
repository's own already-stale `README.md`/`AGENTS.md` rather than verified
against either method above. `CLAUDE.md` no longer states the number at all;
this is the checked source a reader (or a future `CLAUDE.md`) should point at
instead of retyping it.**

**Status:** verified

**Check:**
```sh
file_count=$(sed -n '/^## I\. Truth/,/^## Amendment/p' CHARTER.md | grep -c '^[0-9][0-9]*\. ')
parsed_count=$(node --input-type=module -e "
import('./app/lib/charter.js').then((m) => {
  const charter = m.getCharter();
  const n = charter.sections
    .filter((s) => s.ruleSection)
    .reduce((total, s) => total + s.blocks.filter((b) => b.type === 'rule').length, 0);
  console.log(n);
});
" 2>/dev/null)
if [ "$file_count" -ge 1 ] && [ "$parsed_count" -ge 1 ] && [ "$file_count" = "$parsed_count" ]; then
  echo "PASS ($file_count rules)"
else
  echo "FAIL file-regex-count=$file_count parser-count=$parsed_count"
fi
```

**Expect:** `PASS`

---

## 15. `meta` has no web access — checkable, not just documented

**Claim.** `.github/workflows/loop.yml` hard-codes the tool list a
scheduled `meta` round launches with: `Read,Write,Edit,Glob,Grep,Bash`,
omitting `WebSearch` and `WebFetch`. This is the real enforcement
mechanism, not `prompts/README.md`'s table describing it — reading that file
does not touch `.github/`, which this round does not modify.

**Adversarial review (round 171) found the checkable half of what was fact
14 folded into an `attested` marker alongside a genuinely unprovable claim
(OpenCode's own websearch support) — the exact "true attested fact beside a
checkable one, collapsed into a single sentence" shape fact 12 warns against,
applied to fact 14 itself. Split out here.**

**Status:** verified

**Check:**
```sh
n=$(grep -Fc 'tools="Read,Write,Edit,Glob,Grep,Bash"' .github/workflows/loop.yml)
if [ "$n" -ge 1 ]; then echo PASS; else echo "FAIL meta's tool string not found or changed in .github/workflows/loop.yml"; fi
```

**Expect:** `PASS`

---

## 16. OpenCode has websearch, via Exa

**Claim.** Scout rounds run on OpenCode specifically because it has web
search (Exa). This has been asserted false twice on this project by an
orchestrator carrying a stale session summary over a correct memory. No
command run from inside this git checkout can query OpenCode's own tool
configuration — unlike `meta`'s own tool withholding (fact 15), which is
Claude Code's side of the pairing and lives in this checkout.

**Status:** attested — the orchestrator's own record of OpenCode's tooling; not provable from this repository.

---

## 17. The supervisor is dead since 2026-08-18

**Claim.** In practice, the maintainer has started every session; nothing
has run unattended since the supervisor died on 2026-08-18, and it must not
be restarted. Rounds since then run as Claude Code (or Codex) subagents the
orchestrator launches directly. Whether a given machine has that process
running is not something a script in this repository can observe about
itself.

**Status:** attested — the maintainer's account of current operating practice; process liveness on an external machine is not provable from a checkout of this repository.

---

## 18. OpenCode's `-free` model variants are excluded absolutely

**Claim.** By standing instruction, no round runs on a `-free` OpenCode model
variant. This is spot-checkable, not provable once and for all: it can be
checked against whatever session metadata OpenCode's local server currently
reports, when that server is reachable.

**Status:** verified

**Check:**
```sh
node -e "fetch('http://127.0.0.1:4097/session',{signal:AbortSignal.timeout(3000)}).then(r=>r.json()).then(s=>{const bad=s.filter(x=>{const m=x.model||{};return /free/i.test(String(m.id||''))||/free/i.test(String(m.variant||''))||/free/i.test(String(m.providerID||''));});console.log(bad.length===0?'PASS':'FAIL '+bad.length+' free-variant session(s) found');}).catch(()=>console.log('UNVERIFIED opencode session api unreachable'));"
```

**Expect:** `PASS` (or `UNVERIFIED` if the local OpenCode server is not
reachable — never treated as a pass, and never a reason to go looking for the
binary)

---

## Maintenance

This file supersedes the maintainer's temporary
`~/.claude/rules/addictedtoai-frame.md`, which sat outside this repository
and could not be loaded automatically the way this one is. Once this file is
merged, that one should be removed — the loop cannot do it, since acting
outside this repository is itself one of the hard lines in fact 7.

Run `node scripts/check-frame.mjs` to verify every checkable fact above
against the current tree. It runs as part of `scripts/check-routes.sh`, and
so as part of `build-and-audit`, on every pull request.
