---
date: 2026-09-07
slug: weathernext-3-tops-operational-weatherbench
type: post
frontier: true
frontier_reason: F2
domains: [science-math]
summary: >
  A post on WeatherNext 3 taking the top of Operational WeatherBench — the
  independent live leaderboard run by the weather startup Brightband — ahead of
  ECMWF's IFS and NOAA's GFS, the two physics-based systems operational
  meteorology has been built around for decades. The story is not the model
  launch, which every outlet covered as a consumer feature; it is that a
  third party nobody at Google controls now scores a learned model above the
  physics gold standards every forecast cycle, and publishes the result. The
  post would state what the index is and who runs it, what WeatherNext 3
  changed architecturally (hourly forecasts driven by live geostationary
  satellite data instead of six-hourly government analysis; 0.1 degree
  single-level resolution; direct prediction of station observations,
  satellite-derived precipitation and cyclone tracks), what the paper claims
  and what the independent board measures, and it would close the site's own
  `content/deltas/learned-weather-forecasts.md` delta — whose "routine" end
  still stands at ECMWF running an ML forecast beside its physics system in
  February 2025.
evidence: >
  Google DeepMind / Google Research announcement, "Introducing WeatherNext 3,
  our most advanced and accurate global weather AI model", published
  2026-09-03, fetched 2026-09-07 —
  https://blog.google/innovation-and-ai/models-and-research/google-deepmind/introducing-weathernext-3/
  (5 km resolution for surface variables like temperature and moisture, 10 km
  for other surface variables, 25 km for atmospheric variables such as wind
  speed; "roughly five times sharper than our previous model, WeatherNext 2";
  "Continuous Ranked Probability Score (CRPS) improvement of up to 60% against
  IMERG, 30% for MRMS, and 10% against rain gauge measurements"; "up to 50%
  more accurate precipitation forecasts" for day-ahead-and-beyond planning;
  "generate a new forecast every hour"; ingests "a mosaic of live, global
  geostationary satellite data" and trains on "sparse weather station
  observation data"; cites "independent live evaluations by Brightband" and
  their live leaderboards).

  arXiv:2609.03582v1, "WeatherNext 3: Increasing resolution and performance of
  global weather models with raw observations", Rasp, Babenko, Masters,
  El-Kadi, Merchant, Shalev, Price, Zyda, Lam, Shysheya, Willson, Markou,
  Agrawal, Vora, Alewi Hassen, Mak, Andersson, Bela, Uddin, Peled Levi,
  Gaiarin, Alet, Bell, Battaglia, Sanchez-Gonzalez; v1 submitted 2026-09-03
  09:30:21 UTC, abstract page fetched 2026-09-07 —
  https://arxiv.org/abs/2609.03582 (abstract, verbatim in part: "WeatherNext 3
  addresses these shortcomings and establishes a new state-of-the-art for
  probabilistic medium-range forecasting skill"; "generates new forecasts every
  hour (rather than every 6 hours like traditional global models) by ingesting
  low-latency geostationary satellite data"; "hourly time steps and 0.1 degree
  resolution for single-level variables, including solar radiation and cloud
  cover"; "Modelling sparse station data allows WeatherNext 3 to make 2m
  temperature and dewpoint predictions at any location and time... with
  substantially lower error than competing global models, even when evaluated
  against unseen stations").

  Google for Developers, "Research and benchmarks | WeatherNext", fetched
  2026-09-07 — https://developers.google.com/weathernext/guides/research
  ("Up to 50% reduction in Brier score and CRPS compared to numerical weather
  prediction baselines"; "Up to 5x improvement in resolution over WeatherNext 2
  (0.05 deg / ~5 km for station-calibrated surface variables and 0.1 deg /
  ~10 km for gridded surface variables versus 0.25 deg / ~25 km)"; evaluation
  "against ECMWF operational systems (HRES deterministic and ENS
  probabilistic)... via WeatherBench 2"; Brightband's Operational WeatherBench
  described as providing "continuous, independent tracking and verification of
  operational AI and numerical weather prediction systems").

  TechCrunch, Tim Fernholz, "Google's latest AI weather model gives you no
  excuse to forget your umbrella", published 2026-09-03, fetched 2026-09-07 —
  https://techcrunch.com/2026/09/03/googles-latest-ai-weather-model-gives-you-no-excuse-to-forget-your-umbrella/
  ("The new model has already proven to be the most accurate among leading
  contenders tested on Operational WeatherBench, a utility for comparing AI
  forecasts built by the startup Brightband"; it outperformed "deep-learning
  models built by Google, Microsoft, Nvidia, and the European Center for
  Medium-Range Weather Forecasting (ECMWF)" as well as "traditional forecasts
  from the U.S. National Weather service and the ECMWF").

  Brightband, Operational WeatherBench — https://owb.brightband.com/ and
  https://www.brightband.com/ — fetched 2026-09-07. RECORDED HONESTLY: the
  leaderboard renders client-side and this run's fetcher returned only the page
  chrome, so THIS RUN DID NOT READ THE RANKING TABLE OFF THE BOARD ITSELF. The
  lead claim above rests on TechCrunch's dated report and on Google's own
  developer documentation naming the board; a writing job MUST read the board
  directly (or its underlying data endpoint) and record what it saw on the day
  it wrote, because a live leaderboard can change between this docket and the
  post.
expires: 2026-09-13
proposed_by_job: j-20260907-05
proposed_by_type: scout
---

# WeatherNext 3 leads an independent live leaderboard over IFS and GFS

## Why now

The announcement is four days old and the arXiv paper is the same age, but the
window that matters is shorter than that: the claim is about a **live** board
that rescores every forecast cycle, so "WeatherNext 3 currently leads
Operational WeatherBench" is a sentence with a shelf life measured in days. It
is worth writing while it is checkable and worth nothing once it is stale.

The site is also unusually well placed to write it and has not. There is no
`science-math` post in `content/blog/` at all, and the corpus's one weather
artifact — `content/deltas/learned-weather-forecasts.md` — still has its
"routine" end pinned at February 2025, ECMWF running an ML forecast *beside*
its physics system. A learned model at the top of a third party's operational
board, ahead of both IFS and GFS, is what that delta's routine end should now
say.

## Why this is `frontier: true`, and under F2 rather than F1 or F3

**F2 — a lead change on a published index.** Operational WeatherBench is a
published index, run by Brightband, which is not Google; Google's own developer
documentation names it as providing "continuous, independent tracking and
verification of operational AI and numerical weather prediction systems", which
is a vendor conceding the referee's independence. The leader moved: the models
displaced are ECMWF's IFS and NOAA's GFS, the operational physics systems, and
per TechCrunch the board also ranks WeatherNext 3 above the deep-learning
entries from Microsoft, Nvidia and ECMWF.

It is **not** F1: the underlying capability — a learned model beating a physics
forecast — was first shown by GraphCast in November 2023, and this corpus
already records that as the delta's `impossible` end. It is **not** F3: this is
not an LLM release by a covered organisation and it does not carry open
weights.

And it clears the "does not qualify" list on the one thing that list is for.
Every AI news site ran WeatherNext 3 on 3 September as a consumer feature —
Search, Maps, the Gemini app, better rain forecasts. That coverage is the
launch, and a launch with no new artifact would not qualify. What qualifies is
the part those pieces mention in a clause and drop: an independent board that
nobody at Google operates now scores a learned model above the two physics
systems national meteorology is built on, and it publishes that result every
cycle so anyone can check it.

## Would-send test

"An independent weather leaderboard now ranks Google's AI model above ECMWF's
IFS and NOAA's GFS — the physics models every forecast you have ever seen came
out of." Anyone who works near forecasting, energy trading, insurance,
logistics or climate sends that to one specific person without further comment.
The umbrella framing does not survive the send test; the referee's verdict
does.

## What the job would produce (done-when)

- The post states what Operational WeatherBench is, who runs it (Brightband, a
  third party), and that it rescores continuously — and it reports the ranking
  **as read on the day of writing**, with the retrieval date in the text, not
  as read from this docket.
- Where the writing job cannot read the board directly, it says so in the post
  in those words and attributes the lead claim to TechCrunch's dated report and
  to Google's developer documentation — it does not restate a second-hand
  ranking as a first-hand reading.
- The architectural change is stated from the paper, not the blog: hourly
  forecasts from low-latency geostationary satellite data rather than six-hourly
  analysis, 0.1 degree single-level resolution, and direct prediction of station
  observations, satellite-derived precipitation and cyclone tracks — quoting
  arXiv:2609.03582v1 and pinning the version, because the claim is tied to a
  date.
- Every accuracy figure is attributed to whoever measured it and against what:
  the CRPS improvements (60% vs IMERG, 30% vs MRMS, 10% vs rain gauges) and the
  "up to 50%" precipitation figure are Google's own, measured against Google's
  chosen baselines, and the post labels them as such rather than blending them
  with the independent board's verdict.
- The resolution numbers are stated once and consistently. The announcement and
  the developer docs give the same figures in different units (5 km / 0.05 deg
  station-calibrated, 10 km / 0.1 deg gridded surface, 25 km atmospheric) and
  the abstract states 0.1 degree for single-level variables; the post picks one
  presentation and does not imply a single global "5 km" number.
- The post names what did not change: this is a forecast model, evaluated on
  forecast skill, and it is not a claim about climate projection.
- `content/deltas/learned-weather-forecasts.md` is either updated with a sourced
  new `routine` end or the post explicitly says why it was left alone. A delta
  end must carry its own source; if the writing job cannot source the update to
  this standard it leaves the delta untouched rather than half-sourcing it.
