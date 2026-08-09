import ToolFinder from "./ToolFinder";

export const metadata = {
  title: "Demos",
  description:
    "Interactive AI demos and playgrounds. Try the Tool Finder to get AI tool recommendations for what you're trying to do.",
  alternates: {
    canonical: "/demos",
  },
};

export default function Demos() {
  return (
    <div>
      <h1>Demos</h1>
      <p>Interactive AI demos and playgrounds.</p>
      <div className="finder">
        <h2>Tool Finder</h2>
        <p className="finder-intro">
          Answer one question, get a couple of AI tools worth trying.
        </p>
        <ToolFinder />
      </div>
    </div>
  );
}
