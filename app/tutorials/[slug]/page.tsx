import { getSite } from '../../../lib/site.mjs';
import { renderTutorialPage } from '../../../lib/render/tutorial.mjs';
import { renderReferencedHere } from '../../../lib/mentions.mjs';
import { notFound } from 'next/navigation';
import { withEmptyGuard } from '../../../lib/static-params.mjs';

/**
 * A tutorial page (task 4.5).
 *
 * `robots` follows the derived state: a demoted or archived tutorial is
 * `noindex` while its URL keeps resolving. No published URL on this site ever
 * 404s, including one that stopped being worth recommending.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const site = await getSite();
  return withEmptyGuard(site.tutorials.map(({ doc }: any) => ({ slug: doc.slug })));
}

async function find(slug: string) {
  const site = await getSite();
  return { site, item: site.tutorials.find((t: any) => t.doc.slug === slug) };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { item } = await find(slug);
  if (!item) return {};
  return {
    title: item.doc.data.title,
    description: `Verified on ${item.state.verified_on} against ${item.state.stamp
      .map((s: any) => `${s.subject} ${s.version}`)
      .join(', ')}.`,
    robots: item.state.indexed ? 'index,follow' : 'noindex,follow',
  };
}

export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { site, item } = await find(slug);
  if (!item) notFound();
  return (
    <article>
      <div dangerouslySetInnerHTML={{ __html: renderTutorialPage(item.doc, item.state) }} />
      <div
        className="rails"
        dangerouslySetInnerHTML={{ __html: renderReferencedHere(item.doc, site.corpus.byId) }}
      />
    </article>
  );
}
