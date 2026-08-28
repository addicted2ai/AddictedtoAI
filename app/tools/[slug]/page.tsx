import { getSite } from '../../../lib/site.mjs';
import { renderToolPage } from '../../../lib/render/tools.mjs';
import { notFound } from 'next/navigation';
import { withEmptyGuard } from '../../../lib/static-params.mjs';

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
  return <article dangerouslySetInnerHTML={{ __html: renderToolPage(listing, site) }} />;
}
