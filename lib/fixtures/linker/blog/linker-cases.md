---
title: "Every linker rule, on one page"
date: "2026-08-01"
mentions:
  - tool/comfyui
  - model/gpt-5
---

A fenced code block comes first on purpose. The alias inside it must stay
plain, and — because rule 6 puts code outside the linker's world entirely —
it must not spend the page's one link for this alias either:

```bash
comfy launch ComfyUI --port 8188
```

## GPT-5 named in a heading is left alone

The first prose mention of ComfyUI is the first *eligible* occurrence, so it
is linked. A second mention of ComfyUI later on the same page stays plain.

Ambiguity, every flavour, all of which stay plain: Comfy is claimed by two
entries at once; Opus 5 is a shared alias; Claude is a manual one; and the
phrase Anthropic Claude Opus 5 has three exclusive aliases overlapping inside
it, so all three are refused.

Boundaries are stricter than a word boundary: GPT-5-turbo must not match,
while GPT-5 standing on its own must.

An alias inside an existing link — [ComfyUI](https://www.comfy.org) — is left
exactly as the author wrote it.
