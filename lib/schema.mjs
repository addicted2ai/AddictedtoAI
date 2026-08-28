/**
 * schema.mjs — front-matter schemas for the five content types (task 2.1),
 * the closed `kind` list and the id format rule (task 2.2).
 *
 * Normative source: the worked example in `specs/wiki` ("The worked
 * example — the complete front matter of one entry, normative for field
 * names and shapes"). That example exists precisely so two agents cannot
 * invent incompatible front matter, so every entry field name below is
 * copied from it rather than chosen here.
 *
 * Two deliberate strictnesses, both because the alternative is silent data
 * loss rather than a loud stop:
 *
 *  - **Unknown keys are errors.** `alias:` where `aliases:` was meant would
 *    otherwise parse cleanly into an entry with no aliases at all, and
 *    nothing downstream would ever notice. If a later wave needs a new
 *    field, it is one line in this file — the error message says so.
 *  - **The file path must agree with the id.** `content/wiki/<kind>/<slug>.md`
 *    (design D1) is checked against `<kind>/<slug>`, so a copy-pasted entry
 *    that kept its source's id cannot quietly shadow it.
 *
 * `content/deltas/` is intentionally absent: the delta record schema is
 * task 4.14's, and defining half of it here would be the incompatible-front-
 * matter failure this file exists to prevent. Add it as a sixth type when
 * 4.14 lands.
 */

import { z } from 'zod';

/** The closed `kind` list from specs/wiki. There is deliberately no `person`. */
export const KINDS = [
  'model',
  'org',
  'tool',
  'concept',
  'technique',
  'benchmark',
  'dataset',
  'hardware',
  'paper',
  'event',
];

export const STATUSES = ['active', 'preview', 'announced', 'deprecated', 'retired', 'dead'];
export const MAINTENANCE_CLASSES = ['living', 'stable', 'dormant'];
export const ALIAS_CLASSES = ['exclusive', 'shared', 'manual'];
export const VOLATILITIES = ['fast', 'slow', 'static', 'dated'];

/**
 * Re-check intervals in days. `static` and `dated` are never re-checked, so
 * they have no interval — `null` is the honest value, not a large number.
 */
export const VOLATILITY_DAYS = { fast: 14, slow: 120, static: null, dated: null };

/**
 * The static-education ladder, in order. `specs/education-static` requires an
 * ordered ladder and a per-page level but names no closed list, so this array
 * IS the order: `LEARN_LEVELS.indexOf(level)` is how the generated index
 * (task 4.4) sorts. Extending the ladder means editing this one array.
 */
export const LEARN_LEVELS = ['orientation', 'foundations', 'mechanics', 'advanced'];

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const ENTRY_ID_RE = /^([a-z]+)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
/** Fact field names: snake_case, the form the worked example uses. */
export const FIELD_NAME_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;

/**
 * A closed list whose rejection message names the offending value.
 *
 * specs/wiki requires the unknown-kind failure to name "the file and the
 * invalid kind"; a generic "invalid option" would satisfy zod and not the
 * spec, and the reader of that message is a weak model with no context.
 */
function closedList(label, values) {
  return z.string().superRefine((v, ctx) => {
    if (values.includes(v)) return;
    ctx.addIssue({
      code: 'custom',
      message: `invalid ${label} ${JSON.stringify(v)} — ${label} must come from the closed list: ${values.join(', ')}`,
    });
  });
}

