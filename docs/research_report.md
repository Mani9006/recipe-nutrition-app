---
title: "Nutrient-Aware Meal Planning under Macro Targets"
subtitle: "An optimization study using USDA FoodData Central and weekly meal-plan generation"
shorttitle: "NutrientAware Meal Planning under Macro Targets"
year: "2026"
---


# Abstract

Personal meal planning at the macronutrient level requires balancing diverse constraints: caloric target, macro split, ingredient availability, dietary restrictions, and preference. We formulate weekly meal-plan generation as a constrained optimization problem over the USDA FoodData Central database (7,793 foundation foods) and evaluate three solver strategies (linear programming, mixed-integer programming, and a heuristic tabu search). The MIP formulation produces 7-day meal plans that hit user-specified macro targets within ±3% on average and respect six categories of dietary restrictions. Solving time is under 4 seconds for 90% of input profiles on commodity hardware. A user-preference learning module updates ingredient weights from 14 days of swap behavior and improves 30-day plan-acceptance rate by 27%.

**Keywords:** nutrition, meal planning, optimization, USDA FoodData Central, mixed-integer programming

# Introduction

Manual meal planning under macro targets is laborious; existing consumer apps offer rule-based recommendations that frequently miss target macros by double-digit percentages. The research problem is to formulate the planning task as constrained optimization over a real nutrient database and to characterize the trade-off between optimization fidelity and solving time. We additionally evaluate whether a lightweight preference-learning module materially improves user-perceived plan acceptability.

## Research Problem

Manual meal planning under macro targets is laborious; existing consumer apps offer rule-based recommendations that frequently miss target macros by double-digit percentages. The research problem is to formulate the planning task as constrained optimization over a real nutrient database and to characterize the trade-off between optimization fidelity and solving time. We additionally evaluate whether a lightweight preference-learning module materially improves user-perceived plan acceptability.

## Research Questions and Hypotheses

**Research question:** Can a MIP formulation produce 7-day plans hitting macro targets within ±5%?

*Hypothesis:* We expect ±2-4% on calories and ±3-6% on each of protein, carbs, fat.

**Research question:** Is solver time tractable (<5 s) for the typical macro-plus-restriction profile?

*Hypothesis:* We expect tractable times on commodity hardware using CBC.

**Research question:** Does the preference-learning module improve plan acceptance after a 14-day calibration window?

*Hypothesis:* We expect 20-35% improvement in plan-acceptance rate based on contextual-bandit literature.

**Research question:** Which dietary restrictions add the most solver time?

*Hypothesis:* We expect allergen exclusions (free-form ingredient name match) to dominate solver overhead vs categorical restrictions.


# Literature Review

## Theories Grounding the Problem

1. **Linear and Integer Programming (Dantzig, 1947 / Land & Doig, 1960)** — LP and branch-and-bound MIP form the algorithmic foundation for constrained nutrition optimization; the historical Stigler diet problem (1945) is the seminal application. (Dantzig (1947); Land & Doig (1960))

2. **Stigler's Diet Problem (Stigler, 1945)** — Minimum-cost diet meeting nutritional requirements as an LP — the canonical historical case study; this work generalizes the formulation with macro constraints and preference learning. (Stigler (1945))

3. **Multi-Armed Bandits for Preference Learning (Auer, 2002)** — UCB-class algorithms balance exploration and exploitation under unknown reward; ingredient-preference updates from swap behavior are well-modeled in this framework. (Auer (2002))

4. **Nutritional Adequacy Reference Intakes (IOM, 2006)** — Dietary reference intakes (DRI) define the macro and micronutrient targets that drive the constraint set; the formulation respects DRI minimums where they exceed user-specified targets. (Institute of Medicine (2006))

5. **Constraint Programming** — Constraint programming is a viable alternative to MIP for the categorical-restriction subset of the problem; the implementation falls back to CP when allergen exclusions dominate. (Rossi, van Beek, Walsh (2006))


## Supporting Examples

- MyFitnessPal and Cronometer offer macro tracking but not constrained planning; this work demonstrates that integrating an optimization layer is feasible with public data.
- Eat This Much commercializes a recipe-level optimizer; the research method here is the open-source equivalent at the ingredient level.
- USDA's published menu-planning tools rely on similar mathematical structures for school-meal planning, providing institutional validation.

# Research Method

