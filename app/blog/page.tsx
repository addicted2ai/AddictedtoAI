import { getSite } from '../../lib/site.mjs';
import { renderBlogIndex } from '../../lib/render/blog.mjs';

export const metadata = {
  title: 'Blog',
  description:
    'Dated stories about the technologies, methods, models and companies trying to advance AI. True on their date, and honest about being dated.',
};

export default async function BlogIndex() {
  const site = await getSite();

  return (
    <>
      <p className="eyebrow">blog</p>
      <h1 className="page-title">Dated, and honest about it</h1>
      <p className="page-lede">
        There is no posting schedule here: a week with nothing worth an enthusiast&rsquo;s time
        publishes nothing, and the ceiling is three posts in any seven days. A post is true as of
        its date; corrections are appended and dated, never smuggled into the body.
      </p>
      <p className="sort-note">
        Sorted by publication date, newest first. <a href="/feeds/blog.xml">RSS</a>
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderBlogIndex(site.posts) }} />
    </>
  );
}
