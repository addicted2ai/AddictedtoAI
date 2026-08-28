/**
 * tutorials.mjs — the verification state of a tutorial (task 4.5,
 * specs/education-dynamic).
 *
 * *"A tutorial page SHALL be structurally unable to render without its
 * verification state; silent staleness is the named enemy of this surface."*
 * That is why this returns a state for **every** tutorial, `fresh` included,
 * and why the template renders `state.stamp` unconditionally: there is no
 * branch in which a tutorial renders with no verification line.
 *
 * Five states, in the order they are decided. The order is the rule, not a
 * preference:
 *
 *   archived  a subject entry is `retired` or `dead`. Decided first because
 *             specs/education-dynamic says archival "is the correct end
 *             state, not re-verification" — a tutorial about a dead thing is
 *             not stale, it is finished. It also does not block new tutorials
 *             the way a demoted one does (specs/loop, task 7.8b).
 *   demoted   unverified for 2x `reverify_days`: noindex, delisted,
 *             full-width notice, URL still resolves.
 *   moved-on  the data layer knows a subject changed under it — a newer
 *             version than the one declared in `verified_against`, or a
 *             subject whose status went `deprecated`. Named, never implied.
 *   stale     past `reverify_days` but not yet twice it.
 *   fresh     none of the above.
 *
 * A tutorial can be both moved-on and stale; `moved-on` wins because it says
 * something specific ("verified against 0.32, now 0.45") and `stale` only
 * says time passed. Both banners state the same date, so nothing is lost.
 *
 * **How "a newer version in a feed" is decided.** `verified_against` maps a
 * subject id to the version string the steps were run against. A subject's
 * *current* version is the resolved value of a fact on that entry whose field
 * is `version` — feed-bound or cited, either way it is the entry's own
 * sourced record of its version. If a subject declares no `version` fact
 * there is nothing to compare and no moved-on claim is made: this module
 * never infers a version from a name, a slug or a date.
 */

import { daysBetween, todayIso, resolveFact } from './facts.mjs';

export const STATES = ['fresh', 'stale', 'moved-on', 'demoted', 'archived'];

/** Statuses that retire a tutorial rather than staling it. */
const DEAD_STATUSES = new Set(['retired', 'dead']);
/** Statuses that are worth naming in a banner but do not archive. */
const MOVED_ON_STATUSES = new Set(['deprecated']);

/** The entry's own recorded version, or null when it records none. */
export function currentVersionOf(entry, ctx) {
  if (!entry) return null;
  const fact = (entry.data.facts ?? []).find((f) => f.field === 'version');
  if (!fact) return null;
  const r = resolveFact(fact, {
    dataLayer: ctx.dataLayer,
    feeds: entry.data.feeds ?? {},
    today: ctx.today,
    entryId: entry.data.id,
  });
  if (r.state === 'no-data' || r.state === 'absent') return null;
  return r.value == null ? null : String(r.value);
}

/**
 * The status the data layer knows a subject to be in. The entry's front
 * matter is the record; a feed-bound `status` fact overrides it when the feed
 * has moved, because that is what "the Pulse's data layer knows" means.
 */
export function currentStatusOf(entry, ctx) {
  if (!entry) return null;
  const fact = (entry.data.facts ?? []).find((f) => f.field === 'status');
  if (fact) {
    const r = resolveFact(fact, {
      dataLayer: ctx.dataLayer,
      feeds: entry.data.feeds ?? {},
      today: ctx.today,
      entryId: entry.data.id,
    });
    if (r.state === 'feed' || r.state === 'cited') return String(r.value);
  }
  return entry.data.status;
}

/**
 * @param {object} doc  a tutorial doc from `loadCorpus`
 * @param {object} ctx  { byId, dataLayer, today }
 * @returns {{
 *   state: 'fresh'|'stale'|'moved-on'|'demoted'|'archived',
 *   indexed: boolean, listed: boolean,
 *   age_days: number, reverify_days: number, verified_on: string,
 *   stamp: {subject: string, id: string, url: string, version: string}[],
 *   notice: string|null,
 *   moved: {id: string, url: string, subject: string, verified: string,
 *           current: string|null, status: string|null}[]
 * }}
 */
export function tutorialState(doc, ctx) {
  const today = ctx.today ?? todayIso();
  const byId = ctx.byId;
  const fm = doc.data;
  const age = daysBetween(fm.verified_on, today) ?? 0;
  const interval = fm.reverify_days;

  const stamp = fm.subjects.map((id) => {
    const entry = byId.get(id);
    return {
      id,
      subject: entry?.data.display_name ?? id,
      url: entry?.url ?? `/wiki/${id}`,
      version: fm.verified_against[id],
    };
  });

  const dead = [];
  const moved = [];
  for (const id of fm.subjects) {
    const entry = byId.get(id);
    const status = currentStatusOf(entry, { ...ctx, today });
    const current = currentVersionOf(entry, { ...ctx, today });
    const declared = fm.verified_against[id];
    const row = {
      id,
      url: entry?.url ?? `/wiki/${id}`,
      subject: entry?.data.display_name ?? id,
      verified: declared,
      current,
      status: status ?? null,
    };
    if (DEAD_STATUSES.has(status)) dead.push(row);
    else if (MOVED_ON_STATUSES.has(status) || (current && current !== declared)) moved.push(row);
  }

  const base = {
    age_days: age,
    reverify_days: interval,
    verified_on: fm.verified_on,
    stamp,
    moved,
    dead,
  };

  if (dead.length > 0) {
    const names = dead.map((d) => `${d.subject} (${d.status})`).join(', ');
    return {
      ...base,
      state: 'archived',
      indexed: false,
      listed: false,
      notice:
        `Archived. This tutorial's subject is no longer alive: ${names}. ` +
        `The steps are kept as a record of how it worked; the entry carries the current state.`,
    };
  }

  if (age > interval * 2) {
    return {
      ...base,
      state: 'demoted',
      indexed: false,
      listed: false,
      notice:
        `Not re-verified since ${fm.verified_on} — ${age} days, more than twice this tutorial's ` +
        `${interval}-day interval. It has been removed from the tutorials index and is no longer ` +
        `indexed for search engines. The steps below may no longer work. This URL keeps resolving.`,
    };
  }

  if (moved.length > 0) {
    const parts = moved.map((m) =>
      m.current
        ? `${m.subject} was verified at ${m.verified} and is now at ${m.current}`
        : `${m.subject} is now ${m.status}`,
    );
    return {
      ...base,
      state: 'moved-on',
      indexed: true,
      listed: true,
      notice: `The subject moved: ${parts.join('; ')}. The steps below were last run on ${fm.verified_on}.`,
    };
  }

  if (age > interval) {
    return {
      ...base,
      state: 'stale',
      indexed: true,
      listed: true,
      notice:
        `Not re-verified since ${fm.verified_on} (${age} days, interval ${interval}). ` +
        `The steps may no longer reflect current behavior.`,
    };
  }

  return { ...base, state: 'fresh', indexed: true, listed: true, notice: null };
}

/** Every tutorial with its state, newest verification first. */
export function tutorialStates(corpus, ctx) {
  return corpus.tutorial
    .map((doc) => ({ doc, state: tutorialState(doc, { ...ctx, byId: corpus.byId }) }))
    .sort((a, b) => b.doc.data.verified_on.localeCompare(a.doc.data.verified_on));
}
