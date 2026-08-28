/**
 * 404. specs/site: no *published* URL ever 404s — renames and removals leave
 * permanent redirects, and this page is what a typo or a made-up URL reaches.
 * It says which of those happened rather than apologising.
 */

export const metadata = { title: 'No page at that address' };

export default function NotFound() {
  return (
    <article>
      <p className="eyebrow">404</p>
      <h1 className="page-title">No page at that address</h1>
      <div className="prose">
        <p>
          Nothing published here has ever been deleted: pages that are renamed or pruned redirect to
          where they went. So this address was either mistyped, or never existed.
        </p>
        <p>
          The search box in the header covers every page, including the data-only stubs that are not
          in any listing. Or start from <a href="/">what changed today</a>.
        </p>
      </div>
    </article>
  );
}
