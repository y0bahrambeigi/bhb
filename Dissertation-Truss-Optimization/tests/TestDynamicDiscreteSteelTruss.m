function TestDynamicDiscreteSteelTruss()
%TestDynamicDiscreteSteelTruss Regression checks for the combined
% stress/displacement/frequency discrete steel-truss extension.

fprintf('Running dynamic discrete steel-truss tests...\n');

p72 = DiscreteDynamicSteelTruss('72-bar');
b72 = p72.getBounds();
[w72,g72,i72] = p72.evaluate(b72.ub);
assert(all(p72.projectDecision(1.5*ones(1,p72.nVar)) == 2), ...
    '72-bar half-integer projection must round upward.');
assert(isfinite(w72) && w72 > 0 && isfinite(g72) && g72 >= 0, ...
    '72-bar dynamic evaluator returned non-finite outputs.');
assert(numel(i72.naturalFrequenciesHz) >= 3 && ...
    all(isfinite(i72.naturalFrequenciesHz(1:3))) && ...
    all(i72.naturalFrequenciesHz(1:3) > 0), ...
    '72-bar modal analysis must return three positive frequencies.');
assert(i72.modalAnalysisPerformed && strcmp(i72.material,'steel'), ...
    '72-bar dynamic metadata changed unexpectedly.');

p120 = DiscreteDynamicSteelTruss('120-bar');
b120 = p120.getBounds();
[w120,g120,i120] = p120.evaluate(b120.ub);
assert(isfinite(w120) && w120 > 0 && isfinite(g120) && g120 >= 0, ...
    '120-bar dynamic evaluator returned non-finite outputs.');
assert(numel(i120.naturalFrequenciesHz) >= 2 && ...
    all(isfinite(i120.naturalFrequenciesHz(1:2))) && ...
    all(i120.naturalFrequenciesHz(1:2) > 0), ...
    '120-bar modal analysis must return two positive frequencies.');
assert(i120.modalAnalysisPerformed && strcmp(i120.material,'steel'), ...
    '120-bar dynamic metadata changed unexpectedly.');

params.popSize = 6;
params.maxEvaluations = 30;
params.penaltyCoef = 1e7;
params.levyScale = 0.01;
params.localSearchTrials = 0;
params.qioTrials = 2;
params.restartFraction = 0;

rng(2026,'twister');
[x1,fit1,~,d1] = BudgetedMemeticPelicanOptimization(p72,params);
rng(2026,'twister');
[x2,fit2,~,d2] = BudgetedMemeticPelicanOptimization(p72,params);

assert(d1.evaluatorCalls == params.maxEvaluations && ...
    d1.modalSolves == params.maxEvaluations, ...
    'QIO dynamic run must preserve exact evaluator/modal budget accounting.');
assert(d1.qioAttempts > 0, 'QIO smoke test did not exercise interpolation trials.');
assert(all(x1 == round(x1)), 'QIO must preserve discrete catalog indices.');
assert(all(x1 == x2) && abs(fit1-fit2) < 1e-10 && ...
    d2.evaluatorCalls == params.maxEvaluations, ...
    'Seeded QIO dynamic run must be reproducible.');

fprintf('Dynamic discrete steel-truss tests PASSED.\n');
end
