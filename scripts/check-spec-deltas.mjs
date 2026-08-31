#!/usr/bin/env node
/**
 * check-spec-deltas.mjs — the pre-archive check on spec deltas (beads
 * `addictedtoai-vl9`).
 *
 * ## What this exists to stop
 *
 * `openspec archive <change>` takes the change's `specs/<capability>/spec.md`
 * delta and merges it into `openspec/specs/<capability>/spec.md` — **the
 * constitution, a reserved path, and a one-way door**. Nothing in that
 * operation reads the world the delta describes, and nothing reads the OTHER
 * changes waiting to be archived. Two failures observed on 2026-08-31, within
 * hours of the first archives ever performed here:
 *
 *  - A `MODIFIED` block replaces the **whole** requirement body. One was
 *    written with a change-relative preamble ("Amended in one clause only… the
 *    sentence repealed below…") and the archive wrote that narration into the
 *    constitution, citing a sentence that no longer existed anywhere. Seven
 *    older instances of the same wart are already in `openspec/specs/`
 *    (`addictedtoai-n2g`).
 *  - Two unarchived changes modifying the same requirement heading is
 *    last-writer-wins, silently. `openspec validate` **cannot** see it: it
 *    validates one change at a time. That collision was avoided by hand, and
 *    the change's own tasks file had enumerated two of the three live changes —
 *    so the check passed by luck before it passed by measurement.
 *
 * ## Why it runs in the prebuild, and not "at archive time"
 *
 * `openspec archive` is a third-party CLI with no hook. The only mechanism
 * available is to make the defect impossible to carry in a merged tree: every
 * merged change passes `npm run build`, and `npm run build` runs this file. A
 * delta that would poison the constitution therefore fails the build the day it
 * is authored, days before anyone types `openspec archive`. A standalone
 * `node scripts/check-spec-deltas.mjs --strict` is the belt for the moment of
 * archiving; the build step is the braces, and the braces are the mechanism.
 *
 * ## What it reads, and what it deliberately does not
 *
 * Only the requirement blocks — the `### Requirement:` bodies under
 * `## ADDED Requirements` and `## MODIFIED Requirements`. That is not a
 * shortcut, it is the merge's own boundary, read out of
 * `@fission-ai/openspec`'s `buildUpdatedSpec`: the rebuilt spec is composed of
 * the TARGET's title, Purpose and section preamble plus the delta's requirement
 * blocks. **A delta file's preamble is never archived.** So rationale about why
 * an edit is being made belongs there, above `## ADDED`/`## MODIFIED`, and this
 * check must not complain about it.
 *
 * It reads the **live** specs, never the archived copies under
 * `openspec/changes/archive/`. Those are a record of what a change said when it
 * was archived; the constitution and the archive are allowed to differ, and
 * reconciling them would falsify the record (`addictedtoai-vl9`).
 *
 * ## What it refuses, and what it merely says
 *
 * Refusals (they fail the build):
 *
 *  - `dangling-modified` / `dangling-renamed` — the heading resolves to no
 *    requirement in the live spec and to no `ADDED` heading in any other
 *    unarchived change. `openspec` aborts on these too, but only once the
 *    archive is already running; this moves the same answer days earlier, and
 *    it can see the cross-change resolution `openspec` structurally cannot.
 *  - `dangling-removed` — same shape, and this one `openspec` does **not**
 *    catch: an exactly-unmatched `REMOVED` heading only warns there
 *    ("treating it as already removed") and the archive reports success while
 *    the requirement stays in the constitution. Read out of `specs-apply.js`,
 *    not guessed.
 *
 * Warnings (they print, named, and the build continues):
 *
 *  - `collision` — two unarchived changes touch the same requirement. A
 *    collision is a property of a SET of changes, not of any one delta:
 *    failing the build would punish whichever change happens to build next for
 *    a conflict neither one owns alone, and there is a resolution — reconcile,
 *    then archive in order — that needs no edit to either file. Under
 *    `--strict` it is a refusal, because at the moment of archiving
 *    last-writer-wins is about to actually execute.
 *  - `archive-order` — a heading that resolves only through another live
 *    change's `ADDED`. Legitimate, but the order is now load-bearing, so the
 *    message names it.
 *  - `narration` — change-relative narration in a body that is about to become
 *    permanent. See NARRATION_MARKERS for why this warns rather than fails.
 *  - `stale-id` — a backticked identifier or path in a requirement body that
 *    appears nowhere in the source tree. Advisory by the issue's own
 *    instruction: *"a delta may legitimately name something not yet built,
 *    which is the normal case for a change that has not been executed"*. It
 *    stays a warning even under `--strict` for that reason.
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

import { Diagnostics } from '../lib/errors.mjs';

/* ── parsing: a faithful re-reading of openspec's own delta reader ───────── */

