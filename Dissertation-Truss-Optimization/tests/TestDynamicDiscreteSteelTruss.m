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
fprintf('72-bar upper catalog: W=%.6f, g=%.6g, f=[%.6f %.6f %.6f] Hz, feasible=%d\n', ...
    w72,g72,i72.naturalFrequenciesHz(1),i72.naturalFrequenciesHz(2), ...
    i72.naturalFrequenciesHz(3),i72.isFeasible);

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
fprintf('120-bar upper catalog: W=%.6f, g=%.6g, f=[%.6f %.6f] Hz, feasible=%d\n', ...
    w120,g120,i120.naturalFrequenciesHz(1),i120.naturalFrequenciesHz(2), ...
    i120.isFeasible);

% Reference-reproduction gate for the published 120-bar dynamic benchmark.
% CSS-BBBC areas are reported to three decimals in cm^2, so a 0.10 Hz
% tolerance is used for the first two published frequencies.
referenceAreasCm2 = [19.972,39.701,11.323,21.808,10.179,12.739,14.731];
[referenceMassKg,referenceFreqHz] = localReference120Bar(referenceAreasCm2);
assert(abs(referenceMassKg - 8892.33) < 0.10, ...
    '120-bar reference geometry does not reproduce the published CSS-BBBC mass.');
assert(abs(referenceFreqHz(1) - 9.000) < 0.10 && ...
    abs(referenceFreqHz(2) - 11.000) < 0.10, ...
    '120-bar reference frequencies are not reproduced within the documented tolerance.');
fprintf('120-bar CSS-BBBC reference: mass=%.3f kg, f=[%.6f %.6f] Hz\n', ...
    referenceMassKg,referenceFreqHz(1),referenceFreqHz(2));

% Production-path check using the closest available discrete catalog areas
% [3.00 6.25 1.75 3.50 1.50 2.00 2.25] in^2.
referenceDiscreteIndices = [10,23,5,12,4,6,7];
[~,~,i120ref] = p120.evaluate(referenceDiscreteIndices);
assert(abs(i120ref.naturalFrequenciesHz(1) - 9.0083) < 0.10 && ...
    abs(i120ref.naturalFrequenciesHz(2) - 11.0849) < 0.10, ...
    '120-bar production evaluator does not reproduce the locked discrete reference check.');
assert(max(abs(i120ref.nodes(2,:)*0.0254 - [6.94,0,5.85])) < 1e-10 && ...
    max(abs(i120ref.nodes(14,:)*0.0254 - [12.04,0,3.00])) < 1e-10, ...
    '120-bar dynamic reference geometry coordinates changed unexpectedly.');
fprintf('120-bar discrete reference check: f=[%.6f %.6f] Hz\n', ...
    i120ref.naturalFrequenciesHz(1),i120ref.naturalFrequenciesHz(2));

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
assert(d1.localSearchAttempts == 0, 'QIO-only smoke unexpectedly used local search.');
assert(all(x1 == round(x1)), 'QIO must preserve discrete catalog indices.');
assert(all(x1 == x2) && abs(fit1-fit2) < 1e-10 && ...
    d2.evaluatorCalls == params.maxEvaluations, ...
    'Seeded QIO dynamic run must be reproducible.');
fprintf('72-bar QIO smoke: W=%.6f, g=%.6g, FE=%d, modal=%d, qio=%d/%d, feasible=%d\n', ...
    d1.objective,d1.constraintViolation,d1.evaluatorCalls,d1.modalSolves, ...
    d1.qioAccepted,d1.qioAttempts,d1.isFeasible);

params.localSearchTrials = 2;
params.qioTrials = 0;
rng(2026,'twister');
[~,~,~,dls] = BudgetedMemeticPelicanOptimization(p72,params);
assert(dls.evaluatorCalls == params.maxEvaluations && ...
    dls.modalSolves == params.maxEvaluations, ...
    'DiscreteLS smoke must preserve exact evaluator/modal budget accounting.');
assert(dls.localSearchAttempts > 0, ...
    'DiscreteLS smoke test did not exercise local-search trials.');
assert(dls.qioAttempts == 0, ...
    'DiscreteLS-only smoke unexpectedly used QIO.');
fprintf('72-bar DiscreteLS smoke: FE=%d, modal=%d, ls=%d/%d, feasible=%d\n', ...
    dls.evaluatorCalls,dls.modalSolves,dls.localSearchAccepted, ...
    dls.localSearchAttempts,dls.isFeasible);

fprintf('Dynamic discrete steel-truss tests PASSED.\n');
end

function [massKg,freqHz] = localReference120Bar(groupAreasCm2)
% Reproduce the published continuous CSS-BBBC 120-bar reference using the
% documented dynamic geometry and the same consistent translational mass
% formulation used by the production evaluator.

base = OneHundredTwentyBarDomeTruss();
[~,elements,groupMap,~,fixedNodes] = base.definition();

nodes = zeros(49,3);
nodes(1,:) = [0,0,7.00];
for k = 0:11
    theta = k*pi/6;
    nodes(2+k,:) = [6.94*cos(theta),6.94*sin(theta),5.85];
end
for k = 0:23
    theta = k*pi/12;
    nodes(14+k,:) = [12.04*cos(theta),12.04*sin(theta),3.00];
end
for k = 0:11
    theta = k*pi/6;
    nodes(38+k,:) = [15.89*cos(theta),15.89*sin(theta),0.00];
end

E = 2.1e11;
rho = 7971.810;
groupAreas = groupAreasCm2(:)' * 1e-4;
areas = reshape(groupAreas(groupMap),[],1);
nDOF = 3*size(nodes,1);
K = zeros(nDOF);
M = zeros(nDOF);
I3 = eye(3);
massKg = 0;

for i = 1:size(elements,1)
    n1 = elements(i,1);
    n2 = elements(i,2);
    delta = nodes(n2,:) - nodes(n1,:);
    L = norm(delta);
    n = delta / L;
    k3 = E * areas(i) / L * (n' * n);
    dof = [3*n1-2:3*n1,3*n2-2:3*n2];
    K(dof,dof) = K(dof,dof) + [k3,-k3;-k3,k3];

    elementMass = rho * areas(i) * L;
    massKg = massKg + elementMass;
    Me = (elementMass/6) * [2*I3,I3;I3,2*I3];
    M(dof,dof) = M(dof,dof) + Me;
end

addedMassKg = zeros(49,1);
addedMassKg(1) = 3000;
addedMassKg(2:13) = 500;
addedMassKg(14:37) = 100;
for node = 1:numel(addedMassKg)
    if addedMassKg(node) <= 0, continue; end
    dof = 3*node-2:3*node;
    M(dof,dof) = M(dof,dof) + addedMassKg(node) * I3;
end

fixedDOFs = reshape([3*fixedNodes-2;3*fixedNodes-1;3*fixedNodes],1,[]);
freeDOFs = setdiff(1:nDOF,fixedDOFs);
lambda = real(eig(K(freeDOFs,freeDOFs),M(freeDOFs,freeDOFs)));
lambda = sort(lambda(isfinite(lambda) & lambda > 1e-10));
freqHz = reshape(sqrt(lambda(1:5))/(2*pi),1,[]);
end
