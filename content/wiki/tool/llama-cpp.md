---
id: tool/llama-cpp
kind: tool
display_name: "llama.cpp"
status: active
maintenance: stable
aliases:
  - name: "llama.cpp"
    class: exclusive
facts:
  - field: license
    source: cited
    value: "MIT"
    source_url: "https://github.com/ggml-org/llama.cpp"
    accessed: "2026-08-28"
    volatility: static
  - field: stated_goal
    source: cited
    value: "LLM and VLM inference in C/C++ with minimal setup across a wide range of hardware"
    source_url: "https://github.com/ggml-org/llama.cpp"
    accessed: "2026-08-28"
    volatility: static
  - field: backends
    source: cited
    value: "more than fifteen backends, including CUDA, HIP, Metal, Vulkan, SYCL and OpenVINO"
    source_url: "https://github.com/ggml-org/llama.cpp"
    accessed: "2026-08-28"
    volatility: slow
  - field: quantization_types
    source: cited
    value: "k-quants Q2_K through Q6_K plus the IQ series, each with a measured bits-per-weight figure in the repository's own table"
    source_url: "https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2023-06-05"
    event: "k-quants merged, introducing super-block quantization types Q2_K through Q6_K"
    source_url: "https://github.com/ggml-org/llama.cpp/pull/1684"
mentions:
  - technique/quantization
---
