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
        <nav className="nav">
          <a href="/">AddictedtoAI</a>
          <a href="/blog">Blog</a>
          <a href="/directory">Directory</a>
          <a href="/projects">Projects</a>
          <a href="/demos">Demos</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
