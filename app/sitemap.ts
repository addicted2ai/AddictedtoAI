import type { MetadataRoute } from 'next';
import { getSite } from '../lib/site.mjs';
import { absoluteUrl } from '../lib/site-config.mjs';
import { recencyOf } from '../lib/reviews.mjs';

/**
 * The sitemap (task 4.9, specs/site).
 *
 * It lists what a crawler should index, which is not the same as what the
 * site serves: a stub entry, a demoted tutorial and an archived one all keep
 * resolving (no published URL ever 404s) and none of them belongs in a
 * sitemap. The rule is the same one the pages use for `robots`, read from the
 * same derived state, so the two can never disagree.
 *
 * ---------------------------------------------------------------------------
 * `lastModified`, and why this site can state one truthfully (addictedtoai-dwo)
 *
 * Crawlers discount `lastmod` because it is near-universally faked — a
 * template change, a rebuild, or a clock is passed off as a content change.
 * The field is only worth sending when it answers "did what this page SAYS
 * move", and this repository is the unusual case that can answer that from
 * committed state. A wiki entry page is exactly two things: **prose**, and the
 * **bound facts** rendered into it. So its `lastModified` is the later of the
 * two dates the corpus already records for those two things:
 *
 *   prose     the `date:` inside the review record that bound to this file
 *             (`lib/reviews.mjs`). A record exists because a job MERGED that
 *             file, and the merge step writes `subject:`/`reviewed:` naming
 *             the files that actually landed — so a new record means the bytes
 *             moved. Never a filesystem mtime and never a git commit date:
 *             both are checkout artifacts that would report the DEPLOY date
 *             for every page, which is precisely the lie the field suffers
 *             from (`lib/reviews.mjs` `recencyOf` makes the same argument for
 *             the same reason).
 *
 *   facts     the newest line of `site.changes` that joins to this entry —
 *             the CHANGED FEED ITSELF, read rather than re-derived. That is
 *             deliberate: `addictedtoai-8ho` settled what counts as a material
 *             change (an `event: false` field is a catalog column and a bound
 *             fact but not an event, and a value on a clock-scheduled row is
 *             not a change at all), and a second definition written here would
 *             let the sitemap and the front page disagree about what changed.
 *             Reading the same array means they cannot. Transcluded facts
 *             count too — `{{fact:other-entry.field}}` renders another entry's
 *             value into THIS page, so a move in it moves this page's text.
 *
 * Nothing here reads a clock. Both inputs are committed data, so a rebuild
 * tomorrow with no world change emits byte-identical `lastmod` values — the
 * same property `data/derived/` has, and the one thing that separates an
 * honest signal from a daily tick.
 *
 * A page with neither date ships without `lastModified`, as before. Absence is
 * the honest answer, and the error direction throughout is conservative: a
 * hand edit that never went through review understates recency rather than
 * inventing it.
 *
 * MEASURED 2026-08-29 over the 176 URLs: 156 now carry a date, up from 71.
 * The wiki's 83 browsable entries go from 0 to 75; `learn`'s 10 from 0 to 10.
 */

export const dynamic = 'force-static';

/** The later of two `YYYY-MM-DD` strings; either may be absent. */
function later(a?: string, b?: string): string | undefined {
  if (a && b) return a > b ? a : b;
  return a ?? b ?? undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const urls: MetadataRoute.Sitemap = [];
  const add = (path: string, lastModified?: string) =>
    urls.push({ url: absoluteUrl(path), lastModified: lastModified ? new Date(`${lastModified}T12:00:00Z`) : undefined });

  // Entry id -> the newest changed-feed line that joins to it. Built from the
  // feed the home page renders, so materiality is defined in exactly one place.
  const changedOn = new Map<string, string>();
  for (const line of site.changes) {
    if (!line.entry?.id || !line.date) continue;
    const prev = changedOn.get(line.entry.id);
    if (!prev || line.date > prev) changedOn.set(line.entry.id, line.date);
  }

  /** The `date:` of the review record that bound to this file — the prose date. */
  const reviewedOn = (doc: any): string | undefined => {
    const hit = site.reviews.byFile.get(doc.file);
    const r = hit ? recencyOf(hit.record) : null;
    return r ? `${r.day.slice(0, 4)}-${r.day.slice(4, 6)}-${r.day.slice(6, 8)}` : undefined;
  };

  /** The newest material change in anything this page renders — its own bound
   *  facts, and any fact it transcluded from another entry. */
  const factsMovedOn = (doc: any): string | undefined => {
    let best = doc.data?.id ? changedOn.get(doc.data.id) : undefined;
    for (const ref of doc.transcluded?.facts ?? []) best = later(best, changedOn.get(String(ref).split('#')[0]));
    return best;
  };

  const contentChangedOn = (doc: any) => later(reviewedOn(doc), factsMovedOn(doc));

  for (const path of [
    '/',
    '/wiki',
    '/catalog',
    '/catalog/deprecations',
    '/catalog/changed',
    '/tools',
    '/learn',
    '/tutorials',
    '/blog',
    '/impossible-routine',
    '/data',
    '/colophon',
  ]) {
    add(path);
  }

  for (const doc of site.browsable) add(doc.url, contentChangedOn(doc));
  for (const { doc } of site.tools) add(doc.url, doc.data.last_verified);
  // `learn` carries no date of its own in front matter, and the same two
  // questions answer it: a learn page is prose plus whatever it transcludes.
  for (const doc of site.corpus.learn) add(doc.url, contentChangedOn(doc));
  for (const { doc, state } of site.tutorials) if (state.indexed) add(doc.url, doc.data.verified_on);
  for (const doc of site.posts) add(doc.url, doc.data.date);
  for (const view of site.deltas) add(view.url, view.routine.date);

  return urls;
}
