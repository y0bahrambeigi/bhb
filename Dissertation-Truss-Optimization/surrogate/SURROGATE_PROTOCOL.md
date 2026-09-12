# Machine-learning surrogate protocol

The surrogate must approximate engineering responses, not hide them inside one
penalized fitness value. The recommended targets are:

1. unpenalized structural weight;
2. maximum stress ratio;
3. maximum displacement ratio;
4. total normalized constraint violation; and
5. stability/feasibility classification.

## Data flow

`design variables -> FE analysis -> engineering targets -> quality checks -> split -> model -> guarded optimization`

## Sampling

- Preserve upper- and lower-bound anchor designs.
- Combine uniform/discrete sampling, Latin hypercube sampling, boundary-focused
  samples, and designs visited by the optimizer.
- Store the sampling source for every row.
- Deduplicate after discrete section projection so repeated catalog designs do
  not leak across train and test sets.
- Keep all rows from the same design in the same split.

## Split and validation

- Development split: 70% train, 15% validation, 15% untouched test.
- Add a second extrapolation test composed of boundary and low-frequency
  section combinations.
- Never select hyperparameters using the untouched test set.
- Compare against simple baselines before using neural networks: mean predictor,
  linear/ridge regression, tree ensemble, and Gaussian-process regression for
  smaller datasets.

## Safety gates for optimizer use

- Report MAE, RMSE, and R-squared for each continuous target.
- Report confusion matrix, infeasible-case recall, and false-feasible rate for
  the feasibility classifier.
- Treat a predicted design as feasible only when every predicted constraint is
  below a conservative threshold and predictive uncertainty is acceptable.
- Re-evaluate every candidate optimum with the exact finite-element model.
- Add mispredicted or high-uncertainty designs back to the training pool (active
  learning) and version the resulting dataset.

## Reproducibility record

Save benchmark ID, dataset hash, source Git SHA, feature order, target order,
section catalog, split indices, random seeds, preprocessing parameters, model
hyperparameters, software versions, and exact FE validation results for all
reported optima.

`GenerateSurrogateDataset.m` provides the first reproducible FE-labelled pilot
dataset. It does not by itself establish surrogate accuracy; that claim requires
the split, metrics, uncertainty checks, and exact-FE confirmation above.

