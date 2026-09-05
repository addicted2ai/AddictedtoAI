---
title: "GitSpawn: a repository can name the program your coding agent runs before you type anything"
date: "2026-09-05"
anchor:
  url: "https://www.manifold.security/blog/ai-coding-agents-git-hijack"
  date: "2026-09-01"
mentions:
  - org/anthropic
  - org/openai
  - org/alibaba-cloud
  - org/spacexai
---

Manifold Security published GitSpawn on 1 September 2026: eight findings across
seven command-line AI coding agents, every one of them the same shape. A
repository's own `.git/config` names a program. The agent runs an ordinary git
command to work out where it is. Git runs the program.

Four of the eight were still live on the day the write-up went out.

## The setting is `core.fsmonitor`, and it is working as designed

`core.fsmonitor` exists so that git on a large repository can ask a helper
process what changed instead of walking every file on disk. Git runs that helper
during an index refresh, and `git status` refreshes the index. So does
`git diff`. Git reads the value out of the repository's own `.git/config`, which
means a directory you did not write supplies the command line.

Agents call exactly those commands at startup, to find out what branch they are
on and what has changed. Manifold gives two samples from different products:
`git status --porcelain=2 --branch` and `git diff --name-only HEAD`. Neither is
strange. Both refresh the index.

The model never enters into it, and neither does the permission system. From the
Manifold write-up: "This is the agent's own code spawning a subprocess to use
git, so the command runs outside the sandbox, without an approval prompt. The
permission model never sees it."

The moment it fires varies by product. On Claude Code and Hermes Agent the
payload runs before the workspace-trust prompt is accepted. On Qwen Code, before
the user has authenticated at all. On Grok Build, on the first keystroke. In
goose it runs while `goose review` collects the diff, which the GitHub advisory
places "before goose contacts a model."

## Cloning is safe. A zip is not.

This is the part the coverage flattens, and it decides who should actually
worry. `git clone` builds a fresh `.git` directory on your machine and never
copies the source repository's local config. Neither does `fetch`, and neither
does `pull`. The hostile setting has to arrive as a file.

So the vector is anything that moves a directory whole instead of cloning it: a
zip, a shared drive, a sync folder, a USB stick. Manifold used a `.zip` for
every proof of concept. OpenAI states the same condition in its own CVE record
for Codex: "An ordinary Git clone does not preserve the source repository's
local .git/config; exploitation requires a repository delivered or copied with
that configuration intact."

Cloning a stranger's GitHub repository and opening it with an agent does not do
this. Unzipping the take-home a candidate emailed you does.

## The versions that matter

| Agent | Affected | Fixed in | Stated by |
|---|---|---|---|
| goose | before 1.44.0 | 1.44.0 | CVE-2026-72718 |
| Codex CLI | 0.102.0–0.130.0 | 0.131.0 | CVE-2026-19592 |
| Codex Desktop (macOS) | 260202.0859–26.513.31313 | 26.519.22136 | CVE-2026-19592 |
| Codex Desktop (Windows) | 26.304.38–26.513.40821 | 26.519.21041 | CVE-2026-19592 |
| Claude Code, `core.fsmonitor` | confirmed on 2.1.193 | 2.1.196 | Manifold |
| Claude Code, `ultrareview` | confirmed on 2.1.252, 1 Sep | nothing published | Manifold |
| Hermes Agent | 0.18.2 through 0.21.0 | commit `f6234d0` | CVE-2026-71963 |
| Qwen Code | confirmed on 0.19.6 and 0.22.3 | nothing published | Manifold |
| Grok Build | confirmed on 0.2.93 and 1.0.13 | nothing published | Manifold |
| Cursor | not stated | patched, version not stated | Manifold |

The Codex ranges are OpenAI's own, from the CVE record it published on
1 September. The Hacker News carries the identical figures, including the
Microsoft Store package fixed in 26.519.2081.0. Manifold's table gives no
version numbers for Codex or Cursor, only that both were reported, both came
back as duplicates of reports another researcher had already filed, and both are
patched.

The second Claude Code finding is the one with no numbers on the right-hand
side. Manifold says it is not `core.fsmonitor` but a different git setting of
the same kind that the review path does not strip, reached by running
`claude ultrareview`, reported 15 July 2026 against 2.1.210 and closed as a
duplicate of an internal ticket. It has withheld which setting while the bug is
open, and no one else has named it either.

## The disputed CVE belongs to Hermes, and it carries a fix nobody reported

MITRE's record for CVE-2026-71963 was published by VulnCheck on 3 September
2026, titled "Hermes Agent 0.18.2 - 0.21.0 RCE via git core.fsmonitor Config
Injection", credited to Francisco Rosales, who wrote the Manifold research. It
scores CVSS 4.0 at 8.6. The Hacker News, checking MITRE on 2 September, reported
finding no published record for that identifier. There was none to find. It
appeared the next day.

The record carries something neither account had. It marks commit
`f6234d00c5d59450adea1d7edd30ad3859375c79` unaffected and links pull request
101483 in `NousResearch/hermes-agent`, titled "GitSpawn RCE no longer executes
from a malicious repo's .git/config". GitHub's API dates that merge 2 September
2026, one day after Manifold published, against a vendor Manifold describes as
six contact attempts across five channels with the private advisory never
triaged.