/**
 * Which lines sit inside a fenced code block, so a `### Requirement:` written
 * inside an example is not read as a heading. Mirrors openspec's
 * `buildCodeFenceMask`; a fence opens on ``` or ~~~ and closes on the same
 * marker.
 */
export function buildFenceMask(lines) {
  const mask = new Array(lines.length).fill(false);
  let fence = null;
  for (let i = 0; i < lines.length; i += 1) {
    const m = /^ {0,3}(`{3,}|~{3,})/.exec(lines[i]);
    if (fence === null) {
      if (m) {
        fence = m[1][0];
        mask[i] = true;
      }
    } else {
      mask[i] = true;
      if (m && m[1][0] === fence) fence = null;
    }
  }
  return mask;
}

const REQUIREMENT_HEADER = /^###\s*Requirement:\s*(.+?)\s*$/i;

/** openspec matches requirement names exactly; this fold is for typo hints only. */
export const foldName = (name) => String(name).trim().toLowerCase().replace(/\s+/g, ' ');

function splitLines(text) {
  return String(text).replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
}

/**
 * Requirement blocks in a `## …` section body. A block runs from its own
 * header to the next requirement header or the next `## ` — which is why a
 * MODIFIED block replaces the whole body and why a stray paragraph at the top
 * of one lands in the constitution.
 */
function blocksIn(lines, mask, offset) {
  const isReq = (i) => !mask[i] && REQUIREMENT_HEADER.test(lines[i]);
  const isTop = (i) => !mask[i] && /^##\s+/.test(lines[i]);
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    while (i < lines.length && !isReq(i)) i += 1;
    if (i >= lines.length) break;
    const name = REQUIREMENT_HEADER.exec(lines[i])[1].trim();
    const start = i;
    const buf = [lines[i]];
    i += 1;
    while (i < lines.length && !isReq(i) && !isTop(i)) {
      buf.push(lines[i]);
      i += 1;
    }
    blocks.push({ name, line: offset + start + 1, raw: buf.join('\n').trimEnd() });
  }
  return blocks;
}

function topLevelSections(text) {
  const lines = splitLines(text);
  const mask = buildFenceMask(lines);
  const heads = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (mask[i]) continue;
    const m = /^##\s+(.+?)\s*$/.exec(lines[i]);
    if (m) heads.push({ title: m[1].trim(), index: i });
  }
  const out = new Map();
  for (let i = 0; i < heads.length; i += 1) {
    const end = heads[i + 1] ? heads[i + 1].index : lines.length;
    out.set(heads[i].title.toLowerCase(), {
      lines: lines.slice(heads[i].index + 1, end),
      mask: mask.slice(heads[i].index + 1, end),
      offset: heads[i].index + 1,
    });
  }
  return out;
}

const EMPTY_SECTION = { lines: [], mask: [], offset: 0 };

/**
 * One delta file's operations. `removed` and `renamed` follow openspec's
 * looser readers: a REMOVED heading may be a bare `### Requirement: …` line or
 * a `- \`### Requirement: …\`` bullet, and a RENAMED pair is `FROM:`/`TO:`.
 */
export function parseDeltaSpec(text) {
  const sections = topLevelSections(text);
  const section = (title) => sections.get(title) ?? EMPTY_SECTION;

  const added = (() => {
    const s = section('added requirements');
    return blocksIn(s.lines, s.mask, s.offset);
  })();
  const modified = (() => {
    const s = section('modified requirements');
    return blocksIn(s.lines, s.mask, s.offset);
  })();

  const removed = [];
  {
    const s = section('removed requirements');
    for (let i = 0; i < s.lines.length; i += 1) {
      if (s.mask[i]) continue;
      const direct = REQUIREMENT_HEADER.exec(s.lines[i]);
      if (direct) {
        removed.push({ name: direct[1].trim(), line: s.offset + i + 1 });
        continue;
      }
      const bullet = /^\s*-\s*`?###\s*Requirement:\s*(.+?)`?\s*$/.exec(s.lines[i]);
      if (bullet) removed.push({ name: bullet[1].trim(), line: s.offset + i + 1 });
    }
  }

  const renamed = [];
  {
    const s = section('renamed requirements');
    let from = null;
    let fromLine = 0;
    for (let i = 0; i < s.lines.length; i += 1) {
      if (s.mask[i]) continue;
      const f = /^\s*-?\s*FROM:\s*`?###\s*Requirement:\s*(.+?)`?\s*$/.exec(s.lines[i]);
      const t = /^\s*-?\s*TO:\s*`?###\s*Requirement:\s*(.+?)`?\s*$/.exec(s.lines[i]);
      if (f) {
        from = f[1].trim();
        fromLine = s.offset + i + 1;
      } else if (t && from) {
        renamed.push({ from, to: t[1].trim(), line: fromLine });
        from = null;
      }
    }
  }

  return { added, modified, removed, renamed };
}

/**
 * The requirement names a LIVE spec currently carries, in order. Only what
 * sits under `## Requirements` counts, matching the merge.
 */
export function parseSpecRequirements(text) {
  const lines = splitLines(text);
  const mask = buildFenceMask(lines);
  const head = lines.findIndex((l, i) => !mask[i] && /^##\s+Requirements\s*$/i.test(l));
  if (head === -1) return new Map();
  let end = lines.length;
  for (let i = head + 1; i < lines.length; i += 1) {
    if (!mask[i] && /^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  const blocks = blocksIn(lines.slice(head + 1, end), mask.slice(head + 1, end), head + 1);
  return new Map(blocks.map((b) => [b.name, b]));
}

/* ── marker 3: change-relative narration ─────────────────────────────────── */

/**
 * The closed marker list, and it is closed on purpose: every entry here is a
 * phrase measured in a body that either reached `openspec/specs/` or was caught
 * on its way there. Nothing is included because it sounded like narration.
 *
 * Sources: the `record-state-before-anything-reads-it` block undone on
 * 2026-08-31 (commit `146b34a`'s message), the `teach-the-whole-subject`
 * `curriculum.md in this change` anchor fixed in `a2a6e00`, and the seven
 * standing instances enumerated in `addictedtoai-n2g`. Together those are nine
 * documented bodies, and the list below catches all nine.
 *
 * **This warns; it does not fail the build.** Three reasons, in order of
 * weight:
 *
 *  1. It is a judgment about prose, and the failure mode of a prose regex is a
 *    false positive on a body that is correct. A `MODIFIED` block cannot be
 *    edited around a false refusal without weakening the requirement itself.
 *  2. `amended` and `repealed` have legitimate timeless uses — specs/blog
 *    already says a claim may be *"struck through or amended inline with the
 *    correction referenced"*, which is a rule about corrections, not narration
 *    about an edit. The markers below are narrowed to the phrase shapes that
 *    were actually wrong, but the narrowing is a judgment, not a proof.
 *  3. The repository already keeps this exact distinction: the voice lint and
 *    the currency-literal check warn deliberately, and the reason given for the
 *    voice lint is the reason here — a threshold on prose is not a gate.
 *
 * Under `--strict`, at the moment of archiving, it is a refusal: the body is
 * about to become permanent in a path no job can correct.
 */
export const NARRATION_MARKERS = [
  {
    id: 'this-change',
    why: 'the change directory is not reachable by that name after archiving',
    re: /\bthis\s+(?:change|delta|proposal)(?:'s|’s)?\b/gi,
  },
  {
    id: 'bare-change-artifact',
    why: 'archiving moves the file to openspec/changes/archive/<date>-<change>/',
    re: /(?<![\w/\\-])(?:design|tasks|proposal|README)\.md\b/g,
  },
  {
    id: 'amendment-narration',
    why: 'a requirement body states what the system does, not what an edit did to it',
    re: /\b(?:amended|amendment)\s+(?:in|by|above|below|here)\b|\brepeal(?:ed|s|ing)\b/gi,
  },
  {
    id: 'text-that-moved',
    why: 'it cites text that the archive itself removes, so it cites nothing',
    re: /\bthe\s+(?:sentence|clause|paragraph|requirement|wording)\s+(?:\w+\s+){0,2}(?:repealed|struck|replaced|removed|amended)\b/gi,
  },
];

/** Blank out fenced regions so an example that shows `design.md` is not a hit. */
function unfenced(raw) {
  const lines = splitLines(raw);
  const mask = buildFenceMask(lines);
  return lines.map((l, i) => (mask[i] ? '' : l)).join('\n');
}

export function narrationHits(raw) {
  const text = unfenced(raw);
  const hits = [];
  for (const marker of NARRATION_MARKERS) {
    marker.re.lastIndex = 0;
    for (const m of text.matchAll(marker.re)) {
      hits.push({ id: marker.id, why: marker.why, match: m[0].replace(/\s+/g, ' ') });
    }
  }
  return hits;
}

/* ── marker 4: identifiers the tree no longer has ────────────────────────── */

/** Directories the issue names, plus `app/` — the rest of the authored source. */
export const SOURCE_DIRS = ['content', 'lib', 'pulse', 'loop', 'scripts', 'app'];
const TEXTUAL = /\.(mjs|cjs|js|jsx|ts|tsx|json|jsonl|md|ya?ml|css|html|txt|cmd|vbs)$/i;
const HAYSTACK_SKIP = new Set(['node_modules', '.next', '.git', 'out', 'fixtures-out']);

const SNAKE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/;
const SCREAMING = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/;
const CAMEL = /^[a-z][a-z0-9]*[A-Z][A-Za-z0-9]*$/;
const PATHISH = /^[\w.@-]+(?:\/[\w.@-]+)+$/;
const FILEISH = /^[\w.@-]+\.(?:mjs|cjs|js|jsx|ts|tsx|json|jsonl|md|ya?ml|css|html|txt)$/i;

/**
 * The backticked tokens in a requirement body that look like something the
 * codebase would contain: a snake_case field, a SCREAMING constant, a
 * camelCase function, a path, or a filename. Everything else in backticks is
 * prose, a value, or a shell fragment, and asking the tree about it produces
 * noise rather than signal.
 */
export function codeTokens(raw) {
  const text = unfenced(raw);
  const out = new Set();
  for (const m of text.matchAll(/`([^`\n]+)`/g)) {
    let tok = m[1].trim().replace(/\(\)$/, '');
    if (!tok || /\s/.test(tok)) continue;
    if (SNAKE.test(tok) || SCREAMING.test(tok) || CAMEL.test(tok) || PATHISH.test(tok) || FILEISH.test(tok)) {
      out.add(tok);
    }
  }
  return [...out];
}

/** Every textual byte under SOURCE_DIRS, concatenated once per run. */
export async function buildSourceHaystack(root, dirs = SOURCE_DIRS) {
  const parts = [];
  const walk = async (dir) => {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith('.') || HAYSTACK_SKIP.has(e.name)) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (TEXTUAL.test(e.name)) {
        try {
          parts.push(await readFile(full, 'utf8'));
        } catch {
          /* an unreadable file is not evidence of absence; skip it */
        }
      }
    }
  };
  for (const d of dirs) await walk(join(root, d));
  return parts.join('\n');
}

/* ── the check itself: pure, no I/O, no clock ────────────────────────────── */

const OPS = {
  modified: { rule: 'dangling-modified', label: 'MODIFIED' },
  removed: { rule: 'dangling-removed', label: 'REMOVED' },
  renamed: { rule: 'dangling-renamed', label: 'RENAMED FROM' },
};

/**
 * `changes`: `[{ name, capabilities: [{ id, file, delta }] }]`.
 * `specs`:   `Map<capabilityId, Map<requirementName, block>>`.
 * `haystack`: source text for the stale-identifier scan, or null to skip it.
 *
 * Returns `{ findings, touched }`. Severity is assigned by the caller's mode,
 * so one function answers both "is this tree publishable" and "may this be
 * archived right now".
 */
/**
 * The identity of one requirement: its capability and its folded name, in a
 * form that cannot be split back apart wrongly. A requirement name contains
 * spaces and a capability id can contain a slash, so no single-character
 * separator is safe — the pair is carried, never re-parsed.
 */
const keyOf = (capability, name) => JSON.stringify([capability, foldName(name)]);

export function checkDeltas({ changes, specs, haystack = null }) {
  const findings = [];
  const add = (f) => findings.push(f);

  // Every ADDED heading in every live change, so a MODIFIED that depends on
  // another change can be told apart from one that depends on nothing.
  const addedElsewhere = new Map(); // keyOf(capability, name) -> [changeName]
  for (const change of changes) {
    for (const cap of change.capabilities) {
      for (const block of cap.delta.added) {
        const key = keyOf(cap.id, block.name);
        if (!addedElsewhere.has(key)) addedElsewhere.set(key, []);
        addedElsewhere.get(key).push(change.name);
      }
    }
  }

  // Who touches what, for the collision pass.
  const touched = new Map(); // key -> [{ change, capability, name, op, file, line }]
  const touch = (entry) => {
    const key = keyOf(entry.capability, entry.name);
    if (!touched.has(key)) touched.set(key, []);
    touched.get(key).push(entry);
  };

  for (const change of changes) {
    for (const cap of change.capabilities) {
      const live = specs.get(cap.id) ?? new Map();
      const liveFolded = new Map([...live.keys()].map((n) => [foldName(n), n]));

      const ops = [
        ...cap.delta.modified.map((b) => ({ op: 'modified', name: b.name, line: b.line })),
        ...cap.delta.removed.map((r) => ({ op: 'removed', name: r.name, line: r.line })),
        ...cap.delta.renamed.map((r) => ({ op: 'renamed', name: r.from, line: r.line })),
      ];

      for (const block of cap.delta.added) {
        touch({ change: change.name, capability: cap.id, name: block.name, op: 'ADDED', file: cap.file, line: block.line });
      }
      for (const r of cap.delta.renamed) {
        touch({ change: change.name, capability: cap.id, name: r.to, op: 'RENAMED TO', file: cap.file, line: r.line });
      }

      for (const { op, name, line } of ops) {
        touch({ change: change.name, capability: cap.id, name, op: OPS[op].label, file: cap.file, line });

        if (live.has(name)) continue;

        const providers = (addedElsewhere.get(keyOf(cap.id, name)) ?? []).filter((c) => c !== change.name);
        if (providers.length > 0) {
          add({
            rule: 'archive-order',
            file: cap.file,
            field: `### Requirement: ${name}`,
            message:
              `${OPS[op].label} resolves only through ${providers.map((c) => `'${c}'`).join(', ')}, ` +
              `which is not archived yet. Archive ${providers.map((c) => `'${c}'`).join(' and ')} first, ` +
              `or this one aborts mid-archive.`,
          });
          continue;
        }

        const nearMiss = liveFolded.get(foldName(name));
        const hint = nearMiss
          ? ` The live spec spells it "${nearMiss}" — fix the header to match exactly.`
          : '';
        add({
          rule: OPS[op].rule,
          file: cap.file,
          field: `### Requirement: ${name}`,
          message:
            `${OPS[op].label} names a requirement that is in no live spec for '${cap.id}' and in no ` +
            `unarchived change's ADDED.${hint}` +
            (op === 'removed'
              ? ' openspec would treat this as already removed and report success, leaving the requirement standing.'
              : ''),
        });
      }

      // Narration and stale identifiers, on exactly the text that gets archived.
      for (const block of [...cap.delta.added, ...cap.delta.modified]) {
        for (const hit of narrationHits(block.raw)) {
          add({
            rule: 'narration',
            file: cap.file,
            field: `### Requirement: ${block.name}`,
            message: `change-relative narration "${hit.match}" in a body that becomes permanent — ${hit.why}. Move the rationale above \`## ADDED\`/\`## MODIFIED\`, which is not archived.`,
          });
        }
        if (haystack !== null) {
          for (const tok of codeTokens(block.raw)) {
            if (!haystack.includes(tok)) {
              add({
                rule: 'stale-id',
                file: cap.file,
                field: `### Requirement: ${block.name}`,
                message: `\`${tok}\` appears nowhere under ${SOURCE_DIRS.join('/, ')}/ — either it was renamed since the delta was written, or it is not built yet.`,
              });
            }
          }
        }
      }
    }
  }

  // The cross-change collision. `openspec validate` structurally cannot do
  // this: it validates one change at a time.
  for (const entries of touched.values()) {
    const names = [...new Set(entries.map((e) => e.change))];
    if (names.length < 2) continue;
    // Read off the entries, never by splitting the map key back apart: a
    // requirement name contains spaces and a capability id can contain a
    // slash, so no separator makes that decomposition safe.
    const { capability } = entries[0];
    const fold = foldName(entries[0].name);
    const adders = entries.filter((e) => e.op === 'ADDED');
    const inLive = [...(specs.get(capability) ?? new Map()).keys()].some((n) => foldName(n) === fold);
    // One change introduces it and the rest amend it: an ordering fact, not a
    // conflict, and `archive-order` already named the order above.
    if (!inLive && adders.length === 1 && entries.every((e) => e.op === 'ADDED' || e.op === 'MODIFIED')) continue;
    const who = entries
      .map((e) => `'${e.change}' ${e.op}`)
      .join(', ');
    add({
      rule: 'collision',
      file: entries[0].file,
      field: `### Requirement: ${entries[0].name}`,
      message:
        `${capability}: ${names.length} unarchived changes touch this requirement (${who}). ` +
        'Archiving both is last-writer-wins and the loser is silent. Reconcile the blocks, ' +
        'or re-derive the second against the first\'s archived text.',
    });
  }

  return { findings, touched };
}

