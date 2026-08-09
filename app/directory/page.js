const categories = [
  {
    name: "Chat & Assistants",
    tools: [
      {
        href: "https://www.anthropic.com/claude",
        name: "Claude",
        description: "Anthropic's assistant, strong at writing and reasoning.",
      },
      {
        href: "https://gemini.google.com",
        name: "Gemini",
        description: "Google's multimodal assistant, built into Workspace.",
      },
      {
        href: "https://huggingface.co/chat",
        name: "HuggingChat",
        description: "Free, open-model chat interface from Hugging Face.",
      },
    ],
  },
  {
    name: "Coding",
    tools: [
      {
        href: "https://github.com/features/copilot",
        name: "GitHub Copilot",
        description: "AI pair programmer built into your editor.",
      },
      {
        href: "https://www.cursor.com",
        name: "Cursor",
        description: "AI-first code editor built on VS Code.",
      },
      {
        href: "https://ollama.com",
        name: "Ollama",
        description: "Run open-source LLMs locally with one command.",
      },
    ],
  },
  {
    name: "Image, Video & Audio",
    tools: [
      {
        href: "https://runwayml.com",
        name: "Runway",
        description: "AI video generation and editing tools.",
      },
      {
        href: "https://elevenlabs.io",
        name: "ElevenLabs",
        description: "Realistic AI voice generation and cloning.",
      },
      {
        href: "https://suno.com",
        name: "Suno",
        description: "Generate full songs from a text prompt.",
      },
    ],
  },
  {
    name: "Workflow & Data",
    tools: [
      {
        href: "https://zapier.com",
        name: "Zapier",
        description: "Connect apps and automate workflows with AI steps.",
      },
      {
        href: "https://n8n.io",
        name: "n8n",
        description: "Open-source workflow automation with AI nodes.",
      },
      {
        href: "https://www.langchain.com",
        name: "LangChain",
        description: "Framework for building LLM-powered applications.",
      },
    ],
  },
];

export default function Directory() {
  return (
    <div>
      <h1>Directory</h1>
      <p>Curated AI tools, organized by category.</p>
      {categories.map((category) => (
        <section key={category.name} className="tool-category">
          <h2>{category.name}</h2>
          <div className="tool-grid">
            {category.tools.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="tool-card"
              >
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
