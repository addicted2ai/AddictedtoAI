# STANDING-AUTHORITY.md — what the maintainer has already decided

This file exists to be handed, verbatim and whole, to a **blind escalation
check**: a subagent that is given a situation plus this document and asked
whether the situation genuinely requires the maintainer, and why. It is
deliberately a flat list of what has been granted and what has not, with no
narrative about any particular incident, so that it can be read cold.

**Why it exists.** The orchestrator has repeatedly completed a full diagnosis,
formed a clear recommendation, and then handed the decision back to the
maintainer anyway — on halts it was authorised to clear, on editorial rulings
it was greenlit to make, and on a corrected page it had already measured. His
words, on being asked once too often: *"Why do you keep putting these decisions
back to me?"* The rule he set in response is the mechanism below.

---

## THE RULE

**Before escalating anything to the maintainer, spawn a blind subagent.** Give
it the context around the issue and this document. Ask it whether the decision
requires the maintainer, and **why**. Do not tell it your own conclusion — an
agent told what to think confirms it, and a confirmation is worth nothing.

**This fires ONLY when you have decided you want to ask him something.** It is
not a step in ordinary work, not a second opinion on decisions you are already
making yourself, and not a review of issues generally. The trigger is precisely
the moment you are about to hand something back to him — nothing else. Running
it more widely would replace one tax on him with a larger one on the work.

- If it says **no**: act, and say what you did.
- If it says **yes**: escalate, and carry its reasoning with you.
- If it says **yes for a reason you had not considered**: that is the case this
  rule was built to catch. Say so explicitly when you escalate.

The check costs one cheap invocation. Escalating wrongly costs the maintainer
an interruption and costs the work a stall — a halt he had authorised clearing
sat for three hours, and a corrected page sat published-wrong while it waited
for a ruling he had already delegated.

---

## GRANTED — the orchestrator may do these without asking

- **`git push` to `main`.** Lifted 2026-08-28. The condition is not
  negotiable: **push only what has passed the gates** — `npm test`,
  `npm run build`, `verify-launch`, `verify-design`, `verify-surfaces`,
  `verify-analytics`. A failing gate is a stop, not a warning.
- **`publish` on and off in `data/config.json`**, at the orchestrator's own
  judgment, without asking. Granted 2026-08-29. Turning it **off** needs no
  justification at all; turning it **on** carries the gate bar above.
- **All of `data/config.json`**, at its own judgment, between runs. Broadened
  2026-08-30. An edit that loosens a constraint carries the push bar; an edit
  that tightens one needs no justification.
- **`.claude/settings.json`.** Authorised 2026-09-01, explicitly, to arm the
  shell-token guard.
- **Clearing `HOLD.md` for a halt it has DIAGNOSED.** Standing, and the
  procedure is the whole grant: read the halt, fix the **cause** (not the
  symptom, never the detector), record what happened in artifacts or beads,
  and only then remove the file. A halt that cannot be diagnosed is left
  standing and reported.
- **Deciding and implementing backlog issues**, including editorial rulings.
  Greenlit 2026-08-31 after the maintainer reviewed all 27 `decision`-labelled
  issues and said only four needed him. He has since cleared two of those four.
- **The machine-readable acquisition work** (`k1j`): structured data, IndexNow,
  `llms.txt`, the crawler stance, `catalog.json` as a documented contract.
  Authorised 2026-09-01.
- **Running Desk jobs on `opencode-deepseek` as the Pulse creates them**,
  excluding `machinery` jobs for now. Instructed 2026-09-01, and reaffirmed
  when the orchestrator asked a second time.
- **Spawning subagents**, 1–2 at a time, on whichever model the work warrants.

## NOT GRANTED — these remain the maintainer's alone

- **`bd dolt push`.** The beads remote is a decision he has not made. The `bd`
  CLI prints a hint suggesting it; ignore the hint.
- **`gh pr create` / `gh pr merge`.** Nothing writes to GitHub's API on an
  agent's judgment.
- **`STOP`.** He creates it and he removes it. Unlike `HOLD.md`, this never
  transferred as a standing grant, and the general rule is unchanged.
  ONE SCOPED EXCEPTION HAS BEEN GIVEN AND HAS BEEN USED UP. On 2026-09-05, at
  20:43 UTC, he pre-authorised removal of the `STOP` he had placed for the UI
  freeze — *"I pre-emptively give my authorization to remove the STOP file
  after the handoff is completed and the project needs to resume operation"* —
  granted to both this session and the ui-loop orchestrator, and repeated to
  this session directly. Two conditions, both required, and the wording is the
  grant: the handoff **completed**, and the project **needing to resume**. It
  was exercised on 2026-09-05 after the ui-loop handoff (K33), and it does not
  generalise: the next `STOP` is his again, and asking is the default. Recorded
  here rather than left in a transcript because a grant given in conversation
  is as real as one written down, and this file is where that is checked.
- **`openspec/specs/` and `runners.yml`.** Reserved paths. Author changes under
  `openspec/changes/` instead; the archive step is what writes to `specs/`.
- **`package.json`.** Never edited. If something looks missing, stop and report.
- **Any credential**: the Hugging Face token, Search Console / Bing DNS
  verification, and any API token. Never manipulate credentials on a command
  line, and never print one, including partially.
- **Creating a scheduler for the Desk.** Explicitly declined 2026-09-01: he is
  measuring subscription burn and wants jobs started by hand for now.

## STILL OPEN AND HIS — do not decide these

- `kwj` + `cqv`: re-voice eight seed learn pages, or record their register as
  deliberate.
- `9bu`: policy for unmeasured readership claims.

## STANDING POSITIONS

- **No social media accounts**, and no features assuming one exists — no
  Twitter Card metadata naming a handle, no follow buttons, no platform-tied
  share widgets. Generic Open Graph is fine. Stated as a current position, not
  a permanent rule.
- **Agents make the site findable and citable. They do not go out and represent
  it where a human is expected to be the one speaking.** No agent-posted links
  or comments anywhere, no mass directory submission, no bought links.
- **The predecessor repo `AddictedtoAIdotnet` stays private permanently.**
- **No human judgment in the loop.** When a check cannot be mechanised, it goes
  to a model-run review step with a named rejection reason — never to a person.
  `STOP`, `HOLD.md`, the reserved paths and the maintainer-only operations are
  brakes, not workflow: they exist so a human can HALT the machine, not operate
  it.
- **He does not want to make many decisions.** He has said so directly and more
  than once. Treat an escalation as a cost to him, not a courtesy.

## THE PRECEDENCE RULE

**A maintainer's live instruction outranks any written file, including this
one.** When the two disagree, follow him **and** fix the file. Quoting a
document back at him is the error — these files are a record of his decisions,
not a source of them, and a grant given in conversation is as real as one that
got written down. Deferring to the written rule feels like caution; it is not.
