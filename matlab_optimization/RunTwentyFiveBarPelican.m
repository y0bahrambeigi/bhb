%% Enhanced Pelican discrete sizing of the 25-bar space truss

clear; clc;
rootDir = fileparts(mfilename('fullpath'));
addpath(fullfile(rootDir, 'algorithms'));
addpath(fullfile(rootDir, 'problems'));

problem = TwentyFiveBarSpaceTruss();
params.popSize = 70;
params.maxIter = 500;
params.penaltyCoef = 1e7;
params.levyScale = 0.015;

rng(2026, 'twister');
tic;
[bestDecision, bestFitness, convergence, details] = ...
    EnhancedPelicanOptimization(problem, params);
elapsedTime = toc;
[weight, violation, info] = problem.evaluate(bestDecision);

fprintf('25-bar discrete grouped sizing\n');
fprintf('Weight: %.6f lb\n', weight);
fprintf('Penalized fitness: %.6f\n', bestFitness);
fprintf('Violation: %.6e\n', violation);
fprintf('Stable: %d | Feasible: %d\n', info.isStable, info.isFeasible);
fprintf('Max stress ratio: %.6f\n', info.maxStressRatio);
fprintf('Max displacement ratio: %.6f\n', info.maxDisplacementRatio);
fprintf('Evaluations: %d | Elapsed: %.3f s\n', details.evaluationCount, elapsedTime);
fprintf('Section indices: '); fprintf('%d ', bestDecision); fprintf('\n');
fprintf('Group areas (in^2): '); fprintf('%.3f ', info.groupAreas); fprintf('\n');

outputDir = fullfile(rootDir, 'results', 'pelican_25bar');
if ~exist(outputDir, 'dir'), mkdir(outputDir); end
save(fullfile(outputDir, 'pelican_25bar_results.mat'), ...
    'bestDecision', 'bestFitness', 'convergence', 'details', 'weight', ...
    'violation', 'info', 'params', 'elapsedTime');

