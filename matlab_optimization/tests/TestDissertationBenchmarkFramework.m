function TestDissertationBenchmarkFramework()
%TestDissertationBenchmarkFramework Validate registry, 25-bar FE, optimizer,
%and reproducible surrogate-data generation.

rootDir = fileparts(fileparts(mfilename('fullpath')));
addpath(fullfile(rootDir, 'algorithms'));
addpath(fullfile(rootDir, 'benchmarks'));
addpath(fullfile(rootDir, 'problems'));
addpath(fullfile(rootDir, 'surrogate'));

fprintf('Running dissertation benchmark framework tests...\n');

registry = BenchmarkRegistry();
assert(numel(registry) == 4, 'Registry must contain 10-, 25-, 72-, and 100-bar entries.');
assert(strcmp(registry(1).id, '10-bar') && strcmp(registry(2).id, '25-bar'), ...
    'Validated benchmark ordering changed unexpectedly.');
assert(strcmp(registry(3).status, 'specification-pending'), ...
    '72-bar benchmark must remain blocked until its source definition is locked.');
assert(strcmp(registry(4).status, 'specification-pending'), ...
    '100-bar benchmark must remain blocked until its source definition is locked.');

p = TwentyFiveBarSpaceTruss();
bounds = p.getBounds();
assert(numel(bounds.lb) == 8 && numel(bounds.ub) == 8, ...
    '25-bar benchmark must expose eight grouped design variables.');

[weightMax, violationMax, infoMax] = p.evaluate(bounds.ub);
assert(infoMax.isStable, 'Upper-bound 25-bar design must be structurally stable.');
assert(infoMax.isFeasible, 'Upper-bound 25-bar design must satisfy benchmark constraints.');
assert(violationMax < 1e-8, 'Upper-bound 25-bar design should have zero violation.');
assert(abs(weightMax - 1124.45041397685) < 1e-6, ...
    '25-bar upper-bound weight changed; check geometry, grouping, density, or catalog.');
assert(infoMax.nLoadCases == 2, '25-bar evaluator must preserve both load cases.');
assert(size(infoMax.stress, 1) == 25 && size(infoMax.stress, 2) == 2, ...
    'Member stress output must be 25-by-2.');

[~, violationMin, infoMin] = p.evaluate(bounds.lb);
assert(infoMin.isStable, 'Positive lower-bound sections should keep the 25-bar stiffness stable.');
assert(violationMin > 0 && ~infoMin.isFeasible, ...
    'Lower-bound 25-bar design should expose stress/displacement violations.');

xProjected = p.projectDecision(1.49 * ones(1, p.nVar));
assert(all(xProjected == 1), 'Discrete decisions must round to catalog indices.');
xProjected = p.projectDecision(1.50 * ones(1, p.nVar));
assert(all(xProjected == 2), 'Half-integer decisions must round upward consistently.');

params.popSize = 10;
params.maxIter = 8;
params.penaltyCoef = 1e7;
params.levyScale = 0.01;
rng(2026, 'twister');
[best1, fit1, conv1] = EnhancedPelicanOptimization(p, params);
rng(2026, 'twister');
[best2, fit2, conv2] = EnhancedPelicanOptimization(p, params);
assert(all(best1 == round(best1)), '25-bar optimizer result must remain discrete.');
assert(all(best1 == best2) && abs(fit1 - fit2) < 1e-10, ...
    'Seeded 25-bar optimizer results must be reproducible.');
assert(max(abs(conv1 - conv2)) < 1e-10, ...
    'Seeded 25-bar convergence history must be reproducible.');

budgetParams.popSize = 10;
budgetParams.maxEvaluations = 120;
budgetParams.penaltyCoef = 1e7;
budgetParams.levyScale = 0.01;
budgetParams.localSearchTrials = 0;
rng(2026, 'twister');
[budgetBest1, budgetFit1, ~, budgetDetails1] = ...
    BudgetedMemeticPelicanOptimization(p, budgetParams);
rng(2026, 'twister');
[budgetBest2, budgetFit2, ~, budgetDetails2] = ...
    BudgetedMemeticPelicanOptimization(p, budgetParams);
assert(budgetDetails1.evaluationCount == budgetParams.maxEvaluations, ...
    'Budgeted POA must consume exactly the declared FE budget.');
assert(all(budgetBest1 == budgetBest2) && abs(budgetFit1 - budgetFit2) < 1e-10, ...
    'Budgeted POA must be reproducible for a fixed seed.');
assert(budgetDetails2.evaluationCount == budgetParams.maxEvaluations, ...
    'Repeated budgeted POA run changed the FE budget.');

budgetParams.localSearchTrials = 3;
rng(2026, 'twister');
[budgetBestLS, ~, ~, budgetDetailsLS] = ...
    BudgetedMemeticPelicanOptimization(p, budgetParams);
assert(budgetDetailsLS.evaluationCount == budgetParams.maxEvaluations, ...
    'POA+LS must use exactly the same FE budget as POA.');
assert(all(budgetBestLS == round(budgetBestLS)), ...
    'Discrete local search must preserve catalog-index decisions.');

budgetParams.localSearchTrials = 0;
budgetParams.restartFraction = 0.5;
budgetParams.stagnationEvaluations = 0;
rng(2026, 'twister');
[budgetBestR, ~, ~, budgetDetailsR] = ...
    BudgetedMemeticPelicanOptimization(p, budgetParams);
assert(budgetDetailsR.evaluationCount == budgetParams.maxEvaluations, ...
    'POA+R must use exactly the declared FE budget.');
assert(budgetDetailsR.restartCount > 0, ...
    'Forced-stagnation smoke test must exercise the restart path.');
assert(all(budgetBestR == round(budgetBestR)), ...
    'Restart must preserve discrete catalog-index decisions.');

budgetParams.localSearchTrials = 3;
rng(2026, 'twister');
[budgetBestLSR, ~, ~, budgetDetailsLSR] = ...
    BudgetedMemeticPelicanOptimization(p, budgetParams);
assert(budgetDetailsLSR.evaluationCount == budgetParams.maxEvaluations, ...
    'POA+LS+R must use exactly the same FE budget.');
assert(budgetDetailsLSR.restartCount > 0, ...
    'POA+LS+R smoke test must exercise the restart path.');
assert(all(budgetBestLSR == round(budgetBestLSR)), ...
    'Combined local search and restart must preserve discreteness.');

tmpFile1 = fullfile(tempdir(), 'surrogate-25bar-a.csv');
tmpFile2 = fullfile(tempdir(), 'surrogate-25bar-b.csv');
data1 = GenerateSurrogateDataset(p, '25-bar', 12, 2026, tmpFile1);
data2 = GenerateSurrogateDataset(p, '25-bar', 12, 2026, tmpFile2);
assert(isequal(data1.design, data2.design), 'Seeded surrogate designs must reproduce exactly.');
assert(max(abs(data1.weight - data2.weight)) < 1e-10, ...
    'Seeded surrogate targets must reproduce exactly.');
assert(exist(tmpFile1, 'file') == 2 && exist(tmpFile2, 'file') == 2, ...
    'Surrogate CSV files were not created.');
delete(tmpFile1);
delete(tmpFile2);

fprintf('All dissertation benchmark framework tests PASSED.\n');
end