The fix is on the default branch and not yet in a release. As of 5 September the
newest release the repository lists is `v2026.8.31`, published 31 August, which
predates the merge.

## Neither Claude Code finding is in Anthropic's published advisories

Anthropic's GitHub security advisory list for `claude-code` held 30 records when
read on 5 September 2026. Neither GitSpawn finding is among them, not the
`core.fsmonitor` startup path that 2.1.196 closed on 29 June, and not the
`ultrareview` path. The Hacker News reported the same absence on 2 September.

One record on that list is easy to mistake for this one, and is a different bug.
CVE-2026-55607 does name fsmonitor: worktree handling that allowed a worktree
named `.git`, then "symlink manipulation and git fsmonitor execution during
worktree operations" to overwrite files such as `.zshenv` outside the seatbelt
sandbox. It affects 2.1.38 up to 2.1.163 and was fixed in 2.1.163, published
4 June, three weeks before the release Manifold confirmed the startup bug on.
Its advisory says exploitation "required the user to clone a malicious
repository" — the one delivery route GitSpawn cannot use.

The shape is not new to that list, though. Five other records on it describe a
repository's own files or settings reaching execution before or around the trust
dialog:

- CVE-2025-59536, 3 October 2025: "Command execution prior to Claude Code startup trust dialog"
- CVE-2025-65099, 19 November 2025: the same title again
- CVE-2026-21852, 20 January 2026: "Malicious repo configuration can trigger data leakage via environment configuration used before trust confirmation"
- CVE-2026-33068, 18 March 2026: "Workspace Trust Dialog Bypass via Repo-Controlled Settings File"
- CVE-2026-40068, 24 April 2026: "Trust Dialog Bypass via Git Worktree Spoofing Allows Arbitrary Code Execution"

## Four days have already moved this

Every status above is Manifold's on the day it published. Read against the
package registries and GitHub on 5 September 2026, the picture has already
shifted, and it will shift again:

- Claude Code's npm `latest` is 2.1.261, published 4 September. Manifold's last
  confirmation of the `ultrareview` path was against 2.1.252, published
  31 August. Five releases have gone out since, and nobody has said whether any
  of them closed it.
- Qwen Code published 0.23.0 on 3 September, after the 0.22.3 that Manifold
  re-tested. No source states whether it fixes the finding. Alibaba's security
  response centre accepted the report on 7 July, per Manifold.
- Codex CLI's `latest` is 0.153.4. Anything at or above 0.131.0 has OpenAI's
  fix.
- Hermes Agent has a merged fix and no release containing it.
- Grok Build's last confirmation is 1.0.13 on 1 September. Manifold reports xAI
  closed an earlier report of the same class as informative on 1 July and closed
  Manifold's 14 July report as a duplicate of that one.

## Read the file, not the one key

If a repository arrived as files rather than through `git clone`, read its
`.git/config` before you point an agent at the directory. Manifold's own advice
is one sentence: "Any setting that names a program can run it."

Running `git config --get core.fsmonitor` inside such a directory answers for
that one key and executes nothing on its own. It is a spot check rather than the
check. `core.fsmonitor` is not the only setting of its kind, which is the whole
reason one of the eight findings has no key named in public. The Hacker News
suggests looking for `core.hooksPath` and `attr.tree` beside a clean or process
filter as well.

One piece of published advice does not do what it says. The Hacker News lists
"Set `git config --global core.fsmonitor false` to disable the setting by
default." Git resolves configuration local over global, so a repository's own
value wins. Set to `false` in a global config file and to a marker string in a
scratch repository's `.git/config`, git 2.40.0 returns the marker, and
`git config --show-origin` names `.git/config` as where it came from. The global
setting never gets a vote. Reading the file still works.

The uncomfortable part is not that seven products shared a bug. It is where they
shared it. The vulnerable code runs before the agent has any instructions, in
the subprocess it spawns to work out where it is, at a moment when there is
nothing yet for a user to approve. Every guardrail these products advertise sits
above that line.

Every source below was retrieved on 5 September 2026. The
[Manifold Security write-up](https://www.manifold.security/blog/ai-coding-agents-git-hijack)
was published 1 September 2026 and is quoted here from its HTML rather than a
summary of it.
[The Hacker News](https://thehackernews.com/2026/09/malicious-git-configs-can-make-claude.html)
published its account on 2 September 2026. The CVE text comes from MITRE's CVE
Services records for
[CVE-2026-71963](https://cveawg.mitre.org/api/cve/CVE-2026-71963),
[CVE-2026-72718](https://cveawg.mitre.org/api/cve/CVE-2026-72718),
[CVE-2026-19592](https://cveawg.mitre.org/api/cve/CVE-2026-19592) and
[CVE-2026-55607](https://cveawg.mitre.org/api/cve/CVE-2026-55607), the version
and release dates from the npm registry entries for `@anthropic-ai/claude-code`,
`@qwen-code/qwen-code` and `@openai/codex`, the advisory count from Anthropic's
[published advisories for `claude-code`](https://github.com/anthropics/claude-code/security/advisories),
and the merge date from the
[Hermes Agent patch commit](https://github.com/NousResearch/hermes-agent/commit/f6234d00c5d59450adea1d7edd30ad3859375c79).
No source reports exploitation of any of these findings, and The Hacker News
reports finding none of the CVEs in CISA's Known Exploited Vulnerabilities
catalog on 2 September.
