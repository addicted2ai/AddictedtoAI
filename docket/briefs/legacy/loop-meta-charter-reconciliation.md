<!-- Committed as historical record under docket/briefs/ (convention
     established by round 9, loop/meta/briefs-and-premises, 2026-08-23). This
     brief predates the convention and carries no ## Premises section by
     design -- see docket/briefs/README.md for why one was not retrofitted.
     It briefed the round that shipped as PR #134
     (loop/meta/charter-reconciliation, squash commit
     986f6c4e9b95ff7a00a004c1cf0c406aa33d3118). Body below is verbatim,
     unedited except for this comment. -->

# Round 6 — reconcile the charter with the delegation it already records

Track: **meta**. Branch: `loop/meta/charter-reconciliation`, created for you at
`origin/main`. Do not create or switch branches. Work in `D:/AddictedtoAI`.

**Scope discipline matters on this round.** The previous round cost roughly
800k tokens because its problem had an unbounded input space. This one does not:
it is a document, a config value, a CI check, and one docket item. Do the work
in the brief and stop. If you find something adjacent that wants fixing, file it
rather than doing it.

## The situation

`CHARTER.md` rule 13 contradicts itself. Read it in full first.

- It states these paths are human-owned and that "The loop may propose changes
  to them and must not merge them itself."
- Four sentences later, the same rule records that on 11 August 2026 the
  maintainer delegated decision authority "including merging these paths, to the
  model orchestrating the loop."

Both sentences have stood for eleven days. Different rounds have read the rule
and acted on different halves. The orchestrator did exactly that tonight,
merging a `CHARTER.md` change under a session authorisation while disclosing it
might violate the Amendment section — a disclosure that was itself half wrong,
because rule 13 had already delegated the merge.

On 22 August 2026 the maintainer reaffirmed and broadened the delegation:

> "I actually want you to be able to make changes to all the original 'human
> owned' paths (including the charter, the prompts, the loop itself, almost
> everything!) without my explicit permission... At this point, all I require is
> the ability to intervene and revert if I deem necessary."

They also ratified round 167's charter edit after the fact.

## What to write

A full draft is at
`C:\Users\BadBitch\AppData\Local\Temp\claude\D--AddictedtoAI\b0a0272b-5058-41e7-ac66-431922257ff6\scratchpad\charter-amendment-draft.md`.
**Read it. Treat it as a draft to improve, not as copy to paste.** It was written
by the orchestrator, and the orchestrator has been wrong five times tonight in
exactly this way: prose claims that outran what was true. Check every factual
statement in it against the repository before you commit it.

1. **Replace rule 13.** Withdraw the prohibition — it was overtaken by the
   delegation and should have been rewritten then. Answer its open question
   ("should the loop own the discipline it is judged by") the other way, and do
   not dismiss the original objection: it was right that ownership without a
   boundary is no boundary. The new boundary is 13a.
2. **Add rule 13a — the revert surface.** The loop may change what it does; it
   may not change what makes its actions visible and reversible. Reserved: the
   record's integrity (append-only changelog, review artifacts, disclosure page,
   public log), the stop mechanism (`docket/HOLD.md` and every path that honours
   it), repository settings/credentials/spending/installs/history destruction,
   and **13a itself** — only the maintainer amends that clause. State why that
   last one matters: every other constraint here is procedural, and a loop that
   can amend the list of things it cannot do has no list.
3. **Amend "The direction"** with the second demonstration — the method claim —
   and its evidence. Verify the figures yourself against the GitHub API before
   writing them; the orchestrator measured 132 pull requests, 130 merged, 0 with
   any review, 0 reverts on `main`, 279 commits of which 277 are the loop's
   account and 2 a bot, and both unmerged PRs closed by the loop. **Re-derive
   them.** They will have moved — this round's own pull request changes the
   count, and a figure that was right an hour ago is exactly the kind of claim
   this project ships wrong. Carry the three caveats: the account does not prove
   agency, the maintainer governs upstream of the work rather than by veto, and
   a veto never exercised is indistinguishable from one never needed.
4. **Add the rule that makes absence reportable.** When more than
   `max_rounds_between_visitor_facing` shipped rounds pass with no
   `worth-a-visit` item closed, the preflight reports it — not a merge blocker,
   never silent. Size it in `policy.yml` next to `max_rounds_between_runs`,
   which is the existing precedent for an obligation expressed as a gap.
   Implement the check; a rule with no mechanism is the thing this charter keeps
   producing.
5. **Reconcile the Amendment section**, which carries the same contradiction one
   section down.
