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
 * `content/deltas/` landed with task 4.14 as the sixth type. Its shape is the
 * showpiece's whole guarantee: specs/site says *"every end MUST carry a real
 * date and a reachable source; a delta with an unsourced end SHALL NOT
 * publish"*, so both ends' `date` and `source_url` are required fields and a
 * missing one is a build failure, not a review catch. Review can miss a
 * thing; a required field cannot.
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

/**
 * The declared corroboration join (specs/wiki, harden-seed-wave-guardrails).
 *
 * An entry can carry a feed-bound fact and a cited fact that measure the same
 * quantity and disagree, and nothing noticed: one entry carried `284B`
 * parameters from OpenRouter while the checkpoint's own model card and an
 * independently cited post both said `304B`. Transcribing the feed verbatim was
 * correct and stays correct — a verbatim fact cannot be wrong. What was missing
 * was a way to say *these two facts measure the same thing*.
 *
 * The join is **declared, never inferred.** Field names differ by necessity —
 * the repair for that entry named its cited facts `card_parameters` and
 * `preview_parameters` precisely so they would not collide with the feed-bound
 * `parameters` — so a same-name join finds nothing, and normalising names to
 * find pairs is the fuzzy matching this design refuses everywhere else, for the
 * same reason `feeds` binds on a declared row id: name matching is guessing.
 *
 * It changes no rendering, no authority and no re-check schedule. Declaring
 * that two sources disagree is not adjudicating between them; the comparison
 * lives in `pulse/lib/corroboration.mjs` and its only output is a queue item.
 */
const corroborates = z
  .string()
  .regex(FIELD_NAME_RE, 'must be a snake_case field name naming another fact on this entry')
  .optional();

