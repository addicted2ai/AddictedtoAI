/**
 * vanished.mjs — recording a withdrawn feed row as retirable state
 * (beads addictedtoai-u0n5).
 *
 * THE DEFECT THIS CLOSES. `vanished-feed-row` was produced directly from the
 * derived tree: `deriveDataLayer` walks every declared binding and emits one
 * finding for each row absent from the source's `latest` snapshot. That is a
 * LEVEL signal with no retirement condition, and a permanently withdrawn row
 * is permanently absent, so the item regenerated on every run, forever, at
 * rank 85 — the top of the queue. Measured on 2026-09-02: three Anthropic
 * "(Fast)" rows were withdrawn, a job repaired all three pages and was
 * approved, and the very next `--dry-run` selected the same item again. The
 * Desk would have re-done that work on every run indefinitely, and everything
 * ranked below 85 — including the daily `scout`, the site's only outward-
 * looking producer — was unreachable for as long as it stayed there.
 *
 * That is exactly the unrepairable top-of-queue item the RANKS table's own
 * comment says it is guarding against, citing `addictedtoai-5hn`.
 *
 * WHY NOT THE TWO OBVIOUS FIXES.
 *
 *   1. EDGE-TRIGGER on "absent from `latest` but present in `previous`". It
 *      looks like three lines, because `inPrevious` is already computed. It is
 *      wrong twice over. `previous` is only rotated when a fetch's rows differ
 *      from `latest` (`sources.mjs`), so on a quiet source the condition stays
 *      true and the edge trigger is a level trigger with extra steps. And when
 *      rotation does happen, the row is in neither snapshot, so the last-known
 *      values needed to ACT on the finding disappear at the same moment the
 *      finding does (`addictedtoai-64fk`). Losing the work item and its
 *      evidence together, silently, is worse than the bug being fixed.
 *   2. REMOVE THE `feeds:` BINDING. That is the documented trap: a retired
 *      entry whose binding was removed can never re-mint if the row re-lists,
 *      which is the permanent-refusal case `addictedtoai-javv` exists for and
 *      which `specs/pulse` now carries a requirement about.
 *
 * WHAT THIS DOES INSTEAD, and it is the shape the constitution already chose.
 * `specs/pulse` says of a carried finding that retirement "SHALL be by deletion
 * of the file, performed by the fixing job's own diff, and SHALL NOT require
 * any merge-step bookkeeping", because "a retirement that depended on a
 * separate step recording 'this one is done' is how a high-rank item becomes
 * permanently un-retirable and blocks everything beneath it forever". That is
 * this defect, named in advance. So a withdrawn row becomes one file under
 * `data/vanished/`, the queue reads that directory, and the fixing job's own
 * diff deletes the file. Nothing records "done" anywhere else.
 *
 * THE FILE ALSO PINS THE EVIDENCE. Each record carries the row's last-known
 * values at the moment it was written. Snapshot rotation can therefore no
 * longer take away the material a repair job needs, which removes the sharper
 * half of `addictedtoai-64fk` without changing how any page renders. What this
 * does NOT do is change the rendering itself: an entry whose row has rotated
 * out of both snapshots still renders its bound facts as absent, and that is
 * still tracked as `addictedtoai-64fk`.
 *
 * IDEMPOTENCY is by file presence, deliberately, and not by a date comparison:
 * a record that exists is never rewritten, so a re-run cannot revive a finding
 * a job has just deleted, and cannot overwrite pinned evidence with a later,
 * emptier reading of the same row.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Directory names, relative to the repository root.
 *
 * WHY THERE ARE TWO, and it is the correction of a real mistake. The first
 * version of this module retired a finding by DELETING its record, on the
 * analogy of a carried finding. The analogy is false, and running the Pulse
 * proved it within minutes: a carried finding's SOURCE is a one-time verdict
 * record, so once its file is gone nothing recreates it — but a vanished row's
 * source is the permanent absence of a row from a snapshot, so the very next
 * run wrote the record again ("3 newly recorded"). Deletion retired nothing.
 * It reimplemented the original defect with extra steps.
 *
 * A finding whose condition is permanent needs a durable record of the ANSWER,
 * not of the question. `answered/` is that, and it is not a new invention: it
 * is the shape `data/proposals/consumed/` already uses for the same reason.
 * Presence in `vanished/` means pending; presence in `answered/` means the site
 * has said what happened; a row named in either is never re-recorded.
 */
export const VANISHED_DIR = join('data', 'vanished');
export const ANSWERED_DIR = join('data', 'vanished', 'answered');

/**
 * One filesystem-safe file name per (source, row). Slashes and colons are
 * common in row ids (`anthropic/claude-opus-5-fast`, `~z-ai/glm-latest`) and
 * none of them may reach a path segment.
 */
export function vanishedFileName(source, rowId) {
  const slug = (s) =>
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  return `${slug(source)}--${slug(rowId)}.md`;
}

const yamlString = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/**
 * Render the pinned last-known values as a readable block. Feed rows are flat
 * maps of scalars; anything else is stringified rather than dropped, because a
 * repair job reading this file is better served by an odd-looking value than
 * by a silent omission.
 */
