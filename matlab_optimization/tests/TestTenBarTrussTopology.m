function TestTenBarTrussTopology()
% TestTenBarTrussTopology Regression checks for PR #5 topology workflow.
% Run from matlab_optimization with:
%   addpath('tests'); TestTenBarTrussTopology

rootDir = fileparts(fileparts(mfilename('fullpath')));
addpath(fullfile(rootDir, 'algorithms'));
addpath(fullfile(rootDir, 'problems'));

p = TenBarTrussTopology();
tol = 1e-10;

fprintf('Running TenBarTrussTopology regression tests...\n');

%% 0) Reject malformed or out-of-range decision vectors
rejected = false;
try
    p.evaluate(ones(1, p.nVar - 1));
catch
    rejected = true;
end
assert(rejected, 'Evaluator must reject a decision vector with the wrong length.');

rejected = false;
try
    p.evaluate([35 * ones(1, p.nBar), 2 * ones(1, p.nBar)]);
catch
    rejected = true;
end
assert(rejected, 'Evaluator must reject decision variables outside declared bounds.');

%% 1) Stable all-member baseline
xFull = [35 * ones(1, p.nBar), ones(1, p.nBar)];
[fFull, gFull, infoFull] = p.evaluate(xFull);
assert(infoFull.isStable, 'All-member upper-bound design must be stable.');
assert(infoFull.isFeasible, 'All-member upper-bound design must be feasible.');
assert(infoFull.nActive == 10, 'Expected all 10 members to be active.');
assert(gFull < 1e-8, 'Expected zero constraint violation for baseline design.');
assert(isfinite(fFull) && fFull > 0, 'Baseline objective must be finite and positive.');
assert(all(isfinite(infoFull.displacement)), 'Baseline displacements must be finite.');
assert(all(isfinite(infoFull.stress)), 'Baseline stresses must be finite.');
assert(infoFull.maxStress <= p.sigmaMax + 1e-8, 'Baseline stress limit violated.');
assert(infoFull.maxDisp <= p.deltaMax + 1e-8, 'Baseline displacement limit violated.');

%% 2) Singular topology handling
xZero = [35 * ones(1, p.nBar), zeros(1, p.nBar)];
[fZero, gZero, infoZero] = p.evaluate(xZero);
assert(isfinite(fZero), 'Singular topology objective must remain finite.');
assert(~infoZero.isStable, 'Zero-member topology must be detected as unstable.');
assert(~infoZero.isFeasible, 'Unstable topology cannot be feasible.');
assert(gZero >= 50, 'Singular topology must receive the singularity penalty.');
assert(all(isfinite(infoZero.displacement)), 'Singular-case displacement report must remain finite.');
assert(all(isfinite(infoZero.stress)), 'Singular-case stress report must remain finite.');

%% 3) Inactive member must not carry area or stress penalty
xInactive = xFull;
xInactive(p.nBar + 1) = 0;
[~, ~, infoInactive] = p.evaluate(xInactive);
assert(~infoInactive.activeBars(1), 'Member 1 should be inactive.');
assert(infoInactive.area(1) == 0, 'Inactive member area must be exactly zero.');
assert(infoInactive.stress(1) == 0, 'Inactive member stress must be exactly zero.');
assert(infoInactive.stressRatio(1) == 0, 'Inactive member stress ratio must be exactly zero.');

%% 4) Topology threshold is exactly z >= 0.5
xThreshold = xFull;
xThreshold(p.nBar + 1) = 0.499999;
[~, ~, infoLow] = p.evaluate(xThreshold);
assert(~infoLow.activeBars(1), 'z < 0.5 must map to inactive.');

xThreshold(p.nBar + 1) = 0.5;
[~, ~, infoHalf] = p.evaluate(xThreshold);
assert(infoHalf.activeBars(1), 'z = 0.5 must map to active.');

xThreshold(p.nBar + 1) = 0.500001;
[~, ~, infoHigh] = p.evaluate(xThreshold);
assert(infoHigh.activeBars(1), 'z > 0.5 must map to active.');