const citedFact = z
  .object({
    field: z.string().regex(FIELD_NAME_RE, 'must be a snake_case field name'),
    source: z.literal('cited'),
    value: z.union([z.string(), z.number(), z.boolean()]),
    source_url: httpUrl,
    accessed: isoDate,
    volatility: closedList('volatility', VOLATILITIES),
    corroborates,
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
    corroborates,
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
  .strict()
  .superRefine((v, ctx) => {
    // A `corroborates` that names nothing is a declaration that silently never
    // compares anything — the exact failure mode this mechanism exists to end.
    // It fails the build rather than warning, for the same reason `alias:` for
    // `aliases:` does: both parse cleanly and neither does what it says.
    const facts = Array.isArray(v.facts) ? v.facts : [];
    const declared = new Set(facts.map((f) => f?.field).filter((f) => typeof f === 'string'));
    facts.forEach((f, i) => {
      const named = f?.corroborates;
      if (named === undefined) return;
      const where = { code: 'custom', path: ['facts', i, 'corroborates'] };
      if (named === f.field) {
        ctx.addIssue({
          ...where,
          message:
            `entry ${JSON.stringify(v.id)}: fact ${JSON.stringify(f.field)} declares ` +
            `corroborates: ${JSON.stringify(named)}, which is itself — a fact cannot corroborate ` +
            'itself; name the other fact measuring the same quantity, or remove the key',
        });
        return;
      }
      if (!declared.has(named)) {
        ctx.addIssue({
          ...where,
          message:
            `entry ${JSON.stringify(v.id)}: fact ${JSON.stringify(f.field)} declares ` +
            `corroborates: ${JSON.stringify(named)}, but this entry declares no fact with that ` +
            `field. Facts on this entry: ${[...declared].sort().map((d) => JSON.stringify(d)).join(', ') || '(none)'}`,
        });
      }
    });
  });

export const learnSchema = z
  .object({
    title: z.string().min(1, 'must not be empty'),
    level: closedList('level', LEARN_LEVELS),
    // Two surfaces print this string, and neither can supply a missing
    // subject: the page prints it after the label "After this page:", and the
    // ladder index prints it bare. So it has to be a sentence that stands on
    // its own. Before this check the page's label was a sentence *stem*
    // ("After this page you will ") and nothing enforced the matching verb
    // phrase — three styles grew in the tree and every live page rendered a
    // collided junction. A capital first letter is the cheap, checkable form
    // of "this reads as a sentence".
    outcome: z
      .string()
      .min(1, 'must state what the reader will understand after reading')
      .refine((s) => /^[A-Z]/.test(s.trim()), {
        message:
          'must read as a complete sentence on its own, beginning with a capital letter ' +
          '(e.g. "You can trace one word of output ..."). The page prints it after the label ' +
          '"After this page:" and the ladder index prints it bare, so a bare verb phrase such ' +
          'as "be able to ..." renders as a broken junction on both',
      })
      .refine((s) => !/^after (this|reading)\b/i.test(s.trim()), {
        message:
          'must not restate the "After this page:" label the renderer already prints — say what ' +
          'the reader will be able to do, not when',
      }),
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
    // The date a listed tool was discontinued. specs/directory: a dead
    // listing is "marked and kept as record, never silently dropped and never
    // left looking alive" — the marker reads "discontinued <date>", so the
    // field is the date, not a flag. `pulse/lib/freshness.mjs` has read this
    // field since task 3.4 and computes a `discontinued` listing state from
    // it; without it declared here the strict schema rejected every file that
    // could ever produce that state (found in task 4.3).
    discontinued: isoDate.optional(),
  })
  .strict();

/**
 * One end of a capability delta (task 4.14). `date` and `source_url` are both
 * required: the surface's job is to demonstrate the field's pace with
 * receipts, and an end without a receipt is an assertion. `metric` is the
 * optional price-or-number at that end; `what` is the one clause that says
 * what the date is the date *of*.
 */
const deltaEnd = z
  .object({
    date: isoDate,
    what: z.string().min(1, 'must say in one clause what happened on that date'),
    source_url: httpUrl,
    metric: z.string().min(1).optional(),
  })
  .strict();

export const deltaSchema = z
  .object({
    title: z.string().min(1, 'must not be empty'),
    capability: z
      .string()
      .min(1, 'must state the capability in one plain sentence'),
    impossible: deltaEnd,
    routine: deltaEnd,
    mentions: z.array(entryId).default([]),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.impossible.date > v.routine.date) {
      ctx.addIssue({
        code: 'custom',
        path: ['routine', 'date'],
        message: `the routine end (${v.routine.date}) is dated before the impossible end (${v.impossible.date}) — a delta runs from research result to commodity, not the other way`,
      });
    }
  });

export const SCHEMAS = {
  entry: entrySchema,
  learn: learnSchema,
  tutorial: tutorialSchema,
  post: postSchema,
  tool: toolSchema,
  delta: deltaSchema,
};

/**
 * ---------------------------------------------------------------------------
 * IS THIS FIELD AUTHOR PROSE? (specs/wiki, beads addictedtoai-48r)
 *
 * `lib/currency.mjs` warns on volatile literals in prose. It scanned BODIES
 * only — and deltas are almost entirely front matter, so the check was VACUOUS
 * ON 23 OF 29 of them, and on every other front-matter prose field in the
 * corpus. A check that runs on nothing prints the same clean result as a check
 * that runs on everything, and that indistinguishability is the defect.
 *
 * Two corrections belong on the record, because acting on the wrong one would
 * damage correct files. Nothing was rotting: eight front-matter currency
 * literals exist across four files and every one sits inside a delta end, whose
 * `date` is a REQUIRED field of `deltaEnd` above — a delta end is a dated
 * historical claim by construction, and a dated observation does not rot. The
 * anchoring was a mechanism all along, not author convention. And the fix is
 * not a bigger scan: it is an EXHAUSTIVENESS rule. Every string-valued field of
 * every content schema is classified here, in one place, and a field in neither
 * list fails the build — the same discipline that makes adding a content field
 * an edit to this file, for the same reason (`alias:` where `aliases:` was
 * meant parses cleanly and nothing downstream notices).
 *
 * The narrow scan is the consequence, not the mechanism. After the date-sibling
 * exemption in `lib/currency.mjs`, the fields actually scanned today are
 * `delta.capability` and `learn.outcome`; the point is that a NEW string field
 * cannot arrive unclassified, which is the vector by which this blind spot
 * re-opens.
 *
 * NAMES ARE EXCLUDED ON PURPOSE. `title`, `display_name` and `aliases[].name`
 * identify the things this site is about, and things in this field are named
 * `Claude 4.5` and `GPT-5.2`. The version rule in `lib/currency.mjs` matches
 * `[A-Z][A-Za-z0-9]* v?\d+\.\d+`, so scanning names would warn on a large
 * fraction of the corpus for stating a name correctly — the definition of noise,
 * and noise is how a guardrail gets switched off.
 * ---------------------------------------------------------------------------
 */

/** Author-written sentences. These are scanned by the volatile-literal check. */
export const PROSE_FIELDS = Object.freeze({
  entry: Object.freeze([]),
  learn: Object.freeze(['outcome']),
  tutorial: Object.freeze([]),
  post: Object.freeze(['corrections[].text']),
  tool: Object.freeze(['pricing']),
  delta: Object.freeze([
    'capability',
    'impossible.what',
    'impossible.metric',
    'routine.what',
    'routine.metric',
  ]),
});

/**
 * Everything else, each with the reason it is not author prose. The reason is
 * the part that has to be kept true: a path added here without one is a field
 * exempted by silence, which is what this whole mechanism exists to stop.
 */
export const NON_PROSE_FIELDS = Object.freeze({
  entry: Object.freeze({
    id: 'an identifier',
    kind: 'a closed-list value',
    display_name: 'a name — the site is about things called "Claude 4.5"',
    'aliases[].name': 'a name, for the same reason',
    'aliases[].class': 'a closed-list value',
    status: 'a closed-list value',
    maintenance: 'a closed-list value',
    'feeds.*': 'a source row id',
    'facts[].field': 'a snake_case field name',
    'facts[].corroborates':
      'a snake_case field name — it names another fact on the same entry, and a declared join ' +
      'is not a sentence',
    'facts[].source': 'a discriminator literal',
    'facts[].value':
      'the wiki DATA LAYER — a fact is bound or cited, never restated, and lib/currency.mjs ' +
      'excludes it on purpose',
    'facts[].source_url': 'a URL',
    'facts[].accessed': 'an ISO date',
    'facts[].volatility': 'a closed-list value',
    'facts[].feed': 'a source id',
    'facts[].path': 'a dotted path into a feed row',
    'timeline[].date': 'an ISO date',
    'timeline[].event':
      'MECHANICALLY MAINTAINED — `timeline` is the whole of MECHANICAL_FRONT_MATTER_KEYS in ' +
      'lib/review-hash.mjs, written by the Pulse under the review exemption, so it is not ' +
      'author-written at all',
    'timeline[].source_url': 'a URL',
    'mentions[]': 'an entry id',
    'themes[]': 'a theme name',
  }),
  learn: Object.freeze({
    title: 'a name',
    level: 'a closed-list value',
    'prerequisites[]': 'a learn page slug',
    'mentions[]': 'an entry id',
  }),
  tutorial: Object.freeze({
    title: 'a name',
    'subjects[]': 'an entry id',
    'verified_against.*':
      'a version string by design, and anchored by the sibling `verified_on` it is displayed with',
    verified_on: 'an ISO date',
    'mentions[]': 'an entry id',
  }),
  post: Object.freeze({
    title: 'a name',
    date: 'an ISO date',
    'mentions[]': 'an entry id',
    'corrections[].date': 'an ISO date',
  }),
  tool: Object.freeze({
    title: 'a name',
    url: 'a URL',
    last_verified: 'an ISO date',
    entry: 'an entry id',
    'mentions[]': 'an entry id',
    discontinued: 'an ISO date',
  }),
  delta: Object.freeze({
    title: 'a name',
    'impossible.date': 'an ISO date',
    'impossible.source_url': 'a URL',
    'routine.date': 'an ISO date',
    'routine.source_url': 'a URL',
    'mentions[]': 'an entry id',
  }),
});

/**
 * Every string-valued field path in one schema, walked from the schema itself.
 *
 * Walked, never listed by hand: a hand-maintained inventory of the fields would
 * be a second copy of the schema, and the whole point is that a field ADDED to
 * the schema shows up here without anyone remembering to add it. A union
 * contributes each branch at the same path, so `facts[].value` (string | number
 * | boolean) is one string-valued field, not three.
 */
export function stringFieldPaths(schema) {
  const out = new Set();
  const walk = (s, path, depth) => {
    const def = s?._zod?.def;
    if (!def || depth > 12) return;
    switch (def.type) {
      case 'object':
        for (const [k, v] of Object.entries(def.shape)) walk(v, path ? `${path}.${k}` : k, depth + 1);
        return;
      case 'optional':
      case 'default':
      case 'nullable':
      case 'nonoptional':
      case 'readonly':
      case 'catch':
        return walk(def.innerType, path, depth + 1);
      case 'pipe':
        return walk(def.out ?? def.in, path, depth + 1);
      case 'array':
        return walk(def.element, `${path}[]`, depth + 1);
      case 'record':
        return walk(def.valueType, `${path}.*`, depth + 1);
      case 'union':
        for (const o of def.options ?? []) walk(o, path, depth + 1);
        return;
      case 'string':
        out.add(path);
        return;
      case 'literal':
        // A literal's values are what the field can hold; when they are strings
        // the field is string-valued and has to be classified like any other.
        if ((def.values ?? []).every((v) => typeof v === 'string')) out.add(path);
        return;
      default:
        return;
    }
  };
  walk(schema, '', 0);
  return [...out].sort();
}

/**
 * The classification, checked against the schemas. Pure — returns findings.
 *
 * Three ways to be wrong, and all three are silent failures of the mechanism
 * rather than of the content: a field in NEITHER list is scanned by nobody and
 * classified by nobody; a field in BOTH is a classification that does not say
 * what it means; and a classified path that no longer exists is a
 * classification that has quietly stopped describing the schema.
 */
export function classificationProblems({
  schemas = SCHEMAS,
  prose: proseBy = PROSE_FIELDS,
  nonProse: nonProseBy = NON_PROSE_FIELDS,
} = {}) {
  const problems = [];
  for (const [type, schema] of Object.entries(schemas)) {
    const actual = stringFieldPaths(schema);
    const prose = new Set(proseBy[type] ?? []);
    const nonProse = new Set(Object.keys(nonProseBy[type] ?? {}));
    for (const path of actual) {
      const inProse = prose.has(path);
      const inNon = nonProse.has(path);
      if (inProse && inNon) {
        problems.push(
          `${type}.${path} is in BOTH PROSE_FIELDS and NON_PROSE_FIELDS — a field cannot be ` +
            'author prose and not author prose at once',
        );
      } else if (!inProse && !inNon) {
        problems.push(
          `${type}.${path} is a string-valued schema field classified in neither PROSE_FIELDS ` +
            'nor NON_PROSE_FIELDS. Add it to one in lib/schema.mjs: author-written sentences go ' +
            'in PROSE_FIELDS and are scanned for volatile literals; anything else goes in ' +
            'NON_PROSE_FIELDS with the reason it is not prose',
        );
      }
    }
    for (const path of [...prose, ...nonProse]) {
      if (!actual.includes(path)) {
        problems.push(
          `${type}.${path} is classified in lib/schema.mjs but is not a string-valued field of ` +
            'that schema any more — remove it, or the classification has stopped describing the schema',
        );
      }
    }
  }
  return problems;
}

/** The build gate. Throws naming every offending field, never only the first. */
export function assertFieldsClassified(opts = {}) {
  const problems = classificationProblems(opts);
  if (problems.length === 0) return true;
  throw new Error(
    `${problems.length} unclassified or misclassified schema field(s):\n${problems
      .map((p) => `  - ${p}`)
      .join('\n')}`,
  );
}

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
