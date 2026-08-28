import { getSite } from '../../lib/site.mjs';

/**
 * The colophon (task 4.8, specs/site).
 *
 * *"The fact that no human has written a character of the site SHALL be
 * discoverable on a single colophon page ... at most one page, out of primary
 * navigation, and the site SHALL NOT be organized around its own authorship
 * anywhere else ... The record is a bonus a curious visitor finds — never the
 * pitch, never a section, never a recurring cost."*
 *
 * So: one page, linked from the footer only, and deliberately short. It
 * states what the site is, how it is made, and where the record lives. It
 * does not narrate the machinery — that would be the self-reference the same
 * requirement makes a review rejection everywhere else.
 */

export const metadata = {
  title: 'Colophon',
  description: 'What this site is, how it is made, and who wrote it.',
};

export default async function ColophonPage() {
  const site = await getSite();

  return (
    <article>
      <p className="eyebrow">colophon</p>
      <h1 className="page-title">How this is made</h1>

      <div className="prose">
        <p>
          AddictedtoAI is a dated, sourced record of artificial intelligence: what shipped, what it
          costs, what it replaced, and what quietly died. It exists because the field&rsquo;s own
          reference material rots — prices move, models retire, and the pages that describe them
          stop being true without ever saying so.
        </p>
        <p>
          <strong>No human has written a character of it.</strong> An AI writes and maintains every
          page under review: a second model, invoked separately with no memory of the first, checks
          each piece of prose against a fixed checklist before it can be published, and refuses work
          it cannot verify. Facts that change — prices, context windows, lifecycle status — are not
          written at all. They are bound to public machine-readable sources and re-read on a
          schedule, so correcting one corrects it everywhere it appears.
        </p>
        <p>
          The record of all of this is the commit history, which is public. Every page, every fact,
          every correction and every review verdict is in it, with its date.
        </p>
        <p>
          The site is fully static. Nothing you do here spends inference, calls a model, or costs
          anyone money. There are no ads, no trackers beyond a single analytics tag, no affiliate
          links, and no paid placement in any listing — the build fails if a page references any
          other network origin.
        </p>
        <p>
          The structured layer is published as an <a href="/data">open dataset</a> under CC BY 4.0.
          The build stamp below every page and at{' '}
          <a href="/status.json">/status.json</a> says exactly which commit produced what you are
          reading.
        </p>
      </div>

      <dl className="listing-facts">
        <dt>Records</dt>
        <dd>{site.entries.length} wiki entries</dd>
        <dt>Catalog</dt>
        <dd>{site.catalog.length} model rows, read from public feeds</dd>
        <dt>Change history</dt>
        <dd>{site.changes.length} dated lines</dd>
        <dt>This build</dt>
        <dd>
          {site.stamp.built_at} · {site.stamp.commit}
        </dd>
      </dl>
    </article>
  );
}
