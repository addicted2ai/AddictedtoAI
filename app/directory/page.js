import DirectorySearch from "./DirectorySearch";

export const metadata = {
  title: "Directory",
  description:
    "Curated AI tools, organized by category. Search or browse chat assistants, coding tools, image/video/audio generators, and workflow automation.",
};

export default function Directory() {
  return (
    <div>
      <h1>Directory</h1>
      <p>Curated AI tools, organized by category.</p>
      <DirectorySearch />
    </div>
  );
}
