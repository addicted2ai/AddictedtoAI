import {
  DATASET_JSON_ROUTE,
  DATASET_CSV_ROUTES,
  DATASET_CSV_LABELS,
  TABLE_JSON_ROUTES,
  FEED_ROUTES,
  SEARCH_INDEX_ROUTE,
  STATUS_ROUTE,
  DATASET_LICENSE,
  DATASET_LICENSE_URL,
  TABLE_SCHEMA_VERSION,
  DATASET_SCHEMA_VERSION,
} from '../../lib/asset-routes.mjs';
import JsonLd from '../_components/JsonLd';
import { datasetGraph, DATASET_DESCRIPTION } from '../../lib/jsonld.mjs';

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

// One string, shared with the `Dataset` graph below so the page and its
// structured data cannot describe the same download differently
// (lib/jsonld.mjs, beads addictedtoai-k1j).
export const metadata = {
  title: 'Open dataset',
  description: DATASET_DESCRIPTION,
};

export default function DataPage() {
  // Labels come from `lib/asset-routes.mjs`, beside the routes they name, so
  // this page and the `DataDownload` entries in the graph below print the same
  // description of the same file.
  const csvs = Object.values(DATASET_CSV_ROUTES).map(
    (route) => [route, DATASET_CSV_LABELS[route]] as [string, string],
  );

  return (
    <article>
      <JsonLd graph={datasetGraph()} />
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

      {/*
        THE CONTRACT (beads addictedtoai-k1j). The `id` is load-bearing: every
        JSON payload the build writes carries `contract:` pointing at
        `/data#contract`, so this heading is the destination of a URL published
        inside several thousand rows of other people's downloads. Renaming it
        breaks those links.

        Written as what is stable and what is NOT, in that order, because the
        second half is the part that makes the first half believable: a
        contract that promised the row values would hold would be a contract
        this site breaks four times a day by design.
      */}
      <section className="section" aria-labelledby="contract">
        <h2 className="section-title" id="contract">
          The contract
        </h2>
        <p>
          These files are meant to be built on. Every JSON payload carries a{' '}
          <code>schema_version</code> and a <code>contract</code> field pointing back at this
          section, and every one of them is served with{' '}
          <code>Access-Control-Allow-Origin: *</code>, so a page in a browser can fetch them
          directly. The current versions are{' '}
          <strong>
            {TABLE_SCHEMA_VERSION} for the standing tables and {DATASET_SCHEMA_VERSION} for the
            dataset
          </strong>
          .
        </p>
        <p>
          <strong>What is stable.</strong> The URLs. The licence, and its presence inside the
          payload. The top-level key names. Every existing field name on a row, and what it means.
          That <code>row_count</code> equals the length of <code>rows</code>. That{' '}
          <code>rows</code> is in the order <code>sort_criterion</code> names.
        </p>
        <p>
          <strong>What is not, and is never claimed to be.</strong> Which rows are present, what
          their values are, and how many there are. Those move — that is what the files are for.{' '}
          <code>generated_on</code> changes whenever the site is rebuilt.
        </p>
        <p>
          <strong>What a version change means.</strong> A <em>new</em> key on a payload or a row
          can appear without the version moving, so write a reader that ignores keys it does not
          recognise. The version increases only when an existing key is{' '}
          <strong>renamed or removed</strong> — that is the only thing it means, and the only thing
          worth acting on.
        </p>
      </section>
    </article>
  );
}
