# AdScope · Advertising growth & experiment decisions

Independent bilingual portfolio prototype. All account and experiment data is synthetic. Built with coding assistance; no production impact is claimed.

- [Open live demo](https://wanyanshanmei-dotcom.github.io/projects/adscope.html)
- [中文版](https://wanyanshanmei-dotcom.github.io/zh/projects/adscope.html)
- [Download complete runnable source and methods](https://wanyanshanmei-dotcom.github.io/assets/adscope-source.zip)

This folder makes the core source modules browsable on GitHub. **To run the demo, download and extract the full ZIP**, then run `python3 -m http.server 4173`. Its README documents the complete layout and statistical assumptions; it includes English/Chinese HTML, synthetic data, a standalone verifier and all styles.

## What to inspect

- `adscope-stats.mjs`: independent-proportions z-test, absolute-difference confidence interval, power planning, SRM and decision gates.
- `adscope.mjs`: data aggregation, filtering, account diagnosis, planning UI, four completed scenarios and bilingual template brief.
- `adscope_data.py`: fixed-seed generator for 24 fictional accounts × 56 days.
- `adscope_case.py`: bilingual template in the portfolio build.
- `verify_adscope.mjs`: verification used by the portfolio checkout; the ZIP includes the runnable standalone version.

## Statistical design

Sticky user-level 50/50 allocation, intention-to-treat denominator, binary 7-day purchase outcome. Primary alpha .05; two-sided pooled z-test and unpooled Wald 95% CI. Predeclared business threshold +0.40 percentage points. Complaint-user-rate non-inferiority gate: one-sided 95% upper bound <+0.20 pp. Sparse counts are insufficient. SRM chi-square flag at p<.001.

Four independent completed teaching cases distinguish insufficient evidence, significance without sufficient business value, safety-gate failure and staged rollout. No repeated peeking or claim that nonsignificance proves equivalence. Planner powers the primary metric only. Dashboard patterns do not establish causal attribution. Brief generation is local template automation; no LLM or TikTok API is connected.