function lastKnownBlock(row) {
  if (!row || typeof row !== 'object') return '_No last-known values were available when this was recorded._\n';
  const keys = Object.keys(row)
    .filter((k) => !k.startsWith('$'))
    .sort();
  if (keys.length === 0) return '_No last-known values were available when this was recorded._\n';
  const lines = keys.map((k) => {
    const v = row[k];
    const shown = v === null || v === undefined ? '(absent)' : typeof v === 'object' ? JSON.stringify(v) : String(v);
    return `| \`${k}\` | ${shown} |`;
  });
  return ['| field | last known value |', '|---|---|', ...lines].join('\n') + '\n';
}

/**
 * Write one record per newly vanished declared row.
 *
 * @param root       repository root
 * @param vanished   `deriveDataLayer(...).vanished` — {source,row_id,entry_id,path,last_seen_date,has_last_known}
 * @param feedRows   `data/derived/feed-rows.json` shape, for pinning last-known values
 * @param today      ISO date string for the record's own `date:` (LOCAL date; see CLAUDE.md)
 * @returns {{written: string[], existing: string[]}}
 */
export function recordVanishedRows(root, vanished, feedRows = {}, today) {
  const result = { written: [], existing: [], answered: [] };
  if (!Array.isArray(vanished) || vanished.length === 0) return result;

  const dir = join(root, VANISHED_DIR);
  mkdirSync(dir, { recursive: true });

  for (const v of vanished) {
    const name = vanishedFileName(v.source, v.row_id);
    const file = join(dir, name);
    if (existsSync(file)) {
      result.existing.push(name);
      continue;
    }
    // A row whose withdrawal has already been ANSWERED is never re-recorded.
    // Without this the finding is immortal: the row stays absent forever, so
    // every run would write the record again and the item could never leave
    // the queue no matter how well the site explained it.
    if (existsSync(join(root, ANSWERED_DIR, name))) {
      result.answered.push(name);
      continue;
    }

    const row = feedRows?.[v.source]?.[v.row_id] ?? null;
    const lastSeen = v.last_seen_date ?? null;
    const title = `A declared feed row vanished: ${v.source} ${v.row_id}`;

    const front = [
      '---',
      `title: ${yamlString(title)}`,
      `subject: ${yamlString(v.path)}`,
      `source: ${yamlString(v.source)}`,
      `row_id: ${yamlString(v.row_id)}`,
      `entry_id: ${yamlString(v.entry_id ?? '')}`,
      `last_seen: ${lastSeen ? yamlString(lastSeen) : 'null'}`,
      `date: ${yamlString(today)}`,
      '---',
    ].join('\n');

    const body = [
      '',
      `\`${v.entry_id ?? v.path}\` declares the row \`${v.row_id}\` from the \`${v.source}\` feed, and that row is`,
      `no longer present in the source's latest snapshot.` +
        (lastSeen ? ` It was last seen on ${lastSeen}.` : ''),
      '',
      'This is not automatically a defect in the entry. A row can leave a feed because',
      'the vendor retired the model, because it was renamed, because it was folded into',
      'another service tier, or because this one router delisted something that is still',
      'served elsewhere — and those are materially different facts that a reader needs',
      'told apart. Establish which one happened from the vendor\'s and the feed',
      'publisher\'s own sources before writing anything. If they do not settle it, say so',
      'on the page rather than guessing: reporting `blocked` is a successful outcome and',
      'a plausible invention is not.',
      '',
      'Do NOT remove the entry or its `feeds:` binding. A binding removed after a row',
      'vanishes is what makes the row permanently unmintable if it ever re-lists, which',
      'is the failure `addictedtoai-javv` documents.',
      '',
      '## Last known values, pinned',
      '',
      'Recorded here at the moment the row went missing, because snapshot rotation will',
      'eventually take them out of both snapshots and they cannot be recovered afterwards',
      '(`addictedtoai-64fk`).',
      '',
      lastKnownBlock(row),
      '## Retiring this item',
      '',
      'MOVE this file into `data/vanished/answered/`, unchanged, in the same diff as the',
      'fix. Do NOT delete it. The row stays absent from the feed forever, so a deleted',
      'record is simply written again on the next run and the finding becomes immortal;',
      'the answered record is the only durable evidence that the site has responded, and',
      'it is what stops the question being asked again.',
      '',
    ].join('\n');

    writeFileSync(file, `${front}\n${body}`, 'utf8');
    result.written.push(name);
  }
  return result;
}

/**
 * Move a record into `answered/`, which is how a fixing job retires it.
 *
 * Exported so the move has ONE implementation and one name, rather than each
 * job improvising a path. Returns false when there is nothing to move, so a
 * caller that runs twice is harmless.
 */
export function answerVanishedRecord(root, name) {
  const from = join(root, VANISHED_DIR, name);
  if (!existsSync(from)) return false;
  const dir = join(root, ANSWERED_DIR);
  mkdirSync(dir, { recursive: true });
  renameSync(from, join(dir, name));
  return true;
}

/** Names of the answered records — a row named here is never re-recorded. */
export function listAnsweredRecords(root) {
  const dir = join(root, ANSWERED_DIR);
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md')
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

/**
 * Names of the records currently on disk. Used by tests and by the Pulse's own
 * reporting; the queue reads the directory itself.
 */
export function listVanishedRecords(root) {
  const dir = join(root, VANISHED_DIR);
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md')
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

/** Read one record's front matter without pulling in a YAML dependency here. */
export function readVanishedRecord(root, name) {
  const file = join(root, VANISHED_DIR, name);
  if (!existsSync(file)) return null;
  return readFileSync(file, 'utf8');
}
