import DirectorySearch from "./DirectorySearch";
import { feedAlternates } from "../lib/site";
import AiDisclosure from "../components/AiDisclosure";

export const metadata = {
  title: "Directory",
  description:
    "Curated AI tools, organized by category. Search or browse chat assistants, coding tools, image/video/audio generators, and workflow automation.",
  alternates: {
    canonical: "/directory",
    types: feedAlternates,
  },
};

export default function Directory() {
  return (
    <div>
      <AiDisclosure route="/directory" />
      <h1>Directory</h1>
      <p>Curated AI tools, organized by category.</p>
      <DirectorySearch />
    </div>
  );
}
