import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import Analytics from './_components/Analytics';
import SearchBox from './_components/SearchBox';
import ThemeToggle from './_components/ThemeToggle';
import { getSite } from '../lib/site.mjs';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, SITE_TAGLINE } from '../lib/site-config.mjs';

/**
 * Root layout — the site chrome (tasks 4.8, 4.11, 4.12, 4.13).
 *
 * Three things live here because every page needs them and none of them may
 * differ between pages: the primary navigation, the search box, and the
 * footer's build stamp.
 *
 * **The colophon is deliberately not in the nav.** specs/site: the
 * AI-authorship record is "at most one page, out of primary navigation ...
 * The record is a bonus a curious visitor finds — never the pitch, never a
 * section." It is linked from the footer and nowhere else, and the nav below
 * is the thing task 4.8's check inspects.
 *
 * The theme script is the first thing in the body so the stored choice is
 * applied before the first paint. It is inline (no origin, no request) and
 * about 200 bytes.
 *
 * **The primary nav uses `next/link`, and that is load-bearing** (task 5.1,
 * specs/analytics). Under `output: 'export'` Next still ships its client
 * router and exports an RSC payload per route (`out/wiki.txt` and friends), so
 * a `Link` navigates without a document load. Plain `<a href>` everywhere
 * would make every navigation a full load — which sounds harmless and is not:
 * it would make the route-change tracker dead code, and it would make the
 * click-through assertion in `scripts/verify-analytics.mjs` pass for the wrong
 * reason (a reload re-fires the tag), leaving the site's actual soft-navigation
 * behaviour untested the day anyone adds a `Link`. The footer's links stay
 * plain anchors because they point at static files, which have no route to
 * navigate to.
 */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  // Generic Open Graph only: specs/site forbids social handles and platform
  // widgets. A card that renders is citability; an account is outreach.
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/feeds/changes.xml', title: `${SITE_NAME} — what changed` },
        { url: '/feeds/blog.xml', title: `${SITE_NAME} — blog` },
        { url: '/feeds/tutorials.xml', title: `${SITE_NAME} — tutorials` },
      ],
    },
  },
};

/** Applied before paint; see the note above. */
const THEME_SCRIPT = `try{var t=localStorage.getItem('atai-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

const NAV = [
  { href: '/wiki', label: 'wiki' },
  { href: '/catalog', label: 'catalog' },
  { href: '/tools', label: 'tools' },
  { href: '/learn', label: 'learn' },
  { href: '/tutorials', label: 'tutorials' },
  { href: '/blog', label: 'blog' },
  { href: '/impossible-routine', label: 'impossible → routine' },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();

  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <Analytics />
        <a className="skip" href="#main">
          Skip to content
        </a>

        <header className="site-header">
          <div className="shell header-bar">
            <Link className="wordmark" href="/">
              addictedto<span className="dot">AI</span>
            </Link>
            <nav aria-label="Primary">
              <ul className="nav">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="header-tools">
              <SearchBox />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main id="main" className="shell" tabIndex={-1}>
          {children}
        </main>

        <footer className="site-footer">
          <div className="shell footer-rows">
            <ul className="footer-links">
              <li>
                <a href="/colophon">colophon</a>
              </li>
              <li>
                <a href="/data">open dataset</a>
              </li>
              <li>
                <a href="/feeds/changes.xml">changed feed (RSS)</a>
              </li>
              <li>
                <a href="/status.json">status.json</a>
              </li>
            </ul>
            <p className="build-stamp" data-build-stamp={site.stamp.stamp}>
              built {site.stamp.built_at} · {site.stamp.commit}
              {site.stamp.dirty ? '+dirty' : ''}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
