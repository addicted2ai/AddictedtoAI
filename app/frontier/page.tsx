import { getSite } from '../../lib/site.mjs';
import {
  renderSpine,
  renderIndexBoard,
  renderLeadChangeKnots,
  renderVendorClaims,
  renderCapabilitiesRail,
} from '../../lib/render/frontier.mjs';

/**
 * /frontier (K11, BRIEF-UI-001 R-B) — prototyped on the branch; merge waits
 * for the Desk's OpenSpec change (K11).
 *
 * K19 (keeper, round 1): this route LEADS with a running board of the major
 * players and their current standing per index, before the spine, the
 * capability rail or anything else. K21 (keeper, round 1): board rows are
 * editorial (every organisation on record), never feed-gated; the columns
 * are read from the registered sources, so a new one is a new column with
 * no edit to this file — see `lib/render/frontier.mjs`'s doc comments for
 * exactly which data path backs each section.
 *
 * plan §11.4 / K19: this page's own fixed copy carries no digit. Every
 * number, date or claim on the page is DERIVED, and lives inside an element
 * carrying `data-derived="frontier-<rail>"` — `scripts/verify-surfaces.mjs`
 * (`checkFrontierFence`) asserts this on the exported page.
 */

export const metadata = {
  title: 'The Frontier',
  description:
    'The major organisations building frontier models, the pace at which the field moves, and what is proven versus merely claimed — every value dated and sourced.',
};

export default async function FrontierPage() {
  const site = await getSite();

  return (
    <>
      <p className="eyebrow">a running board, not a leaderboard opinion</p>
      <h1 className="page-title">The Frontier</h1>
      <p className="page-lede">
        Who is building at the edge, what each of them currently claims, and what an independent
        index says versus what a vendor states about itself. A blank cell means no source has
        published a value there yet — never a guess standing in for one.
      </p>

      <section className="section" aria-labelledby="frontier-board">
        <h2 className="section-title" id="frontier-board">
          The board
        </h2>
        <div data-derived="frontier-board">
          <div dangerouslySetInnerHTML={{ __html: renderIndexBoard(site) }} />
        </div>
        <p className="sort-note">
          Rows are every organisation with a record on this site; columns are every index this site
          tracks. A column with nothing published for an organisation shows so, plainly, rather than
          leaving that organisation off the board.
        </p>
      </section>

      <section className="section" aria-labelledby="frontier-spine">
        <h2 className="section-title" id="frontier-spine">
          The pace
        </h2>
        <p className="page-lede">
          Every dated record this site has observed, spaced by how much calendar time actually
          separates one from the next — a longer gap on the page is a longer gap in the world.
        </p>
        <div data-derived="frontier-spine">
          <div dangerouslySetInnerHTML={{ __html: renderSpine(site) }} />
        </div>
      </section>

      <section className="section" aria-labelledby="frontier-leadchange">
        <h2 className="section-title" id="frontier-leadchange">
          Lead changes
        </h2>
        <p className="page-lede">
          When the top of an index passed from one organisation to another, and whether that was a
          new arrival or a rescoring of what was already there.
        </p>
        <div data-derived="frontier-leadchange">
          <div dangerouslySetInnerHTML={{ __html: renderLeadChangeKnots(site) }} />
        </div>
      </section>

      <section className="section" aria-labelledby="frontier-capabilities">
        <h2 className="section-title" id="frontier-capabilities">
          Proven, newest first
        </h2>
        <p className="page-lede">
          What moved from research result to something anyone could run, verified by an executed
          transcript, or written up with a source — never a capability inferred from a ranking
          alone.
        </p>
        <div data-derived="frontier-capabilities">
          <div dangerouslySetInnerHTML={{ __html: renderCapabilitiesRail(site) }} />
        </div>
      </section>

      <section className="section" aria-labelledby="frontier-vendor">
        <h2 className="section-title" id="frontier-vendor">
          What each organisation says about itself
        </h2>
        <p className="page-lede">
          Quoted, attributed and marked as an unverified claim unless this site has cited evidence
          that verifies it — never merged with an index value above.
        </p>
        <div data-derived="frontier-vendor-claims">
          <div dangerouslySetInnerHTML={{ __html: renderVendorClaims(site) }} />
        </div>
      </section>
    </>
  );
}
