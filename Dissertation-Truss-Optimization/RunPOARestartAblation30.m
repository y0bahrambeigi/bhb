function summary = RunPOARestartAblation30(benchmarkId)
%RunPOARestartAblation30 Dissertation-grade 30-seed ablation.
% Compares four explicitly versioned BMPOA variants under an identical
% objective/constraint evaluator-call budget.
%
% Usage:
%   RunPOARestartAblation30('10-bar')
%   RunPOARestartAblation30('25-bar')
%   RunPOARestartAblation30('72-bar')
%   RunPOARestartAblation30('120-bar')
%   RunPOARestartAblation30('all')   % default

if nargin < 1
    benchmarkId = 'all';
end

rootDir = fileparts(mfilename('fullpath'));
addpath(fullfile(rootDir, 'algorithms'));
addpath(fullfile(rootDir, 'benchmarks'));
addpath(fullfile(rootDir, 'problems'));
addpath(fullfile(rootDir, 'utils'));

benchmarkIds = {'10-bar', '25-bar', '72-bar', '120-bar'};
problemClasses = {'TenBarTrussTopology', 'TwentyFiveBarSpaceTruss', ...
    'SeventyTwoBarSpaceTruss', 'OneHundredTwentyBarDomeTruss'};

if strcmpi(benchmarkId, 'all')
    selected = 1:numel(benchmarkIds);
else
    selected = find(strcmpi(benchmarkIds, benchmarkId));
    if isempty(selected)
        error('RunPOARestartAblation30:UnknownBenchmark', ...
            'benchmarkId must be ''10-bar'', ''25-bar'', ''72-bar'', ''120-bar'', or ''all''.');
    end
end

seeds = 2026:2055;

algorithms = {'BMPOA-core-v1', 'BMPOA-problem-aware-ls-v1', ...
    'BMPOA-restart-v1', 'BMPOA-problem-aware-ls-restart-v1'};
localSearchTrials = [0, 3, 0, 3];
restartFractions = [0.0, 0.0, 0.30, 0.30];

baseParams.popSize = 70;
baseParams.maxEvaluations = 35070;
baseParams.penaltyCoef = 1e7;
baseParams.levyScale = 0.015;
baseParams.stagnationEvaluations = 2100;

records = {};
row = 0;

for b = selected
    problem = feval(problemClasses{b});

    for a = 1:numel(algorithms)
        params = baseParams;
        params.localSearchTrials = localSearchTrials(a);
        params.restartFraction = restartFractions(a);

        for s = 1:numel(seeds)
            seed = seeds(s);
            rng(seed, 'twister');

            tic;
            [bestSol, bestFit, convergence, details] = ...
                BudgetedMemeticPelicanOptimization(problem, params);
            elapsedTime = toc;

            objective = details.objective;
            violation = details.constraintViolation;
            info = details.info;

            if isfield(info, 'maxStressRatio')
                maxStressRatio = info.maxStressRatio;
            else
                maxStressRatio = max(info.stressRatio(:));
            end

            if isfield(info, 'maxDisplacementRatio')
                maxDisplacementRatio = info.maxDisplacementRatio;
            else
                maxDisplacementRatio = info.maxDisp / problem.deltaMax;
            end

            if isfield(info, 'nActive')
                nActive = info.nActive;
            else
                nActive = problem.nBar;
            end

            finalBest = convergence(end);
            bestIteration = find(convergence <= finalBest + 1e-12, 1, 'first');

            row = row + 1;
            records(row, :) = { ...
                benchmarkIds{b}, algorithms{a}, row, seed, problem.nBar, ...
                problem.nVar, params.popSize, details.iterationsCompleted, ...
                details.evaluatorCalls, details.loadCaseSolves, elapsedTime, objective, bestFit, ...
                violation, info.isStable, info.isFeasible, maxStressRatio, ...
                maxDisplacementRatio, bestIteration, details.restartCount, nActive}; %#ok<SAGROW>

            fprintf(['RESULT,%s,%s,%d,%.12f,%.12e,%d,%d,%d,%d,%.12f,%.12f\n'], ...
                benchmarkIds{b}, algorithms{a}, seed, objective, violation, ...
                info.isFeasible, details.evaluatorCalls, details.loadCaseSolves, ...
                details.restartCount, ...
                maxStressRatio, maxDisplacementRatio);
        end
    end
end

summary = cell2table(records, 'VariableNames', { ...
    'benchmark_id', 'algorithm', 'run_id', 'seed', 'n_members', ...
    'n_variables', 'population', 'iterations', 'n_evaluator_calls', ...
    'n_load_case_solves', 'elapsed_s', 'objective_weight', 'penalized_fitness', ...
    'total_violation', 'stable', 'feasible', 'max_stress_ratio', ...
    'max_displacement_ratio', 'best_iteration', 'restart_count', 'n_active'});

outputDir = fullfile(rootDir, 'results', 'poa_restart_ablation_30seed');
if ~exist(outputDir, 'dir'), mkdir(outputDir); end

if strcmpi(benchmarkId, 'all')
    suffix = 'all';
else
    suffix = lower(strrep(benchmarkId, '-', ''));
end

csvFile = fullfile(outputDir, ['poa_restart_ablation_30seed_' suffix '.csv']);
matFile = fullfile(outputDir, ['poa_restart_ablation_30seed_' suffix '.mat']);
writetable(summary, csvFile);
artifact.summary = summary;
artifact.baseParams = baseParams;
artifact.seeds = seeds;
artifact.algorithms = algorithms;
artifact.localSearchTrials = localSearchTrials;
artifact.restartFractions = restartFractions;
SaveMatV7(matFile, artifact);

fprintf('\nSaved 30-seed ablation results to:\n%s\n', csvFile);
end
