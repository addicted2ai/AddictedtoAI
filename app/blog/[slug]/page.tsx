import { getSite } from '../../../lib/site.mjs';
import { renderPostPage } from '../../../lib/render/blog.mjs';
import { renderReferencedHere } from '../../../lib/mentions.mjs';
import { notFound } from 'next/navigation';
import { withEmptyGuard } from '../../../lib/static-params.mjs';
import JsonLd from '../../_components/JsonLd';
import { postGraph } from '../../../lib/jsonld.mjs';

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
      {/*
        An `Article`: `datePublished` is the post's own `date:`, `dateModified`
        is the shared material-change resolution — the later of the review
        record's date and the newest changed-feed line joining to anything this
        post transcludes — so it is the same value `app/sitemap.ts` sends as
        `lastmod` (lib/jsonld.mjs, beads addictedtoai-k1j).
      */}
      <JsonLd graph={postGraph(doc, { dateModified: site.contentChangedOn(doc) })} />
      {/*
        `changes` is what turns an anchor from "Recorded in this site's change
        feed" into the event's own name plus the source it was read from
        (lib/render/blog.mjs, specs/blog task 3.6). `site.changeLines` is the
        raw `data/changes.jsonl` array the renderer indexes by `key` — not
        `site.changes`, which is the rendered feed view.
      */}
      <div
        dangerouslySetInnerHTML={{ __html: renderPostPage(doc, { changes: site.changeLines }) }}
      />
      <div
        className="rails"
        dangerouslySetInnerHTML={{ __html: renderReferencedHere(doc, site.corpus.byId) }}
      />
    </article>
  );
}
