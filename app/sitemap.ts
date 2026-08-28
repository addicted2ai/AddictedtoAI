import type { MetadataRoute } from 'next';
import { getSite } from '../lib/site.mjs';
import { absoluteUrl } from '../lib/site-config.mjs';

/**
 * The sitemap (task 4.9, specs/site).
 *
 * It lists what a crawler should index, which is not the same as what the
 * site serves: a stub entry, a demoted tutorial and an archived one all keep
 * resolving (no published URL ever 404s) and none of them belongs in a
 * sitemap. The rule is the same one the pages use for `robots`, read from the
 * same derived state, so the two can never disagree.
 */

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const urls: MetadataRoute.Sitemap = [];
  const add = (path: string, lastModified?: string) =>
    urls.push({ url: absoluteUrl(path), lastModified: lastModified ? new Date(`${lastModified}T12:00:00Z`) : undefined });

  for (const path of [
    '/',
    '/wiki',
    '/catalog',
    '/catalog/deprecations',
    '/catalog/changed',
    '/tools',
    '/learn',
    '/tutorials',
    '/blog',
    '/impossible-routine',
    '/data',
    '/colophon',
  ]) {
    add(path);
  }

  for (const doc of site.browsable) add(doc.url);
  for (const { doc } of site.tools) add(doc.url, doc.data.last_verified);
  for (const doc of site.corpus.learn) add(doc.url);
  for (const { doc, state } of site.tutorials) if (state.indexed) add(doc.url, doc.data.verified_on);
  for (const doc of site.posts) add(doc.url, doc.data.date);
  for (const view of site.deltas) add(view.url, view.routine.date);

  return urls;
}
