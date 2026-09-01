import { getSite } from '../../../lib/site.mjs';
import { renderToolPage } from '../../../lib/render/tools.mjs';
import { notFound } from 'next/navigation';
import { withEmptyGuard } from '../../../lib/static-params.mjs';
import JsonLd from '../../_components/JsonLd';
import { softwareApplicationGraph } from '../../../lib/jsonld.mjs';

export const dynamicParams = false;

export async function generateStaticParams() {
  const site = await getSite();
  return withEmptyGuard(site.tools.map(({ doc }: any) => ({ slug: doc.slug })));
}

async function find(slug: string) {
  const site = await getSite();
  return { site, listing: site.tools.find((t: any) => t.doc.slug === slug) };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { listing } = await find(slug);
  if (!listing) return {};
  return {
    title: listing.doc.data.title,
    description: `${listing.doc.data.title} — ${listing.doc.data.pricing}. Verified ${listing.state.last_verified}.`,
    robots: listing.state.alive ? 'index,follow' : 'noindex,follow',
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { site, listing } = await find(slug);
  if (!listing) notFound();
  // `state.alive` is what the robots tag above reads, so a discontinued
  // listing carries no `SoftwareApplication` — a page we ask crawlers not to
  // index must not also hand them a description of a live product.
  // `dateModified` is `last_verified`, which is exactly what `app/sitemap.ts`
  // sends as this page's `lastmod` (lib/jsonld.mjs, addictedtoai-k1j).
  const graph = listing.state.alive
    ? softwareApplicationGraph(listing, { dateModified: listing.doc.data.last_verified })
    : undefined;
  return (
    <>
      <JsonLd graph={graph} />
      <article dangerouslySetInnerHTML={{ __html: renderToolPage(listing, site) }} />
    </>
  );
}