/* ── severity, and the two modes ─────────────────────────────────────────── */

/**
 * Refusal is decided here and nowhere else, so the justification for each
 * choice sits in one table. `stale-id` stays advisory in both modes on the
 * issue's own instruction — a delta naming something not yet built is the
 * normal state of a change that has not been executed.
 */
export const SEVERITY = {
  'dangling-modified': { build: 'error', strict: 'error' },
  'dangling-removed': { build: 'error', strict: 'error' },
  'dangling-renamed': { build: 'error', strict: 'error' },
  'archive-order': { build: 'warning', strict: 'error' },
  collision: { build: 'warning', strict: 'error' },
  narration: { build: 'warning', strict: 'error' },
  'stale-id': { build: 'warning', strict: 'warning' },
};

export function severityOf(rule, strict = false) {
  const row = SEVERITY[rule];
  if (!row) return 'error'; // an unclassified finding is a bug in this file, not a pass
  return strict ? row.strict : row.build;
}

/* ── reading the tree ────────────────────────────────────────────────────── */

async function isDir(p) {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Every delta spec under every UNARCHIVED change. `archive/` is skipped by
 * name: those copies are a record of what a change said when it was archived,
 * and reading them here would re-report defects the constitution has already
 * moved past.
 */
export async function readLiveChanges(openspecRoot) {
  const changesDir = join(openspecRoot, 'changes');
  let entries;
  try {
    entries = await readdir(changesDir, { withFileTypes: true });
  } catch {
    return [];
  }
  const changes = [];
  for (const e of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!e.isDirectory() || e.name === 'archive') continue;
    const specsDir = join(changesDir, e.name, 'specs');
    const capabilities = [];
    const walk = async (dir, idParts) => {
      let kids;
      try {
        kids = await readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const kid of kids.sort((a, b) => (a.name < b.name ? -1 : 1))) {
        const full = join(dir, kid.name);
        if (kid.isDirectory()) await walk(full, [...idParts, kid.name]);
        else if (kid.name === 'spec.md' && idParts.length > 0) {
          capabilities.push({
            id: idParts.join('/'),
            file: `openspec/changes/${e.name}/specs/${[...idParts, 'spec.md'].join('/')}`,
            delta: parseDeltaSpec(await readFile(full, 'utf8')),
          });
        }
      }
    };
    if (await isDir(specsDir)) await walk(specsDir, []);
    changes.push({ name: e.name, capabilities });
  }
  return changes;
}