const isoDate = z
  .string()
  .regex(ISO_DATE_RE, 'must be an ISO date, YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), 'is not a real calendar date');

const entryId = z
  .string()
  .regex(ENTRY_ID_RE, 'must be an entry id of the form <kind>/<slug>, kebab-case')
  .superRefine((s, ctx) => {
    const kind = String(s).split('/')[0];
    if (KINDS.includes(kind)) return;
    ctx.addIssue({
      code: 'custom',
      message: `invalid kind ${JSON.stringify(kind)} in id ${JSON.stringify(s)} — kind must come from the closed list: ${KINDS.join(', ')}`,
    });
  });

const httpUrl = z
  .string()
  .refine((s) => /^https?:\/\/\S+$/.test(s), 'must be an http(s) URL');

const alias = z
  .object({
    name: z.string().min(1, 'must not be empty'),
    class: closedList('alias class', ALIAS_CLASSES),
  })
  .strict();

const citedFact = z
  .object({
    field: z.string().regex(FIELD_NAME_RE, 'must be a snake_case field name'),
    source: z.literal('cited'),
    value: z.union([z.string(), z.number(), z.boolean()]),
    source_url: httpUrl,
    accessed: isoDate,
    volatility: closedList('volatility', VOLATILITIES),
  })
  .strict();

const feedFact = z
  .object({
    field: z.string().regex(FIELD_NAME_RE, 'must be a snake_case field name'),
    source: z.literal('feed'),
    feed: z.string().min(1, 'must name a registered source id'),
    path: z
      .string()
      .regex(/^[A-Za-z0-9_$][A-Za-z0-9_$.\-\/]*$/, 'must be a dotted path into the joined row'),
    volatility: closedList('volatility', VOLATILITIES),
  })
  .strict();

const fact = z.discriminatedUnion('source', [citedFact, feedFact]);

const timelineEvent = z
  .object({
    date: isoDate,
    event: z.string().min(1, 'must not be empty'),
    source_url: httpUrl,
  })
  .strict();

export const entrySchema = z
  .object({
    id: entryId,
    kind: closedList('kind', KINDS),
    display_name: z.string().min(1, 'must not be empty'),
    aliases: z.array(alias).min(1, 'every entry must declare at least one alias'),
    status: closedList('status', STATUSES),
    maintenance: closedList('maintenance class', MAINTENANCE_CLASSES),
    feeds: z.record(z.string().min(1), z.string().min(1)).optional(),
    facts: z.array(fact).default([]),
    timeline: z.array(timelineEvent).default([]),
    mentions: z.array(entryId).default([]),
    themes: z.array(z.string().min(1)).optional(),
  })
  .strict();

export const learnSchema = z
  .object({
    title: z.string().min(1, 'must not be empty'),
    level: closedList('level', LEARN_LEVELS),
    outcome: z.string().min(1, 'must state what the reader will understand after reading'),
    prerequisites: z.array(z.string().regex(SLUG_RE, 'must be a learn page slug')).default([]),
    mentions: z.array(entryId).default([]),
  })
  .strict();

export const tutorialSchema = z
  .object({
    title: z.string().min(1, 'must not be empty'),
    subjects: z.array(entryId).min(1, 'a tutorial must declare at least one subject'),
    verified_against: z.record(entryId, z.string().min(1)),
    verified_on: isoDate,
    reverify_days: z.number().int().positive().default(60),
    mentions: z.array(entryId).default([]),
  })
  .strict();

export const postSchema = z
  .object({
    title: z.string().min(1, 'must not be empty'),
    date: isoDate,
    mentions: z.array(entryId).default([]),
    corrections: z
      .array(z.object({ date: isoDate, text: z.string().min(1) }).strict())
      .default([]),
  })
  .strict();

export const toolSchema = z
  .object({
    title: z.string().min(1, 'must not be empty'),
    url: httpUrl,
    pricing: z.string().min(1, 'must state a pricing model'),
    last_verified: isoDate,
    entry: entryId,
    mentions: z.array(entryId).default([]),
  })
  .strict();

export const SCHEMAS = {
  entry: entrySchema,
  learn: learnSchema,
  tutorial: tutorialSchema,
  post: postSchema,
  tool: toolSchema,
};

/** Human-readable field path from a zod issue: `facts[2].source_url`. */
export function issuePath(issue) {
  if (!issue.path || issue.path.length === 0) return '<root>';
  let out = '';
  for (const seg of issue.path) {
    if (typeof seg === 'number') out += `[${seg}]`;
    else out += out ? `.${seg}` : String(seg);
  }
  return out;
}

/**
 * The reader of a build failure is a weak model with no context, so the
 * message says what is wrong in words rather than in zod's vocabulary, and
 * echoes the offending value. "expected string, received undefined" and
 * "Invalid input" are both true and both useless at 2am.
 */
/** The value the issue is about, dug out of the original front matter. */
function valueAt(data, path) {
  let cur = data;
  for (const seg of path ?? []) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[seg];
  }
  return cur;
}

function issueMessage(issue, data) {
  if (issue.code === 'unrecognized_keys') {
    return `unknown front-matter key(s): ${issue.keys.join(', ')} — if a new field is genuinely needed, add it to lib/schema.mjs`;
  }
  const value = valueAt(data, issue.path);
  if (value === undefined) {
    return issue.code === 'invalid_type' ? 'required field is missing' : issue.message;
  }
  // Custom checks already name the offending value in their own words.
  if (issue.code === 'custom') return issue.message;
  const showable = typeof value !== 'object' || value === null;
  return showable ? `${issue.message} (got ${JSON.stringify(value)})` : issue.message;
}

/**
 * Validate one file's front matter.
 * @returns {{ ok: true, value: object } | { ok: false, issues: {field: string, message: string}[] }}
 */
export function validateFrontMatter(type, data) {
  const schema = SCHEMAS[type];
  if (!schema) throw new Error(`no schema registered for content type "${type}"`);
  const res = schema.safeParse(data);
  if (res.success) return { ok: true, value: res.data };
  return {
    ok: false,
    issues: res.error.issues.map((i) => ({
      field: issuePath(i),
      message: issueMessage(i, data),
    })),
  };
}
