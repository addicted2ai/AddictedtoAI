---
title: "Fine-tuning on one GPU"
capability: "Fine-tuning a large language model into your own specialized version on a single machine."
impossible:
  date: "2021-06-17"
  what: "Microsoft researchers measure full fine-tuning of GPT-3 at 1.2 TB of GPU memory and call deploying independent fine-tuned copies prohibitively expensive."
  source_url: "https://arxiv.org/html/2106.09685v2"
  metric: "1.2 TB of GPU memory"
routine:
  date: "2023-05-23"
  what: "QLoRA fine-tunes a 65-billion-parameter model on a single 48 GB GPU in 24 hours, reaching 99.3% of ChatGPT's level on the Vicuna benchmark."
  source_url: "https://arxiv.org/abs/2305.14314"
  metric: "one 48 GB GPU, 24 hours"
mentions:
  - technique/quantization
---
