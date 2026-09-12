%% Example: Using Individual Algorithms
% This script demonstrates how to use individual optimization algorithms
% with custom parameters for steel structure optimization.

clear; close all; clc;

%% Add paths
addpath('algorithms');
addpath('problems');
addpath('utils');

%% Initialize the 10-bar truss problem
fprintf('Initializing 10-bar truss problem...\n\n');
problem = TenBarTruss();

%% Example 1: Run Genetic Algorithm with custom parameters
fprintf('========================================\n');
fprintf('Example 1: Genetic Algorithm\n');
fprintf('========================================\n');

params_ga.popSize = 100;           % Population size
params_ga.maxIter = 1000;          % Maximum iterations
params_ga.crossoverRate = 0.8;     % Crossover probability
params_ga.mutationRate = 0.1;      % Mutation probability
params_ga.tournamentSize = 3;      % Tournament selection size
params_ga.eliteCount = 2;          % Number of elite solutions
params_ga.penaltyCoef = 1e6;       % Penalty coefficient for constraints

[bestSol_ga, bestFit_ga, conv_ga] = GeneticAlgorithm(problem, params_ga);

fprintf('\nGA Results:\n');
fprintf('  Best Weight: %.4f lb\n', bestFit_ga);
fprintf('  Final Iteration: %d\n\n', length(conv_ga));

%% Example 2: Run PSO with custom parameters
fprintf('========================================\n');
fprintf('Example 2: Particle Swarm Optimization\n');
fprintf('========================================\n');

params_pso.popSize = 80;           % Swarm size
params_pso.maxIter = 800;          % Maximum iterations
params_pso.w = 0.729;              % Inertia weight
params_pso.c1 = 1.49445;           % Cognitive parameter
params_pso.c2 = 1.49445;           % Social parameter
params_pso.penaltyCoef = 1e6;      % Penalty coefficient

[bestSol_pso, bestFit_pso, conv_pso] = ParticleSwarmOptimization(problem, params_pso);

fprintf('\nPSO Results:\n');
fprintf('  Best Weight: %.4f lb\n', bestFit_pso);
fprintf('  Final Iteration: %d\n\n', length(conv_pso));

%% Example 3: Run Differential Evolution
fprintf('========================================\n');
fprintf('Example 3: Differential Evolution\n');
fprintf('========================================\n');

params_de.popSize = 50;
params_de.maxIter = 500;
params_de.F = 0.5;                 % Scaling factor
params_de.CR = 0.9;                % Crossover rate
params_de.penaltyCoef = 1e6;

[bestSol_de, bestFit_de, conv_de] = DifferentialEvolution(problem, params_de);

fprintf('\nDE Results:\n');
fprintf('  Best Weight: %.4f lb\n', bestFit_de);
fprintf('  Final Iteration: %d\n\n', length(conv_de));

%% Example 4: Compare the three algorithms
fprintf('========================================\n');
fprintf('Comparison of Three Algorithms\n');
fprintf('========================================\n');

results = cell(3, 1);
algorithmNames = {'GA', 'PSO', 'DE'};

results{1}.bestSol = bestSol_ga;
results{1}.bestFit = bestFit_ga;
results{1}.convergence = conv_ga;
results{1}.time = 0;  % Not measured in this example

results{2}.bestSol = bestSol_pso;
results{2}.bestFit = bestFit_pso;
results{2}.convergence = conv_pso;
results{2}.time = 0;

results{3}.bestSol = bestSol_de;
results{3}.bestFit = bestFit_de;
results{3}.convergence = conv_de;
results{3}.time = 0;

% Plot convergence comparison
figure('Position', [100, 100, 800, 600]);
hold on;
plot(conv_ga, 'r-', 'LineWidth', 2);
plot(conv_pso, 'b-', 'LineWidth', 2);
plot(conv_de, 'g-', 'LineWidth', 2);
xlabel('Iteration', 'FontSize', 12);
ylabel('Best Fitness (Weight in lb)', 'FontSize', 12);
title('Convergence Comparison', 'FontSize', 14, 'FontWeight', 'bold');
legend('GA', 'PSO', 'DE', 'Location', 'best');
grid on;
hold off;

fprintf('\n%-10s %15s\n', 'Algorithm', 'Best Weight');
fprintf('--------------------------------\n');
fprintf('%-10s %15.4f\n', 'GA', bestFit_ga);
fprintf('%-10s %15.4f\n', 'PSO', bestFit_pso);
fprintf('%-10s %15.4f\n', 'DE', bestFit_de);
fprintf('\n');

%% Example 5: Verify the best solution constraints
fprintf('========================================\n');
fprintf('Constraint Verification\n');
fprintf('========================================\n');

% Choose the best solution
[minFit, bestIdx] = min([bestFit_ga, bestFit_pso, bestFit_de]);
bestSolutions = {bestSol_ga, bestSol_pso, bestSol_de};
bestSol = bestSolutions{bestIdx};

fprintf('Best algorithm: %s\n', algorithmNames{bestIdx});
fprintf('Best weight: %.4f lb\n\n', minFit);

% Evaluate the solution
[weight, constraint_violation] = problem.evaluate(bestSol);

fprintf('Objective (Weight): %.4f lb\n', weight);
fprintf('Constraint Violation: %.6f\n', constraint_violation);

if constraint_violation <= 1e-6
    fprintf('Status: FEASIBLE - All constraints satisfied!\n');
else
    fprintf('Status: INFEASIBLE - Some constraints are violated.\n');
end

fprintf('\nOptimal cross-sectional areas:\n');
for i = 1:10
    fprintf('  Bar %2d: %8.4f in^2\n', i, bestSol(i));
end

%% Example 6: Run a single algorithm with default parameters
fprintf('\n========================================\n');
fprintf('Example 6: Quick Run with Defaults\n');
fprintf('========================================\n');

% Simply call the algorithm without parameters
[bestSol_quick, bestFit_quick, conv_quick] = TLBO(problem);

fprintf('\nTLBO Results (default parameters):\n');
fprintf('  Best Weight: %.4f lb\n', bestFit_quick);

fprintf('\n========================================\n');
fprintf('Examples completed!\n');
fprintf('========================================\n');
