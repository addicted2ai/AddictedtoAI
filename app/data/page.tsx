import { getSite } from '../../lib/site.mjs';
import {
  DATASET_JSON_ROUTE,
  DATASET_CSV_ROUTES,
  TABLE_JSON_ROUTES,
  FEED_ROUTES,
  SEARCH_INDEX_ROUTE,
  STATUS_ROUTE,
  DATASET_LICENSE,
  DATASET_LICENSE_URL,
} from '../../lib/asset-routes.mjs';

/**
 * The open dataset (task 4.9, specs/site).
 *
 * *"the entire structured layer ... downloadable as JSON and CSV at a stable
 * URL, under the CC BY 4.0 license, with the license stated on the page and
 * in the files."* Both halves are done: this page states it, and every file
 * carries it — the JSON in its header, each CSV in a `license` column on
 * every row, because a file that gets separated from this page should still
 * say what you may do with it.
 */

export const metadata = {
  title: 'Open dataset',
  description:
    'The whole structured layer — entries, facts, timelines, model catalog, deprecations, dated deltas — as JSON and CSV under CC BY 4.0.',
};

export default async function DataPage() {
  const site = await getSite();

  const csvs: [string, string, number][] = [
    [DATASET_CSV_ROUTES.entries, 'Entries — identity, lifecycle, indexability', site.entries.length],
    [DATASET_CSV_ROUTES.facts, 'Facts — resolved values with their state and source', 0],
    [DATASET_CSV_ROUTES.timelines, 'Timelines — dated, sourced lifecycle events', 0],
    [DATASET_CSV_ROUTES.catalog, 'Model catalog — raw per-token prices', site.catalog.length],
    [DATASET_CSV_ROUTES.deprecations, 'Deprecations and retirements', site.deprecations.length],
    [DATASET_CSV_ROUTES.deltas, 'Impossible → Routine — dated pairs with both sources', site.deltas.length],
  ];

  return (
    <article>
      <p className="eyebrow">open data</p>
      <h1 className="page-title">Take the whole thing</h1>
      <p className="page-lede">
        Everything structured on this site is downloadable. Use it, quote it, build on it — the
        licence is <a href={DATASET_LICENSE_URL}>{DATASET_LICENSE}</a>, which asks only for
        attribution, and it is stated inside every file as well as on this page.
      </p>

      <section className="section" aria-labelledby="whole">
        <h2 className="section-title" id="whole">
          Everything, as one file
        </h2>
        <ul className="footer-links">
          <li>
            <a href={DATASET_JSON_ROUTE}>{DATASET_JSON_ROUTE}</a>
          </li>
        </ul>
      </section>

      <section className="section" aria-labelledby="tables">
        <h2 className="section-title" id="tables">
          One table at a time (CSV)
        </h2>
        <ul className="browse">
          {csvs.map(([href, label]) => (
            <li className="browse-row" key={href}>
              <a className="browse-name" href={href}>
                {label}
              </a>
              <span className="browse-kind">{href}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="live">
        <h2 className="section-title" id="live">
          Live siblings
        </h2>
        <ul className="browse">
          <li className="browse-row">
            <a className="browse-name" href={TABLE_JSON_ROUTES.catalog}>
              The model catalog as JSON
            </a>
            <span className="browse-kind">{TABLE_JSON_ROUTES.catalog}</span>
          </li>
          <li className="browse-row">
            <a className="browse-name" href={TABLE_JSON_ROUTES.deprecations}>
              Deprecations and retirements as JSON
            </a>
            <span className="browse-kind">{TABLE_JSON_ROUTES.deprecations}</span>
          </li>
          <li className="browse-row">
            <a className="browse-name" href={TABLE_JSON_ROUTES.changed}>
              Changed in 30 days as JSON
            </a>
            <span className="browse-kind">{TABLE_JSON_ROUTES.changed}</span>
          </li>
          <li className="browse-row">
            <a className="browse-name" href={SEARCH_INDEX_ROUTE}>
              The name index the search box uses
            </a>
            <span className="browse-kind">{SEARCH_INDEX_ROUTE}</span>
          </li>
          <li className="browse-row">
            <a className="browse-name" href={STATUS_ROUTE}>
              This build&rsquo;s stamp
            </a>
            <span className="browse-kind">{STATUS_ROUTE}</span>
          </li>
        </ul>
      </section>

      <section className="section" aria-labelledby="feeds">
        <h2 className="section-title" id="feeds">
          Feeds
        </h2>
        <ul className="browse">
          <li className="browse-row">
            <a className="browse-name" href={FEED_ROUTES.changes}>
              What changed
            </a>
            <span className="browse-kind">{FEED_ROUTES.changes}</span>
          </li>
          <li className="browse-row">
            <a className="browse-name" href={FEED_ROUTES.blog}>
              Blog
            </a>
            <span className="browse-kind">{FEED_ROUTES.blog}</span>
          </li>
          <li className="browse-row">
            <a className="browse-name" href={FEED_ROUTES.tutorials}>
              Tutorials
            </a>
            <span className="browse-kind">{FEED_ROUTES.tutorials}</span>
          </li>
        </ul>
      </section>
    </article>
  );
}
