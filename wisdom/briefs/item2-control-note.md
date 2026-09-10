# PREREQUISITE FINDING FOR PHASE 1 ITEM 2 — the named wild control does not exist

Measured 2026-09-10 06:20 local, before writing item 2's brief.

## What the plan names

§3.2 of `wisdom/README.md` specifies, for **2b** (the brief generator reconciling
a brief against every imperative in its source issue):

> **For 2b the wild control is x2jl itself**: the gates brief must be refused for
> the requirement it dropped without any truncation present.

## What is actually available

**THE GATES BRIEF IS NOT RECOVERABLE.** Searched, all of it enumerated rather
than sampled:

- `D:/addictedtoai-worktrees/fleet4-gates/.job/` — **the directory does not
  exist**; the worktree survived and the job envelope did not.
- `data/ledger.jsonl` — **0 occurrences** of `x2jl`.
- `git log --all -S 'x2jl'` — four commits, all of them **prose documents**
  (`wisdom/README.md`, the openspec change, `FULL-MEM-LOG.md` twice). None is a
  brief.
- `git log --all --diff-filter=A -- '*/.job/brief.md'` — **empty. No job brief
  has ever been committed to this repository**, by design: the job envelope is
  scratch, and the Desk's contract is one written prompt in, files out.

So the artifact the plan points at is gone, and it was gone before the plan named
it. **This is the same defect the plan's own Phase 0 exists to fix** — a proposal
naming a host that is not in the repository — appearing one item further down the
list it produced.

## What IS wild, and it is the half that matters

**The `x2jl` bead is intact and readable** (`bd show addictedtoai-x2jl`), and the
bead is **the source of the imperatives**, not the brief. The defect under test is
a *reconciliation failure between a brief and its source issue*, so:

- **the SOURCE is wild** — real bead text, real numbered requirements, and the
  real prose imperative sitting among them that got skipped for being prose
  rather than an enumerated item;
- **the BRIEF is a constructed vehicle**, because no other kind exists.

That division is defensible and must be **stated rather than glossed**. The rule
it has to survive is this project's own: *inventing the domain that satisfies a
claim proves the domain, not the property.* Here the domain — the shape of a real
issue whose fourth requirement is prose — is **not** invented; it is transcribed
from a bead nobody wrote for this purpose. The vehicle is invented, and a vehicle
always is.

**What must NOT happen** is a brief claiming a wild control it does not have.
`arch-timeline-note-01.md:127` is the wild record of the loss — *"x2jl fourth
requirement missed with no truncation (shape of reading — numbered list vs prose
imperative)"* — and it is contemporaneous evidence that the instance was real,
which is worth more than a reconstructed brief pretending to be the original.

## Consequence for the brief

Item 2's brief must:

1. **Say the gates brief is unrecoverable** and name what was searched, so nobody
   spends the round looking for it.
2. **Point the control at the bead**, and require that the fixture transcribe the
   bead's requirement structure rather than paraphrase it.
3. **Require the author to state, in the report, which half of the control is
   wild and which is constructed.** A control whose provenance is not stated gets
   read as wild by the next reader — and this document exists because that
   already happened once, one item up the same list.

**2a is unaffected**: its controls are the 1.17-vs-1.43 script shape and the
title-only store scan, both of which are shapes rather than artifacts and can be
written from the note's description.

**2a has a separate blocker that is not technical:** its primary host is a
command guard beside the existing `PreToolUse` shell-token hook, which lives in
the maintainer's `~/.claude/settings.json` and not in this repository. That is
his file. It is raised with him rather than edited.
