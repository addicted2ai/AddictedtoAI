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

// The registrable-domain rule, stated once (specs/wiki). `publishes_from`'s
// build gate reads it here; nothing in this file re-derives a suffix table.
import { checkPublishesFromValue } from './vendor-domain.mjs';
import { TOOL_CATEGORIES } from './tool-categories.mjs';

export { TOOL_CATEGORIES };

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

// TOOL_CATEGORIES now lives in `./tool-categories.mjs` (addictedtoai-bju) —
// re-exported above, immediately after the zod import, so every existing
// importer of `TOOL_CATEGORIES` from this file keeps working unchanged. See
// that file for the full rationale (closed list, declared-never-inferred,
// order carries no authority, `video`'s deliberate absence). Split out so
// `app/_components/SearchBox.tsx` can read the vocabulary without pulling
// `zod` and every content schema into the client bundle.

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

/**
 * `Date.parse` is not the calendar check its name suggests, and this refinement
 * used to be only `Date.parse`. Measured 2026-08-30 on Node 24:
 * `Date.parse('2026-02-31T00:00:00Z')` returns a number — V8 rolls the overflow
 * forward to 3 March — while `2026-13-01` is correctly NaN. So the old check
 * rejected an impossible *month* and accepted an impossible *day*, under a
 * message that promised to reject both.
 *
 * The round trip is the honest form: a date that survives parsing and formats
 * back to the string it came from is a real day. Verified before landing
 * against every ISO date literal in the tree — 4,166 of them across 886 files,
 * 311 distinct — of which none is rejected by this rule, so it tightens the
 * gate without moving any existing file.
 */
function isRealCalendarDay(s) {
  const t = Date.parse(`${s}T00:00:00Z`);
  if (Number.isNaN(t)) return false;
  return new Date(t).toISOString().slice(0, 10) === s;
}

const isoDate = z
  .string()
  .regex(ISO_DATE_RE, 'must be an ISO date, YYYY-MM-DD')
  .refine(isRealCalendarDay, 'is not a real calendar date');

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
 * the repair for that entry named its cited facts `repository_tensor_total` and
 * `preview_parameters`, neither of which can collide with the feed-bound
 * `parameters` and the first of which shares no word with it — so a same-name
 * join finds nothing, and normalising names to find pairs is the fuzzy matching
 * this design refuses everywhere else, for the same reason `feeds` binds on a
 * declared row id: name matching is guessing.
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
    /**
     * The registrable domains this party publishes from (specs/wiki,
     * `separate-a-claim-from-a-fact`).
     *
     * EDITORIAL AND DECLARED, never inferred from the entry's own cited source
     * URLs, its title or its aliases. Asserting that a domain belongs to an
     * organisation is a judgment about who owns what, and a wrong one
     * attributes a stranger's words to a named company — so it publishes
     * through review like any other judgment, and it is NOT exempted from the
     * reviewed surface.
     *
     * NOT `aliases`, and the divergence from DESK-ORDER-001 §2 is deliberate
     * (K48). An alias is a NAME — `aliases[].name` is classified below as "a
     * name — the site is about things called 'Claude 4.5'" — and the alias
     * registry is what decides linking (`lib/aliases.mjs`), so a hostname there
     * is a name the wrap-only linker may one day put in prose. It would also
     * force every consumer to guess which aliases are domains by their string
     * shape, which is the field-name-for-source-test substitution this whole
     * change exists to end.
     *
     * NOTHING CAN DETECT AN ABSENT DECLARATION (red-team FM-N6). A real vendor
     * claim from an undeclared brand domain renders as a blank that is
     * byte-identical to the blank a subject with no claims correctly produces.
     * That undetectability is why the burden sits on an org entry's editorial
     * completeness rather than on a gate: a gate can catch a wrong declaration
     * and can never catch a missing one.
     */
    publishes_from: z.array(z.string().min(1)).optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    // Each value must be a REGISTRABLE domain, so the field is a statement
    // about a registrant rather than a list of URLs to keep current: declaring
    // `kimi.ai` covers `platform.kimi.ai` and every other host under it.
    (v.publishes_from ?? []).forEach((value, i) => {
      const check = checkPublishesFromValue(value);
      if (check.ok) return;
      ctx.addIssue({
        code: 'custom',
        path: ['publishes_from', i],
        message:
          check.reduction
            ? `entry ${JSON.stringify(v.id)}: publishes_from value ${JSON.stringify(value)} is a ` +
              `host, not a registrable domain — declare ${JSON.stringify(check.reduction)} instead, ` +
              'which covers every host under it'
            : `entry ${JSON.stringify(v.id)}: publishes_from value ${JSON.stringify(value)} has no ` +
              'registrable domain — it is a bare public suffix or not a host at all',
      });
    });
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

