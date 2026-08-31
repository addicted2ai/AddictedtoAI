import type { MetadataRoute } from 'next';
import { getSite } from '../lib/site.mjs';
import { absoluteUrl } from '../lib/site-config.mjs';
import { buildChangedOnMap, contentChangedOn as resolveContentChangedOn } from '../lib/sitemap-dates.mjs';

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
 *
 * ---------------------------------------------------------------------------
 * DELTAS GET THE SAME TREATMENT, NOT A THIRD ONE (addictedtoai-3u1).
 *
 * The delta loop used to pass `view.routine.date` — the date the ROUTINE end
 * of the impossible/routine pair happened, e.g. `2009-08-27`. That is a fact
 * about the subject the page describes, exactly like the timeline dates
 * rejected above (both run from the 1900s-2000s to past the build date), not
 * a fact about the page. A crawler reading `lastmod 2009-08-27` was told the
 * page had not changed in seventeen years when it was authored in the
 * 2026-08-28 greenfield wave.
 *
 * `corpus.delta` is already in `reviewablePieces` (`lib/reviews.mjs`) and a
 * delta's body is prose like any other, so it takes the exact same
 * `contentChangedOn` used above rather than a second resolution path — the
 * routine/impossible dates stay in the page body, where they are a fact about
 * the subject, not the page.
 *
 * `later`, `reviewedOn`, `factsMovedOn` and `contentChangedOn` live in
 * `../lib/sitemap-dates.mjs`, not here — a decision buried inside a page
 * component is only provable by running `next build`; moved out, it is a
 * plain function `lib/sitemap-dates.test.mjs` calls directly.
 */

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const urls: MetadataRoute.Sitemap = [];
  const add = (path: string, lastModified?: string) =>
    urls.push({ url: absoluteUrl(path), lastModified: lastModified ? new Date(`${lastModified}T12:00:00Z`) : undefined });

  const changedOn = buildChangedOnMap(site.changes);
  const contentChangedOn = (doc: any) => resolveContentChangedOn(doc, site.reviews.byFile, changedOn);

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
  for (const view of site.deltas) add(view.url, contentChangedOn(view.doc));

  return urls;
}
