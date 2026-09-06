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
    case 'delta':
      // The showpiece index is /impossible-routine; each delta also keeps its
      // own permanent URL so a dated pair can be cited on its own.
      return `/impossible-routine/${doc.slug}`;
    case 'claim':
      /*
       * DECIDED (task 5): `urlFor` does NOT take the corpus, and claims are
       * resolved in a SEPARATE PASS (`resolveClaimUrls` below).
       *
       * A claim's URL is its subject entry's URL plus a stable fragment, so it
       * cannot be computed from the claim alone — it depends on another
       * document existing. Three reasons the pass won:
       *
       *  1. `urlFor(type, doc)` has three callers by design ("the route table,
       *     the backlinks file and the search index cannot drift apart"). A
       *     third, optional `corpus` parameter is a parameter every one of them
       *     can forget, and forgetting it would produce a wrong URL rather than
       *     an error — the silent-failure shape this file exists to refuse.
       *  2. Depending on another document is a CORPUS-level fact, and this file
       *     already has a place for those: `checkReferences`. The pass runs
       *     beside it, after `byId` is built, so a claim whose subject does not
       *     resolve is already an error naming the file and the id.
       *  3. Throwing here keeps the default branch's guarantee intact — a
       *     seventh type with no rule still breaks the build immediately — while
       *     saying where the rule actually is.
       */
      throw new Error(
        'a claim record mints no route of its own: its URL is its subject entry\'s URL plus ' +
          '#claim-<slug>, resolved in resolveClaimUrls() in lib/corpus.mjs once the subject is ' +
          'known. Walk `corpus.documents`, not `corpus.all`, if you are building a list of pages',
      );
    default:
      throw new Error(`no URL rule for content type "${type}"`);
  }
}

/** The stable fragment a claim renders at on its subject's entry page. */
export function claimFragment(doc) {
  return `claim-${doc.slug}`;
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

/**
 * Two claim records are a duplicate when they share ALL FOUR of `subject`,
 * `field`, `source_url` and `accessed` (specs/wiki).
 *
 * Sharing only `subject` and `field` is LEGAL and deliberately so: a vendor
 * repeating itself is real, and two sources for one assertion are two records.
 * A surface orders them by `accessed`, newest first. The four-part key is what
 * separates "said it twice" from "filed twice by mistake".
 */
function checkDuplicateClaims(claims, diags) {
  const seen = new Map();
  for (const doc of claims) {
    const d = doc.data;
    const key = JSON.stringify([d.subject, d.field, d.source_url, d.accessed]);
    const first = seen.get(key);
    if (first) {
      diags.error({
        file: doc.file,
        field: 'subject',
        message:
          `duplicate claim record — ${first.file} already records subject "${d.subject}", field ` +
          `"${d.field}", source_url "${d.source_url}" and accessed "${d.accessed}". Two records ` +
          'sharing only subject and field are legal (a vendor repeating itself is real); sharing ' +
          'all four is one claim filed twice',
        rule: 'duplicate-claim',
      });
    } else {
      seen.set(key, doc);
    }
  }
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
  // A claim's `subject` is resolved exactly as `mentions` is — declared, never
  // inferred: no name match, no host match, no title match, for the same reason
  // `feeds` binds on a declared row id. An unresolvable subject fails the build
  // naming the file and the id (specs/wiki).
  for (const doc of corpus.claim) {
    resolve(doc, 'subject', doc.data.subject);
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
  /*
   * `documents` is `all` minus the types that mint no page (`routed: false` in
   * CONTENT_TYPES). It is what every route-minting surface walks: the route
   * table, the search index, and anything else asking "what pages are there".
   * `all` keeps everything, because validation, field classification, the
   * volatile-literal scan and the review join apply to a claim exactly as they
   * apply to a page — a claim is content, it is just not a document.
   */
  const documents = all.filter((doc) => CONTENT_TYPES[doc.type].routed);
  for (const doc of documents) doc.url = urlFor(doc.type, doc);

  const corpus = { ...byType, all, documents, byId, diags, contentRoot };
  if (opts.checkReferences !== false) checkReferences(corpus, diags);
  checkDuplicateClaims(byType.claim, diags);
  resolveClaimUrls(corpus);
  return corpus;
}

/**
 * The separate pass `urlFor`'s `claim` branch points at.
 *
 * A claim's rendered home is its subject's entry page at a stable fragment, so
 * its URL exists only once the subject has one. A claim whose subject does not
 * resolve gets NO url — `checkReferences` has already filed the error naming
 * the file and the id, and inventing a URL for it would turn one loud failure
 * into a quiet wrong link.
 */
export function resolveClaimUrls(corpus) {
  for (const doc of corpus.claim ?? []) {
    const subject = corpus.byId.get(doc.data.subject);
    if (!subject?.url) continue;
    doc.url = `${subject.url}#${claimFragment(doc)}`;
  }
  return corpus;
}
