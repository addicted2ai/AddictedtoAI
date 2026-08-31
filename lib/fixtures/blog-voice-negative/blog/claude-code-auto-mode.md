---
title: "claude-code-auto-mode"
date: "2026-08-14"
mentions: []
---

Posted
·
Facts verified
·
Subscribe via RSS
·
Back to the blog

On 7 August, Anthropic announced that from 14 August Claude Code’s
default permission mode on Pro, Max, and Team plans becomes
auto mode :
instead of asking before every tool call, calls are routed through a
classifier that blocks actions it considers irreversible, destructive,
or aimed outside your environment. Enterprise and API access stay
opt-in for now — Claude Enterprise, the Claude API, Claude
Platform on AWS, Amazon Bedrock, Google Cloud’s Agent Platform,
and Microsoft Foundry — with Anthropic planning to make it the
default across all of those “in the coming month.” The
small per-tool-call cost of the classifier was dropped for Pro, Max,
and Team, effective immediately.

The interesting part of the announcement is not the change itself. It
is what Anthropic’s own data says about the thing the classifier
replaces. “Data suggests that manual review can become
habitual,” the company writes: users approve 97% of permission
prompts in Claude Code. When Claude presents a plan for approval,
users reject 39% of them. For individual permission requests, the
rejection rate is 3%.

## The human gate was not working the way anyone assumed

Anthropic’s evidence for that claim is the part of this
announcement that is not a press release. Three figures, all the
company’s own:

Settings telemetry, as of June 2026: 49.5% of
active CLI users have manually created a Bash allow-rule. 5% allow
any shell command outright, and another 43% have interpreter rules
like Bash(python:*) or Bash(node:*) that
are, in Anthropic’s words, “essentially equivalent in
practice.” 62% of users have used bypassPermissions
or clicked “don’t ask again” on Bash, and 25% of
interactive sessions start in bypass-permissions mode.

A controlled study: Anthropic hired 1,053 paid
testers through a research vendor for a coding study. Partway
through each session, one permission prompt was swapped for a
clearly dangerous command — only the text changed, and nothing
dangerous actually ran. The testers caught it 13.6% of the time
(143 of 1,053). Auto mode blocked 89% of the same commands (937 of
1,053). Head to head, auto mode blocked 800 commands that a human
approved; humans blocked only 6 that auto mode allowed. The human
figure decays with session length — about 17% early in a
session, dropping to roughly 5% after 50 or more prior prompts
— while auto mode’s block rate stayed flat.

Real-usage analysis: on sessions Anthropic’s
safety pipeline flagged between May and June 2026, drawn only from
accounts that opted in to data use, Anthropic re-graded each one.
At production-level severity, 6.3% of manually approved sessions
contained a harmful action the user hadn’t explicitly asked
for, versus 2.4% of auto mode sessions — serious unintended
harm appeared “more than twice as often” under manual
approval.

Read together, these say something specific and uncomfortable: the
permission prompt was a ritual. People click through it, and the
clicking gets worse the longer a session runs. Anthropic’s
argument — that a classifier blocking 89% of clearly dangerous
commands is safer than a human who approves 97% of everything —
is hard to dismiss on the company’s own data.

## What the numbers do not cover

The honest version of this story is what the numbers don’t
claim. All of them are Anthropic’s own: the tester study was run
by a vendor Anthropic paid; the severity analysis is Anthropic grading
its own flagged sessions; the third-party evaluation below was
commissioned by Anthropic. Nothing here has been independently
measured, and until it has, every figure in this story is best treated
as vendor-commissioned data — including the ones that flatter
the vendor’s product.

Three limits are worth carrying forward, because Anthropic states them
itself. First, the 11% auto mode still missed: of the same 1,053
clearly dangerous commands, 937 were blocked and 116 were not. The
company says plainly that auto mode “relies on classification
systems and therefore does not eliminate risk,” and recommends
reviewing high-stakes changes to production infrastructure yourself.

Second, the adversarial set. Anthropic worked with Apollo Research in
a two-week find-fix-verify engagement that injected synthetic attacks
into real coding trajectories. After hardening, the classifier’s
miss rate across the shared and held-out attack sets fell from 12% to
7%. That 7% is measured against attacks built to break the classifier
— and Anthropic says it “should not be taken as the miss
rate on real traffic.”

Third, the comparison structure. The 25%-more-PRs figure — auto
mode users among Teams & Enterprise adopters ship about 25% more
pull requests — and the severity analysis are correlations
Anthropic asserts, not controlled designs it publishes. Both also
measure adoption among teams that chose auto mode, which is not the
same population as teams that didn’t. Anthropic also reports
that Claude now works 9x longer between interruptions across all
Claude Code usage, which is a productivity claim, not a safety one.

