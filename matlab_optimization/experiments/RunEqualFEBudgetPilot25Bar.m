function RunEqualFEBudgetPilot25Bar()
%RunEqualFEBudgetPilot25Bar Five-seed EPOA vs EPOA+DiscreteLS comparison.
% Both variants receive exactly the same number of true structural analyses.

rootDir = fileparts(fileparts(mfilename('fullpath')));
addpath(fullfile(rootDir, 'algorithms'));
addpath(fullfile(rootDir, 'benchmarks'));
addpath(fullfile(rootDir, 'problems'));

outputDir = fullfile(rootDir, 'results', 'equal_fe_25bar');
if ~exist(outputDir, 'dir'), mkdir(outputDir); end

problem = TwentyFiveBarSpaceTruss();
registry = BenchmarkRegistry();
idx = find(strcmp({registry.id}, '25-bar'), 1);
seeds = registry(idx).requiredSeeds;

algNames = {'EPOA-core', 'EPOA+DiscreteLS'};
useLS = [false, true];

paramsBase.popSize = 70;
paramsBase.maxEvaluations = 35070;
paramsBase.penaltyCoef = 1e7;
paramsBase.levyScale = 0.015;
paramsBase.lsPeriod = 5;
paramsBase.lsStep = 1;

rawPath = fullfile(outputDir, 'raw_runs.csv');
fid = fopen(rawPath, 'w');
assert(fid >= 0, 'Could not create raw result CSV.');
fprintf(fid, ['benchmark_id,algorithm,run_id,seed,n_members,n_variables,population,' ...
    'n_evaluations,elapsed_s,objective_weight,penalized_fitness,total_violation,' ...
    'stable,feasible,max_stress_ratio,max_displacement_ratio,best_evaluation,' ...
    'local_search_evaluations,local_search_accepted\n']);

nAlg = numel(algNames);
nSeed = numel(seeds);
weight = nan(nAlg, nSeed);
elapsed = nan(nAlg, nSeed);
feasible = false(nAlg, nSeed);
bestEval = nan(nAlg, nSeed);

for a = 1:nAlg
    for r = 1:nSeed
        params = paramsBase;
        params.useLocalSearch = useLS(a);
        rng(seeds(r), 'twister');

        tic;
        [bestDecision, bestFitness, convergence, details] = ...
            BudgetedEnhancedPelicanOptimization(problem, params);
        elapsed(a, r) = toc;

        info = details.info;
        weight(a, r) = details.objective;
        feasible(a, r) = details.isFeasible;
        bestEval(a, r) = details.bestEvaluation;

        assert(details.evaluationCount == params.maxEvaluations, ...
            'Equal-FE invariant failed.');
        assert(all(bestDecision == round(bestDecision)), ...
            '25-bar decision must remain discrete.');

        fprintf(fid, ['25-bar,%s,%d,%d,25,8,%d,%d,%.9f,%.9f,%.9f,%.12g,' ...
            '%d,%d,%.9f,%.9f,%d,%d,%d\n'], ...
            algNames{a}, r, seeds(r), params.popSize, details.evaluationCount, ...
            elapsed(a, r), details.objective, bestFitness, details.constraintViolation, ...
            info.isStable, info.isFeasible, info.maxStressRatio, ...
            info.maxDisplacementRatio, details.bestEvaluation, ...
            details.localSearchEvaluations, details.localSearchAccepted);

        save(fullfile(outputDir, sprintf('run_%s_seed_%d.mat', ...
            strrep(algNames{a}, '+', '_plus_'), seeds(r))), ...
            'bestDecision', 'bestFitness', 'convergence', 'details', 'params');

        fprintf('%s seed %d: W=%.6f lb, feasible=%d, FE=%d, best@%d\n', ...
            algNames{a}, seeds(r), details.objective, details.isFeasible, ...
            details.evaluationCount, details.bestEvaluation);
    end
end
fclose(fid);

summaryPath = fullfile(outputDir, 'summary.csv');
fid = fopen(summaryPath, 'w');
assert(fid >= 0, 'Could not create summary CSV.');
fprintf(fid, ['algorithm,runs,feasible_runs,feasible_rate,mean_feasible_weight,' ...
    'median_feasible_weight,std_feasible_weight,best_feasible_weight,' ...
    'worst_feasible_weight,mean_elapsed_s,mean_best_evaluation\n']);

for a = 1:nAlg
    wf = weight(a, feasible(a, :));
    if isempty(wf)
        meanW = NaN; medianW = NaN; stdW = NaN; bestW = NaN; worstW = NaN;
    else
        meanW = mean(wf);
        medianW = median(wf);
        if numel(wf) > 1, stdW = std(wf); else, stdW = 0; end
        bestW = min(wf);
        worstW = max(wf);
    end
    fprintf(fid, '%s,%d,%d,%.6f,%.9f,%.9f,%.9f,%.9f,%.9f,%.9f,%.3f\n', ...
        algNames{a}, nSeed, sum(feasible(a, :)), mean(feasible(a, :)), ...
        meanW, medianW, stdW, bestW, worstW, mean(elapsed(a, :)), ...
        mean(bestEval(a, :)));
end
fclose(fid);

fprintf('\nEqual-FE pilot complete. Results: %s\n', outputDir);
end
