%% Enhanced Pelican Size and Topology Optimization of the 10-Bar Truss
% Reproducible engineering workflow with tabular and graphical reporting.

clear; close all; clc;

rootDir = fileparts(mfilename('fullpath'));
addpath(fullfile(rootDir, 'algorithms'));
addpath(fullfile(rootDir, 'problems'));

outputDir = fullfile(rootDir, 'results', 'pelican_topology');
if ~exist(outputDir, 'dir')
    mkdir(outputDir);
end

rng(2026, 'twister');

fprintf('======================================================\n');
fprintf('Enhanced Pelican Optimization: 10-Bar Plane Truss\n');
fprintf('Simultaneous sizing and topology optimization\n');
fprintf('======================================================\n\n');

problem = TenBarTrussTopology();

params.popSize = 70;
params.maxIter = 500;
params.penaltyCoef = 1e7;
params.levyScale = 0.015;

fprintf('Population       : %d\n', params.popSize);
fprintf('Maximum iterations: %d\n', params.maxIter);
fprintf('Random seed      : 2026\n\n');

tic;
[bestSol, bestFit, convergence, details] = ...
    EnhancedPelicanOptimization(problem, params);
elapsedTime = toc;

[objective, violation, info] = problem.evaluate(bestSol);
statusText = 'INFEASIBLE';
if info.isFeasible
    statusText = 'FEASIBLE';
end

fprintf('\n================ FINAL ENGINEERING RESULTS ================\n');
fprintf('Design status          : %s\n', statusText);
fprintf('Structural stability   : %d\n', info.isStable);
fprintf('Optimized weight       : %.6f lb\n', objective);
fprintf('Penalized fitness      : %.6f\n', bestFit);
fprintf('Total constraint error : %.6e\n', violation);
fprintf('Active bars            : %d / %d\n', info.nActive, problem.nBar);
fprintf('Maximum active stress  : %.4f ksi (limit %.2f ksi)\n', ...
        info.maxStress, problem.sigmaMax);
fprintf('Maximum displacement   : %.4f in  (limit %.2f in)\n', ...
        info.maxDisp, problem.deltaMax);
fprintf('Reciprocal condition   : %.3e\n', info.conditionEstimate);
fprintf('Elapsed time           : %.2f s\n', elapsedTime);
fprintf('===========================================================\n\n');

member = (1:problem.nBar)';
nodeI = info.elements(:, 1);
nodeJ = info.elements(:, 2);
active = logical(info.activeBars(:));
area = info.area(:);
stress = info.stress(:);
stressRatio = info.stressRatio(:);
memberResults = table(member, nodeI, nodeJ, active, area, stress, stressRatio, ...
    'VariableNames', {'Member', 'NodeI', 'NodeJ', 'Active', ...
                      'Area_in2', 'Stress_ksi', 'StressRatio'});

disp(memberResults);
writetable(memberResults, fullfile(outputDir, 'member_results.csv'));

summaryResults = table(objective, bestFit, violation, info.nActive, ...
    info.maxStress, info.maxDisp, info.conditionEstimate, info.isStable, ...
    info.isFeasible, elapsedTime, ...
    'VariableNames', {'Weight_lb', 'PenalizedFitness', 'ConstraintViolation', ...
                      'ActiveBars', 'MaxStress_ksi', 'MaxDisp_in', ...
                      'ReciprocalCondition', 'Stable', 'Feasible', ...
                      'ElapsedTime_s'});
writetable(summaryResults, fullfile(outputDir, 'summary_results.csv'));

fig1 = figure('Color', 'w', 'Name', 'Pelican convergence');
semilogy(convergence, 'LineWidth', 2, 'Color', [0.05 0.35 0.75]);
grid on; box on;
xlabel('Iteration');
ylabel('Best penalized fitness');
title('Enhanced Pelican convergence history');
saveas(fig1, fullfile(outputDir, 'convergence.png'));

fig2 = figure('Color', 'w', 'Name', 'Optimized topology');
hold on; axis equal; grid on; box on;
for i = 1:problem.nBar
    xy = info.nodes(info.elements(i, :), :);
    if info.activeBars(i)
        plot(xy(:, 1), xy(:, 2), '-', 'Color', [0.05 0.35 0.75], ...
             'LineWidth', 1.5 + 4 * info.area(i) / problem.areaUb);
    else
        plot(xy(:, 1), xy(:, 2), '--', 'Color', [0.75 0.75 0.75], ...
             'LineWidth', 0.8);
    end
    text(mean(xy(:, 1)), mean(xy(:, 2)), sprintf('  %d', i), ...
         'FontSize', 9, 'Color', [0.15 0.15 0.15]);
end
plot(info.nodes(:, 1), info.nodes(:, 2), 'ko', ...
     'MarkerFaceColor', 'w', 'MarkerSize', 6);
for i = 1:size(info.nodes, 1)
    text(info.nodes(i, 1), info.nodes(i, 2), sprintf('  N%d', i), ...
         'FontWeight', 'bold');
end
xlabel('x (in)'); ylabel('y (in)');
title(sprintf('Optimized topology: %d active bars, W = %.2f lb', ...
      info.nActive, objective));
saveas(fig2, fullfile(outputDir, 'optimized_topology.png'));

fig3 = figure('Color', 'w', 'Name', 'Member engineering results');
subplot(2, 1, 1);
bar(member, area, 'FaceColor', [0.15 0.55 0.75]);
grid on; box on;
ylabel('Area (in^2)');
title('Optimized cross-sectional areas');

subplot(2, 1, 2);
bar(member, abs(stress), 'FaceColor', [0.85 0.35 0.20]);
hold on;
plot([0.5, problem.nBar + 0.5], ...
     [problem.sigmaMax, problem.sigmaMax], 'k--', 'LineWidth', 1.5);
grid on; box on;
xlabel('Member number');
ylabel('|Stress| (ksi)');
title('Member stresses and allowable limit');
saveas(fig3, fullfile(outputDir, 'member_area_stress.png'));

save(fullfile(outputDir, 'pelican_topology_results.mat'), ...
     'bestSol', 'bestFit', 'objective', 'violation', 'info', ...
     'convergence', 'details', 'memberResults', 'summaryResults', 'params');

fprintf('Results saved in:\n%s\n', outputDir);
