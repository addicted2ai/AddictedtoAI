---
id: concept/hallucination
kind: concept
display_name: "Hallucination"
status: active
maintenance: stable
themes:
  - argument
aliases:
  - name: "Hallucination"
    class: manual
  - name: "Model hallucination"
    class: shared
  - name: "Confabulation"
    class: manual
facts:
  - field: singleton_lower_bound
    source: cited
    value: "\"hallucination rate, after pretraining, should be at least the fraction of training facts that appear once\""
    source_url: "https://arxiv.org/abs/2509.04664"
    accessed: "2026-08-28"
    volatility: static
  - field: origin_as_binary_error
    source: cited
    value: "\"Hallucinations need not be mysterious — they originate simply as errors in binary classification.\""
    source_url: "https://arxiv.org/abs/2509.04664"
    accessed: "2026-08-28"
    volatility: static
  - field: benchmark_abstention_credit
    source: cited
    value: "GPQA, MMLU-Pro and SWE-bench are all scored binary, with no credit for an \"I don't know\" response"
    source_url: "https://arxiv.org/abs/2509.04664"
    accessed: "2026-08-28"
    volatility: dated
  - field: letter_counting_trials
    source: cited
    value: "DeepSeek-V3 returned \"2\" or \"3\" in ten independent trials when asked how many Ds are in DEEPSEEK"
    source_url: "https://arxiv.org/abs/2509.04664"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2025-09-04"
    event: "\"Why Language Models Hallucinate\" posted, deriving a pretraining lower bound and attributing persistence to benchmark scoring"
    source_url: "https://arxiv.org/abs/2509.04664"
mentions:
  - concept/tokenization
  - concept/reversal-curse
  - org/openai
---

Treating hallucination as a defect implies a version of the system without it.
One published account argues there is no such version under current training and
grading, and it splits the phenomenon into two questions with different answers:
where hallucinations come from, and why they stay.

Adam Kalai, Ofir Nachum, Santosh Vempala and Edwin Zhang set out the argument on
4 September 2025. The origin half reduces generation to a decision problem: given
a candidate statement, is it valid? "Hallucinations need not be mysterious — they
originate simply as errors in binary classification," and "if incorrect statements
cannot be distinguished from facts, then hallucinations in pretrained language
models will arise through natural statistical pressures."

The sharp consequence is a floor, not a tendency. They define the singleton rate
as the fraction of facts appearing exactly once in the training corpus, and derive
that the "hallucination rate, after pretraining, should be at least the fraction
of training facts that appear once." A fact seen once carries no statistical
evidence distinguishing it from a plausible near-miss, so a well-calibrated model
must sometimes emit the near-miss. A base model that never erred on singleton
facts would have to be miscalibrated on the distribution it was fit to. That is a
different kind of claim from "models sometimes get things wrong": it says a
measurable property of the corpus sets a bound the training procedure cannot go
below.

The persistence half is about incentives, and it is the part that is actionable.
Their Table 2 walks through what the field's leaderboards actually reward: GPQA,
MMLU-Pro and SWE-bench alike score binary — a right answer scores, everything else
scores nothing, and abstention scores exactly what a wrong guess scores. Under
that rule, guessing is not a failure of the objective; it is the objective. A
model that says "I don't know" when uncertain loses to an identical model that
guesses, on every benchmark that decides which model ships. The paper's proposed
fix follows from the diagnosis and is unglamorous: change the scoring of the
benchmarks that already dominate, rather than adding another hallucination
benchmark alongside them.

Two things this framing does not cover, and it says so. Some errors are not
statistical at all but representational — asked how many Ds are in DEEPSEEK,
DeepSeek-V3 returned "2" or "3" across ten independent trials, which is a failure
to see letters, not a failure to recall a fact. And some are structural: a model
trained on "A is B" can fail on "B is A" regardless of how often it saw the
statement.

The practical reading is that "reduce hallucinations" is at least three separate
engineering problems, and only one of them — the incentive to guess rather than
abstain — can be fixed without touching pretraining.
