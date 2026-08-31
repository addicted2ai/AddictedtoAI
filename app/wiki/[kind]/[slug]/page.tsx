import { getSite } from '../../../../lib/site.mjs';
import { renderEntryPage } from '../../../../lib/render/entry.mjs';
import { notFound } from 'next/navigation';
import { withEmptyGuard } from '../../../../lib/static-params.mjs';

/**
 * A wiki entry page (task 4.1, specs/wiki).
 *
 * The URL is `/wiki/<kind>/<slug>`, which is the entry's id with a prefix —
 * the id is the permanent identity and the URL is derived from it, never the
 * other way round.
 *
 * `robots` is derived, not authored: `noindex` for stubs, per the rules in
 * `indexability.mjs`. There is deliberately no front-matter field that can
 * force a page to be indexed.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const site = await getSite();
  const params = site.entries.map((doc: any) => {
    const [kind, slug] = doc.data.id.split('/');
    return { kind, slug };
  });
  return params.length > 0 ? params : withEmptyGuard([], 'kind').map((p: any) => ({ ...p, slug: p.kind }));
}

async function find(kind: string, slug: string) {
  const site = await getSite();
  return { site, doc: site.corpus.byId.get(`${kind}/${slug}`) };
}

export async function generateMetadata({ params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind, slug } = await params;
  const { doc } = await find(kind, slug);
  if (!doc) return {};
  const facts = (doc.data.facts ?? []).length;
  // doc.currentStatus (addictedtoai-ij4h): the presented status, never raw
  // front matter — see build-content.mjs. Keeps the meta description in step
  // with the badge the page itself renders.
  const status = doc.currentStatus ?? doc.data.status;
  return {
    title: doc.data.display_name,
    description:
      `${doc.data.display_name} — ${doc.data.kind}, status ${status}. ` +
      `${facts} sourced fact${facts === 1 ? '' : 's'} and a dated timeline.`,
    robots: doc.index.indexed ? 'index,follow' : 'noindex,follow',
  };
}

export default async function EntryPage({ params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind, slug } = await params;
  const { site, doc } = await find(kind, slug);
  if (!doc) notFound();
  return <article dangerouslySetInnerHTML={{ __html: renderEntryPage(doc, site) }} />;
}
