---
id: model/all-minilm-l6-v2
kind: model
display_name: "all-MiniLM-L6-v2 (ONNX)"
status: active
maintenance: stable
aliases:
  - name: "all-MiniLM-L6-v2"
    class: manual
  - name: "Xenova/all-MiniLM-L6-v2"
    class: manual
facts:
  # The repository's last-modified date is this model's "version": the ONNX
  # conversion has no release numbers, only commits.
  - field: version
    source: cited
    value: "2025-07-22"
    source_url: https://huggingface.co/api/models/Xenova/all-MiniLM-L6-v2
    accessed: "2026-08-28"
    volatility: slow
  - field: hidden_size
    source: cited
    value: 384
    source_url: https://huggingface.co/Xenova/all-MiniLM-L6-v2/raw/main/config.json
    accessed: "2026-08-28"
    volatility: static
  - field: layers
    source: cited
    value: 6
    source_url: https://huggingface.co/Xenova/all-MiniLM-L6-v2/raw/main/config.json
    accessed: "2026-08-28"
    volatility: static
  - field: max_position_embeddings
    source: cited
    value: 512
    source_url: https://huggingface.co/Xenova/all-MiniLM-L6-v2/raw/main/config.json
    accessed: "2026-08-28"
    volatility: static
  - field: license
    source: cited
    value: "apache-2.0"
    source_url: https://huggingface.co/Xenova/all-MiniLM-L6-v2/raw/main/README.md
    accessed: "2026-08-28"
    volatility: static
  - field: base_model
    source: cited
    value: "sentence-transformers/all-MiniLM-L6-v2"
    source_url: https://huggingface.co/Xenova/all-MiniLM-L6-v2/raw/main/README.md
    accessed: "2026-08-28"
    volatility: static
timeline: []
mentions:
  - tool/transformers-js
---
