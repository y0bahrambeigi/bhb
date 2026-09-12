function TestDissertationBenchmarkFramework()
%TestDissertationBenchmarkFramework Validate the four benchmark definitions,
%budget accounting, optimizer behavior, and reproducible artifact generation.

rootDir = fileparts(fileparts(mfilename('fullpath')));
addpath(fullfile(rootDir, 'algorithms'));
addpath(fullfile(rootDir, 'benchmarks'));
addpath(fullfile(rootDir, 'problems'));
addpath(fullfile(rootDir, 'surrogate'));
addpath(fullfile(rootDir, 'utils'));

fprintf('Running dissertation benchmark framework tests...\n');

registry = BenchmarkRegistry();
assert(numel(registry) == 4, 'Registry must contain 10-, 25-, 72-, and 120-bar entries.');
assert(strcmp(registry(1).id, '10-bar') && strcmp(registry(2).id, '25-bar'), ...
    'Validated benchmark ordering changed unexpectedly.');
assert(strcmp(registry(3).id, '72-bar') && registry(3).designVariables == 16 && ...
    strcmp(registry(3).problemClass, 'SeventyTwoBarSpaceTruss'), ...
    '72-bar registry definition is not source-locked correctly.');
assert(strcmp(registry(4).id, '120-bar') && registry(4).designVariables == 7 && ...
    strcmp(registry(4).problemClass, 'OneHundredTwentyBarDomeTruss'), ...
    'The former 100-bar placeholder must be replaced by the 120-bar dome.');
assert(~any(strcmp({registry.status}, 'specification-pending')), ...
    'No benchmark may remain specification-pending after source lock.');

p72 = SeventyTwoBarSpaceTruss();
bounds72 = p72.getBounds();
[weight72, violation72, info72] = p72.evaluate(bounds72.ub);
assert(p72.nVar == 16 && size(info72.nodes,1) == 20 && ...
    size(info72.elements,1) == 72 && numel(unique(info72.groupMap)) == 16, ...
    '72-bar geometry or 16-group mapping changed.');
assert(info72.nLoadCases == 2 && isequal(info72.fixedNodes, 1:4) && ...
    isequal(info72.controlNodes, 17:20), ...
    '72-bar supports, load cases, or displacement-control nodes changed.');
assert(info72.isStable && info72.isFeasible && violation72 < 1e-8, ...
    'Upper-bound 72-bar reference design must be stable and feasible.');
assert(abs(weight72 - 2559.26866100333) < 1e-6, ...
    '72-bar upper-bound weight changed; check source geometry or density.');
assert(all(abs(p72.projectDecision(1.234*ones(1,p72.nVar)) - 1.234) < 1e-12), ...
    '72-bar projection must preserve continuous, non-catalog areas.');

p120 = OneHundredTwentyBarDomeTruss();
bounds120 = p120.getBounds();
[weight120, violation120, info120] = p120.evaluate(bounds120.ub);
assert(p120.nVar == 7 && size(info120.nodes,1) == 49 && ...
    size(info120.elements,1) == 120 && numel(unique(info120.groupMap)) == 7, ...
    '120-bar dome geometry or seven-group mapping changed.');
assert(info120.nLoadCases == 1 && isequal(info120.fixedNodes, 38:49), ...
    '120-bar support or load-case definition changed.');
assert(info120.isStable && info120.isFeasible && violation120 < 1e-8, ...
    'Upper-bound 120-bar reference design must be stable and feasible.');
assert(abs(weight120 - 142107.687634396) < 1e-6, ...
    '120-bar upper-bound weight changed; check source geometry or density.');
assert(all(abs(p120.projectDecision(1.234*ones(1,p120.nVar)) - 1.234) < 1e-12), ...
    '120-bar projection must preserve continuous, non-catalog areas.');

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
assert(budgetDetails1.evaluatorCalls == budgetParams.maxEvaluations, ...
    'Evaluator-call accounting must equal the declared search budget.');
assert(budgetDetails1.loadCaseSolves == 2 * budgetParams.maxEvaluations, ...
    'Each 25-bar evaluator call must account for two load-case solves.');
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
assert(budgetDetailsLS.loadCaseSolves == 2 * budgetParams.maxEvaluations, ...
    'POA+LS must report load-case solves separately from evaluator calls.');

continuousParams = budgetParams;
continuousParams.popSize = 4;
continuousParams.maxEvaluations = 12;
continuousParams.localSearchTrials = 2;
rng(2026, 'twister');
[~, ~, ~, details72] = BudgetedMemeticPelicanOptimization(p72, continuousParams);
assert(details72.evaluatorCalls == 12 && details72.loadCaseSolves == 24, ...
    '72-bar continuous local search must preserve two-case budget accounting.');
rng(2026, 'twister');
[~, ~, ~, details120] = BudgetedMemeticPelicanOptimization(p120, continuousParams);
assert(details120.evaluatorCalls == 12 && details120.loadCaseSolves == 12, ...
    '120-bar continuous local search must preserve one-case budget accounting.');

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

matProbe.answer = 42;
matProbe.label = 'portable-v7';
matFile = [tempname(), '.mat'];
SaveMatV7(matFile, matProbe);
matRoundTrip = load(matFile);
assert(matRoundTrip.answer == 42 && strcmp(matRoundTrip.label, 'portable-v7'), ...
    'MAT v7 artifact must load with identical content.');
fid = fopen(matFile, 'rb');
header = char(fread(fid, 8, '*char')');
fclose(fid);
assert(strcmp(header, 'MATLAB 5'), ...
    'MAT artifact must use the MATLAB level-5/v7 binary container.');
delete(matFile);

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
