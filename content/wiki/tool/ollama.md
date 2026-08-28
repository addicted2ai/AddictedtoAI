---
id: tool/ollama
kind: tool
display_name: "Ollama"
status: active
maintenance: stable
aliases:
  - name: "Ollama"
    class: exclusive
facts:
  - field: license
    source: cited
    value: "MIT"
    source_url: "https://github.com/ollama/ollama"
    accessed: "2026-08-28"
    volatility: static
  - field: inference_backend
    source: cited
    value: "built on llama.cpp, credited in the repository to the project founded by Georgi Gerganov"
    source_url: "https://github.com/ollama/ollama"
    accessed: "2026-08-28"
    volatility: slow
  - field: interface
    source: cited
    value: "a local REST API for running and managing models, with client libraries and a hosted model library"
    source_url: "https://github.com/ollama/ollama"
    accessed: "2026-08-28"
    volatility: slow
timeline: []
mentions:
  - tool/llama-cpp
  - technique/quantization
---
