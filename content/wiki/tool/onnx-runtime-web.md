---
id: tool/onnx-runtime-web
kind: tool
display_name: "ONNX Runtime Web"
status: active
maintenance: living
aliases:
  - name: "ONNX Runtime Web"
    class: manual
  - name: "onnxruntime-web"
    class: manual
facts:
  # Deliberately not named `version`: the build a page actually loads is the
  # one Transformers.js pins in its own dependencies, which trails this tag.
  - field: latest_release
    source: cited
    value: "1.29.0"
    source_url: https://registry.npmjs.org/onnxruntime-web/latest
    accessed: "2026-08-28"
    volatility: fast
  - field: license
    source: cited
    value: "MIT"
    source_url: https://registry.npmjs.org/onnxruntime-web/latest
    accessed: "2026-08-28"
    volatility: static
  - field: repository
    source: cited
    value: "https://github.com/Microsoft/onnxruntime"
    source_url: https://registry.npmjs.org/onnxruntime-web/latest
    accessed: "2026-08-28"
    volatility: static
timeline: []
mentions: []
---
