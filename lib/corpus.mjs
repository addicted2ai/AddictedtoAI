/**
 * corpus.mjs — load every content file, validate it, and check the
 * corpus-wide invariants (tasks 2.1 and 2.2).
 *
 * Per-file rules live in `schema.mjs`; the rules that need to see the whole
 * corpus live here: duplicate ids, path/id agreement, and every cross-file
 * reference (`mentions`, tutorial `subjects`, a tool listing's `entry` link).
 *
 * The loader takes a root so the fixture corpora under `lib/fixtures/` run
 * through exactly this code. A fixture that passed through a simplified
 * imitation of the loader would prove nothing about the build.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import fg from 'fast-glob';

import { CONTENT_TYPES, CONTENT_DIR, relPath, toPosix } from './paths.mjs';
import { Diagnostics } from './errors.mjs';
import { parseContentFile, hasProse } from './frontmatter.mjs';
import { validateFrontMatter, KINDS, ENTRY_ID_RE } from './schema.mjs';

/** README.md files document each content directory; they are not content. */
const NOT_CONTENT = /^(readme|_.*)\.md$/i;

/**
 * The public URL of a content file. One place, so the route table, the
 * backlinks file and the search index cannot drift apart.
 */
export function urlFor(type, doc) {
  switch (type) {
    case 'entry':
      return `/wiki/${doc.data.id}`;
    case 'learn':
      return `/learn/${doc.slug}`;
    case 'tutorial':
      return `/tutorials/${doc.slug}`;
    case 'post':
      return `/blog/${doc.slug}`;
    case 'tool':
      return `/tools/${doc.slug}`;
    default:
      throw new Error(`no URL rule for content type "${type}"`);
  }
}

export function titleOf(type, doc) {
  return type === 'entry' ? doc.data.display_name : doc.data.title;
}

async function loadType(type, contentRoot, diags) {
  const spec = CONTENT_TYPES[type];
  const pattern = toPosix(join(contentRoot, spec.glob));
  const files = (await fg(pattern, { onlyFiles: true, dot: false })).sort();
  const docs = [];

  for (const abs of files) {
    const base = abs.split('/').pop();
    if (NOT_CONTENT.test(base)) continue;

    const file = relPath(abs);
    const raw = await readFile(abs, 'utf8');
    const { data, body, bodyStartLine, hasFrontMatter } = parseContentFile(raw);

    if (!hasFrontMatter) {
      diags.error({
        file,
        field: '<front matter>',
        message: 'file has no YAML front matter block',
        rule: 'schema',
      });
      continue;
    }

    const result = validateFrontMatter(type, data);
    if (!result.ok) {
      for (const issue of result.issues) {
        diags.error({ file, field: issue.field, message: issue.message, rule: 'schema' });
      }
      continue;
    }

    const slug = base.replace(/\.md$/, '');
    docs.push({
      type,
      file,
      // Path within the content root — what the id/path agreement is checked
      // against, so a fixture corpus under lib/fixtures/ obeys the same rule
      // as content/ without the rule hard-coding "content/".
      rel: relPath(abs, contentRoot),
      abs,
      slug,
      data: result.value,
      body,
      bodyStartLine,
      hasBody: hasProse(body),
    });
  }

  return docs;
}

/** Rules that need only the file and its own front matter, but not zod. */
function checkEntryIdentity(doc, diags) {
  const { id, kind } = doc.data;
  const m = ENTRY_ID_RE.exec(id);
  if (!m) return; // schema already reported it
  const [, idKind, slug] = m;

  if (!KINDS.includes(kind)) {
    diags.error({
      file: doc.file,
      field: 'kind',
      message: `invalid kind "${kind}" — kind must come from the closed list: ${KINDS.join(', ')}`,
      rule: 'kind',
    });
  }

  if (idKind !== kind) {
    diags.error({
      file: doc.file,
      field: 'id',
      message: `id "${id}" does not start with its declared kind "${kind}" — the id must be <kind>/<slug>`,
      rule: 'id-format',
    });
  }

  const expected = `wiki/${kind}/${slug}.md`;
  if (doc.rel !== expected) {
    diags.error({
      file: doc.file,
      field: 'id',
      message: `id "${id}" requires the file to be at <content root>/${expected} (design D1: content/wiki/<kind>/<slug>.md)`,
      rule: 'id-path',
    });
  }
}

function checkDuplicateIds(entries, diags) {
  const seen = new Map();
  for (const doc of entries) {
    const id = doc.data.id;
    const first = seen.get(id);
    if (first) {
      diags.error({
        file: doc.file,
        field: 'id',
        message: `duplicate entry id "${id}" — also declared by ${first.file}`,
        rule: 'duplicate-id',
      });
    } else {
      seen.set(id, doc);
    }
  }
  return seen;
}

function checkReferences(corpus, diags) {
  const { byId } = corpus;
  const resolve = (doc, field, id) => {
    if (!byId.has(id)) {
      diags.error({
        file: doc.file,
        field,
        message: `references entry "${id}", which does not exist`,
        rule: 'unresolved-reference',
      });
      return false;
    }
    return true;
  };

  for (const doc of corpus.all) {
    (doc.data.mentions ?? []).forEach((id, i) => resolve(doc, `mentions[${i}]`, id));
  }
  for (const doc of corpus.tutorial) {
    doc.data.subjects.forEach((id, i) => resolve(doc, `subjects[${i}]`, id));
    for (const id of doc.data.subjects) {
      if (!(id in doc.data.verified_against)) {
        diags.error({
          file: doc.file,
          field: 'verified_against',
          message: `subject "${id}" has no verified_against version — every subject must declare the version its steps were verified against`,
          rule: 'schema',
        });
      }
    }
    for (const id of Object.keys(doc.data.verified_against)) {
      if (!doc.data.subjects.includes(id)) {
        diags.error({
          file: doc.file,
          field: `verified_against.${id}`,
          message: `declares a version for "${id}", which is not in subjects`,
          rule: 'schema',
        });
      }
    }
  }
  for (const doc of corpus.tool) {
    resolve(doc, 'entry', doc.data.entry);
  }
  for (const doc of corpus.learn) {
    const slugs = new Set(corpus.learn.map((d) => d.slug));
    doc.data.prerequisites.forEach((slug, i) => {
      if (!slugs.has(slug)) {
        diags.error({
          file: doc.file,
          field: `prerequisites[${i}]`,
          message: `references learn page "${slug}", which does not exist`,
          rule: 'unresolved-reference',
        });
      }
    });
  }
}

/**
 * Load and validate a whole content tree.
 *
 * @param {object} [opts]
 * @param {string} [opts.contentRoot] absolute path to a content directory
 * @param {Diagnostics} [opts.diags]
 * @param {boolean} [opts.checkReferences] cross-file reference resolution
 */
export async function loadCorpus(opts = {}) {
  const contentRoot = opts.contentRoot ?? CONTENT_DIR;
  const diags = opts.diags ?? new Diagnostics();

  const byType = {};
  for (const type of Object.keys(CONTENT_TYPES)) {
    byType[type] = await loadType(type, contentRoot, diags);
  }

  for (const doc of byType.entry) checkEntryIdentity(doc, diags);
  const byId = checkDuplicateIds(byType.entry, diags);

  const all = Object.values(byType).flat();
  for (const doc of all) doc.url = urlFor(doc.type, doc);

  const corpus = { ...byType, all, byId, diags, contentRoot };
  if (opts.checkReferences !== false) checkReferences(corpus, diags);
  return corpus;
}