/**
 * A change-feed reference — the anchor a news note declares when the Pulse
 * observed the event itself (`specs/blog`, change `make-the-blog-worth-sending`
 * task 3.4).
 *
 * `key` is the `key` field of a line in `data/changes.jsonl`, verbatim
 * (`seed|llm-releases|<guid>`), and `date` is that line's date. Both are
 * required and neither is inferred from the other: the build check resolves the
 * pair against the feed and fails naming the post and the reference, so a
 * mistyped key is a stop rather than a page that quietly claims an anchor it
 * does not have.
 *
 * The key is deliberately a free string with no pattern: its shape is the
 * Pulse's (`<source-kind>|<source>|<row guid>`), and a regex here would be a
 * second, drifting copy of a format this file does not own.
 */
const coversRef = z
  .object({
    key: z
      .string()
      .min(1, 'must be the `key` of a line in data/changes.jsonl, copied verbatim'),
    date: isoDate,
  })
  .strict();

/**
 * An external anchor — a primary-source URL and the event's date, for an event
 * outside the Pulse's aperture.
 *
 * Weaker than `covers:` on purpose, and specs/blog says so: `data/changes.jsonl`
 * is written only by the deterministic Pulse and an unresolved reference fails
 * the build, whereas a URL is claimable. Its *date* is held mechanically (the
 * two-sided 7-day window check) and its *content* by review's mandatory fetch.
 */
const externalAnchor = z
  .object({
    url: httpUrl,
    date: isoDate,
  })
  .strict();

export const postSchema = z
  .object({
    title: z.string().min(1, 'must not be empty'),
    date: isoDate,
    // The anchor, in either or both of its two forms. Optional at the schema
    // level and required by review, not here: a post that declares neither is
    // a synthesis, which is a legitimate form (specs/blog, "A post takes one of
    // two forms"), so a required field would reject half the corpus by shape.
    // What is *declared* is checked mechanically — see lib/anchors.mjs.
    covers: z.array(coversRef).default([]),
    anchor: externalAnchor.optional(),
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
    // What job the tool is for, from the closed list above. REQUIRED, not
    // defaulted: a default is a catch-all, and a catch-all that collects a
    // third of the directory defeats the point of grouping by job at all. A
    // new listing states its category or it does not build.
    category: closedList('tool category', TOOL_CATEGORIES),
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

/**
 * ---------------------------------------------------------------------------
 * THE VENDOR CLAIM RECORD (specs/wiki, `separate-a-claim-from-a-fact`).
 *
 * A **vendor claim** is a thing a party said about itself or its product. A
 * **fact** is a value the site records with a source. The corpus had only the
 * second shape, and the cost was paid twice: both finalist builds of the
 * Frontier rendered organisation founding dates and founders under
 * "claimed · unverified", independently, because the only structure available
 * for "what this vendor says" was "any cited fact" (implementer ledger rows 2
 * and 4). All thirteen `founded` facts a first-cited-fact rule selects are
 * cited from `en.wikipedia.org`, so what shipped was an encyclopaedia's account
 * of an incorporation presented as a company's own words.
 *
 * RD-004 states the confusion exactly: *`source: cited` records that a value
 * carries a citation, never that the citation is the vendor's own assertion.*
 *
 * `subject` is resolved against the corpus in `lib/corpus.mjs`, exactly as
 * `mentions` is — declared, never inferred, for the same reason `feeds` binds
 * on a declared row id. `field` names what the claim is ABOUT and is
 * deliberately NOT resolved against the subject's `facts`: a claim record and a
 * cited fact sharing a name is exactly the collapse this record exists to
 * prevent, and a build that joined them would rebuild the defect out of the
 * repair.
 * ---------------------------------------------------------------------------
 */

/**
 * A confirmation. All three fields are required, and that is the whole point:
 * a confirmation with no verifier, no document and no date is a claim about a
 * check rather than a record of one.
 */
const verification = z
  .object({
    by: z.string().min(1, 'must name who confirmed it'),
    url: httpUrl,
    date: isoDate,
  })
  .strict();

/**
 * The message a rejected `verified` value gets.
 *
 * A bare union rejection names the union and teaches nothing — zod's own text
 * for `verified: true` is *"Invalid input"* — and the reader of a build failure
 * here is a weak model at 2am. Worse, the object-level `superRefine` below
 * cannot supply this: zod does not run a refinement once the shape has failed,
 * so `verified: true` never reaches it. The message has to live on the union.
 *
 * `verified: true` is the `intent-not-measurement` defect written into the
 * schema: a confirmation with no verifier, no document and no date is a claim
 * about a check rather than a record of one.
 */
function verifiedError(issue) {
  const three =
    'a confirmation carries `by` (who checked it), `url` (the document that supports it) and ' +
    '`date` (the local date it was checked)';
  if (issue.input === true) {
    return (
      `verified: true is not a confirmation — ${three}. Write those three, or write ` +
      '`verified: false` if you looked and could not confirm it, or omit the key entirely if ' +
      'nobody has looked: absent renders no statement about verification at all, and that is the ' +
      'honest day-one state'
    );
  }
  if (issue.input && typeof issue.input === 'object' && !Array.isArray(issue.input)) {
    const detail = verification.safeParse(issue.input);
    const why = detail.success
      ? ''
      : ` (${detail.error.issues.map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`).join('; ')})`;
    return `verified is not a well-formed confirmation${why} — ${three}`;
  }
  return (
    `verified must be omitted (nobody looked — nothing renders), \`false\` (someone looked and ` +
    `could not confirm it), or a confirmation: ${three}. It was ` +
    `${JSON.stringify(issue.input)}`
  );
}

