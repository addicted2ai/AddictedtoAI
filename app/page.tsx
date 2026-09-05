import { getSite } from '../lib/site.mjs';
import {
  renderChangedFeed,
  renderLifecycleStrip,
  renderLatest,
  renderCatalogGlance,
  renderDoors,
} from '../lib/render/home.mjs';
import { renderDeltaStrip } from '../lib/render/delta.mjs';

/**
 * Home (task 4.7, specs/site).
 *
 * No hero. The first thing under the header is the first dated line of the
 * changed feed, with the lifecycle strip and the catalog's shape beside it —
 * because *"the home page serves someone already following AI daily"*, and
 * what that person came for is what moved since yesterday.
 *
 * Every region is derived: the feed from `data/changes.jsonl`, the strip and
 * the glance from the Pulse's tables, the doors' counts from the corpus. On a
 * day when no model is invoked anywhere, this page still changes if the world
 * did.
 */

export const metadata = {
  title: 'AddictedtoAI — what changed in AI, dated and sourced',
  description:
    'A dated feed of what changed in AI — prices, releases, retirements — with the source on every line.',
};

export default async function HomePage() {
  const site = await getSite();

  return (
    <>
      <div className="home-grid">
        <div className="home-lead">
          <section className="section" aria-labelledby="changed">
            <h1 className="section-title" id="changed">
              What changed
            </h1>
            <div dangerouslySetInnerHTML={{ __html: renderChangedFeed(site.changes, { limit: 24 }) }} />
            <p className="sort-note">
              Observed mechanically from public sources; every line carries the source it was read
              from. <a href="/catalog/changed">The last 30 days as a table</a> ·{' '}
              <a href="/feeds/changes.xml">RSS</a>
            </p>
          </section>
        </div>

        <aside className="home-side" aria-label="Today's shape">
          <section className="section" aria-labelledby="glance">
            <h2 className="section-title" id="glance">
              Catalog
            </h2>
            <div dangerouslySetInnerHTML={{ __html: renderCatalogGlance(site) }} />
          </section>

          <section className="section" aria-labelledby="lifecycle">
            <h2 className="section-title" id="lifecycle">
              Deprecated &amp; retired
            </h2>
            <div dangerouslySetInnerHTML={{ __html: renderLifecycleStrip(site.deprecations) }} />
            <p className="sort-note">
              <a href="/catalog/deprecations">The whole record</a> — kept after the vendor deletes
              theirs.
            </p>
          </section>

          <section className="section" aria-labelledby="latest">
            <h2 className="section-title" id="latest">
              Latest
            </h2>
            <div dangerouslySetInnerHTML={{ __html: renderLatest(site) }} />
          </section>

          {/* I9 (iter-07, R13): relocated here from a full-width section below
              the grid. .home-side's own content (576.7px) reached only 46.9%
              of the changed feed's height (1230.9px on a 2559px page),
              leaving a 404px column open beside nothing for ~688px — R13's
              I33 defect, applied vertically instead of horizontally. The feed
              cannot reflow to fill that space with CSS alone without
              reordering .home-side before it in the DOM (the float mechanism
              is the only CSS primitive that lets later content wrap around a
              shorter box, and floats only wrap content that comes AFTER them
              in source order) — which would place a secondary nav widget
              ahead of the page's own H1 and its primary content for anyone
              not relying on CSS layout, contradicting this page's own stated
              design ("No hero. The first thing under the header is the first
              dated line of the changed feed"). Growing the rail's own content
              is the invariant's other satisfying clause, and moving this
              section — unchanged, not duplicated, not new copy — is a JSX
              relocation within this template, not a content edit. See S18. */}
          <section className="section" aria-labelledby="doors">
            <h2 className="section-title" id="doors">
              Everything here
            </h2>
            <div dangerouslySetInnerHTML={{ __html: renderDoors(site) }} />
          </section>
        </aside>
      </div>

      <section className="section" aria-labelledby="showpiece">
        <h2 className="section-title" id="showpiece">
          Impossible → Routine
        </h2>
        <p className="page-lede">
          Capabilities that were research results, and the date each became something anyone could
          buy. Both ends dated, both ends sourced.
        </p>
        <div dangerouslySetInnerHTML={{ __html: renderDeltaStrip(site.deltas, 2) }} />
        <p className="sort-note">
          <a href="/impossible-routine">
            {site.deltas.length > 0 ? `All ${site.deltas.length} dated pairs` : 'The surface, and how a pair is built'}
          </a>
        </p>
      </section>
    </>
  );
}
