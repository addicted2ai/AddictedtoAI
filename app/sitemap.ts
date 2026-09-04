import type { MetadataRoute } from 'next';
import { getSite } from '../lib/site.mjs';
import { absoluteUrl } from '../lib/site-config.mjs';
import { buildChangedOnMap, contentChangedOn as resolveContentChangedOn, postChangedOn as resolvePostChangedOn, newest } from '../lib/sitemap-dates.mjs';

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
 *
 * ---------------------------------------------------------------------------
 * THE TWELVE INDEX ROUTES, WHICH USED TO CARRY NO DATE AT ALL (addictedtoai-1r7).
 *
 * A loop below used to `add(path)` for `/`, `/wiki`, `/catalog`,
 * `/catalog/deprecations`, `/catalog/changed`, `/tools`, `/learn`,
 * `/tutorials`, `/blog`, `/impossible-routine`, `/data` and `/colophon` and
 * pass no second argument — exactly the pages a crawler most wants a
 * freshness signal for, because an index is the hub it re-crawls to discover
 * everything else. An index page's honest `lastModified` is a function of the
 * things it indexes, so each one below takes the NEWEST date already true of
 * its own members — no new definition of "changed", just `newest()`
 * (`../lib/sitemap-dates.mjs`, `later()` folded over a list) applied to
 * values this file or the corpus already produces:
 *
 *   `/wiki`                  newest `contentChangedOn` among `site.browsable`
 *   `/learn`                 newest `contentChangedOn` among `site.corpus.learn`
 *   `/tools`                 newest `last_verified` among `site.tools`
 *   `/tutorials`             newest `verified_on` among indexed `site.tutorials`
 *   `/blog`                  newest `postChangedOn` among `site.posts` — the same
 *                            values the post loop below emits, so the index cannot
 *                            claim to be older than a post it lists
 *   `/impossible-routine`    newest `contentChangedOn` among `site.deltas` —
 *                            literally the same values the delta loop below
 *                            computes, because the page renders exactly that list
 *   `/catalog`,
 *   `/catalog/deprecations`  newest `changedOn` entry among each row's joined
 *                            wiki entry (`row.entry.id`); a row with no entry
 *                            contributes nothing, the same conservative
 *                            "understate rather than invent" rule `contentChangedOn`
 *                            already applies to a piece with no bound review record
 *   `/data`                  newest across exactly the surfaces this page links to
 *                            (entries, catalog, deprecations, deltas, and the
 *                            changes/blog/tutorials feeds — read off `lib/asset-routes.mjs`'s
 *                            `DATASET_CSV_ROUTES`/`FEED_ROUTES`, not tools or learn,
 *                            which this page does not export)
 *
 * `/` AND `/catalog/changed` ARE THE SAME QUESTION, ANSWERED HONESTLY RATHER
 * THAN LEFT BLANK. Both render the changed feed itself, so their honest date
 * is the newest line of `site.changes` — which moves whenever the Pulse
 * observes anything at all, unlike the other ten. That is a deliberate
 * choice, not a side effect: it is the one place left where `lastmod` answers
 * "did the world move" rather than "did this page's prose move", and it earns
 * that because the page's entire content IS the feed, with nothing else in it
 * to disagree.
 *
 * `/colophon` GETS NO `lastModified`, AND THIS DIFFERS FROM WHAT addictedtoai-1r7
 * PROPOSED. The issue suggested joining it through the review-record path
 * "like any other prose page" — measured against the actual corpus, that path
 * does not exist: `/colophon` and `/impossible-routine`'s own `page.tsx` are
 * hand-written components with no corpus doc, no front matter and no entry in
 * `reviewablePieces()` (`lib/reviews.mjs`), so there is no record to join to.
 * `/impossible-routine` still gets an honest date because its body IS a
 * direct render of `site.deltas` (a member-max case, above). `/colophon` has
 * no such list — it states summary counts and, in its own JSX, `site.stamp
 * .built_at`, which changes on every single build whether or not the world
 * did. Stamping that as `lastModified` is exactly the lie this file exists to
 * refuse, so absence is the honest answer here, the same as any other page
 * with neither a review date nor a facts date.
 */

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const urls: MetadataRoute.Sitemap = [];
  const add = (path: string, lastModified?: string) =>
    urls.push({ url: absoluteUrl(path), lastModified: lastModified ? new Date(`${lastModified}T12:00:00Z`) : undefined });

  const changedOn = buildChangedOnMap(site.changes);
  const contentChangedOn = (doc: any) => resolveContentChangedOn(doc, site.reviews.byFile, changedOn);
  const postChangedOn = (doc: any) => resolvePostChangedOn(doc, site.reviews.byFile, changedOn);

  // Each index route's `lastModified` is the newest date already true of its
  // own members — see the header ("THE TWELVE INDEX ROUTES") for what each
  // set is and why `/` , `/catalog/changed` and `/colophon` are not members.
  const wikiChangedOn = newest(site.browsable.map((doc: any) => contentChangedOn(doc)));
  const learnChangedOn = newest(site.corpus.learn.map((doc: any) => contentChangedOn(doc)));
  const toolsChangedOn = newest(site.tools.map(({ doc }: any) => doc.data.last_verified));
  const tutorialsChangedOn = newest(
    site.tutorials.filter(({ state }: any) => state.indexed).map(({ doc }: any) => doc.data.verified_on),
  );
  const blogChangedOn = newest(site.posts.map((doc: any) => postChangedOn(doc)));
  const deltasChangedOn = newest(site.deltas.map((view: any) => contentChangedOn(view.doc)));
  const catalogChangedOn = newest(
    site.catalog.map((row: any) => (row.entry ? changedOn.get(row.entry.id) : undefined)),
  );
  const deprecationsChangedOn = newest(
    site.deprecations.map((row: any) => (row.entry ? changedOn.get(row.entry.id) : undefined)),
  );
  // `site.changes` is the changed feed itself (addictedtoai-8ho); its newest
  // line is the one answer `/` and `/catalog/changed` share, deliberately.
  const feedChangedOn = newest(site.changes.map((line: any) => line.date));
  const dataChangedOn = newest([
    wikiChangedOn,
    catalogChangedOn,
    deprecationsChangedOn,
    deltasChangedOn,
    feedChangedOn,
    blogChangedOn,
    tutorialsChangedOn,
  ]);

  add('/', feedChangedOn);
  add('/wiki', wikiChangedOn);
  add('/catalog', catalogChangedOn);
  add('/catalog/deprecations', deprecationsChangedOn);
  add('/catalog/changed', feedChangedOn);
  add('/tools', toolsChangedOn);
  add('/learn', learnChangedOn);
  add('/tutorials', tutorialsChangedOn);
  add('/blog', blogChangedOn);
  add('/impossible-routine', deltasChangedOn);
  add('/data', dataChangedOn);
  add('/colophon'); // no corpus doc, no review record, no members — see header

  for (const doc of site.browsable) add(doc.url, contentChangedOn(doc));
  for (const { doc } of site.tools) add(doc.url, doc.data.last_verified);
  // `learn` carries no date of its own in front matter, and the same two
  // questions answer it: a learn page is prose plus whatever it transcludes.
  for (const doc of site.corpus.learn) add(doc.url, contentChangedOn(doc));
  for (const { doc, state } of site.tutorials) if (state.indexed) add(doc.url, doc.data.verified_on);
  // A post's date was `doc.data.date` here and `contentChangedOn` in
  // `app/blog/[slug]/page.tsx` — two definitions of one date, which disagreed
  // the first time a published post was edited (2026-09-03). Both now call
  // `postChangedOn`, the later of the two, so the sitemap and the graph cannot
  // drift and an edited post still reports being edited.
  for (const doc of site.posts) add(doc.url, postChangedOn(doc));
  for (const view of site.deltas) add(view.url, contentChangedOn(view.doc));

  return urls;
}