/** The live constitution: `openspec/specs/<capability>/spec.md`. */
export async function readLiveSpecs(openspecRoot) {
  const specsDir = join(openspecRoot, 'specs');
  const specs = new Map();
  const walk = async (dir, idParts) => {
    let kids;
    try {
      kids = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const kid of kids) {
      const full = join(dir, kid.name);
      if (kid.isDirectory()) await walk(full, [...idParts, kid.name]);
      else if (kid.name === 'spec.md' && idParts.length > 0) {
        specs.set(idParts.join('/'), parseSpecRequirements(await readFile(full, 'utf8')));
      }
    }
  };
  await walk(specsDir, []);
  return specs;
}

/* ── the prebuild step ───────────────────────────────────────────────────── */

/**
 * Registered in `scripts/prebuild.mjs`'s STEPS. Throws — and so fails the
 * build, named — on any finding whose severity in this mode is `error`.
 */
export async function checkSpecDeltasStep(opts = {}) {
  const out = opts.out ?? process.stdout;
  const root = opts.root ?? process.cwd();
  const openspecRoot = opts.openspecRoot ?? join(root, 'openspec');
  const strict = opts.strict === true;

  const changes = opts.changes ?? (await readLiveChanges(openspecRoot));
  const specs = opts.specs ?? (await readLiveSpecs(openspecRoot));
  const haystack =
    opts.haystack !== undefined
      ? opts.haystack
      : opts.staleIds === false
        ? null
        : await buildSourceHaystack(root);

  const { findings } = checkDeltas({ changes, specs, haystack });

  const diags = new Diagnostics();
  for (const f of findings) {
    const d = { file: f.file, field: f.field, message: f.message, rule: f.rule };
    if (severityOf(f.rule, strict) === 'error') diags.error(d);
    else diags.warn(d);
  }
  diags.printWarnings(out);

  const deltaCount = changes.reduce((n, c) => n + c.capabilities.length, 0);
  out.write(
    `prebuild: spec-deltas — ${changes.length} unarchived change(s), ${deltaCount} delta file(s), ` +
      `${specs.size} live spec(s)${strict ? ', STRICT' : ''}: ` +
      `${diags.errors.length} error(s), ${diags.warnings.length} warning(s)\n`,
  );
  diags.throwIfErrors('spec-delta');

  return {
    changes: changes.length,
    deltas: deltaCount,
    specs: specs.size,
    findings,
    errors: diags.errors.length,
    warnings: diags.warnings.length,
  };
}

/* ── standalone ──────────────────────────────────────────────────────────── */

/**
 * `node scripts/check-spec-deltas.mjs [--strict] [--no-stale-ids] [--root <dir>]`
 *
 * Run it with `--strict` immediately before `openspec archive`: it promotes
 * the collision, ordering and narration warnings to refusals, because at that
 * moment the delta is one command away from a reserved path.
 */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const rootFlag = argv.indexOf('--root');
  try {
    await checkSpecDeltasStep({
      strict: argv.includes('--strict'),
      staleIds: !argv.includes('--no-stale-ids'),
      ...(rootFlag >= 0 ? { root: resolve(argv[rootFlag + 1]) } : {}),
    });
  } catch (err) {
    process.stderr.write(`${err?.message ?? err}\n`);
    process.exitCode = 1;
  }
}
