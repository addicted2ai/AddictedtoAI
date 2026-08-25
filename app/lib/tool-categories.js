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
        // Round 197 (maintain) re-checked 2026-08-25 against Google's own
        // blog.google posts, fetched raw: "Google's Gemini app hits 1
        // billion monthly active users" and "The Gemini app becomes more
        // agentic, delivering proactive, 24/7 help" (Gemini Spark "does
        // real work on your behalf"). Both claims still match.
        verified: "2026-08-25",
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
        // Round 197 (maintain) re-checked 2026-08-25: huggingface.co/chat
        // (raw fetch) still labels its router "Omni" ("Omni automatically
        // picks the best AI model..."); huggingface.co/docs/inference-providers/pricing
        // (raw fetch) confirms usage is drawn from monthly per-account
        // inference credits. Still matches.
        verified: "2026-08-25",
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
        // Round 197 (maintain) re-checked 2026-08-25: ollama.com (raw
        // fetch) still advertises "Build with open models, on your
        // computer and in the cloud," lists cloud regions (US, Europe,
        // Singapore), and ollama.com/download still ships a single
        // install command. Still matches.
        verified: "2026-08-25",
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
        // Round 197 (maintain) re-checked 2026-08-25: code.claude.com/docs/en/agent-sdk/overview
        // (raw fetch) still reads "The Agent SDK gives you the same
        // tools, agent loop, and context management that power Claude
        // Code, programmable in Python and TypeScript." Still matches.
        verified: "2026-08-25",
      },
      {
        href: "https://openai.github.io/openai-agents-python/",
        name: "OpenAI Agents SDK",
        description:
          "OpenAI's lightweight Python SDK for building agentic apps — agents, handoffs, guardrails, sessions, and built-in tracing.",
        // Round 197 (maintain) re-checked 2026-08-25: openai.github.io/openai-agents-python/
        // (raw fetch) still describes itself as "a lightweight,
        // easy-to-use package with very few abstractions" and its own
        // nav still carries Handoffs, Guardrails, Sessions, and Tracing
        // as live sections. Still matches.
        verified: "2026-08-25",
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
        // Round 197 (maintain) re-checked 2026-08-25: linuxfoundation.org's
        // own press release (raw fetch) confirms MCP is a founding
        // project contribution to the Agentic AI Foundation (AAIF) under
        // the Linux Foundation; code.visualstudio.com's MCP-servers docs
        // and developers.openai.com's MCP-server docs (both raw fetch)
        // confirm current VS Code and OpenAI/ChatGPT-side support. Still
        // matches.
        verified: "2026-08-25",
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
        // Round 197 (maintain) re-checked 2026-08-25: firefly.adobe.com
        // (raw fetch) still reads "Generate images, video, audio and
        // more with 30+ AI models, all in one place." Still matches.
        verified: "2026-08-25",
      },
      {
        href: "https://runway.com",
        name: "Runway",
        description:
          "AI video generation and world-model research — Creative, Dev, and Robotics platforms.",
        // Round 197 (maintain) re-checked 2026-08-25: runway.com (raw
        // fetch) still lists Creative, Dev (dev.runwayml.com), and
        // Robotics (/product/robotics) as distinct product surfaces, and
        // its own General World Model ("GWM-1") research copy is live.
        // Still matches.
        verified: "2026-08-25",
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
        // Round 197 (maintain) re-checked 2026-08-25: github.com/n8n-io/n8n
        // (raw fetch) still describes itself as "Fair-code workflow
        // automation platform" distributed under the Sustainable Use
        // License and n8n Enterprise License — neither is an OSI-approved
        // open-source license. Still matches.
        verified: "2026-08-25",
      },
    ],
  },
];
