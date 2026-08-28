import { getSite } from '../../../lib/site.mjs';
import { renderLearnPage } from '../../../lib/render/learn.mjs';
import { renderReferencedHere } from '../../../lib/mentions.mjs';
import { notFound } from 'next/navigation';
import { withEmptyGuard } from '../../../lib/static-params.mjs';

export const dynamicParams = false;

export async function generateStaticParams() {
  const site = await getSite();
  return withEmptyGuard(site.corpus.learn.map((doc: any) => ({ slug: doc.slug })));
}

async function find(slug: string) {
  const site = await getSite();
  return { site, doc: site.corpus.learn.find((d: any) => d.slug === slug) };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { doc } = await find(slug);
  if (!doc) return {};
  return { title: doc.data.title, description: doc.data.outcome };
}

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { site, doc } = await find(slug);
  if (!doc) notFound();
  return (
    <article>
      <div dangerouslySetInnerHTML={{ __html: renderLearnPage(doc, site) }} />
      <div
        className="rails"
        dangerouslySetInnerHTML={{ __html: renderReferencedHere(doc, site.corpus.byId) }}
      />
    </article>
  );
}
