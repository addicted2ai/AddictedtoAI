import { getSite } from '../../../lib/site.mjs';
import { renderDeltaPage } from '../../../lib/render/delta.mjs';
import { renderReferencedHere } from '../../../lib/mentions.mjs';
import { notFound } from 'next/navigation';
import { withEmptyGuard } from '../../../lib/static-params.mjs';

/**
 * One dated pair, on its own permanent URL — so a single delta can be cited
 * without citing the whole surface.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const site = await getSite();
  return withEmptyGuard(site.deltas.map((v: any) => ({ slug: v.slug })));
}

async function find(slug: string) {
  const site = await getSite();
  return { site, view: site.deltas.find((v: any) => v.slug === slug) };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { view } = await find(slug);
  if (!view) return {};
  return {
    title: view.title,
    description: `${view.capability} Research result ${view.impossible.date}; routine ${view.routine.date} — ${view.span.text}.`,
  };
}

export default async function DeltaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { site, view } = await find(slug);
  if (!view) notFound();
  return (
    <article>
      <div dangerouslySetInnerHTML={{ __html: renderDeltaPage(view) }} />
      <div
        className="rails"
        dangerouslySetInnerHTML={{ __html: renderReferencedHere(view.doc, site.corpus.byId) }}
      />
    </article>
  );
}
