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

/**
 * S7 (iter-01 verdict, revised iter-02): `.table-wrap` never scrolls
 * vertically on its own — `clientHeight === scrollHeight` — so it is NOT the
 * page, and `.site-header` and `.data-table thead th` do not share a scroll
 * context. The iter-01 remedy assumed they did and offset the thead by
 * `--header-h`, which instead pushed the column headers down onto their own
 * data rows at rest. iter-02 gives `.table-wrap` a real vertical scrollport
 * (`max-height: calc(100vh - var(--header-h)); overflow-y: auto`) so the
 * thead's `position: sticky; top: 0` has a containing block to stick
 * within; `--header-h` now sizes that scrollport's height budget rather than
 * offsetting the thead. This script measures the header's real rendered
 * height (it wraps to a second line under ~26rem, per the narrow breakpoint)
 * and keeps the token exact, instead of guessing a fixed value that would
 * drift the moment the header's content changes. Runs after the header
 * markup below it, and again on resize; --header-h's value in globals.css is
 * only the no-JS fallback. */
const HEADER_HEIGHT_SCRIPT = `try{function s(){var h=document.querySelector('.site-header');if(h)document.documentElement.style.setProperty('--header-h',h.offsetHeight+'px')}s();window.addEventListener('resize',s)}catch(e){}`;

/**
 * I24 (R14): sets `.nav-disclosure`'s default open/closed state to match the
 * viewport at load, and keeps it in sync only when the viewport crosses the
 * 33.999rem/34rem breakpoint the CSS above uses — `matchMedia`'s `change`
 * event, not a raw `resize` listener, specifically so an ordinary mobile
 * resize (the address bar showing or hiding while scrolling) never
 * re-fires this and slams a reader's own opened menu shut. The server-
 * rendered markup carries `open` unconditionally, so a client with
 * JavaScript disabled — or one whose script runs before this element
 * exists, which it cannot: this tag is placed after the header markup,
 * same placement as HEADER_HEIGHT_SCRIPT above — always gets every nav
 * link exposed and tabbable, the safe default per R4. */
const NAV_DISCLOSURE_SCRIPT = `try{var d=document.querySelector('.nav-disclosure');if(d){var mq=window.matchMedia('(max-width: 33.999rem)');var apply=function(matches){d.open=!matches};apply(mq.matches);mq.addEventListener('change',function(e){apply(e.matches)})}}catch(e){}`;

/**
 * S7 (iter-02 round 2): `#catalog-table-wrap`'s sticky pin (globals.css)
 * only survives to the very end of the page's own scroll range if its own
 * height leaves room for everything that trails it — measured, and it is
 * NOT just `.site-footer`'s own rendered height. `--footer-h` here is the
 * whole distance from the wrap's rendered bottom edge to the document's
 * actual bottom: `.site-footer`'s rendered height, PLUS `<main>`'s own
 * trailing `padding-block` (3rem) and `.site-footer`'s `margin-top` (3rem)
 * — measured this directly (177px total at 1440x900) rather than adding
 * those two design tokens by hand, because a first attempt that only
 * measured `.site-footer.offsetHeight` (81px) left the thead 49.7px short
 * of the site header at max scroll: `position: sticky`'s release point
 * empirically tracks only the content BEFORE the wrap, not any padding or
 * margin after it, so all three quantities have to count. This measure
 * (docScrollHeight − wrap's rendered bottom edge) is invariant to the
 * wrap's OWN current height, so it is correct on first paint under the
 * no-JS fallback too, not just after this script corrects it. A 16px
 * buffer is added on top of the raw measurement: without it, the margin at
 * max scroll measured 0.48px against the check's own 0.5px occlusion
 * tolerance — technically passing but too thin to trust against ordinary
 * font-metric or sub-pixel rounding variance across browsers/builds. Same
 * placement pattern as HEADER_HEIGHT_SCRIPT: after the footer markup so
 * the whole document exists when this runs, and again on resize. */
const FOOTER_HEIGHT_SCRIPT = `try{function s(){var w=document.querySelector('#catalog-table-wrap');if(!w)return;var r=w.getBoundingClientRect();var wrapBottom=r.bottom+window.scrollY;var trailing=document.documentElement.scrollHeight-wrapBottom+16;if(trailing>0)document.documentElement.style.setProperty('--footer-h',trailing+'px')}s();window.addEventListener('resize',s)}catch(e){}`;

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
            <details className="nav-disclosure" open>
              <summary className="icon-btn nav-toggle" aria-label="Primary navigation menu">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M2 4.5h12M2 8h12M2 11.5h12" />
                </svg>
                <span className="nav-toggle-label">menu</span>
              </summary>
              <nav aria-label="Primary">
                <ul className="nav">
                  {NAV.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
            <div className="header-tools">
              <SearchBox />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <script dangerouslySetInnerHTML={{ __html: HEADER_HEIGHT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: NAV_DISCLOSURE_SCRIPT }} />

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
        <script dangerouslySetInnerHTML={{ __html: FOOTER_HEIGHT_SCRIPT }} />
      </body>
    </html>
  );
}
