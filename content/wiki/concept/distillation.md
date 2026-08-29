---
id: concept/distillation
kind: concept
display_name: "Distillation"
status: active
maintenance: stable
themes:
  - history
  - argument
aliases:
  - name: "Knowledge distillation"
    class: shared
  - name: "Model distillation"
    class: shared
  - name: "Distillation"
    class: manual
facts:
  - field: soft_target_rationale
    source: cited
    value: "\"one version of a 2 may be given a probability of 10^-6 of being a 3 and 10^-9 of being a 7 whereas for another version it may be the other way around. This is valuable information that defines a rich similarity structure over the data.\""
    source_url: "https://ar5iv.labs.arxiv.org/html/1503.02531"
    accessed: "2026-08-28"
    volatility: static
  - field: mnist_omitted_class_result
    source: cited
    value: "with every 3 removed from the transfer set, \"the distilled model only makes 206 test errors of which 133 are on the 1010 threes in the test set\"; raising the 3 class bias by 3.5 gives \"109 errors of which 14 are on 3s\""
    source_url: "https://ar5iv.labs.arxiv.org/html/1503.02531"
    accessed: "2026-08-28"
    volatility: static
  - field: deepseek_distilled_method
    source: cited
    value: "\"we directly fine-tuned open-source models like Qwen and Llama using the 800k samples curated with DeepSeek-R1\"; \"For distilled models, we apply only SFT and do not include an RL stage\""
    source_url: "https://arxiv.org/html/2501.12948v1"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2015-03-09"
    event: "\"Distilling the Knowledge in a Neural Network\" posted, defining distillation as training on temperature-softened teacher output distributions"
    source_url: "https://arxiv.org/abs/1503.02531"
  - date: "2025-01-22"
    event: "DeepSeek-R1 releases six \"distilled\" dense models produced by supervised finetuning on sampled text, with no teacher distribution involved"
    source_url: "https://arxiv.org/abs/2501.12948"
mentions:
  - technique/quantization
  - org/deepseek
---

Geoffrey Hinton, Oriol Vinyals and Jeff Dean posted the original method on
9 March 2015, and its claim is specific: the useful thing a trained network
carries is not its argmax but the *ratios among the classes it rejected*. Their
example is the one to hold onto. "One version of a 2 may be given a probability of
10^-6 of being a 3 and 10^-9 of being a 7 whereas for another version it may be
the other way around. This is valuable information that defines a rich similarity
structure over the data." A hard label says "2". A soft target says which 2 this
is. Because those probabilities are vanishingly small in a normal softmax, the
method raises the temperature — dividing logits before the softmax so the tail is
legible — and trains the student to match the resulting distribution.

The MNIST demonstration in that paper shows how much is transferred by those
ratios alone. They removed every example of the digit 3 from the
transfer set, so the student network never saw a labelled 3 during distillation.
"Despite this, the distilled model only makes 206 test errors of which 133 are on
the 1010 threes in the test set." The student had learned enough of the class from
the teacher's near-zero probabilities on other digits that a single scalar
correction recovers it: "if this bias is increased by 3.5 (which optimizes overall
performance on the test set), the distilled model makes 109 errors of which 14 are
on 3s." Fourteen mistakes across 1010 examples of a class the student had never
been shown, recovered from what the teacher considered and rejected.

**The word has since acquired a second meaning that is not this.** When DeepSeek
released six smaller "distilled" models alongside DeepSeek-R1 on 22 January 2025,
the paper describes the procedure without ambiguity: "we directly fine-tuned
open-source models like Qwen and Llama using the 800k samples curated with
DeepSeek-R1," and "for distilled models, we apply only SFT and do not include an
RL stage." That is supervised finetuning on sampled text. Each training position
carries one hard token label. No temperature, no logits, no distribution over the
vocabulary — none of the quantity the 2015 paper identified as the payload.

Both procedures are called distillation, and the distinction is not pedantic,
because it decides what is possible. Logit distillation requires access to the
teacher's output distribution, which a text-only API does not expose; a commercial
model can be copied in the second sense from its sampled outputs alone, and cannot
be copied in the first sense at all without weights or logprobs. When a lab says a
small model was distilled from a large one, the question that separates a
compression result from a data-generation result is whether any teacher
probabilities crossed the boundary, or only text.
