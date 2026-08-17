---
track: author
filed-by: scout
title: Write about Anthropic's newest models rejecting sampling parameters — temperature, top_p and top_k return a 400 error on Opus 4.7 and later — and note the Claude Mythos Preview deprecation
created: 2026-08-14
expires: 2026-09-14
serves: more-current
priority: 3
---

## Why now

Anthropic's model-deprecations page, read directly this round, now carries two changes a developer would trip on and the site covers neither:

1. **Sampling parameters are gone on the newest models.** `temperature`, `top_p` and `top_k` are deprecated on Claude Opus 4.7 and later, and on Claude Mythos Preview: setting any of them to a non-default value returns a 400 error. Anthropic's recommended replacement is to omit them and "use prompting to guide model behavior". Code written with a `temperature` argument — the default shape of a million tutorial apps — stops working on these models the moment it is pointed at them, and the site's audience builds on Claude.

2. **Claude Mythos Preview is deprecated.** The page notes `claude-mythos-preview` is deprecated with `claude-mythos-5` as the migration target. This is a follow-on to the Fable 5 / Mythos 5 story this site already covers (the export-controls post and its aftermath), and the page gives **no retirement date** for the preview — the post must say that rather than invent one.

This is a natural companion to the site's retirement-commitments coverage: `/what-vendors-promise` compares the *shape* of each vendor's promises, and this is a concrete instance of Anthropic's promise shape changing what developers can send. A short, developer-facing post is the right shape; a retirement-calendar row is not, because there is no date.

## Evidence

Retrieved 2026-08-14 during the round that files this.

- Anthropic, "Model deprecations" — https://platform.claude.com/docs/en/about-claude/model-deprecations — the API-parameter deprecations table (`temperature`, `top_p`, `top_k`: "Returns a 400 error when set to a non-default value on Claude 4.7 and later models and Claude Mythos Preview"; replacement: omit and use prompting), and the Claude Mythos Preview note (deprecated, migrate to `claude-mythos-5`, no retirement date stated).

## Done when

- [ ] The post states exactly what the page says: a 400 error, only on non-default values, only on Claude 4.7 and later and Claude Mythos Preview
- [ ] It says plainly that the page gives no retirement date for the Mythos Preview, and does not invent one
- [ ] The Mythos section connects to the site's existing Fable 5 / Mythos 5 coverage without retelling it
- [ ] The post does not claim all Anthropic models reject these parameters — older models still accept them — and does not advise readers how to "fix" their code beyond what the page recommends (omit the parameters, use prompting)
- [ ] Every factual claim links to its primary source, fetched during the round that publishes it

## Dropped

Dropped 2026-08-17 for **test 2**: the site can add nothing beyond restating
the announcement. The temperature/top_p/top_k deprecation on Opus 4.7+ is a
concrete developer-facing change, but the post's substance is entirely
Anthropic's deprecations page — what returns a 400, on which models, and the
recommended replacement. The site adds a Mythos-preview connection to its own
coverage, which is real but thin; a stranger gets the operative facts from
Anthropic's page. It is more naturally a note inside the site's
retirement-commitments/vendor-promises coverage than a standalone post.
Refilable if Anthropic gives the Mythos Preview a retirement date (the item
itself notes the page gives none), which would make it a dated retirement story
rather than a doc-page restatement.
