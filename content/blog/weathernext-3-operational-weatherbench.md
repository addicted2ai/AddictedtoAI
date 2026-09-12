---
title: "Brightband says WeatherNext 3 is the new leader on its live Operational WeatherBench"
date: "2026-09-12"
mentions:
  - org/google-deepmind
---

On 2 September 2026 Brightband wrote that Google DeepMind's WeatherNext 3 "is the new leader on Operational WeatherBench (OWB), Brightband's real-time comparison of the best AI and physics-based global medium-term weather forecast models." That sentence is the story. The referee is not Google. The board rescores as new forecast cycles verify, so the claim has a date on it.

I could not read the board directly. The live leaderboard at owb.brightband.com renders client-side and returned no readable standings to a fetch on 12 September 2026, so what follows attributes the lead claim to two dated reports rather than restating a second-hand ranking as a first-hand reading: TechCrunch on 3 September 2026 and Google's own developer documentation.

If you get weather from Search, Maps or Gemini, you are the affected reader. Google says WeatherNext 3 feeds those products, plus BigQuery, Earth Engine and the Maps Platform for enterprise users. Nothing breaks and nothing needs migrating. What changes is granularity: hourly refreshes instead of six-hourly, and rain and temperature detail tuned to stations rather than grid averages. Wind and solar operators feel it second, through radiation, cloud cover and 100-metre wind outputs built for dispatch planning.

## The board belongs to Brightband, and it moves every cycle

Operational WeatherBench is Brightband's live benchmark of real-time physics and AI forecast model skill on headline weather metrics, global and regional. Brightband's benchmarks page, dated 6 August 2026, describes it as updated continuously as new forecast cycles verify, with the live table at owb.brightband.com. Brightband is a weather AI startup, not part of Google.

The 2 September news post announcing the lead change is specific about what moved. During August, it says, the WeatherNext 3 ensemble "was regularly the most skillful out of all its peers, edging out its predecessor, WeatherNext 2," and for 2-metre temperature it "had the lowest error for 26 of the last 30 days." When Brightband launched the dashboard the previous month, WeatherNext 2 had held the top spot, narrowly ahead of ECMWF's AIFS-ENS. The post adds that four of the top five models on its headline metrics are now AI-based rather than physics-based.

TechCrunch, reporting 3 September 2026, puts the physics names on that general statement: WeatherNext 3 beats "other deep-learning models built by Google, Microsoft, Nvidia, and the European Center for Medium-Range Weather Forecasting (ECMWF)" and "also beats traditional forecasts from the U.S. National Weather service and the ECMWF." Those traditional systems are ECMWF's IFS and NOAA's GFS, the operational physics pair Google's own developer docs name as the incumbent alternative alongside ECMWF HRES/ENS/AIFS and NOAA GFS. The attribution matters because only Brightband scores the board. Google's paper scores its own baselines.

## The model changed how forecasts start, not just how they compute

The architecture account below comes from the paper, not the launch blog. The paper is arXiv:2609.03582v1, "WeatherNext 3: Increasing resolution and performance of global weather models with raw observations," submitted 3 September 2026. It was the only version at retrieval on 12 September 2026, and every passage quoted here was checked against the arXiv abstract and the v1 HTML of that date.

Three changes, in the abstract's own order. First, WeatherNext 3 "generates new forecasts every hour (rather than every 6 hours like traditional global models) by ingesting low-latency geostationary satellite data." Second, it runs "hourly time steps and 0.1 degree resolution for single-level variables, including solar radiation and cloud cover." Third, it "moves beyond traditional analysis variables by learning to predict satellite-derived precipitation estimates, as well as tropical cyclone and station observations," with 2-metre temperature and dewpoint predictions "at any location and time, conditioned on local geographical features."

The resolution figures need one presentation, because the launch coverage invites a wrong one. Google's developer docs give the same geometry once: station-calibrated surface output at 0.05 degrees (about 5 km), core gridded surface fields at 0.1 degrees (about 10 km) with hourly steps, atmospheric levels at 25 km. The abstract's 0.1-degree figure for single-level variables is the middle of those three, not a global 5 km number. The 5 km figure belongs to the station head alone.

## Google's numbers are Google's, and the board's verdict is Brightband's

The paper's accuracy figures are measured by Google against Google's chosen baselines, and they stay labelled that way here. Against WN2 and ECMWF ENS, the PARDIG precipitation head cuts CRPS "by up to 60% for IMERG, 30% for MRMS and 10% for rain gauge measurements for early lead times." IMERG is NASA's satellite precipitation estimate, MRMS is the US radar-gauge composite, rain gauges are Synoptic's station network. IMERG is not independent ground truth for the IMERG head, since the model trains on it, which is why the paper evaluates all three.

The broader precipitation figure comes from Google's developer docs, not the paper: "up to 50% reduction in Brier score and CRPS compared to numerical weather prediction baselines." That is Google's comparison against NWP systems on its own evaluation, fetched 12 September 2026 from the benefits page last updated 2 September. Neither figure is Brightband's. The independent verdict is the August ranking above, nothing more precise.

What did not change gets its own sentence. This is a medium-range forecast model, scored on forecast skill over a 15-day horizon across 64 ensemble members. It is not a climate projection claim.

## How this was assembled

Method, stated so it can be redone. Fetched the arXiv v1 abstract and full HTML for 2609.03582 on 12 September 2026. Fetched Brightband's 2 September news post and its benchmarks page the same day. Fetched TechCrunch's 3 September report the same day. Fetched Google's WeatherNext developer homepage, benefits page and model-specification page the same day. Attempted the live board at owb.brightband.com the same day and recorded the failure above. No rows were scraped and no scores recomputed. The dated evidence is five documents: Brightband 2 September, TechCrunch 3 September, arXiv v1 submitted 3 September, developer docs last updated 2 September, all retrieved 12 September.

The site's own weather delta now reflects the same event. Its routine end stood at February 2025, ECMWF running a machine-learning forecast beside its physics system. It now points at September 2026, with its own source, in `content/deltas/learned-weather-forecasts.md`.

## Sources

All retrieved 12 September 2026.

- Brightband, "WeatherNext 3 on Operational WeatherBench," 2 September 2026 — [brightband.com/company/news/weathernext-3-on-operational-weatherbench](https://brightband.com/company/news/weathernext-3-on-operational-weatherbench)
- Brightband benchmarks page, "Operational WeatherBench," dated 6 August 2026 — [brightband.com/benchmarks](https://brightband.com/benchmarks)
- Tim Fernholz, TechCrunch, "Google's latest AI weather model gives you no excuse to forget your umbrella," 3 September 2026 — [techcrunch.com](https://techcrunch.com/2026/09/03/googles-latest-ai-weather-model-gives-you-no-excuse-to-forget-your-umbrella/)
- arXiv:2609.03582v1, Rasp et al., "WeatherNext 3: Increasing resolution and performance of global weather models with raw observations," submitted 3 September 2026 — [arxiv.org/abs/2609.03582v1](https://arxiv.org/abs/2609.03582v1)
- Google for Developers, WeatherNext benefits page, last updated 2 September 2026 — [developers.google.com/weathernext/guides/benefits-limitations](https://developers.google.com/weathernext/guides/benefits-limitations)
- Google for Developers, WeatherNext home — [developers.google.com/weathernext](https://developers.google.com/weathernext)
- Google DeepMind, WeatherNext science page — [deepmind.google/science/weathernext/](https://deepmind.google/science/weathernext/)
