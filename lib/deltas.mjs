/**
 * deltas.mjs — Impossible → Routine (task 4.14, specs/site).
 *
 * *"The showpiece exists because gates filter dullness out but cannot put
 * astonishment in: this surface's whole job is to demonstrate the field's
 * pace with receipts instead of asserting it, and dated pairs do not
 * perish."*
 *
 * The schema does the enforcing (`deltaSchema` in schema.mjs): both ends'
 * `date` and `source_url` are required, so an unsourced end fails the build
 * and cannot publish. This module does the arithmetic and the ordering — the
 * two things that turn a pair of dates into a demonstration:
 *
 *   `span`  the elapsed time between the two ends, stated plainly ("11 years,
 *           4 months"). It is computed, never authored, so it cannot drift
 *           from the dates it describes and no author can round it up.
 *   order   newest first by the **routine** end. The surface is about things
 *           becoming ordinary; the most recent thing to become ordinary is
 *           the most interesting line on the page.
 *
 * No intensifiers are produced anywhere in this file. The subject carries the
 * awe; the numbers are the argument.
 */

/** Whole years and months between two ISO dates, never negative. */
export function spanBetween(fromIso, toIso) {
  const a = new Date(`${fromIso}T00:00:00Z`);
  const b = new Date(`${toIso}T00:00:00Z`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) {
    return { years: 0, months: 0, days: 0, text: '' };
  }
  let years = b.getUTCFullYear() - a.getUTCFullYear();
  let months = b.getUTCMonth() - a.getUTCMonth();
  let days = b.getUTCDate() - a.getUTCDate();
  if (days < 0) {
    months -= 1;
    const prev = new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0));
    days += prev.getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days, text: spanText(years, months, days) };
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function spanText(years, months, days) {
  const parts = [];
  if (years > 0) parts.push(plural(years, 'year'));
  if (months > 0) parts.push(plural(months, 'month'));
  if (parts.length === 0) parts.push(plural(Math.max(days, 0), 'day'));
  return parts.join(', ');
}

/**
 * One delta, ready to render.
 * @returns {{doc, slug, url, title, capability, impossible, routine, span}}
 */
export function deltaView(doc) {
  const d = doc.data;
  return {
    doc,
    slug: doc.slug,
    url: doc.url,
    title: d.title,
    capability: d.capability,
    impossible: d.impossible,
    routine: d.routine,
    span: spanBetween(d.impossible.date, d.routine.date),
  };
}

/** Newest first by the routine end; ties broken by the impossible end. */
export function deltasNewestFirst(deltaDocs) {
  return [...deltaDocs]
    .map(deltaView)
    .sort(
      (a, b) =>
        b.routine.date.localeCompare(a.routine.date) ||
        a.impossible.date.localeCompare(b.impossible.date) ||
        a.slug.localeCompare(b.slug),
    );
}

/** The stated sort criterion, printed on the page (specs/directory's rule). */
export const DELTAS_SORT = 'the date it became routine, newest first';

/**
 * The shape of the surface in one line, for the home page and the index:
 * how many pairs, and the range of years they cover.
 */
export function deltaRange(views) {
  if (views.length === 0) return null;
  const dates = views.flatMap((v) => [v.impossible.date, v.routine.date]).sort();
  return { count: views.length, from: dates[0], to: dates[dates.length - 1] };
}
