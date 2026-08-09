import { sections } from "./lib/sections";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div>
      <h1>Page not found</h1>
      <p>
        That page doesn't exist, or it moved. Here's everything that
        does:
      </p>
      <div className="section-grid">
        {sections.map((section) => (
          <a key={section.href} href={section.href} className="section-card">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
