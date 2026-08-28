/**
 * frontmatter.mjs — split a content file into front matter, body, and the
 * body's starting line number.
 *
 * The line number is the reason this is not just a call to `gray-matter`.
 * The currency-literal warning (task 2.10) has to name a **line in the file**
 * the author opens, not a line in the body it never sees, so the offset must
 * be exact. `gray-matter` does not report it, so the delimiter is matched
 * here and the parse is handed to `gray-matter` for everything else.
 */

import matter from 'gray-matter';

/** Matches a leading `---` block exactly as gray-matter delimits one. */
const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/**
 * @returns {{ data: object, body: string, bodyStartLine: number, hasFrontMatter: boolean }}
 *   `bodyStartLine` is 1-based and points at the first line of the body in
 *   the original file.
 */
export function parseContentFile(raw) {
  const normalized = raw.replace(/^﻿/, '');
  const m = FM_RE.exec(normalized);
  if (!m) {
    return { data: {}, body: normalized, bodyStartLine: 1, hasFrontMatter: false };
  }
  const consumed = m[0];
  const bodyStartLine = consumed.split('\n').length; // trailing \n ends the block
  const parsed = matter(normalized);
  return {
    data: parsed.data ?? {},
    body: parsed.content ?? '',
    bodyStartLine,
    hasFrontMatter: true,
  };
}

/** True when a body has any non-whitespace content — the stub/full test. */
export function hasProse(body) {
  return typeof body === 'string' && body.trim().length > 0;
}
