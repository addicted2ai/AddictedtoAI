import { getSite } from '../../../lib/site.mjs';
import { renderPostPage } from '../../../lib/render/blog.mjs';
import { renderReferencedHere } from '../../../lib/mentions.mjs';
import { notFound } from 'next/navigation';
import { withEmptyGuard } from '../../../lib/static-params.mjs';

export const dynamicParams = false;

export async function generateStaticParams() {
  const site = await getSite();
  return withEmptyGuard(site.posts.map((doc: any) => ({ slug: doc.slug })));
}

async function find(slug: string) {
  const site = await getSite();
  return { site, doc: site.posts.find((d: any) => d.slug === slug) };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { doc } = await find(slug);
  if (!doc) return {};
  return {
    title: doc.data.title,
    description: `Published ${doc.data.date}.`,
    openGraph: { type: 'article', publishedTime: doc.data.date },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { site, doc } = await find(slug);
  if (!doc) notFound();
  return (
    <article>
      <div dangerouslySetInnerHTML={{ __html: renderPostPage(doc) }} />
      <div
        className="rails"
        dangerouslySetInnerHTML={{ __html: renderReferencedHere(doc, site.corpus.byId) }}
      />
    </article>
  );
}