## The benchmark that produced the zero

The headline number — none of 720 attack attempts succeeding
against Claude’s models in auto mode — comes from an
evaluation Anthropic commissioned from Trajectory Labs, testing the
latest publicly available Claude Code and Codex as of 17 July 2026.
It ran 72 indirect prompt-injection scenarios, held out from
Anthropic, ten times each. The attacks were optimized against Claude
Opus 4.7, which is not in the reported set, so every model in the
evaluation faced them as unseen attacks. The results:

Fable 5, Opus 5, and Sonnet 5 running auto mode: 0 of 720 attacks
succeeded.

GPT-5.6 Sol running Codex’s Auto-review mode: 5.83% succeeded.

GPT-5.6 Sol running Codex’s Full Access mode: 19.03% succeeded.

That is a striking result, and it comes with methodology notes
Anthropic itself publishes, which are the part a reader should keep:

The evaluation is Anthropic’s and the partner is
Anthropic’s. The harness was Trajectory’s own browser
integration — a thin MCP wrapper around Chrome APIs — so
the results “should be viewed as a measurement of the
underlying model, rather than the complete set of
safeguards.” The first-party Chrome extensions Anthropic and
OpenAI ship were not tested.

The OpenAI numbers are as of a specific snapshot: Codex v0.144.5,
with GPT-5.6 Sol run at max reasoning effort, while all Claude
models ran at high effort. Anthropic’s footnote is blunt:
“OpenAI released a new version of Auto-review last week that
could change the results.”

For comparison, Anthropic reports 0.09% attack success against its
own latest models running in bypassPermissions mode
without additional safeguards — which is its way of saying the
model itself resists injection, not just the classifier.

## Even Anthropic’s customers keep a human on the highest-stakes work

The production case studies Anthropic published alongside the
announcement are the least press-release-shaped part of it, because
they show teams deliberately stepping around the classifier for the
actions that matter most. Gusto’s Chad Kunsman switches out of
auto mode when a session touches production infrastructure —
Terraform, AWS, direct calls against live APIs — and verifies
each tool call by hand: “Ultimately, you’re still
responsible for what happens.” Nuro’s Kai Zhou runs auto
mode for all of his coding work, but switches back to interactive mode
when Claude Code reviews a pull request on his behalf. Gusto routes
its MCP traffic through a governed proxy layer with tool guards and
prompt inspection before auto mode ever weighs in; Nuro denies
recursive deletes outright in settings; Garner Health configures the
classifier never to approve actions that communicate with other
people. Anthropic’s own guidance ends on the same note: auto
mode does not eliminate risk, and high-stakes production changes
should still be reviewed by a human.

## What changes on 14 August, and what to do if you don’t want it

On Pro, Max, and Team plans, new sessions start in auto mode from 14
August. If you’ve already set a different default yourself,
nothing changes unless you accept a one-time prompt offering to
switch; a pinned default is untouched. Enterprise and API access are
unchanged for now.

To switch modes, press Shift+Tab in the CLI or use the mode
dropdown on the desktop app. Admins can pin an org-wide default with
defaultMode in managed settings, or turn auto mode off
entirely with disableAutoMode . When the classifier blocks
something, Claude usually finds a safer path on its own or asks you;
after three blocks in a row, or twenty across a session, Claude Code
falls back to manual approvals. Permission rules you’ve written
still fire before the classifier, except allow rules broad enough to
grant arbitrary code execution — those are set aside while auto
mode is on, and reapplied the moment you leave it.

## The takeaway

The change itself is not optional for most paying users: on 14 August
the default moves, and the question is whether you trust a classifier
you don’t see to be the gate. Anthropic’s data — all
vendor-commissioned, all stated with the caveats above — says
the human gate was a ritual that caught 13.6% of clearly dangerous
commands, that approval fatigue made it worse as sessions stretched
on, and that a classifier blocked 89% of the same commands and every
one of 720 attempts in a narrow, held-out prompt-injection benchmark.
The number a skeptic should keep is the one Anthropic does not
dispute: auto mode missed 11% of the clearly dangerous commands in its
own study. No independent party has measured any of this, and even the
vendor’s own customers keep a human in the loop for the work
they would least want to see go wrong.

## Sources

All retrieved 2026-08-11. Anthropic,

“Auto mode is now the default in Claude Code for Pro, Max, and
Team plans”

(7 August 2026), and Anthropic,

“Running auto mode in production”

(7 August 2026). Every figure above is Anthropic’s own reported
data on its own product: the tester study and the Trajectory Labs
evaluation were commissioned by Anthropic, the severity analysis
grades Anthropic’s own flagged sessions, and the methodology
caveats quoted are Anthropic’s own statements.
