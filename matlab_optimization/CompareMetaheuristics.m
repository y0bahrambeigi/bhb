%% Metaheuristic Algorithms Comparison for Steel Structure Optimization
% This script compares various metaheuristic optimization algorithms
% on the classic 10-bar truss problem from structural engineering.
%
% Algorithms compared:
%   1. Genetic Algorithm (GA)
%   2. Particle Swarm Optimization (PSO)
%   3. Differential Evolution (DE)
%   4. Simulated Annealing (SA)
%   5. Harmony Search (HS)
%   6. Teaching-Learning-Based Optimization (TLBO)
%
% Author: Claude AI
% Date: 2025

clear; close all; clc;

%% Add paths
addpath('algorithms');
addpath('problems');
addpath('utils');

%% Initialize problem
fprintf('========================================\n');
fprintf('Steel Structure Optimization Comparison\n');
fprintf('Problem: 10-Bar Truss\n');
fprintf('========================================\n\n');

problem = TenBarTruss();

fprintf('Problem Details:\n');
fprintf('  Number of variables: %d\n', problem.nVar);
fprintf('  Lower bound: %.2f in^2\n', problem.lb);
fprintf('  Upper bound: %.2f in^2\n', problem.ub);
fprintf('  Max stress: %.2f ksi\n', problem.sigmaMax);
fprintf('  Max displacement: %.2f in\n\n', problem.deltaMax);

%% Set common parameters
commonParams.maxIter = 500;
commonParams.popSize = 50;
commonParams.penaltyCoef = 1e6;

%% Run algorithms
algorithms = {
    'Genetic Algorithm (GA)', @GeneticAlgorithm;
    'Particle Swarm Optimization (PSO)', @ParticleSwarmOptimization;
    'Differential Evolution (DE)', @DifferentialEvolution;
    'Simulated Annealing (SA)', @SimulatedAnnealing;
    'Harmony Search (HS)', @HarmonySearch;
    'Teaching-Learning-Based Optimization (TLBO)', @TLBO;
};

nAlgorithms = size(algorithms, 1);
results = cell(nAlgorithms, 1);
algorithmNames = cell(nAlgorithms, 1);

fprintf('Starting optimization runs...\n');
fprintf('========================================\n\n');

for i = 1:nAlgorithms
    algorithmName = algorithms{i, 1};
    algorithmFunc = algorithms{i, 2};
    algorithmNames{i} = algorithmName;

    fprintf('Running %s...\n', algorithmName);
    fprintf('----------------------------------------\n');

    % Run algorithm
    tic;
    [bestSol, bestFit, convergence] = algorithmFunc(problem, commonParams);
    elapsedTime = toc;

    % Store results
    results{i}.bestSol = bestSol;
    results{i}.bestFit = bestFit;
    results{i}.convergence = convergence;
    results{i}.time = elapsedTime;

    fprintf('\n');
    fprintf('Results for %s:\n', algorithmName);
    fprintf('  Best Fitness: %.6f lb\n', bestFit);
    fprintf('  Computation Time: %.2f seconds\n', elapsedTime);
    fprintf('  Best Solution (cross-sectional areas in in^2):\n');
    fprintf('    [');
    fprintf('%.4f ', bestSol);
    fprintf(']\n\n');
end

%% Display summary
fprintf('========================================\n');
fprintf('SUMMARY\n');
fprintf('========================================\n\n');

% Sort by fitness
fitnesses = zeros(nAlgorithms, 1);
for i = 1:nAlgorithms
    fitnesses(i) = results{i}.bestFit;
end
[sortedFit, sortIdx] = sort(fitnesses);

fprintf('Ranking (by best fitness):\n');
fprintf('%-40s %15s %15s\n', 'Algorithm', 'Best Fitness', 'Time (s)');
fprintf('------------------------------------------------------------------------\n');
for i = 1:nAlgorithms
    idx = sortIdx(i);
    fprintf('%-40s %15.6f %15.2f\n', ...
            algorithmNames{idx}, results{idx}.bestFit, results{idx}.time);
end
fprintf('\n');

% Find best algorithm
bestAlgIdx = sortIdx(1);
fprintf('========================================\n');
fprintf('BEST ALGORITHM: %s\n', algorithmNames{bestAlgIdx});
fprintf('========================================\n');
fprintf('Best Fitness: %.6f lb\n', results{bestAlgIdx}.bestFit);
fprintf('Computation Time: %.2f seconds\n', results{bestAlgIdx}.time);
fprintf('Optimal Design (cross-sectional areas):\n');
fprintf('  Bar  1: %.4f in^2\n', results{bestAlgIdx}.bestSol(1));
fprintf('  Bar  2: %.4f in^2\n', results{bestAlgIdx}.bestSol(2));
fprintf('  Bar  3: %.4f in^2\n', results{bestAlgIdx}.bestSol(3));
fprintf('  Bar  4: %.4f in^2\n', results{bestAlgIdx}.bestSol(4));
fprintf('  Bar  5: %.4f in^2\n', results{bestAlgIdx}.bestSol(5));
fprintf('  Bar  6: %.4f in^2\n', results{bestAlgIdx}.bestSol(6));
fprintf('  Bar  7: %.4f in^2\n', results{bestAlgIdx}.bestSol(7));
fprintf('  Bar  8: %.4f in^2\n', results{bestAlgIdx}.bestSol(8));
fprintf('  Bar  9: %.4f in^2\n', results{bestAlgIdx}.bestSol(9));
fprintf('  Bar 10: %.4f in^2\n', results{bestAlgIdx}.bestSol(10));
fprintf('\n');

%% Verify constraints
fprintf('========================================\n');
fprintf('CONSTRAINT VERIFICATION (Best Solution)\n');
fprintf('========================================\n');
[f, g] = problem.evaluate(results{bestAlgIdx}.bestSol);
fprintf('Objective (Weight): %.6f lb\n', f);
fprintf('Constraint Violation: %.6f\n', g);
if g <= 1e-6
    fprintf('Status: FEASIBLE (All constraints satisfied)\n');
else
    fprintf('Status: INFEASIBLE (Constraints violated)\n');
end
fprintf('\n');

%% Plot comparison
fprintf('Generating comparison plots...\n');
plotComparison(results, algorithmNames);

fprintf('========================================\n');
fprintf('Analysis Complete!\n');
fprintf('========================================\n');

%% Save results to file
save('optimization_results.mat', 'results', 'algorithmNames', 'problem');
fprintf('Results saved to: optimization_results.mat\n');
