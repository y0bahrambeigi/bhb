function result = RunDynamicDiscreteShard(benchmarkId,variant,maxEvaluations,seeds)
%RunDynamicDiscreteShard Run one benchmark/algorithm shard for the
% dissertation dynamic-discrete equal-budget study.

if nargin < 1 || isempty(benchmarkId), benchmarkId = '72-bar'; end
if nargin < 2 || isempty(variant), variant = 'core'; end
if nargin < 3 || isempty(maxEvaluations), maxEvaluations = 35070; end
if nargin < 4 || isempty(seeds), seeds = 2026:2030; end

startup();
problem = DiscreteDynamicSteelTruss(benchmarkId);
variant = lower(strtrim(variant));

switch variant
    case 'core'
        algorithmName = 'BMPOA-core'; localTrials = 0; qioTrials = 0;
    case 'discrete-ls'
        algorithmName = 'BMPOA-DiscreteLS'; localTrials = 3; qioTrials = 0;
    case 'qio'
        algorithmName = 'BMPOA-QIO'; localTrials = 0; qioTrials = 3;
    case 'discrete-ls-qio'
        algorithmName = 'BMPOA-DiscreteLS-QIO'; localTrials = 3; qioTrials = 3;
    otherwise
        error('RunDynamicDiscreteShard:UnknownVariant','Unknown variant: %s',variant);
end

rows = {};
for s = 1:numel(seeds)
    params.popSize = 70;
    params.maxEvaluations = maxEvaluations;
    params.penaltyCoef = 1e7;
    params.levyScale = 0.015;
    params.localSearchTrials = localTrials;
    params.qioTrials = qioTrials;
    params.restartFraction = 0;

    rng(seeds(s),'twister');
    [bestSol,bestFit,~,details] = BudgetedMemeticPelicanOptimization(problem,params);

    rows(s,:) = {problem.benchmarkId,algorithmName,seeds(s), ...
        details.objective,details.constraintViolation,details.isFeasible, ...
        details.evaluatorCalls,details.loadCaseSolves,details.modalSolves, ...
        details.qioAttempts,details.qioAccepted,bestFit,mat2str(bestSol)}; %#ok<AGROW>

    fprintf('%s | %s | seed=%d | W=%.8g | g=%.6g | feasible=%d | FE=%d | modal=%d\n', ...
        problem.benchmarkId,algorithmName,seeds(s),details.objective, ...
        details.constraintViolation,details.isFeasible,details.evaluatorCalls, ...
        details.modalSolves);
end

columns = {'benchmark','algorithm','seed','weight','violation','feasible', ...
    'evaluator_calls','static_load_case_solves','modal_solves', ...
    'qio_attempts','qio_accepted','penalized_fitness','best_indices'};
result = MakeResultSet(rows,columns);

outDir = fullfile(fileparts(mfilename('fullpath')),'results','dynamic-discrete-shards');
if exist(outDir,'dir') ~= 7, mkdir(outDir); end
safeBenchmark = strrep(benchmarkId,'-','_');
safeVariant = strrep(variant,'-','_');
stem = sprintf('%s__%s__FE%d__seeds%d_%d',safeBenchmark,safeVariant, ...
    maxEvaluations,seeds(1),seeds(end));
csvPath = fullfile(outDir,[stem '.csv']);
matPath = fullfile(outDir,[stem '.mat']);
WriteResultCsv(csvPath,result);
payload.result = result;
payload.benchmarkId = benchmarkId;
payload.variant = variant;
payload.maxEvaluations = maxEvaluations;
payload.seeds = seeds;
payload.createdUtc = datestr(now,31);
SaveMatV7(matPath,payload);

fprintf('Saved shard artifacts:\n%s\n%s\n',csvPath,matPath);
end