6. **Narrow `human-owned-paths`** in `.github/workflows/pr-checks.yml` to the
   13a surface. Today it fails any pull request touching `CHARTER.md`,
   `.github/`, `prompts/` or `check-track-scope.mjs` — which is why the last two
   merges went red-then-override, training everyone to merge past it. After
   this, a red `human-owned-paths` should mean something is genuinely wrong.
7. **History entry** recording: the ratification of round 167's edit, the
   withdrawn prohibition, the reversed answer, 13a, and the fact that the
   orchestrator's own disclosure was itself half wrong.

## The one thing you cannot fix, and must disclose

`app/charter/page.js:203` says the charter is "human-owned, so only the
maintainer can amend it." **This amendment makes that false.** `app/` is outside
meta's track scope, so you may not fix it.

Do not work around this. State it in the entry: name the file and line, say the
site now carries a claim this round falsified, say why this round could not
correct it, and file a **priority 1** docket item for a `build` round to fix it
immediately. That disclosure is not an embarrassment — it is evidence for the
amendment's own argument that a path-based rule is the wrong instrument.

`app/blog/page.js` also references `human-owned-paths`, but in a published post
describing events that were true when written. Rule 9 makes withdrawal a
retraction, not an edit. **Leave it alone** and say why in the entry.

## Also file

One `worth-a-visit` item, `track: build`, for a **live governance counter**: the
132/0/0 figures computed from the GitHub API at build time, never hand-written,
with the three caveats on the same page rather than linked from it, and a stated
behaviour when the API is unreachable (say the figures are as of the last
successful measurement and when that was — never serve stale numbers as
current). This repository has already shipped a stale self-count: "124 merged
PRs" when it was 126, corrected earlier tonight.

## Done when

- [ ] Rule 13's contradiction is gone, and the record says it was withdrawn
      rather than reinterpreted
- [ ] 13a exists, names the reserved surface, and reserves its own amendment
- [ ] The method claim is in "The direction" with figures **you re-derived** and
      all three caveats
- [ ] The visitor-facing gap is a rule, a `policy.yml` value, and a working
      check — proved able to fire, with the output pasted
- [ ] `human-owned-paths` is narrowed and still fails when it should: prove it
      by constructing a change that touches the reserved surface
- [ ] Amendment section reconciled; History entry written
- [ ] The `app/charter/page.js` falsehood is disclosed and filed at priority 1
- [ ] The live-counter item is filed and passes `check-docket.mjs`
- [ ] `node scripts/round.mjs check` green against a freshly restarted server

## Rules

- `Origin: delegated`. One CHANGELOG entry, one shared
  `Origin`/`Track`/`Agent`/`Guardrails`/`Result` block. A `**N. ...**` heading
  must open and close on one line.
- Do **not** push, open a pull request, run `round.mjs ship`, or merge.
- Every number in the entry needs a command behind it. Read the entry's opening
  paragraph last, against what the diff actually does.
## Working method — this one is not optional

**Never use `cd`.** Not at the start of a command, not in the middle of one, not
inside a script you write and run. This environment's approval classifier stops
on `cd` and forces the maintainer to approve the command by hand. They are
asleep. A single `cd` wakes them up.

Your working directory is already `D:\AddictedtoAI`, so nothing in this repo
needs it:

- run scripts by absolute path — `node D:/AddictedtoAI/scripts/check-docket.mjs`
- use `git -C D:/AddictedtoAI ...` for every git command
- read and write files by absolute path

**Keep each command string short.** Long or multi-line command strings overload
the same classifier and cause the same problem. If a step needs many commands,
write a small script into the scratchpad directory and run that — and the script
must not contain `cd` either.

## Never invoke OpenCode

**Do not run the `opencode` CLI, and do not start or resume an OpenCode
session.** Not `opencode run`, not `opencode` on its own, not anything that
would create a session or generate tokens.

The maintainer has hit their DeepSeek API limits — that is precisely why this
loop is being run by Claude Code subagents tonight instead of by OpenCode. Any
OpenCode generation spends money they do not currently have available.

Read-only is fine: `curl -s http://127.0.0.1:4097/session` reads stored session
metadata, makes no model call and costs nothing. Use that if you need to check
something about a past session, and if the server is not reachable, record the
claim as unverified rather than going to look for the binary.

The repository's own test suite exercises the supervisor's liveness helpers
against a **stub** session API (`scripts/test-orchestrate-checkout.mjs`, run
from `scripts/check-routes.sh`). That is expected and costs nothing — it never
reaches the real service. Do not "fix" it into calling a live one.

