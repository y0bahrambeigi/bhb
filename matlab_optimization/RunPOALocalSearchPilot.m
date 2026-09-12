%% Five-seed BMPOA core vs BMPOA problem-aware-LS pilot under equal evaluator budget
% Runs the locked 10-bar and 25-bar dissertation benchmarks.
% Both variants use the same implementation; only localSearchTrials changes.

clear; clc;

rootDir = fileparts(mfilename('fullpath'));
addpath(fullfile(rootDir, 'algorithms'));
addpath(fullfile(rootDir, 'benchmarks'));
addpath(fullfile(rootDir, 'problems'));
addpath(fullfile(rootDir, 'utils'));

registry = BenchmarkRegistry();
seeds = registry(1).requiredSeeds;

problemClasses = {'TenBarTrussTopology', 'TwentyFiveBarSpaceTruss'};
benchmarkIds = {'10-bar', '25-bar'};
algorithms = {'BMPOA-core-v1', 'BMPOA-problem-aware-ls-v1'};
localSearchTrials = [0, 3];

params.popSize = 70;
params.maxEvaluations = 35070;
params.penaltyCoef = 1e7;
params.levyScale = 0.015;

records = {};
row = 0;

for b = 1:numel(problemClasses)
    problem = feval(problemClasses{b});

    for a = 1:numel(algorithms)
        params.localSearchTrials = localSearchTrials(a);

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

            row = row + 1;
            records(row, :) = { ...
                benchmarkIds{b}, algorithms{a}, seed, ...
                objective, bestFit, violation, info.isFeasible, ...
                details.evaluatorCalls, details.loadCaseSolves, ...
                details.iterationsCompleted, ...
                elapsedTime, maxStressRatio, maxDisplacementRatio, nActive}; %#ok<SAGROW>

            fprintf('%s | %s | seed %d | W = %.6f | feasible = %d | evaluator = %d | load-case solves = %d\n', ...
                benchmarkIds{b}, algorithms{a}, seed, objective, ...
                info.isFeasible, details.evaluatorCalls, details.loadCaseSolves);
        end
    end
end

summary = cell2table(records, 'VariableNames', { ...
    'benchmark_id', 'algorithm', 'seed', 'objective_weight', ...
    'penalized_fitness', 'total_violation', 'feasible', ...
    'n_evaluator_calls', 'n_load_case_solves', 'iterations_completed', 'elapsed_s', ...
    'max_stress_ratio', 'max_displacement_ratio', 'n_active'});

outputDir = fullfile(rootDir, 'results', 'poa_ls_equal_fe_pilot');
if ~exist(outputDir, 'dir'), mkdir(outputDir); end
writetable(summary, fullfile(outputDir, 'poa_ls_equal_fe_5seed.csv'));
artifact.summary = summary;
artifact.params = params;
artifact.seeds = seeds;
artifact.problemClasses = problemClasses;
artifact.algorithms = algorithms;
SaveMatV7(fullfile(outputDir, 'poa_ls_equal_fe_5seed.mat'), artifact);

fprintf('\nSaved pilot results to:\n%s\n', outputDir);
