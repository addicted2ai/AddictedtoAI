export const toolCategories = [
  {
    name: "Chat & Assistants",
    tools: [
      {
        href: "https://chatgpt.com",
        name: "ChatGPT",
        description:
          "OpenAI's assistant — the free tier now runs GPT-5.6 Luna by default, with unlimited text chats and a Think button for harder questions.",
        // Round 149 (maintain) re-checked 2026-08-16: the 6 August OpenAI
        // announcement (Luna default, unlimited text chats, Think button)
        // and the live chatgpt.com page both still match this description.
        verified: "2026-08-16",
      },
      {
        href: "https://claude.com",
        name: "Claude",
        description: "Anthropic's assistant, strong at writing and reasoning.",
        verified: "2026-08-15",
      },
      {
        href: "https://gemini.google.com",
        name: "Gemini",
        description:
          "Google's assistant — past 1 billion monthly users, with Gemini Spark, a 24/7 personal agent that acts on your behalf.",
        verified: "2026-08-14",
      },
      {
        href: "https://you.com/",
        name: "You.com",
        description:
          "Web search APIs for AI agents, with a consumer chat assistant.",
        verified: "2026-08-13",
      },
      {
        href: "https://huggingface.co/chat",
        name: "HuggingChat",
        description:
          "Chat with open models via Hugging Face's Omni router, metered by inference credits.",
        verified: "2026-08-15",
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
        verified: "2026-08-15",
      },
      {
        href: "https://www.cursor.com",
        name: "Cursor",
        description: "AI coding agent for building software in your editor.",
        verified: "2026-08-15",
      },
      {
        href: "https://claude.com/product/claude-code",
        name: "Claude Code",
        description:
          "Anthropic's coding agent — build, debug, and ship from your terminal, IDE, Slack, or web.",
        verified: "2026-08-14",
      },
      {
        href: "https://ollama.com",
        name: "Ollama",
        description:
          "Run open-source LLMs locally with one command — or in the cloud.",
        verified: "2026-08-15",
      },
    ],
  },
  {
    name: "Agents",
    note: "Frameworks for building your own agents — chosen on merit, not an exhaustive list.",
    tools: [
      {
        href: "https://code.claude.com/docs/en/agent-sdk/overview",
        name: "Claude Agent SDK",
        description:
          "Anthropic's library for building production agents — the same agent loop, tools, and context management that power Claude Code, in Python and TypeScript.",
        verified: "2026-08-14",
      },
      {
        href: "https://openai.github.io/openai-agents-python/",
        name: "OpenAI Agents SDK",
        description:
          "OpenAI's lightweight Python SDK for building agentic apps — agents, handoffs, guardrails, sessions, and built-in tracing.",
        verified: "2026-08-14",
      },
      {
        href: "https://www.langchain.com",
        name: "LangChain",
        description:
          "Open-source framework for building agents with any model provider — quick-start agents, plus LangGraph for low-level control.",
        verified: "2026-08-14",
      },
    ],
  },
  {
    name: "MCP",
    note: "The standard that connects agents to your tools and data — one curated pointer to the protocol itself rather than the thousands of servers built on it.",
    tools: [
      {
        href: "https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro",
        name: "Model Context Protocol",
        description:
          "The open-source standard for connecting AI applications to tools and data — used by Claude, ChatGPT, and VS Code, governed under the Linux Foundation's Agentic AI Foundation.",
        verified: "2026-08-14",
      },
    ],
  },
  {
    name: "Image, Video & Audio",
    tools: [
      {
        href: "https://firefly.adobe.com",
        name: "Firefly",
        description:
          "Adobe's AI creative studio — generate images, video, audio and more with 30+ AI models in one place.",
        verified: "2026-08-14",
      },
      {
        href: "https://runway.com",
        name: "Runway",
        description:
          "AI video generation and world-model research — Creative, Dev, and Robotics platforms.",
        verified: "2026-08-15",
      },
      {
        href: "https://elevenlabs.io",
        name: "ElevenLabs",
        description:
          "AI voice, music, agents, and translation platform, with voice cloning as one feature.",
        verified: "2026-08-15",
      },
      {
        href: "https://suno.com",
        name: "Suno",
        description: "Generate full songs from a text prompt.",
        verified: "2026-08-15",
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
        verified: "2026-08-15",
      },
      {
        href: "https://n8n.io",
        name: "n8n",
        description:
          "Source-available workflow automation with AI nodes — fair-code licensed, not OSI open source.",
        verified: "2026-08-15",
      },
    ],
  },
];
