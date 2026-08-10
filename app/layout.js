import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  feedAlternates,
  getSiteUrl,
} from "./lib/site";
import Nav from "./Nav";
import { getAnalyticsMeasurementId } from "./lib/analytics";

// Unset by default: with no measurement ID configured, no analytics
// script is emitted at all. See .env.example and README step 4.
const gaMeasurementId = getAnalyticsMeasurementId();

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    types: feedAlternates,
  },
};

export const viewport = {
  themeColor: "#0b0d0f",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: getSiteUrl(),
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
      </body>
    </html>
  );
}
