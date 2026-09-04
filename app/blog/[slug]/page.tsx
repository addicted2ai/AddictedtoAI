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
        is `postChangedOn` — the later of the shared material-change resolution
        and that same `date:`, so an edited post reports being edited and an
        unedited one still carries a date (lib/jsonld.mjs, beads
        addictedtoai-k1j).

        This line and `app/sitemap.ts`'s call the SAME function, which is the
        only thing that makes them equal. They did not until 2026-09-03: this
        sent `contentChangedOn` while the sitemap sent `doc.data.date`, and the
        first edit to a published post made them disagree. `verify-surfaces`
        caught it; the comment that used to sit here asserted they matched.
      */}
      <JsonLd graph={postGraph(doc, { dateModified: site.postChangedOn(doc) })} />
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
