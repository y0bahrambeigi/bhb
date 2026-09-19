function result = RunDynamicDiscreteCase(benchmarkId, variant, seed, maxEvaluations, outDir)
%RunDynamicDiscreteCase Run one reproducible equal-budget dynamic-discrete case.
%
% Example:
%   RunDynamicDiscreteCase('72-bar','qio',2026,35070,'results/case')
%
% Supported variants:
%   core, ls, qio, ls-qio
%
% Every call to problem.evaluate performs the complete static and modal
% analysis and consumes exactly one evaluator call.

if nargin < 1 || isempty(benchmarkId), benchmarkId = '72-bar'; end
if nargin < 2 || isempty(variant), variant = 'core'; end
if nargin < 3 || isempty(seed), seed = 2026; end
if nargin < 4 || isempty(maxEvaluations), maxEvaluations = 35070; end
if nargin < 5 || isempty(outDir), outDir = fullfile('results','dynamic-discrete-cases'); end

startup();
problem = DiscreteDynamicSteelTruss(benchmarkId);

variant = lower(strtrim(variant));
switch variant
    case 'core'
        algorithmName = 'BMPOA-core';
        localTrials = 0;
        qioTrials = 0;
    case 'ls'
        algorithmName = 'BMPOA-DiscreteLS';
        localTrials = 3;
        qioTrials = 0;
    case 'qio'
        algorithmName = 'BMPOA-QIO';
        localTrials = 0;
        qioTrials = 3;
    case {'ls-qio','qio-ls'}
        algorithmName = 'BMPOA-DiscreteLS-QIO';
        localTrials = 3;
        qioTrials = 3;
    otherwise
        error('RunDynamicDiscreteCase:UnknownVariant', ...
            'Supported variants are core, ls, qio, and ls-qio.');
end

validateattributes(seed, {'numeric'}, {'scalar','integer','nonnegative'});
validateattributes(maxEvaluations, {'numeric'}, {'scalar','integer','>=',70});

params.popSize = 70;
params.maxEvaluations = maxEvaluations;
params.penaltyCoef = 1e7;
params.levyScale = 0.015;
params.localSearchTrials = localTrials;
params.qioTrials = qioTrials;
params.restartFraction = 0;

rng(seed,'twister');
[bestSol,bestFit,convergence,details] = ...
    BudgetedMemeticPelicanOptimization(problem,params);

freq = details.info.naturalFrequenciesHz;
f1 = NaN; f2 = NaN; f3 = NaN;
if numel(freq) >= 1, f1 = freq(1); end
if numel(freq) >= 2, f2 = freq(2); end
if numel(freq) >= 3, f3 = freq(3); end

rows = {problem.benchmarkId, algorithmName, seed, ...
    details.objective, details.constraintViolation, details.info.staticViolation, ...
    details.info.frequencyViolation, details.isFeasible, details.evaluatorCalls, ...
    details.loadCaseSolves, details.modalSolves, details.qioAttempts, ...
    details.qioAccepted, f1, f2, f3, bestFit, mat2str(bestSol)};

columns = {'benchmark','algorithm','seed','weight','violation', ...
    'static_violation','frequency_violation','feasible','evaluator_calls', ...
    'static_load_case_solves','modal_solves','qio_attempts','qio_accepted', ...
    'f1_hz','f2_hz','f3_hz','penalized_fitness','best_indices'};

result = MakeResultSet(rows,columns);

if exist(outDir,'dir') ~= 7, mkdir(outDir); end
safeBenchmark = strrep(lower(benchmarkId),'-','');
safeVariant = strrep(variant,'-','_');
baseName = sprintf('%s_%s_seed%d_budget%d', ...
    safeBenchmark,safeVariant,seed,maxEvaluations);
csvPath = fullfile(outDir,[baseName,'.csv']);
matPath = fullfile(outDir,[baseName,'.mat']);

WriteResultCsv(csvPath,result);
payload.result = result;
payload.benchmarkId = benchmarkId;
payload.variant = variant;
payload.seed = seed;
payload.maxEvaluations = maxEvaluations;
payload.bestSol = bestSol;
payload.bestFit = bestFit;
payload.convergence = convergence;
payload.details = details;
payload.createdUtc = datestr(now,31);
SaveMatV7(matPath,payload);

assert(details.evaluatorCalls == maxEvaluations, ...
    'Evaluator budget mismatch: expected %d, got %d.', ...
    maxEvaluations,details.evaluatorCalls);
assert(details.modalSolves == maxEvaluations, ...
    'Every dynamic evaluator call must perform one modal solve.');

fprintf(['CASE COMPLETE | benchmark=%s | algorithm=%s | seed=%d | ', ...
    'W=%.9g | g=%.9g | feasible=%d | FE=%d | modal=%d | ', ...
    'f=[%.6g %.6g %.6g] Hz\n'], ...
    problem.benchmarkId,algorithmName,seed,details.objective, ...
    details.constraintViolation,details.isFeasible,details.evaluatorCalls, ...
    details.modalSolves,f1,f2,f3);
fprintf('CSV: %s\nMAT: %s\n',csvPath,matPath);
end
