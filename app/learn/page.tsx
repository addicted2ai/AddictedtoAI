import { getSite } from '../../lib/site.mjs';
import { renderLadder } from '../../lib/render/learn.mjs';

/**
 * The static-education ladder index (task 4.4, specs/education-static).
 *
 * Generated entirely from the pages' own `level`, `outcome` and
 * `prerequisites` declarations. There is no ordering file to fall out of date
 * — adding a page to the ladder is writing the page.
 */

export const metadata = {
  title: 'Learn',
  description:
    'An ordered ladder from orientation to advanced mechanics. Every page states its level, what you will understand after it, and what it assumes.',
};

export default async function LearnIndex() {
  const site = await getSite();

  return (
    <>
      <p className="eyebrow">learn</p>
      <h1 className="page-title">How this actually works</h1>
      <p className="page-lede">
        A ladder, not a course. Each page states its level, what you will understand after reading
        it, and which pages it assumes. Nothing on these pages perishes with the news cycle: a
        current example is transcluded from its wiki entry, so it updates itself.
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderLadder(site.learnLadder) }} />
    </>
  );
}
