function result = RunDynamicDiscretePilot(maxEvaluations,seeds,benchmarkIds)
%RunDynamicDiscretePilot Equal-evaluator-budget BMPOA ablation for the
% combined stress + displacement + natural-frequency discrete steel problem.
%
% Default dissertation pilot:
%   maxEvaluations = 35070
%   seeds          = 2026:2030
%
% Variants:
%   BMPOA-core
%   BMPOA-DiscreteLS
%   BMPOA-QIO
%   BMPOA-DiscreteLS-QIO
%
% Use a smaller budget explicitly for smoke testing.

if nargin < 1 || isempty(maxEvaluations), maxEvaluations = 35070; end
if nargin < 2 || isempty(seeds), seeds = 2026:2030; end
if nargin < 3 || isempty(benchmarkIds), benchmarkIds = {'72-bar','120-bar'}; end
if ischar(benchmarkIds), benchmarkIds = {benchmarkIds}; end

startup();
variantNames = {'BMPOA-core','BMPOA-DiscreteLS','BMPOA-QIO','BMPOA-DiscreteLS-QIO'};
localTrials = [0 3 0 3];
qioTrials = [0 0 3 3];

rows = {};
row = 0;
for b = 1:numel(benchmarkIds)
    problem = DiscreteDynamicSteelTruss(benchmarkIds{b});
    for v = 1:numel(variantNames)
        for s = 1:numel(seeds)
            params.popSize = 70;
            params.maxEvaluations = maxEvaluations;
            params.penaltyCoef = 1e7;
            params.levyScale = 0.015;
            params.localSearchTrials = localTrials(v);
            params.qioTrials = qioTrials(v);
            params.restartFraction = 0;

            rng(seeds(s),'twister');
            [bestSol,bestFit,~,details] = ...
                BudgetedMemeticPelicanOptimization(problem,params);

            row = row + 1;
            rows(row,:) = {problem.benchmarkId,variantNames{v},seeds(s), ...
                details.objective,details.constraintViolation,details.isFeasible, ...
                details.evaluatorCalls,details.loadCaseSolves,details.modalSolves, ...
                details.localSearchAttempts,details.localSearchAccepted, ...
                details.qioAttempts,details.qioAccepted,bestFit,mat2str(bestSol)}; %#ok<AGROW>
            fprintf('%s | %s | seed=%d | W=%.6g | g=%.3g | feasible=%d | FE=%d\n', ...
                problem.benchmarkId,variantNames{v},seeds(s),details.objective, ...
                details.constraintViolation,details.isFeasible,details.evaluatorCalls);
        end
    end
end

columns = {'benchmark','algorithm','seed','weight','violation','feasible', ...
    'evaluator_calls','static_load_case_solves','modal_solves', ...
    'local_search_attempts','local_search_accepted', ...
    'qio_attempts','qio_accepted','penalized_fitness','best_indices'};
result = MakeResultSet(rows,columns);

outDir = fullfile(fileparts(mfilename('fullpath')),'results','dynamic-discrete');
if exist(outDir,'dir') ~= 7, mkdir(outDir); end
csvPath = fullfile(outDir,sprintf('dynamic_discrete_equal_budget_%d.csv',maxEvaluations));
matPath = fullfile(outDir,sprintf('dynamic_discrete_equal_budget_%d.mat',maxEvaluations));
WriteResultCsv(csvPath,result);
payload.result = result;
payload.maxEvaluations = maxEvaluations;
payload.seeds = seeds;
payload.benchmarkIds = benchmarkIds;
payload.variantNames = variantNames;
payload.createdUtc = datestr(now,31);
SaveMatV7(matPath,payload);

fprintf('Saved %d runs to:\n%s\n%s\n',size(rows,1),csvPath,matPath);
end
