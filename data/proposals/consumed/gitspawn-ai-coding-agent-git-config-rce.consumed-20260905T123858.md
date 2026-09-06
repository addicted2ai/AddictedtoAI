---
date: 2026-09-05
slug: gitspawn-ai-coding-agent-git-config-rce
type: post
summary: >
  A post on GitSpawn, the vulnerability class Manifold Security disclosed on
  2026-09-02: a repository's own `.git/config` can name a program that an AI
  coding agent executes during ordinary startup context-gathering, before any
  approval prompt and — on Claude Code — before the workspace-trust prompt. The
  primary vector is git's `core.fsmonitor`, a helper binary git runs during the
  index refresh that `git status` and `git diff` trigger; the agent never
  decides to run it, git does. Eight agents were reported affected (Claude Code,
  OpenAI Codex CLI and Desktop, Cursor, goose, Hermes Agent, Qwen Code, Grok
  Build); four fixed, and four were still unpatched at disclosure — including a
  second Claude Code path through `claude ultrareview` that Manifold is
  deliberately not naming while it is open. The post's job is to state the
  mechanism precisely, give readers the version numbers that matter, and resolve
  a CVE attribution the two available accounts disagree about.
evidence: >
  Manifold Security, "GitSpawn: A Single Flaw Lets Untrusted Repos Run Code in
  Claude Code, Codex, Cursor, and Grok", fetched 2026-09-05 —
  https://www.manifold.security/blog/ai-coding-agents-git-hijack — the primary
  disclosure. Describes the class as "arbitrary code execution as the developer,
  outside the sandbox, with no approval prompt"; names `core.fsmonitor` as the
  primary vector and a second, deliberately unnamed config key on Claude Code's
  ultrareview path; states both execute "on the host, with the user's
  privileges, before any approval prompt". Per-agent table as fetched: Claude
  Code fsmonitor reported 26 Jun 2026, patched 2.1.196; Claude Code ultrareview
  reported 15 Jul 2026, UNPATCHED at 2.1.252; goose reported 13 Jul, patched
  1.44.0 (CVE-2026-72718); Hermes Agent reported 20 Jul, unpatched 0.21.0
  (CVE-2026-71963 per this table); Qwen Code reported 7 Jul, unpatched 0.22.3;
  Grok Build reported 14 Jul, unpatched 1.0.13; OpenAI Codex reported 20 Jul,
  patched; Cursor reported 8 Jul, patched. Quote on startup behaviour: "Open a
  folder with Claude Code and it runs `git status` before you type anything.
  Before the workspace-trust prompt."

  The Hacker News, "Malicious .git Configs Can Make Claude, Codex, Cursor, and
  Other AI Agents Run Attacker Code", published 2026-09-02, fetched 2026-09-05 —
  https://thehackernews.com/2026/09/malicious-git-configs-can-make-claude.html
  — corroborates the mechanism and adds version ranges (Codex CLI 0.102.0–0.130.0
  fixed in 0.131.0; Codex Desktop macOS fixed 26.519.22136, Windows fixed
  26.519.21041) and vendor-response detail (Nous Research left the Hermes
  advisory untriaged after six contact attempts across five channels; Alibaba
  accepted the Qwen report 7 Jul with no fix; xAI closed an earlier report as
  informative 1 Jul and marked Manifold's 14 Jul report a duplicate; Anthropic
  published an advisory for CVE-2026-55607 covering fsmonitor during worktree
  operations). It lists CVE-2026-19592 for OpenAI Codex.

  KNOWN DISCREPANCY, to be resolved before publication rather than papered over:
  the Manifold table as extracted attributes CVE-2026-71963 to Hermes Agent; The
  Hacker News attributes CVE-2026-71963 to Grok Build and notes it was
  unconfirmed in the MITRE CVE List as of 2 Sep. Both readings came through
  WebFetch's extractor, which this repository has recorded as unreliable in both
  directions. The authoring job must read the raw HTML of the Manifold post and
  check each CVE against MITRE/NVD directly.
expires: 2026-09-12
proposed_by_job: j-20260905-05
proposed_by_type: scout
---

# GitSpawn: an untrusted repo can run code in your coding agent before you type anything

## Why now

This is the rare security story where this site's readers are the affected
population, the exposure is live, and the remedy is a version number they can
check in under a minute. Four of the eight reported agents were still unpatched
at disclosure three days ago, and one of them is a second path in Claude Code —
the tool a large share of this site's audience has open right now. The window in
which "check your version" is useful advice is measured in days: it closes when
the remaining vendors ship, and the post is worth much less afterwards.

The mechanism is also the interesting part, and it is being flattened in the
secondary coverage into "AI agents run malicious code". What actually happens is
narrower and more alarming: the agent does not decide to run anything. It runs
`git status` to orient itself, git reads `core.fsmonitor` out of the repository's
own `.git/config`, and git executes the named program. Every trust boundary the
agent vendors built — approval prompts, sandboxes, workspace trust — sits above
the layer where the execution happens. That is a story about where the trust
boundary was drawn, not about model behaviour, and this site is better placed
than most to say so precisely.

## Would-send test