%% 5) Minimum-active-member penalty
xSix = xFull;
xSix(p.nBar + (7:10)) = 0;
[~, gSix, infoSix] = p.evaluate(xSix);
assert(infoSix.nActive == 6, 'Expected six active members.');

xFive = xFull;
xFive(p.nBar + (6:10)) = 0;
[~, gFive, infoFive] = p.evaluate(xFive);
assert(infoFive.nActive == 5, 'Expected five active members.');
% gFive may also contain singularity or response penalties; it must at least
% include the active-member contribution of 1/6.
assert(gFive + tol >= 1/6, 'Five-member design must include active-member penalty >= 1/6.');
assert(gSix >= 0, 'Six-member violation must remain non-negative.');

%% 6) Stress/displacement constraints and feasibility consistency
xSmall = [p.areaLb * ones(1, p.nBar), ones(1, p.nBar)];
[~, gSmall, infoSmall] = p.evaluate(xSmall);
assert(gSmall >= 0, 'Constraint violation must be non-negative.');
assert(infoSmall.isFeasible == (infoSmall.isStable && gSmall < 1e-8), ...
    'Feasibility flag is inconsistent with stability/constraint violation.');
if infoSmall.isStable
    stressViolation = sum(max(0, abs(infoSmall.stress(infoSmall.activeBars)) / p.sigmaMax - 1));
    dispViolation = max(0, infoSmall.maxDisp / p.deltaMax - 1);
    assert(gSmall + 1e-9 >= stressViolation + dispViolation, ...
        'Reported violation must include stress and displacement contributions.');
end

%% 7) Optimizer bounds, monotonic convergence, and reproducibility
params.popSize = 12;
params.maxIter = 20;
params.penaltyCoef = 1e7;
params.levyScale = 0.015;

rng(2026, 'twister');
[x1, fit1, conv1, d1] = EnhancedPelicanOptimization(p, params);
rng(2026, 'twister');
[x2, fit2, conv2, d2] = EnhancedPelicanOptimization(p, params);

bounds = p.getBounds();
assert(all(x1 >= bounds.lb - tol) && all(x1 <= bounds.ub + tol), ...
    'Optimizer returned a decision outside problem bounds.');
assert(all(isfinite(conv1)), 'Convergence history must be finite.');
assert(all(diff(conv1) <= tol), 'Best-so-far convergence must be non-increasing.');
assert(max(abs(x1 - x2)) <= 1e-12, 'Seeded runs must reproduce best solution.');
assert(abs(fit1 - fit2) <= 1e-10, 'Seeded runs must reproduce best fitness.');
assert(max(abs(conv1 - conv2)) <= 1e-10, 'Seeded runs must reproduce convergence history.');

[obj1, viol1, info1] = p.evaluate(x1);
assert(abs(d1.objective - obj1) <= 1e-10, 'Optimizer details.objective mismatch.');
assert(abs(d1.constraintViolation - viol1) <= 1e-10, 'Optimizer violation detail mismatch.');
assert(abs(fit1 - (obj1 + params.penaltyCoef * viol1)) <= max(1e-6, 1e-10 * abs(fit1)), ...
    'Penalized fitness is inconsistent with objective + penalty * violation.');
assert(info1.isFeasible == (info1.isStable && viol1 < 1e-8), ...
    'Final optimizer feasibility flag is inconsistent.');
assert(abs(d2.objective - d1.objective) <= 1e-10, 'Seeded details are not reproducible.');
assert(d1.evaluationCount == params.popSize * (params.maxIter + 1), ...
    'Objective evaluation count is inconsistent.');
assert(d1.isFeasible == info1.isFeasible, 'Optimizer feasibility detail mismatch.');
assert(d1.parameters.popSize == params.popSize, 'Optimizer parameter audit trail mismatch.');

rejected = false;
try
    badParams = params;
    badParams.popSize = 1;
    EnhancedPelicanOptimization(p, badParams);
catch
    rejected = true;
end
assert(rejected, 'Optimizer must reject a population smaller than two.');

fprintf('All TenBarTrussTopology regression tests PASSED.\n');
end