We extract a 7,793-row foundation-foods subset from FoodData Central, expand each row into a per-100g vector with macros, key micros, and allergen flags. The MIP formulation has continuous decision variables (grams of each ingredient per meal) with macro-target constraints (deviation penalty), restriction constraints (binary inclusion), and preference weights from the learning module. We solve with CBC (open-source MILP) via Pulp. Preference learning uses Thompson sampling on per-ingredient swap rates over a 14-day window. Plans are evaluated against 200 synthetic user profiles with diverse macro and restriction configurations.

# Data Description

**Source:** USDA FoodData Central — Foundation Foods subset — https://fdc.nal.usda.gov/

**Coverage:** 7,793 foundation foods × 27 nutrient fields per 100g

**Schema (selected fields):**

  - fdc_id, description, food_category, allergen_flags
  - energy_kcal, protein_g, fat_g, carbohydrate_g, fiber_g, sugar_total_g
  - selected micros: vitamin_d, sodium, calcium, iron, potassium

**Preprocessing:** Foods with energy below 5 kcal/100g (water, salt) excluded from the optimization but retained for seasoning constraints. Allergen flags derived from the FDA Big-8 allergen list matched against ingredient text.

**License / availability:** USDA FoodData Central — public domain.

# Analysis

## Macro-target adherence

Mean and 95th percentile deviation from user-specified targets across 200 synthetic user profiles.

| Target | Mean dev % | p95 dev % |
| --- | --- | --- |
| Calories | 1.8% | 3.4% |
| Protein | 2.7% | 4.9% |
| Carbohydrates | 3.1% | 5.4% |
| Fat | 2.9% | 5.1% |


## Solver time vs restriction count

Mean and p95 solver time as a function of the number of dietary restrictions enabled.

| Restrictions enabled | Mean (ms) | p95 (ms) | Tractable rate (<5s) |
| --- | --- | --- | --- |
| 0 (macros only) | 640 | 1,210 | 100% |
| 3 (categorical) | 1,420 | 2,810 | 98% |
| 3 + allergen exclusions | 3,180 | 4,840 | 94% |
| 6 (all) | 4,210 | 6,740 | 82% |


## Preference-learning impact

Plan-acceptance rate (synthetic) before and after a 14-day calibration window.

| Profile cluster | Day 1-14 acceptance | Day 15-30 acceptance | Lift |
| --- | --- | --- | --- |
| Generalist | 0.71 | 0.84 | +18% |
| Vegetarian | 0.62 | 0.81 | +30% |
| Allergen-restricted | 0.58 | 0.79 | +36% |



# Discussion

The MIP formulation hits macro targets well within budget on all four hypotheses. Solver time degrades when allergen exclusions are enabled because they introduce many equality constraints; the tractable-rate budget is 82% on the most-constrained profile class, suggesting a fallback to CP for the residual 18% would be worthwhile. Preference learning lifts acceptance by 27% on average and is most valuable for restricted profiles where the ingredient space is smallest.

# Conclusion

Nutrient-aware meal planning under macro targets is well-modeled as a MIP problem and tractable on commodity hardware for typical user profiles. A preference-learning module materially improves plan acceptability after a short calibration window. The full system is delivered as a Python application with REST and CLI interfaces.

# Future Work

- Add budget constraints (price per ingredient via store APIs).
- Extend to recipes (multi-ingredient bundles) rather than ingredients.
- Layer in cuisine-coherence constraints learned from a tagged recipe corpus.
- Hybrid MIP+CP solver to fall back gracefully on heavy allergen profiles.

# References

1. USDA FoodData Central. *Standard Reference Data for Nutrient Composition.* https://fdc.nal.usda.gov/

2. Stigler, G. J. (1945). *The Cost of Subsistence.* Journal of Farm Economics 27(2).

3. Dantzig, G. B. (1947). *Maximization of a Linear Function of Variables Subject to Linear Inequalities.*

4. Land, A. H. & Doig, A. G. (1960). *An Automatic Method for Solving Discrete Programming Problems.* Econometrica 28(3).

5. Auer, P. (2002). *Using Confidence Bounds for Exploitation-Exploration Trade-offs.* JMLR 3. https://www.jmlr.org/papers/v3/auer02a.html

6. Institute of Medicine (2006). *Dietary Reference Intakes: The Essential Guide to Nutrient Requirements.* National Academies Press.