"Opening a folder in Claude Code runs `git status` before the workspace-trust
prompt — and the folder gets to say what `git status` executes." Anyone who has
ever unzipped a repo from a stranger, reviewed a candidate's take-home, or
opened a cloned dependency sends that to a colleague with no further
explanation. It passes cleanly.

## True, checkable, current

Named CVEs, named versions, a named research team, a dated disclosure, and a
primary write-up that is itself the source rather than a summary of one. Every
load-bearing claim can be checked against MITRE, the vendors' advisories, and
the release notes for the version numbers involved.

## What the job would produce (done-when)

- The post is anchored on the Manifold Security disclosure, fetched and quoted
  from the **raw HTML** rather than an extractor summary, with the retrieval
  date stated.
- The mechanism is stated at the right layer: `core.fsmonitor` is a git feature,
  git executes the helper during index refresh, and the agent's approval prompt
  and sandbox both sit above that layer. The post does not say "the model ran
  malicious code".
- The affected/fixed table is reproduced with agent, affected version, fixed
  version, and patched/unpatched status, each attributed to the source that
  states it — Manifold's table and The Hacker News's version ranges are
  distinguished where they differ.
- **The CVE attribution discrepancy is resolved by direct check.**
  CVE-2026-71963 is attributed to Hermes Agent by one account and Grok Build by
  the other; the post either states which is correct with a MITRE/NVD citation,
  or states plainly that the identifier is unconfirmed and which account said
  what. It does not silently pick one.
- The still-unpatched set is named as of a stated date, with the explicit caveat
  that it is a snapshot — a reader arriving later must be told to re-check.
- The second Claude Code path is described as Manifold describes it: reported
  15 July, open at 2.1.252, with the config key withheld while unpatched. The
  post does not speculate about which key it is.
- Anthropic's CVE-2026-55607 advisory is distinguished from the ultrareview
  finding rather than conflated with it — per The Hacker News these are not the
  same issue, and that distinction is the easiest error to make here.
- Vendor-response claims (Nous Research untriaged, Alibaba no fix, xAI duplicate
  closure) are attributed to The Hacker News as reporting, not asserted as
  independently confirmed fact.
- The reader-actionable line is explicit and early: the fixed version numbers,
  and that `git config --get core.fsmonitor` in an untrusted clone is the
  one-command check.


---

## Consumed: this candidate produced merged work

- date: 2026-09-05
- job: j-20260905-07 (post)
- merged as: `b043081d862dbe221fd89be3f28e6a803cce336e`
- produced: `content/blog/gitspawn-git-config-code-execution-coding-agents.md`
- was: `gitspawn-ai-coding-agent-git-config-rce.md` (slug `gitspawn-ai-coding-agent-git-config-rce`)

A proposal that has been written, reviewed and merged is finished work. It was left selectable, and the run after the first post selected it again — which would have rewritten the same piece on every run until its `expires:` arrived. Retiring it is mechanical: no model was invoked and no inference was spent.

`data/proposals/consumed/` is a record, never a block. This slug does not feed the rejection index, so the subject may be proposed again — being written about once is not a reason it may never be written about again.

---

## Correction: three carried findings, verified and answered (2026-09-06)

Three findings were carried against this candidate by the reviewer of
`j-20260905-05` (`data/carried/j-20260905-05-carry-1.md`, `-2`, `-3`). All
three were re-verified on 2026-09-06 against the primary documents, fetched
as raw bytes with `node fetch` and searched for literal substrings — not
through an extractor. All three are correct, and the post that was written
from this candidate,
`content/blog/gitspawn-git-config-code-execution-coding-agents.md`, already
states each of them correctly. The candidate's own text above is left as it
was filed; this section records what it got wrong so the file is not read as
a source of those three claims.

1. **Disclosure date.** The summary above says "disclosed on 2026-09-02" and
   the why-now says "at disclosure three days ago". Manifold's post
   (https://www.manifold.security/blog/ai-coding-agents-git-hijack, HTTP 200,
   487,923 bytes on 2026-09-06) carries a byline "Sep 1, 2026" and a JSON-LD
   `"datePublished": "2026-09-01T00:00:00.000Z"`. 2026-09-02 is The Hacker
   News's publication date ("Sep 02, 2026" on its own page), not the
   disclosure date. The post says "published GitSpawn on 1 September 2026".

2. **"Eight agents were reported affected."** Manifold's own TLDR reads
   "Eight findings across seven agents. Four remain unpatched at
   publication." Its summary table lists Claude Code twice — the
   `core.fsmonitor` path (patched 2.1.196) and the ultrareview path
   (unpatched, confirmed 2.1.252). Eight findings, seven agents. The post
   says "eight findings across seven command-line AI coding agents".

3. **The CVE-2026-71963 attribution.** The KNOWN DISCREPANCY block above says
   The Hacker News attributes the identifier to Grok Build. It does not: in
   the raw HTML the identifier occurs once, inside the Hermes Agent passage —
   "VulnCheck assigned CVE-2026-71963, according to Manifold" — which is the
   same attribution Manifold's own text and table make ("CVE-2026-71963,
   assigned by VulnCheck ... Still unpatched", Hermes row). The two accounts
   agree; the disagreement was an artifact of the extractor, exactly as the
   block itself warned might be the case. The post resolves the identifier
   against MITRE rather than asserting a conflict between outlets.
