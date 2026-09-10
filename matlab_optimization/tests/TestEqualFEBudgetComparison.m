function TestEqualFEBudgetComparison()
%TestEqualFEBudgetComparison Regression checks for fair-budget comparison.

rootDir = fileparts(fileparts(mfilename('fullpath')));
addpath(fullfile(rootDir, 'algorithms'));
addpath(fullfile(rootDir, 'problems'));

p = TwentyFiveBarSpaceTruss();
base.popSize = 10;
base.maxEvaluations = 160;
base.penaltyCoef = 1e7;
base.levyScale = 0.01;
base.lsPeriod = 2;
base.lsStep = 1;

base.useLocalSearch = false;
rng(2026, 'twister');
[x0, f0, c0, d0] = BudgetedEnhancedPelicanOptimization(p, base);

ls = base;
ls.useLocalSearch = true;
rng(2026, 'twister');
[x1, f1, c1, d1] = BudgetedEnhancedPelicanOptimization(p, ls);

assert(d0.evaluationCount == base.maxEvaluations);
assert(d1.evaluationCount == base.maxEvaluations);
assert(numel(c0) == base.maxEvaluations);
assert(numel(c1) == base.maxEvaluations);
assert(isequal(d0.initialPopulation, d1.initialPopulation), ...
    'Paired algorithms must start from the identical seeded population.');
assert(all(x0 == round(x0)) && all(x1 == round(x1)), ...
    'Discrete benchmark decisions must remain catalog indices.');
assert(d0.localSearchEvaluations == 0);
assert(d1.localSearchEvaluations > 0);

rng(2026, 'twister');
[x2, f2, c2, d2] = BudgetedEnhancedPelicanOptimization(p, ls);
assert(isequal(x1, x2) && abs(f1 - f2) < 1e-10);
assert(max(abs(c1 - c2)) < 1e-10);
assert(d1.evaluationCount == d2.evaluationCount);

fprintf('Equal-FE comparison regression PASSED. Base fit %.6f | LS fit %.6f\n', f0, f1);
end
