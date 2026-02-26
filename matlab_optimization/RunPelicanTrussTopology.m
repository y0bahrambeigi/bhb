%% Revolutionary Truss Topology Optimization using Enhanced Pelican Algorithm
% This script demonstrates an advanced Pelican metaheuristic variant for
% simultaneous size + topology optimization of the classical 10-bar truss.

clear; close all; clc;

addpath('algorithms');
addpath('problems');

fprintf('==============================================\n');
fprintf('Enhanced Pelican Topology Optimization (10-Bar)\n');
fprintf('==============================================\n\n');

problem = TenBarTrussTopology();

params.popSize = 70;
params.maxIter = 500;
params.penaltyCoef = 1e7;
params.levyScale = 0.015;

fprintf('Running EPOA with %d pelicans for %d iterations...\n\n', ...
        params.popSize, params.maxIter);

tic;
[bestSol, bestFit, convergence, details] = EnhancedPelicanOptimization(problem, params);
elapsedTime = toc;

[objective, violation, info] = problem.evaluate(bestSol);

fprintf('Optimization complete!\n');
fprintf('----------------------------------------------\n');
fprintf('Penalized Best Fitness : %.6f\n', bestFit);
fprintf('True Objective (Weight): %.6f lb\n', objective);
fprintf('Constraint Violation   : %.6f\n', violation);
fprintf('Active Bars            : %d / %d\n', info.nActive, problem.nBar);
fprintf('Max Stress             : %.4f ksi\n', info.maxStress);
fprintf('Max Displacement       : %.4f in\n', info.maxDisp);
fprintf('Elapsed Time           : %.2f sec\n\n', elapsedTime);

fprintf('Topology (1=active, 0=removed):\n');
disp(info.activeBars);

fprintf('Areas (in^2):\n');
disp(info.area);

figure('Color', 'w');
semilogy(convergence, 'LineWidth', 2, 'Color', [0.1 0.35 0.8]);
grid on;
xlabel('Iteration');
ylabel('Best Penalized Fitness (log scale)');
title('Enhanced Pelican Convergence for Truss Topology Optimization');

save('pelican_topology_results.mat', 'bestSol', 'bestFit', 'objective', 'violation', 'info', 'convergence');
fprintf('Saved output to pelican_topology_results.mat\n');
