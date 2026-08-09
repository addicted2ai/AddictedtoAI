import "./globals.css";

export const metadata = {
  title: {
    template: "%s | AddictedtoAI",
    default: "AddictedtoAI",
  },
  description: "AI news, tools, projects, and demos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <nav className="nav">
          <a href="/">AddictedtoAI</a>
          <a href="/blog">Blog</a>
          <a href="/directory">Directory</a>
          <a href="/projects">Projects</a>
          <a href="/demos">Demos</a>
        </nav>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
