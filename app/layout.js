import "./globals.css";
import { getSiteUrl } from "./lib/site";
import Nav from "./Nav";

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    template: "%s | AddictedtoAI",
    default: "AddictedtoAI",
  },
  description: "AI news, tools, projects, and demos.",
};

export const viewport = {
  themeColor: "#0b0d0f",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AddictedtoAI",
  url: getSiteUrl(),
  description: "AI news, tools, projects, and demos.",
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
      </body>
    </html>
  );
}