export const claimSchema = z
  .object({
    subject: entryId,
    field: z
      .string()
      .regex(FIELD_NAME_RE, 'must be a snake_case name for the ability or field the claim is about'),
    quote: z.string().min(1, 'must carry the claim in the source\'s own words, verbatim'),
    source_url: httpUrl,
    source_host: z
      .string()
      .regex(/^[a-z0-9.-]+$/, 'must be the lowercased host of source_url, with no scheme, port or path'),
    accessed: isoDate,
    /**
     * THREE STATES, AND THEY ARE NOT TWO. A boolean loses the ABSENT case,
     * which is the honest day-one state for most rows:
     *
     *   absent          nobody looked. A surface renders NO statement about
     *                   verification at all — not "unverified", not an empty
     *                   slot that reads as a negative finding.
     *   false           someone looked and did not confirm it.
     *   {by,url,date}   someone looked and confirmed it, with evidence.
     */
    verified: z.union([z.literal(false), verification], { error: verifiedError }).optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    // The host is redundant on purpose — it is the input to the vendor test, so
    // carrying it puts that input in the file a reviewer reads instead of
    // behind a URL parse at render time. Redundant and unchecked would be
    // worse than absent: the test would read a host the URL does not have.
    let parsed = null;
    try {
      parsed = new URL(String(v.source_url)).hostname.toLowerCase();
    } catch {
      return; // `source_url` already failed its own check
    }
    if (parsed !== String(v.source_host ?? '').toLowerCase()) {
      ctx.addIssue({
        code: 'custom',
        path: ['source_host'],
        message:
          `source_host is ${JSON.stringify(v.source_host)} but the host of source_url is ` +
          `${JSON.stringify(parsed)} — they must be the same string, lowercased. source_host is ` +
          'the input to the vendor test; a host that disagrees with its own URL attributes the ' +
          'claim to whoever the wrong host belongs to',
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
  claim: claimSchema,
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
  // A claim record has no author-written sentence in it. Every field is an
  // identifier, a URL, a date, or the source's own words transcribed — see
  // NON_PROSE_FIELDS.claim below for the reason on each.
  claim: Object.freeze([]),
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
    'publishes_from[]':
      'a registrable domain — a host, not a sentence and deliberately not a NAME either: it is ' +
      'not in `aliases` precisely because an alias is a name and the alias registry decides what ' +
      'the linker wraps in prose',
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
    'covers[].key':
      'a change-feed line key — an identifier the Pulse minted, copied verbatim, and resolved ' +
      'against data/changes.jsonl by the build',
    'covers[].date': 'an ISO date',
    'anchor.url': 'a URL',
    'anchor.date': 'an ISO date',
    'mentions[]': 'an entry id',
    'corrections[].date': 'an ISO date',
  }),
  tool: Object.freeze({
    title: 'a name',
    url: 'a URL',
    last_verified: 'an ISO date',
    entry: 'an entry id',
    category: 'a closed-list value',
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
  claim: Object.freeze({
    subject: 'an entry id',
    field: 'a snake_case field name — it names what the claim is ABOUT, and a name is not a sentence',
    quote:
      'the DATA LAYER, transcribed — the claim in the source\'s own words, verbatim, for exactly ' +
      'the reason `facts[].value` is non-prose: a verbatim record cannot be wrong, and editing it ' +
      'to read better would make it stop being a quotation. The volatile-literal scan would in ' +
      'any case exempt it: lib/currency.mjs forgives a value with a sibling `accessed` date, and ' +
      'this record carries one by construction — that is the mechanical exemption, not a ' +
      'blessed-field list, so the classification here is the load-bearing half',
    source_url: 'a URL',
    source_host:
      'a host — the lowercased hostname of `source_url`, checked equal to it, and the input to ' +
      'the vendor test',
    accessed: 'an ISO date',
    'verified.by': 'a name — who confirmed the claim',
    'verified.url': 'a URL — the document that supports the confirmation',
    'verified.date': 'an ISO date',
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
